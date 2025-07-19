// // === SEARCH BAR ELEMENTS ===
// const searchForm = document.querySelector('.search-form');
// const searchButton = document.querySelector('.search-button');
// const searchInput = document.querySelector('.search-input');
// const searchSubmitBtn = document.querySelector('.search-submit-btn');

// // === SEARCH BAR EXPAND & COLLAPSE ===
// searchButton.addEventListener('click', () => {
//     searchForm.classList.toggle('active-search');
//     if (searchForm.classList.contains('active-search')) {
//         searchInput.focus();
//     }
// });

// // === PRESS ENTER TO SEARCH ===
// searchInput.addEventListener('keydown', (e) => {
//     if (e.key === "Enter") {
//         e.preventDefault();
//         if (searchInput.value.trim() !== "") {
//             handleSearch(searchInput.value.trim());
//         }
//     }
// });

// // === CLICK ON SEARCH BUTTON BELOW ===
// searchSubmitBtn.addEventListener('click', () => {
//     const city = searchInput.value.trim();
//     if (city !== "") {
//         handleSearch(city);
//     }
// });

// // === OPENWEATHERMAP API ===
// const API_KEY = "e40f7018a28abcc1d8743bba5e1f0b96";
// const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// // === MAIN SEARCH FUNCTION ===
// async function handleSearch(city) {
//     console.log(`🔍 Searching weather for: ${city} ...`);

//     const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

//     try {
//         const response = await fetch(url);

//         if (!response.ok) {
//             if (response.status === 404) {
//                 throw new Error("City not found");
//             } else if (response.status === 401) {
//                 throw new Error("Invalid API key (401 Unauthorized)");
//             } else {
//                 throw new Error(`Error ${response.status}`);
//             }
//         }

//         const data = await response.json();
//         console.log("✅ Weather Data:", data);

//         const details = extractWeatherDetails(data);
//         console.log("Formatted Details:", details);

//         // For now just log them, later we’ll update UI
//         document.querySelector("#temperature").textContent = details.temperature;
//         document.querySelector("#humidity-value").textContent = details.humidity;
//         document.querySelector("#wind-value").textContent = details.windSpeed;
//         document.querySelector("#precipitation-value").textContent = details.precipitation;
//         document.querySelector("#location-name").textContent = details.name;
//         document.querySelector("#feelslike-value").textContent = details.feelsLike;
//         document.querySelector("#time-value").textContent = details.time;
//         const iconCode = data.weather[0].icon; // e.g. "10d"
//         document.querySelector("#weather-icon").innerHTML =
//             `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather Icon">`;


//         // Reset UI after search
//         searchForm.classList.remove('active-search');
//         searchInput.value = "";
//         searchSubmitBtn.style.opacity = 0; // hide after search
//         searchSubmitBtn.style.pointerEvents = "none";

//     } catch (error) {
//         console.error("❌ Error fetching weather:", error.message);

//         // Temporarily change the Search Submit Button
//         searchSubmitBtn.textContent = "Not Found";
//         searchSubmitBtn.classList.add("error-state");

//         // Revert after 5 seconds
//         setTimeout(() => {
//             searchSubmitBtn.textContent = "Search";
//             searchSubmitBtn.classList.remove("error-state");
//         }, 3000);
//     }
// }

// // === SHOW/HIDE THE SEARCH BUTTON DYNAMICALLY ===
// searchForm.addEventListener('transitionend', () => {
//     if (searchForm.classList.contains('active-search')) {
//         // Show button smoothly when expanded
//         searchSubmitBtn.style.opacity = 1;
//         searchSubmitBtn.style.pointerEvents = "auto";
//     } else {
//         // Hide button when collapsed
//         searchSubmitBtn.style.opacity = 0;
//         searchSubmitBtn.style.pointerEvents = "none";
//     }
// });

// // === FUNCTION TO GET LOCAL TIME BASED ON API TIMEZONE OFFSET ===
// function getLocalTime(timezoneOffset) {
//     // Get current UTC timestamp in milliseconds
//     const nowUTC = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);

//     // Add the API timezone offset (convert seconds → milliseconds)
//     const localTime = new Date(nowUTC + timezoneOffset * 1000);

//     // Format as 12-hour time with AM/PM
//     let hours = localTime.getHours();
//     const minutes = localTime.getMinutes().toString().padStart(2, '0');
//     const ampm = hours >= 12 ? 'PM' : 'AM';
//     hours = hours % 12;
//     hours = hours ? hours : 12; // the hour '0' should be '12'

//     return `${hours}:${minutes} ${ampm}`;
// }


// // === FUNCTION TO EXTRACT DETAILS ===
// function extractWeatherDetails(data) {
//     // Temperature in °C
//     const temperature = data.main.temp.toFixed(1); // Round to 1 decimal place

//     // Humidity (%)
//     const humidity = data.main.humidity; // already %

//     // Wind Speed (convert m/s -> km/h)
//     const windSpeedKmh = (data.wind.speed * 3.6).toFixed(1);

//     // Precipitation
//     let precipitation = 0;
//     if (data.rain && data.rain["1h"]) {
//         const rainMM = data.rain["1h"];
//         precipitation = Math.min((rainMM / 10) * 100, 100).toFixed(0);
//         // Example: 5mm rain => 50%, cap at 100%
//     }

//     // Feels Like
//     const feelsLike = data.main.feels_like.toFixed(1);

//     // Name
//     const cityName = data.name;

//     // Time
//     const localTime = getLocalTime(data.timezone);

//     return {
//         temperature: `${temperature}°C`,
//         feelsLike: `${feelsLike}°C`,
//         humidity: `${humidity}%`,
//         windSpeed: `${windSpeedKmh} km/h`,
//         precipitation: `${precipitation}%`,
//         name: cityName,
//         time: localTime
//     };
// }


import { setupSearchBar } from './search-bar.js';
import { fetchWeatherAndUpdate } from './weather-section.js';
import { showNotFoundAlert } from './alert.js';
setupSearchBar(fetchWeatherAndUpdate);
