let allPlants = [];
let myGarden = []; // Inizializza come array vuoto
let currentPlantIdToUpdate = null; // Variabile per tenere traccia dell'ID della pianta da aggiornare
let ambientLightSensor = null; // Variabile per il sensore di luce
let isMyGardenCurrentlyVisible = false; // Variabile per tenere traccia della visibilità del giardino
let currentSortBy = 'name_asc'; // Nuova variabile globale per il criterio di ordinamento

// Variabili per la gestione della modal (usata sia per zoom immagine che per zoom card)
let imageModal; // Riferimento all'elemento HTML della modal (div#image-modal)
let zoomedImage; // Riferimento all'elemento HTML dell'immagine zoomata (img#zoomed-image)
let closeButton; // Riferimento al bottone di chiusura della modal (span.close-button)

let loadingSpinner; // Variabile per lo spinner di caricamento
let isDomReady = false; // Flag per indicare se il DOM è stato completamente caricato

// Variabile per il contenitore dei toast
let toastContainer; // NUOVA DICHIARAZIONE GLOBALE

// DICHIARAZIONI DELLE VARIABILI DOM GLOBALI (MA NON INIZIALIZZATE QUI)
// Saranno inizializzate solo quando il DOM è pronto (in DOMContentLoaded)
let gardenContainer;
let myGardenContainer;
let authContainerDiv;
let appContentDiv;
let loginButton; // Bottone
let registerButton; // Bottone
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
let plantFormCard; // Riferimento al modulo di aggiunta/aggiornamento pianta
let updatePlantCard; // Questo si riferisce allo stesso plantFormCard, rinominato per chiarezza se preferisci un nome diverso per la modal di update
let plantsSectionHeader; // Riferimento al contenitore dell'header delle piante e dei bottoni
let lightSensorContainer; // Riferimento al contenitore del sensore di luce
let startLightSensorButton;
let stopLightSensorButton;
let lightDataSpan;
let lightFeedbackSpan;

// 2. FUNZIONI UTILITY

// Funzione per mostrare e nascondere lo spinner di caricamento
function showLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex';
    }
}

function hideLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

// Funzione per mostrare un messaggio toast
function showToast(message, type = 'info', duration = 3000) {
    if (!toastContainer) {
        console.warn('Toast container non trovato.');
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Mostra il toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10); // Piccolo ritardo per permettere il rendering iniziale e l'animazione

    // Nascondi e rimuovi il toast dopo la durata specificata
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
    }, duration);
}

// Funzione per la validazione del form (esistente, non modificata)
function validatePlantForm(plantData, isUpdate = false) {
    let isValid = true;
    clearFormValidationErrors(plantFormCard); // Pulisce errori precedenti

    const fields = [
        { id: isUpdate ? 'updatePlantName' : 'plantName', value: plantData.name, message: 'Il nome è obbligatorio.' },
        { id: isUpdate ? 'updatePlantSunlight' : 'plantSunlight', value: plantData.sunlight, message: 'L\'esposizione al sole è obbligatoria.' },
        { id: isUpdate ? 'updatePlantWatering' : 'plantWatering', value: plantData.watering, message: 'La frequenza di innaffiatura è obbligatoria.' },
        { id: isUpdate ? 'updatePlantCategory' : 'plantCategory', value: plantData.category, message: 'La categoria è obbligatoria.' }
    ];

    for (const field of fields) {
        if (!field.value || (typeof field.value === 'string' && field.value.trim() === '')) {
            showFormValidationError(field.id, field.message);
            isValid = false;
        }
    }

    // Validazione dei lux min/max se presenti e numerici
    const luxMin = parseFloat(plantData.idealLuxMin);
    const luxMax = parseFloat(plantData.idealLuxMax);

    if (plantData.idealLuxMin !== '' && (isNaN(luxMin) || luxMin < 0)) {
        showFormValidationError(isUpdate ? 'updatePlantIdealLuxMin' : 'plantIdealLuxMin', 'Lux Min deve essere un numero positivo.');
        isValid = false;
    }
    if (plantData.idealLuxMax !== '' && (isNaN(luxMax) || luxMax < 0)) {
        showFormValidationError(isUpdate ? 'updatePlantIdealLuxMax' : 'plantIdealLuxMax', 'Lux Max deve essere un numero positivo.');
        isValid = false;
    }
    if (plantData.idealLuxMin !== '' && plantData.idealLuxMax !== '' && luxMin > luxMax) {
        showFormValidationError(isUpdate ? 'updatePlantIdealLuxMax' : 'plantIdealLuxMax', 'Lux Max non può essere inferiore a Lux Min.');
        isValid = false;
    }

    // Validazione delle temperature min/max se presenti e numerici
    const tempMin = parseFloat(plantData.tempMin);
    const tempMax = parseFloat(plantData.tempMax);

    if (plantData.tempMin !== '' && isNaN(tempMin)) {
        showFormValidationError(isUpdate ? 'updatePlantTempMin' : 'plantTempMin', 'Temperatura Min deve essere un numero.');
        isValid = false;
    }
    if (plantData.tempMax !== '' && isNaN(tempMax)) {
        showFormValidationError(isUpdate ? 'updatePlantTempMax' : 'plantTempMax', 'Temperatura Max deve essere un numero.');
        isValid = false;
    }
    if (plantData.tempMin !== '' && plantData.tempMax !== '' && tempMin > tempMax) {
        showFormValidationError(isUpdate ? 'updatePlantTempMax' : 'updatePlantTempMax', 'Temperatura Max non può essere inferiore a Temperatura Min.');
        isValid = false;
    }

    return isValid;
}

// Funzione per mostrare errori di validazione del form
function showFormValidationError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('input-error');
        let errorDiv = element.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('error-message')) {
            errorDiv = document.createElement('div');
            errorDiv.classList.add('error-message');
            element.parentNode.insertBefore(errorDiv, element.nextSibling);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// Funzione per pulire gli errori di validazione del form
function clearFormValidationErrors(formElement) {
    const errorMessages = formElement.querySelectorAll('.error-message');
    errorMessages.forEach(el => el.remove());
    const inputErrors = formElement.querySelectorAll('.input-error');
    inputErrors.forEach(el => el.classList.remove('input-error'));
}

// 3. FUNZIONI DI AUTENTICAZIONE E UI

// Funzione per mostrare o nascondere le sezioni dell'app basate sullo stato di autenticazione
function updateUIforAuthState(user) {
    if (user) {
        authContainerDiv.style.display = 'none';
        appContentDiv.style.display = 'block';
        authStatusSpan.textContent = `Benvenuto, ${user.email}!`;
        logoutButton.style.display = 'block';
        // Nascondi le sezioni specifiche del giardino/piante fino a che non sono caricate o mostrate
        gardenContainer.style.display = 'grid'; // O 'grid' a seconda di come lo visualizzi
        myGardenContainer.style.display = 'none';
        plantFormCard.style.display = 'none'; // Assicurati che il form sia nascosto inizialmente
        fetchPlantsFromFirestore(); // Carica le piante al login
        fetchMyGardenFromFirebase(); // Carica il giardino dell'utente
    } else {
        authContainerDiv.style.display = 'block';
        appContentDiv.style.display = 'none';
        authStatusSpan.textContent = '';
        logoutButton.style.display = 'none';
        // Nascondi tutte le sezioni di contenuto quando non loggato
        gardenContainer.style.display = 'none';
        myGardenContainer.style.display = 'none';
        plantFormCard.style.display = 'none';
    }
}

// Funzioni di login e registrazione (esistenti, non modificate)
async function handleLogin(e) {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    loginError.textContent = '';
    showLoadingSpinner();
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        showToast('Login effettuato con successo!', 'success');
    } catch (error) {
        loginError.textContent = `Errore di login: ${error.message}`;
        showToast(`Errore di login: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;
    registerError.textContent = '';
    showLoadingSpinner();
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        showToast('Registrazione effettuata con successo!', 'success');
    } catch (error) {
        registerError.textContent = `Errore di registrazione: ${error.message}`;
        showToast(`Errore di registrazione: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function handleLogout() {
    showLoadingSpinner();
    try {
        await firebase.auth().signOut();
        showToast('Logout effettuato con successo!', 'info');
        isMyGardenCurrentlyVisible = false; // Reset dello stato di visualizzazione del giardino
    } catch (error) {
        showToast(`Errore durante il logout: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}


// Funzione per mostrare il form di aggiunta/modifica pianta (toggle)
// AGGIORNATA per gestire l'autoscroll e la logica di pulizia/reset
function toggleAddPlantForm(show = true) {
    if (plantFormCard) {
        plantFormCard.style.display = show ? 'block' : 'none';
        if (show) {
            // Reset dei campi del form quando mostrato per l'aggiunta
            document.getElementById('plantName').value = '';
            document.getElementById('plantSunlight').value = '';
            document.getElementById('plantIdealLuxMin').value = '';
            document.getElementById('plantIdealLuxMax').value = '';
            document.getElementById('plantWatering').value = '';
            document.getElementById('plantTempMin').value = '';
            document.getElementById('plantTempMax').value = '';
            document.getElementById('plantDescription').value = '';
            document.getElementById('plantCategory').value = 'fiori'; // Valore di default
            document.getElementById('plantImageURL').value = '';
            currentPlantIdToUpdate = null; // Resetta l'ID della pianta da aggiornare

            clearFormValidationErrors(plantFormCard); // Pulisci errori precedenti

            // Autoscroll al form
            plantFormCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// La tua funzione showUpdatePlantForm esistente, MODIFICATA per l'autoscroll
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

    // Assicurati che il form sia visibile (si assume che updatePlantCard sia lo stesso di plantFormCard)
    // Se hai un ID diverso per il form di update, usa quello qui. Altrimenti, plantFormCard è corretto.
    if (plantFormCard) {
        plantFormCard.style.display = 'block';
        clearFormValidationErrors(plantFormCard); // Pulisci errori precedenti
        // Autoscroll al form dopo averlo reso visibile
        plantFormCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}


// Funzione per nascondere il form di aggiunta/modifica
function hidePlantForm() {
    if (plantFormCard) {
        plantFormCard.style.display = 'none';
        currentPlantIdToUpdate = null;
        clearFormValidationErrors(plantFormCard); // Pulisci errori quando nascondi
    }
}

// 4. FUNZIONI DI INTERAZIONE CON FIRESTORE

// Funzione per salvare/aggiornare una pianta nel database
async function savePlantToFirestore(e) {
    e.preventDefault();
    showLoadingSpinner();

    const plantName = document.getElementById(currentPlantIdToUpdate ? 'updatePlantName' : 'plantName').value.trim();
    const plantSunlight = document.getElementById(currentPlantIdToUpdate ? 'updatePlantSunlight' : 'plantSunlight').value;
    const plantIdealLuxMin = document.getElementById(currentPlantIdToUpdate ? 'updatePlantIdealLuxMin' : 'plantIdealLuxMin').value.trim();
    const plantIdealLuxMax = document.getElementById(currentPlantIdToUpdate ? 'updatePlantIdealLuxMax' : 'plantIdealLuxMax').value.trim();
    const plantWatering = document.getElementById(currentPlantIdToUpdate ? 'updatePlantWatering' : 'plantWatering').value;
    const plantTempMin = document.getElementById(currentPlantIdToUpdate ? 'updatePlantTempMin' : 'plantTempMin').value.trim();
    const plantTempMax = document.getElementById(currentPlantIdToUpdate ? 'updatePlantTempMax' : 'plantTempMax').value.trim();
    const plantDescription = document.getElementById(currentPlantIdToUpdate ? 'updatePlantDescription' : 'plantDescription').value.trim();
    const plantCategory = document.getElementById(currentPlantIdToUpdate ? 'updatePlantCategory' : 'plantCategory').value;
    const plantImageURL = document.getElementById(currentPlantIdToUpdate ? 'updatePlantImageURL' : 'plantImageURL').value.trim();

    const plantData = {
        name: plantName,
        sunlight: plantSunlight,
        idealLuxMin: plantIdealLuxMin ? parseFloat(plantIdealLuxMin) : null,
        idealLuxMax: plantIdealLuxMax ? parseFloat(plantIdealLuxMax) : null,
        watering: plantWatering,
        tempMin: plantTempMin ? parseFloat(plantTempMin) : null,
        tempMax: plantTempMax ? parseFloat(plantTempMax) : null,
        description: plantDescription,
        category: plantCategory,
        image: plantImageURL || null,
        // Aggiungi un timestamp per l'ordinamento se necessario
        createdAt: currentPlantIdToUpdate ? firebase.firestore.FieldValue.serverTimestamp() : firebase.firestore.FieldValue.serverTimestamp() // Mantieni createdAt o lo crei
    };

    if (!validatePlantForm(plantData, !!currentPlantIdToUpdate)) { // Passa true se è un update
        hideLoadingSpinner();
        return;
    }

    try {
        if (currentPlantIdToUpdate) {
            await db.collection('plants').doc(currentPlantIdToUpdate).update(plantData);
            showToast('Pianta aggiornata con successo!', 'success');
        } else {
            await db.collection('plants').add(plantData);
            showToast('Pianta aggiunta con successo!', 'success');
        }
        hidePlantForm(); // Nascondi il form dopo il salvataggio
        fetchPlantsFromFirestore(); // Ricarica le piante per aggiornare la visualizzazione
    } catch (error) {
        showToast(`Errore durante il salvataggio: ${error.message}`, 'error');
        console.error("Errore nel salvataggio della pianta: ", error);
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione per eliminare una pianta dal database
async function deletePlantFromDatabase(plantId) {
    showLoadingSpinner();
    try {
        await db.collection('plants').doc(plantId).delete();
        showToast('Pianta eliminata con successo dal database!', 'success');
        fetchPlantsFromFirestore(); // Ricarica le piante
    } catch (error) {
        showToast(`Errore durante l'eliminazione: ${error.message}`, 'error');
        console.error("Errore nell'eliminazione della pianta: ", error);
    } finally {
        hideLoadingSpinner();
    }
}


// Funzione per aggiungere una pianta al giardino dell'utente (salvata in Firestore nel documento dell'utente)
async function addToMyGarden(plantId) {
    showLoadingSpinner();
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per aggiungere piante al tuo giardino.", 'info');
        hideLoadingSpinner();
        return;
    }

    const gardenRef = db.collection('gardens').doc(user.uid);
    try {
        const doc = await gardenRef.get();
        let currentGardenPlants = [];
        if (doc.exists) {
            currentGardenPlants = doc.data().plants || [];
        }

        // Evita duplicati
        if (currentGardenPlants.some(p => p.id === plantId)) {
            showToast("Questa pianta è già nel tuo giardino!", 'info');
            hideLoadingSpinner();
            return;
        }

        // Trova la pianta completa dai dati di allPlants per salvare tutti i dettagli
        const plantToAdd = allPlants.find(plant => plant.id === plantId);
        if (plantToAdd) {
            currentGardenPlants.push(plantToAdd);
            await gardenRef.set({ plants: currentGardenPlants });
            myGarden = currentGardenPlants; // Aggiorna la variabile locale myGarden
            showToast('Pianta aggiunta al tuo giardino!', 'success');
            if (isMyGardenCurrentlyVisible) {
                displayMyGarden(); // Aggiorna la visualizzazione del giardino se visibile
            }
        } else {
            showToast("Pianta non trovata per l'aggiunta al giardino.", 'error');
        }
    } catch (error) {
        showToast(`Errore nell'aggiunta al giardino: ${error.message}`, 'error');
        console.error("Errore nell'aggiunta al giardino: ", error);
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione per rimuovere una pianta dal giardino dell'utente
async function removeFromMyGarden(plantId) {
    showLoadingSpinner();
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per rimuovere piante dal tuo giardino.", 'info');
        hideLoadingSpinner();
        return;
    }

    const gardenRef = db.collection('gardens').doc(user.uid);
    try {
        const doc = await gardenRef.get();
        if (doc.exists) {
            let currentGardenPlants = doc.data().plants || [];
            const updatedGardenPlants = currentGardenPlants.filter(plant => plant.id !== plantId);

            if (updatedGardenPlants.length !== currentGardenPlants.length) {
                await gardenRef.set({ plants: updatedGardenPlants });
                myGarden = updatedGardenPlants; // Aggiorna la variabile locale myGarden
                showToast('Pianta rimossa dal tuo giardino!', 'info');
                if (isMyGardenCurrentlyVisible) {
                    displayMyGarden(); // Aggiorna la visualizzazione del giardino se visibile
                }
            } else {
                showToast("La pianta non era presente nel tuo giardino.", 'info');
            }
        } else {
            showToast("Il tuo giardino è vuoto.", 'info');
        }
    } catch (error) {
        showToast(`Errore nella rimozione dal giardino: ${error.message}`, 'error');
        console.error("Errore nella rimozione dal giardino: ", error);
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione per recuperare tutte le piante da Firestore
async function fetchPlantsFromFirestore() {
    showLoadingSpinner();
    try {
        const plantsRef = db.collection('plants');
        const snapshot = await plantsRef.get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante caricate da Firestore:", allPlants);
        displayPlants(allPlants); // Mostra tutte le piante di default
    } catch (error) {
        showToast(`Errore nel caricamento delle piante: ${error.message}`, 'error');
        console.error("Errore nel caricamento delle piante: ", error);
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione per recuperare il giardino dell'utente da Firebase (Firestore)
async function fetchMyGardenFromFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) {
        myGarden = [];
        console.log("Utente non autenticato, giardino vuoto.");
        return;
    }
    showLoadingSpinner();
    try {
        const gardenRef = db.collection('gardens').doc(user.uid);
        const doc = await gardenRef.get();
        if (doc.exists) {
            myGarden = doc.data().plants || [];
            console.log("Giardino caricato da Firebase:", myGarden);
        } else {
            myGarden = [];
            console.log("Nessun documento del giardino trovato per l'utente, giardino vuoto.");
        }
    } catch (error) {
        showToast(`Errore nel caricamento del tuo giardino: ${error.message}`, 'error');
        console.error("Errore nel caricamento del mio giardino: ", error);
    } finally {
        hideLoadingSpinner();
    }
}


// 5. FUNZIONI DI VISUALIZZAZIONE UI (Render delle piante)

// Funzione per applicare i filtri e il sorting
function applyFiltersAndSort(plantsToFilter) {
    let filteredPlants = [...plantsToFilter];

    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredPlants = filteredPlants.filter(plant =>
            plant.name.toLowerCase().includes(searchTerm) ||
            (plant.description && plant.description.toLowerCase().includes(searchTerm))
        );
    }

    const category = categoryFilter.value;
    if (category !== 'all') {
        filteredPlants = filteredPlants.filter(plant => plant.category === category);
    }

    const climateZone = climateZoneFilter.value;
    if (climateZone) {
        filteredPlants = filteredPlants.filter(plant =>
            plant.climateZone && plant.climateZone.toLowerCase().includes(climateZone.toLowerCase())
        );
    }

    const tempMin = parseFloat(tempMinFilter.value);
    const tempMax = parseFloat(tempMaxFilter.value);

    if (!isNaN(tempMin)) {
        filteredPlants = filteredPlants.filter(plant =>
            (plant.tempMin !== null && plant.tempMin >= tempMin) ||
            (plant.tempMin === null && plant.tempMax !== null && plant.tempMax >= tempMin) ||
            (plant.tempMin === null && plant.tempMax === null) // Se non ci sono dati di temperatura, include
        );
    }

    if (!isNaN(tempMax)) {
        filteredPlants = filteredPlants.filter(plant =>
            (plant.tempMax !== null && plant.tempMax <= tempMax) ||
            (plant.tempMax === null && plant.tempMin !== null && plant.tempMin <= tempMax) ||
            (plant.tempMin === null && plant.tempMax === null) // Se non ci sono dati di temperatura, include
        );
    }


    // Ordinamento
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
        // Puoi aggiungere altri criteri di ordinamento qui
    }

    return filteredPlants;
}


// Funzione per visualizzare le piante (generalizzata per tutte le piante o il mio giardino)
function displayPlants(plantsToShow) {
    const user = firebase.auth().currentUser;
    const filteredPlants = applyFiltersAndSort(plantsToShow);

    let html = '';
    if (filteredPlants.length === 0 && isMyGardenCurrentlyVisible) {
        document.getElementById('empty-garden-message').style.display = 'block';
    } else {
        document.getElementById('empty-garden-message').style.display = 'none';
        filteredPlants.forEach(plant => {
            // Determina se la pianta è già nel giardino per disabilitare il bottone "Aggiungi al Giardino"
            const isInMyGarden = user && myGarden.some(p => p.id === plant.id);
            const addToGardenButtonHtml = user ?
                `<button class="add-to-garden-button" data-plant-id="${plant.id}" ${isInMyGarden ? 'disabled' : ''}>${isInMyGarden ? 'Già nel Giardino' : 'Aggiungi al Giardino'}</button>` :
                `<button class="add-to-garden-button" disabled title="Accedi per aggiungere">Aggiungi al Giardino</button>`;

            html += `
                <div class="plant-card">
                    ${plant.image ? `<img src="${plant.image}" alt="${plant.name}" class="plant-image">` : ''}
                    <h3>${plant.name}</h3>
                    <p><strong>Esposizione al sole:</strong> ${plant.sunlight || 'N/A'}</p>
                    <p><strong>Lux Ideali:</strong> ${plant.idealLuxMin !== null && plant.idealLuxMax !== null ? `${plant.idealLuxMin} - ${plant.idealLuxMax}` : 'N/A'}</p>
                    <p><strong>Annaffiatura:</strong> ${plant.watering || 'N/A'}</p>
                    <p><strong>Temperatura Ideale:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
                    <p><strong>Descrizione:</strong> ${plant.description || 'N/A'}</p>
                    <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
                    <p><strong>Zona Climatica:</strong> ${plant.climateZone || 'N/A'}</p>
                    <div class="card-actions">
                        ${addToGardenButtonHtml}
                        <button class="update-plant-button" data-plant-id="${plant.id}">Aggiorna</button>
                        <button class="delete-plant-from-db-button" data-plant-id="${plant.id}">Elimina</button>
                    </div>
                </div>
            `;
        });
    }

    // Determina quale contenitore aggiornare
    if (isMyGardenCurrentlyVisible) {
        myGardenContainer.innerHTML = html;
        gardenContainer.style.display = 'none';
        myGardenContainer.style.display = 'grid'; // Assicurati che sia 'grid' per il layout
    } else {
        gardenContainer.innerHTML = html;
        myGardenContainer.style.display = 'none';
        gardenContainer.style.display = 'grid'; // Assicurati che sia 'grid' per il layout
    }
}

// Funzione per visualizzare solo le piante nel mio giardino
function displayMyGarden() {
    isMyGardenCurrentlyVisible = true;
    displayPlants(myGarden);
}

// Funzione per visualizzare tutte le piante disponibili
function displayAllPlants() {
    isMyGardenCurrentlyVisible = false;
    displayPlants(allPlants);
}

// 6. FUNZIONI PER IL SENSORE DI LUCE (NON MODIFICATE)

// Funzione per richiedere i permessi del sensore di luce
async function requestLightSensorPermission() {
    if (typeof AmbientLightSensor === 'undefined') {
        showToast("Il sensore di luce ambientale non è supportato dal tuo browser o dispositivo.", 'error');
        return false;
    }
    try {
        const permissionName = 'ambient-light-sensor';
        const result = await navigator.permissions.query({ name: permissionName });
        if (result.state === 'granted') {
            console.log('Permesso sensore luce già concesso.');
            return true;
        } else if (result.state === 'prompt') {
            // Non c'è un modo diretto per 'promptare' il permesso programmaticamente,
            // si attiva al primo tentativo di istanziare il sensore.
            showToast("Permesso sensore luce richiesto. Potrebbe apparire un popup.", 'info');
            return true; // Presumi che l'utente accetterà
        } else {
            showToast("Permesso sensore luce negato. Impossibile leggere la luce.", 'error');
            return false;
        }
    } catch (error) {
        showToast(`Errore nel controllo permessi sensore luce: ${error.message}`, 'error');
        console.error('Errore nel controllo permessi sensore luce:', error);
        return false;
    }
}

// Funzione per avviare il sensore di luce
async function startLightSensor() {
    const hasPermission = await requestLightSensorPermission();
    if (!hasPermission) {
        return;
    }

    if (ambientLightSensor) {
        ambientLightSensor.stop(); // Ferma se già in esecuzione
        ambientLightSensor = null;
    }

    try {
        ambientLightSensor = new AmbientLightSensor();

        ambientLightSensor.onreading = (event) => {
            const lux = ambientLightSensor.illuminance;
            lightDataSpan.textContent = `Luminosità attuale: ${lux.toFixed(2)} lux`;

            // Feedback basato sulla luminosità (esempi)
            if (lux < 50) {
                lightFeedbackSpan.textContent = 'Troppo buio per la maggior parte delle piante!';
                lightFeedbackSpan.style.color = 'red';
            } else if (lux < 500) {
                lightFeedbackSpan.textContent = 'Luminosità bassa, adatta a piante d\'ombra.';
                lightFeedbackSpan.style.color = 'orange';
            } else if (lux < 5000) {
                lightFeedbackSpan.textContent = 'Luminosità media, buona per molte piante da interno.';
                lightFeedbackSpan.style.color = 'green';
            } else {
                lightFeedbackSpan.textContent = 'Luminosità alta, adatta a piante da pieno sole.';
                lightFeedbackSpan.style.color = 'darkgreen';
            }
        };

        ambientLightSensor.onerror = (event) => {
            console.error('Errore sensore luce:', event.error.name, event.error.message);
            lightDataSpan.textContent = 'Errore sensore luce.';
            lightFeedbackSpan.textContent = 'Impossibile leggere la luminosità.';
            showToast(`Errore sensore luce: ${event.error.message}`, 'error');
            stopLightSensor();
        };

        ambientLightSensor.start();
        startLightSensorButton.style.display = 'none';
        stopLightSensorButton.style.display = 'inline-block';
        showToast('Sensore di luce avviato!', 'success');
    } catch (error) {
        showToast(`Impossibile avviare il sensore di luce: ${error.message}`, 'error');
        console.error('Impossibile avviare il sensore di luce:', error);
    }
}

// Funzione per fermare il sensore di luce
function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
        lightDataSpan.textContent = 'Luminosità: N/A';
        lightFeedbackSpan.textContent = 'Sensore spento.';
        lightFeedbackSpan.style.color = '#555'; // Colore di default
        startLightSensorButton.style.display = 'inline-block';
        stopLightSensorButton.style.display = 'none';
        showToast('Sensore di luce fermato.', 'info');
    }
}

// 7. GESTIONE EVENTI DOM E INIZIALIZZAZIONE

// Quando il DOM è completamente caricato
document.addEventListener('DOMContentLoaded', async () => {
    // Inizializza Firebase al caricamento del DOM
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();

    // Inizializza le variabili DOM (una volta che il DOM è pronto)
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden');
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    loginButton = document.getElementById('loginButton');
    registerButton = document.getElementById('registerButton');
    showLoginLink = document.getElementById('showLogin');
    showRegisterLink = document.getElementById('showRegister');
    emailInput = document.getElementById('email');
    passwordInput = document.getElementById('password');
    loginError = document.getElementById('login-error');
    registerEmailInput = document.getElementById('registerEmail');
    registerPasswordInput = document.getElementById('registerPassword');
    registerError = document.getElementById('register-error');
    authStatusSpan = document.getElementById('auth-status');
    logoutButton = document.getElementById('logoutButton');
    searchInput = document.getElementById('searchInput');
    categoryFilter = document.getElementById('categoryFilter');
    addNewPlantButton = document.getElementById('addNewPlantButton');
    showAllPlantsButton = document.getElementById('showAllPlantsButton');
    showMyGardenButton = document.getElementById('showMyGardenButton');
    plantFormCard = document.getElementById('plantFormCard'); // Assicurati che questo ID sia nel tuo HTML
    updatePlantCard = document.getElementById('plantFormCard'); // Stesso form, per update
    plantsSectionHeader = document.getElementById('plantsSectionHeader'); // Header della sezione piante
    lightSensorContainer = document.querySelector('.light-sensor-container'); // Contenitore del sensore
    startLightSensorButton = document.getElementById('startLightSensorButton');
    stopLightSensorButton = document.getElementById('stopLightSensorButton');
    lightDataSpan = document.getElementById('light-data');
    lightFeedbackSpan = document.getElementById('light-feedback');
    loadingSpinner = document.getElementById('loading-spinner');
    toastContainer = document.getElementById('toast-container'); // Inizializza il container dei toast

    // Event Listeners per l'autenticazione
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (showLoginLink) showLoginLink.addEventListener('click', showLoginForm);
    if (showRegisterLink) showRegisterLink.addEventListener('click', showRegisterForm);

    // Event Listeners per i filtri e l'ordinamento
    if (searchInput) searchInput.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (categoryFilter) categoryFilter.addEventListener('change', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));

    const climateZoneFilter = document.getElementById('climateZoneFilter');
    if (climateZoneFilter) climateZoneFilter.addEventListener('change', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));

    const tempMinFilter = document.getElementById('tempMinFilter');
    if (tempMinFilter) tempMinFilter.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));

    const tempMaxFilter = document.getElementById('tempMaxFilter');
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));

    const sortBySelect = document.getElementById('sortBy'); // Assumi che esista un select con id="sortBy"
    if (sortBySelect) {
        sortBySelect.addEventListener('change', (e) => {
            currentSortBy = e.target.value;
            displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
        });
    }

    // Event Listeners per i bottoni "Mostra Tutte le Piante", "Mostra il Mio Giardino", "Aggiungi Nuova Pianta"
    if (showAllPlantsButton) {
        showAllPlantsButton.addEventListener('click', () => {
            hidePlantForm();
            displayAllPlants();
        });
    }

    if (showMyGardenButton) {
        showMyGardenButton.addEventListener('click', () => {
            hidePlantForm();
            displayMyGarden();
            // SCROLL AUTOMATICO AL GIARDINO (Punto 6)
            if (myGardenContainer) {
                myGardenContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    if (addNewPlantButton) {
        addNewPlantButton.addEventListener('click', () => {
            toggleAddPlantForm(true); // Mostra il form per aggiungere
            // SCROLL AUTOMATICO AL FORM (Punto 6) - Già gestito in toggleAddPlantForm(true)
        });
    }

    // Event Listeners per il form di aggiunta/modifica pianta
    const savePlantButton = document.getElementById('savePlantButton');
    if (savePlantButton) savePlantButton.addEventListener('click', savePlantToFirestore);

    const cancelPlantButton = document.getElementById('cancelPlantButton');
    if (cancelPlantButton) cancelPlantButton.addEventListener('click', hidePlantForm);


    // Gestione clic sulle card delle piante (aggiungi/rimuovi/aggiorna/elimina)
    if (gardenContainer) {
        gardenContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('plant-image')) {
                // Gestisci il click sull'immagine per aprirla in una modal
                const imageUrl = event.target.src;
                if (imageModal && zoomedImage) {
                    zoomedImage.src = imageUrl;
                    imageModal.style.display = 'block';
                }
                return; // Non processare altri click se è un'immagine
            }

            if (event.target.classList.contains('add-to-garden-button')) {
                const plantIdToAdd = event.target.dataset.plantId;
                const user = firebase.auth().currentUser;
                if (user) { await addToMyGarden(plantIdToAdd); }
                else { showToast("Devi essere autenticato per aggiungere piante al tuo giardino.", 'info'); }
            } else if (event.target.classList.contains('update-plant-button')) {
                const plantIdToUpdate = event.target.dataset.plantId;
                const plantToUpdate = allPlants.find(p => p.id === plantIdToUpdate);
                if (plantToUpdate) { showUpdatePlantForm(plantToUpdate); }
                else { showToast(`Pianta con ID ${plantIdToUpdate} non trovata per l'aggiornamento.`, 'error'); }
            } else if (event.target.classList.contains('delete-plant-from-db-button')) {
                const plantIdToDelete = event.target.dataset.plantId;
                // Chiedi conferma prima di eliminare definitivamente dal DB
                if (confirm('Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile.')) {
                    showToast('Eliminazione pianta in corso...', 'info');
                    await deletePlantFromDatabase(plantIdToDelete);
                }
            }
        });
    }

    if (myGardenContainer) {
        myGardenContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('plant-image')) {
                // Gestisci il click sull'immagine per aprirla in una modal
                const imageUrl = event.target.src;
                if (imageModal && zoomedImage) {
                    zoomedImage.src = imageUrl;
                    imageModal.style.display = 'block';
                }
                return;
            }

            if (event.target.classList.contains('remove-button')) {
                const plantIdToRemove = event.target.dataset.plantId;
                const user = firebase.auth().currentUser;
                if (user) { await removeFromMyGarden(plantIdToRemove); } // UID non necessario qui
                else { showToast("Devi essere autenticato per rimuovere piante dal tuo giardino.", 'info'); }
            } else if (event.target.classList.contains('update-plant-button')) {
                const plantIdToUpdate = event.target.dataset.plantId;
                const plantToUpdate = allPlants.find(p => p.id === plantIdToUpdate);
                if (plantToUpdate) { showUpdatePlantForm(plantToUpdate); }
                else { showToast(`Pianta con ID ${plantIdToUpdate} non trovata per l'aggiornamento nel mio giardino.`, 'error'); }
            }
        });
    }

    // Inizializza la modal per le immagini
    imageModal = document.getElementById('image-modal');
    zoomedImage = document.getElementById('zoomed-image');
    closeButton = document.querySelector('#image-modal .close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            if (imageModal) imageModal.style.display = 'none';
        });
    }
    // Chiudi la modal cliccando fuori dall'immagine
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                imageModal.style.display = 'none';
            }
        });
    }


    // Event Listeners per il sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);

    // Gestione dello stato di autenticazione iniziale
    firebase.auth().onAuthStateChanged(user => {
        updateUIforAuthState(user);
        if (user) {
            // Se l'utente è loggato, mostra l'UI principale e carica i dati
            // Non è necessario ricaricare myGarden qui se fetchMyGardenFromFirebase è chiamato in updateUIforAuthState
        }
    });

    isDomReady = true; // Imposta il flag che il DOM è pronto

    // --- CONFIGURAZIONE INIZIALE UI DOPO DOMContentLoaded ---
    // Questa chiamata assicura che l'UI venga configurata correttamente
    // con lo stato di autenticazione corrente solo DOPO che il DOM è pronto.
    await handleAuthAndInitialDisplay();
});


// Funzione per la configurazione iniziale dell'UI dopo l'autenticazione
// (Questa funzione è già chiamata da onAuthStateChanged, non dovresti chiamarla direttamente qui)
async function handleAuthAndInitialDisplay() {
    // Il listener onAuthStateChanged si occupa di chiamare updateUIforAuthState(user)
    // che a sua volta chiama fetchPlantsFromFirestore() e fetchMyGardenFromFirebase()
    // per popolare i dati quando l'utente è loggato.
}
