// Основной файл приложения
class DeynikRadioApp {
    constructor() {
        this.stationManager = null;
        this.radioPlayer = null;
        this.authManager = null;
        this.chatManager = null;
        this.uiManager = null;
        this.init();
    }

    init() {
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startApp());
        } else {
            this.startApp();
        }
    }

    startApp() {
        // Скрываем экран загрузки
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            const mainContainer = document.getElementById('mainContainer');
            
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (mainContainer) mainContainer.style.display = 'flex';
            
            this.initializeModules();
        }, 1000);
    }

    initializeModules() {
        // Инициализация менеджера станций
        this.stationManager = new StationManager();
        
        // Инициализация радио плеера
        this.radioPlayer = new RadioPlayer(this.stationManager);
        
        // Инициализация менеджера аутентификации
        this.authManager = new AuthManager();
        
        // Инициализация менеджера чата
        this.chatManager = new ChatManager();
        
        // Инициализация UI менеджера
        this.uiManager = new UIManager();

        // Делаем app глобально доступным для обратной совместимости
        window.app = this;

        console.log('Deynik Radio App инициализирован!');
    }
}

// Запуск приложения
new DeynikRadioApp();
