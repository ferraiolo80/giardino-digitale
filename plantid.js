const PLANT_ID_API_KEY = "maF4AdHcoe2hZpxT7aMYwWcLCCNVarvNf0ux5b92et15OeRmCf";

export async function identifyPlant(base64Image) {
  const response = await fetch("https://api.plant.id/v2/identify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": PLANT_ID_API_KEY,
    },
    body: JSON.stringify({
      images: [base64Image],
      similar_images: true,
    }),
  });

  const data = await response.json();
  console.log("Dati API:", data);
  return data;
}
