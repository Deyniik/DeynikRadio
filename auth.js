let currentUser = null;

// Функции для работы с Google Auth
function initAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("Пользователь авторизован:", user.uid);
            currentUser = user;
            updateAuthButton(user);
            chatInput.disabled = false;
            sendMessageBtn.disabled = false;
            
            // Обновляем статус онлайн
            updateOnlineStatus(true);
            
            // Загружаем избранное для пользователя
            loadFavorites();
        } else {
            console.log("Пользователь не авторизован");
            currentUser = null;
            updateAuthButton(null);
            chatInput.disabled = true;
            sendMessageBtn.disabled = true;
            
            // Обновляем статус онлайн
            updateOnlineStatus(false);
        }
    }, error => {
        console.error("Ошибка аутентификации:", error);
    });
}

function updateAuthButton(user) {
    if (user) {
        // Пользователь авторизован
        googleAuthBtn.innerHTML = `
            ${user.photoURL ? `<img src="${user.photoURL}" class="user-avatar" alt="Аватар">` : ''}
            ${user.displayName || 'Пользователь'}
        `;
    } else {
        // Пользователь не авторизован
        googleAuthBtn.innerHTML = '<i class="fab fa-google"></i> Войти';
    }
}

function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    auth.signInWithPopup(provider)
        .then(result => {
            // Вход успешен
            console.log('Успешный вход:', result.user);
        })
        .catch(error => {
            console.error('Ошибка входа:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                alert('Окно входа было закрыто. Пожалуйста, попробуйте снова.');
            } else {
                alert('Произошла ошибка при входе: ' + error.message);
            }
        });
}

function signOut() {
    auth.signOut()
        .then(() => {
            console.log('Пользователь вышел из системы');
        })
        .catch(error => {
            console.error('Ошибка выхода:', error);
        });
}

// Обработчик кнопки Google Auth
googleAuthBtn.addEventListener('click', () => {
    if (currentUser) {
        signOut();
    } else {
        signInWithGoogle();
    }
});
