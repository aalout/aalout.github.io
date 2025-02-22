export class EditGroup {
  constructor() {
    this.selectedChannels = new Set();
    this.channels = this.getChannels();
    this.init();
  }

  getChannels() {
    const globalData = document.getElementById('global-data');
    if (globalData && globalData.dataset.channels) {
      return JSON.parse(globalData.dataset.channels);
    }
    return [];
  }

  init() {
    this.bindElements();
    this.bindEvents();
  }

  bindElements() {
    this.container = document.querySelector('.edit-group');
    this.selectAllButton = this.container.querySelector('.edit-group__content-header-button');
    this.channelCards = this.container.querySelectorAll('.channel-card');
    this.searchInput = this.container.querySelector('.edit-group__content-search-input');
    this.channelsContainer = this.container.querySelector('.channel-cards-grid-edit');
  }

  bindEvents() {
    this.selectAllButton.addEventListener('click', () => this.handleSelectAll());

    this.channelCards.forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.channel-card__menu')) return;
        this.toggleChannel(card);
      });
    });

    // Добавляем обработчик поиска
    this.searchInput.addEventListener('input', e => this.handleSearch(e.target.value));
  }

  toggleChannel(card) {
    const channelId = card.dataset.channelId;

    if (this.selectedChannels.has(channelId)) {
      this.selectedChannels.delete(channelId);
      card.classList.remove('selected');
    } else {
      this.selectedChannels.add(channelId);
      card.classList.add('selected');
    }

    this.updateSelectAllButton();
  }

  handleSearch(query) {
    const normalizedQuery = query.toLowerCase().trim();

    this.channels.forEach(channel => {
      const card = this.channelsContainer.querySelector(`[data-channel-id="${channel.username}"]`);
      if (!card) return;

      const title = channel.title.toLowerCase();
      const username = channel.username.toLowerCase();

      if (title.includes(normalizedQuery) || username.includes(normalizedQuery)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  handleSelectAll() {
    const visibleCards = Array.from(this.channelCards).filter(
      card => card.style.display !== 'none'
    );
    const isSelectingAll = this.selectedChannels.size !== visibleCards.length;

    visibleCards.forEach(card => {
      const channelId = card.dataset.channelId;

      if (isSelectingAll) {
        this.selectedChannels.add(channelId);
        card.classList.add('selected');
      } else {
        this.selectedChannels.delete(channelId);
        card.classList.remove('selected');
      }
    });

    this.updateSelectAllButton();
  }

  updateSelectAllButton() {
    const visibleCards = Array.from(this.channelCards).filter(
      card => card.style.display !== 'none'
    );
    const buttonText =
      this.selectedChannels.size === visibleCards.length ? 'Снять выделение' : 'Выбрать все';
    this.selectAllButton.querySelector('span').textContent = buttonText;
  }
}
