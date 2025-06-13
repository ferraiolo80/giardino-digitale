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
        showFormValidationError(wateringInput ? wateringInput.id : null, 'L\'annaffiatura è obbligatoria.');
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
        displayAllPlants(); // Chiamata corretta alla funzione wrapper

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
 * @param {string} folderPath - Il percorso della cartella in Storage (es. 'plant_images').
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
        // Genera un nome file unico per evitare collisioni
        const fileName = `${Date.now()}_${file.name}`;
        // Crea un riferimento al percorso specifico nel tuo storage
        const storageRefChild = storageRef.child(`${folderPath}/${fileName}`);
        // Carica il file
        const snapshot = await storageRefChild.put(file);
        // Ottieni l'URL di download
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
    // Non tentare di eliminare immagini placeholder o quelle di placehold.co
    if (!imageUrl || imageUrl.includes('placehold.co') || imageUrl.startsWith('data:image')) {
        console.log('Delete Image: Nessun URL immagine valido, è un placeholder o un Data URL. Salto eliminazione.');
        return;
    }
    console.log('Delete Image: Inizio eliminazione immagine da Storage:', imageUrl);
    try {
        const imageRef = storage.refFromURL(imageUrl);
        await imageRef.delete();
        console.log("Delete Image: Immagine eliminata con successo da Storage:", imageUrl);
    } catch (error) {
        // Ignora l'errore se l'immagine non esiste (es. "object not found"), altrimenti logga.
        if (error.code === 'storage/object-not-found') {
            console.warn("Delete Image: Immagine non trovata in Storage, probabilmente già eliminata:", imageUrl);
        } else {
            console.error("Delete Image: Errore nell'eliminazione dell'immagine da Storage:", error);
            // Non mostrare toast all'utente per errori di eliminazione immagine, potrebbero essere immagini predefinite o già eliminate.
        }
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
        potSize: form.querySelector('[id$="PotSize"]') ? form.querySelector('[id$="PotSize"]').value.trim() : null,
        description: form.querySelector('[id$="Description"]') ? form.querySelector('[id$="Description"]').value.trim() : null,
        category: form.querySelector('[id$="PlantCategory"]').value,
    };

    let oldPublicImageUrlToDelete = null; // To track public image in storage that needs deletion

    try {
        const user = firebase.auth().currentUser;
        if (!user) { throw new Error("Utente non autenticato per salvare."); }

        if (form.id === 'updatePlantFormContent') { // Stiamo modificando una pianta (sia nel giardino che pubblica)
            console.log('savePlantToFirestore: Modifica di una pianta esistente.');

            let isGardenPlantUpdate = false;
            // Determina se la pianta in update è nel giardino personale dell'utente
            const existingMyGardenPlant = myGarden.find(p => p.id === currentPlantIdToUpdate);
            if (existingMyGardenPlant) {
                isGardenPlantUpdate = true;
                console.log('savePlantToFirestore: Si tratta di una pianta nel Mio Giardino.');
            } else {
                console.log('savePlantToFirestore: Si tratta di una pianta pubblica.');
            }

            // --- Gestione dell'immagine (solo immagine pubblica ora) ---
            const updateImageUploadInput = form.querySelector('#updatePlantImageUpload');
            const updateImageURLHiddenInput = form.querySelector('#updatePlantImageURL');

            // Scenario 1: Nuova immagine selezionata e ritagliata (currentCroppingFile è un Blob)
            if (currentCroppingFile instanceof Blob) {
                // Se c'è una vecchia immagine pubblica (non placeholder), marchiamola per l'eliminazione
                const currentPlantData = isGardenPlantUpdate ? existingMyGardenPlant : allPlants.find(p => p.id === currentPlantIdToUpdate);
                if (currentPlantData && currentPlantData.image && !currentPlantData.image.includes('placehold.co')) {
                    oldPublicImageUrlToDelete = currentPlantData.image;
                    console.log('savePlantToFirestore: Vecchia immagine pubblica marcata per eliminazione (nuova ritagliata):', oldPublicImageUrlToDelete);
                }
                plantData.image = await uploadImage(currentCroppingFile, 'plant_images');
                console.log('savePlantToFirestore: Nuova immagine pubblica caricata (ritagliata):', plantData.image);
            }
            // Scenario 2: L'utente ha svuotato il campo file (e l'hidden input) per rimuovere l'immagine
            else if (updateImageURLHiddenInput && updateImageURLHiddenInput.value === '') {
                // Se c'è una vecchia immagine pubblica (non placeholder), marchiamola per l'eliminazione
                const currentPlantData = isGardenPlantUpdate ? existingMyGardenPlant : allPlants.find(p => p.id === currentPlantIdToUpdate);
                 if (currentPlantData && currentPlantData.image && !currentPlantData.image.includes('placehold.co')) {
                    oldPublicImageUrlToDelete = currentPlantData.image;
                    console.log('savePlantToFirestore: Vecchia immagine pubblica marcata per eliminazione (rimozione esplicita):', oldPublicImageUrlToDelete);
                }
                plantData.image = firebase.firestore.FieldValue.delete(); // Rimuovi esplicitamente il campo
                console.log('savePlantToFirestore: Immagine pubblica rimossa esplicitamente.');
            }
            // Scenario 3: Nessuna nuova immagine, mantieni quella esistente (o il placeholder)
            else {
                const currentPlantData = isGardenPlantUpdate ? existingMyGardenPlant : allPlants.find(p => p.id === currentPlantIdToUpdate);
                plantData.image = currentPlantData ? currentPlantData.image : null; // Mantiene l'immagine pubblica esistente
                console.log('savePlantToFirestore: Nessun nuovo file o rimozione esplicita, immagine pubblica mantenuta:', plantData.image);
            }

            // Assicurati che il campo userImage non esista o venga rimosso per tutte le piante
            // Questo campo non è più supportato nel nuovo modello unificato.
            delete plantData.userImage;


            if (isGardenPlantUpdate) {
                // Aggiornamento di una pianta nel giardino dell'utente
                const gardenRef = db.collection('gardens').doc(user.uid);
                let currentGardenPlants = (await gardenRef.get()).data().plants || [];
                const plantIndex = currentGardenPlants.findIndex(p => p.id === currentPlantIdToUpdate);

                if (plantIndex !== -1) {
                    // Unisci i campi aggiornati con quelli esistenti, ma solo i campi rilevanti per il giardino
                    // Manteniamo i campi originali che non vengono modificati dal form (come createdAt, ownerId della pianta pubblica)
                    currentGardenPlants[plantIndex] = {
                        ...currentGardenPlants[plantIndex], // Mantieni tutti i campi originali della pianta nel giardino
                        ...plantData, // Sovrascrivi con i nuovi dati dalla form (incluso il campo 'image' unificato)
                        // Aggiungiamo solo i campi specifici del giardino se sono stati modificati
                        wateringIntervalDays: form.querySelector('#wateringReminderFields').style.display !== 'none' ? (form.querySelector('#updatePlantWateringIntervalDays').value.trim() !== '' ? parseInt(form.querySelector('#updatePlantWateringIntervalDays').value.trim(), 10) : null) : currentGardenPlants[plantIndex].wateringIntervalDays,
                        lastWateredTimestamp: currentGardenPlants[plantIndex].lastWateredTimestamp // lastWateredTimestamp è gestito dal bottone "Annaffiato Oggi!"
                    };
                    await gardenRef.set({ plants: currentGardenPlants });
                    myGarden = currentGardenPlants; // Aggiorna lo stato locale
                    showToast('Pianta nel tuo giardino aggiornata con successo!', 'success');
                    console.log('savePlantToFirestore: Pianta nel giardino aggiornata in Firestore.');
                } else {
                    throw new Error("Pianta non trovata nel tuo giardino per l'aggiornamento.");
                }
            } else {
                // Aggiornamento di una pianta pubblica
                const publicPlantRef = db.collection('plants').doc(currentPlantIdToUpdate);
                await publicPlantRef.update({
                    ...plantData,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                showToast('Pianta pubblica aggiornata con successo!', 'success');
                console.log('savePlantToFirestore: Pianta pubblica aggiornata in Firestore.');
            }

        } else { // Stiamo aggiungendo una nuova pianta pubblica
            console.log('savePlantToFirestore: Aggiunta nuova pianta pubblica.');
            const newPlantImageUploadInput = form.querySelector('#newPlantImageUpload');

            if (currentCroppingFile instanceof Blob) {
                plantData.image = await uploadImage(currentCroppingFile, 'plant_images');
            } else if (newPlantImageUploadInput && newPlantImageUploadInput.files[0]) {
                // Fallback se per qualche motivo il cropper non è stato usato/disponibile
                console.warn('savePlantToFirestore: Un file è stato selezionato ma non ritagliato per nuova pianta pubblica. Caricamento diretto.');
                plantData.image = await uploadImage(newPlantImageUploadInput.files[0], 'plant_images');
            } else {
                plantData.image = null; // Nessuna immagine selezionata
            }

            plantData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            plantData.ownerId = user.uid; // Imposta ownerId per la nuova pianta pubblica

            // Assicurati che i campi specifici del giardino non vengano aggiunti alle piante pubbliche
            delete plantData.wateringIntervalDays;
            delete plantData.lastWateredTimestamp;
            delete plantData.userImage; // Assicurati che non sia mai presente

            await db.collection('plants').add(plantData);
            showToast('Nuova pianta pubblica aggiunta con successo!', 'success');
            console.log('savePlantToFirestore: Nuova pianta pubblica aggiunta in Firestore.');
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
        if (oldPublicImageUrlToDelete) {
            console.log('savePlantToFirestore: Inizio eliminazione immagine obsoleta dallo storage.');
            await deleteImage(oldPublicImageUrlToDelete);
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


/**
 * Elimina una pianta dal database Firestore e dal giardino di tutti gli utenti.
 * @param {string} plantId - L'ID della pianta da eliminare.
 */
async function deletePlantFromDatabase(plantId) {
    showLoadingSpinner();
    console.log('deletePlantFromDatabase: Avviato per ID:', plantId);
    try {
        const plantDoc = await db.collection('plants').doc(plantId).get();
        if (!plantDoc.exists) {
            showToast('Pianta non trovata nel database pubblico.', 'error');
            console.log('deletePlantFromDatabase: Pianta non trovata nel database pubblico.');
            hideLoadingSpinner();
            return;
        }
        const plantData = plantDoc.data();
        console.log('deletePlantFromDatabase: Dati pianta recuperati:', plantData);

        // La conferma è già stata gestita dalla funzione chiamante showConfirmationModal()

        // 1. Elimina l'immagine associata da Storage (immagine pubblica)
        if (plantData.image) { // Potrebbe essere null o un placeholder
            console.log('deletePlantFromDatabase: Tentativo di eliminare immagine associata (pubblica).');
            await deleteImage(plantData.image);
            console.log('deletePlantFromDatabase: Immagine associata (pubblica) gestita.');
        }

        // 2. Elimina la pianta dalla collezione 'plants'
        console.log('deletePlantFromDatabase: Eliminazione pianta dalla collezione plants.');
        await db.collection('plants').doc(plantId).delete();
        showToast('Pianta eliminata con successo dal database!', 'success');
        console.log('deletePlantFromDatabase: Pianta eliminata dal database.');

        // 3. Rimuovi la pianta dal giardino di OGNI utente
        console.log('deletePlantFromDatabase: Rimozione pianta dai giardini degli utenti.');
        const gardensSnapshot = await db.collection('gardens').get();
        const batch = db.batch(); // Inizializza un batch per aggiornamenti multipli

        for (const doc of gardensSnapshot.docs) {
            let currentGardenPlants = doc.data().plants || [];
            // Ora, se la pianta è nel giardino, la rimuoviamo, ma non ci preoccupiamo di userImage
            const updatedGardenPlants = currentGardenPlants.filter(plant => plant.id !== plantId);
            if (updatedGardenPlants.length !== currentGardenPlants.length) { // Se la pianta è stata effettivamente rimossa dal giardino
                batch.update(doc.ref, { plants: updatedGardenPlants });
                console.log(`deletePlantFromDatabase: Marcato giardino di ${doc.id} per aggiornamento.`);
            }
        }
        await batch.commit(); // Esegui tutte le operazioni batch
        console.log('deletePlantFromDatabase: Aggiornamento batch dei giardini completato.');

        closeCardModal(); // Chiude la modale dopo l'eliminazione
        await fetchPlantsFromFirestore(); // Aggiorna allPlants
        await fetchMyGardenFromFirebase(); // Aggiorna myGarden
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Aggiorna la UI
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
            // Crea una copia della pianta, ma con i campi specifici del giardino inizializzati
            currentGardenPlants.push({
                id: plantToAdd.id,
                name: plantToAdd.name,
                category: plantToAdd.category,
                image: plantToAdd.image || null, // L'immagine è sempre quella pubblica
                sunlight: plantToAdd.sunlight,
                watering: plantToAdd.watering,
                idealLuxMin: plantToAdd.idealLuxMin,
                idealLuxMax: plantToAdd.idealLuxMax,
                tempMin: plantToAdd.tempMin,
                tempMax: plantToAdd.tempMax,
                potSize: plantToAdd.potSize || null,
                description: plantToAdd.description || null,
                createdAt: plantToAdd.createdAt || firebase.firestore.FieldValue.serverTimestamp(), // Usa createdAt della pianta pubblica
                // Nuovi campi per il promemoria annaffiatura, inizializzati a null o default
                wateringIntervalDays: null,
                lastWateredTimestamp: null
            });
            console.log('addToMyGarden: Aggiornamento documento giardino con nuova pianta.');
            await gardenRef.set({ plants: currentGardenPlants }); // Set the whole array
            myGarden = currentGardenPlants;
            showToast('Pianta aggiunta al tuo giardino!', 'success');
            // Non è necessario un re-fetch completo qui, basta aggiornare la visualizzazione
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

            const updatedGardenPlants = currentGardenPlants.filter(plant => plant.id !== plantId);

            if (updatedGardenPlants.length !== currentGardenPlants.length) {
                // Non c'è più una userImage da eliminare, solo l'immagine pubblica che non viene eliminata qui
                console.log('removeFromMyGarden: Aggiornamento documento giardino con pianta rimossa.');
                await gardenRef.set({ plants: updatedGardenPlants });
                myGarden = updatedGardenPlants; // Aggiorna l'array locale
                showToast('Pianta rimossa dal tuo giardino!', 'info');
                // Non è necessario un re-fetch completo qui, basta aggiornare la visualizzazione
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
                currentGardenPlants[plantIndex].lastWateredTimestamp = firebase.firestore.FieldValue.serverTimestamp(); // Usa serverTimestamp per consistenza
                await gardenRef.set({ plants: currentGardenPlants }); // Salva
                myGarden = currentGardenPlants; // Aggiorna lo stato locale

                // Aggiorna la UI del promemoria annaffiatura nel modale
                // Quando si usa serverTimestamp, il valore non è immediatamente disponibile
                // in locale come oggetto Date. Potremmo dover re-fetchare o visualizzare "Ora"
                // e poi l'utente vedrà il valore aggiornato dopo un refresh.
                // Per feedback immediato, mostriamo la data attuale del client.
                const now = new Date();
                lastWateredDisplayElement.textContent = `Ultima annaffiatura: Oggi (${now.toLocaleDateString()})`;
                showToast('Annaffiatura registrata!', 'success');
                console.log(`Annaffiatura registrata per pianta ID: ${plantId}`);
                 // Forziamo un ri-render per aggiornare lo stato sulla card principale
                displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
            } else {
                showToast("Pianta non trovata nel tuo giardino.", 'error');
                console.warn(`Tentativo di aggiornare annaffiatura per pianta ID ${plantId} non trovata.`);
            }
        } else {
            showToast("Il tuo giardino è vuoto.", 'info');
        }
    } catch (error) {
        console.error("Errore nell'aggiornamento dell'ultima annaffiatura:", error);
        showToast(`Errore: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}


// Recupera tutte le piante dalla collezione 'plants' di Firestore
async function fetchPlantsFromFirestore() {
    showLoadingSpinner();
    console.log('fetchPlantsFromFirestore: Avviato recupero piante.');
    try {
        const querySnapshot = await db.collection('plants').get();
        allPlants = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('fetchPlantsFromFirestore: Piante caricate da Firestore:', allPlants.length);
    } catch (error) {
        console.error("fetchPlantsFromFirestore: Errore nel recupero delle piante:", error);
        showToast(`Errore nel caricamento piante: ${error.message}`, 'error');
        allPlants = []; // Assicurati che l'array sia vuoto in caso di errore
    } finally {
        hideLoadingSpinner();
    }
}

// Recupera le piante specifiche del giardino dell'utente
async function fetchMyGardenFromFirebase() {
    showLoadingSpinner();
    console.log('fetchMyGardenFromFirebase: Avviato recupero giardino utente.');
    const user = firebase.auth().currentUser;
    if (!user) {
        myGarden = [];
        console.log('fetchMyGardenFromFirebase: Utente non autenticato, giardino vuoto.');
        hideLoadingSpinner();
        return;
    }

    try {
        const gardenDoc = await db.collection('gardens').doc(user.uid).get();
        if (gardenDoc.exists) {
            myGarden = gardenDoc.data().plants || [];
            // Assicurati che i Timestamp di Firestore vengano convertiti in Date per la visualizzazione,
            // ma rimangano come Timestamp per la persistenza se ricaricati e salvati.
            // La logica di update dovrebbe gestire i Timestamp direttamente.
            myGarden = myGarden.map(plant => ({
                ...plant,
                lastWateredTimestamp: plant.lastWateredTimestamp instanceof firebase.firestore.Timestamp ? plant.lastWateredTimestamp : null,
                createdAt: plant.createdAt instanceof firebase.firestore.Timestamp ? plant.createdAt : null,
            }));

            console.log('fetchMyGardenFromFirebase: Giardino caricato da Firebase:', myGarden.length);
        } else {
            myGarden = [];
            console.log('fetchMyGardenFromFirebase: Nessun documento giardino trovato per l\'utente.');
        }
    } catch (error) {
        console.error("fetchMyGardenFromFirebase: Errore nel recupero del giardino:", error);
        showToast(`Errore nel caricamento del tuo giardino: ${error.message}`, 'error');
        myGarden = []; // Assicurati che l'array sia vuoto in caso di errore
    } finally {
        hideLoadingSpinner();
    }
}

// =======================================================
// 4. LOGICA DI VISUALIZZAZIONE E FILTRI
// =======================================================

/**
 * Funzione wrapper per mostrare tutte le piante (galleria principale).
 * Usata per il caricamento iniziale e il bottone "Piante di Tutti".
 */
function displayAllPlants() {
    showAllPlantsButton.classList.add('active');
    showMyGardenButton.classList.remove('active');
    isMyGardenCurrentlyVisible = false; // Assicura che questo flag sia impostato correttamente
    displayPlants(allPlants); // Chiama la logica di visualizzazione principale
}


// Mostra le piante nel DOM (sia allPlants che myGarden a seconda del flag)
function displayPlants(plantsToDisplay) {
    console.log(`displayPlants: Visualizzazione di ${plantsToDisplay.length} piante.`);
    const container = isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer;
    const otherContainer = isMyGardenCurrentlyVisible ? gardenContainer : myGardenContainer;

    if (!container) {
        console.error('displayPlants: Contenitore piante non trovato!');
        return;
    }

    container.innerHTML = ''; // Pulisci il contenitore attuale
    otherContainer.innerHTML = ''; // Pulisci anche l'altro contenitore per sicurezza
    otherContainer.style.display = 'none'; // Nascondi l'altro contenitore

    if (isMyGardenCurrentlyVisible) {
        plantsSectionHeader.textContent = 'Le Mie Piante nel Giardino';
        myGardenContainer.style.display = 'grid';
        gardenContainer.style.display = 'none';
        if (plantsToDisplay.length === 0) {
            emptyGardenMessage.style.display = 'block';
        } else {
            emptyGardenMessage.style.display = 'none';
        }
    } else {
        plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
        gardenContainer.style.display = 'grid';
        myGardenContainer.style.display = 'none';
        emptyGardenMessage.style.display = 'none'; // Nascondi sempre per la vista "Tutte le Piante"
    }


    if (plantsToDisplay.length === 0 && !isMyGardenCurrentlyVisible) {
        // Mostra un messaggio se non ci sono piante nella galleria pubblica
        container.innerHTML = `<p class="info-message">Nessuna pianta disponibile con i criteri di ricerca/filtro attuali. Prova a rimuovere i filtri o aggiungine una!</p>`;
        return;
    }


    // Applica filtri e ordinamento
    const filteredAndSortedPlants = applyFiltersAndSort(plantsToDisplay);

    if (filteredAndSortedPlants.length === 0) {
         if (isMyGardenCurrentlyVisible) {
             emptyGardenMessage.style.display = 'block';
             myGardenContainer.innerHTML = ''; // Assicurati che sia vuoto se il messaggio è mostrato
         } else {
            container.innerHTML = `<p class="info-message">Nessuna pianta trovata con i filtri applicati. Prova a cambiare i criteri di ricerca/filtro.</p>`;
         }
         return;
    }

    filteredAndSortedPlants.forEach(plant => {
        const plantCard = document.createElement('div');
        plantCard.classList.add('plant-card');
        plantCard.dataset.id = plant.id; // Imposta l'ID della pianta come data attribute

        // L'immagine è sempre il campo 'image' ora
        const imageUrl = plant.image || CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE;

        // Determina lo stato del bottone "Aggiungi al mio Giardino"
        let addToGardenButtonHtml = '';
        const user = firebase.auth().currentUser;
        const isInMyGarden = user && myGarden.some(p => p.id === plant.id);

        if (user) {
            addToGardenButtonHtml = `<button class="action-button add-to-garden-button" data-id="${plant.id}" ${isInMyGarden ? 'disabled' : ''}>${isInMyGarden ? '<i class="fas fa-check"></i> Già nel Giardino' : '<i class="fas fa-plus-circle"></i> Aggiungi al mio Giardino'}</button>`;
        } else {
            addToGardenButtonHtml = `<button class="action-button add-to-garden-button" disabled title="Accedi per aggiungere"><i class="fas fa-plus-circle"></i> Aggiungi al mio Giardino</button>`;
        }
        
        const removeFromGardenButtonHtml = isMyGardenCurrentlyVisible ?
            `<button class="action-button remove-from-garden-button" data-id="${plant.id}"><i class="fas fa-minus-circle"></i> Rimuovi dal Giardino</button>` : '';

        // Dettagli del promemoria annaffiatura per le piante nel giardino
        let wateringReminderHtml = '';
        if (isMyGardenCurrentlyVisible && plant.wateringIntervalDays && plant.lastWateredTimestamp) {
            const nextWateringDate = calculateNextWateringDate(plant);
            const today = new Date();
            today.setHours(0,0,0,0); // Normalizza a inizio giornata per confronto

            if (nextWateringDate && nextWateringDate <= today) {
                wateringReminderHtml = `<p class="text-red-600 font-bold"><i class="fas fa-tint"></i> Annaffia Oggi / Urgente!</p>`;
            } else if (nextWateringDate) {
                wateringReminderHtml = `<p class="text-green-600"><i class="fas fa-tint"></i> Prossima: ${nextWateringDate.toLocaleDateString('it-IT')}</p>`;
            }
        } else if (isMyGardenCurrentlyVisible) {
            wateringReminderHtml = `<p class="text-gray-500"><i class="fas fa-tint"></i> Intervallo annaffiatura non impostato.</p>`;
        }

        plantCard.innerHTML = `
            <img src="${imageUrl}" alt="${plant.name}" class="plant-image" onerror="this.onerror=null;this.src='${CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE}';">
            <h3>${plant.name}</h3>
            <p><strong>Categoria:</strong> ${plant.category}</p>
            <p><strong>Esposizione al Sole:</strong> ${plant.sunlight}</p>
            <p><strong>Annaffiatura:</strong> ${plant.watering}</p>
            ${wateringReminderHtml}
            <div class="card-actions">
                ${isMyGardenCurrentlyVisible ? removeFromGardenButtonHtml : addToGardenButtonHtml}
                <button class="action-button view-details-button" data-id="${plant.id}"><i class="fas fa-info-circle"></i> Dettagli</button>
            </div>
        `;
        container.appendChild(plantCard);
    });

    // Aggiungi event listener ai nuovi bottoni "Aggiungi al mio Giardino"
    container.querySelectorAll('.add-to-garden-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const plantId = e.currentTarget.dataset.id;
            addToMyGarden(plantId);
        });
    });

    // Aggiungi event listener ai bottoni "Rimuovi dal Giardino"
    container.querySelectorAll('.remove-from-garden-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const plantId = e.currentTarget.dataset.id;
            removeFromMyGarden(plantId);
        });
    });

    // Aggiungi event listener ai bottoni "Dettagli"
    container.querySelectorAll('.view-details-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const plantId = e.currentTarget.dataset.id;
            const plant = (isMyGardenCurrentlyVisible ? myGarden : allPlants).find(p => p.id === plantId);
            if (plant) {
                showPlantDetails(plant, isMyGardenCurrentlyVisible);
            }
        });
    });

    // Aggiungi event listener per zoom immagine
    container.querySelectorAll('.plant-image').forEach(img => {
        img.addEventListener('click', (e) => {
            openImageModal(e.target.src);
        });
    });
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
    // Assicurati che lastWateredTimestamp sia un oggetto Date per i calcoli
    const lastWateredDate = plant.lastWateredTimestamp instanceof firebase.firestore.Timestamp ? plant.lastWateredTimestamp.toDate() : new Date(plant.lastWateredTimestamp);
    const nextWateringDate = new Date(lastWateredDate);
    nextWateringDate.setDate(lastWateredDate.getDate() + plant.wateringIntervalDays);
    return nextWateringDate;
}

// Funzione per applicare i filtri e l'ordinamento
function applyFiltersAndSort(plants) {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const climateZone = climateZoneFilter.value;
    const tempMin = parseFloat(tempMinFilter.value);
    const tempMax = parseFloat(tempMaxFilter.value);

    let filteredPlants = plants.filter(plant => {
        const matchesSearch = (plant.name && plant.name.toLowerCase().includes(searchTerm)) ||
                              (plant.description && plant.description.toLowerCase().includes(searchTerm)) ||
                              (plant.potSize && plant.potSize.toLowerCase().includes(searchTerm));
        const matchesCategory = category === 'all' || (plant.category && plant.category === category);
        
        let matchesClimate = true;
        if (climateZone && CLIMATE_TEMP_RANGES[climateZone]) {
            const climateRange = CLIMATE_TEMP_RANGES[climateZone];
            // Se la pianta non ha dati di temperatura, non la escludiamo dal filtro climatico
            // Se invece ha dati, li confrontiamo.
            matchesClimate = (plant.tempMin === null || plant.tempMax === null || isNaN(plant.tempMin) || isNaN(plant.tempMax)) ||
                             (plant.tempMin <= climateRange.max && plant.tempMax >= climateRange.min);
        }

        const matchesTempRange = (isNaN(tempMin) || (plant.tempMax !== null && plant.tempMax >= tempMin)) &&
                                 (isNaN(tempMax) || (plant.tempMin !== null && plant.tempMin <= tempMax));

        return matchesSearch && matchesCategory && matchesClimate && matchesTempRange;
    });

    // Ordina i risultati
    const [sortByField, sortOrder] = currentSortBy.split('_');

    filteredPlants.sort((a, b) => {
        let valA, valB;

        if (sortByField === 'name') {
            valA = (a.name || '').toLowerCase();
            valB = (b.name || '').toLowerCase();
        } else if (sortByField === 'category') {
            valA = (a.category || '').toLowerCase();
            valB = (b.category || '').toLowerCase();
        } else {
            // Default o fallback
            valA = (a.name || '').toLowerCase();
            valB = (b.name || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return filteredPlants;
}


// Funzione per mostrare i dettagli di una pianta in una modale (per modifica/visualizzazione)
function showPlantDetails(plant, isGardenPlant = false) {
    console.log('showPlantDetails: Visualizzazione dettagli pianta:', plant.id, plant.name, 'isGardenPlant:', isGardenPlant);
    currentPlantIdToUpdate = plant.id;
    isEditingMyGardenPlant = isGardenPlant; // Imposta il flag globale

    zoomedCardContent.innerHTML = ''; // Pulisci il contenuto precedente

    // Clona il template del form di aggiornamento
    const updateFormClone = document.getElementById('updatePlantFormTemplate').content.cloneNode(true);
    const formElement = updateFormClone.querySelector('form');
    zoomedCardContent.appendChild(updateFormClone);

    // Riferimenti agli input del form di aggiornamento
    const updatePlantNameInput = formElement.querySelector('#updatePlantName');
    const updatePlantSunlightSelect = formElement.querySelector('#updatePlantSunlight');
    const updatePlantIdealLuxMinInput = formElement.querySelector('#updatePlantIdealLuxMin');
    const updatePlantIdealLuxMaxInput = formElement.querySelector('#updatePlantIdealLuxMax');
    const updatePlantWateringSelect = formElement.querySelector('#updatePlantWatering');
    const updatePlantTempMinInput = formElement.querySelector('#updatePlantTempMin');
    const updatePlantTempMaxInput = formElement.querySelector('#updatePlantTempMax');
    const updatePlantPotSizeInput = formElement.querySelector('#updatePlantPotSize');
    const updatePlantDescriptionTextarea = formElement.querySelector('#updatePlantDescription');
    const updatePlantCategorySelect = formElement.querySelector('#updatePlantCategory');
    const updatePlantImagePreview = formElement.querySelector('#updatePlantImagePreview');
    const updatePlantImageUpload = formElement.querySelector('#updatePlantImageUpload');
    const updatePlantImageURLHidden = formElement.querySelector('#updatePlantImageURL');
    const deletePlantButton = formElement.querySelector('#deletePlant');
    const wateringReminderFieldsDiv = formElement.querySelector('#wateringReminderFields');
    const wateringIntervalDaysInput = formElement.querySelector('#updatePlantWateringIntervalDays');
    const lastWateredDisplay = formElement.querySelector('#lastWateredDisplay');
    const wateredTodayButton = formElement.querySelector('#wateredTodayButton');


    // Popola i campi del form con i dati della pianta
    updatePlantNameInput.value = plant.name || '';
    updatePlantSunlightSelect.value = plant.sunlight || '';
    updatePlantIdealLuxMinInput.value = plant.idealLuxMin !== null ? plant.idealLuxMin : '';
    updatePlantIdealLuxMaxInput.value = plant.idealLuxMax !== null ? plant.idealLuxMax : '';
    updatePlantWateringSelect.value = plant.watering || '';
    updatePlantTempMinInput.value = plant.tempMin !== null ? plant.tempMin : '';
    updatePlantTempMaxInput.value = plant.tempMax !== null ? plant.tempMax : '';
    updatePlantPotSizeInput.value = plant.potSize || '';
    updatePlantDescriptionTextarea.value = plant.description || '';
    updatePlantCategorySelect.value = plant.category || 'Altro';

    // Gestione dell'immagine preview e URL nascosto (sempre il campo 'image' ora)
    const imageUrl = plant.image; // Non c'è più userImage separata
    updatePlantImagePreview.src = imageUrl || CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE;
    updatePlantImagePreview.style.display = 'block';
    updatePlantImageURLHidden.value = imageUrl || ''; // Salva l'URL corrente nell'input nascosto

    // Aggiungi listener per l'input file per l'aggiornamento (gestirà il ritaglio)
    // Rimuovi eventuali listener preesistenti per evitare duplicazioni
    updatePlantImageUpload.removeEventListener('change', handleUpdateImageUploadChange); // Rimuovi vecchio listener
    updatePlantImageUpload.addEventListener('change', handleUpdateImageUploadChange); // Aggiungi nuovo listener

    // Funzione handler per l'evento change dell'input file (per aggiornamento)
    function handleUpdateImageUploadChange(event) {
        currentCroppingFile = event.target.files[0];
        currentCroppingImagePreviewElement = updatePlantImagePreview; // Associa l'anteprima
        currentCroppingHiddenUrlElement = updatePlantImageURLHidden; // Associa l'input hidden
        isUpdateFormCropping = true; // Imposta il flag per indicare che stiamo modificando un'immagine esistente

        if (currentCroppingFile) {
            openCropModal(currentCroppingFile);
        } else {
            // Se il file viene deselezionato, resetta l'anteprima e l'URL nascosto
            updatePlantImagePreview.src = CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE;
            updatePlantImageURLHidden.value = ''; // Indica che l'immagine è stata rimossa
            currentCroppingFile = null; // Resetta il file di ritaglio
            console.log('updatePlantImageUpload: File deselezionato. Preview e URL nascosto resettati.');
        }
    }


    // Se si tratta di una pianta del giardino, mostra i campi di promemoria annaffiatura
    if (isGardenPlant) {
        wateringReminderFieldsDiv.style.display = 'block';
        wateringIntervalDaysInput.value = plant.wateringIntervalDays !== null ? plant.wateringIntervalDays : '';

        if (plant.lastWateredTimestamp) {
            const date = plant.lastWateredTimestamp instanceof firebase.firestore.Timestamp ? plant.lastWateredTimestamp.toDate() : new Date(plant.lastWateredTimestamp);
            lastWateredDisplay.textContent = `Ultima annaffiatura: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        } else {
            lastWateredDisplay.textContent = 'N/A';
        }

        // Event listener per il bottone "Annaffiato Oggi!"
        wateredTodayButton.onclick = () => updateLastWatered(plant.id, lastWateredDisplay);

        // Il bottone elimina pianta dal database deve essere visibile solo per le piante pubbliche (dell'owner)
        // e nascosto per le piante del giardino (che hanno solo l'opzione di rimozione dal giardino)
        deletePlantButton.style.display = 'none';

    } else {
        wateringReminderFieldsDiv.style.display = 'none';
        // Il bottone elimina pianta deve essere visibile solo se l'utente è l'owner della pianta pubblica
        if (firebase.auth().currentUser && plant.ownerId === firebase.auth().currentUser.uid) {
            deletePlantButton.style.display = 'block';
        } else {
            deletePlantButton.style.display = 'none';
        }
    }


    // Rimuovi eventuali listener preesistenti per il submit del form per evitare duplicazioni
    formElement.removeEventListener('submit', savePlantToFirestore);
    formElement.addEventListener('submit', savePlantToFirestore);

    // Gestisci l'evento click del bottone "Annulla"
    formElement.querySelector('#cancelUpdatePlantButton').addEventListener('click', closeCardModal);

    // Gestisci l'evento click del bottone "Elimina Pianta"
    if (deletePlantButton) {
        deletePlantButton.onclick = async (event) => { // Aggiungi event come parametro
            event.stopPropagation(); // Previene la propagazione per non chiudere la modale
            const confirmed = await showConfirmationModal(
                `Sei sicuro di voler eliminare "${plant.name}" DEFINITIVAMENTE dal database pubblico? Questa azione non può essere annullata.`
            );
            if (confirmed) {
                deletePlantFromDatabase(plant.id);
            }
        };
    }

    cardModal.style.display = 'flex'; // Mostra la modale
}


// Visualizza il form per aggiungere una nuova pianta pubblica
function showAddPlantForm() {
    console.log('showAddPlantForm: Apertura form aggiunta nuova pianta.');
    currentPlantIdToUpdate = null; // Nessuna pianta da aggiornare
    isEditingMyGardenPlant = false; // Non è una pianta del giardino

    zoomedCardContent.innerHTML = ''; // Pulisci il contenuto precedente

    // Clona il template del form di aggiunta
    const newFormClone = document.getElementById('newPlantFormTemplate').content.cloneNode(true);
    const formElement = newFormClone.querySelector('form');
    zoomedCardContent.appendChild(newFormClone);

    // Riferimenti agli input del form di aggiunta
    const newPlantImageUpload = formElement.querySelector('#newPlantImageUpload');
    const newPlantImagePreview = formElement.querySelector('#newPlantImagePreview');
    const newPlantCategorySelect = formElement.querySelector('#newPlantCategory'); // Riferimento al select categoria

    // Rimuovi eventuali listener preesistenti per l'input file per evitare duplicazioni
    newPlantImageUpload.removeEventListener('change', handleNewPlantImageUploadChange);
    newPlantImageUpload.addEventListener('change', handleNewPlantImageUploadChange);

    // Funzione handler per l'evento change dell'input file (per nuova pianta)
    function handleNewPlantImageUploadChange(event) {
        currentCroppingFile = event.target.files[0];
        currentCroppingImagePreviewElement = newPlantImagePreview; // Associa l'anteprima
        currentCroppingHiddenUrlElement = null; // Non c'è un URL nascosto per le nuove piante
        isUpdateFormCropping = false; // Imposta il flag per nuova pianta

        if (currentCroppingFile) {
            openCropModal(currentCroppingFile);
        } else {
            // Se il file viene deselezionato, resetta l'anteprima
            newPlantImagePreview.src = CATEGORY_PLACEHOLDER_IMAGES[newPlantCategorySelect.value] || DEFAULT_PLACEHOLDER_IMAGE;
            newPlantImagePreview.style.display = 'block'; // Mostra di nuovo il placeholder
            currentCroppingFile = null; // Resetta il file di ritaglio
            console.log('newPlantImageUpload: File deselezionato. Preview resettata.');
        }
    }

    // Listener per il cambio di categoria nel form di nuova pianta per aggiornare l'immagine placeholder
    newPlantCategorySelect.removeEventListener('change', handleNewPlantCategoryChange); // Rimuovi vecchio
    newPlantCategorySelect.addEventListener('change', handleNewPlantCategoryChange); // Aggiungi nuovo

    function handleNewPlantCategoryChange() {
        if (!currentCroppingFile) { // Aggiorna solo se non c'è un'immagine già selezionata per il ritaglio
            newPlantImagePreview.src = CATEGORY_PLACEHOLDER_IMAGES[newPlantCategorySelect.value] || DEFAULT_PLACEHOLDER_IMAGE;
            newPlantImagePreview.style.display = 'block';
        }
    }
    // Imposta l'immagine iniziale in base alla categoria di default selezionata
    newPlantImagePreview.src = CATEGORY_PLACEHOLDER_IMAGES[newPlantCategorySelect.value] || DEFAULT_PLACEHOLDER_IMAGE;
    newPlantImagePreview.style.display = 'block';


    // Rimuovi eventuali listener preesistenti per il submit del form per evitare duplicazioni
    formElement.removeEventListener('submit', savePlantToFirestore);
    formElement.addEventListener('submit', savePlantToFirestore);

    // Gestisci l'evento click del bottone "Annulla"
    formElement.querySelector('#cancelNewPlantButton').addEventListener('click', closeCardModal);

    cardModal.style.display = 'flex'; // Mostra la modale
}


// Chiude la modale della card
function closeCardModal() {
    console.log('closeCardModal: Chiusura modale card.');
    cardModal.style.display = 'none';
    zoomedCardContent.innerHTML = ''; // Pulisci il contenuto
    currentPlantIdToUpdate = null; // Resetta l'ID della pianta
    isEditingMyGardenPlant = false; // Resetta il flag
    // Resetta lo stato del ritaglio in generale dopo la chiusura del modale
    currentCroppingFile = null;
    currentCroppingImagePreviewElement = null;
    currentCroppingHiddenUrlElement = null;
    isUpdateFormCropping = false;
    console.log('closeCardModal: Modale card chiusa.');
}


// =======================================================
// 5. GESTIONE IMMAGINI E RITAGLIO (Cropper.js)
// =======================================================

/**
 * Apre la modale di ritaglio con l'immagine selezionata.
 * @param {File} file Il file immagine da ritagliare.
 */
function openCropModal(file) {
    if (!file) {
        showToast('Nessun file immagine selezionato per il ritaglio.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        imageToCrop.src = e.target.result;
        cropModal.style.display = 'flex';
        // Inizializza Cropper.js solo quando l'immagine è caricata
        if (cropper) {
            cropper.destroy(); // Distruggi l'istanza precedente se esiste
        }
        cropper = new Cropper(imageToCrop, {
            aspectRatio: 1, // Per un'immagine quadrata (1:1)
            viewMode: 1,    // Non permette di muovere il canvas fuori dall'immagine
            autoCropArea: 0.8, // Area di ritaglio iniziale dell'80%
            responsive: true,
            zoomable: true,
            rotatable: true,
            background: false // Nessuno sfondo a scacchiera
        });
    };
    reader.readAsDataURL(file);
}

// Chiude la modale di ritaglio
function closeCropModal() {
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    cropModal.style.display = 'none';
    imageToCrop.src = ''; // Pulisci l'immagine
}

// Salva l'immagine ritagliata
function saveCroppedImage() {
    if (cropper && currentCroppingImagePreviewElement) {
        showLoadingSpinner();
        // Ottieni il canvas ritagliato
        const croppedCanvas = cropper.getCroppedCanvas({
            width: 400, // Dimensione finale desiderata
            height: 400,
            imageSmoothingQuality: 'high',
        });

        // Converti il canvas in un Blob (file)
        croppedCanvas.toBlob(async (blob) => {
            currentCroppingFile = blob; // Imposta il blob come file ritagliato per l'upload
            // Assegna un nome al blob, in modo che sia trattato come un File per l'upload
            // Questo è importante per l'uploadImage function
            Object.defineProperty(currentCroppingFile, 'name', { value: `cropped_plant_${Date.now()}.png` });

            // Aggiorna l'anteprima nel form
            currentCroppingImagePreviewElement.src = URL.createObjectURL(blob);
            currentCroppingImagePreviewElement.style.display = 'block';

            // Se l'immagine era esistente e l'abbiamo ritagliata, svuotiamo l'input hidden
            // per segnalare a savePlantToFirestore che la vecchia immagine (se esiste) va eliminata
            if (currentCroppingHiddenUrlElement) {
                currentCroppingHiddenUrlElement.value = '';
            }

            hideLoadingSpinner();
            closeCropModal();
            showToast('Immagine ritagliata e pronta per il salvataggio!', 'success');
            console.log('Immagine ritagliata con successo.');
        }, 'image/png', 0.9); // Formato PNG con qualità 0.9
    } else {
        showToast('Nessuna immagine da ritagliare o Cropper non inizializzato.', 'error');
        console.warn('saveCroppedImage: Nessuna immagine da ritagliare o Cropper non inizializzato.');
    }
}

/**
 * Apre la modale per visualizzare un'immagine zoomata.
 * @param {string} imageUrl L'URL dell'immagine da visualizzare.
 */
function openImageModal(imageUrl) {
    zoomedImage.src = imageUrl;
    imageModal.style.display = 'flex';
}

// =======================================================
// 6. FUNZIONI SENSORE DI LUCE AMBIENTALE
// =======================================================

// Inizializza il sensore di luce ambientale
function startLightSensor() {
    if ('AmbientLightSensor' in window) {
        ambientLightSensor = new AmbientLightSensor();

        ambientLightSensor.onreading = () => {
            const lux = ambientLightSensor.illuminance;
            currentLuxValueSpan.textContent = lux.toFixed(2);
            updateLightFeedback(lux);
            autoSensorControls.style.display = 'block';
            manualLuxInputControls.style.display = 'none';
            startLightSensorButton.style.display = 'none';
            stopLightSensorButton.style.display = 'inline-block';
        };

        ambientLightSensor.onerror = (event) => {
            console.error("Errore sensore luce:", event.error);
            currentLuxValueSpan.textContent = 'Errore';
            showToast(`Errore sensore luce: ${event.error.message}`, 'error');
            // Offri l'opzione manuale in caso di errore sensore
            autoSensorControls.style.display = 'none';
            manualLuxInputControls.style.display = 'block';
            // Resetta i bottoni in caso di errore
            startLightSensorButton.style.display = 'inline-block';
            stopLightSensorButton.style.display = 'none';
        };

        ambientLightSensor.start();
        showToast('Sensore di luce avviato!', 'info');
        console.log('Sensore di luce avviato.');
    } else {
        currentLuxValueSpan.textContent = 'Non supportato';
        showToast('Il tuo browser non supporta il sensore di luce ambientale. Inserisci i valori manualmente.', 'warning');
        console.warn('Sensore di luce ambientale non supportato.');
        // Mostra i controlli manuali se il sensore non è supportato
        autoSensorControls.style.display = 'none';
        manualLuxInputControls.style.display = 'block';
        // Assicurati che i bottoni siano nello stato corretto
        startLightSensorButton.style.display = 'inline-block';
        stopLightSensorButton.style.display = 'none';
    }
}

// Ferma il sensore di luce ambientale
function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
        currentLuxValueSpan.textContent = 'N/A';
        lightFeedbackDiv.innerHTML = '<p>Inserisci un valore Lux o avvia il sensore per il feedback specifico sulle piante.</p>'; // Messaggio aggiornato
        showToast('Sensore di luce fermato.', 'info');
        console.log('Sensore di luce fermato.');
        startLightSensorButton.style.display = 'inline-block';
        stopLightSensorButton.style.display = 'none';
        autoSensorControls.style.display = 'none'; // Sempre nascosto quando si ferma, si torna al manuale
        manualLuxInputControls.style.display = 'block'; // Mostra il manuale per default
        manualLuxInput.value = ''; // Pulisci input manuale
        currentLuxValueManualSpan.textContent = 'N/A';
    }
}

// Applica il valore Lux inserito manualmente
function applyManualLux() {
    const lux = parseFloat(manualLuxInput.value);
    if (!isNaN(lux) && lux >= 0) {
        currentLuxValueManualSpan.textContent = lux.toFixed(2);
        updateLightFeedback(lux);
        showToast(`Valore Lux manuale applicato: ${lux} lx`, 'success');
    } else {
        showToast('Inserisci un valore Lux valido (numero positivo).', 'error');
        currentLuxValueManualSpan.textContent = 'Errore';
    }
}


// Aggiorna il feedback sulla luce per le piante visualizzate
function updateLightFeedback(currentLux) {
    if (isNaN(currentLux)) {
        lightFeedbackDiv.innerHTML = '<p>Valore Lux non valido. Impossibile fornire feedback.</p>';
        return;
    }

    const displayedPlants = isMyGardenCurrentlyVisible ? myGarden : allPlants;
    let feedbackHtml = `<h4>Feedback Luce per le Piante nel Giardino (${currentLux.toFixed(2)} lx):</h4>`;

    if (displayedPlants.length === 0) {
        feedbackHtml += `<p>Nessuna pianta da analizzare. Aggiungi alcune piante per ottenere feedback sulla luce.</p>`;
    } else {
        feedbackHtml += `<ul>`;
        displayedPlants.forEach(plant => {
            let feedback = '';
            let idealMin = plant.idealLuxMin;
            let idealMax = plant.idealLuxMax;

            if (idealMin !== null && idealMax !== null) {
                if (currentLux < idealMin) {
                    feedback = `<span class="feedback-low">Poca luce per ${plant.name}. Necessita di più luminosità.</span>`;
                } else if (currentLux > idealMax) {
                    feedback = `<span class="feedback-high">Troppa luce per ${plant.name}. Spostala in un luogo meno illuminato.</span>`;
                } else {
                    feedback = `<span class="feedback-ideal">Luce ideale per ${plant.name}.</span>`;
                }
            } else if (idealMin !== null) {
                 if (currentLux < idealMin) {
                    feedback = `<span class="feedback-low">Poca luce per ${plant.name}. Necessita di almeno ${idealMin} lx.</span>`;
                } else {
                    feedback = `<span class="feedback-ideal">Sufficiente luce per ${plant.name}.</span>`;
                }
            } else if (idealMax !== null) {
                if (currentLux > idealMax) {
                    feedback = `<span class="feedback-high">Troppa luce per ${plant.name}. Non dovrebbe superare ${idealMax} lx.</span>`;
                } else {
                    feedback = `<span class="feedback-ideal">Luce accettabile per ${plant.name}.</span>`;
                }
            }
            else {
                feedback = `Nessun intervallo Lux specificato per ${plant.name}.`;
            }
            feedbackHtml += `<li>${feedback}</li>`;
        });
        feedbackHtml += `</ul>`;
    }
    lightFeedbackDiv.innerHTML = feedbackHtml;
}


// =======================================================
// 7. INTEGRAZIONE CLIMA E POSIZIONE
// =======================================================

// Ottiene la posizione dell'utente e poi il clima
async function getLocation() {
    showLoadingSpinner();
    console.log('getLocation: Richiesta posizione.');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            locationStatusDiv.innerHTML = `<i class="fas fa-map-marker-alt"></i> Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
            showToast('Posizione rilevata!', 'success');
            console.log('getLocation: Posizione rilevata. Chiamata fetchClimate.');
            await fetchClimate(lat, lon);
        }, (error) => {
            console.error("Errore geolocalizzazione:", error);
            locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Errore: ${error.message}`;
            showToast(`Errore geolocalizzazione: ${error.message}`, 'error');
            hideLoadingSpinner();
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    } else {
        locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Geolocalizzazione non supportata.`;
        showToast('Geolocalizzazione non supportata dal tuo browser.', 'error');
        hideLoadingSpinner();
    }
}

// Recupera i dati climatici tramite API
async function fetchClimate(lat, lon) {
    showLoadingSpinner();
    console.log('fetchClimate: Avviato recupero clima per Lat:', lat, 'Lon:', lon);
    // API key per OpenWeatherMap (sostituisci con la tua chiave reale e sicura)
    // TROVA LA TUA CHIAVE API QUI: https://openweathermap.org/api
    const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY'; 

    if (OPENWEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        console.error("ERRORE: Chiave API OpenWeatherMap non configurata. Aggiorna la variabile OPENWEATHER_API_KEY nel file app.js.");
        weatherForecastDiv.innerHTML = '<p class="error-message">Errore: Chiave API OpenWeatherMap non configurata. Aggiorna il file app.js.</p>';
        showToast('Errore: Chiave API OpenWeatherMap mancante!', 'error', 5000);
        hideLoadingSpinner();
        return;
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=it`;

    try {
        // Fetch meteo
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        console.log('fetchClimate: Dati meteo:', weatherData);

        if (weatherData.cod && weatherData.cod !== 200) { // Gestisce errori dell'API OpenWeatherMap
            throw new Error(`Errore OpenWeatherMap: ${weatherData.message || 'Sconosciuto'}`);
        }

        let climateZone = 'Sconosciuto';
        // Tenta di determinare la zona climatica con logica semplificata basata sulla temperatura:
        const temp = weatherData.main ? weatherData.main.temp : null;
        if (temp !== null) {
            if (temp >= 25) climateZone = 'Tropicale';
            else if (temp >= 15 && temp < 25) climateZone = 'Temperato';
            else if (temp >= 5 && temp < 15) climateZone = 'Mediterraneo';
            else if (temp < 5) climateZone = 'Boreale/Artico';
        }


        if (weatherData.main && weatherData.weather && weatherData.name) {
            weatherForecastDiv.innerHTML = `
                <p><strong>Località:</strong> ${weatherData.name}</p>
                <p><strong>Temperatura:</strong> ${weatherData.main.temp}°C</p>
                <p><strong>Condizioni:</strong> ${weatherData.weather[0].description}</p>
                <p><strong>Umidità:</strong> ${weatherData.main.humidity}%</p>
                <p><strong>Pressione:</strong> ${weatherData.main.pressure} hPa</p>
                <p><strong>Zona Climatica Stimata:</strong> ${climateZone}</p>
            `;
            showToast('Previsioni caricate!', 'success');
            console.log('fetchClimate: Previsioni caricate.');
        } else {
            weatherForecastDiv.innerHTML = '<p>Dati meteo non disponibili.</p>';
            showToast('Impossibile caricare le previsioni meteo.', 'warning');
            console.warn('fetchClimate: Dati meteo non disponibili.');
        }

        // Applica automaticamente il filtro della zona climatica se rilevata
        if (climateZoneFilter && climateZone !== 'Sconosciuto') {
            const normalizedClimateZone = Object.keys(CLIMATE_TEMP_RANGES).find(key => key.toLowerCase() === climateZone.toLowerCase());
            if (normalizedClimateZone) {
                climateZoneFilter.value = normalizedClimateZone;
                // Ridisplay le piante per applicare il filtro climatico
                displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
                showToast(`Filtro climatico applicato: ${normalizedClimateZone}`, 'info');
            }
        }


    } catch (error) {
        console.error("Errore nel recupero dati climatici:", error);
        weatherForecastDiv.innerHTML = `<p class="error-message">Errore nel caricamento delle previsioni: ${error.message}.</p>`;
        showToast(`Errore nel caricamento clima: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
        console.log('fetchClimate: Blocco finally eseguito.');
    }
}


// =======================================================
// 8. INITIALIZATION E EVENT LISTENERS
// =======================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Inizializzazione delle variabili DOM
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden');
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    loginButton = document.getElementById('loginButton');
    registerButton = document.getElementById('registerButton');
    showLoginLink = document.getElementById('showLogin');
    showRegisterLink = document.getElementById('showRegister');
    emailInput = document.getElementById('loginEmail');
    passwordInput = document.getElementById('loginPassword');
    loginError = document.getElementById('login-error');
    registerEmailInput = document.getElementById('registerEmail');
    registerPasswordInput = document.getElementById('registerPassword');
    registerError = document.getElementById('register-error');
    authStatusSpan = document.getElementById('auth-status');
    logoutButton = document.getElementById('logoutButton');
    searchInput = document.getElementById('searchInput');
    categoryFilter = document.getElementById('categoryFilter');
    addNewPlantButton = document.getElementById('addNewPlantButton');
    showAllPlantsButton = document.getElementById('showAllPlantsButton');
    showMyGardenButton = document.getElementById('showMyGardenButton');
    plantsSectionHeader = document.getElementById('plantsSectionHeader');
    imageModal = document.getElementById('image-modal');
    zoomedImage = document.getElementById('zoomed-image');
    closeImageModalButton = imageModal.querySelector('.close-button');
    cardModal = document.getElementById('card-modal');
    zoomedCardContent = document.getElementById('zoomed-card-content');
    closeCardModalButton = document.getElementById('close-card-modal');
    loadingSpinner = document.getElementById('loading-spinner');
    toastContainer = document.getElementById('toast-container');
    getClimateButton = document.getElementById('get-climate-button');
    locationStatusDiv = document.getElementById('location-status');
    weatherForecastDiv = document.getElementById('weatherForecast');
    climateZoneFilter = document.getElementById('climateZoneFilter');
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    sortBySelect = document.getElementById('sortBy');
    emptyGardenMessage = document.getElementById('empty-garden-message');
    googleLensButton = document.getElementById('googleLensButton'); // Inizializza il bottone Google Lens


    // Nuove variabili per sensore luce
    lightSensorContainer = document.getElementById('lightSensorContainer');
    startLightSensorButton = document.getElementById('startLightSensorButton');
    stopLightSensorButton = document.getElementById('stopLightSensorButton');
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback');
    autoSensorControls = document.getElementById('autoSensorControls');
    manualLuxInputControls = document.getElementById('manualLuxInputControls');
    manualLuxInput = document.getElementById('manualLuxInput');
    applyManualLuxButton = document.getElementById('applyManualLuxButton');
    currentLuxValueManualSpan = document.getElementById('currentLuxValueManual');


    // Variabili per il ritaglio
    cropModal = document.getElementById('crop-modal');
    imageToCrop = document.getElementById('image-to-crop');

    // Variabili per la modale di conferma
    confirmationModal = document.getElementById('confirmation-modal');
    confirmationTitle = document.getElementById('confirmation-title');
    confirmationMessage = document.getElementById('confirmation-message');
    confirmYesButton = document.getElementById('confirm-yes');
    confirmNoButton = document.getElementById('confirm-no');


    // Inizializzazione Firebase Services
    db = firebase.firestore();
    storage = firebase.storage();
    storageRef = storage.ref(); // Riferimento al root di Firebase Storage


    // Event Listeners autenticazione
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); });
    if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });

    // Listener per lo stato di autenticazione Firebase
    firebase.auth().onAuthStateChanged(updateUIforAuthState);


    // Event Listeners pulsanti principali e filtri/ricerca
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', showAddPlantForm);
    if (showAllPlantsButton) showAllPlantsButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = false;
        showAllPlantsButton.classList.add('active');
        showMyGardenButton.classList.remove('active');
        displayPlants(allPlants);
    });
    if (showMyGardenButton) showMyGardenButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = true;
        showMyGardenButton.classList.add('active');
        showAllPlantsButton.classList.remove('active');
        displayPlants(myGarden);
    });
    if (searchInput) searchInput.addEventListener('input', () => {
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });
    if (categoryFilter) categoryFilter.addEventListener('change', () => {
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });
    if (climateZoneFilter) climateZoneFilter.addEventListener('change', () => {
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });
    if (tempMinFilter) tempMinFilter.addEventListener('input', () => {
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', () => {
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });
    if (sortBySelect) sortBySelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });
    if (getClimateButton) getClimateButton.addEventListener('click', getLocation);

    // Event Listeners per le modali
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => {
        imageModal.style.display = 'none';
        zoomedImage.src = '';
    });
    if (imageModal) imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.style.display = 'none';
            zoomedImage.src = '';
        }
    });
    if (closeCardModalButton) closeCardModalButton.addEventListener('click', closeCardModal);
    if (cardModal) cardModal.addEventListener('click', (e) => {
        if (e.target === cardModal) { // Chiudi solo se clicca sullo sfondo della modale
            closeCardModal();
        }
    });

    // Event Listeners per il ritaglio
    if (document.getElementById('rotate-left')) document.getElementById('rotate-left').addEventListener('click', () => cropper.rotate(-90));
    if (document.getElementById('rotate-right')) document.getElementById('rotate-right').addEventListener('click', () => cropper.rotate(90));
    if (document.getElementById('zoom-in')) document.getElementById('zoom-in').addEventListener('click', () => cropper.zoom(0.1));
    if (document.getElementById('zoom-out')) document.getElementById('zoom-out').addEventListener('click', () => cropper.zoom(-0.1));
    if (document.getElementById('save-cropped-image')) document.getElementById('save-cropped-image').addEventListener('click', saveCroppedImage);
    if (document.getElementById('cancel-cropping')) document.getElementById('cancel-cropping').addEventListener('click', () => {
        closeCropModal();
        // Resetta l'input file che ha aperto il cropper per permettere una nuova selezione
        if (isUpdateFormCropping && document.getElementById('updatePlantImageUpload')) {
            document.getElementById('updatePlantImageUpload').value = '';
            // Ripristina la preview alla sua immagine originale o al placeholder
            const plant = myGarden.find(p => p.id === currentPlantIdToUpdate) || allPlants.find(p => p.id === currentPlantIdToUpdate);
            if (plant && currentCroppingImagePreviewElement && currentCroppingHiddenUrlElement) {
                const originalImageUrl = plant.image; // Non c'è più userImage
                currentCroppingImagePreviewElement.src = originalImageUrl || CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE;
                currentCroppingHiddenUrlElement.value = originalImageUrl || ''; // Ripristina l'URL nascosto
                console.log('Ritaglio annullato per update. Preview e URL nascosto ripristinati.');
            } else if (!isUpdateFormCropping && document.getElementById('newPlantImagePreview')) {
                // Per il form di nuova pianta, resetta al placeholder della categoria
                const newPlantCategorySelect = document.getElementById('newPlantCategory');
                document.getElementById('newPlantImagePreview').src = CATEGORY_PLACEHOLDER_IMAGES[newPlantCategorySelect.value] || DEFAULT_PLACEHOLDER_IMAGE;
                document.getElementById('newPlantImagePreview').style.display = 'block';
                console.log('Ritaglio annullato per nuova pianta. Preview resettata al placeholder.');
            }
        } else if (!isUpdateFormCropping && document.getElementById('newPlantImageUpload')) {
             document.getElementById('newPlantImageUpload').value = '';
             if (document.getElementById('newPlantImagePreview')) {
                 const newPlantCategorySelect = document.getElementById('newPlantCategory');
                 document.getElementById('newPlantImagePreview').src = CATEGORY_PLACEHOLDER_IMAGES[newPlantCategorySelect.value] || DEFAULT_PLACEHOLDER_IMAGE;
                 document.getElementById('newPlantImagePreview').style.display = 'block';
             }
             console.log('Ritaglio annullato per newPlantImageUpload.');
        }

        currentCroppingFile = null;
        currentCroppingImagePreviewElement = null;
        currentCroppingHiddenUrlElement = null;
        isUpdateFormCropping = false;
        console.log('Variabili di ritaglio resettate dopo annullamento.');
    });

    // Event listener per la chiusura del modale di ritaglio cliccando sullo sfondo
    if (cropModal) cropModal.addEventListener('click', (e) => {
        if (e.target === cropModal) {
            closeCropModal();
            // Resetta l'input file se si chiude la modale cliccando sullo sfondo
             if (isUpdateFormCropping && document.getElementById('updatePlantImageUpload')) {
                document.getElementById('updatePlantImageUpload').value = '';
                 const plant = myGarden.find(p => p.id === currentPlantIdToUpdate) || allPlants.find(p => p.id === currentPlantIdToUpdate);
                 if (plant && currentCroppingImagePreviewElement && currentCroppingHiddenUrlElement) {
                    const originalImageUrl = plant.image; // Non c'è più userImage
                    currentCroppingImagePreviewElement.src = originalImageUrl || CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE;
                    currentCroppingHiddenUrlElement.value = originalImageUrl || '';
                 }
            } else if (!isUpdateFormCropping && document.getElementById('newPlantImageUpload')) {
                document.getElementById('newPlantImageUpload').value = '';
                 if (document.getElementById('newPlantImagePreview')) {
                    const newPlantCategorySelect = document.getElementById('newPlantCategory');
                    document.getElementById('newPlantImagePreview').src = CATEGORY_PLACEHOLDER_IMAGES[newPlantCategorySelect.value] || DEFAULT_PLACEHOLDER_IMAGE;
                    document.getElementById('newPlantImagePreview').style.display = 'block';
                 }
            }
            currentCroppingFile = null;
            currentCroppingImagePreviewElement = null;
            currentCroppingHiddenUrlElement = null;
            isUpdateFormCropping = false;
        }
    });

    // Event Listeners per il sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);
    if (applyManualLuxButton) applyManualLuxButton.addEventListener('click', applyManualLux);


    // Bottone "Torna su"
    scrollToTopButton = document.getElementById('scrollToTopButton');
    if (scrollToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 200) { // Mostra il bottone dopo 200px di scroll
                scrollToTopButton.style.display = 'block';
            } else {
                scrollToTopButton.style.display = 'none';
            }
        });
        scrollToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Gestione Google Lens (semplice placeholder)
    if (googleLensButton) {
        googleLensButton.addEventListener('click', () => {
            showToast('Funzione Google Lens in fase di sviluppo. Per ora, carica manualmente le immagini.', 'info', 5000);
            // In un'applicazione reale, qui potresti:
            // 1. Aprire la fotocamera e permettere all'utente di scattare una foto.
            // 2. Usare una libreria di visione artificiale per identificare la pianta.
            // 3. Integrare con un'API di identificazione delle piante.
        });
    }
});
