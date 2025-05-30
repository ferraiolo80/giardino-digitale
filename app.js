// app.js

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
let loginButton;
let registerButton;
let logoutButton;
let newPlantCard;
let updatePlantCard;
let addPlantButton;
let maintenanceMessageDiv; // Dichiarazione per il messaggio di manutenzione

// Variabili per i form di login/registrazione
let loginEmailInput;
let loginPasswordInput;
let loginErrorDiv;
let registerEmailInput;
let registerPasswordInput;
let registerErrorDiv;

// Variabili per i campi del form "Aggiungi Nuova Pianta"
let newPlantNameInput;
let newPlantDescriptionTextarea;
let newPlantTypeSelect;
let newPlantLightSelect;
let newPlantWaterSelect;
let newPlantClimateZoneSelect;
let newPlantImageInput;
let newPlantNotesTextarea;
let newPlantForm;

// Variabili per i campi del form "Modifica Pianta"
let updatePlantIdInput;
let updatePlantNameInput;
let updatePlantDescriptionTextarea;
let updatePlantTypeSelect;
let updatePlantLightSelect;
let updatePlantWaterSelect;
let updatePlantClimateZoneSelect;
let updatePlantImageInput;
let updatePlantNotesTextarea;
let updatePlantForm;

// Variabili per filtri e ricerca
let searchInput;
let sortBySelect;
let plantTypeFilterSelect;
let lightFilterSelect;
let waterFilterSelect;
let climateZoneFilterSelect;

// Variabili per il sensore di luce
let startLightSensorButton;
let stopLightSensorButton;
let currentLuxValueSpan;
let lightFeedbackDiv;

// Variabili per i bottoni di navigazione My Garden / Add Plant
let toggleMyGardenButton;
let addNewPlantButton;
let plantsSection; // Per la galleria delle piante
let emptyGardenMessage; // Messaggio giardino vuoto
let giardinoTitle; // Titolo "Il mio Giardino"

// Variabili per la geolocalizzazione
let getLocationButton;
let locationStatusDiv;

// 2. CONFIGURAZIONE FIREBASE (Mantieni la tua configurazione esistente)
const firebaseConfig = {
    apiKey: "AIzaSyAo8HU5vNNm_H-HvxeDa7xSsg3IEmdlE_4",
    authDomain: "giardinodigitale.firebaseapp.com",
    projectId: "giardinodigitale",
    storageBucket: "giardinodigitale.appspot.com",
    messagingSenderId: "96265504027",
    appId: "1:96265504027:web:903c3df3123b320076a74c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 3. FUNZIONI DI UTILITÀ GLOBALI

/**
 * Mostra un toast message all'utente.
 * @param {string} message Il messaggio da visualizzare.
 * @param {'success' | 'error' | 'info'} type Il tipo di messaggio (success, error, info).
 */
function showToast(message, type = 'info') {
    if (!toastContainer) {
        console.error("Toast container non trovato!");
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast-message', type);

    let iconClass = '';
    if (type === 'success') {
        iconClass = 'fas fa-check-circle';
    } else if (type === 'error') {
        iconClass = 'fas fa-times-circle';
    } else { // info
        iconClass = 'fas fa-info-circle';
    }

    toast.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Animazione di ingresso
    toast.style.animation = 'slideIn 0.5s forwards';

    // Rimuovi il toast dopo 3 secondi
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s forwards';
        toast.addEventListener('animationend', () => {
            toast.remove();
        }, { once: true });
    }, 3000);
}

// Funzione per mostrare lo spinner di caricamento
function showLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex'; // Imposta su 'flex' per l'overlay completo
    }
}

// Funzione per nascondere lo spinner di caricamento
function hideLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

/**
 * Apre una modal card (nuova pianta o aggiorna pianta).
 * @param {string} cardId L'ID della modal card da aprire.
 */
function openModal(cardId) {
    const modalCard = document.getElementById(cardId);
    if (modalCard) {
        modalCard.style.display = 'flex'; // Usa flex per centrare la modal card
    }
}

/**
 * Chiude una modal card.
 * @param {string} cardId L'ID della modal card da chiudere.
 */
function closeModal(cardId) {
    const modalCard = document.getElementById(cardId);
    if (modalCard) {
        modalCard.style.display = 'none';
        // Pulisci eventuali messaggi di errore quando la modal viene chiusa
        const errorMessages = modalCard.querySelectorAll('.error-message');
        errorMessages.forEach(el => el.innerText = '');
        // Resetta la form, se è una form
        const form = modalCard.querySelector('form');
        if (form) form.reset();
    }
}

/**
 * Valida un campo di input del form.
 * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} inputElement L'elemento input da validare.
 * @param {string} errorMessage Il messaggio di errore da mostrare.
 * @param {HTMLElement} errorDiv L'elemento div dove mostrare l'errore.
 * @returns {boolean} True se il campo è valido, False altrimenti.
 */
function validateInput(inputElement, errorMessage, errorDiv) {
    if (inputElement.value.trim() === '') {
        errorDiv.innerText = errorMessage;
        inputElement.classList.add('invalid');
        return false;
    }
    errorDiv.innerText = '';
    inputElement.classList.remove('invalid');
    return true;
}

/**
 * Valida il form di aggiunta/modifica pianta.
 * @param {string} formType 'new' o 'update'.
 * @returns {boolean} True se il form è valido, False altrimenti.
 */
function validatePlantForm(formType) {
    let isValid = true;

    // Seleziona gli elementi in base al formType
    const nameInput = formType === 'new' ? newPlantNameInput : updatePlantNameInput;
    const descriptionTextarea = formType === 'new' ? newPlantDescriptionTextarea : updatePlantDescriptionTextarea;
    const typeSelect = formType === 'new' ? newPlantTypeSelect : updatePlantTypeSelect;
    const lightSelect = formType === 'new' ? newPlantLightSelect : updatePlantLightSelect;
    const waterSelect = formType === 'new' ? newPlantWaterSelect : updatePlantWaterSelect;
    const climateZoneSelect = formType === 'new' ? newPlantClimateZoneSelect : updatePlantClimateZoneSelect;
    const imageInput = formType === 'new' ? newPlantImageInput : updatePlantImageInput;
    const notesTextarea = formType === 'new' ? newPlantNotesTextarea : updatePlantNotesTextarea;

    const nameErrorDiv = formType === 'new' ? document.getElementById('new-plant-name-error') : document.getElementById('update-plant-name-error');
    const descriptionErrorDiv = formType === 'new' ? document.getElementById('new-plant-description-error') : document.getElementById('update-plant-description-error');
    const typeErrorDiv = formType === 'new' ? document.getElementById('new-plant-type-error') : document.getElementById('update-plant-type-error');
    const lightErrorDiv = formType === 'new' ? document.getElementById('new-plant-light-error') : document.getElementById('update-plant-light-error');
    const waterErrorDiv = formType === 'new' ? document.getElementById('new-plant-water-error') : document.getElementById('update-plant-water-error');
    const climateZoneErrorDiv = formType === 'new' ? document.getElementById('new-plant-climate-zone-error') : document.getElementById('update-plant-climate-zone-error');
    const imageErrorDiv = formType === 'new' ? document.getElementById('new-plant-image-error') : document.getElementById('update-plant-image-error');

    // Validazione dei campi richiesti
    isValid = validateInput(nameInput, 'Il nome è richiesto.', nameErrorDiv) && isValid;
    isValid = validateInput(typeSelect, 'Il tipo è richiesto.', typeErrorDiv) && isValid;
    isValid = validateInput(lightSelect, 'L\'esigenza di luce è richiesta.', lightErrorDiv) && isValid;
    isValid = validateInput(waterSelect, 'L\'esigenza di acqua è richiesta.', waterErrorDiv) && isValid;
    
    // Validazione URL immagine (se presente)
    if (imageInput && imageInput.value.trim() !== '' && !imageInput.value.trim().match(/^(ftp|http|https):\/\/[^ "]+$/)) {
        imageErrorDiv.innerText = 'URL immagine non valido.';
        imageInput.classList.add('invalid');
        isValid = false;
    } else {
        imageErrorDiv.innerText = '';
        imageInput.classList.remove('invalid');
    }

    return isValid;
}

// 4. FUNZIONI DI AUTENTICAZIONE E UI

/**
 * Mostra il form di registrazione e nasconde quello di login.
 */
function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    loginErrorDiv.innerText = '';
    registerErrorDiv.innerText = '';
}

/**
 * Mostra il form di login e nasconde quello di registrazione.
 */
function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    loginErrorDiv.innerText = '';
    registerErrorDiv.innerText = '';
}

/**
 * Gestisce il processo di login dell'utente.
 */
async function handleLogin(event) {
    event.preventDefault();
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    if (!email || !password) {
        loginErrorDiv.innerText = 'Inserisci email e password.';
        return;
    }

    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        showToast('Login effettuato con successo!', 'success');
        // updateUIVisibility sarà chiamato automaticamente da onAuthStateChanged
    } catch (error) {
        loginErrorDiv.innerText = `Errore di login: ${error.message}`;
        showToast(`Errore di login: ${error.message}`, 'error');
    }
}

/**
 * Gestisce il processo di registrazione di un nuovo utente.
 */
async function handleRegister(event) {
    event.preventDefault();
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;

    if (!email || !password) {
        registerErrorDiv.innerText = 'Inserisci email e password.';
        return;
    }
    if (password.length < 6) {
        registerErrorDiv.innerText = 'La password deve contenere almeno 6 caratteri.';
        return;
    }

    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        showToast('Registrazione effettuata con successo! Ora sei loggato.', 'success');
        // updateUIVisibility sarà chiamato automaticamente da onAuthStateChanged
    } catch (error) {
        registerErrorDiv.innerText = `Errore di registrazione: ${error.message}`;
        showToast(`Errore di registrazione: ${error.message}`, 'error');
    }
}

/**
 * Gestisce il logout dell'utente.
 */
async function handleLogout() {
    try {
        await firebase.auth().signOut();
        showToast('Logout effettuato con successo.', 'info');
        // updateUIVisibility sarà chiamato automaticamente da onAuthStateChanged
    } catch (error) {
        console.error("Errore durante il logout:", error);
        showToast(`Errore durante il logout: ${error.message}`, 'error');
    }
}

/**
 * Aggiorna la visibilità degli elementi UI in base allo stato di autenticazione dell'utente.
 * Questa funzione è responsabile di mostrare la sezione di autenticazione o il contenuto dell'app.
 * Nasconde anche lo spinner di caricamento una volta che l'UI è stata configurata.
 * @param {firebase.User | null} user L'oggetto utente di Firebase se autenticato, altrimenti null.
 */
function updateUIVisibility(user) {
    if (user) {
        // Utente loggato: mostra il contenuto dell'app, nascondi l'autenticazione
        authContainerDiv.style.display = 'none';
        appContentDiv.style.display = 'block';
        
        // Assicurati che il pulsante logout sia visibile
        if (logoutButton) logoutButton.style.display = 'block';

        // Mostra i bottoni specifici per utenti loggati
        if (addNewPlantButton) addNewPlantButton.style.display = 'inline-block';
        if (toggleMyGardenButton) toggleMyGardenButton.style.display = 'inline-block';

        showToast(`Benvenuto, ${user.email}!`, 'success');
        
        // Carica i dati specifici dell'utente (es. il giardino) solo dopo il login
        loadAllPlants(); // Questa caricherà tutte le piante disponibili
        loadMyGarden(); // Questa caricherà le piante aggiunte dall'utente

        // Imposta la visibilità iniziale
        isMyGardenCurrentlyVisible = false; // All'inizio mostriamo "Tutte le piante"
        if (plantsSection) plantsSection.style.display = 'block';
        if (gardenContainer) gardenContainer.style.display = 'grid';
        if (myGardenContainer) myGardenContainer.style.display = 'none';
        if (giardinoTitle) giardinoTitle.style.display = 'none'; // Nascondi il titolo del giardino privato

        // Esegui i filtri e l'ordinamento iniziale
        applyFilters();

    } else {
        // Utente non loggato: mostra la sezione di autenticazione, nascondi il contenuto dell'app
        authContainerDiv.style.display = 'block';
        appContentDiv.style.display = 'none';
        
        // Nascondi il pulsante di logout
        if (logoutButton) logoutButton.style.display = 'none';

        // Nascondi i bottoni specifici per utenti loggati
        if (addNewPlantButton) addNewPlantButton.style.display = 'none';
        if (toggleMyGardenButton) toggleMyGardenButton.style.display = 'none';

        showToast('Effettua il login o registrati per continuare.', 'info');
        showLoginForm(); // Mostra il form di login per default

        // Ripulisci il giardino locale quando l'utente si slogga
        myGarden = []; 
        isMyGardenCurrentlyVisible = false;

        // Visualizza solo la galleria principale delle piante (senza funzioni "mio giardino")
        if (plantsSection) plantsSection.style.display = 'block';
        if (gardenContainer) gardenContainer.style.display = 'grid';
        if (myGardenContainer) myGardenContainer.style.display = 'none';
        if (giardinoTitle) giardinoTitle.style.display = 'none';
        if (emptyGardenMessage) emptyGardenMessage.style.display = 'none';

        applyFilters(); // Ricarica le piante pubbliche (se ce ne sono)
    }

    // *** IMPORTANTE ***
    // Nascondi lo spinner di caricamento una volta che l'UI è stata aggiornata.
    hideLoadingSpinner(); 
}

// 5. FUNZIONI DI GESTIONE DATI (Firestore)

/**
 * Carica tutte le piante dalla collezione 'plants' di Firestore.
 */
async function loadAllPlants() {
    showLoadingSpinner(); // Mostra spinner durante il caricamento
    try {
        const snapshot = await db.collection('plants').get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante caricate:", allPlants.length);
        applyFilters(); // Applica subito i filtri per mostrare le piante
    } catch (error) {
        console.error("Errore nel caricamento delle piante:", error);
        showToast("Errore nel caricamento delle piante.", 'error');
    } finally {
        // Lo spinner verrà nascosto da updateUIVisibility, non qui.
        // Se questa funzione è chiamata autonomamente, potrebbe essere necessario
        // un hideLoadingSpinner() alla fine. Ma se è chiamata da updateUIVisibility,
        // allora updateUIVisibility si occupa di nasconderlo una volta che tutto è pronto.
    }
}

/**
 * Carica le piante aggiunte al giardino dell'utente corrente.
 */
async function loadMyGarden() {
    const user = firebase.auth().currentUser;
    if (!user) {
        myGarden = []; // Pulisci il giardino se non c'è utente
        showToast("Accedi per vedere il tuo giardino personale.", 'info');
        renderPlants(myGarden, myGardenContainer); // Rendi il giardino vuoto
        if (emptyGardenMessage) emptyGardenMessage.style.display = 'block'; // Mostra messaggio giardino vuoto
        return;
    }

    try {
        // Recupera i riferimenti alle piante nel giardino dell'utente
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().myGarden && userDoc.data().myGarden.length > 0) {
            const plantRefs = userDoc.data().myGarden;
            const plantPromises = plantRefs.map(ref => db.collection('plants').doc(ref.id).get());
            const plantDocs = await Promise.all(plantPromises);
            myGarden = plantDocs.filter(doc => doc.exists).map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Giardino caricato:", myGarden.length, myGarden);
        } else {
            myGarden = [];
            console.log("Giardino dell'utente vuoto.");
        }
        renderPlants(myGarden, myGardenContainer);
        if (myGarden.length === 0 && isMyGardenCurrentlyVisible) {
            if (emptyGardenMessage) emptyGardenMessage.style.display = 'block';
        } else {
            if (emptyGardenMessage) emptyGardenMessage.style.display = 'none';
        }

    } catch (error) {
        console.error("Errore nel caricamento del mio giardino:", error);
        showToast("Errore nel caricamento del tuo giardino.", 'error');
        myGarden = []; // Assicurati che sia vuoto in caso di errore
    } finally {
        // Lo spinner verrà nascosto da updateUIVisibility
    }
}

/**
 * Aggiunge una pianta al database Firestore e al giardino dell'utente.
 * @param {object} plantData I dati della pianta da aggiungere.
 */
async function addPlantToDatabase(plantData) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per aggiungere piante.", 'error');
        return;
    }
    showLoadingSpinner(); // Mostra spinner
    try {
        const docRef = await db.collection('plants').add({
            ...plantData,
            ownerId: user.uid, // Associa la pianta all'utente corrente
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastModified: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Pianta aggiunta con successo!', 'success');
        closeModal('newPlantCard');
        // Ricarica tutte le piante e il mio giardino per aggiornare l'UI
        await loadAllPlants();
        await loadMyGarden();
        // Nascondi lo spinner subito dopo aver completato l'operazione
        hideLoadingSpinner(); 
    } catch (error) {
        console.error("Errore nell'aggiunta della pianta:", error);
        showToast(`Errore: ${error.message}`, 'error');
        hideLoadingSpinner();
    }
}

/**
 * Aggiorna una pianta esistente nel database Firestore.
 * @param {string} plantId L'ID della pianta da aggiornare.
 * @param {object} updatedData I nuovi dati della pianta.
 */
async function updatePlantInDatabase(plantId, updatedData) {
    showLoadingSpinner(); // Mostra spinner
    try {
        await db.collection('plants').doc(plantId).update({
            ...updatedData,
            lastModified: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Pianta aggiornata con successo!', 'success');
        closeModal('updatePlantCard');
        // Ricarica tutte le piante e il mio giardino per aggiornare l'UI
        await loadAllPlants();
        await loadMyGarden();
        hideLoadingSpinner(); 
    } catch (error) {
        console.error("Errore nell'aggiornamento della pianta:", error);
        showToast(`Errore: ${error.message}`, 'error');
        hideLoadingSpinner();
    }
}

/**
 * Elimina una pianta dal database Firestore.
 * @param {string} plantId L'ID della pianta da eliminare.
 */
async function deletePlantFromDatabase(plantId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per eliminare piante.", 'error');
        return;
    }
    showLoadingSpinner(); // Mostra spinner
    try {
        // Rimuovi prima il riferimento dal giardino dell'utente
        await db.collection('users').doc(user.uid).update({
            myGarden: firebase.firestore.FieldValue.arrayRemove(db.collection('plants').doc(plantId))
        });
        // Poi elimina la pianta dalla collezione principale
        await db.collection('plants').doc(plantId).delete();
        showToast('Pianta eliminata con successo!', 'success');
        // Ricarica tutte le piante e il mio giardino per aggiornare l'UI
        await loadAllPlants();
        await loadMyGarden();
        hideLoadingSpinner(); 
    } catch (error) {
        console.error("Errore nell'eliminazione della pianta:", error);
        showToast(`Errore: ${error.message}`, 'error');
        hideLoadingSpinner();
    }
}

/**
 * Aggiunge una pianta al giardino personale dell'utente in Firestore.
 * @param {string} plantId L'ID della pianta da aggiungere.
 */
async function addToMyGarden(plantId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per aggiungere piante al tuo giardino.", 'info');
        return;
    }

    showLoadingSpinner(); // Mostra spinner
    try {
        const plantRef = db.collection('plants').doc(plantId);
        await db.collection('users').doc(user.uid).update({
            myGarden: firebase.firestore.FieldValue.arrayUnion(plantRef)
        }, { merge: true }); // Usa merge per non sovrascrivere altri campi
        showToast('Pianta aggiunta al tuo giardino!', 'success');
        await loadMyGarden(); // Ricarica il giardino per aggiornare la visualizzazione
        hideLoadingSpinner();
    } catch (error) {
        console.error("Errore nell'aggiunta al mio giardino:", error);
        showToast(`Errore: ${error.message}`, 'error');
        hideLoadingSpinner();
    }
}

/**
 * Rimuove una pianta dal giardino personale dell'utente in Firestore.
 * @param {string} plantId L'ID della pianta da rimuovere.
 */
async function removeFromMyGarden(plantId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per rimuovere piante dal tuo giardino.", 'info');
        return;
    }

    showLoadingSpinner(); // Mostra spinner
    try {
        const plantRef = db.collection('plants').doc(plantId);
        await db.collection('users').doc(user.uid).update({
            myGarden: firebase.firestore.FieldValue.arrayRemove(plantRef)
        });
        showToast('Pianta rimossa dal tuo giardino.', 'info');
        await loadMyGarden(); // Ricarica il giardino per aggiornare la visualizzazione
        hideLoadingSpinner();
    } catch (error) {
        console.error("Errore nella rimozione dal mio giardino:", error);
        showToast(`Errore: ${error.message}`, 'error');
        hideLoadingSpinner();
    }
}


// 6. FUNZIONI DI RENDERING E FILTRAGGIO

/**
 * Crea una card HTML per una singola pianta.
 * @param {object} plant La pianta da renderizzare.
 * @param {boolean} isMyGardenCard Indica se la card è per "Il mio Giardino" (per mostrare i bottoni corretti).
 * @returns {HTMLElement} L'elemento div della card della pianta.
 */
function createPlantCard(plant, isMyGardenCard = false) {
    const plantCard = document.createElement('div');
    plantCard.classList.add(isMyGardenCard ? 'my-plant-card' : 'plant-card');
    plantCard.dataset.id = plant.id; // Salva l'ID della pianta nel dataset

    const imageUrl = plant.image || 'https://via.placeholder.com/280x180?text=No+Image';

    plantCard.innerHTML = `
        <h3>${plant.name}</h3>
        <img src="${imageUrl}" alt="${plant.name}" class="plant-image" data-id="${plant.id}">
        <div class="plant-details">
            <p><strong>Tipo:</strong> ${plant.type || 'N/A'}</p>
            <p><strong>Luce:</strong> ${plant.light || 'N/A'}</p>
            <p><strong>Acqua:</strong> ${plant.water || 'N/A'}</p>
            <p><strong>Clima:</strong> ${plant.climateZone || 'N/A'}</p>
            ${plant.description ? `<p><strong>Descrizione:</strong> ${plant.description}</p>` : ''}
            ${plant.notes ? `<p><strong>Note:</strong> ${plant.notes}</p>` : ''}
        </div>
    `;

    const user = firebase.auth().currentUser;

    if (isMyGardenCard) {
        // Se è nella sezione "Il mio Giardino", mostra "Rimuovi" e "Modifica"
        if (user && plant.ownerId === user.uid) { // L'utente può modificare solo le sue piante
            const updateButton = document.createElement('button');
            updateButton.classList.add('update-plant-button');
            updateButton.dataset.plantId = plant.id;
            updateButton.textContent = 'Modifica Pianta';
            plantCard.appendChild(updateButton);
        }
        
        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-button');
        removeButton.dataset.plantId = plant.id;
        removeButton.innerHTML = '<i class="fas fa-times"></i>'; // Icona "X"
        plantCard.appendChild(removeButton);

    } else {
        // Se è nella galleria principale, mostra "Aggiungi al mio giardino"
        if (user) { // Mostra il bottone solo se l'utente è loggato
            const addButton = document.createElement('button');
            addButton.classList.add('add-to-garden-button');
            addButton.dataset.plantId = plant.id;
            addButton.textContent = 'Aggiungi al mio Giardino';
            plantCard.appendChild(addButton);
        }
    }

    return plantCard;
}


/**
 * Renderizza le piante in un contenitore specifico.
 * @param {Array<object>} plantsArray L'array di piante da renderizzare.
 * @param {HTMLElement} container L'elemento HTML dove renderizzare le card.
 * @param {boolean} isMyGarden Indicates if the rendering is for 'my garden' section.
 */
function renderPlants(plantsArray, container, isMyGarden = false) {
    if (!container) {
        console.error("Contenitore per il rendering delle piante non trovato!");
        return;
    }
    container.innerHTML = ''; // Pulisce il contenitore

    if (plantsArray.length === 0) {
        // Non mostrare il messaggio di giardino vuoto se non è il mio giardino
        if (isMyGarden && emptyGardenMessage) {
            emptyGardenMessage.style.display = 'block';
        } else if (!isMyGarden && container === gardenContainer) {
            // Potresti voler mostrare un messaggio diverso per la galleria principale vuota
            // o semplicemente non mostrare nulla.
        }
        return;
    }

    if (emptyGardenMessage) emptyGardenMessage.style.display = 'none'; // Nascondi se ci sono piante

    plantsArray.forEach(plant => {
        const plantCard = createPlantCard(plant, isMyGarden);
        container.appendChild(plantCard);
    });
}

/**
 * Applica i filtri e l'ordinamento alle piante e le renderizza.
 */
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterType = plantTypeFilterSelect.value;
    const filterLight = lightFilterSelect.value;
    const filterWater = waterFilterSelect.value;
    const filterClimateZone = climateZoneFilterSelect.value;

    let filteredPlants = allPlants.filter(plant => {
        const matchesSearch = plant.name.toLowerCase().includes(searchTerm) ||
                              (plant.description && plant.description.toLowerCase().includes(searchTerm)) ||
                              (plant.notes && plant.notes.toLowerCase().includes(searchTerm));
        const matchesType = !filterType || plant.type === filterType;
        const matchesLight = !filterLight || plant.light === filterLight;
        const matchesWater = !filterWater || plant.water === filterWater;
        const matchesClimateZone = !filterClimateZone || plant.climateZone === filterClimateZone;

        return matchesSearch && matchesType && matchesLight && matchesWater && matchesClimateZone;
    });

    // Ordina le piante
    filteredPlants.sort((a, b) => {
        if (currentSortBy === 'name_asc') {
            return a.name.localeCompare(b.name);
        } else if (currentSortBy === 'name_desc') {
            return b.name.localeCompare(a.name);
        } else if (currentSortBy === 'last_modified_desc') {
            // Assicurati che lastModified esista e sia un timestamp di Firebase
            const dateA = a.lastModified ? a.lastModified.toDate() : new Date(0);
            const dateB = b.lastModified ? b.lastModified.toDate() : new Date(0);
            return dateB - dateA;
        }
        return 0;
    });

    if (isMyGardenCurrentlyVisible) {
        // Filtra il mio giardino separatamente se l'utente è loggato
        const user = firebase.auth().currentUser;
        if (user) {
            const filteredMyGarden = myGarden.filter(plant => {
                const matchesSearch = plant.name.toLowerCase().includes(searchTerm) ||
                                      (plant.description && plant.description.toLowerCase().includes(searchTerm)) ||
                                      (plant.notes && plant.notes.toLowerCase().includes(searchTerm));
                const matchesType = !filterType || plant.type === filterType;
                const matchesLight = !filterLight || plant.light === filterLight;
                const matchesWater = !filterWater || plant.water === filterWater;
                const matchesClimateZone = !filterClimateZone || plant.climateZone === filterClimateZone;
                return matchesSearch && matchesType && matchesLight && matchesWater && matchesClimateZone;
            });

            filteredMyGarden.sort((a, b) => {
                if (currentSortBy === 'name_asc') {
                    return a.name.localeCompare(b.name);
                } else if (currentSortBy === 'name_desc') {
                    return b.name.localeCompare(a.name);
                } else if (currentSortBy === 'last_modified_desc') {
                    const dateA = a.lastModified ? a.lastModified.toDate() : new Date(0);
                    const dateB = b.lastModified ? b.lastModified.toDate() : new Date(0);
                    return dateB - dateA;
                }
                return 0;
            });
            renderPlants(filteredMyGarden, myGardenContainer, true);
        } else {
            // Se non loggato, ma si tenta di visualizzare "My Garden", mostra messaggio
            renderPlants([], myGardenContainer, true); // Rende vuoto
        }
    } else {
        renderPlants(filteredPlants, gardenContainer, false);
    }
}

// 7. FUNZIONI SPECIFICHE PER MODAL E LIGHT SENSOR

/**
 * Mostra il form di modifica della pianta precompilato.
 * @param {object} plant La pianta da modificare.
 */
function showUpdatePlantForm(plant) {
    currentPlantIdToUpdate = plant.id;
    updatePlantNameInput.value = plant.name || '';
    updatePlantDescriptionTextarea.value = plant.description || '';
    updatePlantTypeSelect.value = plant.type || '';
    updatePlantLightSelect.value = plant.light || '';
    updatePlantWaterSelect.value = plant.water || '';
    updatePlantClimateZoneSelect.value = plant.climateZone || '';
    updatePlantImageInput.value = plant.image || '';
    updatePlantNotesTextarea.value = plant.notes || '';
    openModal('updatePlantCard');
}

/**
 * Apre la modal dell'immagine con l'immagine cliccata.
 * @param {string} imageUrl L'URL dell'immagine da visualizzare.
 * @param {string} caption La didascalia dell'immagine (nome della pianta).
 */
function openImageModal(imageUrl, caption) {
    if (imageModal && zoomedImage && closeImageModalButton) {
        zoomedImage.src = imageUrl;
        document.getElementById('image-caption').textContent = caption;
        imageModal.style.display = 'flex'; // Usa flex per centrare la modal
    }
}

/**
 * Gestisce la logica per avviare il sensore di luce ambientale.
 */
function startLightSensor() {
    if ('AmbientLightSensor' in window) {
        if (!ambientLightSensor) {
            ambientLightSensor = new AmbientLightSensor();
            ambientLightSensor.onreading = () => {
                const lux = ambientLightSensor.illuminance;
                currentLuxValueSpan.textContent = lux.toFixed(2);
                updateLightFeedback(lux);
            };
            ambientLightSensor.onerror = (event) => {
                console.error("Errore del sensore di luce:", event.error.name, event.error.message);
                showToast(`Errore sensore luce: ${event.error.message}`, 'error');
                stopLightSensor();
            };
        }
        try {
            ambientLightSensor.start();
            startLightSensorButton.style.display = 'none';
            stopLightSensorButton.style.display = 'inline-block';
            showToast("Misurazione luce avviata...", 'info');
        } catch (error) {
            console.error("Impossibile avviare il sensore di luce:", error);
            showToast(`Errore: Impossibile avviare il sensore di luce. ${error.message}`, 'error');
        }
    } else {
        showToast("Il tuo browser non supporta il sensore di luce ambientale.", 'error');
        console.warn("Ambient Light Sensor non supportato in questo browser.");
    }
}

/**
 * Gestisce la logica per fermare il sensore di luce ambientale.
 */
function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        startLightSensorButton.style.display = 'inline-block';
        stopLightSensorButton.style.display = 'none';
        currentLuxValueSpan.textContent = 'N/A';
        lightFeedbackDiv.textContent = '';
        showToast("Misurazione luce fermata.", 'info');
    }
}

/**
 * Fornisce un feedback sulla luce rilevata.
 * @param {number} lux Il valore di illuminazione in Lux.
 */
function updateLightFeedback(lux) {
    let feedback = '';
    if (lux < 50) {
        feedback = 'Luce molto bassa. Adatta per piante da ombra profonda.';
    } else if (lux >= 50 && lux < 500) {
        feedback = 'Luce bassa/media. Adatta per piante da ombra o mezz\'ombra.';
    } else if (lux >= 500 && lux < 2000) {
        feedback = 'Luce media. Adatta per molte piante da interno e mezz\'ombra.';
    } else if (lux >= 2000 && lux < 10000) {
        feedback = 'Luce alta. Adatta per piante che necessitano di mezz\'ombra/pieno sole indiretto.';
    } else { // lux >= 10000
        feedback = 'Luce molto alta. Adatta per piante che necessitano di pieno sole.';
    }
    lightFeedbackDiv.textContent = feedback;
}

/**
 * Ottiene la posizione geografica dell'utente e cerca le informazioni climatiche.
 * Per una funzionalità completa, dovresti integrare un servizio API meteo/clima esterno.
 */
async function getGeolocationAndClimate() {
    if (navigator.geolocation) {
        locationStatusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Rilevamento posizione...</span>';
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            locationStatusDiv.innerHTML = `<i class="fas fa-location-dot"></i> <span>Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}</span>`;
            showToast("Posizione rilevata!", 'success');

            // QUI INIZIEREBBE L'INTEGRAZIONE CON UNA API ESTERNA PER IL CLIMA
            // ESEMPIO (PSEUDO-CODICE - NON FUNZIONA SENZA UNA VERA API KEY E URL):
            // const API_KEY = 'TUA_API_KEY_CLIMA';
            // const weatherApiUrl = `https://api.example.com/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
            // try {
            //     const response = await fetch(weatherApiUrl);
            //     const data = await response.json();
            //     const climateZone = data.climateInfo.zone; // Esempio
            //     showToast(`Clima rilevato: ${climateZone}`, 'info');
            //     climateZoneFilterSelect.value = climateZone; // Imposta il filtro
            //     applyFilters();
            // } catch (error) {
            //     console.error("Errore nel recupero dati clima:", error);
            //     showToast("Impossibile ottenere dati climatici per la tua posizione.", 'error');
            // }

        }, (error) => {
            console.error("Errore di geolocalizzazione:", error);
            let errorMessage = "Errore durante il rilevamento della posizione.";
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Permesso di geolocalizzazione negato.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Informazioni sulla posizione non disponibili.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "La richiesta di posizione è scaduta.";
                    break;
            }
            locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span>${errorMessage}</span>`;
            showToast(errorMessage, 'error');
        });
    } else {
        locationStatusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Geolocalizzazione non supportata dal browser.</span>';
        showToast("Geolocalizzazione non supportata dal tuo browser.", 'error');
    }
}


// 8. EVENT LISTENERS E INIZIALIZZAZIONE

// Listener per lo stato di autenticazione di Firebase
// Questo è il punto chiave per la gestione dell'UI e dello spinner.
firebase.auth().onAuthStateChanged(async (user) => {
    // Appena Firebase determina lo stato di autenticazione, aggiorna l'UI
    // e nascondi lo spinner.
    updateUIVisibility(user); 
});

// Funzione principale che si esegue quando il DOM è completamente caricato
document.addEventListener('DOMContentLoaded', async () => {
    isDomReady = true;

    // Inizializzazione delle variabili DOM
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden');
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    loadingSpinner = document.getElementById('loading-spinner'); 
    toastContainer = document.getElementById('toast-container');
    logoutButton = document.getElementById('logout-button');
    newPlantCard = document.getElementById('newPlantCard');
    updatePlantCard = document.getElementById('updatePlantCard');
    addPlantButton = document.getElementById('add-new-plant-button');
    maintenanceMessageDiv = document.getElementById('maintenance-message'); // Inizializza il div del messaggio di manutenzione

    // Inizializzazione variabili per i form di login/registrazione
    loginEmailInput = document.getElementById('login-email');
    loginPasswordInput = document.getElementById('login-password');
    loginErrorDiv = document.getElementById('login-error');
    registerEmailInput = document.getElementById('register-email');
    registerPasswordInput = document.getElementById('register-password');
    registerErrorDiv = document.getElementById('register-error');

    // Inizializzazione variabili per i campi del form "Aggiungi Nuova Pianta"
    newPlantNameInput = document.getElementById('new-plant-name');
    newPlantDescriptionTextarea = document.getElementById('new-plant-description');
    newPlantTypeSelect = document.getElementById('new-plant-type');
    newPlantLightSelect = document.getElementById('new-plant-light');
    newPlantWaterSelect = document.getElementById('new-plant-water');
    newPlantClimateZoneSelect = document.getElementById('new-plant-climate-zone');
    newPlantImageInput = document.getElementById('new-plant-image');
    newPlantNotesTextarea = document.getElementById('new-plant-notes');
    newPlantForm = document.getElementById('new-plant-form');

    // Inizializzazione variabili per i campi del form "Modifica Pianta"
    updatePlantIdInput = document.getElementById('update-plant-id');
    updatePlantNameInput = document.getElementById('update-plant-name');
    updatePlantDescriptionTextarea = document.getElementById('update-plant-description');
    updatePlantTypeSelect = document.getElementById('update-plant-type');
    updatePlantLightSelect = document.getElementById('update-plant-light');
    updatePlantWaterSelect = document.getElementById('update-plant-water');
    updatePlantClimateZoneSelect = document.getElementById('update-plant-climate-zone');
    updatePlantImageInput = document.getElementById('update-plant-image');
    updatePlantNotesTextarea = document.getElementById('update-plant-notes');
    updatePlantForm = document.getElementById('update-plant-form');

    // Inizializzazione variabili per filtri e ricerca
    searchInput = document.getElementById('search-input');
    sortBySelect = document.getElementById('sort-by');
    plantTypeFilterSelect = document.getElementById('plant-type-filter');
    lightFilterSelect = document.getElementById('light-filter');
    waterFilterSelect = document.getElementById('water-filter');
    climateZoneFilterSelect = document.getElementById('climate-zone-filter');

    // Inizializzazione variabili per il sensore di luce
    startLightSensorButton = document.getElementById('startLightSensorButton'); // Notare che in index.html è 'startLightSensorButton' e non 'start-light-sensor-button'
    stopLightSensorButton = document.getElementById('stopLightSensorButton');
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback');

    // Inizializzazione variabili per i bottoni di navigazione My Garden / Add Plant
    toggleMyGardenButton = document.getElementById('toggle-my-garden-button');
    addNewPlantButton = document.getElementById('add-new-plant-button');
    plantsSection = document.getElementById('plants-section');
    emptyGardenMessage = document.getElementById('empty-garden-message');
    giardinoTitle = document.getElementById('giardino-title');

    // Inizializzazione variabili per la geolocalizzazione
    getLocationButton = document.getElementById('get-location-button');
    locationStatusDiv = document.getElementById('location-status');


    // Mostra lo spinner SUBITO quando il DOM è pronto.
    // Sarà poi nascosto da updateUIVisibility quando Firebase ha finito.
    showLoadingSpinner(); 

    // --- LOGICA PER MOSTRARE IL MESSAGGIO DI MANUTENZIONE ---
    // Questo lo renderà visibile non appena l'app si carica.
    if (maintenanceMessageDiv) {
        maintenanceMessageDiv.style.display = 'block'; 
    }
    // --------------------------------------------------------

    // EVENT LISTENERS
    // Autenticazione
    document.getElementById('login-button').addEventListener('click', handleLogin);
    document.getElementById('register-button').addEventListener('click', handleRegister);
    logoutButton.addEventListener('click', handleLogout);

    // Gestione Piante (Aggiungi/Modifica/Elimina)
    if (addPlantButton) {
        addPlantButton.addEventListener('click', () => {
            openModal('newPlantCard');
        });
    }

    if (newPlantForm) {
        newPlantForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!validatePlantForm('new')) {
                showToast('Compila tutti i campi richiesti.', 'error');
                return;
            }
            const plantData = {
                name: newPlantNameInput.value.trim(),
                description: newPlantDescriptionTextarea.value.trim(),
                type: newPlantTypeSelect.value,
                light: newPlantLightSelect.value,
                water: newPlantWaterSelect.value,
                climateZone: newPlantClimateZoneSelect.value,
                image: newPlantImageInput.value.trim(),
                notes: newPlantNotesTextarea.value.trim(),
            };
            await addPlantToDatabase(plantData);
        });
    }

    if (updatePlantForm) {
        updatePlantForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!validatePlantForm('update')) {
                showToast('Compila tutti i campi richiesti.', 'error');
                return;
            }
            const plantData = {
                name: updatePlantNameInput.value.trim(),
                description: updatePlantDescriptionTextarea.value.trim(),
                type: updatePlantTypeSelect.value,
                light: updatePlantLightSelect.value,
                water: updatePlantWaterSelect.value,
                climateZone: updatePlantClimateZoneSelect.value,
                image: updatePlantImageInput.value.trim(),
                notes: updatePlantNotesTextarea.value.trim(),
            };
            await updatePlantInDatabase(currentPlantIdToUpdate, plantData);
        });
    }

    // Event listener per la chiusura della modal immagine
    if (closeImageModalButton) {
        closeImageModalButton.addEventListener('click', () => {
            if (imageModal) imageModal.style.display = 'none';
        });
    }

    // Chiusura modal cliccando fuori
    window.addEventListener('click', (event) => {
        if (event.target === newPlantCard) {
            closeModal('newPlantCard');
        }
        if (event.target === updatePlantCard) {
            closeModal('updatePlantCard');
        }
        if (event.target === imageModal) {
            if (imageModal) imageModal.style.display = 'none';
        }
    });


    // Gestione galleria principale (aggiungi al giardino, zoom immagine, ecc.)
    if (gardenContainer) {
        gardenContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('plant-image')) {
                openImageModal(event.target.src, event.target.alt);
            } else if (event.target.classList.contains('add-to-garden-button')) {
                const plantIdToAdd = event.target.dataset.plantId;
                await addToMyGarden(plantIdToAdd);
            }
        });
    }

    // Gestione "Il mio Giardino" (rimuovi dal giardino, modifica, zoom immagine)
    if (myGardenContainer) {
        myGardenContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('plant-image')) {
                openImageModal(event.target.src, event.target.alt);
            } else if (event.target.classList.contains('remove-button')) {
                const plantIdToRemove = event.target.dataset.plantId;
                const confirmDelete = confirm('Sei sicuro di voler rimuovere questa pianta dal tuo giardino?');
                if (confirmDelete) {
                    const user = firebase.auth().currentUser;
                    if (user) { await removeFromMyGarden(plantIdToRemove); }
                    else { showToast("Devi essere autenticato per rimuovere piante dal tuo giardino.", 'info'); }
                }
            } else if (event.target.classList.contains('update-plant-button')) {
                const plantIdToUpdate = event.target.dataset.plantId;
                const plantToUpdate = allPlants.find(p => p.id === plantIdToUpdate); // Cerca anche nelle piante pubbliche
                if (plantToUpdate) { showUpdatePlantForm(plantToUpdate); } 
                else { showToast(`Pianta con ID ${plantIdToUpdate} non trovata per l'aggiornamento nel mio giardino.`, 'error'); }
            }
        });
    }


    // Filtri e Ricerca
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (sortBySelect) {
        sortBySelect.addEventListener('change', (event) => {
            currentSortBy = event.target.value;
            applyFilters();
        });
    }
    if (plantTypeFilterSelect) plantTypeFilterSelect.addEventListener('change', applyFilters);
    if (lightFilterSelect) lightFilterSelect.addEventListener('change', applyFilters);
    if (waterFilterSelect) waterFilterSelect.addEventListener('change', applyFilters);
    if (climateZoneFilterSelect) climateZoneFilterSelect.addEventListener('change', applyFilters);

    // Toggle My Garden / All Plants
    if (toggleMyGardenButton) {
        toggleMyGardenButton.addEventListener('click', () => {
            isMyGardenCurrentlyVisible = !isMyGardenCurrentlyVisible;
            if (isMyGardenCurrentlyVisible) {
                if (plantsSection) plantsSection.style.display = 'none'; // Nascondi la sezione principale
                if (myGardenContainer) myGardenContainer.style.display = 'grid'; // Mostra il mio giardino
                if (giardinoTitle) giardinoTitle.style.display = 'block'; // Mostra il titolo "Il mio Giardino"
                toggleMyGardenButton.textContent = 'Mostra tutte le Piante';
                applyFilters(); // Applica i filtri al giardino
                if (myGarden.length === 0 && emptyGardenMessage) {
                    emptyGardenMessage.style.display = 'block';
                } else if (emptyGardenMessage) {
                    emptyGardenMessage.style.display = 'none';
                }
            } else {
                if (plantsSection) plantsSection.style.display = 'block'; // Mostra la sezione principale
                if (myGardenContainer) myGardenContainer.style.display = 'none'; // Nascondi il mio giardino
                if (giardinoTitle) giardinoTitle.style.display = 'none'; // Nascondi il titolo
                if (emptyGardenMessage) emptyGardenMessage.style.display = 'none'; // Nascondi il messaggio di giardino vuoto
                toggleMyGardenButton.textContent = 'Mostra il mio Giardino';
                applyFilters(); // Applica i filtri a tutte le piante
            }
        });
    }

    // Light Sensor
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);

    // Geolocation
    if (getLocationButton) getLocationButton.addEventListener('click', getGeolocationAndClimate);

    // Load initial data (This will be handled by onAuthStateChanged)
    // No need to call loadAllPlants() or loadMyGarden() directly here,
    // updateUIVisibility will take care of it after auth state is known.
});
