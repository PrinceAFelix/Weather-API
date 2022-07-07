'use strict'
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather?q=';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast?lat=';
const API_KEY = '17691d99c39c2957f8d965dc8ffd8343';



export async function getCurrentWeather(city){
    const forecast = await fetchWeather(city)
    return forecast;
}

export async function getFutureWeather(lat, lon){
    const forecast = await fetchFutureWeather(lat, lon)
    return forecast
}

export async function getCityCoordinates(cityName){
    const coord = await fetchCityCoordinates(cityName)
    
    return coord
}


async function fetchWeather(city){
    const url = `${WEATHER_URL}${city}&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
          
        throw new Error(response.statusText);
    }
    return response.json()
    
}

async function fetchFutureWeather(lat, lon){

    //api.openweathermap.org/data/2.5/forecast?lat=45.4112&lon=-75.6981&appid=17691d99c39c2957f8d965dc8ffd8343
    const url = `${FORECAST_URL}${lat}&lon=${lon}&appid=${API_KEY}`
    
    console.log(url)
    const response = await fetch(url)
    if (!response.ok) {
          
        throw new Error(response.statusText);
    }
    return response.json()
    
}

async function fetchCityCoordinates(cityName){
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`
    
    const response = await fetch(url)
    if (!response.ok) {
          
        throw new Error(response.statusText);
    }
    return response.json()
    
}

export function createWeatherIcon (icon) {
    let img = document.createElement('img')
    img.setAttribute(
      'src',
      '/icons/weather-icons/' + icon + '.png'
    )
    img.setAttribute('alt', '')
    return img
  }


