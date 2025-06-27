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
let manualLuxInputDiv; // Nuovo: div per input manuale lux

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
let plantsunLight
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
let sunLightFilter
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

// Funzioni di utilità per spinner e toast
function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'flex';
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
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
    cardModal.style.display = 'none';
    zoomedCardContent.innerHTML = ''; // Pulisci il contenuto
    
}


// --- Funzioni di Autenticazione ---
// ... (il tuo codice di autenticazione rimane invariato)
function setupAuthListeners() {
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

   
// --- Funzioni di Interazione con Firestore e Storage ---

async function uploadImage(file) {
    if (!file) return null;

    const storageRef = storage.ref();
    const fileName = `plant_images/${Date.now()}_${file.name}`; // Nome unico per l'immagine
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
        plantNameInput.value = plantToEdit.name || '';
        plantCategorySelect.value = plantToEdit.category || '';
        sunLightSelect.value = plantToEdit.sunlight || '';
        plantDescriptionTextarea.value = plantToEdit.description || '';
        plantTempMinInput.value = plantToEdit.tempMin || '';
        plantTempMaxInput.value = plantToEdit.tempMax || '';
        plantWateringInput.value = plantToEdit.watering || '';
        plantIdealLuxMinInput.value = plantToEdit.idealLuxMin || '';
        plantIdealLuxMaxInput.value = plantToEdit.idealLuxMax || '';
        // Mostra l'anteprima dell'immagine esistente
        if (plantToEdit.imageUrl) {
            plantImagePreview.src = plantToEdit.imageUrl;
            plantImagePreview.style.display = 'block';
        } else {
            plantImagePreview.style.display = 'none';
            plantImagePreview.src = '#';
        }
        if (plantModalTitle) {
            plantModalTitle.textContent = 'Modifica Pianta'; // Cambia il titolo
        }
        
        saveUpdatePlantButton.textContent = 'Aggiorna Pianta';
        deletePlantButton.style.display = 'inline-block'; // Mostra il bottone elimina
        plantModal.style.display = 'flex';
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

    // --- CORREZIONE FONDAMENTALE 2: Logica per caricare e salvare l'immagine utente specifica ---
    let imageUrlForGarden = '';
    if (croppedImageBlob) { // Se l'utente ha ritagliato una nuova immagine (il blob dell'immagine reale)
        try {
            // Questa funzione carica l'immagine su Firebase Storage e restituisce il suo URL
            imageUrlForGarden = await uploadImage(croppedImageBlob, plantToAddOriginal.name); // Ho corretto qui uploadImage
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
    showLoadingSpinner();

    // ********* CORREZIONE QUI *********
    // Assicurati che 'currentUser' sia la variabile globale correttamente aggiornata
    const user = currentUser; 
    // **********************************

    if (!user) {
        showToast('Devi essere autenticato per rimuovere piante dal tuo giardino.', 'error');
        hideLoadingSpinner();
        return;
    }

    try {
        // Il percorso deve usare user.uid correttamente
        const docRef = db.collection('users').doc(user.uid).collection('gardens').doc(plantId);
        await docRef.delete(); // <-- Questa è la riga che dà errore (app.js:524)

        showToast('Pianta rimossa dal tuo giardino!', 'success');
        loadMyGarden(); // Ricarica il giardino dopo la rimozione
    } catch (error) {
        console.error("Errore nella rimozione dal giardino:", error); // Qui è la riga 524
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
        plantsToDisplay = plantsToDisplay.filter(plant => plant.sunlight === selectedSunLight); // Corretto da sunExposure a sunlight
    }

    // Filtro di ricerca
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        plantsToDisplay = plantsToDisplay.filter(plant =>
            plant.name.toLowerCase().includes(searchTerm) ||
            (plant.description && plant.description.toLowerCase().includes(searchTerm))
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
                // *** CORREZIONE PER L'ERRORE 'localeCompare' ***
                const nameADesc = a.name ? a.name.toLowerCase() : '';
                const nameBDesc = b.name ? b.name.toLowerCase() : '';
                return nameBDesc.localeCompare(nameADesc);
            case 'category_asc':
                // *** CORREZIONE SIMILE SE ORDINI PER CATEGORIA ***
                const categoryA = a.category ? a.category.toLowerCase() : '';
                const categoryB = b.category ? b.category.toLowerCase() : '';
                return categoryA.localeCompare(categoryB);
            case 'category_desc':
                 const categoryADesc = a.category ? a.category.toLowerCase() : '';
                 const categoryBDesc = b.category ? b.category.toLowerCase() : '';
                 return categoryBDesc.localeCompare(categoryADesc);
            case 'date_added_asc':
                // Assumi che 'addedAt' sia un Timestamp di Firebase o un Date object
                const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : a.createdAt) : new Date(0); // Gestisce Firebase Timestamp (usato createdAt)
                const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : b.createdAt) : new Date(0);
                return dateA.getTime() - dateB.getTime();
            case 'date_added_desc':
                const dateADesc = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : a.createdAt) : new Date(0);
                const dateBDesc = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : b.createdAt) : new Date(0);
                return dateBDesc.getTime() - dateADesc.getTime();
            default:
                // Ordinamento predefinito se nessuna opzione corrisponde
                const defaultNameA = a.name ? a.name.toLowerCase() : '';
                const defaultNameB = b.name ? b.name.toLowerCase() : '';
                return defaultNameA.localeCompare(defaultNameB);
        }
    });

    // Infine, visualizza le piante filtrate e ordinate
    displayPlants(plantsToDisplay);
}

function displayAllPlants() {
    isMyGardenCurrentlyVisible = false;
    plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
    gardenContainer.style.display = 'flex'; // Mostra il contenitore delle piante globali
    myGardenContainer.style.display = 'none'; // Nasconde il contenitore del giardino
    applyFiltersAndSort(); // Applica filtri e ordinamento
}

async function displayMyGarden() {
    isMyGardenCurrentlyVisible = true;
    plantsSectionHeader.textContent = 'Le Tue Piante in Giardino';
    gardenContainer.style.display = 'none'; // Nasconde il contenitore delle piante globali
    myGardenContainer.style.display = 'flex'; // Mostra il contenitore del giardino

    await loadMyGarden(); // Prima carica i dati aggiornati
    applyFiltersAndSort(); // Poi visualizza i dati caricati (con filtri e ordinamento)
}

function displayPlants(plantsToDisplay) {
    const container = isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer;

    if (!container) {
        console.error("Contenitore piante non trovato!");
        return;
    }

    container.innerHTML = ''; // Pulisce il contenitore

    if (plantsToDisplay.length === 0) {
        const messageTemplate = document.getElementById('emptyGardenMessage');
        const emptyMessageClone = messageTemplate.content.cloneNode(true);
        if (!isMyGardenCurrentlyVisible) { // Se è la vista "Tutte le Piante"
            emptyMessageClone.querySelector('p').textContent = 'Nessuna pianta trovata con i filtri applicati.';
            emptyMessageClone.querySelector('p:nth-child(2)').textContent = 'Prova a modificare i criteri di ricerca.';
            const iconElement = emptyMessageClone.querySelector('.empty-message p:first-child i'); 
            if (iconElement) {
                iconElement.className = 'fas fa-search-minus';
            } else {
                console.warn("Elemento icona <i> non trovato nel template 'emptyGardenMessage'. Impossibile impostare la classe.");
            }
        }
        container.appendChild(emptyMessageClone);
        return;
    }

    plantsToDisplay.forEach(plant => {
        let imageUrlToDisplay;

        if (isMyGardenCurrentlyVisible) {
            imageUrlToDisplay = plant.imageUrl || categoryIcons[plant.category] || categoryIcons['Altro'];
        } else {
            imageUrlToDisplay = categoryIcons[plant.category] || categoryIcons['Altro'];
        }

        const plantCard = document.createElement('div');
        plantCard.className = 'plant-card';
        plantCard.dataset.id = plant.id;

        // Crea l'elemento immagine separatamente per attaccare l'event listener
        const plantImageElement = document.createElement('img');
        plantImageElement.src = imageUrlToDisplay;
        plantImageElement.alt = plant.name;
        plantImageElement.classList.add('plant-image'); // Applica la classe CSS

        // Aggiungi l'event listener per lo zoom dell'immagine
        plantImageElement.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita che il click sull'immagine attivi anche il click sulla card intera
            console.log("Tentativo di aprire zoom immagine. URL:", plantImageElement.src); 
            openImageZoomModal(plantImageElement.src); // Passa l'URL dell'immagine alla funzione di zoom
        });

        // Aggiungi l'immagine alla card
        plantCard.appendChild(plantImageElement);

        // Aggiungi il resto del contenuto della card come HTML interno
        // Ho corretto qui la riga della "Luce"
        plantCard.innerHTML += `
            <h3>${plant.name}</h3>
            <p><strong>Categoria:</strong> ${plant.category}</p>
            <p><strong>Esposizione Solare:</strong> ${plant.sunlight || 'N/A'}</p>
            <p><strong>Temperatura:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
            <p><strong>Luce:</strong> ${plant.idealLuxMin !== null && plant.idealLuxMax !== null ? `${plant.idealLuxMin} - ${plant.idealLuxMax} Lux` : 'N/A'}</p>
            <div class="card-actions">
                ${isMyGardenCurrentlyVisible ? `<button class="btn btn-edit" data-id="${plant.id}"><i class="fas fa-edit"></i> Modifica</button>` : ''}
                ${isMyGardenCurrentlyVisible ? `<button class="btn btn-remove" data-id="${plant.id}"><i class="fas fa-minus-circle"></i> Rimuovi dal Giardino</button>` : `<button class="btn btn-add" data-id="${plant.id}"><i class="fas fa-plus-circle"></i> Aggiungi al Giardino</button>`}
            </div>
        `;

        // Listener per la modale di dettaglio della card (click sulla card, ma non sull'immagine o sui bottoni)
        plantCard.addEventListener('click', (e) => {
            // Assicurati che il click non sia sull'immagine (gestita da plantImageElement) o su un bottone di azione
            if (!e.target.closest('.plant-image') && !e.target.closest('.card-actions button')) {
                showPlantDetailsModal(plant.id);
            }
        });

        container.appendChild(plantCard);

        // Aggiungi listener per i bottoni "Modifica", "Rimuovi" e "Aggiungi" (dopo che innerHTML è stato impostato)
        if (isMyGardenCurrentlyVisible) {
            const editButton = plantCard.querySelector('.btn-edit');
            if (editButton) {
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Evita che il click si propaghi alla card intera
                    editPlant(e.target.dataset.id);
                });
            }
            const removeButton = plantCard.querySelector('.btn-remove');
            if (removeButton) {
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removePlantFromMyGarden(e.target.dataset.id);
                });
            }
        } else {
            const addButton = plantCard.querySelector('.btn-add');
            if (addButton) {
                addButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    addPlantToMyGarden(e.target.dataset.id);
                });
            }
        }
    });
}

// Funzione per mostrare i dettagli della pianta nella modale di zoom
function showPlantDetailsModal(plantId) {
    const plant = allPlants.find(p => p.id === plantId);
    if (plant) {
        zoomedCardContent.innerHTML = ''; // Pulisci il contenuto precedente

        // Gestione dell'immagine nella modale di dettaglio
        let detailsImageUrl;
        if (plant.imageUrl && isMyGardenCurrentlyVisible) {
            // Se in "Mio Giardino" e c'è un'immagine utente, usala
            detailsImageUrl = plant.imageUrl;
        } else {
            // Altrimenti, usa l'icona generica della categoria
            detailsImageUrl = categoryIcons[plant.category] || categoryIcons['Altro'];
        }
       

        const detailsHtml = `
            <h2>${plant.name}</h2>
            <img id="zoomed-plant-image-display" src="${detailsImageUrl}" alt="Immagine di ${plant.name}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
            <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
            <p><strong>Descrizione:</strong> ${plant.description || 'N/A'}</p>
            <p><strong>Temperatura:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
            <p><strong>Luce (Lux):</strong> ${plant.idealLuxMin !== null && plant.idealLuxMax !== null ? `${plant.idealLuxMin} - ${plant.idealLuxMax} Lux` : 'N/A'}</p>
            <p><strong>Annaffiatura:</strong> ${plant.watering || 'N/A'}</p>
            <p><strong>Aggiunta il:</strong> ${plant.createdAt ? new Date(plant.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
            ${plant.updatedAt ? `<p><strong>Ultimo aggiornamento:</strong> ${new Date(plant.updatedAt.toDate()).toLocaleDateString()}</p>` : ''}
        `;
        zoomedCardContent.innerHTML = detailsHtml;
        cardModal.style.display = 'flex';
    }
}

// Funzione per aprire la modale di zoom immagine
function openImageZoomModal(imageUrl) {
    if (imageZoomDisplay) { // Controlla se l'elemento immagine della modale di zoom esiste
        imageZoomDisplay.src = imageUrl; // Imposta l'URL dell'immagine da visualizzare
        imageZoomModal.style.display = 'flex'; // Mostra la modale di zoom (usa 'flex' per centrare l'immagine)
    } else {
        console.error("Elemento 'imageZoomDisplay' non trovato. Assicurati che l'ID sia corretto nell'HTML.");
        showToast("Impossibile caricare l'immagine zoom.", 'error');
    }
}

// --- Funzioni Sensore Luce ---

// Funzione per controllare la disponibilità del sensore e mostrare input manuale
function checkLightSensorAvailability() {
    if ('AmbientLightSensor' in window) {
        console.log('Sensore di luce ambientale disponibile.');
        startLightSensorButton.style.display = 'inline-block';
        stopLightSensorButton.style.display = 'inline-block';
        manualLuxInputDiv.style.display = 'none'; // Nasconde l'input manuale se il sensore è disponibile
    } else {
        console.log('Sensore di luce ambientale NON disponibile. Passaggio a input manuale.');
        showToast('Sensore luce non disponibile. Inserisci i valori manualmente.', 'info', 5000);
        startLightSensorButton.style.display = 'none';
        stopLightSensorButton.style.display = 'none';
        manualLuxInputDiv.style.display = 'block'; // Mostra l'input manuale
    }
}

function startLightSensor() {
    if (!('AmbientLightSensor' in window)) {
        showToast('Sensore luce non disponibile su questo dispositivo.', 'error');
        return;
    }

    if (ambientLightSensor && ambientLightSensor.state === 'activated') {
        showToast('Sensore già attivo.', 'info');
        return;
    }

    try {
        ambientLightSensor = new AmbientLightSensor();
        ambientLightSensor.onreading = () => {
            const lux = ambientLightSensor.illuminance;
            currentLuxValueSpan.textContent = lux.toFixed(2);
            updateLightFeedback(lux);
            // Mostra il pulsante "Azzera Feedback Lux" quando il sensore è attivo
            if (clearLightFeedbackButton) {
                clearLightFeedbackButton.style.display = 'inline-block'; 
            }
        };
        ambientLightSensor.onerror = (event) => {
            console.error("Errore sensore luce:", event.error.name, event.error.message);
            showToast(`Errore sensore luce: ${event.error.message}`, 'error', 5000);
            stopLightSensor(); // Ferma il sensore in caso di errore
            checkLightSensorAvailability();
        };
        ambientLightSensor.start();
        showToast('Sensore luce avviato!', 'success');
        console.log('Sensore luce avviato.');
    } catch (error) {
        console.error("Errore nell'avvio del sensore luce:", error);
        showToast(`Errore nell'avvio del sensore luce: ${error.message}`, 'error', 5000);
        checkLightSensorAvailability();
    }
}

function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        showToast('Sensore luce fermato.', 'info');
        console.log('Sensore luce fermato.');
        currentLuxValueSpan.textContent = 'N/A';
        // Chiama la nuova funzione per pulire il feedback
        clearLightFeedbackDisplay(); 
    } else {
        showToast('Sensore non attivo.', 'info');
    }
}

function updateLightFeedback(lux) {
    let generalFeedback = ''; // Feedback generale sull'ambiente
    if (lux < 50) {
        generalFeedback = 'Luce ambientale: molto bassa - ambiente buio.';
    } else if (lux < 200) {
        generalFeedback = 'Luce ambientale: bassa - adatto a piante d\'ombra profonda.';
    } else if (lux < 1000) {
        generalFeedback = 'Luce ambientale: media - ideale per piante d\'ombra o mezz\'ombra.';
    } else if (lux < 5000) {
        generalFeedback = 'Luce ambientale: buona - adatto a piante che amano la luce indiretta.';
    } else if (lux < 10000) {
        generalFeedback = 'Luce ambientale: alta - ideale per piante da pieno sole.';
    } else {
        generalFeedback = 'Luce ambientale: molto alta - ottimo per piante che amano il sole intenso.';
    }

    // Inizializza il contenuto del div feedback con il feedback generale
    lightFeedbackDiv.innerHTML = `<p>${generalFeedback}</p><hr>`;

    // Se ci sono piante nel mio giardino, fornisci feedback specifico per ciascuna
    if (myGarden && myGarden.length > 0) {
        lightFeedbackDiv.innerHTML += `<h4>Feedback per le piante nel tuo giardino:</h4>`;
        myGarden.forEach(plant => {
            const minLux = plant.idealLuxMin;
            const maxLux = plant.idealLuxMax;
            let plantSpecificHtml = `<p><strong>${plant.name}:</strong> `; // Definizione chiara di plantSpecificHtml

            if (minLux === undefined || maxLux === undefined || minLux === null || maxLux === null) {
                plantSpecificHtml += `Dati Lux ideali non disponibili.`;
            } else if (lux >= minLux && lux <= maxLux) {
                plantSpecificHtml += `Condizioni di luce **Ideali** (${minLux}-${maxLux} Lux). <span style="color: #28a745;">&#10003;</span>`; // Checkmark verde
            } else if (lux < minLux) {
                plantSpecificHtml += `Luce **troppo bassa** (${lux.toFixed(0)} Lux), richiede almeno ${minLux} Lux. <span style="color: #dc3545;">&#10060;</span>`; // Cross mark rosso
            } else { // lux > maxLux
                plantSpecificHtml += `Luce **troppo alta** (${lux.toFixed(0)} Lux), richiede al massimo ${maxLux} Lux. <span style="color: #dc3545;">&#10060;</span>`; // Cross mark rosso
            }
            plantSpecificHtml += `</p>`;
            lightFeedbackDiv.innerHTML += plantSpecificHtml; // Utilizza plantSpecificHtml
        });
    } else {
        lightFeedbackDiv.innerHTML += `<p>Nessuna pianta nel tuo giardino per un feedback specifico.</p>`;
    }

    // Mostra il pulsante "Azzera Feedback Lux" quando il feedback viene aggiornato
    if (clearLightFeedbackButton) {
        clearLightFeedbackButton.style.display = 'inline-block';
    }
}
function applyManualLux() {
    const manualLux = parseFloat(manualLuxInput.value);
    if (!isNaN(manualLux) && manualLux >= 0) {
        currentLuxValueSpan.textContent = manualLux.toFixed(2);
        updateLightFeedback(manualLux);
         // Mostra il pulsante "Azzera Feedback Lux" quando il valore manuale viene applicato
         if (clearLightFeedbackButton) {
            clearLightFeedbackButton.style.display = 'inline-block';
        }
    } else {
        showToast('Inserisci un valore Lux valido (numerico e non negativo).', 'error');
    }
}

function clearLightFeedbackDisplay() {
    lightFeedbackDiv.innerHTML = '<p>Nessun feedback luce attivo.</p>';
    if (clearLightFeedbackButton) {
        clearLightFeedbackButton.style.display = 'none'; // Nasconde il bottone
    }
}

// Funzione di placeholder per Google Lens
function launchGoogleLens() {
    showToast('Funzionalità Google Lens non ancora implementata.', 'info', 3000);
    // Qui andrebbe l'integrazione con l'API di Google Lens o un link diretto
    // per esempio, potresti aprire una nuova scheda con Google Immagini
    // window.open('https://images.google.com/searchbyimage?image_url=YOUR_IMAGE_URL_HERE', '_blank');
}


// Funzione per recuperare i dati climatici da OpenWeatherMap
async function getClimateData() {
    showLoadingSpinner();
    const apiKey = 'ec44122d26f63116df1cf64b81c20963'; // Sostituisci con la tua chiave API di OpenWeatherMap

    // Tenta di ottenere la posizione corrente dell'utente
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=it`;
            const reverseGeocodeApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=it`; // Per ottenere il nome della città

            try {
                // Chiamata per i dati climatici
                const weatherResponse = await fetch(weatherApiUrl);
                const weatherData = await weatherResponse.json();

                // Chiamata per il reverse geocoding (per il nome della città)
                const geocodeResponse = await fetch(reverseGeocodeApiUrl);
                const geocodeData = await geocodeResponse.json();
                
                if (weatherData.main && geocodeData.name) {
                    locationNameSpan.textContent = geocodeData.name;
                    currentTempSpan.textContent = `${weatherData.main.temp}°C`;
                    weatherDescriptionSpan.textContent = weatherData.weather[0].description;
                    humiditySpan.textContent = `${weatherData.main.humidity}%`;
                    windSpeedSpan.textContent = `${weatherData.wind.speed} m/s`;
                    lastUpdatedSpan.textContent = new Date(weatherData.dt * 1000).toLocaleTimeString();
                    showToast('Dati climatici aggiornati!', 'success');
                } else {
                    showToast('Impossibile ottenere i dati climatici per la tua posizione.', 'error');
                }
            } catch (error) {
                console.error("Errore nel recupero dati climatici:", error);
                showToast(`Errore nel recupero dati climatici: ${error.message}`, 'error');
            } finally {
                hideLoadingSpinner();
            }
        }, (error) => {
            console.error("Errore geolocalizzazione:", error);
            showToast('Impossibile accedere alla tua posizione per i dati climatici.', 'error', 5000);
            hideLoadingSpinner();
        });
    } else {
        showToast('Geolocalizzazione non supportata dal tuo browser.', 'error', 5000);
        hideLoadingSpinner();
    }
}


// --- Inizializzazione quando il DOM è completamente caricato ---
document.addEventListener('DOMContentLoaded', () => {
    // Inizializzazione variabili DOM
    loginForm = document.getElementById('login-form'); // Aggiungi questa riga
    registerForm = document.getElementById('register-form'); // Aggiungi questa riga
    gardenContainer = document.getElementById('garden-plants-container');
    myGardenContainer = document.getElementById('my-garden-plants-container');
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    loginButton = document.getElementById('loginButton');
    registerButton = document.getElementById('registerButton');
    showLoginLink = document.getElementById('showLoginLink');
    showRegisterLink = document.getElementById('showRegisterLink');
    emailInput = document.getElementById('login-email');
    passwordInput = document.getElementById('login-password');
    loginError = document.getElementById('login-error');
    registerEmailInput = document.getElementById('register-email');
    registerPasswordInput = document.getElementById('register-password');
    registerError = document.getElementById('registerError');
    authStatusSpan = document.getElementById('auth-status');
    logoutButton = document.getElementById('logoutButton');
    searchInput = document.getElementById('searchInput');
    categoryFilter = document.getElementById('categoryFilter');
    addNewPlantButton = document.getElementById('addNewPlantButton');
    showAllPlantsButton = document.getElementById('showAllPlantsButton');
    showMyGardenButton = document.getElementById('showMyGardenButton');
    plantsSectionHeader = document.getElementById('plantsSectionHeader');
    lightSensorContainer = document.getElementById('light-sensor-container');
    startLightSensorButton = document.getElementById('startLightSensorButton');
    stopLightSensorButton = document.getElementById('stopLightSensorButton');
    currentLuxValueSpan = document.getElementById('current-lux-value');
    lightFeedbackDiv = document.getElementById('lightfeedback');
    manualLuxInputDiv = document.getElementById('manual-lux-input-group'); // Inizializza il nuovo div
    applyManualLuxButton = document.getElementById('apply-manual-lux'); // Inizializza il nuovo bottone
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    sortBySelect = document.getElementById('sortBySelect');
    plantModal = document.getElementById('plant-modal');
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
    plantImageInput = document.getElementById('plantImageInput');
    plantImagePreview = document.getElementById('plantImagePreview');
    saveUpdatePlantButton = document.getElementById('save-update-plant-button');
    cancelUpdatePlantButton = document.getElementById('cancelUpdatePlantButton');
    deletePlantButton = document.getElementById('delete-plant-button');
    imageModal = document.getElementById('imageModal');
    closeImageModalButton = document.getElementById('closeImageModalButton');
    plantModalTitle = document.getElementById('plant-modal-title');
    cardModal = document.getElementById('card-modal');
    closeCardModalButton = document.getElementById('closeCardModalButton');
    zoomedCardContent = document.getElementById('zoomed-card-content');
    getClimateButton = document.getElementById('fetch-weather-button');
    locationNameSpan = document.getElementById('location-name');
    currentTempSpan = document.getElementById('current-temp');
    weatherDescriptionSpan = document.getElementById('weather-description');
    humiditySpan = document.getElementById('humidity');
    windSpeedSpan = document.getElementById('wind-speed');
    lastUpdatedSpan = document.getElementById('last-updated');
    googleLensButton = document.getElementById('googlelensbutton'); // Inizializza qui
    cropImageModal = document.getElementById('crop-image-modal');
    closeCropImageModalButton = document.getElementById('close-crop-image-modal');
    imageToCrop = document.getElementById('imageToCrop');
    cropButton = document.getElementById('cropButton');
    imageZoomModal = document.getElementById('imageZoomModal');
    closeImageZoomModalButton = document.getElementById('closeImageZoomModal');
    imageZoomDisplay = document.getElementById('imageZoomDisplay');

    rotateLeftButton = document.getElementById('rotateLeftButton');
    rotateRightButton = document.getElementById('rotateRightButton');
    zoomInButton = document.getElementById('zoomInButton');
    zoomOutButton = document.getElementById('zoomOutButton');
    manualLuxInput = document.getElementById('manualLuxInput');
    currentLuxDisplay = document.getElementById('current-lux-value');
    luxFeedbackPlantsContainer = document.getElementById('lux-feedback-plants-container');
    clearLightFeedbackButton = document.getElementById('clearlightfeedbackbutton'); // Inizializza il nuovo bottone
    sunLightFilter = document.getElementById('sun-light-filter');


    // Inizializzazione Firebase (assicurati che sia configurato nell'HTML prima di app.js)
    // Non è necessario inizializzare Firebase qui se lo fai già in index.html.
    // Basta fare riferimento alle variabili globali `auth`, `db`, `storage`.

    // Chiudi le modali cliccando fuori (migliorato)
    window.addEventListener('click', (e) => {
        if (e.target === plantModal) {
            plantModal.style.display = 'none';
            plantForm.reset(); // Resetta il form quando la modale è chiusa
            plantImagePreview.style.display = 'none'; // Nascondi l'anteprima
            plantImagePreview.src = '#'; // Pulisci la sorgente dell'immagine
            currentPlantIdToUpdate = null; // Resetta l'ID della pianta da aggiornare
            croppedImageBlob = null; // Resetta il blob dell'immagine ritagliata
            currentFile = null; // Resetta il file originale
            if (currentCropper) {
                currentCropper.destroy();
                currentCropper = null;
            }
        }
        if (e.target === cardModal) {
            closeCardModal();
        }
    });

    // Event Listeners per i bottoni principali
    addNewPlantButton.addEventListener('click', () => {
        currentPlantIdToUpdate = null; // Quando aggiungi una nuova pianta, azzera l'ID
        plantForm.reset();
        plantImagePreview.style.display = 'none';
        plantImagePreview.src = '#';
        if (plantModalTitle) {
            plantModalTitle.textContent = 'Aggiungi Nuova Pianta'; // Reimposta il titolo
        }
        saveUpdatePlantButton.textContent = 'Salva Pianta';
        deletePlantButton.style.display = 'none'; // Nascondi il bottone elimina per la nuova pianta
        plantModal.style.display = 'flex';
        croppedImageBlob = null; // Resetta il blob dell'immagine ritagliata
        currentFile = null; // Resetta il file originale
        if (currentCropper) {
            currentCropper.destroy();
            currentCropper = null;
        }
    });

    closePlantModalButton.addEventListener('click', () => {
        plantModal.style.display = 'none';
        plantForm.reset();
        plantImagePreview.style.display = 'none';
        plantImagePreview.src = '#';
        currentPlantIdToUpdate = null;
        croppedImageBlob = null;
        currentFile = null;
        if (currentCropper) {
            currentCropper.destroy();
            currentCropper = null;
        }
    });

    cancelUpdatePlantButton.addEventListener('click', () => {
        plantModal.style.display = 'none';
        plantForm.reset();
        plantImagePreview.style.display = 'none';
        plantImagePreview.src = '#';
        currentPlantIdToUpdate = null;
        croppedImageBlob = null;
        currentFile = null;
        if (currentCropper) {
            currentCropper.destroy();
            currentCropper = null;
        }
    });

    closeCardModalButton.addEventListener('click', closeCardModalButton);


    // Listener per il form di aggiunta/modifica pianta
    plantForm.addEventListener('submit', savePlantToFirestore);

    // Listener per l'input di ricerca e filtro
    searchInput.addEventListener('input', applyFiltersAndSort);
    categoryFilter.addEventListener('change', applyFiltersAndSort);
    sortBySelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value; // Aggiorna il criterio di ordinamento
        applyFiltersAndSort(); // Riapplica filtri e ordinamento
    });


    // Listener per visualizzare tutte le piante o il mio giardino
    showAllPlantsButton.addEventListener('click', displayAllPlants);
    showMyGardenButton.addEventListener('click', displayMyGarden);

    // Listener per l'input immagine della pianta
    plantImageInput.addEventListener('change', (event) => {
        currentFile = event.target.files[0]; // Salva il file originale
        if (currentFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageToCrop.src = e.target.result; // Carica l'immagine nella modale di ritaglio
                cropImageModal.style.display = 'flex'; // Mostra la modale di ritaglio
                // Inizializza Cropper.js dopo che l'immagine è stata caricata
                if (currentCropper) {
                    currentCropper.destroy(); // Distrugge l'istanza precedente se esiste
                }
                currentCropper = new Cropper(imageToCrop, {
                    aspectRatio: 1, // Imposta un rapporto 1:1 per immagini quadrate
                    viewMode: 1, // Permette all'area di ritaglio di essere più grande del canvas
                });
            };
            reader.readAsDataURL(currentFile);
        }
    });

    // Listener per il bottone di ritaglio
    cropButton.addEventListener('click', () => {
        if (currentCropper) {
            // Ottieni l'immagine ritagliata come blob
            currentCropper.getCroppedCanvas().toBlob((blob) => {
                croppedImageBlob = blob; // Memorizza il blob ritagliato
                plantImagePreview.src = URL.createObjectURL(blob); // Mostra l'anteprima
                plantImagePreview.style.display = 'block';
                cropImageModal.style.display = 'none'; // Chiudi la modale di ritaglio
                currentCropper.destroy(); // Distruggi l'istanza di Cropper
                currentCropper = null;
            }, 'image/jpeg', 0.9); // Formato e qualità dell'immagine
        }
    });

    // Listener per i bottoni di rotazione e zoom
    rotateLeftButton.addEventListener('click', () => {
        if (currentCropper) currentCropper.rotate(-90);
    });
    rotateRightButton.addEventListener('click', () => {
        if (currentCropper) currentCropper.rotate(90);
    });
    zoomInButton.addEventListener('click', () => {
        if (currentCropper) currentCropper.zoom(0.1);
    });
    zoomOutButton.addEventListener('click', () => {
        if (currentCropper) currentCropper.zoom(-0.1);
    });


    // Chiudi la modale di ritaglio cliccando fuori
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
    setupAuthListeners(); 
    // **********************************
});
