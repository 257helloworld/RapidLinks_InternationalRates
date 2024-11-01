import "./Settings.css";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import RatesCard from "../components/RatesCard";
import { useState } from "react";
import { Redirect, useParams } from "react-router-dom";

const Rates: React.FC = () => {
  const [gst, setGst] = useState<boolean>(true);
  const handleGstToggle = (e: any) => {
    setGst(e.detail.checked);
  };

  if (!localStorage.getItem("selectedCountry")) {
    return <Redirect to="/" />;
  }

  const { parcelType } = useParams<{ parcelType: any }>();
  console.log("Parcel TYpe", parcelType);

  return (
    <>
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton></IonBackButton>
            </IonButtons>
            <IonTitle>Rates</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent color="light">
          <div style={{ marginTop: "15px" }}>
            <IonList inset={true}>
              <IonItem>
                <IonToggle
                  checked={gst}
                  onIonChange={handleGstToggle}
                  color={"tertiary"}
                >
                  Include GST
                </IonToggle>
              </IonItem>
            </IonList>
          </div>

          {/* Rates Card */}
          <RatesCard showGst={gst} parcelType={parcelType} />
        </IonContent>
      </IonPage>
    </>
  );
};
export default Rates;
