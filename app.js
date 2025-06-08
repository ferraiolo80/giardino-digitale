// Variabili globali per lo stato dell'applicazione
let allPlants = [];
let myGarden = [];
let currentPlantIdToUpdate = null; // Tiene traccia dell'ID della pianta da aggiornare (per modifica/eliminazione)
let ambientLightSensor = null; // Sensore di luce ambientale
let isMyGardenCurrentlyVisible = false; // Flag per la visualizzazione corrente (true = Mio Giardino, false = Tutte le Piante)
let currentSortBy = 'name_asc'; // Criterio di ordinamento di default

// Firebase instances
let db;
let storage;
let storageRef;

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
let climateZoneFilter; // Selettore per la zona climatica
let imageModal; // Modale per lo zoom delle immagini
let zoomedImage; // Immagine all'interno della modale
let closeImageModalButton; // Bottone di chiusura per la modale immagine
let cardModal; // Modale per i dettagli/form della pianta
let zoomedCardContent; // Contenuto dinamico della modale (dettagli o form)
let closeCardModalButton; // Bottone di chiusura per la modale dettagli/form
let newPlantFormTemplate; // Template HTML per il form Aggiungi Pianta
let updatePlantFormTemplate; // Template HTML per il form Aggiorna Pianta
let emptyGardenMessage; // Messaggio per il giardino vuoto
let loginFormElement; // Variabile per il form di login

// Flag per lo stato di preparazione del DOM
let isDomReady = false;


// Funzioni di utilità per l'interfaccia utente (UI)
function showLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'flex';
    }
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 3000);
    }
}

// Funzioni di autenticazione Firebase
async function login() {
    const email = emailInput.value;
    const password = passwordInput.value;
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        showToast('Login avvenuto con successo!', 'success');
        if (loginError) loginError.textContent = ''; // Pulisci eventuali errori precedenti
    } catch (error) {
        console.error("Errore di login:", error);
        if (loginError) loginError.textContent = `Errore: ${error.message}`;
        showToast(`Errore di login: ${error.message}`, 'error');
    }
}

async function register() {
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        showToast('Registrazione avvenuta con successo!', 'success');
        if (registerError) registerError.textContent = ''; // Pulisci eventuali errori precedenti
    } catch (error) {
        console.error("Errore di registrazione:", error);
        if (registerError) registerError.textContent = `Errore: ${error.message}`;
        showToast(`Errore di registrazione: ${error.message}`, 'error');
    }
}

async function logout() {
    try {
        await firebase.auth().signOut();
        showToast('Logout effettuato!', 'info');
    } catch (error) {
        console.error("Errore di logout:", error);
        showToast(`Errore di logout: ${error.message}`, 'error');
    }
}

// Funzione per aggiornare l'interfaccia utente in base allo stato di autenticazione
async function updateUIforAuthState(user) {
    // Solo se il DOM è pronto, altrimenti non possiamo manipolare gli elementi
    if (!isDomReady) {
        console.warn("updateUIforAuthState chiamato prima che il DOM sia completamente pronto. Riproverò.");
        // Aggiungi un piccolo ritardo per consentire al DOM di essere pronto
        setTimeout(() => updateUIforAuthState(user), 50);
        return;
    }

    showLoadingSpinner();
    try {
        if (user) {
            // Utente loggato
            if (authContainerDiv) authContainerDiv.style.display = 'none';
            if (appContentDiv) appContentDiv.style.display = 'block'; // O 'flex'
            if (authStatusSpan) authStatusSpan.textContent = `Loggato come: ${user.email}`;
            if (logoutButton) logoutButton.style.display = 'block';
            if (addNewPlantButton) addNewPlantButton.style.display = 'block';

            await fetchAndDisplayPlants();
            await fetchAndDisplayMyGarden();

            isMyGardenCurrentlyVisible = false;
            updateGalleryVisibility();
        } else {
            // Utente non loggato
            if (authContainerDiv) authContainerDiv.style.display = 'flex'; // O 'block'
            if (appContentDiv) appContentDiv.style.display = 'none';
            if (authStatusSpan) authStatusSpan.textContent = 'Non loggato';
            if (logoutButton) logoutButton.style.display = 'none';
            if (addNewPlantButton) addNewPlantButton.style.display = 'none';

            // Pulisci le gallerie quando l'utente si disconnette
            if (gardenContainer) gardenContainer.innerHTML = '';
            if (myGardenContainer) myGardenContainer.innerHTML = '';
            if (emptyGardenMessage) emptyGardenMessage.style.display = 'none';
        }
    } catch (error) {
        console.error("Errore durante l'aggiornamento dell'UI di autenticazione:", error);
        showToast("Errore nell'aggiornamento della UI.", 'error');
    } finally {
        hideLoadingSpinner();
    }
}


// Funzioni per la gestione delle piante (CRUD)
/**
 * Crea un elemento DOM per la card di una pianta.
 * @param {Object} plant - L'oggetto pianta con i suoi dati.
 * @param {string} type - 'all' per la galleria principale, 'myGarden' per il giardino personale.
 * @returns {HTMLElement} L'elemento div della card della pianta.
 */
function createPlantCard(plant, type = 'all') {
    const plantCard = document.createElement('div');
    plantCard.className = 'plant-card';
    plantCard.dataset.plantId = plant.id;

    plantCard.innerHTML = `
        <img src="${plant.imageUrl || 'https://placehold.co/150x150/EEEEEE/333333?text=No+Image'}" alt="${plant.name}" class="plant-image">
        <h3>${plant.name}</h3>
        <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
        <p><strong>Temp:</strong> ${plant.minTemp !== null ? plant.minTemp : 'N/A'} - ${plant.maxTemp !== null ? plant.maxTemp : 'N/A'}°C</p>
        <p><strong>Lux:</strong> ${plant.minLux !== null ? plant.minLux : 'N/A'} - ${plant.maxLux !== null ? plant.maxLux : 'N/A'} Lux</p>
        <div class="card-buttons">
            <button class="details-button" data-button-type="details">Dettagli</button>
            ${type === 'all' ? `<button class="add-to-garden-button" data-button-type="addToGarden">Aggiungi al Giardino</button>` : ''}
            ${type === 'myGarden' ? `
                <button class="update-button" data-button-type="update">Modifica</button>
                <button class="delete-button" data-button-type="delete">Elimina</button>
                <button class="remove-from-garden-button" data-button-type="removeFromGarden">Rimuovi dal Giardino</button>
            ` : ''}
        </div>
    `;

    // Listener per l'immagine zoomabile all'interno della card
    const cardImage = plantCard.querySelector('.plant-image');
    if (cardImage) {
        cardImage.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita che il click si propaghi al card.dataset.plantId
            if (zoomedImage && imageModal) {
                zoomedImage.src = plant.imageUrl || 'https://placehold.co/150x150/EEEEEE/333333?text=No+Image';
                imageModal.style.display = 'block';
            }
        });
    }

    return plantCard;
}

/**
 * Recupera e visualizza tutte le piante disponibili dalla collezione 'plants' di Firestore.
 * Applica i filtri e l'ordinamento correnti.
 */
async function fetchAndDisplayPlants() {
    showLoadingSpinner();
    try {
        // Controllo aggiuntivo per assicurarsi che gardenContainer non sia null
        if (!gardenContainer) {
            console.error("gardenContainer non trovato. Impossibile caricare le piante.");
            return;
        }
        gardenContainer.innerHTML = ''; // Pulisci il contenitore

        const plantsRef = db.collection('plants').orderBy(currentSortBy.split('_')[0], currentSortBy.split('_')[1]);
        const snapshot = await plantsRef.get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log("Piante caricate da Firestore:", allPlants);

        filterPlants(); // Applica i filtri e l'ordinamento subito dopo il caricamento
    } catch (error) {
        console.error("Errore nel caricamento delle piante:", error);
        showToast('Errore nel caricamento delle piante.', 'error');
    } finally {
        hideLoadingSpinner();
    }
}

/**
 * Recupera e visualizza le piante nel giardino personale dell'utente autenticato.
 */
async function fetchAndDisplayMyGarden() {
    showLoadingSpinner();
    try {
        // Controllo aggiuntivo per assicurarsi che myGardenContainer non sia null
        if (!myGardenContainer) {
            console.error("myGardenContainer non trovato. Impossibile caricare il giardino.");
            return;
        }
        myGardenContainer.innerHTML = ''; // Pulisci il contenitore

        const userId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;
        if (!userId) {
            myGarden = []; // Giardino vuoto se non autenticato
            if (emptyGardenMessage) emptyGardenMessage.style.display = 'block';
            return;
        }

        const myGardenRef = db.collection('users').doc(userId).collection('myGarden');
        const snapshot = await myGardenRef.get();
        myGarden = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log("Giardino caricato da Firestore:", myGarden);

        if (myGarden.length === 0) {
            if (emptyGardenMessage) emptyGardenMessage.style.display = 'block';
        } else {
            if (emptyGardenMessage) emptyGardenMessage.style.display = 'none';
            myGarden.forEach(plant => {
                const plantCard = createPlantCard(plant, 'myGarden');
                if (myGardenContainer) {
                    myGardenContainer.appendChild(plantCard);
                }
            });
        }
    } catch (error) {
        console.error("Errore nel caricamento del giardino:", error);
        showToast('Errore nel caricamento del giardino.', 'error');
    } finally {
        hideLoadingSpinner();
    }
}

/**
 * Carica un'immagine su Firebase Storage.
 * @param {File} file - Il file immagine da caricare.
 * @param {string} folderPath - Il percorso della cartella in Storage (es. 'plant_images').
 * @returns {Promise<string|null>} Una Promise che si risolve con l'URL di download o null.
 */
async function uploadImage(file, folderPath) {
    if (!file) {
        console.warn("Nessun file fornito per il caricamento.");
        return null;
    }
    showLoadingSpinner(); // Mostra spinner solo per l'upload
    try {
        const fileName = `${Date.now()}_${file.name}`;
        const storageRefChild = storageRef.child(`${folderPath}/${fileName}`);
        const snapshot = await storageRefChild.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        showToast('Immagine caricata!', 'success');
        return downloadURL;
    } catch (error) {
        console.error("Errore durante l'upload dell'immagine:", error);
        showToast(`Errore caricamento immagine: ${error.message}`, 'error');
        return null;
    } finally {
        hideLoadingSpinner(); // Nascondi spinner dopo l'upload
    }
}

/**
 * Elimina un'immagine da Firebase Storage dato il suo URL.
 * @param {string} imageUrl - L'URL di download dell'immagine da eliminare.
 */
async function deleteImage(imageUrl) {
    if (!imageUrl || imageUrl.includes('placehold.co')) { // Non tentare di eliminare immagini placeholder
        return;
    }
    try {
        const imageRef = storage.refFromURL(imageUrl);
        await imageRef.delete();
        console.log("Immagine eliminata con successo da Storage:", imageUrl);
    } catch (error) {
        console.error("Errore nell'eliminazione dell'immagine da Storage:", error);
        // Non mostrare toast all'utente per errori di eliminazione immagine, potrebbero essere immagini predefinite.
    }
}

/**
 * Salva una nuova pianta o aggiorna una esistente nel Firestore.
 * @param {Event} event - L'evento di submit del form.
 */
async function savePlantToFirestore(event) {
    event.preventDefault(); // Impedisce il comportamento predefinito del submit del form

    const form = event.target;
    let plantData = {};
    let imageFile = null;
    let existingImageUrl = null;
    let tempIdToUpdate = null; // Usiamo una variabile locale per l'ID in questa funzione

    // Logica per recuperare i dati dal form (nuova pianta o aggiornamento)
    if (form.id === 'new-plant-form') {
        const newPlantNameInput = form.querySelector('[data-form-field="newPlantName"]');
        const newPlantDescriptionInput = form.querySelector('[data-form-field="newPlantDescription"]');
        const newPlantCategoryInput = form.querySelector('[data-form-field="newPlantCategory"]');
        const newMinTempInput = form.querySelector('[data-form-field="newMinTemp"]');
        const newMaxTempInput = form.querySelector('[data-form-field="newMaxTemp"]');
        const newMinLuxInput = form.querySelector('[data-form-field="newMinLux"]');
        const newMaxLuxInput = form.querySelector('[data-form-field="newMaxLux"]');
        const newPlantImageUploadInput = form.querySelector('[data-form-field="newPlantImageUpload"]');

        imageFile = newPlantImageUploadInput ? newPlantImageUploadInput.files[0] : null;

        plantData = {
            name: newPlantNameInput.value,
            description: newPlantDescriptionInput.value,
            category: newPlantCategoryInput.value,
            minTemp: newMinTempInput.value ? parseFloat(newMinTempInput.value) : null,
            maxTemp: newMaxTempInput.value ? parseFloat(newMaxTempInput.value) : null,
            minLux: newMinLuxInput.value ? parseFloat(newMinLuxInput.value) : null,
            maxLux: newMaxLuxInput.value ? parseFloat(newMaxLuxInput.value) : null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            ownerId: firebase.auth().currentUser ? firebase.auth().currentUser.uid : null, // ID utente autenticato
        };

    } else if (form.id === 'update-plant-form') {
        tempIdToUpdate = currentPlantIdToUpdate; // Usa l'ID globale impostato
        const updatePlantNameInput = form.querySelector('[data-form-field="updatePlantName"]');
        const updatePlantDescriptionInput = form.querySelector('[data-form-field="updatePlantDescription"]');
        const updatePlantCategoryInput = form.querySelector('[data-form-field="updatePlantCategory"]');
        const updateMinTempInput = form.querySelector('[data-form-field="updateMinTemp"]');
        const updateMaxTempInput = form.querySelector('[data-form-field="updateMaxTemp"]');
        const updateMinLuxInput = form.querySelector('[data-form-field="updateMinLux"]');
        const updateMaxLuxInput = form.querySelector('[data-form-field="updateMaxLux"]');
        const updatePlantImageUploadInput = form.querySelector('[data-form-field="updatePlantImageUpload"]');
        const updateUploadedImageUrlInput = form.querySelector('[data-form-field="updateUploadedImageUrl"]'); // Campo nascosto per URL esistente

        imageFile = updatePlantImageUploadInput ? updatePlantImageUploadInput.files[0] : null;
        existingImageUrl = updateUploadedImageUrlInput ? updateUploadedImageUrlInput.value : null;

        plantData = {
            name: updatePlantNameInput.value,
            description: updatePlantDescriptionInput.value,
            category: updatePlantCategoryInput.value,
            minTemp: updateMinTempInput.value ? parseFloat(updateMinTempInput.value) : null,
            maxTemp: updateMaxTempInput.value ? parseFloat(updateMaxTempInput.value) : null,
            minLux: updateMinLuxInput.value ? parseFloat(updateMinLuxInput.value) : null,
            maxLux: updateMaxLuxInput.value ? parseFloat(updateMaxLuxInput.value) : null,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        // Se un nuovo file NON è stato selezionato, ma c'è un URL esistente, manteniamo l'URL.
        // Se nessun file è stato selezionato e nessun URL esistente, il campo imageUrl verrà rimosso o sarà null.
        if (!imageFile && existingImageUrl) {
            plantData.imageUrl = existingImageUrl;
        } else if (!imageFile && !existingImageUrl) {
             plantData.imageUrl = firebase.firestore.FieldValue.delete(); // Rimuovi il campo se non c'è immagine
        }
    }

    showLoadingSpinner();
    try {
        let finalImageUrl = existingImageUrl; // Inizializza con l'URL esistente per gli update

        if (imageFile) {
            // Se c'è un nuovo file, carica quello e sovrascrivi l'URL esistente
            finalImageUrl = await uploadImage(imageFile, 'plant_images');
            // Se stiamo aggiornando e c'era un'immagine esistente, eliminiamo la vecchia immagine in storage
            if (form.id === 'update-plant-form' && existingImageUrl && existingImageUrl !== finalImageUrl) {
                 await deleteImage(existingImageUrl);
            }
        }
        plantData.imageUrl = finalImageUrl; // Assegna l'URL dell'immagine (nuova, esistente o nulla)

        if (form.id === 'new-plant-form') {
            await db.collection('plants').add(plantData);
            showToast('Pianta aggiunta con successo!', 'success');
        } else if (form.id === 'update-plant-form') {
            await db.collection('plants').doc(tempIdToUpdate).update(plantData);
            showToast('Pianta aggiornata con successo!', 'success');
        }
        resetPlantForms(); // Chiude la modale e resetta
        await fetchAndDisplayPlants(); // Riapplica i filtri e l'ordinamento dopo l'aggiunta/modifica
        await fetchAndDisplayMyGarden(); // Aggiorna anche il giardino se la pianta era lì
    } catch (error) {
        console.error("Errore nel salvataggio della pianta:", error);
        showToast(`Errore nel salvataggio della pianta: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}


/**
 * Elimina una pianta dalla collezione principale 'plants' e da tutti i giardini degli utenti.
 * @param {string} plantId - L'ID della pianta da eliminare.
 */
async function deletePlant(plantId) {
    if (!plantId) return;

    // Utilizza una modal personalizzata invece di confirm()
    // Per ora, useremo un placeholder per non bloccare
    if (!confirm('Sei sicuro di voler eliminare questa pianta? Questa azione è irreversibile.')) {
        return;
    }

    showLoadingSpinner();
    try {
        const plantDoc = await db.collection('plants').doc(plantId).get();
        if (plantDoc.exists) {
            const plantData = plantDoc.data();
            // Prima di eliminare il documento, elimina l'immagine associata
            if (plantData.imageUrl) {
                await deleteImage(plantData.imageUrl);
            }
            await db.collection('plants').doc(plantId).delete();
            showToast('Pianta eliminata con successo!', 'success');

            // Rimuovi anche da tutti i giardini degli utenti se presente
            const usersSnapshot = await db.collection('users').get();
            const batch = db.batch();
            usersSnapshot.forEach(userDoc => {
                const userGardenRef = userDoc.ref.collection('myGarden').doc(plantId);
                batch.delete(userGardenRef);
            });
            await batch.commit();

            resetPlantForms(); // Chiude la modale e resetta
            await fetchAndDisplayPlants();
            await fetchAndDisplayMyGarden();
        } else {
            showToast('Pianta non trovata.', 'error');
        }
    } catch (error) {
        console.error("Errore nell'eliminazione della pianta:", error);
        showToast(`Errore nell'eliminazione: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

/**
 * Aggiunge una pianta alla sottocollezione 'myGarden' dell'utente autenticato.
 * @param {string} plantId - L'ID della pianta da aggiungere.
 */
async function addToMyGarden(plantId) {
    if (!firebase.auth().currentUser) {
        showToast('Devi essere loggato per aggiungere piante al tuo giardino.', 'info');
        return;
    }
    showLoadingSpinner();
    try {
        const userId = firebase.auth().currentUser.uid;
        const plantRef = db.collection('plants').doc(plantId);
        const plantDoc = await plantRef.get();

        if (plantDoc.exists) {
            const plantData = plantDoc.data();
            const userGardenRef = db.collection('users').doc(userId).collection('myGarden').doc(plantId);
            await userGardenRef.set(plantData); // Aggiungi la pianta al sottocollection dell'utente
            showToast('Pianta aggiunta al tuo giardino!', 'success');
            await fetchAndDisplayMyGarden(); // Aggiorna la vista del giardino
        } else {
            showToast('Pianta non trovata.', 'error');
        }
    } catch (error) {
        console.error("Errore nell'aggiunta al giardino:", error);
        showToast(`Errore nell'aggiunta al giardino: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

/**
 * Rimuove una pianta dalla sottocollezione 'myGarden' dell'utente autenticato.
 * @param {string} plantId - L'ID della pianta da rimuovere.
 */
async function removePlantFromMyGarden(plantId) {
    if (!firebase.auth().currentUser) {
        showToast('Devi essere loggato per rimuovere piante dal tuo giardino.', 'info');
        return;
    }
    // Utilizza una modal personalizzata invece di confirm()
    // Per ora, useremo un placeholder per non bloccare
    if (!confirm('Sei sicuro di voler rimuovere questa pianta dal tuo giardino?')) {
        return;
    }
    showLoadingSpinner();
    try {
        const userId = firebase.auth().currentUser.uid;
        const userGardenRef = db.collection('users').doc(userId).collection('myGarden').doc(plantId);
        await userGardenRef.delete();
        showToast('Pianta rimossa dal tuo giardino!', 'success');
        await fetchAndDisplayMyGarden(); // Aggiorna la vista del giardino
    } catch (error) {
        console.error("Errore nella rimozione dal giardino:", error);
        showToast(`Errore nella rimozione dal giardino: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

/**
 * Filtra e ordina le piante visualizzate nella galleria principale.
 * Questa funzione è chiamata ogni volta che un filtro o l'ordinamento cambia.
 */
function filterPlants() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const minTemp = parseFloat(tempMinFilter.value);
    const maxTemp = parseFloat(tempMaxFilter.value);
    const climateZone = climateZoneFilter.value; // Recupera il valore del filtro per zona climatica

    let filteredPlants = allPlants.filter(plant => {
        // Filtro per ricerca testuale (nome o descrizione)
        const matchesSearch = plant.name.toLowerCase().includes(searchTerm) ||
                              (plant.description && plant.description.toLowerCase().includes(searchTerm));
        // Filtro per categoria
        const matchesCategory = category === 'All' || plant.category === category;

        // Filtro per temperatura
        const matchesTemp = (isNaN(minTemp) || (plant.minTemp !== null && plant.minTemp >= minTemp)) &&
                            (isNaN(maxTemp) || (plant.maxTemp !== null && plant.maxTemp <= maxTemp));

        // Filtro per zona climatica (assicurati che 'climateZones' esista nei tuoi dati pianta)
        // La tua HTML ha valori come "Tropicale", "Temperata", ecc.
        const matchesClimateZone = climateZone === 'All' || (plant.climateZones && plant.climateZones.includes(climateZone));

        return matchesSearch && matchesCategory && matchesTemp && matchesClimateZone;
    });

    // Applica l'ordinamento
    filteredPlants.sort((a, b) => {
        const [field, order] = currentSortBy.split('_');
        let valA = a[field];
        let valB = b[field];

        // Gestione dei valori null/undefined per l'ordinamento numerico
        // Metti i null/undefined all'inizio per ASC o alla fine per DESC
        if (typeof valA === 'number' && typeof valB === 'number') {
            if (valA === null) valA = (order === 'asc' ? -Infinity : Infinity);
            if (valB === null) valB = (order === 'asc' ? -Infinity : Infinity);
        } else if (valA === null || valA === undefined) {
             valA = (order === 'asc' ? '' : 'zzzzzzzzzz'); // Tratta null/undefined come stringa vuota o molto grande
        }
        if (valB === null || valB === undefined) {
             valB = (order === 'asc' ? '' : 'zzzzzzzzzz');
        }

        if (order === 'asc') {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });

    // Aggiorna la galleria con le piante filtrate e ordinate
    if (gardenContainer) {
        gardenContainer.innerHTML = ''; // Pulisci la galleria
        if (filteredPlants.length === 0) {
            gardenContainer.innerHTML = '<p class="empty-message">Nessuna pianta trovata con i filtri selezionati.</p>';
        } else {
            filteredPlants.forEach(plant => {
                gardenContainer.appendChild(createPlantCard(plant, 'all'));
            });
        }
    }
}

/**
 * Aggiorna la visibilità tra la galleria di tutte le piante e il proprio giardino.
 */
function updateGalleryVisibility() {
    if (isMyGardenCurrentlyVisible) {
        if (myGardenContainer) myGardenContainer.style.display = 'grid'; // O 'block'
        if (gardenContainer) gardenContainer.style.display = 'none';
        if (plantsSectionHeader) plantsSectionHeader.textContent = 'Il Mio Giardino';
        if (emptyGardenMessage) emptyGardenMessage.style.display = myGarden.length === 0 ? 'block' : 'none';
    } else {
        if (myGardenContainer) myGardenContainer.style.display = 'none';
        if (gardenContainer) gardenContainer.style.display = 'grid'; // O 'block'
        if (plantsSectionHeader) plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
        // Il messaggio di "galleria vuota" per allPlantsGallery è gestito in filterPlants()
    }
}

// Funzioni per la gestione delle modali (aggiunta/modifica/dettagli)
/**
 * Mostra il form per aggiungere una nuova pianta all'interno della modale.
 */
function showAddPlantForm() {
    if (!zoomedCardContent || !newPlantFormTemplate || !cardModal) {
        console.error("Elementi DOM per il form di aggiunta non trovati.");
        showToast("Errore: Impossibile aprire il form di aggiunta pianta.", 'error');
        return;
    }

    zoomedCardContent.innerHTML = ''; // Pulisce qualsiasi contenuto precedente
    const clonedForm = newPlantFormTemplate.cloneNode(true); // Clona il div template e i suoi figli
    clonedForm.style.display = 'block'; // Rende visibile il contenuto clonato
    zoomedCardContent.appendChild(clonedForm); // Inserisce il form clonato

    cardModal.style.display = 'flex'; // Mostra la modale

    currentPlantIdToUpdate = null; // Assicurati che l'ID di aggiornamento sia nullo

    // Resetta i campi del form clonato
    const newPlantForm = zoomedCardContent.querySelector('#new-plant-form');
    if (newPlantForm) newPlantForm.reset();

    // Assicurati che l'anteprima immagine sia nascosta e l'URL nascosto sia vuoto
    const newPlantImagePreviewElement = newPlantForm.querySelector('[data-form-field="newPlantImagePreview"]');
    if (newPlantImagePreviewElement) {
        newPlantImagePreviewElement.src = '';
        newPlantImagePreviewElement.style.display = 'none';
    }
    const newUploadedImageUrlElement = newPlantForm.querySelector('[data-form-field="newUploadedImageUrl"]');
    if(newUploadedImageUrlElement) newUploadedImageUrlElement.value = '';
}

/**
 * Mostra il form per aggiornare una pianta esistente all'interno della modale.
 * @param {string} plantId - L'ID della pianta da aggiornare.
 */
async function showUpdatePlantForm(plantId) {
    if (!plantId) {
        console.error('ID pianta non fornito per l\'aggiornamento.');
        showToast('Errore: ID pianta non fornito per l\'aggiornamento.', 'error');
        return;
    }
    if (!zoomedCardContent || !updatePlantFormTemplate || !cardModal) {
        console.error("Elementi DOM per il form di aggiornamento non trovati.");
        showToast("Errore: Impossibile aprire il form di aggiornamento pianta.", 'error');
        return;
    }

    showLoadingSpinner();
    try {
        const plantDoc = await db.collection('plants').doc(plantId).get();

        if (plantDoc.exists) {
            const plant = { id: plantDoc.id, ...plantDoc.data() };

            zoomedCardContent.innerHTML = ''; // Pulisci il contenuto precedente
            const clonedForm = updatePlantFormTemplate.cloneNode(true);
            clonedForm.style.display = 'block';
            zoomedCardContent.appendChild(clonedForm);

            cardModal.style.display = 'flex';

            currentPlantIdToUpdate = plant.id;

            // RECUPERA GLI ELEMENTI DEL FORM CLONATO per popolarli
            const updateFormElement = zoomedCardContent.querySelector('#update-plant-form');
            if (updateFormElement) {
                updateFormElement.querySelector('[data-form-field="updatePlantName"]').value = plant.name || '';
                updateFormElement.querySelector('[data-form-field="updatePlantDescription"]').value = plant.description || '';
                updateFormElement.querySelector('[data-form-field="updatePlantCategory"]').value = plant.category || 'Altro';
                updateFormElement.querySelector('[data-form-field="updateMinTemp"]').value = plant.minTemp !== null ? plant.minTemp : '';
                updateFormElement.querySelector('[data-form-field="updateMaxTemp"]').value = plant.maxTemp !== null ? plant.maxTemp : '';
                updateFormElement.querySelector('[data-form-field="updateMinLux"]').value = plant.minLux !== null ? plant.minLux : '';
                updateFormElement.querySelector('[data-form-field="updateMaxLux"]').value = plant.maxLux !== null ? plant.maxLux : '';

                const updatePlantImagePreviewElement = updateFormElement.querySelector('[data-form-field="updatePlantImagePreview"]');
                const updateUploadedImageUrlElement = updateFormElement.querySelector('[data-form-field="updateUploadedImageUrl"]');
                const updatePlantImageUploadElement = updateFormElement.querySelector('[data-form-field="updatePlantImageUpload"]');

                // Popola l'input nascosto con l'URL esistente e mostra l'anteprima
                if (plant.imageUrl) {
                    if (updateUploadedImageUrlElement) updateUploadedImageUrlElement.value = plant.imageUrl;
                    if (updatePlantImagePreviewElement) {
                        updatePlantImagePreviewElement.src = plant.imageUrl;
                        updatePlantImagePreviewElement.style.display = 'block';
                    }
                } else {
                    if (updateUploadedImageUrlElement) updateUploadedImageUrlElement.value = '';
                    if (updatePlantImagePreviewElement) {
                        updatePlantImagePreviewElement.src = '';
                        updatePlantImagePreviewElement.style.display = 'none';
                    }
                }
                if (updatePlantImageUploadElement) updatePlantImageUploadElement.value = ''; // Resetta input file per nuova selezione

            } else {
                console.error("Form di aggiornamento clonato non trovato nel modal content.");
                showToast("Errore interno: form di aggiornamento non disponibile.", 'error');
            }
        } else {
            showToast('Pianta non trovata per l\'aggiornamento.', 'error');
        }
    } catch (error) {
        console.error("Errore nel recupero della pianta per l'aggiornamento:", error);
        showToast('Errore nel recupero della pianta per l\'aggiornamento.', 'error');
    } finally {
        hideLoadingSpinner();
    }
}

/**
 * Mostra i dettagli di una pianta specifica all'interno della modale.
 * @param {string} plantId - L'ID della pianta di cui visualizzare i dettagli.
 */
async function displayPlantDetailsInModal(plantId) {
    showLoadingSpinner();
    try {
        const plantDoc = await db.collection('plants').doc(plantId).get();

        if (plantDoc.exists) {
            const plant = { id: plantDoc.id, ...plantDoc.data() };

            zoomedCardContent.innerHTML = `
                <div class="plant-details-header">
                    <img id="modalImage" src="${plant.imageUrl || 'https://placehold.co/150x150/EEEEEE/333333?text=No+Image'}" alt="${plant.name}" class="plant-details-image">
                    <h2>${plant.name}</h2>
                </div>
                <div class="plant-details-body">
                    <p><strong>Descrizione:</strong> ${plant.description || 'N/A'}</p>
                    <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
                    <p><strong>Temperatura Ideale:</strong> ${plant.minTemp !== null ? plant.minTemp : 'N/A'}°C - ${plant.maxTemp !== null ? plant.maxTemp : 'N/A'}°C</p>
                    <p><strong>Luminosità Ideale:</strong> ${plant.minLux !== null ? plant.minLux : 'N/A'} Lux - ${plant.maxLux !== null ? plant.maxLux : 'N/A'} Lux</p>
                </div>
            `;
        } else {
            console.warn("Pianta non trovata per i dettagli:", plantId);
            zoomedCardContent.innerHTML = `<p>Dettagli pianta non disponibili.</p>`;
        }
    } catch (error) {
        console.error("Errore nel recupero dei dettagli della pianta:", error);
        showToast('Errore nel caricamento dei dettagli della pianta.', 'error');
        zoomedCardContent.innerHTML = `<p>Errore nel caricamento dei dettagli.</p>`;
    } finally {
        cardModal.style.display = 'flex'; // Mostra la modale DOPO aver caricato i dettagli
        hideLoadingSpinner();
    }
}

/**
 * Resetta i form della modale e nasconde la modale stessa.
 */
function resetPlantForms() {
    if (cardModal) cardModal.style.display = 'none';
    if (zoomedCardContent) zoomedCardContent.innerHTML = ''; // Pulisce il contenuto della modale
    currentPlantIdToUpdate = null; // Resetta l'ID della pianta da aggiornare
    hideLoadingSpinner(); // Assicurati che lo spinner sia nascosto
}


// Funzioni per il sensore di luce ambientale
let lightSensor = null;

async function startLightSensor() {
    if ('AmbientLightSensor' in window) {
        try {
            lightSensor = new AmbientLightSensor();
            lightSensor.onreading = () => {
                const lux = lightSensor.illuminance;
                if (currentLuxValueSpan) currentLuxValueSpan.textContent = lux.toFixed(2);
                if (lightFeedbackDiv) {
                    lightFeedbackDiv.textContent = `Luminosità attuale: ${lux.toFixed(2)} Lux.`;
                    // Aggiungi logica di feedback basata sui valori lux
                    if (lux < 50) {
                        lightFeedbackDiv.textContent += ' La stanza è molto buia.';
                    } else if (lux < 200) {
                        lightFeedbackDiv.textContent += ' La stanza è poco illuminata.';
                    } else if (lux < 1000) {
                        lightFeedbackDiv.textContent += ' La stanza è ben illuminata.';
                    } else {
                        lightFeedbackDiv.textContent += ' La stanza è molto luminosa.';
                    }
                }
            };
            lightSensor.onerror = (event) => {
                console.error("Errore sensore luce:", event.error.name, event.error.message);
                showToast(`Errore sensore luce: ${event.error.message}`, 'error');
            };
            lightSensor.start();
            showToast('Sensore di luce avviato!', 'info');
            if (startLightSensorButton) startLightSensorButton.style.display = 'none';
            if (stopLightSensorButton) stopLightSensorButton.style.display = 'block';
        } catch (error) {
            console.error("Impossibile avviare il sensore di luce:", error);
            showToast(`Errore: ${error.message}. Assicurati di essere su HTTPS e di aver concesso i permessi.`, 'error');
        }
    } else {
        showToast('Il tuo browser non supporta il sensore di luce ambientale.', 'error');
        console.warn('AmbientLightSensor non supportato dal browser.');
    }
}

function stopLightSensor() {
    if (lightSensor) {
        lightSensor.stop();
        lightSensor = null;
        showToast('Sensore di luce fermato.', 'info');
        if (startLightSensorButton) startLightSensorButton.style.display = 'block';
        if (stopLightSensorButton) stopLightSensorButton.style.display = 'none';
        if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'N/A';
        if (lightFeedbackDiv) lightFeedbackDiv.textContent = '';
    }
}

// Inizializzazione DOM e Listener eventi: Esegui quando il DOM è completamente caricato
document.addEventListener('DOMContentLoaded', async () => {
    // --- INIZIALIZZAZIONE VARIABILI DOM ESSENZIALI ---
    // Tutte le variabili DOM devono essere inizializzate QUI per essere sicuri che esistano
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    loginButton = document.getElementById('login-button');
    registerButton = document.getElementById('register-button');
    showLoginLink = document.getElementById('show-login');
    showRegisterLink = document.getElementById('show-register');
    // Allineato agli ID del tuo HTML ripristinato
    emailInput = document.getElementById('loginEmail');
    passwordInput = document.getElementById('loginPassword');
    loginError = document.getElementById('login-error');
    registerEmailInput = document.getElementById('registerEmail'); // Assicurati che l'HTML abbia questo ID
    registerPasswordInput = document.getElementById('registerPassword'); // Assicurati che l'HTML abbia questo ID
    registerError = document.getElementById('register-error');
    authStatusSpan = document.getElementById('auth-status');
    logoutButton = document.getElementById('logout-button');
    searchInput = document.getElementById('search-input');
    categoryFilter = document.getElementById('category-filter');
    addNewPlantButton = document.getElementById('add-new-plant-button');
    showAllPlantsButton = document.getElementById('show-all-plants-button');
    showMyGardenButton = document.getElementById('show-my-garden-button');
    plantsSectionHeader = document.getElementById('plants-section-header');
    gardenContainer = document.getElementById('all-plants-gallery');
    myGardenContainer = document.getElementById('my-garden-gallery');
    lightSensorContainer = document.getElementById('light-sensor-container');
    startLightSensorButton = document.getElementById('start-light-sensor');
    stopLightSensorButton = document.getElementById('stop-light-sensor');
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback');
    climateZoneFilter = document.getElementById('climateZoneFilter');
    imageModal = document.getElementById('image-modal');
    zoomedImage = document.getElementById('zoomed-image');
    closeImageModalButton = document.getElementById('close-image-modal');
    cardModal = document.getElementById('card-modal');
    zoomedCardContent = document.getElementById('zoomed-card-content');
    closeCardModalButton = document.getElementById('close-card-modal');
    newPlantFormTemplate = document.getElementById('newPlantFormTemplate');
    updatePlantFormTemplate = document.getElementById('updatePlantFormTemplate');
    emptyGardenMessage = document.getElementById('empty-garden-message');
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    sortBySelect = document.getElementById('sortBySelect');

    // Assicurati che il form di login abbia l'ID 'login-form-element'
    loginFormElement = document.getElementById('login-form-element');

    // Inizializzazione Firebase Firestore e Storage (dipendenti dall'inizializzazione in index.html)
    db = firebase.firestore();
    storage = firebase.storage();
    storageRef = storage.ref();

    // Imposta il flag a true dopo che tutte le variabili DOM sono inizializzate
    isDomReady = true;

    // Chiamata iniziale a updateUIforAuthState per impostare lo stato UI corretto
    // Questo gestisce il caso in cui l'utente è già loggato al caricamento della pagina
    await updateUIforAuthState(firebase.auth().currentUser);

    // --- Event Listener per lo stato di autenticazione (per cambiamenti successivi) ---
    // Questo listener verrà chiamato solo per login/logout successivi al caricamento iniziale
    firebase.auth().onAuthStateChanged(async user => {
        // Avvolgi la chiamata in un setTimeout per dare priorità al rendering del DOM
        setTimeout(async () => {
            await updateUIforAuthState(user);
        }, 0); // 0ms timeout per metterlo in coda alla fine dell'evento loop corrente
    });


    // --- SETUP LISTENER PER I CONTROLLI UI ---
    // Listener per il submit del form di login
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impedisce il ricaricamento della pagina
            await login();
        });
    }

    // Listener per il pulsante di registrazione
    if (registerButton) registerButton.addEventListener('click', register);
    if (logoutButton) logoutButton.addEventListener('click', logout);

    // Listener per i link "Mostra Login" e "Mostra Registrazione"
    if (showLoginLink) showLoginLink.addEventListener('click', () => {
        const loginFormSection = document.getElementById('login-form'); // L'ID della section
        const registerFormSection = document.getElementById('register-form'); // L'ID della section
        if (loginFormSection) loginFormSection.style.display = 'block';
        if (registerFormSection) registerFormSection.style.display = 'none';
        if (loginError) loginError.textContent = '';
    });
    if (showRegisterLink) showRegisterLink.addEventListener('click', () => {
        const loginFormSection = document.getElementById('login-form'); // L'ID della section
        const registerFormSection = document.getElementById('register-form'); // L'ID della section
        if (registerFormSection) registerFormSection.style.display = 'block';
        if (loginFormSection) loginFormSection.style.display = 'none';
        if (registerError) registerError.textContent = '';
    });

    // Listener per i bottoni principali della galleria/giardino
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', showAddPlantForm);
    if (showAllPlantsButton) showAllPlantsButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = false;
        updateGalleryVisibility();
    });
    if (showMyGardenButton) showMyGardenButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = true;
        updateGalleryVisibility();
    });

    // Listener per i filtri e l'ordinamento
    if (searchInput) searchInput.addEventListener('input', filterPlants);
    if (categoryFilter) categoryFilter.addEventListener('change', filterPlants);
    if (tempMinFilter) tempMinFilter.addEventListener('input', filterPlants);
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', filterPlants);
    if (climateZoneFilter) climateZoneFilter.addEventListener('change', filterPlants);
    if (sortBySelect) sortBySelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        filterPlants();
    });


    // Listener per la delega degli eventi sulla galleria delle piante (allPlantsGallery)
    if (gardenContainer) {
        gardenContainer.addEventListener('click', async (event) => {
            const targetButton = event.target.closest('button[data-button-type]');
            if (targetButton) {
                const card = event.target.closest('.plant-card');
                const plantId = card ? card.dataset.plantId : null;
                const buttonType = targetButton.dataset.buttonType;

                if (!plantId) {
                    console.error("ID pianta non trovato sulla card cliccata.");
                    return;
                }

                if (buttonType === 'details') {
                    await displayPlantDetailsInModal(plantId);
                } else if (buttonType === 'addToGarden') {
                    await addToMyGarden(plantId);
                }
            }
        });
    }

    // Listener per la delega degli eventi sul proprio giardino (myGardenGallery)
    if (myGardenContainer) {
        myGardenContainer.addEventListener('click', async (event) => {
            const targetButton = event.target.closest('button[data-button-type]');
            if (targetButton) {
                const card = event.target.closest('.plant-card');
                const plantId = card ? card.dataset.plantId : null;
                const buttonType = targetButton.dataset.buttonType;

                if (!plantId) {
                    console.error("ID pianta non trovato sulla card cliccata.");
                    return;
                }

                if (buttonType === 'details') {
                    await displayPlantDetailsInModal(plantId);
                } else if (buttonType === 'update') {
                    await showUpdatePlantForm(plantId);
                } else if (buttonType === 'delete') {
                    await deletePlant(plantId);
                } else if (buttonType === 'removeFromGarden') {
                    await removePlantFromMyGarden(plantId);
                }
            }
        });
    }

    // Chiusura modali (listener per il click sul bottone 'x' e sullo sfondo della modale)
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => { imageModal.style.display = 'none'; });
    if (imageModal) imageModal.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.style.display = 'none'; });

    if (closeCardModalButton) closeCardModalButton.addEventListener('click', resetPlantForms);
    if (cardModal) cardModal.addEventListener('click', (e) => { if (e.target === cardModal) resetPlantForms(); });


    // Event Listeners per il sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);

    // Event listener per i SUBMIT dei form all'interno della modale (DELEGAZIONE EVENTI)
    // Questo cattura i submit dei form 'new-plant-form' e 'update-plant-form' quando sono clonati nella modale
    if (zoomedCardContent) {
        zoomedCardContent.addEventListener('submit', async (event) => {
            const form = event.target;
            if (form.id === 'new-plant-form' || form.id === 'update-plant-form') {
                event.preventDefault(); // Impedisce il ricaricamento della pagina
                await savePlantToFirestore(event);
            }
        });

        // Event listener per i click all'interno della modale (per i bottoni "Annulla" all'interno dei form clonati)
        zoomedCardContent.addEventListener('click', (event) => {
            const target = event.target;
            if (target.id === 'cancelAddPlant' || target.id === 'cancelUpdatePlant') {
                event.preventDefault(); // Impedisce l'azione predefinita
                resetPlantForms(); // Chiude la modale e pulisce
            }
        });
    }
});
