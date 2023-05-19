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
    /*if(chart.series[0].data.length > 40) {
      chart.series[0].addPoint([x, y], true, true, true);
    } else {
      chart.series[0].addPoint([x, y], true, false, true);
    }*/
  }
  
  // DOM elements
  const loginElement = document.querySelector('#login-form');
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
  const cardsCheckboxElement = document.querySelector('input[name=cards-checkbox]');
  const gaugesCheckboxElement = document.querySelector('input[name=gauges-checkbox]');
  const chartsCheckboxElement = document.querySelector('input[name=charts-checkbox]');
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
      loginElement.style.display = 'none';
      contentElement.style.display = 'block';
      authBarElement.style.display ='block';
      userDetailsElement.style.display ='block';
      userDetailsElement.innerHTML = user.email;
  
      // get user UID to get data from database
      var uid = user.uid;
      console.log(uid);
  
      // Database paths (with user UID)
      var dbPath = 'UsersData/' + uid.toString() + '/readings';
      var chartPath = 'UsersData/' + uid.toString() + '/charts/range';
  
      // Database references
      var dbRef = firebase.database().ref(dbPath);
      var chartRef = firebase.database().ref(chartPath);
  
      dbRef.on('value', snapshot =>{
        console.log('Tamaño de Snapshot:'+snapshot.numChildren())
      });

      // CHARTS
      // Number of readings to plot on charts
      var chartRange = 0;
      // Get number of readings to plot saved on database (runs when the page first loads and whenever there's a change in the database)
      chartRef.on('value', snapshot =>{
        
        //chartRange = Number(snapshot.val());
        // Render new charts to display new range of data
        chartT = createTemperatureChart('PT100', 'chart-temperature');
        chartT2 = createTemperatureChart('PT100', 'chart-temperature2');
        chartP = createPressureChart();
        // Update the charts with the new range
        // Get the latest readings and plot them on charts (the number of plotted readings corresponds to the chartRange value)
        
        // Delete all data from charts to update with new values when a new range is selected
        //chartT.destroy();        
        //chartP.destroy();
        dbRef.orderByKey().on('value', snapshot => {
          const childCount = snapshot.numChildren();          
          const chartRange = childCount > 100 ? 100 : childCount; // Set chartRange limit to 10 or the number of child nodes, whichever is smaller
          dbRef.orderByKey().limitToLast(chartRange).on('child_added', snapshot => {
            var jsonData = snapshot.toJSON(); // example: {temperature: 25.02, humidity: 50.20, pressure: 1008.48, timestamp:1641317355}
            // Save values on variables
            var temperature1 = jsonData.temperature1;
            var temperature2 = jsonData.temperature2;
            var pressure1 = jsonData.presionC;
            var pressure2 = jsonData.presionP;
            var timestamp = jsonData.timestamp;
            // Plot the values on the charts
            plotValues(chartT, timestamp, temperature1);          
            plotValues(chartT2, timestamp, temperature2);          
            plotValues(chartP, timestamp, pressure1);
          });
        });
      });
    
      // CARDS
      // Get the latest readings and display on cards
      dbRef.orderByKey().limitToLast(1).on('child_added', snapshot =>{
        var jsonData = snapshot.toJSON(); // example: {temperature: 25.02, humidity: 50.20, pressure: 1008.48, timestamp:1641317355}        
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
        // delete data (readings)
        dbRef.remove();
      });
  
      // TABLE
      var lastReadingTimestamp; //saves last timestamp displayed on the table
      // Function that creates the table with the first 100 readings
      function createTable(){
        // append all data to the table
        var firstRun = true;
        dbRef.orderByKey().on('child_added', function(snapshot) {
          if (snapshot.exists()) {
            var jsonData = snapshot.toJSON();
            var temperature1 = jsonData.temperature1;
            var temperature2 = jsonData.temperature2;
            var temperature3 = jsonData.temperature3;
            var temperature4 = jsonData.temperature4;
            var pressure1 = jsonData.presionC;
            var pressure2 = jsonData.presionP;
            var timestamp = jsonData.timestamp;
            var content = '';
            content += '<tr>';
            content += '<td>' + epochToDateTime(timestamp) + '</td>';
            content += '<td>' + temperature1 + '</td>';
            content += '<td>' + temperature2 + '</td>';
            content += '<td>' + temperature3 + '</td>';
            content += '<td>' + temperature4 + '</td>';            
            content += '<td>' + pressure1 + '</td>';
            content += '<td>' + pressure2 + '</td>';
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
  
      // append readings to table (after pressing More results... button)
      function appendToTable(){
        var dataList = []; // saves list of readings returned by the snapshot (oldest-->newest)
        var reversedList = []; // the same as previous, but reversed (newest--> oldest)
        console.log("APEND");
        dbRef.orderByKey().limitToLast(100).endAt(lastReadingTimestamp).once('value', function(snapshot) {
          // convert the snapshot to JSON
          if (snapshot.exists()) {
            snapshot.forEach(element => {
              var jsonData = element.toJSON();
              dataList.push(jsonData); // create a list with all data
            });
            lastReadingTimestamp = dataList[0].timestamp; //oldest timestamp corresponds to the first on the list (oldest --> newest)
            reversedList = dataList.reverse(); // reverse the order of the list (newest data --> oldest data)
  
            var firstTime = true;
            // loop through all elements of the list and append to table (newest elements first)
            reversedList.forEach(element =>{
              if (firstTime){ // ignore first reading (it's already on the table from the previous query)
                firstTime = false;
              }
              else{
                var temperature1 = element.temperature1;
                var temperature2 = element.temperature2;
                var temperature3 = element.temperature3;
                var temperature4 = element.temperature4;
                var pressure1 = element.pressure1;
                var pressure2 = element.pressure2;
                var timestamp = element.timestamp;
                var content = '';
                content += '<tr>';
                content += '<td>' + epochToDateTime(timestamp) + '</td>';
                content += '<td>' + temperature1 + '</td>';
                content += '<td>' + temperature2 + '</td>';
                content += '<td>' + temperature3 + '</td>';
                content += '<td>' + temperature4 + '</td>';
                content += '<td>' + pressure1 + '</td>';
                content += '<td>' + pressure2 + '</td>';
                content += '</tr>';
                $('#tbody').append(content);
              }
            });
          }
        });
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
    }
  }