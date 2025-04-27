const API_KEY = "maF4AdHcoe2hZpxT7aMYwWcLCCNVarvNf0ux5b92et15OeRmCf";
let plantsDB = [];
let myGarden = [];
let gardenVisible = true;

window.onload = async () => {
  await loadPlants();
  await loadGarden();
  setupEventListeners();
  renderGarden();
};

async function loadPlants() {
  const res = await fetch('plants.json');
  plantsDB = await res.json();
}

async function loadGarden() {
  const res = await fetch('myGarden.json');
  myGarden = await res.json();
}

function setupEventListeners() {
  document.getElementById('searchButton').onclick = searchPlant;
  document.getElementById('identifyButton').onclick = identifyPlant;
  document.getElementById('filterButton').onclick = filterByTemperature;
  document.getElementById('toggleGardenButton').onclick = toggleGardenVisibility;
}

function renderGarden() {
  const container = document.getElementById('gardenList');
  container.innerHTML = "";
  myGarden.forEach((plant, index) => {
    container.innerHTML += createPlantCard(plant, index);
  });
}

function createPlantCard(plant, index) {
  return `
    <div class="plant-card">
      <strong>${plant.name}</strong><br>
      ☀️ Luce: ${plant.sunlight || "?"} <br>
      💧 Acqua: ${plant.watering || "?"} <br>
      🌡️ Temperatura min: ${plant.tempMin || "?"}°C - max: ${plant.tempMax || "?"}°C<br>
      <button onclick="removeFromGarden(${index})">Rimuovi</button>
    </div>
  `;
}

function toggleGardenVisibility() {
  gardenVisible = !gardenVisible;
  const gardenSection = document.getElementById('gardenSection');
  gardenSection.style.display = gardenVisible ? 'block' : 'none';
  document.getElementById('toggleGardenButton').innerText = gardenVisible ? 'Nascondi il mio giardino' : 'Mostra il mio giardino';
}

function searchPlant() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!query) return;

  const foundPlant = plantsDB.find(p => p.name.toLowerCase() === query);
  const resultContainer = document.getElementById('searchResult');
  resultContainer.innerHTML = "";

  if (foundPlant) {
    resultContainer.innerHTML = `
      <strong>${foundPlant.name}</strong><br>
      ☀️ Luce: ${foundPlant.sunlight || "?"}<br>
      💧 Acqua: ${foundPlant.watering || "?"}<br>
      🌡️ Temperatura: ${foundPlant.tempMin || "?"}°C - ${foundPlant.tempMax || "?"}°C<br>
      <button onclick='addToGarden(${JSON.stringify(foundPlant).replace(/"/g, '&quot;')})'>Salva nel mio giardino</button>
    `;
  } else {
    identifyPlant();
  }
}

function addToGarden(plant) {
  if (!myGarden.find(p => p.name === plant.name)) {
    myGarden.push(plant);
    saveGarden();
    renderGarden();
  }
}

function removeFromGarden(index) {
  myGarden.splice(index, 1);
  saveGarden();
  renderGarden();
}

function saveGarden() {
  console.log("Salvataggio finto del giardino:", JSON.stringify(myGarden, null, 2));
}

async function identifyPlant() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.click();

  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('organs', 'leaf');
    formData.append('images', file);

    const res = await fetch('https://api.plant.id/v2/identify', {
      method: 'POST',
      headers: {
        'Api-Key': API_KEY
      },
      body: formData
    });

    const data = await res.json();
    if (data?.suggestions?.length > 0) {
      const bestMatch = data.suggestions[0];
      const newPlant = {
        name: bestMatch.plant_name || "Pianta sconosciuta",
        sunlight: "Da definire",
        watering: "Da definire",
        tempMin: "?",
        tempMax: "?"
      };
      
      const resultContainer = document.getElementById('searchResult');
      resultContainer.innerHTML = `
        <strong>${newPlant.name}</strong><br>
        ☀️ Luce: ${newPlant.sunlight}<br>
        💧 Acqua: ${newPlant.watering}<br>
        🌡️ Temperatura: ${newPlant.tempMin}°C - ${newPlant.tempMax}°C<br>
        <button onclick='addToGarden(${JSON.stringify(newPlant).replace(/"/g, '&quot;')})'>Salva nel mio giardino</button>
      `;
    } else {
      document.getElementById('searchResult').innerText = "Nessuna pianta riconosciuta.";
    }
  };
}

function filterByTemperature() {
  const minTemp = parseInt(document.getElementById('tempMin').value);
  const maxTemp = parseInt(document.getElementById('tempMax').value);
  if (isNaN(minTemp) || isNaN(maxTemp)) return;

  const results = plantsDB.filter(plant => {
    return (
      plant.tempMin !== undefined &&
      plant.tempMax !== undefined &&
      plant.tempMin <= maxTemp &&
      plant.tempMax >= minTemp
    );
  });

  const resultContainer = document.getElementById('searchResult');
  resultContainer.innerHTML = "";

  if (results.length > 0) {
    results.forEach(p => {
      resultContainer.innerHTML += `
        <div>
          <strong>${p.name}</strong><br>
          ☀️ Luce: ${p.sunlight || "?"}<br>
          💧 Acqua: ${p.watering || "?"}<br>
          🌡️ Temperatura: ${p.tempMin}°C - ${p.tempMax}°C<br>
          <button onclick='addToGarden(${JSON.stringify(p).replace(/"/g, '&quot;')})'>Salva nel mio giardino</button>
        </div><br>
      `;
    });
  } else {
    resultContainer.innerText = "Nessuna pianta adatta trovata.";
  }
}
