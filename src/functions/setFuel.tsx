import Airtable from "airtable";

export default async function getFuel(network: string, percentage: any) {
  try {
    const airtable = new Airtable({
      apiKey: import.meta.env.VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN,
    });
    const base = airtable.base("apph8kU8Y2EQFTEYb");
    const table = base("Networks");

    const records = await table
      .select({
        filterByFormula: `{${"Network"}} = '${network}'`,
      })
      .all();
    const recordId = records[0].id;
    await base("Networks").update(recordId, {
      Percentage: parseFloat(percentage),
    });
  } catch (exception) {
    throw exception;
  }
}
