// Variabili globali per lo stato dell'applicazione
let allPlants = [];
let myGarden = [];
let currentPlantIdToUpdate = null; // Tiene traccia dell'ID della pianta da aggiornare (per modifica/eliminazione)
let ambientLightSensor = null; // Sensore di luce ambientale
let isMyGardenCurrentlyVisible = false; // Flag per la visualizzazione corrente (true = Mio Giardino, false = Tutte le Piante)
let currentSortBy = 'name_asc'; // Criterio di ordinamento di default
let currentCropper = null; // Variabile per l'istanza di Cropper.js
let croppedImageBlob = null; // Per memorizzare il blob dell'immagine ritagliata
let currentFile = null; // Per memorizzare il file originale selezionato dall'utente
let currentTempSensor = null; // Variabile per il sensore di temperatura ambientale
let currentHumiditySensor = null; // Variabile per il sensore di umidità ambientale

// Variabili DOM (saranno inizializzate in DOMContentLoaded)
let gardenContainer;
let myGardenContainer;
let authContainerDiv;
let appContentDiv;
let loginButton;
let registerButton;
let showLoginLink;
let showRegisterLink;
let emailInput;
let passwordInput;
let loginError;
let registerEmailInput;
let registerPasswordInput;
let registerError;
let authStatusSpan;
let logoutButton;
let searchInput;
let categoryFilter;
let addNewPlantButton;
let showAllPlantsButton;
let showMyGardenButton;
let plantsSectionHeader; // Header della sezione piante (es. "Tutte le Piante Disponibili")
let lightSensorContainer;
let startLightSensorButton;
let stopLightSensorButton;
let currentLuxSpan;
let luxFeedbackSpan;
let clearLightFeedbackButton; // Nuovo bottone per cancellare il feedback
let manualLuxInput; // Nuovo input per lux manuale
let applyManualLuxButton; // Nuovo bottone per applicare lux manuale
let sunLightFilter; // Nuovo filtro per esposizione solare

let temperatureSensorContainer; // Contenitore per il sensore di temperatura
let startTempSensorButton; // Bottone per avviare il sensore di temperatura
let stopTempSensorButton; // Bottone per fermare il sensore di temperatura
let currentTempSpan; // Span per la lettura attuale della temperatura
let tempFeedbackSpan; // Span per il feedback della temperatura
let manualTempInput; // Input per la temperatura manuale
let applyManualTempButton; // Bottone per applicare la temperatura manuale
let clearTempFeedbackButton; // Bottone per cancellare il feedback della temperatura

let humiditySensorContainer; // Contenitore per il sensore di umidità
let startHumiditySensorButton; // Bottone per avviare il sensore di umidità
let stopHumiditySensorButton; // Bottone per fermare il sensore di umidità
let currentHumiditySpan; // Span per la lettura attuale dell'umidità
let humidityFeedbackSpan; // Span per il feedback dell'umidità
let manualHumidityInput; // Input per l'umidità manuale
let applyManualHumidityButton; // Bottone per applicare l'umidità manuale
let clearHumidityFeedbackButton; // Bottone per cancellare il feedback dell'umidità

let plantModal;
let closeModalButtons;
let plantForm;
let plantNameInput;
let plantDescriptionInput;
let plantCategoryInput;
let plantSunLightInput;
let plantTemperatureInput;
let plantHumidityInput;
let plantFrequencyInput;
let plantLastWateredInput;
let modalTitle;
let plantImageUpload;
let plantImagePreview;
let imageUploadStatus;
let cropImageModal;
let imageToCrop;
let cropButton;

let plantDetailModal;
let detailPlantImage;
let detailPlantName;
let detailPlantDescription;
let detailPlantCategory;
let detailPlantSunLight;
let detailPlantTemperature;
let detailPlantHumidity;
let detailPlantFrequency;
let detailPlantLastWatered;
let detailNextWatering;
let detailWateringStatus;
let markWateredButton;
let addToGardenButton;
let removeFromGardenButton;
let editPlantButton;
let deletePlantButton;
let googleLensButton; // Pulsante Google Lens
let getClimateButton; // Pulsante Ottieni Clima

let climateTempSpan;
let climateHumiditySpan;
let climateConditionsSpan;
let climateWindSpan;

let imageZoomModal; // Modale per lo zoom dell'immagine
let zoomedImage; // Immagine all'interno del modale di zoom

let currentUser = null;

// Funzione per inizializzare le variabili DOM dopo che il DOM è stato completamente caricato
document.addEventListener('DOMContentLoaded', () => {
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden-container');
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    loginButton = document.getElementById('login-button');
    registerButton = document.getElementById('register-button');
    showLoginLink = document.getElementById('show-login');
    showRegisterLink = document.getElementById('show-register');
    emailInput = document.getElementById('login-email');
    passwordInput = document.getElementById('login-password');
    loginError = document.getElementById('login-error');
    registerEmailInput = document.getElementById('register-email');
    registerPasswordInput = document.getElementById('register-password');
    registerError = document.getElementById('register-error');
    authStatusSpan = document.getElementById('auth-status');
    logoutButton = document.getElementById('logout-button');
    searchInput = document.getElementById('search-input');
    categoryFilter = document.getElementById('category-filter');
    addNewPlantButton = document.getElementById('add-new-plant-button');
    showAllPlantsButton = document.getElementById('show-all-plants-button');
    showMyGardenButton = document.getElementById('show-my-garden-button');
    plantsSectionHeader = document.getElementById('plants-section-header');
    lightSensorContainer = document.getElementById('light-sensor-container');
    startLightSensorButton = document.getElementById('start-light-sensor');
    stopLightSensorButton = document.getElementById('stop-light-sensor');
    currentLuxSpan = document.getElementById('current-lux');
    luxFeedbackSpan = document.getElementById('lux-feedback');
    clearLightFeedbackButton = document.getElementById('clear-light-feedback');
    manualLuxInput = document.getElementById('manual-lux-input');
    applyManualLuxButton = document.getElementById('apply-manual-lux-button');
    sunLightFilter = document.getElementById('sun-light-filter'); // Inizializza il filtro

    temperatureSensorContainer = document.getElementById('temperature-sensor-container');
    startTempSensorButton = document.getElementById('start-temp-sensor');
    stopTempSensorButton = document.getElementById('stop-temp-sensor');
    currentTempSpan = document.getElementById('current-temp');
    tempFeedbackSpan = document.getElementById('temp-feedback');
    manualTempInput = document.getElementById('manual-temp-input');
    applyManualTempButton = document.getElementById('apply-manual-temp-button');
    clearTempFeedbackButton = document.getElementById('clear-temp-feedback');

    humiditySensorContainer = document.getElementById('humidity-sensor-container');
    startHumiditySensorButton = document.getElementById('start-humidity-sensor');
    stopHumiditySensorButton = document.getElementById('stop-humidity-sensor');
    currentHumiditySpan = document.getElementById('current-humidity');
    humidityFeedbackSpan = document.getElementById('humidity-feedback');
    manualHumidityInput = document.getElementById('manual-humidity-input');
    applyManualHumidityButton = document.getElementById('apply-manual-humidity-button');
    clearHumidityFeedbackButton = document.getElementById('clear-humidity-feedback');

    plantModal = document.getElementById('plant-modal');
    closeModalButtons = document.querySelectorAll('.close-button');
    plantForm = document.getElementById('plant-form');
    plantNameInput = document.getElementById('plant-name');
    plantDescriptionInput = document.getElementById('plant-description');
    plantCategoryInput = document.getElementById('plant-category');
    plantSunLightInput = document.getElementById('plant-sun-light');
    plantTemperatureInput = document.getElementById('plant-temperature');
    plantHumidityInput = document.getElementById('plant-humidity');
    plantFrequencyInput = document.getElementById('plant-frequency');
    plantLastWateredInput = document.getElementById('plant-last-watered');
    modalTitle = document.getElementById('modal-title');
    plantImageUpload = document.getElementById('plant-image-upload');
    plantImagePreview = document.getElementById('plant-image-preview');
    imageUploadStatus = document.getElementById('image-upload-status');
    cropImageModal = document.getElementById('crop-image-modal');
    imageToCrop = document.getElementById('image-to-crop');
    cropButton = document.getElementById('crop-button');

    plantDetailModal = document.getElementById('plant-detail-modal');
    detailPlantImage = document.getElementById('detail-plant-image');
    detailPlantName = document.getElementById('detail-plant-name');
    detailPlantDescription = document.getElementById('detail-plant-description');
    detailPlantCategory = document.getElementById('detail-plant-category');
    detailPlantSunLight = document.getElementById('detail-plant-sun-light');
    detailPlantTemperature = document.getElementById('detail-plant-temperature');
    detailPlantHumidity = document.getElementById('detail-plant-humidity');
    detailPlantFrequency = document.getElementById('detail-plant-frequency');
    detailPlantLastWatered = document.getElementById('detail-plant-last-watered');
    detailNextWatering = document.getElementById('detail-next-watering');
    detailWateringStatus = document.getElementById('detail-watering-status');
    markWateredButton = document.getElementById('mark-watered-button');
    addToGardenButton = document.getElementById('add-to-garden-button');
    removeFromGardenButton = document.getElementById('remove-from-garden-button');
    editPlantButton = document.getElementById('edit-plant-button');
    deletePlantButton = document.getElementById('delete-plant-button');
    googleLensButton = document.getElementById('google-lens-button');
    getClimateButton = document.getElementById('get-climate-button');

    climateTempSpan = document.getElementById('climate-temp');
    climateHumiditySpan = document.getElementById('climate-humidity');
    climateConditionsSpan = document.getElementById('climate-conditions');
    climateWindSpan = document.getElementById('climate-wind');

    imageZoomModal = document.getElementById('image-zoom-modal');
    zoomedImage = document.getElementById('zoomed-image');

    setupAuthListeners();
    setupEventListeners();
});

// Funzioni di Autenticazione
function setupAuthListeners() {
    showLoginLink.addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        loginError.textContent = '';
    });

    showRegisterLink.addEventListener('click', () => {
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('login-form').style.display = 'none';
        registerError.textContent = '';
    });

    loginButton.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        try {
            await auth.signInWithEmailAndPassword(email, password);
            loginError.textContent = '';
        } catch (error) {
            loginError.textContent = error.message;
        }
    });

    registerButton.addEventListener('click', async () => {
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            registerError.textContent = '';
        } catch (error) {
            registerError.textContent = error.message;
        }
    });

    logoutButton.addEventListener('click', async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Errore durante il logout:', error);
        }
    });

    // Gestore dello stato di autenticazione
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            console.log('Utente loggato con UID:', user.uid);
            authStatusSpan.textContent = `Autenticato come: ${user.email}`;
            loginButton.style.display = 'none';
            registerButton.style.display = 'none';
            logoutButton.style.display = 'inline-block';
            authContainerDiv.style.display = 'none';
            appContentDiv.style.display = 'block';
            
            // Carica i dati una volta autenticato
            loadAllPlants();
            loadMyGarden();
        } else {
            currentUser = null;
            console.log('Nessun utente loggato.');
            authStatusSpan.textContent = 'Non Autenticato';
            loginButton.style.display = 'inline-block';
            registerButton.style.display = 'inline-block';
            logoutButton.style.display = 'none';
            authContainerDiv.style.display = 'block';
            appContentDiv.style.display = 'none';
            // Pulisci le liste se l'utente non è autenticato
            allPlants = [];
            myGarden = [];
            displayPlants([]); // Pulisce le card visualizzate
        }
    });
}

    // **********************************
    // CHIAMATA ALLA FUNZIONE DI INIZIALIZZAZIONE AUTENTICAZIONE
    // setupAuthListeners();

// Funzioni del sensore di luce ambientale
function checkLightSensorAvailability() {
    if ('AmbientLightSensor' in window) {
        lightSensorContainer.style.display = 'block';
        luxFeedbackSpan.textContent = "Sensore di luce disponibile.";
    } else {
        lightSensorContainer.style.display = 'block'; // Mostra comunque per input manuale
        luxFeedbackSpan.textContent = "Sensore di luce non disponibile su questo dispositivo. Inserisci manualmente i lux.";
        startLightSensorButton.disabled = true;
        stopLightSensorButton.disabled = true;
    }
}

function startLightSensor() {
    if ('AmbientLightSensor' in window) {
        ambientLightSensor = new AmbientLightSensor();
        ambientLightSensor.onreading = () => {
            const lux = ambientLightSensor.illuminance;
            currentLuxSpan.textContent = lux.toFixed(2);
            updateLuxFeedback(lux);
        };
        ambientLightSensor.onerror = (event) => {
            console.error("Errore sensore di luce:", event.error.name, event.error.message);
            luxFeedbackSpan.textContent = `Errore sensore: ${event.error.message}`;
        };
        ambientLightSensor.start();
        luxFeedbackSpan.textContent = "Sensore di luce avviato...";
    } else {
        luxFeedbackSpan.textContent = "Sensore di luce non disponibile.";
    }
}

function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        luxFeedbackSpan.textContent = "Sensore di luce fermato.";
    }
}

function updateLuxFeedback(lux) {
    let feedback = '';
    if (lux < 50) {
        feedback = 'Molto buio';
    } else if (lux < 200) {
        feedback = 'Poca luce';
    } else if (lux < 1000) {
        feedback = 'Luce media';
    } else if (lux < 10000) {
        feedback = 'Molta luce';
    } else {
        feedback = 'Luce molto intensa';
    }
    luxFeedbackSpan.textContent = feedback;
}

function applyManualLux() {
    const manualLux = parseFloat(manualLuxInput.value);
    if (!isNaN(manualLux)) {
        currentLuxSpan.textContent = manualLux.toFixed(2);
        updateLuxFeedback(manualLux);
    } else {
        luxFeedbackSpan.textContent = "Inserisci un valore numerico valido per i lux.";
    }
}

function clearLightFeedbackDisplay() {
    currentLuxSpan.textContent = 'N/A';
    luxFeedbackSpan.textContent = '';
    manualLuxInput.value = '';
}

// Funzioni del sensore di temperatura
function checkTemperatureSensorAvailability() {
    // La Web API per il sensore di temperatura non è ampiamente supportata.
    // Qui simuliamo la disponibilità e incoraggiamo l'input manuale.
    temperatureSensorContainer.style.display = 'block';
    tempFeedbackSpan.textContent = "Sensore di temperatura potrebbe non essere disponibile. Inserisci manualmente la temperatura.";
    startTempSensorButton.disabled = true;
    stopTempSensorButton.disabled = true;
}

function applyManualTemp() {
    const manualTemp = parseFloat(manualTempInput.value);
    if (!isNaN(manualTemp)) {
        currentTempSpan.textContent = manualTemp.toFixed(2);
        updateTempFeedback(manualTemp);
    } else {
        tempFeedbackSpan.textContent = "Inserisci un valore numerico valido per la temperatura.";
    }
}

function updateTempFeedback(temp) {
    let feedback = '';
    if (temp < 5) {
        feedback = 'Molto freddo';
    } else if (temp < 15) {
        feedback = 'Freddo';
    } else if (temp < 25) {
        feedback = 'Ideale';
    } else if (temp < 35) {
        feedback = 'Caldo';
    } else {
        feedback = 'Molto caldo';
    }
    tempFeedbackSpan.textContent = feedback;
}

function clearTempFeedbackDisplay() {
    currentTempSpan.textContent = 'N/A';
    tempFeedbackSpan.textContent = '';
    manualTempInput.value = '';
}

// Funzioni del sensore di umidità
function checkHumiditySensorAvailability() {
    // Anche per l'umidità, la Web API non è ampiamente supportata.
    // Qui simuliamo la disponibilità e incoraggiamo l'input manuale.
    humiditySensorContainer.style.display = 'block';
    humidityFeedbackSpan.textContent = "Sensore di umidità potrebbe non essere disponibile. Inserisci manualmente l'umidità.";
    startHumiditySensorButton.disabled = true;
    stopHumiditySensorButton.disabled = true;
}

function applyManualHumidity() {
    const manualHumidity = parseFloat(manualHumidityInput.value);
    if (!isNaN(manualHumidity)) {
        currentHumiditySpan.textContent = manualHumidity.toFixed(2);
        updateHumidityFeedback(manualHumidity);
    } else {
        humidityFeedbackSpan.textContent = "Inserisci un valore numerico valido per l'umidità.";
    }
}

function updateHumidityFeedback(humidity) {
    let feedback = '';
    if (humidity < 30) {
        feedback = 'Molto secco';
    } else if (humidity < 50) {
        feedback = 'Secco';
    } else if (humidity < 70) {
        feedback = 'Ideale';
    } else if (humidity < 90) {
        feedback = 'Umidità elevata';
    } else {
        feedback = 'Molto umido';
    }
    humidityFeedbackSpan.textContent = feedback;
}

function clearHumidityFeedbackDisplay() {
    currentHumiditySpan.textContent = 'N/A';
    humidityFeedbackSpan.textContent = '';
    manualHumidityInput.value = '';
}

// Funzioni CRUD (Create, Read, Update, Delete)
async function addPlant(plant) {
    try {
        if (!currentUser) {
            alert('Devi essere loggato per aggiungere piante.');
            return;
        }
        await db.collection('plants').add({ ...plant, userId: currentUser.uid });
        console.log('Pianta aggiunta con successo!');
        loadAllPlants(); // Ricarica le piante dopo l'aggiunta
        loadMyGarden(); // Ricarica anche il giardino in caso sia visibile
    } catch (error) {
        console.error('Errore nell\'aggiunta della pianta:', error);
    }
}

async function loadAllPlants() {
    try {
        const snapshot = await db.collection('plants').get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        applyFiltersAndSort(); // Applica filtri e ordinamento dopo il caricamento
    } catch (error) {
        console.error('Errore nel caricamento di tutte le piante:', error);
    }
}

async function loadMyGarden() {
    try {
        if (!currentUser) {
            myGarden = [];
            displayPlants([]);
            return;
        }
        const snapshot = await db.collection('plants').where('userId', '==', currentUser.uid).get();
        myGarden = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (isMyGardenCurrentlyVisible) {
            applyFiltersAndSort(); // Applica filtri e ordinamento anche per il giardino
        }
    } catch (error) {
        console.error('Errore nel caricamento del mio giardino:', error);
    }
}

async function updatePlant(id, updatedData) {
    try {
        await db.collection('plants').doc(id).update(updatedData);
        console.log('Pianta aggiornata con successo!');
        loadAllPlants();
        loadMyGarden();
    } catch (error) {
        console.error('Errore nell\'aggiornamento della pianta:', error);
    }
}

async function deletePlant(id) {
    if (!confirm('Sei sicuro di voler eliminare questa pianta?')) {
        return;
    }
    try {
        await db.collection('plants').doc(id).delete();
        console.log('Pianta eliminata con successo!');
        plantDetailModal.style.display = 'none'; // Chiudi il modale
        loadAllPlants();
        loadMyGarden();
    } catch (error) {
        console.error('Errore nell\'eliminazione della pianta:', error);
    }
}

async function uploadImage(file) {
    if (!file) return null;

    const storageRef = storage.ref();
    const imageRef = storageRef.child(`plant_images/${Date.now()}_${file.name}`);
    try {
        imageUploadStatus.textContent = "Caricamento immagine in corso...";
        const snapshot = await imageRef.put(file);
        const imageUrl = await snapshot.ref.getDownloadURL();
        imageUploadStatus.textContent = "Immagine caricata con successo!";
        return imageUrl;
    } catch (error) {
        console.error('Errore nel caricamento dell\'immagine:', error);
        imageUploadStatus.textContent = `Errore caricamento: ${error.message}`;
        return null;
    }
}

// Funzioni di visualizzazione e gestione UI
function displayPlants(plantsToDisplay) {
    const container = isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer;
    container.innerHTML = ''; // Pulisci il contenitore attuale
    if (!currentUser) {
        container.innerHTML = '<p>Accedi per visualizzare le piante.</p>';
        return;
    }

    if (plantsToDisplay.length === 0) {
        container.innerHTML = '<p>Nessuna pianta trovata con i criteri attuali.</p>';
        return;
    }

    plantsToDisplay.forEach(plant => {
        const plantCard = document.createElement('div');
        plantCard.classList.add('plant-card');
        plantCard.dataset.id = plant.id;

        const lastWateredDate = new Date(plant.lastWatered);
        const nextWateringDate = new Date(lastWateredDate);
        nextWateringDate.setDate(lastWateredDate.getDate() + parseInt(plant.wateringFrequencyDays));

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset orario per confronto solo data
        nextWateringDate.setHours(0, 0, 0, 0);

        let wateringStatusClass = '';
        let wateringStatusText = '';

        if (now > nextWateringDate) {
            wateringStatusClass = 'status-overdue';
            wateringStatusText = 'Da Annaffiare!';
        } else if (now.getTime() === nextWateringDate.getTime()) {
            wateringStatusClass = 'status-today';
            wateringStatusText = 'Annaffiare Oggi!';
        } else {
            wateringStatusClass = 'status-ok';
            const diffTime = Math.abs(nextWateringDate - now);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            wateringStatusText = `Prossima annaffiatura tra ${diffDays} giorni`;
        }

        plantCard.innerHTML = `
            <img src="${plant.imageUrl || 'placeholder.png'}" alt="${plant.name}" class="plant-image">
            <h3>${plant.name}</h3>
            <p><strong>Categoria:</strong> ${plant.category}</p>
            <p><strong>Luce:</strong> ${plant.sunLight}</p>
            <p class="watering-status ${wateringStatusClass}">${wateringStatusText}</p>
        `;
        plantCard.addEventListener('click', () => showPlantDetail(plant));
        container.appendChild(plantCard);
    });
}

function showPlantDetail(plant) {
    currentPlantIdToUpdate = plant.id;
    detailPlantImage.src = plant.imageUrl || 'placeholder.png';
    detailPlantName.textContent = plant.name;
    detailPlantDescription.textContent = plant.description;
    detailPlantCategory.textContent = plant.category;
    detailPlantSunLight.textContent = plant.sunLight;
    detailPlantTemperature.textContent = plant.temperature;
    detailPlantHumidity.textContent = plant.humidity;
    detailPlantFrequency.textContent = plant.wateringFrequencyDays;
    detailPlantLastWatered.textContent = plant.lastWatered;

    const lastWateredDate = new Date(plant.lastWatered);
    const nextWateringDate = new Date(lastWateredDate);
    nextWateringDate.setDate(lastWateredDate.getDate() + parseInt(plant.wateringFrequencyDays));
    detailNextWatering.textContent = `Prossima Annaffiatura: ${nextWateringDate.toLocaleDateString('it-IT')}`;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    nextWateringDate.setHours(0, 0, 0, 0);

    let wateringStatusClass = '';
    let wateringStatusText = '';

    if (now > nextWateringDate) {
        wateringStatusClass = 'status-overdue';
        wateringStatusText = 'Da Annaffiare!';
    } else if (now.getTime() === nextWateringDate.getTime()) {
        wateringStatusClass = 'status-today';
        wateringStatusText = 'Annaffiare Oggi!';
    } else {
        wateringStatusClass = 'status-ok';
        const diffTime = Math.abs(nextWateringDate - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        wateringStatusText = `Prossima annaffiatura tra ${diffDays} giorni`;
    }
    detailWateringStatus.className = `watering-status ${wateringStatusClass}`;
    detailWateringStatus.textContent = wateringStatusText;

    // Gestisci i bottoni "Aggiungi al Mio Giardino" / "Rimuovi dal Mio Giardino"
    const isAlreadyInMyGarden = myGarden.some(p => p.id === plant.id);
    addToGardenButton.style.display = isAlreadyInMyGarden ? 'none' : 'inline-block';
    removeFromGardenButton.style.display = isAlreadyInMyGarden ? 'inline-block' : 'none';

    // Disabilita modifica/elimina se non è la pianta dell'utente
    if (plant.userId === currentUser.uid) {
        editPlantButton.style.display = 'inline-block';
        deletePlantButton.style.display = 'inline-block';
        markWateredButton.style.display = 'inline-block';
    } else {
        editPlantButton.style.display = 'none';
        deletePlantButton.style.display = 'none';
        markWateredButton.style.display = 'none';
    }

    plantDetailModal.style.display = 'block';
}

function closeModals() {
    plantModal.style.display = 'none';
    plantDetailModal.style.display = 'none';
    cropImageModal.style.display = 'none';
    imageZoomModal.style.display = 'none';
    if (currentCropper) {
        currentCropper.destroy();
        currentCropper = null;
    }
    plantForm.reset();
    plantImagePreview.style.display = 'none';
    plantImagePreview.src = '#';
    imageUploadStatus.textContent = '';
    croppedImageBlob = null;
    currentFile = null;
    currentPlantIdToUpdate = null;
}

function setupEventListeners() {
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });

    // Chiudi modale cliccando fuori
    window.addEventListener('click', (e) => {
        if (e.target === plantModal) closeModals();
        if (e.target === plantDetailModal) closeModals();
    });

    plantForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const plantData = {
            name: plantNameInput.value,
            description: plantDescriptionInput.value,
            category: plantCategoryInput.value,
            sunLight: plantSunLightInput.value,
            temperature: plantTemperatureInput.value,
            humidity: plantHumidityInput.value,
            wateringFrequencyDays: parseInt(plantFrequencyInput.value),
            lastWatered: plantLastWateredInput.value,
            imageUrl: '', // Verrà aggiornato dopo l'upload
        };

        if (croppedImageBlob) {
            plantData.imageUrl = await uploadImage(croppedImageBlob);
        } else if (currentPlantIdToUpdate) {
            // Se stiamo modificando e non carichiamo una nuova immagine, mantieni quella esistente
            const existingPlant = allPlants.find(p => p.id === currentPlantIdToUpdate);
            if (existingPlant) {
                plantData.imageUrl = existingPlant.imageUrl;
            }
        }

        if (currentPlantIdToUpdate) {
            await updatePlant(currentPlantIdToUpdate, plantData);
        } else {
            await addPlant(plantData);
        }
        closeModals();
    });

    addNewPlantButton.addEventListener('click', () => {
        modalTitle.textContent = 'Aggiungi Nuova Pianta';
        currentPlantIdToUpdate = null; // Resetta per nuova pianta
        plantForm.reset(); // Pulisci il form
        plantImagePreview.style.display = 'none';
        plantImagePreview.src = '#';
        imageUploadStatus.textContent = '';
        croppedImageBlob = null;
        currentFile = null;
        plantModal.style.display = 'block';
    });

    markWateredButton.addEventListener('click', async () => {
        if (currentPlantIdToUpdate) {
            const today = new Date().toISOString().split('T')[0];
            await updatePlant(currentPlantIdToUpdate, { lastWatered: today });
            plantDetailModal.style.display = 'none'; // Chiudi il modale dopo l'aggiornamento
        }
    });

    addToGardenButton.addEventListener('click', async () => {
        if (!currentUser || !currentPlantIdToUpdate) return;
        const plantToAdd = allPlants.find(p => p.id === currentPlantIdToUpdate);
        if (plantToAdd) {
            // Firestore non ha un array per gli elementi, quindi duplichiamo la pianta per l'utente
            // o aggiungiamo un campo userId alla pianta esistente se è un database globale.
            // Per questo esempio, aggiungiamo un userId a una copia della pianta nel proprio giardino virtuale.
            // Se le piante sono entità separate per ogni utente, useremo addPlant.
            // Se "Tutte le piante" sono un database pubblico e "Mio Giardino" è una selezione,
            // è più complesso. Assumiamo che "Mio Giardino" sia semplicemente un filtro.
            // Per il momento, non c'è una "aggiunta" fisica se non un cambiamento di proprietà.
            // Questo bottone serve solo a cambiare la visualizzazione, non a duplicare dati.
            // Il modello attuale implica che ogni pianta ha un userId. Se una pianta non è
            // dell'utente, non può essere aggiunta al "suo" giardino se non copiandola.
            // Questo necessiterebbe di un'implementazione più complessa.
            // Per semplicità, ipotizziamo che questo bottone serva a "marcare" la pianta come
            // propria nel caso in cui stessimo visualizzando un database di piante "generiche".
            // Dato che il tuo setup ha userId, assumiamo che ogni pianta sia "di proprietà".
            // Per aggiungere al "mio giardino" da "tutte le piante", dovremmo clonarla per l'utente.
            // Questo esempio non lo supporta direttamente senza modifiche al DB.
            // Per ora, disabilitiamo l'aggiunta se la pianta ha già un userId diverso.
            if (plantToAdd.userId !== currentUser.uid) {
                 await db.collection('plants').add({ ...plantToAdd, userId: currentUser.uid, originalPlantId: plantToAdd.id });
                 alert('Pianta aggiunta al tuo giardino!');
                 loadMyGarden();
                 plantDetailModal.style.display = 'none';
            } else {
                 alert('Questa pianta è già nel tuo giardino!');
            }
        }
    });

    removeFromGardenButton.addEventListener('click', async () => {
        if (!currentUser || !currentPlantIdToUpdate) return;
        const plantToRemove = myGarden.find(p => p.id === currentPlantIdToUpdate);
        if (plantToRemove && plantToRemove.userId === currentUser.uid) {
            await deletePlant(currentPlantIdToUpdate); // Elimina la pianta dal giardino dell'utente
            alert('Pianta rimossa dal tuo giardino!');
            loadMyGarden();
            plantDetailModal.style.display = 'none';
        } else {
            alert('Questa pianta non è nel tuo giardino o non hai i permessi per rimuoverla.');
        }
    });


    editPlantButton.addEventListener('click', () => {
        if (currentPlantIdToUpdate) {
            const plantToEdit = allPlants.find(p => p.id === currentPlantIdToUpdate);
            if (plantToEdit) {
                modalTitle.textContent = 'Modifica Pianta';
                plantNameInput.value = plantToEdit.name;
                plantDescriptionInput.value = plantToEdit.description;
                plantCategoryInput.value = plantToEdit.category;
                plantSunLightInput.value = plantToEdit.sunLight;
                plantTemperatureInput.value = plantToEdit.temperature;
                plantHumidityInput.value = plantToEdit.humidity;
                plantFrequencyInput.value = plantToEdit.wateringFrequencyDays;
                plantLastWateredInput.value = plantToEdit.lastWatered;
                if (plantToEdit.imageUrl) {
                    plantImagePreview.src = plantToEdit.imageUrl;
                    plantImagePreview.style.display = 'block';
                } else {
                    plantImagePreview.style.display = 'none';
                }
                plantModal.style.display = 'block';
                plantDetailModal.style.display = 'none';
            }
        }
    });

    deletePlantButton.addEventListener('click', () => {
        if (currentPlantIdToUpdate) {
            deletePlant(currentPlantIdToUpdate);
        }
    });

    showAllPlantsButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = false;
        gardenContainer.style.display = 'grid';
        myGardenContainer.style.display = 'none';
        plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
        applyFiltersAndSort();
    });

    showMyGardenButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = true;
        gardenContainer.style.display = 'none';
        myGardenContainer.style.display = 'grid';
        plantsSectionHeader.textContent = 'Il Mio Giardino';
        applyFiltersAndSort();
    });

    searchInput.addEventListener('input', applyFiltersAndSort);
    categoryFilter.addEventListener('change', applyFiltersAndSort);
    document.getElementById('sort-by').addEventListener('change', applyFiltersAndSort);


    // Gestione upload immagine e cropper
    plantImageUpload.addEventListener('change', (event) => {
        currentFile = event.target.files[0];
        if (currentFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageToCrop.src = e.target.result;
                cropImageModal.style.display = 'block';
                if (currentCropper) {
                    currentCropper.destroy();
                }
                currentCropper = new Cropper(imageToCrop, {
                    aspectRatio: 1, // Imposta un rapporto 1:1 per immagini quadrate
                    viewMode: 1, // Limita l'area di ritaglio al contenitore
                });
            };
            reader.readAsDataURL(currentFile);
        }
    });

    cropButton.addEventListener('click', () => {
        if (currentCropper) {
            currentCropper.getCroppedCanvas().toBlob((blob) => {
                croppedImageBlob = blob;
                plantImagePreview.src = URL.createObjectURL(blob);
                plantImagePreview.style.display = 'block';
                cropImageModal.style.display = 'none';
            }, 'image/jpeg', 0.9); // Qualità JPEG
        }
    });

    // Zoom immagine al click
    detailPlantImage.addEventListener('click', () => {
        if (detailPlantImage.src && detailPlantImage.src !== window.location.href) {
            zoomedImage.src = detailPlantImage.src;
            imageZoomModal.style.display = 'block';
        }
    });

    if (cropImageModal) cropImageModal.addEventListener('click', (e) => {
        if (e.target === cropImageModal && !e.target.closest('.image-modal-content')) {
            cropImageModal.style.display = 'none';
        }
    });

    if (imageZoomModal) imageZoomModal.addEventListener('click', (e) => {
        if (e.target === imageZoomModal && !e.target.closest('.modal-content')) { // Controlla la classe del tuo div interno
            imageZoomModal.style.display = 'none';
        }
    });

    // Event Listeners per il sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);
    if (applyManualLuxButton) applyManualLuxButton.addEventListener('click', applyManualLux); // Nuovo listener
    if (clearLightFeedbackButton) {
        clearLightFeedbackButton.addEventListener('click', clearLightFeedbackDisplay);
    }

    // Esegui il controllo del sensore all'avvio
    checkLightSensorAvailability();

    // Event listener per il nuovo filtro di esposizione solare
    if (sunLightFilter) {
        sunLightFilter.addEventListener('change', applyFiltersAndSort);
    }

    // Event Listener per Google Lens (placeholder)
    if (googleLensButton) googleLensButton.addEventListener('click', launchGoogleLens);

    // Event Listener per il Clima
    if (getClimateButton) getClimateButton.addEventListener('click', getClimateData);

    // Event Listeners per il sensore di temperatura
    if (startTempSensorButton) startTempSensorButton.addEventListener('click', () => alert('Sensore di temperatura non direttamente supportato dal browser. Usa input manuale.'));
    if (stopTempSensorButton) stopTempSensorButton.addEventListener('click', () => alert('Sensore di temperatura non direttamente supportato dal browser. Usa input manuale.'));
    if (applyManualTempButton) applyManualTempButton.addEventListener('click', applyManualTemp);
    if (clearTempFeedbackButton) {
        clearTempFeedbackButton.addEventListener('click', clearTempFeedbackDisplay);
    }
    checkTemperatureSensorAvailability(); // Controlla disponibilità all'avvio

    // Event Listeners per il sensore di umidità
    if (startHumiditySensorButton) startHumiditySensorButton.addEventListener('click', () => alert('Sensore di umidità non direttamente supportato dal browser. Usa input manuale.'));
    if (stopHumiditySensorButton) stopHumiditySensorButton.addEventListener('click', () => alert('Sensore di umidità non direttamente supportato dal browser. Usa input manuale.'));
    if (applyManualHumidityButton) applyManualHumidityButton.addEventListener('click', applyManualHumidity);
    if (clearHumidityFeedbackButton) {
        clearHumidityFeedbackButton.addEventListener('click', clearHumidityFeedbackDisplay);
    }
    checkHumiditySensorAvailability(); // Controlla disponibilità all'avvio

    // Event listener per l'ordinamento
    const sortBySelect = document.getElementById('sort-by');
    if (sortBySelect) {
        sortBySelect.addEventListener('change', applyFiltersAndSort);
    }
}


function applyFiltersAndSort() {
    let filteredPlants = isMyGardenCurrentlyVisible ? [...myGarden] : [...allPlants];

    // Filtra per ricerca
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredPlants = filteredPlants.filter(plant =>
            plant.name.toLowerCase().includes(searchTerm) ||
            plant.description.toLowerCase().includes(searchTerm)
        );
    }

    // Filtra per categoria
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
        filteredPlants = filteredPlants.filter(plant => plant.category === selectedCategory);
    }

    // Filtra per esposizione solare
    const selectedSunLight = sunLightFilter.value;
    if (selectedSunLight) {
        filteredPlants = filteredPlants.filter(plant => plant.sunLight === selectedSunLight);
    }

    // Ordina i risultati
    const sortBy = document.getElementById('sort-by').value;
    filteredPlants.sort((a, b) => {
        if (sortBy === 'name_asc') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'name_desc') {
            return b.name.localeCompare(a.name);
        } else if (sortBy === 'last_watered_asc') {
            return new Date(a.lastWatered) - new Date(b.lastWatered);
        } else if (sortBy === 'last_watered_desc') {
            return new Date(b.lastWatered) - new Date(a.lastWatered);
        }
        return 0;
    });

    displayPlants(filteredPlants);
}

function launchGoogleLens() {
    const imageUrl = detailPlantImage.src;
    if (imageUrl && imageUrl !== 'placeholder.png') {
        // Encode the image URL for the Google Lens URL
        const encodedImageUrl = encodeURIComponent(imageUrl);
        // Construct the Google Lens search URL. This is a generic approach.
        // Google Lens's direct API is not publicly exposed for arbitrary image URLs in this manner.
        // This will likely open Google Images and perform a search based on the image,
        // which might or might not directly trigger the Lens functionality as expected.
        // For a more integrated solution, a server-side component might be needed.
        const googleLensUrl = `https://lens.google.com/search?p=${encodedImageUrl}&hl=it-IT`;
        window.open(googleLensUrl, '_blank');
    } else {
        alert('Nessuna immagine disponibile per Google Lens.');
    }
}


async function getClimateData() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // SOSTITUISCI CON LA TUA CHIAVE API DI OpenWeatherMap
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=it`;

            try {
                const response = await fetch(weatherUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Dati meteo:", data);
                
                climateTempSpan.textContent = `${data.main.temp}°C`;
                climateHumiditySpan.textContent = `${data.main.humidity}%`;
                climateConditionsSpan.textContent = data.weather[0].description;
                climateWindSpan.textContent = `${data.wind.speed} m/s`;

            } catch (error) {
                console.error("Errore nel recupero dei dati climatici:", error);
                alert("Impossibile recuperare i dati climatici. Assicurati di avere una chiave API valida e una connessione internet.");
                climateTempSpan.textContent = 'Errore';
                climateHumiditySpan.textContent = 'Errore';
                climateConditionsSpan.textContent = 'Errore';
                climateWindSpan.textContent = 'Errore';
            }
        }, (error) => {
            console.error("Errore di geolocalizzazione:", error);
            alert("Impossibile ottenere la tua posizione. Abilita la geolocalizzazione nel browser.");
            climateTempSpan.textContent = 'N/A';
            climateHumiditySpan.textContent = 'N/A';
            climateConditionsSpan.textContent = 'N/A';
            climateWindSpan.textContent = 'N/A';
        });
    } else {
        alert("La geolocalizzazione non è supportata dal tuo browser.");
        climateTempSpan.textContent = 'N/A';
        climateHumiditySpan.textContent = 'N/A';
        climateConditionsSpan.textContent = 'N/A';
        climateWindSpan.textContent = 'N/A';
    }
}
