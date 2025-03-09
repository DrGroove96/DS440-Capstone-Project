// Make sure this is in your public folder, not the root directory
const map = L.map('map').setView([40.7128, -74.0060], 13);

// Add the tile layer (make sure this is before any other map operations)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Update the API key constant at the top of your script
const API_KEY = '438e5c5ba6a56eec4dfe8d2ffccaeeef';

// Add error handling for API calls
async function fetchAllWeatherData(lat, lon) {
    try {
        console.log('Fetching weather data for:', lat, lon);
        
        // Fetch current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!currentResponse.ok) {
            throw new Error(`HTTP error! status: ${currentResponse.status}`);
        }
        
        const currentData = await currentResponse.json();

        // Fetch 5 day forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!forecastResponse.ok) {
            throw new Error(`HTTP error! status: ${forecastResponse.status}`);
        }
        
        const forecastData = await forecastResponse.json();

        // Process the data
        const processedData = {
            current: currentData,
            forecast: forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5), // Get one reading per day
            historical: [] // We'll simulate historical data from the forecast data
        };

        console.log('Weather data fetched successfully:', processedData);
        return processedData;

    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

function showWeatherDashboard(weatherData, lat, lng) {
    let dashboard = document.getElementById('weather-dashboard');
    if (dashboard) {
        dashboard.remove();
    }

    dashboard = document.createElement('div');
    dashboard.id = 'weather-dashboard';
    dashboard.innerHTML = `
        <div class="dashboard-header">
            <h2>Weather Analysis (${lat.toFixed(4)}, ${lng.toFixed(4)})</h2>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">×</button>
        </div>
        <div class="dashboard-content">
            <div class="chart-container">
                <canvas id="tempChart"></canvas>
                <canvas id="humidityChart"></canvas>
            </div>
            <div class="analysis-container">
                <div class="current-conditions">
                    <h3>Current Conditions</h3>
                    <p>Temperature: ${weatherData.current.main.temp}°C</p>
                    <p>Humidity: ${weatherData.current.main.humidity}%</p>
                    <p>Weather: ${weatherData.current.weather[0].description}</p>
                </div>
                <div class="weather-trends">
                    <h3>Weather Trends</h3>
                    <div id="trends-analysis"></div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(dashboard);
    createWeatherCharts(weatherData);
    analyzeWeatherTrends(weatherData);
}

function createWeatherCharts(weatherData) {
    const labels = [];
    const tempData = [];
    const humidityData = [];

    // Process forecast data for charts
    weatherData.forecast.forEach(item => {
        const date = new Date(item.dt * 1000);
        labels.push(date.toLocaleDateString());
        tempData.push(item.main.temp);
        humidityData.push(item.main.humidity);
    });

    // Create temperature chart
    new Chart(document.getElementById('tempChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: tempData,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Temperature Trend'
                }
            }
        }
    });

    // Create humidity chart
    new Chart(document.getElementById('humidityChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Humidity (%)',
                data: humidityData,
                borderColor: 'rgb(54, 162, 235)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Humidity Trend'
                }
            }
        }
    });
}

function analyzeWeatherTrends(weatherData) {
    const trendsDiv = document.getElementById('trends-analysis');
    
    // Calculate trends from forecast data
    const tempTrend = calculateTrend(weatherData.forecast.map(item => item.main.temp));
    const humidityTrend = calculateTrend(weatherData.forecast.map(item => item.main.humidity));

    trendsDiv.innerHTML = `
        <p><strong>Temperature Trend:</strong> ${getTrendDescription(tempTrend, 'temperature')}</p>
        <p><strong>Humidity Trend:</strong> ${getTrendDescription(humidityTrend, 'humidity')}</p>
        <p><strong>Weather Pattern:</strong> ${analyzeWeatherPattern(weatherData.forecast)}</p>
    `;
}

// Keep your existing helper functions (calculateTrend, getTrendDescription, analyzeWeatherPattern)

// Make sure the map click handler is properly set up
map.on('click', async (e) => {
    const { lat, lng } = e.latlng;
    try {
        console.log('Map clicked at:', lat, lng);
        const weatherData = await fetchAllWeatherData(lat, lng);
        showWeatherDashboard(weatherData, lat, lng);
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching weather data. Please try again.');
    }
});

// Rest of your existing script.js code... 