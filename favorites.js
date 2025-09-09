let favorites = [];

// Функции для работы с избранным
function initFavorites() {
    // Обработчики кнопок избранного
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const stationId = this.dataset.station;
            toggleFavorite(stationId, this);
        });
    });
}

function loadFavorites() {
    if (!currentUser) return;
    
    const favoritesRef = database.ref('favorites/' + currentUser.uid);
    
    favoritesRef.on('value', (snapshot) => {
        favorites = snapshot.val() || [];
        updateFavoriteButtons();
        updateFavoritesList();
    });
}

function toggleFavorite(stationId, button) {
    if (!currentUser) {
        alert('Для добавления в избранное войдите через Google');
        return;
    }
    
    const favoritesRef = database.ref('favorites/' + currentUser.uid);
    const isFavorite = favorites.includes(stationId);
    
    if (isFavorite) {
        // Удаляем из избранного
        favoritesRef.child(stationId).remove();
    } else {
        // Добавляем в избранное
        favoritesRef.child(stationId).set(true);
    }
}

function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const stationId = btn.dataset.station;
        const isFavorite = favorites.includes(stationId);
        
        if (isFavorite) {
            btn.innerHTML = '<i class="fas fa-star"></i>';
            btn.classList.add('active');
        } else {
            btn.innerHTML = '<i class="far fa-star"></i>';
            btn.classList.remove('active');
        }
    });
}

function updateFavoritesList() {
    if (!favorites || favorites.length === 0) {
        favoritesList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">Нет избранных станций</p>';
        return;
    }
    
    favoritesList.innerHTML = '';
    
    favorites.forEach(stationId => {
        const card = document.getElementById(`${stationId}-card`);
        if (card) {
            const clone = card.cloneNode(true);
            clone.id = `${stationId}-favorite-card`;
            clone.style.marginBottom = '15px';
            
            // Удаляем кнопку избранного в клоне
            const favoriteBtn = clone.querySelector('.favorite-btn');
            if (favoriteBtn) {
                favoriteBtn.style.display = 'none';
            }
            
            // Добавляем кнопку удаления из избранного
            const removeBtn = document.createElement('div');
            removeBtn.className = 'favorite-btn active';
            removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '15px';
            removeBtn.style.right = '15px';
            removeBtn.style.zIndex = '2';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(stationId);
            });
            
            clone.appendChild(removeBtn);
            
            // Обработчик клика для воспроизведения
            const playBtn = clone.querySelector('.play-btn');
            if (playBtn) {
                playBtn.addEventListener('click', () => {
                    const originalCard = document.getElementById(`${stationId}-card`);
                    if (originalCard) {
                        const originalPlayBtn = originalCard.querySelector('.play-btn');
                        if (originalPlayBtn) {
                            originalPlayBtn.click();
                        }
                    }
                });
            }
            
            favoritesList.appendChild(clone);
        }
    });
}
