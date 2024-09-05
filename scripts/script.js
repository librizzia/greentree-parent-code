// Variable to store the live text input value
let liveTextValue = "";
let isDataVisible = false; // Flag to track whether data is visible or not

// Variable to store the timer interval
let timerInterval;
let timerSeconds = 0;

// Set parent code HTML
const originalParentCodeHTML = document.getElementById("parentCodeDuration").innerHTML;

// Function to initialize the button text and data visibility state
function initializePage() {
    // const button = document.getElementById('toggleButton');
    // button.textContent = isDataVisible ? 'Hide Data' : 'Show Data';
    preventSpacesInInput();
    makeApiRequest(); // Initial API request to set the initial data visibility
}

// Function to get the API URL from the configuration
function getApiUrl(key) {
    if (window.API_CONFIG && window.API_CONFIG[key]) {
        return window.API_CONFIG[key];
    }
    
    console.warn(`API_CONFIG for ${key} not found. Using default URL.`);
    return 'http://localhost:56386/v1/message/Parent%20Code'; // Default fallback
}

// Use the function to set the BASE_API_URL
const BASE_API_URL = getApiUrl('BASE_URL');


function makeApiRequest() {
    // API endpoint URL
    const apiUrl = `${BASE_API_URL}`;
    // JSON payload with the live text value
    const payload = {
        "id": {
            "name": "Parent Code",
            "uuid": "",
            "index": 0
        },
        "message": `Parent Code: {Parent Number}`,
        "tokens": [
            {
                "name": "Parent Number",
                "text": {
                    "text": liveTextValue
                }
            }
        ],
        "theme": {
            "name": "",
            "uuid": "",
            "index": 0
        }
    };

    // Make a PUT request using fetch
    fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Display the JSON response if needed
        // displayResponse(data);
    })
    .catch(error => {
        console.error('Error fetching data 123:', error);
        displayErrorModalFromScript("Could not connect to the API");
    });

    // Update the button text based on data visibility state
    // const button = document.getElementById('toggleButton');
    // button.textContent = isDataVisible ? 'Hide Data' : 'Show Data';

    // Display or hide the JSON response based on the data visibility state
    // const responseContainer = document.getElementById('response-container');
    // responseContainer.style.display = isDataVisible ? 'block' : 'none';
}

function displayResponse(data) {
    // Display the JSON response in the response-container div
    const responseContainer = document.getElementById('response-container');
    responseContainer.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
}

// Function to show the error modal
function showErrorModal() {
    // Get the error modal dialog element
    const errorModal = document.getElementById('error-modal');

    // Set the open attribute to display the modal
    errorModal.setAttribute('open', '');
}

// Function to hide the error modal
function hideErrorModal() {
    // Get the error modal dialog element
    const errorModal = document.getElementById('error-modal');

    // Remove the open attribute to hide the modal
    errorModal.removeAttribute('open');
}

// Function to update live text value and make API request at the same time
function updateLiveText(value) {
    liveTextValue = value.toUpperCase(); // Convert value to uppercase

    // Update the validation status and message
    const messageInput = document.getElementById('messageInput');
    const messageHelper = document.getElementById('message-helper');
    if (!liveTextValue.trim()) {
        messageInput.classList.add('invalid');
        // messageInput.setAttribute('aria-invalid', 'true');
        messageHelper.textContent = 'Message cannot be empty.';
    } else {
        messageInput.classList.remove('invalid');
        // messageInput.setAttribute('aria-invalid', 'false');
        messageHelper.textContent = ''; // Clear error message if valid
    }

    // Make API request only if the message is not empty
    if (liveTextValue.trim()) {
        makeApiRequest();
    }
}

// Function to toggle the visibility of the data container
function toggleDataVisibility() {
    isDataVisible = !isDataVisible; // Toggle the visibility state
    makeApiRequest(); // Update the UI based on the new state
}

// Function to make a GET request and display JSON response
function getMessage() {
    // API endpoint URL
    const apiUrl = `${BASE_API_URL}`;

    // Make a GET request using fetch
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Display the JSON response
            // displayResponse(data);
        })
        .catch(error => {
            console.error('Error fetching data 321:', error);
        });
}

// Function to make a POST request to show a message
function showMessage(inputValue) {
    // Validate the text input
    const messageInput = document.getElementById('messageInput');
    const messageHelper = document.getElementById('message-helper');
    if (!liveTextValue.trim()) {
        messageInput.classList.add('invalid');
        messageHelper.textContent = 'Message cannot be empty.';
        showToast("Message cannot be empty", "error-toast");
        return;
    } else {
        messageInput.classList.remove('invalid');
        messageHelper.textContent = ''; // Clear error message if valid
    }

    // API endpoint URL for showing a message
    const apiUrl = `${BASE_API_URL}/trigger`;

    // Request body for showing a message
    const messagePayload = [
        {
            "name": "parent-code",
            "text": {
                "text": liveTextValue
            }
        }
    ];

    // Create an AbortController and signal for the fetch request
    const abortController = new AbortController();
    const abortSignal = abortController.signal;

    // Set a timeout for the fetch request
    const timeoutId = setTimeout(() => {
        abortController.abort(); // Abort the request after the specified timeout
    }, fetchTimeout); // Assuming fetchTimeout is defined globally

    // Make a POST request using fetch with the abort signal
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
        signal: abortSignal,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        // Check if the response is not empty before trying to parse as JSON
        if (data.trim() !== "") {
            const jsonData = JSON.parse(data);
            console.log('Message displayed successfully:', jsonData);
        } else {
            console.log('Message displayed successfully, but response was empty.');
            showToast("Message Displayed", "success-toast");
            resetTimer();
            startTimer();

            // Pass the liveTextValue to replaceParentCode
            replaceParentCode(liveTextValue);
        }
    })
    .catch(error => {
        console.error('Error displaying message:', error);
        displayErrorModalFromScript("📨 Could not show message!");
    })
    .finally(() => {
        clearTimeout(timeoutId); // Clear the timeout to avoid potential memory leaks
    });
}


// Function to make a GET request to clear the message
function hideMessage() {
    // API endpoint URL for clearing the message
    const apiUrl = `${BASE_API_URL}/clear`;

    // Create an AbortController and signal for the fetch request
    const abortController = new AbortController();
    const abortSignal = abortController.signal;

    // Set a timeout for the fetch request
    const timeoutId = setTimeout(() => {
        abortController.abort(); // Abort the request after the specified timeout
    }, fetchTimeout); // Assuming fetchTimeout is defined globally

    // Make a GET request using fetch with the abort signal
    fetch(apiUrl, { signal: abortSignal })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }

            // Log success if the response is not JSON
            console.log('Message cleared successfully.');
            showToast("Message cleared", "success-toast"); // Provide the style class here
            stopTimer();
        })
        .catch(error => {
            console.error('Error clearing message:', error);
            displayErrorModalFromScript("❌ Could not clear message!");
        })
        .finally(() => {
            clearTimeout(timeoutId); // Clear the timeout to avoid potential memory leaks
        });
}


// Function to display an error message on the screen
function displayErrorMessage(message) {
    // Display the error message on the screen
    const errorContainer = document.getElementById('error-container');
    errorContainer.textContent = message;

    // Clear the error message after a short delay (3 seconds)
    setTimeout(() => {
        errorContainer.textContent = '';
    }, 3000);
}

function submitForm(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    // Extract the input value from the form
    const inputValue = document.getElementById('messageInput').value;
    console.log("Form submitted with value:", inputValue.toUpperCase());
    showMessage(inputValue);
}


function replaceParentCode(newCode) {
    const parentCodeDurationElement = document.getElementById("parentCodeDuration");
    
    // Replace the original "(CODE)" with the new code in the innerHTML
    parentCodeDurationElement.innerHTML = originalParentCodeHTML.replace(/\(CODE\)/g, newCode);
}

// Function to show the toast notification with a custom message and style
function showToast(message, style) {
    // Get the toast DIV
    const toast = document.getElementById("toast");

    // Set the custom message
    toast.textContent = message;

    // Add the specified style class to toast DIV
    toast.classList.add(style);

    // Add the "show" class to toast DIV
    toast.classList.add("show");

    // After 3 seconds, remove the show class from the toast DIV, reset the message, and remove the style class
    setTimeout(function () {
        toast.classList.remove("show");
        toast.textContent = ""; // Reset to default message
        toast.classList.remove(style);
    }, 3000);
}


// Function to reset the timer and show the timer container with fade-in animation
function resetTimer() {
    timerSeconds = 0;
    updateTimerDisplay();
    animateTimerIn();
}

// Function to start the timer
function startTimer() {
    // Clear any existing interval
    clearInterval(timerInterval);

    // Start the timer interval
    timerInterval = setInterval(function () {
        timerSeconds++;
        updateTimerDisplay();
    }, 1000);

    animateTimerIn();
}

// Function to stop the timer and hide the timer container with fade-out animation
function stopTimer() {
    // Clear the timer interval
    clearInterval(timerInterval);

    // Wait for 1 second before calling animateTimerOut
    setTimeout(() => {
        animateTimerOut();
    }, 1000);
}

// Function to show the timer container and apply the fade-in animation
function animateTimerIn() {
    const timerContainer = document.getElementById('timer-container');
    timerContainer.classList.add('fade-in');
    timerContainer.style.display = 'block';
}

// Function to apply the fade-out animation to the timer container and hide it after animation
function animateTimerOut() {
    const timerContainer = document.getElementById('timer-container');
    timerContainer.classList.remove('fade-in');
    timerContainer.classList.add('fade-out');

    // Hide the timer container after the fade-out animation completes
    setTimeout(() => {
        timerContainer.style.display = 'none';
        timerContainer.classList.remove('fade-out');
    }, 500);
}

// Function to update the timer display
function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer');
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    timerDisplay.textContent = formattedTime;
}

function preventSpacesInInput() {
    const messageInput = document.getElementById('messageInput');
    const messageHelper = document.getElementById('message-helper');
    messageInput.addEventListener('keydown', function(event) {
        if (event.key === ' ') {
            event.preventDefault();
            messageHelper.textContent = 'Spaces are not allowed.'
        }
    });
}

// Initialize the page when it's loaded
initializePage()