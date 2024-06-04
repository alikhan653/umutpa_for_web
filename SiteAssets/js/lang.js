const translations = {
    en: {
        welcome: "Welcome to our website",
        about: "About Us",
        hello: "Hello, Dr. ",
        contact: "Contact",
        phone: "Phone",
        brand: "Umytpa",
        notification: "Notification",
        markAllRead: "mark all as read",
        viewMore: "view more",
        language: "Language",
        settings: "settings",
        logout: "Logout",
        dashboard: "dashboard",
        patients: "patients",
        appointments: "appointments",
        medications: "medications",
        makeAppointment: "make an appointment",
        addUser: "add a user",
        addMedicines: "add a medicines",
        patientsList: "Patients lists",
        upcomingAppointments: "upcoming appointments",
        totalPatients: "total patients",
        more: "more"
    },
    ru: {
        welcome: "Добро пожаловать на наш сайт",
        about: "О нас",
        contact: "Контакт",
        phone: "Телефон",
        brand: "Умытапа",
        notification: "Уведомление",
        markAllRead: "отметить все как прочитанные",
        viewMore: "посмотреть больше",
        language: "Язык",
        settings: "настройки",
        logout: "Выйти",
        dashboard: "панель",
        patients: "пациенты",
        appointments: "назначения",
        medications: "лекарства",
        makeAppointment: "записаться на прием",
        addUser: "добавить пользователя",
        addMedicines: "добавить лекарства",
        patientsList: "Списки пациентов",
        upcomingAppointments: "предстоящие назначения",
        totalPatients: "всего пациентов",
        more: "больше"
    },
    kz: {
        welcome: "Біздің веб-сайтымызға қош келдіңіз",
        hello: "Сәлем",
        about: "Біз туралы",
        contact: "Байланыс",
        phone: "Телефон",
        brand: "Умытпа",
        notification: "Хабарландыру",
        markAllRead: "барлығын оқылды деп белгілеу",
        viewMore: "көбірек қарау",
        language: "Тіл",
        settings: "параметрлер",
        logout: "Шығу",
        dashboard: "тақта",
        patients: "науқастар",
        appointments: "тағайындаулар",
        medications: "дәрі-дәрмектер",
        makeAppointment: "тағайындау жасау",
        addUser: "пайдаланушы қосу",
        addMedicines: "дәрі-дәрмек қосу",
        patientsList: "Науқастар тізімдері",
        upcomingAppointments: "алдағы кездесулер",
        totalPatients: "барлық науқастар",
        more: "тағы"
    }
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
