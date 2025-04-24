lconst API_KEY = "maF4AdHcoe2hZpxT7aMYwWcLCCNVarvNf0ux5b92et15OeRmCf";
let plantsDB = [];
let myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];

window.onload = async () => {
  const res = await fetch("plants.json");
  plantsDB = await res.json();
  renderMyGarden();
};

function renderMyGarden() {
  const container = document.getElementById("giardino");
  container.innerHTML = "";
  myGarden.forEach(plant => {
    container.innerHTML += formatPlantCard(plant);
  });
}

function formatPlantCard(plant) {
  return `
    <div class="pianta">
      <strong>${plant.name}</strong><br/>
      ☀️ Luce: ${plant.sun || "?"}<br/>
      💧 Acqua: ${plant.water || "?"}
    </div>`;
}

function searchPlant() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const match = [...plantsDB, ...myGarden].find(p => p.name.toLowerCase() === query);
  const container = document.getElementById("risultato");
  if (match) {
    container.innerHTML = formatPlantCard(match) + `<button onclick='addToGarden(${JSON.stringify(match)})'>Salva nel mio giardino</button>`;
  } else {
    container.innerHTML = "❌ Pianta non trovata.";
  }
}

function addToGarden(plant) {
  if (!myGarden.find(p => p.name === plant.name)) {
    myGarden.push(plant);
    localStorage.setItem("myGarden", JSON.stringify(myGarden));
    renderMyGarden();
  }
}

// === IDENTIFICAZIONE FOTO ===

async function identifyPlant() {
  const input = document.getElementById("imageInput");
  if (!input.files.length) return alert("Carica una foto prima!");

  const formData = new FormData();
  formData.append("images", input.files[0]);
  formData.append("similar_images", true);

  const res = await fetch("https://api.plant.id/v2/identify", {
    method: "POST",
    headers: { "Api-Key": API_KEY },
    body: formData
  });

  const data = await res.json();
  const suggestion = data?.suggestions?.[0];
  if (!suggestion) {
    document.getElementById("risultato").innerText = "❌ Nessuna pianta riconosciuta.";
    return;
  }

  const pianta = {
    name: suggestion.plant_name,
    sun: suggestion.plant_details?.sunlight?.[0] || "non specificato",
    water: suggestion.plant_details?.watering_general_benchmark?.value || "non specificato"
  };

  document.getElementById("risultato").innerHTML = formatPlantCard(pianta) + `<button onclick='addToGarden(${JSON.stringify(pianta)})'>Salva nel mio giardino</button>`;
}
