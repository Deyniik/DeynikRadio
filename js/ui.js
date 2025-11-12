// UI взаимодействия
class UIManager {
    constructor() {
        this.currentTheme = 'retro';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initModals();
        this.initCategories();
    }

    setupEventListeners() {
        const themeSwitcher = document.getElementById('themeSwitcher');
        const randomStationBtn = document.getElementById('random-station-btn');
        const refreshButton = document.getElementById('refresh-btn');
        const likeButton = document.getElementById('like-btn');

        if (themeSwitcher) {
            themeSwitcher.addEventListener('click', () => this.toggleTheme());
        }

        if (randomStationBtn) {
            randomStationBtn.addEventListener('click', () => this.onRandomStation());
        }

        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.onRefresh());
        }

        if (likeButton) {
            likeButton.addEventListener('click', () => this.onLike());
        }

        // Станции
        const stationItems = document.querySelectorAll('.station-list li');
        stationItems.forEach(item => {
            item.addEventListener('click', () => this.onStationSelect(item));
        });
    }

    initModals() {
        this.setupModal('shareModal', 'closeShareModal');
        this.setupModal('nicknameModal', 'closeNicknameModal');
        this.setupModal('feedbackModal', 'closeFeedbackModal');
        this.setupModal('supportModal', 'closeSupportModal');
        this.setupModal('reactionsModal', 'closeReactionsModal');

        // Специальные обработчики для модальных окон
        this.setupNicknameModal();
        this.setupFeedbackModal();
        this.setupSupportModal();
    }

    setupModal(modalId, closeBtnId) {
        const modal = document.getElementById(modalId);
        const closeBtn = document.getElementById(closeBtnId);
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    initCategories() {
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterStationsByCategory(btn.dataset.category);
            });
        });
    }

    filterStationsByCategory(category) {
        // Реализация фильтрации станций по категориям
    }

    toggleTheme() {
        const themes = ['retro', 'cyber', 'matrix'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.currentTheme = themes[nextIndex];
        
        document.body.className = `${this.currentTheme}-theme`;
        
        const themeNames = {
            'retro': 'Ретро',
            'cyber': 'Кибер', 
            'matrix': 'Матрица'
        };
        
        const themeSwitcher = document.getElementById('themeSwitcher');
        if (themeSwitcher) {
            themeSwitcher.innerHTML = `<i class="fas fa-palette"></i> ${themeNames[this.currentTheme]}`;
        }
    }

    onRandomStation() {
        if (window.app && window.app.radioPlayer) {
            window.app.stationManager.getRandomStation();
            window.app.radioPlayer.changeStation();
            window.app.radioPlayer.isPlaying = true;
            window.app.radioPlayer.updatePlayButton();
        }
    }

    onRefresh() {
        const refreshButton = document.getElementById('refresh-btn');
        if (refreshButton) {
            refreshButton.classList.add('reload-animation');
            setTimeout(() => {
                refreshButton.classList.remove('reload-animation');
            }, 500);
        }

        if (window.app && window.app.radioPlayer) {
            // Логика обновления радио
            Utils.showNotification('Станция перезагружена', 'success');
        }
    }

    onLike() {
        // Логика лайка станции
    }

    onStationSelect(item) {
        const stationId = item.getAttribute('data-station');
        if (window.app && window.app.stationManager && window.app.radioPlayer) {
            window.app.stationManager.setCurrentStation(stationId);
            window.app.radioPlayer.isPlaying = true;
            window.app.radioPlayer.changeStation();
            window.app.radioPlayer.updatePlayButton();
        }
    }

    setupNicknameModal() {
        const saveNicknameBtn = document.getElementById('saveNicknameBtn');
        const cancelNicknameBtn = document.getElementById('cancelNicknameBtn');
        const nicknameInput = document.getElementById('nickname-input');

        if (saveNicknameBtn) {
            saveNicknameBtn.addEventListener('click', () => {
                if (window.app && window.app.authManager) {
                    window.app.authManager.saveNickname();
                }
            });
        }

        if (cancelNicknameBtn) {
            cancelNicknameBtn.addEventListener('click', () => {
                const nicknameModal = document.getElementById('nicknameModal');
                if (nicknameModal) nicknameModal.style.display = 'none';
            });
        }

        if (nicknameInput) {
            nicknameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && window.app && window.app.authManager) {
                    window.app.authManager.saveNickname();
                }
            });
        }
    }

    setupFeedbackModal() {
        // Реализация модального окна отзывов
    }

    setupSupportModal() {
        // Реализация модального окна поддержки
    }
}
