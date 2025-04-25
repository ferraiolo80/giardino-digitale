const API_KEY = "maF4AdHcoe2hZpxT7aMYwWcLCCNVarvNf0ux5b92et15OeRmCf"; 
let plantsDB = [];
let myGarden = JSON.parse(localStorage.getItem("myGarden")) || [];
let gardenVisible = true;

window.onload = async () => {
  const res = await fetch("plants.json");
  plantsDB = await res.json();
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
      <div style="margin-top: 0.5em;">☀️ Luce: <input type="text" value="${plant.sun || "?"}" onchange="updatePlantField(${index}, 'sun', this.value)"></div>
      <div style="margin-top: 0.5em;">💧 Acqua: <input type="text" value="${plant.water || "?"}" onchange="updatePlantField(${index}, 'water', this.value)"></div>
      <div style="margin-top: 0.5em;">🌱 Terreno: <input type="text" value="${plant.soil || "?"}" onchange="updatePlantField(${index}, 'soil', this.value)"></div>
      <button style="margin-top: 0.5em;" onclick='removeFromGarden("${plant.name}")'>Rimuovi</button>
    </div>`;
}

function updatePlantField(index, field, value) {
  if (index >= 0) {
    myGarden[index][field] = value;
    localStorage.setItem("myGarden", JSON.stringify(myGarden));
    renderMyGarden();
  }
}

function searchPlant() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const match = [...plantsDB, ...myGarden].find(p => p.name.toLowerCase() === query);
  const container = document.getElementById("risultato");
  document.getElementById("giardino").innerHTML = ""; // Nasconde il giardino durante la ricerca

  if (match) {
    container.innerHTML = formatPlantCard(match, -1) +
      `<button onclick='addToGarden(${JSON.stringify(match).replace(/'/g, "\\'")})'>Salva nel mio giardino</button>`;
  } else {
    identifyPlant(); // Prova con PlantID se non la trova nel database locale
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
    localStorage.setItem("myGarden", JSON.stringify(myGarden));
    renderMyGarden();

function removeFromGarden(name) {
  myGarden = myGarden.filter(p => p.name !== name);
  localStorage.setItem("myGarden", JSON.stringify(myGarden));
  renderMyGarden();
