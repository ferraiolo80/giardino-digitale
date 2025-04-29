async function searchPlant() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const match = plantsDB.find(p => p.name.toLowerCase() === query);
  const container = document.getElementById("risultato");
  container.innerHTML = "";

  if (match) {
    container.innerHTML = formatPlantCard(match, -1) +
      `<button onclick='addToGarden(${JSON.stringify(match).replace(/'/g, "\\'")})'>Salva nel mio giardino</button>`;
  } else {
    identifyPlant();
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

async function identifyPlant() {
  document.getElementById("fileInput").click();
}

async function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("https://api.plant.id/v2/identify", {
    method: "POST",
    headers: { "Api-Key": API_KEY },
    body: formData
  });

  const data = await res.json();
  const suggestions = data.suggestions || [];
  const container = document.getElementById("risultato");
  container.innerHTML = "";

  if (suggestions.length > 0) {
    const best = suggestions[0];
    const newPlant = {
      name: best.plant_name || "Pianta sconosciuta",
      sunlight: "?",
      watering: "?",
      tempMin: "?",
      tempMax: "?"
    };
    container.innerHTML = formatPlantCard(newPlant, -1) +
      `<button onclick='addToGarden(${JSON.stringify(newPlant).replace(/'/g, "\\'")})'>Salva nel mio giardino</button>`;
  } else {
    container.innerHTML = "Nessuna pianta riconosciuta.";
  }
}

function filterByTemperature() {
  const min = parseInt(document.getElementById("tempMinFilter").value);
  const max = parseInt(document.getElementById("tempMaxFilter").value);
  const container = document.getElementById("risultato");
  container.innerHTML = "";

  if (isNaN(min) || isNaN(max)) {
    container.innerHTML = "Inserisci temperature valide!";
    return;
  }

  const matches = plantsDB.filter(p => {
    const tempMin = parseInt(p.tempMin);
    const tempMax = parseInt(p.tempMax);
    return !isNaN(tempMin) && !isNaN(tempMax) && tempMin >= min && tempMax <= max;
  });

  if (matches.length > 0) {
    matches.forEach(plant => {
      container.innerHTML += formatPlantCard(plant, -1) +
        `<button onclick='addToGarden(${JSON.stringify(plant).replace(/'/g, "\\'")})'>Salva nel mio giardino</button>`;
    });
  } else {
    container.innerHTML = "Nessuna pianta adatta trovata.";
  }
}
