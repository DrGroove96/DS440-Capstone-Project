// Initialize charts when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Temperature Chart
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: ['', '', '', '', '', '', '', '', '', ''],
            datasets: [{
                label: 'Temperature (°F)',
                data: [30, 32, 31, 33, 32, 34, 32, 31, 32, 33],
                borderColor: '#ff6b6b',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Rain Chart
    const rainCtx = document.getElementById('rainChart').getContext('2d');
    new Chart(rainCtx, {
        type: 'bar',
        data: {
            labels: ['', '', '', '', '', '', '', '', '', ''],
            datasets: [{
                label: 'Rain (in)',
                data: [0.2, 0, 0.1, 0.3, 0.1, 0, 0.2, 0.1, 0, 0.1],
                backgroundColor: '#4dabf7',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Snow Chart
    const snowCtx = document.getElementById('snowChart').getContext('2d');
    new Chart(snowCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Snowfall (inches)',
                data: [8.5, 7.2, 4.1, 0.5, 0, 0, 0, 0, 0, 0.2, 2.5, 6.8],
                backgroundColor: '#90CAF9'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Wind Chart
    const windCtx = document.getElementById('windChart').getContext('2d');
    new Chart(windCtx, {
        type: 'line',
        data: {
            labels: ['', '', '', '', '', '', '', '', '', ''],
            datasets: [{
                label: 'Wind (MPH)',
                data: [12, 10, 11, 13, 12, 11, 10, 12, 11, 12],
                borderColor: '#82c91e',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}); 