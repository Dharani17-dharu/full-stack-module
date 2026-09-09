const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const weatherContainer =
    document.getElementById("weatherContainer");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const cityName =
    document.getElementById("cityName");

const dateTime =
    document.getElementById("dateTime");

const weatherIcon =
    document.getElementById("weatherIcon");

const temperature =
    document.getElementById("temperature");

const weatherCondition =
    document.getElementById("weatherCondition");

const feelsLike =
    document.getElementById("feelsLike");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const windDirection =
    document.getElementById("windDirection");


// -------------------------------------
// Weather Code Information
// -------------------------------------

function getWeatherInfo(code) {

    const weatherData = {

        0: {
            text: "Clear Sky",
            icon: "☀️"
        },

        1: {
            text: "Mainly Clear",
            icon: "🌤️"
        },

        2: {
            text: "Partly Cloudy",
            icon: "⛅"
        },

        3: {
            text: "Overcast",
            icon: "☁️"
        },

        45: {
            text: "Fog",
            icon: "🌫️"
        },

        48: {
            text: "Fog",
            icon: "🌫️"
        },

        51: {
            text: "Light Drizzle",
            icon: "🌦️"
        },

        53: {
            text: "Drizzle",
            icon: "🌦️"
        },

        55: {
            text: "Heavy Drizzle",
            icon: "🌧️"
        },

        61: {
            text: "Light Rain",
            icon: "🌦️"
        },

        63: {
            text: "Rain",
            icon: "🌧️"
        },

        65: {
            text: "Heavy Rain",
            icon: "🌧️"
        },

        71: {
            text: "Light Snow",
            icon: "🌨️"
        },

        73: {
            text: "Snow",
            icon: "❄️"
        },

        75: {
            text: "Heavy Snow",
            icon: "❄️"
        },

        80: {
            text: "Rain Showers",
            icon: "🌦️"
        },

        81: {
            text: "Rain Showers",
            icon: "🌧️"
        },

        82: {
            text: "Heavy Rain Showers",
            icon: "⛈️"
        },

        95: {
            text: "Thunderstorm",
            icon: "⛈️"
        },

        96: {
            text: "Thunderstorm with Hail",
            icon: "⛈️"
        },

        99: {
            text: "Heavy Thunderstorm",
            icon: "⛈️"
        }

    };

    return weatherData[code] || {
        text: "Unknown",
        icon: "🌤️"
    };
}


// -------------------------------------
// Get City Coordinates
// -------------------------------------

async function getCity(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Unable to connect to the location service."
        );
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error(
            "City not found. Please enter a valid city."
        );
    }

    return data.results[0];
}


// -------------------------------------
// Get Weather Data
// -------------------------------------

async function getWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Unable to retrieve weather data."
        );
    }

    const data = await response.json();

    if (!data.current) {
        throw new Error(
            "Weather information is not available."
        );
    }

    return data.current;
}


// -------------------------------------
// Display Weather
// -------------------------------------

function displayWeather(location, weather) {

    const info =
        getWeatherInfo(weather.weather_code);

    cityName.textContent =
        `${location.name}, ${location.country}`;

    temperature.textContent =
        `${Math.round(weather.temperature_2m)}°C`;

    weatherCondition.textContent =
        info.text;

    weatherIcon.textContent =
        info.icon;

    feelsLike.textContent =
        `${Math.round(weather.apparent_temperature)}°C`;

    humidity.textContent =
        `${weather.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${weather.wind_speed_10m} km/h`;

    windDirection.textContent =
        `${weather.wind_direction_10m}°`;

    // Display API time
    const weatherTime =
        new Date(weather.time);

    dateTime.textContent =
        weatherTime.toLocaleString();

    weatherContainer.style.display =
        "block";
}


// -------------------------------------
// Search Weather
// -------------------------------------

async function searchWeather() {

    const city =
        cityInput.value.trim();

    // Clear previous error
    errorMessage.textContent = "";

    // Validate input
    if (city === "") {

        weatherContainer.style.display =
            "none";

        errorMessage.textContent =
            "⚠️ Please enter a city name.";

        return;
    }

    // Show loading
    loading.style.display = "block";

    weatherContainer.style.display =
        "none";

    searchBtn.disabled = true;

    try {

        // Step 1
        const location =
            await getCity(city);

        // Step 2
        const weather =
            await getWeather(
                location.latitude,
                location.longitude
            );

        // Step 3
        displayWeather(
            location,
            weather
        );

    }

    catch (error) {

        console.error(
            "Weather API Error:",
            error
        );

        errorMessage.textContent =
            `❌ ${error.message}`;

        weatherContainer.style.display =
            "none";
    }

    finally {

        loading.style.display =
            "none";

        searchBtn.disabled =
            false;
    }
}


// -------------------------------------
// Button Click
// -------------------------------------

searchBtn.addEventListener(
    "click",
    searchWeather
);


// -------------------------------------
// Enter Key
// -------------------------------------

cityInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            searchWeather();
        }

    }
);
