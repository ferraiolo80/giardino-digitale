// Non importare React e ReactDOM da 'react' e 'react-dom' se usi CDN come fatto in index.html
// Li userai come variabili globali React e ReactDOM.

// Funzione di utilità per il debounce
// Spostata fuori dal componente App per essere riutilizzabile e non ricreata ad ogni render
const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
};

// Definizione delle icone generiche per categoria (per la vista "Tutte le Piante")
// Spostata fuori dal componente App
const categoryIcons = {
    'Fiori': '/assets/category_icons/fiori.png',
    'Piante Grasse': '/assets/category_icons/pianta-grassa.png',
    'Piante Erbacee': '/assets/category_icons/piante-erbacee.png',
    'Alberi': '/assets/category_icons/alberi.png',
    'Alberi da Frutto': '/assets/category_icons/alberi-da-frutto.png',
    'Arbusti': '/assets/category_icons/arbusti.png',
    'Succulente': '/assets/category_icons/succulente.png',
    'Ortaggi': '/assets/category_icons/ortaggi.png',
    'Erbe Aromatiche': '/assets/category_icons/erbe-aromatiche.png',
    'Ombra': '/assets/category_icons/shade.png',
    'Mezzombra': '/assets/category_icons/partial-shade.png',
    'Pienosole': '/assets/category_icons/full-sun.png',
    'Pianta': '/assets/category_icons/piante.png' // Icona di default per categorie non mappate
};

// Componente Card Pianta
// Spostato fuori dal componente App
const PlantCard = ({ plant, isMyGardenPlant, onDetailsClick, onAddOrRemoveToMyGarden, onUpdatePlant, onDeletePlantPermanently, userId, myGardenPlants }) => {
    // Controlla se la pianta è nel giardino usando l'ID pubblico
    const isInMyGarden = myGardenPlants.some(p => p.publicPlantId === plant.id);

    // Funzione per generare il percorso dell'icona di categoria
    const getCategoryIconPath = (categoryName) => {
        if (!categoryName) return categoryIcons['Altro'];
        const fileName = categoryName.toLowerCase().replace(/\s/g, '-');
        const iconPath = `/assets/category_icons/${fileName}.png`;
        // Puoi aggiungere una logica per verificare se l'immagine esiste, altrimenti usare un fallback
        return iconPath;
    };

    const imageUrl = plant.image || getCategoryIconPath(plant.category);

    const imageOnError = (e) => {
        e.target.onerror = null; // Evita loop infiniti in caso di errore persistente
        e.target.src = `https://placehold.co/400x300/f0fdf4/16a34a?text=IMMAGINE+NON+TROVATA`;
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
            <p className="plant-card-pot-size">Dimensione Ideale Vaso: {plant.scientificName || 'N/A'}</p>
            <div className="plant-card-description">{plant.description || "Nessuna descrizione disponibile."}</div>

            <div className="card-actions">
                {/* Azioni per collezione pubblica */}
                {!isMyGardenPlant && (
                    <button
                        onClick={() => onAddOrRemoveToMyGarden(plant)} // Passa l'intero oggetto plant
                        className={`card-action-button ${isInMyGarden ? 'in-garden' : 'add-to-garden'}`}
                        disabled={!userId || isInMyGarden} // Disabilita se non loggato o già nel giardino
                    >
                        <i className="fas fa-leaf"></i> {isInMyGarden ? 'Già nel tuo giardino' : 'Aggiungi al mio giardino'}
                    </button>
                )}

                {/* Azioni per "Mio Giardino" */}
                {isMyGardenPlant && (
                    <button
                        onClick={() => onAddOrRemoveToMyGarden(plant.id)} // Rimuovi usando l'ID del documento nel giardino
                        className="card-action-button delete"
                        disabled={!userId} // Disabilita se non loggato
                    >
                        <i className="fas fa-minus-circle"></i> Rimuovi da mio giardino
                    </button>
                )}

                {/* Bottone Aggiorna pianta: Visibile se l'utente è loggato. La logica di autorizzazione è ora in openAddEditModal. */}
                {userId && (
                    <button
                        onClick={() => onUpdatePlant(plant, isMyGardenPlant)} // Passa la pianta e il flag isMyGardenPlant
                        className="card-action-button update"
                    >
                        <i className="fas fa-edit"></i> Aggiorna pianta
                    </button>
                )}

                {/* Bottone Rimuovi definitivamente (solo per l'owner della pianta pubblica) */}
                {plant.ownerId === userId && userId && (
                    <button
                        onClick={() => onDeletePlantPermanently(plant.id)}
                        className="card-action-button delete"
                    >
                        <i className="fas fa-trash-alt"></i> Rimuovi definitivamente
                    </button>
                )}
            </div>
        </div>
    );
};

// Componente Modale Dettagli Pianta
// Spostato fuori dal componente App
const PlantDetailsModal = ({ plant, onClose }) => {
    if (!plant) return null;

    const imageUrl = plant.image || categoryIcons[plant.category] || categoryIcons['Altro'];

    const imageOnError = (e) => {
        e.target.onerror = null;
        e.target.src = `https://placehold.co/600x400/f0fdf4/16a34a?text=IMMAGINE+NON+TROVATA`;
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
                    <p><strong>Dimensione Ideale Vaso:</strong> {plant.scientificName || 'N/A'}</p>
                    <p><strong>Descrizione:</strong> {plant.description || 'Nessuna descrizione.'}</p>
                    <p><strong>Categoria:</strong> {plant.category || 'N/A'}</p>
                    {/* Visualizzazione irrigazione estate */}
                    <p>
                        <strong>Frequenza Irrigazione (Estate):</strong>
                        {plant.wateringValueSummer && plant.wateringUnitSummer
                            ? `${plant.wateringValueSummer} volta/e al ${plant.wateringUnitSummer}`
                            : 'N/A'
                        }
                    </p>
                    {/* Visualizzazione irrigazione inverno */}
                    <p>
                        <strong>Frequenza Irrigazione (Inverno):</strong>
                        {plant.wateringValueWinter && plant.wateringUnitWinter
                            ? `${plant.wateringValueWinter} volta/e al ${plant.wateringUnitWinter}`
                            : 'N/A'
                        }
                    </p>
                    {/* Fallback per il vecchio campo 'watering' se i nuovi campi non esistono */}
                    {(!plant.wateringValueSummer && !plant.wateringValueWinter && plant.watering) && (
                        <p><strong>Frequenza Irrigazione (Generica):</strong> {plant.watering}</p>
                    )}
                    {/* Nuova visualizzazione per Quantità di Luce */}
                    <p><strong>Quantità di Luce:</strong> {plant.lightQuantity || 'N/A'}</p>
                    {/* Nuova visualizzazione per Tipo di Esposizione */}
                    <p><strong>Tipo di Esposizione:</strong> {plant.exposureType || 'N/A'}</p>
                    <p><strong>Luce (Min/Max Lux):</strong> {plant.idealLuxMin || 'N/A'} / {plant.idealLuxMax || 'N/A'}</p>
                    <p><strong>Temperatura (Min/Max °C):</strong> {plant.tempMin || 'N/A'} / {plant.tempMax || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

// Componente Modale Aggiungi/Modifica Pianta
// Spostato fuori dal componente App
const AddEditPlantModal = ({ plantToEdit, onClose, onSubmit }) => {
    const [formData, setFormData] = React.useState({
        name: '',
        scientificName: '', // Campo 'scientificName' ora per Dimensione Ideale Vaso
        description: '',
        image: '', // Campo 'image' per URL
        idealLuxMin: '',
        idealLuxMax: '',
        // Nuovi campi per la frequenza di irrigazione stagionale
        wateringValueSummer: '',
        wateringUnitSummer: 'settimana', // Default unit
        wateringValueWinter: '',
        wateringUnitWinter: 'mese', // Default unit
        // Nuovi campi per la luce
        lightQuantity: '', // Quantità di luce
        exposureType: '',  // Tipo di esposizione
        category: '',
        tempMax: '',
        tempMin: '',
    });
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState('');

    React.useEffect(() => {
        if (plantToEdit) {
            setFormData({
                name: plantToEdit.name || '',
                scientificName: plantToEdit.scientificName || '', // Carica valore esistente
                description: plantToEdit.description || '',
                image: plantToEdit.image || '', // Imposta l'URL esistente in formData
                idealLuxMin: plantToEdit.idealLuxMin || '',
                idealLuxMax: plantToEdit.idealLuxMax || '',
                // Inizializza i nuovi campi di irrigazione. Se la pianta ha il vecchio campo 'watering' (stringa),
                // i nuovi campi saranno vuoti/di default. L'utente dovrà reinserirli.
                wateringValueSummer: plantToEdit.wateringValueSummer !== undefined ? plantToEdit.wateringValueSummer : '',
                wateringUnitSummer: plantToEdit.wateringUnitSummer || 'settimana',
                wateringValueWinter: plantToEdit.wateringValueWinter !== undefined ? plantToEdit.wateringValueWinter : '',
                wateringUnitWinter: plantToEdit.wateringUnitWinter || 'mese',
                // Inizializza i nuovi campi luce. Se la pianta ha il vecchio campo 'sunlight' (stringa),
                // i nuovi campi saranno vuoti/di default. L'utente dovrà reinserirli.
                lightQuantity: plantToEdit.lightQuantity || '',
                exposureType: plantToEdit.exposureType || '',
                category: plantToEdit.category || '',
                tempMax: plantToEdit.tempMax || '',
                tempMin: plantToEdit.tempMin || '',
            });
            setImagePreviewUrl(plantToEdit.image || ''); // Mostra l'anteprima dell'immagine esistente
        } else {
            // Reset per nuova pianta
            setFormData({
                name: '', scientificName: '', description: '', image: '',
                idealLuxMin: '', idealLuxMax: '',
                wateringValueSummer: '', wateringUnitSummer: 'settimana',
                wateringValueWinter: '', wateringUnitWinter: 'mese',
                lightQuantity: '', exposureType: '', // Resetta i nuovi campi luce
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
            name: formData.name,
            scientificName: formData.scientificName,
            description: formData.description,
            image: formData.image, // Questo verrà aggiornato da addOrUpdatePlant
            idealLuxMin: formData.idealLuxMin !== '' ? parseFloat(formData.idealLuxMin) : null,
            idealLuxMax: formData.idealLuxMax !== '' ? parseFloat(formData.idealLuxMax) : null,
            // Nuovi campi numerici per l'irrigazione stagionale
            wateringValueSummer: formData.wateringValueSummer !== '' ? parseFloat(formData.wateringValueSummer) : null,
            wateringUnitSummer: formData.wateringUnitSummer || 'settimana',
            wateringValueWinter: formData.wateringValueWinter !== '' ? parseFloat(formData.wateringValueWinter) : null,
            wateringUnitWinter: formData.wateringUnitWinter || 'mese',
            // Nuovi campi per la luce
            lightQuantity: formData.lightQuantity || null, // Salva null se vuoto
            exposureType: formData.exposureType || null,   // Salva null se vuoto
            category: formData.category,
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
                        <select
                            name="category"
                            id="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="">Seleziona una categoria</option>
                            <option value="Fiori">Fiori</option>
                            <option value="Pianta">Pianta</option>    
                            <option value="Piante Grasse">Piante Grasse</option>
                            <option value="Piante Erbacee">Piante Erbacee</option>
                            <option value="Alberi">Alberi</option>
                            <option value="Alberi da Frutto">Alberi da Frutto</option>
                            <option value="Arbusti">Arbusti</option>
                            <option value="Succulente">Succulente</option>
                            <option value="Ortaggi">Ortaggi</option>
                            <option value="Erbe Aromatiche">Erbe Aromatiche</option>
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

                    {/* Nuovi campi per l'irrigazione estiva */}
                    <div className="form-group">
                        <label htmlFor="wateringValueSummer">Frequenza Irrigazione (Estate)</label>
                        <div className="watering-input-group">
                            <input
                                type="number"
                                name="wateringValueSummer"
                                id="wateringValueSummer"
                                value={formData.wateringValueSummer}
                                onChange={handleChange}
                                placeholder="Valore"
                            />
                            <select
                                name="wateringUnitSummer"
                                id="wateringUnitSummer"
                                value={formData.wateringUnitSummer}
                                onChange={handleChange}
                            >
                                <option value="giorno">volta/e al giorno</option>
                                <option value="settimana">volta/e a settimana</option>
                                <option value="mese">volta/e al mese</option>
                            </select>
                        </div>
                    </div>

                    {/* Nuovi campi per l'irrigazione invernale */}
                    <div className="form-group">
                        <label htmlFor="wateringValueWinter">Frequenza Irrigazione (Inverno)</label>
                        <div className="watering-input-group">
                            <input
                                type="number"
                                name="wateringValueWinter"
                                id="wateringValueWinter"
                                value={formData.wateringValueWinter}
                                onChange={handleChange}
                                placeholder="Valore"
                            />
                            <select
                                name="wateringUnitWinter"
                                id="wateringUnitWinter"
                                value={formData.wateringUnitWinter}
                                onChange={handleChange}
                            >
                                <option value="giorno">volta/e al giorno</option>
                                <option value="settimana">volta/e a settimana</option>
                                <option value="mese">volta/e al mese</option>
                            </select>
                        </div>
                    </div>

                    {/* NUOVI CAMPI PER LA LUCE */}
                    <div className="form-group">
                        <label htmlFor="lightQuantity">Quantità di Luce</label>
                        <select
                            name="lightQuantity"
                            id="lightQuantity"
                            value={formData.lightQuantity}
                            onChange={handleChange}
                        >
                            <option value="">Seleziona</option>
                            <option value="Tanta">Alta</option>
                            <option value="Media">Media</option>
                            <option value="Poca">Bassa</option>
                            <option value="Prevalentemente">Prevalentemente</option>
                            <option value="esclusivamente">Esclusivamente</option>   
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exposureType">Tipo di Esposizione</label>
                        <select
                            name="exposureType"
                            id="exposureType"
                            value={formData.exposureType}
                            onChange={handleChange}
                        >
                            <option value="">Seleziona</option>
                            <option value="Luce Diretta">Luce Diretta</option>
                            <option value="Luce Indiretta">Luce Indiretta</option>
                            <option value="Mezz'ombra">Mezz'ombra</option>
                            <option value="Ombra Totale">Ombra Totale</option>
                            <option value="Sole Pieno">Sole Piene</option>
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

// Componente Modale di Autenticazione
// Spostato fuori dal componente App
const AuthModal = ({ onClose, onRegister, onLogin }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isRegisterMode, setIsRegisterMode] = React.useState(true);

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

// Componente Modale AI Query
// Spostato fuori dal componente App
const AiQueryModal = ({ onClose, onQuerySubmit, query, setQuery, response, loading }) => {
    const handleTextareaChange = React.useCallback((e) => {
        setQuery(e.target.value);
    }, [setQuery]); // Dipendenza da setQuery per useCallback

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="add-edit-modal-title">Chiedi all'AI sulle Piante</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="form-spacing">
                    <div className="form-group">
                        <label htmlFor="aiQuery" className="form-label">Fai la tua domanda, e proverò a risponderti:</label>
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
                            {loading ? 'Caricamento...' : <><i className="fas fa-robot"></i> Ottieni la Risposta</>}
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


const App = () => {
    // Stato per l'applicazione
    const [db, setDb] = React.useState(null);
    const [auth, setAuth] = React.useState(null);
    const [storage, setStorage] = React.useState(null);
    const [userId, setUserId] = React.useState(null);
    const [userEmail, setUserEmail] = React.useState(null);
    const [plants, setPlants] = React.useState([]);
    const [myGardenPlants, setMyGardenPlants] = React.useState([]);
    const [currentView, setCurrentView] = React.useState('allPlants');
    const [showPlantModal, setShowPlantModal] = React.useState(false);
    const [selectedPlant, setSelectedPlant] = React.useState(null);
    const [showAddEditModal, setShowAddEditModal] = React.useState(false);
    const [editPlantData, setEditPlantData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [message, setMessage] = React.useState('');
    const [luxValue, setLuxValue] = React.useState('');
    const [userLocation, setUserLocation] = React.useState(null);
    const [weatherData, setWeatherData] = React.useState(null);
    const [weatherApiKey, setWeatherApiKey] = React.useState('0575afa377367478348aa48bfc9936ba'); // <-- INSERISCI QUI LA TUA API KEY DI OPENWEATHERMAP
    const [showScrollToTop, setShowScrollToTop] = React.useState(false);
    const [showLuxFeedback, setShowLuxFeedback] = React.useState(false);
    const [showAuthModal, setShowAuthModal] = React.useState(false);

    const [showAiModal, setShowAiModal] = React.useState(false);
    const [aiQuery, setAiQuery] = React.useState('');
    const [aiResponse, setAiResponse] = React.useState('');
    const [aiLoading, setAiLoading] = React.useState(false);

    // NUOVI STATI PER L'AGGIORNAMENTO DEL SERVICE WORKER
    const [showUpdatePrompt, setShowUpdatePrompt] = React.useState(false);
    const [waitingWorker, setWaitingWorker] = React.useState(null);

    const allPlantsRef = React.useRef(null);
    const myGardenRef = React.useRef(null);

    const firebaseConfig = {
        apiKey: "AIzaSyAo8HU5vNNm_H-HvxeDa7xSsg3IEmdlE_4",
        authDomain: "giardinodigitale.firebaseapp.com",
        projectId: "giardinodigitale",
        storageBucket: "giardinodigitale.firebasestorage.app",
        appId: "1:96265504027:web:903c3df92cfa24beb17fbe"
    };

    React.useEffect(() => {
        try {
            const app = firebase.initializeApp(firebaseConfig);
            const firestore = firebase.firestore(app);
            const firebaseAuth = firebase.auth(app);
            const firebaseStorage = firebase.storage(app);

            setDb(firestore);
            setAuth(firebaseAuth);
            setStorage(firebaseStorage);

            const unsubscribeAuth = firebaseAuth.onAuthStateChanged(async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setUserEmail(user.email || 'Utente Autenticato');
                    console.log("ID Utente corrente:", user.uid, "Email:", user.email);
                    setLoading(false);
                } else {
                    setUserId(null);
                    setUserEmail(null);
                    console.log("Utente non autentato. Si prega di effettuare il login.");
                    setLoading(false);
                }
            });

            // LOGICA PER L'AGGIORNAMENTO DEL SERVICE WORKER
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // Nuovo Service Worker installato e in attesa
                                    setWaitingWorker(newWorker);
                                    setShowUpdatePrompt(true);
                                    setMessage("È disponibile una nuova versione dell'app! Clicca su 'Aggiorna ora' per installarla.");
                                }
                            });
                        }
                    });
                });
            }


            return () => unsubscribeAuth();
        } catch (error) {
            console.error("Errore nell'inizializzazione di Firebase:", error);
            setMessage("Errore grave nell'inizializzazione dell'app.");
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Funzione per forzare l'aggiornamento dell'app
    const updateApp = React.useCallback(() => {
        if (waitingWorker) {
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload(); // Ricarica la pagina per applicare la nuova versione
        }
    }, [waitingWorker]);


    // Fetch e listener per le piante della collezione pubblica ('plants')
    React.useEffect(() => {
        if (!db) return;

        const plantsCollectionRef = db.collection('plants');
        const unsubscribe = plantsCollectionRef.onSnapshot((snapshot) => {
            const plantsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Firestore (plants) data received:", plantsData);
            setPlants(plantsData);
        }, (error) => {
            console.error("Errore nel recupero delle piante pubbliche:", error);
            setMessage("Errore nel caricamento delle piante di tutti.");
        });

        return () => unsubscribe();
    }, [db]);

    // Fetch e listener per le piante del mio giardino ('users/{userId}/gardens')
    React.useEffect(() => {
        if (!db || !userId) {
            setMyGardenPlants([]); // Pulisci il giardino se non c'è utente
            return;
        }

        const myGardenCollectionRef = db.collection(`users/${userId}/gardens`);
        const unsubscribe = myGardenCollectionRef.onSnapshot((snapshot) => {
            const myGardenData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isMyGardenPlant: true
            }));
            console.log("Firestore (myGardenPlants) data received:", myGardenData);
            setMyGardenPlants(myGardenData);
        }, (error) => {
            console.error("Errore nel recupero delle piante del mio giardino:", error);
            setMessage("Errore nel caricamento delle piante del tuo giardino.");
        });

        return () => unsubscribe();
    }, [db, userId]);

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
                    setWeatherData(null);
                }
            };
            fetchWeather();
        } else if (userLocation && weatherApiKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
            setMessage("Ricorda di inserire la tua API Key di OpenWeatherMap per vedere le previsioni meteo!");
        }
    }, [userLocation, weatherApiKey]);

    const handleScroll = () => {
        if (window.pageYOffset > 300) {
            setShowScrollToTop(true);
        } else {
            setShowScrollToTop(false);
        }
    };

    React.useEffect(() => {
        if (luxValue === '') {
            setShowLuxFeedback(false);
        } else {
            setShowLuxFeedback(true);
        }
    }, [luxValue]);

    React.useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const scrollToAllPlants = () => {
        setCurrentView('allPlants');
        allPlantsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToMyGarden = () => {
        if (!userId) {
            setMessage("Devi essere loggato per visualizzare il tuo giardino.");
            return;
        }
        setCurrentView('myGarden');
        myGardenRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const openPlantModal = React.useCallback((plant) => {
        setSelectedPlant(plant);
        setShowPlantModal(true);
    }, []);

    const closePlantModal = React.useCallback(() => {
        setShowPlantModal(false);
        setSelectedPlant(null);
    }, []);

    // Modificata la logica per gestire i permessi prima di aprire la modale
    const openAddEditModal = React.useCallback((plantToEdit = null, isMyGardenPlant = false) => {
        if (!userId) {
            setMessage("Devi essere loggato per modificare le piante.");
            return;
        }

        // Se è una pianta pubblica e l'utente non è il proprietario, mostra messaggio di non autorizzazione
        if (plantToEdit && !isMyGardenPlant && plantToEdit.ownerId !== userId) {
            setMessage("Non sei autorizzato a modificare questa pianta pubblica.");
            return;
        }

        setEditPlantData(plantToEdit);
        setShowAddEditModal(true);
    }, [userId]); // Aggiunto userId nelle dipendenze


    const closeAddEditModal = React.useCallback(() => {
        setShowAddEditModal(false);
        setEditPlantData(null);
    }, []);

    const addOrUpdatePlant = React.useCallback(async (plantData, originalPlantObject = null, imageFile = null) => {
        if (!db || !userId || !storage) {
            setMessage("Errore: Utente non autentato. Si prega di effettuare il login per aggiungere/modificare piante.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setMessage('');

        let imageUrl = plantData.image;

        if (imageFile) {
            try {
                const storageRef = storage.ref();
                const imageRef = storageRef.child(`plant_images/${userId}/${imageFile.name}_${Date.now()}`);
                const snapshot = await imageRef.put(imageFile);
                imageUrl = await snapshot.ref.getDownloadURL();
                setMessage("Immagine caricata con successo!");
            } catch (error) {
                console.error("Errore durante il caricamento dell'immagine:", error);
                setMessage("Errore durante il caricamento dell'immagine. Riprova.");
                setLoading(false);
                return;
            }
        } else if (originalPlantObject && !imageFile && !plantData.image) {
            imageUrl = ''; // Clear image if it was explicitly removed
        } else if (originalPlantObject && !imageFile && originalPlantObject.image) {
            imageUrl = originalPlantObject.image; // Keep existing image if no new file and not cleared
        }

        // Base data for the plant
        const basePlantData = {
            name: plantData.name,
            scientificName: plantData.scientificName,
            description: plantData.description,
            image: imageUrl,
            idealLuxMin: plantData.idealLuxMin,
            idealLuxMax: plantData.idealLuxMax,
            wateringValueSummer: plantData.wateringValueSummer,
            wateringUnitSummer: plantData.wateringUnitSummer,
            wateringValueWinter: plantData.wateringValueWinter,
            wateringUnitWinter: plantData.wateringUnitWinter,
            lightQuantity: plantData.lightQuantity,
            exposureType: plantData.exposureType,
            category: plantData.category,
            tempMax: plantData.tempMax,
            tempMin: plantData.tempMin,
        };

        // Prepare the final data to send to Firestore
        let finalDataForFirestore = { ...basePlantData };

        // If it's an update, explicitly delete old fields if they exist in the original object
        // This ensures a clean migration to the new schema.
        if (originalPlantObject) {
            if (originalPlantObject.watering !== undefined) {
                finalDataForFirestore.watering = firebase.firestore.FieldValue.delete();
            }
            if (originalPlantObject.sunlight !== undefined) {
                finalDataForFirestore.sunlight = firebase.firestore.FieldValue.delete();
            }
        } else {
            // Add ownerId and createdAt only for new plants
            finalDataForFirestore.ownerId = userId;
            finalDataForFirestore.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        }


        try {
            const plantIdToOperate = originalPlantObject ? originalPlantObject.id : null;
            const isEditingMyGardenPlant = originalPlantObject && myGardenPlants.some(p => p.id === originalPlantObject.id);

            if (plantIdToOperate && isEditingMyGardenPlant) {
                // Update plant in user's garden
                const myGardenDocRef = db.collection(`users/${userId}/gardens`).doc(plantIdToOperate);
                await myGardenDocRef.set(finalDataForFirestore, { merge: true });
                setMessage("Pianta nel tuo giardino aggiornata con successo!");

                // Also update the public plant if the user is the owner
                const publicPlantId = originalPlantObject.publicPlantId || plantIdToOperate;
                const publicPlantDocRef = db.collection('plants').doc(publicPlantId);
                const publicPlantSnap = await publicPlantDocRef.get();

                if (publicPlantSnap.exists && publicPlantSnap.data().ownerId === userId) {
                    await publicPlantDocRef.update(finalDataForFirestore);
                    setMessage(prev => prev + " e anche la versione pubblica!");
                }

            } else if (plantIdToOperate) {
                // This branch handles updates to public plants directly (if not in my garden, or if it's the original public plant)
                const publicPlantDocRef = db.collection('plants').doc(plantIdToOperate);
                const publicPlantSnap = await publicPlantDocRef.get();

                if (publicPlantSnap.exists && publicPlantSnap.data().ownerId === userId) {
                    await publicPlantDocRef.update(finalDataForFirestore);
                    setMessage("Pianta pubblica aggiornata con successo!");

                    // If the public plant is also in the user's garden, update that copy too
                    const myGardenDocRef = db.collection(`users/${userId}/gardens`).doc(plantIdToOperate);
                    const myGardenDocSnap = await myGardenDocRef.get();
                    if (myGardenDocSnap.exists) {
                        await myGardenDocRef.update(finalDataForFirestore);
                        setMessage(prev => prev + " e la copia nel tuo giardino.");
                    }
                } else {
                    setMessage("Non hai i permessi per modificare questa pianta pubblica.");
                }

            } else {
                // Add new plant to public collection
                const plantsCollectionRef = db.collection('plants');
                await plantsCollectionRef.add(finalDataForFirestore); // No FieldValue.delete() for new docs
                setMessage("Nuova pianta aggiunta alla collezione pubblica con successo!");
            }
            closeAddEditModal();
        } catch (error) {
            console.error("Errore durante l'aggiunta/aggiornamento della pianta:", error);
            setMessage(`Errore: ${originalPlantObject ? 'aggiornamento' : 'aggiunta'} pianta fallito.`);
        } finally {
            setLoading(false);
        }
    }, [db, userId, storage, closeAddEditModal, myGardenPlants]);

    const deletePlantPermanently = React.useCallback(async (plantId) => {
        if (!db || !userId) {
            setMessage("Errore: Utente non autentato. Si prega di effettuare il login per eliminare piante.");
            return;
        }

        const confirmDelete = await new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
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
            // Ottieni la pianta per verificare l'ownerId prima di eliminare
            const plantDocRef = db.collection('plants').doc(plantId);
            const plantSnap = await plantDocRef.get();

            if (plantSnap.exists && plantSnap.data().ownerId === userId) {
                await plantDocRef.delete();
                setMessage("Pianta eliminata definitivamente dalla collezione pubblica!");

                // Rimuovi tutte le referenze a questa pianta dal "My Garden" di tutti gli utenti
                const usersCollectionRef = db.collection('users');
                const usersSnapshot = await usersCollectionRef.get();

                for (const userDoc of usersSnapshot.docs) {
                    const currentUserId = userDoc.id;
                    const myGardenCollectionRef = db.collection(`users/${currentUserId}/gardens`);
                    // Cerca le piante nel giardino che hanno publicPlantId uguale all'ID della pianta pubblica eliminata
                    const q = myGardenCollectionRef.where("publicPlantId", "==", plantId);
                    const gardenPlantsSnapshot = await q.get();

                    for (const gardenDoc of gardenPlantsSnapshot.docs) {
                        await gardenDoc.ref.delete();
                    }
                }
            } else {
                setMessage("Non hai i permessi per eliminare definitivamente questa pianta pubblica.");
                console.warn("Tentativo di eliminare pianta pubblica non propria:", plantId);
            }
        } catch (error) {
            console.error("Errore durante l'eliminazione definitiva della pianta:", error);
            setMessage("Errore: eliminazione definitiva della pianta fallita.");
        } finally {
            setLoading(false);
        }
    }, [db, userId]);

    const addPlantToMyGarden = React.useCallback(async (plant) => {
        if (!db || !userId) {
            setMessage("Errore: Utente non autentato. Si prega di effettuare il login per aggiungere piante al giardino.");
            return;
        }
        setLoading(true);
        setMessage('');

        try {
            const myGardenDocRef = db.collection(`users/${userId}/gardens`).doc(plant.id);
            const docSnap = await myGardenDocRef.get();

            if (!docSnap.exists) {
                // Create a new object for the garden plant data
                const plantDataForGarden = {
                    ...plant, // Copy all existing fields from the public plant
                    publicPlantId: plant.id, // Store the public plant ID
                    dateAdded: firebase.firestore.FieldValue.serverTimestamp(),
                };

                // Explicitly remove the old 'watering' and 'sunlight' fields if they exist in the source object
                // This ensures they are not copied into the new garden document
                delete plantDataForGarden.watering;
                delete plantDataForGarden.sunlight;

                await myGardenDocRef.set(plantDataForGarden); // Use set() for new document creation
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

        const confirmRemove = await new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
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
            await db.collection(`users/${userId}/gardens`).doc(plantId).delete();
            setMessage("Pianta rimossa dal tuo giardino!");
        } catch (error) {
            console.error("Errore nella rimozione dal mio giardino:", error);
            setMessage("Errore: rimozione dal giardino fallita.");
        } finally {
            setLoading(false);
        }
    }, [db, userId]);

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

    const handleLuxChange = React.useCallback((e) => {
        setLuxValue(e.target.value);
    }, []);

    const getPlantLuxFeedback = React.useCallback((plant) => {
        const lux = parseFloat(luxValue);
        if (isNaN(lux) || !plant.idealLuxMin || !plant.idealLuxMax) {
            return null;
        }

        if (lux < plant.idealLuxMin) {
            return `Poca luce per la ${plant.name} (minimo ${plant.idealLuxMin} Lux)`;
        } else if (lux > plant.idealLuxMax) {
            return `Troppa luce per la ${plant.name} (massimo ${plant.idealLuxMax} Lux)`;
        } else {
            return `Luce ottimale per la ${plant.name}!`;
        }
    }, [luxValue]);

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
            const apiKey = ""; // Lascia vuoto, l'API key sarà fornita dall'ambiente Canvas
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
                        <button
                            onClick={() => {
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
                            onClick={() => window.open('https://lens.google.com/upload', '_blank')}
                            className="main-button button-yellow"
                        >
                            <i className="fas fa-camera"></i> Google Lens
                        </button>
                        <button
                            onClick={() => { setShowAiModal(true); setAiResponse(''); setAiQuery(''); }}
                            className="main-button button-orange"
                        >
                            <i className="fas fa-magic"></i> Chiedi all'AI
                        </button>
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
                    {userId && ( // Mostra l'ID utente e l'email solo se loggato
                        <div className="user-id-display">
                            ID Utente: {userId} <br/>
                            Email: {userEmail || 'N/A'}
                        </div>
                    )}
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

            {/* Banner di aggiornamento Service Worker */}
            {showUpdatePrompt && (
                <div className="alert" role="alert" style={{ backgroundColor: '#d1fae5', borderColor: '#34d399', color: '#065f46', marginTop: '1rem' }}>
                    <span>È disponibile una nuova versione dell'app!</span>
                    <button
                        onClick={updateApp}
                        className="form-button submit"
                        style={{ backgroundColor: '#10b981', color: 'white', marginLeft: '1rem', padding: '0.5rem 1rem' }}
                    >
                        <i className="fas fa-sync-alt"></i> Aggiorna ora
                    </button>
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
                        <h2 className="info-card-title">Valutazione Luce</h2>
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
                                    {(!luxValue || isNaN(parseFloat(luxValue))) && (
                                        <li className="feedback-item">Inserisci un valore Lux per un feedback.</li>
                                    )}
                                    {luxValue && !isNaN(parseFloat(luxValue)) && plants.every(plant => getPlantLuxFeedback(plant) === null) && (
                                        <li className="feedback-item">Nessun feedback specifico disponibile. Verifica i dati Lux delle piante.</li>
                                    )}
                                </ul>
                                <button
                                    onClick={() => { setLuxValue(''); setShowLuxFeedback(false); }} /* Resetta input e nascondi */
                                    className="close-lux-feedback-btn"
                                >
                                    <i className="fas fa-times-circle"></i> Chiudi Feedback
                                </button>
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
                                    userId={userId}
                                    myGardenPlants={myGardenPlants} // Passa myGardenPlants per controllare isInMyGarden
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
                                    userId={userId}
                                    myGardenPlants={myGardenPlants} // Passa myGardenPlants
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
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("Elemento 'root' non trovato nel DOM. Impossibile montare l'applicazione React.");
}
