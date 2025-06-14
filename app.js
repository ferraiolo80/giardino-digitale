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
function validatePlantForm(formElement) {
    let isValid = true;
    clearFormValidationErrors(formElement); // Pulisce errori precedenti

    const nameInput = formElement.querySelector('[id$="PlantName"]');
    if (!nameInput.value.trim()) {
        showFormValidationError(nameInput.id, 'Il nome è obbligatorio.');
        isValid = false;
    }

    const sunlightInput = formElement.querySelector('[id$="PlantSunlight"]');
    if (!sunlightInput.value) {
        showFormValidationError(sunlightInput.id, 'L\'esposizione al sole è obbligatoria.');
        isValid = false;
    }

    const wateringInput = formElement.querySelector('[id$="PlantWatering"]');
    if (!wateringInput.value) {
        showFormValidationError(wateringInput.id, 'La frequenza di innaffiatura è obbligatoria.');
        isValid = false;
    }

    const categoryInput = formElement.querySelector('[id$="PlantCategory"]');
    if (!categoryInput.value) {
        showFormValidationError(categoryInput.id, 'La categoria è obbligatoria.');
        isValid = false;
    }

    // Validazione lux min/max
    const luxMinInput = formElement.querySelector('[id$="IdealLuxMin"]');
    const luxMaxInput = formElement.querySelector('[id$="IdealLuxMax"]');
    const luxMin = luxMinInput.value ? parseFloat(luxMinInput.value) : null;
    const luxMax = luxMaxInput.value ? parseFloat(luxMaxInput.value) : null;

    if (luxMinInput.value !== '' && (isNaN(luxMin) || luxMin < 0)) {
        showFormValidationError(luxMinInput.id, 'Lux Min deve essere un numero positivo.');
        isValid = false;
    }
    if (luxMaxInput.value !== '' && (isNaN(luxMax) || luxMax < 0)) {
        showFormValidationError(luxMaxInput.id, 'Lux Max deve essere un numero positivo.');
        isValid = false;
    }
    if (luxMin !== null && luxMax !== null && luxMin > luxMax) {
        showFormValidationError(luxMaxInput.id, 'Lux Max non può essere inferiore a Lux Min.');
        isValid = false;
    }

    // Validazione temperature min/max
    const tempMinInput = formElement.querySelector('[id$="TempMin"]');
    const tempMaxInput = formElement.querySelector('[id$="TempMax"]');
    const tempMin = tempMinInput.value ? parseFloat(tempMinInput.value) : null;
    const tempMax = tempMaxInput.value ? parseFloat(tempMaxInput.value) : null;

    if (tempMinInput.value !== '' && isNaN(tempMin)) {
        showFormValidationError(tempMinInput.id, 'Temperatura Min deve essere un numero.');
        isValid = false;
    }
    if (tempMaxInput.value !== '' && isNaN(tempMax)) {
        showFormValidationError(tempMaxInput.id, 'Temperatura Max deve essere un numero.');
        isValid = false;
    }
    if (tempMin !== null && tempMax !== null && tempMin > tempMax) {
        showFormValidationError(tempMaxInput.id, 'Temperatura Max non può essere inferiore a Temperatura Min.');
        isValid = false;
    }

    return isValid;
}

// Mostra un errore di validazione specifico per un campo del form
function showFormValidationError(elementId, message) {
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
    if (!imageUrl || imageUrl.includes('placehold.co')) { // Non tentare di eliminare immagini placeholder
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
    // Determina se è un nuovo form o un aggiornamento in base all'ID del form clonato
    const isUpdateForm = form.id === 'updatePlantFormContent';

    if (!validatePlantForm(form)) {
        hideLoadingSpinner();
        showToast('Compila correttamente tutti i campi obbligatori.', 'error');
        return;
    }

    let plantData = {};
    let imageFile = null;
    let existingImageUrl = null;

    if (isUpdateForm) {
        // Form di aggiornamento
        plantData = {
            name: form.querySelector('#updatePlantName').value.trim(),
            sunlight: form.querySelector('#updatePlantSunlight').value,
            idealLuxMin: form.querySelector('#updatePlantIdealLuxMin').value.trim() !== '' ? parseFloat(form.querySelector('#updatePlantIdealLuxMin').value.trim()) : null,
            idealLuxMax: form.querySelector('#updatePlantIdealLuxMax').value.trim() !== '' ? parseFloat(form.querySelector('#updatePlantIdealLuxMax').value.trim()) : null,
            watering: form.querySelector('#updatePlantWatering').value,
            tempMin: form.querySelector('#updatePlantTempMin').value.trim() !== '' ? parseFloat(form.querySelector('#updatePlantTempMin').value.trim()) : null,
            tempMax: form.querySelector('#updatePlantTempMax').value.trim() !== '' ? parseFloat(form.querySelector('#updatePlantTempMax').value.trim()) : null,
            description: form.querySelector('#updatePlantDescription').value.trim() || null,
            category: form.querySelector('#updatePlantCategory').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        imageFile = form.querySelector('#updatePlantImageUpload').files[0];
        existingImageUrl = form.querySelector('#updatePlantImageURL').value || null;
    } else {
        // Form di nuova pianta
        plantData = {
            name: form.querySelector('#newPlantName').value.trim(),
            sunlight: form.querySelector('#newPlantSunlight').value,
            idealLuxMin: form.querySelector('#newPlantIdealLuxMin').value.trim() !== '' ? parseFloat(form.querySelector('#newPlantIdealLuxMin').value.trim()) : null,
            idealLuxMax: form.querySelector('#newPlantIdealLuxMax').value.trim() !== '' ? parseFloat(form.querySelector('#newPlantIdealLuxMax').value.trim()) : null,
            watering: form.querySelector('#newPlantWatering').value,
            tempMin: form.querySelector('#newPlantTempMin').value.trim() !== '' ? parseFloat(form.querySelector('#newPlantTempMin').value.trim()) : null,
            tempMax: form.querySelector('#newPlantTempMax').value.trim() !== '' ? parseFloat(form.querySelector('#newPlantTempMax').value.trim()) : null,
            description: form.querySelector('#newPlantDescription').value.trim() || null,
            category: form.querySelector('#newPlantCategory').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            ownerId: firebase.auth().currentUser ? firebase.auth().currentUser.uid : null,
        };
        imageFile = form.querySelector('#newPlantImageUpload').files[0];
    }

    try {
        let finalImageUrl = existingImageUrl; // Inizializza con l'URL esistente per gli update
        if (imageFile) {
            // Se c'è un nuovo file, caricalo e ottieni il nuovo URL
            finalImageUrl = await uploadImage(imageFile, 'plant_images');
            // Se stiamo aggiornando e c'era un'immagine esistente diversa, eliminiamo la vecchia immagine in storage
            if (isUpdateForm && existingImageUrl && existingImageUrl !== finalImageUrl) {
                await deleteImage(existingImageUrl);
            }
        } else if (isUpdateForm && !existingImageUrl) {
            // Se è un update, nessun nuovo file, e nessun URL esistente,
            // significa che l'immagine è stata rimossa dall'utente (se c'era).
            // Rimuovi il campo `image` da Firestore.
            plantData.image = firebase.firestore.FieldValue.delete();
        } else if (!isUpdateForm && !finalImageUrl) {
            // Se è una nuova pianta e nessun file caricato, imposta 'image' a null esplicitamente.
            plantData.image = null;
        }

        if (finalImageUrl !== null && typeof finalImageUrl === 'string') {
            plantData.image = finalImageUrl; // Assegna l'URL finale se esiste
        } else if (finalImageUrl === null && !isUpdateForm) {
            plantData.image = null; // Forza a null se non c'è immagine per nuova pianta
        }
        // Per gli update, se finalImageUrl è null e non c'è un file, il campo non viene sovrascritto
        // a meno che non sia stato esplicitamente impostato a FieldValue.delete() sopra.

        if (isUpdateForm) {
            await db.collection('plants').doc(currentPlantIdToUpdate).update(plantData);
            showToast('Pianta aggiornata con successo!', 'success');

            // Aggiorna la pianta anche nel giardino dell'utente (se presente)
            const user = firebase.auth().currentUser;
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
            const docRef = await db.collection('plants').add(plantData);
            showToast('Pianta aggiunta con successo!', 'success');
        }
        closeCardModal(); // Chiude la modale dopo il salvataggio
        await fetchPlantsFromFirestore();
        await fetchMyGardenFromFirebase();
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Aggiorna la visualizzazione

    } catch (error) {
        console.error("Errore durante il salvataggio/aggiornamento della pianta:", error);
        showToast(`Errore: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}


// Recupera tutte le piante dal database Firestore
async function fetchPlantsFromFirestore() {
    showLoadingSpinner();
    try {
        const snapshot = await db.collection('plants').get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Ordina all'inizio
        allPlants.sort((a, b) => a.name.localeCompare(b.name));
        displayAllPlants(); // Mostra tutte le piante dopo il fetch
    } catch (error) {
        console.error("Errore nel recupero delle piante:", error);
        showToast(`Errore nel caricamento piante: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Elimina una pianta dal database Firestore
async function deletePlantFromFirestore() {
    if (!currentPlantIdToUpdate) {
        showToast('Nessuna pianta selezionata per l\'eliminazione.', 'error');
        return;
    }

    if (!confirm('Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile.')) {
        return;
    }

    showLoadingSpinner();
    try {
        // Elimina l'immagine associata dalla storage prima di eliminare il documento
        const plantDoc = await db.collection('plants').doc(currentPlantIdToUpdate).get();
        if (plantDoc.exists && plantDoc.data().image) {
            await deleteImage(plantDoc.data().image);
        }

        await db.collection('plants').doc(currentPlantIdToUpdate).delete();
        showToast('Pianta eliminata con successo dal database!', 'success');
        closeCardModal(); // Chiudi la modale
        await fetchPlantsFromFirestore(); // Aggiorna la lista
        await fetchMyGardenFromFirebase(); // Aggiorna anche il giardino

        // Rimuovi la pianta dal giardino di tutti gli utenti se presente
        const gardensRef = db.collection('gardens');
        const gardenSnapshots = await gardensRef.get();
        const batch = db.batch();
        gardenSnapshots.forEach(doc => {
            let plantsInGarden = doc.data().plants || [];
            const updatedPlantsInGarden = plantsInGarden.filter(p => p.id !== currentPlantIdToUpdate);
            if (updatedPlantsInGarden.length !== plantsInGarden.length) { // Se la pianta era presente
                batch.update(doc.ref, { plants: updatedPlantsInGarden });
            }
        });
        await batch.commit();

    } catch (error) {
        console.error("Errore durante l'eliminazione della pianta:", error);
        showToast(`Errore eliminazione pianta: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}


// Aggiunge una pianta al "Mio Giardino" dell'utente
async function addPlantToMyGarden(plantId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast('Devi essere loggato per aggiungere piante al tuo giardino.', 'info');
        return;
    }
    showLoadingSpinner();
    try {
        const gardenRef = db.collection('gardens').doc(user.uid);
        const plantToAdd = allPlants.find(p => p.id === plantId);

        if (!plantToAdd) {
            showToast('Pianta non trovata nel database principale.', 'error');
            hideLoadingSpinner();
            return;
        }

        const doc = await gardenRef.get();
        if (doc.exists) {
            const currentPlants = doc.data().plants || [];
            if (!currentPlants.some(p => p.id === plantId)) {
                await gardenRef.update({
                    plants: firebase.firestore.FieldValue.arrayUnion({ id: plantToAdd.id, addedAt: firebase.firestore.FieldValue.serverTimestamp() })
                });
                showToast(`${plantToAdd.name} aggiunta al tuo giardino!`, 'success');
            } else {
                showToast(`${plantToAdd.name} è già nel tuo giardino.`, 'info');
            }
        } else {
            await gardenRef.set({
                userId: user.uid,
                plants: [{ id: plantToAdd.id, addedAt: firebase.firestore.FieldValue.serverTimestamp() }]
            });
            showToast(`${plantToAdd.name} aggiunta al tuo giardino!`, 'success');
        }
        await fetchMyGardenFromFirebase(); // Aggiorna la lista del giardino
    } catch (error) {
        console.error("Errore nell'aggiunta al giardino:", error);
        showToast(`Errore aggiunta al giardino: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Rimuove una pianta dal "Mio Giardino" dell'utente
async function removePlantFromMyGarden(plantId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast('Devi essere loggato per rimuovere piante dal tuo giardino.', 'info');
        return;
    }
    if (!confirm('Sei sicuro di voler rimuovere questa pianta dal tuo giardino?')) {
        return;
    }
    showLoadingSpinner();
    try {
        const gardenRef = db.collection('gardens').doc(user.uid);
        const doc = await gardenRef.get();
        if (doc.exists) {
            const currentPlants = doc.data().plants || [];
            const updatedPlants = currentPlants.filter(p => p.id !== plantId);
            await gardenRef.update({ plants: updatedPlants });
            showToast('Pianta rimossa dal tuo giardino.', 'info');
        }
        await fetchMyGardenFromFirebase(); // Aggiorna la lista del giardino
    } catch (error) {
        console.error("Errore nella rimozione dal giardino:", error);
        showToast(`Errore rimozione dal giardino: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Recupera le piante specifiche dell'utente dal "Mio Giardino"
async function fetchMyGardenFromFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) {
        myGarden = []; // Pulisci il giardino se non c'è utente
        return;
    }
    showLoadingSpinner();
    try {
        const gardenDoc = await db.collection('gardens').doc(user.uid).get();
        if (gardenDoc.exists) {
            const gardenPlantRefs = gardenDoc.data().plants || [];
            // Recupera i dettagli completi di ogni pianta usando i riferimenti
            const plantPromises = gardenPlantRefs.map(async (plantRef) => {
                const plantDoc = await db.collection('plants').doc(plantRef.id).get();
                if (plantDoc.exists) {
                    return { ...plantDoc.data(), id: plantDoc.id, addedAt: plantRef.addedAt };
                }
                return null;
            });
            myGarden = (await Promise.all(plantPromises)).filter(p => p !== null);
        } else {
            myGarden = [];
        }
    } catch (error) {
        console.error("Errore nel recupero del giardino:", error);
        showToast(`Errore caricamento giardino: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}


// =======================================================
// 4. FUNZIONI DI VISUALIZZAZIONE E FILTRAGGIO PIANTE
// =======================================================

// Mostra le piante nel contenitore specificato
function displayPlants(plantsToShow, container, showAddToGarden = true) {
    if (!container) return; // Protezione
    container.innerHTML = ''; // Pulisci il contenitore

    // Applica ordinamento prima di visualizzare
    let sortedPlants = [...plantsToShow]; // Crea una copia per l'ordinamento
    if (currentSortBy === 'name_asc') {
        sortedPlants.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (currentSortBy === 'name_desc') {
        sortedPlants.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (currentSortBy === 'category_asc') {
        sortedPlants.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    } else if (currentSortBy === 'category_desc') {
        sortedPlants.sort((a, b) => (b.category || '').localeCompare(a.category || ''));
    } else if (currentSortBy === 'addedAt_asc') {
        sortedPlants.sort((a, b) => {
            const dateA = a.addedAt ? (a.addedAt.toDate ? a.addedAt.toDate() : new Date(a.addedAt)) : new Date(0);
            const dateB = b.addedAt ? (b.addedAt.toDate ? b.addedAt.toDate() : new Date(b.addedAt)) : new Date(0);
            return dateA - dateB;
        });
    } else if (currentSortBy === 'addedAt_desc') {
        sortedPlants.sort((a, b) => {
            const dateA = a.addedAt ? (a.addedAt.toDate ? a.addedAt.toDate() : new Date(a.addedAt)) : new Date(0);
            const dateB = b.addedAt ? (b.addedAt.toDate ? b.addedAt.toDate() : new Date(b.addedAt)) : new Date(0);
            return dateB - dateA;
        });
    }


    if (sortedPlants.length === 0) {
        // Mostra il messaggio "Giardino vuoto" solo per "Mio Giardino"
        if (isMyGardenCurrentlyVisible && emptyGardenMessage) {
            container.appendChild(emptyGardenMessage.content.cloneNode(true));
        } else {
            container.innerHTML = '<p class="no-plants-message">Nessuna pianta trovata con i filtri selezionati.</p>';
        }
        return;
    }

    sortedPlants.forEach(plant => {
        const isOwner = firebase.auth().currentUser && plant.ownerId === firebase.auth().currentUser.uid;
        const isInMyGarden = myGarden.some(p => p.id === plant.id);

        const card = document.createElement('div');
        card.classList.add('plant-card');
        card.dataset.plantId = plant.id;

        card.innerHTML = `
            <img src="${plant.image || 'https://placehold.co/400x300?text=No+Image'}" alt="${plant.name}" class="plant-image">
            <div class="card-content">
                <h3>${plant.name}</h3>
                <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
                <p><strong>Esposizione al Sole:</strong> ${plant.sunlight || 'N/A'}</p>
                <p><strong>Innaffiatura:</strong> ${plant.watering || 'N/A'}</p>
                <p><strong>Lux Ideali:</strong> ${plant.idealLuxMin !== null && plant.idealLuxMax !== null ? `${plant.idealLuxMin} - ${plant.idealLuxMax}` : 'N/A'}</p>
                <p><strong>Temp. Ideali:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
                <div class="card-actions">
                    ${isOwner ? `<button class="btn btn-edit" data-id="${plant.id}" data-action="edit"><i class="fas fa-edit"></i> Modifica</button>` : ''}
                    ${showAddToGarden && !isOwner && !isInMyGarden ? `<button class="btn btn-add-garden" data-id="${plant.id}" data-action="add-to-garden"><i class="fas fa-leaf"></i> Aggiungi al Mio Giardino</button>` : ''}
                    ${isInMyGarden ? `<button class="btn btn-remove-garden" data-id="${plant.id}" data-action="remove-from-garden"><i class="fas fa-times-circle"></i> Rimuovi dal Giardino</button>` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Aggiungi un singolo listener delegato al contenitore padre
    container.addEventListener('click', handlePlantCardAction);
    container.addEventListener('click', handlePlantCardZoom);
}

// Gestisce i click sulle azioni delle card (Aggiungi/Rimuovi Giardino, Modifica)
function handlePlantCardAction(event) {
    const target = event.target;
    const plantId = target.dataset.id;
    const action = target.dataset.action;

    if (!plantId || !action) return; // Non è un bottone d'azione valido

    if (action === 'add-to-garden') {
        addPlantToMyGarden(plantId);
    } else if (action === 'remove-from-garden') {
        removePlantFromMyGarden(plantId);
    } else if (action === 'edit') {
        openEditPlantModal(plantId);
    }
}

// Gestisce il click sulla card per aprirla in modale
function handlePlantCardZoom(event) {
    const card = event.target.closest('.plant-card');
    if (card && !event.target.dataset.action) { // Se è la card e non un bottone d'azione
        const plantId = card.dataset.plantId;
        openViewPlantModal(plantId);
    }
}


// Visualizza tutte le piante disponibili (applicando filtri e ordinamento)
function displayAllPlants() {
    isMyGardenCurrentlyVisible = false;
    if (plantsSectionHeader) plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
    let filteredPlants = applyFilters(allPlants);
    displayPlants(filteredPlants, gardenContainer, true); // True per mostrare "Aggiungi al Giardino"
    updateFilterVisibility(false); // Nasconde filtro per clima e 'aggiunto il'
}

// Visualizza solo le piante dell'utente (applicando filtri e ordinamento)
function displayMyGarden() {
    isMyGardenCurrentlyVisible = true;
    if (plantsSectionHeader) plantsSectionHeader.textContent = 'Il Mio Giardino';
    let filteredPlants = applyFilters(myGarden);
    displayPlants(filteredPlants, gardenContainer, false); // False per non mostrare "Aggiungi al Giardino"
    updateFilterVisibility(true); // Mostra filtro per clima e 'aggiunto il'
}

// Applica i filtri (ricerca, categoria, temperatura)
function applyFilters(plants) {
    let filtered = [...plants];

    // Filtro per ricerca testuale
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(plant =>
            (plant.name && plant.name.toLowerCase().includes(searchTerm)) ||
            (plant.description && plant.description.toLowerCase().includes(searchTerm)) ||
            (plant.category && plant.category.toLowerCase().includes(searchTerm))
        );
    }

    // Filtro per categoria
    const selectedCategory = categoryFilter.value;
    if (selectedCategory !== 'all') {
        filtered = filtered.filter(plant => plant.category === selectedCategory);
    }

    // Filtro per zona climatica
    const selectedClimateZone = climateZoneFilter.value;
    if (selectedClimateZone && CLIMATE_TEMP_RANGES[selectedClimateZone]) {
        const { min, max } = CLIMATE_TEMP_RANGES[selectedClimateZone];
        filtered = filtered.filter(plant =>
            (plant.tempMin === null || plant.tempMin >= min) &&
            (plant.tempMax === null || plant.tempMax <= max)
        );
    }

    // Filtro per range di temperatura personalizzato
    const customTempMin = tempMinFilter.value !== '' ? parseFloat(tempMinFilter.value) : null;
    const customTempMax = tempMaxFilter.value !== '' ? parseFloat(tempMaxFilter.value) : null;

    if (customTempMin !== null) {
        filtered = filtered.filter(plant => plant.tempMax !== null && plant.tempMax >= customTempMin);
    }
    if (customTempMax !== null) {
        filtered = filtered.filter(plant => plant.tempMin !== null && plant.tempMin <= customTempMax);
    }


    return filtered;
}

// Aggiorna la visibilità dei filtri a seconda della sezione visualizzata
function updateFilterVisibility(isMyGarden) {
    const climateFilterGroup = document.getElementById('climateFilterGroup');
    const tempFilterGroup = document.getElementById('tempFilterGroup');
    const sortByAddedAtOption = sortBySelect.querySelector('option[value="addedAt_asc"], option[value="addedAt_desc"]');

    if (climateFilterGroup) climateFilterGroup.style.display = isMyGarden ? 'block' : 'none';
    if (tempFilterGroup) tempFilterGroup.style.display = isMyGarden ? 'block' : 'none';
    if (sortByAddedAtOption) sortByAddedAtOption.style.display = isMyGarden ? 'block' : 'none';

    // Se stiamo passando a "Tutte le Piante" e l'ordinamento è su "addedAt", resettalo
    if (!isMyGarden && (currentSortBy === 'addedAt_asc' || currentSortBy === 'addedAt_desc')) {
        sortBySelect.value = 'name_asc';
        currentSortBy = 'name_asc';
    }
}

// =======================================================
// 5. MODAL PER AGGIUNTA/MODIFICA/VISUALIZZAZIONE PIANTE
// =======================================================

// Apre la modale per aggiungere una nuova pianta
function openNewPlantModal() {
    if (!cardModal || !zoomedCardContent || !newPlantFormTemplate) return;

    // Pulisci e inserisci il template del nuovo form
    zoomedCardContent.innerHTML = '';
    const clonedForm = newPlantFormTemplate.content.cloneNode(true);
    zoomedCardContent.appendChild(clonedForm);

    // Inizializza i campi del nuovo form a vuoto
    const form = zoomedCardContent.querySelector('#newPlantFormContent');
    if (form) {
        form.reset(); // Resetta tutti i campi del form
        clearFormValidationErrors(form); // Pulisci eventuali errori precedenti
        // Pre-imposta il valore di default per la categoria
        const categorySelect = form.querySelector('#newPlantCategory');
        if (categorySelect) {
            categorySelect.value = 'Fiore'; // Imposta un valore di default
        }

        // Imposta il listener per il submit del nuovo form
        form.removeEventListener('submit', savePlantToFirestore); // Rimuovi listener precedenti
        form.addEventListener('submit', savePlantToFirestore);

        // Listener per il bottone Annulla
        const cancelNewPlantButton = form.querySelector('#cancelNewPlantButton');
        if (cancelNewPlantButton) {
            cancelNewPlantButton.removeEventListener('click', closeCardModal);
            cancelNewPlantButton.addEventListener('click', closeCardModal);
        }
    }

    cardModal.style.display = 'flex'; // Mostra la modale
}


// Apre la modale per modificare una pianta esistente
async function openEditPlantModal(plantId) {
    if (!cardModal || !zoomedCardContent || !updatePlantFormTemplate) return;

    currentPlantIdToUpdate = plantId; // Salva l'ID della pianta che si sta modificando

    showLoadingSpinner();
    try {
        const plantDoc = await db.collection('plants').doc(plantId).get();
        if (!plantDoc.exists) {
            showToast('Pianta non trovata!', 'error');
            return;
        }
        const plant = { id: plantDoc.id, ...plantDoc.data() };

        zoomedCardContent.innerHTML = '';
        const clonedForm = updatePlantFormTemplate.content.cloneNode(true);
        zoomedCardContent.appendChild(clonedForm);

        const form = zoomedCardContent.querySelector('#updatePlantFormContent');
        if (form) {
            clearFormValidationErrors(form); // Pulisci errori precedenti

            // Popola il form con i dati della pianta
            form.querySelector('#updatePlantName').value = plant.name || '';
            form.querySelector('#updatePlantSunlight').value = plant.sunlight || '';
            form.querySelector('#updatePlantIdealLuxMin').value = plant.idealLuxMin !== null ? plant.idealLuxMin : '';
            form.querySelector('#updatePlantIdealLuxMax').value = plant.idealLuxMax !== null ? plant.idealLuxMax : '';
            form.querySelector('#updatePlantWatering').value = plant.watering || '';
            form.querySelector('#updatePlantTempMin').value = plant.tempMin !== null ? plant.tempMin : '';
            form.querySelector('#updatePlantTempMax').value = plant.tempMax !== null ? plant.tempMax : '';
            form.querySelector('#updatePlantDescription').value = plant.description || '';
            form.querySelector('#updatePlantCategory').value = plant.category || 'Fiore'; // Default se non specificato
            form.querySelector('#updatePlantImageURL').value = plant.image || ''; // Salva l'URL corrente per gestione delete

            // Mostra l'immagine esistente
            const existingImagePreview = form.querySelector('#existingImagePreview');
            if (existingImagePreview) {
                if (plant.image) {
                    existingImagePreview.src = plant.image;
                    existingImagePreview.style.display = 'block';
                } else {
                    existingImagePreview.src = '';
                    existingImagePreview.style.display = 'none';
                }
            }

            // Imposta i listener per il submit, annulla ed elimina
            form.removeEventListener('submit', savePlantToFirestore); // Rimuovi listener precedenti
            form.addEventListener('submit', savePlantToFirestore);

            const cancelUpdateButton = form.querySelector('#cancelUpdatePlantButton');
            if (cancelUpdateButton) {
                cancelUpdateButton.removeEventListener('click', closeCardModal);
                cancelUpdateButton.addEventListener('click', closeCardModal);
            }

            const deletePlantButton = form.querySelector('#deletePlant');
            if (deletePlantButton) {
                deletePlantButton.removeEventListener('click', deletePlantFromFirestore);
                deletePlantButton.addEventListener('click', deletePlantFromFirestore);
            }
        }
        cardModal.style.display = 'flex'; // Mostra la modale
    } catch (error) {
        console.error("Errore nell'apertura della modale di modifica:", error);
        showToast(`Errore: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Apre la modale per visualizzare i dettagli di una pianta
function openViewPlantModal(plantId) {
    if (!cardModal || !zoomedCardContent) return;

    const plant = allPlants.find(p => p.id === plantId) || myGarden.find(p => p.id === plantId);

    if (plant) {
        // Mostra i dettagli della pianta invece del form
        let detailsHtml = `
            <span class="close-button" id="closeCardModalButton">&times;</span>
            <div class="modal-content-details">
                <img src="${plant.image || 'https://placehold.co/600x400?text=No+Image'}" alt="${plant.name}" class="zoomed-plant-image">
                <h2>${plant.name}</h2>
                <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
                <p><strong>Esposizione al Sole:</strong> ${plant.sunlight || 'N/A'}</p>
                <p><strong>Innaffiatura:</strong> ${plant.watering || 'N/A'}</p>
                <p><strong>Descrizione:</strong> ${plant.description || 'N/A'}</p>
                <p><strong>Lux Ideali:</strong> ${plant.idealLuxMin !== null && plant.idealLuxMax !== null ? `${plant.idealLuxMin} - ${plant.idealLuxMax}` : 'N/A'}</p>
                <p><strong>Temp. Ideali:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
                <p><strong>Aggiunta il:</strong> ${plant.createdAt ? new Date(plant.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
            </div>
        `;
        zoomedCardContent.innerHTML = detailsHtml;
        cardModal.style.display = 'flex';
        // Re-inizializza il bottone di chiusura per la modale di visualizzazione
        const currentCloseButton = zoomedCardContent.querySelector('#closeCardModalButton');
        if (currentCloseButton) {
            currentCloseButton.removeEventListener('click', closeCardModal);
            currentCloseButton.addEventListener('click', closeCardModal);
        }

    } else {
        showToast('Dettagli pianta non trovati.', 'error');
    }
}


// Chiude la modale della card (aggiunta/modifica/visualizzazione)
function closeCardModal() {
    if (cardModal) {
        cardModal.style.display = 'none';
        zoomedCardContent.innerHTML = ''; // Pulisci il contenuto
        currentPlantIdToUpdate = null; // Resetta l'ID della pianta in modifica
    }
}

// =======================================================
// 6. GEOLOCALIZZAZIONE E METEO
// =======================================================

async function getLocation() {
    showLoadingSpinner();
    if (locationStatusDiv) locationStatusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rilevando la tua posizione...';
    if (weatherForecastDiv) weatherForecastDiv.innerHTML = '';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                if (locationStatusDiv) locationStatusDiv.innerHTML = `<i class="fas fa-map-marker-alt"></i> Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
                await getWeather(lat, lon);
            },
            (error) => {
                let errorMessage = '<i class="fas fa-exclamation-triangle"></i> Errore di geolocalizzazione: ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Permesso negato. Abilita la geolocalizzazione.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Posizione non disponibile.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Timeout scaduto.';
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage += 'Errore sconosciuto.';
                        break;
                }
                if (locationStatusDiv) locationStatusDiv.innerHTML = errorMessage;
                showToast(errorMessage, 'error');
                hideLoadingSpinner();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        if (locationStatusDiv) locationStatusDiv.innerHTML = '<i class="fas fa-times-circle"></i> La geolocalizzazione non è supportata dal tuo browser.';
        showToast('Geolocalizzazione non supportata dal browser.', 'error');
        hideLoadingSpinner();
    }
}

async function getWeather(lat, lon) {
    showLoadingSpinner();
    const OPEN_WEATHER_MAP_API_KEY = '0575afa377367478348aa48bfc9936ba'
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=it`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=it`;

    try {
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);

        if (!weatherResponse.ok) throw new Error(`HTTP error! status: ${weatherResponse.status}`);
        if (!forecastResponse.ok) throw new Error(`HTTP error! status: ${forecastResponse.status}`);

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        displayWeather(weatherData, forecastData);
        determineClimateZone(weatherData.main.temp, weatherData.main.humidity);

    } catch (error) {
        console.error("Errore nel recupero dati meteo:", error);
        if (locationStatusDiv) locationStatusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Impossibile recuperare i dati meteo.';
        showToast(`Errore meteo: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

function displayWeather(weather, forecast) {
    if (!weatherForecastDiv) return;

    const currentTemp = weather.main.temp;
    const feelsLike = weather.main.feels_like;
    const description = weather.weather[0].description;
    const icon = weather.weather[0].icon;
    const cityName = weather.name;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind.speed; // m/s
    const pressure = weather.main.pressure; // hPa

    let forecastHtml = `
        <h3>Meteo a ${cityName}</h3>
        <div class="current-weather">
            <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
            <p><strong>Condizioni:</strong> ${description.charAt(0).toUpperCase() + description.slice(1)}</p>
            <p><strong>Temperatura:</strong> ${currentTemp.toFixed(1)}°C (Percepita: ${feelsLike.toFixed(1)}°C)</p>
            <p><strong>Umidità:</strong> ${humidity}%</p>
            <p><strong>Vento:</strong> ${(windSpeed * 3.6).toFixed(1)} km/h</p>
            <p><strong>Pressione:</strong> ${pressure} hPa</p>
        </div>
        <h4>Previsioni Prossime Ore:</h4>
        <div class="forecast-hourly">
    `;

    // Filtra per mostrare solo le previsioni delle prossime 24 ore (8 intervalli di 3 ore)
    for (let i = 0; i < Math.min(8, forecast.list.length); i++) {
        const item = forecast.list[i];
        const date = new Date(item.dt * 1000);
        forecastHtml += `
            <div class="forecast-item">
                <p><strong>${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></p>
                <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                <p>${item.main.temp.toFixed(0)}°C</p>
                <p>${item.weather[0].description}</p>
            </div>
        `;
    }
    forecastHtml += '</div>';
    weatherForecastDiv.innerHTML = forecastHtml;
}

function determineClimateZone(temperature, humidity) {
    let zone = 'Sconosciuta';

    // Simplified logic, could be more complex based on actual climate classification
    if (temperature >= 18 && temperature <= 40 && humidity >= 60) {
        zone = 'Tropicale';
    } else if (temperature >= 10 && temperature <= 38 && humidity >= 40) {
        zone = 'Subtropicale';
    } else if (temperature >= 5 && temperature <= 35) {
        zone = 'Mediterraneo';
    } else if (temperature >= -10 && temperature <= 30) {
        zone = 'Temperato';
    } else if (temperature <= 0 || temperature >= 40) {
        zone = 'Estremo'; // Or more specific like 'Boreale/Artico', 'Arido'
    }

    if (locationStatusDiv) {
        locationStatusDiv.innerHTML += `<br><i class="fas fa-cloud"></i> Zona Climatica stimata: <strong>${zone}</strong>`;
    }
}


// =======================================================
// 7. SENSORI (Sensore di Luce Ambientale)
// =======================================================

function startLightSensor() {
    if ('AmbientLightSensor' in window) {
        if (ambientLightSensor && ambientLightSensor.state === 'activated') {
            showToast('Sensore di luce già attivo.', 'info');
            return;
        }

        try {
            ambientLightSensor = new AmbientLightSensor();
            ambientLightSensor.onreading = () => {
                if (currentLuxValueSpan) {
                    currentLuxValueSpan.textContent = ambientLightSensor.illuminance.toFixed(2);
                }
                updateLightFeedback(ambientLightSensor.illuminance);
            };
            ambientLightSensor.onerror = (event) => {
                console.error("Errore sensore luce:", event.error);
                showToast(`Errore sensore luce: ${event.error.message}`, 'error');
                if (lightFeedbackDiv) lightFeedbackDiv.textContent = 'Errore sensore.';
            };
            ambientLightSensor.start();
            showToast('Sensore di luce avviato!', 'success');
            if (startLightSensorButton) startLightSensorButton.classList.add('hidden');
            if (stopLightSensorButton) stopLightSensorButton.classList.remove('hidden');
        } catch (error) {
            console.error("Errore avvio sensore luce:", error);
            showToast(`Impossibile avviare il sensore di luce: ${error.message}`, 'error');
            if (lightFeedbackDiv) lightFeedbackDiv.textContent = 'Non supportato o permesso negato.';
        }
    } else {
        showToast('Sensore di luce ambientale non supportato dal tuo browser.', 'error');
        if (lightFeedbackDiv) lightFeedbackDiv.textContent = 'Non supportato dal browser.';
    }
}

function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        showToast('Sensore di luce fermato.', 'info');
        if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'N/A';
        if (lightFeedbackDiv) lightFeedbackDiv.textContent = '';
        if (startLightSensorButton) startLightSensorButton.classList.remove('hidden');
        if (stopLightSensorButton) stopLightSensorButton.classList.add('hidden');
    }
}

function updateLightFeedback(luxValue) {
    if (!lightFeedbackDiv) return;

    let feedback = '';
    // Esempio di fasce di luce per feedback
    if (luxValue < 50) {
        feedback = 'Luce scarsa - Potrebbe essere troppo buio per molte piante.';
    } else if (luxValue < 500) {
        feedback = 'Luce media - Adatta a piante da interno con esigenze moderate.';
    } else if (luxValue < 10000) {
        feedback = 'Luce buona - Ideale per la maggior parte delle piante d\'appartamento.';
    } else {
        feedback = 'Luce molto intensa - Adatta a piante che amano il sole diretto.';
    }
    lightFeedbackDiv.textContent = feedback;
}


// =======================================================
// 8. GOOGLE LENS (Placeholder)
// =======================================================

function launchGoogleLens() {
    showToast('Funzionalità Google Lens in sviluppo.', 'info', 5000);
    // TODO: Implementazione futura per integrazione con Google Lens API o ricerca immagine
    // Richiederebbe l'upload di un'immagine a un backend che poi interroga l'API di Google Lens
    // o l'apertura di Google Lens via URL scheme se su mobile e supportato.
    // Esempio (solo prototipo, non funzionerà direttamente per tutte le piattaforme):
    // window.open('https://lens.google.com/upload?reco=1&imageUrl=' + encodeURIComponent('URL_DELL_IMMAGINE'), '_blank');
}


// =======================================================
// 9. INIZIALIZZAZIONE (DOMContentLoaded)
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inizializza Firebase con la configurazione globale
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    storage = firebase.storage();
    storageRef = storage.ref(); // Inizializza storageRef qui

    // Inizializzazione variabili DOM
    gardenContainer = document.getElementById('gardenContainer');
    authContainerDiv = document.getElementById('authContainer');
    appContentDiv = document.getElementById('appContent');
    loginButton = document.getElementById('loginButton');
    registerButton = document.getElementById('registerButton');
    showLoginLink = document.getElementById('showLogin');
    showRegisterLink = document.getElementById('showRegister');
    emailInput = document.getElementById('loginEmail');
    passwordInput = document.getElementById('loginPassword');
    loginError = document.getElementById('loginError');
    registerEmailInput = document.getElementById('registerEmail');
    registerPasswordInput = document.getElementById('registerPassword');
    registerError = document.getElementById('registerError');
    authStatusSpan = document.getElementById('auth-status'); // Usa auth-status
    logoutButton = document.getElementById('logoutButton');
    searchInput = document.getElementById('searchInput');
    categoryFilter = document.getElementById('categoryFilter');
    addNewPlantButton = document.getElementById('addNewPlantButton');
    showAllPlantsButton = document.getElementById('showAllPlantsButton');
    showMyGardenButton = document.getElementById('showMyGardenButton');
    plantsSectionHeader = document.getElementById('plantsSectionHeader');
    lightSensorContainer = document.getElementById('lightSensorContainer');
    startLightSensorButton = document.getElementById('startLightSensorButton');
    stopLightSensorButton = document.getElementById('stopLightSensorButton');
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback');
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    sortBySelect = document.getElementById('sortBySelect');
    googleLensButton = document.getElementById('googleLensButton');

    // Modal e Toast
    imageModal = document.getElementById('imageZoomModal');
    zoomedImage = document.getElementById('zoomedImage');
    closeImageModalButton = imageModal ? imageModal.querySelector('.close-button') : null; // Seleziona il bottone di chiusura all'interno della modal
    cardModal = document.getElementById('cardModal'); // La nuova modale per form/dettagli
    zoomedCardContent = document.getElementById('zoomedCardContent'); // Contenuto dentro cardModal
    closeCardModalButton = cardModal ? cardModal.querySelector('.close-button') : null; // Bottone di chiusura per cardModal

    loadingSpinner = document.getElementById('loading-spinner');
    toastContainer = document.getElementById('toast');

    // Elementi Clima
    getClimateButton = document.getElementById('getClimateButton');
    locationStatusDiv = document.getElementById('locationStatus');
    weatherForecastDiv = document.getElementById('weatherForecast');
    climateZoneFilter = document.getElementById('climateZoneFilter');


    // Templates per i form (NUOVO)
    newPlantFormTemplate = document.getElementById('newPlantFormTemplate');
    updatePlantFormTemplate = document.getElementById('updatePlantFormTemplate');
    emptyGardenMessage = document.getElementById('emptyGardenMessage'); // Template messaggio giardino vuoto


    // Imposta lo stato iniziale della UI: mostra solo l'autenticazione
    if (authContainerDiv) authContainerDiv.style.display = 'flex';
    if (appContentDiv) appContentDiv.style.display = 'none';
    if (loadingSpinner) loadingSpinner.style.display = 'none'; // Assicurati che lo spinner sia nascosto all'inizio

    // Event Listeners per l'autenticazione
    if (document.getElementById('login-form')) { // Verifica che il form esista
        document.getElementById('login-form').addEventListener('submit', handleLogin);
    }
    if (document.getElementById('register-form')) { // Verifica che il form esista
        document.getElementById('register-form').addEventListener('submit', handleRegister);
    }

    if (showLoginLink) showLoginLink.addEventListener('click', showLoginForm);
    if (showRegisterLink) showRegisterLink.addEventListener('click', showRegisterForm);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    // Gestione dello stato di autenticazione Firebase (compatibile con modular SDK)
    if (firebase.auth) { // Assicurati che firebase.auth sia disponibile
        firebase.auth().onAuthStateChanged(updateUIforAuthState);
    } else {
        console.error("Firebase Auth non è stato inizializzato correttamente.");
        showToast("Errore: Impossibile inizializzare l'autenticazione.", 'error');
    }


    // Event Listeners per i filtri e bottoni principali
    if (searchInput) searchInput.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants, gardenContainer, !isMyGardenCurrentlyVisible));
    if (categoryFilter) categoryFilter.addEventListener('change', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants, gardenContainer, !isMyGardenCurrentlyVisible));
    if (tempMinFilter) tempMinFilter.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants, gardenContainer, !isMyGardenCurrentlyVisible));
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants, gardenContainer, !isMyGardenCurrentlyVisible));
    if (climateZoneFilter) climateZoneFilter.addEventListener('change', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants, gardenContainer, !isMyGardenCurrentlyVisible));
    if (sortBySelect) sortBySelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants, gardenContainer, !isMyGardenCurrentlyVisible);
    });

    if (addNewPlantButton) addNewPlantButton.addEventListener('click', openNewPlantModal);
    if (showAllPlantsButton) showAllPlantsButton.addEventListener('click', displayAllPlants);
    if (showMyGardenButton) showMyGardenButton.addEventListener('click', displayMyGarden);

    // Chiusura modali (listener per il click sul bottone 'x' e sullo sfondo della modale)
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => { imageModal.style.display = 'none'; });
    if (imageModal) imageModal.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.style.display = 'none'; });

    // La chiusura della cardModal è gestita dalla funzione closeCardModal()
    // e gli event listener sono attaccati dinamicamente o alla modale stessa
    if (cardModal) cardModal.addEventListener('click', (e) => {
        // Chiudi se cliccato sullo sfondo e non su un elemento interno alla form
        if (e.target === cardModal && !e.target.closest('.modal-content-form')) {
            closeCardModal();
        }
    });

    // Event Listeners per il sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);

    // Event Listener per Google Lens (placeholder)
    if (googleLensButton) googleLensButton.addEventListener('click', launchGoogleLens);

    // Event Listener per il Clima
    if (getClimateButton) getClimateButton.addEventListener('click', getLocation);
});
