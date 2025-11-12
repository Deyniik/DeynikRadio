// sync.js

// 1. КОНФИГУРАЦИЯ И ИНИЦИАЛИЗАЦИЯ
// (ВНИМАНИЕ: Для работы Firebase необходимо заменить заглушки на реальные данные)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 2. ГЛОБАЛЬНОЕ СОСТОЯНИЕ
window.DeynikRadioState = {
    stationId: 'europhard', // Текущая выбранная станция
    stationIndex: 0,
    isPlaying: false,
    volume: localStorage.getItem('radioVolume') ? parseFloat(localStorage.getItem('radioVolume')) : 70,
    currentUser: null,
    userNickname: localStorage.getItem('userNickname') || null,
    theme: localStorage.getItem('theme') || 'retro',
    chatMessages: [],
    onlineUsers: {},
    audio: null,
    audioContext: null,
    analyser: null,
    visualizationInterval: null,
    // ... другие состояния (лайки, чат-упоминания и т.д.)
};

// 3. ДАННЫЕ РАДИОСТАНЦИЙ (часть данных из оригинального файла)
const radioStations = {
    europhard: { name: "Euro Phard", url: "https://listen.radioking.com/radio/535497/stream/607567", description: "Лучшие хиты 90-х и 00-х", currentTrack: "Track Name", currentArtist: "Artist Name", quality: "128kbps", icon: "fas fa-compact-disc", category: "pop", gif: "https://i.gifer.com/152j.gif" },
    lofi: { name: "Lo-Fi Beats", url: "https://stream-178.zeno.fm/f3wvbbqmdg8uv?zt=...", description: "Расслабляющие биты", currentTrack: "Chill Beats", currentArtist: "LoFi Artist", quality: "192kbps", icon: "fas fa-moon", category: "lofi", gif: "https://i.pinimg.com/originals/7d/04/0e/7d040e94931427709008aaeda14db9c8.gif" },
    rock: { name: "Rock FM", url: "https://stream-58.zeno.fm/r4m4pbr988ruv", description: "Классика рока", currentTrack: "Rock Anthem", currentArtist: "Rock Band", quality: "192kbps", icon: "fas fa-guitar", category: "rock", gif: "https://i.gifer.com/1B9n.gif" },
    // ... остальные станции
};
const stationIds = Object.keys(radioStations);

// 4. ДИСПЕТЧЕР СОБЫТИЙ (Observer Pattern для синхронизации)
function dispatchStateChange(key, value) {
    window.DeynikRadioState[key] = value;
    document.dispatchEvent(new CustomEvent('stateChanged', { detail: { key, value } }));
}

// 5. КЛЮЧЕВАЯ ЛОГИКА (Audio, Auth, Chat)

// --- AUDIO/PLAYER LOGIC ---

// Инициализация Audio Context для визуализации
function initAudioContext(url) {
    if (window.DeynikRadioState.audioContext) {
        window.DeynikRadioState.audioContext.close();
    }
    window.DeynikRadioState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    window.DeynikRadioState.audio = new Audio(url);
    window.DeynikRadioState.audio.crossOrigin = "anonymous";
    window.DeynikRadioState.audio.volume = window.DeynikRadioState.volume / 100;

    const source = window.DeynikRadioState.audioContext.createMediaElementSource(window.DeynikRadioState.audio);
    window.DeynikRadioState.analyser = window.DeynikRadioState.audioContext.createAnalyser();
    source.connect(window.DeynikRadioState.analyser);
    window.DeynikRadioState.analyser.connect(window.DeynikRadioState.audioContext.destination);
    window.DeynikRadioState.analyser.fftSize = 256;
}

export function playStation() {
    const station = radioStations[window.DeynikRadioState.stationId];
    if (!window.DeynikRadioState.audio || window.DeynikRadioState.audio.src !== station.url) {
        initAudioContext(station.url);
    }
    
    // Пытаемся запустить воспроизведение
    window.DeynikRadioState.audio.play().then(() => {
        dispatchStateChange('isPlaying', true);
        startVisualization();
    }).catch(error => {
        console.error("Ошибка воспроизведения:", error);
        // Обработка ошибки автовоспроизведения (например, показать кнопку "Начать")
    });
}

export function pauseStation() {
    if (window.DeynikRadioState.audio) {
        window.DeynikRadioState.audio.pause();
        dispatchStateChange('isPlaying', false);
        stopVisualization();
    }
}

export function togglePlay() {
    if (window.DeynikRadioState.isPlaying) {
        pauseStation();
    } else {
        playStation();
    }
}

export function setVolume(value) {
    const volume = parseInt(value, 10);
    dispatchStateChange('volume', volume);
    localStorage.setItem('radioVolume', volume);
    if (window.DeynikRadioState.audio) {
        window.DeynikRadioState.audio.volume = volume / 100;
    }
}

// Переключение станции
export function selectStation(id) {
    const newStation = radioStations[id];
    if (!newStation) return;
    
    dispatchStateChange('stationId', id);
    dispatchStateChange('stationIndex', stationIds.indexOf(id));

    if (window.DeynikRadioState.isPlaying) {
        // Остановить старую и запустить новую станцию
        pauseStation(); 
        initAudioContext(newStation.url + '?nocache=' + new Date().getTime()); // Добавляем nocache для перезагрузки
        playStation();
    }
    // Вызов события для обновления UI
    document.dispatchEvent(new CustomEvent('stationSelected', { detail: { station: newStation } }));
}

export function nextStation() {
    let nextIndex = (window.DeynikRadioState.stationIndex + 1) % stationIds.length;
    selectStation(stationIds[nextIndex]);
}

// --- VISUALIZATION LOGIC ---

export function startVisualization() {
    const analyser = window.DeynikRadioState.analyser;
    const bars = document.querySelectorAll('#visualization .bar');
    if (!analyser || bars.length === 0) return;

    if (window.DeynikRadioState.visualizationInterval) clearInterval(window.DeynikRadioState.visualizationInterval);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    window.DeynikRadioState.visualizationInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);

        for (let i = 0; i < bars.length; i++) {
            const bar = bars[i];
            const dataIndex = Math.floor(i * (dataArray.length / bars.length));
            // Нормализация значения: 0-255 -> 1-30px
            const height = (dataArray[dataIndex] / 255) * 30 + 1;
            bar.style.height = `${height}px`;
        }
    }, 60); // Частота обновления
}

export function stopVisualization() {
    if (window.DeynikRadioState.visualizationInterval) {
        clearInterval(window.DeynikRadioState.visualizationInterval);
        document.querySelectorAll('#visualization .bar').forEach(bar => bar.style.height = '2px');
    }
}

// --- AUTH LOGIC ---

export function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(error => console.error("Login failed:", error));
}

export function logout() {
    auth.signOut().then(() => {
        dispatchStateChange('currentUser', null);
        dispatchStateChange('userNickname', null);
        localStorage.removeItem('userNickname');
        document.dispatchEvent(new CustomEvent('authChange'));
    });
}

// Слушатель состояния аутентификации
auth.onAuthStateChanged(user => {
    if (user) {
        dispatchStateChange('currentUser', user);
        // Загрузка ника из локального хранилища или displayName
        const nickname = localStorage.getItem('userNickname') || user.displayName;
        dispatchStateChange('userNickname', nickname);
        // Установка статуса онлайн в Firestore
        db.collection('onlineUsers').doc(user.uid).set({
            displayName: nickname,
            isOnline: true,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });
    } else {
        dispatchStateChange('currentUser', null);
        // Удаление статуса онлайн (или установка isOnline: false)
    }
    document.dispatchEvent(new CustomEvent('authChange'));
});

// --- CHAT LOGIC ---

export function sendChatMessage(messageText, replyToId = null) {
    const user = window.DeynikRadioState.currentUser;
    if (!user) {
        alert('Пожалуйста, войдите, чтобы отправить сообщение.');
        return;
    }

    const userName = window.DeynikRadioState.userNickname || user.displayName;

    const message = {
        uid: user.uid,
        user: userName,
        text: messageText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        replyTo: replyToId,
        reactions: {}
    };

    db.collection('chat').add(message)
        .then(() => document.dispatchEvent(new CustomEvent('chatMessageSent')))
        .catch(e => console.error("Error sending message: ", e));
}

// Слушатель чата (Live Update)
db.collection('chat').orderBy('timestamp', 'desc').limit(50).onSnapshot(snapshot => {
    const messages = [];
    snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
    });
    // Обновляем состояние чата и оповещаем компоненты
    window.DeynikRadioState.chatMessages = messages.reverse();
    document.dispatchEvent(new CustomEvent('chatUpdate'));
});

// Экспортируем ключевые элементы и функции для доступа из микро-фронтендов
window.DeynikRadioSync = {
    state: window.DeynikRadioState,
    stations: radioStations,
    selectStation,
    togglePlay,
    nextStation,
    setVolume,
    googleLogin,
    logout,
    sendChatMessage,
    // ... другие экспортируемые функции
};
