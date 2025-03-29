document.addEventListener("DOMContentLoaded", function () {
    // Fields to save in localStorage with their respective keys
    const fieldsToSave = [
      // Stats tab
      { id: "username", key: "cod_username" },
      { id: "platform", key: "cod_platform" },
      { id: "game", key: "cod_game" },
      { id: "apiCall", key: "cod_apiCall" },
      
      // Matches tab
      { id: "matchUsername", key: "cod_matchUsername" },
      { id: "matchPlatform", key: "cod_matchPlatform" },
      { id: "matchGame", key: "cod_matchGame" },
      { id: "matchId", key: "cod_matchId" },
      
      // User tab
      { id: "userUsername", key: "cod_userUsername" },
      { id: "userPlatform", key: "cod_userPlatform" },
      { id: "userCall", key: "cod_userCall" },
      
      // Other/Search tab
      { id: "searchUsername", key: "cod_searchUsername" },
      { id: "searchPlatform", key: "cod_searchPlatform" },
      
      // Format and processing options
      { id: "outputFormat", key: "cod_outputFormat" },
      { id: "sanitizeOption", key: "cod_sanitizeOption" },
      { id: "replaceKeysOption", key: "cod_replaceKeysOption" },
      { id: "convertTimeOption", key: "cod_convertTimeOption" },
      { id: "timezoneSelect", key: "cod_timezone" }
    ];
  
    // Load saved values
    fieldsToSave.forEach(field => {
      const element = document.getElementById(field.id);
      if (!element) return; // Skip if element doesn't exist
      
      const savedValue = localStorage.getItem(field.key);
      if (savedValue !== null) {
        // Handle different input types
        if (element.type === "checkbox") {
          element.checked = savedValue === "true";
        } else if (element.tagName === "SELECT") {
          element.value = savedValue;
        } else {
          element.value = savedValue;
        }
      }
    });
  
    // Save values on change
    fieldsToSave.forEach(field => {
      const element = document.getElementById(field.id);
      if (!element) return; // Skip if element doesn't exist
      
      // Different event listener based on input type
      if (element.type === "checkbox") {
        element.addEventListener("change", function() {
          localStorage.setItem(field.key, element.checked);
        });
      } else if (element.tagName === "SELECT") {
        element.addEventListener("change", function() {
          localStorage.setItem(field.key, element.value);
        });
      } else {
        element.addEventListener("input", function() {
          localStorage.setItem(field.key, element.value);
        });
      }
    });
    
    // Special handling for SSO Token
    const ssoTokenInput = document.getElementById("ssoToken");
    const savedSsoToken = localStorage.getItem("cod_ssoToken");
    
    if (savedSsoToken) {
      ssoTokenInput.value = savedSsoToken;
    }

    // Ask the user before saving SSO token
    ssoTokenInput.addEventListener("input", function() {
      if (confirm("Would you like to save your SSO token? Note: This is stored on your device only.")) {
        localStorage.setItem("cod_ssoToken", ssoTokenInput.value);
      }
    });
    
    // Add a clear data button to the UI
    const container = document.querySelector('.container');
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Saved Data';
    clearButton.className = 'clear-data-btn';
    clearButton.style.marginTop = '10px';
    clearButton.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all saved form data?')) {
        fieldsToSave.forEach(field => {
          localStorage.removeItem(field.key);
        });
        localStorage.removeItem("cod_ssoToken");
        alert('All saved data has been cleared. Refresh the page to see changes.');
      }
    });
    container.appendChild(clearButton);
  });