const PLANT_ID_API_KEY = "Gbc8yIF2nS7BkUdTJpRAnna32cHHI8umTpn5RJjKUBvcDqyN8J";

export async function identifyPlant(base64Image) {
  const response = await fetch("https://https://plant.id/api/v3", {
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

  const data = await response.json();
  return data;
}
