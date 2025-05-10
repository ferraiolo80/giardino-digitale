let plants = [];
let allPlants = [];
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

    let safeGarden = [];
    if (Array.isArray(garden)) {
        safeGarden = garden;
    } else {
        console.warn("Valore non valido ricevuto per 'garden'. Inizializzato come array vuoto.");
        safeGarden = [];
        localStorage.setItem("myGarden", JSON.stringify([]));
        await saveMyGardenToFirebase([]);
    }

    const myGardenContainer = document.getElementById('my-garden');
    const emptyGardenMessage = document.getElementById('empty-garden-message');
    myGardenContainer.innerHTML = ''; // Svuota il contenitore PRIMA

    if (safeGarden.length === 0) {
        if (emptyGardenMessage) {
            myGardenContainer.appendChild(emptyGardenMessage); // Appendi il messaggio AL CONTENITORE
            emptyGardenMessage.style.display = 'block'; // Assicurati che sia visibile
        } else {
            myGardenContainer.innerHTML = '<p id="empty-garden-message">Il tuo giardino è vuoto. Aggiungi delle piante!</p>'; // Crea e appendi se non esiste
        }
    } else {
        if (emptyGardenMessage) {
            emptyGardenMessage.style.display = 'none';
        }
        for (const plantId of safeGarden) {
            // ... (il resto del codice per renderizzare le piante) ...
        }
    }
    localStorage.setItem("myGarden", JSON.stringify(safeGarden));
    await saveMyGardenToFirebase(safeGarden);
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
    try {
        const plant = plants.find((p) => p.name === plantName);
        if (plant) {
            let myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
            if (!myGarden.includes(plant.id)) {
                myGarden.push(plant.id);
                localStorage.setItem("myGarden", JSON.stringify(myGarden));
                await saveMyGardenToFirebase(myGarden);
                await renderMyGarden(myGarden);
                isMyGardenEmpty = myGarden.length === 0; // Aggiorna isMyGardenEmpty
                updateGardenToggleButtonState(isMyGardenEmpty); // Chiama updateGardenToggleButtonState
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
            updateGardenToggleButtonState(isMyGardenEmpty);
            updateGardenVisibility(); // Chiamata per aggiornare la visibilità
            if (firebase.auth().currentUser && isMyGardenEmpty) {
                // Se l'utente è loggato e il giardino è vuoto, forza il rendering delle piante disponibili
                await loadPlantsFromFirebase();
                renderPlants(allPlants); // Assicurati che 'allPlants' sia accessibile qui
            }
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
        <p>Temperatura ideale max: ${plantData.tempMax}°C</p>
        <button class="remove-button" data-plant-id="${plantData.id}">Rimuovi dal mio giardino</button>
        <button onclick="updatePlant('${plantData.name}')">Aggiorna info</button>
    `;

    // L'event listener per il bottone "Rimuovi" è ora gestito in renderPlants
    return div;
}

    async function loadMyGardenFromFirebase() {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            const doc = await db.collection('gardens').doc(user.uid).get();
            const firebaseGarden = doc.data()?.plants || [];
            console.log("Giardino caricato da Firebase:", firebaseGarden);
            await renderMyGarden(firebaseGarden); // Renderizza il giardino con i dati di Firebase
        } catch (error) {
            console.error("Errore nel caricamento del giardino da Firebase:", error);
        }
    } else {
        const localStorageGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
        await renderMyGarden(localStorageGarden); // Se non loggato, renderizza dal localStorage
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
    try {
        const plantsSnapshot = await db.collection('plants').get();
        allPlants = plantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante caricate da Firebase:", allPlants);
        renderPlants(allPlants);
    } catch (error) {
        console.error("Errore nel caricamento delle piante da Firebase:", error);
    }
}

    async function renderPlants(plantArray) {
    console.log('Array plant ricevuto da renderPlants:', plantArray);
    const gardenContainer = document.getElementById('garden-container');
    gardenContainer.innerHTML = "";
    const myGardenLS = JSON.parse(localStorage.getItem("myGarden")) || []; // Ottieni il "Mio Giardino" dal localStorage
    const user = firebase.auth().currentUser;
    let myGardenFB = [];

    if (user) {
        const gardenDoc = await db.collection('gardens').doc(user.uid).get();
        myGardenFB = gardenDoc.data()?.plants || [];
    }

    plantArray.forEach((plant) => {
        const image = plant.image || 'plant_9215709.png';
        const div = document.createElement("div");
        div.className = "plant-card";
        div.innerHTML = `
            <img src="${image}" alt="${plant.name}" class="plant-icon">
            <h4>${plant.name}</h4>
            <p>Luce: ${plant.sunlight}</p>
            <p>Acqua: ${plant.watering}</p>
            <p>Temperatura ideale min: ${plant.tempMin}°C</p>
            <p>Temperatura ideale max: ${plant.tempMax}°C</p>
            ${user ? // Se l'utente è loggato, controlla il "Mio Giardino" di Firebase
                myGardenFB.includes(plant.id) ?
                    '<button class="remove-button" data-plant-id="' + plant.id + '">Rimuovi dal mio giardino</button>' :
                    '<button class="add-to-garden-button" data-plant-name="' + plant.name + '">Aggiungi al mio giardino</button>' :
                myGardenLS.includes(plant.id) ? // Se l'utente non è loggato, controlla il localStorage
                    '<button class="remove-button" data-plant-id="' + plant.id + '">Rimuovi dal mio giardino</button>' :
                    '<button class="add-to-garden-button" data-plant-name="' + plant.name + '">Aggiungi al mio giardino</button>'
            }
        `;
        gardenContainer.appendChild(div);
    });

    gardenContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-to-garden-button')) {
            const plantName = event.target.dataset.plantName;
            console.log("Tentativo di aggiungere la pianta:", plantName);
            await addToMyGarden(plantName);
        } else if (event.target.classList.contains('remove-button')) {
            const plantIdToRemove = event.target.dataset.plantId;
            await removeFromMyGarden(plantIdToRemove);
        }
    });

    updateGardenVisibility();
}
  async function updateGardenVisibility() {
    const plantsSection = document.getElementById('plants-section');
    const mioGiardinoSection = document.getElementById('my-garden');
    const giardinoTitle = document.getElementById('giardinoTitle');
    const toggleMyGardenButton = document.getElementById('toggleMyGarden');

    const myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
    const isUserLoggedIn = firebase.auth().currentUser !== null;
    const isMyGardenEmpty = myGarden.length === 0;

    if (toggleMyGardenButton) {
        updateGardenToggleButtonState(isMyGardenEmpty);
    } else {
        console.error("Elemento toggleMyGarden non trovato!");
    }

    if (isUserLoggedIn && !isMyGardenEmpty) {
        // Utente loggato e il "Mio Giardino" non è vuoto: mostra il "Mio Giardino"
        if (plantsSection) plantsSection.style.display = 'none';
        if (mioGiardinoSection) mioGiardinoSection.style.display = 'block';
        if (giardinoTitle) giardinoTitle.style.display = 'block';
    } else {
        // Utente non loggato OPPURE utente loggato ma il "Mio Giardino" è vuoto: mostra le piante disponibili
        if (plantsSection) plantsSection.style.display = 'block';
        if (mioGiardinoSection) mioGiardinoSection.style.display = 'none';
        if (giardinoTitle) giardinoTitle.style.display = 'none';
    }
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
        await loadMyGardenFromFirebase(); // Carica il giardino da Firebase e chiama renderMyGarden con i dati di Firebase
    } else {
        console.log("Stato autenticazione cambiato, nessun utente loggato.");
        authStatusDiv.innerText = "Nessun utente autenticato.";
        appContentDiv.style.display = 'none';
        authContainerDiv.style.display = 'block';
        const myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
        await renderMyGarden(myGarden); // Carica il giardino dal localStorage per utenti non loggati
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    loginButton.addEventListener('click', handleLogin);
    registerButton.addEventListener('click', handleRegister);
    logoutButton.addEventListener('click', handleLogout);
    addNewPlantButton.addEventListener('click', () => {
        newPlantCard.style.display = 'block';
    });
    cancelNewPlant.addEventListener('click', () => {
        newPlantCard.style.display = 'none';
        clearNewPlantForm();
    });
    saveNewPlant.addEventListener('click', saveNewPlantToFirebase);
    searchInput.addEventListener('input', handleSearch);
    categoryFilter.addEventListener('change', handleFilter);
    tempMinFilter.addEventListener('input', handleTempFilter);
    tempMaxFilter.addEventListener('input', handleTempFilter);
    toggleMyGardenButton.addEventListener('click', toggleMyGarden);
    await loadPlantsFromFirebase();
    setTimeout(() => { // Aggiungiamo un piccolo ritardo
        updateGardenVisibility();
    }, 100); // 100 millisecondi di ritardo
});
    
function updateGardenToggleButtonState(isMyGardenEmpty) {
    const toggleMyGardenButton = document.getElementById('toggleMyGarden');
    if (toggleMyGardenButton) {
        if (isMyGardenEmpty) {
            toggleMyGardenButton.innerHTML = '<i class="fa-solid fa-eye"></i> Mostra il mio giardino';
        } else {
            toggleMyGardenButton.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Nascondi il mio giardino';
        }
    } else {
        console.error("Elemento toggleMyGarden non trovato!");
    }
}
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
                    await loadMyGardenFromFirebase();
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
        // Aggiorna isMyGardenEmpty qui dopo aver cambiato la visibilità
        isMyGardenEmpty = mioGiardinoSection.style.display === 'none';
        updateGardenToggleButtonState(isMyGardenEmpty); // Richiama per aggiornare lo stato visivo
    });
}

    await loadPlantsFromFirebase();
    updateGardenVisibility();
});
