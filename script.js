let escaños = 0;
let provinciaActual = '';

function seleccionarProvincia(provincia, escanos) {
    provinciaActual = provincia;
    escaños = escanos;

    document.getElementById('provinciaSeleccionada').textContent = provincia;
    document.getElementById('formularioVotos').classList.remove('hidden');
    document.getElementById('resultados').classList.add('hidden');
    document.getElementById('graficoEscanos').classList.add('hidden');
}

function calcularResultados() {
    const votosA = parseInt(document.getElementById('partidoA').value) || 0;
    const votosB = parseInt(document.getElementById('partidoB').value) || 0;
    const votosC = parseInt(document.getElementById('partidoC').value) || 0;
    const votosD = parseInt(document.getElementById('partidoD').value) || 0;
    const votosE = parseInt(document.getElementById('partidoE').value) || 0;
    const votosF = parseInt(document.getElementById('partidoF').value) || 0;

    const totalVotos = votosA + votosB + votosC + votosD + votosE + votosF;

    // Añadimos los logos a los partidos
    const resultados = [
        { partido: 'La Libertad Avanza', votos: votosA, porcentaje: (votosA / totalVotos * 100).toFixed(2), logo: 'lla.svg' },
        { partido: 'Union x Patria', votos: votosB, porcentaje: (votosB / totalVotos * 100).toFixed(2), logo: 'up.png' },
        { partido: 'PRO', votos: votosC, porcentaje: (votosC / totalVotos * 100).toFixed(2), logo: 'pro.png' },
        { partido: 'Encuentro Federal', votos: votosD, porcentaje: (votosD / totalVotos * 100).toFixed(2), logo: 'ef.jpg' },
        { partido: 'Frente Izquierda', votos: votosE, porcentaje: (votosE / totalVotos * 100).toFixed(2), logo: 'fit.png' },
        { partido: 'UCR', votos: votosF, porcentaje: (votosF / totalVotos * 100).toFixed(2), logo: 'ucr.png' }
    ];

    const repartoEscaños = sistemaDhondt([votosA, votosB, votosC, votosD, votosE, votosF], escaños);

    mostrarResultados(resultados, repartoEscaños);
    mostrarGraficoEscanos(repartoEscaños);
}

function sistemaDhondt(votos, escanos) {
    const totalVotos = votos.reduce((acc, val) => acc + val, 0);
    const umbral = totalVotos * 0.03;

    let votosValidos = votos.map(v => (v >= umbral ? v : 0));

    let escanosAsignados = Array(votos.length).fill(0);
    let divisores = votosValidos.map(v => Array.from({length: escanos}, (_, i) => v / (i + 1)));
    let todosDivisores = [].concat(...divisores).sort((a, b) => b - a);

    for (let i = 0; i < escanos; i++) {
        let maxIndex = divisores.findIndex(arr => arr.includes(todosDivisores[i]));
        escanosAsignados[maxIndex]++;
        divisores[maxIndex][divisores[maxIndex].indexOf(todosDivisores[i])] = -1;
    }

    return escanosAsignados;
}

function mostrarResultados(resultados, repartoEscanos) {
    const tablaResultados = document.querySelector('#tablaResultados tbody');
    
    // Ordenar los resultados por votos de mayor a menor
    const resultadosOrdenados = resultados
        .map((resultado, index) => ({ ...resultado, escaños: repartoEscanos[index] }))
        .sort((a, b) => b.votos - a.votos);

    // Limpiar tabla previa
    tablaResultados.innerHTML = '';

    // Mostrar los resultados ordenados con logos
    resultadosOrdenados.forEach(resultado => {
        let row = `<tr>
            <td><img src="${resultado.logo}" alt="Logo de ${resultado.partido}" style="width: 40px; height: 40px;"></td>
            <td>${resultado.partido}</td>
            <td>${resultado.votos}</td>
            <td>${resultado.porcentaje}%</td>
            <td>${resultado.escaños}</td>
        </tr>`;
        tablaResultados.innerHTML += row;
    });

    // Actualizar el título de la tabla con el nombre de la provincia y la cantidad de escaños
    document.getElementById('provinciaResultado').textContent = `${provinciaActual} (${escaños} escaños a repartir)`;
    document.getElementById('resultados').classList.remove('hidden');
}


// Función para mostrar el gráfico de escaños
function mostrarGraficoEscanos(repartoEscanos) {
    const data = [
        { name: 'LLA', y: repartoEscanos[0], color: '#701e63' },
        { name: 'UP', y: repartoEscanos[1], color: '#096cd6' },
        { name: 'PRO', y: repartoEscanos[2], color: '#ebf222' },
        { name: 'EF', y: repartoEscanos[3], color: '#040c59' },
        { name: 'FIT', y: repartoEscanos[4], color: '#ff000d' },
        { name: 'UCR', y: repartoEscanos[5], color: '#700c11' }
    ];

    Highcharts.chart('graficoEscanos', {
        chart: {
            type: 'pie',
            height: '75%',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            spacingBottom: 50,  // Añade más espacio inferior
        },
        title: {
            text: 'Distribución de Escaños'
        },
        plotOptions: {
            pie: {
                innerSize: '60%',  // Ajusta el tamaño interno del donut
                depth: 45,
                dataLabels: {
                    enabled: true,
                    distance: 20,  // Aumenta la distancia de las etiquetas
                    style: {
                        fontWeight: 'bold',
                        fontSize: '14px',
                    },
                    format: '{point.name}: {point.y} escaños'
                }
            }
        },
        series: [{
            name: 'Escaños',
            data: data
        }]
    });

    document.getElementById('graficoEscanos').classList.remove('hidden');
}

