class RealtimeAnalytics {
  constructor(streamId) {
    this.streamId = streamId;
    this.socket = io();
    this.charts = {};
    this.initialize();
  }

  initialize() {
    this.setupSocketListeners();
    this.createCharts();
    this.joinStream();
  }

  setupSocketListeners() {
    this.socket.on('analytics-update', (data) => {
      this.updateDashboard(data);
    });
  }

  createCharts() {
    // Listeners Chart
    const listenersCtx = document.getElementById('realtimeListeners').getContext('2d');
    this.charts.listeners = new Chart(listenersCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Current Listeners',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'minute'
            }
          }
        }
      }
    });

    // Weather Chart
    const weatherCtx = document.getElementById('realtimeWeather').getContext('2d');
    this.charts.weather = new Chart(weatherCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Temperature',
          data: [],
          borderColor: 'rgb(255, 99, 132)',
          yAxisID: 'temperature'
        }, {
          label: 'Humidity',
          data: [],
          borderColor: 'rgb(54, 162, 235)',
          yAxisID: 'humidity'
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'minute'
            }
          },
          temperature: {
            type: 'linear',
            position: 'left'
          },
          humidity: {
            type: 'linear',
            position: 'right'
          }
        }
      }
    });
  }

  joinStream() {
    this.socket.emit('join-stream', this.streamId);
  }

  updateDashboard(data) {
    // Update metrics
    document.getElementById('currentListeners').textContent = data.currentListeners;
    document.getElementById('peakListeners').textContent = data.peakListeners;

    // Update charts
    this.updateListenersChart(data);
    this.updateWeatherChart(data);
  }

  updateListenersChart(data) {
    const chart = this.charts.listeners;
    
    chart.data.labels.push(new Date(data.timestamp));
    chart.data.datasets[0].data.push(data.currentListeners);

    // Keep last 30 minutes of data
    if (chart.data.labels.length > 30) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }

    chart.update();
  }

  updateWeatherChart(data) {
    const chart = this.charts.weather;
    
    if (data.recentWeather && data.recentWeather.length > 0) {
      const latestWeather = data.recentWeather[data.recentWeather.length - 1];
      
      chart.data.labels.push(new Date(latestWeather.timestamp));
      chart.data.datasets[0].data.push(latestWeather.temperature);
      chart.data.datasets[1].data.push(latestWeather.humidity);

      // Keep last 30 minutes of data
      if (chart.data.labels.length > 30) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
      }

      chart.update();
    }
  }

  cleanup() {
    this.socket.emit('leave-stream', this.streamId);
    this.socket.disconnect();
  }
} 