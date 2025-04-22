const plantDatabase = {
  "ortensia": {
    nome: "Ortensia",
    luce: "Luminosa ma senza sole diretto",
    irrigazione: "Terreno umido, non inzuppato"
  },
  "basilico": {
    nome: "Basilico",
    luce: "Sole diretto",
    irrigazione: "Terreno sempre leggermente umido"
  },
  "aloe": {
    nome: "Aloe Vera",
    luce: "Soleggiata",
    irrigazione: "Annaffiare solo quando il terreno è asciutto"
  }
};

function showPlantInfo() {
  const name = document.getElementById("plantName").value.toLowerCase();
  const info = plantDatabase[name];
  const output = document.getElementById("plant-info");

  if (info) {
    output.innerHTML = `
      <h2>${info.nome}</h2>
      <p><strong>Luce:</strong> ${info.luce}</p>
      <p><strong>Irrigazione:</strong> ${info.irrigazione}</p>
    `;
  } else {
    output.innerHTML = "<p>Pianta non trovata. Prova con 'ortensia', 'basilico' o 'aloe'.</p>";
  }
}
