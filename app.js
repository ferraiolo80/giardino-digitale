// === CONFIGURAZIONE FIREBASE ===
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAo8HU5vNNm_H-HvxeDa7xSsg3IEmdlE_4",
  authDomain: "giardinodigitale.firebaseapp.com",
  projectId: "giardinodigitale",
  storageBucket: "giardinodigitale.firebasestorage.app",
  messagingSenderId: "96265504027",
  appId: "1:96265504027:web:903c3df92cfa24beb17fbe"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === DATABASE LOCALE E ONLINE ===
let plantsDB = [];
let myGarden = []; // inizializzato vuoto
let gardenVisible = true;

window.onload = async () => {
  const res = await fetch("plants.json");
  plantsDB = await res.json();
  await loadMyGardenOnline();
  renderMyGarden();
  setupToggleGarden();
};

async function loadMyGardenOnline() {
  const snapshot = await getDocs(collection(db, "giardino"));
  myGarden = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function setupToggleGarden() {
  const btn = document.getElementById("toggleGiardino");
  if (btn) {
    btn.onclick = () => {
      gardenVisible = !gardenVisible;
      document.getElementById("giardino").style.display = gardenVisible ? "block" : "none";
      btn.innerText = gardenVisible ? "Nascondi il mio giardino" : "Mostra il mio giardino";
    };
  }
}

function renderMyGarden() {
  const container = document.getElementById("giardino");
  if (!container) return;
  container.innerHTML = "";

  const filter = (document.getElementById("filterInput")?.value || "").toLowerCase();

  myGarden
    .filter(p => p.name.toLowerCase().includes(filter))
    .forEach((plant, index) => {
      container.innerHTML += formatPlantCard(plant, index);
    });
}

function formatPlantCard(plant, index) {
  return `
    <div class="pianta" style="margin-bottom: 1em;">
      <input type="text" value="${plant.name}" onchange="updatePlantField(${index}, 'name', this.value)"><br/>
      <div style="margin-top: 0.5em;">☀️ Luce: <input type="text" value="${plant.sun || "?"}" onchange="updatePlantField(${index}, 'sun', this.value)"></div>
      <div style="margin-top: 0.5em;">💧 Acqua: <input type="text" value="${plant.water || "?"}" onchange="updatePlantField(${index}, 'water', this.value)"></div>
      <div style="margin-top: 0.5em;">🌱 Terreno: <input type="text" value="${plant.soil || "?"}" onchange="updatePlantField(${index}, 'soil', this.value)"></div>
      <button style="margin-top: 0.5em;" onclick='confirmRemoveFromGarden("${plant.id}")'>Rimuovi</button>
    </div>`;
}

async function updatePlantField(index, field, value) {
  if (index >= 0) {
    myGarden[index][field] = value;
    await setDoc(doc(db, "giardino", myGarden[index].id), myGarden[index]);
    renderMyGarden();
  }
}

async function searchPlant() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const container = document.getElementById("risultato");
  document.getElementById("giardino").innerHTML = "";

  // 1. Cerca nel file plants.json
  let match = plantsDB.find(p => p.name.toLowerCase() === query);
  if (match) {
    container.innerHTML = formatPlantCard(match, -1) +
      `<button onclick='addToGarden(${JSON.stringify(match).replace(/'/g, "\\'")})'>Salva nel mio giardino</button>`;
    return;
  }

  // 2. Cerca nel mio giardino (Firebase)
  match = myGarden.find(p => p.name.toLowerCase() === query);
  if (match) {
    container.innerHTML = formatPlantCard(match, -1) +
      `<button onclick='addToGarden(${JSON.stringify(match).replace(/'/g, "\\'")})'>Salva nel mio giardino</button>`;
    return;
  }

  // 3. Usa PlantID se non è stato trovato nulla
  container.innerHTML = "🔍 Cerco online con PlantID...";

  const res = await fetch("https://api.plant.id/v2/identify", {
    method: "POST",
    headers: { "Api-Key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      "organs": ["leaf"],
      "plant_language": "it",
      "plant_details": ["common_names", "watering", "sunlight", "soil_texture"],
      "similar_images": false,
      "images": [],
      "custom_id": "ricerca-nome",
      "latitude": 0,
      "longitude": 0,
      "name": query
    })
  });

  const data = await res.json();
  const suggestion = data?.suggestions?.[0];
  if (!suggestion) {
    container.innerHTML = "❌ Pianta non trovata.";
    return;
  }

  const pianta = {
    name: suggestion.plant_name,
    sun: suggestion.plant_details?.sunlight?.[0] || "non specificato",
    water: suggestion.plant_details?.watering_general_benchmark?.value || "non specificato",
    soil: suggestion.plant_details?.soil_texture?.[0] || "non specificato"
  };

  container.innerHTML = formatPlantCard(pianta, -1) +
    `<button onclick='addToGarden(${JSON.stringify(pianta).replace(/'/g, "\\'")})'>Salva nel mio giardino</button>`;
}

async function addToGarden(plant) {
  if (typeof plant === "string") {
    try {
      plant = JSON.parse(plant);
    } catch (e) {
      console.error("Errore nel parsing della pianta:", e);
      return;
    }
  }

  if (!myGarden.find(p => p.name === plant.name)) {
    const docRef = await addDoc(collection(db, "giardino"), plant);
    plant.id = docRef.id;
    myGarden.push(plant);
    renderMyGarden();
  }

  document.getElementById("risultato").innerHTML = "";
}

function confirmRemoveFromGarden(id) {
  if (confirm("Vuoi davvero rimuovere questa pianta dal tuo giardino?")) {
    removeFromGarden(id);
  }
}

async function removeFromGarden(id) {
  await deleteDoc(doc(db, "giardino", id));
  myGarden = myGarden.filter(p => p.id !== id);
  renderMyGarden();
}

// === IDENTIFICAZIONE FOTO ===
async function identifyPlant() {
  const input = document.getElementById("imageInput");
  if (!input.files.length) return alert("Carica una foto prima!");

  const formData = new FormData();
  formData.append("images", input.files[0]);
  formData.append("similar_images", true);

  const res = await fetch("https://api.plant.id/v2/identify", {
    method: "POST",
    headers: { "Api-Key": API_KEY },
    body: formData
  });

  const data = await res.json();
  const suggestion = data?.suggestions?.[0];
  if (!suggestion) {
    document.getElementById("risultato").innerText = "❌ Nessuna pianta riconosciuta.";
    return;
  }

  const pianta = {
    name: prompt("Nome da visualizzare per questa pianta:", suggestion.plant_name) || suggestion.plant_name,
    sun: suggestion.plant_details?.sunlight?.[0] || "non specificato",
    water: suggestion.plant_details?.watering_general_benchmark?.value || "non specificato",
    soil: suggestion.plant_details?.soil_texture?.[0] || "non specificato"
  };

  const container = document.getElementById("risultato");
  document.getElementById("giardino").innerHTML = "";
  container.innerHTML = formatPlantCard(pianta, -1) +
    `<button onclick='addToGarden(${JSON.stringify(pianta).replace(/'/g, "\\'")})'>Salva nel mio giardino</button>`;
}
