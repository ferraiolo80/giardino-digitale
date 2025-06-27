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
// let plantsunLight; // Rimosso: variabile non utilizzata
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
let sunLightFilter;
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

// Inizializzazione di Firebase
let db;
let auth;
let storage;
let loginForm; // Assicurati di inizializzare anche queste
let registerForm; // Assicurati di inizializzare anche queste


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
}

// --- Funzioni di Interazione con Firestore e Storage ---

// Modificata per accettare un nome per l'immagine
async function uploadImage(file, imageName = '') {
    if (!file) return null;

    const storageRef = storage.ref();
    // Usa imageName se fornito, altrimenti fallback al nome originale o a un timestamp
    const fileName = `plant_images/${imageName ? imageName + '_' : ''}${Date.now()}_${file.name.split('.').pop()}`; 
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
            imageUrl = await uploadImage(croppedImageBlob, name); // Passa il nome della pianta per il filename
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
    if (croppedImageBlob) {
        // Se l'utente ha ritagliato una nuova immagine (il blob dell'immagine reale)
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
        await docRef.delete();
        showToast('Pianta rimossa dal tuo giardino!', 'success');
        loadMyGarden(); // Ricarica il giardino dopo la rimozione
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
        displayPlants([]); // Mostra un giardino vuoto
        hideLoadingSpinner();
        return;
    }

    try {
        // Filtra per le piante dell'utente corrente nel loro sottocollezione 'gardens'
        const snapshot = await db.collection('users').doc(user.uid).collection('gardens').get();
        myGarden = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (isMyGardenCurrentlyVisible) {
            applyFiltersAndSort(); // Applica i filtri e l'ordinamento solo se il mio giardino è visibile
        }
    } catch (error) {
        console.error("Errore nel caricamento del mio giardino:", error);
        showToast(`Errore nel caricamento del tuo giardino: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

function displayPlants(plantsToShow) {
    gardenContainer.innerHTML = ''; // Pulisci il contenitore prima di aggiungere
    myGardenContainer.innerHTML = ''; // Pulisci anche questo

    if (plantsToShow.length === 0) {
        const message = document.createElement('p');
        message.textContent = isMyGardenCurrentlyVisible ?
            'Non hai ancora piante nel tuo giardino. Aggiungine alcune dalla sezione "Tutte le Piante Disponibili"!' :
            'Nessuna pianta trovata con i filtri e l\'ordinamento attuali.';
        message.className = 'no-plants-message';
        (isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer).appendChild(message);
        return;
    }

    plantsToShow.forEach(plant => {
        const plantCard = document.createElement('div');
        plantCard.className = 'plant-card';
        plantCard.dataset.id = plant.id;

        // Determina l'URL dell'immagine da visualizzare
        // Se la pianta è nel Mio Giardino e ha un imageUrl personalizzato, usalo.
        // Altrimenti, usa l'icona di categoria predefinita.
        let displayImageUrl = plant.imageUrl || categoryIcons[plant.category] || categoryIcons['Altro'];

        // Card Content
        plantCard.innerHTML = `
            <img src="${displayImageUrl}" alt="${plant.name}" class="plant-card-image" onerror="this.onerror=null;this.src='${categoryIcons['Altro']}'">
            <h3 class="plant-card-name">${plant.name}</h3>
            <p class="plant-card-category">Categoria: ${plant.category}</p>
            <div class="card-buttons">
                ${isMyGardenCurrentlyVisible ?
                    `<button class="remove-from-garden-button" data-id="${plant.id}"><i class="fas fa-minus-circle"></i> Rimuovi</button>` :
                    `<button class="add-to-garden-button" data-id="${plant.id}"><i class="fas fa-plus-circle"></i> Aggiungi al mio giardino</button>`
                }
                <button class="view-details-button" data-id="${plant.id}"><i class="fas fa-info-circle"></i> Dettagli</button>
            </div>
        `;

        (isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer).appendChild(plantCard);
    });

    // Aggiungi event listener ai nuovi bottoni
    document.querySelectorAll('.add-to-garden-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const plantId = e.currentTarget.dataset.id;
            addPlantToMyGarden(plantId);
        });
    });

    document.querySelectorAll('.remove-from-garden-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const plantId = e.currentTarget.dataset.id;
            removePlantFromMyGarden(plantId);
        });
    });

    document.querySelectorAll('.view-details-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const plantId = e.currentTarget.dataset.id;
            displayPlantCardModal(plantId);
        });
    });

    // Aggiungi listener per l'immagine all'interno della card per lo zoom
    document.querySelectorAll('.plant-card-image').forEach(image => {
        image.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita che l'evento si propaghi alla card o al bottone dettagli
            openImageZoomModal(e.target.src);
        });
    });
}

function displayPlantCardModal(plantId) {
    const plant = allPlants.find(p => p.id === plantId) || myGarden.find(p => p.id === plantId);
    if (!plant) {
        showToast('Dettagli pianta non trovati.', 'error');
        return;
    }

    let displayImageUrl = plant.imageUrl || categoryIcons[plant.category] || categoryIcons['Altro'];

    zoomedCardContent.innerHTML = `
        <img src="${displayImageUrl}" alt="${plant.name}" class="modal-plant-image" onerror="this.onerror=null;this.src='${categoryIcons['Altro']}'">
        <h2>${plant.name}</h2>
        <p><strong>Categoria:</strong> ${plant.category}</p>
        <p><strong>Esposizione solare:</strong> ${plant.sunlight}</p>
        <p><strong>Descrizione:</strong> ${plant.description || 'Nessuna descrizione.'}</p>
        <p><strong>Temperatura ideale:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'Non specificata'}</p>
        <p><strong>Frequenza di innaffiatura:</strong> ${plant.watering || 'Non specificata'}</p>
        <p><strong>Lux ideale:</strong> ${plant.idealLuxMin !== null && plant.idealLuxMax !== null ? `${plant.idealLuxMin} - ${plant.idealLuxMax} lux` : 'Non specificato'}</p>
        <p><strong>Aggiunta il:</strong> ${plant.createdAt ? new Date(plant.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
        ${plant.updatedAt ? `<p><strong>Ultimo aggiornamento:</strong> ${new Date(plant.updatedAt.toDate()).toLocaleDateString()}</p>` : ''}
        <div class="modal-actions">
            ${isMyGardenCurrentlyVisible ?
                `<button class="remove-from-garden-button" data-id="${plant.id}"><i class="fas fa-minus-circle"></i> Rimuovi dal Giardino</button>` :
                `<button class="add-to-garden-button" data-id="${plant.id}"><i class="fas fa-plus-circle"></i> Aggiungi al mio giardino</button>`
            }
            <button class="edit-plant-button" data-id="${plant.id}"><i class="fas fa-edit"></i> Modifica</button>
            <button class="delete-plant-button" data-id="${plant.id}"><i class="fas fa-trash"></i> Elimina dal database</button>
        </div>
    `;

    cardModal.style.display = 'flex';

    // Rimuovi vecchi listener e aggiungi nuovi per evitare duplicazioni
    const oldEditButton = cardModal.querySelector('.edit-plant-button');
    if (oldEditButton) oldEditButton.removeEventListener('click', handleEditButtonClick);
    const oldDeleteButton = cardModal.querySelector('.delete-plant-button');
    if (oldDeleteButton) oldDeleteButton.removeEventListener('click', handleDeleteButtonClick);

    cardModal.querySelector('.edit-plant-button').addEventListener('click', handleEditButtonClick);
    cardModal.querySelector('.delete-plant-button').addEventListener('click', handleDeleteButtonClick);

    // Gestione bottoni Aggiungi/Rimuovi all'interno della modale card
    const addToGardenBtn = cardModal.querySelector('.add-to-garden-button');
    const removeFromGardenBtn = cardModal.querySelector('.remove-from-garden-button');

    if (addToGardenBtn) {
        addToGardenBtn.removeEventListener('click', handleAddToGardenClick); // Rimuovi per evitare duplicati
        addToGardenBtn.addEventListener('click', handleAddToGardenClick);
    }
    if (removeFromGardenBtn) {
        removeFromGardenBtn.removeEventListener('click', handleRemoveFromGardenClick); // Rimuovi per evitare duplicati
        removeFromGardenBtn.addEventListener('click', handleRemoveFromGardenClick);
    }

    // Listener per l'immagine all'interno della modale per lo zoom
    const modalImage = cardModal.querySelector('.modal-plant-image');
    if (modalImage) {
        modalImage.removeEventListener('click', handleModalImageClick); // Rimuovi per evitare duplicati
        modalImage.addEventListener('click', handleModalImageClick);
    }
}

function handleEditButtonClick(e) {
    const plantId = e.currentTarget.dataset.id;
    editPlant(plantId);
}

function handleDeleteButtonClick(e) {
    const plantId = e.currentTarget.dataset.id;
    deletePlantFromFirestore(plantId);
}

function handleAddToGardenClick(e) {
    const plantId = e.currentTarget.dataset.id;
    addPlantToMyGarden(plantId);
    closeCardModal(); // Chiudi la modale dopo l'aggiunta
}

function handleRemoveFromGardenClick(e) {
    const plantId = e.currentTarget.dataset.id;
    removePlantFromMyGarden(plantId);
    closeCardModal(); // Chiudi la modale dopo la rimozione
}

function handleModalImageClick(e) {
    openImageZoomModal(e.target.src);
}


function applyFiltersAndSort() {
    showLoadingSpinner();
    let plantsToDisplay = isMyGardenCurrentlyVisible ? [...myGarden] : [...allPlants];

    // Filtro per ricerca
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        plantsToDisplay = plantsToDisplay.filter(plant =>
            plant.name.toLowerCase().includes(searchTerm) ||
            plant.description.toLowerCase().includes(searchTerm)
        );
    }

    // Filtro per categoria
    const selectedCategory = categoryFilter.value;
    if (selectedCategory && selectedCategory !== 'all') {
        plantsToDisplay = plantsToDisplay.filter(plant => plant.category === selectedCategory);
    }

    // Filtro per temperatura (min e max)
    const minTemp = tempMinFilter.value ? parseFloat(tempMinFilter.value) : -Infinity;
    const maxTemp = tempMaxFilter.value ? parseFloat(tempMaxFilter.value) : Infinity;

    plantsToDisplay = plantsToDisplay.filter(plant => {
        const plantTempMin = plant.tempMin !== null ? plant.tempMin : -Infinity;
        const plantTempMax = plant.tempMax !== null ? plant.tempMax : Infinity;

        // Se la pianta ha un range, deve intersecare il range del filtro
        // Se il filtro non ha min/max, non applica il filtro su quella specifica boundary
        const overlapsMin = (plantTempMax >= minTemp);
        const overlapsMax = (plantTempMin <= maxTemp);

        return overlapsMin && overlapsMax;
    });

    // Nuovo filtro per esposizione solare
    const selectedSunLight = sunLightFilter.value;
    if (selectedSunLight && selectedSunLight !== 'all') {
        plantsToDisplay = plantsToDisplay.filter(plant => plant.sunlight === selectedSunLight);
    }


    // Ordinamento
    switch (currentSortBy) {
        case 'name_asc':
            plantsToDisplay.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name_desc':
            plantsToDisplay.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'category_asc':
            plantsToDisplay.sort((a, b) => a.category.localeCompare(b.category));
            break;
        case 'category_desc':
            plantsToDisplay.sort((a, b) => b.category.localeCompare(a.category));
            break;
        case 'temp_asc':
            plantsToDisplay.sort((a, b) => (a.tempMin || -Infinity) - (b.tempMin || -Infinity));
            break;
        case 'temp_desc':
            plantsToDisplay.sort((a, b) => (b.tempMin || -Infinity) - (a.tempMin || -Infinity));
            break;
        case 'watering_asc':
            plantsToDisplay.sort((a, b) => {
                const waterA = a.watering || '';
                const waterB = b.watering || '';
                return waterA.localeCompare(waterB);
            });
            break;
        case 'watering_desc':
            plantsToDisplay.sort((a, b) => {
                const waterA = a.watering || '';
                const waterB = b.watering || '';
                return waterB.localeCompare(waterA);
            });
            break;
        case 'lux_asc':
            plantsToDisplay.sort((a, b) => (a.idealLuxMin || -Infinity) - (b.idealLuxMin || -Infinity));
            break;
        case 'lux_desc':
            plantsToDisplay.sort((a, b) => (b.idealLuxMin || -Infinity) - (a.idealLuxMin || -Infinity));
            break;
    }

    displayPlants(plantsToDisplay);
    hideLoadingSpinner();
}


// --- Funzioni per il Sensore di Luce Ambientale ---
async function checkLightSensorAvailability() {
    if ('AmbientLightSensor' in window) {
        try {
            ambientLightSensor = new AmbientLightSensor({ frequency: 100 });
            ambientLightSensor.addEventListener('reading', () => {
                const lux = ambientLightSensor.illuminance;
                currentLuxValueSpan.textContent = `Valore Lux: ${lux.toFixed(2)}`;
                updateLightFeedback(lux);
            });
            ambientLightSensor.addEventListener('error', event => {
                console.error('Errore sensore luce:', event.error.name, event.error.message);
                lightFeedbackDiv.textContent = `Errore sensore: ${event.error.message}`;
            });
            lightSensorContainer.style.display = 'block';
            startLightSensorButton.style.display = 'inline-block';
            stopLightSensorButton.style.display = 'none';
            manualLuxInputDiv.style.display = 'none'; // Nascondi input manuale inizialmente
            showToast('Sensore di luce ambientale disponibile.', 'info');
        } catch (error) {
            console.warn('Impossibile inizializzare AmbientLightSensor:', error);
            lightSensorContainer.style.display = 'block'; // Mostra il contenitore
            lightFeedbackDiv.textContent = 'Sensore di luce ambientale non disponibile o permesso negato. Usa l\'input manuale.';
            startLightSensorButton.style.display = 'none';
            stopLightSensorButton.style.display = 'none';
            manualLuxInputDiv.style.display = 'block'; // Mostra input manuale
            showToast('Sensore di luce ambientale non disponibile.', 'warning');
        }
    } else {
        lightSensorContainer.style.display = 'block'; // Mostra il contenitore
        lightFeedbackDiv.textContent = 'Il tuo browser non supporta l\'API AmbientLightSensor. Usa l\'input manuale.';
        startLightSensorButton.style.display = 'none';
        stopLightSensorButton.style.display = 'none';
        manualLuxInputDiv.style.display = 'block'; // Mostra input manuale
        showToast('API AmbientLightSensor non supportata.', 'warning');
    }
}

function startLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.start();
        startLightSensorButton.style.display = 'none';
        stopLightSensorButton.style.display = 'inline-block';
        manualLuxInputDiv.style.display = 'none'; // Nascondi quando il sensore è attivo
        showToast('Sensore di luce avviato.', 'info');
    }
}

function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        lightFeedbackDiv.textContent = 'Sensore di luce fermato.';
        startLightSensorButton.style.display = 'inline-block';
        stopLightSensorButton.style.display = 'none';
        manualLuxInputDiv.style.display = 'block'; // Mostra quando il sensore è fermo
        showToast('Sensore di luce fermato.', 'info');
    }
}

function updateLightFeedback(currentLux) {
    currentLuxDisplay.textContent = `Lux Attuali: ${currentLux.toFixed(2)}`;
    luxFeedbackPlantsContainer.innerHTML = ''; // Pulisci il feedback precedente

    const relevantPlants = allPlants.filter(plant =>
        plant.idealLuxMin !== null &&
        plant.idealLuxMax !== null &&
        currentLux >= plant.idealLuxMin &&
        currentLux <= plant.idealLuxMax
    );

    if (relevantPlants.length > 0) {
        const feedbackMessage = document.createElement('p');
        feedbackMessage.textContent = `Le seguenti piante sono adatte per ${currentLux.toFixed(2)} lux:`;
        luxFeedbackPlantsContainer.appendChild(feedbackMessage);

        const ul = document.createElement('ul');
        relevantPlants.forEach(plant => {
            const li = document.createElement('li');
            li.textContent = plant.name;
            ul.appendChild(li);
        });
        luxFeedbackPlantsContainer.appendChild(ul);
    } else {
        const noPlantsMessage = document.createElement('p');
        noPlantsMessage.textContent = `Nessuna delle tue piante è attualmente adatta per ${currentLux.toFixed(2)} lux.`;
        luxFeedbackPlantsContainer.appendChild(noPlantsMessage);
    }
}

function applyManualLux() {
    const manualLux = parseFloat(manualLuxInput.value);
    if (!isNaN(manualLux) && manualLux >= 0) {
        currentLuxValueSpan.textContent = `Valore Lux Manuale: ${manualLux.toFixed(2)}`;
        updateLightFeedback(manualLux);
        showToast(`Lux manuale applicato: ${manualLux.toFixed(2)}`, 'success');
    } else {
        showToast('Inserisci un valore Lux valido (numero positivo).', 'error');
    }
}

function clearLightFeedbackDisplay() {
    currentLuxDisplay.textContent = 'Lux Attuali: N/A';
    luxFeedbackPlantsContainer.innerHTML = '<p>Nessun feedback di luce visualizzato.</p>';
    showToast('Feedback luce azzerato.', 'info');
}


// --- Funzioni per Google Lens (Placeholder) ---
function launchGoogleLens() {
    // Questo è un placeholder. L'API di Google Lens per il web è complessa e richiede integrazioni specifiche.
    // Una possibile implementazione potrebbe coinvolgere:
    // 1. Caricare un'immagine (dal file input o dalla galleria)
    // 2. Inviare l'immagine a un backend che poi chiama l'API Cloud Vision di Google per l'analisi.
    // 3. Mostrare i risultati all'utente.
    // Per ora, mostriamo un semplice messaggio.
    showToast('Funzionalità Google Lens non ancora implementata.', 'info');
    console.log('Tentativo di avviare Google Lens...');
    // Potresti reindirizzare a Google Images per una ricerca visiva:
    // window.open('https://images.google.com/imghp?hl=en', '_blank');
}


// --- Funzioni per il Clima (Open-Meteo) ---
async function getClimateData() {
    showLoadingSpinner();
    // Ottieni la posizione corrente dell'utente
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;

            try {
                const response = await fetch(weatherApiUrl);
                const data = await response.json();
                console.log("Dati meteo:", data);

                if (data.current_weather) {
                    const { temperature, windspeed, weathercode } = data.current_weather;
                    const humidity = data.hourly.relative_humidity_2m[0]; // Prende il primo valore orario
                    const timezone = data.timezone;
                    const weatherDescription = getWeatherDescription(weathercode);

                    locationNameSpan.textContent = `Posizione: Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)} (Fuso Orario: ${timezone})`;
                    currentTempSpan.textContent = `Temperatura: ${temperature}°C`;
                    weatherDescriptionSpan.textContent = `Condizioni: ${weatherDescription}`;
                    humiditySpan.textContent = `Umidità: ${humidity}%`;
                    windSpeedSpan.textContent = `Velocità Vento: ${windspeed} m/s`;
                    lastUpdatedSpan.textContent = `Ultimo aggiornamento: ${new Date().toLocaleTimeString()}`;

                    showToast('Dati meteo aggiornati!', 'success');
                } else {
                    showToast('Dati meteo non disponibili per la tua posizione.', 'warning');
                }
            } catch (error) {
                console.error("Errore nel recupero dei dati meteo:", error);
                showToast(`Errore nel recupero dati meteo: ${error.message}`, 'error');
            } finally {
                hideLoadingSpinner();
            }
        }, (error) => {
            console.error("Errore di geolocalizzazione:", error);
            showToast(`Errore di geolocalizzazione: ${error.message}. Assicurati di aver concesso il permesso.`, 'error');
            hideLoadingSpinner();
        });
    } else {
        showToast('Geolocalizzazione non supportata dal tuo browser.', 'error');
        hideLoadingSpinner();
    }
}

function getWeatherDescription(code) {
    // Mappa i codici meteo di Open-Meteo a descrizioni leggibili
    const weatherCodes = {
        0: 'Cielo sereno',
        1: 'Prevalentemente sereno',
        2: 'Parzialmente nuvoloso',
        3: 'Cielo coperto',
        45: 'Nebbia',
        48: 'Nebbia gelata',
        51: 'Pioggerella leggera',
        53: 'Pioggerella moderata',
        55: 'Pioggerella intensa',
        56: 'Pioggerella gelata leggera',
        57: 'Pioggerella gelata densa',
        61: 'Pioggia leggera',
        63: 'Pioggia moderata',
        65: 'Pioggia forte',
        66: 'Pioggia gelata leggera',
        67: 'Pioggia gelata forte',
        71: 'Nevicata leggera',
        73: 'Nevicata moderata',
        75: 'Nevicata forte',
        77: 'Gragnola',
        80: 'Rovesci leggeri',
        81: 'Rovesci moderati',
        82: 'Rovesci violenti',
        85: 'Rovesci di neve leggeri',
        86: 'Rovesci di neve forti',
        95: 'Temporale',
        96: 'Temporale con grandine leggera',
        99: 'Temporale con grandine forte'
    };
    return weatherCodes[code] || 'Condizioni sconosciute';
}


// --- Funzioni per il Ritaglio e Zoom Immagine ---
function openCropImageModal(file) {
    if (!file) return;

    currentFile = file; // Salva il file originale

    const reader = new FileReader();
    reader.onload = (e) => {
        imageToCrop.src = e.target.result;
        cropImageModal.style.display = 'flex';

        // Distruggi l'istanza precedente di Cropper se esiste
        if (currentCropper) {
            currentCropper.destroy();
        }

        // Inizializza Cropper.js
        currentCropper = new Cropper(imageToCrop, {
            aspectRatio: 1, // Puoi cambiare l'aspect ratio se desideri
            viewMode: 1,
            autoCropArea: 0.8, // Area di ritaglio iniziale
            background: false, // Non mostrare lo sfondo a scacchiera
            ready: function () {
                // Opzionale: puoi fare qualcosa quando cropper è pronto
            },
        });
    };
    reader.readAsDataURL(file);
}

function openImageZoomModal(imageUrl) {
    imageZoomDisplay.src = imageUrl;
    imageZoomModal.style.display = 'flex';
}

// Event Listener per l'input file (selezione immagine)
document.addEventListener('DOMContentLoaded', () => {
    // Inizializzazione Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyAo8HU5vNNm_H-HvxeDa7xSsg3IEmdlE_4",
        authDomain: "giardinodigitale.firebaseapp.com",
        projectId: "giardinodigitale",
        storageBucket: "giardinodigitale.firebasestorage.app",
        messagingSenderId: "96265504027",
        appId: "1:96265504027:web:903c3df92cfa24beb17fbe"
    };

    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();

    // Inizializzazione variabili DOM
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden-container');
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    loginButton = document.getElementById('login-button');
    registerButton = document.getElementById('register-button');
    showLoginLink = document.getElementById('show-login');
    showRegisterLink = document.getElementById('show-register');
    emailInput = document.getElementById('email-input');
    passwordInput = document.getElementById('password-input');
    loginError = document.getElementById('login-error');
    registerEmailInput = document.getElementById('register-email-input');
    registerPasswordInput = document.getElementById('register-password-input');
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
    startLightSensorButton = document.getElementById('start-light-sensor-button');
    stopLightSensorButton = document.getElementById('stop-light-sensor-button');
    currentLuxValueSpan = document.getElementById('current-lux-value');
    lightFeedbackDiv = document.getElementById('light-feedback');
    manualLuxInputDiv = document.getElementById('manual-lux-input-group');
    applyManualLuxButton = document.getElementById('apply-manual-lux-button');
    tempMinFilter = document.getElementById('temp-min-filter');
    tempMaxFilter = document.getElementById('temp-max-filter');
    sortBySelect = document.getElementById('sort-by-select');
    plantModal = document.getElementById('plant-modal');
    plantForm = document.getElementById('plant-form');
    closePlantModalButton = document.getElementById('close-plant-modal');
    plantNameInput = document.getElementById('plant-name');
    plantCategorySelect = document.getElementById('plant-category');
    sunLightSelect = document.getElementById('plant-sunlight');
    plantDescriptionTextarea = document.getElementById('plant-description');
    plantTempMinInput = document.getElementById('plant-temp-min');
    plantTempMaxInput = document.getElementById('plant-temp-max');
    plantWateringInput = document.getElementById('plant-watering');
    plantIdealLuxMinInput = document.getElementById('plant-ideal-lux-min');
    plantIdealLuxMaxInput = document.getElementById('plant-ideal-lux-max');
    plantImageInput = document.getElementById('plant-image-input');
    plantImagePreview = document.getElementById('plant-image-preview');
    saveUpdatePlantButton = document.getElementById('save-update-plant-button');
    cancelUpdatePlantButton = document.getElementById('cancel-update-plant-button');
    deletePlantButton = document.getElementById('delete-plant-button');
    imageModal = document.getElementById('image-modal');
    closeImageModalButton = document.getElementById('close-image-modal');
    sunLightFilter = document.getElementById('sunlight-filter');
    plantModalTitle = document.getElementById('plant-modal-title');
    cardModal = document.getElementById('card-modal');
    closeCardModalButton = document.getElementById('close-card-modal');
    zoomedCardContent = document.getElementById('zoomed-card-content');
    getClimateButton = document.getElementById('get-climate-button');
    locationNameSpan = document.getElementById('location-name');
    currentTempSpan = document.getElementById('current-temp');
    weatherDescriptionSpan = document.getElementById('weather-description');
    humiditySpan = document.getElementById('humidity');
    windSpeedSpan = document.getElementById('wind-speed');
    lastUpdatedSpan = document.getElementById('last-updated');
    googleLensButton = document.getElementById('google-lens-button');
    cropImageModal = document.getElementById('crop-image-modal');
    closeCropImageModalButton = document.getElementById('close-crop-image-modal');
    imageToCrop = document.getElementById('image-to-crop');
    cropButton = document.getElementById('crop-button');
    imageZoomModal = document.getElementById('image-zoom-modal');
    closeImageZoomModalButton = document.getElementById('close-image-zoom-modal');
    imageZoomDisplay = document.getElementById('image-zoom-display');
    rotateLeftButton = document.getElementById('rotate-left-button');
    rotateRightButton = document.getElementById('rotate-right-button');
    zoomInButton = document.getElementById('zoom-in-button');
    zoomOutButton = document.getElementById('zoom-out-button');
    manualLuxInput = document.getElementById('manual-lux-input');
    currentLuxDisplay = document.getElementById('current-lux-display');
    luxFeedbackPlantsContainer = document.getElementById('lux-feedback-plants-container');
    clearLuxFeedbackButton = document.getElementById('clear-lux-feedback-button');
    clearLightFeedbackButton = document.getElementById('clear-light-feedback-button');
    loginForm = document.getElementById('login-form');
    registerForm = document.getElementById('register-form');

    // CHIAMATA ALLA FUNZIONE DI INIZIALIZZAZIONE AUTENTICAZIONE
    setupAuthListeners();

    // Event Listeners principali
    addNewPlantButton.addEventListener('click', () => {
        plantModal.style.display = 'flex';
        plantForm.reset();
        plantImagePreview.style.display = 'none';
        plantImagePreview.src = '#';
        currentPlantIdToUpdate = null;
        if (plantModalTitle) {
            plantModalTitle.textContent = 'Aggiungi Nuova Pianta'; // Reimposta il titolo
        }
        saveUpdatePlantButton.textContent = 'Salva Pianta';
        deletePlantButton.style.display = 'none'; // Nascondi il bottone elimina per le nuove piante
        croppedImageBlob = null; // Resetta il blob dell'immagine ritagliata
        currentFile = null; // Resetta il file originale
        if (currentCropper) {
            currentCropper.destroy(); // Distruggi l'istanza di cropper se esiste
            currentCropper = null;
        }
    });

    closePlantModalButton.addEventListener('click', () => {
        plantModal.style.display = 'none';
        if (currentCropper) {
            currentCropper.destroy(); // Assicurati di distruggere l'istanza di cropper
            currentCropper = null;
        }
    });

    // Chiudi la modale se si clicca fuori dal contenuto
    plantModal.addEventListener('click', (e) => {
        if (e.target === plantModal) {
            plantModal.style.display = 'none';
            if (currentCropper) {
                currentCropper.destroy();
                currentCropper = null;
            }
        }
    });

    closeCardModalButton.addEventListener('click', closeCardModal);

    cardModal.addEventListener('click', (e) => {
        if (e.target === cardModal) {
            closeCardModal();
        }
    });

    plantForm.addEventListener('submit', savePlantToFirestore);

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

    deletePlantButton.addEventListener('click', () => {
        if (currentPlantIdToUpdate) {
            deletePlantFromFirestore(currentPlantIdToUpdate);
        }
    });

    // Filtri e Ordinamento
    searchInput.addEventListener('input', applyFiltersAndSort);
    categoryFilter.addEventListener('change', applyFiltersAndSort);
    tempMinFilter.addEventListener('input', applyFiltersAndSort);
    tempMaxFilter.addEventListener('input', applyFiltersAndSort);
    sortBySelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        applyFiltersAndSort();
    });

    showAllPlantsButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = false;
        plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
        showMyGardenButton.classList.remove('active');
        showAllPlantsButton.classList.add('active');
        loadAllPlants(); // Assicurati che vengano caricate e mostrate tutte le piante
    });

    showMyGardenButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = true;
        plantsSectionHeader.textContent = 'Il Mio Giardino';
        showAllPlantsButton.classList.remove('active');
        showMyGardenButton.classList.add('active');
        loadMyGarden(); // Assicurati che vengano caricate e mostrate le piante del giardino
    });

    // Event Listener per l'input dell'immagine
    plantImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            openCropImageModal(file);
        }
    });

    // Event Listener per il bottone di ritaglio
    if (cropButton) {
        cropButton.addEventListener('click', () => {
            if (currentCropper) {
                currentCropper.getCroppedCanvas().toBlob((blob) => {
                    croppedImageBlob = blob;
                    plantImagePreview.src = URL.createObjectURL(blob);
                    plantImagePreview.style.display = 'block';
                    cropImageModal.style.display = 'none'; // Chiudi la modale di ritaglio
                    currentCropper.destroy(); // Distruggi l'istanza di Cropper dopo il ritaglio
                    currentCropper = null;
                }, 'image/jpeg', 0.9); // Formato e qualità dell'immagine ritagliata
            }
        });
    }

    // Event Listeners per i bottoni di rotazione/zoom
    if (rotateLeftButton) {
        rotateLeftButton.addEventListener('click', () => {
            if (currentCropper) currentCropper.rotate(-90);
        });
    }
    if (rotateRightButton) {
        rotateRightButton.addEventListener('click', () => {
            if (currentCropper) currentCropper.rotate(90);
        });
    }
    if (zoomInButton) {
        zoomInButton.addEventListener('click', () => {
            if (currentCropper) currentCropper.zoom(0.1);
        });
    }
    if (zoomOutButton) {
        zoomOutButton.addEventListener('click', () => {
            if (currentCropper) currentCropper.zoom(-0.1);
        });
    }

    // Event Listeners per la chiusura delle modali immagine
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => {
        imageModal.style.display = 'none';
        if (currentCropper) {
            currentCropper.destroy();
            currentCropper = null;
        }
    });
    if (closeCropImageModalButton) closeCropImageModalButton.addEventListener('click', () => {
        cropImageModal.style.display = 'none';
        if (currentCropper) {
            currentCropper.destroy();
            currentCropper = null;
        }
    });
    if (closeImageZoomModalButton) closeImageZoomModalButton.addEventListener('click', () => {
        imageZoomModal.style.display = 'none';
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
});
