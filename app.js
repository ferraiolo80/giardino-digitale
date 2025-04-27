const API_KEY = "maF4AdHcoe2hZpxT7aMYwWcLCCNVarvNf0ux5b92et15OeRmCf";
let plantsDB = [];
let myGarden = [];
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
    };
  }
}

function renderMyGarden() {
  const container = document.getElementById("giardino");
  if (!container) return;
  container.innerHTML = "";
  myGarden.forEach((plant, index) => {
    container.innerHTML += formatPlantCard(plant, index);
  });
}

function formatPlantCard(plant, index) {
  return `
    <div class="pianta">
      <input type="text" value="${plant.name}" onchange="updatePlantField(${index}, 'name', this.value)">
      <div>☀️ Luce: <input type="text" value="${plant.sunlight || plant.sun || "?"}" onchange="updatePlantField(${index}, 'sunlight', this.value)"></div>
      <div>💧 Acqua: <input type="text" value="${plant.watering || plant.water || "?"}" onchange="updatePlantField(${index}, 'watering', this.value)"></div>
      <div>🌡️ Temperatura Min: <input type="text" value="${plant.tempMin || "?"}" onchange="updatePlantField(${index}, 'tempMin', this.value)"> °C</div>
      <div>🌡️ Temperatura Max: <input type="text" value="${plant.tempMax || "?"}" onchange="updatePlantField(${index}, 'tempMax', this.value)"> °C</div>
      <button onclick='removeFromGarden(${index})'>Rimuovi</button>
    </div>`;
}

function updatePlantField(index, field, value) {
  if (index >= 0) {
    myGarden[index][field] = value;
    saveMyGarden();
    renderMyGarden();
  }
}

function searchPlant() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const match = plantsDB.find(p => p.name.toLowerCase() === query);
  const container = document.getElementById("risultato");
  container.innerHTML = "";

  if (match) {
    container.innerHTML = formatPlantCard(match, -1) +
      `<button onclick='addToGarden(${JSON.stringify(match).replace(/'/g, "\\'")})'>Salva nel mio giardino</button>`;
  } else {
    document.getElementById('fileInput').click();
  }
}

function addToGarden(plant) {
  if (typeof plant === "string") {
    try {
      plant = JSON.parse(plant);
    } catch (e) {
      console.error("Errore nel parsing della pianta:", e);
      return;
    }
  }
  if (!myGarden.find(p => p.name === plant.name)) {
    myGarden.push(plant);
    saveMyGarden();
    renderMyGarden();
  }
}

function removeFromGarden(index) {
  if (index >= 0) {
    myGarden.splice(index, 1);
    saveMyGarden();
    renderMyGarden();
  }
}

function saveMyGarden() {
  console.log("📦 Dati salvati:", JSON.stringify(myGarden, null, 2));
}

async function identifyPlant(event) {
  const file = event.target.files[0];
  
  if (!file) {
    alert("⚠️ Nessun file selezionato.");
    return;
  }

  const formData = new FormData();
  formData.append("images", file);

  try {
    const res = await fetch("https://api.plant.id/v2/identify", {
      method: "POST",
      headers: {
        "Api-Key": API_KEY
      },
      body: formData
    });

    const data = await res.json();
    console.log("🌿 Risposta API:", data);

    const container = document.getElementById("risultato");
    container.innerHTML = "";

    if (data.suggestions && data.suggestions.length > 0) {
      const plantName = data.suggestions[0].plant_name;
      const match = plantsDB.find(p => p.name.toLowerCase() === plantName.toLowerCase());

      if (match) {
        container.innerHTML = `
          <div class="pianta">
            <h3>${match.name}</h3>
            <p>☀️ Luce: ${match.sunlight || match.sun}</p>
            <p>💧 Acqua: ${match.watering || match.water}</p>
            <p>🌡️ Temperatura: ${match.temperature}</p>
            <button onclick='addToGarden(${JSON.stringify(match).replace(/'/g, "\\'")})'>Salva nel mio giardino</button>
          </div>
        `;
      } else {
        container.innerHTML = `
          🌱 Pianta riconosciuta: <b>${plantName}</b><br>
          (Non presente nel database interno.)
        `;
      }
    } else {
      container.innerHTML = "❌ Nessuna pianta riconosciuta. Prova a scattare una foto più chiara!";
    }
  } catch (error) {
    console.error("Errore nella richiesta:", error);
    alert("🚨 Errore durante il riconoscimento della pianta. Riprova.");
  }
}


function filterByTemperature() {
  const minTemp = parseFloat(document.getElementById("minTemp").value);
  const maxTemp = parseFloat(document.getElementById("maxTemp").value);

  if (isNaN(minTemp) || isNaN(maxTemp)) {
    alert("⚠️ Inserisci temperature valide!");
    return;
  }

  const filtered = plantsDB.filter(plant => {
    if (!plant.temperature) return false;
    const tempRange = plant.temperature.split("-").map(t => parseFloat(t));
    if (tempRange.length !== 2) return false;
    const [min, max] = tempRange;
    return min <= maxTemp && max >= minTemp;
  });

  const container = document.getElementById("risultato");
  container.innerHTML = "";

  if (filtered.length > 0) {
    filtered.forEach(plant => {
      container.innerHTML += formatPlantCard(plant, -1) +
        `<button onclick='addToGarden(${JSON.stringify(plant).replace(/'/g, "\\'")})'>Salva nel mio giardino</button><br/><br/>`;
    });
  } else {
    container.innerHTML = "❌ Nessuna pianta adatta trovata.";
  }
}

