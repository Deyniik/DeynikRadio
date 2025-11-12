// Аутентификация
class AuthManager {
    constructor() {
        this.userNickname = localStorage.getItem('userNickname') || '';
        this.init();
    }

    init() {
        auth.onAuthStateChanged((user) => this.updateAuthUI(user));
    }

    updateAuthUI(user) {
        const authSection = document.getElementById('auth-section');
        if (!authSection) return;

        if (user) {
            this.renderUserProfile(user, authSection);
        } else {
            this.renderLoginButton(authSection);
        }
    }

    renderUserProfile(user, container) {
        const displayName = this.userNickname || user.displayName || 'Пользователь';
        const firstLetter = displayName.charAt(0).toUpperCase();
        
        container.innerHTML = `
            <div class="user-profile" id="user-profile">
                <div class="user-avatar">${firstLetter}</div>
                <div class="user-name">${displayName}</div>
                <button class="edit-nickname-btn" title="Сменить ник">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <div class="user-dropdown" id="user-dropdown">
                    <div class="dropdown-item" id="edit-nickname-dropdown">
                        <i class="fas fa-user-edit"></i> Сменить ник
                    </div>
                    <div class="dropdown-item" id="sign-out-btn">
                        <i class="fas fa-sign-out-alt"></i> Выйти
                    </div>
                </div>
            </div>
        `;
        
        this.attachUserProfileEvents(user);
    }

    renderLoginButton(container) {
        container.innerHTML = `
            <button class="google-login-btn" id="googleLoginBtn">
                <i class="fab fa-google"></i> Войти через Google
            </button>
        `;
        
        document.getElementById('googleLoginBtn').addEventListener('click', () => this.signInWithGoogle());
    }

    attachUserProfileEvents(user) {
        const userProfile = document.getElementById('user-profile');
        const userDropdown = document.getElementById('user-dropdown');
        const editNicknameDropdown = document.getElementById('edit-nickname-dropdown');
        const signOutBtn = document.getElementById('sign-out-btn');
        
        if (userProfile) {
            userProfile.addEventListener('click', function(e) {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
        }
        
        if (editNicknameDropdown) {
            editNicknameDropdown.addEventListener('click', () => this.openNicknameModal(user));
        }
        
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => this.signOut());
        }
        
        document.querySelector('.edit-nickname-btn')?.addEventListener('click', function(e) {
            e.stopPropagation();
            this.openNicknameModal(user);
        }.bind(this));
    }

    openNicknameModal(user) {
        const nicknameModal = document.getElementById('nicknameModal');
        const nicknameInput = document.getElementById('nickname-input');
        if (nicknameModal && nicknameInput) {
            nicknameInput.value = this.userNickname || user.displayName || '';
            nicknameModal.style.display = 'block';
        }
    }

    signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        auth.signInWithPopup(provider);
    }

    signOut() {
        auth.signOut();
    }

    saveNickname() {
        const nicknameInput = document.getElementById('nickname-input');
        if (!nicknameInput) return;

        const newNickname = nicknameInput.value.trim();
        if (newNickname === '') {
            Utils.showNotification('Введите никнейм', 'error');
            return;
        }
        
        this.userNickname = newNickname;
        localStorage.setItem('userNickname', this.userNickname);
        
        const nicknameModal = document.getElementById('nicknameModal');
        if (nicknameModal) {
            nicknameModal.style.display = 'none';
        }
        
        this.updateAuthUI(auth.currentUser);
        Utils.showNotification('Никнейм сохранен!', 'success');
    }

    getCurrentUser() {
        return auth.currentUser;
    }

    getDisplayName() {
        return this.userNickname || (auth.currentUser ? (auth.currentUser.displayName || 'Пользователь') : 'Аноним');
    }
}
