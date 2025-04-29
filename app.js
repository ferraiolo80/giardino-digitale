// === VARIABILI GLOBALI ===
const plants = [];
const myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
const gardenContainer = document.getElementById("garden-container");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const tempFilter = document.getElementById("tempFilter");

// === FUNZIONI DI RENDERING ===
function renderPlants(plantArray) {
  gardenContainer.innerHTML = "";
  plantArray.forEach((plant) => {
    const plantCard = document.createElement("div");
    plantCard.className = "plant-card";

    plantCard.innerHTML = `
      <h3>${plant.name}</h3>
      <p><strong>Categoria:</strong> ${plant.category}</p>
      <p><strong>Luce:</strong> ${plant.light}</p>
      <p><strong>Acqua:</strong> ${plant.water}</p>
      <p><strong>Temperatura ideale:</strong> ${plant.temperature}°C</p>
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
  const myGardenContainer = document.getElementById("my-garden");
  if (!myGardenContainer) return;
  myGardenContainer.innerHTML = "";

  myGarden.forEach((plant) => {
    const div = document.createElement("div");
    div.className = "my-plant-card";
    div.innerHTML = `
      <h4>${plant.name}</h4>
      <p>Luce: ${plant.light}</p>
      <p>Acqua: ${plant.water}</p>
      <p>Temperatura ideale: ${plant.temperature}°C</p>
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

  const newLight = prompt("Nuova esposizione alla luce:", plant.light);
  const newWater = prompt("Nuova esigenza idrica:", plant.water);
  const newTemp = prompt("Nuova temperatura ideale (°C):", plant.temperature);

  if (newLight) plant.light = newLight;
  if (newWater) plant.water = newWater;
  if (newTemp && !isNaN(newTemp)) plant.temperature = Number(newTemp);

  localStorage.setItem("myGarden", JSON.stringify(myGarden));
  renderMyGarden();
}

// === FILTRI E RICERCA ===
function applyFilters() {
  let filtered = [...plants];

  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const temp = tempFilter.value;

  if (searchTerm) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(searchTerm)
    );
  }

  if (category !== "all") {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (temp) {
    const tempNum = parseInt(temp);
    filtered = filtered.filter((p) => {
      const plantTemp = parseInt(p.temperature);
      return !isNaN(plantTemp) && plantTemp <= tempNum;
    });
  }

  renderPlants(filtered);
}

// === EVENTI ===
searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
tempFilter.addEventListener("input", applyFilters);

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
