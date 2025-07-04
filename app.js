// Non importare React e ReactDOM da 'react' e 'react-dom' se usi CDN come fatto in index.html
// Li userai come variabili globali React e ReactDOM.

const App = () => {
    // Stato per l'applicazione
    const [db, setDb] = React.useState(null);
    const [auth, setAuth] = React.useState(null);
    const [storage, setStorage] = React.useState(null); // Stato per Firebase Storage
    const [userId, setUserId] = React.useState(null);
    const [userEmail, setUserEmail] = React.useState(null); // Nuovo stato per l'email dell'utente
    const [plants, setPlants] = React.useState([]); // Tutte le piante (collezione pubblica)
    const [myGardenPlants, setMyGardenPlants] = React.useState([]); // Le piante nel mio giardino
    const [currentView, setCurrentView] = React.useState('allPlants'); // 'allPlants' o 'myGarden'
    const [showPlantModal, setShowPlantModal] = React.useState(false);
    const [selectedPlant, setSelectedPlant] = React.useState(null);
    const [showAddEditModal, setShowAddEditModal] = React.useState(false);
    const [editPlantData, setEditPlantData] = React.useState(null); // Per l'editing di una pianta esistente
    const [loading, setLoading] = React.useState(true);
    const [message, setMessage] = React.useState(''); // Per messaggi utente
    const [luxValue, setLuxValue] = React.useState(0); // Valore lux ATTUALE (da sensore o manuale)
    const [manualLuxInput, setManualLuxInput] = React.useState(''); // Nuovo stato per l'input manuale
    const [userLocation, setUserLocation] = React.useState(null); // { lat, lon } per il meteo
    const [weatherData, setWeatherData] = React.useState(null); // Dati meteo
    const [weatherApiKey, setWeatherApiKey] = React.useState('0575afa377367478348aa48bfc9936ba'); // <-- INSERISCI QUI LA TUA API KEY DI OPENWEATHERMAP
    const [showScrollToTop, setShowScrollToTop] = React.useState(false); // Stato per il tasto "scroll to top"
    const [showLuxFeedback, setShowLuxFeedback] = React.useState(false); // Nuovo stato per mostrare/nascondere il feedback lux
    const [showAuthModal, setShowAuthModal] = React.useState(false); // Nuovo stato per mostrare/nascondere il modale di autenticazione

    // Stati per la nuova funzionalità AI
    const [showAiModal, setShowAiModal] = React.useState(false);
    const [aiQuery, setAiQuery] = React.useState('');
    const [aiResponse, setAiResponse] = React.useState('');
    const [aiLoading, setAiLoading] = React.useState(false);

    // Stati per l'ordinamento
    const [sortOrderAllPlants, setSortOrderAllPlants] = React.useState('asc'); // 'asc' per A-Z, 'desc' per Z-A
    const [sortOrderMyGarden, setSortOrderMyGarden] = React.useState('asc');

    // Riferimenti per lo scroll
    const allPlantsRef = React.useRef(null);
    const myGardenRef = React.useRef(null);

    // Configurazione Firebase fornita dall'utente
    const firebaseConfig = {
        apiKey: "AIzaSyAo8HU5vNNm_H-HvxeDa7xSsg3IEmdlE_4",
        authDomain: "giardinodigitale.firebaseapp.com",
        projectId: "giardinodigitale",
        storageBucket: "giardinodigitale.firebasestorage.app",
        messagingSenderId: "96265504027",
        appId: "1:96265504027:web:903c3df92cfa24beb17fbe"
    };

    // Inizializzazione Firebase e Autenticazione
    React.useEffect(() => {
        try {
            // Accedi a Firebase tramite l'oggetto globale 'firebase'
            const app = firebase.initializeApp(firebaseConfig);
            const firestore = firebase.firestore(app); // Usa firebase.firestore()
            const firebaseAuth = firebase.auth(app); // Usa firebase.auth()
            const firebaseStorage = firebase.storage(app); // Usa firebase.storage()

            setDb(firestore);
            setAuth(firebaseAuth);
            setStorage(firebaseStorage); // Imposta lo stato per storage

            // Listener per lo stato di autenticazione
            const unsubscribeAuth = firebaseAuth.onAuthStateChanged(async (user) => { // Usa firebaseAuth.onAuthStateChanged
                if (user) {
                    setUserId(user.uid);
                    // Usa user.email se disponibile, altrimenti un fallback
                    setUserEmail(user.email || 'Utente Autenticato'); 
                    console.log("ID Utente corrente:", user.uid, "Email:", user.email); // Console log dell'ID e email utente
                    setLoading(false);
                } else {
                    setUserId(null); // Se non autentato, userId è null
                    setUserEmail(null); // Se non autentato, email è null
                    console.log("Utente non autentato. Si prega di effettuare il login.");
                    setLoading(false);
                }
            });

            return () => unsubscribeAuth(); // Pulizia del listener
        } catch (error) {
            console.error("Errore nell'inizializzazione di Firebase:", error);
            setMessage("Errore grave nell'inizializzazione dell'app.");
            setLoading(false);
        }
    }, []);

    // Gestione messaggi Toast
    React.useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 3000); // Messaggio sparisce dopo 3 secondi
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Funzione di ordinamento riutilizzabile
    const sortPlants = React.useCallback((plantArray, order) => {
        const sorted = [...plantArray].sort((a, b) => {
            const nameA = a.name ? a.name.toLowerCase() : '';
            const nameB = b.name ? b.name.toLowerCase() : '';
            if (order === 'asc') {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(nameA);
            }
        });
        return sorted;
    }, []);

    // Fetch e listener per le piante della collezione pubblica ('plants')
    React.useEffect(() => {
        if (!db) return;

        const plantsCollectionRef = db.collection('plants');
        const unsubscribe = plantsCollectionRef.onSnapshot((snapshot) => {
            const plantsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Applica l'ordinamento subito dopo aver ricevuto i dati
            setPlants(sortPlants(plantsData, sortOrderAllPlants));
        }, (error) => {
            console.error("Errore nel recupero delle piante pubbliche:", error);
            setMessage("Errore nel caricamento delle piante di tutti.");
        });

        return () => unsubscribe();
    }, [db, sortPlants, sortOrderAllPlants]); // Aggiunto sortOrderAllPlants come dipendenza

    // Fetch e listener per le piante del mio giardino ('users/{userId}/gardens')
    React.useEffect(() => {
        if (!db || !userId) return;

        const myGardenCollectionRef = db.collection(`users/${userId}/gardens`); // Usa db.collection()
        const unsubscribe = myGardenCollectionRef.onSnapshot((snapshot) => {
            const myGardenData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isMyGardenPlant: true
            }));
            // Applica l'ordinamento subito dopo aver ricevuto i dati
            setMyGardenPlants(sortPlants(myGardenData, sortOrderMyGarden));
        }, (error) => {
            console.error("Errore nel recupero delle piante del mio giardino:", error);
            setMessage("Errore nel caricamento delle piante del tuo giardino.");
        });

        return () => unsubscribe();
    }, [db, userId, sortPlants, sortOrderMyGarden]); // Aggiunto sortOrderMyGarden come dipendenza

    // Ottenere la geolocalizzazione
    React.useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Errore nel recupero della geolocalizzazione:", error);
                    setMessage("Impossibile ottenere la posizione per le previsioni meteo.");
                }
            );
        } else {
            setMessage("La geolocalizzazione non è supportata dal tuo browser.");
        }
    }, []);

    // Fetch dei dati meteo
    React.useEffect(() => {
        if (userLocation && weatherApiKey && weatherApiKey !== 'YOUR_OPENWEATHERMAP_API_KEY') {
            const fetchWeather = async () => {
                // Correzione dell'URL dell'API di OpenWeatherMap
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${userLocation.lat}&lon=${userLocation.lon}&appid=${weatherApiKey}&units=metric&lang=it`;
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setWeatherData(data);
                } catch (error) {
                    console.error("Errore nel recupero dati meteo:", error);
                    setMessage("Errore nel recupero delle previsioni meteo.");
                    setWeatherData(null); // Clear previous weather data on error
                }
            };
            fetchWeather();
        } else if (userLocation && weatherApiKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
            setMessage("Ricorda di inserire la tua API Key di OpenWeatherMap per vedere le previsioni meteo!");
        }
    }, [userLocation, weatherApiKey]);

    // Funzione per mostrare/nascondere il tasto "scroll to top"
    const handleScroll = () => {
        if (window.pageYOffset > 300) { // Mostra il tasto dopo aver scrollato di 300px
            setShowScrollToTop(true);
        } else {
            setShowScrollToTop(false);
        }
    };

    // Gestione visibilità feedback lux in base all'input
    React.useEffect(() => {
        // Mostra il feedback se luxValue è > 0, altrimenti nascondi
        if (luxValue > 0) {
            setShowLuxFeedback(true);
        } else {
            setShowLuxFeedback(false);
        }
    }, [luxValue]);


    // Aggiungi e rimuovi l'event listener per lo scroll
    React.useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Funzione per scorrere in cima alla pagina
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Funzioni di scroll alle sezioni
    const scrollToAllPlants = () => {
        setCurrentView('allPlants');
        allPlantsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToMyGarden = () => {
        if (!userId) { // Check if user is logged in
            setMessage("Devi essere loggato per visualizzare il tuo giardino.");
            return;
        }
        setCurrentView('myGarden');
        myGardenRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Gestione Modale Pianta
    const openPlantModal = React.useCallback((plant) => {
        setSelectedPlant(plant);
        console.log("openPlantModal: plant received:", plant);
        setShowPlantModal(true);
    }, []);

    const closePlantModal = React.useCallback(() => {
        setShowPlantModal(false);
        setSelectedPlant(null);
    }, []);

    // Gestione Modale Aggiungi/Modifica Pianta
    const openAddEditModal = React.useCallback((plantToEdit = null) => {
        setEditPlantData(plantToEdit);
        console.log("openAddEditModal: plantToEdit received:", plantToEdit);
        setShowAddEditModal(true);
    }, []);

    const closeAddEditModal = React.useCallback(() => {
        setShowAddEditModal(false);
        setEditPlantData(null);
    }, []);

    // Funzioni CRUD per le piante (Collezione Pubblica e Mio Giardino)
    // Ora riceve l'intero oggetto della pianta originale invece del solo ID
    const addOrUpdatePlant = React.useCallback(async (plantData, originalPlantObject = null, imageFile = null) => {
        console.log("addOrUpdatePlant: Function called.");
        if (!db || !userId || !storage) {
            setMessage("Errore: Utente non autentato. Si prega di effettuare il login per aggiungere/modificare piante.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setMessage('');

        let imageUrl = plantData.image; // Inizia con l'URL esistente o quello fornito nel form

        // Gestione upload immagine
        if (imageFile) {
            try {
                const storageRef = storage.ref(); // Ottieni il riferimento allo storage
                const imageRef = storageRef.child(`plant_images/${userId}/${imageFile.name}_${Date.now()}`); // Cartella per utente
                const snapshot = await imageRef.put(imageFile); // Carica il file
                imageUrl = await snapshot.ref.getDownloadURL(); // Ottieni l'URL scaricabile
                setMessage("Immagine caricata con successo!");
                console.log("URL immagine caricata:", imageUrl);
            } catch (error) {
                console.error("Errore durante il caricamento dell'immagine:", error);
                setMessage("Errore durante il caricamento dell'immagine. Riprova.");
                setLoading(false);
                return; // Ferma l'operazione se l'upload fallisce
            }
        } else if (originalPlantObject && !imageFile && !plantData.image) {
            // Se stiamo aggiornando, non c'è un nuovo file, e l'URL immagine è vuoto/null,
            // significa che l'utente vuole rimuovere l'immagine.
            imageUrl = ''; // Imposta l'URL a vuoto per rimuovere l'immagine
        } else if (originalPlantObject && !imageFile && originalPlantObject.image) {
            // Nessun nuovo file e nessuna rimozione esplicita, mantieni l'URL dell'immagine esistente da originalPlantObject
            imageUrl = originalPlantObject.image;
        }


        // Il campo scientificName verrà usato per memorizzare la dimensione ideale del vaso.
        const finalPlantData = { ...plantData, image: imageUrl };
        console.log("addOrUpdatePlant: Dati finali per Firestore (Update/Add):", finalPlantData);
        console.log("addOrUpdatePlant: Oggetto Pianta Originale per operazione:", originalPlantObject);


        try {
            const plantIdToOperate = originalPlantObject ? originalPlantObject.id : null;
            
            // Determinazione affidabile della provenienza della pianta:
            // Cerca la pianta nell'array myGardenPlants usando il suo ID
            const isEditingMyGardenPlant = originalPlantObject && myGardenPlants.some(p => p.id === originalPlantObject.id);


            console.log("addOrUpdatePlant: Is editing My Garden plant?", isEditingMyGardenPlant);
            console.log("addOrUpdatePlant: ID del documento per l'operazione:", plantIdToOperate);
            console.log("addOrUpdatePlant: Public Plant ID (if applicable):", originalPlantObject ? originalPlantObject.publicPlantId : 'N/A');


            if (plantIdToOperate && isEditingMyGardenPlant) {
                // Scenario 1: Aggiornamento di una pianta dal "Mio Giardino"
                // Aggiorna SEMPRE la copia nel giardino dell'utente
                const myGardenDocRef = db.collection(`users/${userId}/gardens`).doc(plantIdToOperate);
                console.log("Tentativo di aggiornare pianta nel Mio Giardino al percorso:", myGardenDocRef.path);
                
                await myGardenDocRef.set(finalPlantData, { merge: true });
                setMessage("Pianta nel tuo giardino aggiornata con successo!");
                console.log("Aggiornata pianta nel mio giardino con ID:", plantIdToOperate);

                // Controlla se questa pianta è stata aggiunta dall'utente corrente alla collezione pubblica
                // (e quindi l'utente è l'owner della versione pubblica)
                const publicPlantId = originalPlantObject.publicPlantId || plantIdToOperate; // Usa publicPlantId se disponibile, altrimenti l'ID corrente (che dovrebbe essere publicPlantId)
                const publicPlantDocRef = db.collection('plants').doc(publicPlantId);
                const publicPlantSnap = await publicPlantDocRef.get();

                if (publicPlantSnap.exists && publicPlantSnap.data().ownerId === userId) {
                    // Se l'utente è l'owner della pianta pubblica corrispondente, aggiorna anche la versione pubblica
                    await publicPlantDocRef.update(finalPlantData); // Aggiorna la pianta pubblica con i nuovi dati
                    setMessage(prev => prev + " e anche la versione pubblica!");
                    console.log("Aggiornata anche la pianta pubblica con ID:", publicPlantId);
                }

            } else if (plantIdToOperate) {
                // Scenario 2: Aggiornamento di una pianta dalla collezione "Tutte le Piante" (pubblica)
                const publicPlantDocRef = db.collection('plants').doc(plantIdToOperate);
                const publicPlantSnap = await publicPlantDocRef.get();

                if (publicPlantSnap.exists && publicPlantSnap.data().ownerId === userId) {
                    await publicPlantDocRef.update(finalPlantData);
                    setMessage("Pianta pubblica aggiornata con successo!");
                    console.log("Aggiornata pianta pubblica con ID:", plantIdToOperate);

                    // Dopo aver aggiornato la pianta pubblica, aggiorna anche la copia nel giardino dell'utente attuale
                    // (se l'utente l'ha nel suo giardino)
                    const myGardenDocRef = db.collection(`users/${userId}/gardens`).doc(plantIdToOperate); // L'ID corrisponde al publicPlantId
                    const myGardenDocSnap = await myGardenDocRef.get();
                    if (myGardenDocSnap.exists) {
                        await myGardenDocRef.update(finalPlantData);
                        setMessage(prev => prev + " e la copia nel tuo giardino.");
                        console.log("Aggiornata anche la copia nel giardino dell'utente con ID:", plantIdToOperate);
                    }


                } else if (publicPlantSnap.exists) {
                    setMessage("Non hai i permessi per modificare questa pianta pubblica.");
                    console.warn("Tentativo di modificare pianta pubblica non propria:", plantIdToOperate);
                } else {
                    console.error("Errore: ID pianta non trovato per l'aggiornamento.", plantIdToOperate);
                    setMessage("Errore: Pianta non trovata per l'aggiornamento.");
                }

            } else {
                // Scenario 3: Aggiunta di una nuova pianta pubblica
                const plantsCollectionRef = db.collection('plants');
                await plantsCollectionRef.add({ ...finalPlantData, ownerId: userId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
                setMessage("Nuova pianta aggiunta alla collezione pubblica con successo!");
                console.log("Aggiunta nuova pianta pubblica.");
            }
            closeAddEditModal();
        } catch (error) {
            console.error("Errore durante l'aggiunta/aggiornamento della pianta:", error);
            setMessage(`Errore: ${originalPlantObject ? 'aggiornamento' : 'aggiunta'} pianta fallito.`);
        } finally {
            setLoading(false);
        }
    }, [db, userId, storage, closeAddEditModal, myGardenPlants, plants]); // Aggiunto myGardenPlants alle dipendenze per il controllo .some()

    const deletePlantPermanently = React.useCallback(async (plantId) => {
        if (!db || !userId) {
            setMessage("Errore: Utente non autentato. Si prega di effettuare il login per eliminare piante.");
            return;
        }

        // Chiedi conferma all'utente con un modale personalizzato
        const confirmDelete = await new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay'; // Usa la classe CSS per l'overlay
            modal.innerHTML = `
                <div class="modal-content">
                    <p class="modal-title" style="font-size: 1.25rem; font-weight: 500; text-align: center; margin-bottom: 1rem;">Sei sicuro di voler eliminare definitivamente questa pianta dalla collezione pubblica?</p>
                    <div class="form-actions" style="justify-content: center; margin-top: 1rem;">
                        <button id="confirmBtn" class="form-button submit" style="background-color: #ef4444; margin-right: 0.5rem;"><i class="fas fa-trash-alt"></i> Sì, elimina</button>
                        <button id="cancelBtn" class="form-button cancel"><i class="fas fa-times"></i> Annulla</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('confirmBtn').onclick = () => {
                modal.remove();
                resolve(true);
            };
            document.getElementById('cancelBtn').onclick = () => {
                modal.remove();
                resolve(false);
            };
        });

        if (!confirmDelete) return;

        setLoading(true);
        setMessage('');

        try {
            // Rimuovi la pianta dalla collezione pubblica
            await db.collection('plants').doc(plantId).delete(); // Usa .collection().doc().delete()

            // Rimuovi tutte le referenze a questa pianta dal "My Garden" di tutti gli utenti
            const usersCollectionRef = db.collection('users'); // Usa db.collection()
            const usersSnapshot = await usersCollectionRef.get(); // Usa .get()

            for (const userDoc of usersSnapshot.docs) {
                const currentUserId = userDoc.id;
                const myGardenCollectionRef = db.collection(`users/${currentUserId}/gardens`); // Usa db.collection()
                const q = myGardenCollectionRef.where("publicPlantId", "==", plantId); // Usa .where()
                const gardenPlantsSnapshot = await q.get(); // Usa .get()

                for (const gardenDoc of gardenPlantsSnapshot.docs) {
                    await gardenDoc.ref.delete(); // Usa .ref.delete()
                }
            }

            setMessage("Pianta eliminata definitivamente da tutte le collezioni!");
        } catch (error) {
            console.error("Errore durante l'eliminazione definitiva della pianta:", error);
            setMessage("Errore: eliminazione definitiva della pianta fallita.");
        } finally {
            setLoading(false);
        }
    }, [db, userId]);

    // Funzioni per il "Mio Giardino"
    const addPlantToMyGarden = React.useCallback(async (plant) => { // Ora accetta l'intero oggetto pianta
        if (!db || !userId) {
            setMessage("Errore: Utente non autentato. Si prega di effettuare il login per aggiungere piante al giardino.");
            return;
        }
        setLoading(true);
        setMessage('');

        try {
            // Usa l'ID della pianta pubblica come ID del documento nel giardino
            const myGardenDocRef = db.collection(`users/${userId}/gardens`).doc(plant.id);
            const docSnap = await myGardenDocRef.get();

            if (!docSnap.exists) {
                // Crea il documento usando l'ID della pianta pubblica come suo ID
                await myGardenDocRef.set({
                    ...plant, // Copia tutti i campi della pianta pubblica
                    publicPlantId: plant.id, // Memorizza anche l'ID della pianta pubblica per query future
                    dateAdded: firebase.firestore.FieldValue.serverTimestamp(),
                });
                console.log("Nuova pianta aggiunta al mio giardino (con ID della pianta pubblica):", plant.id);
                setMessage("Pianta aggiunta al tuo giardino!");
            } else {
                setMessage("Questa pianta è già nel tuo giardino.");
            }
        } catch (error) {
            console.error("Errore nell'aggiunta al mio giardino:", error);
            setMessage("Errore: aggiunta al giardino fallita.");
        } finally {
            setLoading(false);
        }
    }, [db, userId]);

    const removePlantFromMyGarden = React.useCallback(async (plantId) => {
        if (!db || !userId) {
            setMessage("Errore: Utente non autentato. Si prega di effettuare il login per rimuovere piante.");
            return;
        }

        // Chiedi conferma all'utente con un modale personalizzato
        const confirmRemove = await new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay'; // Usa la classe CSS per l'overlay
            modal.innerHTML = `
                <div class="modal-content">
                    <p class="modal-title" style="font-size: 1.25rem; font-weight: 500; text-align: center; margin-bottom: 1rem;">Sei sicuro di voler rimuovere questa pianta dal tuo giardino?</p>
                    <div class="form-actions" style="justify-content: center; margin-top: 1rem;">
                        <button id="confirmBtn" class="form-button submit" style="background-color: #ef4444; margin-right: 0.5rem;"><i class="fas fa-trash-alt"></i> Sì, rimuovi</button>
                        <button id="cancelBtn" class="form-button cancel"><i class="fas fa-times"></i> Annulla</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('confirmBtn').onclick = () => {
                modal.remove();
                resolve(true);
            };
            document.getElementById('cancelBtn').onclick = () => {
                modal.remove();
                resolve(false);
            };
        });

        if (!confirmRemove) return;

        setLoading(true);
        setMessage('');

        try {
            // Rimuovi direttamente usando l'ID passato (che ora sarà l'ID del documento nel giardino)
            await db.collection(`users/${userId}/gardens`).doc(plantId).delete();
            setMessage("Pianta rimossa dal tuo giardino!");
        } catch (error) {
            console.error("Errore nella rimozione dal mio giardino:", error);
            setMessage("Errore: rimozione dal giardino fallita.");
        } finally {
            setLoading(false);
        }
    }, [db, userId]);

    // Funzioni di autenticazione
    const handleRegister = async (email, password) => {
        setLoading(true);
        setMessage('');
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            setMessage("Registrazione completata! Accesso effettuato.");
            setShowAuthModal(false);
        } catch (error) {
            console.error("Errore durante la registrazione:", error);
            setMessage(`Errore registrazione: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (email, password) => {
        setLoading(true);
        setMessage('');
        try {
            await auth.signInWithEmailAndPassword(email, password);
            setMessage("Login effettuato con successo!");
            setShowAuthModal(false);
        } catch (error) {
            console.error("Errore durante il login:", error);
            setMessage(`Errore login: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        setMessage('');
        try {
            await auth.signOut();
            setMessage("Logout effettuato con successo!");
        } catch (error) {
            console.error("Errore durante il logout:", error);
            setMessage(`Errore logout: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Gestione input Lux e feedback piante
    const handleManualLuxChange = React.useCallback((e) => {
        setManualLuxInput(e.target.value);
    }, []);

    const applyManualLux = React.useCallback(() => {
        const parsedLux = parseFloat(manualLuxInput);
        if (!isNaN(parsedLux) && parsedLux >= 0) {
            setLuxValue(parsedLux);
            setMessage(`Valore Lux impostato manualmente a ${parsedLux}.`);
        } else {
            setMessage("Per favore, inserisci un numero valido per i Lux.");
            setLuxValue(0); // Resetta a 0 se l'input non è valido
        }
    }, [manualLuxInput]);

    const getPlantLuxFeedback = React.useCallback((plant) => {
        // Usa il luxValue corrente, che può provenire dalla fotocamera o dall'input manuale
        const lux = parseFloat(luxValue);
        // Restituisce null o stringa vuota se lux non è un numero valido o mancano i dati della pianta
        if (isNaN(lux) || lux <= 0 || !plant.idealLuxMin || !plant.idealLuxMax) {
            return null; // Non mostra feedback specifico se lux non è valido o 0
        }

        if (lux < plant.idealLuxMin) {
            return `Poca luce per la ${plant.name} (minimo ${plant.idealLuxMin} Lux)`;
        } else if (lux > plant.idealLuxMax) {
            return `Troppa luce per la ${plant.name} (massimo ${plant.idealLuxMax} Lux)`;
        } else {
            return `Luce ottimale per la ${plant.name}!`;
        }
    }, [luxValue]);

    // Funzione per richiamare l'AI per la ricerca di informazioni
    const handleAiQuery = React.useCallback(async () => {
        if (!aiQuery.trim()) {
            setAiResponse("Per favoré, inserisci una domanda.");
            return;
        }
        setAiLoading(true);
        setAiResponse('');
        setMessage('');

        try {
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: `Fornisci informazioni concise e utili su: ${aiQuery}. Concentrati su nome comune, nome scientifico, requisiti di luce (Lux min/max), frequenza di irrigazione, esigenza di luce solare, temperatura (min/max °C) e una breve descrizione. Formatta la risposta come testo leggibile.` }] });
            const payload = { contents: chatHistory };
            const apiKey = "AIzaSyBeg9C9fz8mVxEcp36SlYXnpyM5SaQayTA"; // Lascia vuoto, l'API key sarà fornita dall'ambiente Canvas
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Errore API: ${response.status} - ${errorData.error.message || response.statusText}`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setAiResponse(text);
                setMessage("Informazioni AI caricate con successo!");
            } else {
                setAiResponse("Nessuna risposta valida dall'AI. Riprova con una domanda diversa.");
                setMessage("Nessuna risposta dall'AI.");
            }
        } catch (error) {
            console.error("Errore durante la chiamata AI:", error);
            setAiResponse(`Si è verificato un errore durante la ricerca AI: ${error.message}`);
            setMessage("Errore durante la ricerca AI.");
        } finally {
            setAiLoading(false);
        }
    }, [aiQuery]);

    // Componente Card Pianta
    const PlantCard = ({ plant, isMyGardenPlant, onDetailsClick, onAddOrRemoveToMyGarden, onUpdatePlant, onDeletePlantPermanently }) => {
        const isInMyGarden = myGardenPlants.some(p => p.publicPlantId === plant.id); // Controlla se l'ID pubblico è nel giardino

        // Funzione per generare il percorso dell'icona di categoria
        const getCategoryIconPath = (categoryName) => {
            if (!categoryName) return null;
            // Converte il nome della categoria in un formato compatibile con il nome del file (es. "Fiori Estivi" -> "fiori-estivi.png")
            const fileName = categoryName.toLowerCase().replace(/\s/g, '-');
            return `/assets/category_icons/${fileName}.png`; // Assicurati che il percorso sia corretto rispetto alla cartella public
        };

        const imageUrl = isMyGardenPlant
            ? (plant.image || `https://placehold.co/400x300/e0e0e0/000000?text=${plant.name}`) // Immagine reale per il giardino
            : (plant.category ? getCategoryIconPath(plant.category) : `https://placehold.co/400x300/f0fdf4/16a34a?text=PIANTA`); // Icona di categoria o placeholder per "di tutti"

        const imageOnError = (e) => {
            e.target.onerror = null;
            // Fallback specifico per le card "di tutti" se l'icona di categoria non si carica
            e.target.src = isMyGardenPlant
                ? `https://placehold.co/400x300/e0e0e0/000000?text=${plant.name}`
                : `https://placehold.co/400x300/f0fdf4/16a34a?text=PIANTA+GENERICA`;
        };

        return (
            <div className="plant-card">
                <img
                    src={imageUrl}
                    alt={plant.name}
                    className="plant-card-image"
                    onClick={() => onDetailsClick(plant)}
                    onError={imageOnError}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }} // Stili aggiunti per ridimensionamento automatico
                />
                <h3 className="plant-card-title">{plant.name}</h3>
                {/* Modifica: scientificName ora visualizza Dimensione Ideale Vaso */}
                <p className="plant-card-pot-size">Dimensione Ideale Vaso: {plant.scientificName || 'N/A'}</p>
                <div className="plant-card-description">{plant.description || "Nessuna descrizione disponibile."}</div>

                <div className="card-actions">
                    {/* Azioni per collezione pubblica */}
                    {!isMyGardenPlant && (
                        <>
                            <button
                                onClick={() => onAddOrRemoveToMyGarden(plant)} // Passa l'intero oggetto plant
                                className={`card-action-button ${isInMyGarden ? 'in-garden' : 'add-to-garden'}`}
                                disabled={!userId} // Disabilita se non loggato
                            >
                                <i className="fas fa-leaf"></i> {isInMyGarden ? 'Già nel tuo giardino' : 'Aggiungi al mio giardino'}
                            </button>
                            <button
                                onClick={() => onUpdatePlant(plant)}
                                className="card-action-button update"
                                disabled={!userId || plant.ownerId !== userId} // Disabilita se non proprietario o non loggato
                            >
                                <i className="fas fa-edit"></i> Aggiorna pianta
                            </button>
                            {/* Mostra "Rimuovi definitivamente" solo se l'utente è quello che l'ha aggiunta E loggato */}
                            {plant.ownerId === userId && userId && (
                                <button
                                    onClick={() => onDeletePlantPermanently(plant.id)}
                                    className="card-action-button delete"
                                >
                                    <i className="fas fa-trash-alt"></i> Rimuovi definitivamente
                                </button>
                            )}
                        </>
                    )}

                    {/* Azioni per "Mio Giardino" */}
                    {isMyGardenPlant && (
                        <>
                            <button
                                onClick={() => onAddOrRemoveToMyGarden(plant.id)} // Rimuovi usando l'ID del documento nel giardino
                                className="card-action-button delete"
                                disabled={!userId} // Disabilita se non loggato
                            >
                                <i className="fas fa-minus-circle"></i> Rimuovi da mio giardino
                            </button>
                            <button
                                onClick={() => onUpdatePlant(plant)}
                                className="card-action-button update"
                                disabled={!userId} // Disabilita se non loggato
                            >
                                <i className="fas fa-edit"></i> Aggiorna pianta
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    // Componente Modale Dettagli Pianta
    const PlantDetailsModal = ({ plant, onClose }) => {
        if (!plant) return null;

        // Funzione per generare il percorso dell'icona di categoria
        const getCategoryIconPath = (categoryName) => {
            if (!categoryName) return null;
            const fileName = categoryName.toLowerCase().replace(/\s/g, '-');
            return `/assets/category_icons/${fileName}.png`;
        };

        // Determine image URL based on whether it's a "my garden" plant
        const imageUrl = plant.isMyGardenPlant
            ? (plant.image || `https://placehold.co/600x400/e0e0e0/000000?text=${plant.name}`)
            : (plant.category ? getCategoryIconPath(plant.category) : `https://placehold.co/600x400/f0fdf4/16a34a?text=PIANTA`);

        const imageOnError = (e) => {
            e.target.onerror = null;
            e.target.src = plant.isMyGardenPlant
                ? `https://placehold.co/600x400/e0e0e0/000000?text=${plant.name}`
                : `https://placehold.co/600x400/f0fdf4/16a34a?text=PIANTA+GENERICA`;
        };

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className="modal-title">{plant.name}</h2>
                        <button
                            onClick={onClose}
                            className="modal-close-btn"
                        >
                            &times;
                        </button>
                    </div>
                    <img
                        src={imageUrl}
                        alt={plant.name}
                        className="modal-image"
                        onError={imageOnError}
                    />
                    <div className="modal-details-list">
                        {/* Modifica: scientificName ora visualizza Dimensione Ideale Vaso */}
                        <p><strong>Dimensione Ideale Vaso:</strong> {plant.scientificName || 'N/A'}</p>
                        <p><strong>Descrizione:</strong> {plant.description || 'Nessuna descrizione.'}</p>
                        <p><strong>Categoria:</strong> {plant.category || 'N/A'}</p>
                        <p><strong>Luce (Min/Max Lux):</strong> {plant.idealLuxMin || 'N/A'} / {plant.idealLuxMax || 'N/A'}</p>
                        <p><strong>Frequenza Irrigazione:</strong> {plant.watering || 'N/A'}</p>
                        <p><strong>Esigenza Luce:</strong> {plant.sunlight || 'N/A'}</p>
                        <p><strong>Temperatura (Min/Max °C):</strong> {plant.tempMin || 'N/A'} / {plant.tempMax || 'N/A'}</p>
                        {/* Aggiungi qui altri campi se necessario */}
                    </div>
                </div>
            </div>
        );
    };

    // Componente Modale Aggiungi/Modifica Pianta
    const AddEditPlantModal = ({ plantToEdit, onClose, onSubmit }) => {
        const [formData, setFormData] = React.useState({
            name: '',
            // scientificName sarà usato per Dimensione Ideale Vaso nel database
            scientificName: '', // Campo 'scientificName' ora per Dimensione Ideale Vaso
            description: '',
            image: '', // Campo 'image' per URL
            idealLuxMin: '',
            priorità: '',
            idealLuxMax: '',
            watering: '',
            sunlight: '',
            category: '', // Questo sarà ora un dropdown
            tempMax: '',
            tempMin: '',
        });
        const [selectedFile, setSelectedFile] = React.useState(null); // Stato per il file selezionato
        const [imagePreviewUrl, setImagePreviewUrl] = React.useState(''); // Stato per l'anteprima immagine

        React.useEffect(() => {
            if (plantToEdit) {
                setFormData({
                    name: plantToEdit.name || '',
                    scientificName: plantToEdit.scientificName || '', // Carica valore esistente
                    description: plantToEdit.description || '',
                    image: plantToEdit.image || '', // Imposta l'URL esistente in formData
                    idealLuxMin: plantToEdit.idealLuxMin || '',
                    idealLuxMax: plantToEdit.idealLuxMax || '',
                    watering: plantToEdit.watering || '',
                    sunlight: plantToEdit.sunlight || '',
                    category: plantToEdit.category || '',
                    tempMax: plantToEdit.tempMax || '',
                    tempMin: plantToEdit.tempMin || '',
                });
                setImagePreviewUrl(plantToEdit.image || ''); // Mostra l'anteprima dell'immagine esistente
            } else {
                setFormData({
                    name: '', scientificName: '', description: '', image: '',
                    idealLuxMin: '', idealLuxMax: '', watering: '', sunlight: '',
                    category: '', tempMax: '', tempMin: '',
                });
                setImagePreviewUrl(''); // Resetta l'anteprima per nuova pianta
            }
            setSelectedFile(null); // Resetta sempre il file selezionato al mount
        }, [plantToEdit]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        // Gestione del cambiamento del file input
        const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setSelectedFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviewUrl(reader.result);
                    // IMPORTANTE: Aggiorna formData.image con l'URL temporaneo per la preview.
                    // Questo sarà sovrascritto dall'URL di Firebase Storage dopo l'upload.
                    setFormData(prev => ({ ...prev, image: reader.result })); 
                };
                reader.readAsDataURL(file);
            } else {
                setSelectedFile(null);
                // Se nessun file è selezionato (input cleared), ripristina l'URL dell'immagine originale in formData
                // e nella preview, se esisteva. Altrimenti, imposta a stringa vuota.
                const originalImageUrl = plantToEdit ? plantToEdit.image || '' : '';
                setImagePreviewUrl(originalImageUrl);
                setFormData(prev => ({ ...prev, image: originalImageUrl }));
            }
        };


        const handleSubmit = (e) => {
            e.preventDefault();
            // Converti i campi numerici
            const dataToSend = {
                ...formData,
                idealLuxMin: formData.idealLuxMin !== '' ? parseFloat(formData.idealLuxMin) : null,
                idealLuxMax: formData.idealLuxMax !== '' ? parseFloat(formData.idealLuxMax) : null,
                tempMax: formData.tempMax !== '' ? parseFloat(formData.tempMax) : null,
                tempMin: formData.tempMin !== '' ? parseFloat(formData.tempMin) : null,
            };
            console.log("AddEditPlantModal handleSubmit: Dati inviati per aggiornamento:", dataToSend);
            console.log("AddEditPlantModal handleSubmit: File immagine selezionato:", selectedFile);
            // Passa l'intero oggetto plantToEdit, non solo l'ID.
            onSubmit(dataToSend, plantToEdit, selectedFile);
        };

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className="add-edit-modal-title">{plantToEdit ? 'Aggiorna Pianta' : 'Aggiungi Nuova Pianta'}</h2>
                        <button
                            onClick={onClose}
                            className="modal-close-btn"
                        >
                            &times;
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="form-spacing">
                        <div className="form-group">
                            <label htmlFor="name">Nome Comune</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            {/* Modifica: scientificName ora è Dimensione Ideale Vaso */}
                            <label htmlFor="scientificName">Dimensione Ideale Vaso</label>
                            <input
                                type="text"
                                name="scientificName" // Il nome del campo nel database rimane scientificName
                                id="scientificName"
                                value={formData.scientificName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Descrizione</label>
                            <textarea
                                name="description"
                                id="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                            ></textarea>
                        </div>
                        {/* Campo per il caricamento dell'immagine */}
                        <div className="form-group">
                            <label htmlFor="imageFile">Carica Immagine Pianta</label>
                            <input
                                type="file"
                                name="imageFile"
                                id="imageFile"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="form-input"
                            />
                            {imagePreviewUrl && (
                                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.9em', color: '#555' }}>Anteprima Immagine:</p>
                                    <img src={imagePreviewUrl} alt="Anteprima" style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Categoria</label>
                            <select // Cambiato da input a select
                                name="category"
                                id="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Seleziona una categoria</option>
                                <option value="Fiori">Fiori</option>
                                <option value="Alberi">Alberi</option>
                                <option value="Arbusti">Arbusti</option>
                                <option value="Succulente">Succulente</option>
                                <option value="Ortaggi">Ortaggi</option>
                                <option value="Erbe Aromatiche">Erbe Aromatiche</option>
                                {/* Aggiungi altre opzioni qui */}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="idealLuxMin">Luce Minima (Lux)</label>
                            <input
                                type="number"
                                name="idealLuxMin"
                                id="idealLuxMin"
                                value={formData.idealLuxMin}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="idealLuxMax">Luce Massima (Lux)</label>
                            <input
                                type="number"
                                name="idealLuxMax"
                                id="idealLuxMax"
                                value={formData.idealLuxMax}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="watering">Frequenza Irrigazione</label>
                            <input
                                type="text"
                                name="watering"
                                id="watering"
                                value={formData.watering}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="sunlight">Esigenza Luce Solare</label>
                            <select
                                name="sunlight"
                                id="sunlight"
                                value={formData.sunlight}
                                onChange={handleChange}
                            >
                                <option value="">Seleziona</option>
                                <option value="ombra">Ombra</option>
                                <option value="mezzombra">Mezz'ombra</option>
                                <option value="pienosole">Pieno Sole</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="tempMin">Temperatura Minima (°C)</label>
                            <input
                                type="number"
                                name="tempMin"
                                id="tempMin"
                                value={formData.tempMin}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="tempMax">Temperatura Massima (°C)</label>
                            <input
                                type="number"
                                name="tempMax"
                                id="tempMax"
                                value={formData.tempMax}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={onClose}
                                className="form-button cancel"
                            >
                                <i className="fas fa-times"></i> Annulla
                            </button>
                            <button
                                type="submit"
                                className="form-button submit"
                            >
                                <i className="fas fa-check"></i> {plantToEdit ? 'Salva Modifiche' : 'Aggiungi Pianta'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Nuovo componente Modale di Autenticazione
    const AuthModal = ({ onClose, onRegister, onLogin }) => {
        const [email, setEmail] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [isRegisterMode, setIsRegisterMode] = React.useState(true); // True per Registrazione, False per Login

        const handleSubmit = (e) => {
            e.preventDefault();
            if (isRegisterMode) {
                onRegister(email, password);
            } else {
                onLogin(email, password);
            }
        };

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className="add-edit-modal-title">{isRegisterMode ? 'Registrazione Utente' : 'Accedi'}</h2>
                        <button onClick={onClose} className="modal-close-btn">&times;</button>
                    </div>
                    <form onSubmit={handleSubmit} className="form-spacing">
                        <div className="form-group">
                            <label htmlFor="auth-email">Email</label>
                            <input
                                type="email"
                                id="auth-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="auth-password">Password</label>
                            <input
                                type="password"
                                id="auth-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => setIsRegisterMode(prev => !prev)}
                                className="form-button cancel"
                            >
                                {isRegisterMode ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
                            </button>
                            <button type="submit" className="form-button submit">
                                <i className="fas fa-sign-in-alt"></i> {isRegisterMode ? 'Registrati' : 'Accedi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Nuovo componente Modale AI Query
    const AiQueryModal = ({ onClose, onQuerySubmit, query, setQuery, response, loading }) => {
        // Usa React.useCallback per mantenere la stabilità della funzione di gestione del cambiamento
        const handleTextareaChange = React.useCallback((e) => {
            setQuery(e.target.value);
        }, [setQuery]);

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className="add-edit-modal-title">Chiedi all'AI sulle Piante</h2>
                        <button onClick={onClose} className="modal-close-btn">&times;</button>
                    </div>
                    <div className="form-spacing">
                        <div className="form-group">
                            <label htmlFor="aiQuery" className="form-label">La tua domanda:</label>
                            <textarea
                                id="aiQuery"
                                value={query}
                                onChange={handleTextareaChange} // Usa la funzione stabile
                                placeholder="Ad esempio: 'Quali sono i requisiti di luce per una Monstera Deliciosa?'"
                                rows="4"
                                className="form-input"
                                autoFocus // Aggiunto per dare focus automatico all'apertura del modale
                            ></textarea>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={onQuerySubmit}
                                className="form-button submit"
                                disabled={loading}
                            >
                                {loading ? 'Caricamento...' : <><i className="fas fa-robot"></i> Ottieni Informazioni</>}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="form-button cancel"
                            >
                                <i className="fas fa-times"></i> Chiudi
                            </button>
                        </div>
                        {response && (
                            <div className="ai-response-box">
                                <h3>Risposta AI:</h3>
                                <p>{response}</p>
                            </div>
                        )}
                        {loading && (
                            <div className="loading-spinner-ai">
                                <div className="spinner"></div>
                                <p>Ricerca AI in corso...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Nuovo componente CameraLuxSensor
    const CameraLuxSensor = ({ onLuxChange, currentLux }) => {
        const videoRef = React.useRef(null);
        const canvasRef = React.useRef(null);
        const animationFrameId = React.useRef(null);
        const [isStreaming, setIsStreaming] = React.useState(false);
        const [error, setError] = React.useState('');

        const startCamera = async () => {
            setError('');
            try {
                // Richiedi l'accesso alla fotocamera posteriore (environment)
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment', // Preferisce la fotocamera posteriore
                        width: { ideal: 128 }, // Risoluzione bassa per performance
                        height: { ideal: 96 }
                    }
                });
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setIsStreaming(true);
                animationFrameId.current = requestAnimationFrame(processFrame);
            } catch (err) {
                console.error("Errore nell'accesso alla fotocamera:", err);
                if (err.name === 'NotAllowedError') {
                    setError("Permesso fotocamera negato. Abilitalo nelle impostazioni del browser.");
                } else if (err.name === 'NotFoundError') {
                    setError("Nessuna fotocamera trovata o disponibile.");
                } else {
                    setError(`Errore fotocamera: ${err.message}`);
                }
                setIsStreaming(false);
            }
        };

        const stopCamera = () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            setIsStreaming(false);
            onLuxChange(0); // Resetta i lux a 0 quando la telecamera è spenta
            setError(''); // Pulisci l'errore
        };

        const processFrame = () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.paused || video.ended) {
                animationFrameId.current = null;
                return;
            }

            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            try {
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                let sumLuminance = 0;

                // Calcola la luminanza media (approssimazione del Lux)
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    // Formula per la luminanza (per pixel)
                    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    sumLuminance += luminance;
                }

                const averageLuminance = sumLuminance / (data.length / 4);

                // Mappa la luminanza (0-255) a un range di Lux stimato.
                // Questo è un mapping molto grezzo e deve essere interpretato come una stima.
                // Esempio: 0-255 luminanza -> 0-10000 Lux.
                // I valori reali di Lux possono andare molto più in alto (es. luce solare diretta ~100.000 Lux).
                // Questa scala è più adatta per ambienti interni o ombreggiati.
                const estimatedLux = Math.round((averageLuminance / 255) * 10000); // Scala a 10.000 Lux max

                onLuxChange(estimatedLux); // Aggiorna lo stato Lux nell'App principale

            } catch (e) {
                console.error("Errore nell'elaborazione del frame:", e);
                setError("Errore nell'elaborazione della luminosità.");
                stopCamera(); // Ferma la telecamera in caso di errore di elaborazione
            }

            animationFrameId.current = requestAnimationFrame(processFrame);
        };

        React.useEffect(() => {
            // Pulizia quando il componente viene smontato
            return () => {
                stopCamera();
            };
        }, []); // Esegui solo al mount/unmount

        return (
            <div className="camera-lux-sensor">
                <h3 className="sensor-title">Misurazione con Fotocamera</h3>
                <div className="camera-controls">
                    {!isStreaming ? (
                        <button onClick={startCamera} className="form-button submit">
                            <i className="fas fa-video"></i> Avvia Misurazione
                        </button>
                    ) : (
                        <button onClick={stopCamera} className="form-button cancel">
                            <i className="fas fa-stop-circle"></i> Ferma Misurazione
                        </button>
                    )}
                </div>
                {error && <p className="error-message">{error}</p>}
                {isStreaming && (
                    <div className="camera-preview-container">
                        <video ref={videoRef} className="camera-preview" autoPlay playsInline muted></video>
                        <canvas ref={canvasRef} className="camera-canvas"></canvas>
                        <p className="current-lux-display">Lux Stimati: <strong>{currentLux}</strong></p>
                        <p className="lux-disclaimer">
                            <i className="fas fa-info-circle"></i> Questa è una stima basata sulla fotocamera, non una misurazione di precisione.
                        </p>
                    </div>
                )}
            </div>
        );
    };


    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p className="loading-text">Caricamento in corso...</p>
            </div>
        );
    }

    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <h1 className="app-title">
                        Il Mio Giardino Digitale
                    </h1>
                    <div className="main-buttons">
                        <button
                            onClick={scrollToAllPlants}
                            className="main-button button-green"
                        >
                            <i className="fas fa-globe-americas"></i> Mostra Piante di Tutti
                        </button>
                        <button
                            onClick={scrollToMyGarden}
                            className="main-button button-blue"
                            title={!userId ? "Effettua il login per visualizzare il tuo giardino" : ""}
                        >
                            <i className="fas fa-tree"></i> Mostra il Mio Giardino
                        </button>
                        {/* Bottone per aggiungere pianta, disabilitato se non loggato */}
                        <button
                            onClick={() => { // Modificato per mostrare il messaggio al click
                                if (!userId) {
                                    setMessage("Devi essere loggato per aggiungere nuove piante.");
                                } else {
                                    openAddEditModal();
                                }
                            }}
                            className="main-button button-purple"
                            title={!userId ? "Effettua il login per aggiungere piante" : ""}
                        >
                            <i className="fas fa-plus-circle"></i> Aggiungi Pianta
                        </button>
                        <button
                            onClick={() => window.open('https://lens.google.com/upload', '_blank')} // Modificato per puntare al form di upload
                            className="main-button button-yellow"
                        >
                            <i className="fas fa-camera"></i> Google Lens
                        </button>
                        {/* Nuovo pulsante per richiamare l'AI */}
                        <button
                            onClick={() => { setShowAiModal(true); setAiResponse(''); setAiQuery(''); }}
                            className="main-button button-orange"
                        >
                            <i className="fas fa-magic"></i> Chiedi all'AI
                        </button>
                        {/* Pulsanti di autenticazione */}
                        {userId ? (
                            <button onClick={handleLogout} className="main-button button-red">
                                <i className="fas fa-sign-out-alt"></i> Logout ({userEmail || 'Ospite'})
                            </button>
                        ) : (
                            <button onClick={() => setShowAuthModal(true)} className="main-button button-orange">
                                <i className="fas fa-user-circle"></i> Login / Registrati
                            </button>
                        )}
                    </div>
                </div>
                {/* Rimosso ID Utente come richiesto */}
            </header>

            {/* Messaggi utente */}
            {message && (
                <div className="alert" role="alert">
                    <span>{message}</span>
                    <span className="alert-close-btn">
                        <svg onClick={() => setMessage('')} className="alert-close-icon" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.197l-2.651 2.652a1.2 1.2 0 1 1-1.697-1.697L8.303 10l-2.652-2.651a1.2 1.2 0 1 1 1.697-1.697L10 8.303l2.651-2.652a1.2 1.2 0 0 1 1.697 1.697L11.697 10l2.652 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </span>
                </div>
            )}

            <main className="main-content">
                {/* Sezione Meteo e Sensore Luce */}
                <section className="info-section-grid">
                    {/* Widget Meteo */}
                    <div className="info-card">
                        <h2 className="info-card-title">Previsioni Meteo</h2>
                        {weatherData ? (
                            <>
                                <p className="weather-temp">{Math.round(weatherData.main.temp)}°C</p>
                                <p className="weather-description">
                                    <i className={`fas ${weatherData.weather[0].icon === '01d' ? 'fa-sun' : weatherData.weather[0].icon === '01n' ? 'fa-moon' : weatherData.weather[0].icon.includes('02') ? 'fa-cloud-sun' : weatherData.weather[0].icon.includes('03') || weatherData.weather[0].icon.includes('04') ? 'fa-cloud' : weatherData.weather[0].icon.includes('09') || weatherData.weather[0].icon.includes('10') ? 'fa-cloud-showers-heavy' : weatherData.weather[0].icon.includes('11') ? 'fa-bolt' : weatherData.weather[0].icon.includes('13') ? 'fa-snowflake' : weatherData.weather[0].icon.includes('50') ? 'fa-smog' : 'fa-cloud'}`}></i> {/* Icona dinamica */}
                                    {' '} {weatherData.weather[0].description}
                                </p>
                                <p className="weather-location">A {weatherData.name}, {weatherData.sys.country}</p>
                                <p className="weather-details">Umidità: {weatherData.main.humidity}% | Vento: {weatherData.wind.speed} m/s</p>
                            </>
                        ) : (
                            <p className="weather-details">Caricamento meteo... Assicurati di aver concesso l'accesso alla geolocalizzazione e che l'API Key sia corretta.</p>
                        )}
                    </div>

                    {/* Sensore Luce / Input manuale */}
                    <div className="info-card light-sensor-card">
                        <h2 className="info-card-title">Misurazione Luce</h2>
                        {/* Componente CameraLuxSensor */}
                        <CameraLuxSensor onLuxChange={setLuxValue} currentLux={luxValue} />

                        <div className="manual-lux-input-section">
                            <h3 className="sensor-title">Inserimento Manuale Lux</h3>
                            <div className="form-group">
                                <label htmlFor="manualLuxInput" className="form-label">Lux attuali:</label>
                                <input
                                    type="number"
                                    id="manualLuxInput"
                                    value={manualLuxInput}
                                    onChange={handleManualLuxChange}
                                    placeholder="Inserisci Lux..."
                                    className="form-input"
                                />
                            </div>
                            <button
                                onClick={applyManualLux}
                                className="form-button submit"
                            >
                                <i className="fas fa-check-circle"></i> Usa Valore Manuale
                            </button>
                        </div>

                        {showLuxFeedback && ( /* Condizionale per mostrare il feedback */
                            <div className="feedback-section">
                                <h3 className="feedback-title">Feedback per le piante:</h3>
                                <ul className="feedback-list">
                                    {plants.map(plant => {
                                        const feedback = getPlantLuxFeedback(plant);
                                        return feedback ? ( // Mostra l'elemento <li> solo se c'è un feedback specifico
                                            <li key={plant.id} className="feedback-item">
                                                {feedback}
                                            </li>
                                        ) : null;
                                    })}
                                    {luxValue === 0 && ( // Messaggio se Lux è 0 (telecamera spenta o errore)
                                        <li className="feedback-item">Avvia la misurazione della fotocamera o inserisci un valore manuale per un feedback sulla luce.</li>
                                    )}
                                    {luxValue > 0 && plants.every(plant => getPlantLuxFeedback(plant) === null) && (
                                        <li className="feedback-item">Nessun feedback specifico disponibile per il valore Lux attuale. Verifica i dati Lux delle piante.</li>
                                    )}
                                </ul>
                                <button
                                    onClick={() => { setLuxValue(0); setManualLuxInput(''); setShowLuxFeedback(false); }} /* Resetta input e nascondi */
                                    className="close-lux-feedback-btn"
                                >
                                    <i className="fas fa-times-circle"></i> Chiudi Feedback
                                </button>
                            </div>
                        )}
                        <p className="light-sensor-note">
                            <i className="fas fa-info-circle"></i>
                            (La misurazione della luce tramite fotocamera è una stima e richiede i permessi del browser. Puoi anche inserire i Lux manualmente.)
                        </p>
                    </div>
                </section>

                {/* Sezione Tutte le Piante */}
                <section ref={allPlantsRef} className={`plant-section ${currentView === 'allPlants' ? 'visible-view' : 'hidden-view'}`}>
                    <h2 className="section-title green">
                        Collezione di Tutte le Piante
                    </h2>
                    <div className="sort-controls">
                        <label htmlFor="sortAllPlants">Ordina per nome:</label>
                        <select id="sortAllPlants" value={sortOrderAllPlants} onChange={(e) => setSortOrderAllPlants(e.target.value)}>
                            <option value="asc">A-Z</option>
                            <option value="desc">Z-A</option>
                        </select>
                    </div>
                    <div className="plant-cards-container">
                        {plants.length > 0 ? (
                            plants.map(plant => (
                                <PlantCard
                                    key={plant.id}
                                    plant={plant}
                                    isMyGardenPlant={false}
                                    onDetailsClick={openPlantModal}
                                    onAddOrRemoveToMyGarden={addPlantToMyGarden}
                                    onUpdatePlant={openAddEditModal}
                                    onDeletePlantPermanently={deletePlantPermanently}
                                />
                            ))
                        ) : (
                            <p className="no-plants-message">Nessuna pianta nella collezione pubblica. Aggiungi la prima!</p>
                        )}
                    </div>
                </section>

                {/* Sezione Mio Giardino */}
                <section ref={myGardenRef} className={`plant-section ${currentView === 'myGarden' ? 'visible-view' : 'hidden-view'}`}>
                    <h2 className="section-title blue">
                        Il Mio Giardino
                    </h2>
                    <div className="sort-controls">
                        <label htmlFor="sortMyGarden">Ordina per nome:</label>
                        <select id="sortMyGarden" value={sortOrderMyGarden} onChange={(e) => setSortOrderMyGarden(e.target.value)}>
                            <option value="asc">A-Z</option>
                            <option value="desc">Z-A</option>
                        </select>
                    </div>
                    <div className="plant-cards-container">
                        {myGardenPlants.length > 0 ? (
                            myGardenPlants.map(plant => (
                                <PlantCard
                                    key={plant.id} // Usa l'ID del documento del giardino personale come chiave
                                    plant={plant}
                                    isMyGardenPlant={true}
                                    onDetailsClick={openPlantModal}
                                    onAddOrRemoveToMyGarden={removePlantFromMyGarden} // In questo caso, rimuovi
                                    onUpdatePlant={openAddEditModal}
                                    onDeletePlantPermanently={deletePlantPermanently} // Ancora disponibile se l'utente è il proprietario originale
                                />
                            ))
                        ) : (
                            <p className="no-plants-message">Il tuo giardino è vuoto. Aggiungi piante dalla collezione pubblica!</p>
                        )}
                    </div>
                </section>
            </main>

            {/* Tasto Scroll to Top */}
            {showScrollToTop && (
                <button
                    onClick={scrollToTop}
                    className="scroll-to-top-button"
                    // Puoi aggiungere stili inline qui per debuggarne la visibilità
                    // Esempio: style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                >
                    ↑
                </button>
            )}

            {/* Modale Dettagli Pianta */}
            {showPlantModal && (
                <PlantDetailsModal plant={selectedPlant} onClose={closePlantModal} />
            )}

            {/* Modale Aggiungi/Modifica Pianta */}
            {showAddEditModal && (
                <AddEditPlantModal
                    plantToEdit={editPlantData}
                    onClose={closeAddEditModal}
                    onSubmit={addOrUpdatePlant}
                />
            )}

            {/* Modale Autenticazione */}
            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onRegister={handleRegister}
                    onLogin={handleLogin}
                />
            )}

            {/* Modale AI Query */}
            {showAiModal && (
                <AiQueryModal
                    onClose={() => setShowAiModal(false)}
                    onQuerySubmit={handleAiQuery}
                    query={aiQuery}
                    setQuery={setAiQuery}
                    response={aiResponse}
                    loading={aiLoading}
                />
            )}
        </div>
    );
};

// Funzione per montare l'applicazione React
const rootElement = document.getElementById('root');
if (rootElement) {
    // Usa React.StrictMode e ReactDOM.createRoot
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("Elemento 'root' non trovato nel DOM. Impossibile montare l'applicazione React.");
}

// Non è necessario export default App; quando si usa type="text/babel" e rendering globale
