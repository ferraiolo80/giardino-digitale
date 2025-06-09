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
    // currentCroppingFile sarà il file (originale o ritagliato) da caricare
    let imageFile = currentCroppingFile;
    let existingImageUrl = isUpdateForm ? (form.querySelector('#updatePlantImageURL').value || null) : null;


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
        // Se non c'è un nuovo file (currentCroppingFile è null) e l'URL esistente è stato esplicitamente rimosso
        // (ad esempio, l'utente ha caricato un'immagine e poi l'ha "rimossa" non selezionando nulla di nuovo)
        if (!imageFile && existingImageUrl === '') {
            plantData.image = firebase.firestore.FieldValue.delete();
        }

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
        if (!imageFile) {
            plantData.image = null; // Forza a null se non c'è immagine per nuova pianta
        }
    }

    try {
        let finalImageUrl = existingImageUrl; // Inizializza con l'URL esistente per gli update

        if (imageFile) {
            // Se c'è un nuovo file (già ritagliato o originale), caricalo e ottieni il nuovo URL
            finalImageUrl = await uploadImage(imageFile, 'plant_images');
            // Se stiamo aggiornando e c'era un'immagine esistente diversa, eliminiamo la vecchia immagine in storage
            if (isUpdateForm && existingImageUrl && existingImageUrl !== finalImageUrl) {
                await deleteImage(existingImageUrl);
            }
            plantData.image = finalImageUrl; // Assegna l'URL finale se esiste
        } else if (isUpdateForm && !plantData.hasOwnProperty('image')) {
            // Se è un update, nessun nuovo file, e non è stata esplicitamente richiesta la rimozione,
            // allora mantiene l'immagine esistente. Non tocchiamo plantData.image.
        }


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
        // Resetta le variabili di stato per il ritaglio dopo il salvataggio
        currentCroppingFile = null;
        currentCroppingImagePreviewElement = null;
        currentCroppingHiddenUrlElement = null;
        isUpdateFormCropping = false;

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

        // 1. Elimina l'immagine associata da Storage
        if (plantData.image) {
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
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per aggiungere piante al tuo giardino.", 'info');
        hideLoadingSpinner();
        return;
    }

    const gardenRef = db.collection('gardens').doc(user.uid);
    try {
        const doc = await gardenRef.get();
        let currentGardenPlants = [];
        if (doc.exists) {
            currentGardenPlants = doc.data().plants || [];
        }

        if (currentGardenPlants.some(p => p.id === plantId)) {
            showToast("Questa pianta è già nel tuo giardino!", 'info');
            hideLoadingSpinner();
            return;
        }

        const plantToAdd = allPlants.find(plant => plant.id === plantId);
        if (plantToAdd) {
            // Aggiungi solo i dati essenziali, ma includi l'ID per future operazioni
            currentGardenPlants.push({
                id: plantToAdd.id,
                name: plantToAdd.name,
                category: plantToAdd.category,
                image: plantToAdd.image || null,
                sunlight: plantToAdd.sunlight,
                watering: plantToAdd.watering,
                idealLuxMin: plantToAdd.idealLuxMin,
                idealLuxMax: plantToAdd.idealLuxMax,
                tempMin: plantToAdd.tempMin,
                tempMax: plantToAdd.tempMax,
                description: plantToAdd.description,
                // Conserva il timestamp originale della creazione della pianta se necessario
                createdAt: plantToAdd.createdAt || firebase.firestore.FieldValue.serverTimestamp()
            });
            await gardenRef.set({ plants: currentGardenPlants });
            myGarden = currentGardenPlants;
            showToast('Pianta aggiunta al tuo giardino!', 'success');
            displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Aggiorna la visualizzazione
        } else {
            showToast("Pianta non trovata per l'aggiunta al giardino.", 'error');
        }
    } catch (error) {
        showToast(`Errore nell'aggiunta al giardino: ${error.message}`, 'error');
        console.error("Errore nell'aggiunta al giardino: ", error);
    } finally {
        hideLoadingSpinner();
    }
}


// Rimuove una pianta dal giardino dell'utente autenticato
async function removeFromMyGarden(plantId) {
    showLoadingSpinner();
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per rimuovere piante dal tuo giardino.", 'info');
        hideLoadingSpinner();
        return;
    }

    // Modal di conferma personalizzata anziché alert()
    if (!confirm('Sei sicuro di voler rimuovere questa pianta dal tuo giardino?')) {
        hideLoadingSpinner();
        return;
    }

    const gardenRef = db.collection('gardens').doc(user.uid);
    try {
        const doc = await gardenRef.get();
        if (doc.exists) {
            let currentGardenPlants = doc.data().plants || [];
            const updatedGardenPlants = currentGardenPlants.filter(plant => plant.id !== plantId);

            if (updatedGardenPlants.length !== currentGardenPlants.length) {
                await gardenRef.set({ plants: updatedGardenPlants });
                myGarden = updatedGardenPlants;
                showToast('Pianta rimossa dal tuo giardino!', 'info');
                displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Aggiorna la visualizzazione
            } else {
                showToast("La pianta non era presente nel tuo giardino.", 'info');
            }
        } else {
            showToast("Il tuo giardino è vuoto.", 'info');
        }
    } catch (error) {
        showToast(`Errore nella rimozione dal giardino: ${error.message}`, 'error');
        console.error("Errore nella rimozione dal giardino: ", error);
    } finally {
        hideLoadingSpinner();
    }
}

// Recupera tutte le piante dalla collezione 'plants' di Firestore
async function fetchPlantsFromFirestore() {
    try {
        const plantsRef = db.collection('plants');
        const snapshot = await plantsRef.get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante caricate da Firestore:", allPlants);
        return allPlants;
    } catch (error) {
        console.error("Errore nel caricamento delle piante:", error);
        showToast('Errore nel caricamento delle piante: ' + error.message, 'error');
        allPlants = [];
        return [];
    }
}

// Recupera le piante del giardino dell'utente autenticato da Firestore
async function fetchMyGardenFromFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) {
        myGarden = [];
        console.log("Utente non autenticato, giardino vuoto.");
        return [];
    }

    try {
        const gardenRef = db.collection('gardens').doc(user.uid);
        const doc = await gardenRef.get();
        if (doc.exists) {
            myGarden = doc.data().plants || [];
            console.log("Giardino caricato da Firebase:", myGarden);
            return myGarden;
        } else {
            myGarden = [];
            console.log("Nessun documento del giardino trovato per l'utente, giardino vuoto.");
            return [];
        }

    } catch (error) {
        showToast(`Errore nel caricamento del tuo giardino: ${error.message}`, 'error');
        console.error("Errore nel caricamento del mio giardino: ", error);
        myGarden = [];
        return [];

    }
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
            (plant.description && plant.description.toLowerCase().includes(searchTerm)) ||
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
                    return false; // Escludi se mancano dati essenziali per il filtro climatico
                }
                return plantMin >= climateRange.min && plantMax <= climateRange.max;
            });
        } else {
            console.warn(`Intervallo di temperatura non definito per il clima: ${selectedClimate}. Nessuna pianta sarà mostrata per questo filtro.`);
            filteredPlants = []; // Nessun range, nessuna pianta
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
            // Seleziona l'ordinamento di default se non valido
            filteredPlants.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            if (sortBySelect) sortBySelect.value = 'name_asc'; // Reimposta UI
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
            // Per ora, li mostriamo e gestiamo l'azione in JS.
            const updateButtonHtml = user ? `<button class="action-button update-plant-button" data-plant-id="${plant.id}"><i class="fas fa-edit"></i> Aggiorna</button>` : '';
            const deleteButtonHtml = user ? `<button class="action-button delete-plant-from-db-button" data-plant-id="${plant.id}"><i class="fas fa-trash"></i> Elimina</button>` : '';


            html += `
                <div class="plant-card" data-plant-id="${plant.id}">
                    <img src="${plant.image || 'https://placehold.co/150x150/EEEEEE/333333?text=No+Image'}" alt="${plant.name}" class="plant-image">
                    <h3>${plant.name}</h3>
                    <p><strong>Esposizione al Sole:</strong> ${plant.sunlight || 'N/A'}</p>
                    <p><strong>Annaffiatura:</strong> ${plant.watering || 'N/A'}</p>
                    <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
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
    try {
        const permissionName = 'ambient-light-sensor';
        const result = await navigator.permissions.query({ name: permissionName });
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
        console.error('Errore nel controllo permessi sensore luce:', error);
        return false;
    }
}

// Funzione per aggiornare il feedback sul sensore di luce (usata sia da sensore automatico che manuale)
function updateLightFeedback(lux) {
    if (myGarden && myGarden.length > 0 && lux != null) {
        let feedbackHtml = '<h4>Feedback Luce per il tuo Giardino:</h4><ul>';
        const plantsInGardenWithLuxData = myGarden.filter(plant =>
            typeof plant.idealLuxMin === 'number' && typeof plant.idealLuxMax === 'number' && !isNaN(plant.idealLuxMin) && !isNaN(plant.idealLuxMax)
        );

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

    // Re-fetch dei dati per assicurarsi che siano aggiornati
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
        return; // Exit early if not supported
    }

    const hasPermission = await requestLightSensorPermission();
    if (!hasPermission) {
        hideLoadingSpinner();
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p style="color: red;">Permesso per il sensore di luce negato o non concesso. Assicurati di navigare su HTTPS e di aver concesso il permesso richiesto.</p>';
        showToast('Permesso per il sensore di luce negato o non concesso. Controlla le impostazioni del browser.', 'error');
        if (startLightSensorButton) startLightSensorButton.style.display = 'inline-block';
        if (stopLightSensorButton) stopLightSensorButton.style.display = 'none';
        return;
    }

    // Proceed with sensor activation if supported and permission is handled
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
    }

    try {
        ambientLightSensor = new AmbientLightSensor({ frequency: 1000 });
        showToast("Avvio sensore di luce...", 'info');

        ambientLightSensor.onreading = () => {
            const lux = ambientLightSensor.illuminance;
            if (currentLuxValueSpan) currentLuxValueSpan.textContent = `${lux ? lux.toFixed(2) : 'N/A'} `;
            updateLightFeedback(lux); // Call shared feedback function
        };

        ambientLightSensor.onerror = (event) => {
            console.error("Errore sensore di luce:", event.error.name, event.error.message);
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

    } catch (error) {
        console.error("Errore nell'avvio del sensore di luce nel try-catch:", error);
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p style="color: red;">Errore nell'avvio del sensore: ${error.message}. Assicurati di essere su HTTPS e di aver concesso i permessi.</p>`;
        showToast(`Errore nell'avvio del sensore: ${error.message}`, 'error');
        hideLoadingSpinner();
        if (startLightSensorButton) startLightSensorButton.style.display = 'inline-block';
        if (stopLightSensorButton) stopLightSensorButton.style.display = 'none';
    }
}

// Ferma la lettura del sensore di luce
function stopLightSensor() {
    if (ambientLightSensor) {
        try {
            ambientLightSensor.stop();
        } catch (e) {
            console.error("Errore nel fermare il sensore:", e);
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
}

// Applica il valore Lux inserito manualmente
async function applyManualLux() {
    const manualLuxValue = parseFloat(manualLuxInput.value);

    if (isNaN(manualLuxValue) || manualLuxValue < 0) {
        showToast('Inserisci un valore Lux valido (un numero positivo).', 'error');
        return;
    }

    showLoadingSpinner();
    // Re-fetch dei dati per assicurarsi che siano aggiornati
    allPlants = await fetchPlantsFromFirestore();
    myGarden = await fetchMyGardenFromFirebase();
    hideLoadingSpinner();

    if (currentLuxValueManualSpan) currentLuxValueManualSpan.textContent = `${manualLuxValue.toFixed(2)} `;
    updateLightFeedback(manualLuxValue);
    showToast(`Valore Lux ${manualLuxValue.toFixed(2)} applicato.`, 'success');
}


// =======================================================
// 6. FUNZIONI PER GEOLOCALIZZAZIONE E METEO (Open-Meteo)
// =======================================================

// Funzione principale per ottenere la posizione e il clima
function getLocation() {
    if (navigator.geolocation) {
        if (locationStatusDiv) locationStatusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Acquisizione posizione in corso...';
        showLoadingSpinner();
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
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
                if (locationStatusDiv) locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errorMessage}`;
                showToast(errorMessage, 'error');
                if (climateZoneFilter) climateZoneFilter.value = ''; // Resetta il filtro clima
                displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Applica i filtri senza considerare il clima
                hideLoadingSpinner();
            }
        );
    } else {
        if (locationStatusDiv) locationStatusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> La geolocalizzazione non è supportata dal tuo browser.';
        showToast("Geolocalizzazione non supportata dal tuo browser.", 'error');
        if (climateZoneFilter) climateZoneFilter.value = '';
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    }
}

// Deduce la zona climatica dalle coordinate e recupera i dati meteo
async function getClimateFromCoordinates(latitude, longitude) {
    if (locationStatusDiv) locationStatusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recupero dati climatici...';
    showLoadingSpinner();

    try {
        const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_mean,precipitation_sum,weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&forecast_days=1&timezone=Europe%2FBerlin`;

        const response = await fetch(weatherApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

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

    } catch (error) {
        console.error('Errore nel recupero dei dati climatici:', error);
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
    }
}

// Apre la modal della card completa o del form
function openCardModal(templateElement, plantData = null) {
    if (!cardModal || !zoomedCardContent || !templateElement) {
        console.error("Elementi DOM per la modale della card non trovati o contenuto non valido.");
        return;
    }

    zoomedCardContent.innerHTML = ''; // Pulisce qualsiasi contenuto precedente
    // Clona il nodo del template direttamente (senza .content)
    const clonedForm = templateElement.cloneNode(true);
    clonedForm.style.display = 'block'; // Assicurati che il contenuto clonato sia visibile

    zoomedCardContent.appendChild(clonedForm); // Aggiungi il div/form clonato alla modale
    cardModal.style.display = 'flex'; // Mostra la modale

    // Resetta le variabili di stato per il ritaglio ogni volta che apriamo la modale
    currentCroppingFile = null;
    currentCroppingImagePreviewElement = null;
    currentCroppingHiddenUrlElement = null;
    isUpdateFormCropping = false;

    // Se è un form di aggiornamento, popola i campi
    if (plantData && clonedForm.id === 'updatePlantFormContent') {
        currentPlantIdToUpdate = plantData.id;
        clonedForm.querySelector('#updatePlantName').value = plantData.name || '';
        clonedForm.querySelector('#updatePlantSunlight').value = plantData.sunlight || '';
        clonedForm.querySelector('#updatePlantIdealLuxMin').value = plantData.idealLuxMin !== null ? plantData.idealLuxMin.toString() : '';
        clonedForm.querySelector('#updatePlantIdealLuxMax').value = plantData.idealLuxMax !== null ? plantData.idealLuxMax.toString() : '';
        clonedForm.querySelector('#updatePlantWatering').value = plantData.watering || '';
        clonedForm.querySelector('#updatePlantTempMin').value = plantData.tempMin !== null ? plantData.tempMin.toString() : '';
        clonedForm.querySelector('#updatePlantTempMax').value = plantData.tempMax !== null ? plantData.tempMax.toString() : '';
        clonedForm.querySelector('#updatePlantDescription').value = plantData.description || '';
        clonedForm.querySelector('#updatePlantCategory').value = plantData.category || '';

        const updateImagePreview = clonedForm.querySelector('#updatePlantImagePreview');
        const updateImageURLHidden = clonedForm.querySelector('#updatePlantImageURL');

        if (plantData.image) {
            updateImagePreview.src = plantData.image;
            updateImagePreview.style.display = 'block';
            updateImageURLHidden.value = plantData.image; // Salva l'URL esistente
        } else {
            updateImagePreview.src = '';
            updateImagePreview.style.display = 'none';
            updateImageURLHidden.value = '';
        }

        // Listener per l'input file del form di aggiornamento
        const updatePlantImageUpload = clonedForm.querySelector('#updatePlantImageUpload');
        if (updatePlantImageUpload) {
            updatePlantImageUpload.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    currentCroppingFile = file;
                    currentCroppingImagePreviewElement = updateImagePreview;
                    currentCroppingHiddenUrlElement = updateImageURLHidden;
                    isUpdateFormCropping = true;
                    openCropModal(file);
                } else {
                    // Se l'utente annulla la selezione del file, rimuovi l'anteprima e segna per eliminazione immagine esistente
                    updateImagePreview.src = '';
                    updateImagePreview.style.display = 'none';
                    updateImageURLHidden.value = ''; // Segna per eliminazione dell'immagine esistente
                    currentCroppingFile = null; // Nessun file da caricare
                }
            };
        }
    } else if (clonedForm.id === 'newPlantFormContent') {
        // Form di nuova pianta, resetta i campi
        clonedForm.reset(); // Assumendo che sia un form
        clearFormValidationErrors(clonedForm);
        currentPlantIdToUpdate = null; // Nessuna pianta associata per l'aggiornamento

        const newImagePreview = clonedForm.querySelector('#newPlantImagePreview');
        if (newImagePreview) {
            newImagePreview.src = '';
            newImagePreview.style.display = 'none';
        }
        // Listener per l'input file del form di nuova pianta
        const newPlantImageUpload = clonedForm.querySelector('#newPlantImageUpload');
        if (newPlantImageUpload) {
            newPlantImageUpload.value = ''; // Resetta il campo file input
            newPlantImageUpload.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    currentCroppingFile = file;
                    currentCroppingImagePreviewElement = newImagePreview;
                    isUpdateFormCropping = false;
                    openCropModal(file);
                } else {
                    newImagePreview.src = '';
                    newImagePreview.style.display = 'none';
                    currentCroppingFile = null;
                }
            };
        }
    }

    // Aggiungi listener per i bottoni all'interno del form della modale (Salva/Annulla/Elimina)
    const saveButton = clonedForm.querySelector('#saveNewPlantButton') || clonedForm.querySelector('#saveUpdatePlantButton');
    const cancelButton = clonedForm.querySelector('#cancelNewPlantButton') || clonedForm.querySelector('#cancelUpdatePlantButton');
    const deleteDbButton = clonedForm.querySelector('#deletePlant'); // Solo nel form di update

    // Usa addEventListener e la delegazione per i bottoni (per evitare problemi con cloni)
    if (saveButton) saveButton.addEventListener('click', savePlantToFirestore);
    if (cancelButton) cancelButton.addEventListener('click', closeCardModal);
    if (deleteDbButton) {
        deleteDbButton.addEventListener('click', async (event) => {
            event.stopPropagation(); // Evita che il click si propaghi al parent della modale
            if (currentPlantIdToUpdate && confirm('Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile e la rimuoverà per tutti gli utenti.')) {
                await deletePlantFromDatabase(currentPlantIdToUpdate);
            }
        });
    }
}


// Chiude la modal della card completa
function closeCardModal() {
    if (cardModal) cardModal.style.display = 'none';
    if (zoomedCardContent) zoomedCardContent.innerHTML = '';
    currentPlantIdToUpdate = null; // Resetta l'ID
    hideLoadingSpinner(); // Assicurati che lo spinner sia nascosto
    displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Riapplica i filtri e l'ordinamento
}


// NUOVE FUNZIONI PER IL RITAGLIO IMMAGINE
function openCropModal(file) {
    if (!cropModal || !imageToCrop) {
        showToast("Errore: Impossibile avviare il ritaglio. Elementi mancanti.", 'error');
        console.error("Cropping modal elements not found.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        imageToCrop.src = e.target.result;
        cropModal.style.display = 'flex'; // Mostra la modal di ritaglio

        // Distruggi la vecchia istanza di Cropper se esiste
        if (cropper) {
            cropper.destroy();
        }
        // Inizializza Cropper.js sulla nuova immagine
        cropper = new Cropper(imageToCrop, {
            aspectRatio: 1, // Imposta un rapporto 1:1 per il ritaglio (quadrato)
            viewMode: 1, // Definisce la modalità di visualizzazione del cropper
            autoCropArea: 0.8, // Area di ritaglio automatica (80% dell'immagine)
            background: false, // Nessuno sfondo a scacchi
            // Altre opzioni di personalizzazione:
            // minCropBoxWidth: 100,
            // minCropBoxHeight: 100,
            // movable: true,
            // zoomable: true,
            // rotatable: true,
            // scalable: true,
            // zoomOnTouch: true,
            // zoomOnWheel: true,
            // cropBoxMovable: true,
            // cropBoxResizable: true,
        });
    };
    reader.readAsDataURL(file);
}

function closeCropModal() {
    if (cropper) {
        cropper.destroy(); // Distrugge l'istanza di Cropper
        cropper = null;
    }
    if (cropModal) {
        cropModal.style.display = 'none'; // Nasconde la modal di ritaglio
    }
    imageToCrop.src = ''; // Pulisce l'immagine nel cropper
}

async function saveCroppedImage() {
    if (!cropper) {
        showToast("Nessuna immagine da ritagliare.", 'error');
        return;
    }
    showLoadingSpinner();

    try {
        const croppedCanvas = cropper.getCroppedCanvas();
        croppedCanvas.toBlob(async (blob) => {
            if (blob) {
                // Creiamo un oggetto File dal Blob per coerenza con uploadImage
                const croppedFile = new File([blob], `cropped_plant_${Date.now()}.png`, { type: 'image/png' });
                currentCroppingFile = croppedFile; // Salva il file ritagliato nella variabile globale

                // Aggiorna l'anteprima nel form (con un URL temporaneo per non aspettare l'upload)
                if (currentCroppingImagePreviewElement) {
                    currentCroppingImagePreviewElement.src = URL.createObjectURL(blob);
                    currentCroppingImagePreviewElement.style.display = 'block';
                }
                // Se è un update, resetta l'URL nascosto per indicare che c'è un nuovo file
                if (isUpdateFormCropping && currentCroppingHiddenUrlElement) {
                    currentCroppingHiddenUrlElement.value = '';
                }

                closeCropModal(); // Chiudi la modal di ritaglio
                hideLoadingSpinner();
                showToast("Immagine ritagliata con successo!", 'success');
            } else {
                showToast("Errore durante il ritaglio dell'immagine.", 'error');
                hideLoadingSpinner();
            }
        }, 'image/png', 0.9); // Formato e qualità dell'immagine ritagliata
    } catch (error) {
        console.error("Errore nel salvataggio dell'immagine ritagliata:", error);
        showToast("Errore nel ritaglio: " + error.message, 'error');
        hideLoadingSpinner();
    }
}


// =======================================================
// 8. INIZIALIZZAZIONE E GESTIONE EVENTI DOM
// =======================================================

// Quando il DOM è completamente caricato
document.addEventListener('DOMContentLoaded', async () => {

    // Inizializza tutte le variabili DOM qui
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
    registerPasswordInput = document = document.getElementById('registerPassword');
    registerError = document.getElementById('register-error');
    authStatusSpan = document.getElementById('auth-status');
    logoutButton = document.getElementById('logoutButton');
    searchInput = document.getElementById('searchInput');
    categoryFilter = document.getElementById('categoryFilter');
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    sortBySelect = document.getElementById('sortBy');

    addNewPlantButton = document.getElementById('addNewPlantButton');
    showAllPlantsButton = document.getElementById('showAllPlantsButton');
    showMyGardenButton = document.getElementById('showMyGardenButton');
    plantsSectionHeader = document.getElementById('plantsSectionHeader');
    lightSensorContainer = document.getElementById('lightSensorContainer');
    startLightSensorButton = document.getElementById('startLightSensorButton');
    stopLightSensorButton = document.getElementById('stopLightSensorButton');
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback');
    loadingSpinner = document.getElementById('loading-spinner');
    toastContainer = document.getElementById('toast-container');
    googleLensButton = document.getElementById('googleLensButton');

    // Modali
    imageModal = document.getElementById('image-modal');
    zoomedImage = document.getElementById('zoomed-image');
    closeImageModalButton = document.querySelector('#image-modal .close-button');
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


    // Template dei form (li recuperiamo come nodi DOM da clonare)
    const newPlantFormTemplateDiv = document.getElementById('newPlantFormTemplate');
    const updatePlantFormTemplateDiv = document.getElementById('updatePlantFormTemplate');

    if (newPlantFormTemplateDiv) {
        newPlantFormTemplate = newPlantFormTemplateDiv.querySelector('form');
    } else {
        console.error("newPlantFormTemplateDiv non trovato! Impossibile inizializzare il template.");
    }
    if (updatePlantFormTemplateDiv) {
        updatePlantFormTemplate = updatePlantFormTemplateDiv.querySelector('form');
    } else {
        console.error("updatePlantFormTemplateDiv non trovato! Impossibile inizializzare il template.");
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
        if (lightSensorContainer) {
            // Se il sensore non è supportato, nascondi i controlli automatici e mostra quelli manuali
            if (autoSensorControls) autoSensorControls.style.display = 'none';
            if (manualLuxInputControls) manualLuxInputControls.style.display = 'block';
            if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p style="color: blue;">Sensore di luce non supportato dal tuo dispositivo. Inserisci i Lux manualmente.</p>';
            showToast("Sensore di luce ambientale non supportato. Inserisci Lux manualmente.", 'info', 5000);
        }
    } else {
        // Se il sensore è supportato, mostra i controlli automatici e nascondi quelli manuali
        if (autoSensorControls) autoSensorControls.style.display = 'block';
        if (manualLuxInputControls) manualLuxInputControls.style.display = 'none';
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p>Attiva il sensore per la misurazione e per il feedback specifico sulle piante.</p>'; // Reset default message
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


    // Event Listeners per l'autenticazione
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (showLoginLink) showLoginLink.addEventListener('click', showLoginForm);
    if (showRegisterLink) showRegisterLink.addEventListener('click', showRegisterForm);

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

    // Event Listeners per i bottoni di navigazione principale
    if (showAllPlantsButton) showAllPlantsButton.addEventListener('click', displayAllPlants);
    if (showMyGardenButton) showMyGardenButton.addEventListener('click', displayMyGarden);
    // Ora passiamo direttamente la FORM del template, non il DIV contenitore
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', () => openCardModal(newPlantFormTemplate));
    if (googleLensButton) {
        googleLensButton.addEventListener('click', () => {
            window.open('https://images.google.com/imghp?hl=it&gws_rd=ssl', '_blank');
            showToast('Verrai reindirizzato alla ricerca per immagine di Google. Carica un\'immagine per l\'identificazione.', 'info');
        });
    }

    // Event listener per il bottone "Ottieni Clima"
    if (getClimateButton) getClimateButton.addEventListener('click', getLocation);

    // Gestione clic sulle card delle piante tramite delegazione eventi su gardenContainer e myGardenContainer
    if (gardenContainer) {
        gardenContainer.addEventListener('click', async (event) => {
            const plantCard = event.target.closest('.plant-card');
            if (!plantCard) return; // Non è stata cliccata una card

            const plantId = plantCard.dataset.plantId;
            const plant = allPlants.find(p => p.id === plantId);
            if (!plant) {
                console.error("Pianta non trovata per l'ID:", plantId);
                return;
            }

            if (event.target.classList.contains('plant-image')) {
                openImageModal(event.target.src);
            } else if (event.target.classList.contains('add-to-garden-button')) {
                await addToMyGarden(plantId);
            } else if (event.target.classList.contains('update-plant-button')) {
                openCardModal(updatePlantFormTemplate, plant); // Passa la form template e i dati della pianta
            } else if (event.target.classList.contains('delete-plant-from-db-button')) {
                if (confirm('Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile e la rimuoverà per tutti gli utenti.')) {
                    await deletePlantFromDatabase(plantId);
                }
            } else {
                // Se cliccato sulla card ma non su un bottone o immagine, mostra i dettagli nella modale
                let detailsHtml = `
                    <div class="plant-details-header">
                        <img src="${plant.image || 'https://placehold.co/150x150/EEEEEE/333333?text=No+Image'}" alt="${plant.name}" class="plant-details-image">
                        <h2>${plant.name}</h2>
                    </div>
                    <div class="plant-details-body">
                        <p><strong>Descrizione:</strong> ${plant.description || 'N/A'}</p>
                        <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
                        <p><strong>Esposizione al Sole:</strong> ${plant.sunlight || 'N/A'}</p>
                        <p><strong>Lux Ideali:</strong> ${plant.idealLuxMin !== null && plant.idealLuxMax !== null ? `${plant.idealLuxMin} - ${plant.idealLuxMax}` : 'N/A'}</p>
                        <p><strong>Annaffiatura:</strong> ${plant.watering || 'N/A'}</p>
                        <p><strong>Temperatura Ideale:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
                        <p><strong>Aggiunta il:</strong> ${plant.createdAt ? new Date(plant.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
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
                console.error("Pianta non trovata per l'ID:", plantId);
                return;
            }

            if (event.target.classList.contains('plant-image')) {
                openImageModal(event.target.src);
            } else if (event.target.classList.contains('remove-button')) {
                await removeFromMyGarden(plantId);
            } else if (event.target.classList.contains('update-plant-button')) {
                openCardModal(updatePlantFormTemplate, plant); // Passa la form template e i dati della pianta
            } else if (event.target.classList.contains('delete-plant-from-db-button')) {
                if (confirm('Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile e la rimuoverà per tutti gli utenti.')) {
                    await deletePlantFromDatabase(plantId);
                }
            } else {
                // Mostra dettagli
                let detailsHtml = `
                    <div class="plant-details-header">
                        <img src="${plant.image || 'https://placehold.co/150x150/EEEEEE/333333?text=No+Image'}" alt="${plant.name}" class="plant-details-image">
                        <h2>${plant.name}</h2>
                    </div>
                    <div class="plant-details-body">
                        <p><strong>Descrizione:</strong> ${plant.description || 'N/A'}</p>
                        <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
                        <p><strong>Esposizione al Sole:</strong> ${plant.sunlight || 'N/A'}</p>
                        <p><strong>Lux Ideali:</strong> ${plant.idealLuxMin !== null && plant.idealLuxMax !== null ? `${plant.idealLuxMin} - ${plant.idealLuxMax}` : 'N/A'}</p>
                        <p><strong>Annaffiatura:</strong> ${plant.watering || 'N/A'}</p>
                        <p><strong>Temperatura Ideale:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
                        <p><strong>Aggiunta il:</strong> ${plant.createdAt ? new Date(plant.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
                    </div>
                `;
                zoomedCardContent.innerHTML = detailsHtml;
                cardModal.style.display = 'flex';
            }
        });
    }

    // Chiusura modali (listener per il click sul bottone 'x' e sullo sfondo della modale)
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => { imageModal.style.display = 'none'; });
    if (imageModal) imageModal.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.style.display = 'none'; });

    if (closeCardModalButton) closeCardModalButton.addEventListener('click', closeCardModal); // Chiude la modale con la funzione che pulisce e resetta
    if (cardModal) cardModal.addEventListener('click', (e) => { if (e.target === cardModal) closeCardModal(); });

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


    // Gestione dello stato di autenticazione iniziale
    firebase.auth().onAuthStateChanged(async user => {
        await updateUIforAuthState(user);
    });
});
