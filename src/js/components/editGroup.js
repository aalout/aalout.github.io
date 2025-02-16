export class EditGroup {
    constructor(groupId) {
        this.groupId = groupId;
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
                this.loadGroupData(); // Загружаем данные группы
            } catch (error) {
                console.error('Ошибка парсинга данных каналов:', error);
            }
        }

        this.renderChannels();
        this.initGroupNameInput();
        this.updateSaveButton();
    }

    async loadGroupData() {
        // Здесь должна быть логика загрузки данных группы по this.groupId
        // Например:
        // const groupData = await fetchGroupData(this.groupId);
        // this.selectedChannels = new Set(groupData.channels);
        // document.querySelector('.edit-group__input').value = groupData.name;
    }

    renderChannels() {
        const container = document.querySelector('.edit-group__content-channels');
        if (!container) return;

        container.innerHTML = this.channels.map(channel => `
            <div class="channel-card ${this.selectedChannels.has(channel.username) ? 'selected' : ''}" 
                 data-channel-id="${channel.username}">
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

    // ... остальные методы аналогичны CreateGroup, но с префиксом edit-group ...

    updateSaveButton() {
        const button = document.querySelector('.edit-group__button');
        const input = document.querySelector('.edit-group__input');
        
        if (button && input) {
            const hasName = input.value.trim().length > 0;
            const hasSelectedChannels = this.selectedChannels.size > 0;
            
            button.disabled = !(hasName && hasSelectedChannels);
        }
    }
}
