// Variabili globali per lo stato dell'applicazione
let allPlants = [];
let myGarden = [];
let currentPlantIdToUpdate = null; // Tiene traccia dell'ID della pianta da aggiornare (per modifica/eliminazione)
let ambientLightSensor = null; // Sensore di luce ambientale
let isMyGardenCurrentlyVisible = false; // Flag per la visualizzazione corrente (true = Mio Giardino, false = Tutte le Piante)
let currentSortBy = 'name_asc'; // Criterio di ordinamento di default

// Variabili DOM (saranno inizializzate in DOMContentLoaded)
let gardenContainer;
let myGardenContainer; // Non usato direttamente, ma plant-grid è il contenitore
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

// Variabili per i form (conterranno il contenuto del template)
let newPlantFormTemplate;
let updatePlantFormTemplate;
let emptyGardenMessage; // Messaggio per il giardino vuoto

// Variabile per il pulsante scroll to top
let scrollToTopBtn;

const CLIMATE_TEMP_RANGES = {
    'Mediterraneo': { min: 5, max: 35 },
    'Temperato': { min: -10, max: 30 },
    'Tropicale': { min: 18, max: 40 },
    'Subtropicale': { min: 10, max: 38 },
    'Boreale/Artico': { min: -40, max: 20 },
    'Arido': { min: 0, max: 45 },
};

// Mappa delle immagini predefinite per categoria
const DEFAULT_PLANT_IMAGES = {
    'Fiore': 'images/default_flower.png',
    'Frutto': 'images/default_fruit.png',
    'Verdura': 'images/default_vegetable.png',
    'Erba Aromatica': 'images/default_herb.png',
    'Albero': 'images/default_tree.png',
    'Arbusto': 'images/default_shrub.png',
    'Succulenta': 'images/default_succulent.png',
    'Cactus': 'images/default_cactus.png',
    'Acquatica': 'images/default_aquatic.png',
    'Rampicante': 'images/default_climber.png',
    'Bulbo': 'images/default_bulb.png',
    'Felce': 'images/default_fern.png',
    'Orchidea': 'images/default_orchid.png',
    'Pianta': 'images/default_plant.png', // General plant icon
    'Altro': 'images/default_other.png'
};


// =======================================================
// 1. FUNZIONI UTILITY (Feedback Utente e Validazione)
// =======================================================

// Mostra lo spinner di caricamento
function showLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex';
    }
}

// Nasconde lo spinner di caricamento
function hideLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
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

// Valida i campi del form di aggiunta/modifica pianta
function validatePlantForm(formElement, isUpdateForm) {
    let isValid = true;
    clearFormValidationErrors(formElement); // Pulisce errori precedenti

    const prefix = isUpdateForm ? 'update' : 'new';

    const nameInput = formElement.querySelector(`#${prefix}PlantName`);
    if (!nameInput || !nameInput.value.trim()) {
        showFormValidationError(`${prefix}PlantName`, 'Il nome è obbligatorio.');
        isValid = false;
    }

    const sunlightInput = formElement.querySelector(`#${prefix}PlantSunlight`);
    if (!sunlightInput || !sunlightInput.value) {
        showFormValidationError(`${prefix}PlantSunlight`, 'L\'esposizione al sole è obbligatoria.');
        isValid = false;
    }

    const wateringInput = formElement.querySelector(`#${prefix}PlantWatering`);
    if (!wateringInput || !wateringInput.value) {
        showFormValidationError(`${prefix}PlantWatering`, 'La frequenza di innaffiatura è obbligatoria.');
        isValid = false;
    }

    const categoryInput = formElement.querySelector(`#${prefix}PlantCategory`);
    if (!categoryInput || !categoryInput.value) {
        showFormValidationError(`${prefix}PlantCategory`, 'La categoria è obbligatoria.');
        isValid = false;
    }

    // Validazione lux min/max
    const luxMinInput = formElement.querySelector(`#${prefix}IdealLuxMin`);
    const luxMaxInput = formElement.querySelector(`#${prefix}IdealLuxMax`);
    const luxMin = luxMinInput && luxMinInput.value !== '' ? parseFloat(luxMinInput.value) : null;
    const luxMax = luxMaxInput && luxMaxInput.value !== '' ? parseFloat(luxMaxInput.value) : null;

    if (luxMinInput && luxMinInput.value !== '' && (isNaN(luxMin) || luxMin < 0)) {
        showFormValidationError(`${prefix}IdealLuxMin`, 'Lux Min deve essere un numero positivo.');
        isValid = false;
    }
    if (luxMaxInput && luxMaxInput.value !== '' && (isNaN(luxMax) || luxMax < 0)) {
        showFormValidationError(`${prefix}IdealLuxMax`, 'Lux Max deve essere un numero positivo.');
        isValid = false;
    }
    if (luxMin !== null && luxMax !== null && luxMin > luxMax) {
        showFormValidationError(`${prefix}IdealLuxMax`, 'Lux Max non può essere inferiore a Lux Min.');
        isValid = false;
    }

    // Validazione temperature min/max
    const tempMinInput = formElement.querySelector(`#${prefix}TempMin`);
    const tempMaxInput = formElement.querySelector(`#${prefix}TempMax`);
    const tempMin = tempMinInput && tempMinInput.value !== '' ? parseFloat(tempMinInput.value) : null;
    const tempMax = tempMaxInput && tempMaxInput.value !== '' ? parseFloat(tempMaxInput.value) : null;

    if (tempMinInput && tempMinInput.value !== '' && isNaN(tempMin)) {
        showFormValidationError(`${prefix}TempMin`, 'Temperatura Min deve essere un numero.');
        isValid = false;
    }
    if (tempMaxInput && tempMaxInput.value !== '' && isNaN(tempMax)) {
        showFormValidationError(`${prefix}TempMax`, 'Temperatura Max deve essere un numero.');
        isValid = false;
    }
    if (tempMin !== null && tempMax !== null && tempMin > tempMax) {
        showFormValidationError(`${prefix}TempMax`, 'Temperatura Max non può essere inferiore a Temperatura Min.');
        isValid = false;
    }

    // Validazione immagine: o file o URL, non entrambi
    const imageUploadInput = formElement.querySelector(`#${prefix}PlantImageUpload`);
    const imageUrlInput = formElement.querySelector(`#${prefix}PlantImageURL`);

    const hasImageFile = imageUploadInput && imageUploadInput.files && imageUploadInput.files.length > 0;
    const hasImageUrl = imageUrlInput && imageUrlInput.value.trim() !== '';

    if (hasImageFile && hasImageUrl) {
        showFormValidationError(`${prefix}PlantImageUpload`, 'Non puoi caricare un file e specificare un URL contemporaneamente.');
        showFormValidationError(`${prefix}PlantImageURL`, 'Non puoi caricare un file e specificare un URL contemporaneamente.');
        isValid = false;
    } else if (hasImageUrl && !isValidUrl(imageUrlInput.value.trim())) {
        showFormValidationError(`${prefix}PlantImageURL`, 'Inserisci un URL immagine valido.');
        isValid = false;
    }

    return isValid;
}

// Funzione per validare un URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
}

// Mostra un errore di validazione specifico per un campo del form
function showFormValidationError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('input-error');
        let errorDiv = element.nextElementSibling;
        // Cerca un div con classe 'error-message' subito dopo l'elemento
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
    errorMessages.forEach(el => el.textContent = ''); // Pulisci il testo
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

        // Visualizza le piante predefinite (Tutte le Piante)
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
        await auth.signInWithEmailAndPassword(email, password);
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
        await auth.createUserWithEmailAndPassword(email, password);
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
        await auth.signOut();
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
        return null;
    }
    showLoadingSpinner();
    try {
        const fileName = `${Date.now()}_${file.name}`;
        const storageRefChild = storageRef.child(`${folderPath}/${fileName}`);
        const snapshot = await storageRefChild.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        showToast('Immagine caricata!', 'success');
        return downloadURL;
    } catch (error) {
        console.error("Errore durante l'upload dell'immagine:", error);
        showToast(`Errore caricamento immagine: ${error.message}`, 'error');
        return null;
    } finally {
        hideLoadingSpinner();
    }
}

/**
 * Elimina un'immagine da Firebase Storage dato il suo URL.
 * @param {string} imageUrl - L'URL di download dell'immagine da eliminare.
 */
async function deleteImage(imageUrl) {
    if (!imageUrl || imageUrl.startsWith('images/default_')) { // Non tentare di eliminare immagini predefinite
        return;
    }
    try {
        const imageRef = storage.refFromURL(imageUrl);
        await imageRef.delete();
        console.log("Immagine eliminata con successo da Storage:", imageUrl);
    } catch (error) {
        console.error("Errore nell'eliminazione dell'immagine da Storage:", error);
        // Non mostrare toast all'utente per errori di eliminazione immagine, potrebbero essere immagini predefinite.
    }
}

// Salva o aggiorna una pianta nel database Firestore
async function savePlantToFirestore(e) {
    e.preventDefault();
    showLoadingSpinner();

    const form = e.target;
    const isUpdateForm = form.id === 'updatePlantFormContent';

    if (!validatePlantForm(form, isUpdateForm)) { // Passa isUpdateForm
        hideLoadingSpinner();
        showToast('Compila correttamente tutti i campi obbligatori.', 'error');
        return;
    }

    let plantData = {};
    let imageFile = null;
    let imageUrlFromInput = null; // Per l'URL fornito dall'utente

    // Determina il prefisso per gli ID degli input
    const prefix = isUpdateForm ? 'update' : 'new';

    // Recupera i valori dai campi del form
    plantData = {
        name: form.querySelector(`#${prefix}PlantName`).value.trim(),
        sunlight: form.querySelector(`#${prefix}PlantSunlight`).value,
        idealLuxMin: form.querySelector(`#${prefix}IdealLuxMin`).value.trim() !== '' ? parseFloat(form.querySelector(`#${prefix}IdealLuxMin`).value.trim()) : null,
        idealLuxMax: form.querySelector(`#${prefix}IdealLuxMax`).value.trim() !== '' ? parseFloat(form.querySelector(`#${prefix}IdealLuxMax`).value.trim()) : null,
        watering: form.querySelector(`#${prefix}PlantWatering`).value,
        tempMin: form.querySelector(`#${prefix}TempMin`).value.trim() !== '' ? parseFloat(form.querySelector(`#${prefix}TempMin`).value.trim()) : null,
        tempMax: form.querySelector(`#${prefix}TempMax`).value.trim() !== '' ? parseFloat(form.querySelector(`#${prefix}TempMax`).value.trim()) : null,
        description: form.querySelector(`#${prefix}PlantDescription`).value.trim() || null,
        category: form.querySelector(`#${prefix}PlantCategory`).value,
    };

    imageFile = form.querySelector(`#${prefix}PlantImageUpload`).files[0];
    imageUrlFromInput = form.querySelector(`#${prefix}PlantImageURL`).value.trim() || null;

    let finalImageUrl = null;
    let oldImageUrl = null; // Solo per update

    if (isUpdateForm) {
        // Recupera l'URL dell'immagine esistente dalla pianta originale per l'update
        const originalPlant = allPlants.find(p => p.id === currentPlantIdToUpdate) || myGarden.find(p => p.id === currentPlantIdToUpdate);
        oldImageUrl = originalPlant ? originalPlant.image : null;
    }

    try {
        if (imageFile) {
            // Se è stato caricato un nuovo file, caricalo su Storage
            finalImageUrl = await uploadImage(imageFile, 'plant_images');
            // Se era un update e c'era una vecchia immagine da Storage, eliminala
            if (isUpdateForm && oldImageUrl && !oldImageUrl.startsWith('images/default_') && !oldImageUrl.startsWith('http')) {
                await deleteImage(oldImageUrl);
            }
        } else if (imageUrlFromInput) {
            // Se è stato fornito un URL
            finalImageUrl = imageUrlFromInput;
            // Se era un update e c'era una vecchia immagine da Storage, eliminala
            if (isUpdateForm && oldImageUrl && !oldImageUrl.startsWith('images/default_') && !oldImageUrl.startsWith('http')) {
                await deleteImage(oldImageUrl);
            }
        } else if (isUpdateForm && oldImageUrl && !oldImageUrl.startsWith('images/default_') && !oldImageUrl.startsWith('http')) {
            // Se è un update, nessun nuovo file/URL, e c'era una vecchia immagine da Storage, significa che è stata rimossa
            await deleteImage(oldImageUrl);
            finalImageUrl = null; // Rimuovi l'immagine
        } else if (isUpdateForm && oldImageUrl && (oldImageUrl.startsWith('images/default_') || oldImageUrl.startsWith('http'))) {
            // Se è un update, nessun nuovo file/URL, e c'era un'immagine predefinita o da URL, mantienila
            finalImageUrl = oldImageUrl;
        } else {
            // Nessun file/URL fornito per nuova pianta o rimozione per update
            finalImageUrl = null;
        }

        plantData.image = finalImageUrl;

        if (isUpdateForm) {
            await db.collection('plants').doc(currentPlantIdToUpdate).update({
                ...plantData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            showToast('Pianta aggiornata con successo!', 'success');

            // Aggiorna la pianta anche nel giardino dell'utente (se presente)
            const user = auth.currentUser;
            if (user) {
                const gardenRef = db.collection('gardens').doc(user.uid);
                const doc = await gardenRef.get();
                if (doc.exists) {
                    let currentGardenPlants = doc.data().plants || [];
                    const index = currentGardenPlants.findIndex(p => p.id === currentPlantIdToUpdate);
                    if (index !== -1) {
                        const originalPlantInGarden = currentGardenPlants[index];
                        currentGardenPlants[index] = {
                            id: currentPlantIdToUpdate,
                            ...plantData,
                            createdAt: originalPlantInGarden.createdAt || null // PRESERVA il timestamp originale
                        };
                        // Rimuovi 'updatedAt' per Firestore FieldValue dal modello locale
                        delete currentGardenPlants[index].updatedAt;
                        await gardenRef.set({ plants: currentGardenPlants });
                        myGarden = currentGardenPlants;
                    }
                }
            }
        } else {
            const docRef = await db.collection('plants').add({
                ...plantData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                ownerId: auth.currentUser ? auth.currentUser.uid : null,
            });
            showToast('Pianta aggiunta con successo!', 'success');
        }
        closeCardModal(); // Chiude la modale dopo il salvataggio
        await fetchPlantsFromFirestore();
        await fetchMyGardenFromFirebase();
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Riapplica i filtri e l'ordinamento
    } catch (error) {
        showToast(`Errore durante il salvataggio: ${error.message}`, 'error');
        console.error("Errore nel salvataggio della pianta: ", error);
    } finally {
        hideLoadingSpinner();
    }
}

// Elimina una pianta dal database Firestore e dal giardino di tutti gli utenti
async function deletePlantFromDatabase(plantId) {
    showLoadingSpinner();
    try {
        const plantDoc = await db.collection('plants').doc(plantId).get();
        if (!plantDoc.exists) {
            showToast('Pianta non trovata.', 'error');
            hideLoadingSpinner();
            return;
        }
        const plantData = plantDoc.data();

        // 1. Elimina l'immagine associata da Storage (solo se non è un URL esterno o predefinito)
        if (plantData.image && !plantData.image.startsWith('images/default_') && !plantData.image.startsWith('http')) {
            await deleteImage(plantData.image);
        }

        // 2. Elimina la pianta dalla collezione 'plants'
        await db.collection('plants').doc(plantId).delete();
        showToast('Pianta eliminata con successo dal database!', 'success');

        // 3. Rimuovi la pianta dal giardino di OGNI utente
        const gardensSnapshot = await db.collection('gardens').get();
        const batch = db.batch();
        gardensSnapshot.docs.forEach(doc => {
            let currentGardenPlants = doc.data().plants || [];
            const updatedGardenPlants = currentGardenPlants.filter(plant => plant.id !== plantId);
            if (updatedGardenPlants.length !== currentGardenPlants.length) {
                batch.update(doc.ref, { plants: updatedGardenPlants });
            }
        });
        await batch.commit();

        closeCardModal(); // Chiude la modale dopo l'eliminazione
        await fetchPlantsFromFirestore();
        await fetchMyGardenFromFirebase();
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    } catch (error) {
        showToast(`Errore durante l'eliminazione: ${error.message}`, 'error');
        console.error("Errore nell'eliminazione della pianta: ", error);
    } finally {
        hideLoadingSpinner();
    }
}

// Aggiunge una pianta al giardino dell'utente autenticato
async function addToMyGarden(plantId) {
    showLoadingSpinner();
    const user = auth.currentUser;
    if (!user) {
        showToast('Devi essere loggato per aggiungere piante al tuo giardino.', 'error');
        hideLoadingSpinner();
        return;
    }

    try {
        const plantToAdd = allPlants.find(p => p.id === plantId);
        if (!plantToAdd) {
            showToast('Pianta non trovata nel database.', 'error');
            hideLoadingSpinner();
            return;
        }

        const gardenRef = db.collection('gardens').doc(user.uid);
        const doc = await gardenRef.get();
        let currentGardenPlants = [];

        if (doc.exists) {
            currentGardenPlants = doc.data().plants || [];
        }

        // Controlla se la pianta è già nel giardino
        if (currentGardenPlants.some(p => p.id === plantId)) {
            showToast('Questa pianta è già nel tuo giardino.', 'info');
            hideLoadingSpinner();
            return;
        }

        // Aggiungi solo l'ID e i dati essenziali per il riferimento nel giardino
        currentGardenPlants.push({
            id: plantToAdd.id,
            name: plantToAdd.name,
            category: plantToAdd.category,
            image: plantToAdd.image || null, // Salva l'immagine corrente
            addedToGardenAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await gardenRef.set({ plants: currentGardenPlants });
        myGarden = currentGardenPlants; // Aggiorna l'array locale
        showToast('Pianta aggiunta al tuo giardino!', 'success');
        updatePlantDetailModalButtons(plantId); // Aggiorna i bottoni nella modale
    } catch (error) {
        showToast(`Errore nell'aggiunta al giardino: ${error.message}`, 'error');
        console.error("Errore nell'aggiunta al giardino:", error);
    } finally {
        hideLoadingSpinner();
    }
}

// Rimuove una pianta dal giardino dell'utente autenticato
async function removeFromMyGarden(plantId) {
    showLoadingSpinner();
    const user = auth.currentUser;
    if (!user) {
        showToast('Devi essere loggato per rimuovere piante dal tuo giardino.', 'error');
        hideLoadingSpinner();
        return;
    }

    try {
        const gardenRef = db.collection('gardens').doc(user.uid);
        const doc = await gardenRef.get();
        if (!doc.exists) {
            showToast('Il tuo giardino è già vuoto.', 'info');
            hideLoadingSpinner();
            return;
        }

        let currentGardenPlants = doc.data().plants || [];
        const updatedGardenPlants = currentGardenPlants.filter(plant => plant.id !== plantId);

        if (updatedGardenPlants.length === currentGardenPlants.length) {
            showToast('Questa pianta non è nel tuo giardino.', 'info');
            hideLoadingSpinner();
            return;
        }

        await gardenRef.set({ plants: updatedGardenPlants });
        myGarden = updatedGardenPlants; // Aggiorna l'array locale
        showToast('Pianta rimossa dal tuo giardino!', 'success');
        updatePlantDetailModalButtons(plantId); // Aggiorna i bottoni nella modale
        if (isMyGardenCurrentlyVisible) {
            displayPlants(myGarden); // Aggiorna la visualizzazione se siamo nel mio giardino
        }
    } catch (error) {
        showToast(`Errore nella rimozione dal giardino: ${error.message}`, 'error');
        console.error("Errore nella rimozione dal giardino:", error);
    } finally {
        hideLoadingSpinner();
    }
}


// Recupera tutte le piante dalla collezione 'plants' di Firestore
async function fetchPlantsFromFirestore() {
    showLoadingSpinner();
    try {
        const snapshot = await db.collection('plants').orderBy('name').get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante da Firestore caricate:", allPlants.length);
    } catch (error) {
        console.error("Errore nel recupero delle piante:", error);
        showToast(`Errore nel caricamento delle piante: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Recupera le piante del giardino dell'utente autenticato
async function fetchMyGardenFromFirebase() {
    showLoadingSpinner();
    const user = auth.currentUser;
    if (!user) {
        myGarden = [];
        hideLoadingSpinner();
        return;
    }

    try {
        const doc = await db.collection('gardens').doc(user.uid).get();
        if (doc.exists) {
            myGarden = doc.data().plants || [];
            console.log("Piante nel mio giardino caricate:", myGarden.length);
        } else {
            myGarden = [];
        }
    } catch (error) {
        console.error("Errore nel recupero del mio giardino:", error);
        showToast(`Errore nel caricamento del tuo giardino: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// =======================================================
// 4. VISUALIZZAZIONE E FILTRI DELLE PIANTE
// =======================================================

// Visualizza le piante nel DOM
function displayPlants(plantsToDisplay) {
    if (!gardenContainer) {
        console.error("Elemento gardenContainer non trovato.");
        return;
    }
    gardenContainer.innerHTML = ''; // Pulisci il contenitore

    if (plantsToDisplay.length === 0) {
        emptyGardenMessage.style.display = 'block';
        return;
    } else {
        emptyGardenMessage.style.display = 'none';
    }

    // Applica filtri e ordinamento
    let filteredAndSortedPlants = [...plantsToDisplay];

    // Filtro per ricerca
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredAndSortedPlants = filteredAndSortedPlants.filter(plant =>
            plant.name.toLowerCase().includes(searchTerm) ||
            (plant.description && plant.description.toLowerCase().includes(searchTerm))
        );
    }

    // Filtro per categoria
    const selectedCategory = categoryFilter.value;
    if (selectedCategory !== 'all') {
        filteredAndSortedPlants = filteredAndSortedPlants.filter(plant =>
            plant.category === selectedCategory
        );
    }

    // Filtro per zona climatica (se applicabile)
    const selectedClimateZone = climateZoneFilter.value;
    if (selectedClimateZone && CLIMATE_TEMP_RANGES[selectedClimateZone]) {
        const { min: climateMin, max: climateMax } = CLIMATE_TEMP_RANGES[selectedClimateZone];
        filteredAndSortedPlants = filteredAndSortedPlants.filter(plant => {
            const plantTempMin = plant.tempMin !== null ? plant.tempMin : -Infinity;
            const plantTempMax = plant.tempMax !== null ? plant.tempMax : Infinity;
            // Una pianta è compatibile se il suo range di temperatura si sovrappone alla zona climatica
            return Math.max(plantTempMin, climateMin) <= Math.min(plantTempMax, climateMax);
        });
    }

    // Filtro per range di temperatura personalizzato
    const customTempMin = tempMinFilter.value !== '' ? parseFloat(tempMinFilter.value) : null;
    const customTempMax = tempMaxFilter.value !== '' ? parseFloat(tempMaxFilter.value) : null;

    if (customTempMin !== null || customTempMax !== null) {
        filteredAndSortedPlants = filteredAndSortedPlants.filter(plant => {
            const plantTempMin = plant.tempMin !== null ? plant.tempMin : -Infinity;
            const plantTempMax = plant.tempMax !== null ? plant.tempMax : Infinity;

            let matchesMin = true;
            if (customTempMin !== null) {
                matchesMin = plantTempMax >= customTempMin; // La temperatura massima della pianta deve essere >= al min filtro
            }

            let matchesMax = true;
            if (customTempMax !== null) {
                matchesMax = plantTempMin <= customTempMax; // La temperatura minima della pianta deve essere <= al max filtro
            }
            return matchesMin && matchesMax;
        });
    }


    // Ordinamento
    filteredAndSortedPlants.sort((a, b) => {
        if (currentSortBy === 'name_asc') {
            return a.name.localeCompare(b.name);
        } else if (currentSortBy === 'name_desc') {
            return b.name.localeCompare(a.name);
        } else if (currentSortBy === 'added_date_desc') {
            const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
            return dateB - dateA;
        } else if (currentSortBy === 'added_date_asc') {
            const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
            return dateA - dateB;
        }
        return 0;
    });


    filteredAndSortedPlants.forEach(plant => {
        const card = createPlantCard(plant);
        gardenContainer.appendChild(card);
    });
}

// Crea una singola card per la pianta
function createPlantCard(plant) {
    const card = document.createElement('div');
    card.classList.add('plant-card');
    card.dataset.id = plant.id;

    const plantImage = document.createElement('img');
    // Logica per immagine specifica vs generica
    const imageUrl = plant.image || DEFAULT_PLANT_IMAGES[plant.category] || DEFAULT_PLANT_IMAGES['Pianta'];
    plantImage.src = imageUrl;
    plantImage.alt = plant.name;
    plantImage.classList.add('plant-card-image');
    plantImage.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita che il click sulla modale della card si propaghi
        openImageModal(imageUrl);
    });

    const plantName = document.createElement('h3');
    plantName.textContent = plant.name;

    const plantCategory = document.createElement('p');
    plantCategory.textContent = `Categoria: ${plant.category}`;

    const plantSunlight = document.createElement('p');
    plantSunlight.textContent = `Sole: ${plant.sunlight}`;

    const plantWatering = document.createElement('p');
    plantWatering.textContent = `Innaffiatura: ${plant.watering}`;

    card.appendChild(plantImage);
    card.appendChild(plantName);
    card.appendChild(plantCategory);
    card.appendChild(plantSunlight);
    card.appendChild(plantWatering);

    card.addEventListener('click', () => openPlantDetailModal(plant.id));

    return card;
}

// Visualizza tutte le piante disponibili
function displayAllPlants() {
    isMyGardenCurrentlyVisible = false;
    plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
    showAllPlantsButton.classList.add('active');
    showMyGardenButton.classList.remove('active');
    displayPlants(allPlants);
}

// Visualizza le piante nel "Mio Giardino"
function displayMyGarden() {
    isMyGardenCurrentlyVisible = true;
    plantsSectionHeader.textContent = 'Il Mio Giardino';
    showMyGardenButton.classList.add('active');
    showAllPlantsButton.classList.remove('active');
    displayPlants(myGarden);
}


// =======================================================
// 5. MODALI
// =======================================================

// Apre la modale per i dettagli della pianta o per il form
function openCardModal() {
    if (cardModal) {
        cardModal.style.display = 'block';
        setTimeout(() => cardModal.classList.add('show'), 10); // Animazione
    }
}

// Chiude la modale per i dettagli della pianta o per il form
function closeCardModal() {
    if (cardModal) {
        cardModal.classList.remove('show');
        cardModal.addEventListener('transitionend', () => {
            cardModal.style.display = 'none';
            if (zoomedCardContent) zoomedCardContent.innerHTML = ''; // Pulisci il contenuto
            clearFormValidationErrors(document.getElementById('newPlantFormContent') || document.getElementById('updatePlantFormContent'));
        }, { once: true });
    }
}

// Apre la modale per lo zoom dell'immagine
function openImageModal(imageUrl) {
    if (imageModal && zoomedImage) {
        zoomedImage.src = imageUrl;
        imageModal.style.display = 'block';
        setTimeout(() => imageModal.classList.add('show'), 10);
    }
}

// Chiude la modale per lo zoom dell'immagine
function closeImageModal() {
    if (imageModal) {
        imageModal.classList.remove('show');
        imageModal.addEventListener('transitionend', () => {
            imageModal.style.display = 'none';
            if (zoomedImage) zoomedImage.src = ''; // Pulisci l'immagine
        }, { once: true });
    }
}


// Apre la modale per mostrare i dettagli di una pianta
function openPlantDetailModal(plantId) {
    const plant = allPlants.find(p => p.id === plantId);
    if (!plant) {
        showToast('Dettagli pianta non trovati.', 'error');
        return;
    }

    currentPlantIdToUpdate = plantId; // Imposta l'ID della pianta corrente per modifiche/eliminazioni

    const detailContent = document.getElementById('plantDetailTemplate').content.cloneNode(true);
    const detailView = detailContent.querySelector('.plant-detail-view');

    detailView.querySelector('#detailPlantName').textContent = plant.name;
    const detailImage = detailView.querySelector('#detailPlantImage');
    detailImage.src = plant.image || DEFAULT_PLANT_IMAGES[plant.category] || DEFAULT_PLANT_IMAGES['Pianta'];
    detailImage.alt = plant.name;
    detailImage.addEventListener('click', (e) => {
        e.stopPropagation();
        openImageModal(detailImage.src);
    });

    detailView.querySelector('#detailPlantDescription').textContent = plant.description || 'Nessuna descrizione.';
    detailView.querySelector('#detailPlantSunlight').textContent = plant.sunlight;
    detailView.querySelector('#detailPlantWatering').textContent = plant.watering;
    detailView.querySelector('#detailPlantCategory').textContent = plant.category;
    detailView.querySelector('#detailIdealLuxMin').textContent = plant.idealLuxMin !== null ? plant.idealLuxMin : 'N/A';
    detailView.querySelector('#detailIdealLuxMax').textContent = plant.idealLuxMax !== null ? plant.idealLuxMax : 'N/A';
    detailView.querySelector('#detailTempMin').textContent = plant.tempMin !== null ? plant.tempMin : 'N/A';
    detailView.querySelector('#detailTempMax').textContent = plant.tempMax !== null ? plant.tempMax : 'N/A';
    detailView.querySelector('#detailDateAdded').textContent = plant.createdAt ? new Date(plant.createdAt.toDate()).toLocaleDateString() : 'N/A';

    // Gestione bottoni Aggiungi/Rimuovi dal Giardino
    const addToGardenBtn = detailView.querySelector('#addToMyGardenButton');
    const removeFromGardenBtn = detailView.querySelector('#removeFromMyGardenButton');
    const user = auth.currentUser;

    if (user) {
        const isInMyGarden = myGarden.some(p => p.id === plantId);
        if (isInMyGarden) {
            addToGardenBtn.style.display = 'none';
            removeFromGardenBtn.style.display = 'inline-block';
        } else {
            addToGardenBtn.style.display = 'inline-block';
            removeFromGardenBtn.style.display = 'none';
        }
        addToGardenBtn.onclick = () => addToMyGarden(plantId);
        removeFromGardenBtn.onclick = () => removeFromMyGarden(plantId);
    } else {
        addToGardenBtn.style.display = 'none';
        removeFromGardenBtn.style.display = 'none';
    }


    const editButton = detailView.querySelector('#editPlantButton');
    editButton.onclick = () => openUpdatePlantModal(plantId);

    const deleteButton = detailView.querySelector('#deletePlantButton');
    deleteButton.onclick = () => {
        if (confirm('Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile e la rimuoverà per tutti gli utenti.')) {
            deletePlantFromDatabase(plantId);
        }
    };

    zoomedCardContent.innerHTML = ''; // Pulisci il contenuto precedente
    zoomedCardContent.appendChild(detailContent);
    openCardModal();
}

// Funzione per aggiornare lo stato dei bottoni "Aggiungi/Rimuovi dal Giardino"
function updatePlantDetailModalButtons(plantId) {
    const addToGardenBtn = zoomedCardContent.querySelector('#addToMyGardenButton');
    const removeFromGardenBtn = zoomedCardContent.querySelector('#removeFromMyGardenButton');

    if (addToGardenBtn && removeFromGardenBtn) {
        const isInMyGarden = myGarden.some(p => p.id === plantId);
        if (isInMyGarden) {
            addToGardenBtn.style.display = 'none';
            removeFromGardenBtn.style.display = 'inline-block';
        } else {
            addToGardenBtn.style.display = 'inline-block';
            removeFromGardenBtn.style.display = 'none';
        }
    }
}


// Apre la modale per aggiungere una nuova pianta
function openNewPlantModal() {
    const formContent = newPlantFormTemplate.content.cloneNode(true);
    const formElement = formContent.querySelector('#newPlantFormContent');

    zoomedCardContent.innerHTML = '';
    zoomedCardContent.appendChild(formContent);

    // Gestisci l'anteprima dell'immagine
    const imageUploadInput = formElement.querySelector('#newPlantImageUpload');
    const imageUrlInput = formElement.querySelector('#newPlantImageURL');
    const currentImagePreview = formElement.querySelector('#newCurrentPlantImage');

    imageUploadInput.addEventListener('change', () => {
        if (imageUploadInput.files && imageUploadInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentImagePreview.src = e.target.result;
                currentImagePreview.style.display = 'block';
                imageUrlInput.value = ''; // Pulisci l'URL se viene caricato un file
            };
            reader.readAsDataURL(imageUploadInput.files[0]);
        } else {
            currentImagePreview.style.display = 'none';
            currentImagePreview.src = '';
        }
    });

    imageUrlInput.addEventListener('input', () => {
        if (isValidUrl(imageUrlInput.value.trim())) {
            currentImagePreview.src = imageUrlInput.value.trim();
            currentImagePreview.style.display = 'block';
            imageUploadInput.value = ''; // Pulisci il file se viene inserito un URL
        } else {
            currentImagePreview.style.display = 'none';
            currentImagePreview.src = '';
        }
    });


    // Aggiungi listener per il salvataggio
    formElement.querySelector('#saveNewPlantButton').addEventListener('click', savePlantToFirestore);
    formElement.querySelector('#cancelNewPlantButton').addEventListener('click', closeCardModal);

    openCardModal();
}

// Apre la modale per aggiornare una pianta esistente
function openUpdatePlantModal(plantId) {
    const plant = allPlants.find(p => p.id === plantId);
    if (!plant) {
        showToast('Pianta non trovata per la modifica.', 'error');
        return;
    }

    currentPlantIdToUpdate = plantId;

    const formContent = updatePlantFormTemplate.content.cloneNode(true);
    const formElement = formContent.querySelector('#updatePlantFormContent');

    formElement.querySelector('#updatePlantId').value = plant.id;
    formElement.querySelector('#updatePlantName').value = plant.name;
    formElement.querySelector('#updatePlantDescription').value = plant.description || '';
    formElement.querySelector('#updatePlantSunlight').value = plant.sunlight;
    formElement.querySelector('#updatePlantWatering').value = plant.watering;
    formElement.querySelector('#updatePlantCategory').value = plant.category;
    formElement.querySelector('#updateIdealLuxMin').value = plant.idealLuxMin !== null ? plant.idealLuxMin : '';
    formElement.querySelector('#updateIdealLuxMax').value = plant.idealLuxMax !== null ? plant.idealLuxMax : '';
    formElement.querySelector('#updateTempMin').value = plant.tempMin !== null ? plant.tempMin : '';
    formElement.querySelector('#updateTempMax').value = plant.tempMax !== null ? plant.tempMax : '';

    const currentImagePreview = formElement.querySelector('#updateCurrentPlantImage');
    const imageUploadInput = formElement.querySelector('#updatePlantImageUpload');
    const imageUrlInput = formElement.querySelector('#updatePlantImageURL');

    // Imposta l'immagine corrente o l'URL
    if (plant.image) {
        currentImagePreview.src = plant.image;
        currentImagePreview.style.display = 'block';
        if (plant.image.startsWith('http') && !plant.image.startsWith('[https://firebasestorage.googleapis.com](https://firebasestorage.googleapis.com)')) {
            imageUrlInput.value = plant.image; // Se è un URL esterno, popola il campo URL
        }
    } else {
        currentImagePreview.style.display = 'none';
        currentImagePreview.src = '';
    }

    imageUploadInput.addEventListener('change', () => {
        if (imageUploadInput.files && imageUploadInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentImagePreview.src = e.target.result;
                currentImagePreview.style.display = 'block';
                imageUrlInput.value = ''; // Pulisci l'URL se viene caricato un file
            };
            reader.readAsDataURL(imageUploadInput.files[0]);
        } else if (!imageUrlInput.value.trim()) { // Se non c'è file e non c'è URL, nascondi
            currentImagePreview.style.display = 'none';
            currentImagePreview.src = '';
        }
    });

    imageUrlInput.addEventListener('input', () => {
        if (isValidUrl(imageUrlInput.value.trim())) {
            currentImagePreview.src = imageUrlInput.value.trim();
            currentImagePreview.style.display = 'block';
            imageUploadInput.value = ''; // Pulisci il file se viene inserito un URL
        } else if (!imageUploadInput.files || imageUploadInput.files.length === 0) { // Se non c'è URL e non c'è file, nascondi
            currentImagePreview.style.display = 'none';
            currentImagePreview.src = '';
        }
    });


    // Aggiungi listener per il salvataggio e l'eliminazione
    formElement.querySelector('#saveUpdatePlantButton').addEventListener('click', savePlantToFirestore);
    formElement.querySelector('#cancelUpdatePlantButton').addEventListener('click', closeCardModal);
    formElement.querySelector('#deletePlantFromDBButton').addEventListener('click', () => {
        if (confirm('Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile e la rimuoverà per tutti gli utenti.')) {
            deletePlantFromDatabase(plantId);
        }
    });

    zoomedCardContent.innerHTML = '';
    zoomedCardContent.appendChild(formContent);
    openCardModal();
}


// =======================================================
// 6. GEOLOCALIZZAZIONE E CLIMA
// =======================================================

// Ottiene la posizione dell'utente e recupera i dati climatici
function getLocation() {
    if (navigator.geolocation) {
        showLoadingSpinner();
        locationStatusDiv.innerHTML = '<i class="fas fa-compass"></i> Rilevamento posizione...';
        navigator.geolocation.getCurrentPosition(showPosition, showError, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    } else {
        locationStatusDiv.innerHTML = "<i class='fas fa-exclamation-triangle'></i> La geolocalizzazione non è supportata da questo browser.";
        showToast('Geolocalizzazione non supportata.', 'error');
        hideLoadingSpinner();
    }
}

async function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    locationStatusDiv.innerHTML = `<i class="fas fa-map-marker-alt"></i> Posizione: ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    await fetchWeatherData(lat, lon);
}

function showError(error) {
    hideLoadingSpinner();
    switch (error.code) {
        case error.PERMISSION_DENIED:
            locationStatusDiv.innerHTML = "<i class='fas fa-exclamation-triangle'></i> Permesso di geolocalizzazione negato dall'utente.";
            showToast('Permesso di geolocalizzazione negato.', 'warning');
            break;
        case error.POSITION_UNAVAILABLE:
            locationStatusDiv.innerHTML = "<i class='fas fa-exclamation-triangle'></i> Informazioni sulla posizione non disponibili.";
            showToast('Posizione non disponibile.', 'error');
            break;
        case error.TIMEOUT:
            locationStatusDiv.innerHTML = "<i class='fas fa-exclamation-triangle'></i> La richiesta di ottenere la posizione è scaduta.";
            showToast('Timeout geolocalizzazione.', 'error');
            break;
        case error.UNKNOWN_ERROR:
            locationStatusDiv.innerHTML = "<i class='fas fa-exclamation-triangle'></i> Si è verificato un errore sconosciuto.";
            showToast('Errore sconosciuto geolocalizzazione.', 'error');
            break;
    }
}

async function fetchWeatherData(lat, lon) {
    const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Sostituisci con la tua chiave API di OpenWeatherMap
    if (apiKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
        weatherForecastDiv.innerHTML = '<p class="error-message">Per ottenere i dati climatici, inserisci la tua chiave API di OpenWeatherMap nel file app.js.</p>';
        hideLoadingSpinner();
        return;
    }
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=it`;
    const reverseGeocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;

    try {
        // Ottieni nome città
        const geoResponse = await fetch(reverseGeocodeUrl);
        const geoData = await geoResponse.json();
        const cityName = geoData.length > 0 ? geoData[0].name : 'la tua posizione';
        locationStatusDiv.innerHTML = `<i class="fas fa-map-marker-alt"></i> Posizione: ${cityName}`;

        // Ottieni dati meteo
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        const temp = weatherData.main.temp;
        const conditions = weatherData.weather[0].description;
        const humidity = weatherData.main.humidity;

        weatherForecastDiv.innerHTML = `
            <p>Temperatura: ${temp}°C</p>
            <p>Condizioni: ${conditions}</p>
            <p>Umidità: ${humidity}%</p>
        `;
        showToast('Dati climatici aggiornati!', 'success');
    } catch (error) {
        console.error("Errore nel recupero dati climatici:", error);
        weatherForecastDiv.innerHTML = '<p class="error-message">Impossibile recuperare i dati climatici.</p>';
        showToast('Errore nel recupero dati climatici.', 'error');
    } finally {
        hideLoadingSpinner();
    }
}


// =======================================================
// 7. SENSORE DI LUMINOSITÀ AMBIENTALE
// =======================================================

// Avvia il sensore di luce ambientale
async function startLightSensor() {
    if ('AmbientLightSensor' in window) {
        try {
            ambientLightSensor = new AmbientLightSensor();
            ambientLightSensor.onreading = () => {
                const lux = ambientLightSensor.illuminance.toFixed(2);
                currentLuxValueSpan.textContent = lux;
                updateLightFeedback(parseFloat(lux));
            };
            ambientLightSensor.onerror = (event) => {
                console.error("Errore sensore di luce:", event.error.name, event.error.message);
                lightFeedbackDiv.textContent = `Errore sensore: ${event.error.message}`;
                showToast(`Errore sensore di luce: ${event.error.message}`, 'error');
            };
            ambientLightSensor.start();
            showToast('Sensore di luce avviato!', 'success');
            startLightSensorButton.disabled = true;
            stopLightSensorButton.disabled = false;
            lightFeedbackDiv.textContent = 'Sensore attivo...';
        } catch (error) {
            console.error("Impossibile avviare il sensore di luce:", error);
            lightFeedbackDiv.textContent = `Impossibile avviare il sensore: ${error.message}`;
            showToast(`Impossibile avviare sensore: ${error.message}`, 'error');
            startLightSensorButton.disabled = false;
            stopLightSensorButton.disabled = true;
        }
    } else {
        lightFeedbackDiv.textContent = 'Sensore di luce ambientale non supportato dal tuo browser o dispositivo.';
        showToast('Sensore di luce non supportato.', 'warning');
    }
}

// Ferma il sensore di luce ambientale
function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        showToast('Sensore di luce fermato.', 'info');
        startLightSensorButton.disabled = false;
        stopLightSensorButton.disabled = true;
        lightFeedbackDiv.textContent = 'Sensore fermo.';
    }
}

// Fornisce feedback basato sui lux attuali e sulle piante nel giardino
function updateLightFeedback(currentLux) {
    if (!auth.currentUser || myGarden.length === 0) {
        lightFeedbackDiv.textContent = `Intensità luminosa attuale: ${currentLux} Lux. Aggiungi piante al tuo giardino per un feedback personalizzato!`;
        return;
    }

    let feedbackMessages = [];
    myGarden.forEach(plant => {
        if (plant.idealLuxMin !== null && plant.idealLuxMax !== null) {
            if (currentLux < plant.idealLuxMin) {
                feedbackMessages.push(`La pianta "${plant.name}" necessita di più luce (attuale: ${currentLux} Lux, ideale: ${plant.idealLuxMin}-${plant.idealLuxMax} Lux).`);
            } else if (currentLux > plant.idealLuxMax) {
                feedbackMessages.push(`La pianta "${plant.name}" sta ricevendo troppa luce (attuale: ${currentLux} Lux, ideale: ${plant.idealLuxMin}-${plant.idealLuxMax} Lux).`);
            } else {
                feedbackMessages.push(`La pianta "${plant.name}" sta ricevendo la giusta quantità di luce (${currentLux} Lux, ideale: ${plant.idealLuxMin}-${plant.idealLuxMax} Lux).`);
            }
        }
    });

    if (feedbackMessages.length > 0) {
        lightFeedbackDiv.innerHTML = feedbackMessages.join('<br>');
    } else {
        lightFeedbackDiv.textContent = `Intensità luminosa attuale: ${currentLux} Lux. Nessun feedback specifico per le tue piante.`;
    }
}


// =======================================================
// 8. INIZIALIZZAZIONE E GESTIONE EVENTI
// =======================================================

// Inizializzazione DOM e listener eventi
document.addEventListener('DOMContentLoaded', () => {
    // Inizializzazione variabili DOM
    gardenContainer = document.getElementById('plant-grid');
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
    plantsSectionHeader = document.getElementById('plants-section-header');
    lightSensorContainer = document.querySelector('.light-sensor-section');
    startLightSensorButton = document.getElementById('start-light-sensor');
    stopLightSensorButton = document.getElementById('stop-light-sensor');
    currentLuxValueSpan = document.getElementById('current-lux-value');
    lightFeedbackDiv = document.getElementById('light-feedback');
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    sortBySelect = document.getElementById('sortBySelect');
    googleLensButton = document.getElementById('googleLensButton'); // Inizializza il bottone Google Lens

    imageModal = document.getElementById('image-modal');
    zoomedImage = document.getElementById('zoomed-image');
    closeImageModalButton = document.getElementById('closeImageModal');
    cardModal = document.getElementById('card-modal');
    zoomedCardContent = document.getElementById('zoomed-card-content');
    closeCardModalButton = document.getElementById('closeCardModal');

    loadingSpinner = document.getElementById('loading-spinner');
    toastContainer = document.getElementById('toast-container');

    getClimateButton = document.getElementById('get-climate-button');
    locationStatusDiv = document.getElementById('location-status');
    weatherForecastDiv = document.getElementById('weather-forecast');
    climateZoneFilter = document.getElementById('climateZoneFilter');

    newPlantFormTemplate = document.getElementById('newPlantFormTemplate');
    updatePlantFormTemplate = document.getElementById('updatePlantFormTemplate');
    emptyGardenMessage = document.getElementById('empty-garden-message');

    scrollToTopBtn = document.getElementById('scrollToTopBtn'); // Inizializza il pulsante scroll to top

    // Listener per autenticazione
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    if (showLoginLink) showLoginLink.addEventListener('click', showLoginForm);
    if (showRegisterLink) showRegisterLink.addEventListener('click', showRegisterForm);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    // Listener per filtri e ricerca
    if (searchInput) searchInput.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (categoryFilter) categoryFilter.addEventListener('change', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (climateZoneFilter) climateZoneFilter.addEventListener('change', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (tempMinFilter) tempMinFilter.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (sortBySelect) sortBySelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });

    // Listener per bottoni principali
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', openNewPlantModal);
    if (showAllPlantsButton) showAllPlantsButton.addEventListener('click', displayAllPlants);
    if (showMyGardenButton) showMyGardenButton.addEventListener('click', displayMyGarden);
    if (googleLensButton) googleLensButton.addEventListener('click', () => showToast('Funzionalità Google Lens non ancora implementata.', 'info'));
    if (getClimateButton) getClimateButton.addEventListener('click', getLocation);

    // Listener per sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);

    // Listener per chiusura modali
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', closeImageModal);
    if (closeCardModalButton) closeCardModalButton.addEventListener('click', closeCardModal);
    if (cardModal) {
        cardModal.addEventListener('click', (e) => {
            if (e.target === cardModal) {
                closeCardModal();
            }
        });
    }
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                closeImageModal();
            }
        });
    }

    // Listener per scroll to top button
    window.onscroll = function() { scrollFunction() };
    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    }
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        });
    }


    // Monitora lo stato di autenticazione di Firebase
    auth.onAuthStateChanged(updateUIforAuthState);
});
