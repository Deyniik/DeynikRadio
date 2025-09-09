let unreadMessages = 0;
let onlineUsersList = {};

// Функции для работы с чатом
function initChat() {
    // Обработчики кнопок чата
    chatBtn.addEventListener('click', toggleChat);
    chatClose.addEventListener('click', toggleChat);
    
    // Обработчик отправки сообщения
    sendMessageBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Загрузка сообщений
    loadMessages();
    
    // Следим за онлайн пользователями
    trackOnlineUsers();
}

function toggleChat() {
    chatContainer.classList.toggle('open');
    
    if (chatContainer.classList.contains('open')) {
        // Чат открыт - сбрасываем счетчик непрочитанных
        unreadMessages = 0;
        chatBtn.classList.remove('unread');
        
        // Прокручиваем вниз
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
}

function loadMessages() {
    database.ref('messages').limitToLast(50).on('value', snapshot => {
        chatMessages.innerHTML = '';
        const messages = snapshot.val();
        
        if (messages) {
            Object.keys(messages).forEach(key => {
                const message = messages[key];
                addMessageToChat(message);
            });
        }
        
        // Прокручиваем вниз
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    });
    
    // Слушаем новые сообщения
    database.ref('messages').limitToLast(1).on('child_added', snapshot => {
        const message = snapshot.val();
        
        // Если чат закрыт, увеличиваем счетчик непрочитанных
        if (!chatContainer.classList.contains('open')) {
            unreadMessages++;
            chatBtn.classList.add('unread');
        }
    });
}

function addMessageToChat(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (currentUser && message.userId === currentUser.uid) {
        messageElement.classList.add('me');
    } else {
        messageElement.classList.add('other');
    }
    
    const time = new Date(message.timestamp);
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
        <div class="message-user">
            ${message.photoURL ? `<img src="${message.photoURL}" alt="${message.name}">` : ''}
            ${message.name}
        </div>
        <div class="message-text">${message.text}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageElement);
}

function sendMessage() {
    if (!currentUser) {
        console.error("Пользователь не авторизован");
        alert("Для отправки сообщений войдите через Google");
        return;
    }

    const text = chatInput.value.trim();
    if (!text) {
        console.error("Пустое сообщение");
        return;
    }

    console.log("Попытка отправить сообщение:", text);

    const message = {
        text: text,
        name: currentUser.displayName || 'Аноним',
        userId: currentUser.uid,
        photoURL: currentUser.photoURL || '',
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    // Добавляем сообщение в базу данных
    const newMessageRef = database.ref('messages').push();
    newMessageRef.set(message)
        .then(() => {
            console.log("Сообщение успешно отправлено");
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        })
        .catch(error => {
            console.error('Ошибка отправки сообщения:', error);
            alert('Ошибка: ' + error.message);
        });
}

// Функции для работы с онлайн пользователями
function trackOnlineUsers() {
    // Ссылка на статус пользователя
    const userStatusRef = database.ref('/status/' + (currentUser ? currentUser.uid : 'anonymous'));
    
    // Ссылка на список онлайн пользователей
    const onlineUsersRef = database.ref('/onlineUsers');
    
    // Слушаем изменения в списке онлайн пользователей
    onlineUsersRef.on('value', (snapshot) => {
        onlineUsersList = snapshot.val() || {};
        updateOnlineUsersUI();
    });
    
    // Обновляем статус пользователя при аутентификации
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Пользователь вошел в систему
            const userStatusRef = database.ref('/status/' + user.uid);
            
            // Устанавливаем статус "онлайн"
            database.ref('.info/connected').on('value', (snapshot) => {
                if (snapshot.val() === false) return;
                
                userStatusRef.onDisconnect().set({
                    status: 'offline',
                    lastChanged: firebase.database.ServerValue.TIMESTAMP
                }).then(() => {
                    userStatusRef.set({
                        status: 'online',
                        lastChanged: firebase.database.ServerValue.TIMESTAMP,
                        name: user.displayName,
                        photoURL: user.photoURL
                    });
                    
                    // Добавляем пользователя в список онлайн
                    onlineUsersRef.child(user.uid).set({
                        name: user.displayName,
                        photoURL: user.photoURL,
                        lastSeen: firebase.database.ServerValue.TIMESTAMP
                    });
                    
                    onlineUsersRef.child(user.uid).onDisconnect().remove();
                });
            });
        }
    });
}

function updateOnlineStatus(isOnline) {
    if (!currentUser) return;
    
    const userStatusRef = database.ref('/status/' + currentUser.uid);
    const onlineUsersRef = database.ref('/onlineUsers/' + currentUser.uid);
    
    if (isOnline) {
        userStatusRef.set({
            status: 'online',
            lastChanged: firebase.database.ServerValue.TIMESTAMP,
            name: currentUser.displayName,
            photoURL: currentUser.photoURL
        });
        
        onlineUsersRef.set({
            name: currentUser.displayName,
            photoURL: currentUser.photoURL,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
        
        onlineUsersRef.onDisconnect().remove();
    } else {
        userStatusRef.set({
            status: 'offline',
            lastChanged: firebase.database.ServerValue.TIMESTAMP
        });
        
        onlineUsersRef.remove();
    }
}

function updateOnlineUsersUI() {
    onlineUsers.innerHTML = '';
    
    Object.keys(onlineUsersList).forEach(uid => {
        const user = onlineUsersList[uid];
        
        const userElement = document.createElement('div');
        userElement.className = 'online-user';
        userElement.innerHTML = `
            <img src="${user.photoURL || 'https://via.placeholder.com/32'}" class="online-user-avatar" alt="${user.name}">
            <span class="online-user-name">${user.name || 'Пользователь'}</span>
        `;
        
        onlineUsers.appendChild(userElement);
    });
}
