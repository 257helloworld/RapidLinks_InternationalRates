import {
  IonAlert,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonNote,
  IonRow,
  IonSkeletonText,
  IonText,
  IonToggle,
  useIonToast,
} from "@ionic/react";
import { createOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import getRates from "../functions/getRates";
import getFuel from "../functions/getFuel";
import setFuel from "../functions/setFuel";

interface RatesCardProps {
  showGst: boolean;
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

  let oneLakh = 100000;

  let loop = [1, 2, 3, 4];

  const fetchRates = async (n: any, w: any, z: any, per: any) => {
    try {
      let record = await getRates(n, w, z);
      if (record) {
        let baseRate: any = record.fields[z];
        const chargeableWeight = record.fields.Weight;
        const fuelCharge = (per * baseRate) / 100;
        const rate = fuelCharge + baseRate;
        const gstRate = rate + (rate * 18) / 100;
        return {
          BaseRate: baseRate,
          ChargeableWeight: chargeableWeight,
          Rate: parseFloat(rate.toFixed(2)),
          GstRate: parseFloat(gstRate.toFixed(2)),
        };
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
            localStorage.getItem("weight"),
            localStorage.getItem("selectedCountryZone"),
            item.fields.Percentage
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
      data.sort(
        (a: any, b: any) => a.fields.details.Rate - b.fields.details.Rate
      );
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
  };

  useEffect(() => {
    setZone(localStorage.getItem("selectedCountryZone"));
    setSelectedCountry(localStorage.getItem("selectedCountry"));
    setWeight(localStorage.getItem("weight"));
    handleLoad();
  }, []);

  const handleFuelEdit = (e: any) => {
    setEditingNetwork(e.Network);
    setOldFuel(e.Percentage);
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

  return (
    <>
      <IonCard className="cards" id="ratesCard">
        {/* Card Header */}
        <IonCardHeader
          id="ratesCardHeader"
          color={"primary"}
          className="cardHeader"
        >
          {props.showGst ? (
            <IonText>Base Rates + Fuel + GST</IonText>
          ) : (
            <IonText>Base Rates + Fuel</IonText>
          )}
          <IonCardTitle style={{}}>
            {selectedCountry || "Not Selected"} ({weight} Kgs)
          </IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          <IonGrid style={{ textAlign: "center" }}>
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
              </IonItem>

              {/* Skeleton View */}
              {!loaded ? (
                <>
                  {loop.map((item) => (
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
                          style={{
                            margin: "9px 0 6px 0",
                            padding: "5px 10px",
                          }}
                        >
                          {rate.fields.details.ChargeableWeight} Kgs
                        </IonBadge>
                      </IonCol>

                      <IonCol>
                        {rate.fields.Percentage}%<br />
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
                        <IonCol style={{}}>
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
                            GST Exclusive
                          </IonBadge>
                        </IonCol>
                      )}
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
    </>
  );
};

export default RatesCard;
