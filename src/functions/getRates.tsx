import Airtable from "airtable";

const getRates = async (network: any, weight: any, zone: any) => {
  const airtable = new Airtable({
    apiKey: import.meta.env.VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN,
  });
  const base = airtable.base("apph8kU8Y2EQFTEYb");
  const table = base(network);
  if (weight > 11) {
    const records = await table
      .select({
        sort: [{ field: "Weight", direction: "desc" }],
      })
      .all();
    let record = records[0];
    return record;
  }
  const records = await table
    .select({
      sort: [{ field: "Weight", direction: "asc" }],
      filterByFormula: `{Weight}>=${weight}`,
    })
    .all();
  let record = records[0];
  return record;
};

export default getRates;
