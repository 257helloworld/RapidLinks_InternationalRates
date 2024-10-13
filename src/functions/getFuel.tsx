import Airtable from "airtable";

export default async function getFuel() {
  try {
    const airtable = new Airtable({
      apiKey: import.meta.env.VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN,
    });
    const base = airtable.base("apph8kU8Y2EQFTEYb");
    const table = base("Networks");

    const records = await table.select().all();
    return records;
  } catch (exception) {
    throw exception;
  }
}
