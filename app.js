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

// Variabili DOM aggiunte per il clima
let fetchWeatherButton; //
let locationInput; //

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
    cardModal.style.display = 'none';
    zoomedCardContent.innerHTML = ''; // Pulisci il contenuto
    
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
        
        // Visualizza il giardino dopo averlo caricato
        displayMyGarden(); //
        
        console.log("Mio Giardino Caricato:", myGarden); 
    } catch (error) {
        console.error("Errore nel caricamento del giardino:", error);
        showToast(`Errore nel caricamento del giardino: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione placeholder per displayMyGarden (assicurati che la tua implementazione sia qui)
// Questa funzione dovrebbe prendere i dati da `myGarden` e visualizzarli
function displayMyGarden() {
    // Implementa qui la logica per filtrare, ordinare e visualizzare le piante dal myGarden
    // Ad esempio:
    applyFiltersAndSort(myGarden); // Passa myGarden ad applyFiltersAndSort
}

// Funzione per recuperare i dati climatici (nuova funzione)
async function fetchWeather(city) {
    showLoadingSpinner();
    try {
        // PER UN'IMPLEMENTAZIONE REALE:
        // Sostituisci 'YOUR_OPENWEATHERMAP_API_KEY' con la tua chiave API di OpenWeatherMap
        // Registrati su OpenWeatherMap per ottenerne una: https://openweathermap.org/api
        const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; 
        if (apiKey === 'YOUR_OPENWEATHERMAP_API_KEY' || apiKey === '') {
            console.warn("ATTENZIONE: Chiave API OpenWeatherMap non configurata. I dati meteo saranno fittizi.");
            locationNameSpan.textContent = city;
            currentTempSpan.textContent = 'N/A';
            weatherDescriptionSpan.textContent = 'Dati fittizi (API key mancante)';
            humiditySpan.textContent = 'N/A';
            windSpeedSpan.textContent = 'N/A';
            lastUpdatedSpan.textContent = new Date().toLocaleTimeString();
            showToast('Chiave API meteo mancante o non valida. Dati fittizi mostrati.', 'warning');
            hideLoadingSpinner();
            return;
        }

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=it`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Errore nel recupero dei dati climatici');
        }
        const data = await response.json();

        locationNameSpan.textContent = data.name;
        currentTempSpan.textContent = `${data.main.temp}°C`;
        weatherDescriptionSpan.textContent = data.weather[0].description;
        humiditySpan.textContent = `${data.main.humidity}%`;
        windSpeedSpan.textContent = `${data.wind.speed} m/s`;
        lastUpdatedSpan.textContent = new Date(data.dt * 1000).toLocaleTimeString(); // Converti timestamp Unix
        showToast(`Dati climatici per ${city} aggiornati!`, 'success');

    } catch (error) {
        console.error('Errore nel recupero dei dati climatici:', error);
        showToast(`Errore nel recupero dei dati climatici: ${error.message}`, 'error');
        // Imposta i valori su N/A in caso di errore
        locationNameSpan.textContent = 'N/A';
        currentTempSpan.textContent = 'N/A';
        weatherDescriptionSpan.textContent = 'Errore';
        humiditySpan.textContent = 'N/A';
        windSpeedSpan.textContent = 'N/A';
        lastUpdatedSpan.textContent = 'N/A';
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione principale per l'inizializzazione al caricamento del DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inizializzazione Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();

    // Inizializzazione variabili DOM
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden-container');
    authContainerDiv = document.getElementById('auth-section');
    appContentDiv = document.getElementById('app-content');
    loginButton = document.getElementById('loginButton');
    registerButton = document.getElementById('registerButton');
    showLoginLink = document.getElementById('showLoginLink');
    showRegisterLink = document.getElementById('showRegisterLink');
    emailInput = document.getElementById('emailInput');
    passwordInput = document.getElementById('passwordInput');
    loginError = document.getElementById('loginError');
    registerEmailInput = document.getElementById('registerEmailInput');
    registerPasswordInput = document.getElementById('registerPasswordInput');
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
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback'); // Assicurati che l'ID sia corretto
    manualLuxInputDiv = document.getElementById('manual-lux-input-group'); // Corretto per ID in index.html
    applyManualLuxButton = document.getElementById('applyManualLuxButton');
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    sortBySelect = document.getElementById('sortBySelect');
    plantModal = document.getElementById('plantModal');
    plantForm = document.getElementById('plantForm');
    closePlantModalButton = document.getElementById('closePlantModal');
    plantNameInput = document.getElementById('plantName');
    plantCategorySelect = document.getElementById('plantCategory');
    sunLightSelect = document.getElementById('sunLight');
    plantDescriptionTextarea = document.getElementById('plantDescription');
    plantTempMinInput = document.getElementById('plantTempMin');
    plantTempMaxInput = document.getElementById('plantTempMax');
    plantWateringInput = document.getElementById('plantWatering');
    plantIdealLuxMinInput = document.getElementById('plantIdealLuxMin');
    plantIdealLuxMaxInput = document.getElementById('plantIdealLuxMax');
    plantImageInput = document.getElementById('plantImage');
    plantImagePreview = document.getElementById('plantImagePreview');
    saveUpdatePlantButton = document.getElementById('saveUpdatePlantButton');
    cancelUpdatePlantButton = document.getElementById('cancelUpdatePlantButton');
    deletePlantButton = document.getElementById('deletePlantButton');
    imageModal = document.getElementById('imageModal');
    closeImageModalButton = document.getElementById('closeImageModal');
    sunLightFilter = document.getElementById('sunLightFilter'); // Corretto per ID in index.html
    plantModalTitle = document.getElementById('plantModalTitle');
    cardModal = document.getElementById('cardModal');
    closeCardModalButton = document.getElementById('closeCardModal');
    zoomedCardContent = document.getElementById('zoomedCardContent');
    googleLensButton = document.getElementById('googleLensButton');
    cropImageModal = document.getElementById('cropImageModal');
    closeCropImageModalButton = document.getElementById('closeCropImageModalButton');
    imageToCrop = document.getElementById('imageToCrop');
    cropButton = document.getElementById('cropButton');
    imageZoomModal = document.getElementById('imageZoomModal');
    closeImageZoomModalButton = document.getElementById('closeImageZoomModalButton');
    imageZoomDisplay = document.getElementById('imageZoomDisplay');

    rotateLeftButton = document.getElementById('rotateLeftButton');
    rotateRightButton = document.getElementById('rotateRightButton');
    zoomInButton = document.getElementById('zoomInButton');
    zoomOutButton = document.getElementById('zoomOutButton');

    manualLuxInput = document.getElementById('manualLuxInput');
    // currentLuxDisplay = document.getElementById('currentLuxDisplay'); // Controlla se presente in HTML
    luxFeedbackPlantsContainer = document.getElementById('luxFeedbackPlantsContainer'); // Controlla se presente in HTML
    clearLuxFeedbackButton = document.getElementById('clearLuxFeedbackButton'); // Controlla se presente in HTML
    clearLightFeedbackButton = document.getElementById('clearLightFeedbackButton'); // Già presente

    loginForm = document.getElementById('login-form');
    registerForm = document.getElementById('register-form');
    loadingSpinner = document.getElementById('loading-spinner');

    // Inizializzazione variabili DOM per il clima
    locationNameSpan = document.getElementById('location-name'); //
    currentTempSpan = document.getElementById('current-temp'); //
    weatherDescriptionSpan = document.getElementById('weather-description'); //
    humiditySpan = document.getElementById('humidity'); //
    windSpeedSpan = document.getElementById('wind-speed'); //
    lastUpdatedSpan = document.getElementById('last-updated'); //
    fetchWeatherButton = document.getElementById('fetch-weather-button'); //
    locationInput = document.getElementById('location-input'); //


    // Event Listeners di autenticazione
    setupAuthListeners();

    // Event Listener per il Clima
    if (fetchWeatherButton) { //
        fetchWeatherButton.addEventListener('click', () => { //
            const city = locationInput.value; //
            if (city) { //
                fetchWeather(city); //
            } else { //
                showToast('Inserisci una città per le previsioni climatiche.', 'warning'); //
            } //
        }); //
    } //

    // Event Listener per i bottoni "Tutte le Piante" e "Mostra Giardino"
    if (showAllPlantsButton) showAllPlantsButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = false;
        plantsSectionHeader.textContent = "Tutte le Piante Disponibili";
        gardenContainer.style.display = 'flex';
        myGardenContainer.style.display = 'none';
        applyFiltersAndSort();
    });

    if (showMyGardenButton) showMyGardenButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = true;
        plantsSectionHeader.textContent = "Il Mio Giardino";
        gardenContainer.style.display = 'none';
        myGardenContainer.style.display = 'flex';
        loadMyGarden(); // Carica e poi visualizza il giardino
    });

    // Event Listener per il bottone Aggiungi Nuova Pianta
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', () => {
        currentPlantIdToUpdate = null; // Reset per nuova pianta
        plantForm.reset();
        plantImagePreview.style.display = 'none';
        plantImagePreview.src = '#';
        croppedImageBlob = null;
        currentFile = null;
        if (plantModalTitle) {
            plantModalTitle.textContent = 'Aggiungi Nuova Pianta'; // Titolo per nuova pianta
        }
        saveUpdatePlantButton.textContent = 'Salva Pianta';
        deletePlantButton.style.display = 'none'; // Nascondi il bottone elimina per nuova pianta
        plantModal.style.display = 'flex';
    });

    // Event Listeners per il form della pianta
    if (plantForm) plantForm.addEventListener('submit', savePlantToFirestore);
    if (closePlantModalButton) closePlantModalButton.addEventListener('click', () => {
        plantModal.style.display = 'none';
        plantForm.reset();
        plantImagePreview.style.display = 'none';
        plantImagePreview.src = '#';
        croppedImageBlob = null;
        currentFile = null;
    });

    if (cancelUpdatePlantButton) cancelUpdatePlantButton.addEventListener('click', () => {
        plantModal.style.display = 'none';
        plantForm.reset();
        plantImagePreview.style.display = 'none';
        plantImagePreview.src = '#';
        croppedImageBlob = null;
        currentFile = null;
    });

    if (deletePlantButton) deletePlantButton.addEventListener('click', () => {
        if (currentPlantIdToUpdate) {
            deletePlantFromFirestore(currentPlantIdToUpdate);
        }
    });

    // Event Listener per la ricerca e i filtri
    if (searchInput) searchInput.addEventListener('input', applyFiltersAndSort);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFiltersAndSort);
    if (tempMinFilter) tempMinFilter.addEventListener('input', applyFiltersAndSort);
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', applyFiltersAndSort);
    if (sortBySelect) sortBySelect.addEventListener('change', applyFiltersAndSort);

    // Event Listener per l'input dell'immagine
    if (plantImageInput) plantImageInput.addEventListener('change', (event) => {
        currentFile = event.target.files[0];
        if (currentFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageToCrop.src = e.target.result;
                cropImageModal.style.display = 'flex'; // Mostra la modale di ritaglio
                if (currentCropper) {
                    currentCropper.destroy();
                }
                currentCropper = new Cropper(imageToCrop, {
                    aspectRatio: 1, // Imposta un aspect ratio 1:1 (quadrato)
                    viewMode: 1, // Limita l'area di ritaglio alle dimensioni del canvas
                    autoCropArea: 0.8, // Area di ritaglio iniziale (80% dell'immagine)
                });
            };
            reader.readAsDataURL(currentFile);
        }
    });

    // Event Listener per il bottone di ritaglio
    if (cropButton) cropButton.addEventListener('click', () => {
        if (currentCropper) {
            const canvas = currentCropper.getCroppedCanvas({
                width: 400, // Larghezza desiderata dell'immagine ritagliata
                height: 400, // Altezza desiderata
            });
            canvas.toBlob((blob) => {
                croppedImageBlob = blob;
                plantImagePreview.src = URL.createObjectURL(blob);
                plantImagePreview.style.display = 'block';
                cropImageModal.style.display = 'none'; // Chiudi la modale di ritaglio
            }, 'image/jpeg', 0.9); // Formato e qualità dell'immagine
        }
    });

    // Event Listener per i bottoni di rotazione/zoom
    if (rotateLeftButton) rotateLeftButton.addEventListener('click', () => {
        if (currentCropper) currentCropper.rotate(-90);
    });
    if (rotateRightButton) rotateRightButton.addEventListener('click', () => {
        if (currentCropper) currentCropper.rotate(90);
    });
    if (zoomInButton) zoomInButton.addEventListener('click', () => {
        if (currentCropper) currentCropper.zoom(0.1);
    });
    if (zoomOutButton) zoomOutButton.addEventListener('click', () => {
        if (currentCropper) currentCropper.zoom(-0.1);
    });

    // Event Listeners per la chiusura delle modali immagine
    if (closeCropImageModalButton) closeCropImageModalButton.addEventListener('click', () => {
        cropImageModal.style.display = 'none';
        if (currentCropper) {
            currentCropper.destroy(); // Distruggi l'istanza di Cropper
            currentCropper = null;
        }
    });

    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => {
        imageModal.style.display = 'none';
    });

    // Event listener per lo zoom dell'immagine della card
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
    // Già spostato sopra per chiarezza e per essere vicino alle altre inizializzazioni DOM relative al clima
});

// Funzione placeholder: la tua implementazione di applyFiltersAndSort dovrebbe essere qui
function applyFiltersAndSort(sourceArray) {
    let plantsToDisplay = sourceArray || allPlants; // Usa sourceArray se fornito, altrimenti allPlants

    // Logica di ricerca
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        plantsToDisplay = plantsToDisplay.filter(plant => 
            plant.name.toLowerCase().includes(searchTerm) || 
            plant.description.toLowerCase().includes(searchTerm)
        );
    }

    // Logica di filtro per categoria
    const selectedCategory = categoryFilter.value;
    if (selectedCategory && selectedCategory !== 'Tutte') {
        plantsToDisplay = plantsToDisplay.filter(plant => plant.category === selectedCategory);
    }

    // Logica di filtro per temperatura
    const minTemp = parseFloat(tempMinFilter.value);
    const maxTemp = parseFloat(tempMaxFilter.value);
    if (!isNaN(minTemp)) {
        plantsToDisplay = plantsToDisplay.filter(plant => plant.tempMin && plant.tempMin >= minTemp);
    }
    if (!isNaN(maxTemp)) {
        plantsToDisplay = plantsToDisplay.filter(plant => plant.tempMax && plant.tempMax <= maxTemp);
    }

    // Logica di filtro per esposizione solare (sunLightFilter)
    const selectedSunLight = sunLightFilter.value;
    if (selectedSunLight && selectedSunLight !== 'Tutte') {
        plantsToDisplay = plantsToDisplay.filter(plant => plant.sunlight === selectedSunLight);
    }

    // Logica di ordinamento
    const sortBy = sortBySelect.value;
    plantsToDisplay.sort((a, b) => {
        if (sortBy === 'name_asc') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'name_desc') {
            return b.name.localeCompare(a.name);
        } else if (sortBy === 'category_asc') {
            return a.category.localeCompare(b.category);
        } else if (sortBy === 'category_desc') {
            return b.category.localeCompare(a.category);
        }
        // Puoi aggiungere altri criteri di ordinamento qui
        return 0;
    });

    displayPlants(plantsToDisplay);
}

// Funzione placeholder: la tua implementazione di displayPlants dovrebbe essere qui
function displayPlants(plants) {
    const container = isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer;
    container.innerHTML = ''; // Pulisci il contenitore attuale
    if (plants.length === 0) {
        container.innerHTML = '<p class="no-plants-message">Nessuna pianta trovata con i criteri selezionati.</p>';
        return;
    }

    plants.forEach(plant => {
        const plantCard = document.createElement('div');
        plantCard.className = 'plant-card';
        plantCard.dataset.id = plant.id;

        const imageUrl = plant.imageUrl || categoryIcons[plant.category] || categoryIcons['Altro'];

        plantCard.innerHTML = `
            <img src="${imageUrl}" alt="${plant.name}" class="plant-image">
            <h3 class="plant-name">${plant.name}</h3>
            <p class="plant-category">Categoria: ${plant.category}</p>
            <p class="plant-sunlight">Esposizione: ${plant.sunlight}</p>
            <div class="plant-actions">
                <button class="btn btn-primary btn-view-details" data-id="${plant.id}"><i class="fas fa-eye"></i> Dettagli</button>
                ${isMyGardenCurrentlyVisible 
                    ? `<button class="btn btn-secondary btn-remove-garden" data-id="${plant.id}"><i class="fas fa-minus-circle"></i> Rimuovi</button>`
                    : `<button class="btn btn-primary btn-add-garden ${isPlantInMyGarden(plant.id) ? 'btn-added' : ''}" data-id="${plant.id}" ${isPlantInMyGarden(plant.id) ? 'disabled' : ''}>
                        <i class="fas ${isPlantInMyGarden(plant.id) ? 'fa-check-circle' : 'fa-plus-circle'}"></i> 
                        ${isPlantInMyGarden(plant.id) ? 'Già nel tuo giardino' : 'Aggiungi al mio giardino'}
                       </button>`
                }
            </div>
        `;
        container.appendChild(plantCard);
    });

    // Aggiungi event listener per i bottoni "Aggiungi al mio giardino"
    container.querySelectorAll('.btn-add-garden').forEach(button => {
        button.addEventListener('click', (e) => {
            const plantId = e.target.dataset.id;
            addPlantToMyGarden(plantId);
        });
    });

    // Aggiungi event listener per i bottoni "Rimuovi dal mio giardino"
    container.querySelectorAll('.btn-remove-garden').forEach(button => {
        button.addEventListener('click', (e) => {
            const plantId = e.target.dataset.id;
            removePlantFromMyGarden(plantId);
        });
    });

    // Event listener per i bottoni "Dettagli"
    container.querySelectorAll('.btn-view-details').forEach(button => {
        button.addEventListener('click', (e) => {
            const plantId = e.target.dataset.id;
            const plant = allPlants.find(p => p.id === plantId);
            if (plant) {
                // Popola la modale della card con i dettagli della pianta
                zoomedCardContent.innerHTML = `
                    <div class="card-modal-header">
                        <h2 class="card-modal-title">${plant.name}</h2>
                        <button id="cardModalCloseButton" class="modal-close-button">&times;</button>
                    </div>
                    <div class="card-modal-body">
                        <img src="${plant.imageUrl || categoryIcons[plant.category] || categoryIcons['Altro']}" alt="${plant.name}" class="card-modal-image">
                        <p><strong>Categoria:</strong> ${plant.category}</p>
                        <p><strong>Esposizione Solare:</strong> ${plant.sunlight}</p>
                        <p><strong>Descrizione:</strong> ${plant.description}</p>
                        <p><strong>Temperatura Ideale:</strong> ${plant.tempMin || 'N/A'}°C - ${plant.tempMax || 'N/A'}°C</p>
                        <p><strong>Frequenza Irrigazione:</strong> ${plant.watering}</p>
                        <p><strong>Luminosità Ideale (Lux):</strong> ${plant.idealLuxMin || 'N/A'} - ${plant.idealLuxMax || 'N/A'}</p>
                        </div>
                    <div class="card-modal-actions">
                        <button class="btn btn-secondary" onclick="editPlant('${plant.id}')"><i class="fas fa-edit"></i> Modifica</button>
                    </div>
                `;
                cardModal.style.display = 'flex'; // Mostra la modale
                document.getElementById('cardModalCloseButton').addEventListener('click', closeCardModal);
            }
        });
    });
}

// Funzione placeholder: checkLightSensorAvailability, startLightSensor, stopLightSensor, applyManualLux, clearLightFeedbackDisplay, launchGoogleLens
// Queste funzioni dovrebbero essere implementate per la gestione del sensore di luce e Google Lens
function checkLightSensorAvailability() {
    console.log("Controllo disponibilità sensore di luce...");
    // Implementazione del controllo del sensore di luce
    // Se il sensore non è disponibile, potresti voler mostrare l'input manuale
    // manualLuxInputDiv.style.display = 'block';
}

function startLightSensor() {
    showToast('Sensore di luce avviato (funzionalità non completamente implementata).', 'info');
    console.log("Avvio sensore di luce...");
    // Implementazione per avviare il sensore di luce
}

function stopLightSensor() {
    showToast('Sensore di luce fermato (funzionalità non completamente implementata).', 'info');
    console.log("Arresto sensore di luce...");
    // Implementazione per fermare il sensore di luce
}

function applyManualLux() {
    const luxValue = manualLuxInput.value;
    if (luxValue) {
        showToast(`Lux manuali applicati: ${luxValue} (funzionalità non completamente implementata).`, 'info');
        currentLuxValueSpan.textContent = luxValue;
        // Qui potresti voler triggerare la logica di feedback basata sui lux manuali
    } else {
        showToast('Inserisci un valore Lux manuale.', 'warning');
    }
}

function clearLightFeedbackDisplay() {
    showToast('Feedback Lux azzerato (funzionalità non completamente implementata).', 'info');
    lightFeedbackDiv.textContent = '';
    luxFeedbackPlantsContainer.innerHTML = '';
}

function launchGoogleLens() {
    showToast('Funzionalità Google Lens non implementata.', 'info');
    console.log("Avvio Google Lens...");
    // Implementazione per avviare Google Lens o funzionalità simili
}
