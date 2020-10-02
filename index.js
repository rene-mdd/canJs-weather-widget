// index.js
import { param, StacheElement, type } from "//unpkg.com/can@6/core.mjs";

class GoogleMapView extends StacheElement {
    static view = `
    <div class='main-div' on:click="this.toggle()">
    <div this:to="this.mapElement" class="gmap" ></div>
  {{# if (message)}}
    <div class="show-modal">
        <div class="modal-content">
  
    <div class="weather-widget">
        {{# if(this.forecastPromise.isPending) }}
            <p class="loading-message">Loading forecast…</p>
        {{/ if }}
        
        {{# if(this.forecastPromise.isResolved) }}
        
            <div class="forecast">
                <h1>Weather Forecast</h1>
                <ul>
                    {{# for(forecast of this.forecastPromise.value) }}
                   
                        <li>
                            <span class="date">
                                {{# if(this.isToday(forecast.date)) }}
                                
                                    Today
                                {{ else }}
                                    {{ forecast.date.toLocaleDateString() }}
                                {{/ if }}
                               
                            </span>
                            <span class="description {{ this.toClassName(forecast.text) }}">{{ forecast.text }}</span>
                            <span class="high-temp">{{ forecast.high }}<sup>°</sup></span>
                            <span class="low-temp">{{ forecast.low }}<sup>°</sup></span>
                        </li>
                    {{/ for }}
                </ul>
            </div>
        {{/ if }}
    </div>
    </div>
    {{/ if}}
  </div>
    </div>
`;

static props = {
  
  map: type.Any,
  mapElement: type.maybeConvert(HTMLElement),
  location: String,
  forecastPromise: type.Any,
  message: false
  };

  toggle() {
    this.message = !this.message
  }

  connected() {
    googleAPI.then(() => {
      this.map = new google.maps.Map(this.mapElement, {
        zoom: 4,
        center: {
          lat: 52.520008,
          lng: 13.404954
        }
      }),
      
      
      this.map.addListener('click', function(evt) {
        if(!this.message){
        const lat = evt.latLng.lat();
        const lng = evt.latLng.lng();
        // call forecastPromise;
      
        this.forecastPromise = fetch(
          "https://api.openweathermap.org/data/2.5/forecast?" +
          param({
            apiKey: appKey,
            mode: "json",
            units: "metric",
            lat: lat,
            lon: lng
          })
        ).then(response => {
          return response.json();
        }).then(transformData)
      }
      }.bind(this));
    });
}
  
  isToday(date) {
    const today = new Date();
    return today.getDate() === date.getDate();
  }

  toClassName(txt) {
    return txt.toLowerCase().replace(/ /g, "-");
  }
}

window.googleAPI = new Promise(function(resolve) {
  const script = document.createElement("script");

  let googleApi = "AIzaSyDD6UHxV6HzS6p3YjY0JNCm62a8VBt5A4g"
  script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApi}`
  document.body.appendChild(script);
  script.onload = resolve;
});

//info modal

const appKey = 'f1d6ab0fa88484920ee711cc585146a5';

function transformData (data) {
  let today = new Date();
  let forecasts = [];

  const transformedForecast = data.list.map(function (item) {
      return {
          high: item.main.temp_max,
          low: item.main.temp_min,
          text: item.weather[0].description,
          icon: item.weather[0].icon,
          date: new Date(item.dt_txt),
      }
  });

  const todayForecasts = transformedForecast.filter(function(forecast) {
      const forecastDate = forecast.date;
      return today.getDate() === forecastDate.getDate();
  });

  if (todayForecasts.length) {
      forecasts.push(todayForecasts[0]);
  }

  const nextDaysForecasts = transformedForecast.filter(function (forecast) {
      const forecastDate = forecast.date;
      return 	today.getDate() !== forecastDate.getDate() && forecastDate.getHours() === 12;
  });

  forecasts = forecasts.concat(nextDaysForecasts);
  return forecasts;
};

customElements.define("google-map-view", GoogleMapView);

