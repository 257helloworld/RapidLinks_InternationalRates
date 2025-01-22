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
import {
  createOutline,
  informationCircle,
  informationCircleOutline,
} from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import getRates from "../functions/getRates";
import getFuel from "../functions/getFuel";
import setFuel from "../functions/setFuel";
import "./RatesCard.css";
import setFetchLog from "../functions/setFetchLog";
import setCommission from "../functions/setCommission";

interface RatesCardProps {
  // showGst: boolean;
  parcelType: string;
  scroll: () => void;
}

const RatesCard: React.FC<RatesCardProps> = (props) => {
  const [fuelUpdateErrorToast] = useIonToast();

  const [weight, setWeight] = useState<any>(0);
  const [selectedCountry, setSelectedCountry] = useState<any>("");
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [rates, setRates] = useState<any>([]);
  const [zone, setZone] = useState<any>();
  const [errorMessage, setErrorMessage] = useState<any>();
  const [errorHeader, setErrorHeader] = useState<any>();
  const [isFuelChangeOpen, setIsFuelChangeOpen] = useState<any>(false);
  const [editingNetwork, setEditingNetwork] = useState<any>(true);
  const [oldFuel, setOldFuel] = useState<any>(0);
  const [oldCommission, setOldCommission] = useState<number>(0);
  const [fuelUpdateLoading, setFuelUpdateLoading] = useState<any>(false);
  const [fuelUpdateMessage, setFuelUpdateMessage] = useState<any>("");
  const [details, setDetails] = useState<any>();
  const [showGst, setShowGst] = useState(false);
  const [isCommissionOpen, setIsCommissionOpen] = useState<boolean>(false);

  const calculationDetails: any = {
    DHL: [
      { value: "BaseRate", name: "Base Freight" },
      // { value: "DemandSurcharge", name: "Demand Surcharge" },
      { value: "FuelCharge", name: `Fuel Charge` },
      { value: "GreenTax", name: "Green Tax" },
      { value: "Commission", name: "*Other Charges" },
      {
        value: showGst ? "GstRate" : "Rate",
        name: showGst ? "Total (with GST)" : "Total (without GST)",
      },
    ],
  };

  const fetchRates = async (
    network: string,
    weight: number,
    zone: string,
    fuelPercentage: number,
    commissionPercentage: number,
    highestWeight: number,
    parcelType: string
  ) => {
    try {
      let record = await getRates(
        network,
        weight,
        zone,
        fuelPercentage,
        commissionPercentage,
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
            item.fields.CommissionPercentage,
            item.fields.HighestWeight,
            props.parcelType
          );
          data.push({
            ...item,
            fields: {
              ...item.fields,
              details,
            },
          });
        })
      );
      setFetchLog(
        `${localStorage.getItem("selectedCountry")} - ${localStorage.getItem(
          "weight"
        )} Kg - ${props.parcelType}`,
        JSON.stringify(data)
      );
      // data.sort(
      //   (a: any, b: any) => a.fields.details.Rate - b.fields.details.Rate
      // );
      setRates(data);
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
    props.scroll();
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
  };

  const handleCommissionEdit = (e: any) => {
    setEditingNetwork(e.Network);
    setOldCommission(e.CommissionPercentage);
    setIsCommissionOpen(true);
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

  const commissionUpdateHandler = async (data: any) => {
    try {
      if (oldCommission === data.newCommission) {
        return;
      }
      if (data.newCommission >= 0 && data.newCommission <= 100) {
        setFuelUpdateLoading(true);
        setFuelUpdateMessage(
          "Updating * of " +
            editingNetwork +
            " from " +
            oldCommission +
            "% to " +
            data.newCommission +
            "%"
        );
        await setCommission(editingNetwork, data.newCommission);
        setFuelUpdateLoading(false);
        handleLoad();
      } else {
        throw new Error("Ivalid value for *.");
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
          <IonItem>
            <IonToggle
              onIonChange={(e) => setShowGst(e?.detail?.checked)}
              checked={showGst}
              color={"tertiary"}
            >
              Include GST
            </IonToggle>
          </IonItem>
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
                <IonCol>*</IonCol>
                <IonCol>Rate</IonCol>
                <IonCol></IonCol>
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

                      <IonCol>
                        {rate.fields.CommissionPercentage}%<br />
                        <IonButton
                          fill={"clear"}
                          onClick={() => handleCommissionEdit(rate.fields)}
                        >
                          <IonIcon
                            color={"medium"}
                            icon={createOutline}
                          ></IonIcon>
                        </IonButton>
                      </IonCol>

                      <IonCol>
                        ₹{" "}
                        {showGst
                          ? rate.fields.details.GstRate.toLocaleString("en-IN")
                          : rate.fields.details.Rate.toLocaleString("en-IN")}
                        <br />
                        <IonBadge
                          color={showGst ? "tertiary" : "warning"}
                          style={{
                            margin: "9px 0 6px 0",
                            padding: "5px 10px",
                          }}
                        >
                          {showGst ? "GST Inclusive" : "Without GST"}
                        </IonBadge>
                      </IonCol>
                      <IonCol>
                        <IonButton
                          fill={"clear"}
                          onClick={() => handleDetails(rate.fields)}
                        >
                          <IonIcon
                            color="medium"
                            icon={informationCircle}
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

      <IonAlert
        isOpen={isCommissionOpen}
        header={`* for ${editingNetwork}`}
        animated={true}
        backdropDismiss={false}
        message={"Current *: " + oldCommission + "%"}
        inputs={[
          {
            name: "newCommission",
            type: "number",
            placeholder: "New Percentage",
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
              commissionUpdateHandler(data);
            },
          },
        ]}
        onDidDismiss={() => setIsCommissionOpen(false)}
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

              {calculationDetails[details.Network].map(
                (field: any) =>
                  (showGst || field.name !== "GST") && (
                    <IonRow key={field.name}>
                      <IonCol className="nameCol">{field.name}</IonCol>
                      <IonCol className="valueCol">
                        ₹{" "}
                        {details.details[field.value]
                          .toFixed(2)
                          .toLocaleString("en-IN")}
                      </IonCol>
                    </IonRow>
                  )
              )}
            </IonGrid>
          )}
        </IonContent>
      </IonModal>
    </>
  );
};

export default RatesCard;
