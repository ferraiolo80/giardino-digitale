import { identifyPlant } from './plantid.js';

// === VARIABILI GLOBALI ===
const plants = [];
let myGarden = JSON.parse(localStorage.getItem("myGarden")) || []; //sospeso temporaneamente per prova
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
const auth = firebase.auth();

console.log("SCRIPT APP.JS CARICATO - INIZIO");

if (localStorage.getItem('myGarden')) {
  console.log("MYGARDEN DA LOCALSTORAGE ALL'AVVIO:", JSON.parse(localStorage.getItem('myGarden')));
} else {
  console.log("NESSUN MYGARDEN NEL LOCALSTORAGE ALL'AVVIO");
}
// E COMMENTA TEMPORANEAMENTE LA CHIAMATA A renderMyGarden() FUORI DAL LISTENER onAuthStateChanged PER UTENTI NON LOGGATI...
/*
  myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
  renderMyGarden();
*/

// === FUNZIONI FIREBASE ===
async function loadPlantsFromFirebase() {
  try {
    const snapshot = await db.collection("plants").get();
    plants.length = 0;
    snapshot.forEach((doc) => {
      plants.push({ id: doc.id, ...doc.data() });
    });
    console.log('Dati caricati da Firebase (array plants):', plants);
    //loadMyGardenFromFirebase(); // <-- RIMOSSA CHIAMATA INASPETTATA
    renderPlants(plants);
  } catch (error) {
    console.error("Errore nel caricamento delle piante da Firebase:", error);
  }
}

async function loadMyGardenFromFirebase() {
  console.log("loadMyGardenFromFirebase CALLED");
  console.log("loadMyGardenFromFirebase - myGarden BEFORE:", JSON.stringify(myGarden));
  try {
    const user = firebase.auth().currentUser;
    if (user) {
      const doc = await db.collection("gardens").doc(user.uid).get();
      if (doc.exists) {
        myGarden = doc.data().plants || [];
        localStorage.setItem("myGarden", JSON.stringify(myGarden)); // Aggiorna anche il localStorage
        renderMyGarden(myGarden);
        console.log("loadMyGardenFromFirebase - renderMyGarden CALLED. myGarden:", JSON.stringify(myGarden));
      } else {
        console.log("Nessun giardino trovato su Firebase per questo utente, caricando da localStorage.");
        renderMyGarden(myGarden); // Carica comunque da localStorage se non c'è nulla su Firebase
        console.log("loadMyGardenFromFirebase - renderMyGarden CALLED. myGarden:", JSON.stringify(myGarden));
      }
    } else {
      console.log("Nessun utente autenticato, caricando il giardino da localStorage.");
      renderMyGarden(myGarden); // Carica da localStorage se non c'è utente
      console.log("loadMyGardenFromFirebase - renderMyGarden CALLED. myGarden:", JSON.stringify(myGarden));
    }
  } catch (error) {
    console.error("Errore nel caricamento del giardino da Firebase:", error);
    renderMyGarden(myGarden); // In caso di errore, prova a caricare da localStorage
    console.log("loadMyGardenFromFirebase - renderMyGarden CALLED. myGarden:", JSON.stringify(myGarden));
  }
  console.log("loadMyGardenFromFirebase - myGarden AFTER:", JSON.stringify(myGarden));
}

async function saveMyGardenToFirebase(garden) {
  try {
    const user = firebase.auth().currentUser;
    if (user) {
      await db.collection("gardens").doc(user.uid).set({ plants: garden });
      console.log("Il 'Mio Giardino' è stato aggiornato su Firebase.");
    } else {
      console.warn("Nessun utente autenticato. Impossibile salvare il giardino su Firebase.");
    }
  } catch (error) {
    console.error("Errore nel salvataggio del giardino su Firebase:", error);
  }
}

async function addToMyGarden(plantName) {
  console.log("addToMyGarden CALLED. plantName:", plantName);
  console.log("addToMyGarden - myGarden BEFORE:", JSON.stringify(myGarden));
  try {
    const newPlantId = plants.find(plant => plant.name === plantName).id;

    // Verifica se la pianta è già presente
    if (!myGarden.includes(newPlantId)) {
      myGarden.push(newPlantId);
      localStorage.setItem("myGarden", JSON.stringify(myGarden));
      await saveMyGardenToFirebase(myGarden); // Salva l'aggiornamento di 'myGarden' su Firebase
    }

    // Rendi immediatamente il 'Mio giardino' per mostrare la nuova pianta
    renderMyGarden(myGarden);
    console.log("addToMyGarden - renderMyGarden CALLED. myGarden:", JSON.stringify(myGarden));

  } catch (error) {
    console.error('Errore durante l\'aggiunta della nuova pianta a Firebase:', error);
    alert('Si è verificato un errore durante il salvataggio della pianta.');
  }
  console.log("addToMyGarden - myGarden AFTER:", JSON.stringify(myGarden));
}

async function removeFromMyGarden(plantIdToRemove) {
  console.log("removeFromMyGarden CALLED. plantIdToRemove:", plantIdToRemove);
  console.log("removeFromMyGarden - myGarden BEFORE:", JSON.stringify(myGarden));
  try {
    myGarden = myGarden.filter(id => id !== plantIdToRemove);
    localStorage.setItem("myGarden", JSON.stringify(myGarden));
    await saveMyGardenToFirebase(myGarden);
    renderMyGarden(myGarden);
    console.log("removeFromMyGarden - renderMyGarden CALLED. myGarden:", JSON.stringify(myGarden));
  } catch (error) {
    console.error("Errore durante la rimozione della pianta dal giardino:", error);
  }
  console.log("removeFromMyGarden - myGarden AFTER:", JSON.stringify(myGarden));
}

async function renderMyGarden(garden) {
  console.log("renderMyGarden CALLED. garden:", JSON.stringify(garden));
  console.log("renderMyGarden - garden.length:", garden ? garden.length : 0);
  const myGardenContainer = document.getElementById('my-garden');
  myGardenContainer.innerHTML = ''; // Pulisci il contenitore
  const validGarden = []; // Nuovo array per contenere solo ID validi

  for (const plantId of garden) {
    try {
      const doc = await db.collection('plants').doc(plantId).get();
      if (doc.exists) {
        const plantData = { id: doc.id, ...doc.data() }; // Ottieni anche l'ID
        const plantCard = createPlantCard(plantData); // Chiama la funzione (definita altrove)
        myGardenContainer.appendChild(plantCard);
        validGarden.push(plantId); // Aggiungi l'ID valido al nuovo array
      } else {
        console.warn(`Pianta con ID ${plantId} non trovata nel database. Rimossa dal 'Mio Giardino'.`);
        // Non aggiungiamo l'ID non valido al validGarden
      }
    } catch (error) {
      console.error("Errore nel recupero della pianta:", error);
    }
  }

  // Aggiorna il localStorage e Firebase con l'array pulito
  localStorage.setItem("myGarden", JSON.stringify(validGarden));
  await saveMyGardenToFirebase(validGarden); // Assicurati che la tua saveMyGardenToFirebase accetti 'garden'
}

function createPlantCard(plantData) {
  console.log("createPlantCard CALLED. Plant:", plantData.name, plantData.id);
  const div = document.createElement("div");
  div.className = "my-plant-card";
  div.innerHTML = `
    <h4>${plantData.name}</h4>
    <p>Luce: ${plantData.sunlight}</p>
    <p>Acqua: ${plantData.watering}</p>
    <p>Temperatura ideale min: ${plantData.tempMin}°C</p>
    <p>Temperatura ideale max: <span class="math-inline">\{plantData\.tempMax\}°C</p\>
<button class\="remove\-button" data\-plant\-id\="</span>{plantData.id}">Rimuovi</button>
    <button onclick="updatePlant('${plantData.name}')">Aggiorna info</button>
  `;

  // Aggiungi event listener al pulsante "Rimuovi" (ora usa l'ID)
  const removeButton = div.querySelector('.remove-button');
  removeButton.addEventListener('click', () => {
    const plantIdToRemove = removeButton.dataset.plantId;
    removeFromMyGarden(plantIdToRemove); // Assicurati che anche questa funzione usi gli ID
  });

  return div;
}

function renderPlants(plantArray) {
  console.log('Array plant ricevuto da renderPlants:', plantArray);
  gardenContainer.innerHTML = "";
  plantArray.forEach((plant) => {
    const div = document.createElement("div");
    div.className = "plant-card";
    div.innerHTML = `
      <img src="<span class="math-inline">\{plant\.imageUrl\}" alt\="</span>{plant.name}">
      <h4>${plant.name}</h4>
      <p>Luce: ${plant.sunlight}</p>
      <p>Acqua: ${plant.watering}</p>
      <p>Temperatura ideale min: ${plant.tempMin}°C</p>
      <p>Temperatura ideale max: <span class="math-inline">\{plant\.tempMax\}°C</p\>
<button onclick\="addToMyGarden\('</span>{plant.name}')">Aggiungi al mio giardino</button>
    `;
    gardenContainer.appendChild(div);
  });
}

function resetNewPlantForm() {
  document.getElementById('newPlantName').value = '';
  document.getElementById('newPlantSunlight').value = '';
  document.getElementById('newPlantWatering').value = '';
  document.getElementById('newPlantTempMin').value = '';
  document.getElementById('newPlantTempMax').value = '';
  document.getElementById('newPlantDescription').value = '';
  document.getElementById('newPlantCategory').value = 'Fiore';
}

async function saveNewPlantToFirebase() {
  console.log("saveNewPlantToFirebase CALLED");
  console.log("saveNewPlantToFirebase - myGarden BEFORE:", JSON.stringify(myGarden));
  const name = document.getElementById('newPlantName').value;
  const sunlight = document.getElementById('newPlantSunlight').value;
  const watering = document.getElementById('newPlantWatering').value;
  const tempMin = document.getElementById('newPlantTempMin').value;
  const tempMax = document.getElementById('newPlantTempMax').value;
  const description = document.getElementById('newPlantDescription').value;
  const category = document.getElementById('newPlantCategory').value;
  const imageUrl = document.getElementById('newImageUrl').value; // Aggiunto per l'URL dell'immagine

  if (name && sunlight && watering && tempMin && tempMax && description && category) {
    try {
      await db.collection('plants').add({
        name,
        sunlight,
        watering,
        tempMin,
        tempMax,
        description,
        category,
        imageUrl // Aggiunto per l'URL dell'immagine
      });
      alert('Pianta aggiunta con successo!');
      newPlantCard.style.display = 'none'; // Nascondi la card dopo il salvataggio
      resetNewPlantForm();
      loadPlantsFromFirebase(); // Ricarica le piante per aggiornare la visualizzazione
    } catch (error) {
      console.error('Errore durante il salvataggio della nuova pianta:', error);
      alert('Si è verificato un errore durante il salvataggio della pianta.');
    }
  } else {
    alert('Per favore, compila tutti i campi.');
  }
  console.log("saveNewPlantToFirebase - myGarden AFTER:", JSON.stringify(myGarden));
}

function updatePlant(plantName) {
  const newSunlight = prompt(`Inserisci la nuova quantità di luce per ${plantName}:`);
  const newWatering = prompt(`Inserisci la nuova frequenza di irrigazione per ${plantName}:`);
  const newTempMin = prompt(`Inserisci la nuova temperatura minima per ${plantName}:`);
  const newTempMax = prompt(`Inserisci la nuova temperatura massima per ${plantName}:`);
  const newDescription = prompt(`Inserisci la nuova descrizione per ${plantName}:`);
  const newCategory = prompt(`Inserisci la nuova categoria per ${plantName}:`);

  if (newSunlight && newWatering && newTempMin && newTempMax && newDescription && newCategory) {
    db.collection('plants').where('name', '==', plantName).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          db.collection('plants').doc(doc.id).update({
            sunlight: newSunlight,
            watering: newWatering,
            tempMin: newTempMin,
            tempMax: newTempMax,
            description: newDescription,
            category: newCategory
          })
            .then(() => {
              alert(`${plantName} è stato aggiornato con successo!`);
              loadPlantsFromFirebase(); // Ricarica le piante per aggiornare la visualizzazione
              renderMyGarden(myGarden);
            })
            .catch(error => {
              console.error("Errore durante l'aggiornamento della pianta:", error);
              alert("Si è verificato un errore durante l'aggiornamento della pianta.");
            });
        });
      })
      .catch(error => {
        console.error("Errore durante la ricerca della pianta:", error);
        alert("Si è verificato un errore durante la ricerca della pianta.");
      });
  }
}

// === LISTENER PER L'AUTENTICAZIONE ===
firebase.auth().onAuthStateChanged((user) => {
  console.log("onAuthStateChanged CALLED. User:", user ? user.uid : null);
  console.log("onAuthStateChanged - myGarden BEFORE:", JSON.stringify(myGarden));
  if (user) {
    console.log("Stato autenticazione cambiato, utente loggato:", user.uid, user.email);
    authStatusDiv.innerText = `Utente autenticato: ${user.email}`;
    appContentDiv.style.display = 'block';
    authContainerDiv.style.display = 'none';
    loadMyGardenFromFirebase(); // Sposta la chiamata qui
    console.log("onAuthStateChanged - renderMyGarden CALLED. myGarden:", JSON.stringify(myGarden));
  } else {
    console.log("Stato autenticazione cambiato, nessun utente loggato.");
    authStatusDiv.innerText = "Nessun utente autenticato.";
    appContentDiv.style.display = 'none';
    authContainerDiv.style.display = 'block';
    // SPOSTEREMO LA LOGICA DI CARICAMENTO DA LOCALSTORAGE QUI SOTTO, DENTRO IL DOMContentLoaded
    console.log("onAuthStateChanged - renderMyGarden CALLED. myGarden:", JSON.stringify(myGarden));
  }
  console.log("onAuthStateChanged - myGarden AFTER:", JSON.stringify(myGarden));
});

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded CALLED");
  console.log("DOMContentLoaded - myGarden BEFORE:", JSON.stringify(myGarden));
  const addNewPlantButton = document.getElementById('addNewPlantButton');
  const newPlantCard = document.getElementById('newPlantCard');
  const saveNewPlantButton = document.getElementById('saveNewPlant');
  const cancelNewPlantButton = document.getElementById('cancelNewPlant');

  // Sposta qui la logica per utenti non loggati
  if (!firebase.auth().currentUser) {
    myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
    renderMyGarden(myGarden);
    console.log("DOMContentLoaded - renderMyGarden CALLED. myGarden:", JSON.stringify(myGarden));
  }

  if (addNewPlantButton) {
    addNewPlantButton.addEventListener('click', () => {
      newPlantCard.style.display = 'block'; // Rendi visibile la card
    });
  }

  if (cancelNewPlantButton) {
    cancelNewPlantButton.addEventListener('click', () => {
      newPlantCard.style.display = 'none'; // Nascondi la card
      resetNewPlantForm(); // Pulisci il form (funzione da definire
