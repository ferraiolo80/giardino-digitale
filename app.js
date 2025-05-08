import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// Configura Firebase (assicurati che i tuoi dettagli siano corretti)
const firebaseConfig = {
    apiKey: "AIzaSyAo8HU5vNNm_H-HvxeDa7xSsg3IEmdlE_4",
    authDomain: "giardinodigitale.firebaseapp.com",
    projectId: "giardinodigitale",
    storageBucket: "giardinodigitale.appspot.com",
    messagingSenderId: "96265504027",
    appId: "1:96265504027:web:903c3df92cfa24beb17fbe"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let plants = [];
let myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
let isMyGardenEmpty = myGarden.length === 0;

// Riferimenti agli elementi HTML
const gardenContainer = document.getElementById('garden-container');
const myGardenContainer = document.getElementById('my-garden');
const authContainerDiv = document.getElementById('auth-container');
const appContentDiv = document.getElementById('app-content');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutButton = document.getElementById('logoutButton');
const authStatusDiv = document.getElementById('auth-status');
const searchInput = document.getElementById('searchInput');
const addNewPlantButton = document.getElementById('addNewPlantButton');
const newPlantCard = document.getElementById('newPlantCard');
const saveNewPlantButton = document.getElementById('saveNewPlant');
const cancelNewPlantButton = document.getElementById('cancelNewPlant');
const categoryFilter = document.getElementById('categoryFilter');
const tempMinFilter = document.getElementById('tempMinFilter');
const tempMaxFilter = document.getElementById('tempMaxFilter');
const toggleMyGardenButton = document.getElementById('toggleMyGarden');
const giardinoTitle = document.getElementById('giardinoTitle');
const plantsContainerDiv = document.getElementById('garden-container');

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired."); // AGGIUNGI QUESTO LOG

    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        console.log("loginButton trovato nel DOM."); // AGGIUNGI QUESTO LOG
        loginButton.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');
            errorDiv.innerText = '';
            console.log("Tentativo di login con email:", email, "e password:", password);
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (error) {
                errorDiv.innerText = error.message;
                console.error("Errore durante il login:", error);
            }
        });
        console.log("Event listener aggiunto al loginButton."); // AGGIUNGI QUESTO LOG
    } else {
        console.error("Elemento loginButton non trovato nel DOM!");
    }

    // ... tutto il resto del tuo codice app.js (loadPlantsFromFirebase, onAuthStateChanged, ecc.) ...
    loadPlantsFromFirebase();
    updateGardenVisibility();
});

// Sposta qui le funzioni che non dipendono immediatamente dal DOM
async function renderMyGarden(garden) {
    // ... (il corpo della tua funzione renderMyGarden) ...
}

async function saveMyGardenToFirebase(garden) {
    // ... (il corpo della tua funzione saveMyGardenToFirebase) ...
}

async function addToMyGarden(plantName) {
    // ... (il corpo della tua funzione addToMyGarden) ...
}

async function removeFromMyGarden(plantIdToRemove) {
    // ... (il corpo della tua funzione removeFromMyGarden) ...
}

function createPlantCard(plantData) {
    // ... (il corpo della tua funzione createPlantCard) ...
}

async function loadMyGardenFromFirebase() {
    // ... (il corpo della tua funzione loadMyGardenFromFirebase) ...
}

async function loadPlantsFromFirebase() {
    // ... (il corpo della tua funzione loadPlantsFromFirebase) ...
}

function renderPlants(plantArray) {
    // ... (il corpo della tua funzione renderPlants) ...
}

function updateGardenVisibility() {
    // ... (il corpo della tua funzione updateGardenVisibility) ...
}

// Event listeners per registrazione e logout (dovrebbero rimanere fuori dal DOMContentLoaded se non manipolano elementi che potrebbero non essere subito presenti)
registerButton.addEventListener('click', async () => {
    // ... (il corpo del tuo event listener per registerButton) ...
});

logoutButton.addEventListener('click', async () => {
    // ... (il corpo del tuo event listener per logoutButton) ...
});

auth.onAuthStateChanged((user) => {
    // ... (il corpo della tua funzione onAuthStateChanged) ...
});

document.addEventListener('click', async (event) => {
    // ... (il corpo del tuo event listener per il click generico) ...
});

addNewPlantButton.addEventListener('click', () => {
    // ... (il corpo del tuo event listener per addNewPlantButton) ...
});

cancelNewPlantButton.addEventListener('click', () => {
    // ... (il corpo del tuo event listener per cancelNewPlantButton) ...
});

saveNewPlantButton.addEventListener('click', async () => {
    // ... (il corpo del tuo event listener per saveNewPlantButton) ...
});
// Inizializzazione al caricamento
loadPlantsFromFirebase();
updateGardenVisibility();
