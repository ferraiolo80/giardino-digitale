// === VARIABILI GLOBALI ===
const plants = [];
const myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
const gardenContainer = document.getElementById("garden-container");
const searchInput = document.getElementById("searchInput");
const tempMinInput = document.getElementById("tempMinFilter");
const tempMaxInput = document.getElementById("tempMaxFilter");

// === FUNZIONI DI RENDERING ===
function renderPlants(plantArray) {
  gardenContainer.innerHTML = "";
  plantArray.forEach((plant) => {
    const plantCard = document.createElement("div");
    plantCard.className = "plant-card";

    plantCard.innerHTML = `
      <h3>${plant.name}</h3>
      <p><strong>Luce:</strong> ${plant.sunlight}</p>
      <p><strong>Acqua:</strong> ${plant.watering}</p>
      <p><strong>Temperatura:</strong> ${plant.tempMin}°C - ${plant.tempMax}°C</p>
      <button onclick="addToMyGarden('${plant.name}')">Aggiungi al mio giardino</button>
    `;

    gardenContainer.appendChild(plantCard);
  });
}

function renderMyGarden() {
  const myGardenContainer = document.getElementById("giardino");
  if (!myGardenContainer) return;
  myGardenContainer.innerHTML = "";

  myGarden.forEach((plant) => {
    const div = document.createElement("div");
    div.className = "my-plant-card";
    div.innerHTML = `
      <h4>${plant.name}</h4>
      <p>Luce: ${plant.sunlight}</p>
      <p>Acqua: ${plant.watering}</p>
      <p>Temperatura: ${plant.tempMin}°C - ${plant.tempMax}°C</p>
      <button onclick="removeFromMyGarden('${plant.name}')">Rimuovi</button>
      <button onclick="updatePlant('${plant.name}')">Aggiorna info</button>
    `;
    myGardenContainer.appendChild(div);
  });
}

// === FUNZIONI PRINCIPALI ===
function addToMyGarden(plantName) {
  const plant = plants.find((p) => p.name === plantName);
  if (!myGarden.some((p) => p.name === plantName)) {
    myGarden.push(plant);
    localStorage.setItem("myGarden", JSON.stringify(myGarden));
    renderMyGarden();
  }
}

function removeFromMyGarden(plantName) {
  const index = myGarden.findIndex((p) => p.name === plantName);
  if (index > -1) {
    myGarden.splice(index, 1);
    localStorage.setItem("myGarden", JSON.stringify(myGarden));
    renderMyGarden();
  }
}

function updatePlant(plantName) {
  const plant = myGarden.find((p) => p.name === plantName);
  if (!plant) return;

  const newLight = prompt("Nuova esposizione alla luce:", plant.sunlight);
  const newWater = prompt("Nuova esigenza idrica:", plant.watering);
  const newMinTemp = prompt("Temperatura minima ideale (°C):", plant.tempMin);
  const newMaxTemp = prompt("Temperatura massima ideale (°C):", plant.tempMax);

  if (newLight) plant.sunlight = newLight;
  if (newWater) plant.watering = newWater;
  if (!isNaN(newMinTemp)) plant.tempMin = parseInt(newMinTemp);
  if (!isNaN(newMaxTemp)) plant.tempMax = parseInt(newMaxTemp);

  localStorage.setItem("myGarden", JSON.stringify(myGarden));
  renderMyGarden();
}

// === FILTRI ===
function filterByTemperature() {
  const min = parseInt(tempMinInput.value);
  const max = parseInt(tempMaxInput.value);
  const filtered = plants.filter((p) => {
    return (
      (!isNaN(min) ? p.tempMin >= min : true) &&
      (!isNaN(max) ? p.tempMax <= max : true)
    );
  });
  renderPlants(filtered);
}

// === INIZIALIZZAZIONE ===
fetch("plants.json")
  .then((response) => response.json())
  .then((data) => {
    plants.push(...data);
    renderPlants(plants);
    renderMyGarden();
  })
  .catch((error) => {
    console.error("Errore nel caricamento del database:", error);
  });

// === FUNZIONE 1: Cerca pianta per nome ===
function searchPlant() {
  const query = searchInput.value.toLowerCase();
  const results = plants.filter((plant) =>
    plant.name.toLowerCase().includes(query)
  );
  renderPlants(results);
}

// === FUNZIONE 2: Analizza immagine per identificare pianta ===
function identifyPlant() {
  const fileInput = document.getElementById("photoInput");
  const file = fileInput.files[0];
  if (!file) {
    alert("Per favore carica una foto.");
    return;
  }

  handleFile(file);
}

// === FUNZIONE 3: Simula identificazione pianta da immagine ===
function handleFile(file) {
  // In un'app reale useremmo Plant.id o simili
  const fakePlantName = "Ortensia"; // per test

  const found = plants.find((p) => p.name === fakePlantName);
  if (found) {
    alert(`Pianta riconosciuta: ${found.name}`);
    renderPlants([found]);
  } else {
    alert("Pianta non trovata nel database.");
  }
}

