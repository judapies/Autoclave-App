  // convert epochtime to JavaScripte Date object
  function epochToJsDate(epochTime){
    return new Date(epochTime*1000);
  }
  
  // convert time to human-readable format YYYY/MM/DD HH:MM:SS
  function epochToDateTime(epochTime){
    var epochDate = new Date(epochToJsDate(epochTime));
    var dateTime = epochDate.getFullYear() + "/" +
      ("00" + (epochDate.getMonth() + 1)).slice(-2) + "/" +
      ("00" + epochDate.getDate()).slice(-2) + " " +
      ("00" + epochDate.getHours()).slice(-2) + ":" +
      ("00" + epochDate.getMinutes()).slice(-2) + ":" +
      ("00" + epochDate.getSeconds()).slice(-2);
    return dateTime;
  }
  
  // function to plot values on charts
  function plotValues(chart, timestamp, value){
    //var formattedDate = epochToJsDate(timestamp).toLocaleString('es-CO', { timeZone: 'America/Bogota' }); // Convert to    
    var x = epochToJsDate(timestamp).getTime();
    //var x = epochToDateTime(timestamp);
    //var x = formattedDate;
    var y = Number (value);
    chart.series[0].addPoint([x, y], true, false, true);
  }
  
  // DOM elements
  const loginElement = document.querySelector('#login-form');
  const sidebar = document.querySelector('#sidebar');
  const contentElement = document.querySelector("#content-sign-in");
  const userDetailsElement = document.querySelector('#user-details');
  const authBarElement = document.querySelector('#authentication-bar');
  const deleteButtonElement = document.getElementById('delete-button');
  const deleteModalElement = document.getElementById('delete-modal');
  const deleteDataFormElement = document.querySelector('#delete-data-form');
  const viewDataButtonElement = document.getElementById('view-data-button');
  const hideDataButtonElement = document.getElementById('hide-data-button');
  const tableContainerElement = document.querySelector('#table-container');
  const chartsRangeInputElement = document.getElementById('charts-range');
  const loadDataButtonElement = document.getElementById('load-data');
  //const cardsCheckboxElement = document.querySelector('input[name=cards-checkbox]');
  // Select the loading div
  const loadingDiv = document.getElementById("loading");
  
  // DOM elements for sensor readings
  const cardsReadingsElement = document.querySelector("#cards-div");
  const gaugesReadingsElement = document.querySelector("#gauges-div");
  const chartsDivElement = document.querySelector('#charts-div');
  const tempElement1 = document.getElementById("temp1");
  const tempElement2 = document.getElementById("temp2");
  const tempElement3 = document.getElementById("temp3");
  const tempElement4 = document.getElementById("temp4");
  const presElement1 = document.getElementById("presc");
  const presElement2 = document.getElementById("prespre");
  const updateElement = document.getElementById("lastUpdate")
  
  // MANAGE LOGIN/LOGOUT UI
  const setupUI = (user) => {
    if (user) {
      //toggle UI elements
      sidebar.style.display='block';
      loginElement.style.display = 'none';
      contentElement.style.display = 'block';
      authBarElement.style.display ='block';
      userDetailsElement.style.display ='block';
      userDetailsElement.innerHTML = user.email;
  
      // get user UID to get data from database
      var uid = user.uid;
      console.log(uid);
  
      // Database paths (with user UID)
      var ciclosPath = 'UsersData/' + uid.toString() + '/ciclos/CiclosRealizados';
      //var dbPath = 'UsersData/' + uid.toString() + '/ciclos/'+ ciclosTotales;      
      var dbPath = 'UsersData/' + uid.toString() + '/ciclos/0';      
      var chartPath = 'UsersData/' + uid.toString() + '/charts/range';
      
      // Database references
      var ciclosRef = firebase.database().ref(ciclosPath);
      var dbRef = firebase.database().ref(dbPath);
      var chartRef = firebase.database().ref(chartPath);
      var ciclosTotales;

      ciclosRef.on('value', snapshot =>{//Obtiene el numero de los ciclos realizados en el equipo
        ciclosTotales=Number(snapshot.val());
        console.log('CiclosTotales:'+ciclosTotales)
        dbPath = 'UsersData/' + uid.toString() + '/ciclos/'+ ciclosTotales;      
        dbRef = firebase.database().ref(dbPath);
      });
      chartT = createTemperatureChart('PT100', 'chart-temperature');
      chartT2 = createTemperatureChart('PT100', 'chart-temperature2');
      chartP = createPressureChart();
      // CHARTS      
        dbRef.orderByKey().on('child_added', snapshot => {          
          const childCount = snapshot.numChildren();          
          const chartRange = childCount > 100 ? 100 : childCount; // Limita el rango de la grafica a 100 datos
          dbRef.orderByKey().limitToLast(chartRange).on('child_added', snapshot => {
            var jsonData = snapshot.toJSON(); //convierte el snapshot a JSON            
            var temperature1 = jsonData.temperature1;
            var temperature2 = jsonData.temperature2;
            var pressure1 = jsonData.presionC;
            var timestamp = jsonData.timestamp;            
            plotValues(chartT, timestamp, temperature1);          
            plotValues(chartT2, timestamp, temperature2);          
            plotValues(chartP, timestamp, pressure1);
          });
        });      
    
      // CARDS
      // Get the latest readings and display on cards
      dbRef.orderByKey().limitToLast(1).on('child_added', snapshot =>{
        var jsonData = snapshot.toJSON(); // example: {temperature: 25.02, pressure: 1008.48, timestamp:1641317355}        
        var temperature1 = jsonData.temperature1;
        var temperature2 = jsonData.temperature2;
        var temperature3 = jsonData.temperature3;
        var temperature4 = jsonData.temperature4;
        var pressure1 = jsonData.presionC;
        var pressure2 = jsonData.presionP;
        var timestamp = jsonData.timestamp;
        // Update DOM elements
        tempElement1.innerHTML = temperature1;
        tempElement2.innerHTML = temperature2;
        tempElement3.innerHTML = temperature3;
        tempElement4.innerHTML = temperature4;
        presElement1.innerHTML = pressure1;
        presElement2.innerHTML = pressure2;
        updateElement.innerHTML = epochToDateTime(timestamp);
      });
  
      // DELETE DATA
      // Add event listener to open modal when click on "Delete Data" button
      deleteButtonElement.addEventListener('click', e =>{
        console.log("Remove data");
        e.preventDefault;
        deleteModalElement.style.display="block";
      });
  
      // Add event listener when delete form is submited
      deleteDataFormElement.addEventListener('submit', (e) => {
        dbRef.remove();
      });
  
      // TABLE
      var lastReadingTimestamp; //saves last timestamp displayed on the table
      function createTable(){        
        var firstRun = true;
        dbRef.orderByKey().on('child_added', function(snapshot) {
          if (snapshot.exists()) {
            var jsonData = snapshot.toJSON();
            var usuario = jsonData.usuario;
            var ciclo = jsonData.ciclo;
            var temperature1 = jsonData.temperature1;
            var temperature2 = jsonData.temperature2;
            var temperature3 = jsonData.temperature3;
            var temperature4 = jsonData.temperature4;
            var pressure1 = jsonData.presionC;
            var pressure2 = jsonData.presionP;
            var alarma = jsonData.alarma;
            var timestamp = jsonData.timestamp;
            var content = '';
            console.log(codeToAlarma(alarma))
            content += '<tr>';
            content += '<td>' + epochToDateTime(timestamp) + '</td>';
            content += '<td>' + codeToUser(usuario) + '</td>';
            content += '<td>' + codeToCiclo(ciclo) + '</td>';
            content += '<td>' + temperature1 + '</td>';
            content += '<td>' + temperature2 + '</td>';
            content += '<td>' + temperature3 + '</td>';
            content += '<td>' + temperature4 + '</td>';            
            content += '<td>' + pressure1 + '</td>';
            content += '<td>' + pressure2 + '</td>';
            content += '<td>' + codeToAlarma(alarma) + '</td>';
            content += '</tr>';
            $('#tbody').prepend(content);
            // Save lastReadingTimestamp --> corresponds to the first timestamp on the returned snapshot data
            if (firstRun){
              lastReadingTimestamp = timestamp;
              firstRun=false;
              console.log(lastReadingTimestamp);
            }
          }
        });
      };
  
      function codeToCiclo(ciclo){
        if(ciclo==0){
          return "Ninguno";
        }else if(ciclo==1){
          return "Liquidos A"
        }else if(ciclo==2){
          return "Liquidos B"
        }else if(ciclo==3){
          return "Liquidos C"
        }else if(ciclo==4){
          return "Envueltos 134"
        }else if(ciclo==5){
          return "Envueltos 121"
        }else if(ciclo==6){
          return "Envuelto Doble 1"
        }else if(ciclo==7){
          return "Envuelto Doble 2"
        }else if(ciclo==8){
          return "Prion"
        }else if(ciclo==9){
          return "Bowie & Dick"
        }else if(ciclo==10){
          return "Test de Fugas"
        }else if(ciclo>10 && ciclo<31){
          return "Personalizado "+(ciclo-10)
        }
      }
      function codeToUser(usuario){
        if(usuario==0){
          return "Administrador";
        }else if(usuario==1){
          return "Operador 1"
        }else if(usuario==2){
          return "Operador 2"
        }else if(usuario==3){
          return "Operador 3"
        }else if(usuario==4){
          return "Operador 4"
        }else if(usuario==5){
          return "Operador 5"
        }else if(usuario==6){
          return "Operador 6"
        }else if(usuario==7){
          return "Operador 7"
        }else if(usuario==8){
          return "Operador 8"
        }else if(usuario==9){
          return "Tecnico"
        }else{
          return "----"
        }
      }
      function codeToAlarma(codigo){
        if(codigo==0){
          return "----";
        }else if(codigo==1){
          return "Parada de Emergencia"
        }else if(codigo==2){
          return "Puerta Abierta"
        }else if(codigo==3){
          return "Termostato"
        }else if(codigo==4){
          return "Sobre Temperatura"
        }else if(codigo==5){
          return "Tiempo Prolongado de Calentamiento"
        }else if(codigo==6){
          return "Sobre Presion"
        }else if(codigo==7){
          return "Error en Bomba de Vacio"
        }else if(codigo==8){
          return "Error de Vacio"
        }else if(codigo==10){
          return "Pre-Calentando"
        }else if(codigo==11){
          return "Pre-Vacio"
        }else if(codigo==12){
          return "Calentando"
        }else if(codigo==13){
          return "Despresurizando"
        }else if(codigo==14){
          return "Ciclo Finalizado"
        }else if(codigo==15){
          return "Secando"
        }else if(codigo==16){
          return "Esterilizando"
        }else{
          return "----";
        }
      }
        
      viewDataButtonElement.addEventListener('click', (e) =>{
        // Toggle DOM elements
        tableContainerElement.style.display = 'block';
        viewDataButtonElement.style.display ='none';
        hideDataButtonElement.style.display ='inline-block';
        createTable();
      });
    
      hideDataButtonElement.addEventListener('click', (e) => {
        tableContainerElement.style.display = 'none';
        viewDataButtonElement.style.display = 'inline-block';
        hideDataButtonElement.style.display = 'none';
      });
  
    // IF USER IS LOGGED OUT
    } else{
      // toggle UI elements
      loginElement.style.display = 'block';
      authBarElement.style.display ='none';
      userDetailsElement.style.display ='none';
      contentElement.style.display = 'none';
      sidebar.style.display='none';
    }
  }