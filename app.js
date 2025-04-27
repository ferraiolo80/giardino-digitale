const API_KEY = "maF4AdHcoe2hZpxT7aMYwWcLCCNVarvNf0ux5b92et15OeRmCf";
let plantsDB = [];

window.onload = async () => {
  const plantsRes = await fetch("plants.json");
  plantsDB = await plantsRes.json();
};

async function identifyPlant() {
  const fileInput = document.getElementById('fileInput');
  const info = document.getElementById('identificaInfo');
  
  if (!fileInput.files.length) {
    info.textContent = "Seleziona un'immagine prima di identificare!";
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("images", file);

  try {
    info.textContent = "🔎 Sto identificando la pianta...";
    
    const response = await fetch("https://plant.id/api/v3/identification", {
      method: "POST",
      headers: { "Api-Key": API_KEY },
      body: formData
    });
    const data = await response.json();

    if (data?.suggestions?.length) {
      const best = data.suggestions[0];
      document.getElementById("risultato").innerHTML = `
        <div style="margin-top:1em;">
          <strong>🌿 Pianta riconosciuta:</strong> ${best.plant_name}
          <br/>
          <button onclick='addToGarden({ "name": "${best.plant_name}" })'>Aggiungi al mio giardino</button>
        </div>
      `;
    } else {
      info.textContent = "Pianta non riconosciuta. Riprova con un'altra foto!";
    }
  } catch (error) {
    console.error(error);
    info.textContent = "Errore nell'identificazione.";
  }
}
