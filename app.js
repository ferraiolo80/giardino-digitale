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
      document.getElementById("giardinoTitle").style.display = gardenVisible ? "block" : "none";
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
      <input type="text" value="${plant.name}" onchange="updatePlantField(${index}, 'name', this.value)"><br/>
      ☀️ Luce: <input type="text" value="${plant.sunlight || plant.sun || '?'}" onchange="updatePlantField(${index}, 'sunlight', this.value)"><br/>
      💧 Acqua: <input type="text" value="${plant.watering || plant.water || '?'}" onchange="updatePlantField(${index}, 'watering', this.value)"><br/>
      🌡️ Temperatura Min: <input type="text" value="${plant.tempMin || '?'}" onchange="updatePlantField(${index}, 'tempMin', this.value)"><br/>
      🌡️ Temperatura Max: <input type="text" value="${plant.tempMax || '?'}" onchange="updatePlantField(${index}, 'tempMax', this.value)"><br/>
      <button onclick="removeFromGarden(${index})">Rimuovi</button>
    </div>`;
}

function updatePlantField(index, field, value) {
  if (index >= 0) {
    myGarden[index][field] = value;
    saveMyGarden();
    renderMyGarden();
  }
}

function saveMyGarden() {
  console.log("📦 Dati da salvare:", JSON.stringify(myGarden, null, 2));
}
