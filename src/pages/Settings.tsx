import React, { useEffect, useRef, useState } from "react";
import { TextField, Typography, Autocomplete } from "@mui/material";

import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonModal,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import { useStorage, userPercentage } from "../../hooks/useStorage";

import "./Settings.css";
import {
  arrowBackCircleOutline,
  arrowBackOutline,
  createOutline,
  pencilOutline,
} from "ionicons/icons";
import { collection, onSnapshot } from "firebase/firestore";
import db from "../services/firebase";

const Settings: React.FC = () => {
  const collectionRef = collection(db, "fuel");
  const [percentage, setPercentage] = useState<any>([]);
  useEffect(() => {}, []);
  return (
    <>
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              {/* <IonButton routerLink="/">
                <IonIcon slot="icon-only" icon={arrowBackOutline}></IonIcon>
              </IonButton>
               */}
              <IonBackButton></IonBackButton>
            </IonButtons>
            <IonTitle>Settings</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent color="light">
          <IonCard className="cards">
            <IonCardHeader className="cardHeader">
              <IonCardTitle>Fuel %</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList inset={false}></IonList>

              <IonButton
                shape="round"
                id="resetButton"
                expand="block"
                color={"success"}
              >
                Save
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    </>
  );
};
export default Settings;
