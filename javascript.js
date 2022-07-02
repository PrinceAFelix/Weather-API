class Sun{
    constructor(sunsetT, sunriseT){
        this.sunset = sunsetT;
        this.sunrise = sunriseT;
    }

    set SunriseTime(time){
        this.sunrise = time;
    }

    set SunsetTime(time){
        this.sunset = time;
    }

    get SunsetTime(){
        return this.sunset;
    }

    get SunriseTime(){
        return this.sunrise;
    }
     
    
}

var sunsetDt;
var sunriseDt;

function weather(cityName){
    let apikey = '17691d99c39c2957f8d965dc8ffd8343';

    fetch('https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=17691d99c39c2957f8d965dc8ffd8343')
    .then((response) => {
        if (!response.ok) {
          
          throw new Error("No weather found.");
        }
        return response.json();
      })
    .then((data) => displayWeather(data));
}

function getCityCoordinates(cityName){
    let apikey = '17691d99c39c2957f8d965dc8ffd8343';
    fetch('http://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=5&appid=' + apikey)
    .then((response) => {
        if (!response.ok) {
          
          throw new Error("No weather found.");
        }
        return response.json();
      })
    .then((data) => getLatLon(data));
}


//lat=45.4112
//lon=-75.6981
function futureWeather(lat, lon){
    let apikey = '17691d99c39c2957f8d965dc8ffd8343';

    //api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
    fetch('https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=' + apikey)
    .then((response) => {
        if (!response.ok) {
          
          throw new Error("No weather found.");
        }
        return response.json();
      })
    .then((data) => displayFutureWeather(data));
}

function getLatLon(data){
    const { lat, lon} = data[0];
    futureWeather(lat, lon);
}




function displayFutureWeather(data){
    var weatherIconSRC = "";
    var time;
    var main = "";
    var sun = new Sun(sunsetDt.getHours() % 12, sunriseDt.getHours() % 12);
    
    
    for(i = 1; i < 40; i++){
        main = data.list[i].weather[0].main;
        time = convertTime(new Date(data.list[i].dt * 1000), true);

        if(time.includes("PM") && time.replace(/\D/g, "") >= sun.sunset){
            var tempName = "";
            switch (main) {
                case "Clear":
                    tempName = "Clear-night"
                    break;
                case "Clouds":
                    tempName = "Cloudy-night"
                    break;
                default:
                    break;
            }
            weatherIconSRC = "/images/weather-icons/" + tempName + ".png";
        }else{
            weatherIconSRC = "/images/weather-icons/" + main + ".png";
        }
        
        document.getElementById("forecast-time" + i).innerHTML = time;
        document.getElementById("weather-icon" + i).src =  weatherIconSRC;
        document.getElementById("weather" + i).innerHTML = Math.round(data.list[i].main.temp - 273.15) + '°';
    }
    
}

        
function searched(){
    getCityCoordinates(document.querySelector(".searchField").value);
    weather(document.querySelector(".searchField").value);
    document.querySelector(".searchField").value = "";
    return;
    
}

function displayWeather(data){
    const { name, visibility} = data;
    const { feels_like, temp_min, temp_max, temp, humidity,  pressure} = data.main;
    const { icon, description } = data.weather[0];
    const { sunset, sunrise } = data.sys;
    const { speed, deg } = data.wind;


    var celciusTemp = Math.round(temp - 273.15);
    var minTemp = Math.round(temp_min - 273.15);
    var maxTemp = Math.round(temp_max - 273.15);
    var feelsTemp = Math.round(feels_like - 273.15);

    sunsetDt = new Date(sunset*1000);
    sunriseDt = new Date(sunrise*1000);

    
    

    
    //Capitalize first letter
    var desc = description.split(" ");
    for (let i = 0; i < desc.length; i++) {
        desc[i] = desc[i][0].toUpperCase() + desc[i].substr(1);
    }
    
    document.querySelector(".city").innerHTML = name;
    document.querySelector(".temp").innerHTML = celciusTemp + '°';
    document.querySelector(".description").innerHTML = desc.join(" ");;
    document.querySelector(".min").innerHTML = "L:" + minTemp + '°';
    document.querySelector(".max").innerHTML = "H:" + maxTemp + '°';
    document.querySelector(".feels-like-temp").innerHTML = feelsTemp + '°';
    document.querySelector(".flt-msg").innerHTML = feelsTemperatureMsg(celciusTemp, feelsTemp);
    document.querySelector(".humid").innerHTML = humidity + '%';
    document.querySelector(".dew-point").innerHTML = dewPointCalc(celciusTemp, humidity);
    document.querySelector(".vsblty").innerHTML = (visibility/1000) + " km";
    document.querySelector(".sunsetTime").innerHTML = convertTime(sunsetDt, false) + 'PM';
    document.querySelector(".sunriseTime").innerHTML = 'Sunrise: ' + convertTime(sunriseDt, false) + 'AM';
    document.querySelector(".windSpeed").innerHTML = Math.round((speed * 3.6)) ;
    document.getElementById("speedLabel").innerHTML = "km/h";
    document.querySelector(".hPa").innerHTML = pressure.toLocaleString();
    document.getElementById("hpaLabel").innerHTML = "hPa";

    
}


document.querySelector(".searchContainer #searchBtn").addEventListener("click", function() {
    searched();
})

document.querySelector(".searchField").addEventListener("keypress", function(event) {
    if(event.key == "Enter") {
        searched();
    } 
})

function getCoor(){
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      function success(pos) {
        const crd = pos.coords;
        
        var lat = crd.latitude.toString();
        var lng = crd.longitude.toString();

        var coordinates = [lat, lng];

        getCity(coordinates);

        return;

      }
      
      function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      }
      
      navigator.geolocation.getCurrentPosition(success, error, options);
}

function getCity(coordinates){
    var xhr = new XMLHttpRequest();
    var lat = coordinates[0];
    var lng = coordinates[1];

    //pk.6eff11d2dd5c4fbf4f82d3ed41476434

    xhr.open('GET', "https://us1.locationiq.com/v1/reverse.php?key=pk.6eff11d2dd5c4fbf4f82d3ed41476434&lat=" +
    lat + "&lon=" + lng + "&format=json", true);
    xhr.send();
    xhr.onreadystatechange = processRequest;
    xhr.addEventListener("readystatechange", processRequest, false);

    function processRequest(e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            var city = response.address.city;
            weather(city);
            futureWeather(lat, lng);
            return;
        }
    }

}
//lat=45.4112
//lon=-75.6981
window.onload = () => {
    getCoor();

}


function feelsTemperatureMsg(actualTemp, temp){
    var message = [
        'Similar to the actual temperature.',
        'Wind is making it feel cooler.',
        'Humidity is making it feel warmer.'
    ];

    if(temp == actualTemp){
        return message[0];
    }else if(temp > actualTemp){
        return message[2];
    }else{
        return message[Math.floor(Math.random() * message.length)];
    }
    
}


function dewPointCalc(temp, humid){

    var t = temp;
    var rh = humid;

    var top = 243.12 * (Math.log(rh/100) + (17.62 * t) / (243.12 + t));
    var btm = 17.62 - (Math.log(rh/100) +  (17.62 * t) / (243.12 + t));

    return "The due point is " + Math.round(top/btm) + "° right now";

}

function convertTime(date, isFuture){

    var hr = date.getHours();

    var timeLabel = hr >= 12 ? 'PM' : 'AM';
    
    hr = (hr % 12) || 12;

    var min = date.getMinutes() < 10 ? '0' +  date.getMinutes() : date.getMinutes();
    
   

    if(isFuture){
        return hr + timeLabel;
    }

    return hr + ':' + min;
    
}