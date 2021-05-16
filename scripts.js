var map;
var userPos = {active: null, lat: null, lng: null};
var userMarker;
var resultArr = []
var resultsSwitch = []
var foodArr = []
var statsArr = []
var selectedInfo;
var selectedMarker;
var åldersVal;
var vistelseVal;
var barnVal;
var switchMe
var resOut = document.getElementById("resOut")
var modal = document.getElementById("modal") 
var travelBtns = document.getElementsByClassName("trlBtns")
var travelBtnsArea = document.getElementById("travelModes")
var directions = document.getElementById("directions");
var output = document.getElementById("innerFullHeight");
var åldersgrupp = document.getElementsByName("åldersgrupp");
var vistelse = document.getElementsByName("vistelse");
var barn = document.getElementsByName("barn");
var displayElements = document.getElementsByClassName("result")
var gdpr =  document.getElementById('gdpr')
var newNode
var oldNode
var topParent
var directionsService
var directionsRenderer
var start
var destination
var showDirections = false;
var urlSwitch =  ""//"http://localhost/turistguiden/"
const locations = data; //  JSONdata

window.onload = function() {
    

    switch(localStorage.FirstVisit){
        case undefined:
            gdpr.style.display = 'block';
            gdpr.style.position = 'absolute';
            gdpr.style.backgroundColor = "whitesmoke"
            gdpr.style.top = "90vh"
            gdpr.style.padding = "10px"
            gdpr.style.fontFamily = "Arial"
            gdpr.style.fontWeight = "600"
            gdpr.style.borderRadius = "3px"

            localStorage.FirstVisit = "1";
            break;
        case "1":
            gdpr.style.display = "none";
            break;
    }
    
    
}

hideBottomPage("hide")


function begin() {
    
    scrollIntoView("controls");

}


function initMap() {    //  Skapa karta
    var mapProp = {
        center: new google.maps.LatLng(60.67452, 17.14174),
        zoom: 11,
    };
    map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map)
    travelBtnsArea.style.display = 'none'
}


function reset() {  //  Rensa val
    function clearRadio(category) {
        for (var i = 0; i < category.length; i++) {
            category[i].checked = false;
        };
    }
    clearRadio(åldersgrupp);
    clearRadio(vistelse);
    clearRadio(barn);
};


function scrollIntoView(id) {   //  Scrolla sidan till valt element
    element = '#' + id;
    $(element)[0].scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function change() { //  När val görs

    clearAllMarkers();
    output.innerHTML = ""
    resultArr = []
    foodArr = []
    

    scrollIntoView("controls")

    output.innerHTML = "";
    
    for (var i = 0; i < åldersgrupp.length; i++) {  //  Samla val

        if (åldersgrupp[i].checked) {

            åldersVal = åldersgrupp[i].value;


        }
    }

    for (var i = 0; i < vistelse.length; i++) {

        if (vistelse[i].checked) {

            vistelseVal = vistelse[i].value;

        }

    }

    for (var i = 0; i < barn.length; i++) {

        if (barn[i].checked) {

            barnVal = barn[i].value;

        }

    }
    
    var y = 0;  

    for (var i = 0; i < locations.platser.length; i++) {    //  Förbered visning av valresultat

        if (locations.platser[i].ålder.includes(åldersVal) && locations.platser[i].aktivitetstyp.includes(vistelseVal) && locations.platser[i].barn.includes(barnVal)) {
            
            let resultDivs = document.createElement("div")  //  Skapa div

            if(locations.platser[i].kundtyp.includes("grund")){
                infoBlock = 
                    `<div class="infoBox">
                        <p>${locations.platser[i].öppet}</p>
                        <p><a class="statLink" href="${locations.platser[i].url}" onclick="stat('${locations.platser[i].namn}')">Hemsida</a></p>
                        <p><a href="mailto:${locations.platser[i].mejl}">${locations.platser[i].mejl}</a></p>
                        <p><img src="img/phone.png"/> ${locations.platser[i].telefon}</p>
                        <p>${locations.platser[i].adress}</p>
                    </div>`

            } else {
                infoBlock = ''
            }

            textContent = 
                `<div class='resultFlex'>
                    <div class="resultTextFlex">
                        <h3>${locations.platser[i].namn}</h3>
                        <div class="descTextFlex">
                            <p>${locations.platser[i].beskrivning}</p>
                            ${infoBlock}
                        </div>
                    </div>
                        <div class="resultBtnFlex">
                        <button onclick='selectLocation(this)' id="${y}" class="selectThis">Vägbeskrivning</button>
                        <button onclick="switchActivity(this)" id="${y}" class="changeThis">Byt ut</button>
                        <button onclick='pick(this)' id="${y}" class="pickThis">Välj</button>
                        </div>
                    </div>
                </div>`;

            resultDivs.className = "result"
            resultDivs.id = y
            resultDivs.style.backgroundImage = `url('${urlSwitch}img/places/${locations.platser[i].namn.replace(/[\s\u007C\u0026]/g, '')}.jpg')`
            resultDivs.innerHTML = textContent

            const contentString =   //  Skapa markörer och deras infofönster till karta
                `<div class="infoBlock">
                <h4>${locations.platser[i].namn}</h4>
                <p>${locations.platser[i].beskrivning}</p>
                </div>`

            const infoWindow = new google.maps.InfoWindow({
                id: y,
                content: contentString
            })

            const marker = new google.maps.Marker({
                id: y,
                position: {
                    lat: locations.platser[i].lat,
                    lng: locations.platser[i].lng
                },
                title: locations.platser[i].namn,
                map: null
            })
            
            marker.addListener("click", (el) => {

                for (var i = 0; i < resultArr.length; i++) {

                    resultArr[i].infoWindow.close(map);

                }

                infoWindow.open(map, marker);
                
                calculateDirections(el)

            })
            
            let resultObj = {
                food: locations.platser[i].matställe,
                id: locations.platser[i].id, //id
                num: y, //num
                name: locations.platser[i].namn, //name
                div: resultDivs, //div
                contentString: contentString, //...
                infoWindow: infoWindow, //...
                marker: marker,  //...
                filter: locations.platser[i].filter
                
            }


            if(resultObj.food.includes("Ja") && !resultObj.filter.includes(String(åldersVal + barnVal))) {    //  Filter för ålder + barn + mat

                foodArr.push(resultObj)

            } else
            if(!resultObj.filter.includes(String(åldersVal + barnVal))) {    //  Filter för ålder + barn

                resultArr.push(resultObj)

            }


            shuffle(foodArr)
            shuffle(resultArr)
            
            y += 1;
            
        }
        
    }

    if (åldersVal != null && vistelseVal != null && barnVal != null) {

        mixArrays()
        showUserLocation();
        renderResults()
        hideBottomPage("show")
        scrollIntoView("output");

    } 

  
}


function shuffle(array) {   //  Slumpa arrayer

    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
    
  }


function hideBottomPage(c) {

    if(c === "hide") {

        document.getElementById("output").style.display = "none"
        document.getElementById("mapArea").style.display = "none"

    } else if(c === "show") {

        document.getElementById("output").style.display = "block"
        document.getElementById("mapArea").style.display = "flex"

    }
    
}


function mixArrays() {

    //console.log(resultArr.length)

    for(var i = 0, j = 0; i < resultArr.length; i++) {
        
        if( i % 2 == 1 && foodArr[j]) {

            resultArr.splice( i, 0, foodArr[j])

            j++
        }

        if( i > 9 ) {

            resultArr.splice( i )

        }

    }

}


function renderResults() {
    
    statsArr = []
    directionsRenderer.setMap(null)
    
    output.innerHTML = ""  


    for(var i = 0; i < resultArr.length; i++) { // Ta bort markörer

            resultArr[i].marker.setMap(null)
            resultArr[i].infoWindow.close(map)
    }

    for(var i = 0; i < resultArr.length; i++) {

        if( i < 5 ) {

            output.appendChild(resultArr[i].div) 
            resultArr[i].marker.setMap(map)


            let obj = { id: resultArr[i].id, name: resultArr[i].name } //  Förbered array för POST till databas
            statsArr.push(JSON.stringify(obj))

        }

    }

    sendViewsToDB()
    showHideBtns("modalClosed")

}


function switchActivity(el) {   //  Ändra aktivitet på resultatlistan

    statsArr = []
    switchMe = el
    modal.style.display = "flex"

    for (var i = 0; i < resultArr.length; i++) {

        if( i > 4 ) {

            resOut.appendChild(resultArr[i].div) 

            let obj = { id: resultArr[i].id, name: resultArr[i].name } //  Förbered array för POST till databas
            statsArr.push(JSON.stringify(obj))

        }

    }   

    sendViewsToDB()
    showHideBtns("modalOpen")
    resOut.focus()

}


function showHideBtns(a) {

    let pickThis = document.getElementsByClassName("pickThis")
    let selectThis = document.getElementsByClassName("selectThis")
    let changeThis = document.getElementsByClassName("changeThis")

    if(a == "modalOpen") {
        for(var i = 0; i < pickThis.length; i++) {
        
            pickThis[i].style.display = "inline-block"
            selectThis[i].style.display = "none"
            changeThis[i].style.display = "none"

        } 

    } else if(a == "modalClosed"){

        for(var i = 0; i < pickThis.length; i++) {
    
            pickThis[i].style.display = "none"
            selectThis[i].style.display = "inline-block"
            changeThis[i].style.display = "inline-block"

        }

    }

}


function pick(el) {   //  Fäst vald aktivitet på sidan

    newNode = el.parentNode.parentNode.parentNode.id
    oldNode = switchMe.parentNode.parentNode.parentNode.id
    var a
    var b
    closeModal()

    for(var i = 0; i < resultArr.length; i++) {

        if(resultArr[i].num == newNode){

            a = i

        }

        if(resultArr[i].num == oldNode){

            b = i

        }       

    }

    let swapPositions = (array, a ,b) => {

        [array[a], array[b]] = [array[b], array[a]]
        
    }
    
    swapPositions(resultArr,a,b)

    renderResults()
   
}


function closeModal() {
    
    modal.style.display = "none"

    resOut.innerHTML = ""

    showHideBtns("modalClosed")

}


//  TODO
//
//
//
//
//
//  Framtida funktion för att visa info om platser genom modal


function selectLocation(el) {   //  Klick på resultatruta
    
    topParent = el.parentNode.parentNode.parentNode
    
    for (var i = 0; i < resultArr.length; i++) {

        resultArr[i].infoWindow.close(map);
        
        if (resultArr[i].num == el.id) {
            
            resultArr[i].infoWindow.open(map, selectedMarker)
            let obj = { latLng: { lat: function() {return resultArr[i].marker.position.lat()}, lng: function() { return resultArr[i].marker.position.lng()} }}
            calculateDirections(obj)
        
        }
    
    }

    let results = document.getElementsByClassName('result')
  
    topParent.style.border = "1px solid #4099d3"
    
    scrollIntoView("mapArea")

}


function clearAllMarkers() {    //  Rensa alla markörer och deras info från karta

    for (var i = 0; i < resultArr.length; i++) {

            resultArr[i].marker.setMap(null)

    }

}


function orderAndDisplay() {    //  Visa bara de fem första resultaten

    if(resultArr.length > 0) {

        for(var i = 0; i < resultArr.length; i++) {

            if( i <= 4 ) {
                
                    resultArr[i].marker.setMap(map);
                
            }

            if( i > 4 ) {
                resultArr[i].style.display = 'none'
                
                resultArr[i].marker.setMap(null);
                
            }

        }
    }
}


//Geolocation
//var x = document.getElementById("geo");
function getLocation() {

    if (navigator.geolocation) {

        navigator.geolocation.watchPosition(showPosition, showError);

    }

}


function showPosition(position) {
    
    
    userPos = {active: "yes", lat: position.coords.latitude, lng: position.coords.longitude}

}


function showError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation.")
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.")
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.")
        break;
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.")
        break;
    }

}

  
function showUserLocation() {   //  Visa användaren på kartan

    if(userPos.active === "yes"){
        
        userMarker = new google.maps.Marker({
            id: "userPos",
            position: {
                lat: userPos.lat,
                lng: userPos.lng
            },
            title: "Du är här",
            icon: "../turistguiden/img/userIcon.png",
            map: map
        });

        userMarker.setMap(map)

    }

}


function calculateDirections(el) {

    if(userPos.active == "yes"){

        start = new google.maps.LatLng(userPos.lat, userPos.lng)
        destination = new google.maps.LatLng(el.latLng.lat(), el.latLng.lng())
        directionsRenderer.setMap(map)

        let request = {
            origin: start,
            destination: destination,
            travelMode: 'DRIVING',
        } 

        directionsService.route(request, function(response, status){

            if(status = "OK"){

                directionsRenderer.setDirections(response);
                directionsRenderer.setPanel(document.getElementById("directions"));
                map.controls[google.maps.ControlPosition.TOP_CENTER].push();

                directions.style.display = 'block',
                directions.style.backgroundColor = '#eee'
                travelBtnsArea.style.display = 'block'
                travelBtnsArea.style.display = 'flex'
                travelBtnsArea.style.backgroundColor = 'rgb(211, 211, 211)'
                travelBtnsArea.style.paddingBottom = '1px'

                for(var i = 0; i < travelBtns.length; i++){

                    travelBtns[i].style.borderBottom = "1px solid grey"
                    travelBtns[i].style.borderRight = "1px solid grey"
                    travelBtns[i].style.backgroundColor = 'rgb(238, 238, 238)'

                }

            }

        })
    } else {

        getLocation()

    }
            
}


function changeTransport(mode) {

    let request = {
        origin: start,
        destination: destination,
        travelMode: mode,
    } 

    directionsService.route(request, function(response, status){

        if(status = "OK"){

        directionsRenderer.setDirections(response);
        directionsRenderer.setPanel(document.getElementById("directions"));
        map.controls[google.maps.ControlPosition.TOP_CENTER].push();

        }

    })

}


function specialTour(e) {

    clearAllMarkers();
    output.innerHTML = ""
    resultArr = []

    if( e.id === "tour1"){
        var getArr = [36, 37, 29, 38, 25]
    }
    if( e.id === "tour2"){
        var getArr = [56, 26, 32, 21, 44]
    }
    if( e.id === "tour3"){
        var getArr = [13, 15, 31, 18]
    }

    var y = 0;  

    for (var i = 0; i < locations.platser.length; i++) {    //  Förbered visning av valresultat

        if (getArr.includes(locations.platser[i].id)) {
            
            let resultDivs = document.createElement("div")  //  Skapa div

            if(locations.platser[i].kundtyp.includes("grund")){
                infoBlock = 
                `<div class="infoBox">
                <p>${locations.platser[i].öppet}</p>
                <p><a href="${locations.platser[i].url}">Hemsida</a></p>
                <p><a href="mailto:${locations.platser[i].mejl}">${locations.platser[i].mejl}</a></p>
                <p><img src="img/phone.png"/> ${locations.platser[i].telefon}</p>
                </div>`
            } else {
                infoBlock = ''
            }

            textContent = 
                `<div class='resultFlex'>
                    <div class="resultTextFlex">
                        <h3>${locations.platser[i].namn}</h3>
                        <div class="descTextFlex">
                            <p>${locations.platser[i].beskrivning}</p>
                            ${infoBlock}
                        </div>
                    </div>
                        <div class="resultBtnFlex">
                        <button onclick='selectLocation(this)' id="${y}" class="selectThis">Vägbeskrivning</button>
                        </div>
                    </div>
                </div>`;

            resultDivs.className = "result"
            resultDivs.id = y
            resultDivs.style.backgroundImage = `url('${urlSwitch}img/places/${locations.platser[i].namn.replace(/[\s\u007C\u0026]/g, '')}.jpg')`
            resultDivs.innerHTML = textContent

            const contentString =   //  Skapa markörer och deras infofönster till karta
                `<div class="infoBlock">
                <h4>${locations.platser[i].namn}</h4>
                <p>${locations.platser[i].beskrivning}</p>
                </div>`

            const infoWindow = new google.maps.InfoWindow({
                id: y,
                content: contentString
            })

            const marker = new google.maps.Marker({
                id: y,
                position: {
                    lat: locations.platser[i].lat,
                    lng: locations.platser[i].lng
                },
                title: locations.platser[i].namn,
                map: null
            })
            
            marker.addListener("click", (el) => {

                for (var i = 0; i < resultArr.length; i++) {

                    resultArr[i].infoWindow.close(map);

                }

                infoWindow.open(map, marker);
                
                calculateDirections(el)

            })
            
            let resultObj = {
                food: locations.platser[i].matställe,
                id: locations.platser[i].id, //id
                num: y, //num
                name: locations.platser[i].namn, //name
                div: resultDivs, //div
                contentString: contentString, //...
                infoWindow: infoWindow, //...
                marker: marker,  //...
                filter: locations.platser[i].filter
                
            }


            resultArr.push(resultObj)
        }

    }

    y++

    showUserLocation()
    renderResults()
    hideBottomPage("show")
    scrollIntoView("output")
    //console.log(resultArr)

}


function sendViewsToDB() {


    

    var data = { "arr[]" : statsArr }

    $.post({ 
        url:  'https://quickguides.se/stats.php',
        data: data
    });

}

function stat(namn) {

    event.preventDefault()
    url = event.target.href
    console.log('skicka ' + namn + ' till databas och gå sedan hit: ' + event.target.href)

    $.post({ 
        url:  'https://quickguides.se/clickStats.php',
        data: namn
    }).done(
        function(){
            window.location = url
        }
    )
    

}


getLocation();