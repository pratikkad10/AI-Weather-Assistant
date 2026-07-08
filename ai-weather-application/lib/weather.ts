import axios from "axios";

export async function Weather_API(city: string, date: string = "today") {
  try {
    const url = `https://wttr.in/${encodeURIComponent(city.toLowerCase())}?format=%C+%t`;
    const response = await axios.get(url);
    return `The weather condition in ${city} is ${response.data}`;
  } catch (error) {
    console.error("Weather_API Error:", error);
    return "City not found or weather data unavailable.";
  }
}
