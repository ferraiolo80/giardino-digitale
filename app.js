// === VARIABILI GLOBALI ===
const plants = [];
const myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
const gardenContainer = document.getElementById("garden-container");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const tempMinFilter = document.getElementById("tempMinFilter");
const tempMaxFilter = document.getElementById("tempMaxFilter");
const myGardenContainer = document.getElementById("my-garden"); // Ottieni il contenitore del giardino qui

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
      <p><strong>Temperatura ideale min:</strong> ${plant.tempMin}°C</p>
      <p><strong>Temperatura ideale max:</strong> ${plant.tempMax}°C</p>
      ${
        plant.description
          ? `<p><strong>Descrizione:</strong> ${plant.description}</p>`
          : ""
      }
      ${
        plant.image
          ? `<img src="${plant.image}" alt="${plant.name}" width="100">`
          : ""
      }
      <button onclick="addToMyGarden('${plant.name}')">Aggiungi al mio giardino</button>
    `;

    gardenContainer.appendChild(plantCard);
  });
}

function renderMyGarden() {
  if (!myGardenContainer) return;
  myGardenContainer.innerHTML = "";

  myGarden.forEach((plant) => {
    const div = document.createElement("div");
    div.className = "my-plant-card";
    div.innerHTML = `
      <h4>${plant.name}</h4>
      <p>Luce: ${plant.sunlight}</p>
      <p>Acqua: ${plant.watering}</p>
      <p>Temperatura ideale min: ${plant.tempMin}°C</p>
      <p>Temperatura ideale max: ${plant.tempMax}°C</p>
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
  const newTempMin = prompt("Nuova temperatura ideale minima (°C):", plant.tempMin);
  const newTempMax = prompt("Nuova temperatura ideale massima (°C):", plant.tempMax);

  if (newLight) plant.sunlight = newLight;
  if (newWater) plant.watering = newWater;
  if (newTempMin && !isNaN(newTempMin)) plant.tempMin = Number(newTempMin);
  if (newTempMax && !isNaN(newTempMax)) plant.tempMax = Number(newTempMax);

  localStorage.setItem("myGarden", JSON.stringify(myGarden));
  renderMyGarden();
}

// === FILTRI E RICERCA ===
function applyFilters() {
  let filtered = [...plants];

  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const minTemp = tempMinFilter.value;
  const maxTemp = tempMaxFilter.value;

  if (searchTerm) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(searchTerm)
    );
  }

  if (category !== "all") {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (minTemp) {
    const minTempNum = parseInt(minTemp);
    filtered = filtered.filter((p) => !isNaN(p.tempMin) && p.tempMin >= minTempNum);
  }

  if (maxTemp) {
    const maxTempNum = parseInt(maxTemp);
    filtered = filtered.filter((p) => !isNaN(p.tempMax) && p.tempMax <= maxTempNum);
  }

  renderPlants(filtered);
}

// === EVENTI ===
searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
tempMinFilter.addEventListener("input", applyFilters);
tempMaxFilter.addEventListener("input", applyFilters);

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
