export class CreateGroup {
    constructor() {
        this.selectedChannels = new Set();
        this.init();
    }

    init() {
        // Получаем данные каналов
        const globalDataEl = document.getElementById("global-data");
        this.channels = [];
        if (globalDataEl && globalDataEl.dataset.channels) {
            try {
                this.channels = JSON.parse(globalDataEl.dataset.channels);
            } catch (error) {
                console.error('Ошибка парсинга данных каналов:', error);
            }
        }

        this.renderChannels();
        this.initGroupNameInput();
        this.updateCreateButton();
    }

    renderChannels() {
        const container = document.querySelector('.create-group__content-channels');
        if (!container) return;

        // Убираем ограничение на 6 карточек
        container.innerHTML = this.channels.map(channel => `
            <div class="channel-card" data-channel-id="${channel.username}">
                <div class="channel-card__header">
                    <img src="${channel.avatar}" class="channel-card__avatar" alt="Channel avatar" />
                    <div class="channel-card__checkbox">
                        <img src="/icons/check.svg" alt="Selected" />
                    </div>
                </div>
                <div class="channel-card__body">
                    <h5 class="channel-card__title">${channel.title}</h5>
                    <p class="channel-card__username">${channel.username}</p>
                </div>
            </div>
        `).join('');

        this.updateCounter();
        this.initChannelCards();
    }

    initChannelCards() {
        const cards = document.querySelectorAll('.channel-card');
        const selectAllButton = document.querySelector('.create-group__content-header-button');
        
        // Обработчик для отдельных карточек
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const channelId = card.dataset.channelId;
                if (this.selectedChannels.has(channelId)) {
                    this.selectedChannels.delete(channelId);
                    card.classList.remove('selected');
                } else {
                    this.selectedChannels.add(channelId);
                    card.classList.add('selected');
                }

                this.updateCounter();
                this.updateCreateButton();
                this.updateSelectAllButtonText();
            });
        });

        // Обработчик для кнопки "Выбрать все"
        if (selectAllButton) {
            selectAllButton.addEventListener('click', () => {
                const isAllSelected = this.selectedChannels.size === cards.length;
                
                cards.forEach(card => {
                    const channelId = card.dataset.channelId;
                    if (isAllSelected) {
                        // Снимаем выделение
                        this.selectedChannels.delete(channelId);
                        card.classList.remove('selected');
                    } else {
                        // Выделяем все
                        this.selectedChannels.add(channelId);
                        card.classList.add('selected');
                    }
                });

                this.updateCounter();
                this.updateCreateButton();
                this.updateSelectAllButtonText();
            });
        }
    }

    updateCounter() {
        const countElement = document.querySelector('.create-group__content-header-title-count');
        if (countElement) {
            countElement.textContent = this.selectedChannels.size;
        }
    }

    updateSelectAllButtonText() {
        const selectAllButton = document.querySelector('.create-group__content-header-button');
        const cards = document.querySelectorAll('.channel-card');
        
        if (selectAllButton) {
            selectAllButton.querySelector('span').textContent = 
                this.selectedChannels.size === cards.length ? 'Сбросить' : 'Выбрать все';
        }
    }

    initGroupNameInput() {
        const input = document.querySelector('.create-group__input');
        if (input) {
            input.addEventListener('input', () => {
                this.updateCreateButton();
            });
        }
    }

    updateCreateButton() {
        const button = document.querySelector('.create-group__button');
        const input = document.querySelector('.create-group__input');
        
        if (button && input) {
            const hasName = input.value.trim().length > 0;
            const hasSelectedChannels = this.selectedChannels.size > 0;
            
            button.disabled = !(hasName && hasSelectedChannels);
        }
    }
}
