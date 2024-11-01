import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
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
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { collection } from "firebase/firestore";
import db from "../services/firebase";

import "./Home.css";

import { settingsOutline } from "ionicons/icons";
// import { useStorage } from "../../hooks/useStorage";
import AppTypeahead from "../components/AppTypeAhead";

const Home: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [weight, setWeight] = useState(0);
  const [ceilWeight, setCeilWeight] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string>();
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(false);
  const [countries, setCountries] = useState<any>();
  const [parcelType, setParcelType] = useState<"Dox" | "NDox">("Dox");
  const [isWeightValid, setIsWeightValid] = useState<boolean>(false);
  const [weightErrorMessage, setWeightErrorMessage] = useState<string>("");

  const modal = useRef<HTMLIonModalElement>(null);
  const weightInput = useRef<HTMLIonInputElement>(null);
  // const ratesCard = useRef<typeof IonCard>(null);

  const countrySelectionChanged = (country: string) => {
    setSelectedCountry(country);
    modal.current?.dismiss();
  };

  const onWeightInputClick = () => {
    window.scrollTo(0, document.body.scrollHeight);
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
    validateWeight(parcelType, e.target.value);
    let weight = e.target.value;
    setWeight(weight);
    setCeilWeight(Math.ceil(weight));
    localStorage.setItem("ceilWeight", Math.ceil(weight).toString());
    localStorage.setItem("weight", weight);
  };

  const validateWeight = (parcelType: string, weight: number) => {
    if (weight <= 0) {
      setIsWeightValid(false);
      setWeightErrorMessage("Weight must be greater than 0 Kgs.");
      return;
    }
    if (parcelType == "NDox" || (parcelType == "Dox" && weight <= 2)) {
      setIsWeightValid(true);
    } else {
      setIsWeightValid(false);
      setWeightErrorMessage("Weight must be below or equal to 2 Kgs for Dox.");
    }
  };

  useEffect(() => {
    console.log(isWeightValid);
    setIsButtonEnabled(isWeightValid);
  }, [isWeightValid]);

  return (
    <>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle></IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">Version. 1.10</IonContent>
      </IonMenu>

      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton></IonMenuButton>
            </IonButtons>
            <IonTitle>Rate Calculator</IonTitle>
            <IonButtons style={{ display: "none" }} slot="secondary">
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
                <IonCardTitle>Select Parcel Type</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem className="parcelTypeItem">
                  <IonLabel style={{ fontFamily: "Poppins" }}>Type</IonLabel>
                  <IonSelect
                    value={parcelType}
                    interface="popover"
                    color={"tertiary"}
                    slot="end"
                    onIonChange={(e) => {
                      setParcelType(e.detail.value);
                      validateWeight(e.detail.value, weight);
                    }}
                  >
                    <IonSelectOption value="Dox">Dox</IonSelectOption>
                    <IonSelectOption value="NDox">Non-Dox</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonCardContent>
            </IonCard>
          )}

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
                      onClick={onWeightInputClick}
                      onIonInput={(e: any) => handleWeightInput(e)}
                    ></IonInput>
                  </IonItem>
                  <IonItem lines="none">
                    <p id="weightHelperText">Weight: {weight} KGs</p>
                  </IonItem>
                  {!isWeightValid && weight != 0 && (
                    <IonItem lines="none">
                      <p id="weightErrorMessage">{weightErrorMessage}</p>
                    </IonItem>
                  )}
                </IonList>

                <IonButton
                  id="resetButton"
                  expand="block"
                  routerLink={`/rates/${parcelType}`}
                  disabled={!isButtonEnabled}
                  className="getRatesButton"
                >
                  Get Rates
                </IonButton>
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
