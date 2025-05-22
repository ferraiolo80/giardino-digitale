// 1. DICHIARAZIONI GLOBALI
// Queste sono le variabili che devono essere accessibili da qualsiasi funzione
let allPlants = [];
let myGarden = []; // Inizializza come array vuoto
let currentPlantIdToUpdate = null; // Variabile per tenere traccia dell'ID della pianta da aggiornare
let ambientLightSensor = null; // Variabile per il sensore di luce

// 2. Riferimenti agli elementi HTML (Dichiarati una sola volta in modo globale se usati spesso)
// Nota: molti di questi vengono ridefiniti all'interno di DOMContentLoaded
// per coerenza con l'uso tipico di getElementById all'interno del listener.
// Per semplicità, qui ho mantenuto la tua struttura.
const gardenContainer = document.getElementById('garden-container');
const myGardenContainer = document.getElementById('my-garden');
const authContainerDiv = document.getElementById('auth-container');
const appContentDiv = document.getElementById('app-content');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutButton = document.getElementById('logoutButton');
const authStatusDiv = document.getElementById('auth-status');
const searchInput = document.getElementById('searchInput');
const addNewPlantButton = document.getElementById('addNewPlantButton');
const newPlantCard = document.getElementById('newPlantCard');
const saveNewPlantButton = document.getElementById('saveNewPlant');
const cancelNewPlantButton = document.getElementById('cancelNewPlant');
const categoryFilter = document.getElementById('categoryFilter');
const tempMinFilter = document.getElementById('tempMinFilter');
const tempMaxFilter = document.getElementById('tempMaxFilter');
const toggleMyGardenButton = document.getElementById('toggleMyGarden');
const giardinoTitle = document.getElementById('giardinoTitle');
const startLightSensorButton = document.getElementById('startLightSensor');
const stopLightSensorButton = document.getElementById('stopLightSensor');
const currentLuxValueSpan = document.getElementById('currentLuxValue');
const lightFeedbackDiv = document.getElementById('lightFeedback');
const plantsContainerDiv = document.getElementById('garden-container'); // Duplicato di gardenContainer, può essere rimosso o rinominato
const newPlantIdealLuxMinInput = document.getElementById('new-idealLuxMin');
const newPlantIdealLuxMaxInput = document.getElementById('new-idealLuxMax');
const updatePlantIdealLuxMinInput = document.getElementById('updatePlantIdealLuxMin'); // Corretto ID per l'update form (se presente)
const updatePlantIdealLuxMaxInput = document.getElementById('updatePlantIdealLuxMax'); // Corretto ID per l'update form (se presente)


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
      // L'authStateChanged listener si occuperà di aggiornare l'UI
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
      // L'authStateChanged listener si occuperà di aggiornare l'UI
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
    // L'authStateChanged listener si occuperà di aggiornare l'UI
  } catch (error) {
    console.error("Errore durante il logout:", error);
  }
}

// 5. FUNZIONI DI RENDERING E GESTIONE DELLE CARD

function createPlantCard(plantData, isMyGardenCard = false) {
    console.log("createPlantCard CALLED. Plant:", plantData.name, plantData.id);
    const image = plantData.image || 'plant_9215709.png';
    const div = document.createElement("div");
    div.className = isMyGardenCard ? "my-plant-card" : "plant-card";

    let buttonsHtml = '';
    const user = firebase.auth().currentUser;

    if (user) {
        // Funzione helper per controllare se l'utente attuale è l'admin
        // (Nota: questa è una copia locale della funzione, meglio averla globale o passarla)
        // Per ora la mettiamo qui per comodità, ma in un'app grande si refattorizza.
        const isAdminUser = () => user.email === 'ferraiolo80@hotmail.it'; // <- CAMBIA CON LA TUA EMAIL ADMIN

        if (isMyGardenCard) {
            // Per il "Mio Giardino", mostra sempre rimuovi e aggiorna
            buttonsHtml += `<button class="remove-button" data-plant-id="${plantData.id}">Rimuovi dal mio giardino</button>`;
            buttonsHtml += `<button class="update-plant-button" data-plant-id="${plantData.id}">Aggiorna Info</button>`;
        } else {
            // Per l'elenco principale:
            // 1. Bottone "Rimuovi dal mio giardino" o "Aggiungi al mio giardino"
            if (myGarden.includes(plantData.id)) {
                buttonsHtml += `<button class="remove-button" data-plant-id="${plantData.id}">Rimuovi dal mio giardino</button>`;
            } else {
                buttonsHtml += `<button class="add-to-garden-button" data-plant-id="${plantData.id}">Aggiungi al mio giardino</button>`;
            }
            
            // 2. Bottone "Aggiorna Info" (visibile a tutti o a chi ha permessi di update)
            buttonsHtml += `<button class="update-plant-button" data-plant-id="${plantData.id}">Aggiorna Info</button>`;

            // 3. Bottone "Elimina Definitivamente" (visibile solo all'admin)
            if (isAdminUser()) { // Mostra solo se l'utente è l'admin
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
        ${plantData.idealLuxMin ? `<p>Lux Ideali: ${plantData.idealLuxMin} - ${plantData.idealLuxMax} Lux</p>` : ''}
        ${buttonsHtml}
    `;

    return div;
}

async function renderPlants(plantArray) {
    console.log("renderPlants: Chiamata con array:", plantArray);
    const gardenContainer = document.getElementById('garden-container');
    gardenContainer.innerHTML = ""; // Pulisce il contenitore

    // Se l'utente è loggato, recupera il giardino corrente per mostrare i bottoni corretti
    const user = firebase.auth().currentUser;
    if (user && !myGarden.length) { // Solo se myGarden non è già stato caricato
       await loadMyGardenFromFirebase(); // Assicurati che myGarden sia aggiornato
    }

    plantArray.forEach((plant) => {
        const plantCard = createPlantCard(plant, false); // false = non è una card del mio giardino
        gardenContainer.appendChild(plantCard);
    });
}

async function renderMyGarden(gardenPlantIds) {
    myGardenContainer.innerHTML = ''; // Pulisci il contenitore

    const emptyGardenMessage = document.getElementById('empty-garden-message'); // Ottieni il riferimento

    if (gardenPlantIds.length === 0) {
        // Se il giardino è vuoto, mostra solo il messaggio
        if (emptyGardenMessage) {
            emptyGardenMessage.style.display = 'block';
            myGardenContainer.appendChild(emptyGardenMessage); // Assicurati che il messaggio sia nel contenitore
        }
        // Il layout grid CSS per myGardenContainer si applicherà anche se vuoto,
        // ma non ci saranno card da disporre.
        // Se vuoi centrare il messaggio, fallo con CSS:
        // #my-garden #empty-garden-message { text-align: center; }
    } else {
        // Se ci sono piante, nascondi il messaggio e renderizza le card
        if (emptyGardenMessage) {
            emptyGardenMessage.style.display = 'none'; // Nascondi il messaggio
        }

        const plantsToDisplay = allPlants.filter(plant => gardenPlantIds.includes(plant.id));
        plantsToDisplay.forEach(plant => {
            const plantCard = createPlantCard(plant, true); // true per myGardenCard
            myGardenContainer.appendChild(plantCard);
        });
    }
    // Non devi più impostare display = 'grid' qui, lo farà il CSS
}

// 6. FUNZIONI DI FILTRO E RICERCA
function handleFilter(event) {
    const selectedCategory = event.target.value;
    let filteredPlants;

    if (selectedCategory === 'all') {
        filteredPlants = allPlants;
    } else {
        filteredPlants = allPlants.filter(plant => plant.category === selectedCategory);
    }
    renderPlants(filteredPlants);
}

function handleTempFilter() {
    const minTemp = parseInt(document.getElementById('tempMinFilter').value) || -Infinity;
    const maxTemp = parseInt(document.getElementById('tempMaxFilter').value) || Infinity;

    const filteredPlants = allPlants.filter(plant =>
        (plant.tempMin >= minTemp || isNaN(plant.tempMin)) && (plant.tempMax <= maxTemp || isNaN(plant.tempMax))
    );
    renderPlants(filteredPlants);
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredPlants = allPlants.filter(plant =>
        plant.name.toLowerCase().includes(searchTerm) ||
        plant.category.toLowerCase().includes(searchTerm)
    );
    renderPlants(filteredPlants);
}

// 7. NUOVE FUNZIONI DI AGGIORNAMENTO E CANCELLAZIONE PIANTE
function showUpdatePlantForm(plant) {
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
    document.getElementById('updatePlantIdealLuxMin').value = plant.idealLuxMin || '';
    document.getElementById('updatePlantIdealLuxMax').value = plant.idealLuxMax || '';

    // Rendi visibile il form
    document.getElementById('updatePlantCard').style.display = 'block';

    // Aggiungi QUESTA RIGA per lo scroll automatico
    document.getElementById('updatePlantCard').scrollIntoView({
        behavior: 'smooth', // Animazione di scroll fluida
        block: 'start'      // Allinea l'inizio dell'elemento all'inizio della viewport
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
    document.getElementById('updatePlantCategory').value = 'Fiore';
    document.getElementById('updatePlantImageURL').value = '';
    document.getElementById('updatePlantIdealLuxMin').value = '';
    document.getElementById('updatePlantIdealLuxMax').value = '';
}

async function updatePlantInFirebase(plantId, updatedData) {
    try {
        await db.collection('plants').doc(plantId).update(updatedData);
        console.log("Pianta aggiornata con successo:", plantId);
        await loadPlantsFromFirebase(); // Ricarica e renderizza tutte le piante
        await loadMyGardenFromFirebase(); // Ricarica e renderizza il giardino
    } catch (error) {
        console.error("Errore nell'aggiornamento della pianta:", error);
        alert("Errore nell'aggiornamento della pianta. Controlla la console e le regole di sicurezza di Firebase.");
    }
}

async function deletePlantFromDatabase(plantId) {
    try {
        // 1. Elimina la pianta dalla collezione principale 'plants'
        await db.collection('plants').doc(plantId).delete();
        console.log("Pianta eliminata dal database principale:", plantId);

        // 2. Rimuovi la pianta da TUTTI i giardini degli utenti
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

        // 3. Aggiorna la UI per riflettere le modifiche
        await loadPlantsFromFirebase(); // Ricarica tutte le piante
        await loadMyGardenFromFirebase(); // Ricarica il giardino dell'utente corrente
        alert("Pianta eliminata con successo!");

    } catch (error) {
        console.error("Errore durante l'eliminazione della pianta dal database:", error);
        alert("Si è verificato un errore durante l'eliminazione della pianta. Controlla le regole di sicurezza.");
    }
}

// 8. FUNZIONI DI GESTIONE DEL GIARDINO (Aggiungi/Rimuovi)
async function addToMyGarden(plantId) {
    console.log("addToMyGarden: Inizio aggiunta pianta con ID:", plantId);
    const user = firebase.auth().currentUser;
    if (user) {
        // Aggiungi solo se non già presente
        if (!myGarden.includes(plantId)) {
            myGarden.push(plantId);
            console.log("addToMyGarden: 'myGarden' dopo l'aggiunta:", myGarden);

            await saveMyGardenToFirebase(myGarden);
            // Non chiamare renderMyGarden e renderPlants direttamente qui,
            // loadMyGardenFromFirebase e loadPlantsFromFirebase già lo fanno al completamento
            await loadPlantsFromFirebase(); // Ricarica l'elenco principale per aggiornare i bottoni
            await loadMyGardenFromFirebase(); // Ricarica il mio giardino per aggiornare i bottoni
            console.log("addToMyGarden: Fine aggiunta pianta con ID:", plantId);
        } else {
            console.log("addToMyGarden: Pianta già presente nel giardino:", plantId);
        }
    } else {
        console.log("addToMyGarden: Utente non autenticato. Impossibile aggiungere al giardino.");
        alert("Devi essere autenticato per aggiungere piante al tuo giardino.");
    }
}

async function removeFromMyGarden(plantIdToRemove) {
    console.log("removeFromMyGarden: plantIdToRemove =", plantIdToRemove);
    console.log("removeFromMyGarden: myGarden prima della rimozione =", JSON.stringify(myGarden));

    try {
        const user = firebase.auth().currentUser;
        if (user) {
            myGarden = myGarden.filter(plantId => plantId !== plantIdToRemove);
            await saveMyGardenToFirebase(myGarden);
            await loadMyGardenFromFirebase(); // Ricarica e renderizza il giardino
            await loadPlantsFromFirebase(); // Ricarica l'elenco principale per aggiornare i bottoni
            console.log("removeFromMyGarden: myGarden dopo la rimozione =", JSON.stringify(myGarden));
        } else {
            console.log("Utente non autenticato. Operazione non permessa.");
            alert("Devi essere autenticato per rimuovere piante dal tuo giardino.");
        }
    } catch (error) {
        console.error("Errore durante la rimozione della pianta dal 'Mio Giardino':", error);
    }
}

// 9. FUNZIONI DI SALVATAGGIO/CARICAMENTO DATI DA FIREBASE
async function saveNewPlantToFirebase() {
    const newPlantName = document.getElementById('newPlantName').value;
    const newPlantSunlight = document.getElementById('newPlantSunlight').value;
    const newPlantWatering = document.getElementById('newPlantWatering').value;
    const newPlantTempMin = document.getElementById('newPlantTempMin').value;
    const newPlantTempMax = document.getElementById('newPlantTempMax').value;
    const newPlantDescription = document.getElementById('newPlantDescription').value;
    const newPlantCategory = document.getElementById('newPlantCategory').value;
    const newPlantImageURL = document.getElementById('newPlantImageURL').value;
    const newPlantIdealLuxMin = parseInt(document.getElementById('newPlantIdealLuxMin').value);
    const newPlantIdealLuxMax = parseInt(document.getElementById('newPlantIdealLuxMax').value);

    // Migliora la validazione per includere i campi numerici e i nuovi campi lux
    if (newPlantName && newPlantSunlight && newPlantWatering &&
        !isNaN(parseInt(newPlantTempMin)) && !isNaN(parseInt(newPlantTempMax)) &&
        !isNaN(newPlantIdealLuxMin) && !isNaN(newPlantIdealLuxMax)) { // Assicurati che i campi numerici siano numeri validi
        try {
            const docRef = await db.collection('plants').add({
                name: newPlantName,
                sunlight: newPlantSunlight,
                watering: newPlantWatering,
                tempMin: parseInt(newPlantTempMin), // Assicurati che siano convertiti in numero
                tempMax: parseInt(newPlantTempMax), // Assicurati che siano convertiti in numero
                description: newPlantDescription,
                category: newPlantCategory,
                image: newPlantImageURL,
                // AGGIUNGI QUI I CAMPI LUX DIRETTAMENTE NELL'OGGETTO
                idealLuxMin: newPlantIdealLuxMin,
                idealLuxMax: newPlantIdealLuxMax
            });

            console.log("Nuova pianta aggiunta con ID: ", docRef.id);
            if (newPlantCard) { // Controlla se l'elemento esiste
                newPlantCard.style.display = 'none';
            }
            clearNewPlantForm(); // Assicurati che questa funzione azzeri anche i campi Lux
            await loadPlantsFromFirebase(); // Ricarica l'elenco principale e renderizza
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
    document.getElementById('newPlantCategory').value = '';
    document.getElementById('newPlantImageURL').value = '';
    document.getElementById('newPlantIdealLuxMin').value = '';
    document.getElementById('newPlantIdealLuxMax').value = '';
}

async function loadMyGardenFromFirebase() {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            const doc = await db.collection('gardens').doc(user.uid).get();
            const firebaseGarden = doc.data()?.plants || [];
            console.log("Giardino caricato da Firebase:", firebaseGarden);
            myGarden = firebaseGarden; // Aggiorna la variabile globale myGarden
            await renderMyGarden(myGarden); // Renderizza il giardino con i dati di Firebase
        } catch (error) {
            console.error("Errore nel caricamento del giardino da Firebase:", error);
            myGarden = []; // In caso di errore, inizializza myGarden come array vuoto
            await renderMyGarden(myGarden);
        } finally {
            // isMyGardenEmpty è gestito all'interno di updateGardenVisibility
            updateGardenVisibility();
        }
    } else {
        myGarden = []; // Se non loggato, inizializza myGarden come array vuoto
        await renderMyGarden(myGarden); // Se non loggato, renderizza un giardino vuoto
        updateGardenVisibility(); // Aggiorna la visibilità anche per non loggati
    }
}

async function saveMyGardenToFirebase(garden) {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            const gardenRef = db.collection('gardens').doc(user.uid);
            await gardenRef.set({ plants: garden }, { merge: true }); // Usa set con merge per creare se non esiste
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
        renderPlants(allPlants); // Renderizza tutte le piante disponibili
    } catch (error) {
        console.error("Errore nel caricamento delle piante da Firebase:", error);
    }
}

// 10. FUNZIONI DI VISIBILITÀ UI
function updateGardenToggleButtonState(isMyGardenEmpty, shouldMyGardenBeVisible) {
    const toggleMyGardenButton = document.getElementById('toggleMyGarden');
    if (!toggleMyGardenButton) {
        console.error("Elemento toggleMyGarden non trovato!");
        return;
    }

    // Qui non devi più cercare l'icona ogni volta, ma la includi nel innerHTML
    // o la manipoli tramite classi se l'icona è già un figlio fisso.
    // L'errore "sparite le icone" suggerisce che il testo viene sovrascritto senza l'icona.
    // Il modo più robusto è includere l'icona nella stringa innerHTML.

    if (shouldMyGardenBeVisible) {
        // Se il giardino deve essere visibile, il bottone deve dire "Nascondi"
        toggleMyGardenButton.innerHTML = '<i class="fas fa-eye-slash"></i> Nascondi il mio giardino';
    } else {
        // Se il giardino deve essere nascosto, il bottone deve dire "Mostra"
        if (isMyGardenEmpty) {
            toggleMyGardenButton.innerHTML = '<i class="fas fa-eye"></i> Mostra il mio giardino (vuoto)';
        } else {
            toggleMyGardenButton.innerHTML = '<i class="fas fa-eye"></i> Mostra il mio giardino';
        }
    }
    // Non è necessario usare querySelector('i') se imposti l'innerHTML completo ogni volta.
    // Questo previene problemi se l'icona non è un figlio diretto o se il DOM viene ricreato.
}

async function updateGardenVisibility(showMyGarden) {
    // Riferimenti agli elementi (se non sono già globali o non sono passati come parametri)
    const plantsSection = document.getElementById('plants-section');
    const gardenContainer = document.getElementById('garden-container');
    const mioGiardinoSection = document.getElementById('my-garden'); // Assicurati che sia corretto
    const giardinoTitle = document.getElementById('giardinoTitle');
    const toggleMyGardenButton = document.getElementById('toggleMyGarden');
    const emptyGardenMessage = document.getElementById('empty-garden-message');

    const user = firebase.auth().currentUser;
    const isMyGardenEmpty = myGarden.length === 0;

    // Gestione della visibilità del bottone "Mostra/Nascondi"
    if (toggleMyGardenButton) {
        if (user) {
            toggleMyGardenButton.style.display = 'block';
            if (showMyGarden) {
                toggleMyGardenButton.innerHTML = '<i class="fas fa-eye-slash"></i> Mostra tutte le Piante'; // Icona per nascondere
            } else {
                toggleMyGardenButton.innerHTML = '<i class="fas fa-eye"></i> Mostra il mio Giardino'; // Icona per mostrare
            }
        } else {
            toggleMyGardenButton.style.display = 'none'; // Nascondi il bottone se non loggato
        }
    }

    // Logica di visualizzazione delle sezioni principali
    if (user && showMyGarden) {
        // SCENARIO: Utente loggato e si vuole mostrare il "Mio Giardino"
        if (plantsSection) plantsSection.style.display = 'none'; // Nascondi la sezione "Tutte le piante"
        if (gardenContainer) gardenContainer.style.display = 'none'; // Assicurati che anche il suo contenuto sia nascosto

        if (mioGiardinoSection) mioGiardinoSection.style.display = 'grid'; // Mostra il Mio Giardino
        if (giardinoTitle) giardinoTitle.style.display = 'block'; // Mostra il titolo "Il mio giardino"

        if (emptyGardenMessage) {
            if (isMyGardenEmpty) {
                emptyGardenMessage.style.display = 'block'; // Mostra messaggio se il giardino è vuoto
                renderMyGarden([]); // Assicurati che non ci siano card se è vuoto
            } else {
                emptyGardenMessage.style.display = 'none';
                renderMyGarden(myGarden); // Renderizza le piante del mio giardino
            }
        }
    } else {
        // SCENARIO: Utente non loggato OPPURE utente loggato e si vuole mostrare l'elenco principale
        if (plantsSection) plantsSection.style.display = 'block'; // Mostra la sezione "Tutte le piante"
        if (gardenContainer) gardenContainer.style.display = 'grid'; // L'elenco principale è sempre 'grid'

        if (mioGiardinoSection) mioGiardinoSection.style.display = 'none'; // Nascondi il Mio Giardino
        if (giardinoTitle) giardinoTitle.style.display = 'none'; // Nascondi il titolo del giardino
        if (emptyGardenMessage) emptyGardenMessage.style.display = 'none'; // Nascondi il messaggio di giardino vuoto

        // Renderizza sempre le piante pubbliche quando si mostra la galleria principale
        renderPlants(allPlants); 
    }

    // Applica i filtri alla sezione attualmente visibile dopo aver impostato la visibilità
    applyFilters(); 
}
function handleToggleMyGarden() {
    const mioGiardinoSection = document.getElementById('my-garden');
    // Verifica lo stato attuale per sapere se era già visibile o meno
    const isCurrentlyMyGardenVisible = mioGiardinoSection?.style.display !== 'none' && mioGiardinoSection?.style.display !== '';

    // Se era visibile, ora vogliamo nasconderlo (quindi il prossimo stato desiderato è 'false')
    // Se era nascosto, ora vogliamo mostrarlo (quindi il prossimo stato desiderato è 'true')
    updateGardenVisibility(!isCurrentlyMyGardenVisible);
}
async function startLightSensor() {
    if ('AmbientLightSensor' in window) {
        try {
            // Richiedi il permesso
            const permissionStatus = await navigator.permissions.query({ name: 'ambient-light-sensor' });
            if (permissionStatus.state === 'denied') {
                alert('Permesso per il sensore di luce negato. Abilitalo nelle impostazioni del tuo browser/dispositivo.');
                return;
            }

            // Inizializza il sensore
            ambientLightSensor = new AmbientLightSensor();

            ambientLightSensor.onreading = () => {
                const currentLux = ambientLightSensor.illuminance;
                currentLuxValueSpan.textContent = currentLux.toFixed(2); // Mostra due decimali

                // Feedback sulla luce per le piante nel mio giardino
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
                    lightFeedbackDiv.innerHTML = feedbackHtml;
                } else {
                    lightFeedbackDiv.innerHTML = '<p>Nessuna pianta nel tuo giardino con dati Lux ideali, o nessun valore rilevato.</p>';
                }
            };

            ambientLightSensor.onerror = (event) => {
                console.error('Errore sensore di luce:', event.error.name, event.error.message);
                lightFeedbackDiv.innerHTML = `<p style="color: red;">Errore sensore: ${event.error.message}</p>`;
                stopLightSensor(); // Ferma il sensore in caso di errore
            };

            ambientLightSensor.start();
            startLightSensorButton.style.display = 'none';
            stopLightSensorButton.style.display = 'inline-block';
            lightFeedbackDiv.innerHTML = '<p>Misurazione in corso...</p>';

        } catch (error) {
            console.error('Impossibile avviare il sensore di luce:', error);
            lightFeedbackDiv.innerHTML = `<p style="color: red;">Impossibile avviare il sensore di luce. Assicurati che il tuo dispositivo lo supporti e che tu abbia concesso i permessi. ${error.message}</p>`;
        }
    } else {
        alert('Il tuo browser o dispositivo non supporta il sensore di luce ambientale.');
        lightFeedbackDiv.innerHTML = '<p style="color: orange;">Il sensore di luce ambientale non è supportato dal tuo dispositivo.</p>';
    }
}

function stopLightSensor() {
    if (ambientLightSensor) {
        ambientLightSensor.stop();
        ambientLightSensor = null;
        startLightSensorButton.style.display = 'inline-block';
        stopLightSensorButton.style.display = 'none';
        currentLuxValueSpan.textContent = 'N/A';
        lightFeedbackDiv.innerHTML = '';
    }
}


// 11. BLOCCO DOMContentLoaded (tutti i tuoi listener di eventi)
document.addEventListener('DOMContentLoaded', async () => {
    // Riferimenti agli elementi DOM (meglio dichiararli qui se usati solo nei listener)
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const logoutButton = document.getElementById('logoutButton');
    const addNewPlantButton = document.getElementById('addNewPlantButton');
    const newPlantCard = document.getElementById('newPlantCard');
    const saveNewPlant = document.getElementById('saveNewPlant');
    const cancelNewPlant = document.getElementById('cancelNewPlant');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const tempMinFilter = document.getElementById('tempMinFilter');
    const tempMaxFilter = document.getElementById('tempMaxFilter');
    const toggleMyGardenButton = document.getElementById('toggleMyGarden');
    const updatePlantCard = document.getElementById('updatePlantCard');
    const saveUpdatedPlantButton = document.getElementById('saveUpdatedPlant');
    const cancelUpdatePlantButton = document.getElementById('cancelUpdatePlant');
    const mioGiardinoSection = document.getElementById('my-garden');
    const giardinoTitle = document.getElementById('giardinoTitle');


    // Listener per i bottoni di login/registrazione/logout
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    // Listener per i bottoni di aggiunta nuova pianta
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', () => newPlantCard.style.display = 'block');
    if (cancelNewPlant) cancelNewPlant.addEventListener('click', () => { newPlantCard.style.display = 'none'; clearNewPlantForm(); });
    if (saveNewPlant) saveNewPlant.addEventListener('click', saveNewPlantToFirebase);

    // Listener per la ricerca e i filtri
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    if (categoryFilter) categoryFilter.addEventListener('change', handleFilter);
    if (tempMinFilter) tempMinFilter.addEventListener('input', handleTempFilter);
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', handleTempFilter);

    // Listener per il pulsante "Mostra/Nascondi il mio giardino"
    if (toggleMyGardenButton) {
        toggleMyGardenButton.addEventListener('click', handleToggleMyGarden);
    }

    // Listener per i bottoni del form di aggiornamento
    if (saveUpdatedPlantButton) {
    saveUpdatedPlantButton.addEventListener('click', async () => {
        if (currentPlantIdToUpdate) {
            // RECUPERO VALORI PER L'AGGIORNAMENTO
            const updatedData = {
                name: document.getElementById('updatePlantName').value,
                sunlight: document.getElementById('updatePlantSunlight').value,
                watering: document.getElementById('updatePlantWatering').value,
                tempMin: parseInt(document.getElementById('updatePlantTempMin').value),
                tempMax: parseInt(document.getElementById('updatePlantTempMax').value),
                description: document.getElementById('updatePlantDescription').value,
                category: document.getElementById('updatePlantCategory').value,
                image: document.getElementById('updatePlantImageURL').value,
                // AGGIUNGI QUESTI NUOVI CAMPI PER LUX MIN E MAX
                idealLuxMin: parseInt(document.getElementById('updatePlantIdealLuxMin').value), // Assicurati che l'ID sia corretto nel tuo HTML
                idealLuxMax: parseInt(document.getElementById('updatePlantIdealLuxMax').value)  // Assicurati che l'ID sia corretto nel tuo HTML
            };

            // Esegui la validazione per i nuovi campi (se vuoi)
            if (isNaN(updatedData.idealLuxMin) || isNaN(updatedData.idealLuxMax)) {
                alert("I valori Lux Min e Max devono essere numeri validi.");
                return;
            }

            try {
                await db.collection("plants").doc(currentPlantIdToUpdate).update(updatedData);
                alert("Pianta aggiornata con successo!");
                updatePlantCard.style.display = 'none'; // Nascondi il modulo
                currentPlantIdToUpdate = null; // Resetta l'ID
                await loadPlantsFromFirebase(); // Ricarica le piante per aggiornare l'elenco
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

    if (startLightSensorButton) startLightSensorButton.addEventListener('click', startLightSensor);
    if (stopLightSensorButton) stopLightSensorButton.addEventListener('click', stopLightSensor);
  
    // Listener per il contenitore principale delle piante (garden-container) - gestione dinamica dei bottoni
    const gardenContainer = document.getElementById('garden-container');
    gardenContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-to-garden-button')) {
            const plantId = event.target.dataset.plantId;
            await addToMyGarden(plantId);
        } else if (event.target.classList.contains('remove-button')) {
            // Questo gestisce il "Rimuovi dal mio giardino" nell'elenco principale
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
        } else if (event.target.classList.contains('delete-plant-from-db-button')) { // <-- NUOVO BLOCCO
            const plantIdToDelete = event.target.dataset.plantId;
            if (confirm(`Sei sicuro di voler eliminare DEFINITIVAMENTE la pianta con ID: ${plantIdToDelete}? Questa azione è irreversibile e la rimuoverà anche dai giardini di tutti gli utenti.`)) {
                await deletePlantFromDatabase(plantIdToDelete);
            }
        }
    });

    // Listener per il contenitore del tuo giardino (my-garden) - gestione dinamica dei bottoni
    const myGardenContainer = document.getElementById('my-garden');
    myGardenContainer.addEventListener('click', async (event) => {
        // ... (logica esistente per remove-button e update-plant-button nel tuo giardino) ...
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
        // NON aggiungere il bottone di eliminazione definitiva qui,
        // perché le piante nel tuo giardino sono solo un riferimento a quelle globali.
        // La cancellazione definitiva deve avvenire solo dall'elenco principale.
    });

    // 12. LISTENER DI STATO AUTENTICAZIONE FIREBASE
    firebase.auth().onAuthStateChanged(async (user) => {
    // Mantieni tutti i tuoi const esistenti
    const authStatusDiv = document.getElementById('auth-status');
    const appContentDiv = document.getElementById('app-content');
    const authContainerDiv = document.getElementById('auth-container');
    const gardenContainer = document.getElementById('garden-container');
    const toggleMyGardenButton = document.getElementById('toggleMyGarden');
    const mioGiardinoSection = document.getElementById('my-garden');
    const emptyGardenMessage = document.getElementById('empty-garden-message');
    // Rimuovi questo se plants-section non è un div esistente nel tuo HTML che contiene gardenContainer
    // o se non è usato per controllare la visibilità principale.
    // Se plants-section è semplicemente il contenitore principale, assicurati che sia display:block per default nel CSS.
    // Oppure, se plants-section è un contenitore che include sia i filtri che gardenContainer,
    // allora deve essere gestito correttamente.
    const plantsSection = document.getElementById('plants-section'); // Lascialo solo se esiste e ha un ruolo specifico


    if (user) {
        console.log("Stato autenticazione cambiato, utente loggato:", user.uid, user.email);
        authStatusDiv.innerText = `Utente autenticato: ${user.email}`;
        appContentDiv.style.display = 'block'; // Mostra il contenitore principale dell'app
        authContainerDiv.style.display = 'none'; // Nascondi i form di login/registrazione

        // Ottieni e attacca il listener al bottone di logout
        // (Assicurati che 'logoutButton' sia dichiarato all'inizio del file e il listener sia definito lì,
        // o definiscilo qui se non è globale)
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            // Rimuovi eventuali listener precedenti per evitare duplicazioni (buona pratica)
            logoutButton.removeEventListener('click', handleLogout);
            logoutButton.addEventListener('click', handleLogout);
        }

        // 1. Carica tutte le piante pubbliche (che riempiranno 'allPlants' e 'gardenContainer' di default)
        await loadPlantsFromFirebase();

        // 2. Carica le piante dell'utente (che riempiranno 'myGarden')
        await loadMyGarden(user.uid); // Assicurati che questa funzione sia loadMyGarden e che usi user.uid

        // 3. Determina quale sezione mostrare inizialmente (l'elenco principale o il giardino dell'utente)
        // Se il giardino dell'utente ha piante, mostriamo il giardino, altrimenti la galleria principale.
        let showMyGardenInitially = myGarden.length > 0;

        // 4. Utilizza la funzione updateGardenVisibility per gestire tutta la logica di visualizzazione
        // Questa funzione dovrebbe impostare correttamente display: 'block'/'none' per:
        // gardenContainer, mioGiardinoSection, giardinoTitle, emptyGardenMessage, toggleMyGardenButton
        await updateGardenVisibility(showMyGardenInitially);

        // Applica i filtri all'avvio per la sezione corretta (galleria o giardino)
        // Questo è il passo che abbiamo discusso prima per i filtri sul mio giardino.
        applyFilters();

    } else {
        // Nessun utente loggato
        console.log("Stato autenticazione cambiato, nessun utente loggato.");
        authStatusDiv.innerText = "Nessun utente autenticato.";
        appContentDiv.style.display = 'none'; // Nascondi l'app principale
        authContainerDiv.style.display = 'block'; // Mostra il form di login/registrazione

        myGarden = []; // Pulisci il giardino locale se l'utente si disconnette
        await renderMyGarden(myGarden); // Renderizza un giardino vuoto (o pulisci il container)

        await loadPlantsFromFirebase(); // Carica le piante pubbliche per la vista non loggata

        // Imposta la visibilità per l'utente non loggato: solo la galleria principale
        if (gardenContainer) gardenContainer.style.display = 'grid'; // Assicurati che sia visibile
        if (mioGiardinoSection) mioGiardinoSection.style.display = 'none'; // Nascondi il giardino
        if (giardinoTitle) giardinoTitle.style.display = 'none'; // Nascondi il titolo del giardino
        if (emptyGardenMessage) emptyGardenMessage.style.display = 'none'; // Nascondi il messaggio di giardino vuoto
        if (plantsSection) plantsSection.style.display = 'block'; // Assicurati che il contenitore dei filtri/ricerca sia visibile

        // Nascondi il bottone "Mio Giardino" se non loggati
        if (toggleMyGardenButton) {
            toggleMyGardenButton.style.display = 'none';
        }
        applyFilters(); // Applica i filtri alla galleria principale (che sarà l'unica visibile)
    }
});
