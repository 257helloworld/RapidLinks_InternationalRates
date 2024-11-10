import Airtable from "airtable";

export default async function setFetchLog(
  queryString: string,
  rateString: string
) {
  try {
    const airtable = new Airtable({
      apiKey: import.meta.env.VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN,
    });
    const base = airtable.base("apph8kU8Y2EQFTEYb");
    const table = base("FetchLog");
    await table.create([
      {
        fields: {
          DateTime: new Date().toLocaleString(),
          Query: queryString,
          Rate: rateString,
        },
      },
    ]);
  } catch (exception) {
    throw exception;
  }
}
