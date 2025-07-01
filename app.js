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
let imageModal; // Questo ID non è presente nel tuo HTML, ma era dichiarato. L'ho lasciato per coerenza.
let closeImageModalButton; // Questo ID non è presente nel tuo HTML, ma era dichiarato.
let sunLightFilter; // Filtro per esposizione solare
let plantModalTitle;
let cardModal; // Questo ID non è presente nel tuo HTML, ma era dichiarato.
let closeCardModalButton; // Questo ID non è presente nel tuo HTML, ma era dichiarato.
let zoomedCardContent; // Questo ID non è presente nel tuo HTML, ma era dichiarato.

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
let currentLuxDisplay; // Per visualizzare il lux attuale (corretto ID)
let luxFeedbackPlantsContainer; // Il nuovo contenitore per il feedback specifico
let clearLuxFeedbackButton; // Il nuovo bottone per azzerare il feedback (corretto ID)
let clearLightFeedbackButton; // ID corretto per il bottone di azzeramento feedback luce

// Variabili per la gestione della fotocamera
let cameraModal;
let closeCameraModalButton;
let cameraFeed;
let cameraCanvas;
let capturedImagePreview;
let startCameraButton;
let takePhotoButton;
let stopCameraButton;
let cameraStream; // Per memorizzare il flusso della fotocamera

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
// Ho corretto l'ID da 'cardModal' a 'plantDetailModal' se intendevi la modale di dettaglio
function closeCardModal() {
    const detailModal = document.getElementById('plant-detail-modal'); // Assumi che questa sia la modale di dettaglio
    if (detailModal) {
        detailModal.style.display = 'none';
        // zoomedCardContent.innerHTML = ''; // Pulisci il contenuto se necessario
    }
}


// --- Funzioni di Autenticazione ---
function setupAuthListeners() {
    // Ho corretto gli ID di riferimento per i form di login/register
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Ho corretto gli ID dei link di toggle
    const showLoginLink = document.getElementById('showLoginLink');
    const showRegisterLink = document.getElementById('showRegisterLink');

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            loginError.textContent = '';
            registerError.textContent = '';
        });
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
            loginError.textContent = '';
            registerError.textContent = '';
        });
    }

    // Listener per il form di login
    const loginFormElement = document.querySelector('#login-form form');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value; // Corretto ID input
            const password = document.getElementById('loginPassword').value; // Corretto ID input
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
    }


    // Listener per il form di registrazione
    const registerFormElement = document.querySelector('#register-form form');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value; // Corretto ID input
            const password = document.getElementById('registerPassword').value; // Corretto ID input
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
    }

    // Listener per il logout
    if (logoutButton) {
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
}

// --- Funzioni di Interazione con Firestore e Storage ---

async function uploadImage(file) {
    if (!file) return null;

    const storageRef = storage.ref();
    const fileName = `plant_images/${Date.now()}_${file.name}`; // Nome unico per l'immagine
    const imageRef = storageRef.child(fileName);

    try {
        showToast('Caricamento immagine in corso...', 'info');
        const snapshot = await imageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        console.log('Immagine caricata con successo:', downloadURL);
        showToast('Immagine caricata con successo!', 'success');
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

    if (!user) {
        showToast('Devi essere autenticato per salvare una pianta.', 'error');
        hideLoadingSpinner();
        return;
    }

    let imageUrl = '';
    if (croppedImageBlob) {
        try {
            imageUrl = await uploadImage(croppedImageBlob);
        } catch (error) {
            hideLoadingSpinner();
            return;
        }
    } else if (currentPlantIdToUpdate) {
        const existingPlant = allPlants.find(p => p.id === currentPlantIdToUpdate);
        if (existingPlant) {
            imageUrl = existingPlant.imageUrl || '';
        }
    }

    const plantData = {
        name,
        category,
        description,
        sunLight, // Corretto: usa sunLight invece di sunlight
        tempMin,
        tempMax,
        watering,
        idealLuxMin,
        idealLuxMax,
        imageUrl, // URL dell'immagine caricata
        userId: user.uid, // Associa la pianta all'utente corrente
        createdAt: currentPlantIdToUpdate ? allPlants.find(p => p.id === currentPlantIdToUpdate).createdAt : firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (currentPlantIdToUpdate) {
            await db.collection('plants').doc(currentPlantIdToUpdate).update(plantData);
            showToast('Pianta aggiornata con successo!', 'success');
        } else {
            await db.collection('plants').add(plantData);
            showToast('Pianta aggiunta con successo!', 'success');
        }
        closePlantModal();
        loadAllPlants();
        loadMyGarden();
    } catch (error) {
        console.error("Errore nel salvare la pianta:", error);
        showToast(`Errore nel salvare la pianta: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function deletePlant(plantId) {
    if (!confirm('Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile!')) {
        return;
    }
    showLoadingSpinner();
    try {
        const plantToDelete = allPlants.find(p => p.id === plantId);
        if (plantToDelete && plantToDelete.imageUrl) {
            const imageRef = storage.refFromURL(plantToDelete.imageUrl);
            await imageRef.delete().catch(err => console.warn("Errore nell'eliminare l'immagine da Storage (potrebbe non esistere):", err));
        }

        await db.collection('plants').doc(plantId).delete();
        showToast('Pianta eliminata con successo dal database!', 'success');
        closePlantModal(); // Chiudi la modale di modifica/aggiunta
        loadAllPlants();
        loadMyGarden();
    } catch (error) {
        console.error("Errore nell'eliminazione della pianta:", error);
        showToast(`Errore nell'eliminazione della pianta: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione per mostrare il form con i dati di una pianta esistente per la modifica
async function openPlantModalForEdit(plant) {
    currentPlantIdToUpdate = plant.id;
    plantModalTitle.textContent = 'Modifica Pianta';
    saveUpdatePlantButton.textContent = 'Aggiorna Pianta';
    deletePlantButton.style.display = 'inline-block'; // Mostra il bottone elimina
    
    // Popola il form con i dati della pianta
    plantNameInput.value = plant.name || '';
    plantCategorySelect.value = plant.category || '';
    sunLightSelect.value = plant.sunLight || ''; // Corretto: usa plant.sunLight
    plantDescriptionTextarea.value = plant.description || '';
    plantTempMinInput.value = plant.tempMin || '';
    plantTempMaxInput.value = plant.tempMax || '';
    plantWateringInput.value = plant.watering || '';
    plantIdealLuxMinInput.value = plant.idealLuxMin || '';
    plantIdealLuxMaxInput.value = plant.idealLuxMax || '';
    
    if (plant.imageUrl) {
        plantImagePreview.src = plant.imageUrl;
        plantImagePreview.style.display = 'block';
    } else {
        plantImagePreview.src = 'assets/placeholder.webp'; // Immagine di fallback
        plantImagePreview.style.display = 'block'; // Mostra comunque il placeholder
    }
    
    croppedImageBlob = null; // Resetta il blob, verrà ricreato se l'immagine viene modificata
    currentFile = null; // Resetta il file originale

    plantModal.style.display = 'flex'; // Usa flex per centrare la modale
}

// Funzione per aggiungere una pianta al "Mio Giardino"
async function addPlantToMyGarden(plantId) {
    showLoadingSpinner();
    
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

    try {
        // Verifica se la pianta è già nel giardino dell'utente
        const docRef = db.collection('plants').doc(plantId);
        const doc = await docRef.get();

        if (doc.exists && doc.data().userId === user.uid) {
            showToast('Questa pianta è già nel tuo giardino!', 'info');
        } else {
            // Aggiorna la pianta esistente per assegnarla all'utente corrente
            await docRef.update({ userId: user.uid });
            showToast('Pianta aggiunta al tuo giardino!', 'success');
            loadAllPlants(); // Aggiorna la vista "Tutte le Piante"
            loadMyGarden(); // Aggiorna la vista "Mio Giardino"
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
    const user = currentUser; 
    if (!user) {
        showToast('Devi essere autenticato per rimuovere piante dal tuo giardino.', 'error');
        hideLoadingSpinner();
        return;
    }
    if (!confirm('Sei sicuro di voler rimuovere questa pianta dal tuo giardino? Non verrà eliminata dal database generale.')) {
        hideLoadingSpinner();
        return;
    }
    try {
        // Rimuovi il campo userId dalla pianta, rendendola "non di proprietà"
        await db.collection('plants').doc(plantId).update({
            userId: firebase.firestore.FieldValue.delete()
        });
        showToast('Pianta rimossa dal tuo giardino!', 'info');
        loadAllPlants(); // Aggiorna la vista "Tutte le Piante"
        loadMyGarden(); // Aggiorna la vista "Mio Giardino"
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
        let query = db.collection('plants');

        // Filtro per categoria
        if (categoryFilter.value && categoryFilter.value !== '') {
            query = query.where('category', '==', categoryFilter.value);
        }
        // Filtro per esposizione solare
        if (sunLightFilter.value && sunLightFilter.value !== '') {
            query = query.where('sunLight', '==', sunLightFilter.value); // Corretto: usa sunLight
        }
        // Filtro per temperatura (se entrambi min e max sono numeri validi)
        const minTemp = parseFloat(tempMinFilter.value);
        const maxTemp = parseFloat(tempMaxFilter.value);
        if (!isNaN(minTemp)) {
            query = query.where('tempMin', '>=', minTemp);
        }
        if (!isNaN(maxTemp)) {
            query = query.where('tempMax', '<=', maxTemp);
        }

        const snapshot = await query.get();
        let fetchedPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filtro per ricerca testuale (applicato lato client)
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            fetchedPlants = fetchedPlants.filter(plant =>
                plant.name.toLowerCase().includes(searchTerm) ||
                (plant.description && plant.description.toLowerCase().includes(searchTerm))
            );
        }

        allPlants = fetchedPlants; // Aggiorna la lista globale
        displayPlants(sortPlants(allPlants, sortBySelect.value)); // Visualizza le piante filtrate e ordinate
    } catch (error) {
        console.error("Errore nel caricamento di tutte le piante:", error);
        showToast(`Errore nel caricamento delle piante: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function loadMyGarden() {
    if (!currentUser) {
        myGarden = [];
        displayPlants([]); // Visualizza un giardino vuoto
        return;
    }
    showLoadingSpinner();
    try {
        let query = db.collection('plants').where('userId', '==', currentUser.uid);

        // Applica gli stessi filtri di ricerca e categoria anche al giardino
        if (categoryFilter.value && categoryFilter.value !== '') {
            query = query.where('category', '==', categoryFilter.value);
        }
        if (sunLightFilter.value && sunLightFilter.value !== '') {
            query = query.where('sunLight', '==', sunLightFilter.value);
        }
        const minTemp = parseFloat(tempMinFilter.value);
        const maxTemp = parseFloat(tempMaxFilter.value);
        if (!isNaN(minTemp)) {
            query = query.where('tempMin', '>=', minTemp);
        }
        if (!isNaN(maxTemp)) {
            query = query.where('tempMax', '<=', maxTemp);
        }

        const snapshot = await query.get();
        let fetchedGardenPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filtro per ricerca testuale (applicato lato client)
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            fetchedGardenPlants = fetchedGardenPlants.filter(plant =>
                plant.name.toLowerCase().includes(searchTerm) ||
                (plant.description && plant.description.toLowerCase().includes(searchTerm))
            );
        }

        myGarden = fetchedGardenPlants; // Aggiorna la lista del giardino
        displayPlants(sortPlants(myGarden, sortBySelect.value)); // Visualizza le piante del giardino filtrate e ordinate
    } catch (error) {
        console.error("Errore nel caricamento del mio giardino:", error);
        showToast(`Errore nel caricamento del tuo giardino: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione per ordinare le piante
function sortPlants(plants, sortBy) {
    return [...plants].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'name_asc':
                comparison = (a.name || '').localeCompare(b.name || '');
                break;
            case 'name_desc':
                comparison = (b.name || '').localeCompare(a.name || '');
                break;
            case 'category_asc':
                comparison = (a.category || '').localeCompare(b.category || '');
                break;
            case 'category_desc':
                comparison = (b.category || '').localeCompare(a.category || '');
                break;
            case 'timestamp_desc': // Ordina per le più recenti
                const dateA_desc = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
                const dateB_desc = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
                comparison = dateB_desc.getTime() - dateA_desc.getTime();
                break;
            case 'timestamp_asc': // Ordina per le meno recenti
                const dateA_asc = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
                const dateB_asc = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
                comparison = dateA_asc.getTime() - dateB_asc.getTime();
                break;
            case 'temp_asc':
                comparison = (a.tempMin || -Infinity) - (b.tempMin || -Infinity);
                break;
            case 'temp_desc':
                comparison = (b.tempMin || -Infinity) - (a.tempMin || -Infinity);
                break;
            default:
                comparison = (a.name || '').localeCompare(b.name || '');
                break;
        }
        return comparison;
    });
}

// Funzione per visualizzare le piante nel contenitore corretto
function displayPlants(plantsToDisplay) {
    const container = isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer;

    if (!container) {
        console.error("Contenitore piante non trovato!");
        return;
    }

    container.innerHTML = ''; // Pulisce il contenitore

    if (plantsToDisplay.length === 0) {
        const messageTemplate = document.getElementById('emptyGardenMessage');
        if (messageTemplate) {
            const emptyMessageClone = messageTemplate.content.cloneNode(true);
            if (!isMyGardenCurrentlyVisible) { // Se è la vista "Tutte le Piante"
                const p1 = emptyMessageClone.querySelector('p:first-child');
                const p2 = emptyMessageClone.querySelector('p:nth-child(2)');
                if (p1) p1.textContent = 'Nessuna pianta trovata con i filtri applicati.';
                if (p2) p2.textContent = 'Prova a modificare i criteri di ricerca.';
                const iconElement = emptyMessageClone.querySelector('.empty-message i'); 
                if (iconElement) {
                    iconElement.className = 'fas fa-search-minus'; // Icona di ricerca
                }
            }
            container.appendChild(emptyMessageClone);
        } else {
            container.innerHTML = '<p class="no-plants-message">Nessuna pianta trovata.</p>';
        }
        return;
    }

    plantsToDisplay.forEach(plant => {
        const card = document.createElement('div');
        card.className = 'plant-card';
        card.dataset.id = plant.id;

        const imageUrlToDisplay = plant.imageUrl || categoryIcons[plant.category] || categoryIcons['Altro'];

        card.innerHTML = `
            <img src="${imageUrlToDisplay}" alt="${plant.name}" class="plant-image">
            <h3>${plant.name}</h3>
            <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
            <p><strong>Esposizione Solare:</strong> ${plant.sunLight || 'N/A'}</p>
            <p><strong>Temperatura:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
            <p><strong>Luce:</strong> ${plant.idealLuxMin !== null && plant.idealLuxMax !== null ? `${plant.idealLuxMin} - ${plant.idealLuxMax} Lux` : 'N/A'}</p>
            <div class="card-actions">
                <button class="btn btn-details" data-id="${plant.id}"><i class="fas fa-info-circle"></i> Dettagli</button>
                ${(currentUser && plant.userId === currentUser.uid) ? 
                    `<button class="btn btn-edit" data-id="${plant.id}"><i class="fas fa-edit"></i> Modifica</button>
                     <button class="btn btn-danger" data-id="${plant.id}"><i class="fas fa-trash"></i> Elimina</button>` : ''
                }
                ${(currentUser && plant.userId !== currentUser.uid && !isMyGardenCurrentlyVisible) ? // Aggiungi solo se non è già dell'utente e non è nel mio giardino
                    `<button class="btn btn-primary add-to-garden-btn" data-id="${plant.id}"><i class="fas fa-plus-circle"></i> Aggiungi al Giardino</button>` : ''
                }
                ${(currentUser && plant.userId === currentUser.uid && isMyGardenCurrentlyVisible) ? // Rimuovi solo se è dell'utente e nel mio giardino
                    `<button class="btn btn-warning remove-from-garden-btn" data-id="${plant.id}"><i class="fas fa-minus-circle"></i> Rimuovi</button>` : ''
                }
            </div>
        `;
        container.appendChild(card);

        // Aggiungi listener per i bottoni "Dettagli"
        card.querySelector('.btn-details').addEventListener('click', (e) => {
            e.stopPropagation();
            showPlantDetailsModal(e.currentTarget.dataset.id);
        });

        // Aggiungi listener per i bottoni "Modifica" e "Elimina"
        const editBtn = card.querySelector('.btn-edit');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const plantToEdit = allPlants.find(p => p.id === e.currentTarget.dataset.id);
                if (plantToEdit) openPlantModalForEdit(plantToEdit);
            });
        }
        const deleteBtn = card.querySelector('.btn-danger');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deletePlant(e.currentTarget.dataset.id);
            });
        }

        // Aggiungi listener per i bottoni "Aggiungi al Giardino"
        const addToGardenBtn = card.querySelector('.add-to-garden-btn');
        if (addToGardenBtn) {
            addToGardenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addPlantToMyGarden(e.currentTarget.dataset.id);
            });
        }

        // Aggiungi listener per i bottoni "Rimuovi dal Giardino"
        const removeFromGardenBtn = card.querySelector('.remove-from-garden-btn');
        if (removeFromGardenBtn) {
            removeFromGardenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removePlantFromMyGarden(e.currentTarget.dataset.id);
            });
        }

        // Listener per lo zoom dell'immagine della card
        card.querySelector('.plant-image').addEventListener('click', (e) => {
            e.stopPropagation();
            openImageZoomModal(e.target.src);
        });
    });
}

// Funzione per mostrare i dettagli della pianta nella modale di dettaglio
function showPlantDetailsModal(plantId) {
    const plant = allPlants.find(p => p.id === plantId) || myGarden.find(p => p.id === plantId);
    if (!plant) {
        showToast('Dettagli pianta non trovati.', 'error');
        return;
    }

    const detailModal = document.getElementById('plant-detail-modal');
    const detailImage = document.getElementById('detail-plant-image');
    const detailName = document.getElementById('detail-plant-name');
    const detailDescription = document.getElementById('detail-plant-description');
    const detailCategory = document.getElementById('detail-plant-category');
    const detailSunLight = document.getElementById('detail-plant-sun-light');
    const detailTemperature = document.getElementById('detail-plant-temperature');
    const detailHumidity = document.getElementById('detail-plant-humidity');
    const detailFrequency = document.getElementById('detail-plant-frequency');
    const detailLastWatered = document.getElementById('detail-plant-last-watered');
    const detailNextWatering = document.getElementById('detail-next-watering');
    const detailWateringStatus = document.getElementById('detail-watering-status');
    const markWateredButton = document.getElementById('mark-watered-button');
    const addToGardenButtonDetail = document.getElementById('add-to-garden-button');
    const removeFromGardenButtonDetail = document.getElementById('remove-from-garden-button');
    const editPlantButtonDetail = document.getElementById('edit-plant-button');
    const deletePlantButtonDetail = document.getElementById('delete-plant-button');
    const googleLensButtonDetail = document.getElementById('google-lens-button');
    const getClimateButtonDetail = document.getElementById('get-climate-button');

    // Popola la modale
    detailImage.src = plant.imageUrl || categoryIcons[plant.category] || categoryIcons['Altro'];
    detailName.textContent = plant.name;
    detailDescription.textContent = plant.description || 'Nessuna descrizione.';
    detailCategory.textContent = plant.category || 'N/A';
    detailSunLight.textContent = plant.sunLight || 'N/A';
    detailTemperature.textContent = plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A';
    detailHumidity.textContent = plant.humidity || 'N/A';
    detailFrequency.textContent = plant.watering || 'N/A';
    detailLastWatered.textContent = plant.lastWatered || 'N/A';

    // Logica per prossima annaffiatura e stato
    if (plant.lastWatered && plant.wateringFrequencyDays) {
        const lastWateredDate = new Date(plant.lastWatered);
        const nextWateringDate = new Date(lastWateredDate);
        nextWateringDate.setDate(lastWateredDate.getDate() + parseInt(plant.wateringFrequencyDays));
        detailNextWatering.textContent = `Prossima Annaffiatura: ${nextWateringDate.toLocaleDateString('it-IT')}`;

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        nextWateringDate.setHours(0, 0, 0, 0);

        let wateringStatusClass = '';
        let wateringStatusText = '';

        if (now > nextWateringDate) {
            wateringStatusClass = 'status-overdue';
            wateringStatusText = 'Da Annaffiare!';
        } else if (now.getTime() === nextWateringDate.getTime()) {
            wateringStatusClass = 'status-today';
            wateringStatusText = 'Annaffiare Oggi!';
        } else {
            wateringStatusClass = 'status-ok';
            const diffTime = Math.abs(nextWateringDate - now);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            wateringStatusText = `Prossima annaffiatura tra ${diffDays} giorni`;
        }
        detailWateringStatus.className = `watering-status ${wateringStatusClass}`;
        detailWateringStatus.textContent = wateringStatusText;
    } else {
        detailNextWatering.textContent = 'Frequenza annaffiatura non specificata.';
        detailWateringStatus.textContent = '';
        detailWateringStatus.className = '';
    }

    // Gestione visibilità bottoni
    const isOwner = currentUser && plant.userId === currentUser.uid;
    editPlantButtonDetail.style.display = isOwner ? 'inline-block' : 'none';
    deletePlantButtonDetail.style.display = isOwner ? 'inline-block' : 'none';
    markWateredButton.style.display = isOwner ? 'inline-block' : 'none';

    const isInMyGarden = myGarden.some(p => p.id === plant.id);
    addToGardenButtonDetail.style.display = (!isOwner && !isInMyGarden) ? 'inline-block' : 'none';
    removeFromGardenButtonDetail.style.display = (isOwner && isInMyGarden) ? 'inline-block' : 'none';


    // Rimuovi vecchi listener per evitare duplicazioni
    markWateredButton.replaceWith(markWateredButton.cloneNode(true));
    markWateredButton = document.getElementById('mark-watered-button'); // Re-inizializza dopo replace
    markWateredButton.addEventListener('click', async () => {
        if (currentPlantIdToUpdate) {
            const today = new Date().toISOString().split('T')[0];
            await updatePlant(currentPlantIdToUpdate, { lastWatered: today });
            closeCardModal(); // Chiudi il modale dopo l'aggiornamento
        }
    });

    editPlantButtonDetail.replaceWith(editPlantButtonDetail.cloneNode(true));
    editPlantButtonDetail = document.getElementById('edit-plant-button');
    editPlantButtonDetail.addEventListener('click', () => {
        openPlantModalForEdit(plant);
        closeCardModal();
    });

    deletePlantButtonDetail.replaceWith(deletePlantButtonDetail.cloneNode(true));
    deletePlantButtonDetail = document.getElementById('delete-plant-button');
    deletePlantButtonDetail.addEventListener('click', () => {
        deletePlant(plant.id);
        closeCardModal();
    });

    addToGardenButtonDetail.replaceWith(addToGardenButtonDetail.cloneNode(true));
    addToGardenButtonDetail = document.getElementById('add-to-garden-button');
    addToGardenButtonDetail.addEventListener('click', () => {
        addPlantToMyGarden(plant.id);
        closeCardModal();
    });

    removeFromGardenButtonDetail.replaceWith(removeFromGardenButtonDetail.cloneNode(true));
    removeFromGardenButtonDetail = document.getElementById('remove-from-garden-button');
    removeFromGardenButtonDetail.addEventListener('click', () => {
        removePlantFromMyGarden(plant.id);
        closeCardModal();
    });

    // Listener per Google Lens e Clima all'interno della modale di dettaglio
    googleLensButtonDetail.replaceWith(googleLensButtonDetail.cloneNode(true));
    googleLensButtonDetail = document.getElementById('google-lens-button');
    googleLensButtonDetail.addEventListener('click', launchGoogleLens);

    getClimateButtonDetail.replaceWith(getClimateButtonDetail.cloneNode(true));
    getClimateButtonDetail = document.getElementById('get-climate-button');
    getClimateButtonDetail.addEventListener('click', getClimateData);

    // Listener per lo zoom dell'immagine nella modale di dettaglio
    detailImage.replaceWith(detailImage.cloneNode(true));
    const newDetailImage = document.getElementById('detail-plant-image'); // Re-ottenere l'elemento
    newDetailImage.addEventListener('click', () => openImageZoomModal(newDetailImage.src));


    detailModal.style.display = 'flex'; // Mostra la modale
}


// Funzione per chiudere tutte le modali aperte
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    // Resetta lo stato del cropper
    if (currentCropper) {
        currentCropper.destroy();
        currentCropper = null;
    }
    // Resetta lo stato della fotocamera
    stopCamera();
    // Resetta i campi del form pianta
    if (plantForm) plantForm.reset();
    if (plantImagePreview) plantImagePreview.src = '#';
    plantImagePreview.style.display = 'none';
    croppedImageBlob = null;
    currentFile = null;
    currentPlantIdToUpdate = null;
}


// --- Funzioni Sensore Luce ---

// Funzione per controllare la disponibilità del sensore e mostrare input manuale
function checkLightSensorAvailability() {
    if ('AmbientLightSensor' in window) {
        console.log('Sensore di luce ambientale disponibile.');
        if (startLightSensorButton) startLightSensorButton.style.display = 'inline-block';
        if (stopLightSensorButton) stopLightSensorButton.style.display = 'inline-block';
        if (manualLuxInputDiv) manualLuxInputDiv.style.display = 'none'; // Nasconde l'input manuale se il sensore è disponibile
    } else {
        console.log('Sensore di luce ambientale NON disponibile. Passaggio a input manuale.');
        showToast('Sensore luce non disponibile. Inserisci i valori manualmente.', 'info', 5000);
        if (startLightSensorButton) startLightSensorButton.style.display = 'none';
        if (stopLightSensorButton) stopLightSensorButton.style.display = 'none';
        if (manualLuxInputDiv) manualLuxInputDiv.style.display = 'block'; // Mostra l'input manuale
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
            if (currentLuxValueSpan) currentLuxValueSpan.textContent = ambientLightSensor.illuminance.toFixed(2);
            updateLightFeedback(ambientLightSensor.illuminance);
            if (clearLightFeedbackButton) {
                clearLightFeedbackButton.style.display = 'inline-block'; 
            }
        };
        ambientLightSensor.onerror = (event) => {
            console.error('Errore sensore di luce:', event.error.name, event.error.message);
            showToast(`Errore sensore di luce: ${event.error.message}`, 'error', 5000);
            stopLightSensor(); // Ferma il sensore in caso di errore
            checkLightSensorAvailability();
        };
        ambientLightSensor.start();
        showToast('Sensore di luce avviato!', 'success');
        console.log('Sensore di luce avviato.');
        if (manualLuxInputDiv) manualLuxInputDiv.style.display = 'none';
        clearLightFeedbackDisplay(); 
    } catch (error) {
        console.error('Errore nell\'avviare il sensore di luce:', error);
        showToast(`Impossibile avviare il sensore: ${error.message}`, 'error', 5000);
        if (manualLuxInputDiv) manualLuxInputDiv.style.display = 'block';
        checkLightSensorAvailability();
    }
}

function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
        if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'N/A';
        showToast('Sensore di luce fermato.', 'info');
        console.log('Sensore di luce fermato.');
        if (manualLuxInputDiv) manualLuxInputDiv.style.display = 'block';
        clearLightFeedbackDisplay(); 
    } else {
        showToast('Sensore non attivo.', 'info');
    }
}

function applyManualLux() {
    const manualLux = parseFloat(manualLuxInput.value);
    if (!isNaN(manualLux) && manualLux >= 0) {
        if (currentLuxValueSpan) currentLuxValueSpan.textContent = manualLux.toFixed(2);
        updateLightFeedback(manualLux);
        if (clearLightFeedbackButton) {
            clearLightFeedbackButton.style.display = 'inline-block';
        }
        showToast('Valore Lux manuale applicato.', 'success');
    } else {
        showToast('Inserisci un valore Lux valido (numero positivo).', 'error');
    }
}

function updateLightFeedback(luxValue) {
    if (!luxFeedbackPlantsContainer) {
        console.error("Elemento 'luxFeedbackPlantsContainer' non trovato.");
        return;
    }
    luxFeedbackPlantsContainer.innerHTML = ''; // Pulisci il feedback precedente

    let generalFeedback = '';
    if (luxValue < 50) {
        generalFeedback = 'Luce ambientale: molto bassa - ambiente buio.';
    } else if (luxValue < 200) {
        generalFeedback = 'Luce ambientale: bassa - adatto a piante d\'ombra profonda.';
    } else if (luxValue < 1000) {
        generalFeedback = 'Luce ambientale: media - ideale per piante d\'ombra o mezz\'ombra.';
    } else if (luxValue < 5000) {
        generalFeedback = 'Luce ambientale: buona - adatto a piante che amano la luce indiretta.';
    } else if (luxValue < 10000) {
        generalFeedback = 'Luce ambientale: alta - ideale per piante da pieno sole.';
    } else {
        generalFeedback = 'Luce ambientale: molto alta - ottimo per piante che amano il sole intenso.';
    }

    if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p>${generalFeedback}</p><hr>`;

    const relevantPlants = isMyGardenCurrentlyVisible ? myGarden : allPlants;

    if (relevantPlants && relevantPlants.length > 0) {
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML += `<h4>Feedback per le piante nel tuo giardino:</h4>`;
        relevantPlants.forEach(plant => {
            const minLux = plant.idealLuxMin;
            const maxLux = plant.idealLuxMax;
            let plantSpecificHtml = `<p><strong>${plant.name}:</strong> `;

            if (minLux === undefined || maxLux === undefined || minLux === null || maxLux === null) {
                plantSpecificHtml += `Dati Lux ideali non disponibili.`;
            } else if (luxValue >= minLux && luxValue <= maxLux) {
                plantSpecificHtml += `Condizioni di luce **Ideali** (${minLux}-${maxLux} Lux). <span style="color: #28a745;">&#10003;</span>`;
            } else if (luxValue < minLux) {
                plantSpecificHtml += `Luce **troppo bassa** (${luxValue.toFixed(0)} Lux), richiede almeno ${minLux} Lux. <span style="color: #dc3545;">&#10060;</span>`;
            } else { // luxValue > maxLux
                plantSpecificHtml += `Luce **troppo alta** (${luxValue.toFixed(0)} Lux), richiede al massimo ${maxLux} Lux. <span style="color: #dc3545;">&#10060;</span>`;
            }
            plantSpecificHtml += `</p>`;
            if (luxFeedbackPlantsContainer) luxFeedbackPlantsContainer.innerHTML += plantSpecificHtml;
        });
    } else {
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML += `<p>Nessuna pianta nel tuo giardino per un feedback specifico.</p>`;
    }

    if (clearLightFeedbackButton) {
        clearLightFeedbackButton.style.display = 'inline-block';
    }
}

function clearLightFeedbackDisplay() {
    if (luxFeedbackPlantsContainer) luxFeedbackPlantsContainer.innerHTML = '';
    if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p>Nessun feedback luce attivo.</p>';
    if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'N/A';
    if (manualLuxInput) manualLuxInput.value = '';
    if (clearLightFeedbackButton) clearLightFeedbackButton.style.display = 'none';
    showToast('Feedback luce azzerato.', 'info');
}

// --- Funzione di placeholder per Google Lens ---
// Questa funzione ora apre una modale per accedere alla fotocamera
function launchGoogleLens() {
    cameraModal.style.display = 'flex';
    // Non avviare la fotocamera automaticamente, l'utente deve cliccare "Avvia Fotocamera"
    // startCamera(); // Non chiamare qui, l'utente deve cliccare il bottone
    showToast('Clicca "Avvia Fotocamera" per iniziare.', 'info', 3000);
}

// --- Funzioni per la gestione della fotocamera ---
async function startCamera() {
    if (cameraStream) {
        showToast('Fotocamera già avviata.', 'info');
        return;
    }
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); // Preferisce la fotocamera posteriore
        cameraFeed.srcObject = cameraStream;
        cameraFeed.style.display = 'block';
        cameraCanvas.style.display = 'none';
        capturedImagePreview.style.display = 'none';

        startCameraButton.style.display = 'none';
        takePhotoButton.style.display = 'inline-block';
        stopCameraButton.style.display = 'inline-block';
        showToast('Fotocamera avviata!', 'success');
    } catch (error) {
        console.error('Errore nell\'accesso alla fotocamera:', error);
        showToast(`Errore: Impossibile accedere alla fotocamera. ${error.message}`, 'error', 5000);
        // Mostra il pulsante di avvio e nascondi gli altri in caso di errore
        startCameraButton.style.display = 'inline-block';
        takePhotoButton.style.display = 'none';
        stopCameraButton.style.display = 'none';
    }
}

function takePhoto() {
    if (!cameraStream) {
        showToast('Nessuna fotocamera attiva.', 'warning');
        return;
    }

    cameraCanvas.width = cameraFeed.videoWidth;
    cameraCanvas.height = cameraFeed.videoHeight;
    const context = cameraCanvas.getContext('2d');
    context.drawImage(cameraFeed, 0, 0, cameraCanvas.width, cameraCanvas.height);

    const imageDataURL = cameraCanvas.toDataURL('image/png');
    capturedImagePreview.src = imageDataURL;
    capturedImagePreview.style.display = 'block';
    cameraFeed.style.display = 'none'; // Nascondi il feed video dopo lo scatto
    showToast('Foto scattata!', 'success');

    // Opzionale: Converti in Blob se devi caricarla o processarla ulteriormente
    cameraCanvas.toBlob((blob) => {
        // Qui potresti fare qualcosa con il blob, ad esempio caricarlo su Firebase Storage
        // o prepararlo per un'analisi (richiederebbe un backend per Google Cloud Vision API)
        console.log('Immagine catturata come Blob:', blob);
        // Esempio: uploadImage(blob); // Se vuoi caricarla automaticamente
    }, 'image/png');
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        cameraFeed.srcObject = null;
        cameraFeed.style.display = 'none';
        capturedImagePreview.src = '#';
        capturedImagePreview.style.display = 'none';
        startCameraButton.style.display = 'inline-block';
        takePhotoButton.style.display = 'none';
        stopCameraButton.style.display = 'none';
        showToast('Fotocamera fermata.', 'info');
    }
}


// Funzione per recuperare i dati climatici da OpenWeatherMap
async function getClimateData() {
    showLoadingSpinner();
    // Ho corretto la chiave API con un placeholder. Inserisci la tua chiave API di OpenWeatherMap qui.
    const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; 

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=it`;
            const reverseGeocodeApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=it`; // Per ottenere il nome della città

            try {
                const weatherResponse = await fetch(weatherApiUrl);
                const weatherData = await weatherResponse.json();

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
    loginForm = document.getElementById('login-form'); 
    registerForm = document.getElementById('register-form'); 
    gardenContainer = document.getElementById('gardenContainer'); // Corretto ID
    myGardenContainer = document.getElementById('myGardenContainer'); // Corretto ID
    authContainerDiv = document.getElementById('auth-section'); // Corretto ID
    appContentDiv = document.getElementById('app-content'); // Corretto ID
    loginButton = document.getElementById('loginButton'); // Corretto ID
    registerButton = document.getElementById('registerButton'); // Corretto ID
    showLoginLink = document.getElementById('showLogin'); // Corretto ID
    showRegisterLink = document.getElementById('showRegister'); // Corretto ID
    emailInput = document.getElementById('loginEmail'); // Corretto ID
    passwordInput = document.getElementById('loginPassword'); // Corretto ID
    loginError = document.getElementById('loginError'); // Corretto ID
    registerEmailInput = document.getElementById('registerEmail'); // Corretto ID
    registerPasswordInput = document.getElementById('registerPassword'); // Corretto ID
    registerError = document.getElementById('registerError'); // Corretto ID
    authStatusSpan = document.getElementById('auth-status'); // Corretto ID
    logoutButton = document.getElementById('logoutButton'); // Corretto ID
    searchInput = document.getElementById('searchInput'); // Corretto ID
    categoryFilter = document.getElementById('categoryFilter'); // Corretto ID
    addNewPlantButton = document.getElementById('addNewPlantButton'); // Corretto ID
    showAllPlantsButton = document.getElementById('showAllPlantsButton'); // Corretto ID
    showMyGardenButton = document.getElementById('showMyGardenButton'); // Corretto ID
    plantsSectionHeader = document.getElementById('plantsSectionHeader'); // Corretto ID
    lightSensorContainer = document.getElementById('light-sensor-container'); // Corretto ID
    startLightSensorButton = document.getElementById('startLightSensorButton'); // Corretto ID
    stopLightSensorButton = document.getElementById('stopLightSensorButton'); // Corretto ID
    currentLuxValueSpan = document.getElementById('currentLuxValue'); // Corretto ID
    lightFeedbackDiv = document.getElementById('lightFeedback'); // Corretto ID
    manualLuxInputDiv = document.getElementById('manual-lux-input-group'); // Corretto ID
    manualLuxInput = document.getElementById('manualLuxInput'); // Corretto ID
    applyManualLuxButton = document.getElementById('applyManualLuxButton'); // Corretto ID
    luxFeedbackPlantsContainer = document.getElementById('luxFeedbackPlantsContainer'); // Corretto ID
    clearLightFeedbackButton = document.getElementById('clearLightFeedbackButton'); // Corretto ID

    tempMinFilter = document.getElementById('tempMinFilter'); // Corretto ID
    tempMaxFilter = document.getElementById('tempMaxFilter'); // Corretto ID
    sortBySelect = document.getElementById('sortBySelect'); // Corretto ID
    plantModal = document.getElementById('plantModal'); // Corretto ID
    plantForm = document.getElementById('plantForm'); // Corretto ID
    closePlantModalButton = document.getElementById('closePlantModalButton'); // Corretto ID
    plantNameInput = document.getElementById('plantName'); // Corretto ID
    plantCategorySelect = document.getElementById('plantCategory'); // Corretto ID
    sunLightSelect = document.getElementById('plantSunLight'); // Corretto ID
    plantDescriptionTextarea = document.getElementById('plantDescription'); // Corretto ID
    plantTempMinInput = document.getElementById('plantTempMin'); // Corretto ID
    plantTempMaxInput = document.getElementById('plantTempMax'); // Corretto ID
    plantWateringInput = document.getElementById('plantWatering'); // Corretto ID
    plantIdealLuxMinInput = document.getElementById('idealLuxMin'); // Corretto ID
    plantIdealLuxMaxInput = document.getElementById('idealLuxMax'); // Corretto ID
    plantImageInput = document.getElementById('plantImageInput'); // Corretto ID
    plantImagePreview = document.getElementById('plantImagePreview'); // Corretto ID
    saveUpdatePlantButton = document.getElementById('saveUpdatePlantButton'); // Corretto ID
    cancelUpdatePlantButton = document.getElementById('cancelUpdatePlantButton'); // Corretto ID
    deletePlantButton = document.getElementById('deletePlantButton'); // Corretto ID
    plantModalTitle = document.getElementById('plantModalTitle'); // Corretto ID

    cropImageModal = document.getElementById('cropImageModal'); // Corretto ID
    closeCropImageModalButton = document.getElementById('closeCropImageModalButton'); // Corretto ID
    imageToCrop = document.getElementById('imageToCrop'); // Corretto ID
    cropButton = document.getElementById('cropButton'); // Corretto ID

    imageZoomModal = document.getElementById('imageZoomModal'); // Corretto ID
    closeImageZoomModalButton = document.getElementById('closeImageZoomModalButton'); // Corretto ID
    imageZoomDisplay = document.getElementById('imageZoomDisplay'); // Corretto ID

    rotateLeftButton = document.getElementById('rotateLeftButton'); // Corretto ID
    rotateRightButton = document.getElementById('rotateRightButton'); // Corretto ID
    zoomInButton = document.getElementById('zoomInButton'); // Corretto ID
    zoomOutButton = document.getElementById('zoomOutButton'); // Corretto ID

    getClimateButton = document.getElementById('fetch-weather-button'); // Corretto ID
    locationNameSpan = document.getElementById('location-name'); // Corretto ID
    currentTempSpan = document.getElementById('current-temp'); // Corretto ID
    weatherDescriptionSpan = document.getElementById('weather-description'); // Corretto ID
    humiditySpan = document.getElementById('humidity'); // Corretto ID
    windSpeedSpan = document.getElementById('wind-speed'); // Corretto ID
    lastUpdatedSpan = document.getElementById('last-updated'); // Corretto ID
    googleLensButton = document.getElementById('googleLensButton'); // Corretto ID

    // Inizializzazione variabili per la fotocamera
    cameraModal = document.getElementById('cameraModal');
    closeCameraModalButton = document.getElementById('closeCameraModalButton');
    cameraFeed = document.getElementById('cameraFeed');
    cameraCanvas = document.getElementById('cameraCanvas');
    capturedImagePreview = document.getElementById('capturedImagePreview');
    startCameraButton = document.getElementById('startCameraButton');
    takePhotoButton = document.getElementById('takePhotoButton');
    stopCameraButton = document.getElementById('stopCameraButton');

    // Setup iniziale
    setupAuthListeners();
    setupImageCropping(); // Inizializza la logica di ritaglio
    checkLightSensorAvailability(); // Controlla la disponibilità del sensore di luce

    // Event Listeners principali
    addNewPlantButton.addEventListener('click', openAddNewPlantModal);
    closePlantModalButton.addEventListener('click', closeAllModals); // Chiude tutte le modali
    plantForm.addEventListener('submit', savePlantToFirestore);
    cancelUpdatePlantButton.addEventListener('click', closeAllModals); // Chiude tutte le modali
    deletePlantButton.addEventListener('click', () => deletePlant(currentPlantIdToUpdate));

    showAllPlantsButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = false;
        plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
        gardenContainer.style.display = 'grid'; // Usa grid per la visualizzazione delle card
        myGardenContainer.style.display = 'none';
        showAllPlantsButton.classList.add('active');
        showMyGardenButton.classList.remove('active');
        loadAllPlants();
    });

    showMyGardenButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = true;
        plantsSectionHeader.textContent = 'Il Mio Giardino';
        gardenContainer.style.display = 'none';
        myGardenContainer.style.display = 'grid'; // Usa grid per la visualizzazione delle card
        showMyGardenButton.classList.add('active');
        showAllPlantsButton.classList.remove('active');
        loadMyGarden();
    });

    // Event Listeners per i filtri e l'ordinamento
    searchInput.addEventListener('input', applyFiltersAndSort);
    categoryFilter.addEventListener('change', applyFiltersAndSort);
    sunLightFilter.addEventListener('change', applyFiltersAndSort);
    tempMinFilter.addEventListener('input', applyFiltersAndSort);
    tempMaxFilter.addEventListener('input', applyFiltersAndSort);
    sortBySelect.addEventListener('change', applyFiltersAndSort);

    // Event Listeners per il sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);
    if (applyManualLuxButton) applyManualLuxButton.addEventListener('click', applyManualLux);
    if (clearLightFeedbackButton) clearLightFeedbackButton.addEventListener('click', clearLightFeedbackDisplay);

    // Event Listener per Google Lens (apre la modale della fotocamera)
    if (googleLensButton) googleLensButton.addEventListener('click', launchGoogleLens);

    // Event Listeners per la modale della fotocamera
    if (startCameraButton) startCameraButton.addEventListener('click', startCamera);
    if (takePhotoButton) takePhotoButton.addEventListener('click', takePhoto);
    if (stopCameraButton) stopCameraButton.addEventListener('click', stopCamera);
    if (closeCameraModalButton) closeCameraModalButton.addEventListener('click', closeAllModals); // Chiude tutte le modali

    // Event Listener per il Clima
    if (getClimateButton) getClimateButton.addEventListener('click', getClimateData);

    // Chiudi le modali cliccando fuori
    window.addEventListener('click', (e) => {
        if (e.target === plantModal) closeAllModals();
        if (e.target === document.getElementById('plant-detail-modal')) closeAllModals(); // ID corretto per la modale di dettaglio
        if (e.target === cropImageModal) closeAllModals();
        if (e.target === imageZoomModal) closeAllModals();
        if (e.target === cameraModal) closeAllModals();
    });

    // Gestore dello stato di autenticazione (già presente e corretto)
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
            allPlants = [];
            myGarden = [];
            displayPlants([]);
        }
    });
});
