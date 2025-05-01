const PLANT_ID_API_KEY = "maF4AdHcoe2hZpxT7aMYwWcLCCNVarvNf0ux5b92et15OeRmCf";

export async function identifyPlant(base64Image) {
  try {
  const response = await fetch("https://api.plant.id/v2/identify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": PLANT_ID_API_KEY,
    },
    body: JSON.stringify({
      images: [base64Image],
      organs: ["leaf"],
      similar_images: true,
    }),
  });
  
if (!response.ok) {
      const error = await response.json();
      console.error("Errore dalla API di identificazione:", error);
      throw new Error(`Errore nell'identificazione della pianta: ${response.status}`);
    }

  const data = await response.json();
  console.log("Dati API:", data);
  return data;
} catch (error) {
    console.error("Errore durante la chiamata all'API:", error);
    throw error;
  }
}
