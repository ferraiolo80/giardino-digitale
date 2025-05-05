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
const auth = firebase.auth();

console.log("SCRIPT APP.JS CARICATO");

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
