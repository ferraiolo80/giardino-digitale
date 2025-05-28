// 1. DICHIARAZIONI GLOBALI
let allPlants = [];
let myGarden = [];
let currentPlantIdToUpdate = null;
let ambientLightSensor = null;
let isMyGardenCurrentlyVisible = false;
let currentSortBy = 'name_asc';

let userLocation = null; // {latitude, longitude}
let detectedClimateZone = null; // Zona climatica rilevata dalla geolocalizzazione

// Variabili per la gestione della modal
let imageModal;
let zoomedImage;
let closeButton;
let loadingSpinner;
let modalPlantDetails; // Per il contenuto della card zoomata

let isDomReady = false;

// DICHIARAZIONI DELLE VARIABILI DOM GLOBALI
let gardenContainer;
let myGardenContainer;
let authContainerDiv;
let appContentDiv;
let loginButton;
let registerButton;
let logoutButton;
let authStatusDiv;
let searchInput;
let addNewPlantButton;
let toggleMyGardenButton;
let plantsSection;
let giardinoTitle;
let emptyGardenMessage;
let plantTypeFilter;
let lightFilter;
let waterFilter;
let sortBySelect;

// NUOVE VARIABILI DOM GLOBALI per la geolocalizzazione e il filtro clima
let getLocationButton;
let locationStatusDiv;
let loadingLocationIcon; // Per l'icona di caricamento della geolocalizzazione
let climateZoneFilter; // Nuovo filtro per la zona climatica

// Variabili DOM per i campi di input dei form di aggiunta/modifica pianta
let newPlantNameInput;
let newPlantDescriptionInput;
let newPlantTypeSelect;
let newPlantLightSelect;
let newPlantWaterSelect;
let newPlantClimateZoneSelect; // Nuovo input per la zona climatica
let newPlantImageUrlInput;
let newPlantNotesInput;
let newPlantForm; // Il form stesso

let updatePlantNameInput;
let updatePlantDescriptionInput;
let updatePlantTypeSelect;
let updatePlantLightSelect;
let updatePlantWaterSelect;
let updatePlantClimateZoneSelect; // Nuovo input per la zona climatica
let updatePlantImageUrlInput;
let updatePlantNotesInput;
let updatePlantForm; // Il form stesso


// 2. FUNZIONI DI INIZIALIZZAZIONE / EVENT LISTENERS
document.addEventListener('DOMContentLoaded', async () => {
    // Inizializza tutte le variabili DOM
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
    plantsSection = document.getElementById('plants-section');
    giardinoTitle = document.getElementById('giardino-title');
    emptyGardenMessage = document.getElementById('empty-garden-message');
    plantTypeFilter = document.getElementById('plant-type-filter');
    lightFilter = document.getElementById('light-filter');
    waterFilter = document.getElementById('water-filter');
    sortBySelect = document.getElementById('sort-by');

    imageModal = document.getElementById('image-modal');
    zoomedImage = document.getElementById('zoomed-image');
    closeButton = document.getElementById('close-button');
    loadingSpinner = document.getElementById('loading-spinner');
    modalPlantDetails = document.getElementById('modal-plant-details');

    // Inizializzazione nuove variabili DOM per geolocalizzazione e filtri
    getLocationButton = document.getElementById('get-location-button');
    locationStatusDiv = document.getElementById('location-status');
    // loadingLocationIcon = locationStatusDiv.querySelector('.fas'); // Rimosso: l'icona è parte del contenuto dinamico
    climateZoneFilter = document.getElementById('climate-zone-filter');

    // Inizializzazione variabili DOM per i form
    newPlantNameInput = document.getElementById('new-plant-name');
    newPlantDescriptionInput = document.getElementById('new-plant-description');
    newPlantTypeSelect = document.getElementById('new-plant-type');
    newPlantLightSelect = document.getElementById('new-plant-light');
    newPlantWaterSelect = document.getElementById('new-plant-water');
    newPlantClimateZoneSelect = document.getElementById('new-plant-climate-zone'); // Nuovo
    newPlantImageUrlInput = document.getElementById('new-plant-image-url');
    newPlantNotesInput = document.getElementById('new-plant-notes');
    newPlantForm = document.getElementById('new-plant-form');

    updatePlantNameInput = document.getElementById('update-plant-name');
    updatePlantDescriptionInput = document.getElementById('update-plant-description');
    updatePlantTypeSelect = document.getElementById('update-plant-type');
    updatePlantLightSelect = document.getElementById('update-plant-light');
    updatePlantWaterSelect = document.getElementById('update-plant-water');
    updatePlantClimateZoneSelect = document.getElementById('update-plant-climate-zone'); // Nuovo
    updatePlantImageUrlInput = document.getElementById('update-plant-image-url');
    updatePlantNotesInput = document.getElementById('update-plant-notes');
    updatePlantForm = document.getElementById('update-plant-form');


    isDomReady = true;

    // Event Listeners
    if (loginButton) loginButton.addEventListener('click', login);
    if (registerButton) registerButton.addEventListener('click', register);
    if (logoutButton) logoutButton.addEventListener('click', logout);

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (plantTypeFilter) plantTypeFilter.addEventListener('change', applyFilters);
    if (lightFilter) lightFilter.addEventListener('change', applyFilters);
    if (waterFilter) waterFilter.addEventListener('change', applyFilters);
    if (sortBySelect) sortBySelect.addEventListener('change', applyFilters);
    if (climateZoneFilter) climateZoneFilter.addEventListener('change', applyFilters); // Nuovo listener

    if (addNewPlantButton) {
        addNewPlantButton.addEventListener('click', () => {
            if (newPlantForm) newPlantForm.reset(); // Pulisci il form prima di aprirlo
            openModal('newPlantCard');
        });
    }

    if (newPlantForm) newPlantForm.addEventListener('submit', (e) => savePlant(e, false));
    if (updatePlantForm) updatePlantForm.addEventListener('submit', (e) => savePlant(e, true));

    if (toggleMyGardenButton) {
        toggleMyGardenButton.addEventListener('click', () => {
            updateGardenVisibility(!isMyGardenCurrentlyVisible);
        });
    }

    if (closeButton) closeButton.addEventListener('click', () => {
        closeModal('image-modal');
        // Resetta i display dei contenuti della modal
        zoomedImage.style.display = 'none';
        modalPlantDetails.style.display = 'none';
    });

    // Event listener per il bottone di geolocalizzazione
    if (getLocationButton) {
        getLocationButton.addEventListener('click', getUserLocation);
    }

    // Monitora lo stato di autenticazione di Firebase
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log("Stato autenticazione cambiato, utente loggato:", user.email);
            authStatusDiv.innerHTML = `<i class="fas fa-user-circle"></i> ${user.email}`; // Mostra solo email con icona
            logoutButton.style.display = 'inline-block';
            authContainerDiv.style.display = 'none'; // Nascondi i form di login/registrazione
            appContentDiv.style.display = 'block'; // Mostra il contenuto dell'app

            // Carica le piante dell'utente e poi tutte le piante
            await loadUserGarden(user.uid); // Carica il giardino dell'utente
            await loadPlantsFromFirebase(); // Carica tutte le piante pubbliche

            // Decide se mostrare il giardino o tutte le piante all'inizio
            const showMyGardenInitially = myGarden.length > 0;
            await updateGardenVisibility(showMyGardenInitially);

            // Tenta di inizializzare il sensore di luce ambientale
            // initAmbientLightSensor(); // Non riattivarlo se non strettamente necessario o testato

        } else {
            console.log("Stato autenticazione cambiato, nessun utente loggato.");
            authStatusDiv.innerHTML = `<i class="fas fa-user-circle"></i> Nessun utente`; // Messaggio più breve
            logoutButton.style.display = 'none';
            appContentDiv.style.display = 'none';
            authContainerDiv.style.display = 'block';

            myGarden = []; // Pulisci il giardino locale se l'utente si disconnette
            isMyGardenCurrentlyVisible = false; // Assicurati che lo stato sia corretto

            await loadPlantsFromFirebase(); // Carica le piante pubbliche per la vista non loggata

            // Imposta la visibilità per l'utente non loggato: solo la galleria principale
            if (plantsSection) plantsSection.style.display = 'block';
            if (gardenContainer) gardenContainer.style.display = 'grid';
            if (myGardenContainer) myGardenContainer.style.display = 'none';
            if (giardinoTitle) giardinoTitle.style.display = 'none';
            if (emptyGardenMessage) emptyGardenMessage.style.display = 'none';

            // Nascondi i bottoni per il giardino se non loggati
            if (toggleMyGardenButton) {
                toggleMyGardenButton.style.display = 'none';
            }
            if (addNewPlantButton) {
                addNewPlantButton.style.display = 'none';
            }

            applyFilters(); // Assicurati che vengano renderizzate tutte le piante
        }
    });
});

// 3. FUNZIONI DI AUTENTICAZIONE
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
        alert("Login effettuato con successo!");
    } catch (error) {
        console.error("Errore di login:", error.message);
        alert("Errore di login: " + error.message);
    }
}

async function register() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        alert("Registrazione effettuata con successo!");
    } catch (error) {
        console.error("Errore di registrazione:", error.message);
        alert("Errore di registrazione: " + error.message);
    }
}

async function logout() {
    try {
        await auth.signOut();
        alert("Logout effettuato.");
    } catch (error) {
        console.error("Errore di logout:", error.message);
        alert("Errore di logout: " + error.message);
    }
}

// 4. FUNZIONI CRUD PER LE PIANTE
async function loadPlantsFromFirebase() {
    showLoadingSpinner();
    try {
        const snapshot = await db.collection('plants').get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante pubbliche caricate:", allPlants);
        applyFilters(); // Applica i filtri dopo aver caricato le piante
    } catch (error) {
        console.error("Errore nel caricamento delle piante:", error);
        alert("Errore nel caricamento delle piante.");
    } finally {
        hideLoadingSpinner();
    }
}

async function loadUserGarden(userId) {
    showLoadingSpinner();
    try {
        const snapshot = await db.collection('plants').where('ownerId', '==', userId).get();
        myGarden = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Giardino utente caricato:", myGarden);
        // Mostra/Nascondi il bottone del giardino in base alla presenza di piante
        if (toggleMyGardenButton) {
            toggleMyGardenButton.style.display = 'inline-block';
        }
        if (addNewPlantButton) {
            addNewPlantButton.style.display = 'inline-block';
        }

    } catch (error) {
        console.error("Errore nel caricamento del giardino:", error);
        alert("Errore nel caricamento del giardino.");
    } finally {
        hideLoadingSpinner();
    }
}

async function savePlant(event, isUpdate = false) {
    event.preventDefault();
    showLoadingSpinner();

    let plantData;
    let form;
    let climateZoneInput;

    if (isUpdate) {
        form = updatePlantForm;
        climateZoneInput = updatePlantClimateZoneSelect;
    } else {
        form = newPlantForm;
        climateZoneInput = newPlantClimateZoneSelect;
    }

    const name = (isUpdate ? updatePlantNameInput : newPlantNameInput).value;
    const description = (isUpdate ? updatePlantDescriptionInput : newPlantDescriptionInput).value;
    const type = (isUpdate ? updatePlantTypeSelect : newPlantTypeSelect).value;
    const light = (isUpdate ? updatePlantLightSelect : newPlantLightSelect).value;
    const water = (isUpdate ? updatePlantWaterSelect : newPlantWaterSelect).value;
    const climateZone = climateZoneInput.value; // Ottieni il valore della zona climatica
    const imageUrl = (isUpdate ? updatePlantImageUrlInput : newPlantImageUrlInput).value;
    const notes = (isUpdate ? newPlantNotesInput : newPlantNotesInput).value; // Correzione per 'newPlantNotesInput'

    plantData = {
        name: name,
        description: description,
        type: type,
        light: light,
        water: water,
        imageUrl: imageUrl,
        notes: notes,
        lastModified: firebase.firestore.FieldValue.serverTimestamp(),
        // Aggiungi la zona climatica solo se ha un valore selezionato
        ...(climateZone && { climateZone: climateZone })
    };

    if (!isUpdate) { // Nuova pianta
        plantData.ownerId = auth.currentUser.uid;
        plantData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        try {
            await db.collection('plants').add(plantData);
            console.log("Pianta aggiunta con successo!");
            alert("Pianta aggiunta con successo!");
            form.reset(); // Resetta il form dopo l'aggiunta
        } catch (error) {
            console.error("Errore nell'aggiunta della pianta:", error);
            alert("Errore nell'aggiunta della pianta.");
        }
    } else { // Aggiornamento pianta
        try {
            await db.collection('plants').doc(currentPlantIdToUpdate).update(plantData);
            console.log("Pianta aggiornata con successo!");
            alert("Pianta aggiornata con successo!");
        } catch (error) {
            console.error("Errore nell'aggiornamento della pianta:", error);
            alert("Errore nell'aggiornamento della pianta.");
        }
    }

    closeModal(isUpdate ? 'updatePlantCard' : 'newPlantCard');
    if (auth.currentUser) {
        await loadUserGarden(auth.currentUser.uid); // Ricarica il giardino dell'utente
    }
    await loadPlantsFromFirebase(); // Ricarica tutte le piante
    applyFilters();
    hideLoadingSpinner();
}

async function deletePlant(plantId) {
    if (confirm("Sei sicuro di voler eliminare questa pianta?")) {
        showLoadingSpinner();
        try {
            await db.collection('plants').doc(plantId).delete();
            console.log("Pianta eliminata con successo!");
            alert("Pianta eliminata con successo!");
            if (auth.currentUser) {
                await loadUserGarden(auth.currentUser.uid);
            }
            await loadPlantsFromFirebase();
            applyFilters();
        } catch (error) {
            console.error("Errore nell'eliminazione della pianta:", error);
            alert("Errore nell'eliminazione della pianta.");
        } finally {
            hideLoadingSpinner();
        }
    }
}

function showUpdatePlantModal(plantId) {
    currentPlantIdToUpdate = plantId;
    const plant = allPlants.find(p => p.id === plantId) || myGarden.find(p => p.id === plantId);
    if (plant) {
        updatePlantNameInput.value = plant.name || '';
        updatePlantDescriptionInput.value = plant.description || '';
        updatePlantTypeSelect.value = plant.type || '';
        updatePlantLightSelect.value = plant.light || '';
        updatePlantWaterSelect.value = plant.water || '';
        updatePlantClimateZoneSelect.value = plant.climateZone || ''; // Carica la zona climatica
        updatePlantImageUrlInput.value = plant.imageUrl || '';
        updatePlantNotesInput.value = plant.notes || '';
        openModal('updatePlantCard');
    } else {
        console.error("Pianta non trovata per l'aggiornamento:", plantId);
        alert("Errore: Pianta non trovata.");
    }
}

// 5. FUNZIONI DI VISUALIZZAZIONE E FILTRI
async function applyFilters() {
    showLoadingSpinner();

    let plantsToDisplay = isMyGardenCurrentlyVisible ? [...myGarden] : [...allPlants]; // Clona l'array per non modificarlo direttamente

    const searchValue = searchInput.value.toLowerCase();
    const typeFilter = plantTypeFilter.value;
    const lightFilterValue = lightFilter.value;
    const waterFilterValue = waterFilter.value;
    const climateFilterValue = climateZoneFilter.value; // Ottieni il valore del nuovo filtro

    // FILTRI
    plantsToDisplay = plantsToDisplay.filter(plant => {
        const matchesSearch = plant.name.toLowerCase().includes(searchValue) ||
                              (plant.description && plant.description.toLowerCase().includes(searchValue));
        const matchesType = typeFilter === "" || plant.type === typeFilter;
        const matchesLight = lightFilterValue === "" || plant.light === lightFilterValue;
        const matchesWater = waterFilterValue === "" || plant.water === waterFilterValue;
        
        // NUOVO FILTRO: Controlla la zona climatica della pianta
        const matchesClimate = climateFilterValue === "" || 
                               (plant.climateZone && plant.climateZone === climateFilterValue); 
        
        return matchesSearch && matchesType && matchesLight && matchesWater && matchesClimate;
    });

    // ORDINAMENTO
    currentSortBy = sortBySelect.value;
    if (currentSortBy === 'name_asc') {
        plantsToDisplay.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSortBy === 'name_desc') {
        plantsToDisplay.sort((a, b) => b.name.localeCompare(a.name));
    } else if (currentSortBy === 'last_modified_desc') {
        plantsToDisplay.sort((a, b) => {
            // Gestisce il caso in cui lastModified non è ancora un Timestamp ma un oggetto Date o assente
            const dateA = a.lastModified && typeof a.lastModified.toDate === 'function' ? a.lastModified.toDate() : new Date(0); 
            const dateB = b.lastModified && typeof b.lastModified.toDate === 'function' ? b.lastModified.toDate() : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
    }

    renderPlants(plantsToDisplay);
    hideLoadingSpinner();
}


function renderPlants(plants) {
    const targetContainer = isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer;
    targetContainer.innerHTML = ''; // Pulisci il contenitore attuale

    if (plants.length === 0) {
        if (isMyGardenCurrentlyVisible) {
            emptyGardenMessage.style.display = 'block';
        } else {
            // Potresti aggiungere un messaggio anche qui per la galleria principale
            // Ad esempio: gardenContainer.innerHTML = '<p style="text-align:center; color:#666;">Nessuna pianta trovata con i criteri selezionati.</p>';
        }
        return;
    } else {
        emptyGardenMessage.style.display = 'none';
    }

    plants.forEach(plant => {
        const card = document.createElement('div');
        card.classList.add('plant-card');
        if (isMyGardenCurrentlyVisible) {
            card.classList.add('my-plant-card');
        }

        const plantImage = plant.imageUrl && plant.imageUrl.startsWith('http') ? plant.imageUrl : 'https://via.placeholder.com/150?text=No+Image';
        
        card.innerHTML = `
            <img src="${plantImage}" alt="${plant.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/150?text=Image+Error';" data-plant-id="${plant.id}">
            <h3>${plant.name}</h3>
            <p><strong>Tipo:</strong> ${plant.type || 'N/D'}</p>
            <p><strong>Luce:</strong> ${plant.light || 'N/D'}</p>
            <p><strong>Acqua:</strong> ${plant.water || 'N/D'}</p>
            ${plant.climateZone ? `<p><strong>Clima:</strong> ${plant.climateZone}</p>` : ''} <div class="card-actions">
                <button class="btn btn-info view-details-button" data-plant-id="${plant.id}">Dettagli</button>
                ${isMyGardenCurrentlyVisible ? `
                    <button class="btn btn-warning edit-button" data-plant-id="${plant.id}">Modifica</button>
                    <button class="btn btn-danger delete-button" data-plant-id="${plant.id}">Elimina</button>
                ` : ''}
            </div>
        `;
        targetContainer.appendChild(card);
    });

    // Aggiungi event listener per i bottoni "Dettagli", "Modifica", "Elimina"
    targetContainer.querySelectorAll('.view-details-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const plantId = event.target.dataset.plantId;
            showPlantDetailsModal(plantId);
        });
    });
    targetContainer.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const plantId = event.target.dataset.plantId;
            showUpdatePlantModal(plantId);
        });
    });
    targetContainer.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const plantId = event.target.dataset.plantId;
            deletePlant(plantId);
        });
    });
    targetContainer.querySelectorAll('.plant-card img').forEach(img => {
        img.addEventListener('click', (event) => {
            const plantId = event.target.dataset.plantId;
            openImageModal(plantId, event.target.src);
        });
    });
}


async function updateGardenVisibility(showMyGarden) {
    isMyGardenCurrentlyVisible = showMyGarden;
    if (toggleMyGardenButton) {
        toggleMyGardenButton.innerText = showMyGarden ? 'Mostra Tutte le Piante' : 'Mostra il mio Giardino';
        toggleMyGardenButton.classList.toggle('btn-secondary', showMyGarden);
        toggleMyGardenButton.classList.toggle('btn-primary', !showMyGarden);
    }

    if (plantsSection) plantsSection.style.display = showMyGarden ? 'none' : 'block';
    if (myGardenContainer) myGardenContainer.style.display = showMyGarden ? 'grid' : 'none';
    if (giardinoTitle) giardinoTitle.style.display = showMyGarden ? 'block' : 'none';

    // Rimuovi il messaggio di "Giardino vuoto" se stiamo mostrando tutte le piante
    if (emptyGardenMessage) emptyGardenMessage.style.display = 'none';

    applyFilters(); // Riapplica i filtri per la vista corrente
}

// 6. FUNZIONI MODAL
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex'; // Cambiato da 'block' a 'flex' per il centering
        setTimeout(() => modal.classList.add('show'), 10); // Aggiungi la classe 'show' per l'animazione fade-in
        document.body.classList.add('modal-open'); // Previene lo scroll del body
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show'); // Rimuovi la classe 'show' per l'animazione fade-out
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open'); // Riabilita lo scroll del body
        }, 300); // Ritarda la chiusura per permettere l'animazione CSS
    }
}

function openImageModal(plantId, imageUrl) {
    const plant = allPlants.find(p => p.id === plantId) || myGarden.find(p => p.id === plantId);
    
    // Mostra l'immagine zoomata
    zoomedImage.src = imageUrl;
    zoomedImage.alt = plant ? plant.name : 'Immagine pianta';
    zoomedImage.style.display = 'block'; // Mostra l'immagine

    // Nascondi i dettagli della pianta se erano visibili dalla card modal
    modalPlantDetails.style.display = 'none';

    // Mostra la caption sotto l'immagine
    const imageCaption = document.getElementById('image-caption');
    if (plant) {
        imageCaption.innerHTML = `
            <h3>${plant.name}</h3>
            <p>${plant.description || 'Nessuna descrizione.'}</p>
        `;
    } else {
        imageCaption.innerText = 'Dettagli immagine';
    }
    
    openModal('image-modal');
}


function showPlantDetailsModal(plantId) {
    const plant = allPlants.find(p => p.id === plantId) || myGarden.find(p => p.id === plantId);
    if (plant) {
        // Nascondi l'immagine zoomata se era visibile
        zoomedImage.style.display = 'none';
        
        // Costruisci i dettagli della pianta nel div modal-plant-details
        modalPlantDetails.innerHTML = `
            <h3>${plant.name}</h3>
            <p><strong>Descrizione:</strong> ${plant.description || 'N/D'}</p>
            <p><strong>Tipo:</strong> ${plant.type || 'N/D'}</p>
            <p><strong>Esigenza Luce:</strong> ${plant.light || 'N/D'}</p>
            <p><strong>Esigenza Acqua:</strong> ${plant.water || 'N/D'}</p>
            ${plant.climateZone ? `<p><strong>Zona Climatica:</strong> ${plant.climateZone}</p>` : ''}
            <p><strong>Note:</strong> ${plant.notes || 'Nessuna nota.'}</p>
            ${plant.lastModified && typeof plant.lastModified.toDate === 'function' ? `<p><strong>Ultima Modifica:</strong> ${plant.lastModified.toDate().toLocaleDateString()}</p>` : ''}
        `;
        modalPlantDetails.style.display = 'block'; // Mostra i dettagli
        openModal('image-modal'); // Riusa la stessa modal per i dettagli della card
    } else {
        alert("Dettagli pianta non trovati.");
    }
}


// 7. FUNZIONI UTILITY (Spinner, Geolocalizzazione, etc.)
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

// Funzione per ottenere la posizione dell'utente e dedurre la zona climatica
async function getUserLocation() {
    if ("geolocation" in navigator) {
        // Aggiorna lo stato per mostrare lo spinner e il testo "Ricerca posizione..."
        locationStatusDiv.innerHTML = '<i class="fas fa-location-dot fa-spin"></i> <span>Ricerca posizione...</span>'; 
        getLocationButton.disabled = true; // Disabilita il bottone durante la ricerca

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                console.log("Posizione ottenuta:", userLocation);

                // Dedurre la zona climatica dalla latitudine
                detectedClimateZone = deduceClimateZone(userLocation.latitude);
                locationStatusDiv.innerHTML = `<i class="fas fa-location-dot"></i> <span>Clima rilevato: ${detectedClimateZone || 'Sconosciuto'}</span>`;
                
                // Seleziona automaticamente la zona climatica nel filtro
                if (climateZoneFilter) {
                    climateZoneFilter.value = detectedClimateZone || ''; // Seleziona l'opzione rilevata o "Tutti"
                }
                
                getLocationButton.disabled = false;
                applyFilters(); // Applica i filtri per mostrare le piante adatte
            },
            (error) => {
                console.error("Errore geolocalizzazione:", error);
                getLocationButton.disabled = false;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        locationStatusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Accesso negato. Abilita permessi.</span>';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        locationStatusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Posizione non disponibile.</span>';
                        break;
                    case error.TIMEOUT:
                        locationStatusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Richiesta posizione scaduta.</span>';
                        break;
                    default:
                        locationStatusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Errore geolocalizzazione.</span>';
                        break;
                }
                userLocation = null; // Resetta la posizione in caso di errore
                detectedClimateZone = null; // Resetta la zona climatica
                if (climateZoneFilter) {
                    climateZoneFilter.value = ''; // Resetta il filtro
                }
                applyFilters(); // Ricarica anche se c'è stato un errore
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        locationStatusDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> <span>Geolocalizzazione non supportata.</span>';
        console.log("Geolocalizzazione non supportata.");
        getLocationButton.disabled = false;
    }
}

// Funzione per dedurre una zona climatica approssimativa dalla latitudine
function deduceClimateZone(latitude) {
    // Definizione delle fasce di latitudine per zone climatiche approssimative
    // Queste sono solo deduzioni semplificate e possono essere affinate in base ai tuoi dati.
    
    // Per l'emisfero Nord e Sud (usiamo Math.abs per la latitudine)
    const absLat = Math.abs(latitude);

    if (absLat < 23.5) { // Tra i Tropici (Equatore, Sub-equatoriale)
        return 'Tropicale';
    } else if (absLat >= 23.5 && absLat < 35) { // Fascia Subtropicale (es. Florida, Egitto)
        return 'Subtropicale';
    } else if (absLat >= 35 && absLat < 45) { // Fascia Mediterranea/Temperata Calda (es. Italia, California)
        return 'Mediterraneo'; // O Temperato se non vuoi distinzioni troppo specifiche
    } else if (absLat >= 45 && absLat < 60) { // Fascia Temperata (es. gran parte dell'Europa e Nord America)
        return 'Temperato';
    } else if (absLat >= 60 && absLat <= 90) { // Fascia Boreale/Artico
        return 'Boreale/Artico'; // Potrebbe essere "Freddo" o "Artico"
    } else {
        return 'Sconosciuto';
    }
}

/*
// Funzione per inizializzare il sensore di luce ambientale (OPZIONALE: se necessario e testato)
function initAmbientLightSensor() {
    if ('AmbientLightSensor' in window) {
        try {
            ambientLightSensor = new AmbientLightSensor();
            ambientLightSensor.onreading = () => {
                console.log('Illuminazione ambientale:', ambientLightSensor.illuminance);
                // Puoi usare questo valore per adattare l'interfaccia o suggerire piante
            };
            ambientLightSensor.onerror = (event) => {
                console.error('Errore AmbientLightSensor:', event.error.name, event.error.message);
            };
            ambientLightSensor.start();
            console.log("AmbientLightSensor avviato.");
        } catch (error) {
            console.error('AmbientLightSensor non disponibile o errore:', error);
            // Gestisci il caso in cui il sensore non sia disponibile o i permessi siano negati
        }
    } else {
        console.log("AmbientLightSensor non supportato dal browser.");
    }
}
*/
