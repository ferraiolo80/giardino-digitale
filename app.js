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
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
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


async function renderMyGarden(garden) {
    console.log("RENDERMYGARDEN CALLED WITH GARDEN:", garden);
    console.log("LENGTH OF GARDEN:", garden ? garden.length : 0);

    myGardenContainer.innerHTML = ''; 
    const validGarden = []; 

    for (const plantId of garden) {
        try {
            const doc = await getDoc(doc(db, 'plants', plantId));
            if (doc.exists()) {
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

    // Aggiorna il localStorage e Firebase con l'array pulito
    localStorage.setItem("myGarden", JSON.stringify(validGarden));
    await saveMyGardenToFirebase(validGarden); 

    
    updateGardenVisibility();
}

async function saveMyGardenToFirebase(garden) {
    const user = auth.currentUser;
    if (user) {
        try {
            await updateDoc(doc(db, 'gardens', user.uid), { plants: garden });
            console.log("Il 'Mio Giardino' è stato aggiornato su Firebase.");
        } catch (error) {
            console.error("Errore durante l'aggiornamento del 'Mio Giardino' su Firebase:", error);
        }
    }
}

async function addToMyGarden(plantName) {
    try {
        const plant = plants.find((p) => p.name === plantName);
        if (plant) {
            if (!myGarden.includes(plant.id)) {
                myGarden.push(plant.id);
                localStorage.setItem("myGarden", JSON.stringify(myGarden));
                await saveMyGardenToFirebase(myGarden);
                renderMyGarden(myGarden);
                isMyGardenEmpty = false;
                updateGardenVisibility();
                console.log(`Pianta '${plantName}' (ID: ${plant.id}) aggiunta al 'Mio Giardino'.`);
            } else {
                console.log(`Pianta '${plantName}' (ID: ${plant.id}) è già nel 'Mio Giardino'.`);
            }
        } else {
            console.warn(`Pianta '${plantName}' non trovata.`);
        }
    } catch (error) {
        console.error("Errore durante l'aggiunta della pianta al 'Mio Giardino':", error);
    }
}

async function removeFromMyGarden(plantIdToRemove) {
    try {
        const index = myGarden.indexOf(plantIdToRemove);
        if (index > -1) {
            myGarden.splice(index, 1);
            localStorage.setItem("myGarden", JSON.stringify(myGarden));
            await saveMyGardenToFirebase(myGarden);
            renderMyGarden(myGarden);
            isMyGardenEmpty = myGarden.length === 0;
            updateGardenVisibility();
            console.log(`Pianta con ID '${plantIdToRemove}' rimossa dal 'Mio Giardino'.`);
        } else {
            console.warn(`Pianta con ID '${plantIdToRemove}' non trovata nel 'Mio Giardino'.`);
        }
    } catch (error) {
        console.error("Errore durante la rimozione della pianta dal 'Mio Giardino':", error);
    }
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

    const removeButton = div.querySelector('.remove-button');
    removeButton.addEventListener('click', () => {
        const plantIdToRemove = removeButton.dataset.plantId;
        removeFromMyGarden(plantIdToRemove);
    });

    return div;
}

async function loadMyGardenFromFirebase() {
    let garden = [];
    try {
        const user = auth.currentUser;
        if (user) {
            const doc = await getDoc(doc(db, 'gardens', user.uid));
            if (doc.exists()) {
                garden = doc.data().plants || [];
                localStorage.setItem("myGarden", JSON.stringify(garden));
                myGarden = garden;
                isMyGardenEmpty = myGarden.length === 0;
                renderMyGarden(myGarden);
            } else {
                console.log("Nessun giardino trovato su Firebase per questo utente, caricando da localStorage.");
                garden = JSON.parse(localStorage.getItem("myGarden")) || [];
                myGarden = garden;
                isMyGardenEmpty = myGarden.length === 0;
                renderMyGarden(myGarden);
            }
        } else {
            console.log("Nessun utente autenticato, caricando il giardino da localStorage.");
            garden = JSON.parse(localStorage.getItem("myGarden")) || [];
            myGarden = garden;
            isMyGardenEmpty = myGarden.length === 0;
            renderMyGarden(myGarden);
        }
    } catch (error) {
        console.error("Errore nel caricamento del giardino da Firebase:", error);
        garden = JSON.parse(localStorage.getItem("myGarden")) || [];
        myGarden = garden;
        is
