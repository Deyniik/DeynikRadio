// Инициализация элементов
const mainContent = document.getElementById('mainContent');
const auraSelector = document.getElementById('auraSelector');
const auraSelect = document.getElementById('auraSelect');
const miniPlayer = document.getElementById('miniPlayer');
const miniPlayerIcon = document.getElementById('miniPlayerIcon');
const miniPlayerTitle = document.getElementById('miniPlayerTitle');
const miniPlayerDescription = document.getElementById('miniPlayerDescription');
const miniPlayerPlayBtn = document.getElementById('miniPlayerPlayBtn');
const miniPlayerRefreshBtn = document.getElementById('miniPlayerRefreshBtn');
const fullscreenPlayer = document.getElementById('fullscreenPlayer');
const fullscreenClose = document.getElementById('fullscreenClose');
const fullscreenIcon = document.getElementById('fullscreenIcon');
const fullscreenTitle = document.getElementById('fullscreenTitle');
const fullscreenDescription = document.getElementById('fullscreenDescription');
const fullscreenPlayBtn = document.getElementById('fullscreenPlayBtn');
const fullscreenVolume = document.getElementById('fullscreenVolume');
const fullscreenVolumeIcon = document.getElementById('fullscreenVolumeIcon');
const googleAuthBtn = document.getElementById('googleAuthBtn');
const chatBtn = document.getElementById('chatBtn');
const chatContainer = document.getElementById('chatContainer');
const chatClose = document.getElementById('chatClose');
const onlineUsers = document.getElementById('onlineUsers');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const sidebarBtn = document.getElementById('sidebarBtn');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebarClose');
const favoritesList = document.getElementById('favoritesList');
const globalVolume = document.getElementById('global-volume');
const randomRadioBtn = document.getElementById('random-radio');
const verkaBtn = document.getElementById('verka-btn');

// Верка Сердючка
const verkaPlayer = new Audio('https://music6.mp3party.net/online/8848.mp3');
let isVerkaPlaying = false;

// Автоматически запускаем радио при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Показываем основной контент сразу
    mainContent.style.display = 'flex';
    auraSelector.style.display = 'flex';
    
    // Автоматически включаем главное радио (KISS FM)
    setTimeout(() => {
        const kissPlayer = document.getElementById('kissint-player');
        const kissPlayBtn = document.querySelector('#kissint-card .play-btn');
        currentCard = document.getElementById('kissint-card');
        
        if (kissPlayer && kissPlayBtn) {
            kissPlayer.play()
                .then(() => {
                    kissPlayBtn.classList.add('paused');
                    currentCard.classList.add('active');
                    currentPlayer = kissPlayer;
                    updateMiniPlayer(currentCard);
                    updateFullscreenPlayer(currentCard);
                    
                    // Вибрация на мобильных устройствах
                    if (isMobile && navigator.vibrate) {
                        navigator.vibrate(100);
                    }
                })
                .catch(error => {
                    console.log("Автовоспроизведение заблокировано");
                    kissPlayer.controls = true;
                    kissPlayBtn.style.display = 'none';
                });
        }
    }, 500);
    
    // Инициализация модулей
    initAuth();
    initPlayers();
    initChat();
    initFavorites();
    initSidebar();
    
    // Инициализация обработчиков
    initEventHandlers();
});

// Инициализация обработчиков событий
function initEventHandlers() {
    // Обработчик изменения выбора ауры
    auraSelect.addEventListener('change', function() {
        const selectedAura = this.value;
        applyAura(selectedAura);
    });

    // Обработчик кнопки play/pause в мини-плеере
    miniPlayerPlayBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentPlayer) {
            if (currentPlayer.paused) {
                currentPlayer.play()
                    .then(() => {
                        this.innerHTML = '<i class="fas fa-pause"></i>';
                        if (currentCard) {
                            currentCard.querySelector('.play-btn').classList.add('paused');
                            currentCard.classList.add('active');
                            updateFullscreenPlayer(currentCard);
                        }
                    })
                    .catch(error => {
                        console.log("Ошибка воспроизведения:", error);
                    });
            } else {
                currentPlayer.pause();
                this.innerHTML = '<i class="fas fa-play"></i>';
                if (currentCard) {
                    currentCard.querySelector('.play-btn').classList.remove('paused');
                    currentCard.classList.remove('active');
                    updateFullscreenPlayer(currentCard);
                }
            }
        }
    });

    // Обработчик кнопки обновления в мини-плеере
    miniPlayerRefreshBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentPlayer && currentCard) {
            refreshStream(currentPlayer, currentCard);
        }
    });

    // Обработчик клика по мини-плееру
    miniPlayer.addEventListener('click', function() {
        if (currentCard) {
            fullscreenPlayer.classList.add('active');
            updateFullscreenPlayer(currentCard);
        }
    });

    // Обработчик закрытия полноэкранного плеера
    fullscreenClose.addEventListener('click', function(e) {
        e.stopPropagation();
        fullscreenPlayer.classList.remove('active');
    });

    // Обработчик кнопки play/pause в полноэкранном плеере
    fullscreenPlayBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentPlayer) {
            if (currentPlayer.paused) {
                currentPlayer.play()
                    .then(() => {
                        this.innerHTML = '<i class="fas fa-pause"></i>';
                        if (currentCard) {
                            currentCard.querySelector('.play-btn').classList.add('paused');
                            currentCard.classList.add('active');
                            miniPlayerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        }
                    })
                    .catch(error => {
                        console.log("Ошибка воспроизведения:", error);
                    });
            } else {
                currentPlayer.pause();
                this.innerHTML = '<i class="fas fa-play"></i>';
                if (currentCard) {
                    currentCard.querySelector('.play-btn').classList.remove('paused');
                    currentCard.classList.remove('active');
                    miniPlayerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            }
        }
    });

    // Обработчик изменения громкости в полноэкранном плеере
    fullscreenVolume.addEventListener('input', function(e) {
        const volume = parseFloat(e.target.value);
        if (currentPlayer) {
            currentPlayer.volume = volume;
        }
        updateVolumeIcon(fullscreenVolumeIcon, volume);
    });

    // Обработчики вкладок
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tabId = btn.dataset.tab + '-tab';
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Обработчик глобальной громкости
    globalVolume.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        players.forEach(item => {
            item.player.volume = volume;
        });
        if (currentPlayer) {
            currentPlayer.volume = volume;
        }
        updateVolumeIcon(fullscreenVolumeIcon, volume);
    });

    // Обработчик случайного радио
    randomRadioBtn.addEventListener('click', () => {
        players.forEach(item => {
            if (!item.player.paused) {
                item.player.pause();
                item.playBtn.classList.remove('paused');
                item.card.classList.remove('active');
            }
        });
        
        const activeTab = document.querySelector('.tab-content.active').id.replace('-tab', '');
        let filteredPlayers = [];
        
        if (activeTab === 'international') {
            filteredPlayers = players.slice(0, 6);
        } else if (activeTab === 'russia') {
            filteredPlayers = players.slice(6, 12);
        } else if (activeTab === 'ukraine') {
            filteredPlayers = players.slice(12, 18);
        } else if (activeTab === 'lofi') {
            filteredPlayers = players.slice(18, 21);
        }
        
        if (filteredPlayers.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredPlayers.length);
            const randomPlayer = filteredPlayers[randomIndex];
            currentPlayer = randomPlayer.player;
            currentCard = randomPlayer.card;
            
            randomPlayer.player.querySelector('source').src = randomPlayer.player.querySelector('source').src.split('?')[0] + '?_=' + Date.now();
            randomPlayer.player.load();
            
            randomPlayer.player.play()
                .then(() => {
                    randomPlayer.playBtn.classList.add('paused');
                    randomPlayer.card.classList.add('active');
                    updateMiniPlayer(randomPlayer.card);
                    updateFullscreenPlayer(randomPlayer.card);
                    
                    // Вибрация на мобильных устройствах
                    if (isMobile && navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                })
                .catch(error => {
                    randomPlayer.player.controls = true;
                    randomPlayer.playBtn.style.display = 'none';
                    randomPlayer.player.play();
                });
        }
    });

    // Обработчики пресетов громкости
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const volume = parseFloat(this.dataset.preset);
            globalVolume.value = volume;
            players.forEach(item => {
                item.player.volume = volume;
            });
            if (currentPlayer) {
                currentPlayer.volume = volume;
            }
            updateVolumeIcon(fullscreenVolumeIcon, volume);
            
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Обработчик Верки Сердючки
    verkaPlayer.addEventListener('error', (e) => {
        console.log("Ошибка воспроизведения Верки:", e);
        verkaBtn.innerHTML = '<i class="fas fa-star"></i> Верка Сердючка';
        verkaBtn.classList.remove('verka-playing');
        isVerkaPlaying = false;
    });
    
    verkaBtn.addEventListener('click', function() {
        players.forEach(item => {
            if (!item.player.paused) {
                item.player.pause();
                item.playBtn.classList.remove('paused');
                item.card.classList.remove('active');
            }
        });
        
        if (!isVerkaPlaying) {
            verkaPlayer.volume = globalVolume.value;
            verkaPlayer.play()
                .then(() => {
                    isVerkaPlaying = true;
                    verkaBtn.innerHTML = '<i class="fas fa-pause"></i> Пауза Верки';
                    verkaBtn.classList.add('verka-playing');
                    currentPlayer = verkaPlayer;
                    currentCard = null;
                    
                    // Обновляем мини-плеер
                    miniPlayerIcon.innerHTML = '<i class="fas fa-star"></i>';
                    miniPlayerTitle.textContent = 'Верка Сердючка';
                    miniPlayerDescription.textContent = 'Украинские хиты';
                    miniPlayerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    miniPlayer.classList.add('visible');
                    
                    // Обновляем полноэкранный плеер
                    fullscreenIcon.innerHTML = '<i class="fas fa-star"></i>';
                    fullscreenTitle.textContent = 'Верка Сердючка';
                    fullscreenDescription.textContent = 'Украинские хиты';
                    fullscreenPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    
                    // Вибрация на мобильных устройствах
                    if (isMobile && navigator.vibrate) {
                        navigator.vibrate(100);
                    }
                })
                .catch(error => {
                    console.error("Ошибка воспроизведения:", error);
                    alert("Нажмите 'Разрешить' в запросе автовоспроизведения или запустите вручную");
                });
        } else {
            verkaPlayer.pause();
            isVerkaPlaying = false;
            verkaBtn.innerHTML = '<i class="fas fa-star"></i> Верка Сердючка';
            verkaBtn.classList.remove('verka-playing');
            miniPlayerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            fullscreenPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
}

// Функции для работы с боковым меню
function initSidebar() {
    sidebarBtn.addEventListener('click', toggleSidebar);
    sidebarClose.addEventListener('click', toggleSidebar);
}

function toggleSidebar() {
    sidebar.classList.toggle('open');
}
