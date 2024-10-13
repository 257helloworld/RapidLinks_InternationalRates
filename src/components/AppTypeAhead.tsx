import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonSearchbar,
  IonToolbar,
  IonRadio,
  IonRadioGroup,
} from "@ionic/react";

import React, { useEffect, useRef, useState } from "react";
import getCountries from "../functions/getCountries";

function AppTypeahead(props: any) {
  const [countries, setCountries] = useState<any>();
  const [loaded, setLoaded] = useState<boolean>();
  const [filteredItems, setFilteredItems] = useState<any>(props.items);
  const modal = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    setLoaded(false);
    fetchCountries();
  }, []);

  const cancelChanges = () => {
    const { onSelectionCancel } = props;
    if (onSelectionCancel !== undefined) {
      onSelectionCancel();
    }
  };

  const fetchCountries = async () => {
    try {
      let data = await getCountries();
      props.setCountries(data);
      setCountries(data);
      setFilteredItems(data);
      setLoaded(true);
    } catch (error) {
      console.log(error);
    }
  };

  const onSelectedCountryChanged = (e: any) => {
    const { setSelectedValue } = props;
    if (setSelectedValue !== undefined) {
      setSelectedValue(e.detail.value);
    }
    const foundCountry = countries.find(
      (item: any) => item.fields.Value === e.detail.value
    );
    const countryName = foundCountry?.fields.Name;
    const demandSurchargePerKg = foundCountry?.fields.DHL_DemandSurcharge_PerKg;
    const greenTax = foundCountry?.fields.DHL_GreenTax;

    const { onSelectionChange } = props;
    if (onSelectionChange !== undefined) {
      if (countryName !== undefined) {
        let countryNameFormatted = countryName
          .split(" ")
          .map(
            (word: any) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");
        onSelectionChange(countryNameFormatted);
        localStorage.setItem("DemandSurcharge_PerKg", demandSurchargePerKg);
        localStorage.setItem("GreenTax", greenTax);
      }
    }
  };

  const searchbarInput = (e: any) => {
    filterList(e.target.value);
  };

  const filterList = (searchQuery: string | null | undefined) => {
    console.log("searching");
    if (searchQuery === undefined || searchQuery === null) {
      setFilteredItems(countries);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredItems(
        countries.filter((country: any) => {
          return country.fields.Name.toLowerCase().includes(query);
        })
      );
    }
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={cancelChanges}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>{props.title}</IonTitle>
          <IonButtons slot="end">
            {/* <IonButton onClick={confirmChanges}>Done</IonButton> */}
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar onIonInput={searchbarInput}></IonSearchbar>
        </IonToolbar>
      </IonHeader>

      <IonContent color="light">
        {!loaded && (
          <div
            style={{
              height: "100%",
              width: "100%",
              textAlign: "center",
              display: "flex",
            }}
          >
            <span style={{ margin: "auto" }}>Hang On! Loading...</span>
          </div>
        )}

        {loaded && (
          <IonList id="modal-list" inset={true}>
            <IonRadioGroup
              onIonChange={(e) => onSelectedCountryChanged(e)}
              value={props.selectedValue}
            >
              {filteredItems.length == 0 && (
                <div
                  style={{
                    height: "100%",
                    width: "100%",
                    textAlign: "center",
                    display: "flex",
                  }}
                >
                  <b style={{ margin: "auto" }}>No country found</b>
                </div>
              )}
              {filteredItems.length > 0 &&
                filteredItems.map((country: any) => (
                  <IonItem key={country.fields.Name}>
                    <IonLabel>
                      {country.fields.Name.split(" ")
                        .map(
                          (word: any) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(" ")}
                    </IonLabel>
                    <IonRadio
                      color={"tertiary"}
                      onClick={cancelChanges}
                      slot="start"
                      value={country.fields.Value}
                    ></IonRadio>
                  </IonItem>
                ))}
            </IonRadioGroup>
          </IonList>
        )}
      </IonContent>
    </>
  );
}
export default AppTypeahead;
