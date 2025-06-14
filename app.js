// Variabili globali per lo stato dell'applicazione
let allPlants = [];
let myGarden = [];
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
let plantsSectionHeader; // Header della sezione piante (es. "Tutte le Piante Disponibili")
let lightSensorContainer;
let startLightSensorButton;
let stopLightSensorButton;
let currentLuxValueSpan;
let lightFeedbackDiv;
let tempMinFilter;
let tempMaxFilter;
let sortBySelect; // Selettore per l'ordinamento
let googleLensButton; //variabile per il pulsante di Google Lens (non presente nel codice HTML attuale ma potenzialmente aggiunta)

// Variabili per i modali
let plantFormModal;
let closePlantFormModalButton;
let plantFormTitle;
let plantForm;
let plantNameInput;
let scientificNameInput;
let plantCategorySelect;
let wateringFrequencyInput;
let sunlightNeedsSelect;
let luxMinInput;
let luxMaxInput;
let tempMinInput;
let tempMaxInput;
let plantDescriptionTextarea;
let plantImageInput;
let imagePreview;
let saveUpdatePlantButton;
let cancelUpdatePlantButton;
let deletePlantButton; // Bottone per eliminare pianta dal database

let imageModal; // Modale per lo zoom dell'immagine
let closeImageModalButton;
let zoomedImage;

let cardModal; // Modale per lo zoom della card
let closeCardModalButton;
let zoomedCardContent;

let loadingSpinner; // Spinner di caricamento
let toastContainer; // Contenitore per i toast notifications


// Variabili per i messaggi di errore degli input
let nameError;
let categoryError;
let wateringError;
let imageError;


// Inizializzazione DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inizializza tutte le variabili DOM
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden');
    authContainerDiv = document.getElementById('authContainer');
    appContentDiv = document.getElementById('mainAppContent');
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
    lightFeedbackDiv = document.getElementById('lightFeedback');
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    sortBySelect = document.getElementById('sortBySelect');

    // Variabili per i modali
    plantFormModal = document.getElementById('plantFormModal');
    closePlantFormModalButton = document.getElementById('closePlantFormModalButton');
    plantFormTitle = document.getElementById('plantFormTitle');
    plantForm = document.getElementById('plantForm');
    plantNameInput = document.getElementById('plantName');
    scientificNameInput = document.getElementById('scientificName');
    plantCategorySelect = document.getElementById('plantCategory');
    wateringFrequencyInput = document.getElementById('wateringFrequency');
    sunlightNeedsSelect = document.getElementById('sunlightNeeds');
    luxMinInput = document.getElementById('luxMin');
    luxMaxInput = document.getElementById('luxMax');
    tempMinInput = document.getElementById('tempMin');
    tempMaxInput = document.getElementById('tempMax');
    plantDescriptionTextarea = document.getElementById('plantDescription');
    plantImageInput = document.getElementById('plantImage');
    imagePreview = document.getElementById('imagePreview');
    saveUpdatePlantButton = document.getElementById('saveUpdatePlantButton');
    cancelUpdatePlantButton = document.getElementById('cancelUpdatePlantButton');
    deletePlantButton = document.getElementById('deletePlant');

    imageModal = document.getElementById('imageModal');
    closeImageModalButton = document.getElementById('closeImageModalButton');
    zoomedImage = document.getElementById('zoomedImage');

    cardModal = document.getElementById('cardModal');
    closeCardModalButton = document.getElementById('closeCardModalButton');
    zoomedCardContent = document.getElementById('zoomedCardContent');

    loadingSpinner = document.getElementById('loading-spinner');
    toastContainer = document.getElementById('toastContainer');

    // Variabili per i messaggi di errore degli input (nel form)
    nameError = document.getElementById('nameError');
    categoryError = document.getElementById('categoryError');
    wateringError = document.getElementById('wateringError');
    imageError = document.getElementById('imageError');


    // Event Listeners autenticazione
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loginUser(emailInput.value, passwordInput.value);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            registerUser(registerEmailInput.value, registerPasswordInput.value);
        });
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('registerForm').classList.remove('hidden');
            loginError.textContent = ''; // Pulisci eventuali errori di login
            registerEmailInput.value = ''; // Pulisci i campi
            registerPasswordInput.value = '';
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
            registerError.textContent = ''; // Pulisci eventuali errori di registrazione
            emailInput.value = ''; // Pulisci i campi
            passwordInput.value = '';
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser);
    }

    // Event Listeners per i bottoni principali e filtri
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', openAddPlantModal);
    if (showAllPlantsButton) showAllPlantsButton.addEventListener('click', () => displayPlants(false));
    if (showMyGardenButton) showMyGardenButton.addEventListener('click', () => displayPlants(true));
    if (searchInput) searchInput.addEventListener('input', () => filterAndSortPlants());
    if (categoryFilter) categoryFilter.addEventListener('change', () => filterAndSortPlants());
    if (tempMinFilter) tempMinFilter.addEventListener('input', () => filterAndSortPlants());
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', () => filterAndSortPlants());
    if (sortBySelect) sortBySelect.addEventListener('change', () => filterAndSortPlants());


    // Event Listeners per il form pianta
    if (plantForm) {
        plantForm.addEventListener('submit', handlePlantFormSubmit);
    }
    if (plantImageInput) {
        plantImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    imagePreview.src = event.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.src = '';
                imagePreview.style.display = 'none';
            }
        });
    }
    if (cancelUpdatePlantButton) cancelUpdatePlantButton.addEventListener('click', closePlantFormModal);
    if (closePlantFormModalButton) closePlantFormModalButton.addEventListener('click', closePlantFormModal);
    if (plantFormModal) plantFormModal.addEventListener('click', (e) => {
        if (e.target === plantFormModal) closePlantFormModal();
    });
    if (deletePlantButton) deletePlantButton.addEventListener('click', deletePlantFromDatabase);

    // Event Listener per lo zoom dell'immagine e della card
    if (gardenContainer) gardenContainer.addEventListener('click', handlePlantCardClick);
    if (myGardenContainer) myGardenContainer.addEventListener('click', handlePlantCardClick);

    // Chiusura modali (listener per il click sul bottone 'x' e sullo sfondo della modale)
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => { imageModal.style.display = 'none'; });
    if (imageModal) imageModal.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.style.display = 'none'; });

    if (closeCardModalButton) closeCardModalButton.addEventListener('click', closeCardModal); // Chiude la modale con la funzione che pulisce e resetta
    if (cardModal) cardModal.addEventListener('click', (e) => { if (e.target === cardModal) closeCardModal(); });


    // Event Listeners per il sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);

    // Gestione dello stato di autenticazione all'avvio
    window.auth.onAuthStateChanged(user => {
        if (user) {
            userIsLoggedIn(user);
        } else {
            userIsLoggedOut();
        }
    });

    // Event Listener per il pulsante "Ottieni Posizione"
    const getLocationButton = document.getElementById('getLocationButton');
    if (getLocationButton) {
        getLocationButton.addEventListener('click', getUserLocation);
    }
});


// Funzioni di utilità per mostrare/nascondere elementi
function showElement(element) {
    if (element) element.classList.remove('hidden');
}

function hideElement(element) {
    if (element) element.classList.add('hidden');
}

function showSpinner() {
    if (loadingSpinner) loadingSpinner.style.display = 'flex';
}

function hideSpinner() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
}

/**
 * Mostra un toast di notifica.
 * @param {string} message - Il messaggio da mostrare.
 * @param {string} type - Il tipo di toast ('success', 'error', 'info').
 */
function showToast(message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Forza il reflow per l'animazione
    void toast.offsetWidth;

    toast.classList.add('show');

    // Rimuovi il toast dopo 5 secondi
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide'); // Aggiungi classe per l'animazione di uscita
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true }); // Rimuovi solo dopo che l'animazione è finita
    }, 5000);

    // Permetti di chiudere il toast cliccandoci sopra
    toast.addEventListener('click', () => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
    });
}


// --- Funzioni di Autenticazione ---

async function loginUser(email, password) {
    // ... (il tuo codice esistente prima della chiamata di autenticazione)

    try {
        // Usa await qui per attendere che la Promise si risolva
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);

        // Se arrivi qui, il login è riuscito
        const user = userCredential.user;
        console.log("Utente loggato:", user);
        showToast('Accesso effettuato con successo!', 'success');
        // Ad esempio, potresti chiudere il modale di login,
        // reindirizzare l'utente o aggiornare l'interfaccia utente.

    } catch (error) {
        // Se si verifica un errore durante il login
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Errore di login:", errorCode, errorMessage);
        showToast(`Errore di accesso: ${errorMessage}`, 'error');
        }
    } 


async function registerUser(email, password) {
    showSpinner();
    try {
        await window.auth.createUserWithEmailAndPassword(email, password);
        showToast('Registrazione effettuata con successo! Accedi ora.', 'success');
        registerError.textContent = ''; // Pulisci errori precedenti
        // Torna alla schermata di login dopo la registrazione
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
        emailInput.value = email; // Pre-compila l'email
        passwordInput.value = '';
    } catch (error) {
        registerError.textContent = `Errore registrazione: ${error.message}`;
        showToast(`Errore registrazione: ${error.message}`, 'error');
        console.error("Register error:", error);
    } finally {
        hideSpinner();
    }
}

async function logoutUser() {
    showSpinner();
    try {
        await window.auth.signOut();
        showToast('Disconnessione effettuata.', 'info');
    } catch (error) {
        showToast(`Errore logout: ${error.message}`, 'error');
        console.error("Logout error:", error);
    } finally {
        hideSpinner();
    }
}

function userIsLoggedIn(user) {
    hideElement(authContainerDiv);
    showElement(appContentDiv);
    authStatusSpan.textContent = `Benvenuto, ${user.email}`;
    showElement(logoutButton);
    // Carica le piante quando l'utente è loggato
    displayPlants(isMyGardenCurrentlyVisible); // Mostra il giardino predefinito o tutte le piante
    listenForPlantChanges(); // Avvia l'ascolto per aggiornamenti in tempo reale
}

function userIsLoggedOut() {
    showElement(authContainerDiv);
    hideElement(appContentDiv);
    authStatusSpan.textContent = 'Non Autenticato';
    hideElement(logoutButton);
    gardenContainer.innerHTML = ''; // Pulisci i container delle piante
    myGardenContainer.innerHTML = '';
    // Resetta lo stato di visualizzazione
    isMyGardenCurrentlyVisible = false;
    plantsSectionHeader.textContent = 'Tutte le Piante Disponibili'; // Reimposta l'header
    // Nascondi modali aperte
    closePlantFormModal();
    imageModal.style.display = 'none';
    cardModal.style.display = 'none';
    // Ferma sensori o altre attività legate all'utente
    stopLightSensor();
}


// --- Funzioni per la Gestione delle Piante ---

/**
 * Avvia l'ascolto in tempo reale dei cambiamenti nel database Firestore.
 * Carica tutte le piante e le piante dell'utente.
 */
function listenForPlantChanges() {
    // Ascolta le modifiche su tutte le piante nel DB
    window.db.collection('plants').orderBy('name').onSnapshot(snapshot => {
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filterAndSortPlants(); // Ri-renderizza con i nuovi dati
    }, error => {
        console.error("Errore nell'ascolto delle piante:", error);
        showToast("Errore nel caricamento delle piante.", "error");
    });

    // Ascolta le modifiche sulle piante nel giardino dell'utente corrente
    const userId = window.auth.currentUser ? window.auth.currentUser.uid : null;
    if (userId) {
        window.db.collection('users').doc(userId).collection('myGarden')
            .onSnapshot(snapshot => {
                myGarden = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Aggiorna il messaggio se il giardino è vuoto
                const emptyGardenMessage = document.getElementById('empty-garden-message');
                if (emptyGardenMessage) {
                    if (myGarden.length === 0 && isMyGardenCurrentlyVisible) {
                        showElement(emptyGardenMessage);
                    } else {
                        hideElement(emptyGardenMessage);
                    }
                }
                filterAndSortPlants(); // Ri-renderizza con i nuovi dati
            }, error => {
                console.error("Errore nell'ascolto del mio giardino:", error);
                showToast("Errore nel caricamento del tuo giardino.", "error");
            });
    } else {
        myGarden = []; // Se non c'è utente, il giardino è vuoto
        filterAndSortPlants();
    }
}

/**
 * Visualizza le piante nel container appropriato, filtrando e ordinando.
 * @param {boolean} showMyGarden - Se true, mostra le piante del giardino dell'utente; altrimenti tutte le piante.
 */
function displayPlants(showMyGarden) {
    isMyGardenCurrentlyVisible = showMyGarden;
    const plantsToDisplay = showMyGarden ? myGarden : allPlants;
    const targetContainer = showMyGarden ? myGardenContainer : gardenContainer;
    const otherContainer = showMyGarden ? gardenContainer : myGardenContainer;

    plantsSectionHeader.textContent = showMyGarden ? 'Il Mio Giardino' : 'Tutte le Piante Disponibili';

    hideElement(otherContainer);
    showElement(targetContainer);

    // Controlla il messaggio "Giardino vuoto"
    const emptyGardenMessage = document.getElementById('empty-garden-message');
    if (emptyGardenMessage) {
        if (showMyGarden && myGarden.length === 0) {
            showElement(emptyGardenMessage);
        } else {
            hideElement(emptyGardenMessage);
        }
    }

    filterAndSortPlants(); // Applica filtri e ordinamento ai dati già ottenuti
}

/**
 * Filtra e ordina le piante basandosi sui criteri correnti e le rende.
 */
function filterAndSortPlants() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    const minTemp = tempMinFilter ? parseFloat(tempMinFilter.value) : -Infinity;
    const maxTemp = tempMaxFilter ? parseFloat(tempMaxFilter.value) : Infinity;
    const currentSort = sortBySelect ? sortBySelect.value : 'name_asc';

    const plantsSource = isMyGardenCurrentlyVisible ? myGarden : allPlants;

    let filtered = plantsSource.filter(plant => {
        const matchesSearch = plant.name.toLowerCase().includes(searchTerm) ||
                              (plant.scientificName && plant.scientificName.toLowerCase().includes(searchTerm));
        const matchesCategory = selectedCategory === '' || plant.category === selectedCategory;

        const plantTempMin = plant.tempMin !== null && plant.tempMin !== undefined ? parseFloat(plant.tempMin) : -Infinity;
        const plantTempMax = plant.tempMax !== null && plant.tempMax !== undefined ? parseFloat(plant.tempMax) : Infinity;

        const matchesTemp = (plantTempMin <= maxTemp && plantTempMax >= minTemp) ||
                            (isNaN(plantTempMin) && isNaN(plantTempMax)); // Include plants with no temp data

        return matchesSearch && matchesCategory && matchesTemp;
    });

    // Ordina
    filtered.sort((a, b) => {
        switch (currentSort) {
            case 'name_asc': return a.name.localeCompare(b.name);
            case 'name_desc': return b.name.localeCompare(a.name);
            case 'category_asc': return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
            case 'category_desc': return b.category.localeCompare(a.category) || b.name.localeCompare(a.name);
            default: return 0;
        }
    });

    renderPlants(filtered);
}

/**
 * Renderizza le piante nel DOM.
 * @param {Array} plants - L'array di piante da renderizzare.
 */
function renderPlants(plants) {
    const targetContainer = isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer;
    targetContainer.innerHTML = ''; // Pulisci il container

    if (plants.length === 0) {
        if (!isMyGardenCurrentlyVisible) { // Se non ci sono piante in "Tutte le Piante"
            targetContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; padding: 20px; color: #777;">Nessuna pianta trovata con i criteri specificati.</p>';
        }
        // Il messaggio "Giardino vuoto" è già gestito da displayPlants
        return;
    }

    plants.forEach(plant => {
        const plantCard = document.createElement('div');
        plantCard.classList.add('plant-card');
        plantCard.dataset.id = plant.id; // Salva l'ID nel dataset per riferimento futuro
        plantCard.dataset.isGardenPlant = isMyGardenCurrentlyVisible; // Indica se è una pianta del giardino

        const imageUrl = plant.imageUrl || 'https://via.placeholder.com/150?text=No+Image'; // Immagine di fallback
        const isInMyGarden = myGarden.some(gardenPlant => gardenPlant.id === plant.id);
        const wateringText = plant.wateringFrequency ? `Ogni ${plant.wateringFrequency} giorni` : 'N/A';
        const sunlightText = plant.sunlightNeeds || 'N/A';
        const tempText = plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A';

        plantCard.innerHTML = `
            <img src="${imageUrl}" alt="${plant.name}" class="plant-image">
            <h3>${plant.name}</h3>
            ${plant.scientificName ? `<p><em>${plant.scientificName}</em></p>` : ''}
            <p><strong>Categoria:</strong> ${plant.category}</p>
            <p><strong>Irrigazione:</strong> ${wateringText}</p>
            <p><strong>Luce:</strong> ${sunlightText}</p>
            <p><strong>Temp:</strong> ${tempText}</p>
            <div class="card-actions">
                ${isMyGardenCurrentlyVisible ? `
                    <button class="update-plant-button"><i class="fas fa-edit"></i> Modifica</button>
                    <button class="delete-plant-from-garden-button cancel-button"><i class="fas fa-trash-alt"></i> Rimuovi</button>
                ` : `
                    <button class="add-to-garden-button" ${isInMyGarden ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i> ${isInMyGarden ? 'Nel tuo giardino' : 'Aggiungi al giardino'}
                    </button>
                    <button class="update-plant-button"><i class="fas fa-edit"></i> Modifica</button>
                `}
            </div>
        `;
        targetContainer.appendChild(plantCard);
    });
}

/**
 * Gestisce i click sulle card delle piante (zoom immagine, zoom card, aggiungi/modifica/rimuovi).
 * @param {Event} event - L'evento click.
 */
function handlePlantCardClick(event) {
    const plantCard = event.target.closest('.plant-card');
    if (!plantCard) return;

    const plantId = plantCard.dataset.id;
    const isGardenPlant = plantCard.dataset.isGardenPlant === 'true'; // Converti in booleano

    const plant = (isGardenPlant ? myGarden : allPlants).find(p => p.id === plantId);
    if (!plant) {
        showToast("Dettagli pianta non trovati.", "error");
        return;
    }

    // Gestisci click sull'immagine per lo zoom
    if (event.target.classList.contains('plant-image')) {
        zoomedImage.src = plant.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image';
        imageModal.style.display = 'flex';
        return; // Non aprire la card se si clicca sull'immagine
    }

    // Gestisci click sul bottone "Aggiungi al giardino"
    if (event.target.classList.contains('add-to-garden-button')) {
        addPlantToMyGarden(plant);
        return;
    }

    // Gestisci click sul bottone "Modifica"
    if (event.target.classList.contains('update-plant-button')) {
        openUpdatePlantModal(plant);
        return;
    }

    // Gestisci click sul bottone "Rimuovi dal giardino"
    if (event.target.classList.contains('delete-plant-from-garden-button')) {
        removePlantFromMyGarden(plant.id);
        return;
    }

    // Gestisci click sulla card per mostrare i dettagli estesi
    if (plant) {
        const imageUrl = plant.imageUrl || 'https://via.placeholder.com/300?text=No+Image';
        const wateringText = plant.wateringFrequency ? `Ogni ${plant.wateringFrequency} giorni` : 'N/A';
        const sunlightText = plant.sunlightNeeds || 'N/A';
        const luxText = plant.luxMin !== null && plant.luxMax !== null ? `${plant.luxMin} - ${plant.luxMax} Lux` : 'N/A';
        const tempText = plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A';

        let detailsHtml = `
            <img src="${imageUrl}" alt="${plant.name}">
            <h3>${plant.name}</h3>
            ${plant.scientificName ? `<p><em>${plant.scientificName}</em></p>` : ''}
            <p><strong>Categoria:</strong> ${plant.category}</p>
            <p><strong>Descrizione:</strong> ${plant.description || 'N/A'}</p>
            <p><strong>Frequenza Irrigazione:</strong> ${wateringText}</p>
            <p><strong>Esigenze di Luce:</strong> ${sunlightText}</p>
            <p><strong>Range Lux:</strong> ${luxText}</p>
            <p><strong>Range Temperatura:</strong> ${tempText}</p>
            <p><strong>Aggiunta il:</strong> ${plant.createdAt ? new Date(plant.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
        `;
        zoomedCardContent.innerHTML = detailsHtml;
        cardModal.style.display = 'flex';
    }
}

/**
 * Apre il modale per aggiungere una nuova pianta.
 */
function openAddPlantModal() {
    currentPlantIdToUpdate = null; // Resetta l'ID per indicare nuova pianta
    plantFormTitle.textContent = 'Aggiungi Nuova Pianta';
    plantForm.reset(); // Pulisci il form
    imagePreview.style.display = 'none'; // Nascondi anteprima immagine
    hideElement(deletePlantButton); // Nascondi il bottone elimina per le nuove piante
    clearFormErrors(); // Pulisci eventuali errori di validazione
    plantFormModal.style.display = 'flex';
}

/**
 * Apre il modale per modificare una pianta esistente.
 * @param {Object} plant - L'oggetto pianta da modificare.
 */
function openUpdatePlantModal(plant) {
    currentPlantIdToUpdate = plant.id;
    plantFormTitle.textContent = 'Modifica Pianta';

    // Popola il form con i dati della pianta
    plantNameInput.value = plant.name || '';
    scientificNameInput.value = plant.scientificName || '';
    plantCategorySelect.value = plant.category || '';
    wateringFrequencyInput.value = plant.wateringFrequency || '';
    sunlightNeedsSelect.value = plant.sunlightNeeds || '';
    luxMinInput.value = plant.luxMin || '';
    luxMaxInput.value = plant.luxMax || '';
    tempMinInput.value = plant.tempMin || '';
    tempMaxInput.value = plant.tempMax || '';
    plantDescriptionTextarea.value = plant.description || '';

    if (plant.imageUrl) {
        imagePreview.src = plant.imageUrl;
        showElement(imagePreview);
    } else {
        hideElement(imagePreview);
    }
    plantImageInput.value = ''; // Resetta l'input file

    showElement(deletePlantButton); // Mostra il bottone elimina
    clearFormErrors(); // Pulisci eventuali errori di validazione
    plantFormModal.style.display = 'flex';
}

/**
 * Chiude il modale del form pianta e resetta lo stato.
 */
function closePlantFormModal() {
    plantFormModal.style.display = 'none';
    plantForm.reset();
    imagePreview.src = '#';
    hideElement(imagePreview);
    currentPlantIdToUpdate = null;
    clearFormErrors();
}

/**
 * Pulisce i messaggi di errore di validazione del form.
 */
function clearFormErrors() {
    nameError.textContent = '';
    nameError.style.display = 'none';
    categoryError.textContent = '';
    categoryError.style.display = 'none';
    wateringError.textContent = '';
    wateringError.style.display = 'none';
    imageError.textContent = '';
    imageError.style.display = 'none';

    plantNameInput.classList.remove('input-error');
    plantCategorySelect.classList.remove('input-error');
    wateringFrequencyInput.classList.remove('input-error');
    plantImageInput.classList.remove('input-error');
}

/**
 * Gestisce l'invio del form per aggiungere o aggiornare una pianta.
 * @param {Event} e - L'evento di submit.
 */
async function handlePlantFormSubmit(e) {
    e.preventDefault();
    showSpinner();
    clearFormErrors(); // Pulisci errori prima di una nuova validazione

    const plantData = {
        name: plantNameInput.value.trim(),
        scientificName: scientificNameInput.value.trim() || null,
        category: plantCategorySelect.value,
        wateringFrequency: wateringFrequencyInput.value ? parseInt(wateringFrequencyInput.value) : null,
        sunlightNeeds: sunlightNeedsSelect.value || null,
        luxMin: luxMinInput.value ? parseInt(luxMinInput.value) : null,
        luxMax: luxMaxInput.value ? parseInt(luxMaxInput.value) : null,
        tempMin: tempMinInput.value ? parseInt(tempMinInput.value) : null,
        tempMax: tempMaxInput.value ? parseInt(tempMaxInput.value) : null,
        description: plantDescriptionTextarea.value.trim() || null,
        ownerId: window.auth.currentUser ? window.auth.currentUser.uid : null, // ID dell'utente proprietario
    };

    // Validazione front-end
    let isValid = true;
    if (!plantData.name) {
        nameError.textContent = 'Il nome comune è obbligatorio.';
        showElement(nameError);
        plantNameInput.classList.add('input-error');
        isValid = false;
    }
    if (!plantData.category) {
        categoryError.textContent = 'La categoria è obbligatoria.';
        showElement(categoryError);
        plantCategorySelect.classList.add('input-error');
        isValid = false;
    }
    if (plantData.wateringFrequency !== null && (isNaN(plantData.wateringFrequency) || plantData.wateringFrequency <= 0)) {
        wateringError.textContent = 'La frequenza di irrigazione deve essere un numero positivo.';
        showElement(wateringError);
        wateringFrequencyInput.classList.add('input-error');
        isValid = false;
    }

    if (!isValid) {
        hideSpinner();
        showToast("Per favore, correggi gli errori nel form.", "error");
        return;
    }

    const imageFile = plantImageInput.files[0];
    let imageUrl = imagePreview.src === '#' || imagePreview.src === window.location.href ? null : imagePreview.src; // Mantieni URL esistente se non caricata nuova immagine

    try {
        if (imageFile) {
            const storageRef = window.storage.ref();
            const imageExtension = imageFile.name.split('.').pop();
            const imageName = `${plantData.name.replace(/\s/g, '_')}_${Date.now()}.${imageExtension}`;
            const plantImageRef = storageRef.child(`plant_images/${imageName}`);
            const snapshot = await plantImageRef.put(imageFile);
            imageUrl = await snapshot.ref.getDownloadURL();
            plantData.imageUrl = imageUrl;
        } else if (currentPlantIdToUpdate && !plantData.imageUrl) {
             // Se è un aggiornamento e l'immagine è stata rimossa (input file vuoto e nessuna anteprima)
            // Allora rimuovi l'imageUrl dal database
            plantData.imageUrl = firebase.firestore.FieldValue.delete();
        }

        if (currentPlantIdToUpdate) {
            // Aggiorna pianta esistente
            await window.db.collection('plants').doc(currentPlantIdToUpdate).update(plantData);
            showToast('Pianta aggiornata con successo!', 'success');
        } else {
            // Aggiungi nuova pianta
            plantData.createdAt = window.firebase.firestore.FieldValue.serverTimestamp(); // Aggiunge timestamp di creazione
            await window.db.collection('plants').add(plantData);
            showToast('Pianta aggiunta con successo!', 'success');
        }
        closePlantFormModal();
    } catch (error) {
        showToast(`Errore nel salvataggio della pianta: ${error.message}`, 'error');
        console.error("Error saving plant:", error);
    } finally {
        hideSpinner();
    }
}


/**
 * Aggiunge una pianta alla collezione 'myGarden' dell'utente corrente.
 * @param {Object} plant - L'oggetto pianta da aggiungere.
 */
async function addPlantToMyGarden(plant) {
    const userId = window.auth.currentUser ? window.auth.currentUser.uid : null;
    if (!userId) {
        showToast('Devi essere loggato per aggiungere piante al tuo giardino.', 'info');
        return;
    }

    showSpinner();
    try {
        const userGardenRef = window.db.collection('users').doc(userId).collection('myGarden');
        // Verifica se la pianta è già nel giardino
        const doc = await userGardenRef.doc(plant.id).get();
        if (doc.exists) {
            showToast('Questa pianta è già nel tuo giardino!', 'info');
            return;
        }

        await userGardenRef.doc(plant.id).set({
            ...plant, // Copia tutti i dati della pianta
            addedToGardenAt: window.firebase.firestore.FieldValue.serverTimestamp() // Timestamp di aggiunta al giardino
        });
        showToast(`${plant.name} aggiunta al tuo giardino!`, 'success');
    } catch (error) {
        showToast(`Errore nell'aggiunta al giardino: ${error.message}`, 'error');
        console.error("Error adding to garden:", error);
    } finally {
        hideSpinner();
    }
}

/**
 * Rimuove una pianta dalla collezione 'myGarden' dell'utente corrente.
 * @param {string} plantId - L'ID della pianta da rimuovere.
 */
async function removePlantFromMyGarden(plantId) {
    const userId = window.auth.currentUser ? window.auth.currentUser.uid : null;
    if (!userId) {
        showToast('Devi essere loggato per rimuovere piante dal tuo giardino.', 'info');
        return;
    }

    if (!confirm('Sei sicuro di voler rimuovere questa pianta dal tuo giardino?')) {
        return;
    }

    showSpinner();
    try {
        await window.db.collection('users').doc(userId).collection('myGarden').doc(plantId).delete();
        showToast('Pianta rimossa dal tuo giardino.', 'info');
    } catch (error) {
        showToast(`Errore nella rimozione dal giardino: ${error.message}`, 'error');
        console.error("Error removing from garden:", error);
    } finally {
        hideSpinner();
    }
}

/**
 * Elimina una pianta dal database principale (Firestore).
 * Questo è accessibile solo in modalità modifica.
 */
async function deletePlantFromDatabase() {
    if (!currentPlantIdToUpdate) {
        showToast('Nessuna pianta selezionata per l\'eliminazione.', 'error');
        return;
    }
    if (!confirm('Sei sicuro di voler eliminare questa pianta definitivamente dal database? Questa azione non può essere annullata.')) {
        return;
    }

    showSpinner();
    try {
        // Opzionale: elimina l'immagine associata da Storage
        const plantToDelete = allPlants.find(p => p.id === currentPlantIdToUpdate);
        if (plantToDelete && plantToDelete.imageUrl) {
            const imageRef = window.storage.refFromURL(plantToDelete.imageUrl);
            await imageRef.delete().catch(error => {
                console.warn("Could not delete old image from storage (it might not exist or permissions issue):", error);
                // Non bloccare l'eliminazione del documento se l'immagine non può essere eliminata
            });
        }

        // Elimina il documento della pianta dal database principale
        await window.db.collection('plants').doc(currentPlantIdToUpdate).delete();

        // Rimuovi la pianta dal giardino di tutti gli utenti che la possiedono
        // (Questa è una versione semplificata. Per grandi scale, usare Cloud Functions)
        const usersSnapshot = await window.db.collection('users').get();
        for (const userDoc of usersSnapshot.docs) {
            const gardenPlantRef = userDoc.ref.collection('myGarden').doc(currentPlantIdToUpdate);
            const gardenPlantDoc = await gardenPlantRef.get();
            if (gardenPlantDoc.exists) {
                await gardenPlantRef.delete();
            }
        }

        showToast('Pianta eliminata definitivamente dal database.', 'success');
        closePlantFormModal();
    } catch (error) {
        showToast(`Errore nell'eliminazione della pianta: ${error.message}`, 'error');
        console.error("Error deleting plant from database:", error);
    } finally {
        hideSpinner();
    }
}

function closeCardModal() {
    cardModal.style.display = 'none';
    zoomedCardContent.innerHTML = ''; // Pulisci il contenuto
}


// --- Funzioni per il Sensore di Luce Ambientale (Ambient Light Sensor API) ---

let lightSensorInterval; // Variabile per tenere traccia dell'intervallo del sensore
let sensorOptions = { frequency: 1000 }; // Frequenza di lettura in ms (1 secondo)

function startLightSensor() {
    if (!('AmbientLightSensor' in window)) {
        showToast('Il tuo browser non supporta il Sensore di Luce Ambientale.', 'error');
        lightFeedbackDiv.innerHTML = '<p>Il sensore di luce non è supportato dal tuo browser.</p>';
        return;
    }

    if (ambientLightSensor && ambientLightSensor.activated) {
        showToast('Sensore già attivo.', 'info');
        return;
    }

    try {
        ambientLightSensor = new AmbientLightSensor(sensorOptions);

        ambientLightSensor.onreading = () => {
            const lux = ambientLightSensor.illuminance.toFixed(2);
            currentLuxValueSpan.textContent = `${lux} lux`;
            updateLightFeedback(lux);
        };

        ambientLightSensor.onerror = (event) => {
            console.error("Errore sensore di luce:", event.error.name, event.error.message);
            currentLuxValueSpan.textContent = 'Errore';
            lightFeedbackDiv.innerHTML = `<p>Errore sensore: ${event.error.message}</p>`;
            showToast(`Errore sensore di luce: ${event.error.message}`, 'error');
            stopLightSensor(); // Ferma il sensore in caso di errore
        };

        ambientLightSensor.start();
        showToast('Sensore di luce avviato.', 'success');
        lightFeedbackDiv.innerHTML = '<p>Lettura in corso...</p>';

    } catch (error) {
        console.error("Errore nell'avvio del sensore di luce:", error);
        currentLuxValueSpan.textContent = 'Non disponibile';
        lightFeedbackDiv.innerHTML = `<p>Impossibile avviare il sensore: ${error.message}</p>`;
        showToast(`Impossibile avviare il sensore di luce: ${error.message}`, 'error');
    }
}

function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
        currentLuxValueSpan.textContent = 'N/A';
        lightFeedbackDiv.innerHTML = '<p>Sensore di luce fermato.</p>';
        showToast('Sensore di luce fermato.', 'info');
    }
}

function updateLightFeedback(lux) {
    let feedbackMessage = '';
    let icon = '';

    if (lux < 50) {
        feedbackMessage = 'Luce molto bassa. Adatto per piante da ombra profonda o per avviare semi.';
        icon = 'fas fa-moon';
    } else if (lux >= 50 && lux < 500) {
        feedbackMessage = 'Luce bassa. Adatto per piante da ombra o interni poco illuminati.';
        icon = 'fas fa-cloud';
    } else if (lux >= 500 && lux < 2000) {
        feedbackMessage = 'Luce moderata. Ideale per la maggior parte delle piante da interno e zone di mezz\'ombra.';
        icon = 'fas fa-cloud-sun';
    } else if (lux >= 2000 && lux < 10000) {
        feedbackMessage = 'Luce buona. Adatto per piante che richiedono luce indiretta brillante.';
        icon = 'fas fa-sun';
    } else { // lux >= 10000
        feedbackMessage = 'Luce molto alta. Ideale per piante da pieno sole.';
        icon = 'fas fa-sun';
    }
    lightFeedbackDiv.innerHTML = `<p><i class="${icon}"></i> ${feedbackMessage}</p>`;
}


// --- Funzioni per la Geolocalizzazione e Meteo ---

async function getUserLocation() {
    const locationStatusDiv = document.getElementById('locationStatus');
    const locationDisplayDiv = document.getElementById('locationDisplay');
    const weatherForecastDiv = document.getElementById('weatherForecast');
    const weatherErrorDiv = document.getElementById('weatherError');

    showElement(locationStatusDiv);
    locationStatusDiv.textContent = 'Cercando la tua posizione...';
    hideElement(locationDisplayDiv);
    hideElement(weatherForecastDiv);
    weatherErrorDiv.textContent = ''; // Pulisci errori meteo precedenti

    if (!navigator.geolocation) {
        locationStatusDiv.textContent = 'La geolocalizzazione non è supportata dal tuo browser.';
        showToast('Geolocalizzazione non supportata.', 'error');
        return;
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });

        const { latitude, longitude } = position.coords;
        locationStatusDiv.textContent = ''; // Pulisci il messaggio di "cerca"
        showElement(locationDisplayDiv);
        locationDisplayDiv.innerHTML = `<i class="fas fa-map-marker-alt"></i> Latitudine: ${latitude.toFixed(4)}, Longitudine: ${longitude.toFixed(4)}`;
        showToast('Posizione ottenuta con successo!', 'success');

        fetchWeather(latitude, longitude);

    } catch (error) {
        let errorMessage = 'Errore nel recupero della posizione.';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Permesso di geolocalizzazione negato dall\'utente.';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Informazioni sulla posizione non disponibili.';
                break;
            case error.TIMEOUT:
                errorMessage = 'Richiesta di posizione scaduta.';
                break;
            case error.UNKNOWN_ERROR:
                errorMessage = 'Errore sconosciuto di geolocalizzazione.';
                break;
        }
        locationStatusDiv.textContent = errorMessage;
        hideElement(locationDisplayDiv);
        hideElement(weatherForecastDiv);
        showToast(errorMessage, 'error');
        console.error("Geolocation error:", error);
    }
}

async function fetchWeather(latitude, longitude) {
    const weatherApiKey = '92e74288ce42551e1882194a2f7c00e6'; // Sostituisci con la tua chiave API OpenWeatherMap
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric&lang=it`;

    const weatherForecastDiv = document.getElementById('weatherForecast');
    const weatherLocation = document.getElementById('weatherLocation');
    const weatherDescription = document.getElementById('weatherDescription');
    const weatherTemperature = document.getElementById('weatherTemperature');
    const weatherHumidity = document.getElementById('weatherHumidity');
    const weatherWind = document.getElementById('weatherWind');
    const weatherErrorDiv = document.getElementById('weatherError');

    showElement(weatherForecastDiv);
    weatherErrorDiv.textContent = 'Caricamento previsioni meteo...';

    try {
        const response = await fetch(weatherApiUrl);
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }
        const data = await response.json();

        weatherErrorDiv.textContent = ''; // Pulisci il messaggio di caricamento/errore

        weatherLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.name}`;
        weatherDescription.innerHTML = `<i class="fas fa-cloud"></i> ${data.weather[0].description}`;
        weatherTemperature.innerHTML = `<i class="fas fa-thermometer-half"></i> ${data.main.temp.toFixed(1)}°C (Min: ${data.main.temp_min.toFixed(1)}°C, Max: ${data.main.temp_max.toFixed(1)}°C)`;
        weatherHumidity.innerHTML = `<i class="fas fa-water"></i> Umidità: ${data.main.humidity}%`;
        weatherWind.innerHTML = `<i class="fas fa-wind"></i> Vento: ${data.wind.speed.toFixed(1)} m/s`;

        showToast('Previsioni meteo caricate!', 'success');

    } catch (error) {
        weatherErrorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Errore nel caricamento meteo: ${error.message}`;
        showToast(`Errore meteo: ${error.message}`, 'error');
        console.error("Weather fetch error:", error);
    }
}
