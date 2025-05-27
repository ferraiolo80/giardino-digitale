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
let toastContainer;

// Variabile per la geolocalizzazione
let userLocation = null;
let detectedClimateZone = null;

// DICHIARAZIONI DELLE VARIABILI DOM GLOBALI (MA NON INIZIALIZZATE QUI)
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
let newPlantCard;
let saveNewPlantButton;
let cancelNewPlantButton;
let categoryFilter; // Questo ID non corrisponde all'HTML (HTML usa plant-type-filter, light-filter, water-filter)
                     // Per ora, assumo che 'categoryFilter' sia usato per 'plant-type-filter' o un concetto generale
let tempMinFilter; // Questo ID non esiste nell'HTML fornito
let tempMaxFilter; // Questo ID non esiste nell'HTML fornito
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

// Variabili per i messaggi di errore dei form di autenticazione
let loginErrorDiv;
let registerErrorDiv;

// NUOVE VARIABILI DOM GLOBALI per la geolocalizzazione e il filtro clima
let getLocationButton;
let locationStatusDiv;
let climateZoneFilter; // Corrisponde a id="climate-zone-filter" in HTML

// Variabili DOM per i campi zona climatica nei form
let newPlantClimateZoneInput;
let updatePlantClimateZoneInput;

// Variabili DOM per i filtri specifici da HTML
let plantTypeFilter;
let lightFilter;
let waterFilter;


// --- FUNZIONI UI / HELPER PER LO SPINNER ---
function showSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex';
    }
}

function hideSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

// --- FUNZIONI UI / HELPER PER LA VALIDAZIONE ---
function clearFormValidationErrors(formContainer) {
    if (!formContainer) return;
    formContainer.querySelectorAll('input, select, textarea').forEach(input => {
        input.classList.remove('invalid');
    });
    formContainer.querySelectorAll('.error-message').forEach(errorSpan => {
        errorSpan.classList.remove('active');
        errorSpan.textContent = '';
    });
}

function validateField(inputElement, errorSpan, errorMessage) {
    if (!inputElement || !errorSpan) return true;

    inputElement.classList.remove('invalid');
    errorSpan.classList.remove('active');
    errorSpan.textContent = '';

    let isValid = true;
    if (!inputElement.checkValidity()) {
        isValid = false;
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

    if (inputElement.type === 'number' && isNaN(parseInt(inputElement.value)) && inputElement.required) {
        isValid = false;
        errorSpan.textContent = 'Inserisci un numero valido.';
    }

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

// --- FUNZIONE PER I TOAST MESSAGES ---
function showToast(message, type = 'info') {
    if (!toastContainer) {
        console.error("Toast container non trovato!");
        alert(message);
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast-message', type);

    let iconHtml = '';
    switch (type) {
        case 'success': iconHtml = '<i class="fas fa-check-circle"></i>'; break;
        case 'error': iconHtml = '<i class="fas fa-times-circle"></i>'; break;
        case 'info': iconHtml = '<i class="fas fa-info-circle"></i>'; break;
        default: iconHtml = '';
    }

    toast.innerHTML = `${iconHtml}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => {
            toast.remove();
        }, { once: true });
    }, 3000);
}

// --- FUNZIONI GEOLOCALIZZAZIONE E CLIMA ---
async function getUserLocation() {
    if ("geolocation" in navigator) {
        if (locationStatusDiv) locationStatusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ricerca posizione...';
        if (getLocationButton) getLocationButton.disabled = true;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                console.log("Posizione ottenuta:", userLocation);

                detectedClimateZone = deduceClimateZone(userLocation.latitude);
                if (locationStatusDiv) locationStatusDiv.innerHTML = `<i class="fas fa-cloud-sun"></i> Clima rilevato: ${detectedClimateZone || 'Sconosciuto'}`;

                if (climateZoneFilter && detectedClimateZone) {
                    climateZoneFilter.value = detectedClimateZone;
                } else if (climateZoneFilter) {
                    climateZoneFilter.value = ''; // Se sconosciuto, resetta a "Tutti i Climi"
                }
                
                if (getLocationButton) getLocationButton.disabled = false;
                applyFilters();
            },
            (error) => {
                console.error("Errore geolocalizzazione:", error);
                if (getLocationButton) getLocationButton.disabled = false;
                let errorMessage = "Errore geolocalizzazione.";
                switch (error.code) {
                    case error.PERMISSION_DENIED: errorMessage = "Accesso alla posizione negato."; break;
                    case error.POSITION_UNAVAILABLE: errorMessage = "Posizione non disponibile."; break;
                    case error.TIMEOUT: errorMessage = "Richiesta posizione scaduta."; break;
                }
                if (locationStatusDiv) locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errorMessage}`;
                userLocation = null;
                detectedClimateZone = null;
                if (climateZoneFilter) climateZoneFilter.value = '';
                applyFilters();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        if (locationStatusDiv) locationStatusDiv.innerHTML = '<i class="fas fa-ban"></i> Geolocalizzazione non supportata.';
        console.log("Geolocalizzazione non supportata.");
        if (getLocationButton) getLocationButton.disabled = false;
    }
}

function deduceClimateZone(latitude) {
    const absLat = Math.abs(latitude);

    if (absLat <= 23.5) {
        return 'Tropicale';
    } else if (absLat <= 40) {
        // Per il Mediterraneo, consideriamo anche la longitudine se disponibile
        if (userLocation && userLocation.longitude >= -10 && userLocation.longitude <= 40 && latitude > 30 && latitude < 48) { // Range più specifico per il Mediterraneo
            return 'Mediterraneo';
        }
        return 'Subtropicale';
    } else if (absLat <= 60) {
         if (userLocation && userLocation.longitude >= -10 && userLocation.longitude <= 40 && latitude > 30 && latitude < 48) { // Copre anche parti del Mediterraneo in questa fascia
            return 'Mediterraneo';
        }
        return 'Temperato';
    } else if (absLat > 60) {
        return 'Boreale/Artico'; // Considera di allineare con opzioni HTML (es. "Arido" o aggiungi "Boreale")
    } else {
        return 'Sconosciuto';
    }
}


// --- FUNZIONI DI AUTENTICAZIONE ---
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
    const emailInput = document.getElementById('register-email'); // Corretto da 'registerEmail'
    const passwordInput = document.getElementById('register-password'); // Corretto da 'registerPassword'
    // L'HTML non ha 'register-confirm-password', quindi lo rimuovo per ora. Se lo aggiungi, decommenta.
    // const confirmPasswordInput = document.getElementById('register-confirm-password'); 
    if (!registerErrorDiv) {
        console.error("Elemento register-error non trovato.");
        showToast('Errore interno: elemento errore registrazione non trovato.', 'error');
        return;
    }

    if (emailInput && passwordInput) { // Rimosso confirmPasswordInput dalla condizione
        const email = emailInput.value;
        const password = passwordInput.value;
        // const confirmPassword = confirmPasswordInput.value; // Decommenta se aggiungi il campo
        registerErrorDiv.innerText = '';

        // if (password !== confirmPassword) { // Decommenta se aggiungi il campo conferma password
        //     registerErrorDiv.innerText = "Le password non corrispondono.";
        //     showToast('Le password non corrispondono.', 'error');
        //     return;
        // }

        showSpinner();
        try {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            showToast('Registrazione effettuata con successo!', 'success');
        } catch (error) {
            registerErrorDiv.innerText = error.message;
            showToast(`Errore registrazione: ${error.message}`, 'error');
        } finally {
            hideSpinner();
        }
    } else {
        showToast('Errore interno: elementi registrazione non trovati.', 'error');
    }
}

async function handleLogout() {
    showSpinner();
    try {
        await firebase.auth().signOut();
        showToast('Logout effettuato con successo.', 'info');
    } catch (error) {
        showToast(`Errore logout: ${error.message}`, 'error');
    } finally {
        hideSpinner();
    }
}

// --- FUNZIONE PER INIZIALIZZARE/RESETTARE LA MODAL ---
function initializeModal() {
    if (!imageModal) imageModal = document.getElementById('image-modal');
    if (!imageModal) return; // Se non esiste la modal esci

    imageModal.innerHTML = '';
    imageModal.style.display = 'none';

    const newCloseButton = document.createElement('span');
    newCloseButton.classList.add('close-button');
    newCloseButton.innerHTML = '&times;';
    newCloseButton.onclick = () => { // Semplificato l'event listener
        imageModal.style.display = 'none';
        initializeModal();
    };
    imageModal.appendChild(newCloseButton);
    closeButton = newCloseButton;

    const newZoomedImage = document.createElement('img');
    newZoomedImage.classList.add('modal-content');
    newZoomedImage.id = 'zoomed-image';
    imageModal.appendChild(newZoomedImage);
    zoomedImage = newZoomedImage;

    imageModal.onclick = (event) => { // Semplificato l'event listener
        if (event.target === imageModal) {
            imageModal.style.display = 'none';
            initializeModal();
        }
    };
}


// --- FUNZIONI DI RENDERING E GESTIONE DELLE CARD ---
function createPlantCard(plantData, isMyGardenCard = false) {
    const image = plantData.image || 'plant_9215709.png';
    const div = document.createElement("div");
    div.className = isMyGardenCard ? "my-plant-card" : "plant-card";
    div.dataset.id = plantData.id;

    let buttonsHtml = '';
    const user = firebase.auth().currentUser;
    const isAdminUser = () => user && user.email === 'ferraiolo80@hotmail.it'; // Verifica utente prima di accedere a email

    if (user) {
        if (isMyGardenCard) {
            buttonsHtml += `<button class="remove-button btn-warning" data-plant-id="${plantData.id}"><i class="fas fa-minus-circle"></i> Rimuovi</button>`; // Aggiunte classi btn
            buttonsHtml += `<button class="update-plant-button btn-info" data-plant-id="${plantData.id}"><i class="fas fa-edit"></i> Aggiorna</button>`;
        } else {
            if (myGarden.includes(plantData.id)) {
                buttonsHtml += `<button class="remove-button btn-warning" data-plant-id="${plantData.id}"><i class="fas fa-minus-circle"></i> Rimuovi</button>`;
            } else {
                buttonsHtml += `<button class="add-to-garden-button btn-success" data-plant-id="${plantData.id}"><i class="fas fa-plus-circle"></i> Aggiungi</button>`;
            }
            buttonsHtml += `<button class="update-plant-button btn-info" data-plant-id="${plantData.id}"><i class="fas fa-edit"></i> Aggiorna</button>`;
            if (isAdminUser()) {
                buttonsHtml += `<button class="delete-plant-from-db-button btn-danger" data-plant-id="${plantData.id}"><i class="fas fa-trash-alt"></i> Elimina DB</button>`;
            }
        }
    }

    div.innerHTML = `
        <img src="${image}" alt="${plantData.name}" class="plant-icon">
        <h4>${plantData.name}</h4>
        <p><i class="fas fa-sun"></i> Luce: ${plantData.sunlight || 'N/A'}</p>
        <p><i class="fas fa-tint"></i> Acqua: ${plantData.watering || 'N/A'}</p>
        <p><i class="fas fa-thermometer-half"></i> Temp. Min: ${plantData.tempMin != null ? plantData.tempMin + '°C' : 'N/A'}</p>
        <p><i class="fas fa-thermometer-half"></i> Temp. Max: ${plantData.tempMax != null ? plantData.tempMax + '°C' : 'N/A'}</p>
        <p><i class="fas fa-tags"></i> Categoria: ${plantData.category || 'N/A'}</p>
        <p><i class="fas fa-globe-europe"></i> Clima: ${plantData.climateZone || 'N/A'}</p> ${(plantData.idealLuxMin != null && plantData.idealLuxMax != null) ? `<p><i class="fas fa-lightbulb"></i> Lux Ideali: ${plantData.idealLuxMin} - ${plantData.idealLuxMax} Lux</p>` : ''}
        <div class="card-actions">${buttonsHtml}</div>
    `;

    const plantImageElement = div.querySelector('.plant-icon');
    if (plantImageElement) {
        plantImageElement.addEventListener('click', (event) => {
            event.stopPropagation();
            if (imageModal && zoomedImage) {
                initializeModal();
                zoomedImage.src = image;
                zoomedImage.style.display = 'block'; // Assicura che l'immagine sia visibile
                const modalPlantDetails = document.getElementById('modal-plant-details');
                if(modalPlantDetails) modalPlantDetails.style.display = 'none'; // Nascondi dettagli pianta se presenti
                imageModal.style.display = 'flex';
            }
        });
    }

    div.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON' || event.target.classList.contains('plant-icon') || event.target.closest('button')) {
            return;
        }
        if (imageModal) {
            initializeModal();
            const clonedCard = div.cloneNode(true);
            clonedCard.querySelectorAll('button').forEach(button => button.remove());
            clonedCard.classList.remove('plant-card', 'my-plant-card');
            clonedCard.classList.add('modal-card-content'); // Per lo stile della card nella modal
            
            const modalPlantDetails = document.getElementById('modal-plant-details'); // Usa il div dedicato
            if (modalPlantDetails) {
                modalPlantDetails.innerHTML = ''; // Pulisci
                modalPlantDetails.appendChild(clonedCard); // Aggiungi la card clonata
                modalPlantDetails.style.display = 'block'; // Mostra i dettagli
            }
            
            if(zoomedImage) zoomedImage.style.display = 'none'; // Nascondi l'immagine zoomata
            imageModal.style.display = 'flex';
        }
    });

    return div;
}

function renderPlants(plantArray) {
    if (!gardenContainer) return;
    gardenContainer.innerHTML = "";
    plantArray.forEach((plant) => {
        const plantCard = createPlantCard(plant, false);
        gardenContainer.appendChild(plantCard);
    });
}

function renderMyGarden(plantsToDisplay) {
    if (!myGardenContainer || !emptyGardenMessage) return;
    myGardenContainer.innerHTML = '';

    if (plantsToDisplay.length === 0) {
        emptyGardenMessage.style.display = 'block';
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
    // showSpinner(); // Rimosso per evitare sfarfallio su ogni input, considera di metterlo solo per azioni lunghe
    
    // Leggi i valori dai filtri corretti basati sull'HTML
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const type = plantTypeFilter ? plantTypeFilter.value : ""; // Filtro per tipo di pianta
    const light = lightFilter ? lightFilter.value : "";       // Filtro per luce
    const water = waterFilter ? waterFilter.value : "";       // Filtro per acqua
    const selectedClimate = climateZoneFilter ? climateZoneFilter.value : ""; // Filtro per zona climatica

    // Nota: tempMinFilter e tempMaxFilter non sono nell'HTML fornito.
    // La variabile 'categoryFilter' del vecchio codice non corrisponde a un ID univoco nell'HTML attuale.
    // Ho usato plantTypeFilter, lightFilter, waterFilter basandomi sugli ID dell'HTML.
    // Se 'category' era un campo generico, dovrai aggiungerlo ai dati della pianta e all'HTML.

    let plantsToFilter;
    if (isMyGardenCurrentlyVisible) {
        plantsToFilter = allPlants.filter(plant => myGarden.includes(plant.id));
    } else {
        plantsToFilter = allPlants;
    }

    let filteredPlants = plantsToFilter.filter(plant => {
        const matchesSearch = searchTerm === '' || plant.name.toLowerCase().includes(searchTerm) ||
                              (plant.description && plant.description.toLowerCase().includes(searchTerm));
        
        // Filtri basati sui campi della pianta (assicurati che i tuoi dati pianta abbiano 'type', 'sunlight', 'watering', 'climateZone')
        const matchesType = type === '' || (plant.type && plant.type === type); // Assumendo che plant.type esista
        const matchesLight = light === '' || (plant.sunlight && plant.sunlight === light); // plant.sunlight è già usato
        const matchesWater = water === '' || (plant.watering && plant.watering === water); // plant.watering è già usato
        const matchesClimateZone = selectedClimate === '' || (plant.climateZone && plant.climateZone === selectedClimate);

        // I filtri tempMin/tempMax non sono implementati perché mancano gli input HTML e i campi plant.tempMin/Max non sono usati qui
        // Se li vuoi, aggiungi gli input HTML e decommenta/adatta:
        // const tempMin = tempMinFilter ? parseFloat(tempMinFilter.value) : NaN;
        // const tempMax = tempMaxFilter ? parseFloat(tempMaxFilter.value) : NaN;
        // const matchesTempMin = isNaN(tempMin) || (plant.tempMin != null && plant.tempMin >= tempMin);
        // const matchesTempMax = isNaN(tempMax) || (plant.tempMax != null && plant.tempMax <= tempMax);

        return matchesSearch && matchesType && matchesLight && matchesWater && matchesClimateZone; // Aggiunti nuovi filtri
    });

    filteredPlants.sort((a, b) => {
        const [field, order] = currentSortBy.split('_');
        let valA, valB;

        switch (field) {
            case 'name':
            case 'category': // Se usi 'category' come campo di ordinamento
            case 'type':     // O 'type'
            case 'climateZone':
                const actualSortField = field === 'category' ? (plantTypeFilter ? 'type' : 'category') : field; // Adatta se necessario
                valA = a[actualSortField] ? String(a[actualSortField]).toLowerCase() : '';
                valB = b[actualSortField] ? String(b[actualSortField]).toLowerCase() : '';
                break;
            case 'tempMin':
            case 'tempMax':
            case 'luxMin':
            case 'luxMax':
                const actualNumField = field.startsWith('temp') ? field : 'ideal' + field.charAt(0).toUpperCase() + field.slice(1);
                valA = a[actualNumField] != null ? a[actualNumField] : (order === 'asc' ? -Infinity : Infinity);
                valB = b[actualNumField] != null ? b[actualNumField] : (order === 'asc' ? -Infinity : Infinity);
                break;
            case 'last_modified_desc': // Esempio se avessi un campo timestamp
                 // valA = a.timestamp || 0; // Assumendo che 'timestamp' sia il campo
                 // valB = b.timestamp || 0; // Firebase può fornire timestamp di modifica
                 // Implementazione specifica necessaria se vuoi questo ordinamento
                return (b.timestamp || 0) - (a.timestamp || 0); // Per discendente
            default: // Default a nome
                valA = a.name ? a.name.toLowerCase() : '';
                valB = b.name ? b.name.toLowerCase() : '';
        }

        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
    });

    if (isMyGardenCurrentlyVisible) {
        renderMyGarden(filteredPlants);
    } else {
        renderPlants(filteredPlants);
    }
    // hideSpinner(); // Se lo attivi sopra
}


// --- FUNZIONI DI AGGIORNAMENTO E CANCELLAZIONE PIANTE ---
function showUpdatePlantForm(plant) {
    if (!updatePlantCard) return;
    clearFormValidationErrors(updatePlantCard);

    currentPlantIdToUpdate = plant.id;
    // I nomi ID nel JS devono corrispondere a quelli nell'HTML (es. update-plant-name)
    document.getElementById('update-plant-id').value = plant.id; // Questo è un hidden input
    document.getElementById('update-plant-name').value = plant.name || '';
    document.getElementById('update-plant-description').value = plant.description || '';
    if (document.getElementById('update-plant-type')) document.getElementById('update-plant-type').value = plant.type || '';
    if (document.getElementById('update-plant-light')) document.getElementById('update-plant-light').value = plant.sunlight || '';
    if (document.getElementById('update-plant-water')) document.getElementById('update-plant-water').value = plant.watering || '';
    if (updatePlantClimateZoneInput) updatePlantClimateZoneInput.value = plant.climateZone || ''; // AGGIUNTO
    if (document.getElementById('update-plant-image-url')) document.getElementById('update-plant-image-url').value = plant.image || '';
    if (document.getElementById('update-plant-notes')) document.getElementById('update-plant-notes').value = plant.notes || '';
    
    // Campi Lux e Temp Min/Max non presenti nei form HTML forniti per update, ma presenti nel vecchio JS
    // Se li aggiungi all'HTML, decommenta e adatta gli ID:
    // if (updatePlantIdealLuxMinInput) updatePlantIdealLuxMinInput.value = plant.idealLuxMin || '';
    // if (updatePlantIdealLuxMaxInput) updatePlantIdealLuxMaxInput.value = plant.idealLuxMax || '';
    // document.getElementById('updatePlantTempMin').value = plant.tempMin || ''; (ID da HTML)
    // document.getElementById('updatePlantTempMax').value = plant.tempMax || ''; (ID da HTML)


    updatePlantCard.style.display = 'block';
    updatePlantCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearUpdatePlantForm() {
    if (!updatePlantCard) return; // Assicurati che updatePlantCard esista
    currentPlantIdToUpdate = null;
    document.getElementById('update-plant-id').value = '';
    document.getElementById('update-plant-name').value = '';
    document.getElementById('update-plant-description').value = '';
    if (document.getElementById('update-plant-type')) document.getElementById('update-plant-type').value = '';
    if (document.getElementById('update-plant-light')) document.getElementById('update-plant-light').value = '';
    if (document.getElementById('update-plant-water')) document.getElementById('update-plant-water').value = '';
    if (updatePlantClimateZoneInput) updatePlantClimateZoneInput.value = ''; // AGGIUNTO
    if (document.getElementById('update-plant-image-url')) document.getElementById('update-plant-image-url').value = '';
    if (document.getElementById('update-plant-notes')) document.getElementById('update-plant-notes').value = '';

    // if (updatePlantIdealLuxMinInput) updatePlantIdealLuxMinInput.value = ''; 
    // if (updatePlantIdealLuxMaxInput) updatePlantIdealLuxMaxInput.value = ''; 

    clearFormValidationErrors(updatePlantCard);
}

async function updatePlantInFirebase(plantId, updatedData) {
    showSpinner();
    try {
        await db.collection('plants').doc(plantId).update(updatedData);
        showToast('Pianta aggiornata con successo!', 'success');
        await loadPlantsFromFirebase();
        await loadMyGardenFromFirebase();
        applyFilters();
        if (updatePlantCard) updatePlantCard.style.display = 'none';
        clearUpdatePlantForm(); // Pulisci il form dopo il successo
    } catch (error) {
        showToast(`Errore nell'aggiornamento: ${error.message}`, 'error');
    } finally {
        hideSpinner();
    }
}

async function deletePlantFromDatabase(plantId) {
    if (!confirm(`Sei sicuro di voler eliminare definitivamente questa pianta?`)) return;
    showSpinner();
    try {
        await db.collection('plants').doc(plantId).delete();
        showToast('Pianta eliminata con successo dal database!', 'success');
        // Rimuovi anche dal giardino locale se presente
        myGarden = myGarden.filter(id => id !== plantId);
        await saveMyGardenToFirebase(myGarden); // Salva il giardino aggiornato

        await loadPlantsFromFirebase(); // Ricarica tutte le piante
        // loadMyGardenFromFirebase() è già chiamato da saveMyGardenToFirebase implicitamente o non serve se gestito sopra
        applyFilters();
        if (updatePlantCard && document.getElementById('update-plant-id').value === plantId) {
            updatePlantCard.style.display = 'none'; // Nascondi form modifica se la pianta eliminata era in modifica
            clearUpdatePlantForm();
        }
    } catch (error) {
        showToast(`Errore nell'eliminazione: ${error.message}`, 'error');
    } finally {
        hideSpinner();
    }
}

// --- FUNZIONI DI GESTIONE DEL GIARDINO (Aggiungi/Rimuovi) ---
async function addToMyGarden(plantId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per aggiungere piante.", 'info');
        return;
    }
    showSpinner();
    try {
        if (!myGarden.includes(plantId)) {
            myGarden.push(plantId);
            await saveMyGardenToFirebase(myGarden);
            applyFilters(); // Aggiorna UI per mostrare il bottone "Rimuovi"
            showToast('Pianta aggiunta al tuo giardino!', 'success');
        } else {
            showToast('Questa pianta è già nel tuo giardino.', 'info');
        }
    } catch (error) {
        showToast(`Errore aggiunta al giardino: ${error.message}`, 'error');
    } finally {
        hideSpinner();
    }
}

async function removeFromMyGarden(plantIdToRemove) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per rimuovere piante.", 'info');
        return;
    }
    showSpinner();
    try {
        const initialGardenSize = myGarden.length;
        myGarden = myGarden.filter(plantId => plantId !== plantIdToRemove);
        if (myGarden.length < initialGardenSize) {
            await saveMyGardenToFirebase(myGarden);
            applyFilters(); // Aggiorna UI, soprattutto se in vista "Il Mio Giardino"
            showToast('Pianta rimossa dal tuo giardino.', 'success');
        } else {
            showToast('Pianta non trovata nel giardino.', 'info');
        }
    } catch (error) {
        showToast(`Errore rimozione dal giardino: ${error.message}`, 'error');
    } finally {
        hideSpinner();
    }
}

// --- FUNZIONI DI SALVATAGGIO/CARICAMENTO DATI DA FIREBASE ---
async function saveNewPlantToFirebase() {
    // Validazione (esempio, da estendere con validateField e error spans se necessario)
    const name = document.getElementById('new-plant-name').value;
    if (!name) {
        showToast('Il nome della pianta è obbligatorio.', 'error');
        return; // Interrompi se la validazione fallisce
    }
    // Aggiungi qui altre validazioni per i campi obbligatori.
    // Per semplicità, qui la validazione è minima.
    // Usa clearFormValidationErrors e validateField per una validazione completa come in update.

    showSpinner();
    try {
        const plantData = {
            name: document.getElementById('new-plant-name').value,
            description: document.getElementById('new-plant-description').value,
            type: document.getElementById('new-plant-type').value, // Assumendo che 'type' sia il campo corretto
            sunlight: document.getElementById('new-plant-light').value, // Corrisponde a 'sunlight' in createPlantCard
            watering: document.getElementById('new-plant-water').value, // Corrisponde a 'watering' in createPlantCard
            climateZone: newPlantClimateZoneInput ? newPlantClimateZoneInput.value : "", // AGGIUNTO
            image: document.getElementById('new-plant-image-url').value,
            notes: document.getElementById('new-plant-notes').value,
            // I campi Lux e Temp Min/Max non sono nel form HTML fornito.
            // Se li aggiungi, recupera i valori qui. Esempio:
            // idealLuxMin: newPlantIdealLuxMinInput ? parseInt(newPlantIdealLuxMinInput.value) : null,
            // idealLuxMax: newPlantIdealLuxMaxInput ? parseInt(newPlantIdealLuxMaxInput.value) : null,
            // tempMin: document.getElementById('newPlantTempMin') ? parseInt(document.getElementById('newPlantTempMin').value) : null, // ID da HTML
            // tempMax: document.getElementById('newPlantTempMax') ? parseInt(document.getElementById('newPlantTempMax').value) : null, // ID da HTML
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // Per ordinamento "Recenti"
        };

        const docRef = await db.collection('plants').add(plantData);
        showToast('Nuova pianta aggiunta con successo!', 'success');
        if (newPlantCard) newPlantCard.style.display = 'none';
        clearNewPlantForm();
        await loadPlantsFromFirebase();
        applyFilters();
    } catch (error) {
        showToast(`Errore aggiunta pianta: ${error.message}`, 'error');
    } finally {
        hideSpinner();
    }
}

function clearNewPlantForm() {
    if (!newPlantCard) return; // Assicurati che newPlantCard esista
    document.getElementById('new-plant-name').value = '';
    document.getElementById('new-plant-description').value = '';
    if (document.getElementById('new-plant-type')) document.getElementById('new-plant-type').value = '';
    if (document.getElementById('new-plant-light')) document.getElementById('new-plant-light').value = '';
    if (document.getElementById('new-plant-water')) document.getElementById('new-plant-water').value = '';
    if (newPlantClimateZoneInput) newPlantClimateZoneInput.value = ''; // AGGIUNTO
    if (document.getElementById('new-plant-image-url')) document.getElementById('new-plant-image-url').value = '';
    if (document.getElementById('new-plant-notes')) document.getElementById('new-plant-notes').value = '';
    
    // if (newPlantIdealLuxMinInput) newPlantIdealLuxMinInput.value = '';
    // if (newPlantIdealLuxMaxInput) newPlantIdealLuxMaxInput.value = '';

    clearFormValidationErrors(newPlantCard);
}

async function loadMyGardenFromFirebase() {
    showSpinner();
    const user = firebase.auth().currentUser;
    if (!user) {
        myGarden = [];
        hideSpinner();
        return;
    }
    try {
        const doc = await db.collection('gardens').doc(user.uid).get();
        myGarden = doc.exists ? (doc.data().plantIds || []) : [];
    } catch (error) {
        myGarden = [];
        showToast(`Errore caricamento giardino: ${error.message}`, 'error');
    } finally {
        hideSpinner();
    }
}

async function saveMyGardenToFirebase(gardenArray) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Nessun utente autenticato per salvare il giardino.", 'info');
        return;
    }
    // Non mostrare spinner qui, potrebbe essere chiamato frequentemente
    try {
        await db.collection('gardens').doc(user.uid).set({ plantIds: gardenArray });
    } catch (error) {
        showToast(`Errore salvataggio giardino: ${error.message}`, 'error');
    }
}

async function loadPlantsFromFirebase() {
    showSpinner();
    try {
        const plantsSnapshot = await db.collection('plants').get();
        allPlants = plantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        showToast(`Errore caricamento piante: ${error.message}`, 'error');
    } finally {
        hideSpinner();
    }
}

// --- FUNZIONI DI VISIBILITÀ UI ---
async function updateGardenVisibility(showMyGarden) {
    if (!plantsSection || !gardenContainer || !myGardenContainer || !giardinoTitle || !toggleMyGardenButton || !emptyGardenMessage) {
        showToast('Errore UI: elementi non trovati.', 'error');
        return;
    }

    const user = firebase.auth().currentUser;
    isMyGardenCurrentlyVisible = showMyGarden;

    if (user) {
        toggleMyGardenButton.style.display = 'inline-block'; // o 'block'
        addNewPlantButton.style.display = 'inline-block'; // Mostra "Aggiungi Nuova Pianta" se loggato (admin potrebbe avere più controlli)
        // L'admin check per addNewPlantButton può essere fatto qui o dove viene creato
        const isAdmin = user.email === 'ferraiolo80@hotmail.it';
        addNewPlantButton.style.display = isAdmin ? 'inline-block' : 'none';


        if (showMyGarden) {
            toggleMyGardenButton.innerHTML = '<i class="fas fa-seedling"></i> Tutte le Piante';
            giardinoTitle.textContent = 'Il Mio Giardino';
            document.getElementById('my-garden-section').style.display = 'block';
            document.getElementById('plants-section').style.display = 'none'; // Nasconde la sezione "Tutte le piante"
        } else {
            toggleMyGardenButton.innerHTML = '<i class="fas fa-leaf"></i> Il Mio Giardino';
            giardinoTitle.textContent = 'Tutte le Piante'; // Titolo per la vista di tutte le piante
            document.getElementById('my-garden-section').style.display = 'none';
            document.getElementById('plants-section').style.display = 'block';
        }
    } else { // Utente non loggato
        toggleMyGardenButton.style.display = 'none';
        addNewPlantButton.style.display = 'none';
        giardinoTitle.textContent = 'Tutte le Piante';
        document.getElementById('my-garden-section').style.display = 'none';
        document.getElementById('plants-section').style.display = 'block';
        isMyGardenCurrentlyVisible = false; // Forza la vista di tutte le piante
    }
    applyFilters();
}

function handleToggleMyGarden() {
    updateGardenVisibility(!isMyGardenCurrentlyVisible);
}

// --- FUNZIONI SENSORE DI LUCE (NON MODIFICATE, MA VERIFICARE SUPPORT E PERMESSI HTTPS) ---
async function startLightSensor() {
    showSpinner();
    if ('AmbientLightSensor' in window) {
        try {
            // Richiedi permesso prima
            const { state } = await navigator.permissions.query({ name: 'ambient-light-sensor' });
            if (state === 'denied') {
                showToast('Permesso per il sensore di luce negato.', 'error');
                lightFeedbackDiv.innerHTML = `<p style="color: red;">Permesso per il sensore di luce negato. Abilita i permessi nelle impostazioni del browser.</p>`;
                hideSpinner();
                return;
            }

            if (ambientLightSensor) ambientLightSensor.stop();
            ambientLightSensor = new AmbientLightSensor({frequency: 1}); // Lettura ogni secondo

            ambientLightSensor.onreading = () => {
                const lux = ambientLightSensor.illuminance;
                if (currentLuxValueSpan) currentLuxValueSpan.textContent = lux.toFixed(2);

                if (myGarden && myGarden.length > 0 && lux != null) {
                    let feedbackHtml = '<h4>Feedback Luce per il Mio Giardino:</h4><ul>';
                    const plantsInGarden = allPlants.filter(plant => myGarden.includes(plant.id));
                    plantsInGarden.forEach(plant => {
                        const minLux = plant.idealLuxMin;
                        const maxLux = plant.idealLuxMax;
                        if (minLux != null && maxLux != null) {
                            let feedbackMessage = `${plant.name}: `;
                            if (lux < minLux) feedbackMessage += `<span style="color: red;">Poca luce!</span>`;
                            else if (lux > maxLux) feedbackMessage += `<span style="color: orange;">Troppa luce!</span>`;
                            else feedbackMessage += `<span style="color: green;">Luce ideale!</span>`;
                            feedbackHtml += `<li>${feedbackMessage} (Richiede ${minLux}-${maxLux} Lux)</li>`;
                        } else {
                            feedbackHtml += `<li>${plant.name}: Dati Lux non disponibili.</li>`;
                        }
                    });
                    feedbackHtml += '</ul>';
                    if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = feedbackHtml;
                } else if (lightFeedbackDiv) {
                    lightFeedbackDiv.innerHTML = lux != null ? '<p>Nessuna pianta nel giardino con dati Lux, o giardino vuoto.</p>' : '<p>In attesa di lettura Lux...</p>';
                }
            };
            ambientLightSensor.onerror = (event) => {
                console.error("Errore sensore luce:", event.error.name, event.error.message);
                if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'Errore';
                if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p style="color: red;">Errore sensore: ${event.error.message}</p>`;
                showToast(`Errore sensore luce: ${event.error.message}`, 'error');
                stopLightSensor(); // Ferma il sensore in caso di errore
            };
            await ambientLightSensor.start();
            if (startLightSensorButton) startLightSensorButton.style.display = 'none';
            if (stopLightSensorButton) stopLightSensorButton.style.display = 'inline-block';
            if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = "Misurazione luce in corso...";
            showToast('Sensore luce avviato.', 'info');
        } catch (error) {
            console.error("Impossibile avviare sensore luce:", error);
            if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p style="color: red;">Impossibile avviare il sensore. Assicurati supporto e permessi (HTTPS richiesto). ${error.message}</p>`;
            if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'N/A';
            showToast(`Errore avvio sensore luce: ${error.message}`, 'error');
        } finally {
            hideSpinner();
        }
    } else {
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p style="color: orange;">Sensore luce non supportato.</p>';
        if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'N/A';
        showToast('Sensore luce non supportato dal dispositivo.', 'info');
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

// --- GESTIONE AUTENTICAZIONE E UI ---
async function handleAuthAndUI(user) {
    if (!isDomReady) return;

    if (user) {
        if (authStatusDiv) authStatusDiv.innerHTML = `<i class="fas fa-user-check"></i> ${user.email}`;
        if (appContentDiv) appContentDiv.style.display = 'block';
        if (authContainerDiv) authContainerDiv.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'inline-block';

        await loadPlantsFromFirebase();
        await loadMyGardenFromFirebase();
        
        // Decide se mostrare "Il Mio Giardino" o "Tutte le Piante" all'avvio dopo il login
        // Ad esempio, mostra "Il Mio Giardino" se non è vuoto, altrimenti "Tutte le Piante"
        const showMyGardenInitially = myGarden && myGarden.length > 0; 
        await updateGardenVisibility(showMyGardenInitially);

    } else { // Utente non loggato
        if (authStatusDiv) authStatusDiv.innerHTML = '<i class="fas fa-user-slash"></i> Non autenticato';
        if (appContentDiv) appContentDiv.style.display = 'none';
        if (authContainerDiv) authContainerDiv.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'none';

        myGarden = [];
        isMyGardenCurrentlyVisible = false; // Resetta la vista
        await loadPlantsFromFirebase(); // Carica comunque le piante per la visualizzazione pubblica
        await updateGardenVisibility(false); // Mostra "Tutte le piante"
    }
}

firebase.auth().onAuthStateChanged(async (user) => {
    if (!isDomReady) {
        // Metti in coda o attendi che DOM sia pronto, per ora usiamo un semplice flag
        // document.addEventListener('isDomReady', () => handleAuthAndUI(user), { once: true }); // Approccio alternativo
        return;
    }
    await handleAuthAndUI(user);
});

// --- DOMContentLoaded LISTENER ---
document.addEventListener('DOMContentLoaded', async () => {
    // Inizializzazione elementi DOM base
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    loginButton = document.getElementById('login-button'); // Corretto da 'loginButton' a 'login-button' come da HTML
    registerButton = document.getElementById('register-button'); // Corretto da 'registerButton' a 'register-button' come da HTML
    logoutButton = document.getElementById('logout-button'); // Corretto da 'logoutButton' a 'logout-button' come da HTML
    authStatusDiv = document.getElementById('auth-status');
    loginErrorDiv = document.getElementById('login-error'); // HTML non ha questo ID, assicurati che esista o aggiungilo
    registerErrorDiv = document.getElementById('register-error'); // HTML non ha questo ID, assicurati che esista o aggiungilo

    // Inizializzazione elementi DOM per i contenuti dell'app
    searchInput = document.getElementById('search-input'); // Corretto da 'searchInput'
    addNewPlantButton = document.getElementById('add-new-plant-button'); // Corretto da 'addNewPlantButton'
    newPlantCard = document.getElementById('newPlantCard'); // Questo è un div modal, non un bottone
    saveNewPlantButton = document.querySelector('#newPlantCard form button[type="submit"]'); // Bottone dentro il form
    // cancelNewPlantButton = document.querySelector('#newPlantCard .close-button'); // Già gestito da closeModal('newPlantCard')
    
    // Filtri (basati su ID HTML)
    plantTypeFilter = document.getElementById('plant-type-filter');
    lightFilter = document.getElementById('light-filter');
    waterFilter = document.getElementById('water-filter');
    climateZoneFilter = document.getElementById('climate-zone-filter'); // Già dichiarato
    
    toggleMyGardenButton = document.getElementById('toggle-my-garden-button'); // Corretto da 'toggleMyGarden'
    giardinoTitle = document.getElementById('giardino-title'); // Corretto da 'giardinoTitle'
    plantsSection = document.getElementById('plants-section'); // Contenitore di garden-container
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden');
    emptyGardenMessage = document.getElementById('empty-garden-message');
    sortBySelect = document.getElementById('sort-by'); // Corretto da 'sortBy'

    // Elementi per la modal di modifica
    updatePlantCard = document.getElementById('updatePlantCard');
    saveUpdatedPlantButton = document.querySelector('#updatePlantCard form button[type="submit"]');
    // cancelUpdatePlantButton = document.querySelector('#updatePlantCard .close-button'); // Già gestito da closeModal

    // Sensore di luce (IDs da HTML non presenti, se li aggiungi, decommenta)
    // startLightSensorButton = document.getElementById('startLightSensorButton'); 
    // stopLightSensorButton = document.getElementById('stopLightSensorButton'); 
    // currentLuxValueSpan = document.getElementById('currentLuxValue');
    // lightFeedbackDiv = document.getElementById('lightFeedback');
    
    // Geolocalizzazione
    getLocationButton = document.getElementById('get-location-button');
    locationStatusDiv = document.getElementById('location-status');

    // Form fields for climate zone
    newPlantClimateZoneInput = document.getElementById('new-plant-climate-zone');
    updatePlantClimateZoneInput = document.getElementById('update-plant-climate-zone');
    
    // Toast e Spinner
    toastContainer = document.getElementById('toast-container'); // Assicurati che esista in HTML
    loadingSpinner = document.getElementById('loading-spinner'); //Spinner globale
    
    isDomReady = true;
    // document.dispatchEvent(new Event('isDomReady')); // Approccio alternativo per onAuthStateChanged

    initializeModal(); // Per image-modal

    // --- Event Listener ---
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    if (addNewPlantButton) {
        addNewPlantButton.addEventListener('click', () => {
            if (newPlantCard) {
                clearNewPlantForm(); // Pulisci prima di mostrare
                newPlantCard.style.display = 'block';
            }
        });
    }
    if (saveNewPlantButton) saveNewPlantButton.addEventListener('click', (e) => {
        e.preventDefault(); // Previene submit del form tradizionale
        saveNewPlantToFirebase();
    });
    // La chiusura di newPlantCard è gestita da closeModal('newPlantCard') nell'HTML

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (plantTypeFilter) plantTypeFilter.addEventListener('change', applyFilters);
    if (lightFilter) lightFilter.addEventListener('change', applyFilters);
    if (waterFilter) waterFilter.addEventListener('change', applyFilters);
    if (climateZoneFilter) climateZoneFilter.addEventListener('change', applyFilters);
    if (sortBySelect) {
        sortBySelect.addEventListener('change', () => {
            currentSortBy = sortBySelect.value;
            applyFilters();
        });
    }

    if (toggleMyGardenButton) toggleMyGardenButton.addEventListener('click', handleToggleMyGarden);
    if (getLocationButton) getLocationButton.addEventListener('click', getUserLocation);

    if (saveUpdatedPlantButton) {
        saveUpdatedPlantButton.addEventListener('click', async (e) => {
            e.preventDefault(); // Previene submit del form tradizionale
            if (currentPlantIdToUpdate) {
                // Validazione (esempio, da estendere)
                const name = document.getElementById('update-plant-name').value;
                if (!name) {
                    showToast('Il nome della pianta è obbligatorio per l\'aggiornamento.', 'error');
                    return;
                }
                // Aggiungi altre validazioni qui

                const updatedData = {
                    name: document.getElementById('update-plant-name').value,
                    description: document.getElementById('update-plant-description').value,
                    type: document.getElementById('update-plant-type') ? document.getElementById('update-plant-type').value : undefined,
                    sunlight: document.getElementById('update-plant-light') ? document.getElementById('update-plant-light').value : undefined,
                    watering: document.getElementById('update-plant-water') ? document.getElementById('update-plant-water').value : undefined,
                    climateZone: updatePlantClimateZoneInput ? updatePlantClimateZoneInput.value : undefined, // AGGIUNTO
                    image: document.getElementById('update-plant-image-url') ? document.getElementById('update-plant-image-url').value : undefined,
                    notes: document.getElementById('update-plant-notes') ? document.getElementById('update-plant-notes').value : undefined,
                    // Aggiungi qui idealLuxMin/Max e tempMin/Max se presenti nel form di modifica
                    timestamp: firebase.firestore.FieldValue.serverTimestamp() // Aggiorna il timestamp
                };
                // Rimuovi i campi undefined per non sovrascrivere con null in Firebase se non forniti
                Object.keys(updatedData).forEach(key => updatedData[key] === undefined && delete updatedData[key]);

                await updatePlantInFirebase(currentPlantIdToUpdate, updatedData);
            }
        });
    }
    // La chiusura di updatePlantCard è gestita da closeModal('updatePlantCard') nell'HTML
    // Il bottone "Elimina" dentro updatePlantCard non è presente nell'HTML, se lo aggiungi, collega l'evento.

    // Event delegation per i bottoni sulle card
    function handleCardActions(event, container) {
        const target = event.target.closest('button'); // Trova il bottone cliccato, anche se si clicca sull'icona interna
        if (!target) return;

        const plantId = target.dataset.plantId;
        if (!plantId && !target.classList.contains('delete-plant-from-form-button')) return; // delete-plant-from-form-button non ha plantId

        const user = firebase.auth().currentUser;

        if (target.classList.contains('add-to-garden-button')) {
            if (user) addToMyGarden(plantId);
            else showToast("Devi essere autenticato.", 'info');
        } else if (target.classList.contains('remove-button')) {
            if (user) removeFromMyGarden(plantId);
            else showToast("Devi essere autenticato.", 'info');
        } else if (target.classList.contains('update-plant-button')) {
            if (user) { // Solo utenti loggati possono vedere il form di aggiornamento
                const plantToUpdate = allPlants.find(p => p.id === plantId);
                if (plantToUpdate) showUpdatePlantForm(plantToUpdate);
                else showToast(`Pianta ${plantId} non trovata.`, 'error');
            } else {
                 showToast("Devi essere autenticato per modificare.", 'info');
            }
        } else if (target.classList.contains('delete-plant-from-db-button')) {
            if (user && user.email === 'ferraiolo80@hotmail.it') { // Solo admin
                deletePlantFromDatabase(plantId);
            } else {
                showToast("Azione non permessa.", 'error');
            }
        }
    }

    if (gardenContainer) gardenContainer.addEventListener('click', (event) => handleCardActions(event, gardenContainer));
    if (myGardenContainer) myGardenContainer.addEventListener('click', (event) => handleCardActions(event, myGardenContainer));

    // Gestione sensore luce (se gli elementi HTML esistono)
    // if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    // if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);


    // Chiamata iniziale per configurare l'UI in base allo stato di autenticazione
    await handleAuthAndUI(firebase.auth().currentUser);

    // Funzione globale per chiudere le modal dei form (newPlantCard, updatePlantCard)
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            if (modalId === 'newPlantCard') clearNewPlantForm();
            if (modalId === 'updatePlantCard') clearUpdatePlantForm();
        }
    }
});
