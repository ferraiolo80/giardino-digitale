import { identifyPlant } from './plantid.js';

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
const auth = firebase.auth();

console.log("SCRIPT APP.JS CARICATO");

async function renderMyGarden(garden) {
    console.log("RENDERMYGARDEN CALLED WITH GARDEN:", garden);
    console.log("LENGTH OF GARDEN:", garden ? garden.length : 0);

    const myGardenContainer = document.getElementById('my-garden');
    myGardenContainer.innerHTML = ''; 
    const validGarden = []; 

    for (const plantId of garden) {
        try {
            const doc = await db.collection('plants').doc(plantId).get();
            if (doc.exists) {
                const plantData = { id: doc.id, ...doc.data() };
                const plantCard = createPlantCard(plantData);
                myGardenContainer.appendChild(plantCard);
                validGarden.push(plantId); 
            } else {
                console.warn(`Pianta con ID ${plantId} non trovata nel database. Rimossa dal 'Mio Giardino'.`);
            }
        } catch (error) {
            console.error("Errore nel recupero della pianta:", error);
        }
    }

    
    localStorage.setItem("myGarden", JSON.stringify(validGarden));
    await saveMyGardenToFirebase(validGarden); 

    
    mioGiardinoSection.style.display = validGarden.length > 0 ? 'block' : 'none';
    giardinoTitle.style.display = validGarden.length > 0 ? 'block' : 'none';
}

async function saveMyGardenToFirebase(garden) { 
    const user = auth.currentUser;
    if (user) {
        try {
            await db.collection('gardens').doc(user.uid).update({ plants: garden });
            console.log("Il 'Mio Giardino' è stato aggiornato su Firebase.");
        } catch (error) {
            console.error("Errore durante l'aggiornamento del 'Mio Giardino' su Firebase:", error);
        }
    }
}

firebase.auth().onAuthStateChanged((user) => {
    console.log("onAuthStateChanged CALLED. User:", user ? user.uid : null);
    if (user) {
        console.log("Stato autenticazione cambiato, utente loggato:", user.uid, user.email);
        authStatusDiv.innerText = `Utente autenticato: ${user.email}`;
        appContentDiv.style.display = 'block';
        authContainerDiv.style.display = 'none';
        loadMyGardenFromFirebase(); 
    } else {
        console.log("Stato autenticazione cambiato, nessun utente loggato.");
        authStatusDiv.innerText = "Nessun utente autenticato.";
        appContentDiv.style.display = 'none';
        authContainerDiv.style.display = 'block';
        loadMyGardenFromFirebase(); 
    }
});

async function loadMyGardenFromFirebase() {
    console.log("loadMyGardenFromFirebase CALLED");
    try {
        const user = firebase.auth().currentUser;
        if (user) {
            const doc = await db.collection("gardens").doc(user.uid).get();
            if (doc.exists) {
                myGarden = doc.data().plants || [];
                localStorage.setItem("myGarden", JSON.stringify(myGarden));
                console.log("loadMyGardenFromFirebase - Giardino caricato da Firebase per l'utente:", user.uid);
            } else {
                console.log("loadMyGardenFromFirebase - Nessun giardino trovato su Firebase per questo utente.");
                myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
            }
        } else {
            console.log("loadMyGardenFromFirebase - Nessun utente autenticato.");
            myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
        }
    } catch (error) {
        console.error("loadMyGardenFromFirebase - Errore nel caricamento del giardino:", error);
        myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
    }
    console.log("loadMyGardenFromFirebase - myGarden:", JSON.stringify(myGarden));
}

async function loadPlantsFromFirebase() {
    try {
        const snapshot = await db.collection("plants").get();
        plants.length = 0;
        snapshot.forEach((doc) => {
            plants.push({ id: doc.id, ...doc.data() });
        });
        console.log('Dati caricati da Firebase (array plants):', plants);
        renderPlants(plants);
    } catch (error) {
        console.error("Errore nel caricamento delle piante da Firebase:", error);
    }
}

function renderPlants(plantArray) {
    console.log('Array plant ricevuto da renderPlants:', plantArray);
    gardenContainer.innerHTML = "";
    plantArray.forEach((plant) => {
        const image = plant.image || 'plant_9215709.png'; 
        const div = document.createElement("div");
        div.className = "plant-card";
        div.innerHTML = `
            <img src="${image}" alt="${plant.name}" class="plant-icon"> <h4>${plant.name}</h4>
            <p>Luce: ${plant.sunlight}</p>
            <p>Acqua: ${plant.watering}</p>
            <p>Temperatura ideale min: ${plant.tempMin}°C</p>
            <p>Temperatura ideale max: ${plant.tempMax}°C</p>
            <button onclick="addToMyGarden('${plant.name}')">Aggiungi al mio giardino</button>
        `;
        gardenContainer.appendChild(div);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded CALLED");
    loadPlantsFromFirebase(); 
});
