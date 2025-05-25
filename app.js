// 1. DICHIARAZIONI GLOBALI
let allPlants = [];
let myGarden = []; // Inizializza come array vuoto
let currentPlantIdToUpdate = null; // Variabile per tenere traccia dell'ID della pianta da aggiornare
let ambientLightSensor = null; // Variabile per il sensore di luce
let isMyGardenCurrentlyVisible = false; // Variabile per tenere traccia della visibilità del giardino

// Variabili per la gestione della modal (usata sia per zoom immagine che per zoom card)
let imageModal; // Riferimento all'elemento HTML della modal (div#image-modal)
let zoomedImage; // Riferimento all'elemento HTML dell'immagine zoomata (img#zoomed-image)
let closeButton; // Riferimento al bottone di chiusura della modal (span.close-button)
let loadingSpinner; // <<< AGGIUNGI QUESTA RIGA QUI

// Le variabili cardModal e zoomedCardContent non sono più necessarie come globali separate
// perché riutilizziamo imageModal e generiamo il contenuto della card dinamicamente.


// DICHIARAZIONI DELLE VARIABILI DOM GLOBALI (MA NON INIZIALIZZATE QUI)
// Saranno inizializzate solo quando il DOM è pronto (in DOMContentLoaded)
let gardenContainer;
let myGardenContainer;
let authContainerDiv;
let appContentDiv;
let loginButton; // Bottone
let registerButton; // Bottone
let logoutButton;
let authStatusDiv;
let searchInput;
let addNewPlantButton;
let newPlantCard;
let saveNewPlantButton;
let cancelNewPlantButton;
let categoryFilter;
let tempMinFilter;
let tempMaxFilter;
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
let emptyGardenMessage; // Questa variabile ora è dichiarata qui
let plantsSection; // Aggiunto per riferimento alla sezione principale delle piante


// --- FUNZIONI DI AUTENTICAZIONE ---
async function handleLogin() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorDiv = document.getElementById('login-error');

    if (emailInput && passwordInput && errorDiv) {
        const email = emailInput.value;
        const password = passwordInput.value;
        errorDiv.innerText = '';

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log("Login effettuato con successo!");
        } catch (error) {
            console.error("Errore durante il login:", error);
            errorDiv.innerText = error.message;
        }
    } else {
        console.error("Elementi del form di login non trovati.");
    }
}

async function handleRegister() {
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    const errorDiv = document.getElementById('register-error');

    if (emailInput && passwordInput && confirmPasswordInput && errorDiv) {
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        errorDiv.innerText = '';

        if (password !== confirmPassword) {
            errorDiv.innerText = "Le password non corrispondono.";
            return;
        }

        try {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            console.log("Registrazione effettuata con successo!");
        } catch (error) {
            console.error("Errore durante la registrazione:", error);
            errorDiv.innerText = error.message;
        }
    } else {
        console.error("Elementi del form di registrazione non trovati.");
    }
}

async function handleLogout() {
    try {
        await firebase.auth().signOut();
        console.log("Logout effettuato con successo!");
    } catch (error) {
        console.error("Errore durante il logout:", error);
    }
}

// --- FUNZIONE PER INIZIALIZZARE/RESETTARE LA MODAL ---
// Questa funzione prepara la modal per essere riutilizzata,
// sia per lo zoom di un'immagine che per lo zoom di una card.
function initializeModal() {
    // Reperisce la modal (se non già fatto, utile se chiamata prima di DOMContentLoaded)
    if (!imageModal) {
        imageModal = document.getElementById('image-modal');
    }

    // Pulisce completamente l'interno della modal
    imageModal.innerHTML = '';
    imageModal.style.display = 'none'; // Assicurati che sia nascosta all'inizio

    // Aggiunge il bottone di chiusura
    const newCloseButton = document.createElement('span');
    newCloseButton.classList.add('close-button');
    newCloseButton.innerHTML = '&times;';
    // Rimuove eventuali listener precedenti per evitare duplicazioni
    const oldCloseButton = imageModal.querySelector('.close-button');
    if (oldCloseButton) oldCloseButton.removeEventListener('click', () => { imageModal.style.display = 'none'; initializeModal(); });
    newCloseButton.addEventListener('click', () => {
        imageModal.style.display = 'none';
        initializeModal(); // Resetta la modal quando si chiude
    });
    imageModal.appendChild(newCloseButton);
    closeButton = newCloseButton; // Aggiorna il riferimento globale

    // Aggiunge l'elemento immagine per lo zoom immagine (sarà nascosto se si zooma una card)
    const newZoomedImage = document.createElement('img');
    newZoomedImage.classList.add('modal-content'); // Classe per lo stile dell'immagine zoomata
    newZoomedImage.id = 'zoomed-image'; // ID per riferimento
    imageModal.appendChild(newZoomedImage);
    zoomedImage = newZoomedImage; // Aggiorna il riferimento globale

    // Aggiungi un listener generico alla modal per chiuderla cliccando fuori (sullo sfondo)
    // Rimuove eventuali listener precedenti per evitare duplicazioni
    const oldModalListener = imageModal.onclick; // Potrebbe non essere la forma migliore per rimuovere, ma per semplicità
    if (oldModalListener) imageModal.removeEventListener('click', oldModalListener); // Questo potrebbe non funzionare se il listener non è stato aggiunto con un riferimento
    imageModal.addEventListener('click', (event) => {
        if (event.target === imageModal) { // Se il click è sullo sfondo della modal
            imageModal.style.display = 'none';
            initializeModal(); // Resetta la modal
        }
    });
}


// --- FUNZIONI DI RENDERING E GESTIONE DELLE CARD ---

function createPlantCard(plantData, isMyGardenCard = false) {
    const image = plantData.image || 'plant_9215709.png'; // Immagine di default se non specificata
    const div = document.createElement("div");
    div.className = isMyGardenCard ? "my-plant-card" : "plant-card";
    div.dataset.id = plantData.id; // Importante per riferimento futuro

    let buttonsHtml = '';
    const user = firebase.auth().currentUser;

    if (user) {
        const isAdminUser = () => user.email === 'ferraiolo80@hotmail.it'; 

        if (isMyGardenCard) {
            buttonsHtml += `<button class="remove-button" data-plant-id="${plantData.id}">Rimuovi dal mio giardino</button>`;
            buttonsHtml += `<button class="update-plant-button" data-plant-id="${plantData.id}">Aggiorna Info</button>`;
        } else {
            if (myGarden.includes(plantData.id)) {
                buttonsHtml += `<button class="remove-button" data-plant-id="${plantData.id}">Rimuovi dal mio giardino</button>`;
            } else {
                buttonsHtml += `<button class="add-to-garden-button" data-plant-id="${plantData.id}">Aggiungi al mio giardino</button>`;
            }
            
            buttonsHtml += `<button class="update-plant-button" data-plant-id="${plantData.id}">Aggiorna Info</button>`;

            if (isAdminUser()) {
                buttonsHtml += `<button class="delete-plant-from-db-button" data-plant-id="${plantData.id}">Elimina Definitivamente</button>`;
            }
        }
    }

    div.innerHTML = `
        <img src="${image}" alt="${plantData.name}" class="plant-icon">
        <h4>${plantData.name}</h4>
        <p><i class="fas fa-sun"></i> Luce: ${plantData.sunlight}</p>
        <p><i class="fas fa-tint"></i> Acqua: ${plantData.watering}</p>
        <p><i class="fas fa-thermometer-half"></i> Temp. ideale min: ${plantData.tempMin}°C</p>
        <p><i class="fas fa-thermometer-half"></i> Temp. ideale max: ${plantData.tempMax}°C</p>
        <p>Categoria: ${plantData.category}</p>
        ${(plantData.idealLuxMin != null && plantData.idealLuxMax != null) ? `<p>Lux Ideali: ${plantData.idealLuxMin} - ${plantData.idealLuxMax} Lux</p>` : ''}
        ${buttonsHtml}
    `;

    // --- LOGICA ZOOM IMMAGINE ---
    const plantImage = div.querySelector('.plant-icon');
    if (plantImage) {
        plantImage.addEventListener('click', (event) => {
            event.stopPropagation(); // Impedisce che il click sull'immagine attivi anche lo zoom della card
            initializeModal(); // Resetta la modal per lo zoom immagine
            zoomedImage.src = image; // Imposta la sorgente dell'immagine
            imageModal.style.display = 'flex'; // Mostra la modal
        });
    }

    // --- NUOVA LOGICA ZOOM CARD ---
    // Aggiungi un listener alla card stessa, ma non ai bottoni o all'immagine
    div.addEventListener('click', (event) => {
        // Se il click è avvenuto su un bottone o sull'immagine, non fare nulla (già gestito sopra)
        if (event.target.tagName === 'BUTTON' || event.target.classList.contains('plant-icon')) {
            return;
        }

        // Clona la card per mostrarla nella modal
        const clonedCard = div.cloneNode(true); // Clona l'intera card, inclusi i suoi figli

        // Rimuovi i bottoni dalla card clonata nella modal, dato che non vogliamo che siano interattivi
        clonedCard.querySelectorAll('button').forEach(button => {
            button.remove();
        });

        // Applica la classe per gli stili della card zoomata alla card clonata
        clonedCard.classList.remove('plant-card', 'my-plant-card'); // Rimuovi le classi originali
        clonedCard.classList.add('modal-card-content'); // Aggiungi la nuova classe per la card nella modal

        // Prepara la modal
        initializeModal(); // Resetta la modal al suo stato base
        // Rimuove l'elemento immagine predefinito, perché ora mostreremo la card clonata
        if (zoomedImage && zoomedImage.parentNode === imageModal) {
            imageModal.removeChild(zoomedImage);
        }

        // Aggiungi la card clonata alla modal (dopo il bottone di chiusura che initializeModal ha aggiunto)
        imageModal.appendChild(clonedCard);
        imageModal.style.display = 'flex'; // Mostra la modal
    });

    return div;
}

function renderPlants(plantArray) {
    if (!gardenContainer) { 
        console.error("Elemento garden-container non trovato in renderPlants! Assicurati che il DOM sia caricato e la variabile inizializzata.");
        return;
    }
    gardenContainer.innerHTML = ""; // Pulisci il contenitore

    plantArray.forEach((plant) => {
        const plantCard = createPlantCard(plant, false);
        gardenContainer.appendChild(plantCard);
    });
}

function renderMyGarden(plantsToDisplay) { // Riceve direttamente gli oggetti pianta filtrati
    if (!myGardenContainer || !emptyGardenMessage) {
        console.error("Elementi my-garden o empty-garden-message non trovati in renderMyGarden! Assicurati che il DOM sia caricato e le variabili inizializzate.");
        return;
    }

    myGardenContainer.innerHTML = ''; // Pulisci il contenitore

    if (plantsToDisplay.length === 0) {
        emptyGardenMessage.style.display = 'block';
        // Aggiungi il messaggio solo se non è già un figlio del container
        if (!myGardenContainer.contains(emptyGardenMessage)) {
            myGardenContainer.appendChild(emptyGardenMessage);
        }
    } else {
        emptyGardenMessage.style.display = 'none';
        plantsToDisplay.forEach(plant => {
            const plantCard = createPlantCard(plant, true);
            myGardenContainer.appendChild(plantCard);
        });
    }
}

// --- FUNZIONI DI FILTRO E RICERCA ---
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const tempMin = parseFloat(tempMinFilter.value);
    const tempMax = parseFloat(tempMaxFilter.value);

    let plantsToFilter;
    if (isMyGardenCurrentlyVisible) {
        plantsToFilter = allPlants.filter(plant => myGarden.includes(plant.id));
    } else {
        plantsToFilter = allPlants;
    }

    let filteredPlants = plantsToFilter.filter(plant => {
        const matchesSearch = plant.name.toLowerCase().includes(searchTerm) ||
                              (plant.description && plant.description.toLowerCase().includes(searchTerm));
        const matchesCategory = category === 'all' || plant.category === category;
        const matchesTempMin = isNaN(tempMin) || plant.tempMin >= tempMin;
        const matchesTempMax = isNaN(tempMax) || plant.tempMax <= tempMax;

        return matchesSearch && matchesCategory && matchesTempMin && matchesTempMax;
    });

    if (isMyGardenCurrentlyVisible) {
        renderMyGarden(filteredPlants); // Passa gli oggetti pianta filtrati
    } else {
        renderPlants(filteredPlants);
    }
}


// --- NUOVE FUNZIONI DI AGGIORNAMENTO E CANCELLAZIONE PIANTE ---
function showUpdatePlantForm(plant) {
    if (!updatePlantCard) { 
        console.error("Elemento updatePlantCard non trovato in showUpdatePlantForm! Assicurati che il DOM sia caricato e la variabile inizializzata.");
        return;
    }
    currentPlantIdToUpdate = plant.id;
    document.getElementById('updatePlantId').value = plant.id;
    document.getElementById('updatePlantName').value = plant.name || '';
    document.getElementById('updatePlantSunlight').value = plant.sunlight || '';
    document.getElementById('updatePlantWatering').value = plant.watering || '';
    document.getElementById('updatePlantTempMin').value = plant.tempMin || '';
    document.getElementById('updatePlantTempMax').value = plant.tempMax || '';
    document.getElementById('updatePlantDescription').value = plant.description || '';
    document.getElementById('updatePlantCategory').value = plant.category || 'Fiore';
    document.getElementById('updatePlantImageURL').value = plant.image || '';
    updatePlantIdealLuxMinInput.value = plant.idealLuxMin || '';
    updatePlantIdealLuxMaxInput.value = plant.idealLuxMax || '';

    updatePlantCard.style.display = 'block';
    updatePlantCard.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function clearUpdatePlantForm() {
    currentPlantIdToUpdate = null;
    document.getElementById('updatePlantId').value = '';
    document.getElementById('updatePlantName').value = '';
    document.getElementById('updatePlantSunlight').value = '';
    document.getElementById('updatePlantWatering').value = '';
    document.getElementById('updatePlantTempMin').value = '';
    document.getElementById('updatePlantTempMax').value = '';
    document.getElementById('updatePlantDescription').value = '';
    document.getElementById('updatePlantCategory').value = 'Fiore'; // Reset a un valore di default
    document.getElementById('updatePlantImageURL').value = '';
    updatePlantIdealLuxMinInput.value = ''; // Pulisci anche questi
    updatePlantIdealLuxMaxInput.value = ''; // Pulisci anche questi
}

async function updatePlantInFirebase(plantId, updatedData) {
    try {
        await db.collection('plants').doc(plantId).update(updatedData);
        console.log("Pianta aggiornata con successo:", plantId);
        await loadPlantsFromFirebase(); // Ricarica tutte le piante
        await loadMyGardenFromFirebase(); // Ricarica il giardino dell'utente (per aggiornare i bottoni)
        applyFilters(); // Riapplica i filtri per aggiornare la UI
    } catch (error) {
        console.error("Errore nell'aggiornamento della pianta:", error);
        alert("Errore nell'aggiornamento della pianta. Controlla la console e le regole di sicurezza di Firebase.");
    }
}

async function deletePlantFromDatabase(plantId) {
    try {
        await db.collection('plants').doc(plantId).delete();
        console.log("Pianta eliminata dal database principale:", plantId);

        // Rimuovi la pianta da tutti i giardini degli utenti
        const gardensSnapshot = await db.collection('gardens').get();
        const batch = db.batch();

        gardensSnapshot.forEach(doc => {
            const gardenData = doc.data();
            if (gardenData && Array.isArray(gardenData.plants) && gardenData.plants.includes(plantId)) {
                const updatedPlants = gardenData.plants.filter(id => id !== plantId);
                batch.update(db.collection('gardens').doc(doc.id), { plants: updatedPlants });
            }
        });
        await batch.commit();
        console.log("Pianta rimossa da tutti i giardini degli utenti.");

        await loadPlantsFromFirebase(); // Ricarica tutte le piante
        await loadMyGardenFromFirebase(); // Ricarica il giardino dell'utente
        applyFilters(); // Riapplica i filtri per aggiornare la UI
        alert("Pianta eliminata con successo!");

    } catch (error) {
        console.error("Errore durante l'eliminazione della pianta dal database:", error);
        alert("Si è verificato un errore durante l'eliminazione della pianta. Controlla le regole di sicurezza.");
    }
}

// --- FUNZIONI DI GESTIONE DEL GIARDINO (Aggiungi/Rimuovi) ---
async function addToMyGarden(plantId) {
    const user = firebase.auth().currentUser;
    if (user) {
        if (!myGarden.includes(plantId)) {
            myGarden.push(plantId);
            await saveMyGardenToFirebase(myGarden);
            applyFilters(); // Riapplica i filtri per aggiornare la UI
        }
    } else {
        alert("Devi essere autenticato per aggiungere piante al tuo giardino.");
    }
}

async function removeFromMyGarden(plantIdToRemove) {
    const user = firebase.auth().currentUser;
    if (user) {
        myGarden = myGarden.filter(plantId => plantId !== plantIdToRemove);
        await saveMyGardenToFirebase(myGarden);
        applyFilters(); // Riapplica i filtri per aggiornare la UI
    } else {
        alert("Devi essere autenticato per rimuovere piante dal tuo giardino.");
    }
}

// --- FUNZIONI DI SALVATAGGIO/CARICAMENTO DATI DA FIREBASE ---
async function saveNewPlantToFirebase() {
    // Recupera i valori direttamente dagli input, che sono stati inizializzati in DOMContentLoaded
    const newPlantNameValue = document.getElementById('newPlantName').value; 
    const newPlantSunlightValue = document.getElementById('newPlantSunlight').value;
    const newPlantWateringValue = document.getElementById('newPlantWatering').value;
    const newPlantTempMinValue = document.getElementById('newPlantTempMin').value;
    const newPlantTempMaxValue = document.getElementById('newPlantTempMax').value;
    const newPlantDescriptionValue = document.getElementById('newPlantDescription').value;
    const newPlantCategoryValue = document.getElementById('newPlantCategory').value;
    const newPlantImageURLValue = document.getElementById('newPlantImageURL').value;
    const newPlantIdealLuxMinValue = parseInt(newPlantIdealLuxMinInput.value); 
    const newPlantIdealLuxMaxValue = parseInt(newPlantIdealLuxMaxInput.value); 


    if (newPlantNameValue && newPlantSunlightValue && newPlantWateringValue &&
        !isNaN(parseInt(newPlantTempMinValue)) && !isNaN(parseInt(newPlantTempMaxValue)) &&
        !isNaN(newPlantIdealLuxMinValue) && !isNaN(newPlantIdealLuxMaxValue)) {
        try {
            const docRef = await db.collection('plants').add({
                name: newPlantNameValue,
                sunlight: newPlantSunlightValue,
                watering: newPlantWateringValue,
                tempMin: parseInt(newPlantTempMinValue),
                tempMax: parseInt(newPlantTempMaxValue),
                description: newPlantDescriptionValue,
                category: newPlantCategoryValue,
                image: newPlantImageURLValue,
                idealLuxMin: newPlantIdealLuxMinValue,
                idealLuxMax: newPlantIdealLuxMaxValue
            });

            console.log("Nuova pianta aggiunta con ID: ", docRef.id);
            if (newPlantCard) {
                newPlantCard.style.display = 'none';
            }
            clearNewPlantForm();
            await loadPlantsFromFirebase();
            applyFilters();
        } catch (error) {
            console.error("Errore nell'aggiunta della nuova pianta:", error);
            alert("Errore nell'aggiunta della nuova pianta. Controlla le regole di sicurezza di Firebase e che tutti i campi siano compilati correttamente.");
        }
    } else {
        alert("Per favore, compila tutti i campi obbligatori (inclusi i valori numerici validi per Temperatura e Lux).");
    }
}

function clearNewPlantForm() {
    document.getElementById('newPlantName').value = '';
    document.getElementById('newPlantSunlight').value = '';
    document.getElementById('newPlantWatering').value = '';
    document.getElementById('newPlantTempMin').value = '';
    document.getElementById('newPlantTempMax').value = '';
    document.getElementById('newPlantDescription').value = '';
    document.getElementById('newPlantCategory').value = 'Fiore'; // Reset a un valore di default
    document.getElementById('newPlantImageURL').value = '';
    newPlantIdealLuxMinInput.value = ''; // Pulisci anche questi
    newPlantIdealLuxMaxInput.value = ''; // Pulisci anche questi
}

async function loadMyGardenFromFirebase() {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            const doc = await db.collection('gardens').doc(user.uid).get();
            myGarden = doc.data()?.plants || [];
            console.log("Giardino caricato da Firebase:", myGarden);
            // La visualizzazione è gestita da applyFilters()
        } catch (error) {
            console.error("Errore nel caricamento del giardino da Firebase:", error);
            myGarden = []; // Assicurati che sia vuoto in caso di errore
        }
    } else {
        myGarden = []; // Giardino vuoto se non autenticato
    }
}


async function saveMyGardenToFirebase(garden) {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            const gardenRef = db.collection('gardens').doc(user.uid);
            await gardenRef.set({ plants: garden }, { merge: true });
            console.log("Il 'Mio Giardino' è stato aggiornato su Firebase.");
        } catch (error) {
            console.error("Errore durante l'aggiornamento del 'Mio Giardino' su Firebase:", error);
            alert("Errore durante l'aggiornamento del tuo giardino. Controlla le regole di sicurezza.");
        }
    }
}

async function loadPlantsFromFirebase() {
    try {
        const plantsSnapshot = await db.collection('plants').get();
        allPlants = plantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante caricate da Firebase:", allPlants);
    } catch (error) {
        console.error("Errore nel caricamento delle piante da Firebase:", error);
    }
}

// --- FUNZIONI DI VISIBILITÀ UI ---
async function updateGardenVisibility(showMyGarden) {
    // Tutti questi elementi sono ora variabili globali 'let' e sono stati inizializzati
    // in DOMContentLoaded, quindi dovrebbero essere disponibili.
    if (!plantsSection || !gardenContainer || !myGardenContainer || !giardinoTitle || !toggleMyGardenButton || !emptyGardenMessage) {
        console.error("Uno o più elementi UI principali non sono stati trovati in updateGardenVisibility! Ricarica la pagina o controlla gli ID.");
        return;
    }

    const user = firebase.auth().currentUser;

    isMyGardenCurrentlyVisible = showMyGarden; 

    if (user) {
        toggleMyGardenButton.style.display = 'block';
        if (showMyGarden) {
            toggleMyGardenButton.innerHTML = '<i class="fas fa-eye-slash"></i> Mostra tutte le Piante'; 
        } else {
            toggleMyGardenButton.innerHTML = '<i class="fas fa-eye"></i> Mostra il mio Giardino'; 
        }
    } else {
        toggleMyGardenButton.style.display = 'none'; // Nascondi il bottone se non loggato
    }

    if (user && showMyGarden) {
        plantsSection.style.display = 'none'; // Nasconde la sezione "Tutte le piante"
        gardenContainer.style.display = 'none'; // Assicurati che il contenitore delle card pubbliche sia nascosto
        myGardenContainer.style.display = 'grid'; // Mostra il contenitore del "Mio Giardino"
        giardinoTitle.style.display = 'block'; // Mostra il titolo "Il mio giardino"
    } else {
        plantsSection.style.display = 'block'; // Mostra la sezione "Tutte le piante"
        gardenContainer.style.display = 'grid'; // Mostra il contenitore delle card pubbliche
        myGardenContainer.style.display = 'none'; // Nasconde il contenitore del "Mio Giardino"
        giardinoTitle.style.display = 'none'; // Nasconde il titolo "Il mio giardino"
    }

    applyFilters(); // Ri-applica i filtri per renderizzare la vista corretta
}

function handleToggleMyGarden() {
    updateGardenVisibility(!isMyGardenCurrentlyVisible);
}

// --- FUNZIONI SENSORE DI LUCE ---
async function startLightSensor() {
    if ('AmbientLightSensor' in window) {
        try {
            const permissionStatus = await navigator.permissions.query({ name: 'ambient-light-sensor' });
            if (permissionStatus.state === 'denied') {
                alert('Permesso per il sensore di luce negato. Abilitalo nelle impostazioni del tuo browser/dispositivo.');
                return;
            }

            ambientLightSensor = new AmbientLightSensor();

            ambientLightSensor.onreading = () => {
                const currentLux = ambientLightSensor.illuminance;
                if (currentLuxValueSpan) currentLuxValueSpan.textContent = currentLux.toFixed(2);

                if (myGarden && myGarden.length > 0 && currentLux != null) {
                    let feedbackHtml = '<h4>Feedback Luce per il tuo Giardino:</h4><ul>';
                    const plantsInGarden = allPlants.filter(plant => myGarden.includes(plant.id));

                    plantsInGarden.forEach(plant => {
                        const minLux = plant.idealLuxMin;
                        const maxLux = plant.idealLuxMax;

                        if (minLux != null && maxLux != null) {
                            let feedbackMessage = `${plant.name}: `;
                            if (currentLux < minLux) {
                                feedbackMessage += `<span style="color: red;">Troppo poca luce!</span> (Richiede ${minLux}-${maxLux} Lux)`;
                            } else if (currentLux > maxLux) {
                                feedbackMessage += `<span style="color: orange;">Troppa luce!</span> (Richiede ${minLux}-${maxLux} Lux)`;
                            } else {
                                feedbackMessage += `<span style="color: green;">Luce ideale!</span> (Richiede ${minLux}-${maxLux} Lux)`;
                            }
                            feedbackHtml += `<li>${feedbackMessage}</li>`;
                        } else {
                            feedbackHtml += `<li>${plant.name}: Nessun dato Lux ideale disponibile.</li>`;
                        }
                    });
                    feedbackHtml += '</ul>';
                    if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = feedbackHtml;
                } else {
                    if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p>Nessuna pianta nel tuo giardino con dati Lux ideali, o nessun valore rilevato.</p>';
                }
            };

            ambientLightSensor.onerror = (event) => {
                console.error('Errore sensore di luce:', event.error.name, event.error.message);
                if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p style="color: red;">Errore sensore: ${event.error.message}</p>`;
                stopLightSensor();
            };

            ambientLightSensor.start();
            if (startLightSensorButton) startLightSensorButton.style.display = 'none';
            if (stopLightSensorButton) stopLightSensorButton.style.display = 'inline-block';
            if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p>Misurazione in corso...</p>';

        } catch (error) {
            console.error('Impossibile avviare il sensore di luce:', error);
            if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p style="color: red;">Impossibile avviare il sensore di luce. Assicurati che il tuo dispositivo lo supporti e che tu abbia concesso i permessi. ${error.message}</p>`;
        }
    } else {
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p style="color: orange;">Il sensore di luce ambientale non è supportato dal tuo dispositivo.</p>';
    }
}

function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
        if (startLightSensorButton) startLightSensorButton.style.display = 'inline-block';
        if (stopLightSensorButton) stopLightSensorButton.style.display = 'none';
        if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'N/A';
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '';
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    // Inizializza TUTTE le variabili globali degli elementi DOM qui
    // Queste variabili sono state dichiarate con 'let' all'inizio del file
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden');
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    
    // Assicurati di inizializzare anche i bottoni di login/registrazione qui
    loginButton = document.getElementById('loginButton'); 
    registerButton = document.getElementById('registerButton'); 
    
    logoutButton = document.getElementById('logoutButton');
    authStatusDiv = document.getElementById('auth-status');
    searchInput = document.getElementById('searchInput');
    addNewPlantButton = document.getElementById('addNewPlantButton');
    newPlantCard = document.getElementById('newPlantCard');
    saveNewPlantButton = document.getElementById('saveNewPlant');
    cancelNewPlantButton = document.getElementById('cancelNewPlant');
    categoryFilter = document.getElementById('categoryFilter');
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    toggleMyGardenButton = document.getElementById('toggleMyGarden');
    giardinoTitle = document.getElementById('giardinoTitle');
    startLightSensorButton = document.getElementById('startLightSensor');
    stopLightSensorButton = document.getElementById('stopLightSensor');
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback');
    newPlantIdealLuxMinInput = document.getElementById('newPlantIdealLuxMin'); 
    newPlantIdealLuxMaxInput = document.getElementById('newPlantIdealLuxMax'); 
    updatePlantIdealLuxMinInput = document.getElementById('updatePlantIdealLuxMin');
    updatePlantIdealLuxMaxInput = document.getElementById('updatePlantIdealLuxMax');
    updatePlantCard = document.getElementById('updatePlantCard');
    saveUpdatedPlantButton = document.getElementById('saveUpdatedPlant');
    cancelUpdatePlantButton = document.getElementById('cancelUpdatePlant');
    emptyGardenMessage = document.getElementById('empty-garden-message');
    plantsSection = document.getElementById('plants-section'); // Inizializza plantsSection
    
    // Inizializzazione della modal all'avvio dell'applicazione
    // Assicurati che l'elemento <div id="image-modal"></div> esista nel tuo HTML
    initializeModal(); // Chiamata per inizializzare la modal

    // --- LISTENER GENERALI (NON DIPENDENTI DAL CLICK SU CARD) ---
    // Listener per i bottoni di login/registrazione
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    // Il listener per il logout è gestito nell'onAuthStateChanged per essere ri-creato correttamente.

    // Listener per i bottoni di aggiunta nuova pianta
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', () => newPlantCard.style.display = 'block');
    if (cancelNewPlantButton) cancelNewPlantButton.addEventListener('click', () => { newPlantCard.style.display = 'none'; clearNewPlantForm(); });
    if (saveNewPlantButton) saveNewPlantButton.addEventListener('click', saveNewPlantToFirebase);

    // Listener per la ricerca e i filtri
    if (searchInput) searchInput.addEventListener('input', applyFilters); 
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters); 
    if (tempMinFilter) tempMinFilter.addEventListener('input', applyFilters); 
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', applyFilters); 
    
    // Listener per il pulsante "Mostra/Nascondi il mio giardino"
    if (toggleMyGardenButton) {
        toggleMyGardenButton.addEventListener('click', handleToggleMyGarden);
    }

    // Listener per i bottoni del form di aggiornamento (questi non devono essere nei click delle card)
    if (saveUpdatedPlantButton) {
        saveUpdatedPlantButton.addEventListener('click', async () => {
            if (currentPlantIdToUpdate) {
                const updatedData = {
                    name: document.getElementById('updatePlantName').value,
                    sunlight: document.getElementById('updatePlantSunlight').value,
                    watering: document.getElementById('updatePlantWatering').value,
                    tempMin: parseInt(document.getElementById('updatePlantTempMin').value),
                    tempMax: parseInt(document.getElementById('updatePlantTempMax').value),
                    description: document.getElementById('updatePlantDescription').value,
                    category: document.getElementById('updatePlantCategory').value,
                    image: document.getElementById('updatePlantImageURL').value,
                    idealLuxMin: parseInt(updatePlantIdealLuxMinInput.value),
                    idealLuxMax: parseInt(updatePlantIdealLuxMaxInput.value)
                };

                if (isNaN(updatedData.idealLuxMin) || isNaN(updatedData.idealLuxMax)) {
                    alert("I valori Lux Min e Max devono essere numeri validi.");
                    return;
                }

                try {
                    await db.collection("plants").doc(currentPlantIdToUpdate).update(updatedData);
                    alert("Pianta aggiornata con successo!");
                    updatePlantCard.style.display = 'none'; 
                    clearUpdatePlantForm();
                    await loadPlantsFromFirebase();
                    await loadMyGardenFromFirebase();
                    applyFilters();
                } catch (error) {
                    console.error("Errore durante l'aggiornamento della pianta: ", error);
                    alert("Errore durante l'aggiornamento della pianta.");
                }
            }
        });
    }

    if (cancelUpdatePlantButton) {
        cancelUpdatePlantButton.addEventListener('click', () => {
            updatePlantCard.style.display = 'none';
            clearUpdatePlantForm();
        });
    }

    // Listener per il bottone 'Elimina Pianta' nel form di aggiornamento
    const deletePlantButtonFromForm = document.getElementById('deletePlant');
    if (deletePlantButtonFromForm) {
        deletePlantButtonFromForm.addEventListener('click', async () => {
            if (currentPlantIdToUpdate && confirm('Sei sicuro di voler eliminare questa pianta? Questa azione è irreversibile e la rimuoverà anche dai giardini degli utenti!')) {
                await deletePlantFromDatabase(currentPlantIdToUpdate);
                updatePlantCard.style.display = 'none';
                clearUpdatePlantForm();
            }
        });
    }

    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);
    
    // --- LISTENER PER I CONTENITORI DELLE CARD (GALLERIA E MIO GIARDINO) ---
    // Questi listener usano l'event delegation per gestire click su immagini e bottoni all'interno delle card.
    
    if (gardenContainer) {
        gardenContainer.addEventListener('click', async (event) => {
            // Gestione click sull'immagine (zoom immagine)
            if (event.target.classList.contains('plant-icon')) {
                // La logica di zoom immagine è ora gestita direttamente in createPlantCard
                // attraverso il listener aggiunto a plantImage.
                // Questo blocco qui è ridondante se il listener è già sulla singola immagine.
                // Lo lascio per ora ma potremmo rimuoverlo se il listener sulla singola immagine è sufficiente.
                // Per ora, non fa nulla qui, il click viene gestito dal listener sulla plantImage.
                return; 
            }
            
            // Gestione click sui bottoni (aggiungi/rimuovi/aggiorna/elimina)
            if (event.target.classList.contains('add-to-garden-button')) {
                const plantId = event.target.dataset.plantId;
                await addToMyGarden(plantId); 
            } else if (event.target.classList.contains('remove-button')) {
                const plantIdToRemove = event.target.dataset.plantId;
                await removeFromMyGarden(plantIdToRemove); 
            } else if (event.target.classList.contains('update-plant-button')) {
                const plantIdToUpdate = event.target.dataset.plantId;
                const plantToUpdate = allPlants.find(p => p.id === plantIdToUpdate);
                if (plantToUpdate) {
                    showUpdatePlantForm(plantToUpdate);
                } else {
                    console.warn(`Pianta con ID ${plantIdToUpdate} non trovata in allPlants per l'aggiornamento.`);
                }
            } else if (event.target.classList.contains('delete-plant-from-db-button')) { 
                const plantIdToDelete = event.target.dataset.plantId;
                if (confirm(`Sei sicuro di voler eliminare DEFINITIVAMENTE la pianta con ID: ${plantIdToDelete}? Questa azione è irreversibile e la rimuoverà anche dai giardini di tutti gli utenti.`)) {
                    await deletePlantFromDatabase(plantIdToDelete); 
                }
            }
        });
    }

    if (myGardenContainer) {
        myGardenContainer.addEventListener('click', async (event) => {
            // Gestione click sull'immagine (zoom immagine)
            if (event.target.classList.contains('plant-icon')) {
                // Come sopra, la logica di zoom immagine è gestita in createPlantCard
                return;
            }

            // Gestione click sui bottoni (rimuovi/aggiorna)
            if (event.target.classList.contains('remove-button')) {
                const plantIdToRemove = event.target.dataset.plantId;
                await removeFromMyGarden(plantIdToRemove); 
            } else if (event.target.classList.contains('update-plant-button')) {
                const plantIdToUpdate = event.target.dataset.plantId;
                const plantToUpdate = allPlants.find(p => p.id === plantIdToUpdate);
                if (plantToUpdate) {
                    showUpdatePlantForm(plantToUpdate);
                } else {
                    console.warn(`Pianta con ID ${plantIdToUpdate} non trovata per l'aggiornamento nel mio giardino.`);
                }
            }
        });
    }

    // --- LISTENER DI STATO AUTENTICAZIONE FIREBASE ---
    // Questo listener rimane alla fine del DOMContentLoaded perché è il flusso principale
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log("Stato autenticazione cambiato, utente loggato:", user.uid, user.email);
            authStatusDiv.innerText = `Utente autenticato: ${user.email}`;
            appContentDiv.style.display = 'block'; 
            authContainerDiv.style.display = 'none'; 

            // Rimuovi e riaggiungi il listener per il logout per evitare duplicazioni
            if (logoutButton) {
                logoutButton.removeEventListener('click', handleLogout); // Rimuovi il vecchio
                logoutButton.addEventListener('click', handleLogout);    // Aggiungi il nuovo
            }
            
            await loadPlantsFromFirebase();
            await loadMyGardenFromFirebase(); 

            // Decidi se mostrare il mio giardino o tutte le piante all'inizio
            const showMyGardenInitially = myGarden.length > 0;
            await updateGardenVisibility(showMyGardenInitially);

        } else {
            console.log("Stato autenticazione cambiato, nessun utente loggato.");
            authStatusDiv.innerText = "Nessun utente autenticato.";
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

            // Nascondi il bottone "Mio Giardino" se non loggati
            if (toggleMyGardenButton) {
                toggleMyGardenButton.style.display = 'none';
            }
            applyFilters(); // Assicurati che vengano renderizzate tutte le piante
        }
    });
});
