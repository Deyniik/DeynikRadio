function showInstallInstructions(message) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let title = 'Как установить приложение';
    let steps = [];
    let imageUrl = '';
    
    if (isIOS) {
        title = 'Установка на iPhone/iPad';
        steps = [
            '1. Нажмите кнопку "Поделиться" (квадрат со стрелкой вверх)',
            '2. Прокрутите меню вниз',
            '3. Нажмите "На экран «Домой»"',
            '4. Подтвердите добавление'
        ];
        imageUrl = 'https://cdn-icons-png.flaticon.com/512/0/747.png'; // Иконка iOS
    } else if (isAndroid) {
        title = 'Установка на Android';
        steps = [
            '1. Откройте меню браузера (три точки)',
            '2. Выберите "Добавить на главный экран"',
            '3. Подтвердите установку',
            '4. Нажмите "Добавить"'
        ];
        imageUrl = 'https://cdn-icons-png.flaticon.com/512/0/637.png'; // Иконка Android
    } else {
        title = 'Установка на компьютер';
        steps = [
            '1. Откройте меню браузера (три точки или три линии)',
            '2. Найдите "Установить приложение"',
            '3. Следуйте инструкциям браузера'
        ];
        imageUrl = 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png'; // Иконка ПК
    }
    
    const modal = document.createElement('div');
    modal.className = 'install-modal';
    modal.innerHTML = `
        <div class="install-modal-content">
            <div class="install-modal-header">
                <h3><i class="fas fa-mobile-alt"></i> ${title}</h3>
                <span class="install-close">&times;</span>
            </div>
            
            <div class="install-modal-body">
                <div class="install-steps">
                    ${steps.map((step, index) => `
                        <div class="install-step">
                            <div class="step-number">${index + 1}</div>
                            <div class="step-text">${step}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="install-tips">
                    <div class="tip">
                        <i class="fas fa-lightbulb" style="color: #FFD700;"></i>
                        <span>После установки приложение появится на домашнем экране</span>
                    </div>
                    <div class="tip">
                        <i class="fas fa-volume-up" style="color: #1DB954;"></i>
                        <span>Работает в фоне - слушайте музыку, пока пользуетесь другими приложениями</span>
                    </div>
                </div>
            </div>
            
            <div class="install-modal-footer">
                <button class="install-btn install-btn-close">
                    <i class="fas fa-times"></i> Закрыть
                </button>
                <button class="install-btn install-btn-copy">
                    <i class="fas fa-copy"></i> Копировать инструкцию
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем стили
    if (!document.querySelector('#installModalStyles')) {
        const style = document.createElement('style');
        style.id = 'installModalStyles';
        style.textContent = `
            .install-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: modalFadeIn 0.3s ease;
                backdrop-filter: blur(10px);
            }
            
            @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .install-modal-content {
                background: linear-gradient(135deg, #191414 0%, #121212 100%);
                border-radius: 20px;
                width: 90%;
                max-width: 500px;
                border: 2px solid #1DB954;
                box-shadow: 0 20px 60px rgba(29, 185, 84, 0.3);
                overflow: hidden;
                animation: modalSlideUp 0.4s ease;
            }
            
            @keyframes modalSlideUp {
                from { transform: translateY(100px) scale(0.9); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
            }
            
            .install-modal-header {
                background: rgba(29, 185, 84, 0.2);
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .install-modal-header h3 {
                color: #1DB954;
                margin: 0;
                font-size: 1.3rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .install-close {
                color: #B3B3B3;
                font-size: 28px;
                cursor: pointer;
                transition: all 0.3s;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .install-close:hover {
                color: #1DB954;
                background: rgba(29, 185, 84, 0.1);
            }
            
            .install-modal-body {
                padding: 25px;
            }
            
            .install-steps {
                margin-bottom: 25px;
            }
            
            .install-step {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 15px;
                padding: 12px;
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
                border-left: 3px solid #1DB954;
                transition: all 0.3s;
            }
            
            .install-step:hover {
                background: rgba(29, 185, 84, 0.1);
                transform: translateX(5px);
            }
            
            .step-number {
                background: #1DB954;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 0.9rem;
                flex-shrink: 0;
            }
            
            .step-text {
                color: white;
                font-size: 0.95rem;
                line-height: 1.4;
            }
            
            .install-tips {
                background: rgba(29, 185, 84, 0.1);
                border-radius: 10px;
                padding: 15px;
                border: 1px solid rgba(29, 185, 84, 0.3);
            }
            
            .tip {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                margin-bottom: 10px;
                color: #B3B3B3;
                font-size: 0.85rem;
            }
            
            .tip:last-child {
                margin-bottom: 0;
            }
            
            .install-modal-footer {
                padding: 20px;
                background: rgba(0,0,0,0.3);
                display: flex;
                gap: 10px;
                justify-content: center;
            }
            
            .install-btn {
                padding: 12px 25px;
                border-radius: 25px;
                border: none;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.9rem;
            }
            
            .install-btn-close {
                background: rgba(255,255,255,0.1);
                color: white;
                border: 1px solid rgba(255,255,255,0.2);
            }
            
            .install-btn-close:hover {
                background: rgba(255,255,255,0.2);
                transform: scale(1.05);
            }
            
            .install-btn-copy {
                background: linear-gradient(135deg, #1DB954 0%, #1aa34a 100%);
                color: white;
                box-shadow: 0 5px 15px rgba(29, 185, 84, 0.3);
            }
            
            .install-btn-copy:hover {
                background: linear-gradient(135deg, #1ed760 0%, #1DB954 100%);
                transform: scale(1.05);
                box-shadow: 0 8px 20px rgba(29, 185, 84, 0.4);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Обработчики событий
    modal.querySelector('.install-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.install-btn-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.install-btn-copy').addEventListener('click', () => {
        const fullInstruction = `${title}\n\n${steps.join('\n')}\n\n${message}`;
        navigator.clipboard.writeText(fullInstruction)
            .then(() => {
                showNotification('Инструкция скопирована!', 'success');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 1000);
            })
            .catch(() => {
                showNotification('Не удалось скопировать', 'error');
            });
    });
    
    // Закрытие по клику вне окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Автозакрытие через 30 секунд
    setTimeout(() => {
        if (modal.parentNode) {
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (modal.parentNode) {
                    document.body.removeChild(modal);
                }
            }, 500);
        }
    }, 30000);
}
