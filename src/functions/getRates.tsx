import Airtable from "airtable";

const getRates = async (
  network: any,
  weight: any,
  zone: any,
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
        let record = records[i];
        let multiplierRecord = {
          ...record,
          fields: { ...record.fields, isMultiplier: true },
        };
        return multiplierRecord;
      }
    }
    // If weight is greater than or equal to the last weight, return the last record;
    let record = records[records.length - 1];
    let multiplierRecord = {
      ...record,
      fields: { ...record.fields, isMultiplier: true },
    };
    return multiplierRecord;
  }
  const records = await table
    .select({
      sort: [{ field: "Weight", direction: "asc" }],
      filterByFormula: `{Weight}>=${weight}`,
    })
    .all();
  console.log(records[0]);
  let record = records[0];
  return { ...record, fields: { ...record.fields, isMultiplier: false } };
};

export default getRates;
