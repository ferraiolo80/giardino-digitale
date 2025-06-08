// Variabili globali per lo stato dell'applicazione
let allPlants = [];
let myGarden = [];
let currentPlantIdToUpdate = null;
let ambientLightSensor = null;
let isMyGardenCurrentlyVisible = false;
let currentSortBy = 'name_asc';

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
let plantsSectionHeader;
let lightSensorContainer;
let startLightSensorButton;
let stopLightSensorButton;
let currentLuxValueSpan;
let lightFeedbackDiv;
let climateZoneFilter;
let imageModal;
let zoomedImage;
let closeImageModalButton;
let cardModal;
let zoomedCardContent;
let closeCardModalButton;
let newPlantFormTemplate;
let updatePlantFormTemplate;
let emptyGardenMessage;
let tempMinFilter;
let tempMaxFilter;
let sortBySelect;

// Flag per lo stato di preparazione del DOM
let isDomReady = false;

// Funzioni di utilità per UI
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
            if (appContentDiv) appContentDiv.style.display = 'block';
            if (authStatusSpan) authStatusSpan.textContent = `Loggato come: ${user.email}`;
            if (logoutButton) logoutButton.style.display = 'block';
            if (addNewPlantButton) addNewPlantButton.style.display = 'block';

            await fetchAndDisplayPlants();
            await fetchAndDisplayMyGarden();

            isMyGardenCurrentlyVisible = false;
            updateGalleryVisibility();
        } else {
            // Utente non loggato
            if (authContainerDiv) authContainerDiv.style.display = 'flex';
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
function createPlantCard(plant, type = 'all') {
    const plantCard = document.createElement('div');
    plantCard.className = 'plant-card';
    plantCard.dataset.plantId = plant.id;

    plantCard.innerHTML = `
        <img src="${plant.imageUrl || 'https://via.placeholder.com/150'}" alt="${plant.name}" class="plant-image">
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

    // Listener per l'immagine zoomabile
    const cardImage = plantCard.querySelector('.plant-image');
    if (cardImage) {
        cardImage.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita che il click si propaghi al card.dataset.plantId
            if (zoomedImage && imageModal) {
                zoomedImage.src = plant.imageUrl || 'https://via.placeholder.com/150';
                imageModal.style.display = 'block';
            }
        });
    }

    return plantCard;
}

async function fetchAndDisplayPlants() {
    showLoadingSpinner();
    try {
        if (gardenContainer) {
            gardenContainer.innerHTML = '';
        } else {
            console.error("gardenContainer non trovato.");
            return;
        }

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

async function fetchAndDisplayMyGarden() {
    showLoadingSpinner();
    try {
        if (myGardenContainer) {
            myGardenContainer.innerHTML = '';
        } else {
            console.error("myGardenContainer non trovato.");
            return;
        }

        const userId = firebase.auth().currentUser.uid;
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


async function uploadImage(file, folderPath) {
    if (!file) return null;
    const storageRefChild = storageRef.child(`${folderPath}/${file.name}`);
    const snapshot = await storageRefChild.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    return downloadURL;
}

async function deleteImage(imageUrl) {
    if (!imageUrl) return;
    try {
        const imageRef = storage.refFromURL(imageUrl);
        await imageRef.delete();
        console.log("Immagine eliminata con successo:", imageUrl);
    } catch (error) {
        console.error("Errore nell'eliminazione dell'immagine:", error);
        // Non mostrare toast all'utente per errori di eliminazione immagine, potrebbero essere immagini predefinite.
    }
}


async function savePlantToFirestore(event) {
    event.preventDefault();

    const form = event.target;
    let plantData = {};
    let imageFile = null;
    let existingImageUrl = null;
    let tempIdToUpdate = null;

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
        };

    } else if (form.id === 'update-plant-form') {
        tempIdToUpdate = currentPlantIdToUpdate;
        const updatePlantNameInput = form.querySelector('[data-form-field="updatePlantName"]');
        const updatePlantDescriptionInput = form.querySelector('[data-form-field="updatePlantDescription"]');
        const updatePlantCategoryInput = form.querySelector('[data-form-field="updatePlantCategory"]');
        const updateMinTempInput = form.querySelector('[data-form-field="updateMinTemp"]');
        const updateMaxTempInput = form.querySelector('[data-form-field="updateMaxTemp"]');
        const updateMinLuxInput = form.querySelector('[data-form-field="updateMinLux"]');
        const updateMaxLuxInput = form.querySelector('[data-form-field="updateMaxLux"]');
        const updatePlantImageUploadInput = form.querySelector('[data-form-field="updatePlantImageUpload"]');
        const updateUploadedImageUrlInput = form.querySelector('[data-form-field="updateUploadedImageUrl"]');

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
        if (!imageFile && existingImageUrl) {
            plantData.imageUrl = existingImageUrl;
        } else if (!imageFile && !existingImageUrl) {
             plantData.imageUrl = firebase.firestore.FieldValue.delete();
        }
    }

    showLoadingSpinner();
    try {
        let imageUrl = existingImageUrl;

        if (imageFile) {
            imageUrl = await uploadImage(imageFile, 'plant_images');
            if (form.id === 'update-plant-form' && existingImageUrl && existingImageUrl !== imageUrl) {
                 await deleteImage(existingImageUrl);
            }
        }
        plantData.imageUrl = imageUrl;

        if (form.id === 'new-plant-form') {
            await db.collection('plants').add(plantData);
            showToast('Pianta aggiunta con successo!', 'success');
        } else if (form.id === 'update-plant-form') {
            await db.collection('plants').doc(tempIdToUpdate).update(plantData);
            showToast('Pianta aggiornata con successo!', 'success');
        }
        resetPlantForms();
        await fetchAndDisplayPlants();
        await fetchAndDisplayMyGarden();
    } catch (error) {
        console.error("Errore nel salvataggio della pianta:", error);
        showToast(`Errore nel salvataggio della pianta: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}


async function deletePlant(plantId) {
    if (!plantId) return;

    if (!confirm('Sei sicuro di voler eliminare questa pianta? Questa azione è irreversibile.')) {
        return;
    }

    showLoadingSpinner();
    try {
        const plantDoc = await db.collection('plants').doc(plantId).get();
        if (plantDoc.exists) {
            const plantData = plantDoc.data();
            if (plantData.imageUrl) {
                await deleteImage(plantData.imageUrl);
            }
            await db.collection('plants').doc(plantId).delete();
            showToast('Pianta eliminata con successo!', 'success');
            const usersSnapshot = await db.collection('users').get();
            const batch = db.batch();
            usersSnapshot.forEach(userDoc => {
                const userGardenRef = userDoc.ref.collection('myGarden').doc(plantId);
                batch.delete(userGardenRef);
            });
            await batch.commit();

            resetPlantForms();
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
            await userGardenRef.set(plantData);
            showToast('Pianta aggiunta al tuo giardino!', 'success');
            await fetchAndDisplayMyGarden();
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

async function removePlantFromMyGarden(plantId) {
    if (!firebase.auth().currentUser) {
        showToast('Devi essere loggato per rimuovere piante dal tuo giardino.', 'info');
        return;
    }
    if (!confirm('Sei sicuro di voler rimuovere questa pianta dal tuo giardino?')) {
        return;
    }
    showLoadingSpinner();
    try {
        const userId = firebase.auth().currentUser.uid;
        const userGardenRef = db.collection('users').doc(userId).collection('myGarden').doc(plantId);
        await userGardenRef.delete();
        showToast('Pianta rimossa dal tuo giardino!', 'success');
        await fetchAndDisplayMyGarden();
    } catch (error) {
        console.error("Errore nella rimozione dal giardino:", error);
        showToast(`Errore nella rimozione dal giardino: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}


function filterPlants() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const minTemp = parseFloat(tempMinFilter.value);
    const maxTemp = parseFloat(tempMaxFilter.value);
    const climateZone = climateZoneFilter.value;

    let filteredPlants = allPlants.filter(plant => {
        const matchesSearch = plant.name.toLowerCase().includes(searchTerm) ||
                              (plant.description && plant.description.toLowerCase().includes(searchTerm));
        const matchesCategory = category === 'All' || plant.category === category;

        const matchesTemp = (isNaN(minTemp) || (plant.minTemp !== null && plant.minTemp >= minTemp)) &&
                            (isNaN(maxTemp) || (plant.maxTemp !== null && plant.maxTemp <= maxTemp));

        const matchesClimateZone = climateZone === 'All' || (plant.climateZones && plant.climateZones.includes(climateZone));

        return matchesSearch && matchesCategory && matchesTemp && matchesClimateZone;
    });

    filteredPlants.sort((a, b) => {
        const [field, order] = currentSortBy.split('_');
        let valA = a[field];
        let valB = b[field];

        if (typeof valA === 'number' && typeof valB === 'number') {
            if (valA === null) valA = -Infinity;
            if (valB === null) valB = -Infinity;
        } else if (valA === null || valA === undefined) {
             valA = '';
        }
        if (valB === null || valB === undefined) {
             valB = '';
        }

        if (order === 'asc') {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });

    if (gardenContainer) {
        gardenContainer.innerHTML = '';
        if (filteredPlants.length === 0) {
            gardenContainer.innerHTML = '<p class="empty-message">Nessuna pianta trovata con i filtri selezionati.</p>';
        } else {
            filteredPlants.forEach(plant => {
                gardenContainer.appendChild(createPlantCard(plant, 'all'));
            });
        }
    }
}

function updateGalleryVisibility() {
    if (isMyGardenCurrentlyVisible) {
        if (myGardenContainer) myGardenContainer.style.display = 'grid';
        if (gardenContainer) gardenContainer.style.display = 'none';
        if (plantsSectionHeader) plantsSectionHeader.textContent = 'Il Mio Giardino';
        if (emptyGardenMessage) emptyGardenMessage.style.display = myGarden.length === 0 ? 'block' : 'none';
    } else {
        if (myGardenContainer) myGardenContainer.style.display = 'none';
        if (gardenContainer) gardenContainer.style.display = 'grid';
        if (plantsSectionHeader) plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
    }
}

// Funzioni per la gestione delle modali (aggiunta/modifica/dettagli)
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

    const newPlantForm = zoomedCardContent.querySelector('#new-plant-form');
    if (newPlantForm) newPlantForm.reset();

    const newPlantImagePreviewElement = newPlantForm.querySelector('[data-form-field="newPlantImagePreview"]');
    if (newPlantImagePreviewElement) {
        newPlantImagePreviewElement.src = '';
        newPlantImagePreviewElement.style.display = 'none';
    }
    const newUploadedImageUrlElement = newPlantForm.querySelector('[data-form-field="newUploadedImageUrl"]');
    if(newUploadedImageUrlElement) newUploadedImageUrlElement.value = '';
}

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

async function displayPlantDetailsInModal(plantId) {
    showLoadingSpinner();
    try {
        const plantDoc = await db.collection('plants').doc(plantId).get();

        if (plantDoc.exists) {
            const plant = { id: plantDoc.id, ...plantDoc.data() };

            zoomedCardContent.innerHTML = `
                <div class="plant-details-header">
                    <img id="modalImage" src="${plant.imageUrl || 'https://via.placeholder.com/150'}" alt="${plant.name}" class="plant-details-image">
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
        cardModal.style.display = 'flex';
        hideLoadingSpinner();
    }
}

function resetPlantForms() {
    if (cardModal) cardModal.style.display = 'none';
    if (zoomedCardContent) zoomedCardContent.innerHTML = '';
    currentPlantIdToUpdate = null;
}

// Funzioni per il sensore di luce
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

// Inizializzazione DOM e Listener eventi
document.addEventListener('DOMContentLoaded', async () => {
    // --- INIZIALIZZAZIONE VARIABILI DOM ESSENZIALI ---
    // Tutte le variabili DOM devono essere inizializzate QUI
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
    loginButton = document.getElementById('login-button');
    registerButton = document.getElementById('register-button');
    showLoginLink = document.getElementById('show-login');
    showRegisterLink = document.getElementById('show-register');
    emailInput = document.getElementById('email');
    passwordInput = document.getElementById('password');
    loginError = document.getElementById('login-error');
    registerEmailInput = document.getElementById('register-email');
    registerPasswordInput = document.getElementById('register-password');
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


    // Inizializzazione Firebase Firestore e Storage
    // Queste variabili sono dipendenti dall'inizializzazione di Firebase che avviene in index.html
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
        await updateUIforAuthState(user);
    });

    // --- SETUP LISTENER DOPO INIZIALIZZAZIONE DOM ---
    if (loginButton) loginButton.addEventListener('click', login);
    if (registerButton) registerButton.addEventListener('click', register);
    if (logoutButton) logoutButton.addEventListener('click', logout);
    if (showLoginLink) showLoginLink.addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        if (loginError) loginError.textContent = '';
    });
    if (showRegisterLink) showRegisterLink.addEventListener('click', () => {
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('login-form').style.display = 'none';
        if (registerError) registerError.textContent = '';
    });

    if (addNewPlantButton) addNewPlantButton.addEventListener('click', showAddPlantForm);
    if (showAllPlantsButton) showAllPlantsButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = false;
        updateGalleryVisibility();
    });
    if (showMyGardenButton) showMyGardenButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = true;
        updateGalleryVisibility();
    });

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
            const card = event.target.closest('.plant-card');
            if (card) {
                const plantId = card.dataset.plantId;
                const buttonType = event.target.dataset.buttonType;

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
            const card = event.target.closest('.plant-card');
            if (card) {
                const plantId = card.dataset.plantId;
                const buttonType = event.target.dataset.buttonType;

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

    // Chiusura modali
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => { imageModal.style.display = 'none'; });
    if (imageModal) imageModal.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.style.display = 'none'; });

    if (closeCardModalButton) closeCardModalButton.addEventListener('click', resetPlantForms);
    if (cardModal) cardModal.addEventListener('click', (e) => { if (e.target === cardModal) resetPlantForms(); });


    // Event Listeners per il sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);

    // Event listener per i SUBMIT dei form all'interno della modale (DELEGAZIONE EVENTI)
    if (zoomedCardContent) {
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
