// 1. DICHIARAZIONI GLOBALI
let allPlants = [];
let myGarden = []; // Inizializza come array vuoto
let currentPlantIdToUpdate = null; // Variabile per tenere traccia dell'ID della pianta da aggiornare
let ambientLightSensor = null; // Variabile per il sensore di luce
let isMyGardenCurrentlyVisible = false; // Variabile per tenere traccia della visibilità del giardino
let currentSortBy = 'name_asc'; // Nuova variabile globale per il criterio di ordinamento

// Variabili per la gestione della modal (usata sia per zoom immagine che per zoom card)
let imageModal; // Riferimento all'elemento HTML della modal (div#image-modal)
let zoomedImage; // Riferimento all'elemento HTML dell'immagine zoomata (img#zoomed-image)
let closeImageModalButton; // Riferimento al bottone di chiusura della modal immagine (span#close-image-modal-button)

let loadingSpinner; // Variabile per lo spinner di caricamento
let isDomReady = false; // Flag per indicare se il DOM è stato completamente caricato

// Variabile per il contenitore dei toast
let toastContainer; // NUOVA DICHIARAZIONE GLOBALE

// DICHIARAZIONI DELLE VARIABILI DOM GLOBALI (MA NON INIZIALIZZATE QUI)
// Saranno inizializzate solo quando il DOM è pronto (in DOMContentLoaded)
let gardenContainer;
let myGardenContainer;
let authContainerDiv;
let appContentDiv;
let loginButton; // Bottone
let registerButton; // Bottone
let logoutButton;
let authStatusDiv;
let searchInput;
let addNewPlantButton;
let toggleMyGardenButton; // Bottone per mostrare/nascondere il mio giardino
let plantTypeFilter; // Select per il filtro tipo pianta
let lightFilter; // Select per il filtro luce
let waterFilter; // Select per il filtro acqua
let climateZoneFilter; // NUOVO: Select per il filtro zona climatica
let sortBySelect; // Select per l'ordinamento
let getLocButton; // Bottone per geolocalizzazione
let locationStatusDiv; // Div per lo stato della geolocalizzazione
let plantsSection; // Sezione per la galleria di tutte le piante
let myGardenSection; // Sezione per "Il mio Giardino"
let giardinoTitle; // Titolo "Il mio Giardino"
let emptyGardenMessage; // Messaggio giardino vuoto
let maintenanceMessage; // Messaggio di manutenzione
let lightSensorContainer; // Contenitore sensore luce
let startLightSensorButton; // Bottone per avviare il sensore di luce
let lightValueDisplay; // Div per mostrare il valore dei Lux

// Variabili per i campi del form di aggiunta/modifica
let newPlantForm;
let newPlantName, newPlantDescription, newPlantType, newPlantLight, newPlantWater, newPlantClimateZone, newPlantImage, newPlantNotes;
let updatePlantForm;
let updatePlantId, updatePlantName, updatePlantDescription, updatePlantType, updatePlantLight, updatePlantWater, updatePlantClimateZone, updatePlantImage, updatePlantNotes;

// Variabili per i messaggi di errore dei form
let loginEmailInput, loginPasswordInput;
let registerEmailInput, registerPasswordInput;
let loginErrorDiv, registerErrorDiv;

let newPlantNameError, newPlantTypeError, newPlantLightError, newPlantWaterError, newPlantImageError; // Aggiunto per validazione form
let updatePlantNameError, updatePlantTypeError, updatePlantLightError, updatePlantWaterError, updatePlantImageError; // Aggiunto per validazione form

// Configura Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAo8HU5vNNm_H-HvxeDa7xSsg3IEmdlE_4", // NON CONDIVIDERE MAI LA TUA API KEY PUBBLICAMENTE! Questo è un esempio.
    authDomain: "giardinodigitale.firebaseapp.com",
    projectId: "giardinodigitale",
    storageBucket: "giardinodigitale.appspot.com",
    messagingSenderId: "96265504027",
    appId: "1:96265504027:web:903c3df92cfa24beb17fbe",
    measurementId: "G-G6QG58514C"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);

// Ottieni i riferimenti ai servizi Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// Funzione per aggiornare l'UI in base allo stato di autenticazione
function updateUIforAuthState(user) {
    if (user) {
        // Utente loggato
        authContainerDiv.style.display = 'none';
        appContentDiv.style.display = 'block';
        showToast(`Benvenuto, ${user.email}!`, 'success');
        // Carica le piante quando l'utente è autenticato
        loadAllPlants();
        loadMyGarden();
        // Assicurati che la tab "Tutte le piante" sia visibile per default dopo il login
        document.getElementById('all-plants-tab').click();
    } else {
        // Utente non loggato
        authContainerDiv.style.display = 'block';
        appContentDiv.style.display = 'none';
        showToast('Effettua il login o registrati per continuare.', 'info');
        // Mostra il form di login per default
        showLoginForm();
    }
    // Nascondi lo spinner dopo che l'UI è stata aggiornata
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

// Listener per lo stato di autenticazione di Firebase
auth.onAuthStateChanged((user) => {
    // Quando il DOM è pronto, aggiorna l'UI
    if (isDomReady) {
        updateUIforAuthState(user);
    } else {
        // Se il DOM non è ancora pronto, aspetta e poi aggiorna
        // Questo evita errori se onAuthStateChanged si attiva prima di DOMContentLoaded
        document.addEventListener('DOMContentLoaded', () => {
            updateUIforAuthState(user);
        });
    }
});

// 2. FUNZIONI DI UTILITÀ GLOBALI
function showToast(message, type = 'info', duration = 3000) {
    if (!toastContainer) {
        console.error("Toast container non trovato!");
        return;
    }
    const toast = document.createElement('div');
    toast.classList.add('toast-message', type);
    
    let icon = '';
    if (type === 'success') icon = '<i class="fas fa-check-circle"></i>';
    else if (type === 'error') icon = '<i class="fas fa-times-circle"></i>';
    else if (type === 'info') icon = '<i class="fas fa-info-circle"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Forza il reflow per l'animazione slideIn
    void toast.offsetWidth; 
    toast.style.animation = `slideIn 0.3s forwards`;

    setTimeout(() => {
        toast.style.animation = `fadeOut 0.5s forwards`;
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, duration);
}

function showLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }
}

function hideLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

function showMaintenanceMessage(show = true) {
    if (maintenanceMessage) {
        maintenanceMessage.style.display = show ? 'block' : 'none';
    }
}

// Funzione per validare i campi del form lato client
function validateFormField(inputElement, errorElement, fieldName) {
    if (!inputElement || !errorElement) return true; // Se gli elementi non esistono, la validazione non si applica

    let isValid = true;
    let errorMessage = '';

    if (inputElement.hasAttribute('required') && inputElement.value.trim() === '') {
        isValid = false;
        errorMessage = `${fieldName} è obbligatorio.`;
    } else if (inputElement.type === 'url' && inputElement.value.trim() !== '' && !isValidUrl(inputElement.value.trim())) {
        isValid = false;
        errorMessage = `Inserisci un URL valido per l'immagine.`;
    } else if (inputElement.tagName === 'SELECT' && inputElement.hasAttribute('required') && inputElement.value === '') {
        isValid = false;
        errorMessage = `Seleziona un'opzione per ${fieldName}.`;
    }

    if (!isValid) {
        errorElement.innerText = errorMessage;
        errorElement.classList.add('active');
        inputElement.classList.add('invalid'); // Aggiungi classe per stile rosso
    } else {
        errorElement.innerText = '';
        errorElement.classList.remove('active');
        inputElement.classList.remove('invalid'); // Rimuovi classe rossa
    }
    return isValid;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
}

// 3. FUNZIONI DI AUTENTICAZIONE
async function login() {
    showLoadingSpinner();
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    loginErrorDiv.innerText = ''; // Pulisci errori precedenti

    if (!email || !password) {
        loginErrorDiv.innerText = "Inserisci email e password.";
        loginErrorDiv.classList.add('active');
        hideLoadingSpinner();
        showToast("Inserisci email e password.", 'error');
        return;
    } else {
        loginErrorDiv.classList.remove('active');
    }

    try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast("Login avvenuto con successo!", 'success');
        // onAuthStateChanged gestirà la pulizia dei campi e la visualizzazione dell'UI
    } catch (error) {
        console.error("Errore durante il login:", error.message);
        let errorMessage = "Errore durante il login.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = "Email o password non validi.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Formato email non valido.";
        } else {
            errorMessage = `Login fallito: ${error.message}`;
        }
        loginErrorDiv.innerText = errorMessage;
        loginErrorDiv.classList.add('active');
        showToast(errorMessage, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function register() {
    showLoadingSpinner();
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;

    registerErrorDiv.innerText = ''; // Pulisci errori precedenti

    if (!email || !password) {
        registerErrorDiv.innerText = "Inserisci email e password per la registrazione.";
        registerErrorDiv.classList.add('active');
        hideLoadingSpinner();
        showToast("Inserisci email e password per la registrazione.", 'error');
        return;
    } else {
        registerErrorDiv.classList.remove('active');
    }

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        showToast("Registrazione avvenuta con successo!", 'success');
        // onAuthStateChanged gestirà la pulizia dei campi e la visualizzazione dell'UI
    } catch (error) {
        console.error("Errore durante la registrazione:", error.message);
        let errorMessage = "Errore durante la registrazione.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "Questa email è già registrata.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Formato email non valido.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "La password deve essere di almeno 6 caratteri.";
        } else {
            errorMessage = `Registrazione fallita: ${error.message}`;
        }
        registerErrorDiv.innerText = errorMessage;
        registerErrorDiv.classList.add('active');
        showToast(errorMessage, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function logout() {
    showLoadingSpinner();
    try {
        await auth.signOut();
        showToast("Logout effettuato con successo!", 'info');
        // onAuthStateChanged gestirà il reindirizzamento e la pulizia
    } catch (error) {
        console.error("Errore durante il logout:", error.message);
        showToast("Errore durante il logout: " + error.message, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// 4. FUNZIONI DATABASE (FIRESTORE)
async function savePlantToDatabase(plantData) {
    showLoadingSpinner();
    try {
        const user = auth.currentUser;
        if (!user) {
            showToast("Devi essere autenticato per aggiungere una pianta.", 'error');
            return;
        }

        const plantWithTimestamp = {
            ...plantData,
            ownerId: user.uid, // Associa la pianta all'utente loggato
            last_modified: firebase.firestore.FieldValue.serverTimestamp() // Aggiungi timestamp
        };

        await db.collection('plants').add(plantWithTimestamp);
        showToast("Pianta aggiunta con successo!", 'success');
        closeModal('newPlantCard');
        resetNewPlantForm(); // Resetta il form dopo il salvataggio
    } catch (error) {
        console.error("Errore nell'aggiunta della pianta:", error);
        showToast("Errore nell'aggiunta della pianta.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function updatePlantInDatabase(plantId, plantData) {
    showLoadingSpinner();
    try {
        const user = auth.currentUser;
        if (!user) {
            showToast("Devi essere autenticato per modificare una pianta.", 'error');
            return;
        }

        const plantToUpdateRef = db.collection('plants').doc(plantId);
        const doc = await plantToUpdateRef.get();

        if (doc.exists && doc.data().ownerId === user.uid) {
            const updatedPlantData = {
                ...plantData,
                last_modified: firebase.firestore.FieldValue.serverTimestamp() // Aggiorna timestamp
            };
            await plantToUpdateRef.update(updatedPlantData);
            showToast("Pianta aggiornata con successo!", 'success');
            closeModal('updatePlantCard');
        } else {
            showToast("Non hai i permessi per modificare questa pianta o la pianta non esiste.", 'error');
        }
    } catch (error) {
        console.error("Errore nell'aggiornamento della pianta:", error);
        showToast("Errore nell'aggiornamento della pianta.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function deletePlantFromDatabase(plantId) {
    showLoadingSpinner();
    try {
        const user = auth.currentUser;
        if (!user) {
            showToast("Devi essere autenticato per eliminare una pianta.", 'error');
            return;
        }

        const plantToDeleteRef = db.collection('plants').doc(plantId);
        const doc = await plantToDeleteRef.get();

        if (doc.exists && doc.data().ownerId === user.uid) {
            await plantToDeleteRef.delete();
            showToast("Pianta eliminata con successo!", 'success');
            // La ri-renderizzazione avverrà tramite il listener in tempo reale di Firestore
        } else {
            showToast("Non hai i permessi per eliminare questa pianta o la pianta non esiste.", 'error');
        }
    } catch (error) {
        console.error("Errore nell'eliminazione della pianta:", error);
        showToast("Errore nell'eliminazione della pianta.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// 5. FUNZIONI DI CARICAMENTO E RENDERIZZAZIONE PIANTE
async function loadPlantsFromFirebase() {
    showLoadingSpinner();
    try {
        const snapshot = await db.collection('plants').get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante caricate (tutte):", allPlants.length);
        // La chiamata ad applyFilters() ora è gestita in handleAuthAndUI o nel listener onSnapshot
    } catch (error) {
        console.error("Errore nel caricamento delle piante:", error);
        showToast("Errore nel caricamento delle piante.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function loadMyGarden(userId) {
    showLoadingSpinner();
    if (!userId) {
        myGarden = []; // Pulisci il giardino se non c'è utente
        console.log("Nessun ID utente per caricare il giardino.");
        hideLoadingSpinner();
        return;
    }
    try {
        // Carica solo le piante dove l'ownerId corrisponde all'userId
        const snapshot = await db.collection('plants').where('ownerId', '==', userId).get();
        myGarden = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante del mio giardino caricate:", myGarden.length);
    } catch (error) {
        console.error("Errore nel caricamento del mio giardino:", error);
        showToast("Errore nel caricamento del tuo giardino.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Listener in tempo reale per le piante (per aggiornamenti UI automatici)
db.collection('plants').onSnapshot(async (snapshot) => {
    // Questo listener si attiva ogni volta che ci sono cambiamenti
    // Lo stato `onAuthStateChanged` gestirà il ricaricamento appropriato
    console.log("Firestore snapshot listener triggered.");
    const user = auth.currentUser;
    if (user) {
        // Se un utente è loggato, ricarica le piante del suo giardino e tutte le piante
        await loadPlantsFromFirebase(); // Ricarica tutte le piante
        await loadMyGarden(user.uid); // Ricarica il giardino dell'utente
        applyFilters(); // Riapplica i filtri per aggiornare la visualizzazione
    } else {
        // Se nessun utente è loggato, ricarica solo le piante pubbliche (tutte le piante che non hanno ownerId)
        // Per il modello attuale, "pubbliche" significa "tutte le piante" se non c'è un ownerId,
        // o tutte le piante se l'app è per uso singolo.
        // Considerando il tuo modello con ownerId, la galleria principale dovrebbe mostrare tutte le piante,
        // e "il mio giardino" le piante con ownerId == user.uid.
        await loadPlantsFromFirebase(); // Ricarica tutte le piante
        myGarden = []; // Assicurati che myGarden sia vuoto se non c'è utente
        applyFilters(); // Riapplica i filtri
    }
}, (error) => {
    console.error("Errore nel listener di Firestore:", error);
    showToast("Errore di connessione al database.", 'error');
});

function renderPlants(plantsToRender, containerElement) {
    containerElement.innerHTML = ''; // Pulisci il contenitore
    const user = auth.currentUser; // Ottieni l'utente corrente una volta

    if (plantsToRender.length === 0) {
        if (containerElement === myGardenContainer && user && isMyGardenCurrentlyVisible) {
            emptyGardenMessage.style.display = 'block';
        } else {
            emptyGardenMessage.style.display = 'none'; // Nascondi se non è il mio giardino o non è visibile
        }
        return;
    } else {
        emptyGardenMessage.style.display = 'none';
    }

    plantsToRender.forEach(plant => {
        const card = document.createElement('div');
        
        card.classList.add('plant-card');
        if (user && plant.ownerId === user.uid) {
            card.classList.add('my-plant-card'); // Stile diverso per le piante del mio giardino
        }

        const image = plant.image || 'https://via.placeholder.com/280x180?text=No+Image';

        card.innerHTML = `
            <img src="${image}" alt="${plant.name}" data-plant-id="${plant.id}">
            <h3>${plant.name}</h3>
            <p class="description-preview">${plant.description ? plant.description.substring(0, 100) + '...' : 'Nessuna descrizione.'}</p>
            <div class="plant-details">
                <span><strong>Tipo:</strong> ${plant.type || 'N/D'}</span>
                <span><strong>Luce:</strong> ${plant.light || 'N/D'}</span>
                <span><strong>Acqua:</strong> ${plant.water || 'N/D'}</span>
                <span><strong>Clima:</strong> ${plant.climateZone || 'N/D'}</span>
            </div>
            ${user && plant.ownerId === user.uid ? `
                <button class="remove-button" data-plant-id="${plant.id}"><i class="fas fa-trash"></i></button>
                <button class="update-plant-button" data-plant-id="${plant.id}">Modifica</button>
            ` : (user ? `<button class="add-to-garden-button" data-plant-id="${plant.id}" style="display:none;">Aggiungi al mio Giardino</button>` : '')}
        `;
        containerElement.appendChild(card);
    });
}


function filterPlants(plants) {
    let filtered = [...plants];

    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(plant =>
            plant.name.toLowerCase().includes(searchTerm) ||
            (plant.description && plant.description.toLowerCase().includes(searchTerm)) ||
            (plant.notes && plant.notes.toLowerCase().includes(searchTerm))
        );
    }

    const typeFilter = plantTypeFilter.value;
    if (typeFilter) {
        filtered = filtered.filter(plant => plant.type === typeFilter);
    }

    const lightFilterValue = lightFilter.value;
    if (lightFilterValue) {
        filtered = filtered.filter(plant => plant.light === lightFilterValue);
    }

    const waterFilterValue = waterFilter.value;
    if (waterFilterValue) {
        filtered = filtered.filter(plant => plant.water === waterFilterValue);
    }

    const climateZoneFilterValue = climateZoneFilter.value;
    if (climateZoneFilterValue) {
        filtered = filtered.filter(plant => plant.climateZone === climateZoneFilterValue);
    }

    return filtered;
}

function sortPlants(plants) {
    const sortBy = sortBySelect.value;
    switch (sortBy) {
        case 'name_asc':
            return plants.sort((a, b) => a.name.localeCompare(b.name));
        case 'name_desc':
            return plants.sort((a, b) => b.name.localeCompare(a.name));
        case 'last_modified_desc':
            return plants.sort((a, b) => {
                const dateA = a.last_modified ? a.last_modified.toDate() : new Date(0); // Gestisce il caso di timestamp mancante
                const dateB = b.last_modified ? b.last_modified.toDate() : new Date(0);
                return dateB - dateA;
            });
        default:
            return plants;
    }
}

function applyFilters() {
    const user = auth.currentUser;
    let plantsToRender = [];

    if (user && isMyGardenCurrentlyVisible) {
        // Se utente loggato e "Il mio Giardino" è visibile
        plantsToRender = filterPlants(myGarden);
        plantsToRender = sortPlants(plantsToRender);
        renderPlants(plantsToRender, myGardenContainer);
        gardenContainer.style.display = 'none'; // Nascondi la galleria principale
        myGardenContainer.style.display = 'grid'; // Mostra il mio giardino
        giardinoTitle.style.display = 'block'; // Mostra il titolo
        emptyGardenMessage.style.display = plantsToRender.length === 0 ? 'block' : 'none'; // Mostra messaggio vuoto se necessario
    } else {
        // Altrimenti, mostra la galleria principale (tutte le piante caricate)
        plantsToRender = filterPlants(allPlants); // allPlants contiene tutte le piante, indipendentemente dall'owner
        plantsToRender = sortPlants(plantsToRender);
        renderPlants(plantsToRender, gardenContainer);
        gardenContainer.style.display = 'grid'; // Mostra la galleria principale
        myGardenContainer.style.display = 'none'; // Nascondi il mio giardino
        giardinoTitle.style.display = 'none'; // Nascondi il titolo
        emptyGardenMessage.style.display = 'none'; // Nascondi il messaggio di giardino vuoto
    }
}


async function updateGardenVisibility(showMyGarden) {
    const user = auth.currentUser;
    if (!user) {
        // Se l'utente non è loggato, mostra sempre la galleria principale (allPlants)
        isMyGardenCurrentlyVisible = false;
        if (toggleMyGardenButton) toggleMyGardenButton.innerText = 'Mostra il mio Giardino';
        if (plantsSection) plantsSection.style.display = 'block';
        if (myGardenSection) myGardenSection.style.display = 'none';
        applyFilters(); // Renderizza le piante pubbliche (tutte quelle caricate)
        return;
    }

    isMyGardenCurrentlyVisible = showMyGarden;

    if (isMyGardenCurrentlyVisible) {
        await loadMyGarden(user.uid); // Ricarica il giardino prima di mostrare
        if (toggleMyGardenButton) toggleMyGardenButton.innerText = 'Mostra tutte le Piante';
        if (plantsSection) plantsSection.style.display = 'none';
        if (myGardenSection) myGardenSection.style.display = 'block';
    } else {
        await loadPlantsFromFirebase(); // Ricarica tutte le piante
        if (toggleMyGardenButton) toggleMyGardenButton.innerText = 'Mostra il mio Giardino';
        if (plantsSection) plantsSection.style.display = 'block';
        if (myGardenSection) myGardenSection.style.display = 'none';
    }
    applyFilters(); // Applica i filtri e renderizza le piante
}


// 6. GESTIONE DELLE MODAL
function openModal(modalId, plant = null) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Chiudi tutte le altre modal aperte e lo spinner
    document.querySelectorAll('.modal-card, .modal').forEach(m => {
        m.style.display = 'none';
    });
    hideLoadingSpinner(); // Assicurati che lo spinner sia nascosto

    modal.style.display = 'flex'; // Usiamo flex per centrare il contenuto
    
    // Per il modulo di modifica, riempi i campi
    if (modalId === 'updatePlantCard' && plant) {
        currentPlantIdToUpdate = plant.id;
        updatePlantId.value = plant.id;
        updatePlantName.value = plant.name || '';
        updatePlantDescription.value = plant.description || '';
        updatePlantType.value = plant.type || '';
        updatePlantLight.value = plant.light || '';
        updatePlantWater.value = plant.water || '';
        updatePlantClimateZone.value = plant.climateZone || '';
        updatePlantImage.value = plant.image || '';
        updatePlantNotes.value = plant.notes || '';
    } else if (modalId === 'newPlantCard') {
        resetNewPlantForm(); // Assicurati che il form di aggiunta sia pulito
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // Pulisci i messaggi di errore quando la modal viene chiusa
        document.querySelectorAll(`#${modalId} .error-message`).forEach(el => {
            el.innerText = '';
            el.classList.remove('active');
        });
        document.querySelectorAll(`#${modalId} .invalid`).forEach(el => {
            el.classList.remove('invalid');
        });
    }
    currentPlantIdToUpdate = null; // Resetta l'ID della pianta da aggiornare
}

// Funzione per mostrare i dettagli della pianta o ingrandire l'immagine
function showPlantDetailsModal(plant) {
    const modalPlantDetails = document.getElementById('modal-plant-details');
    imageModal.style.display = 'flex'; // Mostra la modal principale
    zoomedImage.style.display = 'none'; // Nascondi l'immagine zoomata per ora
    document.getElementById('image-caption').style.display = 'none'; // Nascondi caption per ora

    modalPlantDetails.innerHTML = `
        <h3>${plant.name}</h3>
        <img src="${plant.image || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${plant.name}">
        <p><strong>Descrizione:</strong> ${plant.description || 'Nessuna descrizione.'}</p>
        <p><strong>Tipo:</strong> ${plant.type || 'N/D'}</p>
        <p><strong>Esigenza Luce:</strong> ${plant.light || 'N/D'}</p>
        <p><strong>Esigenza Acqua:</strong> ${plant.water || 'N/D'}</p>
        <p><strong>Zona Climatica:</strong> ${plant.climateZone || 'N/D'}</p>
        <p><strong>Note:</strong> ${plant.notes || 'Nessuna nota.'}</p>
    `;
    modalPlantDetails.style.display = 'block'; // Mostra i dettagli della pianta
}

function zoomImage(image, caption) {
    const modalPlantDetails = document.getElementById('modal-plant-details');
    imageModal.style.display = 'flex'; // Mostra la modal principale
    modalPlantDetails.style.display = 'none'; // Nascondi i dettagli della pianta

    zoomedImage.src = image;
    document.getElementById('image-caption').innerText = caption;
    zoomedImage.style.display = 'block'; // Mostra l'immagine zoomata
    document.getElementById('image-caption').style.display = 'block'; // Mostra la caption
}

// Resetta il form di aggiunta nuova pianta
function resetNewPlantForm() {
    newPlantForm.reset();
    // Pulisci tutti i messaggi di errore del form
    newPlantNameError.innerText = ''; newPlantNameError.classList.remove('active');
    newPlantTypeError.innerText = ''; newPlantTypeError.classList.remove('active');
    newPlantLightError.innerText = ''; newPlantLightError.classList.remove('active');
    newPlantWaterError.innerText = ''; newPlantWaterError.classList.remove('active');
    newPlantImageError.innerText = ''; newPlantImageError.classList.remove('active'); // Aggiunto
    document.querySelectorAll('#newPlantCard .invalid').forEach(el => el.classList.remove('invalid'));
}

// 7. GEOLOCALIZZAZIONE E DEDUZIONE CLIMA
async function getClimateFromCoordinates(latitude, longitude) {
    // Implementazione semplificata: questo è un esempio.
    // In un'applicazione reale, dovresti usare un servizio API geografico/climatico.
    // Per il test, possiamo usare delle zone predefinite.
    showLoadingSpinner();
    showToast("Ricerca clima in corso...", 'info');
    try {
        let climateZone = 'Sconosciuto';
        // Esempio molto semplificato:
        if (latitude >= 35 && latitude <= 45 && longitude >= 5 && longitude <= 20) {
            climateZone = 'Mediterraneo'; // Europa del Sud
        } else if (latitude >= 40 && latitude <= 60 && longitude >= -10 && longitude <= 30) {
            climateZone = 'Temperato'; // Europa Centrale
        } else if (latitude < 23.5 && latitude > -23.5) {
            climateZone = 'Tropicale'; // Fascia equatoriale
        } else if (latitude >= 23.5 && latitude < 35 || latitude < -23.5 && latitude > -35) {
             climateZone = 'Subtropicale';
        } else if (latitude > 60 || latitude < -60) {
            climateZone = 'Boreale/Artico';
        } else if (latitude >= 20 && latitude < 35 && longitude > -10 && longitude < 5) {
            climateZone = 'Arido'; // Esempio per Nord Africa/Medio Oriente
        }

        // Puoi raffinare questa logica o integrarla con una vera API
        // Esempio con un'API meteo (sarebbe una chiamata fetch)
        // const response = await fetch(`https://api.example.com/climate?lat=${latitude}&lon=${longitude}&apiKey=YOUR_API_KEY`);
        // const data = await response.json();
        // climateZone = data.climate || 'Sconosciuto';

        locationStatusDiv.innerHTML = `<i class="fas fa-location-dot"></i> <span>Clima dedotto: <strong>${climateZone}</strong></span>`;
        climateZoneFilter.value = climateZone; // Imposta il filtro clima
        applyFilters(); // Riapplica i filtri con la nuova zona climatica
        showToast(`Clima dedotto: ${climateZone}`, 'success');

    } catch (error) {
        console.error("Errore nel dedurre il clima:", error);
        locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span>Impossibile dedurre il clima.</span>`;
        showToast("Errore nel dedurre il clima.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

function getLocation() {
    if (navigator.geolocation) {
        locationStatusDiv.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Acquisizione posizione...</span>`;
        showToast("Acquisizione della posizione...", 'info');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getClimateFromCoordinates(lat, lon);
            },
            (error) => {
                let errorMessage = "Errore di geolocalizzazione.";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Accesso alla posizione negato dall'utente.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Informazioni sulla posizione non disponibili.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Timeout scaduto durante l'acquisizione della posizione.";
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage = "Errore sconosciuto di geolocalizzazione.";
                        break;
                }
                console.error(errorMessage, error);
                locationStatusDiv.innerHTML = `<i class="fas fa-times-circle"></i> <span>${errorMessage}</span>`;
                showToast(errorMessage, 'error');
                hideLoadingSpinner();
            }
        );
    } else {
        locationStatusDiv.innerHTML = `<i class="fas fa-times-circle"></i> <span>Geolocalizzazione non supportata dal browser.</span>`;
        showToast("Geolocalizzazione non supportata dal tuo browser.", 'error');
    }
}

// 8. MISURAZIONE LUCE AMBIENTALE (NUOVA SEZIONE)
function startLightSensor() {
    if ('AmbientLightSensor' in window) {
        try {
            ambientLightSensor = new AmbientLightSensor({ frequency: 1000 }); // Legge ogni 1 secondo
            showToast("Avvio sensore di luce...", 'info');

            ambientLightSensor.onreading = () => {
                const lux = ambientLightSensor.illuminance;
                lightValueDisplay.innerHTML = `<i class="fas fa-lightbulb"></i> <span>Valore Lux: <strong>${lux.toFixed(2)}</strong></span>`;
                // Qui puoi aggiungere logica per suggerire piante in base ai lux
                // Esempio:
                if (lux < 50) { showToast("Luce molto bassa, adatta a piante da ombra.", 'info', 1500); }
                else if (lux > 10000) { showToast("Luce molto alta, adatta a pieno sole.", 'info', 1500); }
            };

            ambientLightSensor.onerror = (event) => {
                console.error("Errore sensore luce:", event.error.name, event.error.message);
                lightValueDisplay.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span>Errore sensore luce.</span>`;
                showToast(`Errore sensore luce: ${event.error.message}`, 'error');
                // Potresti nascondere il contenitore del sensore se non funziona
                if (lightSensorContainer) lightSensorContainer.style.display = 'none';
            };

            ambientLightSensor.start();
            startLightSensorButton.innerText = 'Misurazione in corso...';
            startLightSensorButton.disabled = true; // Disabilita il bottone una volta avviato
            lightSensorContainer.style.display = 'flex'; // Assicurati che il contenitore sia visibile

        } catch (error) {
            console.error("Errore nell'inizializzazione del sensore di luce:", error);
            lightValueDisplay.innerHTML = `<i class="fas fa-times-circle"></i> <span>Sensore luce non disponibile.</span>`;
            showToast(`Sensore di luce non disponibile: ${error.message}`, 'error');
            if (lightSensorContainer) lightSensorContainer.style.display = 'none'; // Nascondi se non supportato o errore
        }
    } else {
        lightValueDisplay.innerHTML = `<i class="fas fa-times-circle"></i> <span>Sensore luce non supportato dal browser.</span>`;
        showToast("Sensore di luce non supportato dal tuo browser.", 'error');
        if (lightSensorContainer) lightSensorContainer.style.display = 'none'; // Nascondi se non supportato
    }
}

// 9. EVENT LISTENERS E INIZIALIZZAZIONE
document.addEventListener('DOMContentLoaded', async () => {
    // Inizializzazione delle variabili DOM
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden');
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    loginButton = document.getElementById('login-button');
    registerButton = document.getElementById('register-button');
    logoutButton = document.getElementById('logout-button');
    authStatusDiv = document.getElementById('auth-status');
    searchInput = document.getElementById('search-input');
    addNewPlantButton = document.getElementById('add-new-plant-button');
    toggleMyGardenButton = document.getElementById('toggle-my-garden-button');
    plantTypeFilter = document.getElementById('plant-type-filter');
    lightFilter = document.getElementById('light-filter');
    waterFilter = document.getElementById('water-filter');
    climateZoneFilter = document.getElementById('climate-zone-filter'); // NUOVO filtro
    sortBySelect = document.getElementById('sort-by');
    getLocButton = document.getElementById('get-location-button');
    locationStatusDiv = document.getElementById('location-status');
    plantsSection = document.getElementById('plants-section');
    myGardenSection = document.getElementById('my-garden-section');
    giardinoTitle = document.getElementById('giardino-title');
    emptyGardenMessage = document.getElementById('empty-garden-message');
    imageModal = document.getElementById('image-modal');
    zoomedImage = document.getElementById('zoomed-image');
    closeImageModalButton = document.getElementById('close-image-modal-button'); // ID aggiornato
    loadingSpinner = document.getElementById('loading-spinner');
    toastContainer = document.getElementById('toast-container'); // Inizializza il contenitore dei toast
    maintenanceMessage = document.getElementById('maintenance-message'); // Messaggio di manutenzione
    lightSensorContainer = document.querySelector('.light-sensor-container');
    startLightSensorButton = document.getElementById('start-light-sensor-button');
    lightValueDisplay = document.getElementById('light-value-display');


    // Campi e errori per login/registrazione
    loginEmailInput = document.getElementById('login-email');
    loginPasswordInput = document.getElementById('login-password');
    registerEmailInput = document.getElementById('register-email');
    registerPasswordInput = document.getElementById('register-password');
    loginErrorDiv = document.getElementById('login-error');
    registerErrorDiv = document.getElementById('register-error');

    // Campi e errori per form nuova pianta
    newPlantForm = document.getElementById('new-plant-form');
    newPlantName = document.getElementById('new-plant-name');
    newPlantDescription = document.getElementById('new-plant-description');
    newPlantType = document.getElementById('new-plant-type');
    newPlantLight = document.getElementById('new-plant-light');
    newPlantWater = document.getElementById('new-plant-water');
    newPlantClimateZone = document.getElementById('new-plant-climate-zone');
    newPlantImage = document.getElementById('new-plant-image');
    newPlantNotes = document.getElementById('new-plant-notes');
    newPlantNameError = document.getElementById('new-plant-name-error');
    newPlantTypeError = document.getElementById('new-plant-type-error');
    newPlantLightError = document.getElementById('new-plant-light-error');
    newPlantWaterError = document.getElementById('new-plant-water-error');
    newPlantImageError = document.getElementById('new-plant-image-error'); // Aggiunto
    
    // Campi e errori per form modifica pianta
    updatePlantForm = document.getElementById('update-plant-form');
    updatePlantId = document.getElementById('update-plant-id');
    updatePlantName = document.getElementById('update-plant-name');
    updatePlantDescription = document.getElementById('update-plant-description');
    updatePlantType = document.getElementById('update-plant-type');
    updatePlantLight = document.getElementById('update-plant-light');
    updatePlantWater = document.getElementById('update-plant-water');
    updatePlantClimateZone = document.getElementById('update-plant-climate-zone');
    updatePlantImage = document.getElementById('update-plant-image');
    updatePlantNotes = document.getElementById('update-plant-notes');
    updatePlantNameError = document.getElementById('update-plant-name-error');
    updatePlantTypeError = document.getElementById('update-plant-type-error');
    updatePlantLightError = document.getElementById('update-plant-light-error');
    updatePlantWaterError = document.getElementById('update-plant-water-error');
    updatePlantImageError = document.getElementById('update-plant-image-error'); // Aggiunto


    isDomReady = true; // Imposta il flag a true

    // --- EVENT LISTENERS ---

    // Listener per il login
    if (loginButton) {
        loginButton.addEventListener('click', login);
    }

    // Listener per la registrazione
    if (registerButton) {
        registerButton.addEventListener('click', register);
    }

    // Listener per il logout
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    // Listener per la ricerca
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    // Listener per i filtri
    if (plantTypeFilter) {
        plantTypeFilter.addEventListener('change', applyFilters);
    }
    if (lightFilter) {
        lightFilter.addEventListener('change', applyFilters);
    }
    if (waterFilter) {
        waterFilter.addEventListener('change', applyFilters);
    }
    if (climateZoneFilter) { // NUOVO Listener per il filtro clima
        climateZoneFilter.addEventListener('change', applyFilters);
    }
    if (sortBySelect) {
        sortBySelect.addEventListener('change', applyFilters);
    }

    // Listener per il bottone "Aggiungi Nuova Pianta"
    if (addNewPlantButton) {
        addNewPlantButton.addEventListener('click', () => openModal('newPlantCard'));
    }

    // Listener per il form di aggiunta nuova pianta
    if (newPlantForm) {
        newPlantForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let formIsValid = true;
            // Validazione di tutti i campi richiesti e URL immagine
            formIsValid = validateFormField(newPlantName, newPlantNameError, 'Nome') && formIsValid;
            formIsValid = validateFormField(newPlantType, newPlantTypeError, 'Tipo') && formIsValid;
            formIsValid = validateFormField(newPlantLight, newPlantLightError, 'Luce') && formIsValid;
            formIsValid = validateFormField(newPlantWater, newPlantWaterError, 'Acqua') && formIsValid;
            formIsValid = validateFormField(newPlantImage, newPlantImageError, 'URL Immagine') && formIsValid;
            // Aggiungi validazione per altri campi se necessario (es. newPlantClimateZone)
            
            if (!formIsValid) {
                showToast("Correggi gli errori nel form.", 'error');
                return;
            }

            const plantData = {
                name: newPlantName.value,
                description: newPlantDescription.value,
                type: newPlantType.value,
                light: newPlantLight.value,
                water: newPlantWater.value,
                climateZone: newPlantClimateZone.value,
                image: newPlantImage.value,
                notes: newPlantNotes.value
            };
            await savePlantToDatabase(plantData);
        });
    }

    // Listener per il form di modifica pianta
    if (updatePlantForm) {
        updatePlantForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let formIsValid = true;
            // Validazione di tutti i campi richiesti e URL immagine
            formIsValid = validateFormField(updatePlantName, updatePlantNameError, 'Nome') && formIsValid;
            formIsValid = validateFormField(updatePlantType, updatePlantTypeError, 'Tipo') && formIsValid;
            formIsValid = validateFormField(updatePlantLight, updatePlantLightError, 'Luce') && formIsValid;
            formIsValid = validateFormField(updatePlantWater, updatePlantWaterError, 'Acqua') && formIsValid;
            formIsValid = validateFormField(updatePlantImage, updatePlantImageError, 'URL Immagine') && formIsValid;
            // Aggiungi validazione per altri campi se necessario (es. updatePlantClimateZone)

            if (!formIsValid) {
                showToast("Correggi gli errori nel form.", 'error');
                return;
            }

            const plantData = {
                name: updatePlantName.value,
                description: updatePlantDescription.value,
                type: updatePlantType.value,
                light: updatePlantLight.value,
                water: updatePlantWater.value,
                climateZone: updatePlantClimateZone.value,
                image: updatePlantImage.value,
                notes: updatePlantNotes.value
            };
            await updatePlantInDatabase(currentPlantIdToUpdate, plantData);
        });
    }

    // Listener per il bottone "Mostra il mio Giardino" / "Mostra tutte le Piante"
    if (toggleMyGardenButton) {
        toggleMyGardenButton.addEventListener('click', () => {
            updateGardenVisibility(!isMyGardenCurrentlyVisible);
        });
    }

    // Listener per la geolocalizzazione
    if (getLocButton) {
        getLocButton.addEventListener('click', getLocation);
    }

    // Listener per l'avvio del sensore di luce ambientale
    if (startLightSensorButton) {
        startLightSensorButton.addEventListener('click', startLightSensor);
    }

    // Listener per la chiusura della modal di zoom/dettagli
    if (closeImageModalButton) { // ID aggiornato
        closeImageModalButton.addEventListener('click', () => closeModal('image-modal'));
    }

    // Listener per i click sulle card delle piante (per ingrandire immagine o mostrare dettagli)
    // Questo listener deve catturare gli eventi sia su gardenContainer che su myGardenContainer
    function handlePlantCardClick(event) {
        const plantCard = event.target.closest('.plant-card, .my-plant-card');
        if (!plantCard) return; // Non è una card

        const plantId = event.target.dataset.plantId || plantCard.querySelector('img').dataset.plantId;
        
        let plant;
        if (isMyGardenCurrentlyVisible && auth.currentUser) {
            plant = myGarden.find(p => p.id === plantId);
        } else {
            plant = allPlants.find(p => p.id === plantId);
        }

        if (!plant) {
            console.error("Pianta non trovata per ID:", plantId);
            showToast("Dettagli pianta non disponibili.", 'error');
            return;
        }

        // Gestione del bottone Rimuovi (solo se è il mio giardino)
        if (event.target.classList.contains('remove-button') || event.target.closest('.remove-button')) {
            const button = event.target.closest('.remove-button');
            const plantIdToRemove = button.dataset.plantId;
            showToast('Eliminazione pianta in corso...', 'info');
            deletePlantFromDatabase(plantIdToRemove); // Chiamata diretta per eliminazione
        } 
        // Gestione del bottone Modifica (solo se è il mio giardino)
        else if (event.target.classList.contains('update-plant-button') || event.target.closest('.update-plant-button')) {
            const button = event.target.closest('.update-plant-button');
            const plantIdToUpdate = button.dataset.plantId;
            const plantToModify = myGarden.find(p => p.id === plantIdToUpdate); // Cerca solo nel tuo giardino
            if (plantToModify) {
                openModal('updatePlantCard', plantToModify);
            } else {
                showToast(`Pianta con ID ${plantIdToUpdate} non trovata per l'aggiornamento nel tuo giardino.`, 'error');
            }
        }
        // Se l'elemento cliccato è l'immagine, ingrandisci l'immagine
        else if (event.target.tagName === 'IMG') {
            zoomImage(plant.image || 'https://via.placeholder.com/400x300?text=No+Image', plant.name);
        } else {
            // Altrimenti, mostra i dettagli della pianta nella modal
            showPlantDetailsModal(plant);
        }
    }

    if (gardenContainer) {
        gardenContainer.addEventListener('click', handlePlantCardClick);
    }
    if (myGardenContainer) {
        myGardenContainer.addEventListener('click', handlePlantCardClick);
    }


    // --- CONFIGURAZIONE INIZIALE UI DOPO DOMContentLoaded ---
    // Questa chiamata assicura che l'UI venga configurata correttamente
    // con lo stato di autenticazione corrente solo DOPO che il DOM è pronto.
    showLoadingSpinner(); // Mostra lo spinner all'avvio
    showToast("Caricamento applicazione...", "info", 1000); // Messaggio iniziale
    showMaintenanceMessage(true); // Mostra il messaggio di manutenzione all'avvio
    
    // Non chiamare handleAuthAndUI() qui, sarà chiamata dal listener onAuthStateChanged
    // che è il modo corretto per reagire allo stato di autenticazione.
    // Il listener onAuthStateChanged si attiva automaticamente al caricamento,
    // e gestirà la visualizzazione corretta e il primo caricamento dati.
});


// --- GESTIONE DELLO STATO DI AUTENTICAZIONE E UI ---
// Questa funzione viene chiamata ogni volta che lo stato di autenticazione cambia
auth.onAuthStateChanged(async (user) => {
    if (!isDomReady) {
        console.log("DOM non pronto, ritardando gestione autenticazione.");
        return; // Non fare nulla se il DOM non è ancora pronto
    }
    console.log("Stato autenticazione cambiato. Utente:", user ? user.email : "Nessuno");

    hideLoadingSpinner(); // Nascondi spinner dopo il caricamento iniziale o cambio di stato
    showMaintenanceMessage(true); // Manteniamo il messaggio di manutenzione visibile per ora, se vuoi toglierlo, mettilo a false

    // Pulisci i campi email e password e messaggi di errore
    if (loginEmailInput) loginEmailInput.value = '';
    if (loginPasswordInput) loginPasswordInput.value = '';
    if (registerEmailInput) registerEmailInput.value = '';
    if (registerPasswordInput) registerPasswordInput.value = '';
    if (loginErrorDiv) { loginErrorDiv.innerText = ''; loginErrorDiv.classList.remove('active'); }
    if (registerErrorDiv) { registerErrorDiv.innerText = ''; registerErrorDiv.classList.remove('active'); }

    if (user) {
        // Utente loggato
        authStatusDiv.innerHTML = `<i class="fas fa-user"></i> <span>Benvenuto</span>, ${user.email}`;
        appContentDiv.style.display = 'block'; // Mostra il contenuto dell'app
        authContainerDiv.style.display = 'none'; // Nascondi il contenitore di login/registrazione
        logoutButton.style.display = 'block';

        // Mostra i bottoni "Aggiungi Nuova Pianta" e "Mostra il mio Giardino"
        if (addNewPlantButton) addNewPlantButton.style.display = 'inline-block';
        if (toggleMyGardenButton) toggleMyGardenButton.style.display = 'inline-block';

        // Carica TUTTE le piante e le piante dell'utente. Il listener onSnapshot si occupa di aggiornare i dati globali.
        // Qui ci assicuriamo solo che lo stato di visibilità sia consistente.
        const showMyGardenInitially = myGarden.length > 0; // Se ha piante nel giardino, mostra il giardino
        await updateGardenVisibility(showMyGardenInitially); 
        
        applyFilters(); // Applica i filtri e mostra le piante correttamente

    } else {
        // Nessun utente loggato
        authStatusDiv.innerText = "Nessun utente autenticato.";
        appContentDiv.style.display = 'none'; // Nascondi il contenuto dell'app
        authContainerDiv.style.display = 'block'; // Mostra il contenitore di login/registrazione
        logoutButton.style.display = 'none';

        // Nascondi i bottoni specifici per utenti loggati
        if (addNewPlantButton) addNewPlantButton.style.display = 'none';
        if (toggleMyGardenButton) toggleMyGardenButton.style.display = 'none';

        myGarden = []; // Pulisci il giardino locale
        isMyGardenCurrentlyVisible = false; // Assicurati che lo stato sia corretto

        // Carica tutte le piante (che non hanno ownerId, o tutte se non c'è distinzione pubblico/privato)
        // loadPlantsFromFirebase() carica già tutte le piante in 'plants'
        
        // Imposta la visibilità per l'utente non loggato: solo la galleria principale
        if (plantsSection) plantsSection.style.display = 'block';
        if (gardenContainer) gardenContainer.style.display = 'grid'; // Assicurati che la galleria principale sia visibile
        if (myGardenContainer) myGardenContainer.style.display = 'none'; // Nascondi il contenitore del mio giardino
        if (giardinoTitle) giardinoTitle.style.display = 'none'; // Nascondi il titolo "Il mio Giardino"
        if (emptyGardenMessage) emptyGardenMessage.style.display = 'none'; // Nascondi il messaggio di giardino vuoto

        applyFilters(); // Assicurati che vengano renderizzate tutte le piante pubbliche
    }
});
