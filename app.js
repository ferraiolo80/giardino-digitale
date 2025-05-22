// 1. DICHIARAZIONI GLOBALI
let allPlants = [];
let myGarden = [];
let currentPlantIdToUpdate = null;
let ambientLightSensor = null;
let isMyGardenCurrentlyVisible = false;

// DICHIARAZIONI DELLE VARIABILI DOM GLOBALI (MA NON INIZIALIZZATE QUI)
// Saranno inizializzate solo quando il DOM è pronto (in DOMContentLoaded)
let gardenContainer;
let myGardenContainer;
let authContainerDiv;
let appContentDiv;
let loginButton; // Ho corretto, era const e non inizializzata a livello globale in DOMContentLoaded
let registerButton; // Come sopra
let logoutButton;
let authStatusDiv;
let searchInput;
let addNewPlantButton;
let newPlantCard;
let saveNewPlantButton;
let cancelNewPlantButton;
let categoryFilter;
let tempMinFilter;
let tempMaxFilter;
let toggleMyGardenButton;
let giardinoTitle;
let startLightSensorButton;
let stopLightSensorButton;
let currentLuxValueSpan;
let lightFeedbackDiv;
let newPlantIdealLuxMinInput;
let newPlantIdealLuxMaxInput;
let updatePlantIdealLuxMinInput;
let updatePlantIdealLuxMaxInput;
let updatePlantCard;
let saveUpdatedPlantButton;
let cancelUpdatePlantButton;
let emptyGardenMessage; // Aggiungi questa variabile qui

// --- FUNZIONI DI AUTENTICAZIONE --- (rimangono invariate)
async function handleLogin() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorDiv = document.getElementById('login-error');

    if (emailInput && passwordInput && errorDiv) {
        const email = emailInput.value;
        const password = passwordInput.value;
        errorDiv.innerText = '';

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log("Login effettuato con successo!");
        } catch (error) {
            console.error("Errore durante il login:", error);
            errorDiv.innerText = error.message;
        }
    } else {
        console.error("Elementi del form di login non trovati.");
    }
}

async function handleRegister() {
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    const errorDiv = document.getElementById('register-error');

    if (emailInput && passwordInput && confirmPasswordInput && errorDiv) {
        const email = emailInput.value;
        const password = confirmPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        errorDiv.innerText = '';

        if (password !== confirmPassword) {
            errorDiv.innerText = "Le password non corrispondono.";
            return;
        }

        try {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            console.log("Registrazione effettuata con successo!");
        } catch (error) {
            console.error("Errore durante la registrazione:", error);
            errorDiv.innerText = error.message;
        }
    } else {
        console.error("Elementi del form di registrazione non trovati.");
    }
}

async function handleLogout() {
    try {
        await firebase.auth().signOut();
        console.log("Logout effettuato con successo!");
    } catch (error) {
        console.error("Errore durante il logout:", error);
    }
}

// --- FUNZIONI DI RENDERING E GESTIONE DELLE CARD ---

function createPlantCard(plantData, isMyGardenCard = false) {
    console.log("createPlantCard CALLED. Plant:", plantData.name, plantData.id);
    const image = plantData.image || 'plant_9215709.png';
    const div = document.createElement("div");
    div.className = isMyGardenCard ? "my-plant-card" : "plant-card";

    let buttonsHtml = '';
    const user = firebase.auth().currentUser;

    if (user) {
        const isAdminUser = () => user.email === 'ferraiolo80@hotmail.it'; 

        if (isMyGardenCard) {
            buttonsHtml += `<button class="remove-button" data-plant-id="${plantData.id}">Rimuovi dal mio giardino</button>`;
            buttonsHtml += `<button class="update-plant-button" data-plant-id="${plantData.id}">Aggiorna Info</button>`;
        } else {
            if (myGarden.includes(plantData.id)) {
                buttonsHtml += `<button class="remove-button" data-plant-id="${plantData.id}">Rimuovi dal mio giardino</button>`;
            } else {
                buttonsHtml += `<button class="add-to-garden-button" data-plant-id="${plantData.id}">Aggiungi al mio giardino</button>`;
            }
            
            buttonsHtml += `<button class="update-plant-button" data-plant-id="${plantData.id}">Aggiorna Info</button>`;

            if (isAdminUser()) {
                buttonsHtml += `<button class="delete-plant-from-db-button" data-plant-id="${plantData.id}">Elimina Definitivamente</button>`;
            }
        }
    }

    div.innerHTML = `
        <img src="${image}" alt="${plantData.name}" class="plant-icon">
        <h4>${plantData.name}</h4>
        <p><i class="fas fa-sun"></i> Luce: ${plantData.sunlight}</p>
        <p><i class="fas fa-tint"></i> Acqua: ${plantData.watering}</p>
        <p><i class="fas fa-thermometer-half"></i> Temp. ideale min: ${plantData.tempMin}°C</p>
        <p><i class="fas fa-thermometer-half"></i> Temp. ideale max: ${plantData.tempMax}°C</p>
        <p>Categoria: ${plantData.category}</p>
        ${(plantData.idealLuxMin && plantData.idealLuxMax) ? `<p>Lux Ideali: ${plantData.idealLuxMin} - ${plantData.idealLuxMax} Lux</p>` : ''}
        ${buttonsHtml}
    `;

    return div;
}

function renderPlants(plantArray) {
    console.log("renderPlants: Chiamata con array:", plantArray);
    if (!gardenContainer) { // Controllo aggiuntivo, anche se inizializzato in DOMContentLoaded
        console.error("Elemento garden-container non trovato in renderPlants!");
        return;
    }
    gardenContainer.innerHTML = "";

    plantArray.forEach((plant) => {
        const plantCard = createPlantCard(plant, false);
        gardenContainer.appendChild(plantCard);
    });
}

// MODIFICATA LA FUNZIONE renderMyGarden
function renderMyGarden(plantsToDisplay) { // Riceve direttamente gli oggetti pianta filtrati
    if (!myGardenContainer || !emptyGardenMessage) {
        console.error("Elementi my-garden o empty-garden-message non trovati in renderMyGarden!");
        return;
    }

    myGardenContainer.innerHTML = ''; // Pulisci il contenitore

    if (plantsToDisplay.length === 0) {
        emptyGardenMessage.style.display = 'block';
        if (!myGardenContainer.contains(emptyGardenMessage)) {
            myGardenContainer.appendChild(emptyGardenMessage);
        }
    } else {
        emptyGardenMessage.style.display = 'none';
        plantsToDisplay.forEach(plant => {
            const plantCard = createPlantCard(plant, true);
            myGardenContainer.appendChild(plantCard);
        });
    }
}

// --- FUNZIONI DI FILTRO E RICERCA ---
// MODIFICATA LA FUNZIONE applyFilters
function applyFilters() {
    if (!searchInput || !categoryFilter || !tempMinFilter || !tempMaxFilter) {
        console.error("Elementi filtro non trovati in applyFilters!");
        return;
    }

    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const tempMin = parseFloat(tempMinFilter.value);
    const tempMax = parseFloat(tempMaxFilter.value);

    let plantsToFilter;
    if (isMyGardenCurrentlyVisible) {
        // Filtra da allPlants basandosi sugli ID presenti in myGarden
        plantsToFilter = allPlants.filter(plant => myGarden.includes(plant.id));
    } else {
        plantsToFilter = allPlants;
    }

    let filteredPlants = plantsToFilter.filter(plant => {
        const matchesSearch = plant.name.toLowerCase().includes(searchTerm) ||
                              (plant.description && plant.description.toLowerCase().includes(searchTerm));
        const matchesCategory = category === 'all' || plant.category === category;
        const matchesTempMin = isNaN(tempMin) || plant.tempMin >= tempMin;
        const matchesTempMax = isNaN(tempMax) || plant.tempMax <= tempMax;

        return matchesSearch && matchesCategory && matchesTempMin && matchesTempMax;
    });

    if (isMyGardenCurrentlyVisible) {
        renderMyGarden(filteredPlants); // Passa gli oggetti pianta filtrati
        if (emptyGardenMessage) { // Assicurati che emptyGardenMessage sia disponibile
            emptyGardenMessage.style.display = filteredPlants.length === 0 ? 'block' : 'none';
        }
    } else {
        renderPlants(filteredPlants);
    }
}


// --- NUOVE FUNZIONI DI AGGIORNAMENTO E CANCELLAZIONE PIANTE ---
function showUpdatePlantForm(plant) {
    if (!updatePlantCard) {
        console.error("Elemento updatePlantCard non trovato in showUpdatePlantForm!");
        return;
    }
    currentPlantIdToUpdate = plant.id;
    document.getElementById('updatePlantId').value = plant.id;
    document.getElementById('updatePlantName').value = plant.name || '';
    document.getElementById('updatePlantSunlight').value = plant.sunlight || '';
    document.getElementById('updatePlantWatering').value = plant.watering || '';
    document.getElementById('updatePlantTempMin').value = plant.tempMin || '';
    document.getElementById('updatePlantTempMax').value = plant.tempMax || '';
    document.getElementById('updatePlantDescription').value = plant.description || '';
    document.getElementById('updatePlantCategory').value = plant.category || 'Fiore';
    document.getElementById('updatePlantImageURL').value = plant.image || '';
    document.getElementById('updatePlantIdealLuxMin').value = plant.idealLuxMin || '';
    document.getElementById('updatePlantIdealLuxMax').value = plant.idealLuxMax || '';

    updatePlantCard.style.display = 'block';
    updatePlantCard.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function clearUpdatePlantForm() {
    currentPlantIdToUpdate = null;
    document.getElementById('updatePlantId').value = '';
    document.getElementById('updatePlantName').value = '';
    document.getElementById('updatePlantSunlight').value = '';
    document.getElementById('updatePlantWatering').value = '';
    document.getElementById('updatePlantTempMin').value = '';
    document.getElementById('updatePlantTempMax').value = '';
    document.getElementById('updatePlantDescription').value = '';
    document.getElementById('updatePlantCategory').value = 'Fiore';
    document.getElementById('updatePlantImageURL').value = '';
    document.getElementById('updatePlantIdealLuxMin').value = '';
    document.getElementById('updatePlantIdealLuxMax').value = '';
}

async function updatePlantInFirebase(plantId, updatedData) {
    try {
        await db.collection('plants').doc(plantId).update(updatedData);
        console.log("Pianta aggiornata con successo:", plantId);
        await loadPlantsFromFirebase();
        await loadMyGardenFromFirebase();
        applyFilters();
    } catch (error) {
        console.error("Errore nell'aggiornamento della pianta:", error);
        alert("Errore nell'aggiornamento della pianta. Controlla la console e le regole di sicurezza di Firebase.");
    }
}

async function deletePlantFromDatabase(plantId) {
    try {
        await db.collection('plants').doc(plantId).delete();
        console.log("Pianta eliminata dal database principale:", plantId);

        const gardensSnapshot = await db.collection('gardens').get();
        const batch = db.batch();

        gardensSnapshot.forEach(doc => {
            const gardenData = doc.data();
            if (gardenData && Array.isArray(gardenData.plants) && gardenData.plants.includes(plantId)) {
                const updatedPlants = gardenData.plants.filter(id => id !== plantId);
                batch.update(db.collection('gardens').doc(doc.id), { plants: updatedPlants });
            }
        });
        await batch.commit();
        console.log("Pianta rimossa da tutti i giardini degli utenti.");

        await loadPlantsFromFirebase();
        await loadMyGardenFromFirebase();
        applyFilters();
        alert("Pianta eliminata con successo!");

    } catch (error) {
        console.error("Errore durante l'eliminazione della pianta dal database:", error);
        alert("Si è verificato un errore durante l'eliminazione della pianta. Controlla le regole di sicurezza.");
    }
}

// --- FUNZIONI DI GESTIONE DEL GIARDINO (Aggiungi/Rimuovi) ---
async function addToMyGarden(plantId) {
    const user = firebase.auth().currentUser;
    if (user) {
        if (!myGarden.includes(plantId)) {
            myGarden.push(plantId);
            await saveMyGardenToFirebase(myGarden);
            applyFilters();
        }
    } else {
        alert("Devi essere autenticato per aggiungere piante al tuo giardino.");
    }
}

async function removeFromMyGarden(plantIdToRemove) {
    const user = firebase.auth().currentUser;
    if (user) {
        myGarden = myGarden.filter(plantId => plantId !== plantIdToRemove);
        await saveMyGardenToFirebase(myGarden);
        applyFilters();
    } else {
        alert("Devi essere autenticato per rimuovere piante dal tuo giardino.");
    }
}

// --- FUNZIONI DI SALVATAGGIO/CARICAMENTO DATI DA FIREBASE ---
async function saveNewPlantToFirebase() {
    // Assicurati che questi input siano accessibili (inizializzati nel DOMContentLoaded)
    if (!newPlantName || !newPlantSunlight || !newPlantWatering || !newPlantTempMin || !newPlantTempMax ||
        !newPlantIdealLuxMinInput || !newPlantIdealLuxMaxInput) {
        console.error("Uno o più elementi del form per la nuova pianta non sono stati trovati.");
        alert("Errore interno: Elementi del form non caricati correttamente.");
        return;
    }

    const newPlantNameValue = document.getElementById('newPlantName').value; // Usare document.getElementById per i valori
    const newPlantSunlightValue = document.getElementById('newPlantSunlight').value;
    const newPlantWateringValue = document.getElementById('newPlantWatering').value;
    const newPlantTempMinValue = document.getElementById('newPlantTempMin').value;
    const newPlantTempMaxValue = document.getElementById('newPlantTempMax').value;
    const newPlantDescriptionValue = document.getElementById('newPlantDescription').value;
    const newPlantCategoryValue = document.getElementById('newPlantCategory').value;
    const newPlantImageURLValue = document.getElementById('newPlantImageURL').value;
    const newPlantIdealLuxMinValue = parseInt(newPlantIdealLuxMinInput.value); // Usa la variabile inizializzata
    const newPlantIdealLuxMaxValue = parseInt(newPlantIdealLuxMaxInput.value); // Usa la variabile inizializzata


    if (newPlantNameValue && newPlantSunlightValue && newPlantWateringValue &&
        !isNaN(parseInt(newPlantTempMinValue)) && !isNaN(parseInt(newPlantTempMaxValue)) &&
        !isNaN(newPlantIdealLuxMinValue) && !isNaN(newPlantIdealLuxMaxValue)) {
        try {
            const docRef = await db.collection('plants').add({
                name: newPlantNameValue,
                sunlight: newPlantSunlightValue,
                watering: newPlantWateringValue,
                tempMin: parseInt(newPlantTempMinValue),
                tempMax: parseInt(newPlantTempMaxValue),
                description: newPlantDescriptionValue,
                category: newPlantCategoryValue,
                image: newPlantImageURLValue,
                idealLuxMin: newPlantIdealLuxMinValue,
                idealLuxMax: newPlantIdealLuxMaxValue
            });

            console.log("Nuova pianta aggiunta con ID: ", docRef.id);
            if (newPlantCard) {
                newPlantCard.style.display = 'none';
            }
            clearNewPlantForm();
            await loadPlantsFromFirebase();
            applyFilters();
        } catch (error) {
            console.error("Errore nell'aggiunta della nuova pianta:", error);
            alert("Errore nell'aggiunta della nuova pianta. Controlla le regole di sicurezza di Firebase e che tutti i campi siano compilati correttamente.");
        }
    } else {
        alert("Per favore, compila tutti i campi obbligatori (inclusi i valori numerici validi per Temperatura e Lux).");
    }
}

function clearNewPlantForm() {
    document.getElementById('newPlantName').value = '';
    document.getElementById('newPlantSunlight').value = '';
    document.getElementById('newPlantWatering').value = '';
    document.getElementById('newPlantTempMin').value = '';
    document.getElementById('newPlantTempMax').value = '';
    document.getElementById('newPlantDescription').value = '';
    document.getElementById('newPlantCategory').value = 'Fiore';
    document.getElementById('newPlantImageURL').value = '';
    document.getElementById('newPlantIdealLuxMin').value = '';
    document.getElementById('newPlantIdealLuxMax').value = '';
}

async function loadMyGardenFromFirebase() {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            const doc = await db.collection('gardens').doc(user.uid).get();
            myGarden = doc.data()?.plants || [];
            console.log("Giardino caricato da Firebase:", myGarden);
        } catch (error) {
            console.error("Errore nel caricamento del giardino da Firebase:", error);
            myGarden = [];
        }
    } else {
        myGarden = [];
    }
}

// Renamed for clarity in onAuthStateChanged
async function loadMyGarden(uid) {
    try {
        const doc = await db.collection('gardens').doc(uid).get();
        myGarden = doc.data()?.plants || [];
        console.log("Giardino caricato da Firebase per UID:", uid, myGarden);
    } catch (error) {
        console.error("Errore nel caricamento del giardino da Firebase per UID:", uid, error);
        myGarden = [];
    }
}

async function saveMyGardenToFirebase(garden) {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            const gardenRef = db.collection('gardens').doc(user.uid);
            await gardenRef.set({ plants: garden }, { merge: true });
            console.log("Il 'Mio Giardino' è stato aggiornato su Firebase.");
        } catch (error) {
            console.error("Errore durante l'aggiornamento del 'Mio Giardino' su Firebase:", error);
            alert("Errore durante l'aggiornamento del tuo giardino. Controlla le regole di sicurezza.");
        }
    }
}

async function loadPlantsFromFirebase() {
    try {
        const plantsSnapshot = await db.collection('plants').get();
        allPlants = plantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante caricate da Firebase:", allPlants);
    } catch (error) {
        console.error("Errore nel caricamento delle piante da Firebase:", error);
    }
}

// --- FUNZIONI DI VISIBILITÀ UI ---
async function updateGardenVisibility(showMyGarden) {
    // Ora tutte queste variabili saranno già inizializzate da DOMContentLoaded
    // Non è più necessario usare document.getElementById qui
    if (!plantsSection || !gardenContainer || !myGardenContainer || !giardinoTitle || !toggleMyGardenButton || !emptyGardenMessage) {
        console.error("Uno o più elementi UI principali non sono stati trovati in updateGardenVisibility!");
        return;
    }

    const user = firebase.auth().currentUser;
    const isMyGardenEmpty = myGarden.length === 0;

    isMyGardenCurrentlyVisible = showMyGarden;

    if (toggleMyGardenButton) {
        if (user) {
            toggleMyGardenButton.style.display = 'block';
            if (showMyGarden) {
                toggleMyGardenButton.innerHTML = '<i class="fas fa-eye-slash"></i> Mostra tutte le Piante';
            } else {
                toggleMyGardenButton.innerHTML = '<i class="fas fa-eye"></i> Mostra il mio Giardino';
            }
        } else {
            toggleMyGardenButton.style.display = 'none';
        }
    }

    if (user && showMyGarden) {
        plantsSection.style.display = 'none';
        gardenContainer.style.display = 'none';
        myGardenContainer.style.display = 'grid';
        giardinoTitle.style.display = 'block';
    } else {
        plantsSection.style.display = 'block';
        gardenContainer.style.display = 'grid';
        myGardenContainer.style.display = 'none';
        giardinoTitle.style.display = 'none';
    }

    applyFilters();
}

function handleToggleMyGarden() {
    updateGardenVisibility(!isMyGardenCurrentlyVisible);
}

// --- FUNZIONI SENSORE DI LUCE ---
async function startLightSensor() {
    // ... (resta invariata, ma assicurati che currentLuxValueSpan e lightFeedbackDiv siano inizializzati in DOMContentLoaded)
    if ('AmbientLightSensor' in window) {
        try {
            const permissionStatus = await navigator.permissions.query({ name: 'ambient-light-sensor' });
            if (permissionStatus.state === 'denied') {
                alert('Permesso per il sensore di luce negato. Abilitalo nelle impostazioni del tuo browser/dispositivo.');
                return;
            }

            ambientLightSensor = new AmbientLightSensor();

            ambientLightSensor.onreading = () => {
                const currentLux = ambientLightSensor.illuminance;
                if (currentLuxValueSpan) currentLuxValueSpan.textContent = currentLux.toFixed(2);

                if (myGarden && myGarden.length > 0 && currentLux != null) {
                    let feedbackHtml = '<h4>Feedback Luce per il tuo Giardino:</h4><ul>';
                    const plantsInGarden = allPlants.filter(plant => myGarden.includes(plant.id));

                    plantsInGarden.forEach(plant => {
                        const minLux = plant.idealLuxMin;
                        const maxLux = plant.idealLuxMax;

                        if (minLux != null && maxLux != null) {
                            let feedbackMessage = `${plant.name}: `;
                            if (currentLux < minLux) {
                                feedbackMessage += `<span style="color: red;">Troppo poca luce!</span> (Richiede ${minLux}-${maxLux} Lux)`;
                            } else if (currentLux > maxLux) {
                                feedbackMessage += `<span style="color: orange;">Troppa luce!</span> (Richiede ${minLux}-${maxLux} Lux)`;
                            } else {
                                feedbackMessage += `<span style="color: green;">Luce ideale!</span> (Richiede ${minLux}-${maxLux} Lux)`;
                            }
                            feedbackHtml += `<li>${feedbackMessage}</li>`;
                        } else {
                            feedbackHtml += `<li>${plant.name}: Nessun dato Lux ideale disponibile.</li>`;
                        }
                    });
                    feedbackHtml += '</ul>';
                    if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = feedbackHtml;
                } else {
                    if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p>Nessuna pianta nel tuo giardino con dati Lux ideali, o nessun valore rilevato.</p>';
                }
            };

            ambientLightSensor.onerror = (event) => {
                console.error('Errore sensore di luce:', event.error.name, event.error.message);
                if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p style="color: red;">Errore sensore: ${event.error.message}</p>`;
                stopLightSensor();
            };

            ambientLightSensor.start();
            if (startLightSensorButton) startLightSensorButton.style.display = 'none';
            if (stopLightSensorButton) stopLightSensorButton.style.display = 'inline-block';
            if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p>Misurazione in corso...</p>';

        } catch (error) {
            console.error('Impossibile avviare il sensore di luce:', error);
            if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p style="color: red;">Impossibile avviare il sensore di luce. Assicurati che il tuo dispositivo lo supporti e che tu abbia concesso i permessi. ${error.message}</p>`;
        }
    } else {
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p style="color: orange;">Il sensore di luce ambientale non è supportato dal tuo dispositivo.</p>';
    }
}

function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
        if (startLightSensorButton) startLightSensorButton.style.display = 'inline-block';
        if (stopLightSensorButton) stopLightSensorButton.style.display = 'none';
        if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'N/A';
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '';
    }
}


// --- BLOCCO DOMContentLoaded (tutti i tuoi listener di eventi e inizializzazione DOM) ---
document.addEventListener('DOMContentLoaded', async () => {
    // Inizializza TUTTE le variabili globali degli elementi DOM qui
    // Assicurati che i nomi corrispondano a quelli dichiarati con `let` in cima
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden');
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    loginButton = document.getElementById('loginButton');
    registerButton = document.getElementById('registerButton');
    logoutButton = document.getElementById('logoutButton');
    authStatusDiv = document.getElementById('auth-status');
    searchInput = document.getElementById('searchInput');
    addNewPlantButton = document.getElementById('addNewPlantButton');
    newPlantCard = document.getElementById('newPlantCard');
    saveNewPlantButton = document.getElementById('saveNewPlant');
    cancelNewPlantButton = document.getElementById('cancelNewPlant');
    categoryFilter = document.getElementById('categoryFilter');
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    toggleMyGardenButton = document.getElementById('toggleMyGarden');
    giardinoTitle = document.getElementById('giardinoTitle');
    startLightSensorButton = document.getElementById('startLightSensor');
    stopLightSensorButton = document.getElementById('stopLightSensor');
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback');
    newPlantIdealLuxMinInput = document.getElementById('newPlantIdealLuxMin'); // Corretto ID
    newPlantIdealLuxMaxInput = document.getElementById('newPlantIdealLuxMax'); // Corretto ID
    updatePlantIdealLuxMinInput = document.getElementById('updatePlantIdealLuxMin');
    updatePlantIdealLuxMaxInput = document.getElementById('updatePlantIdealLuxMax');
    updatePlantCard = document.getElementById('updatePlantCard');
    saveUpdatedPlantButton = document.getElementById('saveUpdatedPlant');
    cancelUpdatePlantButton = document.getElementById('cancelUpdatePlant');
    emptyGardenMessage = document.getElementById('empty-garden-message');
    const plantsSection = document.getElementById('plants-section'); // Rimuovi const se è una let in alto

    // Listener per i bottoni di login/registrazione/logout
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    // Logout listener è gestito in onAuthStateChanged per essere sempre ricreato correttamente

    // Listener per i bottoni di aggiunta nuova pianta
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', () => newPlantCard.style.display = 'block');
    if (cancelNewPlantButton) cancelNewPlantButton.addEventListener('click', () => { newPlantCard.style.display = 'none'; clearNewPlantForm(); });
    if (saveNewPlantButton) saveNewPlantButton.addEventListener('click', saveNewPlantToFirebase);

    // Listener per la ricerca e i filtri
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (tempMinFilter) tempMinFilter.addEventListener('input', applyFilters);
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', applyFilters);
  
    // Listener per il pulsante "Mostra/Nascondi il mio giardino"
    if (toggleMyGardenButton) {
        toggleMyGardenButton.addEventListener('click', handleToggleMyGarden);
    }

    // Listener per i bottoni del form di aggiornamento
    if (saveUpdatedPlantButton) {
        saveUpdatedPlantButton.addEventListener('click', async () => {
            if (currentPlantIdToUpdate) {
                const updatedData = {
                    name: document.getElementById('updatePlantName').value,
                    sunlight: document.getElementById('updatePlantSunlight').value,
                    watering: document.getElementById('updatePlantWatering').value,
                    tempMin: parseInt(document.getElementById('updatePlantTempMin').value),
                    tempMax: parseInt(document.getElementById('updatePlantTempMax').value),
                    description: document.getElementById('updatePlantDescription').value,
                    category: document.getElementById('updatePlantCategory').value,
                    image: document.getElementById('updatePlantImageURL').value,
                    idealLuxMin: parseInt(document.getElementById('updatePlantIdealLuxMin').value),
                    idealLuxMax: parseInt(document.getElementById('updatePlantIdealLuxMax').value)
                };

                if (isNaN(updatedData.idealLuxMin) || isNaN(updatedData.idealLuxMax)) {
                    alert("I valori Lux Min e Max devono essere numeri validi.");
                    return;
                }

                try {
                    await db.collection("plants").doc(currentPlantIdToUpdate).update(updatedData);
                    alert("Pianta aggiornata con successo!");
                    updatePlantCard.style.display = 'none';
                    clearUpdatePlantForm();
                    await loadPlantsFromFirebase();
                    await loadMyGardenFromFirebase();
                    applyFilters();
                } catch (error) {
                    console.error("Errore durante l'aggiornamento della pianta: ", error);
                    alert("Errore durante l'aggiornamento della pianta.");
                }
            }
        });
    }

    if (cancelUpdatePlantButton) {
        cancelUpdatePlantButton.addEventListener('click', () => {
            updatePlantCard.style.display = 'none';
            clearUpdatePlantForm();
        });
    }

    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);
  
    // Listener per il contenitore principale delle piante (garden-container) - gestione dinamica dei bottoni
    if (gardenContainer) { // Controllo aggiunto per sicurezza
        gardenContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('add-to-garden-button')) {
                const plantId = event.target.dataset.plantId;
                await addToMyGarden(plantId);
            } else if (event.target.classList.contains('remove-button')) {
                const plantIdToRemove = event.target.dataset.plantId;
                await removeFromMyGarden(plantIdToRemove);
            } else if (event.target.classList.contains('update-plant-button')) {
                const plantIdToUpdate = event.target.dataset.plantId;
                const plantToUpdate = allPlants.find(p => p.id === plantIdToUpdate);
                if (plantToUpdate) {
                    showUpdatePlantForm(plantToUpdate);
                } else {
                    console.warn(`Pianta con ID ${plantIdToUpdate} non trovata in allPlants per l'aggiornamento.`);
                }
            } else if (event.target.classList.contains('delete-plant-from-db-button')) {
                const plantIdToDelete = event.target.dataset.plantId;
                if (confirm(`Sei sicuro di voler eliminare DEFINITIVAMENTE la pianta con ID: ${plantIdToDelete}? Questa azione è irreversibile e la rimuoverà anche dai giardini di tutti gli utenti.`)) {
                    await deletePlantFromDatabase(plantIdToDelete);
                }
            }
        });
    }

    // Listener per il contenitore del tuo giardino (my-garden) - gestione dinamica dei bottoni
    if (myGardenContainer) { // Controllo aggiunto per sicurezza
        myGardenContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('remove-button')) {
                const plantIdToRemove = event.target.dataset.plantId;
                await removeFromMyGarden(plantIdToRemove);
            } else if (event.target.classList.contains('update-plant-button')) {
                const plantIdToUpdate = event.target.dataset.plantId;
                const plantToUpdate = allPlants.find(p => p.id === plantIdToUpdate);
                if (plantToUpdate) {
                    showUpdatePlantForm(plantToUpdate);
                } else {
                    console.warn(`Pianta con ID ${plantIdToUpdate} non trovata per l'aggiornamento nel mio giardino.`);
                }
            }
        });
    }

    // --- LISTENER DI STATO AUTENTICAZIONE FIREBASE ---
    firebase.auth().onAuthStateChanged(async (user) => {
        // Questi elementi sono già inizializzati come variabili globali let in DOMContentLoaded
        // Non è necessario usare const qui per riferimenti che sono già stati assegnati
        // Lascio solo l'essenziale per la chiarezza del blocco authStateChanged
        
        if (user) {
            console.log("Stato autenticazione cambiato, utente loggato:", user.uid, user.email);
            authStatusDiv.innerText = `Utente autenticato: ${user.email}`;
            appContentDiv.style.display = 'block';
            authContainerDiv.style.display = 'none';

            if (logoutButton) {
                logoutButton.removeEventListener('click', handleLogout);
                logoutButton.addEventListener('click', handleLogout);
            }

            await loadPlantsFromFirebase();
            await loadMyGarden(user.uid); // Usa loadMyGarden(uid)

            const showMyGardenInitially = myGarden.length > 0;
            await updateGardenVisibility(showMyGardenInitially);

        } else {
            console.log("Stato autenticazione cambiato, nessun utente loggato.");
            authStatusDiv.innerText = "Nessun utente autenticato.";
            appContentDiv.style.display = 'none';
            authContainerDiv.style.display = 'block';

            myGarden = [];
            isMyGardenCurrentlyVisible = false;

            await loadPlantsFromFirebase();

            if (plantsSection) plantsSection.style.display = 'block';
            if (gardenContainer) gardenContainer.style.display = 'grid';
            if (myGardenContainer) myGardenContainer.style.display = 'none';
            if (giardinoTitle) giardinoTitle.style.display = 'none';
            if (emptyGardenMessage) emptyGardenMessage.style.display = 'none';

            if (toggleMyGardenButton) {
                toggleMyGardenButton.style.display = 'none';
            }
            applyFilters();
        }
    });
});
