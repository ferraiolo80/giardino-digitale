document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  const risultatoDiv = document.getElementById("risultato");
  const giardinoDiv = document.getElementById("giardino");
  const toggleGiardinoBtn = document.getElementById("toggleGiardino");
  const fileInput = document.getElementById("fileInput");

  async function fetchPlants() {
    try {
      const snapshot = await db.collection("piante").get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Errore nel caricamento del database:", error);
      return [];
    }
  }

  function renderPlants(plants, container = risultatoDiv) {
    container.innerHTML = "";
    if (plants.length === 0) {
      container.innerHTML = "<p>Nessuna pianta trovata.</p>";
      return;
    }

    plants.forEach(plant => {
      const div = document.createElement("div");
      div.className = "pianta";
      div.innerHTML = `
        <h3>${plant.nome}</h3>
        <p>Temperatura ideale: ${plant.temperaturaMin}°C - ${plant.temperaturaMax}°C</p>
        <p>Luce: ${plant.luce}</p>
        <button onclick="aggiungiAlGiardino('${plant.id}')">Aggiungi al giardino</button>
      `;
      container.appendChild(div);
    });
  }

  async function searchPlant() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const plants = await fetchPlants();
    const filtered = plants.filter(p => p.nome.toLowerCase().includes(input));
    renderPlants(filtered);
  }

  async function filterByTemperature() {
    const min = parseFloat(document.getElementById("tempMinFilter").value);
    const max = parseFloat(document.getElementById("tempMaxFilter").value);
    const plants = await fetchPlants();
    const filtered = plants.filter(p =>
      (!isNaN(min) ? p.temperaturaMin >= min : true) &&
      (!isNaN(max) ? p.temperaturaMax <= max : true)
    );
    renderPlants(filtered);
  }

  async function aggiungiAlGiardino(id) {
    let giardino = JSON.parse(localStorage.getItem("giardino")) || [];
    if (!giardino.includes(id)) {
      giardino.push(id);
      localStorage.setItem("giardino", JSON.stringify(giardino));
      await mostraGiardino();
    }
  }

  async function rimuoviDalGiardino(id) {
    let giardino = JSON.parse(localStorage.getItem("giardino")) || [];
    giardino = giardino.filter(pid => pid !== id);
    localStorage.setItem("giardino", JSON.stringify(giardino));
    await mostraGiardino();
  }

  async function mostraGiardino() {
    let giardino = JSON.parse(localStorage.getItem("giardino")) || [];
    if (giardino.length === 0) {
      giardinoDiv.innerHTML = "<p>Il tuo giardino è vuoto.</p>";
      return;
    }
    const plants = await fetchPlants();
    const filtered = plants.filter(p => giardino.includes(p.id));
    renderPlants(filtered, giardinoDiv);

    const buttons = giardinoDiv.querySelectorAll("button");
    buttons.forEach((btn, index) => {
      btn.textContent = "Rimuovi";
      btn.onclick = () => rimuoviDalGiardino(filtered[index].id);
    });
  }

  toggleGiardinoBtn.addEventListener("click", () => {
    if (giardinoDiv.style.display === "none") {
      giardinoDiv.style.display = "block";
      toggleGiardinoBtn.textContent = "Nascondi il mio giardino";
    } else {
      giardinoDiv.style.display = "none";
      toggleGiardinoBtn.textContent = "Mostra il mio giardino";
    }
  });

  async function identifyPlant() {
    fileInput.click();
  }

  window.handleFile = async function (event) {
    const file = event.target.files[0];
    if (!file) return;
    alert("Funzione di riconoscimento non ancora attiva.");
  };

  // Avvio automatico
  fetchPlants().then(renderPlants);
  mostraGiardino();

  // Rendo le funzioni visibili globalmente
  window.searchPlant = searchPlant;
  window.filterByTemperature = filterByTemperature;
  window.identifyPlant = identifyPlant;
  window.aggiungiAlGiardino = aggiungiAlGiardino;
}
