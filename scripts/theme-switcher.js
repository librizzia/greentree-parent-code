/*!
 * Adapted Pico CSS Minimal theme switcher
 *
 * Pico.css - https://picocss.com
 * Copyright 2019-2024 - Licensed under MIT
 */

document.addEventListener('DOMContentLoaded', function(){
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlTag = document.documentElement;

    // Function to set the SVG icon based on the current theme
    function setThemeIcon() {
        if (htmlTag.getAttribute('data-theme') === 'dark'){
            themeIcon.innerHTML = '<img src="./img/moon.svg" alt="Light Theme">';
            themeToggle.classList.remove('dark');
            themeToggle.classList.add('light');
        } else {
            themeIcon.innerHTML = '<img src="./img/sun.svg" alt="Dark Theme">';
            themeToggle.classList.remove('light');
            themeToggle.classList.add('dark');
        }
        // Fade in the icon by removing the hidden class and setting opacity to 1
        themeIcon.classList.remove('hidden');
        setTimeout(() => {
            themeIcon.style.opacity = '1';
        }, 100); // Delay the opacity change slightly for the fade effect
    }

    // Initial setup
    setThemeIcon();

    // Event listener for theme toggle
    themeToggle.addEventListener('click', function(event){
        event.preventDefault(); // Prevent anchor's default behavior
        if (htmlTag.getAttribute('data-theme') === 'dark'){
            htmlTag.setAttribute('data-theme', 'light');
        } else {
            htmlTag.setAttribute('data-theme', 'dark');
        }
        // Update the theme icon after toggling
        setThemeIcon();
    });
});
