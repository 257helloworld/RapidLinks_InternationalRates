import {
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
import React, { useEffect, useRef, useState } from "react";
import { doc, getDocs, collection, onSnapshot } from "firebase/firestore";
import { Storage } from "@ionic/storage";
import db from "./firebase";
import getCountries from "../functions/getCountries";

import "./Home.css";

import { checkmarkCircle, settingsOutline } from "ionicons/icons";
// import { useStorage } from "../../hooks/useStorage";
import AppTypeahead from "../components/AppTypeAhead";

const Home: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [weight, setWeight] = useState(0);
  const [ceilWeight, setCeilWeight] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string>();
  const [countries, setCountries] = useState<any>();

  const collectionRef = collection(db, "fuel");

  const modal = useRef<HTMLIonModalElement>(null);
  const weightInput = useRef<HTMLIonInputElement>(null);
  // const ratesCard = useRef<typeof IonCard>(null);

  const countrySelectionChanged = (country: string) => {
    setSelectedCountry(country);
    modal.current?.dismiss();
  };

  useEffect(() => {
    if (selectedCountry) {
      localStorage.setItem("selectedCountry", selectedCountry);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedValue) {
      let zone = countries.find(
        (item: any) => item.fields.Value === selectedValue
      )?.fields.Zone;
      localStorage.setItem("selectedCountryZone", zone);
    }
  }, [selectedValue]);

  const handleWeightInput = (e: any) => {
    setWeight(e.target.value);
    setCeilWeight(Math.ceil(e.target.value));
    localStorage.setItem("ceilWeight", Math.ceil(e.target.value).toString());
    localStorage.setItem("weight", e.target.value);
  };

  return (
    <>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu Content</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          This is the menu content.
        </IonContent>
      </IonMenu>

      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton></IonMenuButton>
            </IonButtons>
            <IonTitle>Rapid Links</IonTitle>
            <IonButtons slot="secondary">
              <IonButton routerLink="/settings">
                <IonIcon slot="icon-only" icon={settingsOutline}></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent color="light">
          <IonCard className="cards" style={{ marginTop: "20px" }}>
            <IonCardHeader className="cardHeader">
              <IonCardTitle>Select Country</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <IonList inset={false}>
                <IonItem button={true} detail={false} id="select-country">
                  {selectedCountry === undefined && (
                    <div style={{ color: "gray" }}>Not Selected</div>
                  )}
                  <div id="selected-country">{selectedCountry}</div>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>
          {selectedCountry && (
            <IonCard className="cards" style={{ marginTop: "20px" }}>
              <IonCardHeader className="cardHeader">
                <IonCardTitle>Enter Weight</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  {/* Weight Input */}
                  <IonItem id="weightInputItem">
                    <IonInput
                      id="weightInput"
                      type="number"
                      placeholder="Weight"
                      value={weight}
                      onIonInput={(e: any) => handleWeightInput(e)}
                    ></IonInput>
                  </IonItem>
                  <IonItem lines="none">
                    <p id="weightHelperText">Actual weight: {weight} KGs</p>
                  </IonItem>
                </IonList>
                {weight > 0 && (
                  <IonButton
                    shape="round"
                    id="resetButton"
                    expand="block"
                    routerLink="/rates"
                  >
                    Get Rates
                  </IonButton>
                )}
              </IonCardContent>
            </IonCard>
          )}

          <IonModal trigger="select-country" ref={modal}>
            <AppTypeahead
              title="Select Country"
              selectedValue={selectedValue}
              setCountries={setCountries}
              setSelectedValue={setSelectedValue}
              selectedItem={selectedCountry}
              onSelectionCancel={() => modal.current?.dismiss()}
              onSelectionChange={countrySelectionChanged}
            />
          </IonModal>
        </IonContent>
      </IonPage>
    </>
  );
};
export default Home;
