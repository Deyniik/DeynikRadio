// Чат и сообщения
class ChatManager {
    constructor() {
        this.chatUnsubscribe = null;
        this.onlineUsers = {};
        this.replyingToMessage = null;
        this.currentMentionIndex = -1;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadOnlineUsers();
    }

    setupEventListeners() {
        const chatInput = document.getElementById('chat-input');
        const chatSendBtn = document.getElementById('chat-send-btn');
        const emojiBtn = document.getElementById('emoji-btn');
        const gifBtn = document.getElementById('gif-btn');

        if (chatInput && chatSendBtn) {
            chatInput.addEventListener('input', () => this.handleChatInput());
            chatInput.addEventListener('keypress', (e) => this.handleChatKeypress(e));
            chatSendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Добавьте остальные обработчики...
    }

    loadChatHistory() {
        if (this.chatUnsubscribe) this.chatUnsubscribe();
        
        this.chatUnsubscribe = db.collection('chat')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot((snapshot) => {
                this.renderChatMessages(snapshot);
            });
    }

    renderChatMessages(snapshot) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        chatMessages.innerHTML = '';
        
        if (snapshot.empty) {
            chatMessages.innerHTML = '<div class="message">Чат пуст. Будьте первым!</div>';
            return;
        }
        
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        
        messages.sort((a, b) => {
            const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return timeA - timeB;
        });
        
        messages.forEach((message) => {
            this.addMessageToChat(message);
        });
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    addMessageToChat(message) {
        // Реализация добавления сообщения в чат
    }

    sendMessage() {
        const user = auth.currentUser;
        const chatInput = document.getElementById('chat-input');
        if (!user || !chatInput) return;

        const messageText = chatInput.value.trim();
        if (messageText === '') return;
        
        const authManager = window.app?.authManager;
        const displayName = authManager ? authManager.getDisplayName() : 'Аноним';
        
        const message = {
            text: messageText,
            userName: displayName,
            userId: user.uid,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            reactions: {}
        };
        
        // Добавляем информацию о ответе, если есть
        if (this.replyingToMessage) {
            message.replyTo = {
                userName: this.replyingToMessage.userName || this.replyingToMessage.user,
                text: this.replyingToMessage.text,
                messageId: this.replyingToMessage.id
            };
        }
        
        this.disableSendButton();
        
        db.collection('chat').add(message)
            .then(() => {
                chatInput.value = '';
                this.cancelReply();
            })
            .finally(() => {
                this.enableSendButton();
            });
    }

    disableSendButton() {
        const chatSendBtn = document.getElementById('chat-send-btn');
        if (chatSendBtn) {
            chatSendBtn.disabled = true;
            chatSendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
    }

    enableSendButton() {
        const chatSendBtn = document.getElementById('chat-send-btn');
        if (chatSendBtn) {
            chatSendBtn.disabled = false;
            chatSendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }

    loadOnlineUsers() {
        db.collection('onlineUsers').onSnapshot(snapshot => {
            this.onlineUsers = {};
            snapshot.forEach(doc => {
                this.onlineUsers[doc.id] = doc.data();
            });
            this.updateMentionsList();
        });
    }

    // Добавьте остальные методы чата...
}
