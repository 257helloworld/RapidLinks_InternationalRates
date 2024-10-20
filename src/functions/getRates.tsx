import Airtable from "airtable";

const getRates = async (
  network: any,
  weight: any,
  zone: any,
  fuelPercentage: number,
  highestWeight: any,
  parcelType: string
) => {
  const airtable = new Airtable({
    apiKey: import.meta.env.VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN,
  });
  const base = airtable.base("apph8kU8Y2EQFTEYb");

  let table: Airtable.Table<any>;
  if (network == "DHL") {
    table = base(`DHL_${parcelType}`);
  } else {
    table = base(network);
  }

  if (weight > highestWeight) {
    weight = Math.ceil(weight);
    const records = await table
      .select({
        sort: [{ field: "Weight", direction: "asc" }],
        filterByFormula: `{Weight}>=${highestWeight}`,
      })
      .all();
    for (let i = 0; i < records.length - 1; i++) {
      const currentWeight: any = records[i].get("Weight");
      const nextWeight: any = records[i + 1].get("Weight");

      if (weight >= currentWeight && weight < nextWeight) {
        let record: any = records[i];
        record = {
          ...record,
          fields: { ...record.fields, isMultiplier: true },
        };
        // Calculate DHL Rate
        return calculateDHLRate(record, zone, fuelPercentage, weight);
      }
    }
    // If weight is greater than or equal to the last weight, return the last record;
    let record: any = records[records.length - 1];
    record = {
      ...record,
      fields: { ...record.fields, isMultiplier: true },
    };
    return calculateDHLRate(record, zone, fuelPercentage, weight);
  }
  const records = await table
    .select({
      sort: [{ field: "Weight", direction: "asc" }],
      filterByFormula: `{Weight}>=${weight}`,
    })
    .all();
  let record: any = records[0];
  record = { ...record, fields: { ...record.fields, isMultiplier: false } };
  return calculateDHLRate(record, zone, fuelPercentage, weight);
};

const calculateDHLRate = (
  record: any,
  zone: any,
  fuelPercentage: number,
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
  // Add Fuel Surcharge
  const fuelSurcharge = (rate * fuelPercentage) / 100;
  rate = rate + fuelSurcharge;

  // Add Demand Surcharge
  const demandSurchargePerKg = Number(
    localStorage.getItem("DemandSurcharge_PerKg") || "0"
  );
  const demandSurcharge = demandSurchargePerKg * chargeableWeight;
  rate = rate + demandSurcharge;

  // Add Green Tax
  const greenTaxPerKg = Number(localStorage.getItem("GreenTax") || "0");
  const greenTax = greenTaxPerKg * chargeableWeight;
  rate = rate + greenTax;

  // Add Commission
  let commissionPercentage: number = 27;
  const commission = (rate * commissionPercentage) / 100;
  rate = rate + commission;

  // Add 18 % GST
  const gst = (rate * 18) / 100;

  return {
    BaseRate: baseRate,
    Rate: rate,
    CommissionPercentage: commissionPercentage,
    Commission: commission,
    GstRate: rate + gst,
    ChargeableWeight: record.fields.isMultiplier
      ? weight
      : record.fields.Weight,
    GreenTaxPerKg: greenTaxPerKg,
    GreenTax: greenTax,
    DemandSurchargePerKg: demandSurchargePerKg,
    DemandSurcharge: demandSurcharge,
    FuelPercentage: fuelPercentage,
    FuelCharge: fuelSurcharge,
  };
};
export default getRates;
