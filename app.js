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

function saveMyGarden() {
  console.log("📦 Dati da salvare:", JSON.stringify(myGarden, null, 2));
}
