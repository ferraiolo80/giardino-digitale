// app.js

let piante = [];

async function caricaDati() {
    try {
        const response = await fetch('plants.json');
        piante = await response.json();
        mostraGiardino(piante);
    } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
    }
}

function mostraGiardino(listaPiante) {
    const container = document.getElementById('giardino');
    container.innerHTML = '';

    listaPiante.forEach(pianta => {
        const card = document.createElement('div');
        card.className = 'pianta';
        card.innerHTML = `
            <h3>${pianta.name}</h3>
            <p><strong>Luce:</strong> ${pianta.sunlight}</p>
            <p><strong>Acqua:</strong> ${pianta.watering}</p>
            <p><strong>Temperatura:</strong> ${pianta.temperature_min}&deg;C - ${pianta.temperature_max}&deg;C</p>
        `;
        container.appendChild(card);
    });
}

document.getElementById('cercaPianta').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!query) return;

    const pianta = piante.find(p => p.name.toLowerCase() === query);
    if (pianta) {
        mostraGiardino([pianta]);
    } else {
        document.getElementById('fileInput').click();
    }
});

document.getElementById('fileInput').addEventListener('change', async () => {
    const file = document.getElementById('fileInput').files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('https://api.plant.id/v2/identify', {
                method: 'POST',
                headers: {
                    'Api-Key': 'YOUR_API_KEY'
                },
                body: formData
            });

            const data = await response.json();
            const nomePianta = data?.suggestions?.[0]?.plant_name;

            if (nomePianta) {
                const risultato = document.getElementById('risultato');
                risultato.innerHTML = `<p>\ud83c\udf31 Pianta riconosciuta: <strong>${nomePianta}</strong><br>(Non presente nel database interno.)</p>`;
            } else {
                alert('Pianta non riconosciuta. Prova un'altra foto!');
            }
        } catch (error) {
            console.error('Errore nell'identificazione della pianta:', error);
        }
    }
});

document.getElementById('filtraTemperatura').addEventListener('click', () => {
    const tempMin = parseFloat(document.getElementById('temperaturaMin').value);
    const tempMax = parseFloat(document.getElementById('temperaturaMax').value);

    if (isNaN(tempMin) || isNaN(tempMax)) {
        alert('Inserisci valori validi per temperatura minima e massima.');
        return;
    }

    const pianteFiltrate = piante.filter(p => {
        return p.temperature_min !== undefined && p.temperature_max !== undefined &&
               p.temperature_min >= tempMin && p.temperature_max <= tempMax;
    });

    if (pianteFiltrate.length === 0) {
        alert('Nessuna pianta adatta trovata.');
    }

    mostraGiardino(pianteFiltrate);
});

document.getElementById('toggleGiardino').addEventListener('click', () => {
    const giardino = document.getElementById('sezioneGiardino');
    if (giardino.style.display === 'none') {
        giardino.style.display = 'block';
        document.getElementById('toggleGiardino').textContent = 'Nascondi il mio giardino';
    } else {
        giardino.style.display = 'none';
        document.getElementById('toggleGiardino').textContent = 'Mostra il mio giardino';
    }
});

window.onload = caricaDati;

