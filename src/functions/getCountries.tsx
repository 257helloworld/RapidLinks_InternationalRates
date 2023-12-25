import Airtable from "airtable";

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const isToday = (storedDate: string) => {
  const today = getTodayDateString();
  return storedDate === today;
};

export default async function getCountries() {
  try {
    const cachedCountries = localStorage.getItem("countries");
    const lastUpdatedDate = localStorage.getItem("lastUpdatedDate");

    if (cachedCountries && lastUpdatedDate && isToday(lastUpdatedDate)) {
      console.log("fetched from cache");
      return JSON.parse(cachedCountries);
    }

    const airtable = new Airtable({
      apiKey: import.meta.env.VITE_AIRTABLE_PERSONAL_ACCESS_TOKEN,
    });
    const base = airtable.base("apph8kU8Y2EQFTEYb");
    const table = base("Countries");

    console.log("fetched from server");
    const records = await table
      .select({
        sort: [{ field: "Name", direction: "asc" }],
      })
      .all();
    localStorage.setItem("countries", JSON.stringify(records));
    localStorage.setItem("lastUpdatedDate", getTodayDateString());
    return records;
  } catch (error) {
    console.error("Error fetching countries data:", error);
    throw error;
  }
}
