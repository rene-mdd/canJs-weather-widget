// index.js
import { param, StacheElement, type } from "//unpkg.com/can@6/core.mjs";

class GoogleMapView extends StacheElement {
    static view = `
    <div class="weather-widget">
        <div class="location-entry">
            <label for="location">Enter your location:</label>
            <input id="location" type="text" value:to="this.location" />
        </div>

        {{# if(this.forecastPromise.isPending) }}
            <p class="loading-message">Loading forecast…</p>
        {{/ if }}

        {{# if(this.forecastPromise.isResolved) }}
            <div class="forecast">
                <h1>5-Day {{ this.location }} Weather Forecast</h1>
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
    <div this:to="this.mapElement" class="gmap"></div>
`;

static props = {
    map: type.Any,
    mapElement: type.maybeConvert(HTMLElement),
    vehicles: type.Any,
    markers: type.Any,
    location: String,
    forecastPromise: type.Any
  };

  connected() {
    googleAPI.then(() => {
      this.map = new google.maps.Map(this.mapElement, {
        zoom: 6,
        center: {
          lat: 52.520008,
          lng: 13.404954
        }
      });
      
      this.map.addListener('click', function(evt) {
        const lat = evt.latLng.lat();
        const lng = evt.latLng.lng();
        console.log(lat, lng);
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
        }).then(transformData);
      });
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

customElements.define("google-map-view", GoogleMapView);

class WeatherTracker extends StacheElement {
  static view = `
    <div class="top">
      <div class="header">
        <h1>{{this.title}}</h1>
      </div>
    </div>
    <div class="bottom">
      <google-map-view class="map-class"/>
    </div>
  `;
  
  static props = {
    title: {
      default: "Weather Tracker"
    }
  };
}

customElements.define("weather-tracker", WeatherTracker);

