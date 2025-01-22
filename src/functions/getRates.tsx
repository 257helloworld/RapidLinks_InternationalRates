import Airtable from "airtable";

const getRates = async (
  network: any,
  weight: any,
  zone: any,
  fuelPercentage: number,
  commissionPercentage: number,
  highestWeight: any,
  parcelType: string
) => {
  const airtable = new Airtable({
    apiKey: import.meta.env.VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN,
  });
  const base = airtable.base("apph8kU8Y2EQFTEYb");

  let table: Airtable.Table<any>;
  let records: any;

  if (network == "DHL") {
    table = base(`DHL_${parcelType}`);
    // LocalStorage Caching
    let LSData: any = JSON.parse(
      localStorage.getItem(`DHL_${parcelType}`) as string
    );
    let cacheTimestamp = LSData?.timestamp;
    if (LSData != null && !isOlderThanOneDay(cacheTimestamp)) {
      records = LSData?.records;
    }
    // Fetch from airtable if cache not available or expired.
    else {
      const airtableRecords = await table
        .select({
          sort: [{ field: "Weight", direction: "asc" }],
        })
        .all();
      let newData = {
        timestamp: new Date().getTime(),
        records: airtableRecords,
      };
      records = airtableRecords;
      localStorage.setItem(`DHL_${parcelType}`, JSON.stringify(newData));
    }
  } else {
    table = base(network);
  }

  if (weight > highestWeight) {
    // For Multiplier Charges
    weight = Math.ceil(weight);
    records = records.filter(
      (record: any) => record.fields.Weight > highestWeight
    );
    for (let i = 0; i < records.length - 1; i++) {
      const currentWeight: any = records[i].fields.Weight;
      const nextWeight: any = records[i + 1].fields.Weight;

      if (weight >= currentWeight && weight < nextWeight) {
        let record: any = records[i];
        record = {
          ...record,
          fields: { ...record.fields, isMultiplier: true },
        };
        // Calculate DHL Rate
        return calculateDHLRate(
          record,
          zone,
          fuelPercentage,
          commissionPercentage,
          weight
        );
      }
    }
    // If weight is greater than or equal to the last weight, return the last record;
    let record: any = records[records.length - 1];
    record = {
      ...record,
      fields: { ...record.fields, isMultiplier: true },
    };
    return calculateDHLRate(
      record,
      zone,
      fuelPercentage,
      commissionPercentage,
      weight
    );
  }
  // For Non-Multiplier Charges.
  records = records.filter((record: any) => record.fields.Weight >= weight);
  let record: any = records[0];
  record = { ...record, fields: { ...record.fields, isMultiplier: false } };
  return calculateDHLRate(
    record,
    zone,
    fuelPercentage,
    commissionPercentage,
    weight
  );
};

const calculateDHLRate = (
  record: any,
  zone: any,
  fuelPercentage: number,
  commissionPercentage: number,
  weight: number
) => {
  // Get Base Rate from Zone
  let rate = record.fields[zone];
  // Get Chargeable Weight
  const chargeableWeight = Math.ceil(weight);
  // If Chargeable Weight is a Multiplier, multiply Base Rate by Chargeable Weight
  if (record.fields.isMultiplier && chargeableWeight !== undefined) {
    rate = rate * chargeableWeight;
  }
  let baseRate = rate;

  // Add Demand Surcharge
  // const demandSurchargePerKg = Number(
  //   localStorage.getItem("DemandSurcharge_PerKg") || "0"
  // );
  // const demandSurcharge = demandSurchargePerKg * chargeableWeight;
  // rate = rate + demandSurcharge;

  // Add Fuel Surcharge
  const fuelSurcharge = (rate * fuelPercentage) / 100;
  rate = rate + fuelSurcharge;

  // Add Green Tax
  const greenTaxPerKg = Number(localStorage.getItem("GreenTax") || "0");
  const greenTax = greenTaxPerKg * chargeableWeight;
  rate = rate + greenTax;

  // Add Commission
  const commission = (rate * commissionPercentage) / 100;
  rate = rate + commission;

  // Add 18 % GST
  const gst = (rate * 18) / 100;

  return {
    BaseRate: baseRate,
    Rate: rate,
    CommissionPercentage: record.fields.CommissionPercentage,
    Commission: commission,
    GstRate: rate + gst,
    GST: gst,
    ChargeableWeight: record.fields.isMultiplier
      ? weight
      : record.fields.Weight,
    GreenTaxPerKg: greenTaxPerKg,
    GreenTax: greenTax,
    // DemandSurchargePerKg: demandSurchargePerKg,
    // DemandSurcharge: demandSurcharge,
    FuelPercentage: fuelPercentage,
    FuelCharge: fuelSurcharge,
  };
};

const isOlderThanOneDay = (timestamp: any) => {
  let currentTimestamp = new Date().getTime();
  let difference = Math.abs(currentTimestamp - timestamp);
  let differenceInHours = difference / 1000 / 60 / 60;
  return differenceInHours >= 24 ? true : false;
};
export default getRates;
