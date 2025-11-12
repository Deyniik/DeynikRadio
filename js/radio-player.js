// Радио плеер
class RadioPlayer {
    constructor(stationManager) {
        this.stationManager = stationManager;
        this.audio = null;
        this.isPlaying = false;
        this.volume = 70;
        this.visualizationInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStationInfo();
    }

    setupEventListeners() {
        const playButton = document.getElementById('play-btn');
        const prevButton = document.getElementById('prev-btn');
        const nextButton = document.getElementById('next-btn');
        const volumeSlider = document.getElementById('volume-slider');

        if (playButton) {
            playButton.addEventListener('click', () => this.togglePlay());
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => this.prevStation());
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextStation());
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
            volumeSlider.value = this.volume;
        }
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.play();
        } else {
            this.pause();
        }
        
        this.updatePlayButton();
    }

    play() {
        const station = this.stationManager.getStation(this.stationManager.currentStation);
        if (!station) return;

        if (!this.audio) {
            this.audio = new Audio(station.url);
            this.audio.volume = this.volume / 100;
        }

        this.audio.play().catch(error => {
            console.error('Ошибка воспроизведения:', error);
            this.isPlaying = false;
            this.updatePlayButton();
        });

        this.startVisualization();
        this.showPlaybackIndicator(true);
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
        }
        this.stopVisualization();
        this.showPlaybackIndicator(false);
    }

    nextStation() {
        this.stationManager.getNextStation();
        this.changeStation();
        this.showNextButtonGif();
    }

    prevStation() {
        this.stationManager.getPrevStation();
        this.changeStation();
    }

    changeStation() {
        this.updateStationInfo();
        this.updateActiveStationUI();
        
        if (this.isPlaying) {
            if (this.audio) this.audio.pause();
            this.play();
        }
        
        this.changeGif();
    }

    updateStationInfo() {
        const station = this.stationManager.getStation(this.stationManager.currentStation);
        if (!station) return;

        const elements = {
            'current-station': station.name,
            'current-track-info': station.currentTrack,
            'current-artist-info': station.currentArtist,
            'quality': station.quality,
            'player-station': station.name,
            'player-description': station.description,
            'current-track': station.currentTrack,
            'current-artist': station.currentArtist
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        const playerIcon = document.getElementById('player-icon');
        if (playerIcon) {
            playerIcon.innerHTML = `<i class="${station.icon}"></i>`;
        }
    }

    updatePlayButton() {
        const playButton = document.getElementById('play-btn');
        const playerIcon = document.getElementById('player-icon');
        
        if (playButton) {
            playButton.innerHTML = this.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        }
        
        if (playerIcon) {
            if (this.isPlaying) {
                playerIcon.classList.add('playing');
            } else {
                playerIcon.classList.remove('playing');
            }
        }
    }

    setVolume(value) {
        this.volume = value;
        if (this.audio) {
            this.audio.volume = value / 100;
        }
        this.updateVolumeIcon();
    }

    updateVolumeIcon() {
        const volumeIcons = document.querySelectorAll('.volume-icon i');
        volumeIcons.forEach(icon => {
            if (this.volume == 0) {
                icon.className = 'fas fa-volume-mute';
            } else if (this.volume < 50) {
                icon.className = 'fas fa-volume-down';
            } else {
                icon.className = 'fas fa-volume-up';
            }
        });
    }

    startVisualization() {
        const visualization = document.getElementById('visualization');
        if (!visualization) return;

        const bars = visualization.querySelectorAll('.bar');
        if (this.visualizationInterval) clearInterval(this.visualizationInterval);
        
        this.visualizationInterval = setInterval(() => {
            bars.forEach(bar => {
                bar.style.height = `${Math.floor(Math.random() * 30) + 1}px`;
            });
        }, 100);
    }

    stopVisualization() {
        if (this.visualizationInterval) {
            clearInterval(this.visualizationInterval);
            this.visualizationInterval = null;
        }

        const bars = document.querySelectorAll('.bar');
        bars.forEach(bar => bar.style.height = '2px');
    }

    showPlaybackIndicator(show) {
        const indicator = document.getElementById('playback-indicator');
        if (indicator) {
            indicator.style.opacity = show ? '1' : '0';
        }
    }

    showNextButtonGif() {
        const nextGif = document.getElementById('nextGif');
        if (nextGif && Math.random() < 0.4) {
            nextGif.classList.add('show');
            setTimeout(() => {
                nextGif.classList.remove('show');
            }, 2000);
        }
    }

    changeGif() {
        const mainGif = document.getElementById('mainGif');
        if (!mainGif) return;

        const station = this.stationManager.getStation(this.stationManager.currentStation);
        const isMinecraft = station && station.name.toLowerCase().includes('minecraft');
        const randomGif = Utils.getRandomGif(isMinecraft ? 'minecraft' : 'normal');

        mainGif.classList.add('gif-transition');
        
        setTimeout(() => {
            mainGif.style.backgroundImage = `url('${randomGif}')`;
            setTimeout(() => {
                mainGif.classList.remove('gif-transition');
            }, 600);
        }, 300);
    }

    updateActiveStationUI() {
        const stationItems = document.querySelectorAll('.station-list li');
        stationItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-station') === this.stationManager.currentStation) {
                item.classList.add('active');
            }
        });
    }
}
