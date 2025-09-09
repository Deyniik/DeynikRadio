// Глобальные переменные
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let currentPlayer = null;
let currentCard = null;
let players = [];

// Обновление мини-плеера
function updateMiniPlayer(card) {
    const header = card.querySelector('.station-header');
    const icon = header.querySelector('.station-icon i').className;
    const title = header.querySelector('.station-info h3').childNodes[0].textContent.trim();
    const description = header.querySelector('.station-info p').textContent;
    
    miniPlayerIcon.innerHTML = `<i class="${icon}"></i>`;
    miniPlayerTitle.textContent = title;
    miniPlayerDescription.textContent = description;
    
    miniPlayer.classList.add('visible');
    
    // Обновляем состояние кнопки play/pause
    if (currentPlayer && !currentPlayer.paused) {
        miniPlayerPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        miniPlayerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Обновление полноэкранного плеера
function updateFullscreenPlayer(card) {
    const header = card.querySelector('.station-header');
    const icon = header.querySelector('.station-icon i').className;
    const title = header.querySelector('.station-info h3').childNodes[0].textContent.trim();
    const description = header.querySelector('.station-info p').textContent;
    
    fullscreenIcon.innerHTML = `<i class="${icon}"></i>`;
    fullscreenTitle.textContent = title;
    fullscreenDescription.textContent = description;
    
    // Обновляем состояние кнопки play/pause
    if (currentPlayer && !currentPlayer.paused) {
        fullscreenPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        fullscreenPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
    
    // Обновляем громкость
    if (currentPlayer) {
        fullscreenVolume.value = currentPlayer.volume;
        updateVolumeIcon(fullscreenVolumeIcon, currentPlayer.volume);
    }
}

// Применение выбранной ауры
function applyAura(mood) {
    // Удаляем все классы аур
    document.body.classList.remove(
        'aura-happy', 'aura-chill', 'aura-energetic', 
        'aura-romantic', 'aura-sad', 'aura-focus'
    );
    
    // Добавляем нужный класс
    if (mood && mood !== 'default') {
        document.body.classList.add(`aura-${mood}`);
    }
}

// Обновление иконки громкости
function updateVolumeIcon(icon, volume) {
    if (volume === 0) {
        icon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        icon.className = 'fas fa-volume-down';
    } else {
        icon.className = 'fas fa-volume-up';
    }
}

// Функция обновления потока
function refreshStream(player, card) {
    if (!player.paused) {
        const currentTime = player.currentTime;
        const src = player.querySelector('source').src;
        const bitrateEl = card.querySelector('.bitrate-info');
        
        player.querySelector('source').src = src.split('?')[0] + '?_=' + Date.now();
        player.load();
        
        // Показываем состояние загрузки
        bitrateEl.textContent = "Обновление потока...";
        
        player.play()
            .then(() => {
                player.currentTime = currentTime;
                setTimeout(() => {
                    bitrateEl.textContent = `Битрейт: ~${card.querySelector('.quality-tag').textContent.match(/\d+/)[0]} kbps`;
                }, 2000);
            })
            .catch(e => {
                console.log("Автовоспроизведение заблокировано");
            });
    }
}

function updateBitrate() {
    players.forEach(item => {
        if (!item.player.paused) {
            const qualityTag = item.card.querySelector('.quality-tag').textContent;
            const bitrate = qualityTag.match(/\d+/)[0];
            item.bitrateEl.textContent = `Битрейт: ~${bitrate} kbps`;
        } else {
            if (item.bitrateEl.textContent !== "Ошибка загрузки") {
                item.bitrateEl.textContent = '';
            }
        }
    });
}

// Инициализация плееров
function initPlayers() {
    document.querySelectorAll('.custom-audio').forEach((container, index) => {
        const audio = container.querySelector('audio');
        const playBtn = container.querySelector('.play-btn');
        const card = container.closest('.radio-card');
        const bitrateEl = container.nextElementSibling;
        
        players.push({
            player: audio,
            playBtn: playBtn,
            card: card,
            bitrateEl: bitrateEl
        });
        
        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                players.forEach(item => {
                    if (item.player !== audio) {
                        item.player.pause();
                        item.playBtn.classList.remove('paused');
                        item.card.classList.remove('active');
                    }
                });
                
                audio.play()
                    .then(() => {
                        playBtn.classList.add('paused');
                        card.classList.add('active');
                        currentPlayer = audio;
                        currentCard = card;
                        updateMiniPlayer(card);
                        updateFullscreenPlayer(card);
                        
                        // Вибрация на мобильных устройствах
                        if (isMobile && navigator.vibrate) {
                            navigator.vibrate(50);
                        }
                    })
                    .catch(error => {
                        console.log("Автовоспроизведение заблокировано");
                        audio.controls = true;
                        playBtn.style.display = 'none';
                        audio.play();
                    });
            } else {
                audio.pause();
                playBtn.classList.remove('paused');
                card.classList.remove('active');
                miniPlayerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                fullscreenPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
        
        audio.addEventListener('ended', () => {
            playBtn.classList.remove('paused');
            card.classList.remove('active');
            miniPlayerPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            fullscreenPlayBtn.innerHTML = '<i class="fas fa-play'></i>';
        });
        
        audio.volume = globalVolume.value;
        
        // Обработка ошибок воспроизведения
        audio.addEventListener('error', (e) => {
            console.log("Ошибка воспроизведения:", e);
            playBtn.style.display = 'flex'; // Всегда показываем кнопку
            playBtn.classList.remove('paused');
            card.classList.remove('active');
            
            // Показываем сообщение об ошибке
            bitrateEl.textContent = "Ошибка загрузки";
            setTimeout(() => {
                bitrateEl.textContent = "";
            }, 2000);
        });
    });

    setInterval(updateBitrate, 3000);
}
