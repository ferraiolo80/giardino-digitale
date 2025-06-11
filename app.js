// Variabili globali per lo stato dell'applicazione
let allPlants = [];
let myGarden = [];
let currentPlantIdToUpdate = null; // Tiene traccia dell'ID della pianta da aggiornare (per modifica/eliminazione)
let ambientLightSensor = null; // Sensore di luce ambientale
let isMyGardenCurrentlyVisible = false; // Flag per la visualizzazione corrente (true = Mio Giardino, false = Tutte le Piante)
let currentSortBy = 'name_asc'; // Criterio di ordinamento di default

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
let currentLuxValueSpan;
let lightFeedbackDiv;
let tempMinFilter;
let tempMaxFilter;
let sortBySelect; // Selettore per l'ordinamento
let googleLensButton; //variabile per google lens

// Variabili per le Modal
let imageModal; // Modal per zoom immagine
let zoomedImage; // Immagine nella modal di zoom
let closeImageModalButton; // Bottone di chiusura per modal immagine
let cardModal; // NUOVA: Modal per zoom card completa / form
let zoomedCardContent; // Contenuto della card zoomata / form
let closeCardModalButton; // Bottone di chiusura per modal card/form

let loadingSpinner; // Spinner di caricamento
let toastContainer; // Contenitore per i toast

let getClimateButton;       // Variabile per il bottone "Ottieni Clima"
let locationStatusDiv;      // Variabile per il div di stato della posizione
let weatherForecastDiv;     // Variabile per il div delle previsioni meteo
let climateZoneFilter;      // Selettore per la zona climatica

// Variabili per i form (non saranno più oggetti DOM diretti, ma conterranno il contenuto del template)
let newPlantFormTemplate;
let updatePlantFormTemplate;
let emptyGardenMessage; // Messaggio per il giardino vuoto

// Nuovo bottone "Torna su"
let scrollToTopButton;

// Variabili per il ritaglio
let cropModal;
let imageToCrop;
let cropper; // Istanza di Cropper.js
let currentCroppingFile = null; // File attualmente in fase di ritaglio
let currentCroppingImagePreviewElement = null; // Elemento <img> di anteprima associato all'input file
let currentCroppingHiddenUrlElement = null; // Elemento input hidden per l'URL esistente (solo per update form)
let isUpdateFormCropping = false; // Flag per distinguere se il ritaglio è per un nuovo inserimento o un aggiornamento

// Nuove variabili DOM per controlli sensore/manuale
let autoSensorControls;
let manualLuxInputControls;
let manualLuxInput;
let applyManualLuxButton;
let currentLuxValueManualSpan;

// Costante per l'immagine placeholder di default generica
const DEFAULT_PLACEHOLDER_IMAGE = 'https://placehold.co/150x150/EEEEEE/333333?text=No+Image';

// Nuova: Mappa delle immagini placeholder per categoria (senza emoji)
const CATEGORY_PLACEHOLDER_IMAGES = {
    'Fiore': 'https://placehold.co/150x150/FFDDC1/FF5733?text=Fiore',
    'Frutto': 'https://placehold.co/150x150/FFECB3/FFC300?text=Frutto',
    'Verdura': 'https://placehold.co/150x150/D4EDDA/28A745?text=Verdura',
    'Erba Aromatica': 'https://placehold.co/150x150/C8F0C8/198754?text=Erba+Aromatica',
    'Albero': 'https://placehold.co/150x150/C6E0F5/007BFF?text=Albero',
    'Arbusto': 'https://placehold.co/150x150/E9D7ED/6F42C1?text=Arbusto',
    'Succulenta': 'https://placehold.co/150x150/F8D7DA/DC3545?text=Succulenta',
    'Cactus': 'https://placehold.co/150x150/D1ECF1/00BCD4?text=Cactus',
    'Acquatica': 'https://placehold.co/150x150/CCE5FF/007BFF?text=Acquatica',
    'Rampicante': 'https://placehold.co/150x150/FFF3CD/FFC107?text=Rampicante',
    'Bulbo': 'https://placehold.co/150x150/F0FFF0/008000?text=Bulbo',
    'Felce': 'https://placehold.co/150x150/E0F7FA/00838F?text=Felce',
    'Orchidea': 'https://placehold.co/150x150/E6E6FA/800080?text=Orchidea',
    'Pianta': 'https://placehold.co/150x150/D3D3D3/6C757D?text=Pianta',
    'Altro': 'https://placehold.co/150x150/F5F5DC/604C3E?text=Altro'
};


// Flag per distinguere se stiamo modificando una pianta del giardino personale
let isEditingMyGardenPlant = false;

// Variabili per la modale di conferma personalizzata
let confirmationModal;
let confirmationTitle;
let confirmationMessage;
let confirmYesButton;
let confirmNoButton;
let confirmResolve; // Funzione per risolvere la Promise della conferma

const CLIMATE_TEMP_RANGES = {
    'Mediterraneo': { min: 5, max: 35 },
    'Temperato': { min: -10, max: 30 },
    'Tropicale': { min: 18, max: 40 },
    'Subtropicale': { min: 10, max: 38 },
    'Boreale/Artico': { min: -40, max: 20 },
    'Arido': { min: 0, max: 45 },
};

let db; // Istanza di Firestore
let storage; // Istanza di Firebase Storage
let storageRef; // Riferimento al root di Firebase Storage


// =======================================================
// 1. FUNZIONI UTILITY (Feedback Utente e Validazione)
// =======================================================

// Mostra lo spinner di caricamento
function showLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex';
        console.log('Spinner: Mostrato');
    }
}

// Nasconde lo spinner di caricamento
function hideLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
        console.log('Spinner: Nascosto');
    }
}

// Mostra un messaggio toast
function showToast(message, type = 'info', duration = 3000) {
    if (!toastContainer) {
        console.warn('Toast container non trovato.');
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Mostra il toast con animazione
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Nascondi e rimuovi il toast dopo la durata specificata
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
    }, duration);
}

/**
 * Mostra una modale di conferma personalizzata.
 * @param {string} message Il messaggio da visualizzare nella modale.
 * @param {string} [title='Conferma Azione'] Il titolo della modale.
 * @returns {Promise<boolean>} Una Promise che si risolve con true se l'utente clicca 'Sì', false se clicca 'No'.
 */
function showConfirmationModal(message, title = 'Conferma Azione') {
    return new Promise(resolve => {
        if (!confirmationModal || !confirmationTitle || !confirmationMessage || !confirmYesButton || !confirmNoButton) {
            console.error("Confirmation modal elements not found. Falling back to native confirm.");
            // Fallback to native confirm if elements are missing, but log error
            resolve(window.confirm(message));
            return;
        }

        confirmationTitle.textContent = title;
        confirmationMessage.textContent = message;
        confirmationModal.style.display = 'flex'; // Show the modal

        // Store the resolve function to be called by button click handlers
        confirmResolve = resolve;

        // Add event listeners for the buttons (and remove them after use to prevent duplicates)
        const cleanup = () => {
            confirmYesButton.removeEventListener('click', onYesClick);
            confirmNoButton.removeEventListener('click', onNoClick);
            confirmationModal.removeEventListener('click', onModalBackgroundClick);
        };

        const onYesClick = () => {
            confirmationModal.style.display = 'none';
            cleanup();
            confirmResolve(true);
        };

        const onNoClick = () => {
            confirmationModal.style.display = 'none';
            cleanup();
            confirmResolve(false);
        };

        const onModalBackgroundClick = (e) => {
            if (e.target === confirmationModal) {
                confirmationModal.style.display = 'none';
                cleanup();
                confirmResolve(false); // Treat background click as 'No'
            }
        };

        confirmYesButton.addEventListener('click', onYesClick);
        confirmNoButton.addEventListener('click', onNoClick);
        confirmationModal.addEventListener('click', onModalBackgroundClick);
    });
}


// Valida i campi del form di aggiunta/modifica pianta
function validatePlantForm(formElement) {
    let isValid = true;
    clearFormValidationErrors(formElement); // Pulisce errori precedenti

    const nameInput = formElement.querySelector('[id$="PlantName"]');
    if (!nameInput || !nameInput.value.trim()) {
        showFormValidationError(nameInput ? nameInput.id : null, 'Il nome è obbligatorio.');
        isValid = false;
    }

    const sunlightInput = formElement.querySelector('[id$="PlantSunlight"]');
    if (!sunlightInput || !sunlightInput.value) {
        showFormValidationError(sunlightInput ? sunlightInput.id : null, 'L\'esposizione al sole è obbligatoria.');
        isValid = false;
    }

    const wateringInput = formElement.querySelector('[id$="PlantWatering"]');
    if (!wateringInput || !wateringInput.value) {
        showFormValidationError(wateringInput ? wateringInput.id : null, 'La frequenza di innaffiatura è obbligatoria.');
        isValid = false;
    }

    const categoryInput = formElement.querySelector('[id$="PlantCategory"]');
    if (!categoryInput || !categoryInput.value) {
        showFormValidationError(categoryInput ? categoryInput.id : null, 'La categoria è obbligatoria.');
        isValid = false;
    }

    // Validazione lux min/max
    const luxMinInput = formElement.querySelector('[id$="IdealLuxMin"]');
    const luxMaxInput = formElement.querySelector('[id$="IdealLuxMax"]');
    const luxMin = luxMinInput && luxMinInput.value ? parseFloat(luxMinInput.value) : null;
    const luxMax = luxMaxInput && luxMaxInput.value ? parseFloat(luxMaxInput.value) : null;


    if (luxMinInput && luxMinInput.value !== '' && (isNaN(luxMin) || luxMin < 0)) {
        showFormValidationError(luxMinInput.id, 'Lux Min deve essere un numero positivo.');
        isValid = false;
    }
    if (luxMaxInput && luxMaxInput.value !== '' && (isNaN(luxMax) || luxMax < 0)) {
        showFormValidationError(luxMaxInput.id, 'Lux Max deve essere un numero positivo.');
        isValid = false;
    }
    if (luxMin !== null && luxMax !== null && luxMin > luxMax) {
        showFormValidationError(luxMaxInput ? luxMaxInput.id : null, 'Lux Max non può essere inferiore a Lux Min.');
        isValid = false;
    }

    // Validazione temperature min/max
    const tempMinInput = formElement.querySelector('[id$="TempMin"]');
    const tempMaxInput = formElement.querySelector('[id$="TempMax"]');
    const tempMin = tempMinInput && tempMinInput.value ? parseFloat(tempMinInput.value) : null;
    const tempMax = tempMaxInput && tempMaxInput.value ? parseFloat(tempMaxInput.value) : null;

    if (tempMinInput && tempMinInput.value !== '' && isNaN(tempMin)) {
        showFormValidationError(tempMinInput.id, 'Temperatura Min deve essere un numero.');
        isValid = false;
    }
    if (tempMaxInput && tempMaxInput.value !== '' && isNaN(tempMax)) {
        showFormValidationError(tempMaxInput.id, 'Temperatura Max deve essere un numero.');
        isValid = false;
    }
    if (tempMin !== null && tempMax !== null && tempMin > tempMax) {
        showFormValidationError(tempMaxInput ? tempMaxInput.id : null, 'Temperatura Max non può essere inferiore a Temperatura Min.');
        isValid = false;
    }

    // Validazione per i campi di promemoria annaffiatura (solo se visibili, ovvero se isEditingMyGardenPlant è true)
    const wateringReminderFieldsDiv = formElement.querySelector('#wateringReminderFields');
    if (wateringReminderFieldsDiv && window.getComputedStyle(wateringReminderFieldsDiv).display !== 'none') {
        const wateringIntervalInput = formElement.querySelector('#updatePlantWateringIntervalDays');
        const wateringInterval = wateringIntervalInput.value.trim();

        if (wateringInterval !== '' && (isNaN(parseFloat(wateringInterval)) || parseFloat(wateringInterval) <= 0)) {
            showFormValidationError(wateringIntervalInput.id, 'L\'intervallo di annaffiatura deve essere un numero positivo.');
            isValid = false;
        }
    }


    return isValid;
}

// Mostra un errore di validazione specifico per un campo del form
function showFormValidationError(elementId, message) {
    if (!elementId) return; // Aggiunto per evitare errori se elementId è null
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('input-error');
        let errorDiv = element.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('error-message')) {
            errorDiv = document.createElement('div');
            errorDiv.classList.add('error-message');
            element.parentNode.insertBefore(errorDiv, element.nextSibling);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// Pulisce tutti gli errori di validazione da un form
function clearFormValidationErrors(formElement) {
    if (!formElement) return;
    const errorMessages = formElement.querySelectorAll('.error-message');
    errorMessages.forEach(el => el.remove());
    const inputErrors = formElement.querySelectorAll('.input-error');
    inputErrors.forEach(el => el.classList.remove('input-error'));
}

// =======================================================
// 2. FUNZIONI DI AUTENTICAZIONE E UI PRINCIPALE
// =======================================================

// Aggiorna la UI in base allo stato di autenticazione dell'utente
async function updateUIforAuthState(user) {
    hideLoadingSpinner();

    if (user) {
        // Utente loggato
        if (authStatusSpan) authStatusSpan.innerHTML = `<i class="fas fa-user"></i> ${user.email}`;
        if (authContainerDiv) authContainerDiv.style.display = 'none';
        if (appContentDiv) appContentDiv.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'block';
        if (addNewPlantButton) addNewPlantButton.style.display = 'block';

        // Caricamento dati essenziali
        await fetchPlantsFromFirestore(); // Popola allPlants
        await fetchMyGardenFromFirebase(); // Popola myGarden

        // Visualizza le piante predefinita (Tutte le Piante)
        displayAllPlants();

        // Tenta di ottenere il clima all'avvio se l'utente è loggato
        getLocation();

    } else {
        // Utente non loggato
        if (authStatusSpan) authStatusSpan.textContent = 'Non autenticato';
        if (authContainerDiv) authContainerDiv.style.display = 'flex';
        if (appContentDiv) appContentDiv.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'none';
        if (addNewPlantButton) addNewPlantButton.style.display = 'none';

        // Pulisci gli array e la UI se l'utente si disconnette
        allPlants = [];
        myGarden = [];
        displayPlants([]);
        // Resetta filtri e input
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (climateZoneFilter) climateZoneFilter.value = '';
        if (tempMinFilter) tempMinFilter.value = '';
        if (tempMaxFilter) tempMaxFilter.value = '';
        if (sortBySelect) sortBySelect.value = 'name_asc';
        if (locationStatusDiv) locationStatusDiv.innerHTML = '<i class="fas fa-info-circle"></i> Clicca su "Ottieni Clima" per rilevare la tua zona climatica e le previsioni.';
        if (weatherForecastDiv) weatherForecastDiv.innerHTML = ''; // Pulisci previsioni
    }
}


// Gestisce il login dell'utente
async function handleLogin(e) {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    if (loginError) loginError.textContent = '';
    showLoadingSpinner();
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        showToast('Login effettuato con successo!', 'success');
    } catch (error) {
        if (loginError) loginError.textContent = `Errore di login: ${error.message}`;
        showToast(`Errore di login: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Gestisce la registrazione di un nuovo utente
async function handleRegister(e) {
    e.preventDefault();
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;
    if (registerError) registerError.textContent = '';
    showLoadingSpinner();
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        showToast('Registrato con successo!', 'success');
    } catch (error) {
        if (registerError) registerError.textContent = `Errore di registrazione: ${error.message}`;
        showToast(`Errore di registrazione: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Gestisce il logout dell'utente
async function handleLogout() {
    showLoadingSpinner();
    try {
        await firebase.auth().signOut();
        showToast('Logout effettuato con successo!', 'info');
    } catch (error) {
        showToast(`Errore durante il logout: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Mostra il form di login e nasconde quello di registrazione
function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    clearLoginRegisterErrors(); // Pulisci errori
}

// Mostra il form di registrazione e nasconde quello di login
function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    clearLoginRegisterErrors(); // Pulisci errori
}

// Pulisce gli errori dei form di login/registrazione
function clearLoginRegisterErrors() {
    if (loginError) loginError.textContent = '';
    if (registerError) registerError.textContent = '';
}


// =======================================================
// 3. INTERAZIONE CON FIRESTORE (CRUD Piante)
// =======================================================

/**
 * Carica un'immagine su Firebase Storage.
 * @param {File} file - Il file immagine da caricare.
 * @param {string} folderPath - Il percorso della cartella in Storage (es. 'plant_images' o 'user_plant_images').
 * @returns {Promise<string|null>} Una Promise che si risolve con l'URL di download o null.
 */
async function uploadImage(file, folderPath) {
    if (!file) {
        console.log('Upload Image: Nessun file fornito.');
        return null;
    }
    showLoadingSpinner();
    console.log('Upload Image: Inizio caricamento...');
    try {
        const fileName = `${Date.now()}_${file.name}`;
        const storageRefChild = storageRef.child(`${folderPath}/${fileName}`);
        const snapshot = await storageRefChild.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        showToast('Immagine caricata!', 'success');
        console.log('Upload Image: Caricamento completato. URL:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Upload Image: Errore durante l'upload dell'immagine:", error);
        showToast(`Errore caricamento immagine: ${error.message}`, 'error');
        return null;
    } finally {
        hideLoadingSpinner();
        console.log('Upload Image: Fine operazione.');
    }
}

/**
 * Elimina un'immagine da Firebase Storage dato il suo URL.
 * @param {string} imageUrl - L'URL di download dell'immagine da eliminare.
 */
async function deleteImage(imageUrl) {
    if (!imageUrl || imageUrl.includes('placehold.co')) { // Non tentare di eliminare immagini placeholder
        console.log('Delete Image: Nessun URL immagine valido o è un placeholder. Salto eliminazione.');
        return;
    }
    console.log('Delete Image: Inizio eliminazione immagine da Storage:', imageUrl);
    try {
        const imageRef = storage.refFromURL(imageUrl);
        await imageRef.delete();
        console.log("Delete Image: Immagine eliminata con successo da Storage:", imageUrl);
    } catch (error) {
        console.error("Delete Image: Errore nell'eliminazione dell'immagine da Storage:", error);
        // Non mostrare toast all'utente per errori di eliminazione immagine, potrebbero essere immagini predefinite.
    }
}

// Salva o aggiorna una pianta nel database Firestore
async function savePlantToFirestore(e) {
    e.preventDefault();
    console.log('savePlantToFirestore: Funzione avviata.');
    showLoadingSpinner();

    // Get the actual form element from the event target (the button)
    const form = e.target.closest('form');
    if (!form) {
        console.error('savePlantToFirestore: Form non trovato. Uscita.');
        hideLoadingSpinner();
        showToast('Errore: Impossibile trovare il form.', 'error');
        return;
    }

    if (!validatePlantForm(form)) { // Pass the actual form element to validation
        hideLoadingSpinner();
        showToast('Compila correttamente tutti i campi obbligatori.', 'error');
        console.log('savePlantToFirestore: Validazione form fallita. Uscita.');
        return;
    }

    // Collect base plant data from the form
    let plantData = {
        name: form.querySelector('[id$="PlantName"]').value.trim(),
        sunlight: form.querySelector('[id$="PlantSunlight"]').value,
        idealLuxMin: form.querySelector('[id$="IdealLuxMin"]').value.trim() !== '' ? parseFloat(form.querySelector('[id$="IdealLuxMin"]').value.trim()) : null,
        idealLuxMax: form.querySelector('[id$="IdealLuxMax"]').value.trim() !== '' ? parseFloat(form.querySelector('[id$="IdealLuxMax"]').value.trim()) : null,
        watering: form.querySelector('[id$="PlantWatering"]').value,
        tempMin: form.querySelector('[id$="TempMin"]').value.trim() !== '' ? parseFloat(form.querySelector('[id$="TempMin"]').value.trim()) : null,
        tempMax: form.querySelector('[id$="TempMax"]').value.trim() !== '' ? parseFloat(form.querySelector('[id$="TempMax"]').value.trim()) : null,
        potSize: form.querySelector('[id$="PotSize"]').value.trim() || null,
        category: form.querySelector('[id$="PlantCategory"]').value,
    };

    let oldImageUrlToDelete = null; // To track image in storage that needs deletion

    try {
        if (isEditingMyGardenPlant) { // Stiamo modificando una pianta nel "Mio Giardino"
            console.log('savePlantToFirestore: Modifica di una pianta nel Mio Giardino.');
            const user = firebase.auth().currentUser;
            if (!user) { throw new Error("Utente non autenticato per salvare il giardino."); }

            const gardenRef = db.collection('gardens').doc(user.uid);
            const gardenDoc = await gardenRef.get();
            let currentGardenPlants = gardenDoc.exists ? (gardenDoc.data().plants || []) : [];

            const plantIndex = currentGardenPlants.findIndex(p => p.id === currentPlantIdToUpdate);

            if (plantIndex !== -1) {
                const existingGardenPlant = currentGardenPlants[plantIndex];
                console.log('savePlantToFirestore: Pianta esistente nel giardino trovata:', existingGardenPlant.name);

                // --- Gestione immagine utente-specifica (userImage) ---
                if (currentCroppingFile) { // Se un nuovo file è stato caricato/ritagliato
                    if (existingGardenPlant.userImage && existingGardenPlant.userImage !== DEFAULT_PLACEHOLDER_IMAGE) { // Se c'era una vecchia immagine user-specifica
                        oldImageUrlToDelete = existingGardenPlant.userImage;
                        console.log('savePlantToFirestore: Vecchia userImage marcata per eliminazione:', oldImageUrlToDelete);
                    }
                    // Carica la nuova immagine user-specifica
                    plantData.userImage = await uploadImage(currentCroppingFile, `user_plant_images/${user.uid}`);
                    console.log('savePlantToFirestore: Nuova userImage caricata:', plantData.userImage);

                } else if (form.querySelector('#updatePlantImageURL') && form.querySelector('#updatePlantImageURL').value === '' && existingGardenPlant.userImage && existingGardenPlant.userImage !== DEFAULT_PLACEHOLDER_IMAGE) {
                    // L'utente ha svuotato l'input file E la pianta aveva una userImage, significa che vuole rimuoverla
                    oldImageUrlToDelete = existingGardenPlant.userImage;
                    plantData.userImage = firebase.firestore.FieldValue.delete(); // Rimuovi esplicitamente il campo
                    console.log('savePlantToFirestore: userImage rimossa esplicitamente. Vecchia userImage marcata per eliminazione:', oldImageUrlToDelete);
                } else {
                    // Nessun nuovo file e nessun campo cleared, mantieni la userImage esistente o lascia null se non c'era
                    plantData.userImage = existingGardenPlant.userImage || null;
                    console.log('savePlantToFirestore: Nessun nuovo file, userImage mantenuta:', plantData.userImage);
                }

                // --- Gestione Promemoria Annaffiatura (wateringIntervalDays, lastWateredTimestamp) ---
                const wateringIntervalDaysInput = form.querySelector('#updatePlantWateringIntervalDays');
                // const lastWateredDisplay = form.querySelector('#lastWateredDisplay'); // Non serve qui, il timestamp è gestito dal bottone

                plantData.wateringIntervalDays = wateringIntervalDaysInput.value.trim() !== '' ? parseInt(wateringIntervalDaysInput.value.trim(), 10) : null;
                console.log('savePlantToFirestore: Watering Interval Days:', plantData.wateringIntervalDays);

                // lastWateredTimestamp viene aggiornato solo dal button "Annaffiato Oggi!" o mantenuto dal valore esistente
                plantData.lastWateredTimestamp = existingGardenPlant.lastWateredTimestamp || null;
                console.log('savePlantToFirestore: Last Watered Timestamp:', plantData.lastWateredTimestamp);


                // Unisci i campi aggiornati dalla form nell'oggetto pianta esistente del giardino
                currentGardenPlants[plantIndex] = {
                    ...existingGardenPlant, // Mantieni tutti i campi originali (es. 'image' dalla pianta pubblica)
                    ...plantData,         // Sovrascrivi con i nuovi dati della form, inclusa la nuova/vecchia/null userImage e i dati annaffiatura
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                // Aggiorna l'intero array di piante nel documento del giardino
                await gardenRef.set({ plants: currentGardenPlants }, { merge: true }); // Usiamo merge:true per non sovrascrivere l'intero documento se ci fossero altri campi
                myGarden = currentGardenPlants; // Aggiorna lo stato locale per refresh immediato della UI
                showToast('Pianta nel tuo giardino aggiornata con successo!', 'success');
                console.log('savePlantToFirestore: Pianta nel giardino aggiornata in Firestore.');

            } else {
                throw new Error("Pianta non trovata nel tuo giardino per l'aggiornamento.");
            }

        } else { // Stiamo aggiungendo una nuova pianta pubblica O aggiornando una pianta pubblica esistente
            console.log('savePlantToFirestore: Aggiunta/Modifica di una pianta pubblica.');
            // Gestione caricamento immagine per pianta pubblica (campo 'image')
            if (currentCroppingFile) { // Se un nuovo file è stato caricato/ritagliato
                plantData.image = await uploadImage(currentCroppingFile, 'plant_images'); // Carica nell'album immagini generiche
                console.log('savePlantToFirestore: Immagine pubblica caricata:', plantData.image);
            } else {
                // Se nessun file caricato, per nuove piante l'immagine è null, per aggiornamenti mantiene la precedente
                if (!currentPlantIdToUpdate) { // Nuova pianta pubblica
                    plantData.image = null; // Sarà il placeholder basato su categoria
                    console.log('savePlantToFirestore: Nuova pianta pubblica senza immagine.');
                } else { // Aggiornamento di pianta pubblica senza nuovo file
                    // Recupera l'immagine esistente dal documento per non eliminarla
                    const existingPlantDoc = await db.collection('plants').doc(currentPlantIdToUpdate).get();
                    plantData.image = existingPlantDoc.exists ? (existingPlantDoc.data().image || null) : null;
                    console.log('savePlantToFirestore: Nessun nuovo file per pianta pubblica, mantenimento immagine esistente:', plantData.image);
                }
            }


            if (currentPlantIdToUpdate) { // Aggiornamento di una pianta pubblica esistente
                console.log('savePlantToFirestore: Aggiornamento pianta pubblica. ID:', currentPlantIdToUpdate);
                const existingPlantDoc = await db.collection('plants').doc(currentPlantIdToUpdate).get();
                if (existingPlantDoc.exists && existingPlantDoc.data().image && existingPlantDoc.data().image !== DEFAULT_PLACEHOLDER_IMAGE && currentCroppingFile) {
                    oldImageUrlToDelete = existingPlantDoc.data().image; // Marca la vecchia immagine pubblica per eliminazione SOLO se ce n'era una e stiamo caricando una nuova
                    console.log('savePlantToFirestore: Vecchia immagine pubblica marcata per eliminazione:', oldImageUrlToDelete);
                }
                await db.collection('plants').doc(currentPlantIdToUpdate).update({
                    ...plantData, // Usa il plantData preparato, incluso il campo 'image'
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                showToast('Pianta pubblica aggiornata con successo!', 'success');
                console.log('savePlantToFirestore: Pianta pubblica aggiornata in Firestore.');
            } else { // Aggiunta di una nuova pianta pubblica
                console.log('savePlantToFirestore: Aggiunta nuova pianta pubblica.');
                plantData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                plantData.ownerId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;
                // Assicurati che questi campi non vengano aggiunti alle piante pubbliche se non previsti
                delete plantData.wateringIntervalDays;
                delete plantData.lastWateredTimestamp;
                delete plantData.userImage; // Le piante pubbliche non hanno una userImage
                await db.collection('plants').add(plantData);
                showToast('Nuova pianta pubblica aggiunta con successo!', 'success');
                console.log('savePlantToFirestore: Nuova pianta pubblica aggiunta in Firestore.');
            }
        }

        // --- Pulizia comune dopo operazioni Firestore riuscite ---
        closeCardModal(); // Chiude la modale
        currentCroppingFile = null; // Resetta lo stato del ritaglio
        currentCroppingImagePreviewElement = null;
        currentCroppingHiddenUrlElement = null;
        isUpdateFormCropping = false;
        console.log('savePlantToFirestore: Variabili di ritaglio resettate.');

        // Ricarica e ridisplay di tutti i dati
        await fetchPlantsFromFirestore();
        await fetchMyGardenFromFirebase();
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
        console.log('savePlantToFirestore: Dati ricaricati e visualizzazione aggiornata.');

        // Elimina la vecchia immagine da storage se marcata
        if (oldImageUrlToDelete) {
            console.log('savePlantToFirestore: Inizio eliminazione immagine obsoleta dallo storage.');
            await deleteImage(oldImageUrlToDelete);
            console.log('savePlantToFirestore: Immagine obsoleta eliminata.');
        }

    } catch (error) {
        console.error("savePlantToFirestore: Errore durante il salvataggio della pianta: ", error);
        showToast(`Errore durante il salvataggio: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
        console.log('savePlantToFirestore: Blocco finally eseguito.');
    }
}


// Elimina una pianta dal database Firestore e dal giardino di tutti gli utenti
async function deletePlantFromDatabase(plantId) {
    showLoadingSpinner();
    console.log('deletePlantFromDatabase: Avviato per ID:', plantId);
    try {
        const plantDoc = await db.collection('plants').doc(plantId).get();
        if (!plantDoc.exists) {
            showToast('Pianta non trovata.', 'error');
            console.log('deletePlantFromDatabase: Pianta non trovata.');
            hideLoadingSpinner();
            return;
        }
        const plantData = plantDoc.data();
        console.log('deletePlantFromDatabase: Dati pianta recuperati:', plantData);

        // La conferma è già stata gestita dalla funzione chiamante showConfirmationModal()

        // 1. Elimina l'immagine associata da Storage
        // Questo elimina SOLO l'immagine 'generica' della pianta pubblica.
        // Le userImage nei giardini degli utenti non vengono toccate da qui.
        if (plantData.image && plantData.image !== DEFAULT_PLACEHOLDER_IMAGE) {
            console.log('deletePlantFromDatabase: Tentativo di eliminare immagine associata (pubblica).');
            await deleteImage(plantData.image);
            console.log('deletePlantFromDatabase: Immagine associata (pubblica) eliminata.');
        }

        // 2. Elimina la pianta dalla collezione 'plants'
        console.log('deletePlantFromDatabase: Eliminazione pianta dalla collezione plants.');
        await db.collection('plants').doc(plantId).delete();
        showToast('Pianta eliminata con successo dal database!', 'success');
        console.log('deletePlantFromDatabase: Pianta eliminata dal database.');

        // 3. Rimuovi la pianta dal giardino di OGNI utente
        console.log('deletePlantFromDatabase: Rimozione pianta dai giardini degli utenti.');
        const gardensSnapshot = await db.collection('gardens').get();
        const batch = db.batch();

        for (const doc of gardensSnapshot.docs) {
            let currentGardenPlants = doc.data().plants || [];
            const plantInGarden = currentGardenPlants.find(plant => plant.id === plantId);

            const updatedGardenPlants = currentGardenPlants.filter(plant => plant.id !== plantId);
            if (updatedGardenPlants.length !== currentGardenPlants.length) {
                batch.update(doc.ref, { plants: updatedGardenPlants });
                console.log(`deletePlantFromDatabase: Marcato giardino di ${doc.id} per aggiornamento.`);

                // Se la pianta aveva una userImage, elimina anche quella
                if (plantInGarden && plantInGarden.userImage && plantInGarden.userImage !== DEFAULT_PLACEHOLDER_IMAGE) {
                    console.log(`deletePlantFromDatabase: Eliminazione userImage da giardino di ${doc.id}: ${plantInGarden.userImage}`);
                    await deleteImage(plantInGarden.userImage);
                }
            }
        }
        await batch.commit();
        console.log('deletePlantFromDatabase: Aggiornamento batch dei giardini completato.');

        closeCardModal(); // Chiude la modale dopo l'eliminazione
        await fetchPlantsFromFirestore();
        await fetchMyGardenFromFirebase();
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
        console.log('deletePlantFromDatabase: Funzione completata con successo.');

    } catch (error) {
        console.error("deletePlantFromDatabase: Errore durante l'eliminazione:", error);
        showToast(`Errore durante l'eliminazione: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
        console.log('deletePlantFromDatabase: Blocco finally eseguito.');
    }
}

// Aggiunge una pianta al giardino dell'utente autenticato
async function addToMyGarden(plantId) {
    showLoadingSpinner();
    console.log('addToMyGarden: Avviato per ID:', plantId);
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per aggiungere piante al tuo giardino.", 'info');
        hideLoadingSpinner();
        console.log('addToMyGarden: Utente non autenticato. Uscita.');
        return;
    }

    const gardenRef = db.collection('gardens').doc(user.uid);
    try {
        console.log('addToMyGarden: Recupero documento giardino utente.');
        const doc = await gardenRef.get();
        let currentGardenPlants = [];
        if (doc.exists) {
            currentGardenPlants = doc.data().plants || [];
            console.log('addToMyGarden: Giardino utente esistente. Piante attuali:', currentGardenPlants.length);
        } else {
            console.log('addToMyGarden: Giardino utente non esistente, creazione di un nuovo array.');
        }

        if (currentGardenPlants.some(p => p.id === plantId)) {
            showToast("Questa pianta è già nel tuo giardino!", 'info');
            hideLoadingSpinner();
            console.log('addToMyGarden: Pianta già nel giardino. Uscita.');
            return;
        }

        const plantToAdd = allPlants.find(plant => plant.id === plantId);
        if (plantToAdd) {
            console.log('addToMyGarden: Trovata pianta da aggiungere:', plantToAdd.name);
            currentGardenPlants.push({
                id: plantToAdd.id,
                name: plantToAdd.name,
                category: plantToAdd.category,
                image: plantToAdd.image || null, // Keep the generic image from public collection
                userImage: null, // NEW: Initialize user-specific image to null
                sunlight: plantToAdd.sunlight,
                watering: plantToAdd.watering,
                idealLuxMin: plantToAdd.idealLuxMin,
                idealLuxMax: plantToAdd.idealLuxMax,
                tempMin: plantToAdd.tempMin,
                tempMax: plantToAdd.tempMax,
                potSize: plantToAdd.potSize || null,
                createdAt: plantToAdd.createdAt || firebase.firestore.FieldValue.serverTimestamp(), // Keep original timestamp
                // Nuovi campi per il promemoria annaffiatura, inizializzati a null o default
                wateringIntervalDays: null,
                lastWateredTimestamp: null
            });
            console.log('addToMyGarden: Aggiornamento documento giardino con nuova pianta.');
            await gardenRef.set({ plants: currentGardenPlants }); // Set the whole array
            myGarden = currentGardenPlants;
            showToast('Pianta aggiunta al tuo giardino!', 'success');
            displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Aggiorna la visualizzazione
            console.log('addToMyGarden: Pianta aggiunta e visualizzazione aggiornata.');
        } else {
            showToast("Pianta non trovata per l'aggiunta al giardino.", 'error');
            console.log('addToMyGarden: Pianta non trovata in allPlants. Uscita.');
        }
    } catch (error) {
        showToast(`Errore nell'aggiunta al giardino: ${error.message}`, 'error');
        console.error("addToMyGarden: Errore nell'aggiunta al giardino: ", error);
    } finally {
        hideLoadingSpinner();
        console.log('addToMyGarden: Blocco finally eseguito.');
    }
}


// Rimuove una pianta dal giardino dell'utente autenticato
async function removeFromMyGarden(plantId) {
    showLoadingSpinner();
    console.log('removeFromMyGarden: Avviato per ID:', plantId);
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per rimuovere piante dal tuo giardino.", 'info');
        hideLoadingSpinner();
        console.log('removeFromMyGarden: Utente non autenticato. Uscita.');
        return;
    }

    // Modal di conferma personalizzata anziché alert()
    const confirmed = await showConfirmationModal(
        'Sei sicuro di voler rimuovere questa pianta dal tuo giardino? Questa azione non elimina la pianta dal database pubblico.'
    );
    if (!confirmed) {
        hideLoadingSpinner();
        console.log('removeFromMyGarden: Rimozione annullata dall\'utente.');
        return;
    }

    const gardenRef = db.collection('gardens').doc(user.uid);
    try {
        console.log('removeFromMyGarden: Recupero documento giardino utente.');
        const doc = await gardenRef.get();
        if (doc.exists) {
            let currentGardenPlants = doc.data().plants || [];
            console.log('removeFromMyGarden: Piante attuali nel giardino:', currentGardenPlants.length);
            const plantToRemove = currentGardenPlants.find(plant => plant.id === plantId);

            const updatedGardenPlants = currentGardenPlants.filter(plant => plant.id !== plantId);

            if (updatedGardenPlants.length !== currentGardenPlants.length) {
                // Se la pianta aveva una userImage, eliminala dallo storage quando viene rimossa dal giardino
                if (plantToRemove && plantToRemove.userImage && plantToRemove.userImage !== DEFAULT_PLACEHOLDER_IMAGE) {
                    console.log(`removeFromMyGarden: Eliminazione userImage associata: ${plantToRemove.userImage}`);
                    await deleteImage(plantToRemove.userImage);
                }

                console.log('removeFromMyGarden: Aggiornamento documento giardino con pianta rimossa.');
                await gardenRef.set({ plants: updatedGardenPlants });
                myGarden = updatedGardenPlants;
                showToast('Pianta rimossa dal tuo giardino!', 'info');
                displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Aggiorna la visualizzazione
                console.log('removeFromMyGarden: Pianta rimossa e visualizzazione aggiornata.');
            } else {
                showToast("La pianta non era presente nel tuo giardino.", 'info');
                console.log('removeFromMyGarden: Pianta non trovata nel giardino per la rimozione.');
            }
        } else {
            showToast("Il tuo giardino è vuoto.", 'info');
            console.log('removeFromMyGarden: Giardino utente vuoto.');
        }
    } catch (error) {
        showToast(`Errore nella rimozione dal giardino: ${error.message}`, 'error');
        console.error("removeFromMyGarden: Errore nella rimozione dal giardino: ", error);
    } finally {
        hideLoadingSpinner();
        console.log('removeFromMyGarden: Blocco finally eseguito.');
    }
}

// Recupera tutte le piante dalla collezione 'plants' di Firestore
async function fetchPlantsFromFirestore() {
    console.log('fetchPlantsFromFirestore: Avviato recupero piante.');
    try {
        const plantsRef = db.collection('plants');
        const snapshot = await plantsRef.get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("fetchPlantsFromFirestore: Piante caricate da Firestore:", allPlants.length);
        return allPlants;
    } catch (error) {
        console.error("fetchPlantsFromFirestore: Errore nel caricamento delle piante:", error);
        showToast('Errore nel caricamento delle piante: ' + error.message, 'error');
        allPlants = [];
        return [];
    }
}

// Recupera le piante del giardino dell'utente autenticato da Firestore
async function fetchMyGardenFromFirebase() {
    console.log('fetchMyGardenFromFirebase: Avviato recupero giardino utente.');
    const user = firebase.auth().currentUser;
    if (!user) {
        myGarden = [];
        console.log("fetchMyGardenFromFirebase: Utente non autenticato, giardino vuoto.");
        return [];
    }

    try {
        const gardenRef = db.collection('gardens').doc(user.uid);
        const doc = await gardenRef.get();
        if (doc.exists) {
            myGarden = doc.data().plants || [];
            // Assicurati che i campi di promemoria annaffiatura esistano, anche se nulli, per le piante vecchie
            myGarden = myGarden.map(plant => ({
                ...plant,
                wateringIntervalDays: plant.wateringIntervalDays || null,
                lastWateredTimestamp: plant.lastWateredTimestamp || null // Assicurati che sia un Firestore Timestamp o null
            }));
            console.log("fetchMyGardenFromFirebase: Giardino caricato da Firebase:", myGarden.length);
            return myGarden;
        } else {
            myGarden = [];
            console.log("fetchMyGardenFromFirebase: Nessun documento del giardino trovato per l'utente, giardino vuoto.");
            return [];
        }

    } catch (error) {
        showToast(`Errore nel caricamento del tuo giardino: ${error.message}`, 'error');
        console.error("fetchMyGardenFromFirebase: Errore nel caricamento del mio giardino: ", error);
        myGarden = [];
        return [];

    }
}

/**
 * Calcola la data della prossima annaffiatura.
 * @param {Object} plant La pianta con lastWateredTimestamp e wateringIntervalDays.
 * @returns {Date|null} La data della prossima annaffiatura o null se i dati non sono validi.
 */
function calculateNextWateringDate(plant) {
    if (!plant || !plant.lastWateredTimestamp || !plant.wateringIntervalDays || isNaN(plant.wateringIntervalDays) || plant.wateringIntervalDays <= 0) {
        return null;
    }
    const lastWateredDate = plant.lastWateredTimestamp.toDate(); // Converti Firestore Timestamp in Date
    const nextWateringDate = new Date(lastWateredDate);
    nextWateringDate.setDate(lastWateredDate.getDate() + plant.wateringIntervalDays);
    return nextWateringDate;
}


// =======================================================
// 4. VISUALIZZAZIONE E FILTRAGGIO/ORDINAMENTO DELLE PIANTE
// =======================================================

// Applica i filtri e l'ordinamento a un array di piante
function applyFiltersAndSort(plantsToFilter) {
    let filteredPlants = [...plantsToFilter];

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (searchTerm) {
        filteredPlants = filteredPlants.filter(plant =>
            (plant.name && plant.name.toLowerCase().includes(searchTerm)) ||
            (plant.potSize && plant.potSize.toLowerCase().includes(searchTerm)) || // Cerca anche nella dimensione vaso
            (plant.category && plant.category.toLowerCase().includes(searchTerm))
        );
    }

    const category = categoryFilter ? categoryFilter.value : 'all';
    if (category !== 'all') {
        filteredPlants = filteredPlants.filter(plant => plant.category === category);
    }

    const selectedClimate = climateZoneFilter ? climateZoneFilter.value : '';
    if (selectedClimate && selectedClimate !== '' && selectedClimate !== 'Seleziona clima') {
        const climateRange = CLIMATE_TEMP_RANGES[selectedClimate];
        if (climateRange) {
            filteredPlants = filteredPlants.filter(plant => {
                const plantMin = plant.tempMin; // Già float o null
                const plantMax = plant.tempMax; // Già float o null
                // Considera le piante che rientrano nel range climatico o che non hanno dati di temperatura definiti.
                // Se non ha dati di temp, non la escludo a priori, ma non la includo attivamente nel filtro per temp.
                if (plantMin === null || plantMax === null || isNaN(plantMin) || isNaN(plantMax)) {
                    return false; // Exclude if essential data for climate filter is missing
                }
                return plantMin >= climateRange.min && plantMax <= climateRange.max;
            });
        } else {
            console.warn(`Intervallo di temperatura non definito per il clima: ${selectedClimate}. Nessuna pianta sarà mostrata per questo filtro.`);
            filteredPlants = []; // No range, no plants
        }
    }


    const tempMin = tempMinFilter ? parseFloat(tempMinFilter.value) : NaN;
    const tempMax = tempMaxFilter ? parseFloat(tempMaxFilter.value) : NaN;

    if (!isNaN(tempMin)) {
        filteredPlants = filteredPlants.filter(plant =>
            plant.tempMin !== null && plant.tempMin >= tempMin
        );
    }
    if (!isNaN(tempMax)) {
        filteredPlants = filteredPlants.filter(plant =>
            plant.tempMax !== null && plant.tempMax <= tempMax
        );
    }

    switch (sortBySelect ? sortBySelect.value : 'name_asc') {
        case 'name_asc':
            filteredPlants.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'name_desc':
            filteredPlants.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            break;
        case 'category_asc':
            filteredPlants.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
            break;
        case 'category_desc':
            filteredPlants.sort((a, b) => (b.category || '').localeCompare(a.category || ''));
            break;
        default:
            // Select default sort if invalid
            filteredPlants.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            if (sortBySelect) sortBySelect.value = 'name_asc'; // Reset UI
            break;
    }
    return filteredPlants;
}


// Visualizza le piante nel contenitore appropriato
function displayPlants(plantsToShow) {
    const user = firebase.auth().currentUser;
    const filteredAndSortedPlants = applyFiltersAndSort(plantsToShow);

    let html = '';
    const targetContainer = isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer;
    const otherContainer = isMyGardenCurrentlyVisible ? gardenContainer : myGardenContainer;

    if (!targetContainer || !otherContainer || !plantsSectionHeader || !emptyGardenMessage) {
        console.error("Errore: Elementi DOM principali non inizializzati. Impossibile aggiornare la UI.");
        return;
    }

    plantsSectionHeader.textContent = isMyGardenCurrentlyVisible ? "Il Mio Giardino" : "Tutte le Piante Disponibili";

    if (filteredAndSortedPlants.length === 0) {
        targetContainer.innerHTML = '';
        if (isMyGardenCurrentlyVisible) {
            emptyGardenMessage.style.display = 'block';
        } else {
            emptyGardenMessage.style.display = 'none';
            html = '<p style="text-align: center; grid-column: 1 / -1; padding: 20px; color: #777;">Nessuna pianta trovata con i filtri applicati.</p>';
        }
    } else {
        emptyGardenMessage.style.display = 'none';
        filteredAndSortedPlants.forEach(plant => {
            const isInMyGarden = user && myGarden.some(p => p.id === plant.id);
            const addToGardenButtonHtml = user ?
                `<button class="action-button add-to-garden-button" data-plant-id="${plant.id}" ${isInMyGarden ? 'disabled' : ''}>${isInMyGarden ? '<i class="fas fa-check"></i> Già nel Giardino' : '<i class="fas fa-plus-circle"></i> Aggiungi al Giardino'}</button>` :
                `<button class="action-button add-to-garden-button" disabled title="Accedi per aggiungere"><i class="fas fa-plus-circle"></i> Aggiungi al Giardino</button>`;

            const removeFromGardenButtonHtml = isMyGardenCurrentlyVisible ?
                `<button class="action-button remove-button" data-plant-id="${plant.id}"><i class="fas fa-minus-circle"></i> Rimuovi</button>` : '';

            // I bottoni di modifica ed eliminazione sono sempre visibili se l'utente è loggato
            // La logica di permission (es. solo l'owner può modificare/eliminare) dovrebbe essere nelle Firebase Security Rules
            const updateButtonHtml = user ? `<button class="action-button update-plant-button" data-plant-id="${plant.id}"><i class="fas fa-edit"></i> Aggiorna</button>` : '';
            const deleteButtonHtml = user ? `<button class="action-button delete-plant-from-db-button" data-plant-id="${plant.id}"><i class="fas fa-trash"></i> Elimina</button>` : '';

            // Determina quale immagine visualizzare
            let imageUrlToDisplay = DEFAULT_PLACEHOLDER_IMAGE; // Fallback generico

            if (isMyGardenCurrentlyVisible) {
                // Se nella vista "Mio Giardino", prioritizza userImage, poi plant.image (dalla pubblica), poi category-based placeholder
                imageUrlToDisplay = plant.userImage || plant.image || CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE;
            } else {
                // Se nella vista "Tutte le Piante", usa plant.image (dalla pubblica), poi category-based placeholder
                imageUrlToDisplay = plant.image || CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE;
            }

            // --- Gestione Promemoria Annaffiatura per la visualizzazione delle card ---
            let wateringReminderHtml = '';
            if (isMyGardenCurrentlyVisible && plant.wateringIntervalDays && plant.lastWateredTimestamp) {
                const nextWateringDate = calculateNextWateringDate(plant);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Normalizza a inizio giornata

                if (nextWateringDate <= today) {
                    // Se la prossima annaffiatura è oggi o in passato
                    const diffTime = Math.abs(today.getTime() - nextWateringDate.getTime());
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Giorni trascorsi da quando DOVEVA essere annaffiata
                    
                    if (diffDays === 0) {
                         wateringReminderHtml = `<p><i class="fas fa-tint text-red-500"></i> Annaffia Oggi!</p>`;
                    } else {
                         wateringReminderHtml = `<p><i class="fas fa-exclamation-triangle text-red-700"></i> Annaffiare con urgenza!</p>`;
                    }
                } else {
                    // Se la prossima annaffiatura è in futuro
                    wateringReminderHtml = `<p><i class="fas fa-tint text-green-500"></i> Prossima annaffiatura: ${nextWateringDate.toLocaleDateString('it-IT')}</p>`;
                }
            } else if (isMyGardenCurrentlyVisible) {
                 wateringReminderHtml = `<p><i class="fas fa-tint text-gray-500"></i> Annaffiatura: N/A</p>`; // Se i dati non sono impostati
            }
            // --- Fine gestione Promemoria Annaffiatura ---


            html += `
                <div class="plant-card" data-plant-id="${plant.id}">
                    <img src="${imageUrlToDisplay}" alt="${plant.name}" class="plant-image">
                    <h3>${plant.name}</h3>
                    <p><strong>Esposizione al Sole:</strong> ${plant.sunlight || 'N/A'}</p>
                    <p><strong>Annaffiatura:</strong> ${plant.watering || 'N/A'}</p>
                    <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
                    ${wateringReminderHtml} <!-- Inserisce il promemoria -->
                    <div class="card-actions">
                        ${isMyGardenCurrentlyVisible ? removeFromGardenButtonHtml : addToGardenButtonHtml}
                        ${updateButtonHtml}
                        ${deleteButtonHtml}
                    </div>
                </div>
            `;
        });
    }

    targetContainer.innerHTML = html;
    targetContainer.style.display = 'grid';
    otherContainer.style.display = 'none';

    // Aggiorna classi active per i bottoni "Mostra Tutte le Piante" / "Mostra il Mio Giardino"
    if (showAllPlantsButton) showAllPlantsButton.classList.toggle('active', !isMyGardenCurrentlyVisible);
    if (showMyGardenButton) showMyGardenButton.classList.toggle('active', isMyGardenCurrentlyVisible);
}


// Funzione per mostrare solo le piante nel mio giardino
function displayMyGarden() {
    isMyGardenCurrentlyVisible = true;
    displayPlants(myGarden);
    // Auto-scroll alla sezione delle piante
    if (plantsSectionHeader) {
        plantsSectionHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Funzione per mostrare tutte le piante disponibili
function displayAllPlants() {
    isMyGardenCurrentlyVisible = false;
    displayPlants(allPlants);
    // Auto-scroll alla sezione delle piante
    if (plantsSectionHeader) {
        plantsSectionHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// =======================================================
// 5. FUNZIONI PER IL SENSORE DI LUCE
// =======================================================

// Richiede i permessi per il sensore di luce ambientale
async function requestLightSensorPermission() {
    if (typeof AmbientLightSensor === 'undefined') {
        showToast("Il sensore di luce ambientale non è supportato dal tuo browser o dispositivo.", 'error');
        return false;
    }
    console.log('requestLightSensorPermission: Richiesta permessi sensore luce.');
    try {
        const permissionName = 'ambient-light-sensor';
        const result = await navigator.permissions.query({ name: permissionName });
        console.log('requestLightSensorPermission: Stato permessi sensore luce:', result.state);
        if (result.state === 'granted') {
            console.log('Permesso sensore luce già concesso.');
            return true;
        } else if (result.state === 'prompt') {
            showToast("Permesso sensore luce richiesto. Potrebbe apparire un popup. Accetta per continuare.", 'info');
            return true;
        } else {
            showToast("Permesso sensore luce negato. Impossibile leggere la luce.", 'error');
            return false;
        }
    } catch (error) {
        showToast(`Errore nel controllo permessi sensore luce: ${error.message}`, 'error');
        console.error('requestLightSensorPermission: Errore nel controllo permessi sensore luce:', error);
        return false;
    }
}

// Funzione per aggiornare il feedback sul sensore di luce (usata sia da sensore automatico che manuale)
function updateLightFeedback(lux) {
    console.log('updateLightFeedback: Aggiornamento feedback con Lux:', lux);
    if (myGarden && myGarden.length > 0 && lux != null) {
        let feedbackHtml = '<h4>Feedback Luce per il tuo Giardino:</h4><ul>';
        const plantsInGardenWithLuxData = myGarden.filter(plant =>
            typeof plant.idealLuxMin === 'number' && typeof plant.idealLuxMax === 'number' && !isNaN(plant.idealLuxMin) && !isNaN(plant.idealLuxMax)
        );
        console.log('updateLightFeedback: Piante nel giardino con dati Lux validi:', plantsInGardenWithLuxData.length);

        if (plantsInGardenWithLuxData.length > 0) {
            plantsInGardenWithLuxData.forEach(plant => {
                const minLux = plant.idealLuxMin;
                const maxLux = plant.idealLuxMax;

                let feedbackMessage = `${plant.name}: `;
                if (lux < minLux) {
                    feedbackMessage += `<span style="color: red;">Troppo poca luce!</span> (Richiede ${minLux}-${maxLux} Lux)`;
                } else if (lux > maxLux) {
                    feedbackMessage += `<span style="color: orange;">Troppa luce!</span> (Richiede ${minLux}-${maxLux} Lux)`;
                } else {
                    feedbackMessage += `<span style="color: green;">Luce ideale!</span> (Richiede ${minLux}-${maxLux} Lux)`;
                }
                feedbackHtml += `<li>${feedbackMessage}</li>`;
            });
            feedbackHtml += '</ul>';
        } else {
            feedbackHtml += '</ul><p style="color: orange;">Nessuna pianta nel tuo giardino con dati Lux ideali impostati.</p>';
        }
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = feedbackHtml;
    } else {
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p>Aggiungi piante al tuo giardino e imposta i loro Lux ideali per un feedback personalizzato, o il sensore non ha rilevato valori.</p>';
    }
}


// Avvia la lettura del sensore di luce
async function startLightSensor() {
    showLoadingSpinner();
    console.log('startLightSensor: Avvio funzione.');

    // Re-fetch dei dati per assicurarsi che siano aggiornati
    console.log('startLightSensor: Re-fetch piante e giardino.');
    allPlants = await fetchPlantsFromFirestore();
    myGarden = await fetchMyGardenFromFirebase();

    // Check for API support first
    if (!('AmbientLightSensor' in window)) {
        hideLoadingSpinner();
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p style="color: red;">Sensore di luce non supportato dal tuo browser o dispositivo. Utilizza l\'inserimento manuale.</p>';
        showToast('Sensore di luce non supportato dal tuo browser o dispositivo.', 'error');
        // Ensure manual controls are visible and auto controls are hidden
        if (autoSensorControls) autoSensorControls.style.display = 'none';
        if (manualLuxInputControls) manualLuxInputControls.style.display = 'block';
        console.log('startLightSensor: Sensore non supportato. Uscita.');
        return; // Exit early if not supported
    }

    const hasPermission = await requestLightSensorPermission();
    if (!hasPermission) {
        hideLoadingSpinner();
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p style="color: red;">Permesso per il sensore di luce negato o non concesso. Assicurati di navigare su HTTPS e di aver concesso il permesso richiesto.</p>';
        showToast('Permesso per il sensore di luce negato o non concesso. Controlla le impostazioni del browser.', 'error');
        if (startLightSensorButton) startLightSensorButton.style.display = 'inline-block';
        if (stopLightSensorButton) stopLightSensorButton.style.display = 'none';
        console.log('startLightSensor: Permesso negato. Uscita.');
        return;
    }

    // Proceed with sensor activation if supported and permission is handled
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
        console.log('startLightSensor: Sensore esistente fermato.');
    }

    try {
        ambientLightSensor = new AmbientLightSensor({ frequency: 1000 });
        showToast("Avvio sensore di luce...", 'info');
        console.log('startLightSensor: Istanza AmbientLightSensor creata.');

        ambientLightSensor.onreading = () => {
            const lux = ambientLightSensor.illuminance;
            if (currentLuxValueSpan) currentLuxValueSpan.textContent = `${lux ? lux.toFixed(2) : 'N/A'} `;
            updateLightFeedback(lux); // Call shared feedback function
            // console.log('startLightSensor: Lettura Lux:', lux); // Commented to avoid spamming in console
        };

        ambientLightSensor.onerror = (event) => {
            console.error("startLightSensor: Errore sensore di luce:", event.error.name, event.error.message);
            if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p style="color: red;">Errore sensore: ${event.error.message}. Assicurati di essere su HTTPS e di aver concesso i permessi. </p>`;
            showToast(`Errore sensore luce: ${event.error.message}`, 'error');
            stopLightSensor(); // Stop sensor on error
            hideLoadingSpinner();
        };

        ambientLightSensor.start();
        if (stopLightSensorButton) stopLightSensorButton.style.display = 'inline-block';
        if (startLightSensorButton) startLightSensorButton.style.display = 'none';
        hideLoadingSpinner();
        showToast('Misurazione luce avviata!', 'success');
        console.log('startLightSensor: Sensore avviato con successo.');

    } catch (error) {
        console.error("startLightSensor: Errore nell'avvio del sensore di luce nel try-catch:", error);
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p style="color: red;">Errore nell'avvio del sensore: ${error.message}. Assicurati di essere su HTTPS e di aver concesso i permessi.</p>`;
        showToast(`Errore nell'avvio del sensore: ${error.message}`, 'error');
        hideLoadingSpinner();
        if (startLightSensorButton) startLightSensorButton.style.display = 'inline-block';
        if (stopLightSensorButton) stopLightSensorButton.style.display = 'none';
    }
}

// Ferma la lettura del sensore di luce
function stopLightSensor() {
    console.log('stopLightSensor: Avvio funzione.');
    if (ambientLightSensor) {
        try {
            ambientLightSensor.stop();
            console.log('stopLightSensor: Sensore fermato.');
        } catch (e) {
            console.error("stopLightSensor: Errore nel fermare il sensore:", e);
        }
        ambientLightSensor = null;
    }

    // Always reset auto sensor buttons if they were active
    if (startLightSensorButton) startLightSensorButton.style.display = 'inline-block';
    if (stopLightSensorButton) stopLightSensorButton.style.display = 'none';

    // Reset feedback and lux display
    if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p>Attiva il sensore o inserisci un valore per il feedback specifico sulle piante.</p>';
    if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'N/A lx';
    if (currentLuxValueManualSpan) currentLuxValueManualSpan.textContent = 'N/A lx'; // Reset manual display as well

    showToast('Misurazione luce fermata.', 'info');
    console.log('stopLightSensor: Funzione completata.');
}

// Applica il valore Lux inserito manualmente
async function applyManualLux() {
    console.log('applyManualLux: Avvio funzione.');
    const manualLuxValue = parseFloat(manualLuxInput.value);

    if (isNaN(manualLuxValue) || manualLuxValue < 0) {
        showToast('Inserisci un valore Lux valido (un numero positivo).', 'error');
        console.log('applyManualLux: Valore Lux non valido. Uscita.');
        return;
    }

    showLoadingSpinner();
    // Re-fetch dei dati per assicurarsi che siano aggiornati
    console.log('applyManualLux: Re-fetch piante e giardino.');
    allPlants = await fetchPlantsFromFirestore();
    myGarden = await fetchMyGardenFromFirebase();
    hideLoadingSpinner();
    console.log('applyManualLux: Re-fetch completato.');

    if (currentLuxValueManualSpan) currentLuxValueManualSpan.textContent = `${manualLuxValue.toFixed(2)} `;
    updateLightFeedback(manualLuxValue);
    showToast(`Valore Lux ${manualLuxValue.toFixed(2)} applicato.`, 'success');
    console.log('applyManualLux: Funzione completata.');
}


// =======================================================
// 6. FUNZIONI PER GEOLOCALIZZAZIONE E METEO (Open-Meteo)
// =======================================================

// Funzione principale per ottenere la posizione e il clima
function getLocation() {
    console.log('getLocation: Avvio funzione.');
    if (navigator.geolocation) {
        if (locationStatusDiv) locationStatusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Acquisizione posizione in corso...';
        showLoadingSpinner();
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                console.log('getLocation: Posizione ottenuta:', latitude, longitude);
                getClimateFromCoordinates(latitude, longitude);
            },
            error => {
                let errorMessage = "Impossibile ottenere la posizione.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Accesso alla posizione negato. Abilita la posizione nel browser.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Informazioni sulla posizione non disponibili.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Timeout nel recupero della posizione.";
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage = "Errore sconosciuto nella geolocalizzazione.";
                        break;
                }
                console.error('getLocation: Errore geolocalizzazione:', error.message);
                if (locationStatusDiv) locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errorMessage}`;
                showToast(errorMessage, 'error');
                if (climateZoneFilter) climateZoneFilter.value = ''; // Resetta il filtro clima
                displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Applica i filtri senza considerare il clima
                hideLoadingSpinner();
            }
        );
    } else {
        console.log('getLocation: Geolocalizzazione non supportata.');
        if (locationStatusDiv) locationStatusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> La geolocalizzazione non è supportata dal tuo browser.';
        showToast("Geolocalizzazione non supportata dal tuo browser.", 'error');
        if (climateZoneFilter) climateZoneFilter.value = '';
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    }
}

// Deduce la zona climatica dalle coordinate e recupera i dati meteo
async function getClimateFromCoordinates(latitude, longitude) {
    console.log('getClimateFromCoordinates: Avvio funzione per Lat:', latitude, 'Lon:', longitude);
    if (locationStatusDiv) locationStatusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recupero dati climatici...';
    showLoadingSpinner();

    try {
        const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_mean,precipitation_sum,weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&forecast_days=1&timezone=Europe%2FBerlin`;
        console.log('getClimateFromCoordinates: Chiamata API Open-Meteo:', weatherApiUrl);

        const response = await fetch(weatherApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('getClimateFromCoordinates: Dati meteo ricevuti:', data);

        const currentTemp = data.current_weather ? data.current_weather.temperature : null;
        const meanTemp2m = data.daily && data.daily.temperature_2m_mean ? data.daily.temperature_2m_mean[0] : null;
        const precipitationSum = data.daily && data.daily.precipitation_sum ? data.daily.precipitation_sum[0] : null;
        const weatherCode = data.daily && data.daily.weathercode ? data.daily.weathercode[0] : null;
        const maxTemp = data.daily && data.daily.temperature_2m_max ? data.daily.temperature_2m_max[0] : null;
        const minTemp = data.daily && data.daily.temperature_2m_min ? data.daily.temperature_2m_min[0] : null;

        let climateZone = 'Sconosciuto';

        if (meanTemp2m !== null) {
            if (meanTemp2m >= 25) {
                climateZone = 'Tropicale';
            } else if (meanTemp2m >= 15 && meanTemp2m < 25) {
                climateZone = 'Subtropicale';
            } else if (meanTemp2m >= 5 && meanTemp2m < 15) {
                climateZone = 'Temperato';
            } else if (meanTemp2m >= -5 && meanTemp2m < 5) {
                 if (precipitationSum !== null && precipitationSum < 5) {
                    climateZone = 'Arido';
                } else {
                    climateZone = 'Mediterraneo';
                }
            } else if (meanTemp2m < -5) {
                climateZone = 'Boreale/Artico';
            }
            if (meanTemp2m >= 10 && meanTemp2m <= 20 && precipitationSum !== null && precipitationSum < 2) {
                climateZone = 'Mediterraneo';
            } else if (meanTemp2m >= 25 && precipitationSum !== null && precipitationSum < 1) {
                climateZone = 'Arido';
            }
        } else if (currentTemp !== null) {
             if (currentTemp >= 25) {
                climateZone = 'Tropicale';
            } else if (currentTemp >= 15 && currentTemp < 25) {
                climateZone = 'Subtropicale';
            } else if (currentTemp >= 5 && currentTemp < 15) {
                climateZone = 'Temperato';
            } else if (currentTemp >= -5 && currentTemp < 5) {
                climateZone = 'Mediterraneo';
            } else if (currentTemp < -5) {
                climateZone = 'Boreale/Artico';
            }
        }
        console.log('getClimateFromCoordinates: Zona climatica dedotta:', climateZone);

        if (locationStatusDiv) {
            locationStatusDiv.innerHTML = `<i class="fas fa-location-dot"></i> <span>Clima dedotto: <strong>${climateZone}</strong></span>`;
        }

        if (climateZoneFilter) {
            climateZoneFilter.value = climateZone;
            displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
        }

        if (weatherForecastDiv) {
            let weatherHtml = '<h4>Previsioni Meteo (oggi):</h4>';
            // Aggiunto spazio dopo i due punti
            if (currentTemp !== null) {
                weatherHtml += `<p><i class="fas fa-temperature-half"></i> Temperatura attuale:&nbsp;&nbsp;<strong>${currentTemp.toFixed(1)}°C</strong></p>`;
            }
            if (maxTemp !== null && minTemp !== null) {
                weatherHtml += `<p><i class="fas fa-thermometer-half"></i> Max/Min:&nbsp;&nbsp;<strong>${maxTemp.toFixed(1)}°C / ${minTemp.toFixed(1)}°C</strong></p>`;
            }
            if (precipitationSum !== null) {
                weatherHtml += `<p><i class="fas fa-cloud-showers-heavy"></i> Precipitazioni:&nbsp;&nbsp;<strong>${precipitationSum.toFixed(1)} mm</strong></p>`;
            }
            if (weatherCode !== null) {
                weatherHtml += `<p><i class="${getWeatherIcon(weatherCode)}"></i> Condizione: ${getWeatherDescription(weatherCode)}</p>`;
            }
            weatherForecastDiv.innerHTML = weatherHtml;
        }

        showToast(`Clima rilevato: ${climateZone}`, 'success');
        console.log('getClimateFromCoordinates: Funzione completata con successo.');

    } catch (error) {
        console.error('getClimateFromCoordinates: Errore nel recupero dei dati climatici:', error);
        if (locationStatusDiv) {
            locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Errore nel recupero dei dati climatici.`;
        }
        if (weatherForecastDiv) {
            weatherForecastDiv.innerHTML = '<p class="error-message">Impossibile caricare le previsioni meteo.</p>';
        }
        showToast(`Errore nel recupero dei dati climatici: ${error.message}`, 'error');

        if (climateZoneFilter) {
            climateZoneFilter.value = '';
            displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
        }
    } finally {
        hideLoadingSpinner();
        console.log('getClimateFromCoordinates: Blocco finally eseguito.');
    }
}

// Funzione per ottenere l'icona Font Awesome dal weathercode di Open-Meteo
function getWeatherIcon(weathercode) {
    switch (weathercode) {
        case 0: return 'fas fa-sun'; // Clear sky
        case 1: // Mainly clear
        case 2: // Partly cloudy
        case 3: return 'fas fa-cloud-sun'; // Overcast
        case 45: // Fog
        case 48: return 'fas fa-smog'; // Depositing rime fog
        case 51: // Drizzle: Light
        case 53: // Drizzle: Moderate
        case 55: return 'fas fa-cloud-drizzle'; // Drizzle: Dense intensity
        case 56: // Freezing Drizzle: Light
        case 57: return 'fas fa-cloud-sleet'; // Freezing Drizzle: Dense intensity
        case 61: // Rain: Light
        case 63: // Rain: Moderate
        case 65: return 'fas fa-cloud-showers-heavy'; // Rain: Heavy intensity
        case 66: // Freezing Rain: Light
        case 67: return 'fas fa-cloud-hail-heavy'; // Freezing Rain: Heavy intensity
        case 71: // Snow fall: Light
        case 73: // Snow fall: Moderate
        case 75: return 'fas fa-snowflake'; // Snow fall: Heavy intensity
        case 77: return 'fas fa-cloud-meatball'; // Snow grains (Non c'è un'icona perfetta, ma si avvicina)
        case 80: // Rain showers: Light
        case 81: // Rain showers: Moderate
        case 82: return 'fas fa-cloud-showers-heavy'; // Rain showers: Violent
        case 85: // Snow showers: Light
        case 86: return 'fas fa-snowflake'; // Snow showers: Heavy
        case 95: return 'fas fa-cloud-bolt'; // Thunderstorm: Light or moderate
        case 96: // Thunderstorm with slight hail
        case 99: return 'fas fa-cloud-bolt'; // Thunderstorm with heavy hail
        default: return 'fas fa-question'; // Unknown
    }
}

// Funzione per ottenere una descrizione testuale dal weathercode
function getWeatherDescription(weathercode) {
    switch (weathercode) {
        case 0: return 'Cielo sereno';
        case 1: return 'Cielo prevalentemente sereno';
        case 2: return 'Parzialmente nuvoloso';
        case 3: return 'Nuvoloso';
        case 45: return 'Nebbia';
        case 48: return 'Nebbia gelata';
        case 51: return 'Pioggerella leggera';
        case 53: return 'Pioggerella moderata';
        case 55: return 'Pioggerella intensa';
        case 56: return 'Pioggerella gelata leggera';
        case 57: return 'Pioggerella gelata intensa';
        case 61: return 'Pioggia leggera';
        case 63: return 'Pioggia moderata';
        case 65: return 'Pioggia intensa';
        case 66: return 'Pioggia gelata leggera';
        case 67: return 'Pioggia gelata intensa';
        case 71: return 'Nevicata leggera';
        case 73: return 'Nevicata moderata';
        case 75: return 'Nevicata intensa';
        case 77: return 'Grandinata leggera';
        case 80: return 'Acquazzoni leggeri';
        case 81: return 'Acquazzoni moderati';
        case 82: return 'Acquazzoni violenti';
        case 85: return 'Nevicate leggere';
        case 86: return 'Nevicate intense';
        case 95: return 'Temporale';
        case 96: return 'Temporale con grandine leggera';
        case 99: return 'Temporale con grandine intensa';
        default: return 'Condizione sconosciuta';
    }
}


// =======================================================
// 7. GESTIONE MODALI (Immagine, Card Completa/Form, Ritaglio)
// =======================================================

// Apre la modal dell'immagine
function openImageModal(imageUrl) {
    if (imageModal && zoomedImage) {
        zoomedImage.src = imageUrl;
        imageModal.style.display = 'flex';
        console.log('openImageModal: Modale immagine aperta. URL:', imageUrl);
    }
}

/**
 * Apre la modal per visualizzare i dettagli della pianta o per i form di aggiunta/aggiornamento.
 * @param {HTMLElement} formTemplateElement Il template HTML del form (newPlantFormTemplate o updatePlantFormTemplate).
 * @param {Object} [plantData=null] I dati della pianta se si sta aggiornando una pianta esistente.
 * @param {boolean} [isFromMyGarden=false] Indica se l'azione proviene dalla sezione "Mio Giardino".
 */
async function openCardModal(formTemplateElement, plantData = null, isFromMyGarden = false) {
    if (!cardModal || !zoomedCardContent || !formTemplateElement) {
        console.error("openCardModal: Elementi DOM per la modale della card non trovati o contenuto non valido.");
        return;
    }
    console.log('openCardModal: Avvio funzione.');

    zoomedCardContent.innerHTML = ''; // Pulisce qualsiasi contenuto precedente
    const clonedForm = formTemplateElement.cloneNode(true); // Clona il template del form
    clonedForm.style.display = 'block';

    zoomedCardContent.appendChild(clonedForm); // Aggiungi il form clonato alla modale
    cardModal.style.display = 'flex'; // Mostra la modale

    // Imposta il flag globale basato sulla provenienza
    isEditingMyGardenPlant = isFromMyGarden;
    console.log('openCardModal: Modale card aperta. Tipo form:', clonedForm.id, 'isEditingMyGardenPlant:', isEditingMyGardenPlant);

    // Resetta le variabili di stato per il ritaglio ogni volta che apriamo la modale
    currentCroppingFile = null;
    currentCroppingImagePreviewElement = null;
    currentCroppingHiddenUrlElement = null;
    isUpdateFormCropping = false;

    // Elementi comuni per la gestione dell'immagine
    const imageUploadInput = clonedForm.querySelector('[id$="ImageUpload"]');
    const imagePreviewElement = clonedForm.querySelector('[id$="ImagePreview"]');
    const imageURLHiddenInput = clonedForm.querySelector('[id$="ImageURL"]');

    // Nuovi campi per il promemoria annaffiatura nel form di update
    const wateringReminderFieldsDiv = clonedForm.querySelector('#wateringReminderFields');
    const wateringIntervalInput = clonedForm.querySelector('#updatePlantWateringIntervalDays');
    const lastWateredDisplay = clonedForm.querySelector('#lastWateredDisplay');
    const wateredTodayButton = clonedForm.querySelector('#wateredTodayButton');


    if (plantData) { // Scenario di aggiornamento
        currentPlantIdToUpdate = plantData.id;
        console.log('openCardModal: Popolamento form di aggiornamento per pianta ID:', currentPlantIdToUpdate);

        // Popola i campi testuali e select
        clonedForm.querySelector('[id$="PlantName"]').value = plantData.name || '';
        clonedForm.querySelector('[id$="PlantSunlight"]').value = plantData.sunlight || '';
        clonedForm.querySelector('[id$="IdealLuxMin"]').value = plantData.idealLuxMin !== null ? plantData.idealLuxMin.toString() : '';
        clonedForm.querySelector('[id$="IdealLuxMax"]').value = plantData.idealLuxMax !== null ? plantData.idealLuxMax.toString() : '';
        clonedForm.querySelector('[id$="PlantWatering"]').value = plantData.watering || '';
        clonedForm.querySelector('[id$="TempMin"]').value = plantData.tempMin !== null ? plantData.tempMin.toString() : '';
        clonedForm.querySelector('[id$="TempMax"]').value = plantData.tempMax !== null ? plantData.tempMax.toString() : '';
        clonedForm.querySelector('[id$="PotSize"]').value = plantData.potSize || '';
        clonedForm.querySelector('[id$="PlantCategory"]').value = plantData.category || '';

        // Gestione dell'immagine per la preview e il campo nascosto
        let displayImage = DEFAULT_PLACEHOLDER_IMAGE;
        if (isFromMyGarden && plantData.userImage) { // Se editing from My Garden AND plant has a userImage
            displayImage = plantData.userImage;
            if (imageURLHiddenInput) imageURLHiddenInput.value = plantData.userImage; // Salva la userImage esistente
            console.log('openCardModal: Visualizzazione userImage esistente in update form.');
        } else if (plantData.image) { // Altrimenti, usa l'immagine generica (dalla pubblica)
            displayImage = plantData.image;
            if (imageURLHiddenInput) imageURLHiddenInput.value = plantData.image; // Salva l'immagine generica esistente
            console.log('openCardModal: Visualizzazione immagine generica esistente in update form.');
        } else {
            // Fallback specifico per categoria se non c'è immagine caricata
            displayImage = CATEGORY_PLACEHOLDER_IMAGES[plantData.category] || DEFAULT_PLACEHOLDER_IMAGE;
            if (imageURLHiddenInput) imageURLHiddenInput.value = ''; // Nessuna immagine diretta
            console.log('openCardModal: Nessuna immagine esistente in update form, usando placeholder per categoria.');
        }
        imagePreviewElement.src = displayImage;
        imagePreviewElement.style.display = 'block';


        // --- Popolamento e visibilità dei campi Promemoria Annaffiatura ---
        if (isFromMyGarden && wateringReminderFieldsDiv) {
            wateringReminderFieldsDiv.style.display = 'block'; // Mostra la sezione
            if (wateringIntervalInput) {
                wateringIntervalInput.value = plantData.wateringIntervalDays !== null ? plantData.wateringIntervalDays.toString() : '';
            }
            if (lastWateredDisplay) {
                lastWateredDisplay.textContent = plantData.lastWateredTimestamp ? new Date(plantData.lastWateredTimestamp.toDate()).toLocaleDateString('it-IT') : 'N/A';
            }
            // Listener per il bottone "Annaffiato Oggi!"
            if (wateredTodayButton) {
                wateredTodayButton.onclick = async () => { // Usa onclick per semplicità di gestione del contesto
                    await updateLastWatered(plantData.id, lastWateredDisplay); // Passa l'elemento per aggiornare la UI
                };
            }
        } else if (wateringReminderFieldsDiv) {
            wateringReminderFieldsDiv.style.display = 'none'; // Nasconde per piante pubbliche
        }


        // Listener per l'input file del form di aggiornamento
        if (imageUploadInput) {
            imageUploadInput.onchange = (event) => {
                console.log('openCardModal: File input change detected for update form.');
                const file = event.target.files[0];
                if (file) {
                    currentCroppingFile = file;
                    currentCroppingImagePreviewElement = imagePreviewElement;
                    currentCroppingHiddenUrlElement = imageURLHiddenInput;
                    isUpdateFormCropping = true;
                    openCropModal(file);
                } else {
                    // Se l'utente annulla la selezione del file, rimuovi l'anteprima e segna per potenziale eliminazione immagine
                    imagePreviewElement.src = CATEGORY_PLACEHOLDER_IMAGES[plantData.category] || DEFAULT_PLACEHOLDER_IMAGE; // Torna al placeholder categoria
                    if (imageURLHiddenInput) imageURLHiddenInput.value = ''; // Segna per rimozione dell'immagine esistente
                    currentCroppingFile = null;
                    console.log('openCardModal: File input annullato per update form.');
                }
            };
        }
    } else { // Scenario di aggiunta nuova pianta (sempre pubblica inizialmente)
        clonedForm.reset();
        clearFormValidationErrors(clonedForm);
        currentPlantIdToUpdate = null;
        isEditingMyGardenPlant = false; // Assicurati che sia false per nuove piante pubbliche

        if (imagePreviewElement) {
            // Per nuova pianta, mostra un placeholder generico iniziale, che poi verrà aggiornato dalla categoria
            imagePreviewElement.src = DEFAULT_PLACEHOLDER_IMAGE;
            imagePreviewElement.style.display = 'block';
        }
        if (imageUploadInput) {
            imageUploadInput.value = ''; // Resetta il campo file input
            imageUploadInput.onchange = (event) => {
                console.log('openCardModal: File input change detected for new plant form.');
                const file = event.target.files[0];
                if (file) {
                    currentCroppingFile = file;
                    currentCroppingImagePreviewElement = imagePreviewElement;
                    isUpdateFormCropping = false;
                    openCropModal(file);
                } else {
                    // Se annulla, torna al placeholder della categoria selezionata (se presente) o al default
                    const selectedCategory = clonedForm.querySelector('#newPlantCategory').value;
                    imagePreviewElement.src = CATEGORY_PLACEHOLDER_IMAGES[selectedCategory] || DEFAULT_PLACEHOLDER_IMAGE;
                    currentCroppingFile = null;
                    console.log('openCardModal: File input annullato per new plant form.');
                }
            };
        }
        // Listener per il cambio di categoria nel form di nuova pianta per aggiornare l'immagine placeholder
        const newPlantCategorySelect = clonedForm.querySelector('#newPlantCategory');
        if (newPlantCategorySelect && imagePreviewElement) {
            newPlantCategorySelect.onchange = () => {
                const selectedCategory = newPlantCategorySelect.value;
                imagePreviewElement.src = CATEGORY_PLACEHOLDER_IMAGES[selectedCategory] || DEFAULT_PLACEHOLDER_IMAGE;
            };
            // Imposta l'immagine iniziale in base alla categoria di default selezionata
            imagePreviewElement.src = CATEGORY_PLACEHOLDER_IMAGES[newPlantCategorySelect.value] || DEFAULT_PLACEHOLDER_IMAGE;
        }

        // Nasconde i campi di promemoria annaffiatura per la creazione di nuove piante pubbliche
        if (wateringReminderFieldsDiv) {
            wateringReminderFieldsDiv.style.display = 'none';
        }
    }

    // Aggiungi listener per i bottoni all'interno del form della modale (Salva/Annulla/Elimina)
    const saveButton = clonedForm.querySelector('#saveNewPlantButton') || clonedForm.querySelector('#saveUpdatePlantButton');
    const cancelButton = clonedForm.querySelector('#cancelNewPlantButton') || clonedForm.querySelector('#cancelUpdatePlantButton');
    const deleteDbButton = clonedForm.querySelector('#deletePlant'); // Solo nel form di update

    if (saveButton) saveButton.addEventListener('click', savePlantToFirestore);
    if (cancelButton) cancelButton.addEventListener('click', closeCardModal);
    if (deleteDbButton) {
        deleteDbButton.addEventListener('click', async (event) => {
            event.stopPropagation(); // Evita che il click si propaghi al parent della modale
            if (currentPlantIdToUpdate) {
                const confirmed = await showConfirmationModal(
                    'Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile e la rimuoverà per tutti gli utenti.'
                );
                if (confirmed) {
                    await deletePlantFromDatabase(currentPlantIdToUpdate);
                }
            }
        });
    }
    console.log('openCardModal: Listeners per bottoni form aggiunti.');
}

/**
 * Aggiorna il timestamp dell'ultima annaffiatura per una pianta specifica nel giardino dell'utente.
 * @param {string} plantId L'ID della pianta da aggiornare.
 * @param {HTMLElement} lastWateredDisplayElement L'elemento HTML dove mostrare la data aggiornata.
 */
async function updateLastWatered(plantId, lastWateredDisplayElement) {
    showLoadingSpinner();
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per aggiornare le annaffiature.", 'info');
        hideLoadingSpinner();
        return;
    }

    try {
        const gardenRef = db.collection('gardens').doc(user.uid);
        const doc = await gardenRef.get();
        if (doc.exists) {
            let currentGardenPlants = doc.data().plants || [];
            const plantIndex = currentGardenPlants.findIndex(p => p.id === plantId);

            if (plantIndex !== -1) {
                // Aggiorna solo il timestamp per questa pianta
                currentGardenPlants[plantIndex].lastWateredTimestamp = firebase.firestore.FieldValue.serverTimestamp();
                await gardenRef.set({ plants: currentGardenPlants }, { merge: true }); // Salva l'intero array aggiornato
                myGarden = currentGardenPlants; // Aggiorna lo stato locale

                // Aggiorna l'elemento di visualizzazione nella modal
                if (lastWateredDisplayElement) {
                    lastWateredDisplayElement.textContent = new Date().toLocaleDateString('it-IT');
                }
                showToast('Annaffiatura registrata!', 'success');
                displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Ridisplay per aggiornare lo stato sulla card
            } else {
                showToast('Pianta non trovata nel tuo giardino.', 'error');
            }
        } else {
            showToast('Il tuo giardino non esiste ancora.', 'info');
        }
    } catch (error) {
        console.error("Errore nell'aggiornamento dell'ultima annaffiatura:", error);
        showToast(`Errore: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}


// Chiude la modal della card completa
function closeCardModal() {
    console.log('closeCardModal: Chiusura modale card.');
    if (cardModal) cardModal.style.display = 'none';
    if (zoomedCardContent) zoomedCardContent.innerHTML = '';
    currentPlantIdToUpdate = null; // Resetta l'ID
    isEditingMyGardenPlant = false; // Resetta il flag
    // Resetta anche lo stato del ritaglio quando si chiude la modale principale
    currentCroppingFile = null;
    currentCroppingImagePreviewElement = null;
    currentCroppingHiddenUrlElement = null;
    isUpdateFormCropping = false;

    hideLoadingSpinner(); // Assicurati che lo spinner sia nascosto
    displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Riapplica i filtri e l'ordinamento
    console.log('closeCardModal: Modale card chiusa.');
}


// NUOVE FUNZIONI PER IL RITAGLIO IMMAGINE
function openCropModal(file) {
    if (!cropModal || !imageToCrop) {
        showToast("Errore: Impossibile avviare il ritaglio. Elementi mancanti.", 'error');
        console.error("openCropModal: Cropping modal elements not found.");
        return;
    }
    console.log('openCropModal: Avvio funzione.');

    const reader = new FileReader();
    reader.onload = (e) => {
        imageToCrop.src = e.target.result;
        cropModal.style.display = 'flex'; // Mostra la modal di ritaglio
        console.log('openCropModal: Immagine caricata nel cropper. Modale ritaglio mostrata.');


        // Distruggi la vecchia istanza di Cropper se esiste
        if (cropper) {
            cropper.destroy();
            console.log('openCropModal: Vecchia istanza Cropper distrutta.');
        }
        // Inizializza Cropper.js sulla nuova immagine
        cropper = new Cropper(imageToCrop, {
            aspectRatio: 1, // Imposta un rapporto 1:1 per il ritaglio (quadrato)
            viewMode: 1, // Definisce la modalità di visualizzazione del cropper
            autoCropArea: 0.8, // Area di ritaglio automatica (80% dell'immagine)
            background: false, // Nessuno sfondo a scacchi
        });
        console.log('openCropModal: Nuova istanza Cropper creata.');
    };
    reader.readAsDataURL(file);
    console.log('openCropModal: Lettura file immagine avviata.');
}

function closeCropModal() {
    console.log('closeCropModal: Chiusura modale ritaglio.');
    if (cropper) {
        cropper.destroy(); // Distrugge l'istanza di Cropper
        cropper = null;
        console.log('closeCropModal: Istanza Cropper distrutta.');
    }
    if (cropModal) {
        cropModal.style.display = 'none'; // Nasconde la modal di ritaglio
        console.log('closeCropModal: Modale ritaglio nascosta.');
    }
    imageToCrop.src = ''; // Pulisce l'immagine nel cropper
    console.log('closeCropModal: Immagine nel cropper pulita.');
}

async function saveCroppedImage() {
    console.log('saveCroppedImage: Avvio funzione.');
    if (!cropper) {
        showToast("Nessuna immagine da ritagliare.", 'error');
        console.log('saveCroppedImage: Nessun cropper attivo. Uscita.');
        return;
    }
    showLoadingSpinner();

    try {
        const croppedCanvas = cropper.getCroppedCanvas();
        console.log('saveCroppedImage: Canvas ritagliato ottenuto.');
        croppedCanvas.toBlob(async (blob) => {
            if (blob) {
                console.log('saveCroppedImage: Blob ritagliato ottenuto.');
                // Creiamo un oggetto File dal Blob per coerenza con uploadImage
                const croppedFile = new File([blob], `cropped_plant_${Date.now()}.png`, { type: 'image/png' });
                currentCroppingFile = croppedFile; // Salva il file ritagliato nella variabile globale
                console.log('saveCroppedImage: File ritagliato creato e assegnato a currentCroppingFile.');

                // Aggiorna l'anteprima nel form (con un URL temporaneo per non aspettare l'upload)
                if (currentCroppingImagePreviewElement) {
                    currentCroppingImagePreviewElement.src = URL.createObjectURL(blob);
                    currentCroppingImagePreviewElement.style.display = 'block';
                    console.log('saveCroppedImage: Anteprima immagine aggiornata.');
                }
                // Se è un update, resetta l'URL nascosto per indicare che c'è un nuovo file
                if (isUpdateFormCropping && currentCroppingHiddenUrlElement) {
                    currentCroppingHiddenUrlElement.value = '';
                    console.log('saveCroppedImage: URL nascosto resettato per update form.');
                }

                closeCropModal(); // Chiudi la modal di ritaglio
                hideLoadingSpinner();
                showToast("Immagine ritagliata con successo!", 'success');
                console.log('saveCroppedImage: Immagine ritagliata e salvata temporaneamente. Funzione completata.');
            } else {
                showToast("Errore durante il ritaglio dell'immagine.", 'error');
                hideLoadingSpinner();
                console.error('saveCroppedImage: Blob non ottenuto dal canvas ritagliato.');
            }
        }, 'image/png', 0.9); // Formato e qualità dell'immagine ritagliata
    } catch (error) {
        console.error("saveCroppedImage: Errore nel salvataggio dell'immagine ritagliata:", error);
        showToast("Errore nel ritaglio: " + error.message, 'error');
        hideLoadingSpinner();
    }
}


// =======================================================
// 8. INIZIALIZZAZIONE E GESTIONE EVENTI DOM
// =======================================================

// Quando il DOM è completamente caricato
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded: Avviato.');

    // Inizializza tutte le variabili DOM qui (corrispondenti agli ID in index.html)
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden');
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    loginButton = document.getElementById('loginButton'); // Corretto da login-button
    registerButton = document.getElementById('registerButton'); // Corretto da register-button
    showLoginLink = document.getElementById('showLogin'); // Corretto da showLogin
    showRegisterLink = document.getElementById('showRegister'); // Corretto da showRegister
    emailInput = document.getElementById('loginEmail');
    passwordInput = document.getElementById('loginPassword');
    loginError = document.getElementById('login-error');
    registerEmailInput = document.getElementById('registerEmail');
    registerPasswordInput = document.getElementById('registerPassword');
    registerError = document.getElementById('register-error');
    authStatusSpan = document.getElementById('auth-status');
    logoutButton = document.getElementById('logoutButton'); // Corretto da logout-button
    searchInput = document.getElementById('searchInput'); // Corretto da search-input
    categoryFilter = document.getElementById('categoryFilter'); // Corretto da category-filter
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    sortBySelect = document.getElementById('sortBy'); // Corretto da sortBySelect

    addNewPlantButton = document.getElementById('addNewPlantButton'); // Corretto da add-new-plant-button
    showAllPlantsButton = document.getElementById('showAllPlantsButton'); // Corretto da show-all-plants-button
    showMyGardenButton = document.getElementById('showMyGardenButton'); // Corretto da show-my-garden-button
    plantsSectionHeader = document.getElementById('plantsSectionHeader'); // Corretto da plants-section-header
    lightSensorContainer = document.getElementById('lightSensorContainer'); // Corretto da light-sensor-container
    startLightSensorButton = document.getElementById('startLightSensorButton'); // Corretto da start-light-sensor
    stopLightSensorButton = document.getElementById('stopLightSensorButton'); // Corretto da stop-light-sensor
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback');
    loadingSpinner = document.getElementById('loading-spinner');
    toastContainer = document.getElementById('toast-container'); // Corretto da toast
    googleLensButton = document.getElementById('googleLensButton');

    // Modali
    imageModal = document.getElementById('image-modal');
    zoomedImage = document.getElementById('zoomed-image');
    closeImageModalButton = document.querySelector('#image-modal .close-button'); // Corretto da close-image-modal (è una classe, non un ID specifico)
    cardModal = document.getElementById('card-modal');
    zoomedCardContent = document.getElementById('zoomed-card-content');
    closeCardModalButton = document.getElementById('close-card-modal');
    emptyGardenMessage = document.getElementById('empty-garden-message')

    // Modale di ritaglio
    cropModal = document.getElementById('crop-modal');
    imageToCrop = document.getElementById('image-to-crop');
    const rotateLeftButton = document.getElementById('rotate-left');
    const rotateRightButton = document.getElementById('rotate-right');
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    const saveCroppedImageButton = document.getElementById('save-cropped-image');
    const cancelCroppingButton = document.getElementById('cancel-cropping');

    // Nuove variabili DOM per controlli sensore/manuale
    autoSensorControls = document.getElementById('autoSensorControls');
    manualLuxInputControls = document.getElementById('manualLuxInputControls');
    manualLuxInput = document.getElementById('manualLuxInput');
    applyManualLuxButton = document.getElementById('applyManualLuxButton');
    currentLuxValueManualSpan = document.getElementById('currentLuxValueManual');

    // Nuova: Modale di conferma personalizzata
    confirmationModal = document.getElementById('confirmation-modal');
    confirmationTitle = document.getElementById('confirmation-title');
    confirmationMessage = document.getElementById('confirmation-message');
    confirmYesButton = document.getElementById('confirm-yes');
    confirmNoButton = document.getElementById('confirm-no');


    // Template dei form (li recuperiamo come nodi DOM da clonare)
    // Usiamo .content per accedere al contenuto del template HTML
    const newPlantFormTemplateDiv = document.getElementById('newPlantFormTemplate');
    const updatePlantFormTemplateDiv = document.getElementById('updatePlantFormTemplate');

    if (newPlantFormTemplateDiv) {
        // Se è un template element, usa .content
        newPlantFormTemplate = newPlantFormTemplateDiv.querySelector('form');
        console.log('DOMContentLoaded: newPlantFormTemplate caricato.');
    } else {
        console.error("DOMContentLoaded: newPlantFormTemplateDiv non trovato! Impossibile inizializzare il template.");
    }
    if (updatePlantFormTemplateDiv) {
        // Se è un template element, usa .content
        updatePlantFormTemplate = updatePlantFormTemplateDiv.querySelector('form');
        console.log('DOMContentLoaded: updatePlantFormTemplate caricato.');
    } else {
        console.error("DOMContentLoaded: updatePlantFormTemplateDiv non trovato! Impossibile inizializzare il template.");
    }

    // Inizializzazione del nuovo bottone "Torna su"
    scrollToTopButton = document.getElementById('scrollToTopButton');


    // Inizializzazione delle variabili DOM per la geolocalizzazione
    getClimateButton = document.getElementById('get-climate-button');
    locationStatusDiv = document.getElementById('location-status');
    weatherForecastDiv = document.getElementById('weatherForecast');
    climateZoneFilter = document.getElementById('climateZoneFilter');

    // Gestisci la visibilità della sezione del sensore di luce all'avvio
    if (!('AmbientLightSensor' in window)) {
        console.log('DOMContentLoaded: AmbientLightSensor NON supportato.');
        if (lightSensorContainer) {
            // Se il sensore non è supportato, nascondi i controlli automatici e mostra quelli manuali
            if (autoSensorControls) autoSensorControls.style.display = 'none';
            if (manualLuxInputControls) manualLuxInputControls.style.display = 'block';
            if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p style="color: blue;">Sensore di luce non supportato dal tuo dispositivo. Inserisci i Lux manualmente.</p>';
            showToast("Sensore di luce ambientale non supportato. Inserisci Lux manualmente.", 'info', 5000);
        }
    } else {
        console.log('DOMContentLoaded: AmbientLightSensor supportato.');
        // Se il sensore è supportato, mostra i controlli automatici e nascondi quelli manuali
        if (autoSensorControls) autoSensorControls.style.display = 'block';
        if (manualLuxInputControls) manualLuxInputControls.style.display = 'none';
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p>Attiva il sensore o inserisci un valore per il feedback specifico sulle piante.</p>'; // Reset default message
        // Add event listeners for the automatic sensor only if supported
        if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
        if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);
    }

    // Always add event listener for manual input button, as it's an alternative
    if (applyManualLuxButton) applyManualLuxButton.addEventListener('click', applyManualLux);


    // Inizializza Firebase all'inizio
    db = firebase.firestore();
    storage = firebase.storage();
    storageRef = storage.ref(); // Ottieni il riferimento al root del tuo Storage
    console.log('DOMContentLoaded: Firebase Firestore e Storage inizializzati.');


    // Event Listeners per l'autenticazione
    // Ho ripristinato gli ID dei bottoni di login/register a quelli che app.js si aspettava
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (showLoginLink) showLoginLink.addEventListener('click', showLoginForm);
    if (showRegisterLink) showRegisterLink.addEventListener('click', showRegisterForm);
    console.log('DOMContentLoaded: Listeners autenticazione aggiunti.');


    // Event Listeners per i filtri e l'ordinamento (usano displayPlants per aggiornare la UI)
    if (searchInput) searchInput.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (categoryFilter) categoryFilter.addEventListener('change', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (climateZoneFilter) climateZoneFilter.addEventListener('change', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (tempMinFilter) tempMinFilter.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (sortBySelect) sortBySelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });
    console.log('DOMContentLoaded: Listeners filtri e ordinamento aggiunti.');


    // Event Listeners per i bottoni di navigazione principale
    if (showAllPlantsButton) showAllPlantsButton.addEventListener('click', displayAllPlants);
    if (showMyGardenButton) showMyGardenButton.addEventListener('click', displayMyGarden);
    // Ora passiamo direttamente la FORM del template, non il DIV contenitore, e il flag isFromMyGarden
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', () => openCardModal(newPlantFormTemplate, null, false));
    if (googleLensButton) {
        googleLensButton.addEventListener('click', () => {
            window.open('https://images.google.com/imghp?hl=it&gws_rd=ssl', '_blank');
            showToast('Verrai reindirizzato alla ricerca per immagine di Google. Carica un\'immagine per l\'identificazione.', 'info');
        });
    }
    console.log('DOMContentLoaded: Listeners bottoni navigazione principale aggiunti.');


    // Event listener per il bottone "Ottieni Clima"
    if (getClimateButton) getClimateButton.addEventListener('click', getLocation);
    console.log('DOMContentLoaded: Listener Ottieni Clima aggiunto.');


    // Gestione clic sulle card delle piante tramite delegazione eventi su gardenContainer e myGardenContainer
    if (gardenContainer) {
        gardenContainer.addEventListener('click', async (event) => {
            const plantCard = event.target.closest('.plant-card');
            if (!plantCard) return; // Non è stata cliccata una card

            const plantId = plantCard.dataset.plantId;
            const plant = allPlants.find(p => p.id === plantId);
            if (!plant) {
                console.error("Listener gardenContainer: Pianta non trovata per l'ID:", plantId);
                return;
            }

            if (event.target.classList.contains('plant-image')) {
                openImageModal(event.target.src);
            } else if (event.target.classList.contains('add-to-garden-button')) {
                await addToMyGarden(plantId);
            } else if (event.target.classList.contains('update-plant-button')) {
                openCardModal(updatePlantFormTemplate, plant, false); // Viene dalla vista "Tutte le Piante" (publica)
            } else if (event.target.classList.contains('delete-plant-from-db-button')) {
                // Sostituito alert con showConfirmationModal
                const confirmed = await showConfirmationModal(
                    'Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile e la rimuoverà per tutti gli utenti.'
                );
                if (confirmed) {
                    await deletePlantFromDatabase(plantId);
                }
            } else {
                // Se cliccato sulla card ma non su un bottone o immagine, mostra i dettagli nella modale
                let detailsHtml = `
                    <div class="plant-details-header">
                        <img src="${plant.image || CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE}" alt="${plant.name}" class="plant-details-image">
                        <h2>${plant.name}</h2>
                    </div>
                    <div class="plant-details-body">
                        <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
                        <p><strong>Esposizione al Sole:</strong> ${plant.sunlight || 'N/A'}</p>
                        <p><strong>Lux Ideali:</strong> ${plant.idealLuxMin !== null && plant.idealLuxMax !== null ? `${plant.idealLuxMin} - ${plant.idealLuxMax}` : 'N/A'}</p>
                        <p><strong>Annaffiatura:</strong> ${plant.watering || 'N/A'}</p>
                        <p><strong>Temperatura Ideale:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
                        <p><strong>Dimensione Vaso:</strong> ${plant.potSize || 'N/A'}</p>
                        <p><strong>Aggiunta il:</strong> ${plant.createdAt ? new Date(plant.createdAt.toDate()).toLocaleDateString('it-IT') : 'N/A'}</p>
                    </div>
                `;
                zoomedCardContent.innerHTML = detailsHtml;
                cardModal.style.display = 'flex';
            }
        });
    }

    if (myGardenContainer) {
        myGardenContainer.addEventListener('click', async (event) => {
            const plantCard = event.target.closest('.plant-card');
            if (!plantCard) return;

            const plantId = plantCard.dataset.plantId;
            const plant = myGarden.find(p => p.id === plantId);
            if (!plant) {
                console.error("Listener myGardenContainer: Pianta non trovata per l'ID:", plantId);
                return;
            }

            if (event.target.classList.contains('plant-image')) {
                openImageModal(event.target.src);
            } else if (event.target.classList.contains('remove-button')) {
                // Sostituito alert con showConfirmationModal
                const confirmed = await showConfirmationModal(
                    'Sei sicuro di voler rimuovere questa pianta dal tuo giardino? Questa azione non elimina la pianta dal database pubblico.'
                );
                if (confirmed) {
                    await removeFromMyGarden(plantId);
                }
            } else if (event.target.classList.contains('update-plant-button')) {
                openCardModal(updatePlantFormTemplate, plant, true); // Viene dalla vista "Mio Giardino"
            } else if (event.target.classList.contains('delete-plant-from-db-button')) {
                // Sostituito alert con showConfirmationModal
                const confirmed = await showConfirmationModal(
                    'Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile e la rimuoverà per tutti gli utenti.'
                );
                if (confirmed) {
                    await deletePlantFromDatabase(plantId);
                }
            } else {
                // Mostra dettagli
                let detailsHtml = `
                    <div class="plant-details-header">
                        <img src="${plant.userImage || plant.image || CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE}" alt="${plant.name}" class="plant-details-image">
                        <h2>${plant.name}</h2>
                    </div>
                    <div class="plant-details-body">
                        <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
                        <p><strong>Esposizione al Sole:</strong> ${plant.sunlight || 'N/A'}</p>
                        <p><strong>Lux Ideali:</strong> ${plant.idealLuxMin !== null && plant.idealLuxMax !== null ? `${plant.idealLuxMin} - ${plant.idealLuxMax}` : 'N/A'}</p>
                        <p><strong>Annaffiatura:</strong> ${plant.watering || 'N/A'}</p>
                        <p><strong>Temperatura Ideale:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
                        <p><strong>Dimensione Vaso:</strong> ${plant.potSize || 'N/A'}</p>
                        <p><strong>Aggiunta il:</strong> ${plant.createdAt ? new Date(plant.createdAt.toDate()).toLocaleDateString('it-IT') : 'N/A'}</p>
                        <!-- Dettagli Promemoria Annaffiatura nella visualizzazione dei dettagli -->
                        <p><strong>Intervallo Annaffiatura:</strong> ${plant.wateringIntervalDays ? `${plant.wateringIntervalDays} giorni` : 'N/A'}</p>
                        <p><strong>Ultima Annaffiatura:</strong> ${plant.lastWateredTimestamp ? new Date(plant.lastWateredTimestamp.toDate()).toLocaleDateString('it-IT') : 'N/A'}</p>
                    </div>
                `;
                zoomedCardContent.innerHTML = detailsHtml;
                cardModal.style.display = 'flex';
            }
        });
    }
    console.log('DOMContentLoaded: Listeners click card piante aggiunti.');


    // Chiusura modali (listener per il click sul bottone 'x' e sullo sfondo della modale)
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => { imageModal.style.display = 'none'; });
    if (imageModal) imageModal.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.style.display = 'none'; });
    console.log('DOMContentLoaded: Listeners chiusura modale immagine aggiunti.');


    if (closeCardModalButton) closeCardModalButton.addEventListener('click', closeCardModal); // Chiude la modale con la funzione che pulisce e resetta
    if (cardModal) cardModal.addEventListener('click', (e) => { if (e.target === cardModal) closeCardModal(); });
    console.log('DOMContentLoaded: Listeners chiusura modale card aggiunti.');


    // Event listeners per la modal di ritaglio
    if (rotateLeftButton) rotateLeftButton.addEventListener('click', () => cropper && cropper.rotate(-90));
    if (rotateRightButton) rotateRightButton.addEventListener('click', () => cropper && cropper.rotate(90));
    if (zoomInButton) zoomInButton.addEventListener('click', () => cropper && cropper.zoom(0.1));
    if (zoomOutButton) zoomOutButton.addEventListener('click', () => cropper && cropper.zoom(-0.1));
    if (saveCroppedImageButton) saveCroppedImageButton.addEventListener('click', saveCroppedImage);
    if (cancelCroppingButton) cancelCroppingButton.addEventListener('click', closeCropModal);
    if (cropModal) cropModal.addEventListener('click', (e) => { // Chiudi cliccando sullo sfondo
        if (e.target === cropModal) closeCropModal();
    });
    console.log('DOMContentLoaded: Listeners modale ritaglio aggiunti.');


    // Gestione bottone "Torna su"
    if (scrollToTopButton && appContentDiv) {
        // Mostra/nascondi il bottone in base allo scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 200) { // Mostra il bottone dopo 200px di scroll
                scrollToTopButton.style.display = 'flex';
            } else {
                scrollToTopButton.style.display = 'none';
            }
        });
        // Scrolla all'inizio della sezione 'app-content'
        scrollToTopButton.addEventListener('click', () => {
            appContentDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
    console.log('DOMContentLoaded: Listeners bottone "Torna su" aggiunti.');


    // Gestione dello stato di autenticazione iniziale
    firebase.auth().onAuthStateChanged(async user => {
        console.log('DOMContentLoaded: onAuthStateChanged triggerato.');
        await updateUIforAuthState(user);
        console.log('DOMContentLoaded: updateUIforAuthState completato.');
    });
    console.log('DOMContentLoaded: Listener onAuthStateChanged configurato.');

});
