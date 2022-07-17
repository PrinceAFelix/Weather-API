'use strict'
import {Sun, Weather} from './sun-model.js'
import {getCurrentWeather, getFutureWeather, getCityCoordinates, createWeatherIcon} from './weather-api-service.js'

var sunsetDt;
var sunriseDt;
var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

let avg = [];

let total = [];
let counter = 0;

let low = [], high = []

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


        let des = data.weather[0].main.toLowerCase();

        document.querySelector('body').setAttribute('state', icon.slice(-1)+ (des == 'mist' || des == 'haze' ? 'fog' : des))
        let day = icon.slice(-1) == 'd' ? 'd' : 'n';
        let elements = document.getElementsByClassName('futureWeather');
        if(day == 'd'){
            document.querySelector('body').style.backgroundColor = '#2175B3';
            for(let i = 0; i < elements.length; i++){
                elements[i].style.backgroundColor = '#1C68A7';
            }
        }else{
            document.querySelector('body').style.backgroundColor = '#1E1D32';
            for(let i = 0; i < elements.length; i++){
                elements[i].style.backgroundColor = '#22243C';
            }
        }
        //Get today's max and min temp
        low.push(minTemp)
        high.push(maxTemp)

        //Capitalize first letter
        var desc = description.split(" ");
        for (let i = 0; i < desc.length; i++) {
            desc[i] = desc[i][0].toUpperCase() + desc[i].substr(1);
        }
        document.querySelector(".city").innerHTML = name;
        document.querySelector(".temp").innerHTML = celciusTemp + '&#176;';
        document.querySelector(".description").innerHTML = desc.join(" ");;
        document.querySelector(".min").innerHTML = "L:" + minTemp + '&#176;';
        document.querySelector(".max").innerHTML = "H:" + maxTemp + '&#176;';
        document.querySelector(".feels-like-temp").innerHTML = feelsTemp + '&#176;';
        document.querySelector(".flt-msg").innerHTML = main.feelsTemperatureMsg(celciusTemp, feelsTemp);
        document.querySelector(".humid").innerHTML = humidity + '%';
        document.querySelector(".dew-point").innerHTML = main.dewPointCalc(celciusTemp, humidity);
        document.querySelector(".vsblty").innerHTML = (visibility/1000) + " km";
        document.querySelector(".sunsetTime").innerHTML = main.convertTime(sunsetDt, false) + 'PM';
        document.querySelector(".sunriseTime").innerHTML = 'Sunrise: ' + main.convertTime(sunriseDt, false) + 'AM';
        document.querySelector(".windSpeed").innerHTML = Math.round((speed * 3.6)) ;
        document.querySelector(".hPa").innerHTML = pressure.toLocaleString();
        document.getElementById("hpaLabel").innerHTML = "hPa";
    },
    displayFutureWeather: async function (data) {
        var iconAvg = [];
        let weatherIconSRC = "";
        var time;
        var mainDesc = "";
        var sun = new Sun(sunsetDt.getHours() % 12, sunriseDt.getHours() % 12);


        let hourly =  document.querySelector(".hourly-forecast");
        if (hourly.querySelector('div')) {
            hourly.querySelectorAll('div').forEach(div => div.remove())
        }
        

        let isDayPassed = false;


        //item.main.temp
        data.list.forEach((item, index) => {
            var dt = new Date(item.dt * 1000);
            time = this.convertTime(dt, true);
            let div = document.createElement('div');
            div.className = 'future-forecast'
            var wholeNumberTime = time.replace(/\D/g, "");
            mainDesc = item.weather[0].main;


            if(time.includes("PM") &&  wholeNumberTime >= sun.sunset || time.includes("AM") && wholeNumberTime <= sun.sunrise){
                var tempName = "";
                switch (mainDesc) {
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
                weatherIconSRC = tempName;
            }else{
                weatherIconSRC = mainDesc;
            }

            if(time.includes("2PM")) iconAvg.push(weatherIconSRC)


            if(index <= 20){
                div.innerHTML = `<h3>${time}</h3>`
            
                if (div.querySelector('img')) div.querySelector('img').remove()
                div.appendChild(createWeatherIcon(weatherIconSRC))
                div.innerHTML = 
                div.innerHTML + `<h3>${Math.round(item.main.temp - 273.15)}&#176;</h3>`
                hourly.append(div);
    
            }
            if(time.includes("2AM")) isDayPassed = true;

            if(isDayPassed && counter != 8){
                avg.push(Math.round(item.main.temp - 273.15))
                counter++;
                if(counter == 8){
                    counter = 0
                    isDayPassed = false;
                    main.quickSort(avg, 0, avg.length - 1)
                    low.push(Math.min(...avg))
                    high.push(Math.max(...avg))
                    avg = []
                }
    
            }

        })



        var today = new Date().getDay();
        let minus = today;
        let isPassed = false;
        let daily =  document.querySelector(".daily-forecast");
        if (daily.querySelector('div')) daily.querySelectorAll('div').forEach(div => div.remove())
        iconAvg.forEach((item, index) => {
            let div = document.createElement('div');
            div.className = 'five-day-forecast'
            let day = index == 0 ? 'Today' : days[isPassed ? (today - minus--) : today + index];
            if(today >= 3 && days[today + index] == 'Sunday')isPassed = true;
            div.innerHTML = `<h3 class="day-label">${day}</h3>`
            div.appendChild(createWeatherIcon(item))
            div.innerHTML = 
            div.innerHTML + `<h3>${low[index]}&#176;</h3><div class="temp-range"></div><h3>${high[index]}&#176;</h3>`
            daily.append(div);
            let lineDiv = document.createElement('div')
            lineDiv.innerHTML = `<hr style="width: 100%">`
            div.after(lineDiv)
            
        })
        low = []
        high = []
        

    },
    getLatLon: async (data) => {
        const { lat, lon} = data[0]
        await main.fetchFutureWeather(lat, lon)
    },
    getCity: (coordinates) => {
        var xhr = new XMLHttpRequest();
        var lat = coordinates[0];
        var lng = coordinates[1];
        var city = ""
        var index = 0;
        var callFuncOnce = false
        xhr.open('GET', `https://us1.locationiq.com/v1/reverse.php?key=${main.locKey}&lat=${lat}&lon=${lng}&format=json`, true);
        xhr.send();
        xhr.onreadystatechange = processRequest;
        xhr.addEventListener("readystatechange", processRequest, false);
        function processRequest(e) {
            if (xhr.readyState == 4 && xhr.status == 200 && callFuncOnce == false) {
                var response = JSON.parse(xhr.responseText);
                city = response.address.city;
                main.fetchWeather(city);
                main.fetchFutureWeather(lat, lng)
                callFuncOnce = true
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
        await main.fetchWeather(city);
        main.getLatLon(data)
        document.querySelector(".searchField").value = "";



        return;
    },
    getWeatherState: function () {

    },
    quickSort: (array, start, end) => {
        

		//Check if the right side is less or equal than the left side
		if (start >= end) {
		
			return;
		}
			
		
		//Set all the needed values
		let pivot = start, left = start + 1, right = end;
		
		while (left < right) {
			//Increment the left while it met the following
			while (array[left] < array[pivot] && left < right)
				left++;
			//Decrement the right while it met the following
			while (array[right] > array[pivot] && left < right)
				right--;
			
			//Swap the array
			let temp = array[left];
			array[left] = array[right];
			array[right] = temp;
			if (left < right) {
				left++;
				right--;
			}
			
		}
		
		if (array[left] > array[pivot]) {
			//Move the pivot and call recursively
			let temp = array[pivot];
			array[pivot] = array[left-1];
			array[left-1] = temp;
			main.quickSort(array, start, left-2);
			main.quickSort(array, left, end);
			
		}else {
			//Move the pivot and call recursively
			let temp = array[pivot];
			array[pivot] = array[left];
			array[left] = temp;
			main.quickSort(array, start, left-1);
			main.quickSort(array, left+1, end);
		
		}

    },



}

document.querySelector(".searchContainer #searchBtn").addEventListener("click", function() {
    main.search()
})

document.querySelector(".searchField").addEventListener("keypress", function(event) {
    if(event.key == "Enter") {
        main.search()
    } 
})


document.addEventListener('DOMContentLoaded', main.init)
