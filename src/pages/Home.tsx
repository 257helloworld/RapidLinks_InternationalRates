import {
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
  IonMenu,
  IonMenuButton,
  IonModal,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { collection } from "firebase/firestore";
import db from "../services/firebase";

import "./Home.css";

import { settingsOutline } from "ionicons/icons";
// import { useStorage } from "../../hooks/useStorage";
import AppTypeahead from "../components/AppTypeAhead";
import getCountries from "../functions/getCountries";
import RatesCard from "../components/RatesCard";

const Home: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [ratesCard, setRatesCard] = useState<JSX.Element | null>(null);
  const [weight, setWeight] = useState(0);
  const [ceilWeight, setCeilWeight] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string>();
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(false);
  const [countries, setCountries] = useState<any>();
  const [parcelType, setParcelType] = useState<"Dox" | "NDox">("Dox");
  const [isWeightValid, setIsWeightValid] = useState<boolean>(false);
  const [weightErrorMessage, setWeightErrorMessage] = useState<string>("");
  const [key, setKey] = useState(0);

  const modal = useRef<HTMLIonModalElement>(null);
  const weightInput = useRef<HTMLIonInputElement>(null);

  // const ratesCard = useRef<typeof IonCard>(null);
  const contentRef = useRef<HTMLIonContentElement | null>(null);

  const scrollToBottom = () => {
    contentRef?.current?.scrollToBottom(300);
  };

  const countrySelectionChanged = (country: string) => {
    setSelectedCountry(country);
    modal.current?.dismiss();
  };

  const onWeightInputClick = () => {
    window.scrollTo(0, document.body.scrollHeight);
  };

  // Load countries on load
  useEffect(() => {
    const loadCountries = async () => {
      let data = await getCountries();
      setCountries(data);
    };
    loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      localStorage.setItem("selectedCountry", selectedCountry);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedValue) {
      let zoneFields = countries.find(
        (item: any) => item.fields.Value === selectedValue
      );
      let zones = {
        DHL_Zone: zoneFields?.fields?.DHL_Zone,
        Fedex_Zone: zoneFields?.fields?.Fedex_Zone,
      };
      localStorage.setItem("selectedCountryZone", JSON.stringify(zones));
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
    if (parcelType == "NDox" || (parcelType == "Dox" && weight <= 2.5)) {
      setIsWeightValid(true);
    } else {
      setIsWeightValid(false);
      setWeightErrorMessage(
        "Weight must be below or equal to 2.5 Kgs for Dox."
      );
    }
  };

  const handleGetClick = () => {
    setKey((prevKey) => prevKey + 1); // Increment key to trigger remount
    setRatesCard(
      <RatesCard
        key={key + 1}
        scroll={scrollToBottom}
        parcelType={parcelType}
      />
    );
  };

  useEffect(() => {
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
            <IonTitle>Rapid Links</IonTitle>
            <IonButtons style={{ display: "none" }} slot="secondary">
              <IonButton routerLink="/settings">
                <IonIcon slot="icon-only" icon={settingsOutline}></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent ref={contentRef} color="light">
          <IonGrid>
            <IonRow>
              <IonCol sizeMd="6" sizeLg="4" sizeSm="12" sizeXs="12" sizeXl="4">
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
              </IonCol>
              <IonCol sizeMd="6" sizeLg="4" sizeSm="12" sizeXs="12" sizeXl="4">
                <IonCard className="cards" style={{ marginTop: "20px" }}>
                  <IonCardHeader className="cardHeader">
                    <IonCardTitle>Select Parcel Type</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonItem className="parcelTypeItem">
                      <IonLabel style={{ fontFamily: "Poppins" }}>
                        Type
                      </IonLabel>
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
              </IonCol>

              <IonCol sizeMd="12" sizeLg="4" sizeSm="12" sizeXs="12" sizeXl="4">
                {selectedCountry && (
                  <IonCard className="cards" style={{ marginTop: "20px" }}>
                    <IonCardHeader className="cardHeader">
                      <IonCardTitle>Enter Weight (in Kgs)</IonCardTitle>
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
                        {/* <IonItem lines="none">
                          <p id="weightHelperText">Weight: {weight} KGs</p>
                        </IonItem> */}
                        {!isWeightValid && weight != 0 && (
                          <IonItem lines="none">
                            <p id="weightErrorMessage">{weightErrorMessage}</p>
                          </IonItem>
                        )}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                )}
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol style={{ display: "flex" }}>
                <IonButton
                  id="resetButton"
                  // expand="block"
                  style={{ margin: "auto", width: "200px" }}
                  // routerLink={`/rates/${parcelType}`}
                  disabled={!isButtonEnabled}
                  className="getRatesButton"
                  onClick={handleGetClick}
                >
                  Get Rates
                </IonButton>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol
                sizeXs="0"
                sizeSm="0"
                sizeMd="2"
                sizeLg="3"
                sizeXl="3"
              ></IonCol>
              <IonCol sizeXs="12" sizeSm="12" sizeMd="8" sizeLg="6" sizeXl="6">
                {ratesCard}
              </IonCol>
              <IonCol sizeXs="0" sizeSm="0" sizeMd="2" sizeLg="3" sizeXl="3">
                {/* <IonList inset={true}>
                  <IonItem>
                    <IonToggle
                      checked={true}
                      onIonChange={() => {}}
                      color={"tertiary"}
                    >
                      Include GST
                    </IonToggle>
                  </IonItem>
                </IonList> */}
              </IonCol>
            </IonRow>

            <IonModal trigger="select-country" ref={modal}>
              <AppTypeahead
                countries={countries}
                title="Select Country"
                selectedValue={selectedValue}
                setSelectedValue={setSelectedValue}
                selectedItem={selectedCountry}
                onSelectionCancel={() => modal.current?.dismiss()}
                onSelectionChange={countrySelectionChanged}
              />
            </IonModal>
          </IonGrid>
        </IonContent>
      </IonPage>
    </>
  );
};
export default Home;
