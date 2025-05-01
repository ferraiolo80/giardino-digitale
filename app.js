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
            console.log("Risultato identificazione:", plantData);
            if (plantData && plantData.results && plantData.results.length > 0 && plantData.results[0].species) {
                const bestMatch = plantData.results[0].species.name;
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

function displayPlantDetails(plant) {
  const plantDetailsDiv = document.getElementById('plant-details');
  plantDetailsDiv.innerHTML = `
    <h3>${plant.name}</h3>
    <p>Probabilità: ${plant.probability}</p>
    <label for="sunlight">Luce:</label>
    <input type="text" id="sunlight" value="${plant.sunlight}"><br>
    <label for="watering">Acqua:</label>
    <input type="text" id="watering" value="${plant.watering}"><br>
    <label for="tempMin">Temperatura Minima:</label>
    <input type="number" id="tempMin" value="${plant.tempMin}"><br>
    <label for="tempMax">Temperatura Massima:</label>
    <input type="number" id="tempMax" value="${plant.tempMax}"><br>
    <label for="category">Categoria:</label>
    <select id="category">
      <option value="Fiore">Fiore</option>
      <option value="Erba aromatica">Erba aromatica</option>
      <option value="Succulenta">Succulenta</option>
      <option value="Arbusto">Arbusto</option>
      <option value="Albero">Albero</option>
    </select><br>
    <button id="savePlantButton">Salva pianta</button>
  `;

  document.getElementById('savePlantButton').addEventListener('click', () => {
    const updatedPlant = {
      ...plant,
      sunlight: document.getElementById('sunlight').value,
      watering: document.getElementById('watering').value,
      tempMin: Number(document.getElementById('tempMin').value),
      tempMax: Number(document.getElementById('tempMax').value),
      category: document.getElementById('category').value,
    };
    savePlantToFirebase(updatedPlant);
  });
}

async function savePlantToFirebase(newPlant) {
  try {
    await db.collection('plants').add(newPlant); // Aggiungi alla collezione 'plants'
    console.log('Pianta salvata con successo su Firebase:', newPlant);
    document.getElementById('image-search-result').innerHTML = '<p>Pianta salvata con successo!</p>'; // Feedback all'utente
    document.getElementById('plant-details').innerHTML = ''; // Pulisci i dettagli della pianta
    // Puoi anche pulire il form di caricamento dell'immagine se lo desideri
  } catch (error) {
    console.error('Errore nel salvataggio della pianta su Firebase:', error);
    document.getElementById('image-search-result').innerHTML = '<p>Errore nel salvataggio della pianta.</p>'; // Feedback all'utente
    // Gestisci l'errore (ad esempio, mostra un messaggio più dettagliato)
  }
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
      ${plant.description ? `<p><strong>Descrizione:</strong> ${plant.description}</p>` : ""}
      ${plant.image ? `<img src="${plant.image}" alt="${plant.name}" width="100">` : ""}
      <button class="add-to-garden-button" data-plant-name="${plant.name}">Aggiungi al mio giardino</button>
    `;

    gardenContainer.appendChild(plantCard);

    // Aggiungi l'event listener al bottone dopo che è stato creato
    const addButton = plantCard.querySelector('.add-to-garden-button');
    addButton.addEventListener('click', () => {
      const plantNameToAdd = addButton.dataset.plantName;
      addToMyGarden(plantNameToAdd);
    });
  });
}

async function renderMyGarden(gardenArray) {
  const gardenIds = gardenArray || myGarden; // Ora 'myGarden' contiene solo ID
  if (!myGardenContainer) return;
  myGardenContainer.innerHTML = "";

  for (const plantId of gardenIds) {
    try {
      const doc = await db.collection('plants').doc(plantId).get();
      if (doc.exists) {
        const plantData = { id: doc.id, ...doc.data() };
        const div = document.createElement("div");
        div.className = "my-plant-card";
        div.innerHTML = `
          <h4>${plantData.name}</h4>
          <p>Luce: ${plantData.sunlight}</p>
          <p>Acqua: ${plantData.watering}</p>
          <p>Temperatura ideale min: ${plantData.tempMin}°C</p>
          <p>Temperatura ideale max: ${plantData.tempMax}°C</p>
          <button class="remove-button" data-plant-id="${plantData.id}">Rimuovi</button>
          <button onclick="updatePlant('${plantData.name}')">Aggiorna info</button>
        `;
        myGardenContainer.appendChild(div);

        // Aggiungi event listener al pulsante "Rimuovi" (ora usa l'ID)
        const removeButton = div.querySelector('.remove-button');
        removeButton.addEventListener('click', () => {
          const plantIdToRemove = removeButton.dataset.plantId;
          removeFromMyGarden(plantIdToRemove); // Assicurati che anche questa funzione usi gli ID
        });
      } else {
        console.warn(`Pianta con ID ${plantId} non trovata nel database.`);
        // Potresti voler rimuovere l'ID non valido da myGarden qui
      }
    } catch (error) {
      console.error("Errore nel caricamento della pianta dal giardino:", error);
    }
  }
  // Aggiorna la visibilità del "Mio giardino" se necessario
  mioGiardinoSection.style.display = myGarden.length > 0 ? 'block' : 'none';
  giardinoTitle.style.display = myGarden.length > 0 ? 'block' : 'none';
}
// === FUNZIONI PRINCIPALI ===
async function addToMyGarden(plantName) {
  const plant = plants.find((p) => p.name === plantName); // Ottieni la pianta dall'array locale (per avere l'ID)

  if (plant) { // Verifica che la pianta sia stata trovata
    if (!myGarden.includes(plant.id)) { // Controlla se l'ID è già nel giardino
      myGarden.push(plant.id); // Aggiungi l'ID, non l'intera pianta
      localStorage.setItem("myGarden", JSON.stringify(myGarden));
      await saveMyGardenToFirebase(); // Assicurati che questa funzione sia async
      renderMyGarden(); // Assicurati che questa funzione gestisca gli ID
    }
  }
}

async function removeFromMyGarden(plantIdToRemove) {
  const index = myGarden.indexOf(plantIdToRemove); // Trova l'indice dell'ID
  if (index > -1) {
    myGarden.splice(index, 1);
    console.log("Giardino dopo la rimozione (ID):", myGarden);
    if (myGarden.length > 0) {
      localStorage.setItem("myGarden", JSON.stringify(myGarden));
    } else {
      localStorage.removeItem("myGarden");
    }
    await saveMyGardenToFirebase(); // Assicurati che sia async se la chiami con await
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
async function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const searchResultDiv = document.getElementById('garden-container');

  if (searchTerm) {
    try {
      // Esegui una query a Firebase sulla collezione 'plants'
      const querySnapshot = await db
        .collection('plants')
        .where('name', '>=', searchTerm) // Trova nomi che iniziano con searchTerm
        .where('name', '<=', searchTerm + '\uf8ff') // \uf8ff è un carattere Unicode alto che aiuta a fare una ricerca per prefisso
        .get();

      const filteredPlantsFromFirebase = [];
      querySnapshot.forEach((doc) => {
        filteredPlantsFromFirebase.push({ id: doc.id, ...doc.data() });
      });

      if (filteredPlantsFromFirebase.length === 0) {
        searchResultDiv.innerHTML = `<p>Nessuna pianta trovata con il nome "${searchTerm}".</p>`;
      } else {
        renderPlants(filteredPlantsFromFirebase); // Usa i risultati di Firebase
      }
    } catch (error) {
      console.error("Errore durante la ricerca di piante:", error);
      searchResultDiv.innerHTML = `<p>Errore durante la ricerca.</p>`;
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
// fetch("plants.json")
  async function loadPlantsFromFirebase() {
  try {
    const snapshot = await db.collection("plants").get();
    snapshot.forEach((doc) => {
      plants.push({ id: doc.id, ...doc.data() });
    });
    loadMyGardenFromFirebase();
    renderPlants(plants);
  } catch (error) {
    console.error("Errore nel caricamento delle piante da Firebase:", error);
  }
}

loadPlantsFromFirebase();  // Aggiungi la riga QUI

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
