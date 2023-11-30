// OpenWeatherMap API key
const API_KEY = "38921a8af8d7195d62fe75d45ee9a32d";

// DOM elements
const button = document.querySelector(".searchBtn");
const input = document.querySelector(".input");
const dCity = document.querySelector(".dashboard-city");
const temp = document.querySelector(".dashboard-temp");
const humidity = document.querySelector(".dashboard-humidity");
const wind = document.querySelector(".dashboard-wind");
const cityList = document.querySelector(".history");
const clrBtn = document.querySelector(".clearBtn");

// Array to store searched cities (retrieved from localStorage or default to an empty array)
let cities = JSON.parse(localStorage.getItem("cities")) || [];

// Function to initialize the application
function init() {
  const storedCities = JSON.parse(localStorage.getItem("cities"));
  if (storedCities !== null) {
    cities = storedCities;
    const lastCity = cities[cities.length - 1]; // Get the last saved city

    // Fetch and display weather for the last saved city
    if (lastCity) {
      fetchWeather(lastCity);
    }
  }
  renderCities();
}

// Function to store searched cities in localStorage
function storeCities() {
  localStorage.setItem("cities", JSON.stringify(cities));
}

// Function to render searched cities on the UI
function renderCities() {
  cityList.innerHTML = "";
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const div = document.createElement("div");
    div.textContent = city;
    div.setAttribute("data-index", i);
    div.addEventListener("click", () => fetchWeather(city)); // Add click event to fetch weather on click
    cityList.appendChild(div);
  }
}

// Function to fetch and display weather for a given city
async function fetchWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=imperial`
    );

    const date = new Date().toLocaleDateString();
    const data = await response.json();
    console.log(data);

    // Display current weather information
    dCity.innerHTML = `${data.name} (${date})`;
    temp.innerHTML = `Temp ${data.main.temp}°F`;
    humidity.innerHTML = `Humidity: ${data.main.humidity}%`;
    wind.innerHTML = `Wind: ${data.wind.speed} MPH`;

    const weatherIcon = data.weather[0].icon; // Icon code

      const iconElement = document.createElement("img");
      iconElement.src = `https://openweathermap.org/img/w/${weatherIcon}.png`;
      iconElement.alt = "Weather Icon";

      dCity.appendChild(iconElement);

    // Fetch and display the 5 day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=imperial`
    );
    const forecastData = await forecastResponse.json();
    console.log(forecastData);

    // Render the forecast
    renderForecast(forecastData.list);
  } catch (error) {
    console.log(error);
  }
}

// Function to render the 5-day forecast
function renderForecast(forecastList) {
  const forecastContainer = document.querySelector(".forecast");
  forecastContainer.innerHTML = "";

  // Get the current date in the format MM/DD/YYYY
  const currentDate = new Date().toLocaleDateString();

  // Find the index of the current date in the forecast data
  const currentDateIndex = forecastList.findIndex((item) => {
    const forecastDate = new Date(item.dt * 1000).toLocaleDateString();
    return currentDate === forecastDate;
  });

  // Filter out forecast items for the current date
  const filteredForecast = forecastList.filter((item) => {
    const forecastDate = new Date(item.dt * 1000).toLocaleDateString();
    return currentDate !== forecastDate;
  });

  // Display the next 5 days
  for (let i = currentDateIndex + 1; i < filteredForecast.length; i += 8) {
    const forecastItem = filteredForecast[i];
    const date = new Date(forecastItem.dt * 1000).toLocaleDateString();
    const temperature = forecastItem.main.temp;
    const humidity = forecastItem.main.humidity;
    const wind = forecastItem.wind.speed;
    const weatherIcon = forecastItem.weather[0].icon;

    // Create a forecast card
    const forecastCard = document.createElement("div");
    forecastCard.classList.add("forecast-card");

    // Create elements for date, temperature, humidity, and wind
    const dateElement = document.createElement("p");
    dateElement.textContent = date;

    const tempElement = document.createElement("p");
    tempElement.textContent = `Temp: ${temperature}°F`;

    const humidityElement = document.createElement("p");
    humidityElement.textContent = `Humidity: ${humidity}%`;

    const windElement = document.createElement("p");
    windElement.textContent = `Wind: ${wind} MPH`;

      const iconElement = document.createElement("img");
      iconElement.src = `https://openweathermap.org/img/w/${weatherIcon}.png`;
      iconElement.alt = "Weather Icon";

    // Append elements to the forecast card
    forecastCard.appendChild(dateElement);
    forecastCard.appendChild(iconElement);
    forecastCard.appendChild(tempElement);
    forecastCard.appendChild(humidityElement);
    forecastCard.appendChild(windElement);
  

    // Append forecast card to the forecast container
    forecastContainer.appendChild(forecastCard);
  }
}

// Event listener for the search button
button.addEventListener("click", async () => {
  if (input.value === "") return alert("Please enter a city name");
  try {
    // Fetch weather for the input city
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${input.value}&appid=${API_KEY}&units=imperial`
    );

    fetchWeather(input.value);
    var city = input.value.trim();

    // Check if the city is not empty
    if (city !== "") {
      // Add the city to the array, store in localStorage, and render on the UI
      cities.push(city);
      storeCities();
      renderCities();
      renderForecast(); // Render the forecast for the newly searched city
    }
  } catch (error) {
    console.log(error);
  }
});

// Event listener for the clear button
clrBtn.addEventListener("click", () => {
  localStorage.clear();
  cities = [];
  renderCities();
});

// Initialize the application
init();
