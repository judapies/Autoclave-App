// Create the charts when the web page loads
window.addEventListener('load', onload);

function onload(event){
  
}

function createChart(){
  const etiquetas = [""]
  // Podemos tener varios conjuntos de datos. Comencemos con uno
  const datos1 = {
    label: "Temperatura 1",
    data: [0], // La data es un arreglo que debe tener la misma cantidad de valores que la cantidad de etiquetas    
    borderColor: 'rgba(54, 162, 235, 1)', // Color del borde
    borderWidth: 1,// Ancho del borde
    pointStyle:'dash',
  };
  const datos2 = {
    label: "Temperatura 2",
    data: [0], // La data es un arreglo que debe tener la misma cantidad de valores que la cantidad de etiquetas    
    borderColor: 'rgba(255, 159, 64, 1)',// Color del borde
    borderWidth: 1,// Ancho del borde
    pointStyle:'dash',
  };
  const datos3 = {
    label: "Temperatura 3",
    data: [0], // La data es un arreglo que debe tener la misma cantidad de valores que la cantidad de etiquetas    
    borderColor: 'rgba(255, 0, 0, 1)',// Color del borde
    borderWidth: 1,// Ancho del borde
    pointStyle:'dash',
  };
  const datos4 = {
    label: "Temperatura 4",
    data: [0], // La data es un arreglo que debe tener la misma cantidad de valores que la cantidad de etiquetas  
    borderColor: 'rgba(0, 0, 0, 1)',// Color del borde
    borderWidth: 1,// Ancho del borde
    pointStyle:'dash',
  };
  var chart = new Chart($grafica, {
    type: 'line',// Tipo de gráfica
    data: {
      labels: etiquetas,
      datasets: [
          datos1,
          datos2,
          datos3,
          datos4          
      ]
    },
  });
  return chart;
}

// Create Pressure Chart
function createPressureChart() {
  const etiquetas = [""]
  // Podemos tener varios conjuntos de datos. Comencemos con uno
  const datos1 = {
    label: "Presion Camara",
    data: [0], // La data es un arreglo que debe tener la misma cantidad de valores que la cantidad de etiquetas    
    borderColor: 'rgba(54, 162, 235, 1)', // Color del borde
    borderWidth: 1,// Ancho del borde
    pointStyle:'dash',
  };
  const datos2 = {
    label: "Presion Pre-Camara",
    data: [0], // La data es un arreglo que debe tener la misma cantidad de valores que la cantidad de etiquetas    
    borderColor: 'rgba(255, 159, 64, 1)',// Color del borde
    borderWidth: 1,// Ancho del borde
    pointStyle:'dash',
  };
  
  var chart = new Chart($graficap, {
    type: 'line',// Tipo de gráfica
    data: {
      labels: etiquetas,
      datasets: [
          datos1,
          datos2,        
      ]
    },
  });
  return chart;
}