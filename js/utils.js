// Вспомогательные функции
class Utils {
    static showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = 'notification';
        
        if (type === 'success') {
            notification.style.background = '#1DB954';
        } else if (type === 'error') {
            notification.style.background = '#FF5722';
        } else {
            notification.style.background = '#2196F3';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    static formatMessageText(text) {
        if (!text) return '';
        
        // Регулярное выражение для поиска URL
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        
        // Заменяем URL на ссылки
        return text.replace(urlRegex, function(url) {
            return '<a href="' + url + '" target="_blank">' + url + '</a>';
        });
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static getRandomGif(stationType = 'normal') {
        const normalGifs = [
            'https://i.pinimg.com/originals/7d/04/0e/7d040e94931427709008aaeda14db9c8.gif',
            // ... остальные гифки
        ];
        
        const minecraftGifs = [
            'https://i.pinimg.com/originals/44/f2/f6/44f2f6325aa9bf8c93ed6c3d6e8f8d57.gif',
            // ... остальные minecraft гифки
        ];
        
        const gifs = stationType === 'minecraft' ? minecraftGifs : normalGifs;
        return gifs[Math.floor(Math.random() * gifs.length)];
    }
}
