import { identifyPlant } from './plantid.js';

// === VARIABILI GLOBALI ===
const plants = [];
let myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
const gardenContainer = document.getElementById("garden-container");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const tempMinFilter = document.getElementById("tempMinFilter");
const tempMaxFilter = document.getElementById("tempMaxFilter");
const myGardenContainer = document.getElementById("my-garden");
const authStatusDiv = document.getElementById('auth-status');
const appContentDiv = document.getElementById('app-content');
const imageSearchResultDiv = document.getElementById('image-search-result');
const authContainerDiv = document.getElementById('auth-container');
const toggleMyGardenButton = document.getElementById('toggleMyGarden');
const mioGiardinoSection = document.getElementById('my-garden');
const giardinoTitle = document.getElementById('giardinoTitle');

// === FUNZIONI FIREBASE ===
async function saveMyGardenToFirebase() {
  try {
    const user = firebase.auth().currentUser;
    if (user) {
      await db.collection("gardens").doc(user.uid).set({
        plants: myGarden,
        userId: user.uid
      });
      console.log("Giardino salvato su Firebase per l'utente:", user.uid);
    } else {
      console.warn("Nessun utente autenticato, il giardino è salvato solo localmente.");
    }
  } catch (error) {
    console.error("Errore nel salvataggio del giardino su Firebase:", error);
  }
}

async function loadMyGardenFromFirebase() {
  try {
    const user = firebase.auth().currentUser;
    if (user) {
      const doc = await db.collection("gardens").doc(user.uid).get();
      if (doc.exists) {
        myGarden = doc.data().plants || [];
        localStorage.setItem("myGarden", JSON.stringify(myGarden)); // Aggiorna anche il localStorage
        renderMyGarden();
        console.log("Giardino caricato da Firebase per l'utente:", user.uid);
      } else {
        console.log("Nessun giardino trovato su Firebase per questo utente, caricando da localStorage.");
        renderMyGarden(); // Carica comunque da localStorage se non c'è nulla su Firebase
      }
    } else {
      console.log("Nessun utente autenticato, caricando il giardino da localStorage.");
      renderMyGarden(); // Carica da localStorage se non c'è utente
    }
  } catch (error) {
    console.error("Errore nel caricamento del giardino da Firebase:", error);
    renderMyGarden(); // In caso di errore, prova a caricare da localStorage
  }
}

async function registerWithEmailPassword() {
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const errorDiv = document.getElementById('register-error');

  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    console.log("Utente registrato:", user.uid);
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    authStatusDiv.innerText = `Utente autenticato: ${user.email}`;
    appContentDiv.style.display = 'block';
    authContainerDiv.style.display = 'none'; // <---- Aggiunta questa riga
    loadMyGardenFromFirebase(); // Carica il giardino dopo la registrazione
  } catch (error) {
    console.error("Errore di registrazione:", error.message);
    errorDiv.innerText = error.message;
  }
}

async function loginWithEmailPassword() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');

  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    console.log("Utente loggato:", user.uid);
    authStatusDiv.innerText = `Utente autenticato: ${user.email}`;
    appContentDiv.style.display = 'block';
    authContainerDiv.style.display = 'none'; // <---- Aggiunta questa riga
    loadMyGardenFromFirebase(); // Carica il giardino dopo il login
  } catch (error) {
    console.error("Errore di login:", error.message);
    errorDiv.innerText = error.message;
  }
}

async function logout() {
  try {
    await firebase.auth().signOut();
    console.log("Utente disconnesso.");
    authStatusDiv.innerText = "Nessun utente autenticato.";
    appContentDiv.style.display = 'none';
    authContainerDiv.style.display = 'block'; // <---- Aggiunta questa riga
    myGarden = JSON.parse(localStorage.getItem("myGarden")) || []; // Ricarica da localStorage dopo il logout
    renderMyGarden();
  } catch (error) {
    console.error("Errore di logout:", error.message);
  }
}

async function identifyPlantFromImage() {
    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];

    if (!file) {
        imageSearchResultDiv.innerText = "Nessuna immagine selezionata.";
        return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1]; // Ottieni la parte base64

        try {
            const plantData = await identifyPlant(base64Image);
            console.log("Risultato identificazione completa:", plantData);
            console.log("Risultato identificazione:", plantData);
            if (plantData && plantData.suggestions && plantData.suggestions.length > 0 && plantData.suggestions[0].plant_details && plantData.suggestions[0].plant_details.scientific_name) {
                const bestMatch = plantData.suggestions[0].plant_details.scientific_name;
                imageSearchResultDiv.innerText = `Probabile corrispondenza: ${bestMatch}`;
            } else {
                imageSearchResultDiv.innerText = "Nessuna corrispondenza trovata.";
            }
        } catch (error) {
            console.error("Errore nell'identificazione della pianta:", error);
            imageSearchResultDiv.innerText = `Errore nell'identificazione: ${error.message}`; // Mostra il messaggio di errore
        }
    };

  reader.readAsDataURL(file);
}

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

function renderMyGarden(gardenArray) {
  const arrayToRender = gardenArray || myGarden;
  if (!myGardenContainer) return;
  myGardenContainer.innerHTML = "";

  arrayToRender.forEach((plant) => {
    const div = document.createElement("div");
    div.className = "my-plant-card";
    div.innerHTML = `
      <h4>${plant.name}</h4>
      <p>Luce: ${plant.sunlight}</p>
      <p>Acqua: ${plant.watering}</p>
      <p>Temperatura ideale min: ${plant.tempMin}°C</p>
      <p>Temperatura ideale max: ${plant.tempMax}°C</p>
      <button class="remove-button" data-plant-name="${plant.name}">Rimuovi</button>
      <button onclick="updatePlant('${plant.name}')">Aggiorna info</button>
    `;
    myGardenContainer.appendChild(div);

    // Aggiungi event listener al pulsante "Rimuovi"
    const removeButton = div.querySelector('.remove-button');
    removeButton.addEventListener('click', () => {
      const plantNameToRemove = removeButton.dataset.plantName;
      removeFromMyGarden(plantNameToRemove);
    });
  });
}
// === FUNZIONI PRINCIPALI ===
function addToMyGarden(plantName) {
  const plant = plants.find((p) => p.name === plantName);
  if (!myGarden.some((p) => p.name === plantName)) {
    myGarden.push(plant);
    localStorage.setItem("myGarden", JSON.stringify(myGarden));
    saveMyGardenToFirebase();
    renderMyGarden();
  }
}

function removeFromMyGarden(plantName) {
  const index = myGarden.findIndex((p) => p.name === plantName);
  if (index > -1) {
    myGarden.splice(index, 1);
    console.log("Giardino dopo la rimozione:", myGarden);
    if (myGarden.length > 0) { // Controlla se ci sono ancora piante nel giardino
      localStorage.setItem("myGarden", JSON.stringify(myGarden));
    } else {
      localStorage.removeItem("myGarden"); // Rimuovi la chiave se il giardino è vuoto
    }
    saveMyGardenToFirebase();
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
  saveMyGardenToFirebase();
  renderMyGarden();
}

function toggleMyGardenVisibility() {
    if (mioGiardinoSection.style.display === 'none') {
        mioGiardinoSection.style.display = 'block';
        giardinoTitle.style.display = 'block';
        toggleMyGardenButton.innerText = 'Nascondi il mio giardino';
    } else {
        mioGiardinoSection.style.display = 'none';
        giardinoTitle.style.display = 'none';
        toggleMyGardenButton.innerText = 'Mostra il mio giardino';
    }
}

// === FILTRI E RICERCA ===
function applyFilters() {
  let filtered = [...plants];
  const searchTerm = searchInput.value.toLowerCase();
  const searchResultDiv = document.getElementById('garden-container');

  if (searchTerm) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
      searchResultDiv.innerHTML = `<p>Nessuna pianta trovata con il nome "${searchTerm}".</p>`;
      // Rimossa la possibilità di aggiungere qui per ora, ci concentriamo sulla scomparsa del login
    } else {
      renderPlants(filtered);
    }
  } else {
    renderPlants([]); // Pulisci la visualizzazione se la ricerca è vuota
  }
}

function applyMyGardenFilters() {
  let filteredGarden = [...myGarden];

  const category = categoryFilter.value;
  const minTemp = tempMinFilter.value;
  const maxTemp = tempMaxFilter.value;

  if (category !== "all") {
    filteredGarden = filteredGarden.filter((p) => p.category === category);
  }

  if (minTemp) {
    const minTempNum = parseInt(minTemp);
    filteredGarden = filteredGarden.filter((p) => !isNaN(p.tempMin) && p.tempMin >= minTempNum);
  }

  if (maxTemp) {
    const maxTempNum = parseInt(maxTemp);
    filteredGarden = filteredGarden.filter((p) => !isNaN(p.tempMax) && p.tempMax <= maxTempNum);
  }

  renderMyGarden(filteredGarden);
}

// === EVENTI ===
searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyMyGardenFilters);
tempMinFilter.addEventListener("input", applyMyGardenFilters);
tempMaxFilter.addEventListener("input", applyMyGardenFilters);
toggleMyGardenButton.addEventListener('click', toggleMyGardenVisibility);

// Aggiungi gli event listener per i pulsanti di autenticazione
document.getElementById('registerButton').addEventListener('click', registerWithEmailPassword);
document.getElementById('loginButton').addEventListener('click', loginWithEmailPassword);
document.getElementById('logoutButton').addEventListener('click', logout);

const imageIdentifyButton = document.getElementById('identifyPlantButton');
if (imageIdentifyButton) {
  imageIdentifyButton.addEventListener('click', identifyPlantFromImage);
}

// === INIZIALIZZAZIONE ===
fetch("plants.json")
  .then((response) => response.json())
  .then((data) => {
    plants.push(...data);
    loadMyGardenFromFirebase();
  })
  .catch((error) => {
    console.error("Errore nel caricamento del database:", error);
  });

// === AUTENTICAZIONE (gestione dello stato) ===
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("Stato autenticazione cambiato, utente loggato:", user.uid, user.email);
    authStatusDiv.innerText = `Utente autenticato: ${user.email}`;
    appContentDiv.style.display = 'block';
    authContainerDiv.style.display = 'none'; // <---- Corretto: nascondi auth-container
    loadMyGardenFromFirebase();
  } else {
    console.log("Stato autenticazione cambiato, nessun utente loggato.");
    authStatusDiv.innerText = "Nessun utente autenticato.";
    appContentDiv.style.display = 'none';
    authContainerDiv.style.display = 'block'; // <---- Corretto: mostra auth-container
    myGarden = JSON.parse(localStorage.getItem("myGarden")) || []; // Ricarica da localStorage
    renderMyGarden();
  }
});
