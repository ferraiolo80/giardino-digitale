// app (1).js

// ===========================================================================
// 1. DICHIARAZIONI VARIABILI GLOBALI
// ===========================================================================
let allPlants = []; // Contiene tutte le piante dal database
let myGarden = []; // Contiene le piante che l'utente ha aggiunto al suo giardino
let currentPlantIdToUpdate = null; // ID della pianta attualmente in fase di modifica

// Variabili per il sensore di luce
let ambientLightSensor = null;
let isLightSensorActive = false; // Flag per lo stato del sensore di luce

// Variabili per la gestione della visualizzazione del giardino
let isMyGardenCurrentlyVisible = false; // True se è visibile "Il mio giardino", False per "Tutte le piante"

// Variabili per l'ordinamento e i filtri
let currentSortBy = 'name_asc'; // Criterio di ordinamento predefinito

// Variabili DOM - saranno inizializzate in DOMContentLoaded
let authContainerDiv;
let appContentDiv;
let loginButton;
let registerButton;
let logoutButton;
let authStatusDiv;
let loginErrorDiv;
let registerErrorDiv;

let getClimateButton;
let locationStatusDiv;
let climateZoneFilter;
let tempMinFilter;
let tempMaxFilter;

let searchInput;
let addNewPlantButton;
let newPlantCard;
let saveNewPlantButton;
let cancelNewPlantButton;
let categoryFilter;
let toggleMyGardenButton;
let giardinoTitle;

let startLightSensorButton;
let stopLightSensorButton;
let currentLuxValueSpan;
let lightFeedbackDiv;

let newPlantIdealLuxMinInput;
let newPlantIdealLuxMaxInput;
let updatePlantIdealLuxMinInput;
let updatePlantIdealLuxMaxInput;

let updatePlantCard;
let saveUpdatedPlantButton;
let cancelUpdatePlantButton;
let emptyGardenMessage;
let plantsSection;
let sortBySelect;

let gardenContainer;
let myGardenContainer;

let loadingSpinner; // Spinner di caricamento
let toastContainer; // Contenitore per i messaggi toast

let isDomReady = false; // Flag per indicare se il DOM è stato completamente caricato

// Variabili per la modal immagine
let imageModal;
let zoomedImage;
let closeButton;


// ===========================================================================
// 2. MAPPATURA CLIMI - NUOVO!
// ===========================================================================
// Mappatura delle zone climatiche agli intervalli di temperatura tipici (°C)
// Puoi ajustarli in base alle tue esigenze specifiche e al tuo database di piante.
const CLIMATE_TEMP_RANGES = {
    'Mediterraneo': { min: 5, max: 35 },
    'Temperato': { min: -10, max: 30 },
    'Tropicale': { min: 18, max: 40 },
    'Subtropicale': { min: 10, max: 38 },
    'Boreale/Artico': { min: -40, max: 20 },
    'Arido': { min: 0, max: 45 },
    'Sconosciuto': { min: -999, max: 999 } // Ampio range per non filtrare se il clima è sconosciuto
};


// ===========================================================================
// 3. FUNZIONI DI UTILITÀ (Essenziali per il funzionamento)
// ===========================================================================

// Mostra lo spinner di caricamento
function showLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex'; // Assicurati che il tuo CSS lo posizioni al centro
    }
}

// Nasconde lo spinner di caricamento
function hideLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

// Mostra un messaggio toast (notifica a comparsa)
function showToast(message, type = 'info', duration = 3000) {
    if (!toastContainer) {
        console.warn("toastContainer non trovato. Impossibile mostrare il toast:", message);
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`); // richiederà CSS per le classi .toast, .toast-info, .toast-success, .toast-error
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Forza un reflow per l'animazione slide-in (se definita in CSS)
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide'); // Aggiungi una classe per l'animazione slide-out se hai animazioni CSS
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
    }, duration);
}

// Funzione per visualizzare le piante nel contenitore specificato
function displayPlants(plantsToDisplay, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Contenitore con ID ${containerId} non trovato.`);
        return;
    }
    container.innerHTML = ''; // Pulisci il contenitore prima di riempirlo

    if (plantsToDisplay.length === 0) {
        if (containerId === 'my-garden' && isMyGardenCurrentlyVisible) {
            emptyGardenMessage.style.display = 'block';
        } else {
            emptyGardenMessage.style.display = 'none'; // Nascondi se non è il mio giardino o non è visibile
            container.innerHTML = '<p>Nessuna pianta trovata con i filtri attivi.</p>';
        }
        return;
    } else {
        emptyGardenMessage.style.display = 'none';
    }

    plantsToDisplay.forEach(plant => {
        const plantCard = document.createElement('div');
        plantCard.classList.add('plant-card');
        plantCard.dataset.plantId = plant.id;

        // Determina se la pianta è già nel giardino dell'utente
        const isInMyGarden = myGarden.some(p => p.id === plant.id);
        const user = auth.currentUser; // Ottieni l'utente corrente per abilitare/disabilitare i bottoni

        plantCard.innerHTML = `
            <h3>${plant.name}</h3>
            ${plant.image ? `<img src="${plant.image}" alt="${plant.name}" class="plant-image">` : ''}
            <p><strong>Luce:</strong> ${plant.sunlight}</p>
            <p><strong>Lux Ideale:</strong> ${plant.idealLuxMin || 'N/A'} - ${plant.idealLuxMax || 'N/A'} Lux</p>
            <p><strong>Acqua:</strong> ${plant.watering}</p>
            <p><strong>Temperatura:</strong> ${plant.tempMin}°C - ${plant.tempMax}°C</p>
            <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
            ${plant.description ? `<p>${plant.description}</p>` : ''}
            <div class="card-actions">
                ${user ? `<button class="add-to-garden-button" data-plant-id="${plant.id}" ${isInMyGarden ? 'style="display:none;"' : ''}>Aggiungi al Giardino</button>` : ''}
                ${user ? `<button class="remove-button" data-plant-id="${plant.id}" ${!isInMyGarden ? 'style="display:none;"' : ''}>Rimuovi dal Giardino</button>` : ''}
                ${user ? `<button class="update-plant-button" data-plant-id="${plant.id}">Aggiorna</button>` : ''}
                ${user ? `<button class="delete-plant-from-db-button" data-plant-id="${plant.id}">Elimina</button>` : ''}
            </div>
        `;
        container.appendChild(plantCard);

        // Listener per zoom immagine
        const plantImage = plantCard.querySelector('.plant-image');
        if (plantImage) {
            plantImage.addEventListener('click', () => {
                zoomedImage.src = plant.image;
                imageModal.style.display = 'block';
            });
        }
    });
}

// Funzione per ordinare le piante
function sortPlants(plants) {
    if (!plants || plants.length === 0) return;

    plants.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        if (currentSortBy === 'name_asc') {
            return nameA.localeCompare(nameB);
        } else if (currentSortBy === 'name_desc') {
            return nameB.localeCompare(nameA);
        }
        // Puoi aggiungere qui altri criteri di ordinamento, es. per categoria, temperatura, ecc.
        return 0; // Nessun cambiamento nell'ordinamento se il criterio non è riconosciuto
    });
}

// Funzione per applicare tutti i filtri e aggiornare la visualizzazione
function applyFilters() {
    let filteredPlants = allPlants; // Inizia con tutte le piante

    // 1. Filtro per Categoria
    const category = categoryFilter.value;
    if (category && category !== 'all') {
        filteredPlants = filteredPlants.filter(plant => plant.category === category);
    }

    // 2. Filtro per Ricerca (Nome)
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredPlants = filteredPlants.filter(plant =>
            plant.name.toLowerCase().includes(searchTerm)
        );
    }

    // 3. Filtro per Clima (Geolocalizzazione) - REVISIONATO!
    const selectedClimate = climateZoneFilter.value;
    if (selectedClimate && selectedClimate !== '' && selectedClimate !== 'Sconosciuto') {
        const climateRange = CLIMATE_TEMP_RANGES[selectedClimate];
        if (climateRange) {
            filteredPlants = filteredPlants.filter(plant => {
                const plantMin = parseInt(plant.tempMin);
                const plantMax = parseInt(plant.tempMax);

                // Controlla che i valori siano numeri validi
                if (isNaN(plantMin) || isNaN(plantMax)) {
                    console.warn(`La pianta ${plant.name} ha valori di temperatura non numerici. Ignorata nel filtro clima.`);
                    return false;
                }

                // La pianta è compatibile se il suo intervallo di temperatura ideale
                // è completamente contenuto nell'intervallo del clima dedotto.
                return plantMin >= climateRange.min && plantMax <= climateRange.max;
            });
        } else {
            console.warn(`Intervallo di temperatura non definito per il clima dedotto: ${selectedClimate}. Nessuna pianta sarà mostrata per questo filtro.`);
            filteredPlants = []; // Nessuna pianta è compatibile con un clima sconosciuto o non mappato
        }
    }

    // 4. Filtro per Temperatura Minima (dall'input dell'utente)
    const tempMin = parseFloat(tempMinFilter.value);
    if (!isNaN(tempMin)) {
        filteredPlants = filteredPlants.filter(plant => plant.tempMin >= tempMin);
    }

    // 5. Filtro per Temperatura Massima (dall'input dell'utente)
    const tempMax = parseFloat(tempMaxFilter.value);
    if (!isNaN(tempMax)) {
        filteredPlants = filteredPlants.filter(plant => plant.tempMax <= tempMax);
    }

    // Ordina le piante filtrate
    sortPlants(filteredPlants);

    // Visualizza le piante filtrate nel contenitore corretto
    if (isMyGardenCurrentlyVisible) {
        // Step 1: Ottieni le piante complete che sono nel giardino dell'utente
        // Questo fa un "join" tra myGarden (che ha solo ID e nome) e allPlants (che ha tutti i dettagli)
        let plantsInMyGardenWithDetails = [];
        myGarden.forEach(gardenPlant => {
            const fullPlantDetails = allPlants.find(fullPlant => fullPlant.id === gardenPlant.id);
            if (fullPlantDetails) {
                plantsInMyGardenWithDetails.push(fullPlantDetails);
            }
        });

        // Step 2: Applica i filtri esistenti (ricerca, categoria, clima, temperatura)
        // a questo sottoinsieme di piante (quelle nel giardino)
        let myFilteredPlants = plantsInMyGardenWithDetails;

        // Qui riapplichiamo i filtri come per la galleria principale, ma solo sulle piante del giardino
        // (Queste parti sono già nel tuo applyFilters, ma assicurati che operino su 'myFilteredPlants' qui)

        // Filtro per Categoria
        const category = categoryFilter.value;
        if (category && category !== 'all') {
            myFilteredPlants = myFilteredPlants.filter(plant => plant.category === category);
        }

        // Filtro per Ricerca (Nome)
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            myFilteredPlants = myFilteredPlants.filter(plant =>
                plant.name.toLowerCase().includes(searchTerm)
            );
        }

        // Filtro per Clima (Geolocalizzazione)
        const selectedClimate = climateZoneFilter.value;
        if (selectedClimate && selectedClimate !== '' && selectedClimate !== 'Sconosciuto') {
            const climateRange = CLIMATE_TEMP_RANGES[selectedClimate];
            if (climateRange) {
                myFilteredPlants = myFilteredPlants.filter(plant => {
                    const plantMin = parseInt(plant.tempMin);
                    const plantMax = parseInt(plant.tempMax);
                    return !isNaN(plantMin) && !isNaN(plantMax) &&
                           plantMin >= climateRange.min && plantMax <= climateRange.max;
                });
            } else {
                myFilteredPlants = [];
            }
        }

        // Filtro per Temperatura Minima
        const tempMin = parseFloat(tempMinFilter.value);
        if (!isNaN(tempMin)) {
            myFilteredPlants = myFilteredPlants.filter(plant => plant.tempMin >= tempMin);
        }

        // Filtro per Temperatura Massima
        const tempMax = parseFloat(tempMaxFilter.value);
        if (!isNaN(tempMax)) {
            myFilteredPlants = myFilteredPlants.filter(plant => plant.tempMax <= tempMax);
        }

        // Ordina le piante filtrate del giardino
        sortPlants(myFilteredPlants);

        displayPlants(myFilteredPlants, 'my-garden');

        // Gestione messaggi di giardino vuoto/filtrato
        if (myGarden.length === 0) {
            emptyGardenMessage.style.display = 'block';
            emptyGardenMessage.textContent = "Il tuo giardino è vuoto. Aggiungi alcune piante dalla galleria principale!";
        } else if (myFilteredPlants.length === 0 && myGarden.length > 0) {
             emptyGardenMessage.style.display = 'block';
             emptyGardenMessage.textContent = "Nessuna pianta nel tuo giardino corrisponde ai filtri attivi.";
        } else {
             emptyGardenMessage.style.display = 'none';
        }

    } else {
        displayPlants(filteredPlants, 'garden-container');
    }
}


// ===========================================================================
// 4. FUNZIONI DI AUTENTICAZIONE E UI
// ===========================================================================

// Gestisce il cambio di stato di autenticazione e aggiorna l'UI
async function handleAuthAndUI(user) {
    if (!isDomReady) {
        console.warn("DOM non ancora pronto, ritardo l'aggiornamento UI.");
        setTimeout(() => handleAuthAndUI(user), 100); // Riprova dopo un breve ritardo
        return;
    }

    if (user) {
        authStatusDiv.innerHTML = `<i class="fas fa-user"></i> <span>Benvenuto</span> ${user.email}`;
        logoutButton.style.display = 'inline-block';
        authContainerDiv.style.display = 'none';
        appContentDiv.style.display = 'block';
        console.log("Stato autenticazione cambiato, utente loggato:", user.uid, user.email);

        // Carica le piante e il giardino solo dopo che l'utente è loggato
        await fetchPlantsFromFirebase();
        await fetchMyGardenFromFirebase(user.uid);
        applyFilters(); // Applica i filtri iniziali dopo aver caricato i dati

    } else {
        authStatusDiv.textContent = 'Nessun utente loggato';
        logoutButton.style.display = 'none';
        authContainerDiv.style.display = 'block';
        appContentDiv.style.display = 'none';
        console.log("Stato autenticazione cambiato, nessun utente loggato.");
        // Pulisci i dati delle piante se l'utente si è disconnesso
        allPlants = [];
        myGarden = [];
        displayPlants([], 'garden-container');
        displayPlants([], 'my-garden');
    }
}

// Gestore per il login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    loginErrorDiv.textContent = ''; // Pulisci errori precedenti

    try {
        showLoadingSpinner();
        await auth.signInWithEmailAndPassword(email, password);
        showToast('Accesso effettuato con successo!', 'success');
        // handleAuthAndUI sarà chiamato dall'observer onAuthStateChanged
    } catch (error) {
        console.error("Errore di login:", error);
        let errorMessage = "Errore di accesso.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = "Email o password non validi.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Formato email non valido.";
        }
        loginErrorDiv.textContent = errorMessage;
        showToast(errorMessage, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Gestore per la registrazione
async function handleRegister() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    registerErrorDiv.textContent = ''; // Pulisci errori precedenti

    if (password !== confirmPassword) {
        registerErrorDiv.textContent = "Le password non corrispondono.";
        showToast("Le password non corrispondono.", 'error');
        return;
    }

    if (password.length < 6) {
        registerErrorDiv.textContent = "La password deve essere di almeno 6 caratteri.";
        showToast("La password deve essere di almeno 6 caratteri.", 'error');
        return;
    }

    try {
        showLoadingSpinner();
        await auth.createUserWithEmailAndPassword(email, password);
        showToast('Registrazione effettuata con successo!', 'success');
        // handleAuthAndUI sarà chiamato dall'observer onAuthStateChanged
    } catch (error) {
        console.error("Errore di registrazione:", error);
        let errorMessage = "Errore di registrazione.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "Questa email è già registrata.";
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = "Formato email non valido.";
        }
        registerErrorDiv.textContent = errorMessage;
        showToast(errorMessage, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Gestore per il logout
async function handleLogout() {
    try {
        showLoadingSpinner();
        await auth.signOut();
        showToast('Logout effettuato con successo!', 'info');
        // handleAuthAndUI sarà chiamato dall'observer onAuthStateChanged
    } catch (error) {
        console.error("Errore di logout:", error);
        showToast("Errore durante il logout.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione per mostrare/nascondere il proprio giardino
function handleToggleMyGarden() {
    isMyGardenCurrentlyVisible = !isMyGardenCurrentlyVisible;
    if (isMyGardenCurrentlyVisible) {
        giardinoTitle.textContent = "Il mio Giardino";
        toggleMyGardenButton.textContent = "Mostra Tutte le Piante";
        gardenContainer.style.display = 'none';
        myGardenContainer.style.display = 'grid'; // O 'block' a seconda del tuo layout
        applyFilters(); // Ricarica le piante con i filtri attivi sul giardino
    } else {
        giardinoTitle.textContent = "Tutte le Piante";
        toggleMyGardenButton.textContent = "Mostra il mio Giardino";
        myGardenContainer.style.display = 'none';
        gardenContainer.style.display = 'grid'; // O 'block'
        applyFilters(); // Ricarica tutte le piante con i filtri attivi
    }
}


// ===========================================================================
// 5. FUNZIONI DI INTERAZIONE CON FIRESTORE (Database delle piante)
// ===========================================================================

// Recupera tutte le piante dal database
async function fetchPlantsFromFirebase() {
    showLoadingSpinner();
    try {
        const snapshot = await db.collection('plants').get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante caricate da Firebase:", allPlants);
    } catch (error) {
        console.error("Errore nel caricare le piante:", error);
        showToast("Errore nel caricare le piante.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Recupera le piante nel giardino dell'utente
async function fetchMyGardenFromFirebase(uid) {
    if (!uid) {
        myGarden = [];
        return;
    }
    try {
        const doc = await db.collection('gardens').doc(uid).get();
        if (doc.exists) {
            myGarden = doc.data().plants || [];
        } else {
            myGarden = [];
        }
        console.log("Giardino caricato da Firebase:", myGarden);
    } catch (error) {
        console.error("Errore nel caricare il giardino:", error);
        showToast("Errore nel caricare il tuo giardino.", 'error');
    }
}

// Aggiunge una pianta al giardino dell'utente
async function addToMyGarden(plantId) {
    const user = auth.currentUser;
    if (!user) {
        showToast("Devi essere loggato per aggiungere piante al tuo giardino.", 'info');
        return;
    }

    // Controlla se la pianta è già nel giardino
    if (myGarden.some(plant => plant.id === plantId)) {
        showToast("Questa pianta è già nel tuo giardino!", 'info');
        return;
    }

    const plantToAdd = allPlants.find(p => p.id === plantId);
    if (!plantToAdd) {
        showToast("Pianta non trovata nel database globale.", 'error');
        return;
    }

    showLoadingSpinner();
    try {
        // Aggiungi solo l'ID e il nome (o un sottoinsieme di dati) per mantenere il documento del giardino leggero
        const plantRef = { id: plantToAdd.id, name: plantToAdd.name };
        await db.collection('gardens').doc(user.uid).set({
            plants: firebase.firestore.FieldValue.arrayUnion(plantRef)
        }, { merge: true }); // Usa merge:true per non sovrascrivere l'intero documento
        myGarden.push(plantRef); // Aggiorna la variabile locale
        showToast(`'${plantToAdd.name}' aggiunta al tuo giardino!`, 'success');
        applyFilters(); // Aggiorna la UI per mostrare i bottoni corretti
    } catch (error) {
        console.error("Errore nell'aggiungere la pianta al giardino:", error);
        showToast("Errore nell'aggiungere la pianta al giardino.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Rimuove una pianta dal giardino dell'utente
async function removeFromMyGarden(plantId) {
    const user = auth.currentUser;
    if (!user) {
        showToast("Devi essere loggato per rimuovere piante dal tuo giardino.", 'info');
        return;
    }

    // Trova la pianta da rimuovere nel giardino locale
    const plantToRemove = myGarden.find(p => p.id === plantId);
    if (!plantToRemove) {
        showToast("Questa pianta non è nel tuo giardino.", 'info');
        return;
    }

    showLoadingSpinner();
    try {
        // Rimuovi l'oggetto pianta esatto dal campo array in Firestore
        await db.collection('gardens').doc(user.uid).update({
            plants: firebase.firestore.FieldValue.arrayRemove(plantToRemove)
        });
        myGarden = myGarden.filter(plant => plant.id !== plantId); // Aggiorna la variabile locale
        showToast(`'${plantToRemove.name}' rimossa dal tuo giardino.`, 'info');
        applyFilters(); // Aggiorna la UI
    } catch (error) {
        console.error("Errore nel rimuovere la pianta dal giardino:", error);
        showToast("Errore nel rimuovere la pianta dal giardino.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Salva una nuova pianta nel database (funzione da implementare)
async function saveNewPlantToFirebase(event) {
    event.preventDefault(); // Impedisce il ricaricamento della pagina del form

    // Riferimenti agli input del form (Devi inizializzarli globalmente o recuperarli qui)
    const newPlantNameInput = document.getElementById('newPlantName');
    const newPlantSunlightInput = document.getElementById('newPlantSunlight');
    const newPlantWateringInput = document.getElementById('newPlantWatering');
    const newPlantTempMinInput = document.getElementById('newPlantTempMin');
    const newPlantTempMaxInput = document.getElementById('newPlantTempMax');
    const newPlantDescriptionInput = document.getElementById('newPlantDescription');
    const newPlantCategorySelect = document.getElementById('newPlantCategory');
    const newPlantImageURLInput = document.getElementById('newPlantImageURL');
    const newPlantIdealLuxMinInputElem = document.getElementById('newPlantIdealLuxMin');
    const newPlantIdealLuxMaxInputElem = document.getElementById('newPlantIdealLuxMax');


    // Validazione base
    clearFormValidationErrors(newPlantCard);
    let formIsValid = true;

    if (!validateField(newPlantNameInput, document.getElementById('errorNewPlantName'), 'Il nome è obbligatorio.')) formIsValid = false;
    if (!validateField(newPlantSunlightInput, document.getElementById('errorNewPlantSunlight'), 'La luce è obbligatoria.')) formIsValid = false;
    if (!validateField(newPlantWateringInput, document.getElementById('errorNewPlantWatering'), 'L\'acqua è obbligatoria.')) formIsValid = false;
    if (!validateField(newPlantIdealLuxMinInputElem, document.getElementById('errorNewPlantIdealLuxMin'), 'Lux Min è obbligatorio e deve essere un numero.')) formIsValid = false;
    if (!validateField(newPlantIdealLuxMaxInputElem, document.getElementById('errorNewPlantIdealLuxMax'), 'Lux Max è obbligatorio e deve essere un numero.')) formIsValid = false;
    if (!validateField(newPlantTempMinInput, document.getElementById('errorNewPlantTempMin'), 'Temp Min è obbligatoria e deve essere un numero.')) formIsValid = false;
    if (!validateField(newPlantTempMaxInput, document.getElementById('errorNewPlantTempMax'), 'Temp Max è obbligatoria e deve essere un numero.')) formIsValid = false;
    if (!validateField(newPlantCategorySelect, document.getElementById('errorNewPlantCategory'), 'La categoria è obbligatoria.', true)) formIsValid = false; // true per select
    // URL immagine non è obbligatorio, quindi non validarlo con required, ma solo se c'è
    if (newPlantImageURLInput.value && !isValidUrl(newPlantImageURLInput.value)) {
        document.getElementById('errorNewPlantImageURL').textContent = 'Inserisci un URL immagine valido.';
        formIsValid = false;
    }


    if (!formIsValid) {
        showToast('Per favore, correggi gli errori nel form.', 'error');
        return;
    }

    const newPlantData = {
        name: newPlantNameInput.value,
        sunlight: newPlantSunlightInput.value,
        watering: newPlantWateringInput.value,
        idealLuxMin: parseInt(newPlantIdealLuxMinInputElem.value),
        idealLuxMax: parseInt(newPlantIdealLuxMaxInputElem.value),
        tempMin: parseInt(newPlantTempMinInput.value),
        tempMax: parseInt(newPlantTempMaxInput.value),
        description: newPlantDescriptionInput.value,
        category: newPlantCategorySelect.value,
        image: newPlantImageURLInput.value || 'https://via.placeholder.com/150?text=No+Image', // Immagine placeholder
        addedBy: auth.currentUser ? auth.currentUser.uid : 'anonymous', // Registra chi ha aggiunto la pianta
        createdAt: firebase.firestore.FieldValue.serverTimestamp() // Timestamp
    };

    showLoadingSpinner();
    try {
        const docRef = await db.collection('plants').add(newPlantData);
        newPlantData.id = docRef.id; // Aggiungi l'ID generato all'oggetto locale
        allPlants.push(newPlantData); // Aggiungi la nuova pianta all'array locale
        showToast(`Pianta '${newPlantData.name}' aggiunta con successo!`, 'success');
        clearNewPlantForm();
        newPlantCard.style.display = 'none';
        applyFilters(); // Aggiorna la visualizzazione
    } catch (error) {
        console.error("Errore nell'aggiungere la pianta:", error);
        showToast("Errore nell'aggiungere la pianta.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Aggiorna una pianta esistente nel database
async function updatePlantInFirebase(plantId, updatedData) {
    showLoadingSpinner();
    try {
        await db.collection('plants').doc(plantId).update(updatedData);
        // Aggiorna la pianta nell'array locale allPlants
        const index = allPlants.findIndex(p => p.id === plantId);
        if (index !== -1) {
            allPlants[index] = { ...allPlants[index], ...updatedData };
        }
        showToast('Pianta aggiornata con successo!', 'success');
        clearUpdatePlantForm();
        updatePlantCard.style.display = 'none';
        applyFilters(); // Aggiorna la visualizzazione
    } catch (error) {
        console.error("Errore nell'aggiornare la pianta:", error);
        showToast("Errore nell'aggiornare la pianta.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Elimina una pianta dal database
async function deletePlantFromDatabase(plantId) {
    // Chiedi conferma all'utente prima di eliminare
    if (!confirm("Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile.")) {
        showToast("Eliminazione annullata.", 'info');
        return;
    }

    showLoadingSpinner();
    try {
        await db.collection('plants').doc(plantId).delete();
        allPlants = allPlants.filter(plant => plant.id !== plantId); // Rimuovi dall'array locale
        // Rimuovi anche dal giardino dell'utente se presente
        const user = auth.currentUser;
        if (user) {
             const plantInMyGarden = myGarden.find(p => p.id === plantId);
             if (plantInMyGarden) {
                await db.collection('gardens').doc(user.uid).update({
                    plants: firebase.firestore.FieldValue.arrayRemove(plantInMyGarden)
                });
                myGarden = myGarden.filter(p => p.id !== plantId);
            }
        }
        showToast('Pianta eliminata con successo!', 'success');
        updatePlantCard.style.display = 'none'; // Nasconde il form di aggiornamento se era aperto
        applyFilters(); // Aggiorna la visualizzazione
    } catch (error) {
        console.error("Errore nell'eliminare la pianta:", error);
        showToast("Errore nell'eliminare la pianta.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}


// ===========================================================================
// 6. FUNZIONI DI GESTIONE FORM
// ===========================================================================

// Mostra il form di aggiornamento con i dati della pianta selezionata
function showUpdatePlantForm(plant) {
    currentPlantIdToUpdate = plant.id;
    document.getElementById('updatePlantName').value = plant.name || '';
    document.getElementById('updatePlantSunlight').value = plant.sunlight || '';
    document.getElementById('updatePlantIdealLuxMin').value = plant.idealLuxMin || '';
    document.getElementById('updatePlantIdealLuxMax').value = plant.idealLuxMax || '';
    document.getElementById('updatePlantWatering').value = plant.watering || '';
    document.getElementById('updatePlantTempMin').value = plant.tempMin || '';
    document.getElementById('updatePlantTempMax').value = plant.tempMax || '';
    document.getElementById('updatePlantDescription').value = plant.description || '';
    document.getElementById('updatePlantCategory').value = plant.category || '';
    document.getElementById('updatePlantImageURL').value = plant.image || '';

    updatePlantCard.style.display = 'block';
    clearFormValidationErrors(updatePlantCard); // Pulisci errori precedenti
}

// Pulisce il form di aggiunta nuova pianta
function clearNewPlantForm() {
    document.getElementById('newPlantForm').reset();
    clearFormValidationErrors(newPlantCard);
}

// Pulisce il form di aggiornamento pianta
function clearUpdatePlantForm() {
    document.getElementById('updatePlantForm').reset();
    clearFormValidationErrors(updatePlantCard);
    currentPlantIdToUpdate = null;
}

// Funzione per la validazione di un singolo campo
function validateField(inputElement, errorElement, errorMessage, isSelect = false) {
    let isValid = true;
    if (isSelect) {
        if (!inputElement.value || inputElement.value === "") {
            isValid = false;
        }
    } else {
        if (!inputElement.value.trim()) {
            isValid = false;
        }
    }

    if (!isValid) {
        errorElement.textContent = errorMessage;
        inputElement.classList.add('input-error');
    } else {
        errorElement.textContent = '';
        inputElement.classList.remove('input-error');
    }
    return isValid;
}

// Funzione per pulire tutti gli errori di validazione in un form
function clearFormValidationErrors(formContainer) {
    const errorMessages = formContainer.querySelectorAll('.error-message');
    errorMessages.forEach(errorSpan => errorSpan.textContent = '');
    const inputErrors = formContainer.querySelectorAll('.input-error');
    inputErrors.forEach(input => input.classList.remove('input-error'));
}

// Funzione per la validazione URL (se non presente)
function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (e) {
      return false;
    }
}


// ===========================================================================
// 7. FUNZIONI GEOLOCALIZZAZIONE E CLIMA
// ===========================================================================

// Ottiene la posizione corrente dell'utente
function getLocation() {
    if (navigator.geolocation) {
        locationStatusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Acquisizione posizione in corso...';
        showLoadingSpinner(); // Mostra spinner
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                getClimateFromCoordinates(latitude, longitude);
            },
            error => {
                let errorMessage = "Impossibile ottenere la posizione.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Accesso alla posizione negato. Abilita la posizione nel browser.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Informazioni sulla posizione non disponibili.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Timeout nel recupero della posizione.";
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage = "Errore sconosciuto nella geolocalizzazione.";
                        break;
                }
                locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errorMessage}`;
                showToast(errorMessage, 'error');
                climateZoneFilter.value = ''; // Resetta il filtro clima
                applyFilters(); // Applica i filtri senza considerare il clima
                hideLoadingSpinner(); // Nasconde spinner in caso di errore
            }
        );
    } else {
        locationStatusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> La geolocalizzazione non è supportata dal tuo browser.';
        showToast("Geolocalizzazione non supportata.", 'error');
        climateZoneFilter.value = ''; // Resetta il filtro clima
        applyFilters(); // Applica i filtri senza considerare il clima
    }
}

// Deduce la zona climatica dalle coordinate (usando un servizio esterno o logica interna)
async function getClimateFromCoordinates(latitude, longitude) {
    // API Open-Meteo per temperatura e precipitazioni medie annuali
    // (Questa è una semplificazione, un'API climatica dedicata sarebbe più accurata)
    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_mean,precipitation_sum&current_weather=true&forecast_days=1&timezone=Europe%2FBerlin`;

    try {
        const response = await fetch(weatherApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Estrai temperatura media giornaliera (come proxy per il clima)
        const currentTemp = data.current_weather ? data.current_weather.temperature : null;
        const meanTemp2m = data.daily && data.daily.temperature_2m_mean ? data.daily.temperature_2m_mean[0] : null;
        const precipitationSum = data.daily && data.daily.precipitation_sum ? data.daily.precipitation_sum[0] : null;

        let climateZone = 'Sconosciuto';
        let statusMessage = '';

        if (currentTemp !== null || meanTemp2m !== null) {
            const tempToUse = currentTemp !== null ? currentTemp : meanTemp2m;

            if (tempToUse >= 25) {
                climateZone = 'Tropicale';
            } else if (tempToUse >= 15 && tempToUse < 25) {
                climateZone = 'Subtropicale';
            } else if (tempToUse >= 5 && tempToUse < 15) {
                climateZone = 'Temperato';
            } else if (tempToUse >= -5 && tempToUse < 5) { // Più specifico per Mediterraneo che può avere inverni freschi
                 if (precipitationSum !== null && precipitationSum < 10) { // Bassa piovosità per Mediterraneo
                    climateZone = 'Arido'; // O 'Mediterraneo' se ci sono altre condizioni specifiche di pioggia/siccità
                } else {
                    climateZone = 'Mediterraneo'; // O Temperato se piovosità alta
                }
            } else if (tempToUse < -5) {
                climateZone = 'Boreale/Artico';
            }

            // Affinamento per Mediterraneo/Arido basato su temperatura e precipitazioni
            if (tempToUse >= 10 && tempToUse <= 25 && precipitationSum !== null && precipitationSum < 2) { // Esempio: temperato-caldo e poca pioggia = Mediterraneo/Arido
                climateZone = 'Mediterraneo';
            } else if (tempToUse >= 25 && precipitationSum !== null && precipitationSum < 1) {
                climateZone = 'Arido';
            }


            statusMessage = `Clima dedotto: ${climateZone} (Temperatura attuale: ${currentTemp !== null ? currentTemp : 'N/A'}°C, Media giornaliera: ${meanTemp2m !== null ? meanTemp2m : 'N/A'}°C, Precipitazioni oggi: ${precipitationSum !== null ? precipitationSum : 'N/A'}mm)`;
            locationStatusDiv.innerHTML = `<i class="fas fa-location-dot"></i> ${statusMessage}`;
            showToast(`Clima rilevato: ${climateZone}`, 'success');

        } else {
            statusMessage = "Dati climatici non disponibili per questa posizione.";
            locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${statusMessage}`;
            showToast(statusMessage, 'info');
        }

        // Imposta il valore del filtro clima e applica i filtri
        climateZoneFilter.value = climateZone;
        applyFilters();

    } catch (error) {
        console.error("Errore nel recupero dei dati climatici:", error);
        locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Errore nel recupero dei dati climatici.`;
        showToast("Errore nel recupero dei dati climatici.", 'error');
        climateZoneFilter.value = ''; // Resetta il filtro clima
        applyFilters(); // Applica i filtri senza considerare il clima
    } finally {
        hideLoadingSpinner(); // Nasconde spinner al termine dell'operazione
    }
}


// ===========================================================================
// 8. FUNZIONI SENSORE DI LUCE
// ===========================================================================

// Controlla se il sensore di luce ambientale è disponibile e avvia la lettura
function startLightSensor() {
    if ('AmbientLightSensor' in window) {
        try {
            ambientLightSensor = new AmbientLightSensor();
            ambientLightSensor.onreading = () => {
                const lux = ambientLightSensor.illuminance.toFixed(2);
                currentLuxValueSpan.textContent = lux;
                // Qui puoi aggiungere logica per dare feedback in base ai lux
                // Esempio: lightFeedbackDiv.textContent = `Livello di luce: ${lux < 1000 ? 'Basso' : 'Ottimale'}`;
                let feedbackText = '';
                if (lux < 500) feedbackText = 'Luce molto bassa. Non adatta a molte piante.';
                else if (lux < 2000) feedbackText = 'Luce bassa. Adatta per piante da ombra/poca luce.';
                else if (lux < 5000) feedbackText = 'Luce moderata. Buona per molte piante da interno.';
                else if (lux < 10000) feedbackText = 'Luce forte. Ideale per piante che amano la luce indiretta brillante.';
                else feedbackText = 'Luce molto forte. Attenzione alla luce diretta del sole per alcune piante!';

                lightFeedbackDiv.textContent = feedbackText;
            };
            ambientLightSensor.onerror = (event) => {
                console.error("Errore sensore di luce:", event.error);
                lightFeedbackDiv.textContent = `Errore sensore: ${event.error.name}`;
                showToast(`Errore sensore di luce: ${event.error.message}`, 'error');
                stopLightSensor(); // Ferma il sensore in caso di errore
            };
            ambientLightSensor.start();
            isLightSensorActive = true;
            startLightSensorButton.style.display = 'none';
            stopLightSensorButton.style.display = 'inline-block';
            showToast('Misurazione luce avviata!', 'info');
        } catch (error) {
            console.error("Impossibile avviare il sensore di luce:", error);
            lightFeedbackDiv.textContent = `Errore: ${error.message}`;
            showToast(`Impossibile avviare il sensore di luce: ${error.message}`, 'error');
            isLightSensorActive = false;
        }
    } else {
        currentLuxValueSpan.textContent = 'N/A';
        lightFeedbackDiv.textContent = 'Sensore di luce ambientale non supportato dal tuo dispositivo/browser.';
        showToast('Sensore di luce non supportato.', 'info');
        isLightSensorActive = false;
    }
}

// Ferma la lettura del sensore di luce ambientale
function stopLightSensor() {
    if (ambientLightSensor && isLightSensorActive) {
        ambientLightSensor.stop();
        isLightSensorActive = false;
        startLightSensorButton.style.display = 'inline-block';
        stopLightSensorButton.style.display = 'none';
        currentLuxValueSpan.textContent = 'N/A';
        lightFeedbackDiv.textContent = '';
        showToast('Misurazione luce fermata.', 'info');
    }
}


// ===========================================================================
// 9. FUNZIONI MODAL
// ===========================================================================

// Inizializzazione della modal per le immagini
function initializeModal() {
    imageModal = document.getElementById('image-modal');
    zoomedImage = document.getElementById('zoomed-image');
    closeButton = document.querySelector('#image-modal .close-button');

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            imageModal.style.display = 'none';
        });
    }

    // Chiudi la modal cliccando fuori dall'immagine
    if (imageModal) {
        imageModal.addEventListener('click', (event) => {
            if (event.target === imageModal) {
                imageModal.style.display = 'none';
            }
        });
    }
}


// ===========================================================================
// 10. EVENT LISTENER PRINCIPALE DOMContentLoaded
// ===========================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Inizializza TUTTE le variabili globali degli elementi DOM qui
    // Assicurati che gli ID qui corrispondano ESATTAMENTE agli ID nel tuo index.html
    loginButton = document.getElementById('loginButton');
    registerButton = document.getElementById('registerButton');
    logoutButton = document.getElementById('logoutButton');
    authStatusDiv = document.getElementById('auth-status');
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');

    // Inizializzazione delle variabili DOM per la geolocalizzazione
    getClimateButton = document.getElementById('get-climate-button'); // Assicurati che l'ID sia corretto nell'HTML
    locationStatusDiv = document.getElementById('location-status');
    climateZoneFilter = document.getElementById('climate-zone-filter');
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');

    // Inizializzazione dei div per gli errori di autenticazione
    loginErrorDiv = document.getElementById('login-error');
    registerErrorDiv = document.getElementById('register-error');

    searchInput = document.getElementById('searchInput');
    addNewPlantButton = document.getElementById('addNewPlantButton');
    newPlantCard = document.getElementById('newPlantCard');
    saveNewPlantButton = document.getElementById('saveNewPlantButton');
    cancelNewPlantButton = document.getElementById('cancelNewPlantButton');
    categoryFilter = document.getElementById('categoryFilter');
    toggleMyGardenButton = document.getElementById('toggleMyGarden');
    giardinoTitle = document.getElementById('giardinoTitle');

    startLightSensorButton = document.getElementById('startLightSensorButton');
    stopLightSensorButton = document.getElementById('stopLightSensorButton');
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback');

    newPlantIdealLuxMinInput = document.getElementById('newPlantIdealLuxMin');
    newPlantIdealLuxMaxInput = document.getElementById('newPlantIdealLuxMax');
    updatePlantIdealLuxMinInput = document.getElementById('updatePlantIdealLuxMin');
    updatePlantIdealLuxMaxInput = document.getElementById('updatePlantIdealLuxMax');
    
    updatePlantCard = document.getElementById('updatePlantCard');
    saveUpdatedPlantButton = document.getElementById('saveUpdatePlantButton');
    cancelUpdatePlantButton = document.getElementById('cancelUpdatePlantButton');
    emptyGardenMessage = document.getElementById('empty-garden-message');
    plantsSection = document.getElementById('plantsSection');
    sortBySelect = document.getElementById('sortBy');

    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden');

    loadingSpinner = document.getElementById('loading-spinner');
    toastContainer = document.getElementById('toast-container');

    isDomReady = true; // Imposta la flag a TRUE DOPO che tutti gli elementi DOM sono stati inizializzati

    initializeModal(); // Inizializza la modal per le immagini

    // Listener per i bottoni di login/registrazione
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    // Listener per il bottone "Ottieni Clima" (Geolocalizzazione)
    if (getClimateButton) {
        getClimateButton.addEventListener('click', getLocation);
    } else {
        console.error("Bottone 'get-climate-button' non trovato!");
    }

    // Listener per l'aggiunta di nuove piante
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', () => newPlantCard.style.display = 'block');
    if (cancelNewPlantButton) cancelNewPlantButton.addEventListener('click', () => { newPlantCard.style.display = 'none'; clearNewPlantForm(); });
    if (saveNewPlantButton) saveNewPlantButton.addEventListener('click', saveNewPlantToFirebase);

    // Listener per la ricerca e i filtri (chiamano applyFilters)
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (tempMinFilter) tempMinFilter.addEventListener('input', applyFilters);
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', applyFilters);
    if (climateZoneFilter) climateZoneFilter.addEventListener('change', applyFilters); // Anche il cambio manuale del filtro clima

    // Listener per il pulsante "Mostra/Nascondi il mio giardino"
    if (toggleMyGardenButton) {
        toggleMyGardenButton.addEventListener('click', handleToggleMyGarden);
    }

    // Listener per il cambio di ordinamento
    if (sortBySelect) {
        sortBySelect.addEventListener('change', () => {
            currentSortBy = sortBySelect.value;
            applyFilters();
        });
    }

    // Listener per i bottoni del form di aggiornamento pianta
    if (saveUpdatedPlantButton) {
        saveUpdatedPlantButton.addEventListener('click', async () => {
            if (currentPlantIdToUpdate) {
                // Riferimenti agli input del form di aggiornamento (da recuperare o dichiarare qui)
                const updatePlantNameInput = document.getElementById('updatePlantName');
                const errorUpdatePlantName = document.getElementById('errorUpdatePlantName');
                const updatePlantSunlightInput = document.getElementById('updatePlantSunlight');
                const errorUpdatePlantSunlight = document.getElementById('errorUpdatePlantSunlight');
                const updatePlantWateringInput = document.getElementById('updatePlantWatering');
                const errorUpdatePlantWatering = document.getElementById('errorUpdatePlantWatering');
                const updatePlantIdealLuxMinInputElem = document.getElementById('updatePlantIdealLuxMin');
                const errorUpdatePlantIdealLuxMin = document.getElementById('errorUpdatePlantIdealLuxMin');
                const updatePlantIdealLuxMaxInputElem = document.getElementById('updatePlantIdealLuxMax');
                const errorUpdatePlantIdealLuxMax = document.getElementById('errorUpdatePlantIdealLuxMax');
                const updatePlantTempMinInput = document.getElementById('updatePlantTempMin');
                const errorUpdatePlantTempMin = document.getElementById('errorUpdatePlantTempMin');
                const updatePlantTempMaxInput = document.getElementById('updatePlantTempMax');
                const errorUpdatePlantTempMax = document.getElementById('errorUpdatePlantTempMax');
                const updatePlantDescriptionInput = document.getElementById('updatePlantDescription');
                const errorUpdatePlantDescription = document.getElementById('errorUpdatePlantDescription');
                const updatePlantCategoryInput = document.getElementById('updatePlantCategory');
                const errorUpdatePlantCategory = document.getElementById('errorUpdatePlantCategory');
                const updatePlantImageURLInput = document.getElementById('updatePlantImageURL');
                const errorUpdatePlantImageURL = document.getElementById('errorUpdatePlantImageURL');


                clearFormValidationErrors(updatePlantCard);
                let formIsValid = true;

                if (!validateField(updatePlantNameInput, errorUpdatePlantName, 'Il nome è obbligatorio.')) formIsValid = false;
                if (!validateField(updatePlantSunlightInput, errorUpdatePlantSunlight, 'La luce è obbligatoria.')) formIsValid = false;
                if (!validateField(updatePlantWateringInput, errorUpdatePlantWatering, 'L\'acqua è obbligatoria.')) formIsValid = false;
                if (!validateField(updatePlantIdealLuxMinInputElem, errorUpdatePlantIdealLuxMin, 'Lux Min è obbligatorio e deve essere un numero.')) formIsValid = false;
                if (!validateField(updatePlantIdealLuxMaxInputElem, errorUpdatePlantIdealLuxMax, 'Lux Max è obbligatorio e deve essere un numero.')) formIsValid = false;
                if (!validateField(updatePlantTempMinInput, errorUpdatePlantTempMin, 'Temp Min è obbligatoria e deve essere un numero.')) formIsValid = false;
                if (!validateField(updatePlantTempMaxInput, errorUpdatePlantTempMax, 'Temp Max è obbligatoria e deve essere un numero.')) formIsValid = false;
                if (!validateField(updatePlantDescriptionInput, errorUpdatePlantDescription, 'La descrizione è obbligatoria.')) formIsValid = false; // Era opzionale in HTML, ma qui è required
                if (!validateField(updatePlantCategoryInput, errorUpdatePlantCategory, 'La categoria è obbligatoria.', true)) formIsValid = false;
                if (updatePlantImageURLInput.value && !isValidUrl(updatePlantImageURLInput.value)) {
                    errorUpdatePlantImageURL.textContent = 'Inserisci un URL immagine valido.';
                    formIsValid = false;
                }

                if (!formIsValid) {
                    console.log("Validazione form fallita. Correggi gli errori.");
                    showToast('Per favore, correggi gli errori nel form.', 'error');
                    return;
                }

                const updatedData = {
                    name: updatePlantNameInput.value,
                    sunlight: updatePlantSunlightInput.value,
                    watering: updatePlantWateringInput.value,
                    tempMin: parseInt(updatePlantTempMinInput.value),
                    tempMax: parseInt(updatePlantTempMaxInput.value),
                    description: updatePlantDescriptionInput.value,
                    category: updatePlantCategoryInput.value,
                    image: updatePlantImageURLInput.value,
                    idealLuxMin: parseInt(updatePlantIdealLuxMinInputElem.value),
                    idealLuxMax: parseInt(updatePlantIdealLuxMaxInputElem.value)
                };

                await updatePlantInFirebase(currentPlantIdToUpdate, updatedData);
            }
        });
    }

    if (cancelUpdatePlantButton) {
        cancelUpdatePlantButton.addEventListener('click', () => {
            updatePlantCard.style.display = 'none';
            clearUpdatePlantForm();
        });
    }

    const deletePlantButtonFromForm = document.getElementById('deletePlant');
    if (deletePlantButtonFromForm) {
        deletePlantButtonFromForm.addEventListener('click', async () => {
            if (currentPlantIdToUpdate) {
                showToast('Eliminazione pianta in corso...', 'info');
                await deletePlantFromDatabase(currentPlantIdToUpdate);
            } else {
                showToast('Nessuna pianta selezionata per l\'eliminazione.', 'info');
            }
        });
    }

    // Listener per il sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);

    // Listener delegati per le azioni sulle card (Aggiungi, Rimuovi, Aggiorna, Elimina)
    // Usiamo il delegato per gestire i click su elementi che potrebbero essere aggiunti dinamicamente
    if (gardenContainer) {
        gardenContainer.addEventListener('click', async (event) => {
            const target = event.target;
            const plantId = target.dataset.plantId;

            if (target.classList.contains('add-to-garden-button')) {
                const user = firebase.auth().currentUser;
                if (user) { await addToMyGarden(plantId); }
                else { showToast("Devi essere autenticato per aggiungere piante al tuo giardino.", 'info'); }
            } else if (target.classList.contains('remove-button')) {
                const user = firebase.auth().currentUser;
                if (user) { await removeFromMyGarden(plantId); }
                else { showToast("Devi essere autenticato per rimuovere piante dal tuo giardino.", 'info'); }
            } else if (target.classList.contains('update-plant-button')) {
                const plantToUpdate = allPlants.find(p => p.id === plantId);
                if (plantToUpdate) { showUpdatePlantForm(plantToUpdate); }
                else { showToast(`Pianta con ID ${plantId} non trovata per l'aggiornamento.`, 'error'); }
            } else if (target.classList.contains('delete-plant-from-db-button')) {
                await deletePlantFromDatabase(plantId);
            } else if (target.classList.contains('plant-image')) {
                 // Il listener per l'immagine è gestito direttamente in displayPlants
            }
        });
    }

    if (myGardenContainer) {
        myGardenContainer.addEventListener('click', async (event) => {
            const target = event.target;
            const plantId = target.dataset.plantId;

            if (target.classList.contains('remove-button')) {
                const user = firebase.auth().currentUser;
                if (user) { await removeFromMyGarden(plantId); }
                else { showToast("Devi essere autenticato per rimuovere piante dal tuo giardino.", 'info'); }
            } else if (target.classList.contains('update-plant-button')) {
                const plantToUpdate = allPlants.find(p => p.id === plantId); // Trova dall'elenco completo
                if (plantToUpdate) { showUpdatePlantForm(plantToUpdate); }
                else { showToast(`Pianta con ID ${plantId} non trovata per l'aggiornamento nel mio giardino.`, 'error'); }
            } else if (target.classList.contains('plant-image')) {
                 // Il listener per l'immagine è gestito direttamente in displayPlants
            }
        });
    }


    // CONFIGURAZIONE INIZIALE UI DOPO DOMContentLoaded
    // Questa chiamata assicura che l'UI venga configurata correttamente
    // con lo stato di autenticazione corrente solo DOPO che il DOM è pronto.
    auth.onAuthStateChanged(async (user) => {
        await handleAuthAndUI(user);
    });
});
