let myGarden = [];
let gardenVisible = true;

window.onload = async () => {
  await caricaGiardino();
  renderMyGarden();
  setupToggleGarden();
};

async function caricaGiardino() {
  const res = await fetch("myGarden.json");
  myGarden = await res.json();
}

function setupToggleGarden() {
  const btn = document.getElementById("toggleGiardino");
  if (btn) {
    btn.onclick = () => {
      gardenVisible = !gardenVisible;
      document.getElementById("giardinoSection").style.display = gardenVisible ? "block" : "none";
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
      <div style="margin-top: 0.5em;">☀️ Luce: <input type="text" value="${plant.sun || "?"}" onchange="updatePlantField(${index}, 'sun', this.value)"></div>
      <div style="margin-top: 0.5em;">💧 Acqua: <input type="text" value="${plant.water || "?"}" onchange="updatePlantField(${index}, 'water', this.value)"></div>
      <div style="margin-top: 0.5em;">🌱 Terreno: <input type="text" value="${plant.soil || "?"}" onchange="updatePlantField(${index}, 'soil', this.value)"></div>
      <div style="margin-top: 0.5em;">🌡️ Temperatura ideale: <input type="text" value="${plant.temperature || "?"}" onchange="updatePlantField(${index}, 'temperature', this.value)"></div>
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
  const query = document.getElementById("searchInput").value.toLowerCase();
  const match = plantsDB.find(p => p.name.toLowerCase() === query);
  const container = document.getElementById("risultato");

  if (match) {
    container.innerHTML = formatPlantCard(match, -1) +
      `<button onclick='addToGarden(${JSON.stringify(match).replace(/'/g, "\\'")})'>Salva nel mio giardino</button>`;
  } else {
    document.getElementById("identificaInfo").textContent = "🌱 Pianta non trovata nel database. Prova a identificarla caricando una foto!";
  }
}

function addToGarden(plant) {
  if (typeof plant === "string") {
    plant = JSON.parse(plant);
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

function filtraGiardino() {
  const nomeFiltro = document.getElementById("filtroNome").value.toLowerCase();
  const soloAdatteTemperatura = document.getElementById("filtroTemperatura").checked;
  const tempMin = parseInt(document.getElementById("temperaturaMinima").value, 10);

  const container = document.getElementById("giardino");
  container.innerHTML = "";

  myGarden.forEach((plant, index) => {
    if (plant.name.toLowerCase().includes(nomeFiltro)) {
      if (!soloAdatteTemperatura || (plant.temperature && parseInt(plant.temperature, 10) >= tempMin)) {
        container.innerHTML += formatPlantCard(plant, index);
      }
    }
  });
}

