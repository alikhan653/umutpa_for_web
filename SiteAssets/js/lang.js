const translations = {
    en: {
        welcome: "Welcome to our website",
        about: "About Us",
        contact: "Contact",
        phone: "Phone"
    },
    ru: {
        welcome: "Добро пожаловать на наш сайт",
        about: "О нас",
        contact: "Контакт",
        phone: "Телефон"
    },
    kz: {
        welcome: "Біздің веб-сайтымызға қош келдіңіз",
        about: "Біз туралы",
        contact: "Байланыс",
        phone: "Телефон"
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const translatableElements = document.querySelectorAll('[data-translate]');

    function updateContent(language) {
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = translations[language][key];
        });
    }

    dropdownItems.forEach(item => {
        item.addEventListener('click', (event) => {
            const selectedLanguage = event.target.getAttribute('data-lang');
            updateContent(selectedLanguage);
            localStorage.setItem('preferredLanguage', selectedLanguage); // Save the preference
        });
    });

    // Initialize content with preferred language or default to 'en'
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    updateContent(preferredLanguage);
});
