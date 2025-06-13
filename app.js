// Variabili globali per lo stato dell'applicazione
let allPlants = [];
let myGarden = [];
let currentPlantIdToUpdate = null; // Holds the ID of the plant to update (for modification/deletion)
let ambientLightSensor = null; // Ambient light sensor
let isMyGardenCurrentlyVisible = false; // Flag for current view (true = My Garden, false = All Plants)
let currentSortBy = 'name_asc'; // Default sorting criterion

// DOM Variables (will be initialized in DOMContentLoaded)
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
let plantsSectionHeader; // Plants section header (e.g., "All Available Plants")
let lightSensorContainer;
let startLightSensorButton;
let stopLightSensorButton;
let currentLuxValueSpan;
let lightFeedbackDiv;
let tempMinFilter;
let tempMaxFilter;
let sortBySelect; // Sort selector
let googleLensButton; // Google Lens button variable

// Modal Variables
let imageModal; // Image zoom modal
let zoomedImage; // Image in zoom modal
let closeImageModalButton; // Close button for image modal
let cardModal; // NEW: Full card / form zoom modal
let zoomedCardContent; // Zoomed card / form content
let closeCardModalButton; // Close button for card/form modal

let loadingSpinner; // Loading spinner
let toastContainer; // Toast container

let getClimateButton;       // "Get Climate" button variable
let locationStatusDiv;      // Location status div variable
let weatherForecastDiv;     // Weather forecast div variable
let climateZoneFilter;      // Climate zone selector

// Form variables (will no longer be direct DOM objects, but will contain template content)
let newPlantFormTemplate;
let updatePlantFormTemplate;
let emptyGardenMessage; // Message for empty garden

// New "Scroll to Top" button
let scrollToTopButton;

// Cropping Variables
let cropModal;
let imageToCrop;
let cropper; // Cropper.js instance
let currentCroppingFile = null; // File currently being cropped
let currentCroppingImagePreviewElement = null; // <img> preview element associated with the file input
let currentCroppingHiddenUrlElement = null; // Hidden input element for existing URL (only for update form)
let isUpdateFormCropping = false; // Flag to distinguish if cropping is for a new entry or an update

// New DOM variables for sensor/manual controls
let autoSensorControls;
let manualLuxInputControls;
let manualLuxInput;
let applyManualLuxButton;
let currentLuxValueManualSpan;

// Constant for the default generic placeholder image
const DEFAULT_PLACEHOLDER_IMAGE = 'https://placehold.co/150x150/EEEEEE/333333?text=No+Image';

// New: Map of placeholder images by category (without emojis)
const CATEGORY_PLACEHOLDER_IMAGES = {
    'Fiore': 'https://placehold.co/150x150/FFDDC1/FF5733?text=Fiore',
    'Frutto': 'https://placehold.co/150x150/FFECB3/FFC300?text=Frutto',
    'Verdura': 'https://placehold.co/150x150/D4EDDA/28A745?text=Verdura',
    'Erba Aromatica': 'https://placehold.co/150x150/C8F0C8/198754?text=Erba+Aromatica',
    'Albero': 'https://placehold.co/150x150/C6E0F5/007BFF?text=Albero',
    'Arbusto': 'https://placehold.co/150x150/E9D7ED/6F42C1?text=Arbusto',
    'Succulenta': 'https://placehold.co/150x150/F8D7DA/DC3545?text=Succulenta',
    'Cactus': 'https://placehold.co/150x150/D1ECF1/00BCD4?text=Cactus',
    'Acquatica': 'https://placehold.co/150x150/CCE5FF/007BFF?text=Acquatica',
    'Rampicante': 'https://placehold.co/150x150/FFF3CD/FFC107?text=Rampicante',
    'Bulbo': 'https://placehold.co/150x150/F0FFF0/008000?text=Bulbo',
    'Felce': 'https://placehold.co/150x150/E0F7FA/00838F?text=Felce',
    'Orchidea': 'https://placehold.co/150x150/E6E6FA/800080?text=Orchidea',
    'Pianta': 'https://placehold.co/150x150/D3D3D3/6C757D?text=Pianta',
    'Altro': 'https://placehold.co/150x150/F5F5DC/604C3E?text=Altro'
};


// Flag to distinguish if we are modifying a plant from the personal garden
let isEditingMyGardenPlant = false;

// Variables for the custom confirmation modal
let confirmationModal;
let confirmationTitle;
let confirmationMessage;
let confirmYesButton;
let confirmNoButton;
let confirmResolve; // Function to resolve the confirmation Promise

const CLIMATE_TEMP_RANGES = {
    'Mediterraneo': { min: 5, max: 35 },
    'Temperato': { min: -10, max: 30 },
    'Tropicale': { min: 18, max: 40 },
    'Subtropicale': { min: 10, max: 38 },
    'Boreale/Artico': { min: -40, max: 20 },
    'Arido': { min: 0, max: 45 },
};

let db; // Firestore instance
let storage; // Firebase Storage instance
let storageRef; // Reference to the root of Firebase Storage


// =======================================================
// 1. UTILITY FUNCTIONS (User Feedback and Validation)
// =======================================================

// Show loading spinner
function showLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex';
        console.log('Spinner: Mostrato');
    }
}

// Hide loading spinner
function hideLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
        console.log('Spinner: Nascosto');
    }
}

// Show a toast message
function showToast(message, type = 'info', duration = 3000) {
    if (!toastContainer) {
        console.warn('Toast container non trovato.');
        return;
    }

    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Show the toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Hide and remove the toast after the specified duration
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        }, { once: true });
    }, duration);
}

/**
 * Shows a custom confirmation modal.
 * @param {string} message The message to display in the modal.
 * @param {string} [title='Conferma Azione'] The modal title.
 * @returns {Promise<boolean>} A Promise that resolves to true if the user clicks 'Yes', false if 'No'.
 */
function showConfirmationModal(message, title = 'Conferma Azione') {
    return new Promise(resolve => {
        if (!confirmationModal || !confirmationTitle || !confirmationMessage || !confirmYesButton || !confirmNoButton) {
            console.error("Confirmation modal elements not found. Falling back to native confirm.");
            // Fallback to native confirm if elements are missing, but log error
            resolve(window.confirm(message));
            return;
        }

        confirmationTitle.textContent = title;
        confirmationMessage.textContent = message;
        confirmationModal.style.display = 'flex'; // Show the modal

        // Store the resolve function to be called by button click handlers
        confirmResolve = resolve;

        // Add event listeners for the buttons (and remove them after use to prevent duplicates)
        const cleanup = () => {
            confirmYesButton.removeEventListener('click', onYesClick);
            confirmNoButton.removeEventListener('click', onNoClick);
            confirmationModal.removeEventListener('click', onModalBackgroundClick);
        };

        const onYesClick = () => {
            confirmationModal.style.display = 'none';
            cleanup();
            confirmResolve(true);
        };

        const onNoClick = () => {
            confirmationModal.style.display = 'none';
            cleanup();
            confirmResolve(false);
        };

        const onModalBackgroundClick = (e) => {
            if (e.target === confirmationModal) {
                confirmationModal.style.display = 'none';
                cleanup();
                confirmResolve(false); // Treat background click as 'No'
            }
        };

        confirmYesButton.addEventListener('click', onYesClick);
        confirmNoButton.addEventListener('click', onNoClick);
        confirmationModal.addEventListener('click', onModalBackgroundClick);
    });
}


// Validate the add/edit plant form fields
function validatePlantForm(formElement) {
    let isValid = true;
    clearFormValidationErrors(formElement); // Clear previous errors

    const nameInput = formElement.querySelector('[id$="PlantName"]');
    if (!nameInput || !nameInput.value.trim()) {
        showFormValidationError(nameInput ? nameInput.id : null, 'Il nome è obbligatorio.');
        isValid = false;
    }

    const sunlightInput = formElement.querySelector('[id$="PlantSunlight"]');
    if (!sunlightInput || !sunlightInput.value) {
        showFormValidationError(sunlightInput ? sunlightInput.id : null, 'L\'esposizione al sole è obbligatoria.');
        isValid = false;
    }

    const wateringInput = formElement.querySelector('[id$="PlantWatering"]');
    if (!wateringInput || !wateringInput.value) {
        showFormValidationError(wateringInput ? wateringInput.id : null, 'L\'annaffiatura è obbligatoria.');
        isValid = false;
    }

    const categoryInput = formElement.querySelector('[id$="PlantCategory"]');
    if (!categoryInput || !categoryInput.value) {
        showFormValidationError(categoryInput ? categoryInput.id : null, 'La categoria è obbligatoria.');
        isValid = false;
    }

    // Validate lux min/max
    const luxMinInput = formElement.querySelector('[id$="IdealLuxMin"]');
    const luxMaxInput = formElement.querySelector('[id$="IdealLuxMax"]');
    const luxMin = luxMinInput && luxMinInput.value ? parseFloat(luxMinInput.value) : null;
    const luxMax = luxMaxInput && luxMaxInput.value ? parseFloat(luxMaxInput.value) : null;


    if (luxMinInput && luxMinInput.value !== '' && (isNaN(luxMin) || luxMin < 0)) {
        showFormValidationError(luxMinInput.id, 'Lux Min deve essere un numero positivo.');
        isValid = false;
    }
    if (luxMaxInput && luxMaxInput.value !== '' && (isNaN(luxMax) || luxMax < 0)) {
        showFormValidationError(luxMaxInput.id, 'Lux Max deve essere un numero positivo.');
        isValid = false;
    }
    if (luxMin !== null && luxMax !== null && luxMin > luxMax) {
        showFormValidationError(luxMaxInput ? luxMaxInput.id : null, 'Lux Max non può essere inferiore a Lux Min.');
        isValid = false;
    }

    // Validate temperature min/max
    const tempMinInput = formElement.querySelector('[id$="TempMin"]');
    const tempMaxInput = formElement.querySelector('[id$="TempMax"]');
    const tempMin = tempMinInput && tempMinInput.value ? parseFloat(tempMinInput.value) : null;
    const tempMax = tempMaxInput && tempMaxInput.value ? parseFloat(tempMaxInput.value) : null;

    if (tempMinInput && tempMinInput.value !== '' && isNaN(tempMin)) {
        showFormValidationError(tempMinInput.id, 'Temperatura Min deve essere un numero.');
        isValid = false;
    }
    if (tempMaxInput && tempMaxInput.value !== '' && isNaN(tempMax)) {
        showFormValidationError(tempMaxInput.id, 'Temperatura Max deve essere un numero.');
        isValid = false;
    }
    if (tempMin !== null && tempMax !== null && tempMin > tempMax) {
        showFormValidationError(tempMaxInput ? tempMaxInput.id : null, 'Temperatura Max non può essere inferiore a Temperatura Min.');
        isValid = false;
    }

    // Validation for watering reminder fields (only if visible, i.e., if isEditingMyGardenPlant is true)
    const wateringReminderFieldsDiv = formElement.querySelector('#wateringReminderFields');
    if (wateringReminderFieldsDiv && window.getComputedStyle(wateringReminderFieldsDiv).display !== 'none') {
        const wateringIntervalInput = formElement.querySelector('#updatePlantWateringIntervalDays');
        const wateringInterval = wateringIntervalInput.value.trim();

        if (wateringInterval !== '' && (isNaN(parseFloat(wateringInterval)) || parseFloat(wateringInterval) <= 0)) {
            showFormValidationError(wateringIntervalInput.id, 'L\'intervallo di annaffiatura deve essere un numero positivo.');
            isValid = false;
        }
    }


    return isValid;
}

// Display a specific validation error for a form field
function showFormValidationError(elementId, message) {
    if (!elementId) return; // Added to prevent errors if elementId is null
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

// Clear all validation errors from a form
function clearFormValidationErrors(formElement) {
    if (!formElement) return;
    const errorMessages = formElement.querySelectorAll('.error-message');
    errorMessages.forEach(el => el.remove());
    const inputErrors = formElement.querySelectorAll('.input-error');
    inputErrors.forEach(el => el.classList.remove('input-error'));
}

// =======================================================
// 2. AUTHENTICATION AND MAIN UI FUNCTIONS
// =======================================================

// Update the UI based on the user's authentication status
async function updateUIforAuthState(user) {
    hideLoadingSpinner();

    if (user) {
        // User logged in
        if (authStatusSpan) authStatusSpan.innerHTML = `<i class="fas fa-user"></i> ${user.email}`;
        if (authContainerDiv) authContainerDiv.style.display = 'none';
        if (appContentDiv) appContentDiv.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'block';
        if (addNewPlantButton) addNewPlantButton.style.display = 'block';

        // Load essential data
        await fetchPlantsFromFirestore(); // Populate allPlants
        await fetchMyGardenFromFirebase(); // Populate myGarden

        // Display plants by default (All Plants)
        displayAllPlants(); // Correct call to the wrapper function

        // Try to get climate on startup if user is logged in
        getLocation();

    } else {
        // User not logged in
        if (authStatusSpan) authStatusSpan.textContent = 'Non autenticato';
        if (authContainerDiv) authContainerDiv.style.display = 'flex';
        if (appContentDiv) appContentDiv.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'none';
        if (addNewPlantButton) addNewPlantButton.style.display = 'none';

        // Clear arrays and UI if user logs out
        allPlants = [];
        myGarden = [];
        displayPlants([]);
        // Reset filters and inputs
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (climateZoneFilter) climateZoneFilter.value = '';
        if (tempMinFilter) tempMinFilter.value = '';
        if (tempMaxFilter) tempMaxFilter.value = '';
        if (sortBySelect) sortBySelect.value = 'name_asc';
        if (locationStatusDiv) locationStatusDiv.innerHTML = '<i class="fas fa-info-circle"></i> Clicca su "Ottieni Clima" per rilevare la tua zona climatica e le previsioni.';
        if (weatherForecastDiv) weatherForecastDiv.innerHTML = ''; // Clear forecast
    }
}


// Handle user login
async function handleLogin(e) {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    if (loginError) loginError.textContent = '';
    showLoadingSpinner();
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        showToast('Login effettuato con successo!', 'success');
    } catch (error) {
        if (loginError) loginError.textContent = `Errore di login: ${error.message}`;
        showToast(`Errore di login: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Handle new user registration
async function handleRegister(e) {
    e.preventDefault();
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;
    if (registerError) registerError.textContent = '';
    showLoadingSpinner();
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        showToast('Registrato con successo!', 'success');
    } catch (error) {
        if (registerError) registerError.textContent = `Errore di registrazione: ${error.message}`;
        showToast(`Errore di registrazione: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Handle user logout
async function handleLogout() {
    showLoadingSpinner();
    try {
        await firebase.auth().signOut();
        showToast('Logout effettuato con successo!', 'info');
    } catch (error) {
        showToast(`Errore durante il logout: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}

// Show login form and hide registration form
function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    clearLoginRegisterErrors(); // Clear errors
}

// Show registration form and hide login form
function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    clearLoginRegisterErrors(); // Clear errors
}

// Clear login/registration form errors
function clearLoginRegisterErrors() {
    if (loginError) loginError.textContent = '';
    if (registerError) registerError.textContent = '';
}


// =======================================================
// 3. FIRESTORE INTERACTION (CRUD Plants)
// =======================================================

/**
 * Uploads an image to Firebase Storage.
 * @param {File} file - The image file to upload.
 * @param {string} folderPath - The folder path in Storage (e.g., 'plant_images').
 * @returns {Promise<string|null>} A Promise that resolves with the download URL or null.
 */
async function uploadImage(file, folderPath) {
    if (!file) {
        console.log('Upload Image: Nessun file fornito.');
        return null;
    }
    showLoadingSpinner();
    console.log('Upload Image: Inizio caricamento...');
    try {
        // Generate a unique file name to avoid collisions
        const fileName = `${Date.now()}_${file.name}`;
        // Create a reference to the specific path in your storage
        const storageRefChild = storageRef.child(`${folderPath}/${fileName}`);
        // Upload the file
        const snapshot = await storageRefChild.put(file);
        // Get the download URL
        const downloadURL = await snapshot.ref.getDownloadURL();
        showToast('Immagine caricata!', 'success');
        console.log('Upload Image: Caricamento completato. URL:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Upload Image: Errore durante l'upload dell'immagine:", error);
        showToast(`Errore caricamento immagine: ${error.message}`, 'error');
        return null;
    } finally {
        hideLoadingSpinner();
        console.log('Upload Image: Fine operazione.');
    }
}

/**
 * Deletes an image from Firebase Storage given its URL.
 * @param {string} imageUrl - The download URL of the image to delete.
 */
async function deleteImage(imageUrl) {
    // Do not attempt to delete placeholder images or those from placehold.co
    if (!imageUrl || imageUrl.includes('placehold.co') || imageUrl.startsWith('data:image')) {
        console.log('Delete Image: Nessun URL immagine valido, è un placeholder o un Data URL. Salto eliminazione.');
        return;
    }
    console.log('Delete Image: Inizio eliminazione immagine da Storage:', imageUrl);
    try {
        const imageRef = storage.refFromURL(imageUrl);
        await imageRef.delete();
        console.log("Delete Image: Immagine eliminata con successo da Storage:", imageUrl);
    } catch (error) {
        // Ignore the error if the image does not exist (e.g., "object not found"), otherwise log it.
        if (error.code === 'storage/object-not-found') {
            console.warn("Delete Image: Immagine non trovata in Storage, probabilmente già eliminata:", imageUrl);
        } else {
            console.error("Delete Image: Errore nell'eliminazione dell'immagine da Storage:", error);
            // Do not show toast to the user for image deletion errors, they might be default or already deleted images.
        }
    }
}

// Saves or updates a plant in the Firestore database
async function savePlantToFirestore(e) {
    e.preventDefault();
    console.log('savePlantToFirestore: Funzione avviata.');
    showLoadingSpinner();

    // Get the actual form element from the event target (the button)
    const form = e.target.closest('form');
    if (!form) {
        console.error('savePlantToFirestore: Form non trovato. Uscita.');
        hideLoadingSpinner();
        showToast('Errore: Impossibile trovare il form.', 'error');
        return;
    }

    if (!validatePlantForm(form)) { // Pass the actual form element to validation
        hideLoadingSpinner();
        showToast('Compila correttamente tutti i campi obbligatori.', 'error');
        console.log('savePlantToFirestore: Validazione form fallita. Uscita.');
        return;
    }

    // Collect base plant data from the form
    let plantData = {
        name: form.querySelector('[id$="PlantName"]').value.trim(),
        sunlight: form.querySelector('[id$="PlantSunlight"]').value,
        idealLuxMin: form.querySelector('[id$="IdealLuxMin"]').value.trim() !== '' ? parseFloat(form.querySelector('[id$="IdealLuxMin"]').value.trim()) : null,
        idealLuxMax: form.querySelector('[id$="IdealLuxMax"]').value.trim() !== '' ? parseFloat(form.querySelector('[id$="IdealLuxMax"]').value.trim()) : null,
        watering: form.querySelector('[id$="PlantWatering"]').value,
        tempMin: form.querySelector('[id$="TempMin"]').value.trim() !== '' ? parseFloat(form.querySelector('[id$="TempMin"]').value.trim()) : null,
        tempMax: form.querySelector('[id$="TempMax"]').value.trim() !== '' ? parseFloat(form.querySelector('[id$="TempMax"]').value.trim()) : null,
        potSize: form.querySelector('[id$="PotSize"]') ? form.querySelector('[id$="PotSize"]').value.trim() : null,
        description: form.querySelector('[id$="Description"]') ? form.querySelector('[id$="Description"]').value.trim() : null,
        category: form.querySelector('[id$="PlantCategory"]').value,
    };

    let oldPublicImageUrlToDelete = null; // To track public image in storage that needs deletion

    try {
        const user = firebase.auth().currentUser;
        if (!user) { throw new Error("Utente non autenticato per salvare."); }

        if (form.id === 'updatePlantFormContent') { // We are modifying a plant (both in the garden and public)
            console.log('savePlantToFirestore: Modifica di una pianta esistente.');

            let isGardenPlantUpdate = false;
            // Determine if the plant being updated is in the user's personal garden
            const existingMyGardenPlant = myGarden.find(p => p.id === currentPlantIdToUpdate);
            if (existingMyGardenPlant) {
                isGardenPlantUpdate = true;
                console.log('savePlantToFirestore: Si tratta di una pianta nel Mio Giardino.');
            } else {
                console.log('savePlantToFirestore: Si tratta di una pianta pubblica.');
            }

            // --- Image handling (only public image now) ---
            const updateImageUploadInput = form.querySelector('#updatePlantImageUpload');
            const updateImageURLHiddenInput = form.querySelector('#updatePlantImageURL');

            // Scenario 1: New image selected and cropped (currentCroppingFile is a Blob)
            if (currentCroppingFile instanceof Blob) {
                // If there's an old public image (not a placeholder), mark it for deletion
                const currentPlantData = isGardenPlantUpdate ? existingMyGardenPlant : allPlants.find(p => p.id === currentPlantIdToUpdate);
                if (currentPlantData && currentPlantData.image && !currentPlantData.image.includes('placehold.co')) {
                    oldPublicImageUrlToDelete = currentPlantData.image;
                    console.log('savePlantToFirestore: Vecchia immagine pubblica marcata per eliminazione (nuova ritagliata):', oldPublicImageUrlToDelete);
                }
                plantData.image = await uploadImage(currentCroppingFile, 'plant_images');
                console.log('savePlantToFirestore: Nuova immagine pubblica caricata (ritagliata):', plantData.image);
            }
            // Scenario 2: User cleared the file field (and the hidden input) to remove the image
            else if (updateImageURLHiddenInput && updateImageURLHiddenInput.value === '') {
                // If there's an old public image (not a placeholder), mark it for deletion
                const currentPlantData = isGardenPlantUpdate ? existingMyGardenPlant : allPlants.find(p => p.id === currentPlantIdToUpdate);
                 if (currentPlantData && currentPlantData.image && !currentPlantData.image.includes('placehold.co')) {
                    oldPublicImageUrlToDelete = currentPlantData.image;
                    console.log('savePlantToFirestore: Vecchia immagine pubblica marcata per eliminazione (rimozione esplicita):', oldPublicImageUrlToDelete);
                }
                plantData.image = firebase.firestore.FieldValue.delete(); // Explicitly remove the field
                console.log('savePlantToFirestore: Immagine pubblica rimossa esplicitamente.');
            }
            // Scenario 3: No new image, keep the existing one (or the placeholder)
            else {
                const currentPlantData = isGardenPlantUpdate ? existingMyGardenPlant : allPlants.find(p => p.id === currentPlantIdToUpdate);
                plantData.image = currentPlantData ? currentPlantData.image : null; // Keep the existing public image
                console.log('savePlantToFirestore: Nessun nuovo file o rimozione esplicita, immagine pubblica mantenuta:', plantData.image);
            }

            // Ensure the userImage field does not exist or is removed for all plants
            // This field is no longer supported in the new unified model.
            delete plantData.userImage;


            if (isGardenPlantUpdate) {
                // Update a plant in the user's garden
                const gardenRef = db.collection('gardens').doc(user.uid);
                let currentGardenPlants = (await gardenRef.get()).data().plants || [];
                const plantIndex = currentGardenPlants.findIndex(p => p.id === currentPlantIdToUpdate);

                if (plantIndex !== -1) {
                    // Merge updated fields with existing ones, but only fields relevant to the garden
                    // We keep original fields not modified by the form (like createdAt, ownerId of the public plant)
                    currentGardenPlants[plantIndex] = {
                        ...currentGardenPlants[plantIndex], // Keep all original fields of the plant in the garden
                        ...plantData, // Overwrite with new data from the form (including the unified 'image' field)
                        // Add only garden-specific fields if they have been modified
                        wateringIntervalDays: form.querySelector('#wateringReminderFields').style.display !== 'none' ? (form.querySelector('#updatePlantWateringIntervalDays').value.trim() !== '' ? parseInt(form.querySelector('#updatePlantWateringIntervalDays').value.trim(), 10) : null) : currentGardenPlants[plantIndex].wateringIntervalDays,
                        lastWateredTimestamp: currentGardenPlants[plantIndex].lastWateredTimestamp // lastWateredTimestamp is managed by the "Watered Today!" button
                    };
                    await gardenRef.set({ plants: currentGardenPlants });
                    myGarden = currentGardenPlants; // Update local state
                    showToast('Pianta nel tuo giardino aggiornata con successo!', 'success');
                    console.log('savePlantToFirestore: Pianta nel giardino aggiornata in Firestore.');
                } else {
                    throw new Error("Pianta non trovata nel tuo giardino per l'aggiornamento.");
                }
            } else {
                // Update a public plant
                const publicPlantRef = db.collection('plants').doc(currentPlantIdToUpdate);
                await publicPlantRef.update({
                    ...plantData,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                showToast('Pianta pubblica aggiornata con successo!', 'success');
                console.log('savePlantToFirestore: Pianta pubblica aggiornata in Firestore.');
            }

        } else { // We are adding a new public plant
            console.log('savePlantToFirestore: Aggiunta nuova pianta pubblica.');
            const newPlantImageUploadInput = form.querySelector('#newPlantImageUpload');

            if (currentCroppingFile instanceof Blob) {
                plantData.image = await uploadImage(currentCroppingFile, 'plant_images');
            } else if (newPlantImageUploadInput && newPlantImageUploadInput.files[0]) {
                // Fallback if for some reason the cropper was not used/available
                console.warn('savePlantToFirestore: Un file è stato selezionato ma non ritagliato per nuova pianta pubblica. Caricamento diretto.');
                plantData.image = await uploadImage(newPlantImageUploadInput.files[0], 'plant_images');
            } else {
                plantData.image = null; // No image selected
            }

            plantData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            plantData.ownerId = user.uid; // Set ownerId for the new public plant

            // Ensure garden-specific fields are not added to public plants
            delete plantData.wateringIntervalDays;
            delete plantData.lastWateredTimestamp;
            delete plantData.userImage; // Ensure it is never present

            await db.collection('plants').add(plantData);
            showToast('Nuova pianta pubblica aggiunta con successo!', 'success');
            console.log('savePlantToFirestore: Nuova pianta pubblica aggiunta in Firestore.');
        }

        // --- Common cleanup after successful Firestore operations ---
        closeCardModal(); // Close the modal
        currentCroppingFile = null; // Reset cropping state
        currentCroppingImagePreviewElement = null;
        currentCroppingHiddenUrlElement = null;
        isUpdateFormCropping = false;
        console.log('savePlantToFirestore: Variabili di ritaglio resettate.');

        // Reload and redisplay all data
        await fetchPlantsFromFirestore();
        await fetchMyGardenFromFirebase();
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
        console.log('savePlantToFirestore: Dati ricaricati e visualizzazione aggiornata.');

        // Delete old image from storage if marked
        if (oldPublicImageUrlToDelete) {
            console.log('savePlantToFirestore: Inizio eliminazione immagine obsoleta dallo storage.');
            await deleteImage(oldPublicImageUrlToDelete);
            console.log('savePlantToFirestore: Immagine obsoleta eliminata.');
        }

    } catch (error) {
        console.error("savePlantToFirestore: Errore durante il salvataggio della pianta: ", error);
        showToast(`Errore durante il salvataggio: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
        console.log('savePlantToFirestore: Blocco finally eseguito.');
    }
}


/**
 * Deletes a plant from the Firestore database and from all users' gardens.
 * @param {string} plantId - The ID of the plant to delete.
 */
async function deletePlantFromDatabase(plantId) {
    showLoadingSpinner();
    console.log('deletePlantFromDatabase: Avviato per ID:', plantId);
    try {
        const plantDoc = await db.collection('plants').doc(plantId).get();
        if (!plantDoc.exists) {
            showToast('Pianta non trovata nel database pubblico.', 'error');
            console.log('deletePlantFromDatabase: Pianta non trovata nel database pubblico.');
            hideLoadingSpinner();
            return;
        }
        const plantData = plantDoc.data();
        console.log('deletePlantFromDatabase: Dati pianta recuperati:', plantData);

        // Confirmation has already been handled by the calling showConfirmationModal() function

        // 1. Delete the associated image from Storage (public image)
        if (plantData.image) { // Could be null or a placeholder
            console.log('deletePlantFromDatabase: Tentativo di eliminare immagine associata (pubblica).');
            await deleteImage(plantData.image);
            console.log('deletePlantFromDatabase: Immagine associata (pubblica) gestita.');
        }

        // 2. Delete the plant from the 'plants' collection
        console.log('deletePlantFromDatabase: Eliminazione pianta dalla collezione plants.');
        await db.collection('plants').doc(plantId).delete();
        showToast('Pianta eliminata con successo dal database!', 'success');
        console.log('deletePlantFromDatabase: Pianta eliminata dal database.');

        // 3. Remove the plant from EVERY user's garden
        console.log('deletePlantFromDatabase: Rimozione pianta dai giardini degli utenti.');
        const gardensSnapshot = await db.collection('gardens').get();
        const batch = db.batch(); // Initialize a batch for multiple updates

        for (const doc of gardensSnapshot.docs) {
            let currentGardenPlants = doc.data().plants || [];
            // Now, if the plant is in the garden, we remove it, but we don't worry about userImage
            const updatedGardenPlants = currentGardenPlants.filter(plant => plant.id !== plantId);
            if (updatedGardenPlants.length !== currentGardenPlants.length) { // If the plant was actually removed from the garden
                batch.update(doc.ref, { plants: updatedGardenPlants });
                console.log(`deletePlantFromDatabase: Marcato giardino di ${doc.id} per aggiornamento.`);
            }
        }
        await batch.commit(); // Execute all batch operations
        console.log('deletePlantFromDatabase: Aggiornamento batch dei giardini completato.');

        closeCardModal(); // Close the modal after deletion
        await fetchPlantsFromFirestore(); // Update allPlants
        await fetchMyGardenFromFirebase(); // Update myGarden
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Update the UI
        console.log('deletePlantFromDatabase: Funzione completata con successo.');

    } catch (error) {
        console.error("deletePlantFromDatabase: Errore durante l'eliminazione:", error);
        showToast(`Errore durante l'eliminazione: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
        console.log('deletePlantFromDatabase: Blocco finally eseguito.');
    }
}

// Adds a plant to the authenticated user's garden
async function addToMyGarden(plantId) {
    showLoadingSpinner();
    console.log('addToMyGarden: Avviato per ID:', plantId);
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per aggiungere piante al tuo giardino.", 'info');
        hideLoadingSpinner();
        console.log('addToMyGarden: Utente non autenticato. Uscita.');
        return;
    }

    const gardenRef = db.collection('gardens').doc(user.uid);
    try {
        console.log('addToMyGarden: Recupero documento giardino utente.');
        const doc = await gardenRef.get();
        let currentGardenPlants = [];
        if (doc.exists) {
            currentGardenPlants = doc.data().plants || [];
            console.log('addToMyGarden: Giardino utente esistente. Piante attuali:', currentGardenPlants.length);
        } else {
            console.log('addToMyGarden: Giardino utente non esistente, creazione di un nuovo array.');
        }

        if (currentGardenPlants.some(p => p.id === plantId)) {
            showToast("Questa pianta è già nel tuo giardino!", 'info');
            hideLoadingSpinner();
            console.log('addToMyGarden: Pianta già nel giardino. Uscita.');
            return;
        }

        const plantToAdd = allPlants.find(plant => plant.id === plantId);
        if (plantToAdd) {
            console.log('addToMyGarden: Trovata pianta da aggiungere:', plantToAdd.name);
            // Create a copy of the plant, but with garden-specific fields initialized
            currentGardenPlants.push({
                id: plantToAdd.id,
                name: plantToAdd.name,
                category: plantToAdd.category,
                image: plantToAdd.image || null, // The image is always the public one
                sunlight: plantToAdd.sunlight,
                watering: plantToAdd.watering,
                idealLuxMin: plantToAdd.idealLuxMin,
                idealLuxMax: plantToAdd.idealLuxMax,
                tempMin: plantToAdd.tempMin,
                tempMax: plantToAdd.tempMax,
                potSize: plantToAdd.potSize || null,
                description: plantToAdd.description || null,
                createdAt: plantToAdd.createdAt || firebase.firestore.FieldValue.serverTimestamp(), // Use public plant's createdAt
                // New fields for watering reminder, initialized to null or default
                wateringIntervalDays: null,
                lastWateredTimestamp: null
            });
            console.log('addToMyGarden: Aggiornamento documento giardino con nuova pianta.');
            await gardenRef.set({ plants: currentGardenPlants }); // Set the whole array
            myGarden = currentGardenPlants;
            showToast('Pianta aggiunta al tuo giardino!', 'success');
            // No full re-fetch is needed here, just update the display
            displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Update the display
            console.log('addToMyGarden: Pianta aggiunta e visualizzazione aggiornata.');
        } else {
            showToast("Pianta non trovata per l'aggiunta al giardino.", 'error');
            console.log('addToMyGarden: Pianta non trovata in allPlants. Uscita.');
        }
    } catch (error) {
        showToast(`Errore nell'aggiunta al giardino: ${error.message}`, 'error');
        console.error("addToMyGarden: Errore nell'aggiunta al giardino: ", error);
    } finally {
        hideLoadingSpinner();
        console.log('addToMyGarden: Blocco finally eseguito.');
    }
}


// Removes a plant from the authenticated user's garden
async function removeFromMyGarden(plantId) {
    showLoadingSpinner();
    console.log('removeFromMyGarden: Avviato per ID:', plantId);
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per rimuovere piante dal tuo giardino.", 'info');
        hideLoadingSpinner();
        console.log('removeFromMyGarden: Utente non autenticato. Uscita.');
        return;
    }

    // Custom confirmation modal instead of alert()
    const confirmed = await showConfirmationModal(
        'Sei sicuro di voler rimuovere questa pianta dal tuo giardino? Questa azione non elimina la pianta dal database pubblico.'
    );
    if (!confirmed) {
        hideLoadingSpinner();
        console.log('removeFromMyGarden: Rimozione annullata dall\'utente.');
        return;
    }

    const gardenRef = db.collection('gardens').doc(user.uid);
    try {
        console.log('removeFromMyGarden: Recupero documento giardino utente.');
        const doc = await gardenRef.get();
        if (doc.exists) {
            let currentGardenPlants = doc.data().plants || [];
            console.log('removeFromMyGarden: Piante attuali nel giardino:', currentGardenPlants.length);

            const updatedGardenPlants = currentGardenPlants.filter(plant => plant.id !== plantId);

            if (updatedGardenPlants.length !== currentGardenPlants.length) {
                // There is no longer a userImage to delete, only the public image which is not deleted here
                console.log('removeFromMyGarden: Aggiornamento documento giardino con pianta rimossa.');
                await gardenRef.set({ plants: updatedGardenPlants });
                myGarden = updatedGardenPlants; // Update local array
                showToast('Pianta rimossa dal tuo giardino!', 'info');
                // No full re-fetch is needed here, just update the display
                displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants); // Update the display
                console.log('removeFromMyGarden: Pianta rimossa e visualizzazione aggiornata.');
            } else {
                showToast("La pianta non era presente nel tuo giardino.", 'info');
                console.log('removeFromMyGarden: Pianta non trovata nel giardino per la rimozione.');
            }
        } else {
            showToast("Il tuo giardino è vuoto.", 'info');
            console.log('removeFromMyGarden: Giardino utente vuoto.');
        }
    } catch (error) {
        showToast(`Errore nella rimozione dal giardino: ${error.message}`, 'error');
        console.error("removeFromMyGarden: Errore nella rimozione dal giardino: ", error);
    } finally {
        hideLoadingSpinner();
        console.log('removeFromMyGarden: Blocco finally eseguito.');
    }
}

/**
 * Updates the last watering timestamp for a specific plant in the user's garden.
 * @param {string} plantId The ID of the plant to update.
 * @param {HTMLElement} lastWateredDisplayElement The HTML element where the updated date should be displayed.
 */
async function updateLastWatered(plantId, lastWateredDisplayElement) {
    showLoadingSpinner();
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast("Devi essere autenticato per aggiornare le annaffiature.", 'info');
        hideLoadingSpinner();
        return;
    }

    try {
        const gardenRef = db.collection('gardens').doc(user.uid);
        const doc = await gardenRef.get();
        if (doc.exists) {
            let currentGardenPlants = doc.data().plants || [];
            const plantIndex = currentGardenPlants.findIndex(p => p.id === plantId);

            if (plantIndex !== -1) {
                // Update only the timestamp for this plant
                currentGardenPlants[plantIndex].lastWateredTimestamp = firebase.firestore.FieldValue.serverTimestamp(); // Use serverTimestamp for consistency
                await gardenRef.set({ plants: currentGardenPlants }); // Save
                myGarden = currentGardenPlants; // Update local state

                // Update the watering reminder UI in the modal
                // When using serverTimestamp, the value is not immediately available
                // locally as a Date object. We might need to re-fetch or display "Now"
                // and then the user will see the updated value after a refresh.
                // For immediate feedback, we display the current client date.
                const now = new Date();
                lastWateredDisplayElement.textContent = `Ultima annaffiatura: Oggi (${now.toLocaleDateString()})`;
                showToast('Annaffiatura registrata!', 'success');
                console.log(`Annaffiatura registrata per pianta ID: ${plantId}`);
                 // Force a re-render to update the status on the main card
                displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
            } else {
                showToast("Pianta non trovata nel tuo giardino.", 'error');
                console.warn(`Tentativo di aggiornare annaffiatura per pianta ID ${plantId} non trovata.`);
            }
        } else {
            showToast("Il tuo giardino è vuoto.", 'info');
        }
    } catch (error) {
        console.error("Errore nell'aggiornamento dell'ultima annaffiatura:", error);
        showToast(`Errore: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
    }
}


// Retrieve all plants from the 'plants' collection in Firestore
async function fetchPlantsFromFirestore() {
    showLoadingSpinner();
    console.log('fetchPlantsFromFirestore: Avviato recupero piante.');
    try {
        const querySnapshot = await db.collection('plants').get();
        allPlants = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('fetchPlantsFromFirestore: Piante caricate da Firestore:', allPlants.length);
    } catch (error) {
        console.error("fetchPlantsFromFirestore: Errore nel recupero delle piante:", error);
        showToast(`Errore nel caricamento piante: ${error.message}`, 'error');
        allPlants = []; // Ensure the array is empty in case of error
    } finally {
        hideLoadingSpinner();
    }
}

// Retrieve garden-specific plants for the user
async function fetchMyGardenFromFirebase() {
    showLoadingSpinner();
    console.log('fetchMyGardenFromFirebase: Avviato recupero giardino utente.');
    const user = firebase.auth().currentUser;
    if (!user) {
        myGarden = [];
        console.log('fetchMyGardenFromFirebase: Utente non autenticato, giardino vuoto.');
        hideLoadingSpinner();
        return;
    }

    try {
        const gardenDoc = await db.collection('gardens').doc(user.uid).get();
        if (gardenDoc.exists) {
            myGarden = gardenDoc.data().plants || [];
            // Ensure Firestore Timestamps are converted to Date objects for display,
            // but remain as Timestamps for persistence if reloaded and saved.
            // Update logic should handle Timestamps directly.
            myGarden = myGarden.map(plant => ({
                ...plant,
                lastWateredTimestamp: plant.lastWateredTimestamp instanceof firebase.firestore.Timestamp ? plant.lastWateredTimestamp : null,
                createdAt: plant.createdAt instanceof firebase.firestore.Timestamp ? plant.createdAt : null,
            }));

            console.log('fetchMyGardenFromFirebase: Giardino caricato da Firebase:', myGarden.length);
        } else {
            myGarden = [];
            console.log('fetchMyGardenFromFirebase: Nessun documento giardino trovato per l\'utente.');
        }
    } catch (error) {
        console.error("fetchMyGardenFromFirebase: Errore nel recupero del giardino:", error);
        showToast(`Errore nel caricamento del tuo giardino: ${error.message}`, 'error');
        myGarden = []; // Ensure the array is empty in case of error
    } finally {
        hideLoadingSpinner();
    }
}

// =======================================================
// 4. DISPLAY AND FILTER LOGIC
// =======================================================

/**
 * Wrapper function to display all plants (main gallery).
 * Used for initial loading and the "All Plants" button.
 */
function displayAllPlants() {
    showAllPlantsButton.classList.add('active');
    showMyGardenButton.classList.remove('active');
    isMyGardenCurrentlyVisible = false; // Ensure this flag is set correctly
    displayPlants(allPlants); // Call the main display logic
}


// Displays plants in the DOM (either allPlants or myGarden depending on the flag)
function displayPlants(plantsToDisplay) {
    console.log(`displayPlants: Visualizzazione di ${plantsToDisplay.length} piante.`);
    const container = isMyGardenCurrentlyVisible ? myGardenContainer : gardenContainer;
    const otherContainer = isMyGardenCurrentlyVisible ? gardenContainer : myGardenContainer;

    if (!container) {
        console.error('displayPlants: Contenitore piante non trovato!');
        return;
    }

    container.innerHTML = ''; // Clear the current container
    otherContainer.innerHTML = ''; // Also clear the other container for safety
    otherContainer.style.display = 'none'; // Hide the other container

    if (isMyGardenCurrentlyVisible) {
        plantsSectionHeader.textContent = 'Le Mie Piante nel Giardino';
        myGardenContainer.style.display = 'grid';
        gardenContainer.style.display = 'none';
        if (plantsToDisplay.length === 0) {
            emptyGardenMessage.style.display = 'block';
        } else {
            emptyGardenMessage.style.display = 'none';
        }
    } else {
        plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
        gardenContainer.style.display = 'grid';
        myGardenContainer.style.display = 'none';
        emptyGardenMessage.style.display = 'none'; // Always hide for "All Plants" view
    }


    if (plantsToDisplay.length === 0 && !isMyGardenCurrentlyVisible) {
        // Show a message if there are no plants in the public gallery
        container.innerHTML = `<p class="info-message">Nessuna pianta disponibile con i criteri di ricerca/filtro attuali. Prova a rimuovere i filtri o aggiungine una!</p>`;
        return;
    }


    // Apply filters and sorting
    const filteredAndSortedPlants = applyFiltersAndSort(plantsToDisplay);

    if (filteredAndSortedPlants.length === 0) {
         if (isMyGardenCurrentlyVisible) {
             emptyGardenMessage.style.display = 'block';
             myGardenContainer.innerHTML = ''; // Ensure it's empty if the message is shown
         } else {
            container.innerHTML = `<p class="info-message">Nessuna pianta trovata con i filtri applicati. Prova a cambiare i criteri di ricerca/filtro.</p>`;
         }
         return;
    }

    filteredAndSortedPlants.forEach(plant => {
        const plantCard = document.createElement('div');
        plantCard.classList.add('plant-card');
        plantCard.dataset.id = plant.id; // Set the plant ID as a data attribute

        // The image is always the 'image' field now
        const imageUrl = plant.image || CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE;

        // Determine the state of the "Add to My Garden" button
        let addToGardenButtonHtml = '';
        const user = firebase.auth().currentUser;
        const isInMyGarden = user && myGarden.some(p => p.id === plant.id);

        if (user) {
            addToGardenButtonHtml = `<button class="action-button add-to-garden-button" data-id="${plant.id}" ${isInMyGarden ? 'disabled' : ''}>${isInMyGarden ? '<i class="fas fa-check"></i> Già nel Giardino' : '<i class="fas fa-plus-circle"></i> Aggiungi al mio Giardino'}</button>`;
        } else {
            addToGardenButtonHtml = `<button class="action-button add-to-garden-button" disabled title="Accedi per aggiungere"><i class="fas fa-plus-circle"></i> Aggiungi al mio Giardino</button>`;
        }
        
        const removeFromGardenButtonHtml = isMyGardenCurrentlyVisible ?
            `<button class="action-button remove-from-garden-button" data-id="${plant.id}"><i class="fas fa-minus-circle"></i> Rimuovi dal Giardino</button>` : '';

        // Watering reminder details for plants in the garden
        let wateringReminderHtml = '';
        if (isMyGardenCurrentlyVisible && plant.wateringIntervalDays && plant.lastWateredTimestamp) {
            const nextWateringDate = calculateNextWateringDate(plant);
            const today = new Date();
            today.setHours(0,0,0,0); // Normalize to start of day for comparison

            if (nextWateringDate && nextWateringDate <= today) {
                wateringReminderHtml = `<p class="text-red-600 font-bold"><i class="fas fa-tint"></i> Annaffia Oggi / Urgente!</p>`;
            } else if (nextWateringDate) {
                wateringReminderHtml = `<p class="text-green-600"><i class="fas fa-tint"></i> Prossima: ${nextWateringDate.toLocaleDateString('it-IT')}</p>`;
            }
        } else if (isMyGardenCurrentlyVisible) {
            wateringReminderHtml = `<p class="text-gray-500"><i class="fas fa-tint"></i> Intervallo annaffiatura non impostato.</p>`;
        }

        plantCard.innerHTML = `
            <img src="${imageUrl}" alt="${plant.name}" class="plant-image" onerror="this.onerror=null;this.src='${CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE}';">
            <h3>${plant.name}</h3>
            <p><strong>Categoria:</strong> ${plant.category}</p>
            <p><strong>Esposizione al Sole:</strong> ${plant.sunlight}</p>
            <p><strong>Annaffiatura:</strong> ${plant.watering}</p>
            ${wateringReminderHtml}
            <div class="card-actions">
                ${isMyGardenCurrentlyVisible ? removeFromGardenButtonHtml : addToGardenButtonHtml}
                <button class="action-button view-details-button" data-id="${plant.id}"><i class="fas fa-info-circle"></i> Dettagli</button>
            </div>
        `;
        container.appendChild(plantCard);
    });

    // Add event listener to the new "Add to My Garden" buttons
    container.querySelectorAll('.add-to-garden-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const plantId = e.currentTarget.dataset.id;
            addToMyGarden(plantId);
        });
    });

    // Add event listener to the "Remove from Garden" buttons
    container.querySelectorAll('.remove-from-garden-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const plantId = e.currentTarget.dataset.id;
            removeFromMyGarden(plantId);
        });
    });

    // Add event listener to the "Details" buttons
    container.querySelectorAll('.view-details-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const plantId = e.currentTarget.dataset.id;
            const plant = (isMyGardenCurrentlyVisible ? myGarden : allPlants).find(p => p.id === plantId);
            if (plant) {
                showPlantDetails(plant, isMyGardenCurrentlyVisible);
            }
        });
    });

    // Add event listener for image zoom
    container.querySelectorAll('.plant-image').forEach(img => {
        img.addEventListener('click', (e) => {
            openImageModal(e.target.src);
        });
    });
}

/**
 * Calculates the next watering date.
 * @param {Object} plant The plant with lastWateredTimestamp and wateringIntervalDays.
 * @returns {Date|null} The next watering date or null if data is invalid.
 */
function calculateNextWateringDate(plant) {
    if (!plant || !plant.lastWateredTimestamp || !plant.wateringIntervalDays || isNaN(plant.wateringIntervalDays) || plant.wateringIntervalDays <= 0) {
        return null;
    }
    // Ensure lastWateredTimestamp is a Date object for calculations
    const lastWateredDate = plant.lastWateredTimestamp instanceof firebase.firestore.Timestamp ? plant.lastWateredTimestamp.toDate() : new Date(plant.lastWateredTimestamp);
    const nextWateringDate = new Date(lastWateredDate);
    nextWateringDate.setDate(lastWateredDate.getDate() + plant.wateringIntervalDays);
    return nextWateringDate;
}

// Function to apply filters and sorting
function applyFiltersAndSort(plants) {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const climateZone = climateZoneFilter.value;
    const tempMin = parseFloat(tempMinFilter.value);
    const tempMax = parseFloat(tempMaxFilter.value);

    let filteredPlants = plants.filter(plant => {
        const matchesSearch = (plant.name && plant.name.toLowerCase().includes(searchTerm)) ||
                              (plant.description && plant.description.toLowerCase().includes(searchTerm)) ||
                              (plant.potSize && plant.potSize.toLowerCase().includes(searchTerm));
        const matchesCategory = category === 'all' || (plant.category && plant.category === category);
        
        let matchesClimate = true;
        if (climateZone && CLIMATE_TEMP_RANGES[climateZone]) {
            const climateRange = CLIMATE_TEMP_RANGES[climateZone];
            // If the plant has no temperature data, we don't exclude it from the climate filter
            // Otherwise, we compare its data.
            matchesClimate = (plant.tempMin === null || plant.tempMax === null || isNaN(plant.tempMin) || isNaN(plant.tempMax)) ||
                             (plant.tempMin <= climateRange.max && plant.tempMax >= climateRange.min);
        }

        const matchesTempRange = (isNaN(tempMin) || (plant.tempMax !== null && plant.tempMax >= tempMin)) &&
                                 (isNaN(tempMax) || (plant.tempMin !== null && plant.tempMin <= tempMax));

        return matchesSearch && matchesCategory && matchesClimate && matchesTempRange;
    });

    // Sort the results
    const [sortByField, sortOrder] = currentSortBy.split('_');

    filteredPlants.sort((a, b) => {
        let valA, valB;

        if (sortByField === 'name') {
            valA = (a.name || '').toLowerCase();
            valB = (b.name || '').toLowerCase();
        } else if (sortByField === 'category') {
            valA = (a.category || '').toLowerCase();
            valB = (b.category || '').toLowerCase();
        } else {
            // Default or fallback
            valA = (a.name || '').toLowerCase();
            valB = (b.name || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return filteredPlants;
}


// Function to show plant details in a modal (for modification/viewing)
function showPlantDetails(plant, isGardenPlant = false) {
    console.log('showPlantDetails: Visualizzazione dettagli pianta:', plant.id, plant.name, 'isGardenPlant:', isGardenPlant);
    currentPlantIdToUpdate = plant.id;
    isEditingMyGardenPlant = isGardenPlant; // Set the global flag

    zoomedCardContent.innerHTML = ''; // Clear previous content

    // Clone the update form template
    // Ensure newPlantFormTemplate is a <template> tag for .content to work
    const updateFormClone = document.getElementById('updatePlantFormTemplate').content.cloneNode(true);
    const formElement = updateFormClone.querySelector('form');
    zoomedCardContent.appendChild(updateFormClone);

    // References to update form inputs
    const updatePlantNameInput = formElement.querySelector('#updatePlantName');
    const updatePlantSunlightSelect = formElement.querySelector('#updatePlantSunlight');
    const updatePlantIdealLuxMinInput = formElement.querySelector('#updatePlantIdealLuxMin');
    const updatePlantIdealLuxMaxInput = formElement.querySelector('#updatePlantIdealLuxMax');
    const updatePlantWateringSelect = formElement.querySelector('#updatePlantWatering');
    const updatePlantTempMinInput = formElement.querySelector('#updatePlantTempMin');
    const updatePlantTempMaxInput = formElement.querySelector('#updatePlantTempMax');
    const updatePlantPotSizeInput = formElement.querySelector('#updatePlantPotSize');
    const updatePlantDescriptionTextarea = formElement.querySelector('#updatePlantDescription');
    const updatePlantCategorySelect = formElement.querySelector('#updatePlantCategory');
    const updatePlantImagePreview = formElement.querySelector('#updatePlantImagePreview');
    const updatePlantImageUpload = formElement.querySelector('#updatePlantImageUpload');
    const updatePlantImageURLHidden = formElement.querySelector('#updatePlantImageURL');
    const deletePlantButton = formElement.querySelector('#deletePlant');
    const wateringReminderFieldsDiv = formElement.querySelector('#wateringReminderFields');
    const wateringIntervalDaysInput = formElement.querySelector('#updatePlantWateringIntervalDays');
    const lastWateredDisplay = formElement.querySelector('#lastWateredDisplay');
    const wateredTodayButton = formElement.querySelector('#wateredTodayButton');


    // Populate form fields with plant data
    updatePlantNameInput.value = plant.name || '';
    updatePlantSunlightSelect.value = plant.sunlight || '';
    updatePlantIdealLuxMinInput.value = plant.idealLuxMin !== null ? plant.idealLuxMin : '';
    updatePlantIdealLuxMaxInput.value = plant.idealLuxMax !== null ? plant.idealLuxMax : '';
    updatePlantWateringSelect.value = plant.watering || '';
    updatePlantTempMinInput.value = plant.tempMin !== null ? plant.tempMin : '';
    updatePlantTempMaxInput.value = plant.tempMax !== null ? plant.tempMax : '';
    updatePlantPotSizeInput.value = plant.potSize || '';
    updatePlantDescriptionTextarea.value = plant.description || '';
    updatePlantCategorySelect.value = plant.category || 'Altro';

    // Handle image preview and hidden URL (always the 'image' field now)
    const imageUrl = plant.image; // No separate userImage anymore
    updatePlantImagePreview.src = imageUrl || CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE;
    updatePlantImagePreview.style.display = 'block';
    updatePlantImageURLHidden.value = imageUrl || ''; // Save the current URL in the hidden input

    // Add listener for file input for update (will handle cropping)
    // Remove any existing listeners to avoid duplicates
    updatePlantImageUpload.removeEventListener('change', handleUpdateImageUploadChange); // Remove old listener
    updatePlantImageUpload.addEventListener('change', handleUpdateImageUploadChange); // Add new listener

    // Handler function for the file input change event (for update)
    function handleUpdateImageUploadChange(event) {
        currentCroppingFile = event.target.files[0];
        currentCroppingImagePreviewElement = updatePlantImagePreview; // Associate the preview
        currentCroppingHiddenUrlElement = updatePlantImageURLHidden; // Associate the hidden input
        isUpdateFormCropping = true; // Set the flag to indicate we are modifying an existing image

        if (currentCroppingFile) {
            openCropModal(currentCroppingFile);
        } else {
            // If the file is deselected, reset the preview and hidden URL
            updatePlantImagePreview.src = CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE;
            updatePlantImageURLHidden.value = ''; // Indicate that the image has been removed
            currentCroppingFile = null; // Reset cropping file
            console.log('updatePlantImageUpload: File deselected. Preview and hidden URL reset.');
        }
    }


    // If it's a garden plant, show watering reminder fields
    if (isGardenPlant) {
        wateringReminderFieldsDiv.style.display = 'block';
        wateringIntervalDaysInput.value = plant.wateringIntervalDays !== null ? plant.wateringIntervalDays : '';

        if (plant.lastWateredTimestamp) {
            const date = plant.lastWateredTimestamp instanceof firebase.firestore.Timestamp ? plant.lastWateredTimestamp.toDate() : new Date(plant.lastWateredTimestamp);
            lastWateredDisplay.textContent = `Ultima annaffiatura: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        } else {
            lastWateredDisplay.textContent = 'N/A';
        }

        // Event listener for the "Watered Today!" button
        wateredTodayButton.onclick = () => updateLastWatered(plant.id, lastWateredDisplay);

        // The delete plant from database button should only be visible for public plants (of the owner)
        // and hidden for garden plants (which only have the option to remove from garden)
        deletePlantButton.style.display = 'none';

    } else {
        wateringReminderFieldsDiv.style.display = 'none';
        // The delete plant button should only be visible if the user is the owner of the public plant
        if (firebase.auth().currentUser && plant.ownerId === firebase.auth().currentUser.uid) {
            deletePlantButton.style.display = 'block';
        } else {
            deletePlantButton.style.display = 'none';
        }
    }


    // Remove any existing listeners for form submission to avoid duplicates
    formElement.removeEventListener('submit', savePlantToFirestore);
    formElement.addEventListener('submit', savePlantToFirestore);

    // Handle the "Cancel" button click event
    formElement.querySelector('#cancelUpdatePlantButton').addEventListener('click', closeCardModal);

    // Handle the "Delete Plant" button click event
    if (deletePlantButton) {
        deletePlantButton.onclick = async (event) => { // Add event as parameter
            event.stopPropagation(); // Prevent propagation to avoid closing the modal
            const confirmed = await showConfirmationModal(
                `Sei sicuro di voler eliminare "${plant.name}" DEFINITIVAMENTE dal database pubblico? Questa azione non può essere annullata.`
            );
            if (confirmed) {
                deletePlantFromDatabase(plant.id);
            }
        };
    }

    cardModal.style.display = 'flex'; // Show the modal
}


// Displays the form to add a new public plant
function showAddPlantForm() {
    console.log('showAddPlantForm: Apertura form aggiunta nuova pianta.');
    currentPlantIdToUpdate = null; // No plant to update
    isEditingMyGardenPlant = false; // Not a garden plant

    zoomedCardContent.innerHTML = ''; // Clear previous content

    // Clone the add form template
    // Ensure newPlantFormTemplate is a <template> tag for .content to work
    const newFormClone = document.getElementById('newPlantFormTemplate').content.cloneNode(true);
    const formElement = newFormClone.querySelector('form');
    zoomedCardContent.appendChild(newFormClone);

    // References to add form inputs
    const newPlantImageUpload = formElement.querySelector('#newPlantImageUpload');
    const newPlantImagePreview = formElement.querySelector('#newPlantImagePreview');
    const newPlantCategorySelect = formElement.querySelector('#newPlantCategory'); // Reference to category select

    // Remove any existing listeners for file input to avoid duplicates
    newPlantImageUpload.removeEventListener('change', handleNewPlantImageUploadChange);
    newPlantImageUpload.addEventListener('change', handleNewPlantImageUploadChange);

    // Handler function for the file input change event (for new plant)
    function handleNewPlantImageUploadChange(event) {
        currentCroppingFile = event.target.files[0];
        currentCroppingImagePreviewElement = newPlantImagePreview; // Associate the preview
        currentCroppingHiddenUrlElement = null; // No hidden URL for new plants
        isUpdateFormCropping = false; // Set flag for new plant

        if (currentCroppingFile) {
            openCropModal(currentCroppingFile);
        } else {
            // If the file is deselected, reset the preview
            newPlantImagePreview.src = CATEGORY_PLACEHOLDER_IMAGES[newPlantCategorySelect.value] || DEFAULT_PLACEHOLDER_IMAGE;
            newPlantImagePreview.style.display = 'block'; // Show placeholder again
            currentCroppingFile = null; // Reset cropping file
            console.log('newPlantImageUpload: File deselected. Preview reset.');
        }
    }

    // Listener for category change in new plant form to update placeholder image
    newPlantCategorySelect.removeEventListener('change', handleNewPlantCategoryChange); // Remove old
    newPlantCategorySelect.addEventListener('change', handleNewPlantCategoryChange); // Add new

    function handleNewPlantCategoryChange() {
        if (!currentCroppingFile) { // Update only if no image is already selected for cropping
            newPlantImagePreview.src = CATEGORY_PLACEHOLDER_IMAGES[newPlantCategorySelect.value] || DEFAULT_PLACEHOLDER_IMAGE;
            newPlantImagePreview.style.display = 'block';
        }
    }
    // Set initial image based on default selected category
    newPlantImagePreview.src = CATEGORY_PLACEHOLDER_IMAGES[newPlantCategorySelect.value] || DEFAULT_PLACEHOLDER_IMAGE;
    newPlantImagePreview.style.display = 'block';


    // Remove any existing listeners for form submission to avoid duplicates
    formElement.removeEventListener('submit', savePlantToFirestore);
    formElement.addEventListener('submit', savePlantToFirestore);

    // Handle the "Cancel" button click event
    formElement.querySelector('#cancelNewPlantButton').addEventListener('click', closeCardModal);

    cardModal.style.display = 'flex'; // Show the modal
}


// Closes the card modal
function closeCardModal() {
    console.log('closeCardModal: Chiusura modale card.');
    cardModal.style.display = 'none';
    zoomedCardContent.innerHTML = ''; // Clear content
    currentPlantIdToUpdate = null; // Reset plant ID
    isEditingMyGardenPlant = false; // Reset flag
    // Reset cropping state in general after modal close
    currentCroppingFile = null;
    currentCroppingImagePreviewElement = null;
    currentCroppingHiddenUrlElement = null;
    isUpdateFormCropping = false;
    console.log('closeCardModal: Modale card chiusa.');
}


// =======================================================
// 5. IMAGE MANAGEMENT AND CROPPING (Cropper.js)
// =======================================================

/**
 * Opens the cropping modal with the selected image.
 * @param {File} file The image file to crop.
 */
function openCropModal(file) {
    if (!file) {
        showToast('Nessun file immagine selezionato per il ritaglio.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        imageToCrop.src = e.target.result;
        cropModal.style.display = 'flex';
        // Initialize Cropper.js only when the image is loaded
        if (cropper) {
            cropper.destroy(); // Destroy previous instance if it exists
        }
        cropper = new Cropper(imageToCrop, {
            aspectRatio: 1, // For a square image (1:1)
            viewMode: 1,    // Does not allow moving the canvas outside the image
            autoCropArea: 0.8, // Initial cropping area of 80%
            responsive: true,
            zoomable: true,
            rotatable: true,
            background: false // No checkered background
        });
    };
    reader.readAsDataURL(file);
}

// Closes the cropping modal
function closeCropModal() {
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    cropModal.style.display = 'none';
    imageToCrop.src = ''; // Clear the image
}

// Saves the cropped image
function saveCroppedImage() {
    if (cropper && currentCroppingImagePreviewElement) {
        showLoadingSpinner();
        // Get the cropped canvas
        const croppedCanvas = cropper.getCroppedCanvas({
            width: 400, // Desired final size
            height: 400,
            imageSmoothingQuality: 'high',
        });

        // Convert the canvas to a Blob (file)
        croppedCanvas.toBlob(async (blob) => {
            currentCroppingFile = blob; // Set the blob as the cropped file for upload
            // Assign a name to the blob, so it is treated as a File for upload
            // This is important for the uploadImage function
            Object.defineProperty(currentCroppingFile, 'name', { value: `cropped_plant_${Date.now()}.png` });

            // Update the preview in the form
            currentCroppingImagePreviewElement.src = URL.createObjectURL(blob);
            currentCroppingImagePreviewElement.style.display = 'block';

            // If the image was existing and we cropped it, clear the hidden input
            // to signal savePlantToFirestore that the old image (if it exists) should be deleted
            if (currentCroppingHiddenUrlElement) {
                currentCroppingHiddenUrlElement.value = '';
            }

            hideLoadingSpinner();
            closeCropModal();
            showToast('Immagine ritagliata e pronta per il salvataggio!', 'success');
            console.log('Immagine ritagliata con successo.');
        }, 'image/png', 0.9); // PNG format with 0.9 quality
    } else {
        showToast('Nessuna immagine da ritagliare o Cropper non inizializzato.', 'error');
        console.warn('saveCroppedImage: Nessuna immagine da ritagliare o Cropper non inizializzato.');
    }
}

/**
 * Opens the modal to display a zoomed image.
 * @param {string} imageUrl The URL of the image to display.
 */
function openImageModal(imageUrl) {
    zoomedImage.src = imageUrl;
    imageModal.style.display = 'flex';
}

// =======================================================
// 6. AMBIENT LIGHT SENSOR FUNCTIONS
// =======================================================

// Initialize ambient light sensor
function startLightSensor() {
    if ('AmbientLightSensor' in window) {
        ambientLightSensor = new AmbientLightSensor();

        ambientLightSensor.onreading = () => {
            const lux = ambientLightSensor.illuminance;
            currentLuxValueSpan.textContent = lux.toFixed(2);
            updateLightFeedback(lux);
            autoSensorControls.style.display = 'block';
            manualLuxInputControls.style.display = 'none';
            startLightSensorButton.style.display = 'none';
            stopLightSensorButton.style.display = 'inline-block';
        };

        ambientLightSensor.onerror = (event) => {
            console.error("Errore sensore luce:", event.error);
            currentLuxValueSpan.textContent = 'Errore';
            showToast(`Errore sensore luce: ${event.error.message}`, 'error');
            // Offer manual option in case of sensor error
            autoSensorControls.style.display = 'none';
            manualLuxInputControls.style.display = 'block';
            // Reset buttons in case of error
            startLightSensorButton.style.display = 'inline-block';
            stopLightSensorButton.style.display = 'none';
        };

        ambientLightSensor.start();
        showToast('Sensore di luce avviato!', 'info');
        console.log('Sensore di luce avviato.');
    } else {
        currentLuxValueSpan.textContent = 'Non supportato';
        showToast('Il tuo browser non supporta il sensore di luce ambientale. Inserisci i valori manualmente.', 'warning');
        console.warn('Sensore di luce ambientale non supportato.');
        // Show manual controls if sensor is not supported
        autoSensorControls.style.display = 'none';
        manualLuxInputControls.style.display = 'block';
        // Ensure buttons are in the correct state
        startLightSensorButton.style.display = 'inline-block';
        stopLightSensorButton.style.display = 'none';
    }
}

// Stop ambient light sensor
function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
        currentLuxValueSpan.textContent = 'N/A';
        lightFeedbackDiv.innerHTML = '<p>Inserisci un valore Lux o avvia il sensore per il feedback specifico sulle piante.</p>'; // Updated message
        showToast('Sensore di luce fermato.', 'info');
        console.log('Sensore di luce fermato.');
        startLightSensorButton.style.display = 'inline-block';
        stopLightSensorButton.style.display = 'none';
        autoSensorControls.style.display = 'none'; // Always hidden when stopped, returns to manual
        manualLuxInputControls.style.display = 'block'; // Show manual by default
        manualLuxInput.value = ''; // Clear manual input
        currentLuxValueManualSpan.textContent = 'N/A';
    }
}

// Apply manually entered Lux value
function applyManualLux() {
    const lux = parseFloat(manualLuxInput.value);
    if (!isNaN(lux) && lux >= 0) {
        currentLuxValueManualSpan.textContent = lux.toFixed(2);
        updateLightFeedback(lux);
        showToast(`Valore Lux manuale applicato: ${lux} lx`, 'success');
    } else {
        showToast('Inserisci un valore Lux valido (numero positivo).', 'error');
        currentLuxValueManualSpan.textContent = 'Errore';
    }
}


// Update light feedback for displayed plants
function updateLightFeedback(currentLux) {
    if (isNaN(currentLux)) {
        lightFeedbackDiv.innerHTML = '<p>Valore Lux non valido. Impossibile fornire feedback.</p>';
        return;
    }

    const displayedPlants = isMyGardenCurrentlyVisible ? myGarden : allPlants;
    let feedbackHtml = `<h4>Feedback Luce per le Piante nel Giardino (${currentLux.toFixed(2)} lx):</h4>`;

    if (displayedPlants.length === 0) {
        feedbackHtml += `<p>Nessuna pianta da analizzare. Aggiungi alcune piante per ottenere feedback sulla luce.</p>`;
    } else {
        feedbackHtml += `<ul>`;
        displayedPlants.forEach(plant => {
            let feedback = '';
            let idealMin = plant.idealLuxMin;
            let idealMax = plant.idealLuxMax;

            if (idealMin !== null && idealMax !== null) {
                if (currentLux < idealMin) {
                    feedback = `<span class="feedback-low">Poca luce per ${plant.name}. Necessita di più luminosità.</span>`;
                } else if (currentLux > idealMax) {
                    feedback = `<span class="feedback-high">Troppa luce per ${plant.name}. Spostala in un luogo meno illuminato.</span>`;
                } else {
                    feedback = `<span class="feedback-ideal">Luce ideale per ${plant.name}.</span>`;
                }
            } else if (idealMin !== null) {
                 if (currentLux < idealMin) {
                    feedback = `<span class="feedback-low">Poca luce per ${plant.name}. Necessita di almeno ${idealMin} lx.</span>`;
                } else {
                    feedback = `<span class="feedback-ideal">Sufficiente luce per ${plant.name}.</span>`;
                }
            } else if (idealMax !== null) {
                if (currentLux > idealMax) {
                    feedback = `<span class="feedback-high">Troppa luce per ${plant.name}. Non dovrebbe superare ${idealMax} lx.</span>`;
                } else {
                    feedback = `<span class="feedback-ideal">Luce accettabile per ${plant.name}.</span>`;
                }
            }
            else {
                feedback = `Nessun intervallo Lux specificato per ${plant.name}.`;
            }
            feedbackHtml += `<li>${feedback}</li>`;
        });
        feedbackHtml += `</ul>`;
    }
    lightFeedbackDiv.innerHTML = feedbackHtml;
}


// =======================================================
// 7. CLIMATE AND LOCATION INTEGRATION
// =======================================================

// Get user's location and then climate
async function getLocation() {
    showLoadingSpinner();
    console.log('getLocation: Richiesta posizione.');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            locationStatusDiv.innerHTML = `<i class="fas fa-map-marker-alt"></i> Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
            showToast('Posizione rilevata!', 'success');
            console.log('getLocation: Posizione rilevata. Chiamata fetchClimate.');
            await fetchClimate(lat, lon);
        }, (error) => {
            console.error("Errore geolocalizzazione:", error);
            locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Errore: ${error.message}`;
            showToast(`Errore geolocalizzazione: ${error.message}`, 'error');
            hideLoadingSpinner();
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    } else {
        locationStatusDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Geolocalizzazione non supportata.`;
        showToast('Geolocalizzazione non supportata dal tuo browser.', 'error');
        hideLoadingSpinner();
    }
}

// Retrieve climate data via API
async function fetchClimate(lat, lon) {
    showLoadingSpinner();
    console.log('fetchClimate: Avviato recupero clima per Lat:', lat, 'Lon:', lon);
    // API key for OpenWeatherMap (replace with your real and secure key!)
    // FIND YOUR API KEY HERE: https://openweathermap.org/api
    const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY'; 

    if (OPENWEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        console.error("ERRORE: Chiave API OpenWeatherMap non configurata. Aggiorna la variabile OPENWEATHER_API_KEY nel file app.js.");
        weatherForecastDiv.innerHTML = '<p class="error-message">Errore: Chiave API OpenWeatherMap non configurata. Aggiorna il file app.js.</p>';
        showToast('Errore: Chiave API OpenWeatherMap mancante!', 'error', 5000);
        hideLoadingSpinner();
        return;
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=it`;

    try {
        // Fetch weather
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        console.log('fetchClimate: Dati meteo:', weatherData);

        if (weatherData.cod && weatherData.cod !== 200) { // Handle OpenWeatherMap API errors
            throw new Error(`Errore OpenWeatherMap: ${weatherData.message || 'Sconosciuto'}`);
        }

        let climateZone = 'Sconosciuto';
        // Attempt to determine climate zone with simplified logic based on temperature:
        const temp = weatherData.main ? weatherData.main.temp : null;
        if (temp !== null) {
            if (temp >= 25) climateZone = 'Tropicale';
            else if (temp >= 15 && temp < 25) climateZone = 'Temperato';
            else if (temp >= 5 && temp < 15) climateZone = 'Mediterraneo';
            else if (temp < 5) climateZone = 'Boreale/Artico';
        }


        if (weatherData.main && weatherData.weather && weatherData.name) {
            weatherForecastDiv.innerHTML = `
                <p><strong>Località:</strong> ${weatherData.name}</p>
                <p><strong>Temperatura:</strong> ${weatherData.main.temp}°C</p>
                <p><strong>Condizioni:</strong> ${weatherData.weather[0].description}</p>
                <p><strong>Umidità:</strong> ${weatherData.main.humidity}%</p>
                <p><strong>Pressione:</strong> ${weatherData.main.pressure} hPa</p>
                <p><strong>Zona Climatica Stimata:</strong> ${climateZone}</p>
            `;
            showToast('Previsioni caricate!', 'success');
            console.log('fetchClimate: Previsioni caricate.');
        } else {
            weatherForecastDiv.innerHTML = '<p>Dati meteo non disponibili.</p>';
            showToast('Impossibile caricare le previsioni meteo.', 'warning');
            console.warn('fetchClimate: Dati meteo non disponibili.');
        }

        // Automatically apply climate zone filter if detected
        if (climateZoneFilter && climateZone !== 'Sconosciuto') {
            const normalizedClimateZone = Object.keys(CLIMATE_TEMP_RANGES).find(key => key.toLowerCase() === climateZone.toLowerCase());
            if (normalizedClimateZone) {
                climateZoneFilter.value = normalizedClimateZone;
                // Redisplay plants to apply climate filter
                displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
                showToast(`Filtro climatico applicato: ${normalizedClimateZone}`, 'info');
            }
        }


    } catch (error) {
        console.error("Errore nel recupero dati climatici:", error);
        weatherForecastDiv.innerHTML = `<p class="error-message">Errore nel caricamento delle previsioni: ${error.message}.</p>`;
        showToast(`Errore nel caricamento clima: ${error.message}`, 'error');
    } finally {
        hideLoadingSpinner();
        console.log('fetchClimate: Blocco finally eseguito.');
    }
}


// =======================================================
// 8. INITIALIZATION AND EVENT LISTENERS
// =======================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Initialization of DOM variables
    gardenContainer = document.getElementById('garden-container');
    myGardenContainer = document.getElementById('my-garden');
    authContainerDiv = document.getElementById('auth-container');
    appContentDiv = document.getElementById('app-content');
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
    addNewPlantButton = document.getElementById('addNewPlantButton');
    showAllPlantsButton = document.getElementById('showAllPlantsButton');
    showMyGardenButton = document.getElementById('showMyGardenButton');
    plantsSectionHeader = document.getElementById('plantsSectionHeader');
    imageModal = document.getElementById('image-modal');
    zoomedImage = document.getElementById('zoomed-image');
    closeImageModalButton = imageModal.querySelector('.close-button');
    cardModal = document.getElementById('card-modal');
    zoomedCardContent = document.getElementById('zoomed-card-content');
    closeCardModalButton = document.getElementById('close-card-modal');
    loadingSpinner = document.getElementById('loading-spinner');
    toastContainer = document.getElementById('toast-container');
    getClimateButton = document.getElementById('get-climate-button');
    locationStatusDiv = document.getElementById('location-status');
    weatherForecastDiv = document.getElementById('weatherForecast');
    climateZoneFilter = document.getElementById('climateZoneFilter');
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    sortBySelect = document.getElementById('sortBy');
    emptyGardenMessage = document.getElementById('empty-garden-message');
    googleLensButton = document.getElementById('googleLensButton'); // Initialize Google Lens button


    // New variables for light sensor
    lightSensorContainer = document.getElementById('lightSensorContainer');
    startLightSensorButton = document.getElementById('startLightSensorButton');
    stopLightSensorButton = document.getElementById('stopLightSensorButton');
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback');
    autoSensorControls = document.getElementById('autoSensorControls');
    manualLuxInputControls = document.getElementById('manualLuxInputControls');
    manualLuxInput = document.getElementById('manualLuxInput');
    applyManualLuxButton = document.getElementById('applyManualLuxButton');
    currentLuxValueManualSpan = document.getElementById('currentLuxValueManual');


    // Cropping Variables
    cropModal = document.getElementById('crop-modal');
    imageToCrop = document.getElementById('image-to-crop');

    // Confirmation modal variables
    confirmationModal = document.getElementById('confirmation-modal');
    confirmationTitle = document.getElementById('confirmation-title');
    confirmationMessage = document.getElementById('confirmation-message');
    confirmYesButton = document.getElementById('confirm-yes');
    confirmNoButton = document.getElementById('confirm-no');


    // Initialize Firebase Services
    db = firebase.firestore();
    storage = firebase.storage();
    storageRef = storage.ref(); // Reference to the root of Firebase Storage


    // Authentication Event Listeners
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); });
    if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });

    // Firebase authentication state listener
    firebase.auth().onAuthStateChanged(updateUIforAuthState);


    // Main buttons and filter/search Event Listeners
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', showAddPlantForm);
    if (showAllPlantsButton) showAllPlantsButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = false;
        showAllPlantsButton.classList.add('active');
        showMyGardenButton.classList.remove('active');
        displayPlants(allPlants);
    });
    if (showMyGardenButton) showMyGardenButton.addEventListener('click', () => {
        isMyGardenCurrentlyVisible = true;
        showMyGardenButton.classList.add('active');
        showAllPlantsButton.classList.remove('active');
        displayPlants(myGarden);
    });
    if (searchInput) searchInput.addEventListener('input', () => {
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });
    if (categoryFilter) categoryFilter.addEventListener('change', () => {
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });
    if (climateZoneFilter) climateZoneFilter.addEventListener('change', () => {
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });
    if (tempMinFilter) tempMinFilter.addEventListener('input', () => {
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', () => {
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });
    if (sortBySelect) sortBySelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        displayPlants(isMyGardenCurrentlyVisible ? myGarden : allPlants);
    });
    if (getClimateButton) getClimateButton.addEventListener('click', getLocation);

    // Modal Event Listeners
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => {
        imageModal.style.display = 'none';
        zoomedImage.src = '';
    });
    if (imageModal) imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.style.display = 'none';
            zoomedImage.src = '';
        }
    });
    if (closeCardModalButton) closeCardModalButton.addEventListener('click', closeCardModal);
    if (cardModal) cardModal.addEventListener('click', (e) => {
        if (e.target === cardModal) { // Close only if clicked on modal background
            closeCardModal();
        }
    });

    // Cropping Event Listeners
    if (document.getElementById('rotate-left')) document.getElementById('rotate-left').addEventListener('click', () => cropper.rotate(-90));
    if (document.getElementById('rotate-right')) document.getElementById('rotate-right').addEventListener('click', () => cropper.rotate(90));
    if (document.getElementById('zoom-in')) document.getElementById('zoom-in').addEventListener('click', () => cropper.zoom(0.1));
    if (document.getElementById('zoom-out')) document.getElementById('zoom-out').addEventListener('click', () => cropper.zoom(-0.1));
    if (document.getElementById('save-cropped-image')) document.getElementById('save-cropped-image').addEventListener('click', saveCroppedImage);
    if (document.getElementById('cancel-cropping')) document.getElementById('cancel-cropping').addEventListener('click', () => {
        closeCropModal();
        // Reset the file input that opened the cropper to allow a new selection
        if (isUpdateFormCropping && document.getElementById('updatePlantImageUpload')) {
            document.getElementById('updatePlantImageUpload').value = '';
            // Restore the preview to its original image or placeholder
            const plant = myGarden.find(p => p.id === currentPlantIdToUpdate) || allPlants.find(p => p.id === currentPlantIdToUpdate);
            if (plant && currentCroppingImagePreviewElement && currentCroppingHiddenUrlElement) {
                const originalImageUrl = plant.image; // No userImage anymore
                currentCroppingImagePreviewElement.src = originalImageUrl || CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE;
                currentCroppingHiddenUrlElement.value = originalImageUrl || ''; // Restore hidden URL
                console.log('Cropping canceled for update. Preview and hidden URL restored.');
            } else if (!isUpdateFormCropping && document.getElementById('newPlantImagePreview')) {
                // For the new plant form, reset to the category placeholder
                const newPlantCategorySelect = document.getElementById('newPlantCategory');
                document.getElementById('newPlantImagePreview').src = CATEGORY_PLACEHOLDER_IMAGES[newPlantCategorySelect.value] || DEFAULT_PLACEHOLDER_IMAGE;
                document.getElementById('newPlantImagePreview').style.display = 'block';
                console.log('Cropping canceled for new plant. Preview reset to placeholder.');
            }
        } else if (!isUpdateFormCropping && document.getElementById('newPlantImageUpload')) {
             document.getElementById('newPlantImageUpload').value = '';
             if (document.getElementById('newPlantImagePreview')) {
                 const newPlantCategorySelect = document.getElementById('newPlantCategory');
                 document.getElementById('newPlantImagePreview').src = CATEGORY_PLACEHOLDER_IMAGES[newPlantCategorySelect.value] || DEFAULT_PLACEHOLDER_IMAGE;
                 document.getElementById('newPlantImagePreview').style.display = 'block';
             }
             console.log('Cropping canceled for newPlantImageUpload.');
        }

        currentCroppingFile = null;
        currentCroppingImagePreviewElement = null;
        currentCroppingHiddenUrlElement = null;
        isUpdateFormCropping = false;
        console.log('Cropping variables reset after cancellation.');
    });

    // Event listener for closing the cropping modal by clicking on the background
    if (cropModal) cropModal.addEventListener('click', (e) => {
        if (e.target === cropModal) {
            closeCropModal();
            // Reset the file input if the modal is closed by clicking on the background
             if (isUpdateFormCropping && document.getElementById('updatePlantImageUpload')) {
                document.getElementById('updatePlantImageUpload').value = '';
                 const plant = myGarden.find(p => p.id === currentPlantIdToUpdate) || allPlants.find(p => p.id === currentPlantIdToUpdate);
                 if (plant && currentCroppingImagePreviewElement && currentCroppingHiddenUrlElement) {
                    const originalImageUrl = plant.image; // No userImage anymore
                    currentCroppingImagePreviewElement.src = originalImageUrl || CATEGORY_PLACEHOLDER_IMAGES[plant.category] || DEFAULT_PLACEHOLDER_IMAGE;
                    currentCroppingHiddenUrlElement.value = originalImageUrl || '';
                 }
            } else if (!isUpdateFormCropping && document.getElementById('newPlantImageUpload')) {
                document.getElementById('newPlantImageUpload').value = '';
                 if (document.getElementById('newPlantImagePreview')) {
                    const newPlantCategorySelect = document.getElementById('newPlantCategory');
                    document.getElementById('newPlantImagePreview').src = CATEGORY_PLACEHOLDER_IMAGES[newPlantCategorySelect.value] || DEFAULT_PLACEHOLDER_IMAGE;
                    document.getElementById('newPlantImagePreview').style.display = 'block';
                 }
            }
            currentCroppingFile = null;
            currentCroppingImagePreviewElement = null;
            currentCroppingHiddenUrlElement = null;
            isUpdateFormCropping = false;
        }
    });

    // Event Listeners for light sensor
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);
    if (applyManualLuxButton) applyManualLuxButton.addEventListener('click', applyManualLux);


    // "Scroll to Top" button
    scrollToTopButton = document.getElementById('scrollToTopButton');
    if (scrollToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 200) { // Show button after 200px scroll
                scrollToTopButton.style.display = 'block';
            } else {
                scrollToTopButton.style.display = 'none';
            }
        });
        scrollToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Google Lens management (simple placeholder)
    if (googleLensButton) {
        googleLensButton.addEventListener('click', () => {
            showToast('Funzionalità "Identifica con Lens" non ancora disponibile. Stiamo lavorando per implementarla!', 'info', 5000); // More informative message
            // In a real application, here you could:
            // 1. Open the camera and allow the user to take a photo.
            // 2. Use a computer vision library to identify the plant.
            // 3. Integrate with a plant identification API.
        });
    }
});
