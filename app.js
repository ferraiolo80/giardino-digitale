// 1. DICHIARAZIONI GLOBALI
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

// Variabile per lo spinner
let loadingSpinner; // Variabile per lo spinner di caricamento


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
let getClimateButton;       // Variabile per il bottone "Ottieni Clima"
let locationStatusDiv;      // Variabile per il div di stato della posizione
let climateZoneFilter;      // Variabile per il selettore del filtro clima
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
let sortBySelect; // Variabile DOM per il selettore di ordinamento

// Variabili per i messaggi di errore dei form di autenticazione
let loginErrorDiv; // AGGIUNTO
let registerErrorDiv; // AGGIUNTO


// --- FUNZIONI UI / HELPER PER LO SPINNER ---
function showSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex'; // 'flex' per centrare il contenuto
    }
}

function hideSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

// --- FUNZIONI UI / HELPER PER LA VALIDAZIONE ---
/**
 * Funzione per pulire tutti i messaggi di errore e i bordi rossi di un form specifico.
 * @param {HTMLElement} formContainer Il contenitore del form (es. newPlantCard, updatePlantCard).
 */
function clearFormValidationErrors(formContainer) {
    if (!formContainer) return;

    // Rimuovi la classe 'invalid' da tutti gli input/select/textarea
    formContainer.querySelectorAll('input, select, textarea').forEach(input => {
        input.classList.remove('invalid');
    });

    // Nascondi tutti i messaggi di errore
    formContainer.querySelectorAll('.error-message').forEach(errorSpan => {
        errorSpan.classList.remove('active');
        errorSpan.textContent = ''; // Pulisci anche il testo
    });
}

/**
 * Funzione per validare un singolo campo del form e mostrare/nascondere l'errore.
 * @param {HTMLElement} inputElement L'elemento input/select/textarea da validare.
 * @param {HTMLElement} errorSpan L'elemento span dove mostrare il messaggio di errore.
 * @param {string} errorMessage Il messaggio di errore da mostrare se il campo non è valido.
 * @returns {boolean} True se il campo è valido, False altrimenti.
 */
function validateField(inputElement, errorSpan, errorMessage) {
    if (!inputElement || !errorSpan) return true; // Se gli elementi non esistono, considera valido

    // Rimuovi eventuali stati di errore precedenti
    inputElement.classList.remove('invalid');
    errorSpan.classList.remove('active');
    errorSpan.textContent = '';

    let isValid = true;

    // 1. Validazione HTML5 (es. required, type="number")
    if (!inputElement.checkValidity()) {
        isValid = false;
        // Messaggio di errore specifico per la validazione HTML5
        if (inputElement.validity.valueMissing) {
            errorSpan.textContent = 'Campo obbligatorio.';
        } else if (inputElement.validity.typeMismatch) {
            errorSpan.textContent = 'Formato non valido.';
        } else if (inputElement.validity.rangeOverflow || inputElement.validity.rangeUnderflow) {
            errorSpan.textContent = `Valore fuori range (${inputElement.min || ''} - ${inputElement.max || ''}).`;
        } else {
            errorSpan.textContent = errorMessage || 'Campo non valido.';
        }
    }

    // 2. Validazioni aggiuntive JavaScript (es. per numeri, se HTML5 non basta)
    if (inputElement.type === 'number' && isNaN(parseInt(inputElement.value)) && inputElement.required) {
        isValid = false;
        errorSpan.textContent = 'Inserisci un numero valido.';
    }

    // 3. Validazione specifica per URL (se non required, checkValidity non basta)
    if (inputElement.id.includes('ImageURL') && inputElement.value.trim() !== '' && !inputElement.checkValidity()) {
        isValid = false;
        errorSpan.textContent = 'Inserisci un URL valido.';
    }


    if (!isValid) {
        inputElement.classList.add('invalid');
        errorSpan.classList.add('active');
    }

    return isValid;
}
// ---funzione per gli spinner --- 

function showLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex'; // O 'block', a seconda del tuo CSS
    }
}

// Funzione per nascondere lo spinner di caricamento
function hideLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}
// --- FUNZIONE PER I TOAST MESSAGES ---
/**
 * Mostra un toast message all'utente.
 * @param {string} message Il messaggio da visualizzare.
 * @param {'success'|'error'|'info'} type Il tipo di messaggio (determina il colore e l'icona).
 */
function showToast(message, type = 'info') {
    if (!toastContainer) {
        console.error("Toast container non trovato!");
        // Fallback all'alert se il toast container non è disponibile
        alert(message);
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast-message', type);

    let iconHtml = '';
    switch (type) {
        case 'success':
            iconHtml = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            iconHtml = '<i class="fas fa-times-circle"></i>';
            break;
        case 'info':
            iconHtml = '<i class="fas fa-info-circle"></i>';
            break;
        default:
            iconHtml = '';
    }

    toast.innerHTML = `${iconHtml}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Rimuovi il toast dopo un certo periodo (es. 3 secondi)
    setTimeout(() => {
        toast.classList.add('hide'); // Aggiungi una classe per l'animazione di uscita
        toast.addEventListener('animationend', () => {
            toast.remove(); // Rimuovi l'elemento dal DOM dopo l'animazione
        }, { once: true }); // Assicurati che il listener venga rimosso dopo l'esecuzione
    }, 3000); // Il toast rimane visibile per 3 secondi
}


// --- FUNZIONI DI AUTENTICAZIONE ---
async function handleLogin() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    // Assicurati che loginErrorDiv sia stato inizializzato
    if (!loginErrorDiv) {
        console.error("Elemento login-error non trovato.");
        showToast('Errore interno: elemento errore login non trovato.', 'error');
        return;
    }

    if (emailInput && passwordInput) {
        const email = emailInput.value;
        const password = passwordInput.value;
        loginErrorDiv.innerText = ''; // Pulisci errori precedenti

        showSpinner(); // Mostra spinner
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log("Login effettuato con successo!");
            showToast('Accesso effettuato con successo!', 'success');
        } catch (error) {
            console.error("Errore durante il login:", error);
            loginErrorDiv.innerText = error.message; // Mostra errore nel div specifico
            showToast(`Errore login: ${error.message}`, 'error');
        } finally {
            hideSpinner(); // Nascondi spinner
        }
    } else {
        console.error("Elementi del form di login non trovati.");
        showToast('Errore interno: elementi login non trovati.', 'error');
    }
}

async function handleRegister() {
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    // Assicurati che registerErrorDiv sia stato inizializzato
    if (!registerErrorDiv) {
        console.error("Elemento register-error non trovato.");
        showToast('Errore interno: elemento errore registrazione non trovato.', 'error');
        return;
    }

    if (emailInput && passwordInput && confirmPasswordInput) {
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        registerErrorDiv.innerText = ''; // Pulisci errori precedenti

        if (password !== confirmPassword) {
            registerErrorDiv.innerText = "Le password non corrispondono.";
            showToast('Le password non corrispondono.', 'error');
            return;
        }

        showSpinner(); // Mostra spinner
        try {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            console.log("Registrazione effettuata con successo!");
            showToast('Registrazione effettuata con successo!', 'success');
        } catch (error) {
            console.error("Errore durante la registrazione:", error);
            registerErrorDiv.innerText = error.message; // Mostra errore nel div specifico
            showToast(`Errore registrazione: ${error.message}`, 'error');
        } finally {
            hideSpinner(); // Nascondi spinner
        }
    } else {
        console.error("Elementi del form di registrazione non trovati.");
        showToast('Errore interno: elementi registrazione non trovati.', 'error');
    }
}

async function handleLogout() {
    showSpinner(); // Mostra spinner
    try {
        await firebase.auth().signOut();
        console.log("Logout effettuato con successo!");
        showToast('Logout effettuato con successo.', 'info');
    } catch (error) {
        console.error("Errore durante il logout:", error);
        showToast(`Errore logout: ${error.message}`, 'error');
    } finally {
        hideSpinner(); // Nascondi spinner
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
    // Questo è un approccio semplificato, per un sistema più robusto si userebbe .cloneNode(true)
    // o un sistema di gestione listener più avanzato.
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
    // Anche qui, un approccio più robusto implicherebbe un riferimento al listener per rimuoverlo.
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
        <p><i class="fas fa-sun"></i> Luce: ${plantData.sunlight || 'N/A'}</p>
        <p><i class="fas fa-tint"></i> Acqua: ${plantData.watering || 'N/A'}</p>
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
    // currentSortBy è già una variabile globale che si aggiorna.

    let plantsToFilter;
    if (isMyGardenCurrentlyVisible) {
        // Filtra le piante del giardino dall'array 'allPlants'
        // Questo assicura che il filtraggio del giardino sia basato sugli oggetti pianta completi
        plantsToFilter = allPlants.filter(plant => myGarden.includes(plant.id));
    } else {
        plantsToFilter = allPlants;
    }

    let filteredPlants = plantsToFilter.filter(plant => {
        const matchesSearch = searchTerm === '' || plant.name.toLowerCase().includes(searchTerm) ||
                              (plant.description && plant.description.toLowerCase().includes(searchTerm));
        const matchesCategory = category === 'all' || category === '' || plant.category === category; // Aggiunto '' per "Tutte" se il value è vuoto
        const matchesTempMin = isNaN(tempMin) || plant.tempMin >= tempMin;
        const matchesTempMax = isNaN(tempMax) || plant.tempMax <= tempMax;

        return matchesSearch && matchesCategory && matchesTempMin && matchesTempMax;
    });

// Filtro per clima (aggiunto per la geolocalizzazione)
    const selectedClimate = climateZoneFilter.value;
    if (selectedClimate && selectedClimate !== '' && selectedClimate !== 'Sconosciuto') {
        // Questa logica dipende da come le tue piante sono associate alle zone climatiche.
        // Esempio: se una pianta ha un campo 'climateZones' che è un array di stringhe
        filteredPlants = filteredPlants.filter(plant =>
            plant.climateZones && plant.climateZones.includes(selectedClimate)
        );
        // OPPURE, se vuoi filtrare per temperatura basandoti sul clima dedotto:
        // Qui dovresti avere una mappatura interna per i range di temperatura di ciascun clima.
        // Ad esempio:
        // const climateTempRanges = {
        //     'Mediterraneo': { min: 5, max: 35 },
        //     'Temperato': { min: -10, max: 30 },
        //     // ... e così via per tutti i tuoi climi
        // };
        // const tempRange = climateTempRanges[selectedClimate];
        // if (tempRange) {
        //     filteredPlants = filteredPlants.filter(plant =>
        //         plant.tempMin >= tempRange.min && plant.tempMax <= tempRange.max
        //     );
        // }
    }

    
    // --- NUOVA LOGICA DI ORDINAMENTO ---
    filteredPlants.sort((a, b) => {
        const [field, order] = currentSortBy.split('_'); // Es. "name_asc" -> ["name", "asc"]

        let valA, valB;

        switch (field) {
            case 'name':
            case 'category':
                valA = a[field] ? a[field].toLowerCase() : ''; // Gestisci valori null/undefined
                valB = b[field] ? b[field].toLowerCase() : ''; // Gestisci valori null/undefined
                break;
            case 'tempMin':
            case 'tempMax':
            case 'luxMin': 
            case 'luxMax': 
                // Utilizza i nomi dei campi corretti: idealLuxMin/Max
                const actualField = field.startsWith('temp') ? field : 'ideal' + field.charAt(0).toUpperCase() + field.slice(1);
                valA = a[actualField] != null ? a[actualField] : (order === 'asc' ? -Infinity : Infinity); // Metti null in fondo o in cima
                valB = b[actualField] != null ? b[actualField] : (order === 'asc' ? -Infinity : Infinity);
                break;
            default:
                valA = a.name ? a.name.toLowerCase() : ''; // Default a ordinamento per nome se il campo non è riconosciuto
                valB = b.name ? b.name.toLowerCase() : '';
        }

        if (valA < valB) {
            return order === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
            return order === 'asc' ? 1 : -1;
        }
        return 0; // I nomi sono uguali
    });
    // --- FINE LOGICA DI ORDINAMENTO ---

    if (isMyGardenCurrentlyVisible) {
        renderMyGarden(filteredPlants);
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
    // Pulisci eventuali errori di validazione precedenti quando apri il form
    clearFormValidationErrors(updatePlantCard); 

    currentPlantIdToUpdate = plant.id;
    document.getElementById('updatePlantId').value = plant.id;
    document.getElementById('updatePlantName').value = plant.name || '';
    document.getElementById('updatePlantSunlight').value = plant.sunlight || ''; // Ri-aggiunto
    document.getElementById('updatePlantWatering').value = plant.watering || ''; // Ri-aggiunto
    document.getElementById('updatePlantTempMin').value = plant.tempMin || '';
    document.getElementById('updatePlantTempMax').value = plant.tempMax || '';
    document.getElementById('updatePlantDescription').value = plant.description || '';
    document.getElementById('updatePlantCategory').value = plant.category || ''; // Default a vuoto per "Seleziona una categoria"
    document.getElementById('updatePlantImageURL').value = plant.image || ''; // Corretto ID
    document.getElementById('updatePlantIdealLuxMin').value = plant.idealLuxMin || ''; 
    document.getElementById('updatePlantIdealLuxMax').value = plant.idealLuxMax || ''; 

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
    document.getElementById('updatePlantSunlight').value = ''; // Ri-aggiunto
    document.getElementById('updatePlantWatering').value = ''; // Ri-aggiunto
    document.getElementById('updatePlantTempMin').value = '';
    document.getElementById('updatePlantTempMax').value = '';
    document.getElementById('updatePlantDescription').value = '';
    document.getElementById('updatePlantCategory').value = ''; // Reset a vuoto
    document.getElementById('updatePlantImageURL').value = ''; // Corretto ID
    document.getElementById('updatePlantIdealLuxMin').value = ''; 
    document.getElementById('updatePlantIdealLuxMax').value = ''; 

    clearFormValidationErrors(updatePlantCard); // Pulisci gli errori di validazione
}

async function updatePlantInFirebase(plantId, updatedData) {
    showSpinner(); // Mostra spinner
    try {
        await db.collection('plants').doc(plantId).update(updatedData);
        console.log("Pianta aggiornata con successo:", plantId);
        showToast('Pianta aggiornata con successo!', 'success'); // Sostituito alert
        await loadPlantsFromFirebase(); 
        await loadMyGardenFromFirebase(); 
        applyFilters(); // Riapplica i filtri per aggiornare la UI
        if (updatePlantCard) { 
            updatePlantCard.style.display = 'none';
        }
    } catch (error) {
        console.error("Errore nell'aggiornamento della pianta:", error);
        showToast(`Errore nell'aggiornamento della pianta: ${error.message}`, 'error'); // Sostituito alert
    } finally {
        hideSpinner(); // Nascondi spinner
    }
}

async function deletePlantFromDatabase(plantId) {
    showSpinner(); // Mostra spinner
    try {
        await db.collection('plants').doc(plantId).delete();
        console.log("Pianta eliminata con successo:", plantId);
        showToast('Pianta eliminata con successo!', 'success'); // Sostituito alert
        await loadPlantsFromFirebase();
        await loadMyGardenFromFirebase(); 
        applyFilters();
        if (updatePlantCard) {
            updatePlantCard.style.display = 'none';
        }
    } catch (error) {
        console.error("Errore nell'eliminazione della pianta:", error);
        showToast(`Errore nell'eliminazione della pianta: ${error.message}`, 'error'); // Sostituito alert
    } finally {
        hideSpinner(); // Nascondi spinner
    }
}

// --- FUNZIONI DI GESTIONE DEL GIARDINO (Aggiungi/Rimuovi) ---
async function addToMyGarden(plantId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per aggiungere piante al tuo giardino.", 'info'); // Sostituito alert
        return; // Esci se non autenticato
    }

    showSpinner(); // Mostra spinner

    try {
        if (!myGarden.includes(plantId)) {
            myGarden.push(plantId);
            await saveMyGardenToFirebase(myGarden); 
            applyFilters(); 
            showToast('Pianta aggiunta al tuo giardino!', 'success'); 
        } else {
            console.log(`Pianta ${plantId} già presente nel giardino.`);
            showToast('Questa pianta è già nel tuo giardino.', 'info'); 
        }
    } catch (error) {
        console.error("Errore nell'aggiunta della pianta al giardino:", error);
        showToast(`Errore nell'aggiunta della pianta: ${error.message}`, 'error'); 
    } finally {
        hideSpinner(); 
    }
}

async function removeFromMyGarden(plantIdToRemove) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per rimuovere piante dal tuo giardino.", 'info'); 
        return; 
    }

    showSpinner(); 

    try {
        const initialGardenSize = myGarden.length;
        myGarden = myGarden.filter(plantId => plantId !== plantIdToRemove);
        
        if (myGarden.length < initialGardenSize) {
            await saveMyGardenToFirebase(myGarden); 
            applyFilters(); 
            showToast('Pianta rimossa dal tuo giardino.', 'success'); 
        } else {
            console.log(`Pianta ${plantIdToRemove} non trovata nel giardino da rimuovere.`);
            showToast('Questa pianta non è nel tuo giardino.', 'info'); 
        }
    } catch (error) {
        console.error("Errore nella rimozione della pianta dal giardino:", error);
        showToast(`Errore nella rimozione della pianta: ${error.message}`, 'error'); 
    } finally {
        hideSpinner(); 
    }
}

// --- FUNZIONI DI SALVATAGGIO/CARICAMENTO DATI DA FIREBASE ---
async function saveNewPlantToFirebase() {
    // Recupera i valori direttamente dagli input, che sono stati inizializzati in DOMContentLoaded
    const newPlantNameInput = document.getElementById('newPlantName'); 
    const errorNewPlantName = document.getElementById('errorNewPlantName');

    const newPlantSunlightInput = document.getElementById('newPlantSunlight'); 
    const errorNewPlantSunlight = document.getElementById('errorNewPlantSunlight'); 
    const newPlantWateringInput = document.getElementById('newPlantWatering'); 
    const errorNewPlantWatering = document.getElementById('errorNewPlantWatering'); 

    const newPlantIdealLuxMinInputElem = document.getElementById('newPlantIdealLuxMin'); 
    const errorNewPlantIdealLuxMin = document.getElementById('errorNewPlantIdealLuxMin');

    const newPlantIdealLuxMaxInputElem = document.getElementById('newPlantIdealLuxMax'); 
    const errorNewPlantIdealLuxMax = document.getElementById('errorNewPlantIdealLuxMax');

    const newPlantTempMinInput = document.getElementById('newPlantTempMin');
    const errorNewPlantTempMin = document.getElementById('errorNewPlantTempMin');

    const newPlantTempMaxInput = document.getElementById('newPlantTempMax');
    const errorNewPlantTempMax = document.getElementById('errorNewPlantTempMax');

    const newPlantDescriptionInput = document.getElementById('newPlantDescription');
    const errorNewPlantDescription = document.getElementById('errorNewPlantDescription');

    const newPlantCategoryInput = document.getElementById('newPlantCategory');
    const errorNewPlantCategory = document.getElementById('errorNewPlantCategory');

    const newPlantImageURLInput = document.getElementById('newPlantImageURL'); 
    const errorNewPlantImageURL = document.getElementById('errorNewPlantImageURL'); 


    // Pulisci tutti gli errori precedenti prima di ri-validare
    clearFormValidationErrors(newPlantCard);

    let formIsValid = true;

    // Esegui la validazione per ogni campo obbligatorio
    if (!validateField(newPlantNameInput, errorNewPlantName, 'Il nome è obbligatorio.')) formIsValid = false;
    if (!validateField(newPlantSunlightInput, errorNewPlantSunlight, 'La luce è obbligatoria.')) formIsValid = false; 
    if (!validateField(newPlantWateringInput, errorNewPlantWatering, 'L\'acqua è obbligatoria.')) formIsValid = false; 
    if (!validateField(newPlantIdealLuxMinInputElem, errorNewPlantIdealLuxMin, 'Lux Min è obbligatorio e deve essere un numero.')) formIsValid = false;
    if (!validateField(newPlantIdealLuxMaxInputElem, errorNewPlantIdealLuxMax, 'Lux Max è obbligatorio e deve essere un numero.')) formIsValid = false;
    if (!validateField(newPlantTempMinInput, errorNewPlantTempMin, 'Temp Min è obbligatoria e deve essere un numero.')) formIsValid = false;
    if (!validateField(newPlantTempMaxInput, errorNewPlantTempMax, 'Temp Max è obbligatoria e deve essere un numero.')) formIsValid = false;
    if (!validateField(newPlantDescriptionInput, errorNewPlantDescription, 'La descrizione è obbligatoria.')) formIsValid = false; 
    if (!validateField(newPlantCategoryInput, errorNewPlantCategory, 'La categoria è obbligatoria.')) formIsValid = false;
    if (!validateField(newPlantImageURLInput, errorNewPlantImageURL, 'L\'URL immagine è obbligatorio e deve essere valido.')) formIsValid = false; 


    if (!formIsValid) {
        console.log("Validazione form fallita. Correggi gli errori.");
        showToast('Per favore, correggi gli errori nel form.', 'error'); 
        return; 
    }

    showSpinner();
    try {
        const docRef = await db.collection('plants').add({
            name: newPlantNameInput.value,
            sunlight: newPlantSunlightInput.value, 
            watering: newPlantWateringInput.value, 
            tempMin: parseInt(newPlantTempMinInput.value),
            tempMax: parseInt(newPlantTempMaxInput.value),
            description: newPlantDescriptionInput.value,
            category: newPlantCategoryInput.value,
            image: newPlantImageURLInput.value, 
            idealLuxMin: parseInt(newPlantIdealLuxMinInputElem.value),
            idealLuxMax: parseInt(newPlantIdealLuxMaxInputElem.value)
        });

        console.log("Nuova pianta aggiunta con ID: ", docRef.id);
        showToast('Nuova pianta aggiunta con successo!', 'success'); 
        if (newPlantCard) {
            newPlantCard.style.display = 'none';
        }
        clearNewPlantForm(); 
        await loadPlantsFromFirebase();
        applyFilters();
    } catch (error) {
        console.error("Errore nell'aggiunta della nuova pianta:", error);
        showToast(`Errore nell'aggiunta della pianta: ${error.message}`, 'error'); 
    } finally {
        hideSpinner();
    }
}

function clearNewPlantForm() {
    document.getElementById('newPlantName').value = '';
    document.getElementById('newPlantSunlight').value = ''; 
    document.getElementById('newPlantWatering').value = ''; 
    document.getElementById('newPlantTempMin').value = '';
    document.getElementById('newPlantTempMax').value = '';
    document.getElementById('newPlantDescription').value = '';
    document.getElementById('newPlantCategory').value = ''; // Reset a vuoto
    document.getElementById('newPlantImageURL').value = ''; 
    document.getElementById('newPlantIdealLuxMin').value = ''; 
    document.getElementById('newPlantIdealLuxMax').value = ''; 

    clearFormValidationErrors(newPlantCard); // Pulisci gli errori di validazione
}

async function loadMyGardenFromFirebase() {
    showSpinner(); 

    const user = firebase.auth().currentUser;

    if (!user) {
        myGarden = []; 
        console.log("Nessun utente loggato. Giardino vuoto.");
        hideSpinner(); 
        return; 
    }

    try {
        const doc = await db.collection('gardens').doc(user.uid).get();
        myGarden = doc.data()?.plantIds || []; 
        console.log("Giardino caricato da Firebase:", myGarden);
    } catch (error) {
        console.error("Errore nel caricamento del giardino da Firebase:", error);
        myGarden = []; 
        showToast(`Errore nel caricamento del giardino: ${error.message}`, 'error'); 
    } finally {
        hideSpinner(); 
    }
}


async function saveMyGardenToFirebase(gardenArray) {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.warn("Nessun utente autenticato per salvare il giardino.");
        showToast("Nessun utente autenticato per salvare il giardino.", 'info'); 
        return; 
    }

    showSpinner(); 

    try {
        await db.collection('gardens').doc(user.uid).set({
            plantIds: gardenArray
        });
        console.log("Giardino utente salvato con successo.");
    } catch (error) {
        console.error("Errore nel salvataggio del giardino utente:", error);
        showToast(`Errore nel salvataggio del giardino: ${error.message}`, 'error'); 
    } finally {
        hideSpinner(); 
    }
}

async function loadPlantsFromFirebase() {
    showSpinner(); 
    try {
        const plantsSnapshot = await db.collection('plants').get();
        allPlants = plantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante caricate da Firebase:", allPlants);
    } catch (error) {
        console.error("Errore nel caricamento delle piante da Firebase:", error);
        showToast(`Errore nel caricamento delle piante: ${error.message}`, 'error'); 
    } finally {
        hideSpinner(); 
    }
}

// --- FUNZIONI DI VISIBILITÀ UI ---
async function updateGardenVisibility(showMyGarden) {
    // Tutti questi elementi sono ora variabili globali 'let' e sono stati inizializzati
    // in DOMContentLoaded, quindi dovrebbero essere disponibili.
    if (!plantsSection || !gardenContainer || !myGardenContainer || !giardinoTitle || !toggleMyGardenButton || !emptyGardenMessage) {
        console.error("Uno o più elementi UI principali non sono stati trovati in updateGardenVisibility! Ricarica la pagina o controlla gli ID.");
        showToast('Errore UI: elementi non trovati. Riprova.', 'error'); 
        return;
    }

    const user = firebase.auth().currentUser;

    isMyGardenCurrentlyVisible = showMyGarden; 

    if (user) {
        toggleMyGardenButton.style.display = 'block';
        if (showMyGarden) {
            toggleMyGardenButton.innerHTML = 'Mostra tutte le Piante'; 
            giardinoTitle.textContent = 'Il mio giardino'; // Aggiorna il titolo
        } else {
            toggleMyGardenButton.innerHTML = 'Mostra il mio Giardino'; 
            giardinoTitle.textContent = 'Tutte le piante'; // Aggiorna il titolo
        }
    } else {
        toggleMyGardenButton.style.display = 'none'; // Nascondi il bottone se non loggato
        giardinoTitle.textContent = 'Tutte le piante'; // Titolo di default per non loggato
    }

    if (user && showMyGarden) {
        plantsSection.style.display = 'block'; // La plantsSection contiene entrambi i contenitori
        gardenContainer.style.display = 'none'; 
        myGardenContainer.style.display = 'grid'; 
        giardinoTitle.style.display = 'block'; 
    } else {
        plantsSection.style.display = 'block'; 
        gardenContainer.style.display = 'grid'; 
        myGardenContainer.style.display = 'none'; 
        giardinoTitle.style.display = 'block'; // Mostra sempre il titolo della sezione principale
    }

    applyFilters(); // Ri-applica i filtri per renderizzare la vista corretta
}

function handleToggleMyGarden() {
    updateGardenVisibility(!isMyGardenCurrentlyVisible);
}

// GEOLOCALIZZAZIONE E DEDUZIONE CLIMA
async function getClimateFromCoordinates(latitude, longitude) {
    showLoadingSpinner();
    showToast("Ricerca clima in corso...", 'info');
    try {
        let climateZone = 'Sconosciuto';
        if (latitude >= 35 && latitude <= 45 && longitude >= 5 && longitude <= 20) {
            climateZone = 'Mediterraneo';
        } else if (latitude >= 40 && latitude <= 60 && longitude >= -10 && longitude <= 30) {
            climateZone = 'Temperato';
        } else if (latitude < 23.5 && latitude > -23.5) {
            climateZone = 'Tropicale';
        } else if (latitude >= 23.5 && latitude < 35 || latitude < -23.5 && latitude > -35) {
            climateZone = 'Subtropicale';
        } else if (latitude > 60 || latitude < -60) {
            climateZone = 'Boreale/Artico';
        } else if (latitude >= 20 && latitude < 35 && longitude > -10 && longitude < 5) {
            climateZone = 'Arido';
        }

        locationStatusDiv.innerHTML = `<i class="fas fa-location-dot"></i> <span>Clima dedotto: <strong>${climateZone}</strong></span>`;
        climateZoneFilter.value = climateZone;
        applyFilters(); // Assicurati che applyFilters sia definita e gestisca il filtro del clima
        showToast(`Clima dedotto: ${climateZone}`, 'success');

    } catch (error) {
        console.error("Errore nel dedurre il clima:", error);
        locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span>Impossibile dedurre il clima.</span>`;
        showToast("Errore nel dedurre il clima.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

function getLocation() {
    if (navigator.geolocation) {
        locationStatusDiv.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Acquisizione posizione...</span>`;
        showToast("Acquisizione della posizione...", 'info');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getClimateFromCoordinates(lat, lon);
            },
            (error) => {
                let errorMessage = "Errore di geolocalizzazione.";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Accesso alla posizione negato dall'utente.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Informazioni sulla posizione non disponibili.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Timeout scaduto durante l'acquisizione della posizione.";
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage = "Errore sconosciuto di geolocalizzazione.";
                        break;
                }
                console.error(errorMessage, error);
                locationStatusDiv.innerHTML = `<i class="fas fa-times-circle"></i> <span>${errorMessage}</span>`;
                showToast(errorMessage, 'error');
                hideLoadingSpinner();
            },
            {
                enableHighAccuracy: true, // Tenta di ottenere la posizione più precisa possibile
                timeout: 10000,           // Tempo massimo (ms) per attendere la posizione (10 secondi)
                maximumAge: 0             // Non usare una posizione in cache
            }
        );
    } else {
        locationStatusDiv.innerHTML = `<i class="fas fa-times-circle"></i> <span>Geolocalizzazione non supportata dal browser.</span>`;
        showToast("Geolocalizzazione non supportata dal tuo browser.", 'error');
    }
}


// --- FUNZIONI SENSORE DI LUCE ---
async function startLightSensor() {
    showSpinner(); 

    if ('AmbientLightSensor' in window) {
        if (ambientLightSensor) {
            ambientLightSensor.stop(); 
        }
        ambientLightSensor = new AmbientLightSensor();

        ambientLightSensor.onreading = () => {
            const lux = ambientLightSensor.illuminance;
            if (currentLuxValueSpan) currentLuxValueSpan.textContent = lux.toFixed(2);

            if (myGarden && myGarden.length > 0 && lux != null) {
                let feedbackHtml = '<h4>Feedback Luce per il tuo Giardino:</h4><ul>';
                const plantsInGarden = allPlants.filter(plant => myGarden.includes(plant.id));

                plantsInGarden.forEach(plant => {
                    const minLux = plant.idealLuxMin;
                    const maxLux = plant.idealLuxMax;

                    if (minLux != null && maxLux != null) {
                        let feedbackMessage = `${plant.name}: `;
                        if (lux < minLux) {
                            feedbackMessage += `<span style="color: red;">Troppo poca luce!</span> (Richiede ${minLux}-${maxLux} Lux)`;
                        } else if (lux > maxLux) {
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
            console.error("Errore sensore di luce:", event.error.name, event.error.message);
            if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'Errore';
            if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p style="color: red;">Errore sensore: ${event.error.message}</p>`;
            showToast(`Errore sensore luce: ${event.error.message}`, 'error'); 
        };

        try {
            await ambientLightSensor.start(); 
            if (startLightSensorButton) startLightSensorButton.style.display = 'none';
            if (stopLightSensorButton) stopLightSensorButton.style.display = 'inline-block';
            if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = "Misurazione in corso...";
            showToast('Sensore luce avviato con successo.', 'info'); 
        } catch (error) {
            console.error("Impossibile avviare il sensore di luce:", error);
            if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p style="color: red;">Impossibile avviare il sensore di luce. Assicurati che il tuo dispositivo lo supporti e che tu abbia concesso i permessi. ${error.message}</p>`;
            if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'N/A';
            showToast(`Impossibile avviare il sensore luce: ${error.message}`, 'error'); 
        } finally {
            hideSpinner(); 
        }
    } else {
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p style="color: orange;">Il sensore di luce ambientale non è supportato dal tuo dispositivo.</p>';
        if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'N/A';
        showToast('Il sensore di luce ambientale non è supportato dal tuo dispositivo.', 'info'); 
        hideSpinner(); 
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
        showToast('Sensore luce fermato.', 'info'); 
    }
}

// --- NUOVA FUNZIONE PER GESTIRE L'AUTENTICAZIONE E L'AGGIORNAMENTO UI ---
// Questa funzione è chiamata sia da onAuthStateChanged che da DOMContentLoaded
async function handleAuthAndUI(user) {
    // Assicurati che il DOM sia pronto prima di manipolare elementi DOM
    if (!isDomReady) {
        console.log("handleAuthAndUI chiamato, ma DOM non ancora pronto. Attesa...");
        return; // Esci e lascia che DOMContentLoaded gestisca la configurazione iniziale.
    }

    if (user) {
        console.log("Stato autenticazione cambiato, utente loggato:", user.uid, user.email);
        authStatusDiv.innerHTML = `<i class="fas fa-user"></i> <span>Benvenuto</span>, ${user.email}`;
        appContentDiv.style.display = 'block'; 
        authContainerDiv.style.display = 'none'; 

        // Mostra il bottone di logout solo se l'utente è autenticato
        if (logoutButton) {
            logoutButton.style.display = 'inline-block'; 
            // Rimuovi e riaggiungi il listener per il logout per evitare duplicazioni
            logoutButton.removeEventListener('click', handleLogout); 
            logoutButton.addEventListener('click', handleLogout);    
        }
        
        await loadPlantsFromFirebase();
        await loadMyGardenFromFirebase(); 

        const showMyGardenInitially = myGarden.length > 0;
        await updateGardenVisibility(showMyGardenInitially);

    } else {
        console.log("Stato autenticazione cambiato, nessun utente loggato.");
        authStatusDiv.innerText = "Nessun utente autenticato.";
        appContentDiv.style.display = 'none'; 
        authContainerDiv.style.display = 'block'; 

        // Nascondi il bottone di logout se l'utente non è autenticato
        if (logoutButton) {
            logoutButton.style.display = 'none'; 
        }

        myGarden = []; 
        isMyGardenCurrentlyVisible = false; 

        await loadPlantsFromFirebase(); 
        
        // Imposta la visibilità per l'utente non loggato: solo la galleria principale
        if (plantsSection) plantsSection.style.display = 'block';
        if (gardenContainer) gardenContainer.style.display = 'grid'; 
        if (myGardenContainer) myGardenContainer.style.display = 'none'; 
        if (giardinoTitle) giardinoTitle.style.display = 'block'; // Mostra il titolo "Tutte le piante"
        if (emptyGardenMessage) emptyGardenMessage.style.display = 'none';

        // Nascondi il bottone "Mio Giardino" se non loggati
        if (toggleMyGardenButton) {
            toggleMyGardenButton.style.display = 'none';
        }
        applyFilters(); 
    }
}

// --- GLOBAL FIREBASE AUTH STATE LISTENER ---
// Questo listener dovrebbe essere definito a livello globale, non dentro DOMContentLoaded
firebase.auth().onAuthStateChanged(async (user) => {
    // Questa funzione sarà chiamata da Firebase ogni volta che lo stato di autenticazione cambia.
    // Potrebbe essere attivata prima che DOMContentLoaded sia completamente terminato.
    // Usiamo `isDomReady` per assicurarci che gli elementi DOM siano pronti prima di manipolarli.
    if (!isDomReady) {
        console.log("onAuthStateChanged attivato, ma DOM non ancora pronto. Attesa...");
        return; // Esci e lascia che DOMContentLoaded gestisca la configurazione iniziale.
    }

    // Se il DOM è pronto, procedi con l'aggiornamento dell'UI basato sullo stato di autenticazione.
    await handleAuthAndUI(user);
});


// --- DOMContentLoaded LISTENER ---
// Questo listener assicurerà che tutti gli elementi DOM siano pronti prima di interagire con essi.
document.addEventListener('DOMContentLoaded', async () => {
    // Inizializza TUTTE le variabili globali degli elementi DOM qui
    // Assicurati che gli ID qui corrispondano ESATTAMENTE agli ID nel tuo index.html
    loginButton = document.getElementById('loginButton'); 
    registerButton = document.getElementById('registerButton'); 
    logoutButton = document.getElementById('logoutButton'); 
    authStatusDiv = document.getElementById('auth-status');
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');

    // Inizializzazione delle nuove variabili DOM per la geolocalizzazione
    getClimateButton = document.getElementById('get-climate-button');
    locationStatusDiv = document.getElementById('location-status');
    climateZoneFilter = document.getElementById('climate-zone-filter');

    // Inizializzazione dei div per gli errori di autenticazione
    loginErrorDiv = document.getElementById('login-error'); // AGGIUNTO
    registerErrorDiv = document.getElementById('register-error'); // AGGIUNTO

    searchInput = document.getElementById('searchInput');
    addNewPlantButton = document.getElementById('addNewPlantButton');
    newPlantCard = document.getElementById('newPlantCard');
    saveNewPlantButton = document.getElementById('saveNewPlantButton'); 
    cancelNewPlantButton = document.getElementById('cancelNewPlantButton'); 
    categoryFilter = document.getElementById('categoryFilter');
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    toggleMyGardenButton = document.getElementById('toggleMyGarden');
    giardinoTitle = document.getElementById('giardinoTitle');
    startLightSensorButton = document.getElementById('startLightSensorButton'); 
    stopLightSensorButton = document.getElementById('stopLightSensorButton'); 
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback');

    // Assicurati che questi ID siano corretti nel tuo HTML per i form di aggiunta/aggiornamento
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

    // Questi sono figli di plantsSection, ma vanno inizializzati comunque
    gardenContainer = document.getElementById('garden-container'); 
    myGardenContainer = document.getElementById('my-garden'); 
    
    loadingSpinner = document.getElementById('loading-spinner'); 
    toastContainer = document.getElementById('toast-container'); 

    isDomReady = true; // Imposta la flag a TRUE DOPO che tutti gli elementi DOM sono stati inizializzati

    initializeModal(); // Inizializza la modal

     // Listener geolocalizzazione.Assicurati che questi elementi esistano nel tuo HTML prima di tentarne l'accesso
    if (!getClimateButton || !locationStatusDiv || !climateZoneFilter) {
        console.error("Errore: Elementi HTML per geolocalizzazione non trovati! Assicurati che gli ID 'get-climate-button', 'location-status' e 'climate-zone-filter' siano presenti nel tuo HTML.");
        // Potresti voler terminare l'esecuzione qui o gestire l'errore in altro modo
        return;
    }
    getClimateButton.addEventListener('click', getLocation);

    // --- LISTENER GENERALI (NON DIPENDENTI DAL CLICK SU CARD) ---
    // Listener per i bottoni di login/registrazione
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    
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

    // Listener per il cambio di ordinamento
    if (sortBySelect) {
        sortBySelect.addEventListener('change', () => {
            currentSortBy = sortBySelect.value; 
            applyFilters(); 
        });
    }

   
    // Listener per i bottoni del form di aggiornamento
    if (saveUpdatedPlantButton) {
        saveUpdatedPlantButton.addEventListener('click', async () => {
            if (currentPlantIdToUpdate) {
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
                if (!validateField(updatePlantDescriptionInput, errorUpdatePlantDescription, 'La descrizione è obbligatoria.')) formIsValid = false;
                if (!validateField(updatePlantCategoryInput, errorUpdatePlantCategory, 'La categoria è obbligatoria.')) formIsValid = false;
                if (!validateField(updatePlantImageURLInput, errorUpdatePlantImageURL, 'L\'URL immagine è obbligatorio e deve essere valido.')) formIsValid = false;

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


    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);
    
    // --- LISTENER PER I CONTENITORI DELLE CARD (GALLERIA E MIO GIARDINO) ---
    if (gardenContainer) {
        gardenContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('plant-icon')) { return; }
            
            if (event.target.classList.contains('add-to-garden-button')) {
                const plantId = event.target.dataset.plantId;
                const user = firebase.auth().currentUser; 
                if (user) { await addToMyGarden(plantId); } // UID non necessario qui
                else { showToast("Devi essere autenticato per aggiungere piante al tuo giardino.", 'info'); }
            } else if (event.target.classList.contains('remove-button')) {
                const plantIdToRemove = event.target.dataset.plantId;
                const user = firebase.auth().currentUser; 
                if (user) { await removeFromMyGarden(plantIdToRemove); } // UID non necessario qui
                else { showToast("Devi essere autenticato per rimuovere piante dal tuo giardino.", 'info'); }
            } else if (event.target.classList.contains('update-plant-button')) {
                const plantIdToUpdate = event.target.dataset.plantId;
                const plantToUpdate = allPlants.find(p => p.id === plantIdToUpdate);
                if (plantToUpdate) { showUpdatePlantForm(plantToUpdate); } 
                else { showToast(`Pianta con ID ${plantIdToUpdate} non trovata per l'aggiornamento.`, 'error'); }
            } else if (event.target.classList.contains('delete-plant-from-db-button')) { 
                const plantIdToDelete = event.target.dataset.plantId;
                showToast('Eliminazione pianta in corso...', 'info'); 
                await deletePlantFromDatabase(plantIdToDelete); 
            }
        });
    }

    if (myGardenContainer) {
        myGardenContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('plant-icon')) { return; }

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

    // --- CONFIGURAZIONE INIZIALE UI DOPO DOMContentLoaded ---
    // Questa chiamata assicura che l'UI venga configurata correttamente
    // con lo stato di autenticazione corrente solo DOPO che il DOM è pronto.
    await handleAuthAndUI(firebase.auth().currentUser);
});
;
