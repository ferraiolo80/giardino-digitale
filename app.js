let plantsData = [];

// Carica le piante da plants.json
fetch('plants.json')
  .then(res => res.json())
  .then(data => {
    plantsData = data;
    mostraGiardino();
  });

function cercaPianta() {
  const query = document.getElementById('search').value.trim().toLowerCase();
  const result = plantsData.find(p => p.name.toLowerCase() === query) || trovaNelGiardino(query);

  const container = document.getElementById('risultato');
  container.innerHTML = '';

  if (result) {
    container.innerHTML = creaHTMLpianta(result, true);
  } else {
    container.innerHTML = `<p>Pianta non trovata.</p>`;
  }
}

function creaHTMLpianta(pianta, mostraBottone = false) {
  let html = `
    <div class="pianta">
      <strong>${pianta.name}</strong><br>
      Sole: ${pianta.sunlight}<br>
      Acqua: ${pianta.watering}<br>
  `;

  if (mostraBottone && !trovaNelGiardino(pianta.name.toLowerCase())) {
    html += `<button onclick='salvaNelGiardino(${JSON.stringify(pianta)})'>Salva nel mio giardino</button>`;
  }

  html += '</div>';
  return html;
}

function salvaNelGiardino(pianta) {
  const giardino = JSON.parse(localStorage.getItem('giardino')) || [];
  giardino.push(pianta);
  localStorage.setItem('giardino', JSON.stringify(giardino));
  mostraGiardino();
  alert('Pianta salvata!');
}

function mostraGiardino() {
  const container = document.getElementById('mioGiardino');
  const giardino = JSON.parse(localStorage.getItem('giardino')) || [];
  container.innerHTML = giardino.map(p => creaHTMLpianta(p)).join('');
}

function trovaNelGiardino(nome) {
  const giardino = JSON.parse(localStorage.getItem('giardino')) || [];
  return giardino.find(p => p.name.toLowerCase() === nome);
}
