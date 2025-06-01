// Variabili globali per lo stato dell'applicazione
let allPlants = [];
let myGarden = []; // Inizializza come array vuoto
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
let newPlantCard; // Modulo per aggiungere nuova pianta
let updatePlantCard; // Modulo per aggiornare pianta esistente
let plantsSectionHeader; // Header della sezione piante (es. "Tutte le Piante Disponibili")
let lightSensorContainer;
let startLightSensorButton;
let stopLightSensorButton;
let lightDataSpan;
let lightFeedbackSpan;
let tempMinFilter;
let tempMaxFilter;
let sortBySelect; // Selettore per l'ordinamento

// Variabili per le Modal
let imageModal; // Modal per zoom immagine
let zoomedImage; // Immagine nella modal di zoom
let cardModal; // NUOVA: Modal per zoom card completa
let zoomedCardContent; // Contenuto della card zoomata
let closeImageModalButton; // Bottone di chiusura per modal immagine
let closeCardModalButton; // Bottone di chiusura per modal card

let loadingSpinner; // Spinner di caricamento
let toastContainer; // Contenitore per i toast

let getClimateButton;       // Variabile per il bottone "Ottieni Clima"
let locationStatusDiv;      // Variabile per il div di stato della posizione
let climateZoneFilter;

const CLIMATE_TEMP_RANGES = {
    'Mediterraneo': { min: 5, max: 35 },
    'Temperato': { min: -10, max: 30 },
    'Tropicale': { min: 18, max: 40 },
    'Subtropicale': { min: 10, max: 38 },
    'Boreale/Artico': { min: -40, max: 20 },
    'Arido': { min: 0, max: 45 },
    };

let db; // Istanza di Firestore

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
function validatePlantForm(plantData, isUpdate = false) {
    let isValid = true;
    const formElement = isUpdate ? updatePlantCard : newPlantCard;
    clearFormValidationErrors(formElement); // Pulisce errori precedenti

    const fields = [
        { id: isUpdate ? 'updatePlantName' : 'newPlantName', value: plantData.name, message: 'Il nome è obbligatorio.' },
        { id: isUpdate ? 'updatePlantSunlight' : 'newPlantSunlight', value: plantData.sunlight, message: 'L\'esposizione al sole è obbligatoria.' },
        { id: isUpdate ? 'updatePlantWatering' : 'newPlantWatering', value: plantData.watering, message: 'La frequenza di innaffiatura è obbligatoria.' },
        { id: isUpdate ? 'updatePlantCategory' : 'newPlantCategory', value: plantData.category, message: 'La categoria è obbligatoria.' }
    ];

    for (const field of fields) {
        if (!field.value || (typeof field.value === 'string' && field.value.trim() === '')) {
            showFormValidationError(field.id, field.message);
            isValid = false;
        }
    }

    // Validazione lux min/max
    const luxMin = plantData.idealLuxMin !== null ? parseFloat(plantData.idealLuxMin) : null;
    const luxMax = plantData.idealLuxMax !== null ? parseFloat(plantData.idealLuxMax) : null;

    if (plantData.idealLuxMin !== null && (isNaN(luxMin) || luxMin < 0)) {
        showFormValidationError(isUpdate ? 'updatePlantIdealLuxMin' : 'newPlantIdealLuxMin', 'Lux Min deve essere un numero positivo.');
        isValid = false;
    }
    if (plantData.idealLuxMax !== null && (isNaN(luxMax) || luxMax < 0)) {
        showFormValidationError(isUpdate ? 'updatePlantIdealLuxMax' : 'newPlantIdealLuxMax', 'Lux Max deve essere un numero positivo.');
        isValid = false;
    }
    if (luxMin !== null && luxMax !== null && luxMin > luxMax) {
        showFormValidationError(isUpdate ? 'updatePlantIdealLuxMax' : 'newPlantIdealLuxMax', 'Lux Max non può essere inferiore a Lux Min.');
        isValid = false;
    }

    // Validazione temperature min/max
    const tempMin = plantData.tempMin !== null ? parseFloat(plantData.tempMin) : null;
    const tempMax = plantData.tempMax !== null ? parseFloat(plantData.tempMax) : null;

    if (plantData.tempMin !== null && isNaN(tempMin)) {
        showFormValidationError(isUpdate ? 'updatePlantTempMin' : 'newPlantTempMin', 'Temperatura Min deve essere un numero.');
        isValid = false;
    }
    if (plantData.tempMax !== null && isNaN(tempMax)) {
        showFormValidationError(isUpdate ? 'updatePlantTempMax' : 'newPlantTempMax', 'Temperatura Max deve essere un numero.');
        isValid = false;
    }
    if (tempMin !== null && tempMax !== null && tempMin > tempMax) {
        showFormValidationError(isUpdate ? 'updatePlantTempMax' : 'newPlantTempMax', 'Temperatura Max non può essere inferiore a Temperatura Min.');
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
function updateUIforAuthState(user) {
    if (user) {
        authContainerDiv.style.display = 'none';
        appContentDiv.style.display = 'block';
        authStatusSpan.textContent = `Benvenuto, ${user.email}!`;
        logoutButton.style.display = 'block';
        
        // Assicurati che i form di aggiunta/aggiornamento siano nascosti
        newPlantCard.style.display = 'none';
        updatePlantCard.style.display = 'none';

        // Mostra il contenitore delle piante principale per default al login
        isMyGardenCurrentlyVisible = false; // Reset dello stato
        gardenContainer.style.display = 'grid';
        myGardenContainer.style.display = 'none';

        // Carica i dati dal database
        fetchPlantsFromFirestore();
        fetchMyGardenFromFirebase();
    } else {
        authContainerDiv.style.display = 'block';
        appContentDiv.style.display = 'none';
        authStatusSpan.textContent = '';
        logoutButton.style.display = 'none';
        // Nascondi tutte le sezioni di contenuto quando non loggato
        gardenContainer.style.display = 'none';
        myGardenContainer.style.display = 'none';
        newPlantCard.style.display = 'none';
        updatePlantCard.style.display = 'none';
        
        // Pulisci i dati locali quando l'utente fa il logout
        allPlants = [];
        myGarden = [];
        isMyGardenCurrentlyVisible = false;
        // Resetta i filtri e l'ordinamento
        // Resetta i filtri e l'ordinamento
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (climateZoneFilter) climateZoneFilter.value = '';
        if (tempMinFilter) tempMinFilter.value = '';
        if (tempMaxFilter) tempMaxFilter.value = '';
        if (sortBySelect) sortBySelect.value = 'name_asc';
    }
}

// Gestisce il login dell'utente
async function handleLogin(e) {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    loginError.textContent = '';
    showLoadingSpinner();
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        showToast('Login effettuato con successo!', 'success');
        // updateUIforAuthState viene chiamato automaticamente da onAuthStateChanged
    } catch (error) {
        loginError.textContent = `Errore di login: ${error.message}`;
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
    registerError.textContent = '';
    showLoadingSpinner();
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        showToast('Registrazione effettuata con successo!', 'success');
        // updateUIforAuthState viene chiamato automaticamente da onAuthStateChanged
    } catch (error) {
        registerError.textContent = `Errore di registrazione: ${error.message}`;
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
        // updateUIforAuthState viene chiamato automaticamente da onAuthStateChanged
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
    loginError.textContent = '';
    registerError.textContent = '';
}

// Mostra il form per aggiungere una nuova pianta
function showNewPlantForm() {
    newPlantCard.style.display = 'block';
    updatePlantCard.style.display = 'none';
    // Reset e pulizia del form
    document.getElementById('newPlantForm').reset(); // Resetta tutti i campi
    clearFormValidationErrors(newPlantCard);
    currentPlantIdToUpdate = null; // Resetta l'ID della pianta da aggiornare

    newPlantCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Mostra il form per aggiornare una pianta esistente
function showUpdatePlantForm(plant) {
    currentPlantIdToUpdate = plant.id;
    document.getElementById('updatePlantName').value = plant.name || '';
    document.getElementById('updatePlantSunlight').value = plant.sunlight || '';
    document.getElementById('updatePlantIdealLuxMin').value = plant.idealLuxMin !== null ? plant.idealLuxMin.toString() : '';
    document.getElementById('updatePlantIdealLuxMax').value = plant.idealLuxMax !== null ? plant.idealLuxMax.toString() : '';
    document.getElementById('updatePlantWatering').value = plant.watering || '';
    document.getElementById('updatePlantTempMin').value = plant.tempMin !== null ? plant.tempMin.toString() : '';
    document.getElementById('updatePlantTempMax').value = plant.tempMax !== null ? plant.tempMax.toString() : '';
    document.getElementById('updatePlantClimateZone').value = plant.climateZone || '';
    document.getElementById('updatePlantDescription').value = plant.description || '';
    document.getElementById('updatePlantCategory').value = plant.category || '';
    document.getElementById('updatePlantImageURL').value = plant.image || '';

    newPlantCard.style.display = 'none';
    updatePlantCard.style.display = 'block';
    clearFormValidationErrors(updatePlantCard);

    updatePlantCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Nasconde tutti i form di aggiunta/aggiornamento pianta
function hidePlantForms() {
    if (newPlantCard) {
        newPlantCard.style.display = 'none';
        clearFormValidationErrors(newPlantCard);
    }
    if (updatePlantCard) {
        updatePlantCard.style.display = 'none';
        clearFormValidationErrors(updatePlantCard);
    }
    currentPlantIdToUpdate = null;
}

// =======================================================
// 3. INTERAZIONE CON FIRESTORE (CRUD Piante)
// =======================================================

// Salva o aggiorna una pianta nel database Firestore
async function savePlantToFirestore(e) {
    e.preventDefault();
    showLoadingSpinner();

    const formPrefix = currentPlantIdToUpdate ? 'update' : 'new';
    const plantData = {
        name: document.getElementById(`${formPrefix}PlantName`).value.trim(),
        sunlight: document.getElementById(`${formPrefix}PlantSunlight`).value,
        idealLuxMin: document.getElementById(`${formPrefix}PlantIdealLuxMin`).value.trim() !== '' ? parseFloat(document.getElementById(`${formPrefix}PlantIdealLuxMin`).value.trim()) : null,
        idealLuxMax: document.getElementById(`${formPrefix}PlantIdealLuxMax`).value.trim() !== '' ? parseFloat(document.getElementById(`${formPrefix}PlantIdealLuxMax`).value.trim()) : null,
        watering: document.getElementById(`${formPrefix}PlantWatering`).value,
        tempMin: document.getElementById(`${formPrefix}PlantTempMin`).value.trim() !== '' ? parseFloat(document.getElementById(`${formPrefix}PlantTempMin`).value.trim()) : null,
        tempMax: document.getElementById(`${formPrefix}PlantTempMax`).value.trim() !== '' ? parseFloat(document.getElementById(`${formPrefix}PlantTempMax`).value.trim()) : null,
        climateZone: document.getElementById(`${formPrefix}PlantClimateZone`).value.trim() || null,
        description: document.getElementById(`${formPrefix}PlantDescription`).value.trim() || null,
        category: document.getElementById(`${formPrefix}PlantCategory`).value,
        image: document.getElementById(`${formPrefix}PlantImageURL`).value.trim() || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!validatePlantForm(plantData, !!currentPlantIdToUpdate)) {
        hideLoadingSpinner();
        return;
    }

    try {
        if (currentPlantIdToUpdate) {
            // Aggiorna la pianta nel database
            await db.collection('plants').doc(currentPlantIdToUpdate).update(plantData);
            showToast('Pianta aggiornata con successo!', 'success');
            // Aggiorna la pianta anche nel giardino dell'utente se presente
            const user = firebase.auth().currentUser;
            if (user) {
                const gardenRef = db.collection('gardens').doc(user.uid);
                const doc = await gardenRef.get();
                if (doc.exists) {
                    let currentGardenPlants = doc.data().plants || [];
                    const index = currentGardenPlants.findIndex(p => p.id === currentPlantIdToUpdate);
                    if (index !== -1) {
                        currentGardenPlants[index] = { id: currentPlantIdToUpdate, ...plantData };
                        await gardenRef.set({ plants: currentGardenPlants });
                        myGarden = currentGardenPlants; // Sincronizza il giardino locale
                    }
                }
            }
        } else {
            // Aggiungi una nuova pianta al database
            await db.collection('plants').add(plantData);
            showToast('Pianta aggiunta con successo!', 'success');
        }
        hidePlantForms();
        await fetchPlantsFromFirestore(); // Ricarica tutte le piante
        if (isMyGardenCurrentlyVisible) {
        await fetchMyGardenFromFirebase(); // Ricarica il giardino se visibile
        }
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
        // 1. Elimina la pianta dalla collezione 'plants'
        await db.collection('plants').doc(plantId).delete();
        showToast('Pianta eliminata con successo dal database!', 'success');

        // 2. Rimuovi la pianta dal giardino di OGNI utente
        const gardensSnapshot = await db.collection('gardens').get();
        const batch = db.batch(); // Usa un batch per eliminazioni multiple efficienti

        gardensSnapshot.docs.forEach(doc => {
            let currentGardenPlants = doc.data().plants || [];
            const updatedGardenPlants = currentGardenPlants.filter(plant => plant.id !== plantId);
            if (updatedGardenPlants.length !== currentGardenPlants.length) {
                // Solo se la pianta era presente nel giardino dell'utente
                batch.update(doc.ref, { plants: updatedGardenPlants });
            }
        });
        await batch.commit(); // Esegui tutte le modifiche del batch

        await fetchPlantsFromFirestore(); // Ricarica tutte le piante
        await fetchMyGardenFromFirebase(); // Ricarica il giardino dell'utente corrente (se loggato)

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

        // Evita duplicati
        if (currentGardenPlants.some(p => p.id === plantId)) {
            showToast("Questa pianta è già nel tuo giardino!", 'info');
            hideLoadingSpinner();
            return;
        }

        // Trova la pianta completa dai dati di allPlants per salvare tutti i dettagli
        const plantToAdd = allPlants.find(plant => plant.id === plantId);
        if (plantToAdd) {
            currentGardenPlants.push(plantToAdd);
            await gardenRef.set({ plants: currentGardenPlants });
            myGarden = currentGardenPlants; // Aggiorna la variabile locale myGarden
            showToast('Pianta aggiunta al tuo giardino!', 'success');
            // Aggiorna la visualizzazione se il giardino è attualmente visibile o se sono mostrate tutte le piante
            if (isMyGardenCurrentlyVisible) {
                displayMyGarden();
            } else {
                // Se siamo in modalità "Tutte le piante", dobbiamo aggiornare i bottoni "Aggiungi al Giardino"
                displayAllPlants();
            }
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

    const gardenRef = db.collection('gardens').doc(user.uid);
    try {
        const doc = await gardenRef.get();
        if (doc.exists) {
            let currentGardenPlants = doc.data().plants || [];
            const updatedGardenPlants = currentGardenPlants.filter(plant => plant.id !== plantId);

            if (updatedGardenPlants.length !== currentGardenPlants.length) {
                await gardenRef.set({ plants: updatedGardenPlants });
                myGarden = updatedGardenPlants; // Aggiorna la variabile locale myGarden
                showToast('Pianta rimossa dal tuo giardino!', 'info');
                // Aggiorna la visualizzazione
                if (isMyGardenCurrentlyVisible) {
                    displayMyGarden();
                } else {
                    // Se siamo in modalità "Tutte le piante", dobbiamo aggiornare i bottoni "Aggiungi al Giardino"
                    displayAllPlants();
                }
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
    showLoadingSpinner();
    try {
        const plantsRef = db.collection('plants');
        const snapshot = await plantsRef.get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante caricate da Firestore:", allPlants);
        
        // Determina quale set di piante visualizzare in base allo stato corrente
        if (isMyGardenCurrentlyVisible) {
             displayPlants(myGarden); // Se era già visibile il giardino, lo ricarico
        } else {
             displayPlants(allPlants); // Altrimenti, mostro tutte le piante
        }

    } catch (error) {
        showToast(`Errore nel caricamento delle piante: ${error.message}`, 'error');
        console.error("Errore nel caricamento delle piante: ", error);
    } finally {
        hideLoadingSpinner();
    }
}

// Recupera le piante del giardino dell'utente autenticato da Firestore
async function fetchMyGardenFromFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) {
        myGarden = [];
        console.log("Utente non autenticato, giardino vuoto.");
        // Non nascondo lo spinner qui, lo fa fetchPlantsFromFirestore o l'interazione iniziale.
        return;
    }
    showLoadingSpinner(); // Mostra spinner anche qui
    try {
        const gardenRef = db.collection('gardens').doc(user.uid);
        const doc = await gardenRef.get();
        if (doc.exists) {
            myGarden = doc.data().plants || [];
            console.log("Giardino caricato da Firebase:", myGarden);
        } else {
            myGarden = [];
            console.log("Nessun documento del giardino trovato per l'utente, giardino vuoto.");
        }
        // Se myGarden è attualmente visibile, lo ricarico subito
        if (isMyGardenCurrentlyVisible) {
            displayMyGarden();
        }
    } catch (error) {
        showToast(`Errore nel caricamento del tuo giardino: ${error.message}`, 'error');
        console.error("Errore nel caricamento del mio giardino: ", error);
    } finally {
        hideLoadingSpinner();
    }
}


// =======================================================
// 4. VISUALIZZAZIONE E FILTRAGGIO/ORDINAMENTO DELLE PIANTE
// =======================================================

// Applica i filtri e l'ordinamento a un array di piante
function applyFiltersAndSort(plantsToFilter) {
    let filteredPlants = [...plantsToFilter];

    // Controlli nulli per searchInput, categoryFilter, climateZoneFilter, tempMinFilter, tempMaxFilter, sortBySelect
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (searchTerm) {
        filteredPlants = filteredPlants.filter(plant =>
            (plant.name && plant.name.toLowerCase().includes(searchTerm)) ||
            (plant.description && plant.description.toLowerCase().includes(searchTerm)) ||
            (plant.category && plant.category.toLowerCase().includes(searchTerm)) ||
            (plant.climateZone && plant.climateZone.toLowerCase().includes(searchTerm))
        );
    }

    const category = categoryFilter ? categoryFilter.value : 'all'; // Aggiunto controllo null
    if (category !== 'all') {
        filteredPlants = filteredPlants.filter(plant => plant.category === category);
    }

    const selectedClimate = climateZoneFilter ? climateZoneFilter.value : ''; // Aggiunto controllo null
    if (selectedClimate && selectedClimate !== '' && selectedClimate !== 'Sconosciuto') {
        const climateRange = CLIMATE_TEMP_RANGES[selectedClimate];
        if (climateRange) {
            filteredPlants = filteredPlants.filter(plant => {
                const plantMin = parseInt(plant.tempMin);
                const plantMax = parseInt(plant.tempMax);
                if (isNaN(plantMin) || isNaN(plantMax)) {
                    console.warn(`La pianta ${plant.name} ha valori di temperatura non numerici. Ignorata nel filtro clima.`);
                    return false;
                }
                return plantMin >= climateRange.min && plantMax <= climateRange.max;
            });
        } else {
            console.warn(`Intervallo di temperatura non definito per il clima dedotto: ${selectedClimate}. Nessuna pianta sarà mostrata per questo filtro.`);
            filteredPlants = [];
        }
    }

    const tempMin = tempMinFilter ? parseFloat(tempMinFilter.value) : NaN; // Aggiunto controllo null
    const tempMax = tempMaxFilter ? parseFloat(tempMaxFilter.value) : NaN; // Aggiunto controllo null

    // Filtra per temperatura minima
    if (!isNaN(tempMin)) {
        filteredPlants = filteredPlants.filter(plant =>
            (plant.tempMin !== null && plant.tempMax !== null && plant.tempMin >= tempMin) ||
            (plant.tempMin === null && plant.tempMax !== null && plant.tempMax >= tempMin) ||
            (plant.tempMin !== null && plant.tempMax === null && plant.tempMin >= tempMin) ||
            (plant.tempMin === null && plant.tempMax === null)
        );
    }
    // Filtra per temperatura massima
    if (!isNaN(tempMax)) {
        filteredPlants = filteredPlants.filter(plant =>
            (plant.tempMin !== null && plant.tempMax !== null && plant.tempMax <= tempMax) ||
            (plant.tempMin === null && plant.tempMax !== null && plant.tempMax <= tempMax) ||
            (plant.tempMin !== null && plant.tempMax === null && plant.tempMin <= tempMax) ||
            (plant.tempMin === null && plant.tempMax === null)
        );
    }

    // Ordinamento
    switch (sortBySelect ? sortBySelect.value : 'name_asc') { // Aggiunto controllo null per sortBySelect
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
    }
    return filteredPlants;
}

function getLocation() {
    console.log('getLocation: Funzione avviata.'); // Aggiungi questo
    if (navigator.geolocation) {
        locationStatusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Acquisizione posizione in corso...';
        showLoadingSpinner(); // Mostra spinner
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
                locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errorMessage}`;
                showToast(errorMessage, 'error');
                climateZoneFilter.value = ''; // Resetta il filtro clima
                applyFilters(); // Applica i filtri senza considerare il clima
                hideLoadingSpinner(); // Nasconde spinner in caso di errore
            }
        );
    } else {
        locationStatusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> La geolocalizzazione non è supportata dal tuo browser.';
        showToast("Geolocalizzazione non supportata.", 'error');
        climateZoneFilter.value = ''; // Resetta il filtro clima
        applyFilters(); // Applica i filtri senza considerare il clima
    }
}

// Deduce la zona climatica dalle coordinate (usando un servizio esterno o logica interna)
async function getClimateFromCoordinates(lat, lon) {
    // Aggiungi controllo null per locationStatusDiv
    if (locationStatusDiv) {
        locationStatusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recupero dati climatici...';
    } else {
        console.warn("Elemento 'locationStatusDiv' non trovato.");
    }
    
    showLoadingSpinner();

    try {
        // Questa è la parte dove interrogheresti un'API esterna per convertire
        // lat/lon in una zona climatica o in dati di temperatura per dedurla.
        // Esempio FITTIZIO per ora, DEVI SOSTITUIRLO con la tua logica o chiamata API reale:
        // const response = await fetch(`https://api.example.com/climate?lat=${lat}&lon=${lon}&apiKey=YOUR_API_KEY`);
        // if (!response.ok) throw new Error('Errore nel recupero dati climatici dall\'API esterna.');
        // const data = await response.json();
        // const detectedZone = data.climateZone; // Assumi che l'API restituisca questo

        // PLACEHOLDER: Sostituisci questa logica con la tua integrazione API reale.
        // Ad esempio, potresti avere un array di range di temperature e una logica per dedurre
        // la zona climatica in base alla temperatura media della tua posizione corrente.
        const detectedZone = "Temperato"; // Esempio: dovresti ottenere questo da un'API climatica
        // Fine PLACEHOLDER

        // Controlla se climateZoneFilter esiste prima di impostarne il valore
        if (climateZoneFilter) {
            climateZoneFilter.value = detectedZone; // Linea 803 / 810
        } else {
            console.warn("Elemento 'climateZoneFilter' non trovato per impostare il valore.");
            showToast('Impossibile impostare il filtro climatico automatico.', 'warning');
        }
        
        // Controlla se locationStatusDiv esiste prima di aggiornarne il contenuto
        if (locationStatusDiv) {
            locationStatusDiv.textContent = `Clima rilevato: ${detectedZone}`;
        }
        showToast(`Clima rilevato: ${detectedZone}`, 'info');

        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Aggiorna la visualizzazione dopo aver impostato il filtro

    } catch (error) {
        console.error('Errore nel recupero dei dati climatici:', error);
        // Controlla se locationStatusDiv esiste prima di aggiornarne il contenuto
        if (locationStatusDiv) {
            locationStatusDiv.textContent = 'Errore nel recupero dei dati climatici.';
        }
        showToast(`Errore nel recupero dei dati climatici: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
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
        return; // Esci dalla funzione per prevenire ulteriori errori
    }

    // Aggiorna l'header della sezione
    plantsSectionHeader.textContent = isMyGardenCurrentlyVisible ? "Il Mio Giardino" : "Tutte le Piante Disponibili";

    if (filteredAndSortedPlants.length === 0) {
        targetContainer.innerHTML = ''; // Svuota il contenitore
        if (isMyGardenCurrentlyVisible) {
            emptyGardenMessage.style.display = 'block'; // Mostra messaggio giardino vuoto
        } else {
            emptyGardenMessage.style.display = 'none'; // Nascondi messaggio per tutte le piante
            // Puoi aggiungere un messaggio "Nessuna pianta trovata con questi filtri" qui se vuoi
            html = '<p style="text-align: center; grid-column: 1 / -1; padding: 20px; color: #777;">Nessuna pianta trovata con i filtri applicati.</p>';
        }
    } else {
        emptyGardenMessage.style.display = 'none'; // Nascondi messaggio vuoto
        filteredAndSortedPlants.forEach(plant => {
            // Determina se la pianta è già nel giardino per disabilitare il bottone "Aggiungi al Giardino"
            const isInMyGarden = user && myGarden.some(p => p.id === plant.id);
            const addToGardenButtonHtml = user ?
                `<button class="add-to-garden-button" data-plant-id="${plant.id}" ${isInMyGarden ? 'disabled' : ''}>${isInMyGarden ? '<i class="fas fa-check"></i> Già nel Giardino' : '<i class="fas fa-plus-circle"></i> Aggiungi al Giardino'}</button>` :
                `<button class="add-to-garden-button" disabled title="Accedi per aggiungere"><i class="fas fa-plus-circle"></i> Aggiungi al Giardino</button>`;

            // Bottone per rimuovere dal giardino (mostrato solo se nel "Mio Giardino")
            const removeFromGardenButtonHtml = isMyGardenCurrentlyVisible ?
                `<button class="remove-button" data-plant-id="${plant.id}"><i class="fas fa-minus-circle"></i> Rimuovi</button>` : '';

            html += `
                <div class="plant-card" data-plant-id="${plant.id}">
                    ${plant.image ? `<img src="${plant.image}" alt="${plant.name}" class="plant-image">` : ''}
                    <h3>${plant.name}</h3>
                    <p><strong>Esposizione al Sole:</strong> ${plant.sunlight || 'N/A'}</p>
                    <p><strong>Annaffiatura:</strong> ${plant.watering || 'N/A'}</p>
                    <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
                    <div class="card-actions">
                        ${isMyGardenCurrentlyVisible ? removeFromGardenButtonHtml : addToGardenButtonHtml}
                        <button class="update-plant-button" data-plant-id="${plant.id}"><i class="fas fa-edit"></i> Aggiorna</button>
                        <button class="delete-plant-from-db-button" data-plant-id="${plant.id}"><i class="fas fa-trash"></i> Elimina</button>
                    </div>
                </div>
            `;
        });
    }

    targetContainer.innerHTML = html;
    targetContainer.style.display = 'grid'; // Mostra il contenitore target come griglia
    otherContainer.style.display = 'none'; // Nascondi l'altro contenitore
}

// Funzione per mostrare solo le piante nel mio giardino
function displayMyGarden() {
    hidePlantForms(); // Nascondi i form di aggiunta/modifica
    isMyGardenCurrentlyVisible = true;
    displayPlants(myGarden);
    if (addNewPlantButton) addNewPlantButton.style.display = 'none';
    // Assicurati che il giardino sia scrollato in vista
    myGardenContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Funzione per mostrare tutte le piante disponibili
function displayAllPlants() {
    hidePlantForms(); // Nascondi i form di aggiunta/modifica
    isMyGardenCurrentlyVisible = false;
    displayPlants(allPlants);
    if (addNewPlantButton) addNewPlantButton.style.display = 'block';
    // Assicurati che la galleria principale sia scrollata in vista
    gardenContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            showToast("Permesso sensore luce richiesto. Potrebbe apparire un popup.", 'info');
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

// Avvia la lettura del sensore di luce
async function startLightSensor() {
    const hasPermission = await requestLightSensorPermission();
    if (!hasPermission) {
        return;
    }

    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
    }

    try {
        ambientLightSensor = new AmbientLightSensor();

        ambientLightSensor.onreading = (event) => {
            const lux = ambientLightSensor.illuminance;
            lightDataSpan.textContent = `Luminosità attuale: ${lux.toFixed(2)} lux`;

            // Feedback basato sulla luminosità (esempi)
            if (lux < 50) {
                lightFeedbackSpan.textContent = 'Troppo buio per la maggior parte delle piante!';
                lightFeedbackSpan.style.color = 'red';
            } else if (lux < 500) {
                lightFeedbackSpan.textContent = 'Luminosità bassa, adatta a piante d\'ombra.';
                lightFeedbackSpan.style.color = 'orange';
            } else if (lux < 5000) {
                lightFeedbackSpan.textContent = 'Luminosità media, buona per molte piante da interno.';
                lightFeedbackSpan.style.color = 'green';
            } else {
                lightFeedbackSpan.textContent = 'Luminosità alta, adatta a piante da pieno sole.';
                lightFeedbackSpan.style.color = 'darkgreen';
            }
        };

        ambientLightSensor.onerror = (event) => {
            console.error('Errore sensore luce:', event.error.name, event.error.message);
            lightDataSpan.textContent = 'Errore sensore luce.';
            lightFeedbackSpan.textContent = 'Impossibile leggere la luminosità.';
            showToast(`Errore sensore luce: ${event.error.message}`, 'error');
            stopLightSensor();
        };

        ambientLightSensor.start();
        startLightSensorButton.style.display = 'none';
        stopLightSensorButton.style.display = 'inline-block';
        showToast('Sensore di luce avviato!', 'success');
    } catch (error) {
        showToast(`Impossibile avviare il sensore di luce: ${error.message}`, 'error');
        console.error('Impossibile avviare il sensore di luce:', error);
    }
}

// Ferma la lettura del sensore di luce
function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
        lightDataSpan.textContent = 'Luminosità: N/A';
        lightFeedbackSpan.textContent = 'Sensore spento.';
        lightFeedbackSpan.style.color = '#555';
        startLightSensorButton.style.display = 'inline-block';
        stopLightSensorButton.style.display = 'none';
        showToast('Sensore di luce fermato.', 'info');
    }
}

// =======================================================
// 6. GESTIONE MODALI (Immagine e Card Completa)
// =======================================================

// Apre la modal dell'immagine
function openImageModal(imageUrl) {
    if (imageModal && zoomedImage) {
        zoomedImage.src = imageUrl;
        imageModal.style.display = 'flex'; // Usa flex per centrare il contenuto
    }
}

// Apre la modal della card completa
function openCardModal(plant) {
    if (!cardModal || !zoomedCardContent) return;

    let user = firebase.auth().currentUser;
    const isInMyGarden = user && myGarden.some(p => p.id === plant.id);

    const addToGardenButtonHtml = user ?
        `<button class="add-to-garden-button" data-plant-id="${plant.id}" ${isInMyGarden ? 'disabled' : ''}>${isInMyGarden ? '<i class="fas fa-check"></i> Già nel Giardino' : '<i class="fas fa-plus-circle"></i> Aggiungi al Giardino'}</button>` :
        `<button class="add-to-garden-button" disabled title="Accedi per aggiungere"><i class="fas fa-plus-circle"></i> Aggiungi al Giardino</button>`;

    const removeFromGardenButtonHtml = isMyGardenCurrentlyVisible ?
        `<button class="remove-button" data-plant-id="${plant.id}"><i class="fas fa-minus-circle"></i> Rimuovi dal Giardino</button>` : '';

    const htmlContent = `
        ${plant.image ? `<img src="${plant.image}" alt="${plant.name}">` : ''}
        <h3>${plant.name}</h3>
        <p><strong>Descrizione:</strong> ${plant.description || 'N/A'}</p>
        <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
        <p><strong>Esposizione al Sole:</strong> ${plant.sunlight || 'N/A'}</p>
        <p><strong>Lux Ideali:</strong> ${plant.idealLuxMin !== null && plant.idealLuxMax !== null ? `${plant.idealLuxMin} - ${plant.idealLuxMax}` : 'N/A'}</p>
        <p><strong>Annaffiatura:</strong> ${plant.watering || 'N/A'}</p>
        <p><strong>Temperatura Ideale:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
        <p><strong>Zona Climatica:</strong> ${plant.climateZone || 'N/A'}</p>
        <div class="card-actions">
            ${isMyGardenCurrentlyVisible ? removeFromGardenButtonHtml : addToGardenButtonHtml}
            <button class="update-plant-button" data-plant-id="${plant.id}"><i class="fas fa-edit"></i> Aggiorna</button>
            <button class="delete-plant-from-db-button" data-plant-id="${plant.id}"><i class="fas fa-trash"></i> Elimina</button>
        </div>
    `;

    zoomedCardContent.innerHTML = htmlContent;
    cardModal.style.display = 'flex'; // Usa flex per centrare il contenuto
}


// =======================================================
// 7. INIZIALIZZAZIONE E GESTIONE EVENTI DOM
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
    registerPasswordInput = document.getElementById('registerPassword');
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
    newPlantCard = document.getElementById('newPlantCard');
    updatePlantCard = document.getElementById('updatePlantCard');
    plantsSectionHeader = document.getElementById('plantsSectionHeader');
    lightSensorContainer = document.querySelector('.light-sensor-container');
    startLightSensorButton = document.getElementById('startLightSensorButton');
    stopLightSensorButton = document.getElementById('stopLightSensorButton');
    lightDataSpan = document.getElementById('currentLuxValue');
    lightFeedbackSpan = document.getElementById('lightFeedback');
    loadingSpinner = document.getElementById('loading-spinner');
    toastContainer = document.getElementById('toast-container');

    // Modali
    imageModal = document.getElementById('image-modal');
    zoomedImage = document.getElementById('zoomed-image');
    closeImageModalButton = document.querySelector('#image-modal .close-button');
    cardModal = document.getElementById('card-modal');
    zoomedCardContent = document.getElementById('zoomed-card-content');
    closeCardModalButton = document.getElementById('close-card-modal');
    emptyGardenMessage = document.getElementById('empty-garden-message')

    // Inizializzazione delle nuove variabili DOM per la geolocalizzazione
    getClimateButton = document.getElementById('get-climate-button');
    locationStatusDiv = document.getElementById('location-status');
    climateZoneFilter = document.getElementById('climateZoneFilter');
    console.log('Valore di climateZoneFilter dopo getElementById:', climateZoneFilter); // AGGIUNGI QUESTA LINEA

     // Inizializza Firebase all'inizio
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();

    // Event Listeners per l'autenticazione
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (showLoginLink) showLoginLink.addEventListener('click', showLoginForm);
    if (showRegisterLink) showRegisterLink.addEventListener('click', showRegisterForm);

    // Event Listeners per i filtri e l'ordinamento
    // Ogni volta che un filtro o l'ordinamento cambia, ricarica le piante
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
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', showNewPlantForm);

     //event listener per la geolocalizzazione
    if (getClimateButton) getClimateButton.addEventListener('click', getLocation);

    // Event Listeners per i form di aggiunta/aggiornamento
    const saveNewPlantButton = document.getElementById('saveNewPlantButton');
    const cancelNewPlantButton = document.getElementById('cancelNewPlantButton');
    const saveUpdatePlantButton = document.getElementById('saveUpdatePlantButton');
    const cancelUpdatePlantButton = document.getElementById('cancelUpdatePlantButton');
    const deletePlantButton = document.getElementById('deletePlant'); // Bottone eliminazione nel form update

    if (saveNewPlantButton) saveNewPlantButton.addEventListener('click', savePlantToFirestore);
    if (cancelNewPlantButton) cancelNewPlantButton.addEventListener('click', hidePlantForms);
    if (saveUpdatePlantButton) saveUpdatePlantButton.addEventListener('click', savePlantToFirestore);
    if (cancelUpdatePlantButton) cancelUpdatePlantButton.addEventListener('click', hidePlantForms);
    if (deletePlantButton) {
        deletePlantButton.addEventListener('click', async () => {
            if (currentPlantIdToUpdate && confirm('Sei sicuro di voler eliminare questa pianta? Questa azione è irreversibile e la rimuoverà per tutti gli utenti.')) {
                await deletePlantFromDatabase(currentPlantIdToUpdate);
                hidePlantForms(); // Nascondi il form dopo l'eliminazione
                showToast('Pianta eliminata con successo!', 'success');
            }
        });
    }

    // Gestione clic sulle card delle piante (aggiungi/rimuovi/aggiorna/elimina/zoom)
    document.body.addEventListener('click', async (event) => {
        // Zoom immagine (solo se clicchi direttamente sull'immagine)
        if (event.target.classList.contains('plant-image')) {
            openImageModal(event.target.src);
            return; // Ferma l'evento per non attivare lo zoom della card
        }
        
        // Zoom card completa (se clicchi sulla card ma non sull'immagine)
        let clickedCard = event.target.closest('.plant-card');
        if (clickedCard && !event.target.classList.contains('plant-image') && !event.target.closest('.card-actions')) {
            const plantId = clickedCard.dataset.plantId;
            const plant = allPlants.find(p => p.id === plantId) || myGarden.find(p => p.id === plantId);
            if (plant) {
                openCardModal(plant);
            }
            return; // Ferma l'evento
        }

              
        // Azioni sui bottoni all'interno delle card (o della card zoomata)
        if (event.target.classList.contains('add-to-garden-button')) {
            const plantIdToAdd = event.target.dataset.plantId;
            await addToMyGarden(plantIdToAdd);
            // Chiudi la modal della card se è aperta
            if (cardModal.style.display === 'flex') cardModal.style.display = 'none';
        } else if (event.target.classList.contains('remove-button')) {
            const plantIdToRemove = event.target.dataset.plantId;
            await removeFromMyGarden(plantIdToRemove);
            // Chiudi la modal della card se è aperta
            if (cardModal.style.display === 'flex') cardModal.style.display = 'none';
        } else if (event.target.classList.contains('update-plant-button')) {
            const plantIdToUpdate = event.target.dataset.plantId;
            const plantToUpdate = allPlants.find(p => p.id === plantIdToUpdate) || myGarden.find(p => p.id === plantIdToUpdate);
            if (plantToUpdate) {
                showUpdatePlantForm(plantToUpdate);
                // Chiudi la modal della card se è aperta
                if (cardModal.style.display === 'flex') cardModal.style.display = 'none';
            } else {
                showToast(`Pianta con ID ${plantIdToUpdate} non trovata per l'aggiornamento.`, 'error');
            }
        } else if (event.target.classList.contains('delete-plant-from-db-button')) {
            const plantIdToDelete = event.target.dataset.plantId;
            if (confirm('Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile e la rimuoverà per tutti gli utenti.')) {
                await deletePlantFromDatabase(plantIdToDelete);
                // Chiudi la modal della card se è aperta
                if (cardModal.style.display === 'flex') cardModal.style.display = 'none';
            }
        }
    });

    // Chiusura modali
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => { imageModal.style.display = 'none'; });
    if (imageModal) imageModal.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.style.display = 'none'; });

    if (closeCardModalButton) closeCardModalButton.addEventListener('click', () => { cardModal.style.display = 'none'; });
    if (cardModal) cardModal.addEventListener('click', (e) => { if (e.target === cardModal) cardModal.style.display = 'none'; });


    // Event Listeners per il sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);

    // Gestione dello stato di autenticazione iniziale
    // Questo listener è fondamentale e si attiva ogni volta che lo stato di autenticazione cambia (login, logout, refresh)
    // È posizionato qui per assicurarsi che tutti gli elementi DOM siano inizializzati prima che updateUIforAuthState venga chiamato.
    firebase.auth().onAuthStateChanged(user => {
        updateUIforAuthState(user);
    });
});
