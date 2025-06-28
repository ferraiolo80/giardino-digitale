// Non importare React e ReactDOM da 'react' e 'react-dom' se usi CDN come fatto in index.html
// Li userai come variabili globali React e ReactDOM.

const App = () => {
    // Stato per l'applicazione
    const [db, setDb] = React.useState(null);
    const [auth, setAuth] = React.useState(null);
    const [userId, setUserId] = React.useState(null);
    const [plants, setPlants] = React.useState([]); // Tutte le piante (collezione pubblica)
    const [myGardenPlants, setMyGardenPlants] = React.useState([]); // Le piante nel mio giardino
    const [currentView, setCurrentView] = React.useState('allPlants'); // 'allPlants' o 'myGarden'
    const [showPlantModal, setShowPlantModal] = React.useState(false);
    const [selectedPlant, setSelectedPlant] = React.useState(null);
    const [showAddEditModal, setShowAddEditModal] = React.useState(false);
    const [editPlantData, setEditPlantData] = React.useState(null); // Per l'editing di una pianta esistente
    const [loading, setLoading] = React.useState(true);
    const [message, setMessage] = React.useState(''); // Per messaggi utente
    const [luxValue, setLuxValue] = React.useState(''); // Valore input lux
    const [userLocation, setUserLocation] = React.useState(null); // { lat, lon } per il meteo
    const [weatherData, setWeatherData] = React.useState(null); // Dati meteo
    const [weatherApiKey, setWeatherApiKey] = React.useState('0575afa377367478348aa48bfc9936ba'); // <-- INSERISCI QUI LA TUA API KEY DI OPENWEATHERMAP
    const [showScrollToTop, setShowScrollToTop] = React.useState(false); // Stato per il tasto "scroll to top"

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

            setDb(firestore);
            setAuth(firebaseAuth);

            // Listener per lo stato di autenticazione
            const unsubscribeAuth = firebaseAuth.onAuthStateChanged(async (user) => { // Usa firebaseAuth.onAuthStateChanged
                if (user) {
                    setUserId(user.uid);
                    setLoading(false);
                } else {
                    // Se non autenticato con un token, tenta l'accesso anonimo
                    try {
                        const { user: anonymousUser } = await firebaseAuth.signInAnonymously(); // Usa firebaseAuth.signInAnonymously()
                        setUserId(anonymousUser.uid);
                        setLoading(false);
                    } catch (error) {
                        console.error("Errore nell'accesso anonimo:", error);
                        setMessage("Errore nell'autenticazione. Riprova.");
                        setLoading(false);
                    }
                }
            });

            // Nota: __initial_auth_token non è disponibile in un ambiente React standard senza Canvas
            // Per test locali, l'autenticazione anonima verrà usata.

            return () => unsubscribeAuth(); // Pulizia del listener
        } catch (error) {
            console.error("Errore nell'inizializzazione di Firebase:", error);
            setMessage("Errore grave nell'inizializzazione dell'app.");
            setLoading(false);
        }
    }, []);

    // Fetch e listener per le piante della collezione pubblica ('plants')
    React.useEffect(() => {
        if (!db) return;

        // Usa db.collection() invece di collection(db, ...)
        const plantsCollectionRef = db.collection('plants');
        const unsubscribe = plantsCollectionRef.onSnapshot((snapshot) => {
            const plantsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPlants(plantsData);
        }, (error) => {
            console.error("Errore nel recupero delle piante pubbliche:", error);
            setMessage("Errore nel caricamento delle piante di tutti.");
        });

        return () => unsubscribe();
    }, [db]);

    // Fetch e listener per le piante del mio giardino ('users/{userId}/gardens')
    React.useEffect(() => {
        if (!db || !userId) return;

        const myGardenCollectionRef = db.collection(`users/${userId}/gardens`); // Usa db.collection()
        const unsubscribe = myGardenCollectionRef.onSnapshot((snapshot) => {
            // Semplicemente prendi i dati come sono e aggiungi il flag isMyGardenPlant
            const myGardenData = snapshot.docs.map(doc => ({
                id: doc.id, // ID del documento nel giardino personale
                ...doc.data(),
                isMyGardenPlant: true // Indica che è una pianta del giardino personale
            }));
            setMyGardenPlants(myGardenData);
        }, (error) => {
            console.error("Errore nel recupero delle piante del mio giardino:", error);
            setMessage("Errore nel caricamento delle piante del tuo giardino.");
        });

        return () => unsubscribe();
    }, [db, userId]); // Non dipende più da 'plants' qui per la visualizzazione

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
        setCurrentView('myGarden');
        myGardenRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Gestione Modale Pianta
    const openPlantModal = React.useCallback((plant) => {
        setSelectedPlant(plant);
        setShowPlantModal(true);
    }, []);

    const closePlantModal = React.useCallback(() => {
        setShowPlantModal(false);
        setSelectedPlant(null);
    }, []);

    // Gestione Modale Aggiungi/Modifica Pianta
    const openAddEditModal = React.useCallback((plantToEdit = null) => {
        setEditPlantData(plantToEdit);
        setShowAddEditModal(true);
    }, []);

    const closeAddEditModal = React.useCallback(() => {
        setShowAddEditModal(false);
        setEditPlantData(null);
    }, []);

    // Funzioni CRUD per le piante (Collezione Pubblica)
    const addOrUpdatePlant = React.useCallback(async (plantData, plantId = null) => {
        if (!db || !userId) {
            setMessage("Errore: Utente non autenticato o app non inizializzata.");
            return;
        }
        setLoading(true);
        setMessage('');

        try {
            const plantsCollectionRef = db.collection('plants'); // Usa db.collection()
            if (plantId) {
                // Aggiorna pianta esistente
                await plantsCollectionRef.doc(plantId).update(plantData); // Usa .doc().update()
                setMessage("Pianta aggiornata con successo!");
            } else {
                // Aggiungi nuova pianta
                await plantsCollectionRef.add({ ...plantData, ownerId: userId, createdAt: firebase.firestore.FieldValue.serverTimestamp() }); // Usa .add() e FieldValue
                setMessage("Pianta aggiunta con successo!");
            }
            closeAddEditModal();
        } catch (error) {
            console.error("Errore durante l'aggiunta/aggiornamento della pianta:", error);
            setMessage(`Errore: ${plantId ? 'aggiornamento' : 'aggiunta'} pianta fallito.`);
        } finally {
            setLoading(false);
        }
    }, [db, userId, closeAddEditModal]);

    const deletePlantPermanently = React.useCallback(async (plantId) => {
        if (!db || !userId) {
            setMessage("Errore: Utente non autenticato o app non inizializzata.");
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
                        <button id="confirmBtn" class="form-button submit" style="background-color: #ef4444; margin-right: 0.5rem;">Sì, elimina</button>
                        <button id="cancelBtn" class="form-button cancel">Annulla</button>
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
            setMessage("Errore: Utente non autenticato o app non inizializzata.");
            return;
        }
        setLoading(true);
        setMessage('');

        try {
            const myGardenCollectionRef = db.collection(`users/${userId}/gardens`); // Usa db.collection()
            // Controlla se la pianta (tramite il suo ID pubblico) è già nel giardino
            const q = myGardenCollectionRef.where("publicPlantId", "==", plant.id); // Usa .where()
            const existingDocs = await q.get(); // Usa .get()

            if (existingDocs.empty) {
                // Copia tutti i dati della pianta pubblica nel giardino dell'utente,
                // e aggiungi publicPlantId per riferimento all'originale
                await myGardenCollectionRef.add({ // Usa .add()
                    ...plant, // Copia tutti i campi della pianta pubblica
                    publicPlantId: plant.id, // Aggiungi l'ID della pianta pubblica come riferimento
                    dateAdded: firebase.firestore.FieldValue.serverTimestamp(), // Usa FieldValue
                    // ownerId: userId, // L'owner della copia nel giardino è l'utente attuale (opzionale se già incluso in 'plant')
                    // createdAt: plant.createdAt // Puoi mantenere il createdAt originale o usare un nuovo timestamp
                });
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
            setMessage("Errore: Utente non autenticato o app non inizializzata.");
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
                        <button id="confirmBtn" class="form-button submit" style="background-color: #ef4444; margin-right: 0.5rem;">Sì, rimuovi</button>
                        <button id="cancelBtn" class="form-button cancel">Annulla</button>
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
            const myGardenCollectionRef = db.collection(`users/${userId}/gardens`); // Usa db.collection()
            const q = myGardenCollectionRef.where("publicPlantId", "==", plantId); // Ora cerca per publicPlantId
            const docsToDelete = await q.get(); // Usa .get()

            if (!docsToDelete.empty) {
                docsToDelete.forEach(async (docSnap) => {
                    await docSnap.ref.delete(); // Usa .ref.delete()
                });
                setMessage("Pianta rimossa dal tuo giardino!");
            } else {
                setMessage("Questa pianta non è nel tuo giardino.");
            }
        } catch (error) {
            console.error("Errore nella rimozione dal mio giardino:", error);
            setMessage("Errore: rimozione dal giardino fallita.");
        } finally {
            setLoading(false);
        }
    }, [db, userId]);

    // Gestione input Lux e feedback piante
    const handleLuxChange = React.useCallback((e) => {
        setLuxValue(e.target.value);
    }, []);

    const getPlantLuxFeedback = React.useCallback((plant) => {
        const lux = parseFloat(luxValue);
        if (isNaN(lux) || !plant.idealLuxMin || !plant.idealLuxMax) {
            return "Inserisci un valore Lux per un feedback.";
        }

        if (lux < plant.idealLuxMin) {
            return `Poca luce per la ${plant.name} (minimo ${plant.idealLuxMin} Lux)`;
        } else if (lux > plant.idealLuxMax) {
            return `Troppa luce per la ${plant.name} (massimo ${plant.idealLuxMax} Lux)`;
        } else {
            return `Luce ottimale per la ${plant.name}!`;
        }
    }, [luxValue]);

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
                />
                <h3 className="plant-card-title">{plant.name}</h3>
                <p className="plant-card-scientific-name">{plant.scientificName}</p>
                <div className="plant-card-description">{plant.description || "Nessuna descrizione disponibile."}</div>

                <div className="card-actions">
                    {/* Azioni per collezione pubblica */}
                    {!isMyGardenPlant && (
                        <>
                            <button
                                onClick={() => onAddOrRemoveToMyGarden(plant)} // Passa l'intero oggetto plant
                                className={`card-action-button ${isInMyGarden ? 'in-garden' : 'add-to-garden'}`}
                            >
                                {isInMyGarden ? 'Già nel tuo giardino' : 'Aggiungi al mio giardino'}
                            </button>
                            <button
                                onClick={() => onUpdatePlant(plant)}
                                className="card-action-button update"
                            >
                                Aggiorna pianta
                            </button>
                            {/* Mostra "Rimuovi definitivamente" solo se l'utente è quello che l'ha aggiunta */}
                            {plant.ownerId === userId && (
                                <button
                                    onClick={() => onDeletePlantPermanently(plant.id)}
                                    className="card-action-button delete"
                                >
                                    Rimuovi definitivamente
                                </button>
                            )}
                        </>
                    )}

                    {/* Azioni per "Mio Giardino" */}
                    {isMyGardenPlant && (
                        <>
                            <button
                                onClick={() => onAddOrRemoveToMyGarden(plant.publicPlantId)} // Rimuovi usando l'ID pubblico di riferimento
                                className="card-action-button delete"
                            >
                                Rimuovi da mio giardino
                            </button>
                            <button
                                onClick={() => onUpdatePlant(plant)}
                                className="card-action-button update"
                            >
                                Aggiorna pianta
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
                        <p><strong>Nome Scientifico:</strong> {plant.scientificName || 'N/A'}</p>
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
            scientificName: '',
            description: '',
            image: '', // Campo 'image' invece di 'imageUrl'
            idealLuxMin: '', // Campo 'idealLuxMin'
            idealLuxMax: '', // Campo 'idealLuxMax'
            watering: '', // Campo 'watering'
            sunlight: '', // Campo 'sunlight'
            category: '', // Nuovo campo 'category'
            tempMax: '', // Nuovo campo 'tempMax'
            tempMin: '', // Nuovo campo 'tempMin'
        });

        React.useEffect(() => {
            if (plantToEdit) {
                setFormData({
                    name: plantToEdit.name || '',
                    scientificName: plantToEdit.scientificName || '',
                    description: plantToEdit.description || '',
                    image: plantToEdit.image || '',
                    idealLuxMin: plantToEdit.idealLuxMin || '',
                    idealLuxMax: plantToEdit.idealLuxMax || '',
                    watering: plantToEdit.watering || '',
                    sunlight: plantToEdit.sunlight || '',
                    category: plantToEdit.category || '',
                    tempMax: plantToEdit.tempMax || '',
                    tempMin: plantToEdit.tempMin || '',
                });
            } else {
                setFormData({
                    name: '', scientificName: '', description: '', image: '',
                    idealLuxMin: '', idealLuxMax: '', watering: '', sunlight: '',
                    category: '', tempMax: '', tempMin: '',
                });
            }
        }, [plantToEdit]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
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
            onSubmit(dataToSend, plantToEdit ? plantToEdit.id : null);
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
                            <label htmlFor="scientificName">Nome Scientifico</label>
                            <input
                                type="text"
                                name="scientificName"
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
                        <div className="form-group">
                            <label htmlFor="image">URL Immagine</label>
                            <input
                                type="url"
                                name="image"
                                id="image"
                                value={formData.image}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Categoria</label>
                            <input
                                type="text"
                                name="category"
                                id="category"
                                value={formData.category}
                                onChange={handleChange}
                            />
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
                                Annulla
                            </button>
                            <button
                                type="submit"
                                className="form-button submit"
                            >
                                {plantToEdit ? 'Salva Modifiche' : 'Aggiungi Pianta'}
                            </button>
                        </div>
                    </form>
                </div>
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
                            Mostra Piante di Tutti
                        </button>
                        <button
                            onClick={scrollToMyGarden}
                            className="main-button button-blue"
                        >
                            Mostra il Mio Giardino
                        </button>
                        <button
                            onClick={() => openAddEditModal()}
                            className="main-button button-purple"
                        >
                            Aggiungi Pianta
                        </button>
                        <button
                            onClick={() => window.open('https://lens.google/', '_blank')} // Placeholder per Google Lens
                            className="main-button button-yellow"
                        >
                            Identifica
                        </button>
                    </div>
                </div>
                <div className="user-id-display">
                    {userId && `ID Utente: ${userId}`}
                </div>
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
                                <p className="weather-description">{weatherData.weather[0].description}</p>
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
                        <div className="form-group">
                            <label htmlFor="luxInput" className="form-label">Lux attuali (inserimento manuale):</label>
                            <input
                                type="number"
                                id="luxInput"
                                value={luxValue}
                                onChange={handleLuxChange}
                                placeholder="Inserisci Lux..."
                                className="form-input"
                            />
                        </div>
                        {luxValue && (
                            <div className="feedback-section">
                                <h3 className="feedback-title">Feedback per le piante:</h3>
                                <ul className="feedback-list">
                                    {plants.map(plant => (
                                        <li key={plant.id} className="feedback-item">
                                            {getPlantLuxFeedback(plant)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <p className="light-sensor-note">
                            <i className="fas fa-info-circle"></i>
                            (Funzionalità sensore luce automatica dipende dal supporto del browser e del dispositivo. Per ora solo input manuale.)
                        </p>
                    </div>
                </section>

                {/* Sezione Tutte le Piante */}
                <section ref={allPlantsRef} className={`plant-section ${currentView === 'allPlants' ? 'visible-view' : 'hidden-view'}`}>
                    <h2 className="section-title green">
                        Collezione di Tutte le Piante
                    </h2>
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
