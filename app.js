const API_KEY = "maF4AdHcoe2hZpxT7aMYwWcLCCNVarvNf0ux5b92et15OeRmCf";
let plantsDB = [];
let myGarden = [];

document.addEventListener("DOMContentLoaded", () => {
  // Prima prova a caricare dal localStorage
  const storedGarden = localStorage.getItem('myGarden');
  if (storedGarden) {
    myGarden = JSON.parse(storedGarden);
    renderMyGarden();
  }

  // Poi prova a caricare da Firebase
  const userGardenRef = db.collection('myGarden');
  userGardenRef.get().then((snapshot) => {
    myGarden = [];
    snapshot.forEach((doc) => {
      myGarden.push(doc.data());
    });
    saveMyGarden();  // aggiorna anche il localStorage
    renderMyGarden();
  }).catch((error) => {
    console.error("Errore nel caricamento da Firebase:", error);
  });
});

let gardenVisible = true;

window.onload = async () => {
  const plantsRes = await fetch("plants.json");
  plantsDB = await plantsRes.json();
  
  const gardenRes = await fetch("myGarden.json");
  myGarden = await gardenRes.json();

  renderMyGarden();
  setupToggleGarden();
};

function setupToggleGarden() {
  const btn = document.getElementById("toggleGiardino");
  if (btn) {
    btn.onclick = () => {
      gardenVisible = !gardenVisible;
      document.getElementById("giardino").style.display = gardenVisible ? "block" : "none";
      btn.innerText = gardenVisible ? "Nascondi il mio giardino" : "Mostra il mio giardino";
      document.getElementById("giardinoTitle").style.display = gardenVisible ? "block" : "none";
    };
  }
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

function removeFromGarden(index) {
  if (index >= 0 && index < myGarden.length) {
    myGarden.splice(index, 1);
    saveMyGarden();
    renderMyGarden();
  }
}

function formatPlantCard(plant, index, inGarden = false) {
  return `
    <div class="pianta" style="margin-bottom: 1em;">
      <input type="text" value="${plant.name}" onchange="updatePlantField(${index}, 'name', this.value)"><br/>
      <div style="margin-top: 0.5em;">☀️ Luce: <input type="text" value="${plant.sunlight || plant.sun || "?"}" onchange="updatePlantField(${index}, 'sunlight', this.value)"></div>
      <div style="margin-top: 0.5em;">💧 Acqua: <input type="text" value="${plant.watering || plant.water || "?"}" onchange="updatePlantField(${index}, 'watering', this.value)"></div>
      <div style="margin-top: 0.5em;">🌱 Terreno: <input type="text" value="${plant.soil || "?"}" onchange="updatePlantField(${index}, 'soil', this.value)"></div>
      <div style="margin-top: 0.5em;">🌡️ Temperatura Min: <input type="text" value="${plant.tempMin || "?"}" onchange="updatePlantField(${index}, 'tempMin', this.value)"></div>
      <div style="margin-top: 0.5em;">🌡️ Temperatura Max: <input type="text" value="${plant.tempMax || "?"}" onchange="updatePlantField(${index}, 'tempMax', this.value)"></div>
      ${inGarden ? `<button style="margin-top: 0.5em;" onclick="removeFromGarden(${index})">Rimuovi</button>` : ""}
    </div>`;
}

function updatePlantField(index, field, value) {
  if (index >= 0) {
    myGarden[index][field] = value;
    saveMyGarden();
    renderMyGarden();
  }
}

// Salva "Il mio Giardino" su Firebase
async function saveMyGarden() {
  try {
    const gardenRef = db.collection("myGarden");
    const snapshot = await gardenRef.get();

    // Cancella tutto quello che c'era prima
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Carica di nuovo le piante aggiornate
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

