let plants = [];
let allPlants = [];
let myGarden = []; // Inizializza come array vuoto

// Riferimenti agli elementi HTML

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
const plantsContainerDiv = document.getElementById('garden-container');

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

async function renderPlants(plantArray) {
    console.log("renderPlants: Chiamata con array:", plantArray);
    console.trace("renderPlants chiamata con:", plantArray);
    console.log('Array plant ricevuto da renderPlants:', plantArray);
    console.log("renderPlants chiamata con:", plantArray);
    console.log("renderPlants INIZIO: plantArray =", plantArray);
    debugger; // Lascio il debugger qui se vuoi usarlo

    const gardenContainer = document.getElementById('garden-container');
    gardenContainer.innerHTML = "";
    console.log("renderPlants DOPO innerHTML: plantArray =", plantArray);

    const user = firebase.auth().currentUser;
    let myGardenFB = [];

    if (user) {
        const gardenDoc = await db.collection('gardens').doc(user.uid).get();
        myGardenFB = gardenDoc.data()?.plants || [];
        console.log("renderPlants DOPO Firebase fetch: myGardenFB =", myGardenFB);
    }

    plantArray.forEach((plant) => {
        console.log("renderPlants FOREACH: plant =", plant);
        const image = plant.image || 'plant_9215709.png';
        const div = document.createElement("div");
        div.className = "plant-card";
        div.innerHTML = `
            <img src="${image}" alt="${plant.name}" class="plant-icon">
            <h4>${plant.name}</h4>
            <p><i class="fas fa-sun"></i> Luce: ${plant.sunlight}</p>
            <p><i class="fas fa-tint"></i> Acqua: ${plant.watering}</p>
            <p><i class="fas fa-thermometer-half"></i> Temp ideale min: ${plant.tempMin}°C</p>
            <p><i class="fas fa-thermometer-half"></i> Temp ideale max: ${plant.tempMax}°C</p>
            <p>Categoria: ${plant.category}</p>
            ${user ?
                myGardenFB.includes(plant.id) ?
                    '<button class="remove-button" data-plant-id="' + plant.id + '">Rimuovi dal mio giardino</button>' :
                    '<button class="add-to-garden-button" data-plant-id="' + plant.id + '">Aggiungi al mio giardino</button>' :
                '' // Se l'utente non è loggato, non mostrare alcun pulsante
            }
        `;
        gardenContainer.appendChild(div);
    });

    console.log("renderPlants FINE: plantArray =", plantArray);
    gardenContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-to-garden-button')) {
            const plantId = event.target.dataset.plantId;
            console.log("Tentativo di aggiungere la pianta con ID:", plantId);
            await addToMyGarden(plantId);
        } else if (event.target.classList.contains('remove-button')) {
            const plantIdToRemove = event.target.dataset.plantId;
            await removeFromMyGarden(plantIdToRemove);
        }
    });

    updateGardenVisibility();
}

function handleFilter(event) {
    const selectedCategory = event.target.value;
    console.log("Valore selezionato nel filtro:", selectedCategory); // AGGIUNGI QUESTO
    console.log("Contenuto di allPlants:", allPlants);
    let filteredPlants;
  
    console.log("Valore selezionato nel filtro:", selectedCategory);
    console.log("Contenuto di allPlants:", allPlants); // AGGIUNGI QUESTA LINEA
  
    if (selectedCategory === 'all') {
        filteredPlants = allPlants; // Usa allPlants per mostrare tutte le piante
    } else {
        filteredPlants = allPlants.filter(plant => plant.category === selectedCategory);
    }
    renderPlants(filteredPlants);
    console.trace('handleFilter chiamata da:'); // Traccia la chiamata
}

function handleTempFilter() {
    const minTemp = parseInt(document.getElementById('tempMinFilter').value) || -Infinity;
    const maxTemp = parseInt(document.getElementById('tempMaxFilter').value) || Infinity;

    const filteredPlants = allPlants.filter(plant =>
        plant.tempMin >= minTemp && plant.tempMax <= maxTemp
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

async function addToMyGarden(plantId) {
    console.log("addToMyGarden: Inizio aggiunta pianta con ID:", plantId);
    const user = firebase.auth().currentUser;
    if (user) {
        myGarden.push(plantId);
        console.log("addToMyGarden: 'myGarden' dopo l'aggiunta:", myGarden);

        console.log("addToMyGarden: Chiamata a saveMyGardenToFirebase con:", myGarden);
        await saveMyGardenToFirebase(myGarden);

        console.log("addToMyGarden: Chiamata a renderMyGarden con:", myGarden);
        await renderMyGarden(myGarden);

        console.log("addToMyGarden: Chiamata a renderPlants con:", allPlants);
        renderPlants(allPlants); // Rerenderizza l'elenco principale per aggiornare i bottoni

        isMyGardenEmpty = myGarden.length === 0;
        console.log("addToMyGarden: isMyGardenEmpty =", isMyGardenEmpty);
        updateGardenToggleButtonState(isMyGardenEmpty);
        console.log("addToMyGarden: Fine aggiunta pianta con ID:", plantId);
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
            // Rimuovi la pianta dall'array locale
            myGarden = myGarden.filter(plantId => plantId !== plantIdToRemove);

            // Aggiorna Firebase
            await saveMyGardenToFirebase(myGarden);

            // Aggiorna la visualizzazione
            await renderMyGarden(myGarden);
            // renderPlants(allPlants); // Rerenderizza l'elenco principale per aggiornare i bottoni - COMMENTA O RIMUOVI QUESTA RIGA

            isMyGardenEmpty = myGarden.length === 0;
            updateGardenToggleButtonState(isMyGardenEmpty);

            console.log("removeFromMyGarden: myGarden dopo la rimozione =", JSON.stringify(myGarden));
        } else {
            console.log("Utente non autenticato. Operazione non permessa.");
            alert("Devi essere autenticato per rimuovere piante dal tuo giardino."); // Oppure usa un altro modo per informare l'utente
        }
    } catch (error) {
        console.error("Errore durante la rimozione della pianta dal 'Mio Giardino':", error);
    }
}

async function saveNewPlantToFirebase() {
    const newPlantName = document.getElementById('newPlantName').value;
    const newPlantSunlight = document.getElementById('newPlantSunlight').value;
    const newPlantWatering = document.getElementById('newPlantWatering').value;
    const newPlantTempMin = document.getElementById('newPlantTempMin').value;
    const newPlantTempMax = document.getElementById('newPlantTempMax').value;
    const newPlantDescription = document.getElementById('newPlantDescription').value;
    const newPlantCategory = document.getElementById('newPlantCategory').value;
    const newPlantImageURL = document.getElementById('newPlantImageURL').value;

    if (newPlantName && newPlantSunlight && newPlantWatering && newPlantTempMin && newPlantTempMax) {
        try {
            const docRef = await firebase.firestore().collection('plants').add({
                name: newPlantName,
                sunlight: newPlantSunlight,
                watering: newPlantWatering,
                tempMin: parseInt(newPlantTempMin),
                tempMax: parseInt(newPlantTempMax),
                description: newPlantDescription,
                category: newPlantCategory,
                image: newPlantImageURL
            });
            console.log("Nuova pianta aggiunta con ID: ", docRef.id);
            const newPlantCardInner = document.getElementById('newPlantCard');
            if (newPlantCardInner) {
                newPlantCardInner.style.display = 'none';
            }
            await loadPlantsFromFirebase(); // Ricarica l'elenco delle piante
            await loadMyGardenFromFirebase(); // Ricarica il "Mio Giardino" per eventuali aggiornamenti
            clearNewPlantForm(); // Se hai una funzione per pulire il form
        } catch (error) {
            console.error("Errore nell'aggiunta della nuova pianta:", error);
        }
    } else {
        alert("Per favore, compila tutti i campi obbligatori.");
    }
}

async function renderMyGarden(garden) {
    console.log("renderMyGarden: Chiamata con giardino:", garden);
    console.log("RENDERMYGARDEN CALLED WITH GARDEN:", garden);
    console.log("LENGTH OF GARDEN:", garden ? garden.length : 0);

    let safeGarden = [];
    if (Array.isArray(garden)) {
        safeGarden = garden;
    } else {
        console.warn("Valore non valido ricevuto per 'garden'. Inizializzato come array vuoto.");
        safeGarden = [];
        await saveMyGardenToFirebase([]);
    }

    const myGardenContainer = document.getElementById('my-garden');
    const emptyGardenMessage = document.getElementById('empty-garden-message');
    myGardenContainer.innerHTML = ''; // SVUOTA SEMPRE ALL'INIZIO

    if (safeGarden.length === 0) {
        myGardenContainer.style.display = 'flex';
        myGardenContainer.style.justifyContent = 'center';
        myGardenContainer.style.alignItems = 'center';
       if (emptyGardenMessage) {
            emptyGardenMessage.style.display = 'block';
        } else {
            myGardenContainer.innerHTML = '<p id="empty-garden-message">Il tuo giardino è vuoto. Aggiungi delle piante!</p>';
        }
      } else {
        myGardenContainer.style.display = 'grid';
        myGardenContainer.style.justifyContent = '';
        myGardenContainer.style.alignItems = '';
        if (emptyGardenMessage) {
            emptyGardenMessage.style.display = 'none';
        }
        for (const plantId of safeGarden) {
            console.log("Tentativo di recuperare la pianta con ID:", plantId);
            try {
                await new Promise(resolve => setTimeout(resolve, 100));
                const plantsCollection = firebase.firestore().collection('plants');
                const docRef = plantsCollection.doc(plantId);
                const doc = await docRef.get();
                if (doc.exists) {
                    const plantData = { id: doc.id, ...doc.data() };
                    const plantCard = createPlantCard(plantData);
                    myGardenContainer.appendChild(plantCard);
                    const removeButton = plantCard.querySelector('.remove-button');
                    if (removeButton) {
                        removeButton.addEventListener('click', () => {
                            const plantIdToRemove = removeButton.dataset.plantId;
                            removeFromMyGarden(plantIdToRemove);
                        });
                    }
                } else {
                    console.warn(`Pianta con ID ${plantId} non trovata nel database.`);
                }
            } catch (error) {
                console.error("Errore nel recupero della pianta:", error);
            }
        }
    }
    await saveMyGardenToFirebase(safeGarden);
    updateGardenVisibility();
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
}

function createPlantCard(plantData) {
    console.log("createPlantCard CALLED. Plant:", plantData.name, plantData.id);
    const div = document.createElement("div");
    div.className = "my-plant-card";
    div.innerHTML = `
        <h4>${plantData.name}</h4>
        <p>Luce: ${plantData.sunlight}</p>
        <p>Acqua: ${plantData.watering}</p>
        <p>Temperatura ideale min: ${plantData.tempMin}°C</p>
        <p>Temperatura ideale max: ${plantData.tempMax}°C</p>
        <p>Categoria: ${plantData.category}</p>
        <button class="remove-button" data-plant-id="${plantData.id}">Rimuovi dal mio giardino</button>
        <button onclick="updatePlant('${plantData.name}')">Aggiorna info</button>
    `;

    // L'event listener per il bottone "Rimuovi" è ora gestito in renderPlants
    return div;
}

   async function loadMyGardenFromFirebase() {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            const doc = await db.collection('gardens').doc(user.uid).get();
            const firebaseGarden = doc.data()?.plants || [];
            console.log("Giardino caricato da Firebase:", firebaseGarden);
            // **AGGIUNGIAMO QUESTO PER AGGIORNARE LA VARIABILE myGarden**
            myGarden = firebaseGarden;
            await renderMyGarden(myGarden); // Renderizza il giardino con i dati di Firebase
        } catch (error) {
            console.error("Errore nel caricamento del giardino da Firebase:", error);
            myGarden = []; // In caso di errore, inizializza myGarden come array vuoto
            await renderMyGarden(myGarden);
          } finally { // AGGIUNGIAMO IL FINALLY PER CHIAMARE SEMPRE updateGardenToggleButtonState
            isMyGardenEmpty = myGarden.length === 0;
            updateGardenToggleButtonState(isMyGardenEmpty);
        }
      } else {
        myGarden = []; // Se non loggato, inizializza myGarden come array vuoto
        await renderMyGarden(myGarden); // Se non loggato, renderizza un giardino vuoto
    }
    // **ASSICURATI CHE ANCHE QUI myGarden VENGA AGGIORNATO DOPO IL RENDER**
    isMyGardenEmpty = myGarden.length === 0;
    updateGardenToggleButtonState(isMyGardenEmpty);
    updateGardenVisibility();
}

async function saveMyGardenToFirebase(garden) {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            // Ottieni un riferimento al documento "giardino" dell'utente
            const gardenRef = firebase.firestore().collection('gardens').doc(user.uid);
            // Aggiorna il documento con l'array di piante
            await gardenRef.update({ plants: garden });
            console.log("Il 'Mio Giardino' è stato aggiornato su Firebase.");
        } catch (error) {
            console.error("Errore durante l'aggiornamento del 'Mio Giardino' su Firebase:", error);
        }
    }
}
   
    async function loadAllPlants() {
        try {
            const querySnapshot = await firebase.firestore().collection('plants').get();
            const plants = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                plants.push({
                    id: doc.id,
                    name: data.name,
                    sunlight: data.sunlight,
                    watering: data.watering,
                    tempMin: data.tempMin,
                    tempMax: data.tempMax,
                    category: data.category,
                    image: data.image || 'plant_9215709.png'
                });
            });
            console.log('Piante caricate da Firebase:', plants);
            return plants;
        } catch (error) {
            console.error("Errore nel caricamento delle piante da Firebase:", error);
            return [];
        }
    }

    async function loadPlantsFromFirebase() {
    try {
        const plantsSnapshot = await db.collection('plants').get();
        allPlants = plantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Piante caricate da Firebase:", allPlants);
        renderPlants(allPlants);
    } catch (error) {
        console.error("Errore nel caricamento delle piante da Firebase:", error);
    }
}

function updateGardenToggleButtonState(isMyGardenEmpty) {
    const toggleMyGardenButton = document.getElementById('toggleMyGarden');
    if (toggleMyGardenButton) {
        const eyeIcon = toggleMyGardenButton.querySelector('i');
        if (isMyGardenEmpty) {
            toggleMyGardenButton.innerHTML = '<i class="fa-solid fa-eye"></i> Mostra il mio giardino';
        } else {
            toggleMyGardenButton.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Nascondi il mio giardino';
        }
    } else {
        console.error("Elemento toggleMyGarden non trovato!");
    }
}
 async function updateGardenVisibility() {
      const plantsSection = document.getElementById('plants-section');
      const mioGiardinoSection = document.getElementById('my-garden');
      const giardinoTitle = document.getElementById('giardinoTitle');
      const toggleMyGardenButton = document.getElementById('toggleMyGarden');

      // Usa nullish coalescing e optional chaining per sicurezza
      const currentGarden = myGarden ?? []; // Se myGarden è undefined, usa []
      const isUserLoggedIn = firebase.auth().currentUser !== null;
      const isMyGardenEmpty = currentGarden.length === 0;

      if (toggleMyGardenButton) {
          updateGardenToggleButtonState(isMyGardenEmpty);
      } else {
          console.error("Elemento toggleMyGarden non trovato!");
      }

      if (isUserLoggedIn && !isMyGardenEmpty) {
          // Utente loggato e il "Mio Giardino" non è vuoto: mostra il "Mio Giardino"
          if (plantsSection) plantsSection.style.display = 'none';
          if (mioGiardinoSection?.style.display !== 'none') { // Usa optional chaining
              if (giardinoTitle) giardinoTitle.style.display = 'block';
          } else if (giardinoTitle) {
              giardinoTitle.style.display = 'none';
          }
      } else {
          // Utente non loggato OPPURE utente loggato ma il "Mio Giardino" è vuoto: mostra le piante disponibili
          if (plantsSection) plantsSection.style.display = 'block';
          if (mioGiardinoSection) mioGiardinoSection.style.display = 'none';
          if (giardinoTitle) giardinoTitle.style.display = 'none';
      }
  }

document.addEventListener('DOMContentLoaded', async () => {
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
    const giardinoTitle = document.getElementById('giardinoTitle'); // Assicurati che sia definito anche fuori
    const mioGiardinoSection = document.getElementById('my-garden'); // Definito fuori

    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (addNewPlantButton) addNewPlantButton.addEventListener('click', () => newPlantCard.style.display = 'block');
    if (cancelNewPlant) cancelNewPlant.addEventListener('click', () => { newPlantCard.style.display = 'none'; clearNewPlantForm(); });
    if (saveNewPlant) saveNewPlant.addEventListener('click', saveNewPlantToFirebase);
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    if (categoryFilter) categoryFilter.addEventListener('change', handleFilter);
    if (tempMinFilter) tempMinFilter.addEventListener('input', handleTempFilter);
    if (tempMaxFilter) tempMaxFilter.addEventListener('input', handleTempFilter);
   if (toggleMyGardenButton) {
        toggleMyGardenButton.addEventListener('click', () => {
            console.log("Tasto Mio Giardino cliccato!");
            const mioGiardinoSection = document.getElementById('my-garden');
            const giardinoTitle = document.getElementById('giardinoTitle');
            const eyeIcon = toggleMyGardenButton.querySelector('i');

            const isCurrentlyVisible = mioGiardinoSection.style.display !== 'none';
            mioGiardinoSection.style.display = isCurrentlyVisible ? 'none' : 'block';

            if (giardinoTitle) {
                giardinoTitle.style.display = isCurrentlyVisible ? 'none' : 'block';
            }

            if (eyeIcon) {
                eyeIcon.classList.toggle('fa-eye', !isCurrentlyVisible); // Corretto l'inversione
                eyeIcon.classList.toggle('fa-eye-slash', isCurrentlyVisible); // Corretto l'inversione
            }

            toggleMyGardenButton.innerText = isCurrentlyVisible ? 'Mostra il mio giardino' : 'Nascondi il mio giardino';
            isMyGardenEmpty = mioGiardinoSection.style.display === 'none';
            // updateGardenToggleButtonState(isMyGardenEmpty);  <--- RIMUOVI QUESTA RIGA
        });
    }
  
   // const loginButton_inner = document.getElementById('loginButton'); // Evita conflitti con la variabile esterna
    //if (loginButton_inner) {
      //  console.log("loginButton trovato nel DOM.");
        //loginButton_inner.addEventListener('click', async () => {
          //  const email = document.getElementById('login-email').value;
            //const password = document.getElementById('login-password').value;
            //const errorDiv = document.getElementById('login-error');
            //errorDiv.innerText = '';
            //console.log("Tentativo di login con email:", email, "e password:", password);
            //try {
              //  await firebase.auth().signInWithEmailAndPassword(email, password);
            //} catch (error) {
              //  errorDiv.innerText = error.message;
                //console.error("Errore durante il login:", error);
            //}
        //});
        //console.log("Event listener aggiunto al loginButton.");
    //} else {
      //  console.error("Elemento loginButton non trovato nel DOM!");
    //}

    //await loadPlantsFromFirebase();
    //updateGardenVisibility();

    //const addNewPlantButton_outer = document.getElementById('addNewPlantButton'); // Evita conflitti
    //if (addNewPlantButton_outer) {
      //  addNewPlantButton_outer.addEventListener('click', () => {
        //    const newPlantCard_inner = document.getElementById('newPlantCard'); // Evita conflitti
          //  if (newPlantCard_inner) {
            //    newPlantCard_inner.style.display = 'block';
           // }
        //});
    //}

    //const cancelNewPlantButton_outer = document.getElementById('cancelNewPlant'); // Evita conflitti
    //if (cancelNewPlantButton_outer) {
      //  cancelNewPlantButton_outer.addEventListener('click', () => {
        //    const newPlantCard_inner = document.getElementById('newPlantCard'); // Evita conflitti
          //  if (newPlantCard_inner) {
            //    newPlantCard_inner.style.display = 'none';
            //}
        //});
    //}

  //const saveNewPlantButton_outer = document.getElementById('saveNewPlant'); // Evita conflitti
  //  if (saveNewPlantButton_outer) {
    //   saveNewPlantButton_outer.addEventListener('click', async () => {
    //      const newPlantName = document.getElementById('newPlantName').value;
   //       const newPlantSunlight = document.getElementById('newPlantSunlight').value;
 //         const newPlantWatering = document.getElementById('newPlantWatering').value;
//          const newPlantTempMin = document.getElementById('newPlantTempMin').value;
         // const newPlantTempMax = document.getElementById('newPlantTempMax').value;
       //   const newPlantDescription = document.getElementById('newPlantDescription').value;
       //   const newPlantCategory = document.getElementById('newPlantCategory').value;
       //   const newPlantImageURL = document.getElementById('newPlantImageURL').value;

            //if (newPlantName && newPlantSunlight && newPlantWatering && newPlantTempMin && newPlantTempMax) {
                //try {
                    //const docRef = await firebase.firestore().collection('plants').add({
                        //name: newPlantName,
                        //sunlight: newPlantSunlight,
                        //watering: newPlantWatering,
                        //tempMin: parseInt(newPlantTempMin),
                        //tempMax: parseInt(newPlantTempMax),
                        //description: newPlantDescription,
                        //category: newPlantCategory,
                      //  image: newPlantImageURL
                    //});
                    //console.log("Nuova pianta aggiunta con ID: ", docRef.id);
                    //const newPlantCard_inner = document.getElementById('newPlantCard'); // Evita conflitti
                    //if (newPlantCard_inner) {
                      //  newPlantCard_inner.style.display = 'none';
                    //}
                   // await loadPlantsFromFirebase();
                 //   await loadMyGardenFromFirebase();
               // } catch (error) {
              //      console.error("Errore nell'aggiunta della nuova pianta:", error);
            //    }
          //  } else {
        //        alert("Per favore, compila tutti i campi obbligatori.");
      //      }
    //    });
  //  }
//
    const toggleMyGardenButton_outer = document.getElementById('toggleMyGarden'); // Evita conflitti
    if (toggleMyGardenButton_outer) {
        toggleMyGardenButton_outer.addEventListener('click', () => {
            console.log("Tasto Mio Giardino cliccato!");
            const mioGiardinoSection_inner = document.getElementById('my-garden'); // Evita conflitti
            const giardinoTitle_inner = document.getElementById('giardinoTitle'); // Evita conflitti
            const eyeIcon = toggleMyGardenButton_outer.querySelector('i');
          
            console.log("Stato display prima del cambio:", mioGiardinoSection.style.display);
          
            if (mioGiardinoSection_inner.style.display === 'none') {
                mioGiardinoSection_inner.style.display = 'block';
                if (giardinoTitle_inner) giardinoTitle_inner.style.display = 'block';
                if (eyeIcon) {
                    eyeIcon.classList.remove('fa-eye');
                    eyeIcon.classList.add('fa-eye-slash');
                }
                toggleMyGardenButton_outer.innerText = 'Nascondi il mio giardino';
            } else {
                mioGiardinoSection_inner.style.display = 'none';
                if (giardinoTitle_inner) giardinoTitle_inner.style.display = 'none';
                if (eyeIcon) {
                    eyeIcon.classList.remove('fa-eye-slash');
                    eyeIcon.classList.add('fa-eye');
                }
                toggleMyGardenButton_outer.innerText = 'Mostra il mio giardino';
            }
            console.log("Stato display dopo il cambio:", mioGiardinoSection.style.display);
            isMyGardenEmpty = mioGiardinoSection_inner.style.display === 'none';
            updateGardenToggleButtonState(isMyGardenEmpty);
        });  
    }
 // **UNICA CHIUSURA DEL DOMContentLoaded - ORA ALLA FINE DEL BLOCCO!**
 
firebase.auth().onAuthStateChanged(async (user) => {
    const authStatusDiv = document.getElementById('auth-status');
    const appContentDiv = document.getElementById('app-content');
    const authContainerDiv = document.getElementById('auth-container');
    const gardenContainer = document.getElementById('garden-container');
    const toggleMyGardenButton = document.getElementById('toggleMyGarden'); // <--- CORRETTO L'ID
    const emptyGardenMessage = document.getElementById('empty-garden-message');

    if (user) {
        console.log("Stato autenticazione cambiato, utente loggato:", user.uid, user.email);
        authStatusDiv.innerText = `Utente autenticato: ${user.email}`;
        appContentDiv.style.display = 'block';
        authContainerDiv.style.display = 'none';
        await loadMyGardenFromFirebase(); // Carica il giardino da Firebase
        await loadPlantsFromFirebase(); // Ricarica le piante dopo il login

        if (myGarden && myGarden.length > 0) {
            await renderMyGarden(myGarden);
            gardenContainer.style.display = 'none'; // Nascondi l'elenco principale
            if (toggleMyGardenButton) {
                toggleMyGardenButton.textContent = 'Nascondi mio giardino';
                toggleMyGardenButton.style.display = 'block';
            }
            if (emptyGardenMessage) {
                emptyGardenMessage.style.display = 'none';
            }
        } else {
            if (emptyGardenMessage) {
                emptyGardenMessage.style.display = 'block';
            }
            gardenContainer.style.display = 'grid'; // Mostra l'elenco principale
            if (toggleMyGardenButton) {
                toggleMyGardenButton.style.display = 'none';
            }
            renderPlants(allPlants); // Assicurati che l'elenco principale sia renderizzato
        }
        updateGardenVisibility(); // Aggiorna la visibilità dopo il login
    } else {
        console.log("Stato autenticazione cambiato, nessun utente loggato.");
        authStatusDiv.innerText = "Nessun utente autenticato.";
        appContentDiv.style.display = 'none';
        authContainerDiv.style.display = 'block';
        myGarden = []; // Assicurati che myGarden sia vuoto
        await renderMyGarden(myGarden); // Renderizza un giardino vuoto
        await loadPlantsFromFirebase();
        gardenContainer.style.display = 'grid'; // Mostra l'elenco principale per gli utenti non loggati
        if (toggleMyGardenButton) {
            toggleMyGardenButton.style.display = 'none';
        }
        renderPlants(allPlants); // Renderizza l'elenco principale per gli utenti non loggati
        updateGardenVisibility();
    }
});
});
