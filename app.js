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
        const imageUrl = croppedImageBlob ? await uploadImage(croppedImageBlob) : plantImagePreview.src; // Usa l'immagine ritagliata

        const plantData = {
            name,
            category,
            sunLight,
            description,
            tempMin,
            tempMax,
            watering,
            idealLuxMin,
            idealLuxMax,
            imageUrl,
            userId: currentUser.uid, // Associa la pianta all'utente corrente
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Aggiungi un timestamp
        };

        try {
            if (currentPlantIdToUpdate) {
                // Modifica pianta esistente
                await db.collection('plants').doc(currentPlantIdToUpdate).update(plantData);
                showToast('Pianta aggiornata con successo!', 'success');
            } else {
                // Aggiungi nuova pianta
                await db.collection('plants').add(plantData);
                showToast('Pianta aggiunta con successo!', 'success');
            }
            closePlantModal();
            loadAllPlants(); // Ricarica le piante per aggiornare la visualizzazione
            loadMyGarden(); // Ricarica anche il giardino se stiamo modificando una pianta che potrebbe esserci
        } catch (error) {
            console.error('Errore durante il salvataggio della pianta:', error);
            showToast(`Errore: ${error.message}`, 'error');
        } finally {
            hideLoadingSpinner();
        }
    }

    async function deletePlant(plantId) {
        if (!confirm('Sei sicuro di voler eliminare questa pianta?')) {
            return;
        }
        showLoadingSpinner();
        try {
            // Rimuovi l'immagine associata da Firebase Storage se esiste
            const plantRef = db.collection('plants').doc(plantId);
            const doc = await plantRef.get();
            if (doc.exists) {
                const plantData = doc.data();
                if (plantData.imageUrl) {
                    const imageRef = storage.refFromURL(plantData.imageUrl);
                    await imageRef.delete().catch(error => {
                        console.warn('Impossibile eliminare l\'immagine da Storage (potrebbe non esistere o permessi insufficienti):', error);
                    });
                }
            }

            await plantRef.delete();
            showToast('Pianta eliminata con successo!', 'success');
            closePlantModal();
            loadAllPlants(); // Ricarica per aggiornare la lista
            loadMyGarden();
        } catch (error) {
            console.error('Errore durante l\'eliminazione della pianta:', error);
            showToast(`Errore: ${error.message}`, 'error');
        } finally {
            hideLoadingSpinner();
        }
    }


    // Funzione per caricare tutte le piante da Firestore
    async function loadAllPlants() {
        showLoadingSpinner();
        try {
            let query = db.collection('plants');

            // Applica filtri
            if (categoryFilter.value !== '') {
                query = query.where('category', '==', categoryFilter.value);
            }
            if (sunLightFilter.value !== '') {
                query = query.where('sunLight', '==', sunLightFilter.value);
            }

            // Aggiungi filtro temperatura (se entrambi min e max sono numeri validi)
            const minTemp = parseFloat(tempMinFilter.value);
            const maxTemp = parseFloat(tempMaxFilter.value);

            if (!isNaN(minTemp)) {
                query = query.where('tempMin', '>=', minTemp);
            }
            if (!isNaN(maxTemp)) {
                query = query.where('tempMax', '<=', maxTemp);
            }


            const snapshot = await query.get();
            allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Applica la ricerca testuale dopo aver filtrato
            const searchTerm = searchInput.value.toLowerCase();
            const filteredAndSearchedPlants = allPlants.filter(plant =>
                plant.name.toLowerCase().includes(searchTerm) ||
                plant.description.toLowerCase().includes(searchTerm)
            );

            // Applica ordinamento
            displayPlants(sortPlants(filteredAndSearchedPlants, currentSortBy));
        } catch (error) {
            console.error('Errore durante il caricamento delle piante:', error);
            showToast(`Errore nel caricamento delle piante: ${error.message}`, 'error');
        } finally {
            hideLoadingSpinner();
        }
    }


    // Funzione per caricare le piante dell'utente (il suo giardino)
    async function loadMyGarden() {
        if (!currentUser) {
            myGarden = [];
            displayMyGardenPlants([]);
            return;
        }
        showLoadingSpinner();
        try {
            const snapshot = await db.collection('plants')
                                    .where('userId', '==', currentUser.uid)
                                    .get();
            myGarden = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            displayMyGardenPlants(sortPlants(myGarden, currentSortBy));
        } catch (error) {
            console.error('Errore durante il caricamento del giardino:', error);
            showToast(`Errore nel caricamento del giardino: ${error.message}`, 'error');
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
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'name_desc':
                    comparison = b.name.localeCompare(a.name);
                    break;
                case 'category_asc':
                    comparison = a.category.localeCompare(b.category);
                    break;
                case 'category_desc':
                    comparison = b.category.localeCompare(a.category);
                    break;
                case 'timestamp_desc': // Ordina per le più recenti
                    comparison = b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime();
                    break;
                case 'timestamp_asc': // Ordina per le meno recenti
                    comparison = a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime();
                    break;
                // Puoi aggiungere altri criteri qui
            }
            return comparison;
        });
    }

    // Funzione per visualizzare le piante
    function displayPlants(plantsToDisplay) {
        gardenContainer.innerHTML = ''; // Pulisci il contenitore
        if (plantsToDisplay.length === 0) {
            gardenContainer.innerHTML = '<p class="no-plants-message">Nessuna pianta trovata con i criteri selezionati.</p>';
            return;
        }

        plantsToDisplay.forEach(plant => {
            const card = createPlantCard(plant);
            gardenContainer.appendChild(card);
        });
    }

    function displayMyGardenPlants(plantsToDisplay) {
        myGardenContainer.innerHTML = ''; // Pulisci il contenitore
        if (plantsToDisplay.length === 0) {
            myGardenContainer.innerHTML = '<p class="no-plants-message">Nessuna pianta aggiunta al tuo giardino.</p>';
            return;
        }

        plantsToDisplay.forEach(plant => {
            const card = createPlantCard(plant, true); // Passa true per indicare che è nel mio giardino
            myGardenContainer.appendChild(card);
        });
    }


    // Funzione per creare una card pianta
    function createPlantCard(plant, isInMyGarden = false) {
        const card = document.createElement('div');
        card.className = 'plant-card';
        card.dataset.id = plant.id;

        const imageUrl = plant.imageUrl || 'assets/placeholder.webp';
        const imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.alt = plant.name;
        imageElement.className = 'plant-image';
        imageElement.addEventListener('click', () => openImageZoomModal(imageUrl)); // Event listener per lo zoom
        card.appendChild(imageElement);

        // Icona della categoria
        const categoryIconSrc = categoryIcons[plant.category] || categoryIcons['Altro'];
        const categoryIcon = document.createElement('img');
        categoryIcon.src = categoryIconSrc;
        categoryIcon.alt = plant.category;
        categoryIcon.className = 'category-icon';
        card.appendChild(categoryIcon);

        const nameElement = document.createElement('h3');
        nameElement.textContent = plant.name;
        card.appendChild(nameElement);

        const categoryElement = document.createElement('p');
        categoryElement.textContent = `Categoria: ${plant.category}`;
        card.appendChild(categoryElement);

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = plant.description;
        descriptionElement.className = 'plant-description'; // Aggiungi classe per stile
        card.appendChild(descriptionElement);


        const detailsList = document.createElement('ul');
        detailsList.className = 'plant-details-list';

        const sunLightItem = document.createElement('li');
        sunLightItem.innerHTML = `<i class="fa-solid fa-sun"></i> Esposizione: <span>${plant.sunLight}</span>`;
        detailsList.appendChild(sunLightItem);

        const tempItem = document.createElement('li');
        tempItem.innerHTML = `<i class="fa-solid fa-temperature-half"></i> Temp. Ideale: <span>${plant.tempMin}°C - ${plant.tempMax}°C</span>`;
        detailsList.appendChild(tempItem);

        const wateringItem = document.createElement('li');
        wateringItem.innerHTML = `<i class="fa-solid fa-droplet"></i> Irrigazione: <span>${plant.watering}</span>`;
        detailsList.appendChild(wateringItem);

        const luxItem = document.createElement('li');
        luxItem.innerHTML = `<i class="fa-solid fa-lightbulb"></i> Lux Ideale: <span>${plant.idealLuxMin} - ${plant.idealLuxMax} Lux</span>`;
        detailsList.appendChild(luxItem);

        card.appendChild(detailsList);

        // Contenitore per i bottoni
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'plant-card-actions';

        if (currentUser && plant.userId === currentUser.uid) {
            // Bottoni per modificare ed eliminare (solo per le proprie piante)
            const editButton = document.createElement('button');
            editButton.className = 'btn btn-secondary';
            editButton.innerHTML = '<i class="fa-solid fa-edit"></i> Modifica';
            editButton.addEventListener('click', () => openPlantModalForEdit(plant));
            buttonContainer.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger';
            deleteButton.innerHTML = '<i class="fa-solid fa-trash-alt"></i> Elimina';
            deleteButton.addEventListener('click', () => deletePlant(plant.id));
            buttonContainer.appendChild(deleteButton);
        }

        // Bottone per aggiungere/rimuovere dal giardino
        if (currentUser && !isInMyGarden) {
            const addToGardenButton = document.createElement('button');
            addToGardenButton.className = 'btn btn-primary add-to-garden-btn';
            addToGardenButton.innerHTML = '<i class="fa-solid fa-leaf"></i> Aggiungi al Giardino';
            addToGardenButton.addEventListener('click', () => addPlantToMyGarden(plant.id));
            buttonContainer.appendChild(addToGardenButton);
        } else if (currentUser && isInMyGarden) {
            const removeFromGardenButton = document.createElement('button');
            removeFromGardenButton.className = 'btn btn-warning remove-from-garden-btn';
            removeFromGardenButton.innerHTML = '<i class="fa-solid fa-leaf"></i> Rimuovi dal Giardino';
            removeFromGardenButton.addEventListener('click', () => removePlantFromMyGarden(plant.id));
            buttonContainer.appendChild(removeFromGardenButton);
        }

        card.appendChild(buttonContainer);

        return card;
    }


    // Funzione per aprire la modale della pianta in modalità aggiungi
    function openAddNewPlantModal() {
        currentPlantIdToUpdate = null;
        plantForm.reset(); // Pulisce i campi del form
        plantModalTitle.textContent = 'Aggiungi Nuova Pianta';
        saveUpdatePlantButton.textContent = 'Aggiungi Pianta';
        cancelUpdatePlantButton.style.display = 'inline-block';
        deletePlantButton.style.display = 'none'; // Nascondi il bottone di eliminazione per le nuove piante
        plantImagePreview.src = 'assets/placeholder.webp'; // Reset dell'immagine di preview
        croppedImageBlob = null; // Resetta il blob dell'immagine ritagliata
        currentFile = null; // Resetta il file originale
        plantModal.style.display = 'block';
    }

    // Funzione per aprire la modale della pianta in modalità modifica
    async function openPlantModalForEdit(plant) {
        currentPlantIdToUpdate = plant.id;
        plantModalTitle.textContent = 'Modifica Pianta';
        saveUpdatePlantButton.textContent = 'Aggiorna Pianta';
        cancelUpdatePlantButton.style.display = 'inline-block';
        deletePlantButton.style.display = 'inline-block'; // Mostra il bottone di eliminazione
        
        // Popola il form con i dati della pianta
        plantNameInput.value = plant.name;
        plantCategorySelect.value = plant.category;
        sunLightSelect.value = plant.sunLight;
        plantDescriptionTextarea.value = plant.description;
        plantTempMinInput.value = plant.tempMin || '';
        plantTempMaxInput.value = plant.tempMax || '';
        plantWateringInput.value = plant.watering;
        plantIdealLuxMinInput.value = plant.idealLuxMin || '';
        plantIdealLuxMaxInput.value = plant.idealLuxMax || '';
        plantImagePreview.src = plant.imageUrl || 'assets/placeholder.webp';
        croppedImageBlob = null; // Resetta il blob, verrà ricreato se l'immagine viene modificata
        currentFile = null; // Resetta il file originale

        plantModal.style.display = 'block';
    }

    // Funzione per chiudere la modale della pianta
    function closePlantModal() {
        plantModal.style.display = 'none';
        plantForm.reset(); // Pulisce il form al di là dell'ID
        currentPlantIdToUpdate = null; // Resetta l'ID della pianta in modifica
        if (currentCropper) {
            currentCropper.destroy(); // Distruggi l'istanza di Cropper.js
            currentCropper = null;
        }
        imageToCrop.src = ''; // Pulisci l'immagine nella modale di ritaglio
        plantImageInput.value = ''; // Resetta l'input del file
    }

    // Funzione per applicare filtri e ordinamento
    function applyFiltersAndSort() {
        if (isMyGardenCurrentlyVisible) {
            loadMyGarden(); // Ricarica solo le piante del giardino con i filtri
        } else {
            loadAllPlants(); // Ricarica tutte le piante con i filtri
        }
    }


    // Listener per il cambio di visualizzazione (Tutte le piante / Mio Giardino)
    function togglePlantView(showMyGarden) {
        isMyGardenCurrentlyVisible = showMyGarden;
        if (showMyGarden) {
            document.getElementById('all-plants-section').style.display = 'none';
            document.getElementById('my-garden-section').style.display = 'block';
            plantsSectionHeader.textContent = 'Il Mio Giardino';
            showAllPlantsButton.classList.remove('active');
            showMyGardenButton.classList.add('active');
            loadMyGarden(); // Carica le piante del giardino
        } else {
            document.getElementById('all-plants-section').style.display = 'block';
            document.getElementById('my-garden-section').style.display = 'none';
            plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
            showMyGardenButton.classList.remove('active');
            showAllPlantsButton.classList.add('active');
            loadAllPlants(); // Carica tutte le piante
        }
        // Applica i filtri e l'ordinamento dopo aver cambiato vista
        applyFiltersAndSort();
    }


    // Aggiungi e rimuovi dal giardino (semplificato: la pianta ha un campo userId)
    async function addPlantToMyGarden(plantId) {
        if (!currentUser) {
            showToast('Devi essere loggato per aggiungere piante al tuo giardino!', 'error');
            return;
        }
        showLoadingSpinner();
        try {
            await db.collection('plants').doc(plantId).update({
                userId: currentUser.uid // Assegna la pianta all'utente corrente
            });
            showToast('Pianta aggiunta al tuo giardino!', 'success');
            loadAllPlants(); // Aggiorna la vista "Tutte le Piante"
            loadMyGarden(); // Aggiorna la vista "Mio Giardino"
        } catch (error) {
            console.error('Errore nell\'aggiungere la pianta al giardino:', error);
            showToast(`Errore: ${error.message}`, 'error');
        } finally {
            hideLoadingSpinner();
        }
    }

    async function removePlantFromMyGarden(plantId) {
        if (!currentUser) {
            showToast('Devi essere loggato per rimuovere piante dal tuo giardino!', 'error');
            return;
        }
        if (!confirm('Sei sicuro di voler rimuovere questa pianta dal tuo giardino? Non la eliminerai dalla lista generale.')) {
            return;
        }
        showLoadingSpinner();
        try {
            await db.collection('plants').doc(plantId).update({
                userId: firebase.firestore.FieldValue.delete() // Rimuovi il campo userId
            });
            showToast('Pianta rimossa dal tuo giardino!', 'info');
            loadAllPlants(); // Aggiorna la vista "Tutte le Piante"
            loadMyGarden(); // Aggiorna la vista "Mio Giardino"
        } catch (error) {
            console.error('Errore nel rimuovere la pianta dal giardino:', error);
            showToast(`Errore: ${error.message}`, 'error');
        } finally {
            hideLoadingSpinner();
        }
    }

    // --- Gestione sensore di luce ambientale ---

    function checkLightSensorAvailability() {
        if ('AmbientLightSensor' in window) {
            lightSensorContainer.style.display = 'block';
            showToast('Sensore di luce ambientale disponibile.', 'info');
        } else {
            lightSensorContainer.style.display = 'none';
            showToast('Sensore di luce ambientale non disponibile su questo dispositivo.', 'warning');
            // Mostra l'input manuale se il sensore non è disponibile
            manualLuxInputDiv.style.display = 'block';
        }
    }

    function startLightSensor() {
        if (ambientLightSensor) {
            showToast('Sensore già attivo.', 'info');
            return;
        }

        try {
            ambientLightSensor = new AmbientLightSensor();
            ambientLightSensor.onreading = () => {
                currentLuxValueSpan.textContent = ambientLightSensor.illuminance;
                updateLightFeedback(ambientLightSensor.illuminance);
            };
            ambientLightSensor.onerror = (event) => {
                console.error('Errore sensore di luce:', event.error.name, event.error.message);
                showToast(`Errore sensore di luce: ${event.error.message}`, 'error');
            };
            ambientLightSensor.start();
            showToast('Sensore di luce avviato.', 'success');
            // Nascondi l'input manuale quando il sensore è attivo
            manualLuxInputDiv.style.display = 'none';
            clearLightFeedbackDisplay(); // Pulisce il feedback precedente
        } catch (error) {
            console.error('Errore nell\'avviare il sensore di luce:', error);
            showToast(`Impossibile avviare il sensore: ${error.message}`, 'error');
            // Mostra l'input manuale se c'è un errore nell'avvio
            manualLuxInputDiv.style.display = 'block';
        }
    }

    function stopLightSensor() {
        if (ambientLightSensor) {
            ambientLightSensor.stop();
            ambientLightSensor = null;
            currentLuxValueSpan.textContent = 'N/D';
            showToast('Sensore di luce fermato.', 'info');
            // Mostra l'input manuale quando il sensore è fermato
            manualLuxInputDiv.style.display = 'block';
        }
    }

    function applyManualLux() {
        const manualLux = parseFloat(manualLuxInput.value);
        if (!isNaN(manualLux) && manualLux >= 0) {
            currentLuxValueSpan.textContent = manualLux;
            updateLightFeedback(manualLux);
            showToast('Valore Lux manuale applicato.', 'success');
        } else {
            showToast('Inserisci un valore Lux valido (numero positivo).', 'error');
        }
    }

    // Funzione per aggiornare il feedback visivo basato sul livello di luce
    function updateLightFeedback(luxValue) {
        luxFeedbackPlantsContainer.innerHTML = ''; // Pulisci il feedback precedente

        let relevantPlants = isMyGardenCurrentlyVisible ? myGarden : allPlants;

        relevantPlants.forEach(plant => {
            const feedbackCard = document.createElement('div');
            feedbackCard.className = 'light-feedback-card';

            const name = document.createElement('h4');
            name.textContent = plant.name;
            feedbackCard.appendChild(name);

            const idealLux = document.createElement('p');
            idealLux.textContent = `Lux Ideale: ${plant.idealLuxMin} - ${plant.idealLuxMax}`;
            feedbackCard.appendChild(idealLux);

            const feedbackMessage = document.createElement('p');
            feedbackMessage.className = 'feedback-message';

            if (luxValue >= plant.idealLuxMin && luxValue <= plant.idealLuxMax) {
                feedbackMessage.textContent = 'Luce Ottimale!';
                feedbackMessage.classList.add('optimal');
            } else if (luxValue < plant.idealLuxMin) {
                feedbackMessage.textContent = 'Troppa Poca Luce!';
                feedbackMessage.classList.add('low-light');
            } else {
                feedbackMessage.textContent = 'Troppa Luce!';
                feedbackMessage.classList.add('high-light');
            }
            feedbackCard.appendChild(feedbackMessage);
            luxFeedbackPlantsContainer.appendChild(feedbackCard);
        });
    }

    function clearLightFeedbackDisplay() {
        luxFeedbackPlantsContainer.innerHTML = ''; // Pulisce solo il contenitore del feedback
        showToast('Feedback luce azzerato.', 'info');
    }

    // --- Gestione Clima (OpenWeatherMap) ---
    // Inserisci qui la tua chiave API di OpenWeatherMap
    const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; 

    async function getClimateData() {
        if (navigator.geolocation) {
            showLoadingSpinner();
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=it`;

                try {
                    const response = await fetch(weatherApiUrl);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    displayClimateData(data);
                    showToast('Dati climatici aggiornati!', 'success');
                } catch (error) {
                    console.error('Errore nel recupero dei dati climatici:', error);
                    showToast(`Errore nel recupero clima: ${error.message}`, 'error');
                } finally {
                    hideLoadingSpinner();
                }
            }, (error) => {
                console.error('Errore geolocalizzazione:', error);
                showToast(`Errore geolocalizzazione: ${error.message}`, 'error');
                hideLoadingSpinner();
            });
        } else {
            showToast('Geolocalizzazione non supportata dal tuo browser.', 'warning');
        }
    }

    function displayClimateData(data) {
        locationNameSpan.textContent = data.name;
        currentTempSpan.textContent = `${data.main.temp}°C`;
        weatherDescriptionSpan.textContent = data.weather[0].description;
        humiditySpan.textContent = `${data.main.humidity}%`;
        windSpeedSpan.textContent = `${data.wind.speed} m/s`;
        lastUpdatedSpan.textContent = new Date(data.dt * 1000).toLocaleString();
    }

    // --- Gestione Immagini e Cropper.js ---

    function setupImageCropping() {
        plantImageInput.addEventListener('change', (event) => {
            currentFile = event.target.files[0];
            if (currentFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imageToCrop.src = e.target.result;
                    cropImageModal.style.display = 'block';

                    if (currentCropper) {
                        currentCropper.destroy();
                    }
                    currentCropper = new Cropper(imageToCrop, {
                        aspectRatio: 1, // Imposta un rapporto di aspetto 1:1 (quadrato)
                        viewMode: 1, // Limita l'area di ritaglio alla dimensione del canvas
                        minCropBoxWidth: 100,
                        minCropBoxHeight: 100,
                    });
                };
                reader.readAsDataURL(currentFile);
            }
        });

        cropButton.addEventListener('click', () => {
            if (currentCropper) {
                currentCropper.getCroppedCanvas({
                    width: 400, // Risoluzione desiderata per l'immagine ritagliata
                    height: 400,
                }).toBlob((blob) => {
                    croppedImageBlob = blob;
                    plantImagePreview.src = URL.createObjectURL(blob);
                    cropImageModal.style.display = 'none';
                    showToast('Immagine ritagliata con successo!', 'success');
                }, 'image/jpeg', 0.9); // Qualità JPEG
            }
        });

        // Event listeners per i controlli di Cropper.js
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
    }

    function openImageZoomModal(imageUrl) {
        imageZoomDisplay.src = imageUrl;
        imageZoomModal.style.display = 'block';
    }

    function closeImageZoomModal() {
        imageZoomModal.style.display = 'none';
        imageZoomDisplay.src = '';
    }

    // --- Funzionalità Google Lens (Placeholder) ---
    function launchGoogleLens() {
        showToast('Funzionalità Google Lens non implementata in questa demo. Sarà integrata in futuro.', 'info', 5000);
        // Qui potresti reindirizzare a Google Lens o usare un'API se disponibile
        // window.open('https://lens.google.com/', '_blank');
    }


    // --- Inizializzazione DOM e Event Listeners ---
    document.addEventListener('DOMContentLoaded', () => {
        // Inizializzazione variabili DOM
        gardenContainer = document.getElementById('gardenContainer');
        myGardenContainer = document.getElementById('myGardenContainer');
        authContainerDiv = document.getElementById('auth-section');
        appContentDiv = document.getElementById('app-content');
        loginButton = document.getElementById('loginButton');
        registerButton = document.getElementById('registerButton');
        showLoginLink = document.getElementById('showLogin');
        showRegisterLink = document.getElementById('showRegister');
        emailInput = document.getElementById('loginEmail');
        passwordInput = document.getElementById('loginPassword');
        loginError = document.getElementById('loginError');
        registerEmailInput = document.getElementById('registerEmail');
        registerPasswordInput = document.getElementById('registerPassword');
        registerError = document.getElementById('registerError');
        authStatusSpan = document.getElementById('auth-status');
        logoutButton = document.getElementById('logoutButton');
        searchInput = document.getElementById('searchInput');
        categoryFilter = document.getElementById('categoryFilter');
        addNewPlantButton = document.getElementById('addNewPlantButton');
        showAllPlantsButton = document.getElementById('showAllPlantsButton');
        showMyGardenButton = document.getElementById('showMyGardenButton');
        plantsSectionHeader = document.getElementById('plantsSectionHeader');
        lightSensorContainer = document.getElementById('lightSensorContainer');
        startLightSensorButton = document.getElementById('startLightSensorButton');
        stopLightSensorButton = document.getElementById('stopLightSensorButton');
        currentLuxValueSpan = document.getElementById('currentLuxValue');
        lightFeedbackDiv = document.getElementById('lightFeedback');
        manualLuxInputDiv = document.getElementById('manualLuxInputDiv');
        manualLuxInput = document.getElementById('manualLuxInput'); // Assicurati di avere questo ID nell'HTML
        applyManualLuxButton = document.getElementById('applyManualLuxButton');
        currentLuxDisplay = document.getElementById('currentLuxDisplay');
        luxFeedbackPlantsContainer = document.getElementById('luxFeedbackPlantsContainer');
        clearLightFeedbackButton = document.getElementById('clearLightFeedbackButton');


        tempMinFilter = document.getElementById('tempMinFilter');
        tempMaxFilter = document.getElementById('tempMaxFilter');
        sortBySelect = document.getElementById('sortBy');
        plantModal = document.getElementById('plantModal');
        plantForm = document.getElementById('plantForm');
        closePlantModalButton = document.getElementById('closePlantModalButton');
        plantNameInput = document.getElementById('plantName');
        plantCategorySelect = document.getElementById('plantCategory');
        sunLightSelect = document.getElementById('plantSunLight');
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
        closeImageModalButton = document.getElementById('closeImageModalButton');
        sunLightFilter = document.getElementById('sunLightFilter');
        plantModalTitle = document.getElementById('plantModalTitle');
        cardModal = document.getElementById('cardModal');
        closeCardModalButton = document.getElementById('closeCardModalButton');
        zoomedCardContent = document.getElementById('zoomedCardContent');


        getClimateButton = document.getElementById('getClimateButton');
        locationNameSpan = document.getElementById('locationName');
        currentTempSpan = document.getElementById('currentTemp');
        weatherDescriptionSpan = document.getElementById('weatherDescription');
        humiditySpan = document.getElementById('humidity');
        windSpeedSpan = document.getElementById('windSpeed');
        lastUpdatedSpan = document.getElementById('lastUpdated');

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

        // Esporta i servizi che userai
        const auth = firebase.auth();
        const db = firebase.firestore();
        const storage = firebase.storage();
        const messaging = firebase.messaging(); // Aggiungi se usi Firebase Messaging
        setupAuthListeners();


        // Event Listeners
        searchInput.addEventListener('input', applyFiltersAndSort);
        categoryFilter.addEventListener('change', applyFiltersAndSort);
        tempMinFilter.addEventListener('input', applyFiltersAndSort);
        tempMaxFilter.addEventListener('input', applyFiltersAndSort);
        sortBySelect.addEventListener('change', applyFiltersAndSort);

        addNewPlantButton.addEventListener('click', openAddNewPlantModal);
        closePlantModalButton.addEventListener('click', closePlantModal);
        plantForm.addEventListener('submit', savePlantToFirestore);
        cancelUpdatePlantButton.addEventListener('click', closePlantModal);

        showAllPlantsButton.addEventListener('click', () => togglePlantView(false));
        showMyGardenButton.addEventListener('click', () => togglePlantView(true));

        // Chiudi le modali cliccando fuori dal contenuto
        plantModal.addEventListener('click', (e) => {
            if (e.target === plantModal) {
                closePlantModal();
            }
        });
        cardModal.addEventListener('click', (e) => {
            if (e.target === cardModal) {
                closeCardModal();
            }
        });
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                closeImageModal();
            }
        });
        closeImageModalButton.addEventListener('click', closeImageModal);

        setupImageCropping(); // Inizializza Cropper.js
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

    });
});
