// Variabili globali per lo stato dell'applicazione
let allPlants = [];
let myGarden = [];
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
let googleLensButton; //variabile per il bottone di Google Lens

// Variabili per le modali
let addPlantModal;
let closeAddPlantModalButton;
let plantForm;
let plantImageInput;
let plantNameInput;
let plantCategoryInput;
let plantDescriptionInput;
let plantTempMinInput;
let plantTempMaxInput;
let plantLightMinInput;
let plantLightMaxInput;
let saveUpdatePlantButton;
let cancelUpdatePlantButton;
let deletePlantButton;
let imagePreview;

let cardModal;
let closeCardModalButton;
let zoomedCardImage;
let zoomedCardContent;
let closeImageModalButton;
let imageModal;

// Funzione helper per i toast (può stare fuori DOMContentLoaded)
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Inizializza tutte le variabili DOM e aggiungi event listener dopo che il DOM è caricato
document.addEventListener('DOMContentLoaded', () => {
    // Inizializzazione delle variabili DOM
    gardenContainer = document.getElementById('gardenContainer');
    myGardenContainer = document.getElementById('myGardenContainer');
    authContainerDiv = document.getElementById('authContainer');
    appContentDiv = document.getElementById('appContent');
    loginButton = document.getElementById('loginButton');
    registerButton = document.getElementById('registerButton');
    showLoginLink = document.getElementById('showLogin');
    showRegisterLink = document.getElementById('showRegister');
    emailInput = document.getElementById('loginEmail');
    passwordInput = document.getElementById('loginPassword');
    loginError = document.getElementById('loginError');
    registerEmailInput = document.getElementById('registerEmail');
    registerPasswordInput = document.getElementById('registerPassword');
    registerError = document.getElementById('registerError');
    authStatusSpan = document.getElementById('auth-status');
    logoutButton = document.getElementById('logoutButton');
    searchInput = document.getElementById('searchInput');
    categoryFilter = document.getElementById('categoryFilter');
    addNewPlantButton = document.getElementById('addNewPlantButton');
    showAllPlantsButton = document.getElementById('showAllPlantsButton');
    showMyGardenButton = document.getElementById('showMyGardenButton');
    plantsSectionHeader = document.getElementById('plantsSectionHeader');
    lightSensorContainer = document.getElementById('lightSensorContainer');
    startLightSensorButton = document.getElementById('startLightSensorButton');
    stopLightSensorButton = document.getElementById('stopLightSensorButton');
    currentLuxValueSpan = document.getElementById('currentLuxValue');
    lightFeedbackDiv = document.getElementById('lightFeedback');
    tempMinFilter = document.getElementById('tempMinFilter');
    tempMaxFilter = document.getElementById('tempMaxFilter');
    sortBySelect = document.getElementById('sortBy');
    googleLensButton = document.getElementById('googleLensButton');

    addPlantModal = document.getElementById('addPlantModal');
    closeAddPlantModalButton = document.getElementById('closeAddPlantModal');
    plantForm = document.getElementById('plantForm');
    plantImageInput = document.getElementById('plantImage');
    plantNameInput = document.getElementById('plantName');
    plantCategoryInput = document.getElementById('plantCategory');
    plantDescriptionInput = document.getElementById('plantDescription');
    plantTempMinInput = document.getElementById('plantTempMin');
    plantTempMaxInput = document.getElementById('plantTempMax');
    plantLightMinInput = document.getElementById('plantLightMin');
    plantLightMaxInput = document.getElementById('plantLightMax');
    saveUpdatePlantButton = document.getElementById('saveUpdatePlantButton');
    cancelUpdatePlantButton = document.getElementById('cancelUpdatePlantButton');
    deletePlantButton = document.getElementById('deletePlant');
    imagePreview = document.getElementById('imagePreview');

    cardModal = document.getElementById('cardModal');
    closeCardModalButton = document.getElementById('closeCardModal');
    zoomedCardImage = document.getElementById('zoomedCardImage');
    zoomedCardContent = document.getElementById('zoomedCardContent');
    closeImageModalButton = document.getElementById('closeImageModalButton');
    imageModal = document.getElementById('imageZoomModal');


    // Funzioni di autenticazione
    async function loginUser(email, password) {
        try {
            const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            console.log("User logged in:", user);
            showToast('Accesso effettuato con successo!', 'success');
            loginError.textContent = ''; // Pulisci eventuali errori precedenti
        } catch (error) {
            const errorCode = error.code;
            let errorMessage = error.message;
            console.error("Login error:", errorCode, errorMessage);

            switch (errorCode) {
                case 'auth/user-not-found':
                    errorMessage = 'Nessun utente trovato con questa email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Password errata.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Formato email non valido.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Troppi tentativi di accesso. Riprova più tardi.';
                    break;
                default:
                    errorMessage = 'Errore di accesso: ' + errorMessage;
            }
            loginError.textContent = errorMessage;
            showToast(errorMessage, 'error');
        }
    }

    async function registerUser(email, password) {
        try {
            const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            console.log("User registered:", user);
            showToast('Registrazione avvenuta con successo!', 'success');
            registerError.textContent = ''; // Pulisci eventuali errori precedenti
        } catch (error) {
            const errorCode = error.code;
            let errorMessage = error.message;
            console.error("Registration error:", errorCode, errorMessage);

            switch (errorCode) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Questa email è già in uso.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Formato email non valido.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La password deve essere di almeno 6 caratteri.';
                    break;
                default:
                    errorMessage = 'Errore di registrazione: ' + errorMessage;
            }
            registerError.textContent = errorMessage;
            showToast(errorMessage, 'error');
        }
    }

    // Funzione per mostrare/nascondere i form di login/registrazione
    function showLoginForm() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
    }

    function showRegisterForm() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
    }

    // Gestione dello stato di autenticazione
    if (window.auth) {
        window.auth.onAuthStateChanged(user => {
            if (user) {
                authStatusSpan.textContent = `Loggato come: ${user.email}`;
                authContainerDiv.classList.add('hidden');
                appContentDiv.classList.remove('hidden');
                logoutButton.classList.remove('hidden');
                loginButton.classList.add('hidden');
                registerButton.classList.add('hidden');
                fetchPlants(); // Carica i dati delle piante solo dopo il login
            } else {
                authStatusSpan.textContent = 'Non loggato';
                authContainerDiv.classList.remove('hidden');
                appContentDiv.classList.add('hidden');
                logoutButton.classList.add('hidden');
                loginButton.classList.remove('hidden');
                registerButton.classList.remove('hidden');
                // Pulisci i dati delle piante se l'utente è sloggato
                gardenContainer.innerHTML = '';
                myGardenContainer.innerHTML = '';
                allPlants = [];
                myGarden = [];
            }
        });
    } else {
        console.error("Errore: window.auth non disponibile dopo DOMContentLoaded. Controlla index.html.");
        showToast("Errore di inizializzazione: Impossibile connettersi ai servizi di autenticazione.", "error");
    }

    // Event Listeners per i bottoni di login/registrazione e link
    if (loginButton) {
        loginButton.addEventListener('click', showLoginForm);
    }
    if (registerButton) {
        registerButton.addEventListener('click', showRegisterForm);
    }
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterForm();
        });
    }

    // Event Listener per il form di login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;
            await loginUser(email, password);
        });
    }

    // Event Listener per il form di registrazione
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = registerEmailInput.value;
            const password = registerPasswordInput.value;
            await registerUser(email, password);
        });
    }

    // Event Listener per il bottone di logout
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            if (window.auth) {
                await window.auth.signOut();
                showToast('Logout effettuato con successo!', 'info');
            }
        });
    }


    // Funzioni per il database (Firestore)
    async function fetchPlants() {
        if (!window.db || !window.auth.currentUser) {
            console.error("Firestore o utente non disponibili.");
            return;
        }

        const userId = window.auth.currentUser.uid;
        const plantsRef = window.db.collection('plants');
        const myGardenRef = window.db.collection('users').doc(userId).collection('myGarden');

        try {
            // Fetch di tutte le piante disponibili
            const plantsSnapshot = await plantsRef.get();
            allPlants = plantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fetch delle piante nel proprio giardino
            const myGardenSnapshot = await myGardenRef.get();
            myGarden = myGardenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            displayPlants();
            displayMyGarden();

        } catch (error) {
            console.error("Errore nel recupero delle piante:", error);
            showToast('Errore nel caricamento delle piante.', 'error');
        }
    }

    function displayPlants() {
        gardenContainer.innerHTML = '';
        let filteredPlants = allPlants;

        // Applica filtro per categoria
        const selectedCategory = categoryFilter.value;
        if (selectedCategory && selectedCategory !== 'all') {
            filteredPlants = filteredPlants.filter(plant => plant.category === selectedCategory);
        }

        // Applica filtro per temperatura
        const minTemp = parseFloat(tempMinFilter.value);
        const maxTemp = parseFloat(tempMaxFilter.value);
        if (!isNaN(minTemp) || !isNaN(maxTemp)) {
            filteredPlants = filteredPlants.filter(plant => {
                const plantMin = plant.tempMin !== null && plant.tempMin !== undefined ? parseFloat(plant.tempMin) : -Infinity;
                const plantMax = plant.tempMax !== null && plant.tempMax !== undefined ? parseFloat(plant.tempMax) : Infinity;

                const passesMin = isNaN(minTemp) || plantMax >= minTemp;
                const passesMax = isNaN(maxTemp) || plantMin <= maxTemp;

                return passesMin && passesMax;
            });
        }

        // Applica filtro di ricerca
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredPlants = filteredPlants.filter(plant =>
                plant.name.toLowerCase().includes(searchTerm) ||
                plant.category.toLowerCase().includes(searchTerm) ||
                plant.description.toLowerCase().includes(searchTerm)
            );
        }

        // Applica ordinamento
        filteredPlants.sort((a, b) => {
            if (currentSortBy === 'name_asc') {
                return a.name.localeCompare(b.name);
            } else if (currentSortBy === 'name_desc') {
                return b.name.localeCompare(a.name);
            } else if (currentSortBy === 'added_asc') {
                const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
                const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
                return dateA - dateB;
            } else if (currentSortBy === 'added_desc') {
                const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
                const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
                return dateB - dateA;
            }
            return 0;
        });


        if (filteredPlants.length === 0) {
            gardenContainer.innerHTML = '<p class="no-results">Nessuna pianta trovata con i criteri di ricerca/filtro attuali.</p>';
            return;
        }

        filteredPlants.forEach(plant => {
            const isAddedToGarden = myGarden.some(item => item.plantId === plant.id);
            const card = createPlantCard(plant, isAddedToGarden);
            gardenContainer.appendChild(card);
        });
        plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
    }


    function displayMyGarden() {
        myGardenContainer.innerHTML = '';

        if (myGarden.length === 0) {
            myGardenContainer.innerHTML = '<p class="no-results">Il tuo giardino è vuoto. Aggiungi alcune piante!</p>';
            return;
        }

        myGarden.forEach(gardenPlant => {
            const plantDetails = allPlants.find(p => p.id === gardenPlant.plantId);
            if (plantDetails) {
                const card = createPlantCard(plantDetails, true, true); // true per isMyGarden
                myGardenContainer.appendChild(card);
            }
        });
    }

    function createPlantCard(plant, isAddedToGarden, isMyGarden = false) {
        const card = document.createElement('div');
        card.className = 'plant-card';
        if (isMyGarden) {
            card.classList.add('my-garden-card');
        }

        card.dataset.id = plant.id;

        let imageUrl = plant.imageUrl || 'https://via.placeholder.com/150'; // Immagine di default

        let cardActionsHtml = '';
        if (window.auth.currentUser) { // Mostra i bottoni solo se loggato
            if (isMyGarden) {
                cardActionsHtml = `
                    <button class="remove-from-garden-btn" data-id="${plant.id}" title="Rimuovi dal mio giardino">
                        <i class="fas fa-minus-circle"></i> Rimuovi
                    </button>
                    <button class="edit-plant-btn" data-id="${plant.id}" title="Modifica pianta">
                        <i class="fas fa-edit"></i> Modifica
                    </button>
                `;
            } else {
                cardActionsHtml = `
                    <button class="add-to-garden-btn ${isAddedToGarden ? 'added' : ''}" data-id="${plant.id}" ${isAddedToGarden ? 'disabled' : ''} title="${isAddedToGarden ? 'Già aggiunto' : 'Aggiungi al mio giardino'}">
                        <i class="fas fa-plus-circle"></i> ${isAddedToGarden ? 'Aggiunta' : 'Aggiungi'}
                    </button>
                    <button class="edit-plant-btn" data-id="${plant.id}" title="Modifica pianta">
                        <i class="fas fa-edit"></i> Modifica
                    </button>
                `;
            }
        } else {
            // Se non loggato, mostra solo il bottone per visualizzare i dettagli (o nessun bottone di azione)
            cardActionsHtml = `
                <button class="view-details-btn" data-id="${plant.id}" title="Vedi dettagli">
                    <i class="fas fa-info-circle"></i> Dettagli
                </button>
            `;
        }

        card.innerHTML = `
            <img src="${imageUrl}" alt="${plant.name}" class="plant-image">
            <h3>${plant.name}</h3>
            <p><strong>Categoria:</strong> ${plant.category}</p>
            <div class="card-actions">
                ${cardActionsHtml}
                <button class="view-card-details-btn" data-id="${plant.id}" title="Vedi dettagli">
                    <i class="fas fa-info-circle"></i> Dettagli
                </button>
            </div>
        `;

        // Event listener per ingrandire l'immagine
        const plantImage = card.querySelector('.plant-image');
        if (plantImage) {
            plantImage.addEventListener('click', (event) => {
                event.stopPropagation(); // Evita di chiudere subito la modale genitore se ce ne sono
                zoomedCardImage.src = imageUrl;
                imageModal.style.display = 'flex';
            });
        }


        // Event listener per i bottoni "Aggiungi", "Rimuovi", "Modifica", "Dettagli"
        if (window.auth.currentUser) {
            const addToGardenBtn = card.querySelector('.add-to-garden-btn');
            if (addToGardenBtn) {
                addToGardenBtn.addEventListener('click', async () => {
                    await addPlantToGarden(plant.id);
                    // Ridisplay per aggiornare lo stato del bottone
                    if (!isMyGardenCurrentlyVisible) { // Se siamo nella vista "Tutte le piante"
                        displayPlants();
                    }
                });
            }

            const removeFromGardenBtn = card.querySelector('.remove-from-garden-btn');
            if (removeFromGardenBtn) {
                removeFromGardenBtn.addEventListener('click', async () => {
                    await removePlantFromGarden(plant.id);
                    if (isMyGardenCurrentlyVisible) { // Se siamo nella vista "Mio Giardino"
                        displayMyGarden();
                    } else { // Altrimenti ricarica Tutte le Piante per aggiornare il bottone
                        displayPlants();
                    }
                });
            }

            const editPlantBtn = card.querySelector('.edit-plant-btn');
            if (editPlantBtn) {
                editPlantBtn.addEventListener('click', () => {
                    openAddPlantModalForEdit(plant.id);
                });
            }
        }


        const viewCardDetailsBtn = card.querySelector('.view-card-details-btn');
        if (viewCardDetailsBtn) {
            viewCardDetailsBtn.addEventListener('click', () => {
                showCardDetails(plant);
            });
        }

        return card;
    }


    async function addPlantToGarden(plantId) {
        if (!window.db || !window.auth.currentUser) {
            showToast('Devi essere loggato per aggiungere piante al tuo giardino.', 'error');
            return;
        }

        const userId = window.auth.currentUser.uid;
        const myGardenRef = window.db.collection('users').doc(userId).collection('myGarden');

        try {
            // Controlla se la pianta è già stata aggiunta
            const existingDoc = await myGardenRef.where('plantId', '==', plantId).get();
            if (!existingDoc.empty) {
                showToast('Questa pianta è già nel tuo giardino!', 'info');
                return;
            }

            await myGardenRef.add({
                plantId: plantId,
                addedAt: new Date(),
                // Puoi aggiungere altri campi specifici per il giardino se necessario
            });
            showToast('Pianta aggiunta al tuo giardino!', 'success');
            await fetchPlants(); // Ricarica i dati per aggiornare le visualizzazioni
        } catch (error) {
            console.error("Errore nell'aggiungere la pianta al giardino:", error);
            showToast('Errore nell\'aggiungere la pianta al giardino.', 'error');
        }
    }

    async function removePlantFromGarden(plantId) {
        if (!window.db || !window.auth.currentUser) {
            showToast('Devi essere loggato per rimuovere piante dal tuo giardino.', 'error');
            return;
        }

        const userId = window.auth.currentUser.uid;
        const myGardenRef = window.db.collection('users').doc(userId).collection('myGarden');

        try {
            const querySnapshot = await myGardenRef.where('plantId', '==', plantId).get();
            if (!querySnapshot.empty) {
                const docId = querySnapshot.docs[0].id;
                await myGardenRef.doc(docId).delete();
                showToast('Pianta rimossa dal tuo giardino.', 'info');
                await fetchPlants(); // Ricarica i dati per aggiornare le visualizzazioni
            }
        } catch (error) {
            console.error("Errore nel rimuovere la pianta dal giardino:", error);
            showToast('Errore nel rimuovere la pianta dal giardino.', 'error');
        }
    }

    async function savePlant(event) {
        event.preventDefault();

        if (!window.db || !window.auth.currentUser || !window.storage) {
            showToast('Servizi Firebase non disponibili o utente non loggato.', 'error');
            return;
        }

        const userId = window.auth.currentUser.uid;

        const plantData = {
            name: plantNameInput.value,
            category: plantCategoryInput.value,
            description: plantDescriptionInput.value,
            tempMin: parseFloat(plantTempMinInput.value) || null,
            tempMax: parseFloat(plantTempMaxInput.value) || null,
            lightMin: parseFloat(plantLightMinInput.value) || null,
            lightMax: parseFloat(plantLightMaxInput.value) || null,
            ownerId: userId // Salva l'ID dell'utente che ha creato la pianta
        };

        try {
            if (plantImageInput.files && plantImageInput.files[0]) {
                const imageFile = plantImageInput.files[0];
                const storagePath = `plant_images/${userId}/${Date.now()}_${imageFile.name}`;
                // Usa window.getStorageRef e window.uploadBytesResumable
                const storageRefInstance = window.getStorageRef(window.storage, storagePath);
                const uploadTask = window.uploadBytesResumable(storageRefInstance, imageFile);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Puoi aggiungere un indicatore di progresso qui
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        // Aggiorna la UI con il progresso
                    },
                    (error) => {
                        console.error("Errore nell'upload dell'immagine:", error);
                        showToast('Errore nell\'upload dell\'immagine.', 'error');
                    },
                    async () => {
                        // Upload completato, ottieni l'URL di download
                        plantData.imageUrl = await window.getDownloadURL(uploadTask.snapshot.ref);
                        // Ora salva i dati della pianta con l'URL dell'immagine
                        await savePlantDataToFirestore(plantData);
                    }
                );
            } else {
                // Se non c'è una nuova immagine, salva direttamente i dati (per update senza immagine)
                await savePlantDataToFirestore(plantData);
            }
        } catch (error) {
            console.error("Errore generale nel salvataggio pianta:", error);
            showToast('Errore nel salvataggio della pianta.', 'error');
        }
    }

    async function savePlantDataToFirestore(plantData) {
        try {
            if (currentPlantIdToUpdate) {
                // Aggiorna pianta esistente
                await window.db.collection('plants').doc(currentPlantIdToUpdate).update({
                    ...plantData,
                    updatedAt: new Date()
                });
                showToast('Pianta aggiornata con successo!', 'success');
            } else {
                // Aggiungi nuova pianta
                await window.db.collection('plants').add({
                    ...plantData,
                    createdAt: new Date()
                });
                showToast('Nuova pianta aggiunta con successo!', 'success');
            }
            closeAddPlantModal();
            plantForm.reset();
            imagePreview.src = '#'; // Pulisci l'anteprima immagine
            imagePreview.style.display = 'none';
            await fetchPlants(); // Ricarica le piante dopo l'aggiunta/modifica
        } catch (error) {
            console.error("Errore nel salvataggio dati Firestore:", error);
            showToast('Errore nel salvataggio dati pianta.', 'error');
        }
    }

    async function deletePlant() {
        if (!currentPlantIdToUpdate || !window.db || !window.auth.currentUser) {
            showToast('Nessuna pianta selezionata per l\'eliminazione o servizi non disponibili.', 'error');
            return;
        }

        const plantToDelete = allPlants.find(p => p.id === currentPlantIdToUpdate);
        if (!plantToDelete || plantToDelete.ownerId !== window.auth.currentUser.uid) {
            showToast('Non hai il permesso di eliminare questa pianta.', 'error');
            return;
        }

        // Chiedi conferma
        const confirmation = confirm('Sei sicuro di voler eliminare questa pianta dal database? Questa azione è irreversibile.');
        if (!confirmation) {
            return;
        }

        try {
            // Elimina immagine da Storage se esiste
            if (plantToDelete.imageUrl) {
                // L'URL dell'immagine da Firestore è un URL di download, non il percorso di storage diretto.
                // Per eliminarlo, dobbiamo ricostruire il percorso o trovare un modo per ottenerlo dall'URL.
                // Un modo semplice è estrarre il path dal fullPath dello snapshot originale,
                // ma qui abbiamo solo l'URL. Se l'URL contiene il percorso completo, possiamo usarlo.
                // Altrimenti, è più complesso. Assumiamo che imageUrl sia un percorso valido in storage.
                const imageRef = window.getStorageRef(window.storage, plantToDelete.imageUrl);
                await imageRef.delete().catch(error => {
                    // Ignora l'errore se il file non esiste, ma logga altri errori
                    if (error.code !== 'storage/object-not-found') {
                        console.error("Errore nell'eliminazione dell'immagine dallo storage:", error);
                    }
                });
            }

            // Elimina documento da Firestore
            await window.db.collection('plants').doc(currentPlantIdToUpdate).delete();

            // Rimuovi anche da tutti i "myGarden" degli utenti, se presente
            const usersSnapshot = await window.db.collection('users').get();
            for (const userDoc of usersSnapshot.docs) {
                const myGardenSnapshot = await userDoc.ref.collection('myGarden')
                                            .where('plantId', '==', currentPlantIdToUpdate).get();
                for (const gardenPlantDoc of myGardenSnapshot.docs) {
                    await gardenPlantDoc.ref.delete();
                }
            }


            showToast('Pianta eliminata con successo!', 'success');
            closeAddPlantModal();
            plantForm.reset();
            imagePreview.src = '#';
            imagePreview.style.display = 'none';
            await fetchPlants(); // Ricarica le piante
        } catch (error) {
            console.error("Errore nell'eliminazione della pianta:", error);
            showToast('Errore nell\'eliminazione della pianta.', 'error');
        }
    }


    function openAddPlantModal(plant = null) {
        addPlantModal.style.display = 'flex';
        plantForm.reset();
        imagePreview.src = '#';
        imagePreview.style.display = 'none';
        currentPlantIdToUpdate = null;
        deletePlantButton.classList.add('hidden'); // Nascondi il bottone elimina per una nuova pianta
        saveUpdatePlantButton.textContent = 'Aggiungi Pianta';

        if (plant) {
            // Pre-popola il form per la modifica
            plantNameInput.value = plant.name;
            plantCategoryInput.value = plant.category;
            plantDescriptionInput.value = plant.description;
            plantTempMinInput.value = plant.tempMin || '';
            plantTempMaxInput.value = plant.tempMax || '';
            plantLightMinInput.value = plant.lightMin || '';
            plantLightMaxInput.value = plant.lightMax || '';
            if (plant.imageUrl) {
                imagePreview.src = plant.imageUrl;
                imagePreview.style.display = 'block';
            }
            currentPlantIdToUpdate = plant.id;
            saveUpdatePlantButton.textContent = 'Salva Modifiche';
            // Mostra il bottone elimina solo se l'utente è il proprietario
            if (window.auth.currentUser && plant.ownerId === window.auth.currentUser.uid) {
                deletePlantButton.classList.remove('hidden');
            }
        }
    }

    function openAddPlantModalForEdit(plantId) {
        const plantToEdit = allPlants.find(p => p.id === plantId);
        if (plantToEdit) {
            openAddPlantModal(plantToEdit);
        } else {
            showToast('Pianta non trovata per la modifica.', 'error');
        }
    }


    function closeAddPlantModal() {
        addPlantModal.style.display = 'none';
        plantForm.reset();
        imagePreview.src = '#';
        imagePreview.style.display = 'none';
        currentPlantIdToUpdate = null;
    }

    // Funzioni per la modale dettagli card
    function showCardDetails(plant) {
        let detailsHtml = `
            <h3>${plant.name}</h3>
            <p><strong>Categoria:</strong> ${plant.category}</p>
            <p><strong>Descrizione:</strong> ${plant.description || 'N/A'}</p>
            <p><strong>Temperatura Ideale:</strong> ${plant.tempMin !== null && plant.tempMax !== null ? `${plant.tempMin}°C - ${plant.tempMax}°C` : 'N/A'}</p>
            <p><strong>Luce Ideale (Lux):</strong> ${plant.lightMin !== null && plant.lightMax !== null ? `${plant.lightMin} - ${plant.lightMax} Lux` : 'N/A'}</p>
            <p><strong>Aggiunta il:</strong> ${plant.createdAt ? new Date(plant.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
        `;
        zoomedCardContent.innerHTML = detailsHtml;
        cardModal.style.display = 'flex';
    }


    function closeCardModal() {
        cardModal.style.display = 'none';
        zoomedCardImage.src = ''; // Pulisci l'immagine
        zoomedCardContent.innerHTML = ''; // Pulisci il contenuto
    }


    // Event Listeners per i filtri e la ricerca
    if (searchInput) searchInput.addEventListener('input', displayPlants);
    if (categoryFilter) categoryFilter.addEventListener('change', displayPlants);
    if (tempMinFilter) tempMinFilter.addEventListener('input', displayPlants);
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', displayPlants);
    if (sortBySelect) {
        sortBySelect.addEventListener('change', (e) => {
            currentSortBy = e.target.value;
            displayPlants();
        });
    }


    // Event Listeners per i bottoni "Aggiungi Nuova Pianta", "Tutte le Piante", "Mio Giardino"
    if (addNewPlantButton) {
        addNewPlantButton.addEventListener('click', () => openAddPlantModal());
    }
    if (showAllPlantsButton) {
        showAllPlantsButton.addEventListener('click', () => {
            isMyGardenCurrentlyVisible = false;
            gardenContainer.classList.remove('hidden');
            myGardenContainer.classList.add('hidden');
            plantsSectionHeader.textContent = 'Tutte le Piante Disponibili';
            displayPlants(); // Ridisplay per applicare eventuali filtri/ricerche
        });
    }
    if (showMyGardenButton) {
        showMyGardenButton.addEventListener('click', () => {
            isMyGardenCurrentlyVisible = true;
            gardenContainer.classList.add('hidden');
            myGardenContainer.classList.remove('hidden');
            plantsSectionHeader.textContent = 'Il Mio Giardino';
            displayMyGarden();
        });
    }


    // Gestione della modale per aggiungere/modificare pianta
    if (closeAddPlantModalButton) closeAddPlantModalButton.addEventListener('click', closeAddPlantModal);
    if (addPlantModal) addPlantModal.addEventListener('click', (e) => {
        if (e.target === addPlantModal) closeAddPlantModal();
    });
    if (plantForm) plantForm.addEventListener('submit', savePlant);
    if (cancelUpdatePlantButton) cancelUpdatePlantButton.addEventListener('click', closeAddPlantModal);
    if (deletePlantButton) deletePlantButton.addEventListener('click', deletePlant);

    // Anteprima immagine upload
    if (plantImageInput) {
        plantImageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.src = '#';
                imagePreview.style.display = 'none';
            }
        });
    }

    // Chiusura modali (listener per il click sul bottone 'x' e sullo sfondo della modale)
    if (closeImageModalButton) closeImageModalButton.addEventListener('click', () => { imageModal.style.display = 'none'; });
    if (imageModal) imageModal.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.style.display = 'none'; });

    if (closeCardModalButton) closeCardModalButton.addEventListener('click', closeCardModal); // Chiude la modale con la funzione che pulisce e resetta
    if (cardModal) cardModal.addEventListener('click', (e) => { if (e.target === cardModal) closeCardModal(); });


    // Funzionalità del sensore di luce ambientale
    function startLightSensor() {
        if ('AmbientLightSensor' in window) {
            ambientLightSensor = new AmbientLightSensor();

            ambientLightSensor.onreading = () => {
                const lux = ambientLightSensor.illuminance;
                currentLuxValueSpan.textContent = `${lux.toFixed(2)} lux`;
                updateLightFeedback(lux);
            };

            ambientLightSensor.onerror = (event) => {
                console.error("Errore sensore di luce:", event.error.name, event.error.message);
                lightFeedbackDiv.textContent = `Errore sensore: ${event.error.message}`;
                showToast(`Errore sensore di luce: ${event.error.message}`, 'error');
            };

            ambientLightSensor.start();
            showToast('Sensore di luce avviato!', 'info');
            startLightSensorButton.classList.add('hidden');
            stopLightSensorButton.classList.remove('hidden');
            lightFeedbackDiv.textContent = 'Misurando la luce...';
        } else {
            lightFeedbackDiv.textContent = 'Sensore di luce non supportato dal browser.';
            showToast('Sensore di luce non supportato dal tuo browser.', 'warning');
        }
    }

    function stopLightSensor() {
        if (ambientLightSensor) {
            ambientLightSensor.stop();
            showToast('Sensore di luce fermato.', 'info');
            startLightSensorButton.classList.remove('hidden');
            stopLightSensorButton.classList.add('hidden');
            lightFeedbackDiv.textContent = 'Sensore fermato.';
        }
    }

    function updateLightFeedback(lux) {
        let feedback = '';
        if (lux < 50) {
            feedback = 'Luce molto bassa. Adatta per piante da ombra profonda.';
        } else if (lux < 200) {
            feedback = 'Luce bassa. Buona per piante da ombra parziale.';
        } else if (lux < 1000) {
            feedback = 'Luce moderata. Ideale per la maggior parte delle piante da interno.';
        } else if (lux < 5000) {
            feedback = 'Luce luminosa. Adatta per piante che amano la luce indiretta brillante.';
        } else {
            feedback = 'Luce molto forte. Potrebbe essere necessario filtrare la luce per alcune piante.';
        }
        lightFeedbackDiv.textContent = feedback;
    }

    // Event Listeners per il sensore di luce
    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);

    // TODO: Implementare funzionalità Google Lens (Placeholder)
    if (googleLensButton) {
        googleLensButton.addEventListener('click', () => {
            showToast('Funzionalità Google Lens non ancora implementata.', 'info');
            // Qui andrebbe la logica per aprire Google Lens o una sua integrazione
        });
    }

    // Funzione per il bottone Scroll-to-Top
    const scrollToTopButton = document.getElementById("scrollToTopButton");

    if (scrollToTopButton) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 200) { // Mostra il bottone dopo aver scrollato di 200px
                scrollToTopButton.style.display = "block";
            } else {
                scrollToTopButton.style.display = "none";
            }
        });

        scrollToTopButton.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

}); // Fine del blocco DOMContentLoaded
