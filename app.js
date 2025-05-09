let plants = [];
let myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
let isMyGardenEmpty = myGarden.length === 0;

// Configura Firebase (assicurati che i tuoi dettagli siano corretti)
const firebaseConfig = {
    apiKey: "AIzaSyAo8HU5vNNm_H-HvxeDa7xSsg3IEmdlE_4",
    authDomain: "giardinodigitale.firebaseapp.com",
    projectId: "giardinodigitale",
    storageBucket: "giardinodigitale.appspot.com",
    messagingSenderId: "96265504027",
    appId: "1:96265504027:web:903c3df92cfa24beb17fbe"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
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

document.addEventListener('DOMContentLoaded', async () => {
    // ... (il tuo codice all'interno di DOMContentLoaded) ...
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        console.log("loginButton trovato nel DOM.");
        loginButton.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');
            errorDiv.innerText = '';
            console.log("Tentativo di login con email:", email, "e password:", password);
            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
            } catch (error) {
                errorDiv.innerText = error.message;
                console.error("Errore durante il login:", error);
            }
        });
        console.log("Event listener aggiunto al loginButton.");
    } else {
        console.error("Elemento loginButton non trovato nel DOM!");
    }

    async function renderMyGarden(garden) {
        console.log("RENDERMYGARDEN CALLED WITH GARDEN:", garden);
        console.log("LENGTH OF GARDEN:", garden ? garden.length : 0);

        const myGardenContainer = document.getElementById('my-garden');
        myGardenContainer.innerHTML = ''; // Pulisci il contenitore
        const validGarden = []; // Nuovo array per contenere solo ID validi

        for (const plantId of garden) {
            try {
                const doc = await firebase.firestore().doc(firebase.firestore().collection('plants'), plantId).get();
                if (doc.exists) {
                    const plantData = { id: doc.id, ...doc.data() };
                    const plantCard = createPlantCard(plantData);
                    myGardenContainer.appendChild(plantCard);
                    validGarden.push(plantId); // Aggiungi l'ID valido al nuovo array
                } else {
                    console.warn(`Pianta con ID ${plantId} non trovata nel database. Rimossa dal 'Mio Giardino'.`);
                }
            } catch (error) {
                console.error("Errore nel recupero della pianta:", error);
            }
        }

        // Aggiorna il localStorage e Firebase con l'array pulito
        localStorage.setItem("myGarden", JSON.stringify(validGarden));
        await saveMyGardenToFirebase(validGarden); // Assicurati che la tua saveMyGardenToFirebase accetti 'garden'

        // Aggiorna la visibilità del "Mio giardino"
        updateGardenVisibility();
    }

    async function saveMyGardenToFirebase(garden) {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            // Ottieni un riferimento al documento "giardino" dell'utente
            const gardenRef = firebase.firestore().collection('gardens').doc(user.uid);
            // Aggiorna il documento con l'array di piante
            await gardenRef.update({ plants: garden });
            console.log("Il 'Mio Giardino' è stato aggiornato su Firebase.");
        } catch (error) {
            console.error("Errore durante l'aggiornamento del 'Mio Giardino' su Firebase:", error);
        }
    }
}

    async function addToMyGarden(plantName) {
        const plants = await loadAllPlants();  
        console.log("Piante caricate per l'aggiunta:", plants); 
        try {
            const plant = plants.find((p) => p.name === plantName);
            if (plant) {
                let myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
                if (!myGarden.includes(plant.id)) {
                    myGarden.push(plant.id);
                    localStorage.setItem("myGarden", JSON.stringify(myGarden));
                    await saveMyGardenToFirebase(myGarden);
                    await renderMyGarden(myGarden);
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
    let myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
    try {
        const index = myGarden.indexOf(plantIdToRemove);
        if (index > -1) {
            myGarden.splice(index, 1);
            localStorage.setItem("myGarden", JSON.stringify(myGarden));
            await saveMyGardenToFirebase(myGarden);
            await renderMyGarden(myGarden);
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
        const user = firebase.auth().currentUser;
        if (user) {
            // Ottieni un riferimento al documento "giardino" dell'utente
            const gardenRef = firebase.firestore().collection('gardens').doc(user.uid);
            const doc = await gardenRef.get();
            if (doc.exists) {
                garden = doc.data().plants || [];
                localStorage.setItem("myGarden", JSON.stringify(garden));
                myGarden = garden;
                isMyGardenEmpty = myGarden.length === 0;
                await renderMyGarden(myGarden);
            } else {
                console.log("Nessun giardino trovato su Firebase per questo utente, caricando da localStorage.");
                garden = JSON.parse(localStorage.getItem("myGarden")) || [];
                myGarden = garden;
                isMyGardenEmpty = myGarden.length === 0;
                await renderMyGarden(myGarden);
            }
        } else {
            console.log("Nessun utente autenticato, caricando il giardino da localStorage.");
            garden = JSON.parse(localStorage.getItem("myGarden")) || [];
            myGarden = garden;
            isMyGardenEmpty = myGarden.length === 0;
            await renderMyGarden(myGarden);
        }
    } catch (error) {
        console.error("Errore nel caricamento del giardino da Firebase:", error);
        garden = JSON.parse(localStorage.getItem("myGarden")) || [];
        myGarden = garden;
        isMyGardenEmpty = myGarden.length === 0;
        await renderMyGarden(myGarden);
    } finally {
        updateGardenVisibility();
    }
}
    async function loadAllPlants() {
        try {
            const querySnapshot = await firebase.firestore().collection('plants').get();
            const plants = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                plants.push({
                    id: doc.id,
                    name: data.name,
                    sunlight: data.sunlight,
                    watering: data.watering,
                    tempMin: data.tempMin,
                    tempMax: data.tempMax,
                    image: data.image || 'plant_9215709.png'
                });
            });
            console.log('Piante caricate da Firebase:', plants);
            return plants;
        } catch (error) {
            console.error("Errore nel caricamento delle piante da Firebase:", error);
            return [];
        }
    }

    async function loadPlantsFromFirebase() {
        const plantsArray = await loadAllPlants();
        renderPlants(plantsArray);
    }

    function renderPlants(plantArray) {
        console.log('Array plant ricevuto da renderPlants:', plantArray);
        const gardenContainer = document.getElementById('garden-container');
        gardenContainer.innerHTML = "";
        plantArray.forEach((plant) => {
            const image = plant.image || 'plant_9215709.png';
            const div = document.createElement("div");
            div.className = "plant-card";
            div.innerHTML = `
                <img src="<span class="math-inline">\{image\}" alt\="</span>{plant.name}" class="plant-icon">
                <h4>${plant.name}</h4>
                <p>Luce: ${plant.sunlight}</p>
                <p>Acqua: ${plant.watering}</p>
                <p>Temperatura ideale min: ${plant.tempMin}°C</p>
                <p>Temperatura ideale max: <span class="math-inline">\{plant\.tempMax\}°C</p\>
<button class\="add\-to\-garden\-button" data\-plant\-name\="</span>{plant.name}">Aggiungi al mio giardino</button>
            `;
            gardenContainer.appendChild(div);
        });
        updateGardenVisibility();
    }

    function updateGardenVisibility() {
        const plantsContainerDiv = document.getElementById('garden-container');
        const mioGiardinoSection = document.getElementById('my-garden');
        const giardinoTitle = document.getElementById('giardinoTitle');
        const myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
        const isMyGardenEmpty = myGarden.length === 0;

        if (isMyGardenEmpty) {
            if (plantsContainerDiv) plantsContainerDiv.style.display = 'grid';
            if (mioGiardinoSection) mioGiardinoSection.style.display = 'none';
            if (giardinoTitle) giardinoTitle.style.display = 'none';
        } else {
            if (plantsContainerDiv) plantsContainerDiv.style.display = 'none';
            if (mioGiardinoSection) mioGiardinoSection.style.display = 'block';
            if (giardinoTitle) giardinoTitle.style.display = 'block';
        }
    }

    const registerButton = document.getElementById('registerButton');
    if (registerButton) {
        registerButton.addEventListener('click', async () => {
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const errorDiv = document.getElementById('register-error');
            errorDiv.innerText = '';
            try {
                await firebase.auth().createUserWithEmailAndPassword(email, password);
            } catch (error) {
                errorDiv.innerText = error.message;
            }
        });
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await firebase.auth().signOut();
            } catch (error) {
                console.error("Errore durante il logout:", error);
            }
        });
    }

    firebase.auth().onAuthStateChanged(async (user) => {
        const authStatusDiv = document.getElementById('auth-status');
        const appContentDiv = document.getElementById('app-content');
        const authContainerDiv = document.getElementById('auth-container');

        if (user) {
            console.log("Stato autenticazione cambiato, utente loggato:", user.uid, user.email);
            authStatusDiv.innerText = `Utente autenticato: ${user.email}`;
            appContentDiv.style.display = 'block';
            authContainerDiv.style.display = 'none';
            await loadMyGardenFromFirebase();
        } else {
            console.log("Stato autenticazione cambiato, nessun utente loggato.");
            authStatusDiv.innerText = "Nessun utente autenticato.";
            appContentDiv.style.display = 'none';
            authContainerDiv.style.display = 'block';
            const myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
            isMyGardenEmpty = myGarden.length === 0;
            await renderMyGarden(myGarden);
        }
    });

    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-to-garden-button')) {
            const plantName = event.target.dataset.plantName;
            await addToMyGarden(plantName);
        }
    });

    const addNewPlantButton = document.getElementById('addNewPlantButton');
    if (addNewPlantButton) {
        addNewPlantButton.addEventListener('click', () => {
            const newPlantCard = document.getElementById('newPlantCard');
            if (newPlantCard) {
                newPlantCard.style.display = 'block';
            }
        });
    }

    const cancelNewPlantButton = document.getElementById('cancelNewPlant');
    if (cancelNewPlantButton) {
        cancelNewPlantButton.addEventListener('click', () => {
            const newPlantCard = document.getElementById('newPlantCard');
            if (newPlantCard) {
                newPlantCard.style.display = 'none';
            }
        });
    }

    const saveNewPlantButton = document.getElementById('saveNewPlant');
    if (saveNewPlantButton) {
        saveNewPlantButton.addEventListener('click', async () => {
            const newPlantName = document.getElementById('newPlantName').value;
            const newPlantSunlight = document.getElementById('newPlantSunlight').value;
            const newPlantWatering = document.getElementById('newPlantWatering').value;
            const newPlantTempMin = document.getElementById('newPlantTempMin').value;
            const newPlantTempMax = document.getElementById('newPlantTempMax').value;
            const newPlantDescription = document.getElementById('newPlantDescription').value;
            const newPlantCategory = document.getElementById('newPlantCategory').value;
            const newPlantImageURL = document.getElementById('newPlantImageURL').value;

            if (newPlantName && newPlantSunlight && newPlantWatering && newPlantTempMin && newPlantTempMax) {
                try {
                    const docRef = await firebase.firestore().collection('plants').add({
                        name: newPlantName,
                        sunlight: newPlantSunlight,
                        watering: newPlantWatering,
                        tempMin: parseInt(newPlantTempMin),
                        tempMax: parseInt(newPlantTempMax),
                        description: newPlantDescription,
                        category: newPlantCategory,
                        image: newPlantImageURL
                    });
                    console.log("Nuova pianta aggiunta con ID: ", docRef.id);
                    const newPlantCard = document.getElementById('newPlantCard');
                    if (newPlantCard) {
                        newPlantCard.style.display = 'none';
                    }
                    await loadPlantsFromFirebase(); // Ricarica le piante per visualizzare la nuova
                } catch (error) {
                    console.error("Errore nell'aggiunta della nuova pianta:", error);
                }
            } else {
                alert("Per favore, compila tutti i campi obbligatori.");
            }
        });
    }

    const toggleMyGardenButton = document.getElementById('toggleMyGarden');
    if (toggleMyGardenButton) {
        toggleMyGardenButton.addEventListener('click', () => {
            const mioGiardinoSection = document.getElementById('my-garden');
            const giardinoTitle = document.getElementById('giardinoTitle');
            const eyeIcon = toggleMyGardenButton.querySelector('i');
            if (mioGiardinoSection.style.display === 'none') {
                mioGiardinoSection.style.display = 'block';
                giardinoTitle.style.display = 'block';
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
                toggleMyGardenButton.innerText = 'Nascondi il mio giardino';
            } else {
                mioGiardinoSection.style.display = 'none';
                giardinoTitle.style.display = 'none';
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
                toggleMyGardenButton.innerText = 'Mostra il mio giardino';
            }
        });
    }

    await loadPlantsFromFirebase();
    updateGardenVisibility();
});
