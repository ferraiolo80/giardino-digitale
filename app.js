// Funzioni per mostrare/nascondere il loader
function showLoader() {
  document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
}

let plants = [];
let myGarden = [];

async function loadPlants() {
  try {
    const response = await fetch("plants.json");
    plants = await response.json();
  } catch (error) {
    console.error("Errore nel caricamento di plants.json:", error);
  }
}

loadPlants();

// 🔵 Carica il giardino da Firebase
async function loadMyGardenFromFirebase() {
  try {
    const snapshot = await db.collection("myGarden").get();
    myGarden = snapshot.docs.map(doc => doc.data());
    renderMyGarden();
    console.log("Giardino caricato da Firebase!");
  } catch (error) {
    console.error("Errore nel caricamento del giardino da Firebase:", error);
  }
}

// Chiama subito
loadMyGardenFromFirebase();

async function saveMyGarden() {
  try {
    const gardenRef = db.collection("myGarden");
    const snapshot = await gardenRef.get();

    // Cancella tutto
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Risalva il nuovo giardino
    const newBatch = db.batch();
    myGarden.forEach(plant => {
      const newDoc = gardenRef.doc();
      newBatch.set(newDoc, plant);
    });
    await newBatch.commit();

    console.log("Giardino salvato su Firebase!");
  } catch (error) {
    console.error("Errore nel salvataggio del giardino su Firebase:", error);
  }
}

function searchPlant() {
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!searchTerm) return;

  const found = plants.find(p => p.name.toLowerCase() === searchTerm);
  const risultato = document.getElementById("risultato");
  risultato.innerHTML = "";

  if (found) {
    renderPlant(found);
  } else {
    document.getElementById("fileInput").click();
  }
}

function renderPlant(plant) {
  const risultato = document.getElementById("risultato");
  risultato.innerHTML = "";

  const card = document.createElement("div");
  card.className = "pianta";

  card.innerHTML = `
    <h3>${plant.name}</h3>
    <p>☀️ Luce: ${plant.sunlight || plant.sun || "?"}</p>
    <p>💧 Acqua: ${plant.watering || plant.water || "?"}</p>
    <p>🌱 Terreno: ${plant.soil || "?"}</p>
    <p>🌡️ Temperatura Min: ${plant.tempMin || "?"}</p>
    <p>🌡️ Temperatura Max: ${plant.tempMax || "?"}</p>
    <button onclick="addToGarden(${JSON.stringify(plant).replace(/"/g, '&quot;')})">Aggiungi al Giardino</button>
  `;

  risultato.appendChild(card);
}

function addToGarden(plant) {
  myGarden.push(plant);
  saveMyGarden();
  renderMyGarden();
}

function renderMyGarden() {
  const container = document.getElementById("giardino");
  if (!container) return;
  container.innerHTML = "";
  myGarden.forEach((plant, index) => {
    const card = document.createElement("div");
    card.className = "pianta";
    card.style.marginBottom = "1em";

    card.innerHTML = `
      <input type="text" value="${plant.name}" onchange="updatePlantField(${index}, 'name', this.value)"><br/>
      <div style="margin-top: 0.5em;">☀️ Luce: <input type="text" value="${plant.sunlight || plant.sun || "?"}" onchange="updatePlantField(${index}, 'sunlight', this.value)"></div>
      <div style="margin-top: 0.5em;">💧 Acqua: <input type="text" value="${plant.watering || plant.water || "?"}" onchange="updatePlantField(${index}, 'watering', this.value)"></div>
      <div style="margin-top: 0.5em;">🌱 Terreno: <input type="text" value="${plant.soil || "?"}" onchange="updatePlantField(${index}, 'soil', this.value)"></div>
      <div style="margin-top: 0.5em;">🌡️ Temperatura Min: <input type="text" value="${plant.tempMin || "?"}" onchange="updatePlantField(${index}, 'tempMin', this.value)"></div>
      <div style="margin-top: 0.5em;">🌡️ Temperatura Max: <input type="text" value="${plant.tempMax || "?"}" onchange="updatePlantField(${index}, 'tempMax', this.value)"></div>
    `;

    const removeButton = document.createElement("button");
    removeButton.innerText = "Rimuovi";
    removeButton.style.marginTop = "0.5em";
    removeButton.onclick = () => removeFromGarden(index);

    card.appendChild(removeButton);
    container.appendChild(card);
  });
}

function updatePlantField(index, field, value) {
  if (index >= 0 && index < myGarden.length) {
    myGarden[index][field] = value;
    saveMyGarden();
  }
}

function removeFromGarden(index) {
  if (index >= 0 && index < myGarden.length) {
    myGarden.splice(index, 1);
    saveMyGarden();
    renderMyGarden();
  }
}

function filterByTemperature() {
  const min = parseInt(document.getElementById("tempMinFilter").value);
  const max = parseInt(document.getElementById("tempMaxFilter").value);

  const risultato = document.getElementById("risultato");
  risultato.innerHTML = "";

  const filtered = plants.filter(p => {
    if (p.tempMin != null && p.tempMax != null) {
      return p.tempMin <= max && p.tempMax >= min;
    }
    return false;
  });

  if (filtered.length > 0) {
    filtered.forEach(plant => renderPlant(plant));
  } else {
    risultato.innerHTML = "<p>Nessuna pianta adatta trovata.</p>";
  }
}

function identifyPlant() {
  document.getElementById("fileInput").click();
}

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    const imageData = e.target.result.split(",")[1];
    const response = await fetch("https://api.plant.id/v2/identify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": "YOUR_PLANT_ID_API_KEY"
      },
      body: JSON.stringify({
        images: [imageData],
        modifiers: ["similar_images"],
        plant_language: "it",
        plant_details: ["common_names", "watering", "sunlight", "soil", "temperature"]
      })
    });

    const data = await response.json();
    if (data && data.suggestions && data.suggestions.length > 0) {
      const plant = {
        name: data.suggestions[0].plant_name,
        sunlight: data.suggestions[0].plant_details?.sunlight?.join(", "),
        watering: data.suggestions[0].plant_details?.watering,
        soil: data.suggestions[0].plant_details?.soil,
        tempMin: data.suggestions[0].plant_details?.temperature_min,
        tempMax: data.suggestions[0].plant_details?.temperature_max
      };
      renderPlant(plant);
    } else {
      alert("Nessuna pianta riconosciuta.");
    }
  };
  reader.readAsDataURL(file);
}
const toggleButton = document.getElementById('toggleGiardino');
const giardinoDiv = document.getElementById('giardino');
const giardinoTitle = document.getElementById('giardinoTitle');

if (toggleButton && giardinoDiv && giardinoTitle) {
  toggleButton.addEventListener('click', () => {
    if (giardinoDiv.style.display === 'none') {
      giardinoDiv.style.display = 'block';
      giardinoTitle.style.display = 'block';
      toggleButton.textContent = 'Nascondi il mio giardino';
    } else {
      giardinoDiv.style.display = 'none';
      giardinoTitle.style.display = 'none';
      toggleButton.textContent = 'Mostra il mio giardino';
    }
  });
}

