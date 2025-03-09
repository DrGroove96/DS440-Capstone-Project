// Weather data analysis functions
function calculateTrend(data) {
    // Simple trend calculation
    const values = data.slice(-5); // Last 5 values
    const trend = values.reduce((a, b) => a + b, 0) / values.length;
    return trend;
}

function analyzeWeatherTrends(weatherData) {
    // Analyze temperature trends
    const tempTrend = calculateTrend(weatherData.temperatures || []);
    const rainTrend = calculateTrend(weatherData.rainfall || []);
    
    return {
        temperature: tempTrend,
        rainfall: rainTrend
    };
}

// Update weather dashboard
function showWeatherDashboard(weatherData) {
    const trends = analyzeWeatherTrends(weatherData);
    
    // Update charts with new data
    updateCharts(weatherData);
}

// Function to update all charts
function updateCharts(data) {
    // Update temperature chart
    if (window.tempChart) {
        window.tempChart.data.datasets[0].data = data.temperatures || [];
        window.tempChart.update();
    }
    
    // Update other charts similarly
    if (window.rainChart) {
        window.rainChart.data.datasets[0].data = data.rainfall || [];
        window.rainChart.update();
    }
} 