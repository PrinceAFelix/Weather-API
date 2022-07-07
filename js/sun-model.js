export class Sun{

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

export class Weather{

    constructor(sunsetT, sunriseT, min, max, i){
        this.sunset = sunsetT;
        this.sunrise = sunriseT;
        this.minTemp = min;
        this.maxTemp = max;
        this.icon = i;
    }

    set SunriseTime(time) { this.sunrise = time }
    get SunsetTime(){ return this.sunset }

    set SunsetTime(time){ this.sunset = time }
    get SunriseTime(){ return this.sunrise }

    set Min(min){ this.minTemp = min }
    get Min(){ return this.minTemp }

    set Max(max){ this.maxTemp = max }
    get Max(){ return this.maxTemp }

    set Icon(icon){ this.icon = icon }
    get Icon(){ return this.icon }
}