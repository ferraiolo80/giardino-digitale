// Variabili globali per lo stato dell'applicazione
let allPlants = [];
let myGarden = []; // Inizializza come array vuoto
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
let googleLensButton; //variabile per google lens

// Variabili per le Modal
let imageModal; // Modal per zoom immagine
let zoomedImage; // Immagine nella modal di zoom
let cardModal; // NUOVA: Modal per zoom card completa
let zoomedCardContent; // Contenuto della card zoomata
let closeImageModalButton; // Bottone di chiusura per modal immagine
let closeCardModalButton; // Bottone di chiusura per modal card

let loadingSpinner; // Spinner di caricamento
let toastContainer; // Contenitore per i toast

let getClimateButton;       // Variabile per il bottone "Ottieni Clima"
let locationStatusDiv;      // Variabile per il div di stato della posizione
let climateZoneFilter;
let weatherForecastDiv

//let newPlantImageUploadInput;
//let newUploadedImageUrlInput;
let newPlantImagePreview;
let newPlantForm;
let updatePlantNameInput; // Nuovo
let updatePlantDescriptionInput; // Nuovo
let updatePlantCategoryInput; // Nuovo
let updateMinTempInput; // Nuovo
let updateMaxTempInput; // Nuovo
let updateMinLuxInput; // Nuovo
let updateMaxLuxInput; // Nuovo
let updatePlantImageUploadInput;
let updateUploadedImageUrlInput;
let updatePlantImagePreview;
let updatePlantForm; // Assicurati di avere un riferimento al form per "Update Plant" (es. `#update-plant-form`)
let loginForm; // Aggiungi questa riga
let registerForm; // Aggiungi questa riga
let emptyGardenMessage;

const CLIMATE_TEMP_RANGES = {
    'Mediterraneo': { min: 5, max: 35 },
    'Temperato': { min: -10, max: 30 },
    'Tropicale': { min: 18, max: 40 },
    'Subtropicale': { min: 10, max: 38 },
    'Boreale/Artico': { min: -40, max: 20 },
    'Arido': { min: 0, max: 45 },
    };

let db; // Istanza di Firestore
let storage; // Per Firebase Storage
let storageRef; // Per la reference del root di Storage

// =======================================================
// 1. FUNZIONI UTILITY (Feedback Utente e Validazione)
// =======================================================

// Mostra lo spinner di caricamento
function showLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex';
    }
}

// Nasconde lo spinner di caricamento
function hideLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

/**
 * Carica un'immagine su Firebase Storage e restituisce l'URL pubblico.
 * @param {File} file Il file immagine da caricare.
 * @returns {Promise<string>} Una Promise che si risolve con l'URL pubblico dell'immagine.
 */
async function uploadImageAndGetUrl(file) {
    if (!file) {
        console.warn("Nessun file fornito per il caricamento.");
        return null;
    }

    const storagePath = `plant_images/${Date.now()}_${file.name}`;
    const imageRef = storageRef.child(storagePath); // storageRef ORA DEVE ESSERE DEFINITO
    const uploadTask = imageRef.put(file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            snapshot => {
                // Puoi aggiungere qui una logica per la percentuale di caricamento
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                // console.log('Upload is ' + progress + '% done');
            },
            error => {
                console.error("Errore durante l'upload dell'immagine:", error);
                reject(error);
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                    resolve(downloadURL);
                }).catch(error => {
                    console.error("Errore nell'ottenere l'URL di download:", error);
                    reject(error);
                });
            }
        );
    });
}

function showAddPlantForm() {
    if (!zoomedCardContent || !newPlantFormTemplate || !cardModal) {
        console.error("Elementi DOM per il form di aggiunta non trovati.");
        showToast("Errore: Impossibile aprire il form di aggiunta pianta.", 'error');
        return;
    }

    zoomedCardContent.innerHTML = '';
    const clonedForm = newPlantFormTemplate.cloneNode(true);
    clonedForm.style.display = 'block';
    zoomedCardContent.appendChild(clonedForm);

    cardModal.style.display = 'flex';

    currentPlantIdToUpdate = null;

    const newPlantForm = zoomedCardContent.querySelector('#new-plant-form'); // Ottieni il riferimento al form clonato
    if (newPlantForm) newPlantForm.reset();

    // Accedi agli elementi dell'immagine dal form clonato
    const newPlantImagePreviewElement = newPlantForm.querySelector('[data-form-field="newPlantImagePreview"]');
    if (newPlantImagePreviewElement) {
        newPlantImagePreviewElement.src = '';
        newPlantImagePreviewElement.style.display = 'none';
    }
    const newUploadedImageUrlElement = newPlantForm.querySelector('[data-form-field="newUploadedImageUrl"]');
    if (newUploadedImageUrlElement) newUploadedImageUrlElement.value = '';
}
// Mostra un messaggio toast
function showToast(message, type = 'info', duration = 3000) {
    if (!toastContainer) {
        console.warn('Toast container non trovato.');
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Mostra il toast con animazione
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Nascondi e rimuovi il toast dopo la durata specificata
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
    }, duration);
}

// Valida i campi del form di aggiunta/modifica pianta
function validatePlantForm(plantData, isUpdate = false) {
    let isValid = true;
    const formElement = isUpdate ? updatePlantCard : newPlantCard;
    clearFormValidationErrors(formElement); // Pulisce errori precedenti

    const fields = [
        { id: isUpdate ? 'updatePlantName' : 'newPlantName', value: plantData.name, message: 'Il nome è obbligatorio.' },
        { id: isUpdate ? 'updatePlantSunlight' : 'newPlantSunlight', value: plantData.sunlight, message: 'L\'esposizione al sole è obbligatoria.' },
        { id: isUpdate ? 'updatePlantWatering' : 'newPlantWatering', value: plantData.watering, message: 'La frequenza di innaffiatura è obbligatoria.' },
        { id: isUpdate ? 'updatePlantCategory' : 'newPlantCategory', value: plantData.category, message: 'La categoria è obbligatoria.' }
    ];

    for (const field of fields) {
        if (!field.value || (typeof field.value === 'string' && field.value.trim() === '')) {
            showFormValidationError(field.id, field.message);
            isValid = false;
        }
    }

    // Validazione lux min/max
    const luxMin = plantData.idealLuxMin !== null ? parseFloat(plantData.idealLuxMin) : null;
    const luxMax = plantData.idealLuxMax !== null ? parseFloat(plantData.idealLuxMax) : null;

    if (plantData.idealLuxMin !== null && (isNaN(luxMin) || luxMin < 0)) {
        showFormValidationError(isUpdate ? 'updatePlantIdealLuxMin' : 'newPlantIdealLuxMin', 'Lux Min deve essere un numero positivo.');
        isValid = false;
    }
    if (plantData.idealLuxMax !== null && (isNaN(luxMax) || luxMax < 0)) {
        showFormValidationError(isUpdate ? 'updatePlantIdealLuxMax' : 'newPlantIdealLuxMax', 'Lux Max deve essere un numero positivo.');
        isValid = false;
    }
    if (luxMin !== null && luxMax !== null && luxMin > luxMax) {
        showFormValidationError(isUpdate ? 'updatePlantIdealLuxMax' : 'newPlantIdealLuxMax', 'Lux Max non può essere inferiore a Lux Min.');
        isValid = false;
    }

    // Validazione temperature min/max
    const tempMin = plantData.tempMin !== null ? parseFloat(plantData.tempMin) : null;
    const tempMax = plantData.tempMax !== null ? parseFloat(plantData.tempMax) : null;

    if (plantData.tempMin !== null && isNaN(tempMin)) {
        showFormValidationError(isUpdate ? 'updatePlantTempMin' : 'newPlantTempMin', 'Temperatura Min deve essere un numero.');
        isValid = false;
    }
    if (plantData.tempMax !== null && isNaN(tempMax)) {
        showFormValidationError(isUpdate ? 'updatePlantTempMax' : 'newPlantTempMax', 'Temperatura Max deve essere un numero.');
        isValid = false;
    }
    if (tempMin !== null && tempMax !== null && tempMin > tempMax) {
        showFormValidationError(isUpdate ? 'updatePlantTempMax' : 'newPlantTempMax', 'Temperatura Max non può essere inferiore a Temperatura Min.');
        isValid = false;
    }

    return isValid;
}

// Mostra un errore di validazione specifico per un campo del form
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

// Pulisce tutti gli errori di validazione da un form
function clearFormValidationErrors(formElement) {
    if (!formElement) return;
    const errorMessages = formElement.querySelectorAll('.error-message');
    errorMessages.forEach(el => el.remove());
    const inputErrors = formElement.querySelectorAll('.input-error');
    inputErrors.forEach(el => el.classList.remove('input-error'));
}

// =======================================================
// 2. FUNZIONI DI AUTENTICAZIONE E UI PRINCIPALE
// =======================================================

// Aggiorna la UI in base allo stato di autenticazione dell'utente
async function updateUIforAuthState(user) {
    if (user) {
        // Utente loggato
        authContainerDiv.style.display = 'none'; // Usa authContainerDiv
        appContentDiv.style.display = 'block'; // O 'flex'
        authStatusSpan.textContent = `Loggato come: ${user.email}`;
        logoutButton.style.display = 'block';
        addNewPlantButton.style.display = 'block';

        await fetchAndDisplayPlants();
        await fetchAndDisplayMyGarden();

        isMyGardenCurrentlyVisible = false;
        updateGalleryVisibility();
    } else {
        // Utente non loggato
        authContainerDiv.style.display = 'flex'; // O 'block'
        appContentDiv.style.display = 'none';
        authStatusSpan.textContent = 'Non loggato';
        logoutButton.style.display = 'none';
        addNewPlantButton.style.display = 'none';
    }
    hideLoadingSpinner();
}
// Gestisce il login dell'utente
async function handleLogin(e) {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    loginError.textContent = '';
    showLoadingSpinner();
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        showToast('Login effettuato con successo!', 'success');
        // updateUIforAuthState viene chiamato automaticamente da onAuthStateChanged
    } catch (error) {
        loginError.textContent = `Errore di login: ${error.message}`;
        showToast(`Errore di login: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Gestisce la registrazione di un nuovo utente
async function handleRegister(e) {
    e.preventDefault();
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;
    registerError.textContent = '';
    showLoadingSpinner();
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        showToast('Registrato con successo!', 'success');
        // updateUIforAuthState viene chiamato automaticamente da onAuthStateChanged
    } catch (error) {
        registerError.textContent = `Errore di registrazione: ${error.message}`;
        showToast(`Errore di registrazione: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Gestisce il logout dell'utente
async function handleLogout() {
    showLoadingSpinner();
    try {
        await firebase.auth().signOut();
        showToast('Logout effettuato con successo!', 'info');
        // updateUIforAuthState viene chiamato automaticamente da onAuthStateChanged
    } catch (error) {
        showToast(`Errore durante il logout: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Mostra il form di login e nasconde quello di registrazione
function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    clearLoginRegisterErrors(); // Pulisci errori
}

// Mostra il form di registrazione e nasconde quello di login
function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    clearLoginRegisterErrors(); // Pulisci errori
}

// Pulisce gli errori dei form di login/registrazione
function clearLoginRegisterErrors() {
    loginError.textContent = '';
    registerError.textContent = '';
}

// Mostra il form per aggiungere una nuova pianta
function showNewPlantForm() {
    newPlantCard.style.display = 'block';
    updatePlantCard.style.display = 'none';
    // Reset e pulizia del form
    document.getElementById('newPlantForm').reset(); // Resetta tutti i campi
    clearFormValidationErrors(newPlantCard);
    currentPlantIdToUpdate = null; // Resetta l'ID della pianta da aggiornare

    newPlantCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


// Funzione per mostrare il form di aggiornamento pianta e popolarlo

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

            zoomedCardContent.innerHTML = '';
            const clonedForm = updatePlantFormTemplate.cloneNode(true);
            clonedForm.style.display = 'block';
            zoomedCardContent.appendChild(clonedForm);

            cardModal.style.display = 'flex';

            currentPlantIdToUpdate = plant.id;

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
                if (updatePlantImageUploadElement) updatePlantImageUploadElement.value = '';

            } else {
                console.error("Form di aggiornamento clonat non trovato nel modal content.");
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

async function displayPlantDetailsInModal(plantId) {
    if (!plantId) {
        console.error('ID pianta non fornito per i dettagli.');
        return;
    }
    if (!zoomedCardContent || !cardModal) {
        console.error("Elementi DOM per i dettagli modali non trovati.");
        showToast("Errore: Impossibile aprire i dettagli della pianta.", 'error');
        return;
    }

    showLoadingSpinner();
    try {
        const plantDoc = await db.collection('plants').doc(plantId).get();

        if (plantDoc.exists) {
            const plant = { id: plantDoc.id, ...plantDoc.data() };

            zoomedCardContent.innerHTML = ''; // Pulisce qualsiasi contenuto precedente

            const detailsHtml = `
                <div class="plant-details-content">
                    <h2>${plant.name}</h2>
                    <img src="${plant.imageUrl || 'https://via.placeholder.com/150'}" alt="${plant.name}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px;">
                    <p><strong>Descrizione:</strong> ${plant.description || 'Nessuna descrizione.'}</p>
                    <p><strong>Categoria:</strong> ${plant.category || 'Nessuna categoria.'}</p>
                    <p><strong>Temperatura ideale:</strong> ${plant.minTemp !== null ? plant.minTemp : '?'}°C - ${plant.maxTemp !== null ? plant.maxTemp : '?'}°C</p>
                    <p><strong>Luminosità ideale:</strong> ${plant.minLux !== null ? plant.minLux : '?'} - ${plant.maxLux !== null ? plant.maxLux : '?'} Lux</p>
                    </div>
            `;
            zoomedCardContent.innerHTML = detailsHtml;
            cardModal.style.display = 'flex'; // Mostra la modale
        } else {
            showToast('Dettagli pianta non trovati.', 'error');
        }
    } catch (error) {
        console.error("Errore nel recupero dei dettagli della pianta:", error);
        showToast('Errore nel recupero dei dettagli della pianta.', 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Nasconde tutti i form di aggiunta/aggiornamento pianta
function hidePlantForms() {
    if (newPlantCard) {
        newPlantCard.style.display = 'none';
        clearFormValidationErrors(newPlantCard);
    }
    if (updatePlantCard) {
        updatePlantCard.style.display = 'none';
        clearFormValidationErrors(updatePlantCard);
    }
    currentPlantIdToUpdate = null;
}

// =======================================================
// 3. INTERAZIONE CON FIRESTORE (CRUD Piante)
// =======================================================

// Funzione per salvare/aggiornare una pianta nel Firestore

async function savePlantToFirestore(event) {
    event.preventDefault();

    showLoadingSpinner();

    const formElement = event.target;
    const formId = formElement.id;

    let plantData = {};
    let imageUrl = null;

    try {
        if (formId === 'new-plant-form') {
            // Recupera i valori usando data-form-field
            const name = formElement.querySelector('[data-form-field="newPlantName"]').value;
            const description = formElement.querySelector('[data-form-field="newPlantDescription"]').value;
            const category = formElement.querySelector('[data-form-field="newPlantCategory"]').value;
            const minTemp = formElement.querySelector('[data-form-field="newMinTemp"]').value ? Number(formElement.querySelector('[data-form-field="newMinTemp"]').value) : null;
            const maxTemp = formElement.querySelector('[data-form-field="newMaxTemp"]').value ? Number(formElement.querySelector('[data-form-field="newMaxTemp"]').value) : null;
            const minLux = formElement.querySelector('[data-form-field="newMinLux"]').value ? Number(formElement.querySelector('[data-form-field="newMinLux"]').value) : null;
            const maxLux = formElement.querySelector('[data-form-field="newMaxLux"]').value ? Number(formElement.querySelector('[data-form-field="newMaxLux"]').value) : null;
            const imageFile = formElement.querySelector('[data-form-field="newPlantImageUpload"]').files[0];

            plantData = {
                name, description, category, minTemp, maxTemp, minLux, maxLux,
                ownedBy: firebase.auth().currentUser ? firebase.auth().currentUser.uid : null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (imageFile) {
                imageUrl = await uploadImageAndGetUrl(imageFile);
            }
            plantData.imageUrl = imageUrl;

            await db.collection('plants').add(plantData);
            showToast('Pianta aggiunta con successo!');

        } else if (formId === 'update-plant-form' && currentPlantIdToUpdate) {
            // Recupera i valori usando data-form-field
            const name = formElement.querySelector('[data-form-field="updatePlantName"]').value;
            const description = formElement.querySelector('[data-form-field="updatePlantDescription"]').value;
            const category = formElement.querySelector('[data-form-field="updatePlantCategory"]').value;
            const minTemp = formElement.querySelector('[data-form-field="updateMinTemp"]').value ? Number(formElement.querySelector('[data-form-field="updateMinTemp"]').value) : null;
            const maxTemp = formElement.querySelector('[data-form-field="updateMaxTemp"]').value ? Number(formElement.querySelector('[data-form-field="updateMaxTemp"]').value) : null;
            const minLux = formElement.querySelector('[data-form-field="updateMinLux"]').value ? Number(formElement.querySelector('[data-form-field="updateMinLux"]').value) : null;
            const maxLux = formElement.querySelector('[data-form-field="updateMaxLux"]').value ? Number(formElement.querySelector('[data-form-field="updateMaxLux"]').value) : null;

            const imageFile = formElement.querySelector('[data-form-field="updatePlantImageUpload"]').files[0];
            const existingImageUrl = formElement.querySelector('[data-form-field="updateUploadedImageUrl"]').value;

            plantData = {
                name, description, category, minTemp, maxTemp, minLux, maxLux,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (imageFile) {
                imageUrl = await uploadImageAndGetUrl(imageFile);
            } else if (existingImageUrl) {
                imageUrl = existingImageUrl;
            } else {
                imageUrl = null;
            }
            plantData.imageUrl = imageUrl;

            await db.collection('plants').doc(currentPlantIdToUpdate).update(plantData);
            showToast('Pianta aggiornata con successo!');
        }

        resetPlantForms();
        await fetchAndDisplayPlants();
        await fetchAndDisplayMyGarden();

    } catch (error) {
        console.error("Errore nel salvataggio/aggiornamento della pianta:", error);
        showToast('Errore nel salvataggio/aggiornamento della pianta.', 'error');
    } finally {
        hideLoadingSpinner();
    }
}
   
// Funzione per resettare i campi dei form delle piante

function resetPlantForms() {
    if (zoomedCardContent) {
        zoomedCardContent.innerHTML = ''; // Pulisce il contenuto della modale
    }
    if (cardModal) {
        cardModal.style.display = 'none'; // Nasconde la modale
    }
    currentPlantIdToUpdate = null; // Resetta l'ID
    hideLoadingSpinner(); // Assicurati che lo spinner sia nascosto
}

// Elimina una pianta dal database Firestore e dal giardino di tutti gli utenti
async function deletePlantFromDatabase(plantId) {
    showLoadingSpinner();
    try {
        // 1. Elimina la pianta dalla collezione 'plants'
        await db.collection('plants').doc(plantId).delete();
        showToast('Pianta eliminata con successo dal database!', 'success');

        // 2. Rimuovi la pianta dal giardino di OGNI utente
        const gardensSnapshot = await db.collection('gardens').get();
        const batch = db.batch(); // Usa un batch per eliminazioni multiple efficienti

        gardensSnapshot.docs.forEach(doc => {
            let currentGardenPlants = doc.data().plants || [];
            const updatedGardenPlants = currentGardenPlants.filter(plant => plant.id !== plantId);
            if (updatedGardenPlants.length !== currentGardenPlants.length) {
                // Solo se la pianta era presente nel giardino dell'utente
                batch.update(doc.ref, { plants: updatedGardenPlants });
            }
        });
        await batch.commit(); // Esegui tutte le modifiche del batch

        await fetchPlantsFromFirestore(); // Ricarica tutte le piante
        await fetchMyGardenFromFirebase(); // Ricarica il giardino dell'utente corrente (se loggato)

    } catch (error) {
        showToast(`Errore durante l'eliminazione: ${error.message}`, 'error');
        console.error("Errore nell'eliminazione della pianta: ", error);
    } finally {
        hideLoadingSpinner();
    }
}

// Aggiunge una pianta al giardino dell'utente autenticato
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
            // Aggiorna la visualizzazione se il giardino è attualmente visibile o se sono mostrate tutte le piante
            if (isMyGardenCurrentlyVisible) {
                displayMyGarden();
            } else {
                // Se siamo in modalità "Tutte le piante", dobbiamo aggiornare i bottoni "Aggiungi al Giardino"
                displayAllPlants();
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

// Rimuove una pianta dal giardino dell'utente autenticato
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
                // Aggiorna la visualizzazione
                if (isMyGardenCurrentlyVisible) {
                    displayMyGarden();
                } else {
                    // Se siamo in modalità "Tutte le piante", dobbiamo aggiornare i bottoni "Aggiungi al Giardino"
                    displayAllPlants();
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

// Recupera tutte le piante dalla collezione 'plants' di Firestore
async function fetchPlantsFromFirestore() {
    
    try {
        const plantsRef = db.collection('plants');
        const snapshot = await plantsRef.get();
        allPlants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante caricate da Firestore:", allPlants); // Un solo console.log basta
        return allPlants;
    } catch (error) {
        console.error("Errore nel caricamento delle piante:", error);
        showToast('Errore nel caricamento delle piante: ' + error.message, 'error');
        allPlants = []; // Assicurati che sia vuoto in caso di errore
        return [];
    }
}

// Recupera le piante del giardino dell'utente autenticato da Firestore
async function fetchMyGardenFromFirebase() {
    const user = firebase.auth().currentUser;
    if (!user) {
        myGarden = [];
        console.log("Utente non autenticato, giardino vuoto.");
        return [];
    }
    
    try {
        const gardenRef = db.collection('gardens').doc(user.uid);
        const doc = await gardenRef.get();
        if (doc.exists) {
            myGarden = doc.data().plants || [];
            console.log("Giardino caricato da Firebase:", myGarden);
            return myGarden;
        } else {
            myGarden = [];
            console.log("Nessun documento del giardino trovato per l'utente, giardino vuoto.");
            return [];
        }
       
    } catch (error) {
        showToast(`Errore nel caricamento del tuo giardino: ${error.message}`, 'error');
        console.error("Errore nel caricamento del mio giardino: ", error);
        myGarden = [];
        return []; 
        
    }
}


// =======================================================
// 4. VISUALIZZAZIONE E FILTRAGGIO/ORDINAMENTO DELLE PIANTE
// =======================================================

// Applica i filtri e l'ordinamento a un array di piante
function applyFiltersAndSort(plantsToFilter) {
    let filteredPlants = [...plantsToFilter];

    // Controlli nulli per searchInput, categoryFilter, climateZoneFilter, tempMinFilter, tempMaxFilter, sortBySelect
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (searchTerm) {
        filteredPlants = filteredPlants.filter(plant =>
            (plant.name && plant.name.toLowerCase().includes(searchTerm)) ||
            (plant.description && plant.description.toLowerCase().includes(searchTerm)) ||
            (plant.category && plant.category.toLowerCase().includes(searchTerm)) ||
            (plant.climateZone && plant.climateZone.toLowerCase().includes(searchTerm))
        );
    }

    const category = categoryFilter ? categoryFilter.value : 'all'; // Aggiunto controllo null
    if (category !== 'all') {
        filteredPlants = filteredPlants.filter(plant => plant.category === category);
    }

    const selectedClimate = climateZoneFilter ? climateZoneFilter.value : ''; // Aggiunto controllo null
    if (selectedClimate && selectedClimate !== '' && selectedClimate !== 'Sconosciuto') {
        const climateRange = CLIMATE_TEMP_RANGES[selectedClimate];
        if (climateRange) {
            filteredPlants = filteredPlants.filter(plant => {
                const plantMin = parseInt(plant.tempMin);
                const plantMax = parseInt(plant.tempMax);
                if (isNaN(plantMin) || isNaN(plantMax)) {
                    console.warn(`La pianta ${plant.name} ha valori di temperatura non numerici. Ignorata nel filtro clima.`);
                    return false;
                }
                return plantMin >= climateRange.min && plantMax <= climateRange.max;
            });
        } else {
            console.warn(`Intervallo di temperatura non definito per il clima dedotto: ${selectedClimate}. Nessuna pianta sarà mostrata per questo filtro.`);
            filteredPlants = [];
        }
    }

    const tempMin = tempMinFilter ? parseFloat(tempMinFilter.value) : NaN; // Aggiunto controllo null
    const tempMax = tempMaxFilter ? parseFloat(tempMaxFilter.value) : NaN; // Aggiunto controllo null

    // Filtra per temperatura minima
    if (!isNaN(tempMin)) {
        filteredPlants = filteredPlants.filter(plant =>
            (plant.tempMin !== null && plant.tempMax !== null && plant.tempMin >= tempMin) ||
            (plant.tempMin === null && plant.tempMax !== null && plant.tempMax >= tempMin) ||
            (plant.tempMin !== null && plant.tempMax === null && plant.tempMin >= tempMin) ||
            (plant.tempMin === null && plant.tempMax === null)
        );
    }
    // Filtra per temperatura massima
    if (!isNaN(tempMax)) {
        filteredPlants = filteredPlants.filter(plant =>
            (plant.tempMin !== null && plant.tempMax !== null && plant.tempMax <= tempMax) ||
            (plant.tempMin === null && plant.tempMax !== null && plant.tempMax <= tempMax) ||
            (plant.tempMin !== null && plant.tempMax === null && plant.tempMin <= tempMax) ||
            (plant.tempMin === null && plant.tempMax === null)
        );
    }

    // Ordinamento
    switch (sortBySelect ? sortBySelect.value : 'name_asc') { // Aggiunto controllo null per sortBySelect
        case 'name_asc':
            filteredPlants.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'name_desc':
            filteredPlants.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            break;
        case 'category_asc':
            filteredPlants.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
            break;
        case 'category_desc':
            filteredPlants.sort((a, b) => (b.category || '').localeCompare(a.category || ''));
            break;
    }
    return filteredPlants;
}

function getLocation() {
    console.log('getLocation: Funzione avviata.'); // Aggiungi questo
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
    // Assicurati che locationStatusDiv e weatherForecastDiv siano stati inizializzati in DOMContentLoaded
    // Sono variabili globali definite all'inizio del file.
    if (!locationStatusDiv) {
        locationStatusDiv = document.getElementById('location-status'); // Usa l'ID corretto
    }
    if (!weatherForecastDiv) {
        weatherForecastDiv = document.getElementById('weatherForecast');
    }
    if (!climateZoneFilter) { // Inizializza anche climateZoneFilter se non lo è
        climateZoneFilter = document.getElementById('climateZoneFilter');
    }


    if (locationStatusDiv) {
        locationStatusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recupero dati climatici...';
    } else {
        console.warn("Elemento 'location-status' non trovato."); // Messaggio più chiaro
    }
    
    showLoadingSpinner();

    try {
        // Questa è la chiamata all'API Open-Meteo per temperatura e precipitazioni
        const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_mean,precipitation_sum,weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&forecast_days=1&timezone=Europe%2FBerlin`;

        const response = await fetch(weatherApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Estrai dati rilevanti
        const currentTemp = data.current_weather ? data.current_weather.temperature : null;
        const meanTemp2m = data.daily && data.daily.temperature_2m_mean ? data.daily.temperature_2m_mean[0] : null;
        const precipitationSum = data.daily && data.daily.precipitation_sum ? data.daily.precipitation_sum[0] : null;
        const weatherCode = data.daily && data.daily.weathercode ? data.daily.weathercode[0] : null;
        const maxTemp = data.daily && data.daily.temperature_2m_max ? data.daily.temperature_2m_max[0] : null;
        const minTemp = data.daily && data.daily.temperature_2m_min ? data.daily.temperature_2m_min[0] : null;

        let climateZone = 'Sconosciuto';
        
        // Logica per dedurre la zona climatica (puoi raffinarla ulteriormente)
        if (meanTemp2m !== null) {
            if (meanTemp2m >= 25) {
                climateZone = 'Tropicale';
            } else if (meanTemp2m >= 15 && meanTemp2m < 25) {
                climateZone = 'Subtropicale';
            } else if (meanTemp2m >= 5 && meanTemp2m < 15) {
                climateZone = 'Temperato';
            } else if (meanTemp2m >= -5 && meanTemp2m < 5) {
                // Aggiungiamo una logica più specifica per Mediterraneo/Arido qui
                if (precipitationSum !== null && precipitationSum < 5) { // Poca pioggia può indicare arido/mediterraneo
                    climateZone = 'Arido';
                } else {
                    climateZone = 'Mediterraneo'; // O Temperato
                }
            } else if (meanTemp2m < -5) {
                climateZone = 'Boreale/Artico';
            }
            // Affinamento per Mediterraneo/Arido basato su temperatura e precipitazioni
            if (meanTemp2m >= 10 && meanTemp2m <= 20 && precipitationSum !== null && precipitationSum < 2) { 
                climateZone = 'Mediterraneo';
            } else if (meanTemp2m >= 25 && precipitationSum !== null && precipitationSum < 1) {
                climateZone = 'Arido';
            }
        } else if (currentTemp !== null) { // Fallback se media non disponibile
             if (currentTemp >= 25) {
                climateZone = 'Tropicale';
            } else if (currentTemp >= 15 && currentTemp < 25) {
                climateZone = 'Subtropicale';
            } else if (currentTemp >= 5 && currentTemp < 15) {
                climateZone = 'Temperato';
            } else if (currentTemp >= -5 && currentTemp < 5) {
                climateZone = 'Mediterraneo';
            } else if (currentTemp < -5) {
                climateZone = 'Boreale/Artico';
            }
        }

        // Aggiorna lo stato della posizione e il filtro clima
        if (locationStatusDiv) {
            locationStatusDiv.innerHTML = `<i class="fas fa-location-dot"></i> <span>Clima dedotto: <strong>${climateZone}</strong></span>`;
        }
        
        // CORREZIONE QUI: Usa climateZoneFilter e chiama applyFiltersAndSort
        if (climateZoneFilter) {
            climateZoneFilter.value = climateZone; // Imposta il valore del filtro
            // Ora, chiama la tua funzione di filtro.
            // Se applyFiltersAndSort ha bisogno di 'allPlants' o 'myGarden' come argomento,
            // devi passarlo. Presumo che accetti `allPlants` per iniziare a filtrare.
            // Se gestisce lo stato interno (isMyGardenCurrentlyVisible) allora basta chiamarla senza argomenti o con l'argomento corretto.
            // Per sicurezza, la chiamo con 'allPlants' come suggerito dalla firma che hai menzionato.
            applyFiltersAndSort(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Passa l'array corretto a seconda della vista
        }

        // AGGIORNAMENTO: Visualizza le previsioni meteo nel nuovo div
        if (weatherForecastDiv) {
            let weatherHtml = '<h4>Previsioni Meteo (oggi):</h4>';
            if (currentTemp !== null) {
                weatherHtml += `<p><i class="fas fa-temperature-half"></i> Temperatura attuale: <strong>${currentTemp.toFixed(1)}°C</strong></p>`;
            }
            if (maxTemp !== null && minTemp !== null) {
                weatherHtml += `<p><i class="fas fa-thermometer-half"></i> Max/Min: <strong>${maxTemp.toFixed(1)}°C / ${minTemp.toFixed(1)}°C</strong></p>`;
            }
            if (precipitationSum !== null) {
                weatherHtml += `<p><i class="fas fa-cloud-showers-heavy"></i> Precipitazioni: <strong>${precipitationSum.toFixed(1)} mm</strong></p>`;
            }
            if (weatherCode !== null) {
                weatherHtml += `<p><i class="${getWeatherIcon(weatherCode)}"></i> Condizione: ${getWeatherDescription(weatherCode)}</p>`;
            }
            weatherForecastDiv.innerHTML = weatherHtml;
        }

        showToast(`Clima rilevato: ${climateZone}`, 'success');

    } catch (error) {
        console.error('Errore nel recupero dei dati climatici:', error);
        if (locationStatusDiv) {
            locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Errore nel recupero dei dati climatici.`;
        }
        if (weatherForecastDiv) {
            weatherForecastDiv.innerHTML = '<p class="error-message">Impossibile caricare le previsioni meteo.</p>';
        }
        showToast(`Errore nel recupero dei dati climatici: ${error.message}`, 'error');
        
        // Assicurati di resettare o gestire il filtro clima anche in caso di errore
        if (climateZoneFilter) {
            climateZoneFilter.value = ''; // Resetta il filtro clima
            applyFiltersAndSort(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Applica i filtri nuovamente senza il filtro clima
        }
    } finally {
        hideLoadingSpinner();
    }
}

// Funzione per ottenere l'icona Font Awesome dal weathercode di Open-Meteo
function getWeatherIcon(weathercode) {
    // I codici WMO Weather interpretation codes (WWMO)
    // Riferimento: https://www.nodatime.org/tz/WMO%20weather%20codes.html (o la documentazione Open-Meteo)
    switch (weathercode) {
        case 0: return 'fas fa-sun'; // Clear sky
        case 1: // Mainly clear
        case 2: // Partly cloudy
        case 3: return 'fas fa-cloud-sun'; // Overcast
        case 45: // Fog
        case 48: return 'fas fa-smog'; // Depositing rime fog
        case 51: // Drizzle: Light
        case 53: // Drizzle: Moderate
        case 55: return 'fas fa-cloud-drizzle'; // Drizzle: Dense intensity
        case 56: // Freezing Drizzle: Light
        case 57: return 'fas fa-cloud-sleet'; // Freezing Drizzle: Dense intensity
        case 61: // Rain: Light
        case 63: // Rain: Moderate
        case 65: return 'fas fa-cloud-showers-heavy'; // Rain: Heavy intensity
        case 66: // Freezing Rain: Light
        case 67: return 'fas fa-cloud-hail-heavy'; // Freezing Rain: Heavy intensity
        case 71: // Snow fall: Light
        case 73: // Snow fall: Moderate
        case 75: return 'fas fa-snowflake'; // Snow fall: Heavy intensity
        case 77: return 'fas fa-cloud-meatball'; // Snow grains (Non c'è un'icona perfetta, ma si avvicina)
        case 80: // Rain showers: Light
        case 81: // Rain showers: Moderate
        case 82: return 'fas fa-cloud-showers-heavy'; // Rain showers: Violent
        case 85: // Snow showers: Light
        case 86: return 'fas fa-snowflake'; // Snow showers: Heavy
        case 95: return 'fas fa-cloud-bolt'; // Thunderstorm: Light or moderate
        case 96: // Thunderstorm with slight hail
        case 99: return 'fas fa-cloud-bolt'; // Thunderstorm with heavy hail
        default: return 'fas fa-question'; // Unknown
    }
}

// Funzione per ottenere una descrizione testuale dal weathercode
function getWeatherDescription(weathercode) {
    switch (weathercode) {
        case 0: return 'Cielo sereno';
        case 1: return 'Cielo prevalentemente sereno';
        case 2: return 'Parzialmente nuvoloso';
        case 3: return 'Nuvoloso';
        case 45: return 'Nebbia';
        case 48: return 'Nebbia gelata';
        case 51: return 'Pioggerella leggera';
        case 53: return 'Pioggerella moderata';
        case 55: return 'Pioggerella intensa';
        case 56: return 'Pioggerella gelata leggera';
        case 57: return 'Pioggerella gelata intensa';
        case 61: return 'Pioggia leggera';
        case 63: return 'Pioggia moderata';
        case 65: return 'Pioggia intensa';
        case 66: return 'Pioggia gelata leggera';
        case 67: return 'Pioggia gelata intensa';
        case 71: return 'Nevicata leggera';
        case 73: return 'Nevicata moderata';
        case 75: return 'Nevicata intensa';
        case 77: return 'Grandinata leggera';
        case 80: return 'Acquazzoni leggeri';
        case 81: return 'Acquazzoni moderati';
        case 82: return 'Acquazzoni violenti';
        case 85: return 'Nevicate leggere';
        case 86: return 'Nevicate intense';
        case 95: return 'Temporale';
        case 96: return 'Temporale con grandine leggera';
        case 99: return 'Temporale con grandine intensa';
        default: return 'Condizione sconosciuta';
    }
}

// Visualizza le piante nel contenitore appropriato
function displayPlants(plantsToShow) {
    const user = firebase.auth().currentUser;
    const filteredAndSortedPlants = applyFiltersAndSort(plantsToShow);

    let html = '';
    const targetContainer = isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer;
    const otherContainer = isMyGardenCurrentlyVisible ? gardenContainer : myGardenContainer;
    
     if (!targetContainer || !otherContainer || !plantsSectionHeader || !emptyGardenMessage) {
        console.error("Errore: Elementi DOM principali non inizializzati. Impossibile aggiornare la UI.");
        return; // Esci dalla funzione per prevenire ulteriori errori
    }

    // Aggiorna l'header della sezione
    plantsSectionHeader.textContent = isMyGardenCurrentlyVisible ? "Il Mio Giardino" : "Tutte le Piante Disponibili";

    if (filteredAndSortedPlants.length === 0) {
        targetContainer.innerHTML = ''; // Svuota il contenitore
        if (isMyGardenCurrentlyVisible) {
            emptyGardenMessage.style.display = 'block'; // Mostra messaggio giardino vuoto
        } else {
            emptyGardenMessage.style.display = 'none'; // Nascondi messaggio per tutte le piante
            // Puoi aggiungere un messaggio "Nessuna pianta trovata con questi filtri" qui se vuoi
            html = '<p style="text-align: center; grid-column: 1 / -1; padding: 20px; color: #777;">Nessuna pianta trovata con i filtri applicati.</p>';
        }
    } else {
        emptyGardenMessage.style.display = 'none'; // Nascondi messaggio vuoto
        filteredAndSortedPlants.forEach(plant => {
            // Determina se la pianta è già nel giardino per disabilitare il bottone "Aggiungi al Giardino"
            const isInMyGarden = user && myGarden.some(p => p.id === plant.id);
            const addToGardenButtonHtml = user ?
                `<button class="add-to-garden-button" data-plant-id="${plant.id}" ${isInMyGarden ? 'disabled' : ''}>${isInMyGarden ? '<i class="fas fa-check"></i> Già nel Giardino' : '<i class="fas fa-plus-circle"></i> Aggiungi al Giardino'}</button>` :
                `<button class="add-to-garden-button" disabled title="Accedi per aggiungere"><i class="fas fa-plus-circle"></i> Aggiungi al Giardino</button>`;

            // Bottone per rimuovere dal giardino (mostrato solo se nel "Mio Giardino")
            const removeFromGardenButtonHtml = isMyGardenCurrentlyVisible ?
                `<button class="remove-button" data-plant-id="${plant.id}"><i class="fas fa-minus-circle"></i> Rimuovi</button>` : '';

            html += `
                <div class="plant-card" data-plant-id="${plant.id}">
                    ${plant.image ? `<img src="${plant.image}" alt="${plant.name}" class="plant-image">` : ''}
                    <h3>${plant.name}</h3>
                    <p><strong>Esposizione al Sole:</strong> ${plant.sunlight || 'N/A'}</p>
                    <p><strong>Annaffiatura:</strong> ${plant.watering || 'N/A'}</p>
                    <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
                    <div class="card-actions">
                        ${isMyGardenCurrentlyVisible ? removeFromGardenButtonHtml : addToGardenButtonHtml}
                        <button class="update-plant-button" data-plant-id="${plant.id}"><i class="fas fa-edit"></i> Aggiorna</button>
                        <button class="delete-plant-from-db-button" data-plant-id="${plant.id}"><i class="fas fa-trash"></i> Elimina</button>
                    </div>
                </div>
            `;
        });
    }

    targetContainer.innerHTML = html;
    targetContainer.style.display = 'grid'; // Mostra il contenitore target come griglia
    otherContainer.style.display = 'none'; // Nascondi l'altro contenitore
}

// Funzione per mostrare solo le piante nel mio giardino
function displayMyGarden() {
    hidePlantForms(); // Nascondi i form di aggiunta/modifica
    isMyGardenCurrentlyVisible = true;
    displayPlants(myGarden);
    if (addNewPlantButton) addNewPlantButton.style.display = 'none';
    // Assicurati che il giardino sia scrollato in vista
    myGardenContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Funzione per mostrare tutte le piante disponibili
function displayAllPlants() {
    hidePlantForms(); // Nascondi i form di aggiunta/modifica
    isMyGardenCurrentlyVisible = false;
    displayPlants(allPlants);
    if (addNewPlantButton) addNewPlantButton.style.display = 'block';
    // Assicurati che la galleria principale sia scrollata in vista
    gardenContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =======================================================
// 5. FUNZIONI PER IL SENSORE DI LUCE
// =======================================================

// Richiede i permessi per il sensore di luce ambientale
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
            showToast("Permesso sensore luce richiesto. Potrebbe apparire un popup.", 'info');
            return true;
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

// Avvia la lettura del sensore di luce
async function startLightSensor() {
    console.log("DEBUG: startLightSensor() avviata.");
    showLoadingSpinner();

    // Caricamento dati (manteniamo questa parte, è corretta e necessaria)
    allPlants = await fetchPlantsFromFirestore();
    myGarden = await fetchMyGardenFromFirebase();
    console.log("DEBUG: allPlants dopo fetch:", allPlants);
    console.log("DEBUG: myGarden dopo fetch:", myGarden);

    const hasPermission = await requestLightSensorPermission();
    if (!hasPermission) {
        console.log("DEBUG: Permesso sensore negato.");
        hideLoadingSpinner();
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p style="color: red;">Permesso per il sensore di luce negato o non concesso.</p>';
        showToast('Permesso per il sensore di luce negato o non concesso.', 'error');
        // Assicurati che i pulsanti siano nello stato iniziale anche se il permesso è negato
        if (startLightSensorButton) startLightSensorButton.style.display = 'inline-block';
        if (stopLightSensorButton) stopLightSensorButton.style.display = 'none';
        return;
    }

    if ('AmbientLightSensor' in window) {
        console.log("DEBUG: AmbientLightSensor supportato.");
        
        // Se c'è già un sensore attivo, fermalo prima di avviarne uno nuovo
        if (ambientLightSensor) {
            console.log("DEBUG: Fermando sensore esistente prima di riavviare.");
            ambientLightSensor.stop();
            ambientLightSensor = null;
        }

        try {
            // Re-instanzia il sensore con la frequenza
            ambientLightSensor = new AmbientLightSensor({ frequency: 1000 }); // Legge ogni 1 secondo
            console.log("DEBUG: Nuova istanza di AmbientLightSensor creata con frequency.");
            showToast("Avvio sensore di luce...", 'info');

            ambientLightSensor.onreading = () => { // NON PASSARE 'event' come parametro se non lo usi da lì
                const lux = ambientLightSensor.illuminance; // <--- Ritorna all'accesso diretto!
                console.log("DEBUG: Lettura Lux (diretta):", lux); // Log per debug

                // Aggiorna il valore Lux nell'UI usando il tuo ID attuale
                if (currentLuxValueSpan) currentLuxValueSpan.textContent = `${lux ? lux.toFixed(2) : 'N/A'} `;

                // Logica di feedback per le piante (manteniamo questa parte)
                if (myGarden && myGarden.length > 0 && lux != null) {
                    let feedbackHtml = '<h4>Feedback Luce per il tuo Giardino:</h4><ul>';
                    const plantsInGarden = allPlants.filter(plant => myGarden.includes(plant.id));

                    if (plantsInGarden.length > 0) {
                        plantsInGarden.forEach(plant => {
                            const minLux = plant.idealLuxMin;
                            const maxLux = plant.idealLuxMax;

                            if (typeof minLux === 'number' && typeof maxLux === 'number' && !isNaN(minLux) && !isNaN(maxLux)) {
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
                                feedbackHtml += `<li>${plant.name}: <span style="color: grey;">Dati Lux ideali non impostati.</span></li>`;
                            }
                        });
                        feedbackHtml += '</ul>';
                    } else {
                        feedbackHtml += '</ul><p style="color: orange;">Nessuna pianta trovata nel tuo giardino corrisponde alle piante disponibili o con dati Lux ideali impostati. Verifica la sincronizzazione.</p>';
                    }
                    if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = feedbackHtml;
                } else {
                    if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p>Aggiungi piante al tuo giardino per un feedback personalizzato, o il sensore non ha rilevato valori.</p>';
                }
            };

            ambientLightSensor.onerror = (event) => {
                console.error("DEBUG: Errore sensore di luce:", event.error.name, event.error.message);
                if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p style="color: red;">Errore sensore: ${event.error.message}</p>`;
                showToast(`Errore sensore luce: ${event.error.message}`, 'error');
                stopLightSensor(); // Ferma il sensore e resetta UI
                hideLoadingSpinner();
            };

            ambientLightSensor.start();
            console.log("DEBUG: Sensore avviato con successo.");
            
            // Gestione pulsanti (come nella versione che ho modificato in precedenza per te)
            if (stopLightSensorButton) stopLightSensorButton.style.display = 'inline-block';
            if (startLightSensorButton) startLightSensorButton.style.display = 'none';
            hideLoadingSpinner();
            showToast('Misurazione luce avviata!', 'success');

        } catch (error) {
            console.error("DEBUG: Errore nell'avvio del sensore di luce nel try-catch:", error);
            if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = `<p style="color: red;">Errore nell'avvio del sensore: ${error.message}</p>`;
            showToast(`Errore nell'avvio del sensore: ${error.message}`, 'error');
            hideLoadingSpinner();
            // Anche in caso di errore di avvio, resetta i pulsanti allo stato iniziale
            if (startLightSensorButton) startLightSensorButton.style.display = 'inline-block';
            if (stopLightSensorButton) stopLightSensorButton.style.display = 'none';
        }
    } else { // Questo blocco è per quando 'AmbientLightSensor' NON è in window (es. su PC)
        console.log("DEBUG: AmbientLightSensor NON supportato dal browser o dispositivo.");
        if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p style="color: red;">Sensore di luce non supportato dal tuo browser o dispositivo.</p>';
        showToast('Sensore di luce non supportato dal tuo browser o dispositivo.', 'error');
        hideLoadingSpinner();
        // Qui i pulsanti devono rimanere nello stato iniziale
        if (startLightSensorButton) startLightSensorButton.style.display = 'inline-block';
        if (stopLightSensorButton) stopLightSensorButton.style.display = 'none';
    }
}
// Ferma la lettura del sensore di luce
function stopLightSensor() {
    console.log("DEBUG: stopLightSensor() function called.");
    if (ambientLightSensor) {
        try {
            ambientLightSensor.stop(); // Tenta di fermare il sensore
            console.log("DEBUG: Sensore di luce fermato da ambientLightSensor.stop().");
        } catch (e) {
            console.error("DEBUG: Errore nel fermare il sensore:", e);
        }
        ambientLightSensor = null; // Imposta a null DOPO aver tentato di fermarlo
    } else {
        console.log("DEBUG: ambientLightSensor era già null, non c'era nulla da fermare.");
    }

    // Reimposta lo stato dei pulsanti (questo dovrebbe sempre avvenire)
    if (startLightSensorButton) startLightSensorButton.style.display = 'inline-block';
    if (stopLightSensorButton) stopLightSensorButton.style.display = 'none';

    // Reimposta il messaggio di feedback
    if (lightFeedbackDiv) lightFeedbackDiv.innerHTML = '<p>Attiva il sensore per la misurazione e per il feedback specifico sulle piante.</p>';
    if (currentLuxValueSpan) currentLuxValueSpan.textContent = 'N/A lx';
    
    showToast('Misurazione luce fermata.', 'info');
    console.log("DEBUG: UI per sensore luce resettata.");
}


// =======================================================
// 6. GESTIONE MODALI (Immagine e Card Completa)
// =======================================================

// Apre la modal dell'immagine
function openImageModal(imageUrl) {
    if (imageModal && zoomedImage) {
        zoomedImage.src = imageUrl;
        imageModal.style.display = 'flex'; // Usa flex per centrare il contenuto
    }
}

// Apre la modal della card completa
function openCardModal(plant) {
    if (!cardModal || !zoomedCardContent) return;

    let user = firebase.auth().currentUser;
    const isInMyGarden = user && myGarden.some(p => p.id === plant.id);

    const addToGardenButtonHtml = user ?
        `<button class="add-to-garden-button" data-plant-id="${plant.id}" ${isInMyGarden ? 'disabled' : ''}>${isInMyGarden ? '<i class="fas fa-check"></i> Già nel Giardino' : '<i class="fas fa-plus-circle"></i> Aggiungi al Giardino'}</button>` :
        `<button class="add-to-garden-button" disabled title="Accedi per aggiungere"><i class="fas fa-plus-circle"></i> Aggiungi al Giardino</button>`;

    const removeFromGardenButtonHtml = isMyGardenCurrentlyVisible ?
        `<button class="remove-button" data-plant-id="${plant.id}"><i class="fas fa-minus-circle"></i> Rimuovi dal Giardino</button>` : '';

    const htmlContent = `
        ${plant.image ? `<img src="${plant.image}" alt="${plant.name}">` : ''}
        <h3>${plant.name}</h3>
        <p><strong>Descrizione:</strong> ${plant.description || 'N/A'}</p>
        <p><strong>Categoria:</strong> ${plant.category || 'N/A'}</p>
        <p><strong>Esposizione al Sole:</strong> ${plant.sunlight || 'N/A'}</p>
        <p><strong>Lux Ideali:</strong> ${plant.idealLuxMin !== null && plant.idealLuxMax !== null ? `${plant.idealLuxMin} - ${plant.idealLuxMax}` : 'N/A'}</p>
        <p><strong>Annaffiatura:</strong> ${plant.watering || 'N/A'}</p>
        <p><strong>Temperatura Ideale:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
        <div class="card-actions">
            ${isMyGardenCurrentlyVisible ? removeFromGardenButtonHtml : addToGardenButtonHtml}
            <button class="update-plant-button" data-plant-id="${plant.id}"><i class="fas fa-edit"></i> Aggiorna</button>
            <button class="delete-plant-from-db-button" data-plant-id="${plant.id}"><i class="fas fa-trash"></i> Elimina</button>
        </div>
    `;

    zoomedCardContent.innerHTML = htmlContent;
    cardModal.style.display = 'flex'; // Usa flex per centrare il contenuto
}


// =======================================================
// 7. INIZIALIZZAZIONE E GESTIONE EVENTI DOM
// =======================================================

// Quando il DOM è completamente caricato
document.addEventListener('DOMContentLoaded', async () => {
   
    // Inizializza tutte le variabili DOM qui
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden');
    loginButton = document.getElementById('loginButton');
    registerButton = document.getElementById('registerButton');
    showLoginLink = document.getElementById('showLogin');
    showRegisterLink = document.getElementById('showRegister');
    emailInput = document.getElementById('loginEmail');
    passwordInput = document.getElementById('loginPassword');
    loginError = document.getElementById('login-error');
    registerEmailInput = document.getElementById('registerEmail');
    registerPasswordInput = document.getElementById('registerPassword');
    registerError = document.getElementById('register-error');
    authStatusSpan = document.getElementById('auth-status');
    logoutButton = document.getElementById('logoutButton');
    searchInput = document.getElementById('searchInput');
    categoryFilter = document.getElementById('categoryFilter');
    
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    sortBySelect = document.getElementById('sortBy');

    addNewPlantButton = document.getElementById('addNewPlantButton');
    showAllPlantsButton = document.getElementById('showAllPlantsButton');
    showMyGardenButton = document.getElementById('showMyGardenButton');
    newPlantCard = document.getElementById('newPlantCard');
    updatePlantCard = document.getElementById('updatePlantCard');
    plantsSectionHeader = document.getElementById('plantsSectionHeader');
    startLightSensorButton = document.getElementById('startLightSensorButton');
    stopLightSensorButton = document.getElementById('stopLightSensorButton');
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightSensorContainer = document.getElementById('lightSensorContainer'); // Assicurati sia presente anche questa!
    lightFeedbackDiv = document.getElementById('lightFeedback');
    console.log("DEBUG: currentLuxValueSpan è:", currentLuxValueSpan); // Aggiungi questi log
    console.log("DEBUG: lightFeedbackDiv è:", lightFeedbackDiv);     // Per verificare che non siano null
    loadingSpinner = document.getElementById('loading-spinner');
    toastContainer = document.getElementById('toast-container');

    // Modali
    imageModal = document.getElementById('image-modal');
    zoomedImage = document.getElementById('zoomed-image');
    closeImageModalButton = document.querySelector('#image-modal .close-button');
    cardModal = document.getElementById('card-modal');
    zoomedCardContent = document.getElementById('zoomed-card-content');
    closeCardModalButton = document.getElementById('close-card-modal');
    emptyGardenMessage = document.getElementById('empty-garden-message')

    // Inizializzazione delle nuove variabili DOM per la geolocalizzazione
    getClimateButton = document.getElementById('get-climate-button');
    locationStatusDiv = document.getElementById('location-status');
    weatherForecastDiv = document.getElementById('weatherForecast');
    climateZoneFilter = document.getElementById('climateZoneFilter');
    console.log('Valore di climateZoneFilter dopo getElementById:', climateZoneFilter); // AGGIUNGI QUESTA LINEA

    //inizializzazione delle variabili per google lens
    googleLensButton = document.getElementById('googleLensButton');

     // Inizializzazione dei moduli di login/registrazione
    loginForm = document.getElementById('login-form'); // Assicurati che l'ID corrisponda al tuo HTML
    registerForm = document.getElementById('register-form'); // Assicurati che l'ID corrisponda al tuo HTML


    // Inizializzazione variabili DOM per "Add New Plant" form
    //newPlantImageUploadInput = document.getElementById('newPlantImageUpload');
    //newUploadedImageUrlInput = document.getElementById('newUploadedImageUrl');
    newPlantImagePreview = document.getElementById('newPlantImagePreview');
    newPlantForm = document.getElementById('new-plant-card'); 

    // Inizializzazione variabili DOM per "Update Plant" form
    updatePlantImageUploadInput = document.getElementById('updatePlantImageUpload');
    updateUploadedImageUrlInput = document.getElementById('updateUploadedImageUrl');
    updatePlantImagePreview = document.getElementById('updatePlantImagePreview');
    updatePlantForm = document.getElementById('update-plant-card'); 
    updatePlantNameInput = document.getElementById('updatePlantName');
    updatePlantDescriptionInput = document.getElementById('updatePlantDescription');
    updatePlantCategoryInput = document.getElementById('updatePlantCategory');
    updateMinTempInput = document.getElementById('updateMinTemp');
    updateMaxTempInput = document.getElementById('updateMaxTemp');
    updateMinLuxInput = document.getElementById('updateMinLux');
    updateMaxLuxInput = document.getElementById('updateMaxLux');
    
     // Inizializza Firebase all'inizio
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    storage = firebase.storage();
    storageRef = storage.ref();

    // Inizializzazione dei TEMPLATE HTML e del contenitore della modale
    newPlantFormTemplate = document.getElementById('newPlantFormTemplate');
    updatePlantFormTemplate = document.getElementById('updatePlantFormTemplate');
    zoomedCardContent = document.getElementById('zoomed-card-content'); // NUOVO ID!
    
    // Event Listeners per l'autenticazione
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (showLoginLink) showLoginLink.addEventListener('click', showLoginForm);
    if (showRegisterLink) showRegisterLink.addEventListener('click', showRegisterForm);

    // Event Listeners per i filtri e l'ordinamento
    // Ogni volta che un filtro o l'ordinamento cambia, ricarica le piante
    if (searchInput) searchInput.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (categoryFilter) categoryFilter.addEventListener('change', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (climateZoneFilter) { // Verifica che la variabile non sia null
        climateZoneFilter.addEventListener('change', () => {
            // Quando il filtro cambia, ricarica le piante applicando i filtri
            displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
         });
    }      
        
    if (tempMinFilter) tempMinFilter.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', () => displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants));
    if (sortBySelect) sortBySelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });

    // Event Listeners per i bottoni di navigazione principale
    if (showAllPlantsButton) showAllPlantsButton.addEventListener('click', displayAllPlants);
    if (showMyGardenButton) showMyGardenButton.addEventListener('click', displayMyGarden);
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', showNewPlantForm);

    //Event Listener per il bottone google Lens
    if (googleLensButton) {
    googleLensButton.addEventListener('click', () => {
        window.open('https://images.google.com/imghp?hl=it&gws_rd=ssl', '_blank');
        showToast('Verrai reindirizzato alla ricerca per immagine di Google. Carica un\'immagine per l\'identificazione.', 'info');
    });
}
    if (lightSensorContainer) {
            // Usa 'block' o 'flex' a seconda di come è stilizzato 'main-content-section' nel tuo CSS
            // Dalle tue snippet, 'main-content-section' sembra essere 'block' di default o 'flex' per i layout
            // Inizia con 'block', se non va controlla lo style.css per .main-content-section display
            lightSensorContainer.style.display = 'flex'; 
        }

     //event listener per la geolocalizzazione
    if (getClimateButton) getClimateButton.addEventListener('click', getLocation);

    // Event Listeners per i form di aggiunta/aggiornamento
    const saveNewPlantButton = document.getElementById('saveNewPlantButton');
    const cancelNewPlantButton = document.getElementById('cancelNewPlantButton');
    const saveUpdatePlantButton = document.getElementById('saveUpdatePlantButton');
    const cancelUpdatePlantButton = document.getElementById('cancelUpdatePlantButton');
    const deletePlantButton = document.getElementById('deletePlant'); // Bottone eliminazione nel form update

    if (saveNewPlantButton) saveNewPlantButton.addEventListener('click', savePlantToFirestore);
    if (cancelNewPlantButton) cancelNewPlantButton.addEventListener('click', hidePlantForms);
    if (saveUpdatePlantButton) saveUpdatePlantButton.addEventListener('click', savePlantToFirestore);
    if (cancelUpdatePlantButton) cancelUpdatePlantButton.addEventListener('click', hidePlantForms);
    if (deletePlantButton) {
        deletePlantButton.addEventListener('click', async () => {
            if (currentPlantIdToUpdate && confirm('Sei sicuro di voler eliminare questa pianta? Questa azione è irreversibile e la rimuoverà per tutti gli utenti.')) {
                await deletePlantFromDatabase(currentPlantIdToUpdate);
                hidePlantForms(); // Nascondi il form dopo l'eliminazione
                showToast('Pianta eliminata con successo!', 'success');
            }
        });
    }

   if (zoomedCardContent) { // Ora usiamo zoomedCardContent
        zoomedCardContent.addEventListener('submit', async (event) => {
            const form = event.target;
            if (form.id === 'new-plant-form' || form.id === 'update-plant-form') {
                event.preventDefault();
                await savePlantToFirestore(event);
            }
        });

        // Event listener per i click all'interno della modale (per i bottoni "Annulla")
        zoomedCardContent.addEventListener('click', (event) => {
            const target = event.target;
            if (target.id === 'cancelAddPlant' || target.id === 'cancelUpdatePlant') {
                event.preventDefault();
                resetPlantForms();
            }
        });
    }
});

    // Gestione clic sulle card delle piante (aggiungi/rimuovi/aggiorna/elimina/zoom)
    document.body.addEventListener('click', async (event) => {
        // Zoom immagine (solo se clicchi direttamente sull'immagine)
        if (event.target.classList.contains('plant-image')) {
            openImageModal(event.target.src);
            return; // Ferma l'evento per non attivare lo zoom della card
        }
        
        // Zoom card completa (se clicchi sulla card ma non sull'immagine)
        let clickedCard = event.target.closest('.plant-card');
        if (clickedCard && !event.target.classList.contains('plant-image') && !event.target.closest('.card-actions')) {
            const plantId = clickedCard.dataset.plantId;
            const plant = allPlants.find(p => p.id === plantId) || myGarden.find(p => p.id === plantId);
            if (plant) {
                openCardModal(plant);
            }
            return; // Ferma l'evento
        }

              
        // Azioni sui bottoni all'interno delle card (o della card zoomata)
        if (event.target.classList.contains('add-to-garden-button')) {
            const plantIdToAdd = event.target.dataset.plantId;
            await addToMyGarden(plantIdToAdd);
            // Chiudi la modal della card se è aperta
            if (cardModal.style.display === 'flex') cardModal.style.display = 'none';
        } else if (event.target.classList.contains('remove-button')) {
            const plantIdToRemove = event.target.dataset.plantId;
            await removeFromMyGarden(plantIdToRemove);
            // Chiudi la modal della card se è aperta
            if (cardModal.style.display === 'flex') cardModal.style.display = 'none';
        } else if (event.target.classList.contains('update-plant-button')) {
    const plantIdToUpdate = event.target.dataset.plantId;
    // La riga successiva NON è necessaria per la CHIAMATA a showUpdatePlantForm
    // const plantToUpdate = allPlants.find(p => p.id === plantIdToUpdate) || myGarden.find(p => p.id === plantIdToUpdate);

    // DEBUG: Aggiungi un console.log per vedere l'ID
    console.log("ID della pianta per aggiornamento:", plantIdToUpdate);

    if (plantIdToUpdate) { // Verifica che l'ID sia presente
        // CORREZIONE: Passa plantIdToUpdate (la stringa ID)
        showUpdatePlantForm(plantIdToUpdate);
        // Chiudi la modal della card se è aperta
        if (cardModal.style.display === 'flex') cardModal.style.display = 'none';
    } else {
        showToast(`ID della pianta non trovato per l'aggiornamento.`, 'error');
    }
        } else if (event.target.classList.contains('delete-plant-from-db-button')) {
            const plantIdToDelete = event.target.dataset.plantId;
            if (confirm('Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile e la rimuoverà per tutti gli utenti.')) {
                await deletePlantFromDatabase(plantIdToDelete);
                // Chiudi la modal della card se è aperta
                if (cardModal.style.display === 'flex') cardModal.style.display = 'none';
            }
        }
    });


    // Chiusura modali
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => { imageModal.style.display = 'none'; });
    if (imageModal) imageModal.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.style.display = 'none'; });

    // Modifica il listener di chiusura cardModal per chiamare resetPlantForms
    if (closeCardModalButton) closeCardModalButton.addEventListener('click', resetPlantForms); // Chiama reset per pulire e nascondere
    if (cardModal) cardModal.addEventListener('click', (e) => { if (e.target === cardModal) resetPlantForms(); });

    // Event Listeners per il sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);

    // Gestione dello stato di autenticazione iniziale
    // Questo listener è fondamentale e si attiva ogni volta che lo stato di autenticazione cambia (login, logout, refresh)
    // È posizionato qui per assicurarsi che tutti gli elementi DOM siano inizializzati prima che updateUIforAuthState venga chiamato.
    firebase.auth().onAuthStateChanged(async user => {
        await updateUIforAuthState(user);
    });
});
