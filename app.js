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
    <div class="pianta" style="margin-bottom: 1em;">
      <input type="text" value="${plant.name}" onchange="updatePlantField(${index}, 'name', this.value)"><br/>
      <div style="margin-top: 0.5em;">☀️ Luce: <input type="text" value="${plant.sunlight || plant.sun || "?"}" onchange="updatePlantField(${index}, 'sunlight', this.value)"></div>
      <div style="margin-top: 0.5em;">💧 Acqua: <input type="text" value="${plant.watering || plant.water || "?"}" onchange="updatePlantField(${index}, 'watering', this.value)"></div>
      <div style="margin-top: 0.5em;">🌡️ Temperatura Min: <input type="text" value="${plant.temperature_min ?? "?"}" onchange="updatePlantField(${index}, 'temperature_min', this.value)">°C</div>
      <div style="margin-top: 0.5em;">🌡️ Temperatura Max: <input type="text" value="${plant.temperature_max ?? "?"}" onchange="updatePlantField(${index}, 'temperature_max', this.value)">°C</div>
      <button style="margin-top: 0.5em;" onclick='removeFromGarden(${index})'>Rimuovi</button>
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
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const match = plantsDB.find(p => p.name.toLowerCase() === query) || myGarden.find(p => p.name.toLowerCase() === query);
  
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
      console.error("Errore parsing pianta:", e);
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
  console.log("📦 Dati da salvare:", JSON.stringify(myGarden, null, 2));
}

async function identifyPlant(event) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("https://plant.id/api/v3/identify", {
    method: "POST",
    headers: { "Api-Key": API_KEY },
    body: formData
  });

  const data = await res.json();
  console.log(data);

  if (data.suggestions?.length) {
    const plantName = data.suggestions[0].plant_name;
    const found = plantsDB.find(p => p.name.toLowerCase() === plantName.toLowerCase());

    const container = document.getElementById("risultato");
    container.innerHTML = "";

    if (found) {
      container.innerHTML = formatPlantCard(found, -1) +
        `<button onclick='addToGarden(${JSON.stringify(found).replace(/'/g, "\\'")})'>Salva nel mio giardino</button>`;
    } else {
      container.innerHTML = "🌱 Pianta non trovata nel database.";
    }
  } else {
    alert("Non sono riuscito a identificare la pianta. Riprova con un'altra foto!");
  }
}

function filterByTemperature() {
  const tempMin = parseInt(document.getElementById("tempMin").value, 10);
  const tempMax = parseInt(document.getElementById("tempMax").value, 10);

  const container = document.getElementById("risultato");
  container.innerHTML = "";

  const filtered = plantsDB.filter(p => {
    return p.temperature_min >= tempMin && p.temperature_max <= tempMax;
  });

  if (filtered.length) {
    filtered.forEach(plant => {
      container.innerHTML += formatPlantCard(plant, -1) +
        `<button onclick='addToGarden(${JSON.stringify(plant).replace(/'/g, "\\'")})'>Salva nel mio giardino</button><br><br>`;
    });
  } else {
    container.innerHTML = "❌ Nessuna pianta trovata per questa fascia di temperatura.";
  }
}
