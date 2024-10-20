import {
  IonAlert,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonModal,
  IonNote,
  IonRow,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { createOutline, informationCircleOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import getRates from "../functions/getRates";
import getFuel from "../functions/getFuel";
import setFuel from "../functions/setFuel";
import "./RatesCard.css";

interface RatesCardProps {
  showGst: boolean;
  parcelType: string;
}

const RatesCard: React.FC<RatesCardProps> = (props) => {
  const [fuelUpdateErrorToast] = useIonToast();

  const [weight, setWeight] = useState<any>(0);
  const [selectedCountry, setSelectedCountry] = useState<any>("");
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [networks, setNetworks] = useState<any>([]);
  const [rates, setRates] = useState<any>([]);
  const [zone, setZone] = useState<any>();
  const [errorMessage, setErrorMessage] = useState<any>();
  const [errorHeader, setErrorHeader] = useState<any>();
  const [isFuelChangeOpen, setIsFuelChangeOpen] = useState<any>(false);
  const [editingNetwork, setEditingNetwork] = useState<any>(true);
  const [oldFuel, setOldFuel] = useState<any>(0);
  const [fuelUpdateLoading, setFuelUpdateLoading] = useState<any>(false);
  const [fuelUpdateMessage, setFuelUpdateMessage] = useState<any>("");
  const [details, setDetails] = useState<any>();

  const calculationDetails: any = {
    DHL: [
      { value: "BaseRate", name: "Base Rate" },
      { value: "FuelCharge", name: `Fuel Charge` },
      { value: "DemandSurcharge", name: "Demand Surcharge" },
      { value: "GreenTax", name: "Green Tax" },
      { value: "Commission", name: "Commission" },
      {
        value: props.showGst ? "GstRate" : "Rate",
        name: props.showGst ? "Total (with GST)" : "Total (without GST)",
      },
    ],
  };

  const fetchRates = async (
    network: string,
    weight: number,
    zone: string,
    fuelPercentage: number,
    highestWeight: number,
    parcelType: string
  ) => {
    try {
      let record = await getRates(
        network,
        weight,
        zone,
        fuelPercentage,
        highestWeight,
        parcelType
      );
      weight = Math.ceil(weight);
      if (record) {
        return record;
      }
      return null;
    } catch (error) {
      throw error;
    }
  };

  const mergeRates = async () => {
    try {
      let fuel = await getFuel();
      if (fuel === undefined) {
        return;
      }
      const data: any = [];
      await Promise.all(
        fuel.map(async (item: any) => {
          const details = await fetchRates(
            item.fields.Network,
            Number(localStorage.getItem("weight") || "0"),
            localStorage.getItem("selectedCountryZone") || "",
            item.fields.FuelPercentage,
            item.fields.HighestWeight,
            props.parcelType
          );
          console.log("fetched results", details);
          data.push({
            ...item,
            fields: {
              ...item.fields,
              details,
            },
          });
        })
      );
      // data.sort(
      //   (a: any, b: any) => a.fields.details.Rate - b.fields.details.Rate
      // );
      setRates(data);
      console.log("merged rates", data);
      setIsOpen(false);
      setLoaded(true);
    } catch (error: any) {
      setErrorHeader("Error");
      console.log(error);
      setErrorMessage(
        "Failed to fetch rates. Please check internet connection & try again."
      );
      setIsOpen(true);
    }
  };

  const handleLoad = async () => {
    setLoaded(false);
    await mergeRates();
  };

  useEffect(() => {
    setZone(localStorage.getItem("selectedCountryZone"));
    setSelectedCountry(localStorage.getItem("selectedCountry"));
    setWeight(localStorage.getItem("weight"));
    handleLoad();
  }, []);

  const handleFuelEdit = (e: any) => {
    setEditingNetwork(e.Network);
    setOldFuel(e.FuelPercentage);
    setIsFuelChangeOpen(true);
    console.log(e);
  };

  const fuelUpdateHandler = async (data: any) => {
    try {
      if (oldFuel === data.newFuel) {
        return;
      }
      if (data.newFuel >= 0 && data.newFuel <= 100) {
        setFuelUpdateLoading(true);
        setFuelUpdateMessage(
          "Updating fuel of " +
            editingNetwork +
            " from " +
            oldFuel +
            "% to " +
            data.newFuel +
            "%"
        );
        await setFuel(editingNetwork, data.newFuel);
        setFuelUpdateLoading(false);
        handleLoad();
      } else {
        throw new Error("Ivalid value for fuel.");
      }
    } catch (exception: any) {
      setFuelUpdateLoading(false);
      console.log(exception.message);
      fuelUpdateErrorToast({
        message: exception.message,
        duration: 3000,
        position: "bottom",
        color: "danger",
      });
    }
  };

  const handleDetails = (data: any) => {
    setDetails(data);
  };

  return (
    <>
      <IonCard className="cards" id="ratesCard">
        {/* Card Header */}
        <IonCardHeader
          id="ratesCardHeader"
          color={"tertiary"}
          className="cardHeader"
        >
          <IonCardTitle style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            {selectedCountry || "Not Selected"} ({weight} Kgs)
          </IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          <IonBadge color={"dark"} className="parcelTypeBadge">
            {props.parcelType === "NDox" ? "Non-Dox" : "Dox"}
          </IonBadge>
          <IonGrid style={{ textAlign: "center" }} className="ratesGrid">
            {/* <IonButton onClick={handleLoad}>Load</IonButton> */}
            <IonList>
              {/* HeaderRow */}
              <IonItem
                color={"light"}
                style={{
                  fontSize: "1rem",
                  color: "#3880ff",
                  textAlign: "center",
                  margin: "10px 0 10px 0",
                }}
              >
                <IonCol>Network</IonCol>
                <IonCol>Fuel</IonCol>
                <IonCol>Rates</IonCol>
                <IonCol>Details</IonCol>
              </IonItem>

              {/* Skeleton View */}
              {!loaded ? (
                <>
                  {[1, 2, 3, 4].map((item) => (
                    <IonItem key={item}>
                      <IonSkeletonText
                        animated={true}
                        style={{ height: "25px" }}
                      ></IonSkeletonText>
                    </IonItem>
                  ))}
                </>
              ) : (
                <>
                  {/* Rates Rows */}
                  {rates.map((rate: any) => (
                    <IonItem
                      style={{
                        textAlign: "center",
                        paddingTop: "7px",
                      }}
                      key={rate.fields.Network}
                    >
                      <IonCol>
                        {rate.fields.Network}
                        <br />
                        <IonBadge
                          color={"tertiary"}
                          style={{
                            margin: "9px 0 6px 0",
                            padding: "5px 10px",
                          }}
                        >
                          {rate.fields.details.ChargeableWeight} Kgs
                        </IonBadge>
                      </IonCol>

                      <IonCol>
                        {rate.fields.FuelPercentage}%<br />
                        <IonButton
                          fill={"clear"}
                          onClick={() => handleFuelEdit(rate.fields)}
                        >
                          <IonIcon
                            color={"medium"}
                            icon={createOutline}
                          ></IonIcon>
                        </IonButton>
                      </IonCol>

                      {props.showGst ? (
                        <IonCol>
                          ₹{" "}
                          {rate.fields.details.GstRate.toLocaleString("en-IN")}
                          <br />
                          <IonBadge
                            color={"success"}
                            style={{
                              margin: "9px 0 6px 0",
                              padding: "5px 10px",
                            }}
                          >
                            GST Inclusive
                          </IonBadge>
                        </IonCol>
                      ) : (
                        <IonCol>
                          ₹ {rate.fields.details.Rate.toLocaleString("en-IN")}
                          <br />
                          <IonBadge
                            color={"warning"}
                            style={{
                              margin: "9px 0 6px 0",
                              padding: "5px 10px",
                            }}
                          >
                            Without GST
                          </IonBadge>
                        </IonCol>
                      )}

                      <IonCol>
                        <IonButton
                          fill={"clear"}
                          onClick={() => handleDetails(rate.fields)}
                        >
                          <IonIcon
                            color="success"
                            icon={informationCircleOutline}
                          ></IonIcon>
                        </IonButton>
                      </IonCol>
                    </IonItem>
                  ))}
                </>
              )}
            </IonList>
          </IonGrid>
        </IonCardContent>
      </IonCard>
      <IonAlert
        isOpen={isOpen}
        header={errorHeader}
        message={errorMessage}
        buttons={[
          {
            text: "Retry",
            handler: () => {
              handleLoad();
              setIsOpen(false);
            },
          },
        ]}
        onDidDismiss={() => setIsOpen(false)}
      ></IonAlert>

      <IonAlert
        isOpen={isFuelChangeOpen}
        header={editingNetwork}
        animated={true}
        backdropDismiss={false}
        message={"Current Fuel: " + oldFuel + "%"}
        inputs={[
          {
            name: "newFuel",
            type: "number",
            placeholder: "New Fuel",
            min: 0,
            max: 100,
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            handler: () => {
              // handleLoad();
              setIsOpen(false);
            },
          },
          {
            text: "Update",
            handler: (data) => {
              fuelUpdateHandler(data);
            },
          },
        ]}
        onDidDismiss={() => setIsFuelChangeOpen(false)}
      ></IonAlert>

      <IonLoading
        isOpen={fuelUpdateLoading}
        message={fuelUpdateMessage}
      ></IonLoading>

      <IonModal
        isOpen={!!details}
        onDidDismiss={() => setDetails(undefined)}
        breakpoints={[0, 0.5, 0.75, 1.0]}
        initialBreakpoint={0.75}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Rate Details</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setDetails(undefined)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modalContent">
          {details && (
            <IonGrid className="detailsGrid">
              <IonRow>
                <IonCol>
                  {props.parcelType == "NDox" ? "Non-Dox" : "Dox"} <br />
                  {details.Network} - {selectedCountry} -{" "}
                  {details.details.ChargeableWeight} Kgs
                </IonCol>
                <IonCol className="valueCol">Value</IonCol>
              </IonRow>

              {calculationDetails[details.Network].map((field: any) => (
                <IonRow>
                  <IonCol className="nameCol">{field.name}</IonCol>
                  <IonCol className="valueCol">
                    ₹{" "}
                    {details.details[field.value]
                      .toFixed(2)
                      .toLocaleString("en-IN")}
                  </IonCol>
                </IonRow>
              ))}
            </IonGrid>
          )}
        </IonContent>
      </IonModal>
    </>
  );
};

export default RatesCard;
