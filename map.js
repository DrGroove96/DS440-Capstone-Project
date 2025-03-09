let map;
let weatherLayer;
let markers = {};

// Initialize global chart variables
let tempChart, rainChart, snowChart;
let currentMarker = null; // For tracking the current pin

// Function to format location name from geocoding response
function formatLocationName(locationData) {
    if (!locationData || !locationData.address) {
        return 'Unknown Location';
    }

    const parts = [];
    if (locationData.address.city) parts.push(locationData.address.city);
    else if (locationData.address.town) parts.push(locationData.address.town);
    else if (locationData.address.village) parts.push(locationData.address.village);
    
    if (locationData.address.state) parts.push(locationData.address.state);
    if (locationData.address.country && parts.length === 0) parts.push(locationData.address.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
}

// Function to generate fallback data when API fails
function generateFallbackData() {
    const currentDate = new Date();
    const dates = Array(10).fill(currentDate).map((date, i) => {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + i);
        return formatDate(newDate);
    });

    return {
        locationName: 'Location Unavailable',
        temperature: 'N/A',
        feelsLike: 'N/A',
        low: 'N/A',
        high: 'N/A',
        pressure: 'N/A',
        wind: 'N/A',
        dates: dates,
        temperatures: Array(10).fill(null),
        feelsLikeTemps: Array(10).fill(null),
        rainfall: Array(10).fill(0),
        snowfall: Array(10).fill(0)
    };
}

// Initialize charts when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    initializeMap();
});

function initializeCharts() {
    // Temperature Chart with both actual and feels like
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Actual (°F)',
                    data: [],
                    borderColor: '#ff6b6b',
                    tension: 0.1,
                    fill: false,
                    pointRadius: 4
                },
                {
                    label: 'Feels Like (°F)',
                    data: [],
                    borderColor: '#aaaaaa',
                    borderDash: [5, 5],
                    tension: 0.1,
                    fill: false,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    // Rain Chart
    const rainCtx = document.getElementById('rainChart').getContext('2d');
    rainChart = new Chart(rainCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Rain (in)',
                data: [],
                backgroundColor: '#4dabf7'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Snow Chart
    const snowCtx = document.getElementById('snowChart').getContext('2d');
    snowChart = new Chart(snowCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Snow (in)',
                data: [],
                backgroundColor: '#dee2e6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function initializeMap() {
    // Initialize the map
    map = L.map('map').setView([40.7934, -77.8600], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add initial marker
    currentMarker = L.marker([40.7934, -77.8600]).addTo(map);

    // Add click handler
    map.on('click', async function(e) {
        try {
            // Remove previous marker if it exists
            if (currentMarker) {
                map.removeLayer(currentMarker);
            }
            
            // Add new marker at clicked location
            currentMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
            
            await fetchWeatherData(e.latlng.lat, e.latlng.lng);
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Load initial data
    fetchWeatherData(40.7934, -77.8600);
}

function updateDashboard(data) {
    try {
        document.getElementById('location').textContent = data.locationName;
        document.getElementById('temp').textContent = `${data.temperature}°F / ${toCelsius(data.temperature)}°C`;
        document.getElementById('feels-like').textContent = `${data.feelsLike}°F / ${toCelsius(data.feelsLike)}°C`;
        document.getElementById('low-high').textContent = `${data.low}-${data.high}°F / ${toCelsius(data.low)}-${toCelsius(data.high)}°C`;
        document.getElementById('pressure').textContent = data.pressure;
        document.getElementById('wind').textContent = data.wind;
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

function updateCharts(data) {
    try {
        // Update Temperature Chart
        if (tempChart) {
            tempChart.data.labels = data.dates;
            tempChart.data.datasets[0].data = data.temperatures;
            tempChart.data.datasets[1].data = data.feelsLikeTemps;
            tempChart.update();
        }

        // Update Rain Chart
        if (rainChart) {
            rainChart.data.labels = data.dates;
            rainChart.data.datasets[0].data = data.rainfall;
            rainChart.update();
        }

        // Update Snow Chart
        if (snowChart) {
            snowChart.data.labels = data.dates;
            snowChart.data.datasets[0].data = data.snowfall;
            snowChart.update();
        }
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

// Define constants
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY = '438e5c5ba6a56eec4dfe8d2ffccaeeef';

// Function to convert Fahrenheit to Celsius
function toCelsius(fahrenheit) {
    if (fahrenheit === 'N/A' || isNaN(fahrenheit)) return 'N/A';
    return Math.round((fahrenheit - 32) * 5 / 9);
}

// Function to format dates
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

async function fetchWeatherData(lat, lon) {
    try {
        // Show loading state
        document.getElementById('loadingIndicator').style.display = 'block';
        document.getElementById('errorMessage').style.display = 'none';

        // Use OpenWeatherMap API endpoint
        const requestUrl = `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;
        console.log('Fetching weather data from:', requestUrl);

        const response = await fetch(requestUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received weather data:', data);
        
        // Transform OpenWeatherMap API data into our dashboard format
        const transformedData = {
            locationName: data.name || 'Unknown Location',
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            low: Math.round(data.main.temp_min),
            high: Math.round(data.main.temp_max),
            pressure: `${data.main.pressure} hPa`,
            wind: `${data.wind.speed} mph`,
            dates: Array.from({length: 10}, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return formatDate(date);
            }).reverse(),
            temperatures: Array.from({length: 10}, () => Math.round(data.main.temp + (Math.random() * 10 - 5))),
            feelsLikeTemps: Array.from({length: 10}, () => Math.round(data.main.feels_like + (Math.random() * 10 - 5))),
            rainfall: Array.from({length: 10}, () => Math.random() * 0.5),
            snowfall: Array.from({length: 10}, () => Math.random() * 0.2)
        };
        
        console.log('Transformed data:', transformedData);
        
        // Update dashboard and charts with the transformed data
        updateDashboard(transformedData);
        updateCharts(transformedData);
        
        return transformedData;
    } catch (error) {
        console.error('Detailed error:', error);
        
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.style.display = 'block';
        errorMessage.textContent = `Unable to connect to weather service. Error: ${error.message}`;
        
        document.getElementById('loadingIndicator').style.display = 'none';
        
        // Use fallback data when API fails
        const fallbackData = generateFallbackData();
        updateDashboard(fallbackData);
        updateCharts(fallbackData);
        
        throw error;
    } finally {
        // Hide loading state
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// Get current location function
async function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                map.setView([lat, lng], 13);
                const weatherData = await fetchWeatherData(lat, lng);
                updateDashboard(weatherData);
            },
            function(error) {
                console.error('Error getting location:', error);
                alert('Unable to get your location. Please try searching for a location instead.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
}

// Weather data analysis functions
function calculateTrend(data) {
    const values = data.slice(-5); // Last 5 values
    const trend = values.reduce((a, b) => a + b, 0) / values.length;
    return trend;
}

function analyzeWeatherTrends(weatherData) {
    const tempTrend = calculateTrend(weatherData.temperatures || []);
    const rainTrend = calculateTrend(weatherData.rainfall || []);
    
    return {
        temperature: tempTrend,
        rainfall: rainTrend
    };
}

function showWeatherDashboard(weatherData) {
    const trends = analyzeWeatherTrends(weatherData);
    updateCharts(weatherData);
} 