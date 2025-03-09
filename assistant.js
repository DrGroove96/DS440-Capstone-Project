let userLocation = null;

function initChat() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    let conversationHistory = [
        { 
            role: "system", 
            content: "You are a helpful weather assistant. Only ask for location access if not already granted. Once location is granted, provide weather information directly." 
        }
    ];

    async function getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    
                    try {
                        const weatherResponse = await fetch(`/api/weather?lat=${userLocation.lat}&lon=${userLocation.lon}`);
                        if (weatherResponse.ok) {
                            const weatherData = await weatherResponse.json();
                            const tempC = weatherData.main.temp;
                            const tempF = (tempC * 9/5) + 32;
                            
                            const weatherMsg = document.createElement('div');
                            weatherMsg.className = 'message assistant';
                            weatherMsg.textContent = `The current temperature at your location is ${tempC.toFixed(1)}°C (${tempF.toFixed(1)}°F) with ${weatherData.weather[0].description}.`;
                            chatMessages.appendChild(weatherMsg);
                        }
                    } catch (error) {
                        console.error('Error fetching weather:', error);
                    }
                    
                    resolve(userLocation);
                },
                (error) => {
                    let errorMessage = 'Please enable location access to get weather information.';
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'message system error';
                    errorMsg.textContent = errorMessage;
                    chatMessages.appendChild(errorMsg);
                    reject(new Error(errorMessage));
                }
            );
        });
    }

    async function sendMessage(message) {
        try {
            // Add user message to chat
            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'message user';
            userMessageDiv.textContent = message;
            chatMessages.appendChild(userMessageDiv);

            // Show loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message system';
            loadingDiv.textContent = 'Fetching weather information...';
            chatMessages.appendChild(loadingDiv);

            // Check for zip code in the message
            const zipCodeMatch = message.match(/\b\d{5}\b/);
            const zipCode = zipCodeMatch ? zipCodeMatch[0] : null;

            console.log('Detected zip code:', zipCode);

            // Add user message to conversation history
            conversationHistory.push({ role: "user", content: message });

            // Prepare request body
            const requestBody = {
                messages: conversationHistory,
                zipCode: zipCode
            };

            console.log('Sending request:', requestBody);

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received response:', data);
            
            // Remove loading indicator
            loadingDiv.remove();

            // Add assistant response to chat
            const assistantMessageDiv = document.createElement('div');
            assistantMessageDiv.className = 'message assistant';
            assistantMessageDiv.textContent = data.content;
            chatMessages.appendChild(assistantMessageDiv);

            // Add to conversation history
            conversationHistory.push({ 
                role: "assistant", 
                content: data.content 
            });

            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;

        } catch (error) {
            console.error('Error:', error);
            const loadingDiv = chatMessages.querySelector('.message.system:last-child');
            if (loadingDiv) {
                loadingDiv.remove();
            }

            const errorDiv = document.createElement('div');
            errorDiv.className = 'message system error';
            errorDiv.textContent = `Error: ${error.message}. Please try again with a valid US zip code.`;
            chatMessages.appendChild(errorDiv);
        }
    }

    // Event listeners
    sendButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
            sendMessage(message);
            userInput.value = '';
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = userInput.value.trim();
            if (message) {
                sendMessage(message);
                userInput.value = '';
            }
        }
    });

    // Request location on start
    getUserLocation().catch(error => {
        console.warn('Initial location request:', error);
    });
}

// Initialize chat when the document is loaded
document.addEventListener('DOMContentLoaded', initChat); 