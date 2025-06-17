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
let manualLuxInput; // Nuovo: input per lux manuale
let applyManualLuxButton; // Nuovo: bottone per applicare lux manuale
let tempMinFilter;
let tempMaxFilter;
let sortBySelect; // Selettore per l'ordinamento
let plantModal;
let plantForm;
let closePlantModalButton;
let plantNameInput;
let plantCategorySelect;
let plantDescriptionTextarea;
let plantTempMinInput;
let plantTempMaxInput;
let plantWateringInput;
let plantLightInput;
let plantImageInput;
let plantImagePreview;
let saveUpdatePlantButton;
let cancelUpdatePlantButton;
let deletePlantButton;
let imageModal;
let closeImageModalButton;
let imageToCrop;
let cropButton;
let cardModal;
let closeCardModalButton;
let zoomedCardContent;
let zoomedPlantImage;
let getClimateButton;
let locationNameSpan;
let currentTempSpan;
let weatherDescriptionSpan;
let humiditySpan;
let windSpeedSpan;
let lastUpdatedSpan;
let googleLensButton; // variabile...

// Definizione delle icone generiche per categoria (per la vista "Tutte le Piante")
const categoryIcons = {
    'Sole Pieno': 'assets/category_icons/sun_icon.png', // Devi creare queste immagini!
    'Mezz\'ombra': 'assets/category_icons/partial_shade_icon.png',
    'Ombra': 'assets/category_icons/shade_icon.png',
    'Pianta Grassa': 'assets/category_icons/succulent_icon.png',
    'Fiore': 'assets/category_icons/flower_icon.png',
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
    zoomedPlantImage.src = ''; // Pulisci l'immagine
    zoomedPlantImage.style.display = 'none'; // Nascondi l'immagine
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

    // Gestore dello stato di autenticazione
    auth.onAuthStateChanged(user => {
        if (user) {
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
    const description = plantDescriptionTextarea.value;
    const tempMin = plantTempMinInput.value ? parseFloat(plantTempMinInput.value) : null;
    const tempMax = plantTempMaxInput.value ? parseFloat(plantTempMaxInput.value) : null;
    const watering = plantWateringInput.value;
    const light = plantLightInput.value ? parseFloat(plantLightInput.value) : null;
    const user = auth.currentUser;

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
        tempMin,
        tempMax,
        watering,
        light,
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
        plantDescriptionTextarea.value = plantToEdit.description || '';
        plantTempMinInput.value = plantToEdit.tempMin || '';
        plantTempMaxInput.value = plantToEdit.tempMax || '';
        plantWateringInput.value = plantToEdit.watering || '';
        plantLightInput.value = plantToEdit.light || '';

        // Mostra l'anteprima dell'immagine esistente
        if (plantToEdit.imageUrl) {
            plantImagePreview.src = plantToEdit.imageUrl;
            plantImagePreview.style.display = 'block';
        } else {
            plantImagePreview.style.display = 'none';
            plantImagePreview.src = '#';
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
    const user = auth.currentUser;
    if (!user) {
        showToast('Devi essere autenticato per aggiungere piante al tuo giardino.', 'error');
        hideLoadingSpinner();
        return;
    }

    try {
        // Verifica se la pianta è già nel giardino dell'utente
        const docRef = db.collection('users').doc(user.uid).collection('myGarden').doc(plantId);
        const doc = await docRef.get();

        if (doc.exists) {
            showToast('Questa pianta è già nel tuo giardino!', 'info');
        } else {
            // Aggiungi solo l'ID della pianta e il riferimento alla collezione "myGarden" dell'utente
            await docRef.set({
                plantId: plantId,
                addedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showToast('Pianta aggiunta al tuo giardino!', 'success');
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
    const user = auth.currentUser;
    if (!user) {
        showToast('Devi essere autenticato per rimuovere piante dal tuo giardino.', 'error');
        hideLoadingSpinner();
        return;
    }

    if (!confirm('Sei sicuro di voler rimuovere questa pianta dal tuo giardino?')) {
        hideLoadingSpinner();
        return;
    }

    try {
        await db.collection('users').doc(user.uid).collection('myGarden').doc(plantId).delete();
        showToast('Pianta rimossa dal tuo giardino!', 'info');
        loadMyGarden(); // Ricarica il mio giardino
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
    const user = auth.currentUser;
    if (!user) {
        myGarden = [];
        applyFiltersAndSort();
        hideLoadingSpinner();
        return;
    }

    try {
        querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        console.log('Contenuto grezzo dello snapshot della collezione gardens:',
        const myGardenSnapshot = await db.collection('users').doc(user.uid).collection('gardens').get();
        const plantIdsInMyGarden = myGardenSnapshot.docs.map(doc => doc.data().plantId);
        console.log('ID delle piante estratte dal mio giardino (plantIdsInMyGarden):', plantIdsInMyGarden);
        console.log('ID di tutte le piante disponibili (allPlants):', allPlants.map(plant => plant.id));
        // Filtra `allPlants` per ottenere solo quelle presenti in `gardens` dell'utente
        myGarden = allPlants.filter(plant => plantIdsInMyGarden.includes(plant.id));
        console.log('Piante nel mio giardino dopo il filtraggio (myGarden):', myGarden);
        applyFiltersAndSort(); // Applica i filtri e l'ordinamento
    } catch (error) {
        console.error("Errore nel caricamento del mio giardino:", error);
        showToast(`Errore nel caricamento del giardino: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

function applyFiltersAndSort() {
    let filteredPlants = isMyGardenCurrentlyVisible ? [...myGarden] : [...allPlants];

    // Filtra per ricerca
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredPlants = filteredPlants.filter(plant =>
            plant.name.toLowerCase().includes(searchTerm) ||
            plant.category.toLowerCase().includes(searchTerm) ||
            (plant.description && plant.description.toLowerCase().includes(searchTerm))
        );
    }

    // Filtra per categoria
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
        filteredPlants = filteredPlants.filter(plant => plant.category === selectedCategory);
    }

    // Filtra per temperatura minima
    const minTemp = parseFloat(tempMinFilter.value);
    if (!isNaN(minTemp)) {
        filteredPlants = filteredPlants.filter(plant => plant.tempMin !== null && plant.tempMin >= minTemp);
    }

    // Filtra per temperatura massima
    const maxTemp = parseFloat(tempMaxFilter.value);
    if (!isNaN(maxTemp)) {
        filteredPlants = filteredPlants.filter(plant => plant.tempMax !== null && plant.tempMax <= maxTemp);
    }

    // Applica ordinamento
    switch (currentSortBy) {
        case 'name_asc':
            filteredPlants.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name_desc':
            filteredPlants.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'category_asc':
            filteredPlants.sort((a, b) => a.category.localeCompare(b.category));
            break;
        case 'category_desc':
            filteredPlants.sort((a, b) => b.category.localeCompare(a.category));
            break;
        case 'temp_asc':
            filteredPlants.sort((a, b) => (a.tempMin === null ? Infinity : a.tempMin) - (b.tempMin === null ? Infinity : b.tempMin));
            break;
        case 'temp_desc':
            filteredPlants.sort((a, b) => (b.tempMin === null ? -Infinity : b.tempMin) - (a.tempMin === null ? -Infinity : a.tempMin));
            break;
    }

    displayPlants(filteredPlants);
}

function displayAllPlants() {
    isMyGardenCurrentlyVisible = false;
    plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
    gardenContainer.style.display = 'flex'; // Mostra il contenitore delle piante globali
    myGardenContainer.style.display = 'none'; // Nasconde il contenitore del giardino
    applyFiltersAndSort(); // Applica filtri e ordinamento
}

function displayMyGarden() {
    isMyGardenCurrentlyVisible = true;
    plantsSectionHeader.textContent = 'Le Tue Piante in Giardino';
    gardenContainer.style.display = 'none'; // Nasconde il contenitore delle piante globali
    myGardenContainer.style.display = 'flex'; // Mostra il contenitore del giardino
    applyFiltersAndSort(); // Applica filtri e ordinamento
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
        // Modifica il messaggio in base alla vista corrente
        if (!isMyGardenCurrentlyVisible) { // Se è la vista "Tutte le Piante"
            emptyMessageClone.querySelector('p').textContent = 'Nessuna pianta trovata con i filtri applicati.';
            emptyMessageClone.querySelector('p:nth-child(2)').textContent = 'Prova a modificare i criteri di ricerca.';
            emptyMessageClone.querySelector('i').className = 'fas fa-search-minus';
        }
        container.appendChild(emptyMessageClone);
        return;
    }

    plantsToDisplay.forEach(plant => {
        let imageUrlToDisplay;

        if (isMyGardenCurrentlyVisible) {
            // Se siamo in "Mio Giardino", usa l'immagine caricata dall'utente se esiste
            // Altrimenti, usa l'icona generica della categoria
            imageUrlToDisplay = plant.imageUrl || categoryIcons[plant.category] || categoryIcons['Altro'];
        } else {
            // Se siamo in "Tutte le Piante", usa sempre l'icona generica in base alla categoria
            imageUrlToDisplay = categoryIcons[plant.category] || categoryIcons['Altro'];
        }

        const plantCard = document.createElement('div');
        plantCard.className = 'plant-card';
        plantCard.dataset.id = plant.id;

        // Listener per la modale di dettaglio della card
        plantCard.addEventListener('click', (e) => {
            // Assicurati che il click non sia su un bottone di azione
            if (!e.target.closest('.card-actions button')) {
                showPlantDetailsModal(plant.id);
            }
        });

        plantCard.innerHTML = `
            <img src="${imageUrlToDisplay}" alt="${plant.name}" class="plant-image">
            <h3>${plant.name}</h3>
            <p><strong>Categoria:</strong> ${plant.category}</p>
            <p><strong>Temperatura:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
            <p><strong>Luce:</strong> ${plant.light !== null ? `${plant.light} Lux` : 'N/A'}</p>
            <div class="card-actions">
                ${isMyGardenCurrentlyVisible ? `<button class="btn btn-edit" data-id="${plant.id}"><i class="fas fa-edit"></i> Modifica</button>` : ''}
                ${isMyGardenCurrentlyVisible ? `<button class="btn btn-remove" data-id="${plant.id}"><i class="fas fa-minus-circle"></i> Rimuovi dal Giardino</button>` : `<button class="btn btn-add" data-id="${plant.id}"><i class="fas fa-plus-circle"></i> Aggiungi al Giardino</button>`}
            </div>
        `;
        container.appendChild(plantCard);

        // Aggiungi listener per i bottoni "Modifica", "Rimuovi" e "Aggiungi"
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
        zoomedPlantImage.src = detailsImageUrl;
        zoomedPlantImage.alt = `Immagine di ${plant.name}`;
        zoomedPlantImage.style.display = 'block'; // Assicurati che l'immagine sia visibile

        const detailsHtml = `
            <h2>${plant.name}</h2>
            <img id="zoomed-plant-image-display" src="${detailsImageUrl}" alt="Immagine di ${plant.name}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
            <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
            <p><strong>Descrizione:</strong> ${plant.description || 'N/A'}</p>
            <p><strong>Temperatura:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
            <p><strong>Luce (Lux):</strong> ${plant.light !== null ? plant.light : 'N/A'}</p>
            <p><strong>Annaffiatura:</strong> ${plant.watering || 'N/A'}</p>
            <p><strong>Aggiunta il:</strong> ${plant.createdAt ? new Date(plant.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
            ${plant.updatedAt ? `<p><strong>Ultimo aggiornamento:</strong> ${new Date(plant.updatedAt.toDate()).toLocaleDateString()}</p>` : ''}
        `;
        zoomedCardContent.innerHTML = detailsHtml;
        cardModal.style.display = 'flex';
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
        };
        ambientLightSensor.onerror = (event) => {
            console.error("Errore sensore luce:", event.error.name, event.error.message);
            showToast(`Errore sensore luce: ${event.error.message}`, 'error', 5000);
            stopLightSensor(); // Ferma il sensore in caso di errore
            checkLightSensorAvailability(); // Forse passa a manuale se l'errore è persistente
        };
        ambientLightSensor.start();
        showToast('Sensore luce avviato!', 'success');
        console.log('Sensore luce avviato.');
    } catch (error) {
        console.error("Errore nell'avvio del sensore luce:", error);
        showToast(`Errore nell'avvio del sensore luce: ${error.message}`, 'error', 5000);
        checkLightSensorAvailability(); // Passa a manuale se l'avvio fallisce
    }
}

function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        showToast('Sensore luce fermato.', 'info');
        console.log('Sensore luce fermato.');
        currentLuxValueSpan.textContent = 'N/A';
        lightFeedbackDiv.textContent = '';
    } else {
        showToast('Sensore non attivo.', 'info');
    }
}

function updateLightFeedback(lux) {
    let feedback = '';
    if (lux < 50) {
        feedback = 'Luce molto bassa - ambiente buio.';
    } else if (lux < 200) {
        feedback = 'Luce bassa - adatto a piante d\'ombra profonda.';
    } else if (lux < 1000) {
        feedback = 'Luce media - ideale per piante d\'ombra o mezz\'ombra.';
    } else if (lux < 5000) {
        feedback = 'Luce buona - adatto a piante che amano la luce indiretta.';
    } else if (lux < 10000) {
        feedback = 'Luce alta - ideale per piante da pieno sole.';
    } else {
        feedback = 'Luce molto alta - ottimo per piante che amano il sole intenso.';
    }
    lightFeedbackDiv.textContent = feedback;
}

// Funzione per applicare i lux inseriti manualmente
function applyManualLux() {
    const manualLux = parseFloat(manualLuxInput.value);
    if (!isNaN(manualLux) && manualLux >= 0) {
        currentLuxValueSpan.textContent = manualLux.toFixed(2);
        updateLightFeedback(manualLux);
        showToast(`Lux manuali (${manualLux}) applicati.`, 'success');
    } else {
        showToast('Per favore, inserisci un valore Lux valido.', 'error');
    }
}


// --- Funzioni API Clima ---

async function getWeather(latitude, longitude) {
    showLoadingSpinner();
    const apiKey = '0575afa377367478348aa48bfc9936ba'; // Tua chiave API OpenWeatherMap
    const lang = 'it'; // Lingua italiana
    const units = 'metric'; // Unità metriche (Celsius)
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&lang=${lang}&units=${units}`;

    try {
        const response = await fetch(weatherApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Dati meteo:', data);

        // Aggiorna i dati nel DOM
        locationNameSpan.textContent = data.name || 'Sconosciuta';
        currentTempSpan.textContent = `${data.main.temp}°C`;
        weatherDescriptionSpan.textContent = data.weather[0].description;
        humiditySpan.textContent = `${data.main.humidity}%`;
        windSpeedSpan.textContent = `${data.wind.speed} m/s`;
        lastUpdatedSpan.textContent = new Date().toLocaleTimeString();
        showToast('Clima aggiornato!', 'success');
    } catch (error) {
        console.error('Errore nel recupero del meteo:', error);
        showToast(`Errore nel recupero del meteo: ${error.message}`, 'error');
        // Pulisci i campi se c'è un errore
        locationNameSpan.textContent = 'N/A';
        currentTempSpan.textContent = 'N/A';
        weatherDescriptionSpan.textContent = 'N/A';
        humiditySpan.textContent = 'N/A';
        windSpeedSpan.textContent = 'N/A';
        lastUpdatedSpan.textContent = 'N/A';
    } finally {
        hideLoadingSpinner();
    }
}

async function getLocation() {
    showLoadingSpinner(); // Show spinner when starting geolocation attempt

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                // Success callback
                console.log('Posizione ottenuta:', position.coords.latitude, position.coords.longitude);
                try {
                    await getWeather(position.coords.latitude, position.coords.longitude);
                } catch (weatherError) {
                    console.error('Errore durante il recupero del meteo:', weatherError);
                    showToast(`Errore meteo: ${weatherError.message}`, 'error');
                } finally {
                    hideLoadingSpinner(); // Hide on success or error of getWeather
                }
            },
            (error) => {
                // Error callback
                console.error('Errore di geolocalizzazione:', error);
                showToast(`Impossibile ottenere la posizione: ${error.message}`, 'error');
                hideLoadingSpinner(); // Hide on error! THIS IS LIKELY THE MISSING PIECE
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Opzioni geolocalizzazione
        );
    } else {
        // Geolocation not supported
        showToast('Geolocalizzazione non supportata dal tuo browser.', 'error');
        hideLoadingSpinner(); // Hide if not supported
    }
}


// --- Funzione Google Lens (Placeholder) ---
function launchGoogleLens() {
    // Implementazione molto limitata. Google Lens non ha una API diretta per essere lanciata.
    // L'uso ideale sarebbe tramite un'applicazione mobile nativa, o una web API specifica per l'identificazione di immagini.
    // Questo è un placeholder e potrebbe non funzionare come ci si aspetta su tutti i dispositivi/browser.
    showToast("Google Lens richiede un'integrazione complessa o l'uso tramite l'app nativa.", "info", 5000);
    console.warn("La funzionalità Google Lens non è implementata direttamente via API web. Questo è un placeholder.");

    // Un'alternativa rudimentale potrebbe essere reindirizzare a Google Immagini con un'immagine pre-caricata,
    // ma questo richiede l'upload dell'immagine prima del redirect.
    // Esempio (non provato e richiede un URL immagine valido):
    // const imageUrlForLens = "URL_DELL_IMMAGINE_CARICATA_SU_STORAGE";
    // window.open(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrlForLens)}`, '_blank');
}


// --- Inizializzazione DOM e Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
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
    plantsSectionHeader = document.getElementById('plantsSectionHeader'); // Header della sezione piante
    lightSensorContainer = document.getElementById('light-sensor-container');
    startLightSensorButton = document.getElementById('startLightSensorButton');
    stopLightSensorButton = document.getElementById('stopLightSensorButton');
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback');
    manualLuxInputDiv = document.getElementById('manual-lux-input'); // Nuovo
    manualLuxInput = document.getElementById('manualLuxInput'); // Nuovo
    applyManualLuxButton = document.getElementById('applyManualLuxButton'); // Nuovo
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    sortBySelect = document.getElementById('sortBySelect');

    plantModal = document.getElementById('plantModal');
    plantForm = document.getElementById('plantForm');
    closePlantModalButton = document.getElementById('closePlantModalButton');
    plantNameInput = document.getElementById('plantName');
    plantCategorySelect = document.getElementById('plantCategory');
    plantDescriptionTextarea = document.getElementById('plantDescription');
    plantTempMinInput = document.getElementById('plantTempMin');
    plantTempMaxInput = document.getElementById('plantTempMax');
    plantWateringInput = document.getElementById('plantWatering');
    plantLightInput = document.getElementById('plantLight');
    plantImageInput = document.getElementById('plantImageInput');
    plantImagePreview = document.getElementById('plantImagePreview');
    saveUpdatePlantButton = document.getElementById('saveUpdatePlantButton');
    cancelUpdatePlantButton = document.getElementById('cancelUpdatePlantButton');
    deletePlantButton = document.getElementById('deletePlant');

    imageModal = document.getElementById('imageModal');
    closeImageModalButton = document.getElementById('closeImageModalButton');
    imageToCrop = document.getElementById('imageToCrop');
    cropButton = document.getElementById('cropButton');

    cardModal = document.getElementById('cardModal');
    closeCardModalButton = document.getElementById('closeCardModalButton');
    zoomedCardContent = document.getElementById('zoomed-card-content');
    zoomedPlantImage = document.getElementById('zoomed-plant-image-display'); // Assicurati che l'ID sia corretto nell'HTML per l'immagine zoomata

    getClimateButton = document.getElementById('getClimateButton');
    locationNameSpan = document.getElementById('location-name');
    currentTempSpan = document.getElementById('current-temp');
    weatherDescriptionSpan = document.getElementById('weather-description');
    humiditySpan = document.getElementById('humidity');
    windSpeedSpan = document.getElementById('wind-speed');
    lastUpdatedSpan = document.getElementById('last-updated');
    googleLensButton = document.getElementById('googleLensButton');


    // Setup Event Listeners
    setupAuthListeners();

    // Filtri e ordinamento
    searchInput.addEventListener('input', applyFiltersAndSort);
    categoryFilter.addEventListener('change', applyFiltersAndSort);
    tempMinFilter.addEventListener('input', applyFiltersAndSort);
    tempMaxFilter.addEventListener('input', applyFiltersAndSort);
    sortBySelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        applyFiltersAndSort();
    });

    // Event listener per il pulsante "Aggiungi Nuova Pianta"
    addNewPlantButton.addEventListener('click', () => {
        plantForm.reset(); // Resetta il form
        plantImagePreview.style.display = 'none'; // Nascondi anteprima
        plantImagePreview.src = '#'; // Pulisci la sorgente
        saveUpdatePlantButton.textContent = 'Salva Nuova Pianta';
        deletePlantButton.style.display = 'none'; // Nasconde il bottone elimina per nuova pianta
        currentPlantIdToUpdate = null; // Resetta ID per nuova pianta
        croppedImageBlob = null; // Resetta il blob
        currentFile = null; // Resetta il file
        plantModal.style.display = 'flex'; // Mostra la modale
    });

    // Event listener per il pulsante "Annulla" nel form
    cancelUpdatePlantButton.addEventListener('click', () => {
        plantModal.style.display = 'none';
        plantForm.reset();
        plantImagePreview.style.display = 'none';
        plantImagePreview.src = '#';
        croppedImageBlob = null;
        currentFile = null;
    });

    // Event listener per il pulsante "Elimina Pianta dal Database"
    if (deletePlantButton) {
        deletePlantButton.addEventListener('click', (e) => {
            if (currentPlantIdToUpdate) {
                deletePlantFromFirestore(currentPlantIdToUpdate);
            }
        });
    }

    // Gestione dell'input immagine e Cropper.js
    plantImageInput.addEventListener('change', (e) => {
        currentFile = e.target.files[0];
        if (currentFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imageToCrop.src = event.target.result;
                imageModal.style.display = 'flex';
                if (currentCropper) {
                    currentCropper.destroy();
                }
                currentCropper = new Cropper(imageToCrop, {
                    aspectRatio: 1, // Immagine quadrata
                    viewMode: 1, // Restringe l'area di ritaglio alle dimensioni del canvas
                });
            };
            reader.readAsDataURL(currentFile);
        }
    });

    cropButton.addEventListener('click', () => {
        if (currentCropper) {
            currentCropper.getCroppedCanvas({
                width: 400, // Risoluzione desiderata
                height: 400,
            }).toBlob((blob) => {
                croppedImageBlob = blob;
                // Mostra l'immagine ritagliata nell'anteprima del form
                const reader = new FileReader();
                reader.onload = (event) => {
                    plantImagePreview.src = event.target.result;
                    plantImagePreview.style.display = 'block';
                    document.querySelector('.image-upload-status').textContent = 'Immagine ritagliata e pronta.';
                };
                reader.readAsDataURL(blob);
                imageModal.style.display = 'none'; // Chiudi la modale di ritaglio
            }, 'image/jpeg'); // Formato dell'immagine finale
        }
    });

    // Event listener per il form di salvataggio/aggiornamento della pianta
    plantForm.addEventListener('submit', savePlantToFirestore);

    // Event Listeners per la navigazione tra le viste
    if (showAllPlantsButton) showAllPlantsButton.addEventListener('click', displayAllPlants);
    if (showMyGardenButton) showMyGardenButton.addEventListener('click', displayMyGarden);

    // Chiusura modali (listener per il click sul bottone 'x' e sullo sfondo della modale)
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => { imageModal.style.display = 'none'; });
    if (imageModal) imageModal.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.style.display = 'none'; });

    // La chiusura della cardModal è gestita dalla funzione closeCardModal()
    // e gli event listener sono attaccati dinamicamente o alla modale stessa
    if (cardModal) cardModal.addEventListener('click', (e) => {
        // Chiudi se cliccato sullo sfondo e non su un elemento interno alla form
        if (e.target === cardModal && !e.target.closest('.modal-content-card')) {
            closeCardModal();
        }
    });

    // Event Listeners per il sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);
    if (applyManualLuxButton) applyManualLuxButton.addEventListener('click', applyManualLux); // Nuovo listener

    // Esegui il controllo del sensore all'avvio
    checkLightSensorAvailability();

    // Event Listener per Google Lens (placeholder)
    if (googleLensButton) googleLensButton.addEventListener('click', launchGoogleLens);

    // Event Listener per il Clima
    if (getClimateButton) getClimateButton.addEventListener('click', getLocation);
});
