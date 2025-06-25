let allPlants = [];
let myGarden = [];
let currentPlantIdToUpdate = null; // Tiene traccia dell'ID della pianta da aggiornare (per modifica/eliminazione)
let ambientLightSensor = null; // Sensore di luce ambientale
let isMyGardenCurrentlyVisible = false; // Flag per la visualizzazione corrente (true = Mio Giardino, false = Tutte le Piante)
let currentSortBy = 'name_asc'; // Criterio di ordinamento di default
let currentCropper = null; // Variabile per l'istanza di Cropper.js
let croppedImageBlob = null; // Per memorizzare il blob dell'immagine ritagliata
let currentFile = null; // Per memorizzare il file originale selezionato dall'utente

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
let manualLuxInputDiv; // Nuovo: div per input manuale lux (corretto per ID in index.html)

let applyManualLuxButton; // Nuovo: bottone per applicare lux manuale
let tempMinFilter;
let tempMaxFilter;
let sortBySelect; // Selettore per l'ordinamento
let plantModal;
let plantForm;
let closePlantModalButton;
let plantNameInput;
let plantCategorySelect;
let sunLightSelect;
let plantDescriptionTextarea;
let plantTempMinInput;
let plantTempMaxInput;
let plantWateringInput;
let plantIdealLuxMinInput; 
let plantIdealLuxMaxInput; 
let plantImageInput;
let plantImagePreview;
let saveUpdatePlantButton;
let cancelUpdatePlantButton;
let deletePlantButton;
let imageModal;
let closeImageModalButton;
let sunLightFilter; // Variabile per il filtro esposizione solare (corretto per ID in index.html)
let plantModalTitle;
let cardModal;
let closeCardModalButton;
let zoomedCardContent;

let getClimateButton;
let locationNameSpan;
let currentTempSpan;
let weatherDescriptionSpan;
let humiditySpan;
let windSpeedSpan;
let lastUpdatedSpan;
let googleLensButton; // variabile...
let cropImageModal; // Per il ritaglio
let closeCropImageModalButton; // Per il bottone di chiusura del ritaglio
let imageToCrop; // L'immagine dentro la modale di ritaglio
let cropButton; // Il bottone di ritaglio
let imageZoomModal; // Per lo zoom dell'immagine
let closeImageZoomModalButton; // Per il bottone di chiusura dello zoom
let imageZoomDisplay; // L'immagine dentro la modale di zoom
let currentUser = null;

let rotateLeftButton;
let rotateRightButton;
let zoomInButton;
let zoomOutButton;

let manualLuxInput; // Assicurati che questo sia già qui se usi l'input manuale
let currentLuxDisplay; // Per visualizzare il lux attuale
let luxFeedbackPlantsContainer; // Il nuovo contenitore per il feedback specifico
let clearLuxFeedbackButton; // Il nuovo bottone per azzerare il feedback
let clearLightFeedbackButton;

let loginForm; // Assicurati che anche loginForm e registerForm siano qui!
let registerForm;
let loadingSpinner; // Dichiarazione per lo spinner

// Definizione delle icone generiche per categoria (per la vista "Tutte le Piante")
const categoryIcons = {
    'Sole Pieno': 'assets/category_icons/sun_icon.png', // Devi creare queste immagini!
    'Mezz\'ombra': 'assets/category_icons/partial_shade_icon.png',
    'Ombra': 'assets/category_icons/shade_icon.png',
    'Pianta Grassa': 'assets/category_icons/succulent_icon.png',
    'Fiore': 'assets/category_icons/flower_icon.png',
    'Arbusto': 'assets/category_icons/shrub_icon.png',
    // Aggiungi qui tutte le tue categorie e i percorsi delle icone
    'Altro': 'assets/category_icons/default_icon.png' // Icona di default per categorie non mappate
};

function showAuthContent() {
    if (auth.currentUser) { // Utente loggato
        authContainerDiv.style.display = 'none'; // Nasconde il login/registrazione
        appContentDiv.style.display = 'block'; // Mostra il contenuto principale dell'app
    } else { // Utente non loggato
        authContainerDiv.style.display = 'block'; // Mostra il login/registrazione
        appContentDiv.style.display = 'none'; // Nasconde il contenuto principale dell'app
    }
}

// Funzioni di utilità per spinner e toast
function isPlantInMyGarden(plantId) {
    return myGarden.some(plant => plant.id === plantId);
}

function showLoadingSpinner() {
    if (loadingSpinner) { // Aggiunto controllo per assicurarsi che l'elemento esista
        loadingSpinner.style.display = 'flex';
    }
}

function hideLoadingSpinner() {
    if (loadingSpinner) { // Aggiunto controllo per assicurarsi che l'elemento esista
        loadingSpinner.style.display = 'none';
    }
}

function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10); // Small delay to trigger CSS transition

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
}

// Funzione di utilità per chiudere la modale della card e resettare
function closeCardModal() {
    if (cardModal) {
        cardModal.style.display = 'none';
    }
    if (zoomedCardContent) {
        zoomedCardContent.innerHTML = ''; // Pulisci il contenuto
    }
}


// --- Funzioni di Autenticazione ---
// ... (il tuo codice di autenticazione rimane invariato)
function setupAuthListeners() {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    loginError.textContent = '';
    registerError.textContent = '';

    loginButton.addEventListener('click', () => {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginError.textContent = '';
        registerError.textContent = '';
    });

    registerButton.addEventListener('click', () => {
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        loginError.textContent = '';
        registerError.textContent = '';
    });

    showLoginLink.addEventListener('click', () => {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginError.textContent = '';
        registerError.textContent = '';
    });

    showRegisterLink.addEventListener('click', () => {
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        loginError.textContent = '';
        registerError.textContent = '';
    });

    // Listener per il form di login
    document.querySelector('#login-form form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        try {
            showLoadingSpinner();
            await auth.signInWithEmailAndPassword(email, password);
            showToast('Accesso effettuato con successo!', 'success');
        } catch (error) {
            console.error("Errore di login:", error);
            loginError.textContent = error.message;
            showToast(`Errore di accesso: ${error.message}`, 'error');
        } finally {
            hideLoadingSpinner();
        }
    });

    // Listener per il form di registrazione
    document.querySelector('#register-form form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        try {
            showLoadingSpinner();
            await auth.createUserWithEmailAndPassword(email, password);
            showToast('Registrazione effettuata con successo!', 'success');
        } catch (error) {
            console.error("Errore di registrazione:", error);
            registerError.textContent = error.message;
            showToast(`Errore di registrazione: ${error.message}`, 'error');
        } finally {
            hideLoadingSpinner();
        }
    });

    // Listener per il logout
    logoutButton.addEventListener('click', async () => {
        try {
            showLoadingSpinner();
            await auth.signOut();
            showToast('Disconnessione effettuata!', 'info');
        } catch (error) {
            console.error("Errore di logout:", error);
            showToast(`Errore di disconnessione: ${error.message}`, 'error');
        } finally {
            hideLoadingSpinner();
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
            showAuthContent();
            loadMyGarden().then(() => { // Carica il giardino all'avvio
                // Dopo aver caricato il giardino, mostra le piante
                // Se vuoi mostrare "Tutte le Piante" all'avvio:
                loadAllPlants();
                isMyGardenCurrentlyVisible = false; // Flag a false
                plantsSectionHeader.textContent = "Tutte le Piante Disponibili";
                gardenContainer.style.display = 'flex'; // Rendi visibile il contenitore delle piante
                myGardenContainer.style.display = 'none'; // Assicurati che l'altro sia nascosto
            });
        } else {
            currentUser = null;
            console.log('Nessun utente loggato.');
            authStatusSpan.textContent = 'Non Autenticato';
            loginButton.style.display = 'inline-block';
            registerButton.style.display = 'inline-block';
            logoutButton.style.display = 'none';
            authContainerDiv.style.display = 'block';
            appContentDiv.style.display = 'none';
            gardenContainer.style.display = 'none'; // Nasconde i container delle piante
            myGardenContainer.style.display = 'none';
            // Pulisci le liste se l'utente non è autenticato
            allPlants = [];
            myGarden = [];
            displayPlants([]); // Pulisce le card visualizzate
        }
        hideLoadingSpinner(); // CORREZIONE: Usa hideLoadingSpinner
    });
}


// --- Funzioni di Interazione con Firestore e Storage ---

async function uploadImage(file) {
    if (!file) return null;

    const storageRef = storage.ref();
    const fileName = `plant_images/<span class="math-inline">\{Date\.now\(\)\}\_</span>{file.name}`; // Nome unico per l'immagine
    const imageRef = storageRef.child(fileName);

    try {
        const snapshot = await imageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        console.log('Immagine caricata con successo:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('Errore durante l\'upload dell\'immagine:', error);
        showToast(`Errore durante l'upload dell'immagine: ${error.message}`, 'error');
        throw error; // Rilancia l'errore per gestirlo a monte
    }
}

async function savePlantToFirestore(e) {
    e.preventDefault();
    showLoadingSpinner();

    const name = plantNameInput.value;
    const category = plantCategorySelect.value;
    const sunLight = sunLightSelect.value; 
    const description = plantDescriptionTextarea.value;
    const tempMin = plantTempMinInput.value ? parseFloat(plantTempMinInput.value) : null;
    const tempMax = plantTempMaxInput.value ? parseFloat(plantTempMaxInput.value) : null;
    const watering = plantWateringInput.value;
    const idealLuxMin = plantIdealLuxMinInput.value ? parseFloat(plantIdealLuxMinInput.value) : null;
    const idealLuxMax = plantIdealLuxMaxInput.value ? parseFloat(plantIdealLuxMaxInput.value) : null;
    const user = currentUser;

    // --- DEBUGGING AGGIUNTIVO QUI ---
    console.log("DEBUG: Stato autenticazione prima del salvataggio:", user);
    if (user) {
        console.log("DEBUG: UID utente corrente:", user.uid);
    } else {
        console.warn("DEBUG: Utente non autenticato! La richiesta a Firestore fallirà per permessi.");
    }
    // --- FINE DEBUGGING ---

    if (!user) {
        showToast('Devi essere autenticato per salvare una pianta.', 'error');
        hideLoadingSpinner();
        return;
    }

    let imageUrl = '';
    // Se c'è un'immagine ritagliata, caricala. Altrimenti, se si sta modificando e non c'è una nuova immagine, mantieni quella esistente.
    if (croppedImageBlob) {
        try {
            imageUrl = await uploadImage(croppedImageBlob);
        } catch (error) {
            // L'errore è già gestito da uploadImage, qui possiamo semplicemente uscire
            hideLoadingSpinner();
            return;
        }
    } else if (currentPlantIdToUpdate) {
        // Se stiamo aggiornando una pianta esistente e nessuna nuova immagine è stata selezionata/ritagliata,
        // mantenere l'URL dell'immagine esistente.
        const existingPlant = allPlants.find(p => p.id === currentPlantIdToUpdate);
        if (existingPlant) {
            imageUrl = existingPlant.imageUrl || '';
        }
    }


    const plantData = {
        name,
        category,
        description,
        sunlight: sunLight,
        tempMin,
        tempMax,
        watering,
        idealLuxMin,
        idealLuxMax,
        imageUrl, // URL dell'immagine caricata
        createdAt: currentPlantIdToUpdate ? allPlants.find(p => p.id === currentPlantIdToUpdate).createdAt : firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (currentPlantIdToUpdate) {
            // Aggiorna pianta esistente
            await db.collection('plants').doc(currentPlantIdToUpdate).update(plantData);
            showToast('Pianta aggiornata con successo!', 'success');
        } else {
            // Aggiungi nuova pianta
            await db.collection('plants').add(plantData);
            showToast('Pianta aggiunta con successo!', 'success');
        }
        plantModal.style.display = 'none'; // Chiudi la modale
        plantForm.reset(); // Resetta il form
        plantImagePreview.style.display = 'none'; // Nascondi l'anteprima
        plantImagePreview.src = '#'; // Pulisci la sorgente
        croppedImageBlob = null; // Resetta il blob dell'immagine ritagliata
        currentFile = null; // Resetta il file originale
        loadAllPlants(); // Ricarica tutte le piante per aggiornare la vista
    } catch (error) {
        console.error("Errore nel salvare la pianta:", error);
        showToast(`Errore nel salvare la pianta: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function deletePlantFromFirestore(plantId) {
    if (!confirm('Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile!')) {
        return;
    }
    showLoadingSpinner();
    try {
        // Trova la pianta per ottenere l'URL dell'immagine se presente
        const plantToDelete = allPlants.find(p => p.id === plantId);
        if (plantToDelete && plantToDelete.imageUrl) {
            // Crea un riferimento all'immagine e cancellala da Storage
            const imageRef = storage.refFromURL(plantToDelete.imageUrl);
            await imageRef.delete();
            console.log('Immagine eliminata con successo da Storage.');
        }

        // Elimina il documento da Firestore
        await db.collection('plants').doc(plantId).delete();
        showToast('Pianta eliminata con successo dal database!', 'success');
        closeCardModal(); // Chiudi la modale se aperta
        plantModal.style.display = 'none'; // Chiudi la modale di modifica/aggiunta
        loadAllPlants(); // Ricarica le piante per aggiornare la vista
    } catch (error) {
        console.error("Errore nell'eliminazione della pianta:", error);
        showToast(`Errore nell'eliminazione della pianta: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione per mostrare il form con i dati di una pianta esistente per la modifica
async function editPlant(plantId) {
    currentPlantIdToUpdate = plantId;
    const plantToEdit = allPlants.find(p => p.id === plantId);

    if (plantToEdit) {
        if (plantNameInput) plantNameInput.value = plantToEdit.name || '';
        if (plantCategorySelect) plantCategorySelect.value = plantToEdit.category || '';
        if (sunLightSelect) sunLightSelect.value = plantToEdit.sunlight || '';
        if (plantDescriptionTextarea) plantDescriptionTextarea.value = plantToEdit.description || '';
        if (plantTempMinInput) plantTempMinInput.value = plantToEdit.tempMin || '';
        if (plantTempMaxInput) plantTempMaxInput.value = plantToEdit.tempMax || '';
        if (plantWateringInput) plantWateringInput.value = plantToEdit.watering || '';
        if (plantIdealLuxMinInput) plantIdealLuxMinInput.value = plantToEdit.idealLuxMin || '';
        if (plantIdealLuxMaxInput) plantIdealLuxMaxInput.value = plantToEdit.idealLuxMax || '';

        // Mostra l'anteprima dell'immagine esistente
        if (plantImagePreview) {
            if (plantToEdit.imageUrl) {
                plantImagePreview.src = plantToEdit.imageUrl;
                plantImagePreview.style.display = 'block';
            } else {
                plantImagePreview.style.display = 'none';
                plantImagePreview.src = '#';
            }
        }

        if (plantModalTitle) {
            plantModalTitle.textContent = 'Modifica Pianta'; // Cambia il titolo
        }

        if (saveUpdatePlantButton) saveUpdatePlantButton.textContent = 'Aggiorna Pianta';
        if (deletePlantButton) deletePlantButton.style.display = 'inline-block'; // Mostra il bottone elimina
        if (plantModal) plantModal.style.display = 'flex';
        closeCardModal(); // Chiudi la modale di visualizzazione se aperta
    } else {
        showToast('Pianta non trovata per la modifica.', 'error');
    }
}

// Funzione per aggiungere una pianta al "Mio Giardino"
async function addPlantToMyGarden(plantId) {
    showLoadingSpinner();

    // CORREZIONE FONDAMENTALE 1: Usa la variabile globale 'currentUser'
    // Assicurati che currentUser sia correttamente definita e aggiornata dal listener onAuthStateChanged
    const user = currentUser; 

    if (!user) {
        showToast('Devi essere autenticato per aggiungere piante al tuo giardino.', 'error');
        hideLoadingSpinner();
        return;
    }

    const plantToAddOriginal = allPlants.find(plant => plant.id === plantId);
    if (!plantToAddOriginal) {
        showToast('Pianta non trovata nel catalogo generale.', 'error');
        hideLoadingSpinner();
        return;
    }

    // Crea un nuovo oggetto per la pianta del giardino, copiando i dati originali
    const plantDataForGarden = { ...plantToAddOriginal }; // Copia tutti i dati dalla pianta del catalogo

    // --- CORREZIONE DEL BUG: Utilizza la funzione 'uploadImage' che è definita ---
    let imageUrlForGarden = '';
    if (croppedImageBlob) { // Se l'utente ha ritagliato una nuova immagine (il blob dell'immagine reale)
        try {
            // Questa funzione carica l'immagine su Firebase Storage e restituisce il suo URL
            imageUrlForGarden = await uploadImage(croppedImageBlob); // <-- CORREZIONE QUI
            plantDataForGarden.imageUrl = imageUrlForGarden; // Aggiungi l'URL al tuo oggetto pianta del giardino
            showToast('Immagine caricata con successo su Firebase Storage.', 'success');
        } catch (imageError) {
            console.error("Errore nel caricare l'immagine della pianta per il giardino:", imageError);
            showToast(`Errore nel caricare l'immagine: ${imageError.message}`, 'error');
            // Continua comunque a salvare la pianta, anche senza immagine se il caricamento fallisce
        }
    } else {
        // Se non c'è un'immagine ritagliata (l'utente non ne ha scattata una),
        // la pianta nel giardino non avrà un 'imageUrl' personalizzato.
        // La funzione displayPlants userà l'icona generica in questo caso.
    }
    // --- FINE LOGICA PER IMMAGINE UTENTE SPECIFICA ---

    try {
        // Il percorso Firestore ora usa correttamente user.uid
        const docRef = db.collection('users').doc(user.uid).collection('gardens').doc(plantId);
        const doc = await docRef.get();

        if (doc.exists) {
            showToast('Questa pianta è già nel tuo giardino!', 'info');
        } else {
            // Salva l'oggetto pianta del giardino (che ora potrebbe avere imageUrl)
            await docRef.set(plantDataForGarden); 

            showToast('Pianta aggiunta al tuo giardino!', 'success');

            // Pulisci lo stato dell'immagine dopo aver salvato
            croppedImageBlob = null; 
            currentFile = null;
            plantImageInput.value = ''; // Resetta l'input file
            plantImagePreview.style.display = 'none'; // Nascondi anteprima
            plantImagePreview.src = '#'; // Pulisci la sorgente

            loadMyGarden(); // Ricarica il mio giardino
        }
    } catch (error) {
        console.error("Errore nell'aggiunta al giardino:", error);
        showToast(`Errore nell'aggiunta al giardino: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}
// Funzione per rimuovere una pianta dal "Mio Giardino"
async function removePlantFromMyGarden(plantId) {
    if (!confirm('Sei sicuro di voler rimuovere questa pianta dal tuo giardino?')) {
        return;
    }
    showLoadingSpinner();

    const user = currentUser; 
    if (!user) {
        showToast('Devi essere autenticato per rimuovere piante dal tuo giardino.', 'error');
        hideLoadingSpinner();
        return;
    }

    try {
        const docRef = db.collection('users').doc(user.uid).collection('gardens').doc(plantId);
        await docRef.delete(); 

        showToast('Pianta rimossa dal tuo giardino!', 'success');

        // CHIAMATA CORRETTA PER AGGIORNARE LA UI IMMEDIATAMENTE
        await displayMyGarden(); // <-- CAMBIATO DA loadMyGarden() A displayMyGarden()

    } catch (error) {
        console.error("Errore nella rimozione dal giardino:", error); 
        showToast(`Errore nella rimozione dal giardino: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// --- Funzioni di Caricamento e Visualizzazione Piante ---

async function loadAllPlants() {
    showLoadingSpinner();
    try {
        const snapshot = await db.collection('plants').get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        applyFiltersAndSort(); // Applica i filtri e l'ordinamento
    } catch (error) {
        console.error("Errore nel caricamento di tutte le piante:", error);
        showToast(`Errore nel caricamento delle piante: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function loadMyGarden() {
    showLoadingSpinner();

    // ********* CORREZIONE QUI *********
    // Usa la variabile globale 'currentUser' per coerenza e robustezza
    const user = currentUser; 
    // **********************************

    if (!user) {
        // Se l'utente non è autenticato, non c'è un giardino da caricare.
        // Potresti voler mostrare un messaggio diverso o reindirizzare.
        showToast('Devi essere autenticato per vedere il tuo giardino.', 'error');
        displayPlants([]); // Mostra un giardino vuoto o un messaggio
        hideLoadingSpinner();
        return;
    }

    try {
        const gardenSnapshot = await db.collection('users').doc(user.uid).collection('gardens').get();
        myGarden = []; // Pulisci l'array myGarden prima di riempirlo
        gardenSnapshot.forEach(doc => {
            // Qui riceverai l'intero oggetto pianta dal tuo giardino (con imageUrl se presente)
            myGarden.push({ id: doc.id, ...doc.data() });
        });

        // Non visualizzare qui, la visualizzazione avverrà dopo applyFiltersAndSort()
        // che viene chiamata in displayMyGarden()
        // console.log("Mio Giardino Caricato:", myGarden); 

    } catch (error) {
        console.error("Errore nel caricare il giardino:", error);
        showToast(`Errore nel caricare il giardino: ${error.message}`, 'error');
        myGarden = []; // Assicurati che l'array sia vuoto in caso di errore
    } finally {
        hideLoadingSpinner();
    }
}

function applyFiltersAndSort() {
    let plantsToDisplay = [];

    // Determina se visualizzare il giardino o tutte le piante
    if (isMyGardenCurrentlyVisible) {
        plantsToDisplay = [...myGarden]; // Lavora su una copia del mio giardino
    } else {
        plantsToDisplay = [...allPlants]; // Lavora su una copia di tutte le piante
    }

    // --- Applicazione Filtri ---

    // Filtro per categoria
    const selectedCategory = categoryFilter.value;
    if (selectedCategory && selectedCategory !== 'all') {
        plantsToDisplay = plantsToDisplay.filter(plant => plant.category === selectedCategory);
    }

    // Filtro per esposizione solare (se il filtro è attivo)
    const selectedSunLight = sunLightFilter.value;
    if (selectedSunLight && selectedSunLight !== 'all') {
        plantsToDisplay = plantsToDisplay.filter(plant => plant.sunlight === selectedSunLight); // CORREZIONE: usa plant.sunlight
    }

    // Filtro di ricerca
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        plantsToDisplay = plantsToDisplay.filter(plant =>
            plant.name.toLowerCase().includes(searchTerm) ||
            (plant.description && plant.description.toLowerCase().includes(searchTerm))
        );
    }

    // Filtro per temperatura minima
    const minTemp = tempMinFilter.value ? parseFloat(tempMinFilter.value) : null;
    if (minTemp !== null && !isNaN(minTemp)) {
        plantsToDisplay = plantsToDisplay.filter(plant => 
            plant.tempMin !== null && plant.tempMin >= minTemp
        );
    }

    // Filtro per temperatura massima
    const maxTemp = tempMaxFilter.value ? parseFloat(tempMaxFilter.value) : null;
    if (maxTemp !== null && !isNaN(maxTemp)) {
        plantsToDisplay = plantsToDisplay.filter(plant => 
            plant.tempMax !== null && plant.tempMax <= maxTemp
        );
    }


    // --- Applicazione Ordinamento ---

    // Assicurati che currentSortBy sia correttamente aggiornato dalla tua UI (se hai un select/radio button)
    // Se non hai un'interfaccia per scegliere l'ordinamento, currentSortBy rimane 'name_asc' di default

    plantsToDisplay.sort((a, b) => {
        switch (currentSortBy) {
            case 'name_asc':
                // *** CORREZIONE PER L'ERRORE 'localeCompare' ***
                // Assicurati che i nomi siano stringhe valide (anche vuote) prima del confronto
                const nameA = a.name ? a.name.toLowerCase() : '';
                const nameB = b.name ? b.name.toLowerCase() : '';
                return nameA.localeCompare(nameB);
            case 'name_desc':
                const nameADesc = a.name ? a.name.toLowerCase() : '';
                const nameBDesc = b.name ? b.name.toLowerCase() : '';
                return nameBDesc.localeCompare(nameADesc); // Inverti per ordine decrescente
            case 'category_asc':
                const categoryA = a.category ? a.category.toLowerCase() : '';
                const categoryB = b.category ? b.category.toLowerCase() : '';
                return categoryA.localeCompare(categoryB);
            case 'category_desc':
                const categoryADesc = a.category ? a.category.toLowerCase() : '';
                const categoryBDesc = b.category ? b.category.toLowerCase() : '';
                return categoryBDesc.localeCompare(categoryADesc);
            case 'tempMin_asc':
                // Ordina per tempMin, gestendo i null come valori molto bassi o alti a seconda della logica desiderata
                // Qui, i null vanno alla fine
                return (a.tempMin || Infinity) - (b.tempMin || Infinity);
            case 'tempMin_desc':
                return (b.tempMin || -Infinity) - (a.tempMin || -Infinity);
            default:
                return 0;
        }
    });

    displayPlants(plantsToDisplay);
}


// Funzione per visualizzare le piante nel container corretto
function displayPlants(plants) {
    const container = isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer;
    if (!container) {
        console.error("Contenitore delle piante non trovato!");
        return;
    }
    container.innerHTML = ''; // Pulisci il contenitore attuale

    if (plants.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-leaf"></i>
                <p>Nessuna pianta trovata.</p>
                ${isMyGardenCurrentlyVisible ? '<p>Aggiungi alcune piante al tuo giardino dalla sezione "Tutte le Piante".</p>' : ''}
            </div>
        `;
        return;
    }

    plants.forEach(plant => {
        const plantCard = document.createElement('div');
        plantCard.className = 'plant-card';
        plantCard.dataset.id = plant.id; // Salva l'ID della pianta nel dataset

        // Determina l'URL dell'immagine da visualizzare
        // Prioritizza l'immagine specifica della pianta, altrimenti usa l'icona generica
        const imageUrl = plant.imageUrl || categoryIcons[plant.category] || categoryIcons['Altro'];

        plantCard.innerHTML = `
            <img src="<span class="math-inline">\{imageUrl\}" alt\="</span>{plant.name}" class="plant-image">
            <h3>${plant.name}</h3>
            <p><strong>Categoria:</strong> ${plant.category}</p>
            <p><strong>Esposizione Solare:</strong> ${plant.sunlight}</p>
            <p><strong>Temperatura Ideale:</strong> ${plant.tempMin || 'N/D'}°C - ${plant.tempMax || 'N/D'}°C</p>
            <p><strong>Irrigazione:</strong> ${plant.watering}</p>
            <p><strong>Lux Ideale:</strong> ${plant.idealLuxMin || 'N/D'} - <span class="math-inline">\{plant\.idealLuxMax \|\| 'N/D'\}</p\>
<div class="card-actions">
<button class="btn btn-primary" onclick="showPlantDetails('{plant.id}', ${isMyGardenCurrentlyVisible})">Dettagli</button>
</div>
`;

        // Aggiungi un bottone "Aggiungi al Giardino" o "Rimuovi dal Giardino"
        const cardActionsDiv = plantCard.querySelector('.card-actions');
        if (isMyGardenCurrentlyVisible) {
            // Se stiamo visualizzando "Il Mio Giardino", offri l'opzione per rimuovere
            const removeButton = document.createElement('button');
            removeButton.className = 'btn btn-delete-db';
            removeButton.innerHTML = '<i class="fas fa-trash-alt"></i> Rimuovi dal Giardino';
            removeButton.onclick = () => removePlantFromMyGarden(plant.id);
            cardActionsDiv.appendChild(removeButton);
        } else {
            // Se stiamo visualizzando "Tutte le Piante", offri l'opzione per aggiungere
            const addButton = document.createElement('button');
            const isInMyGarden = myGarden.some(gardenPlant => gardenPlant.id === plant.id);
            if (isInMyGarden) {
                addButton.className = 'btn btn-added';
                addButton.innerHTML = '<i class="fas fa-check-circle"></i> Già nel tuo giardino';
                addButton.disabled = true;
            } else {
                addButton.className = 'btn btn-secondary';
                addButton.innerHTML = '<i class="fas fa-plus-circle"></i> Aggiungi al Giardino';
                addButton.onclick = () => addPlantToMyGarden(plant.id);
            }
            cardActionsDiv.appendChild(addButton);
        }

        container.appendChild(plantCard);
    });
}

function showPlantDetails(plantId, fromMyGarden = false) {
    const sourceCollection = fromMyGarden ? myGarden : allPlants;
    const plant = sourceCollection.find(p => p.id === plantId);

    if (plant) {
        const imageUrl = plant.imageUrl || categoryIcons[plant.category] || categoryIcons['Altro'];

        // Contenuto della modale di visualizzazione dettagli
        // Rimuovo l'onclick dal bottone X per gestire con delegation
        zoomedCardContent.innerHTML = `
            <button class="modal-close-button">&times;</button>
            <img src="<span class="math-inline">\{imageUrl\}" alt\="</span>{plant.name}" class="card-modal-image">
            <h2>${plant.name}</h2>
            <p><strong>Categoria:</strong> ${plant.category}</p>
            <p><strong>Esposizione Solare:</strong> ${plant.sunlight}</p>
            <p><strong>Descrizione:</strong> ${plant.description || 'Nessuna descrizione.'}</p>
            <p><strong>Temperatura Ideale:</strong> ${plant.tempMin || 'N/D'}°C - ${plant.tempMax || 'N/D'}°C</p>
            <p><strong>Frequenza Irrigazione:</strong> ${plant.watering}</p>
            <p><strong>Lux Ideale:</strong> ${plant.idealLuxMin || 'N/D'} - ${plant.idealLuxMax || 'N/D'}</p>
            <div class="card-detail-actions">
                ${!fromMyGarden ? `<button class="btn btn-primary" onclick="editPlant('${plant.id}')"><i class="fas fa-edit"></i> Modifica</button>` : ''}
                ${!fromMyGarden ? `<button class="btn btn-delete-db" onclick="deletePlantFromFirestore('${plant.id}')"><i class="fas fa-trash-alt"></i> Elimina dal Database</button>` : ''}
            </div>
        `;
        cardModal.style.display = 'flex';
    } else {
        showToast('Dettagli della pianta non trovati.', 'error');
    }
}


function displayAllPlants() {
    isMyGardenCurrentlyVisible = false;
    plantsSectionHeader.textContent = "Tutte le Piante Disponibili";
    gardenContainer.style.display = 'flex';
    myGardenContainer.style.display = 'none';
    applyFiltersAndSort(); // Applica i filtri e mostra tutte le piante
}

async function displayMyGarden() {
    isMyGardenCurrentlyVisible = true;
    plantsSectionHeader.textContent = "Il Mio Giardino";
    gardenContainer.style.display = 'none';
    myGardenContainer.style.display = 'flex';
    await loadMyGarden(); // Assicurati che il giardino sia caricato e aggiornato
    applyFiltersAndSort(); // Applica i filtri e mostra le piante del giardino
}


// --- Funzioni per il Sensore di Luce Ambientale (AmbientLightSensor) ---

let ambientLightSensorInterval; // Variabile per l'intervallo di polling
let lastLuxValue = 0; // Memorizza l'ultimo valore Lux per evitare feedback ripetuti

function checkLightSensorAvailability() {
    if ('AmbientLightSensor' in window) {
        showToast('Sensore di luce ambientale disponibile.', 'info');
        if (startLightSensorButton) startLightSensorButton.disabled = false;
        if (stopLightSensorButton) stopLightSensorButton.disabled = true;
        if (manualLuxInputDiv) manualLuxInputDiv.style.display = 'none'; // Nascondi input manuale se sensore disponibile
    } else {
        showToast('Sensore di luce ambientale NON disponibile. Utilizza l\'input manuale.', 'info', 5000);
        if (startLightSensorButton) startLightSensorButton.disabled = true;
        if (stopLightSensorButton) stopLightSensorButton.disabled = true;
        if (manualLuxInputDiv) manualLuxInputDiv.style.display = 'block'; // Mostra input manuale
    }
}

function startLightSensor() {
    if (!('AmbientLightSensor' in window)) {
        showToast('Sensore di luce ambientale non supportato dal tuo browser.', 'error');
        return;
    }

    if (ambientLightSensor) {
        showToast('Sensore già attivo.', 'info');
        return;
    }

    try {
        ambientLightSensor = new AmbientLightSensor({ frequency: 1 }); // 1 lettura al secondo
        ambientLightSensor.onreading = () => {
            const currentLux = ambientLightSensor.illuminance;
            if (currentLuxDisplay) currentLuxDisplay.textContent = currentLux !== undefined ? `${currentLux.toFixed(2)} lux` : 'Lettura non disponibile';
            
            // Aggiorna il feedback solo se il valore Lux cambia significativamente o dopo un certo intervallo
            if (Math.abs(currentLux - lastLuxValue) > 5 || ambientLightSensorInterval % 5 === 0) { // Esempio: cambia di più di 5 lux o ogni 5 secondi
                provideLightFeedback(currentLux);
                lastLuxValue = currentLux;
            }
        };
        ambientLightSensor.onerror = (event) => {
            console.error("Errore sensore luce:", event.error);
            showToast(`Errore sensore luce: ${event.error.name} - ${event.error.message}`, 'error', 5000);
            stopLightSensor(); // Ferma il sensore in caso di errore
        };
        ambientLightSensor.start();
        showToast('Sensore di luce avviato.', 'success');
        if (startLightSensorButton) startLightSensorButton.disabled = true;
        if (stopLightSensorButton) stopLightSensorButton.disabled = false;
        if (manualLuxInputDiv) manualLuxInputDiv.style.display = 'none'; // Nascondi input manuale

        // Inizia l'intervallo per il polling (se necessario, altrimenti onreading è sufficiente)
        // ambientLightSensorInterval = setInterval(() => { /* logic */ }, 1000); 

    } catch (error) {
        console.error("Impossibile avviare il sensore di luce:", error);
        showToast(`Errore nell'avvio del sensore: ${error.message}`, 'error', 5000);
    }
}

function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
        if (currentLuxDisplay) currentLuxDisplay.textContent = 'Non attivo';
        // clearInterval(ambientLightSensorInterval); // Ferma l'intervallo
        showToast('Sensore di luce fermato.', 'info');
    }
    if (startLightSensorButton) startLightSensorButton.disabled = false;
    if (stopLightSensorButton) stopLightSensorButton.disabled = true;
    if (manualLuxInputDiv) manualLuxInputDiv.style.display = 'block'; // Mostra input manuale
}

function applyManualLux() {
    const manualLux = manualLuxInput.value ? parseFloat(manualLuxInput.value) : null;
    if (manualLux !== null && !isNaN(manualLux)) {
        if (currentLuxDisplay) currentLuxDisplay.textContent = `${manualLux.toFixed(2)} lux (manuale)`;
        provideLightFeedback(manualLux);
        showToast('Valore Lux manuale applicato.', 'info');
    } else {
        showToast('Inserisci un valore Lux valido.', 'error');
        if (currentLuxDisplay) currentLuxDisplay.textContent = 'Non valido';
        clearLightFeedbackDisplay(); // Pulisci il feedback se il valore non è valido
    }
}

function provideLightFeedback(currentLux) {
    if (!luxFeedbackPlantsContainer) return;

    // Pulisci il feedback precedente
    luxFeedbackPlantsContainer.innerHTML = '';
    
    let plantsNeedingMore = [];
    let plantsNeedingLess = [];
    let plantsPerfect = [];

    // Considera solo le piante nel "Mio Giardino" per il feedback personalizzato
    myGarden.forEach(plant => {
        const idealMin = plant.idealLuxMin;
        const idealMax = plant.idealLuxMax;

        if (idealMin === null || idealMax === null || isNaN(idealMin) || isNaN(idealMax)) {
            // Se i valori ideali non sono impostati, non possiamo dare un feedback specifico
            return; 
        }

        if (currentLux < idealMin) {
            plantsNeedingMore.push(plant);
        } else if (currentLux > idealMax) {
            plantsNeedingLess.push(plant);
        } else {
            plantsPerfect.push(plant);
        }
    });

    if (plantsPerfect.length > 0) {
        const perfectDiv = document.createElement('div');
        perfectDiv.innerHTML = `<h4><i class="fas fa-check-circle" style="color: green;"></i> Lux Ottimale per:</h4>`;
        plantsPerfect.forEach(plant => {
            perfectDiv.innerHTML += `<p>${plant.name}</p>`;
        });
        luxFeedbackPlantsContainer.appendChild(perfectDiv);
    }

    if (plantsNeedingMore.length > 0) {
        const moreDiv = document.createElement('div');
        moreDiv.innerHTML = `<h4><i class="fas fa-sun" style="color: orange;"></i> Necessitano più luce:</h4>`;
        plantsNeedingMore.forEach(plant => {
            moreDiv.innerHTML += `<p>${plant.name} (min: ${plant.idealLuxMin} lux)</p>`;
        });
        luxFeedbackPlantsContainer.appendChild(moreDiv);
    }

    if (plantsNeedingLess.length > 0) {
        const lessDiv = document.createElement('div');
        lessDiv.innerHTML = `<h4><i class="fas fa-cloud" style="color: blue;"></i> Necessitano meno luce:</h4>`;
        plantsNeedingLess.forEach(plant => {
            lessDiv.innerHTML += `<p>${plant.name} (max: ${plant.idealLuxMax} lux)</p>`;
        });
        luxFeedbackPlantsContainer.appendChild(lessDiv);
    }

    if (plantsPerfect.length === 0 && plantsNeedingMore.length === 0 && plantsNeedingLess.length === 0) {
        luxFeedbackPlantsContainer.innerHTML = '<p>Nessun dato ideale Lux impostato per le piante nel tuo giardino o non hai piante nel giardino.</p>';
    }
}

function clearLightFeedbackDisplay() {
    if (luxFeedbackPlantsContainer) {
        luxFeedbackPlantsContainer.innerHTML = '<p>Nessun feedback Lux attivo.</p>';
    }
}


// --- Funzioni per il Clima Esterno (Open-Meteo) ---

async function getClientLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                error => {
                    console.error("Errore geolocalizzazione:", error);
                    showToast(`Errore geolocalizzazione: ${error.message}`, 'error');
                    reject(error);
                }
            );
        } else {
            const error = new Error('Geolocalizzazione non supportata dal browser.');
            showToast(error.message, 'error');
            reject(error);
        }
    });
}

async function getPlaceName(latitude, longitude) {
    // Usiamo OpenStreetMap Nominatim per la geocodifica inversa
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=<span class="math-inline">\{latitude\}&lon\=</span>{longitude}&zoom=10&addressdetails=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || '';
            const country = data.address.country || '';
            return `${city}, ${country}`;
        }
        return 'Località sconosciuta';
    } catch (error) {
        console.error('Errore nel recupero del nome del luogo:', error);
        return 'Località sconosciuta';
    }
}


async function getWeather() {
    showLoadingSpinner();
    try {
        const location = await getClientLocation();
        const { latitude, longitude } = location;

        const placeName = await getPlaceName(latitude, longitude);
        if (locationNameSpan) locationNameSpan.textContent = placeName;

        const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=<span class="math-inline">\{latitude\}&longitude\=</span>{longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
        const response = await fetch(weatherApiUrl);
        const data = await response.json();

        if (data.current_weather) {
            const { temperature, windspeed, weathercode, time } = data.current_weather;
            
            // Trova l'umidità e la descrizione del tempo dall'array orario
            const hourlyIndex = data.hourly.time.findIndex(t => new Date(t).getHours() === new Date(time).getHours());
            const humidity = hourlyIndex !== -1 ? data.hourly.relative_humidity_2m[hourlyIndex] : 'N/D';

            const weatherDescription = getWeatherDescription(weathercode);

            if (currentTempSpan) currentTempSpan.textContent = `${temperature}°C`;
            if (weatherDescriptionSpan) weatherDescriptionSpan.textContent = weatherDescription;
            if (humiditySpan) humiditySpan.textContent = `${humidity}%`;
            if (windSpeedSpan) windSpeedSpan.textContent = `${windspeed} km/h`;
            if (lastUpdatedSpan) lastUpdatedSpan.textContent = new Date(time).toLocaleTimeString();
            showToast('Dati meteo aggiornati!', 'success');
        } else {
            showToast('Dati meteo non disponibili per la tua posizione.', 'info');
        }
    } catch (error) {
        console.error("Errore nel recupero dei dati meteo:", error);
        showToast(`Errore nel recupero meteo: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

function getWeatherDescription(code) {
    // Codici meteo di Open-Meteo (WMO Weather interpretation codes)
    switch (code) {
        case 0: return 'Cielo sereno';
        case 1: return 'Prevalentemente sereno';
        case 2: return 'Parzialmente nuvoloso';
        case 3: return 'Coperto';
        case 45: return 'Nebbia';
        case 48: return 'Nebbia depositante brina';
        case 51: return 'Pioggerella leggera';
        case 53: return 'Pioggerella moderata';
        case 55: return 'Pioggerella intensa';
        case 56: return 'Pioggerella gelida leggera';
        case 57: return 'Pioggerella gelida intensa';
        case 61: return 'Pioggia leggera';
        case 63: return 'Pioggia moderata';
        case 65: return 'Pioggia intensa';
        case 66: return 'Pioggia gelida leggera';
        case 67: return 'Pioggia gelida intensa';
        case 71: return 'Nevicata leggera';
        case 73: return 'Nevicata moderata';
        case 75: return 'Nevicata intensa';
        case 77: return 'Grandinata';
        case 80: return 'Rovesci leggeri';
        case 81: return 'Rovesci moderati';
        case 82: return 'Rovesci violenti';
        case 85: return 'Rovesci di neve leggeri';
        case 86: return 'Rovesci di neve intensi';
        case 95: return 'Temporale leggero o moderato';
        case 96: return 'Temporale con grandine leggera';
        case 99: return 'Temporale con grandine intensa';
        default: return 'Condizioni sconosciute';
    }
}

// --- Funzioni per Google Lens (Placeholder) ---
function launchGoogleLens() {
    showToast('Funzionalità Google Lens non ancora implementata. Riprova più tardi!', 'info', 4000);
    // Qui andrebbe l'integrazione con l'API di Google Lens o la WebView per aprirla.
    // Esempio (richiederebbe configurazioni aggiuntive e non è un link diretto):
    // window.open('https://lens.google.com/', '_blank'); 
}


// --- Funzioni per Cropper.js ---

// Gestore del cambio file nell'input di tipo 'file'
function handleImageSelect(event) {
    currentFile = event.target.files[0];
    if (currentFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (imageToCrop) {
                imageToCrop.src = e.target.result;
                if (cropImageModal) cropImageModal.style.display = 'flex'; // Mostra la modale di ritaglio
                initCropper(e.target.result); // Inizializza Cropper con l'immagine selezionata
            }
        };
        reader.readAsDataURL(currentFile);
    }
}

function initCropper(imageSrc) {
    if (currentCropper) {
        currentCropper.destroy(); // Distruggi l'istanza precedente se esiste
    }
    if (imageToCrop) {
        imageToCrop.src = imageSrc; // Imposta la sorgente dell'immagine
        currentCropper = new Cropper(imageToCrop, {
            aspectRatio: 1, // Imposta un rapporto di aspetto 1:1 (quadrato)
            viewMode: 1, // Non permette all'area di taglio di essere più piccola del canvas
            autoCropArea: 0.8, // Area di ritaglio iniziale (80% dell'immagine)
            background: false, // Nasconde lo sfondo a scacchiera
            movable: true,
            zoomable: true,
            rotatable: true,
            scalable: true,
        });
    }
}

function cropAndSaveImage() {
    if (currentCropper) {
        // Ottieni l'immagine ritagliata come un blob (file)
        currentCropper.getCroppedCanvas({
            width: 400, // Larghezza desiderata per l'immagine finale
            height: 400, // Altezza desiderata per l'immagine finale
        }).toBlob((blob) => {
            croppedImageBlob = blob; // Salva il blob per l'upload successivo
            if (plantImagePreview) {
                plantImagePreview.src = URL.createObjectURL(blob); // Mostra l'anteprima del ritaglio
                plantImagePreview.style.display = 'block';
            }
            if (cropImageModal) cropImageModal.style.display = 'none'; // Chiudi la modale di ritaglio
            showToast('Immagine ritagliata con successo!', 'success');
        }, 'image/jpeg', 0.9); // Formato JPEG con qualità 90%
    } else {
        showToast('Nessuna immagine da ritagliare.', 'error');
    }
}

// Funzioni per controllare Cropper
function cropperRotateLeft() {
    if (currentCropper) currentCropper.rotate(-90);
}

function cropperRotateRight() {
    if (currentCropper) currentCropper.rotate(90);
}

function cropperZoomIn() {
    if (currentCropper) currentCropper.zoom(0.1);
}

function cropperZoomOut() {
    if (currentCropper) currentCropper.zoom(-0.1);
}

// Funzione per lo zoom della singola immagine
function zoomImage(imageUrl) {
    if (imageZoomDisplay) {
        imageZoomDisplay.src = imageUrl;
    }
    if (imageZoomModal) {
        imageZoomModal.style.display = 'flex';
    }
}


// --- DOMContentLoaded e Inizializzazione ---
document.addEventListener('DOMContentLoaded', () => {
    // Inizializzazione variabili DOM
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
    currentLuxValueSpan = document.getElementById('current-lux-value');
    lightFeedbackDiv = document.getElementById('light-feedback');
    manualLuxInputDiv = document.getElementById('manual-lux-input-group'); // Corretto ID
    manualLuxInput = document.getElementById('manual-lux-input'); // Nuovo per l'input
    applyManualLuxButton = document.getElementById('apply-manual-lux'); // Nuovo per il bottone
    currentLuxDisplay = document.getElementById('current-lux-value');
    luxFeedbackPlantsContainer = document.getElementById('lux-feedback-plants-container'); // Nuovo contenitore
    clearLightFeedbackButton = document.getElementById('clear-light-feedback');


    tempMinFilter = document.getElementById('temp-min-filter');
    tempMaxFilter = document.getElementById('temp-max-filter');
    sortBySelect = document.getElementById('sort-by-select'); // Inizializza il selettore di ordinamento

    plantModal = document.getElementById('plantModal');
    plantForm = document.getElementById('plantForm');
    closePlantModalButton = document.getElementById('closePlantModalButton');
    plantNameInput = document.getElementById('plant-name');
    plantCategorySelect = document.getElementById('plant-category');
    sunLightSelect = document.getElementById('plant-sunlight');
    plantDescriptionTextarea = document.getElementById('plant-description');
    plantTempMinInput = document.getElementById('plant-temp-min');
    plantTempMaxInput = document.getElementById('plant-temp-max');
    plantWateringInput = document.getElementById('plant-watering');
    plantIdealLuxMinInput = document.getElementById('plant-ideal-lux-min');
    plantIdealLuxMaxInput = document.getElementById('plant-ideal-lux-max');
    plantImageInput = document.getElementById('plant-image');
    plantImagePreview = document.getElementById('plant-image-preview');
    saveUpdatePlantButton = document.getElementById('save-update-plant-button');
    cancelUpdatePlantButton = document.getElementById('cancel-update-plant-button');
    deletePlantButton = document.getElementById('delete-plant-button');
    plantModalTitle = document.getElementById('plantModalTitle'); // Inizializza il titolo della modale

    cardModal = document.getElementById('cardModal');
    // closeCardModalButton = document.getElementById('cardModalCloseButton'); // Non più usato così direttamente
    zoomedCardContent = document.getElementById('zoomedCardContent');

    getClimateButton = document.getElementById('get-climate-button');
    locationNameSpan = document.getElementById('location-name');
    currentTempSpan = document.getElementById('current-temp');
    weatherDescriptionSpan = document.getElementById('weather-description');
    humiditySpan = document.getElementById('humidity');
    windSpeedSpan = document.getElementById('wind-speed');
    lastUpdatedSpan = document.getElementById('last-updated');

    sunLightFilter = document.getElementById('sun-light-filter'); // Inizializza il filtro esposizione solare

    googleLensButton = document.getElementById('google-lens-button'); // Inizializza il bottone Google Lens

    // Variabili per Cropper.js
    cropImageModal = document.getElementById('cropImageModal');
    closeCropImageModalButton = document.getElementById('closeCropImageModalButton');
    imageToCrop = document.getElementById('imageToCrop');
    cropButton = document.getElementById('cropButton');
    rotateLeftButton = document.getElementById('rotateLeft');
    rotateRightButton = document.getElementById('rotateRight');
    zoomInButton = document.getElementById('zoomIn');
    zoomOutButton = document.getElementById('zoomOut');

    // Variabili per Image Zoom
    imageZoomModal = document.getElementById('imageZoomModal');
    imageZoomDisplay = document.getElementById('imageZoomDisplay'); // L'elemento img nella modale di zoom
    closeImageZoomModalButton = document.getElementById('closeImageZoomModalButton');

    loginForm = document.getElementById('login-form');
    registerForm = document.getElementById('register-form');
    loadingSpinner = document.getElementById('loading-spinner'); // Inizializza lo spinner


    // Event Listeners Principali
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', () => {
        currentPlantIdToUpdate = null; // Resetta l'ID per l'aggiunta di una nuova pianta
        if (plantForm) plantForm.reset(); // Resetta il form
        if (plantImagePreview) {
            plantImagePreview.style.display = 'none'; // Nascondi l'anteprima
            plantImagePreview.src = '#'; // Pulisci la sorgente
        }
        croppedImageBlob = null; // Resetta il blob
        currentFile = null; // Resetta il file originale
        if (plantModalTitle) plantModalTitle.textContent = 'Aggiungi Nuova Pianta'; // Imposta il titolo
        if (saveUpdatePlantButton) saveUpdatePlantButton.textContent = 'Salva Pianta';
        if (deletePlantButton) deletePlantButton.style.display = 'none'; // Nascondi il bottone elimina
        if (plantModal) plantModal.style.display = 'flex';
    });
    if (closePlantModalButton) closePlantModalButton.addEventListener('click', () => {
        if (plantModal) plantModal.style.display = 'none';
        if (currentCropper) {
            currentCropper.destroy(); // Distruggi l'istanza di Cropper
            currentCropper = null;
        }
    });

    if (plantForm) plantForm.addEventListener('submit', savePlantToFirestore);
    if (cancelUpdatePlantButton) cancelUpdatePlantButton.addEventListener('click', () => {
        if (plantModal) plantModal.style.display = 'none';
        if (currentCropper) {
            currentCropper.destroy(); // Distruggi l'istanza di Cropper
            currentCropper = null;
        }
    });

    if (plantImageInput) plantImageInput.addEventListener('change', handleImageSelect);
    if (cropButton) cropButton.addEventListener('click', cropAndSaveImage);
    if (closeCropImageModalButton) closeCropImageModalButton.addEventListener('click', () => {
        if (cropImageModal) cropImageModal.style.display = 'none';
        if (currentCropper) {
            currentCropper.destroy();
            currentCropper = null;
        }
    });

    if (rotateLeftButton) rotateLeftButton.addEventListener('click', cropperRotateLeft);
    if (rotateRightButton) rotateRightButton.addEventListener('click', cropperRotateRight);
    if (zoomInButton) zoomInButton.addEventListener('click', cropperZoomIn);
    if (zoomOutButton) zoomOutButton.addEventListener('click', cropperZoomOut);

    // Event listener per la chiusura della modale di zoom immagine
    if (closeImageZoomModalButton) closeImageZoomModalButton.addEventListener('click', () => {
        if (imageZoomModal) imageZoomModal.style.display = 'none';
        if (imageZoomDisplay) imageZoomDisplay.src = ''; // Pulisci l'immagine
    });


    // Event listener per la chiusura delle modali cliccando fuori dal contenuto
    if (plantModal) plantModal.addEventListener('click', (e) => {
        if (e.target === plantModal) {
            plantModal.style.display = 'none';
            if (currentCropper) {
                currentCropper.destroy();
                currentCropper = null;
            }
        }
    });

    // Event delegation per cardModalCloseButton
    if (cardModal) {
        cardModal.addEventListener('click', (e) => {
            // Se cliccato sul bottone di chiusura o fuori dal contenuto
            if (e.target.classList.contains('modal-close-button') || e.target === cardModal) {
                closeCardModal();
            }
        });
    }

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
    if (getClimateButton) getClimateButton.addEventListener('click', getWeather);


    // Event Listeners per i filtri e l'ordinamento
    if (searchInput) searchInput.addEventListener('input', applyFiltersAndSort);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFiltersAndSort);
    if (tempMinFilter) tempMinFilter.addEventListener('input', applyFiltersAndSort);
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', applyFiltersAndSort);
    if (sortBySelect) { // Aggiungi il listener per l'ordinamento
        sortBySelect.addEventListener('change', (e) => {
            currentSortBy = e.target.value; // Aggiorna la variabile globale di ordinamento
            applyFiltersAndSort();
        });
    }

    // Bottoni per mostrare Tutte le Piante / Il Mio Giardino
    if (showAllPlantsButton) showAllPlantsButton.addEventListener('click', displayAllPlants);
    if (showMyGardenButton) showMyGardenButton.addEventListener('click', displayMyGarden);

    // Chiamata iniziale per impostare lo stato di autenticazione e caricare i dati
    setupAuthListeners();
});

// Aggiungi un listener per gestire i clic sulle immagini delle card per lo zoom
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('plant-image') && e.target.closest('.plant-card')) {
        zoomImage(e.target.src);
    }
});
