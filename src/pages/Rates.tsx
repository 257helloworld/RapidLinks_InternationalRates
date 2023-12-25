import "./Settings.css";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonMenu,
  IonPage,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import RatesCard from "../components/RatesCard";
import { useState } from "react";

const Rates: React.FC = () => {
  const [gst, setGst] = useState<boolean>(true);
  const handleGstToggle = (e: any) => {
    setGst(e.detail.checked);
  };
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
                <IonToggle checked={gst} onIonChange={handleGstToggle}>
                  Include GST
                </IonToggle>
              </IonItem>
            </IonList>
          </div>
          <RatesCard showGst={gst} />
        </IonContent>
      </IonPage>
    </>
  );
};
export default Rates;
