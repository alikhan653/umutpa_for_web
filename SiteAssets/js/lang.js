const translations = {
    en: {
        welcome: "Welcome to your dashboard",
        about: "About Us",
        contact: "Contact"
    },
    es: {
        welcome: "Bienvenido a nuestro sitio web",
        about: "Sobre nosotros",
        contact: "Contacto"
    },
    // Add more languages as needed
};

document.addEventListener('DOMContentLoaded', () => {
    const languageSwitcher = document.getElementById('languageSwitcher');
    const translatableElements = document.querySelectorAll('[data-translate]');

    function updateContent(language) {
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = translations[language][key];
        });
    }

    languageSwitcher.addEventListener('change', (event) => {
        const selectedLanguage = event.target.value;
        updateContent(selectedLanguage);
        localStorage.setItem('preferredLanguage', selectedLanguage); // Save the preference
    });

    // Initialize content with preferred language or default to 'en'
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    languageSwitcher.value = preferredLanguage;
    updateContent(preferredLanguage);
});
