// 1. DICHIARAZIONI GLOBALI
let allPlants = [];
let myGarden = []; // Inizializza come array vuoto (array di ID delle piante nel giardino dell'utente)
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

// Variabile per la geolocalizzazione
let userLocation = null;
let detectedClimateZone = null;

// DICHIARAZIONI DEI RIFERIMENTI FIREBASE (ALL'INIZIO, PRIMA DELLE FUNZIONI)
const plantsRef = firebase.firestore().collection('plants');
const usersRef = firebase.firestore().collection('users'); // Mantenuto per future estensioni se servisse salvare altri dati utente
const gardensCollectionRef = firebase.firestore().collection('gardens'); // *** NUOVO RIFERIMENTO PER LA TUA COLLEZIONE 'gardens' ***

// DICHIARAZIONI DELLE VARIABILI DOM GLOBALI (MA NON INIZIALIZZATE QUI)
// Saranno inizializzate solo quando il DOM è pronto (in DOMContentLoaded)
let gardenContainer;
let myGardenContainer;
let searchInput;
let categoryFilter;
let sunlightFilter; // Riferimento al filtro luce
let wateringFilter; // Riferimento al filtro acqua
let tempMinFilter;
let tempMaxFilter;
let climateZoneFilter;
let sortBySelect;
let toggleViewButton;
let addPlantButton;
let showLoginButton;
let showRegisterButton;
let loginButton;
let registerButton;
let logoutButton;
let loginModal;
let newPlantCard;
let updatePlantCard;
let newPlantForm;
let updatePlantForm;
let loginEmailInput;
let loginPasswordInput;
let registerEmailInput;
let registerPasswordInput;
let startLightSensorButton;
let stopLightSensorButton;
let lightLevelDisplay;
let getClimateButton;

// Nuovi riferimenti DOM per i controlli di autenticazione (punto 2)
let userStatusElement;
let userEmailDisplayElement;
let loginRegisterButtonsContainer;

// 2. FUNZIONI DI UTILITÀ (TOAST, MODALS, SPINNER)
function showToast(message, type = 'info') {
    if (!toastContainer) { // Controllo di fallback nel caso toastContainer non sia inizializzato
        toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            console.error('Toast container not found. Creating one.');
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }
    }

    const toast = document.createElement('div');
    toast.classList.add('toast-message', type);

    let iconClass = '';
    if (type === 'success') iconClass = 'fa-check-circle';
    else if (type === 'error') iconClass = 'fa-times-circle';
    else iconClass = 'fa-info-circle';

    toast.innerHTML = `<i class="fas ${iconClass}"></i> ${message}`;
    toastContainer.appendChild(toast);

    // Rimuovi il toast dopo un certo tempo
    setTimeout(() => {
        toast.remove();
    }, 3000); // 3 secondi
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex'; // Usa flex per centrare il contenuto
    }
}

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        if (modalId === 'newPlantCard') clearNewPlantForm();
        if (modalId === 'updatePlantCard') clearUpdatePlantForm();
    }
};

function showLoadingSpinner() {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
}

function hideLoadingSpinner() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
}

function clearNewPlantForm() {
    document.getElementById('new-plant-name').value = '';
    document.getElementById('new-plant-scientific-name').value = '';
    document.getElementById('new-plant-category').value = '';
    document.getElementById('new-plant-sunlight').value = '';
    document.getElementById('new-plant-watering').value = '';
    document.getElementById('new-plant-temp-min').value = '';
    document.getElementById('new-plant-temp-max').value = '';
    document.getElementById('new-plant-climate-zone').value = '';
    document.getElementById('new-plant-image').value = '';
    document.getElementById('new-plant-notes').value = '';
    currentPlantIdToUpdate = null;
    const deleteBtn = document.getElementById('deletePlantNewForm');
    if (deleteBtn) deleteBtn.style.display = 'none'; // Nascondi il bottone elimina nel form nuova pianta
}

function clearUpdatePlantForm() {
    document.getElementById('update-plant-id').value = '';
    document.getElementById('update-plant-name').value = '';
    document.getElementById('update-plant-scientific-name').value = '';
    document.getElementById('update-plant-category').value = '';
    document.getElementById('update-plant-sunlight').value = '';
    document.getElementById('update-plant-watering').value = '';
    document.getElementById('update-plant-temp-min').value = '';
    document.getElementById('update-plant-temp-max').value = '';
    document.getElementById('update-plant-climate-zone').value = '';
    document.getElementById('update-plant-image').value = '';
    document.getElementById('update-plant-notes').value = '';
    currentPlantIdToUpdate = null; // Importante: resetta l'ID della pianta da aggiornare
}


// 3. FUNZIONI DI GESTIONE DATI (FIREBASE FIRESTORE)
async function fetchPlants() {
    showLoadingSpinner();
    try {
        const snapshot = await plantsRef.get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante caricate:", allPlants);
        displayPlants(); // Chiamata displayPlants qui dopo aver fetchato tutte le piante
    } catch (error) {
        console.error("Errore nel recupero delle piante:", error);
        showToast("Errore nel caricamento delle piante.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// *** MODIFICATO: Funzione per recuperare il giardino dell'utente dalla collezione 'gardens' ***
async function fetchMyGarden(userId) {
    if (!userId) {
        myGarden = []; // Se non c'è utente, il giardino è vuoto
        console.log("Nessun utente loggato, giardino vuoto.");
        return;
    }
    showLoadingSpinner();
    try {
        // Cerca il documento del giardino dell'utente nella collezione 'gardens'
        // L'ID del documento del giardino DEVE CORRISPONDERE ALL'UID dell'utente
        const userGardenDoc = await gardensCollectionRef.doc(userId).get();
        if (userGardenDoc.exists) {
            // Assumiamo che il campo contenente gli ID delle piante sia 'plantIds' come specificato
            myGarden = userGardenDoc.data().plantIds || []; // *** CAMPO 'plantIds' ***
            console.log("Giardino dell'utente caricato da 'gardens':", myGarden);
        } else {
            myGarden = [];
            console.log("Documento giardino utente non trovato in 'gardens' per:", userId);
            // Se il documento del giardino non esiste, crealo con un array 'plantIds' vuoto
            // Questo assicura che un nuovo utente abbia un giardino vuoto invece di un errore
            await gardensCollectionRef.doc(userId).set({ plantIds: [] }); // *** INIZIALIZZA CON 'plantIds' ***
            showToast("Il tuo giardino è stato inizializzato. Aggiungi le tue piante!", 'info');
        }
    } catch (error) {
        console.error("Errore nel recupero del giardino da 'gardens':", error);
        showToast("Errore nel caricamento del tuo giardino.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}


async function savePlantToDatabase(plantData) {
    try {
        const plantToSave = { ...plantData };
        delete plantToSave.id; // Rimuovi l'ID se presente, Firestore lo genera automaticamente per i nuovi documenti

        const docRef = await plantsRef.add(plantToSave);
        console.log("Pianta aggiunta con ID:", docRef.id);
        showToast("Pianta aggiunta con successo!", 'success');
        fetchPlants(); // Ricarica le piante per aggiornare la vista
        closeModal('newPlantCard'); // Chiudi la modal dopo il salvataggio
    } catch (error) {
        console.error("Errore nell'aggiunta della pianta:", error);
        showToast("Errore nell'aggiunta della pianta.", 'error');
    }
}

async function updatePlantInDatabase(plantId, plantData) {
    try {
        await plantsRef.doc(plantId).update(plantData);
        console.log("Pianta aggiornata:", plantId);
        showToast("Pianta aggiornata con successo!", 'success');
        fetchPlants(); // Ricarica le piante per aggiornare la vista
        closeModal('updatePlantCard');
    } catch (error) {
        console.error("Errore nell'aggiornamento della pianta:", error);
        showToast("Errore nell'aggiornamento della pianta.", 'error');
    }
}

async function deletePlantFromDatabase(plantId) {
    const confirmDelete = confirm("Sei sicuro di voler eliminare questa pianta dal database?");
    if (!confirmDelete) return;

    try {
        // Elimina la pianta dalla collezione principale
        await plantsRef.doc(plantId).delete();
        console.log("Pianta eliminata dal database:", plantId);
        showToast("Pianta eliminata con successo!", 'success');

        // *** MODIFICATO: Rimuovi la pianta da tutti i giardini degli utenti nella collezione 'gardens' ***
        const allGardensSnapshot = await gardensCollectionRef.get(); // Ora cerca in 'gardens'
        const batch = firebase.firestore().batch();
        allGardensSnapshot.docs.forEach(doc => {
            const gardenData = doc.data();
            // Assumi che il campo si chiami 'plantIds' all'interno del documento del giardino
            if (gardenData.plantIds && gardenData.plantIds.includes(plantId)) { // *** CAMPO 'plantIds' ***
                const newGardenPlants = gardenData.plantIds.filter(id => id !== plantId);
                batch.update(gardensCollectionRef.doc(doc.id), { plantIds: newGardenPlants }); // *** CAMPO 'plantIds' ***
            }
        });
        await batch.commit();
        console.log("Pianta rimossa dai giardini degli utenti in 'gardens'.");

        fetchPlants(); // Ricarica le piante per aggiornare la vista
        // Se si stava visualizzando il proprio giardino e la pianta è stata rimossa
        if (isMyGardenCurrentlyVisible) {
            const user = firebase.auth().currentUser;
            if (user) await fetchMyGarden(user.uid); // Ricarica il giardino corrente
        }
        closeModal('newPlantCard');
        closeModal('updatePlantCard');
    } catch (error) {
        console.error("Errore nell'eliminazione della pianta dal DB o dai giardini:", error);
        showToast("Errore nell'eliminazione della pianta.", 'error');
    }
}


// 4. FUNZIONI DI AUTENTICAZIONE (FIREBASE AUTH)
async function registerUser(email, password) {
    try {
        showLoadingSpinner();
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        console.log("Utente registrato:", userCredential.user.email);
        // *** MODIFICATO: Crea un documento utente vuoto in Firestore nella collezione 'gardens' per il giardino ***
        // L'ID del documento è l'UID dell'utente
        await gardensCollectionRef.doc(userCredential.user.uid).set({ plantIds: [] }); // *** INIZIALIZZA CON 'plantIds' ***
        showToast("Registrazione completata e accesso effettuato!", 'success');
        closeModal('loginModal');
    } catch (error) {
        console.error("Errore nella registrazione:", error);
        document.getElementById('register-error').innerText = error.message;
        showToast("Errore nella registrazione: " + error.message, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function loginUser(email, password) {
    try {
        showLoadingSpinner();
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log("Utente loggato:", userCredential.user.email);
        showToast("Accesso effettuato!", 'success');
        closeModal('loginModal');
    } catch (error) {
        console.error("Errore nel login:", error);
        document.getElementById('login-error').innerText = error.message;
        showToast("Errore nel login: " + error.message, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

async function logoutUser() {
    try {
        await firebase.auth().signOut();
        console.log("Utente sloggato.");
        showToast("Disconnessione effettuata.", 'info');
        isMyGardenCurrentlyVisible = false;
        displayPlants();
        document.getElementById('my-garden-title').style.display = 'none';
        myGardenContainer.style.display = 'none';
    } catch (error) {
        console.error("Errore nel logout:", error);
        showToast("Errore nel logout: " + error.message, 'error');
    }
}

// Listener per lo stato di autenticazione di Firebase
firebase.auth().onAuthStateChanged(async (user) => {
    if (isDomReady) {
        await handleAuthAndUI(user);
    } else {
        console.log("Auth state changed, but DOM not ready. Waiting.");
    }
});


// 5. FUNZIONI DI GESTIONE UI E VISUALIZZAZIONE
function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('login-error').innerText = '';
    document.getElementById('register-error').innerText = '';
    showModal('loginModal');
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-error').innerText = '';
    document.getElementById('register-error').innerText = '';
    showModal('loginModal');
}

function createPlantCard(plant, isMyGarden = false) {
    const card = document.createElement('div');
    card.classList.add('plant-card');
    if (isMyGarden) card.classList.add('my-plant-card');

    // Il placeholder immagine è 'placeholder.jpg'. Assicurati che esista.
    // L'errore di caricamento delle immagini che hai menzionato potrebbe derivare da URL non validi.
    // Ho aggiunto un fallback per l'immagine.
    const image = plant.image && plant.image.startsWith('http') ? plant.image : 'placeholder.jpg';

    card.innerHTML = `
        <h3>${plant.name}</h3>
        <p><em>${plant.scientificName || ''}</em></p>
        <img src="${image}" alt="${plant.name}" data-plant-id="${plant.id}" onerror="this.onerror=null;this.src='placeholder.jpg';">
        <p><strong>Categoria:</strong> ${plant.category}</p>
        <p><strong>Esposizione:</strong> ${plant.sunlight}</p>
        <p><strong>Irrigazione:</strong> ${plant.watering}</p>
        <p><strong>Temp. Min:</strong> ${plant.tempMin}°C</p>
        <p><strong>Temp. Max:</strong> ${plant.tempMax}°C</p>
        ${plant.climateZone ? `<p><strong>Zona Climatica:</strong> ${plant.climateZone}</p>` : ''}
        ${plant.notes ? `<p><strong>Note:</strong> ${plant.notes}</p>` : ''}
        <div class="card-actions">
            ${isMyGarden ?
                `<button class="button remove-button" data-plant-id="${plant.id}">Rimuovi dal mio Giardino</button>` :
                `<button class="button add-to-garden-button" data-plant-id="${plant.id}">Aggiungi al mio Giardino</button>`
            }
            ${firebase.auth().currentUser && firebase.auth().currentUser.email === 'ferraiolo80@hotmail.it' ? // Solo admin
                `<button class="button update-plant-button" data-plant-id="${plant.id}">Aggiorna</button>
                 <button class="button delete-plant-from-db-button" data-plant-id="${plant.id}">Elimina</button>` : ''
            }
        </div>
    `;

    // Listener per lo zoom immagine
    const plantImage = card.querySelector('img');
    if (plantImage) { // Aggiunto un controllo per assicurarsi che l'immagine esista
        plantImage.addEventListener('click', () => {
            showZoomedImage(image); // Usa imageUrl, che include il fallback
        });
    }

    return card;
}

function showZoomedImage(image) {
    zoomedImage.src = image;
    showModal('image-modal');
}

function displayPlants() {
    let plantsToDisplay = allPlants;

    // Applica i filtri
    plantsToDisplay = plantsToDisplay.filter(applyFilters);

    // Applica l'ordinamento
    plantsToDisplay.sort(applySorting);

    // Determina quale contenitore visualizzare
    const mainContainer = isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer;
    const otherContainer = isMyGardenCurrentlyVisible ? gardenContainer : myGardenContainer;

    const mainTitle = isMyGardenCurrentlyVisible ? document.getElementById('my-garden-title') : document.querySelector('h2:not(#my-garden-title)');
    const otherTitle = isMyGardenCurrentlyVisible ? document.querySelector('h2:not(#my-garden-title)') : document.getElementById('my-garden-title');

    mainContainer.innerHTML = '';
    otherContainer.innerHTML = ''; // Pulisci l'altro contenitore

    // Mostra/Nascondi titoli e contenitori
    mainContainer.style.display = 'grid'; // Usa grid per il layout
    mainTitle.style.display = 'block';

    otherContainer.style.display = 'none';
    otherTitle.style.display = 'none';


    if (isMyGardenCurrentlyVisible) {
        if (!firebase.auth().currentUser) {
            showToast("Devi essere loggato per vedere il tuo giardino.", 'info');
            // Torna alla vista "Tutte le Piante" se l'utente non è loggato
            isMyGardenCurrentlyVisible = false;
            displayPlants();
            return;
        }
        // Filtra le piante del giardino in base alle piante caricate
        // `myGarden` contiene solo gli ID delle piante che l'utente ha nel suo giardino
        const filteredMyGardenPlants = plantsToDisplay.filter(plant => myGarden.includes(plant.id));
        if (filteredMyGardenPlants.length === 0) {
            mainContainer.innerHTML = '<p>Il tuo giardino è vuoto. Aggiungi delle piante!</p>';
        } else {
            filteredMyGardenPlants.forEach(plant => {
                mainContainer.appendChild(createPlantCard(plant, true));
            });
        }
    } else {
        if (plantsToDisplay.length === 0) {
            mainContainer.innerHTML = '<p>Nessuna pianta trovata con i filtri selezionati.</p>';
        } else {
            plantsToDisplay.forEach(plant => {
                mainContainer.appendChild(createPlantCard(plant));
            });
        }
    }
}

function applyFilters(plant) {
    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedClimate = climateZoneFilter.value;
    const tempMin = parseFloat(tempMinFilter.value);
    const tempMax = parseFloat(tempMaxFilter.value);

    const matchesLight = sunlightFilter.value === '' || (plant.sunlight && plant.sunlight === sunlightFilter.value);
    const matchesWater = wateringFilter.value === '' || (plant.watering && plant.watering === wateringFilter.value);

    const matchesSearch = plant.name.toLowerCase().includes(searchText) ||
                          (plant.scientificName && plant.scientificName.toLowerCase().includes(searchText));

    const matchesCategory = selectedCategory === '' || plant.category === selectedCategory;
    const matchesTempMin = isNaN(tempMin) || (plant.tempMin !== undefined && plant.tempMin >= tempMin);
    const matchesTempMax = isNaN(tempMax) || (plant.tempMax !== undefined && plant.tempMax <= tempMax);
    const matchesClimateZone = selectedClimate === '' || (plant.climateZone && plant.climateZone === selectedClimate);

    return matchesSearch && matchesCategory && matchesLight && matchesWater &&
           matchesTempMin && matchesTempMax && matchesClimateZone;
}

function applySorting(a, b) {
    const [field, order] = currentSortBy.split('_');

    let valA, valB;

    switch (field) {
        case 'name':
        case 'category':
        case 'sunlight':
        case 'watering':
            valA = String(a[field] || '').toLowerCase(); // Gestisce valori null/undefined
            valB = String(b[field] || '').toLowerCase();
            break;
        case 'tempMin':
        case 'tempMax':
            valA = a[field] !== undefined ? a[field] : (order === 'asc' ? -Infinity : Infinity);
            valB = b[field] !== undefined ? b[field] : (order === 'asc' ? -Infinity : Infinity);
            break;
        case 'climateZone':
            valA = String(a[field] || '').toLowerCase();
            valB = String(b[field] || '').toLowerCase();
            break;
        default:
            valA = String(a.name).toLowerCase();
            valB = String(b.name).toLowerCase();
            break;
    }

    if (valA < valB) {
        return order === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
        return order === 'asc' ? 1 : -1;
    }
    return 0;
}


// 6. FUNZIONI DI GESTIONE DEL GIARDINO PERSONALE
async function addToMyGarden(plantId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per aggiungere piante al tuo giardino.", 'info');
        return;
    }

    if (myGarden.includes(plantId)) {
        showToast("Questa pianta è già nel tuo giardino!", 'info');
        return;
    }

    try {
        // Riferimento al documento del giardino dell'utente nella collezione 'gardens'
        const userGardenDocRef = gardensCollectionRef.doc(user.uid);
        // Aggiorna il campo 'plantIds' (o il nome corretto del tuo campo)
        await userGardenDocRef.update({
            plantIds: firebase.firestore.FieldValue.arrayUnion(plantId) // *** CAMPO 'plantIds' ***
        });
        myGarden.push(plantId); // Aggiorna l'array locale
        showToast("Pianta aggiunta al tuo giardino!", 'success');
        displayPlants(); // Aggiorna la visualizzazione
    } catch (error) {
        console.error("Errore nell'aggiunta al giardino:", error);
        showToast("Errore nell'aggiunta al giardino.", 'error');
    }
}

async function removeFromMyGarden(plantId) {
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per rimuovere piante dal tuo giardino.", 'info');
        return;
    }

    if (!myGarden.includes(plantId)) {
        showToast("Questa pianta non è nel tuo giardino.", 'info');
        return;
    }

    try {
        // Riferimento al documento del giardino dell'utente nella collezione 'gardens'
        const userGardenDocRef = gardensCollectionRef.doc(user.uid);
        // Aggiorna il campo 'plantIds' (o il nome corretto del tuo campo)
        await userGardenDocRef.update({
            plantIds: firebase.firestore.FieldValue.arrayRemove(plantId) // *** CAMPO 'plantIds' ***
        });
        myGarden = myGarden.filter(id => id !== plantId); // Aggiorna l'array locale
        showToast("Pianta rimossa dal tuo giardino.", 'success');
        displayPlants(); // Aggiorna la visualizzazione
    } catch (error) {
        console.error("Errore nella rimozione dal giardino:", error);
        showToast("Errore nella rimozione dal giardino.", 'error');
    }
}


// 7. FUNZIONI DI GESTIONE DEI SENSORI (GEOLOCALIZZAZIONE, LUCE)
async function getClimateZone() {
    if (!navigator.geolocation) {
        showToast("La geolocalizzazione non è supportata dal tuo browser.", 'error');
        return;
    }

    showToast("Rilevamento posizione in corso...", 'info');
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
        });
        userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        showToast(`Posizione rilevata: Lat ${userLocation.latitude.toFixed(2)}, Lon ${userLocation.longitude.toFixed(2)}`, 'success');

        // Qui dovresti integrare un servizio di terze parti (es. OpenWeatherMap, Google Geocoding)
        // per convertire le coordinate in una zona climatica o informazioni meteorologiche.
        // Per questo esempio, userò una logica semplificata/simulata.
        detectedClimateZone = simulateClimateZone(userLocation.latitude);
        climateZoneFilter.value = detectedClimateZone; // Applica il filtro della zona climatica
        showToast(`Zona climatica stimata: ${detectedClimateZone}`, 'info');
        displayPlants(); // Applica il filtro
    } catch (error) {
        console.error("Errore nella geolocalizzazione:", error);
        let errorMessage = "Impossibile rilevare la posizione.";
        if (error.code === error.PERMISSION_DENIED) {
            errorMessage = "Permesso di geolocalizzazione negato. Abilitalo nelle impostazioni del browser.";
        } else if (error.code === error.TIMEOUT) {
            errorMessage = "Timeout nel rilevamento della posizione.";
        }
        showToast(errorMessage, 'error');
    }
}

function simulateClimateZone(latitude) {
    if (latitude >= 23.5 && latitude <= 66.5) return "Temperato"; // Zone temperate
    if (latitude > -23.5 && latitude < 23.5) return "Tropicale"; // Zone tropicali
    if (latitude > 66.5 || latitude < -66.5) return "Polare"; // Zone polari
    return "Sconosciuta"; // Default
}

function startLightSensor() {
    if ('AmbientLightSensor' in window) {
        if (!ambientLightSensor) {
            ambientLightSensor = new AmbientLightSensor();
            ambientLightSensor.onreading = () => {
                lightLevelDisplay.textContent = `Livello Luce: ${ambientLightSensor.illuminance} lux`;
            };
            ambientLightSensor.onerror = (event) => {
                console.error("Errore sensore luce:", event.error.name, event.error.message);
                showToast(`Errore sensore luce: ${event.error.message}`, 'error');
            };
            ambientLightSensor.start();
            showToast("Sensore luce avviato.", 'success');
        } else {
            showToast("Sensore luce già attivo.", 'info');
        }
    } else {
        showToast("Il sensore di luce non è supportato dal tuo browser.", 'error');
    }
}

function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
        lightLevelDisplay.textContent = 'Livello Luce: N/A';
        showToast("Sensore luce fermato.", 'info');
    } else {
        showToast("Nessun sensore luce attivo.", 'info');
    }
}

function showUpdatePlantForm(plant) {
    // Popola il form di aggiornamento
    document.getElementById('update-plant-id').value = plant.id;
    document.getElementById('update-plant-name').value = plant.name;
    document.getElementById('update-plant-scientific-name').value = plant.scientificName || '';
    document.getElementById('update-plant-category').value = plant.category;
    document.getElementById('update-plant-sunlight').value = plant.sunlight;
    document.getElementById('update-plant-watering').value = plant.watering;
    document.getElementById('update-plant-temp-min').value = plant.tempMin;
    document.getElementById('update-plant-temp-max').value = plant.tempMax;
    document.getElementById('update-plant-climate-zone').value = plant.climateZone || '';
    document.getElementById('update-plant-image-url').value = plant.imageUrl || '';
    document.getElementById('update-plant-notes').value = plant.notes || '';

    currentPlantIdToUpdate = plant.id; // Imposta l'ID della pianta da aggiornare
    showModal('updatePlantCard');

    // Mostra il bottone "Elimina Pianta (Admin)" solo se è l'admin
    const deleteBtn = document.querySelector('#updatePlantCard #deletePlant'); // Selettore più specifico
    if (firebase.auth().currentUser && firebase.auth().currentUser.email === 'ferraiolo80@hotmail.it') {
        if (deleteBtn) deleteBtn.style.display = 'block';
    } else {
        if (deleteBtn) deleteBtn.style.display = 'none';
    }
}


// Funzione per mostrare il form di aggiunta di una nuova pianta
function showNewPlantForm() {
    clearNewPlantForm(); // Pulisce il form prima di mostrarlo
    showModal('newPlantCard');
    // Nascondi il bottone "Elimina Pianta (Admin)" nel form di aggiunta (usa il nuovo ID)
    const deleteBtn = document.getElementById('deletePlantNewForm');
    if (deleteBtn) deleteBtn.style.display = 'none';
}


// Funzione per popolare i filtri dinamici (es. categorie, zone climatiche)
function populateDynamicFilters() {
    const categories = [...new Set(allPlants.map(plant => plant.category))].sort();
    categoryFilter.innerHTML = '<option value="">Tutte le Categorie</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

    const climateZones = [...new Set(allPlants.map(plant => plant.climateZone).filter(Boolean))].sort(); // filter(Boolean) rimuove i valori null/undefined
    climateZoneFilter.innerHTML = '<option value="">Tutte le Zone Climatiche</option>' +
        climateZones.map(zone => `<option value="${zone}">${zone}</option>`).join('');
}


// Gestisce lo stato dell'UI in base all'autenticazione dell'utente
async function handleAuthAndUI(user) {
    // Riferimenti agli elementi di autenticazione (punto 2)
    userStatusElement = document.getElementById('user-status');
    userEmailDisplayElement = document.getElementById('user-email-display');
    loginRegisterButtonsContainer = document.getElementById('login-register-buttons');
    logoutButton = document.getElementById('logout-button'); // Assicurati che sia stato inizializzato

    if (user) {
        // Utente loggato
        userEmailDisplayElement.innerText = user.email;
        userStatusElement.style.display = 'flex'; // Mostra icona e email
        loginRegisterButtonsContainer.style.display = 'none'; // Nascondi bottoni login/registrazione
        logoutButton.style.display = 'block'; // Mostra bottone logout
        addPlantButton.style.display = 'block'; // Mostra bottone Aggiungi Pianta
        await fetchMyGarden(user.uid); // Carica il giardino dell'utente
    } else {
        // Utente non loggato
        userEmailDisplayElement.innerText = '';
        userStatusElement.style.display = 'none'; // Nascondi icona e email
        loginRegisterButtonsContainer.style.display = 'flex'; // Mostra bottoni login/registrazione
        logoutButton.style.display = 'none'; // Nascondi bottone logout
        addPlantButton.style.display = 'none'; // Nascondi bottone Aggiungi Pianta
        myGarden = []; // Pulisci il giardino locale se l'utente non è loggato
        if (isMyGardenCurrentlyVisible) { // Se l'utente era nel giardino e si slogga
            isMyGardenCurrentlyVisible = false; // Torna alla vista "Tutte le Piante"
        }
    }
    displayPlants(); // Aggiorna la visualizzazione delle piante (anche per nascondere il giardino se sloggati)
}


// 8. INIZIALIZZAZIONE (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', async () => {
    // Inizializzazione delle variabili DOM
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden');
    searchInput = document.getElementById('search-input');
    categoryFilter = document.getElementById('category-filter');
    sunlightFilter = document.getElementById('sunlight-filter');
    wateringFilter = document.getElementById('watering-filter');
    tempMinFilter = document.getElementById('temp-min-filter');
    tempMaxFilter = document.getElementById('temp-max-filter');
    climateZoneFilter = document.getElementById('climate-zone-filter');
    sortBySelect = document.getElementById('sort-by');
    toggleViewButton = document.getElementById('toggle-view-button');
    addPlantButton = document.getElementById('add-plant-button');
    showLoginButton = document.getElementById('show-login-button');
    showRegisterButton = document.getElementById('show-register-button');
    loginButton = document.getElementById('login-button');
    registerButton = document.getElementById('register-button');
    logoutButton = document.getElementById('logout-button');
    loginModal = document.getElementById('loginModal');
    newPlantCard = document.getElementById('newPlantCard');
    updatePlantCard = document.getElementById('updatePlantCard');
    newPlantForm = document.getElementById('new-plant-form');
    updatePlantForm = document.getElementById('update-plant-form');
    loginEmailInput = document.getElementById('login-email');
    loginPasswordInput = document.getElementById('login-password');
    registerEmailInput = document.getElementById('register-email');
    registerPasswordInput = document.getElementById('register-password');
    startLightSensorButton = document.getElementById('start-light-sensor-button');
    stopLightSensorButton = document.getElementById('stop-light-sensor-button');
    lightLevelDisplay = document.getElementById('light-level');
    getClimateButton = document.getElementById('get-climate-button');
    loadingSpinner = document.getElementById('loading-spinner');
    imageModal = document.getElementById('image-modal');
    zoomedImage = document.getElementById('zoomed-image');
    closeButton = document.querySelector('#image-modal .close-button'); // Selettore più specifico per il close button della modal immagine
    toastContainer = document.getElementById('toast-container'); // Inizializza il toast container

    // Imposta il flag che il DOM è pronto
    isDomReady = true;

    // Fetch iniziale delle piante e gestione UI
    await fetchPlants();
    // La gestione dell'UI e del giardino personale avviene dopo fetchPlants()
    // per assicurarsi che 'allPlants' sia popolato prima di filtrare per 'myGarden'
    await handleAuthAndUI(firebase.auth().currentUser); 

    // Popola i filtri dinamici dopo aver caricato le piante
    populateDynamicFilters();


    // Listener per i filtri e l'ordinamento
    searchInput.addEventListener('input', displayPlants);
    categoryFilter.addEventListener('change', displayPlants);
    sunlightFilter.addEventListener('change', displayPlants);
    wateringFilter.addEventListener('change', displayPlants);
    tempMinFilter.addEventListener('input', displayPlants);
    tempMaxFilter.addEventListener('input', displayPlants);
    climateZoneFilter.addEventListener('change', displayPlants);
    sortBySelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        displayPlants();
    });

    // Listener per i bottoni di login/registrazione/logout
    if (showLoginButton) showLoginButton.addEventListener('click', showLoginForm);
    if (showRegisterButton) showRegisterButton.addEventListener('click', showRegisterForm);
    if (loginButton) loginButton.addEventListener('click', () => loginUser(loginEmailInput.value, loginPasswordInput.value));
    if (registerButton) registerButton.addEventListener('click', () => registerUser(registerEmailInput.value, registerPasswordInput.value));
    if (logoutButton) logoutButton.addEventListener('click', logoutUser);


    // Listener per i form di aggiunta/aggiornamento pianta
    if (newPlantForm) {
        newPlantForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const plantData = {
                name: document.getElementById('new-plant-name').value,
                scientificName: document.getElementById('new-plant-scientific-name').value || null,
                category: document.getElementById('new-plant-category').value,
                sunlight: document.getElementById('new-plant-sunlight').value,
                watering: document.getElementById('new-plant-watering').value,
                tempMin: parseFloat(document.getElementById('new-plant-temp-min').value),
                tempMax: parseFloat(document.getElementById('new-plant-temp-max').value),
                climateZone: document.getElementById('new-plant-climate-zone').value || null,
                imageUrl: document.getElementById('new-plant-image-url').value || null,
                notes: document.getElementById('new-plant-notes').value || null
            };
            await savePlantToDatabase(plantData);
        });
    }

    if (updatePlantForm) {
        updatePlantForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const plantId = document.getElementById('update-plant-id').value;
            const plantData = {
                name: document.getElementById('update-plant-name').value,
                scientificName: document.getElementById('update-plant-scientific-name').value || null,
                category: document.getElementById('update-plant-category').value,
                sunlight: document.getElementById('update-plant-sunlight').value,
                watering: document.getElementById('update-plant-watering').value,
                tempMin: parseFloat(document.getElementById('update-plant-temp-min').value),
                tempMax: parseFloat(document.getElementById('update-plant-temp-max').value),
                climateZone: document.getElementById('update-plant-climate-zone').value || null,
                imageUrl: document.getElementById('update-plant-image-url').value || null,
                notes: document.getElementById('update-plant-notes').value || null
            };
            await updatePlantInDatabase(plantId, plantData);
        });
    }

    // Listener per i bottoni mostra/aggiungi pianta
    if (toggleViewButton) {
        toggleViewButton.addEventListener('click', () => {
            isMyGardenCurrentlyVisible = !isMyGardenCurrentlyVisible;
            toggleViewButton.textContent = isMyGardenCurrentlyVisible ? 'Mostra Tutte le Piante' : 'Mostra il mio Giardino';
            displayPlants();
        });
    }

    if (addPlantButton) addPlantButton.addEventListener('click', showNewPlantForm);
    if (getClimateButton) getClimateButton.addEventListener('click', getClimateZone);


    // Listener per i bottoni del sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);

    // Gestione dei click sui bottoni delle card (delegazione eventi)
    // Usiamo il container più ampio per catturare i click dei bottoni dinamici
    if (gardenContainer) {
        gardenContainer.addEventListener('click', async (event) => {
            handleCardActions(event, gardenContainer);
        });
    }
    if (myGardenContainer) {
        myGardenContainer.addEventListener('click', async (event) => {
            handleCardActions(event, myGardenContainer);
        });
    }

    // Listener per il bottone di eliminazione della pianta dal form (newPlantCard/updatePlantCard)
    // Se c'è un bottone con ID 'deletePlant'
    const deletePlantButtonFromNewForm = document.getElementById('deletePlantNewForm'); // Nuovo ID
    const deletePlantButtonFromUpdateForm = document.getElementById('deletePlant'); // Vecchio ID

    if (deletePlantButtonFromNewForm) {
        deletePlantButtonFromNewForm.addEventListener('click', async () => {
            if (currentPlantIdToUpdate) {
                showToast('Eliminazione pianta in corso...', 'info');
                await deletePlantFromDatabase(currentPlantIdToUpdate);
                currentPlantIdToUpdate = null; // Resetta dopo l'eliminazione
            } else {
                showToast('Nessuna pianta selezionata per l\'eliminazione.', 'info');
            }
        });
    }
    if (deletePlantButtonFromUpdateForm) {
        deletePlantButtonFromUpdateForm.addEventListener('click', async () => {
            if (currentPlantIdToUpdate) {
                showToast('Eliminazione pianta in corso...', 'info');
                await deletePlantFromDatabase(currentPlantIdToUpdate);
                currentPlantIdToUpdate = null; // Resetta dopo l'eliminazione
            } else {
                showToast('Nessuna pianta selezionata per l\'eliminazione.', 'info');
            }
        });
    }
});

// Event delegation per i bottoni sulle card - Funzione separata per pulizia
function handleCardActions(event, container) {
    const target = event.target.closest('button'); // Trova il bottone cliccato, anche se si clicca sull'icona interna
    if (!target) return;

    const plantId = target.dataset.plantId;
    // La classe 'delete-plant-from-form-button' è per i bottoni dentro le modal, non nelle card dinamiche
    if (!plantId && !target.classList.contains('delete-plant-from-form-button')) return;

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
