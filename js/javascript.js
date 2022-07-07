'use strict'
import {Sun, Weather} from './sun-model.js'
import {getCurrentWeather, getFutureWeather, getCityCoordinates} from './weather-api-service.js'

var sunsetDt;
var sunriseDt;
var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

var weatherObj;

const main = {
    locKey: 'pk.6eff11d2dd5c4fbf4f82d3ed41476434',
    init: () =>{
        main.getCoor()
    },
    fetchWeather: async (city) => {
        const data = await getCurrentWeather(city);
        return main.displayWeather(data);
    },
    fetchFutureWeather: async (lat, lon) =>{
         console.log("fetchFutureWeather")
        const data = await getFutureWeather(lat, lon);
       
        return await main.displayFutureWeather(data);
    },
    fetchCityCoord: async (city) =>{
        const data = await getCityCoordinates(city)
        return main.getLatLon(data);
    },
    displayWeather: function (data) {
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
        document.querySelector(".flt-msg").innerHTML = main.feelsTemperatureMsg(celciusTemp, feelsTemp);
        document.querySelector(".humid").innerHTML = humidity + '%';
        document.querySelector(".dew-point").innerHTML = main.dewPointCalc(celciusTemp, humidity);
        document.querySelector(".vsblty").innerHTML = (visibility/1000) + " km";
        document.querySelector(".sunsetTime").innerHTML = main.convertTime(sunsetDt, false) + 'PM';
        document.querySelector(".sunriseTime").innerHTML = 'Sunrise: ' + main.convertTime(sunriseDt, false) + 'AM';
        document.querySelector(".windSpeed").innerHTML = Math.round((speed * 3.6)) ;
        document.getElementById("speedLabel").innerHTML = "km/h";
        document.querySelector(".hPa").innerHTML = pressure.toLocaleString();
        document.getElementById("hpaLabel").innerHTML = "hPa";

        document.getElementById("low-label1").innerHTML = minTemp + '°';
        document.getElementById("high-label1").innerHTML = maxTemp + '°';
        
    },
    displayFutureWeather: async function (data) {
        var tempMinAvg, tempMaxAvg, dayOneAvg, dayTwoAvg, dayThreeAvg, dayFourAvg, dayFiveAvg;

        var iconAvg = [];
        var tempAvg = [];

        var weatherIconSRC = "";
        var time;
        var main = "";
        var sun = new Sun(sunsetDt.getHours() % 12, sunriseDt.getHours() % 12);
        
        
        for(var i = 0; i <= 39; i++){
            main = data.list[i].weather[0].main;
            var dt = new Date(data.list[i].dt * 1000);
            console.log(dt);
            time = this.convertTime(dt, true);
            
            var wholeNumberTime = time.replace(/\D/g, "");

            
            if(time.includes("PM") &&  wholeNumberTime >= sun.sunset || time.includes("AM") && wholeNumberTime <= sun.sunrise){
                var tempName = "";
                switch (main) {
                    case "Clear":
                        tempName = "Clear-night"
                        break;
                    case "Clouds":
                        tempName = "Cloudy-night"
                        break;
                    case "Rain":
                        tempName = "Cloudy-night-rain"
                        break;
                    default:
                        break;
                }
                weatherIconSRC = "/icons/weather-icons/" + tempName + ".png";
            }else{
                weatherIconSRC = "/icons/weather-icons/" + main + ".png";
            }

            if(time.toString() == "2PM"){
                iconAvg.push(weatherIconSRC)
            }
    
            //console.log(i + ": " + weatherIconSRC);

            
     
            document.getElementById("forecast-time" + i).innerHTML = time;
            document.getElementById("weather-icon" + i).src =  weatherIconSRC;
            document.getElementById("weather" + i).innerHTML = Math.round(data.list[i].main.temp - 273.15) + '°';
        }
    
        var today = new Date();

        for(i = 0; i < iconAvg.length; i++){
            if(i == iconAvg.length - 1) console.log();
            if(i == 0)document.getElementById("day-label1").innerHTML = "Today";
            else document.getElementById("day-label" + (i+1)).innerHTML = days[i == iconAvg.length - 1 ? i+today.getDay()-8 : i+today.getDay()-1];
            document.getElementById("forecast-weather-icon" + (i + 1)).src = iconAvg[i];
        }
    },
    getLatLon: async (data) => {
        const { lat, lon} = data[0]
        console.log("Get Lat Lon:  " + lat, lon)
        await main.fetchFutureWeather(lat, lon)
    },
    getCity: (coordinates) => {
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
                main.fetchWeather(city);
                main.fetchFutureWeather(lat, lng);
                return;
            }
        }
    },
    getCoor:() => {
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
    
            main.getCity(coordinates);
    
            return;
    
          }
          
          function error(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
          }
          
          navigator.geolocation.getCurrentPosition(success, error, options);
    },
    dewPointCalc:(temp, humid) => {
        var t = temp;
        var rh = humid;
    
        var top = 243.12 * (Math.log(rh/100) + (17.62 * t) / (243.12 + t));
        var btm = 17.62 - (Math.log(rh/100) +  (17.62 * t) / (243.12 + t));
    
        return "The due point is " + Math.round(top/btm) + "° right now";
    },
    convertTime: (date, isFuture) => {

        var hr = date.getHours();

        var timeLabel = hr >= 12 ? 'PM' : 'AM';
        
        hr = (hr % 12) || 12;
    
        var min = date.getMinutes() < 10 ? '0' +  date.getMinutes() : date.getMinutes();
        
    
        if(isFuture){
            return hr + timeLabel;
        }
    
        return hr + ':' + min;
    },
    feelsTemperatureMsg: function (actualTemp, temp)  {
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
    },
    search: async () => {
        var city = document.querySelector(".searchField").value
        const data = await getCityCoordinates(city);
        main.getLatLon(data)
        await main.fetchWeather(city);
        document.querySelector(".searchField").value = "";
        return;
    }


}

document.querySelector(".searchContainer #searchBtn").addEventListener("click", function() {
    main.search()
})

document.querySelector(".searchField").addEventListener("keypress", function(event) {
    if(event.key == "Enter") {
        main.search()
    } 
})

window.onload = () => {
    main.getCoor
}

document.addEventListener('DOMContentLoaded', main.init)
