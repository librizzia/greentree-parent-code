// Set default wait period for the page to load in milliseconds
const pageLoadWaitPeriod = 250; // 1/4 second
// Set the timeout for the fetch request in milliseconds
const fetchTimeout = 1000; // 1 second

// Function to get the API URL from the configuration
function getApiUrl(key) {
  if (window.API_CONFIG && window.API_CONFIG[key]) {
      return window.API_CONFIG[key];
  }
  
  console.warn(`API_CONFIG for ${key} not found. Using default URL.`);
  return 'http://localhost:56386/version'; // Default fallback
}

// Set API URL
const apiUrl = getApiUrl('VERSION_URL');

document.addEventListener("DOMContentLoaded", function () {
  // Wait for the page to load completely
  setTimeout(function () {
    checkApiStatus();
  }, pageLoadWaitPeriod);
});

function checkApiStatus() {
  // Create an AbortController and signal for the fetch request
  const abortController = new AbortController();
  const abortSignal = abortController.signal;

  // Set a timeout for the fetch request
  const timeoutId = setTimeout(() => {
    abortController.abort(); // Abort the request after the specified timeout
  }, fetchTimeout);

  fetch(apiUrl, { signal: abortSignal })
    .then(response => {
      // Check if the response status is in the success range (200-299)
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      // Check if there are headers in the response
      const headers = response.headers;
      if (!headers || headers.size === 0) {
        throw new Error('No headers in the API response');
      }

      // Parse JSON response if needed
      return response.json();
    })
    .then(data => {
      // Check conditions in the response data if necessary
      // Example: if (data.someCondition) { throw new Error('Custom error message'); }
    })
    .catch(error => {
      // If an error occurred, display the error modal
      displayErrorModal(error.message);
    })
    .finally(() => {
      clearTimeout(timeoutId); // Clear the timeout to avoid potential memory leaks
    });
}

function displayErrorModal(errorMessage) {
  const errorModal = document.getElementById("error-modal");
  if (errorModal) {
    // Update modal content with the error message
    // const modalContent = errorModal.querySelector("article");
    // modalContent.querySelector("h4").textContent = `☹️ ${errorMessage}`;

    // Open the error modal
    openModal(errorModal);
  }
}

function displayErrorModalFromScript(errorMessage) {
    const errorModal = document.getElementById("error-modal");
    if (errorModal) {
      // Update modal content with the error message
      const modalContent = errorModal.querySelector("article");
      modalContent.querySelector("h4").textContent = `${errorMessage}`;
  
      // Open the error modal
      openModal(errorModal);
    }
  }
  