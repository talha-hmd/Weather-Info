import { showNotFoundAlert } from './alert.js';
const API_KEY = "e40f7018a28abcc1d8743bba5e1f0b96";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function fetchWeatherAndUpdate(city) {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const searchSubmitBtn = document.querySelector('.search-submit-btn');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(response.status === 404 ? "City not found" : `Error ${response.status}`);

        const data = await response.json();
        const details = extractWeatherDetails(data);
        updateWeatherUI(details, data.weather[0].icon);
        setWeatherBackground(data.weather[0].id);

        // Fetch and update 5-day forecast
        const rawForecast = await fetchFiveDayForecastByCity(city);
        const formattedForecast = formatFiveDayForecast(rawForecast);
        updateForecastUI(formattedForecast);

        // Reset search bar after success
        searchForm.classList.remove('active-search');
        searchInput.value = "";
        searchSubmitBtn.style.opacity = 0;
        searchSubmitBtn.style.pointerEvents = "none";


    } catch (err) {
        console.error(err.message);
        showNotFoundAlert();
    }
}

function getLocalTime(offset) {
    const nowUTC = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);
    const localTime = new Date(nowUTC + offset * 1000);
    let hours = localTime.getHours();
    const minutes = localTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

function extractWeatherDetails(data) {
    console.log(`Weather Data:`, data);

    const temperature = data.main.temp.toFixed(1);
    const humidity = data.main.humidity;
    const windSpeedKmh = (data.wind.speed * 3.6).toFixed(1);
    const feelsLike = data.main.feels_like.toFixed(1);
    const precipitation = data.rain?.["1h"] ? Math.min((data.rain["1h"] / 10) * 100, 100).toFixed(0) : 0;
    const cityName = data.name;
    const localTime = getLocalTime(data.timezone);

    return {
        temperature: `${temperature}°C`,
        feelsLike: `${feelsLike}°C`,
        humidity: `${humidity}%`,
        windSpeed: `${windSpeedKmh} km/h`,
        precipitation: `${precipitation}%`,
        name: cityName,
        time: localTime
    };
}

// ==== 5 Day Forecast Logic ====
async function fetchFiveDayForecastByCity(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    const res = await fetch(forecastUrl);
    if (!res.ok) throw new Error("Could not fetch forecast");
    const data = await res.json();

    console.log("✅ Raw 5-day forecast:", data);
    return data; // we’ll format later
}

function formatFiveDayForecast(rawData) {
    const list = rawData.list; // 40 slots (3-hour intervals)
    const groupedByDay = {};

    list.forEach(entry => {
        const date = entry.dt_txt.split(" ")[0]; // "2025-07-20"
        if (!groupedByDay[date]) groupedByDay[date] = [];
        groupedByDay[date].push(entry);
    });

    const formatted = Object.keys(groupedByDay).slice(0, 5).map((date, idx) => {
        const dayEntries = groupedByDay[date];

        // Find min/max for this day
        let minTemp = Infinity;
        let maxTemp = -Infinity;
        let iconForDay = null;

        dayEntries.forEach(e => {
            minTemp = Math.min(minTemp, e.main.temp_min);
            maxTemp = Math.max(maxTemp, e.main.temp_max);

            // pick midday icon (~12:00)
            if (e.dt_txt.includes("12:00:00")) {
                iconForDay = e.weather[0].icon;
            }
        });

        // Fallback icon if no 12:00 found
        if (!iconForDay) iconForDay = dayEntries[0].weather[0].icon;

        // Day name (Today, Thu, Fri...)
        const dayName = idx === 0
            ? "Today"
            : new Date(date).toLocaleDateString("en-US", { weekday: "short" });

        return {
            day: dayName,
            min: Math.round(minTemp),
            max: Math.round(maxTemp),
            icon: iconForDay
        };
    });

    console.log("✅ Formatted Forecast:", formatted);
    return formatted;
}

// ==== Background Update Logic ====
function getWeatherCategory(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return "thunderstorm";
    if (weatherId >= 300 && weatherId < 600) return "rain";       // drizzle + rain
    if (weatherId >= 600 && weatherId < 700) return "snow";
    if (weatherId >= 700 && weatherId < 800) return "fog";        // atmosphere group
    if (weatherId === 800) return "clear";
    if (weatherId > 800) return "cloudy";
    return "clear"; // fallback
}

function pickRandomGif(category) {
    const randomIndex = Math.floor(Math.random() * 5) + 1;
    return `${category}_${randomIndex}.gif`;
}

function setWeatherBackground(weatherId) {
    const category = getWeatherCategory(weatherId);
    const gifName = pickRandomGif(category);
    const gifPath = `/gifs/${gifName}`;

    console.log("🌤 Category:", category);
    console.log("🎞 Selected gif:", gifPath);

    // Blurred background for whole page
    const bgDiv = document.querySelector(".background");
    bgDiv.style.background = `url('${gifPath}') no-repeat center/cover`;
    bgDiv.style.filter = "blur(8px) brightness(0.5)";

    // unblurred Weather card background
    const card = document.querySelector(".weather-card");

    // Only set the image
    card.style.backgroundImage = `url('${gifPath}')`;

    // Default sizing for all screens
    card.style.backgroundRepeat = "no-repeat";
    card.style.backgroundPosition = "center";
    card.style.backgroundSize = "cover";  // default zoom for all sizes

    card.style.backdropFilter = "none";

}

// Smooth text update helper
function smoothTextUpdate(element, newText) {
    // Fade out + slight slide
    element.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    element.style.opacity = 0;
    element.style.transform = "translateY(-5px)";

    setTimeout(() => {
        // Update text
        element.textContent = newText;

        // Fade in
        element.style.opacity = 1;
        element.style.transform = "translateY(0)";
    }, 150); // small delay before fade-in
}

// Smooth icon update helper
function smoothIconUpdate(element, newHTML) {
    element.style.transition = "opacity 0.3s ease";
    element.style.opacity = 0;

    setTimeout(() => {
        element.innerHTML = newHTML;
        element.style.opacity = 1;
    }, 150);
}

// === WEATHER UI UPDATE ===
function updateWeatherUI(details, iconCode) {
    smoothTextUpdate(document.querySelector("#temperature"), details.temperature);
    smoothTextUpdate(document.querySelector("#humidity-value"), details.humidity);
    smoothTextUpdate(document.querySelector("#wind-value"), details.windSpeed);
    smoothTextUpdate(document.querySelector("#precipitation-value"), details.precipitation);
    smoothTextUpdate(document.querySelector("#location-name"), details.name);
    smoothTextUpdate(document.querySelector("#feelslike-value"), details.feelsLike);
    smoothTextUpdate(document.querySelector("#time-value"), details.time);

    // Smooth icon change
    smoothIconUpdate(
        document.querySelector("#weather-icon"),
        `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather Icon">`
    );
}

// === FORECAST UI UPDATE ===
function updateForecastUI(forecastArray) {
    const rows = document.querySelectorAll(".forecast-day"); // 5 rows

    forecastArray.forEach((f, idx) => {
        const row = rows[idx];
        const daySpan = row.children[0];
        const iconSpan = row.children[1];
        const tempSpan = row.children[2];

        // Smooth Day name (Today, Thu...)
        smoothTextUpdate(daySpan, f.day);

        // Smooth icon change
        smoothIconUpdate(
            iconSpan,
            `<img src="https://openweathermap.org/img/wn/${f.icon}@2x.png" alt="Weather Icon">`
        );

        // Smooth Min / Max temperature
        smoothTextUpdate(tempSpan, `${f.min}° / ${f.max}°`);
    });
}


