
const BaseURL = "localhost:8080";

const getAllMedicines = async () => {
  try {
    const response = await fetch(`http://${BaseURL}/`);
    if (!response.ok) {
      throw new Error("Failed to fetch medicines");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching medicines:", error);
    throw error;
  }
};

export default getAllMedicines