import { getAuthHeaders } from "./utils";

const fetchfarmers = async () => {
  try {
    const res = await fetch("/api/farmer/getallfarmers", {
      headers: getAuthHeaders,
    });
    const data = await res.json();
    document.getElementById("totalFarmers").tectContent = data.length;
  } catch (err) {
    console.log("Error fetching farmers:", err);
  }
};
