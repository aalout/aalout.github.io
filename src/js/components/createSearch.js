import { Search } from './search.js';

if (!window.channels || !window.channels.length) {
  window.channels = [
    { title: 'РИА Новости', username: '@rian_ru', avatar: '/images/create/default.png' },
    { title: 'ТАСС', username: '@tass_agency', avatar: '/images/create/default.png' },
    { title: 'Интерфакс', username: '@interfax', avatar: '/images/create/default.png' },
    { title: 'Новый канал', username: '@newchannel', avatar: '/images/create/default.png' },
    { title: 'Новый канал', username: '@newchannel', avatar: '/images/create/default.png' },
    { title: 'Новый канал', username: '@newchannel', avatar: '/images/create/default.png' },
    { title: 'Новый канал', username: '@newchannel', avatar: '/images/create/default.png' },
    { title: 'Новый канал', username: '@newchannel', avatar: '/images/create/default.png' },
  ];
}

if (!window.groups || !window.groups.length) {
  window.groups = [
    { id: 1, title: 'Чат РИА', username: '@ria_chat', avatar: '/images/create/default.png', members: 1234 },
    { id: 2, title: 'Чат ТАСС', username: '@tass_chat', avatar: '/images/create/default.png', members: 567 },
    { id: 3, title: 'Медиа группа', username: '@media_group', avatar: '/images/create/default.png', members: 890 },
    { id: 4, title: 'Новостной агрегатор', username: '@news_agg', avatar: '/images/create/default.png', members: 234 },
    { id: 5, title: 'Бизнес каналы', username: '@business', avatar: '/images/create/default.png', members: 567 },
    { id: 6, title: 'Спортивные каналы', username: '@sport', avatar: '/images/create/default.png', members: 890 },
    { id: 7, title: 'Развлекательные каналы', username: '@entertainment', avatar: '/images/create/default.png', members: 123 },
    { id: 8, title: 'Образовательные каналы', username: '@education', avatar: '/images/create/default.png', members: 456 },
  ];
}

export class CreateSearch {
  constructor() {
    // Получаем данные из глобального элемента
    const globalDataEl = document.getElementById("global-data");
    if (globalDataEl) {
      try {
        if (globalDataEl.dataset.channels) {
          window.channels = JSON.parse(globalDataEl.dataset.channels);
        }
        if (globalDataEl.dataset.groups) {
          window.groups = JSON.parse(globalDataEl.dataset.groups);
        }
      } catch (error) {
        console.error('Ошибка парсинга данных:', error);
      }
    }

    this.channels = window.channels || [];
    this.groups = window.groups || [];
    
    this.multiSelectMode = false;
    this.selectedCards = new Set();
    
    this.init();
    this.initCardMenuHandlers();
    this.initModal();
    this.initConfirmModal();
    this.initChannelCards();
    this.initGroupCards();
    this.initBottomMenu();
  }

  init() {
    this.input = document.querySelector('[data-search-input]');
    this.dropdown = document.querySelector('[data-search-dropdown]');
    this.arrowIcon = document.querySelector('[data-search-arrow]');
    
    if (!this.input || !this.dropdown) return;
    
    new Search(this.channels);
    
    this.bindEvents();
  }

  bindEvents() {
    this.input.addEventListener('focus', () => {
      this.showDropdown();
    });

    document.addEventListener('click', (e) => this.handleClickOutside(e));
  }

  handleSearch() {
    const value = this.input.value;
    this.renderDropdown(value);
    this.showDropdown();
  }

  showDropdown() {
    this.dropdown.classList.add('active');
    if (this.arrowIcon) {
      this.arrowIcon.style.display = 'flex';
      this.arrowIcon.classList.add('active');
    }
  }

  hideDropdown() {
    this.dropdown.classList.remove('active');
    if (this.arrowIcon) {
      this.arrowIcon.style.display = 'none';
      this.arrowIcon.classList.remove('active');
    }
  }

  handleClickOutside(e) {
    if (!this.dropdown.contains(e.target) && 
        !this.input.contains(e.target) && 
        (!document.querySelector('[data-search-button]') || !document.querySelector('[data-search-button]').contains(e.target))) {
      this.hideDropdown();
    }
  }

  renderDropdown(filter = '') {
    const filteredItems = this.channels.filter(item =>
      item.title.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredItems.length === 0) {
      this.dropdown.innerHTML = '<div class="search-item-empty">Ничего не найдено</div>';
      return;
    }

    this.dropdown.innerHTML = filteredItems
      .map(item => `<div class="search-item">${item.title}</div>`)
      .join('');
  }

  initModal() {
    const modalTrigger = document.querySelector('[data-modal-trigger]');
    const modal = document.querySelector('[data-modal]');
    const closeButtons = document.querySelectorAll('[data-modal-close]');

    if (!modalTrigger || !modal) return;

    modal.style.display = 'none';
    modal.classList.remove('active');

    modalTrigger.addEventListener('click', () => {
      modal.style.display = 'flex';
      modal.classList.add('active');
    });

    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 30); 
    };

    closeButtons.forEach(button => {
      button.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    const input = document.querySelector('[data-channel-input]');
    const addButton = modal.querySelector('.modal__button--add');
    
    if (input && addButton) {
      addButton.disabled = true;
      
      input.addEventListener('input', (e) => {
        addButton.disabled = !e.target.value.trim();
      });
    }
  }

  initConfirmModal() {
    const confirmModal = document.getElementById('confirm-delete-modal');
    if (confirmModal) {
      confirmModal.style.display = 'none';
      confirmModal.classList.remove('active');
    }
  }

  initChannelCards() {
    this.renderChannelCards();
    this.initDropdowns();
    this.initShowMore();
    this.initDeleteButtons();
    this.checkShowMoreVisibility();
  }

  renderChannelCards() {
    const container = document.querySelector('[data-channels-content]');
    if (!container) return;

    let grid = container.querySelector('.channel-cards-grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.classList.add('channel-cards-grid');
      container.prepend(grid);
    } else {
      grid.innerHTML = ''; 
    }

    if (!window.channels || !window.channels.length) {
      const emptyBlock = container.querySelector('.create-card__empty');
      if (emptyBlock) {
        emptyBlock.style.display = 'block';
      }
      return;
    }

    window.channels.forEach(channel => {
      const card = document.createElement('div');
      card.classList.add('channel-card');
      card.innerHTML = `
        <div class="channel-card__header">
          <img src="${channel.avatar}" class="channel-card__avatar" alt="Channel avatar" />
          <button class="channel-card__menu" data-dropdown-trigger>
            <img src="/icons/dots.svg" alt="Menu" />
          </button>
        </div>
        <div class="channel-card__body">
          <h5 class="channel-card__title">${channel.title}</h5>
          <p class="channel-card__username">${channel.username}</p>
        </div>
      `;
      grid.appendChild(card);
    });

    const counter = document.querySelector('.create-card__counter');
    if (counter) {
      counter.textContent = window.channels.length;
    }
  }

  initDropdowns() {
    const triggers = document.querySelectorAll('[data-dropdown-trigger]');
    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activeCard = trigger.closest('.channel-card');
        this.openBottomMenu();
      });
    });
  }

  initShowMore() {
    const showMoreBtn = document.querySelector('[data-show-more]');
    const cardsGrid = document.querySelector('.channel-cards-grid');
    const channelsContent = document.querySelector('[data-channels-content]');
    if (!channelsContent) return;
    const channelsCard = channelsContent.closest('.create-card');
    const groupsContent = document.querySelector('[data-groups-content]');
    const groupsCard = groupsContent ? groupsContent.closest('.create-card') : null;
    
    if (!showMoreBtn || !cardsGrid || !channelsCard) return;
    
    const channelCards = cardsGrid.querySelectorAll('.channel-card');
    if (channelCards.length <= 2) {
      showMoreBtn.style.display = 'none';
      return;
    }
    showMoreBtn.style.display = 'flex';
    
    showMoreBtn.addEventListener('click', () => {
      const isExpanded = channelsCard.classList.contains('expanded');
      channelsCard.classList.toggle('expanded');
      
      if (groupsCard) {
        groupsCard.style.display = isExpanded ? 'block' : 'none';
      }
      
      const span = showMoreBtn.querySelector('span');
      span.textContent = isExpanded ? 'Показать' : 'Скрыть';
      showMoreBtn.classList.toggle('active');
    });
  }

  checkShowMoreVisibility() {
    const cards = document.querySelectorAll('.channel-card');
    const showMoreBtn = document.querySelector('[data-show-more]');
    
    if (showMoreBtn) {
      if (cards.length > 2) {
        showMoreBtn.style.display = 'flex';
      } else {
        showMoreBtn.style.display = 'none';
      }
    }
  }

  initDeleteButtons() {
    document.querySelectorAll('.channel-card__dropdown-item--delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.channel-card');
        if (card) {
          card.remove();
          this.updateChannelCounter();
          this.checkShowMoreVisibility();
        }
      });
    });
  }

  updateChannelCounter() {
    const counter = document.querySelector('.create-card__counter');
    const channels = document.querySelectorAll('.channel-card').length;
    
    if (counter) {
      counter.textContent = channels;
    }

    const content = document.querySelector('[data-channels-content]');
    const emptyState = document.querySelector('.create-card__empty');
    
    if (content && emptyState) {
      if (channels === 0) {
        content.style.display = 'none';
        emptyState.style.display = 'block';
      } else {
        content.style.display = 'block';
        emptyState.style.display = 'none';
      }
    }
    this.checkShowMoreVisibility();
  }

  initGroupCards() {
    this.renderGroupCards();
    this.initGroupDropdowns();
    this.initGroupShowMore();
    this.initGroupDeleteButtons();
    this.checkGroupShowMoreVisibility();
  }

  renderGroupCards() {
    const container = document.querySelector('[data-groups-content]');
    if (!container) return;

    let grid = container.querySelector('.group-cards-grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.classList.add('group-cards-grid');
      container.querySelector('.create-card__content-wrapper')?.prepend(grid);
    }

    if (!this.groups || !this.groups.length) {
      const emptyBlock = container.querySelector('.create-card__empty');
      if (emptyBlock) {
        emptyBlock.style.display = 'block';
      }
      return;
    }

    grid.innerHTML = '';

    this.groups.forEach(group => {
      const card = document.createElement('div');
      card.classList.add('group-card');
      card.innerHTML = `
        <div class="group-card__header">
          <img src="${group.avatar}" class="group-card__avatar" alt="Group avatar" />
          <button class="group-card__menu" data-group-dropdown-trigger>
            <img src="/icons/dotswhite.svg" alt="Menu" />
          </button>
        </div>
        <div class="group-card__body">
          <h5 class="group-card__title">${group.title}</h5>
          <div class="group-card__members-wrapper">
            <p class="group-card__members">Каналов</p>
            <span class="group-card__members-count">${group.members}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    const counter = container.closest('.create-card').querySelector('.create-card__counter');
    if (counter) {
      counter.textContent = this.groups.length;
    }
  }

  initGroupDropdowns() {
    const groupTriggers = document.querySelectorAll('[data-group-dropdown-trigger]');
    groupTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activeCard = trigger.closest('.group-card');
        this.openBottomMenu();
      });
    });
  }

  initGroupShowMore() {
    const showMoreBtn = document.querySelector('[data-group-show-more]');
    if (!showMoreBtn) return;

    const groupsContent = document.querySelector('[data-groups-content]');
    const groupsCard = groupsContent ? groupsContent.closest('.create-card') : null;
    const channelsContent = document.querySelector('[data-channels-content]');
    const channelsWrapper = channelsContent ? channelsContent.closest('.create-card-wrapper') : null;

    if (!groupsCard || !channelsWrapper) return;

    const groupCards = groupsCard.querySelectorAll('.group-card');

    if (groupCards.length <= 2) {
      showMoreBtn.style.display = 'none';
      return;
    }

    showMoreBtn.style.display = 'flex';

    showMoreBtn.addEventListener('click', () => {
      const isExpanded = groupsCard.classList.contains('expanded');
      groupsCard.classList.toggle('expanded');

      channelsWrapper.style.display = isExpanded ? 'block' : 'none';

      const span = showMoreBtn.querySelector('span');
      span.textContent = isExpanded ? 'Показать' : 'Скрыть';
      showMoreBtn.classList.toggle('active');
    });
  }

  initGroupDeleteButtons() {
    document.querySelectorAll('.group-card__dropdown-item--delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.group-card');
        if (card) {
          card.remove();
          this.updateGroupCounter();
          this.checkGroupShowMoreVisibility();
        }
      });
    });
  }

  updateGroupCounter() {
    const groupsContainer = document.querySelector('[data-groups-content]');
    if (!groupsContainer) return;

    const groupsCard = groupsContainer.closest('.create-card');
    if (!groupsCard) return;

    const counter = groupsCard.querySelector('.create-card__counter');
    const emptyState = groupsContainer.querySelector('.create-card__empty');

    const groupsCount = groupsContainer.querySelectorAll('.group-card').length;

    if (counter) {
      counter.textContent = groupsCount;
    }

    if (groupsCount === 0) {
      groupsCard.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      groupsCard.style.display = 'block';
      if (emptyState) emptyState.style.display = 'none';
    }
    this.checkGroupShowMoreVisibility();
  }

  checkGroupShowMoreVisibility() {
    const cards = document.querySelectorAll('.group-card');
    const showMoreBtn = document.querySelector('[data-group-show-more]');
    if (showMoreBtn) {
      if (cards.length > 2) {
        showMoreBtn.style.display = 'flex';
      } else {
        showMoreBtn.style.display = 'none';
      }
    }
  }

  // --- Методы для нижнего выплывающего меню ---

  initBottomMenu() {
    this.bottomMenu = document.getElementById('bottom-menu');
    if (!this.bottomMenu) return;
    
    // Закрытие по клику на overlay и кнопке закрытия
    this.bottomMenu.querySelectorAll('[data-bottom-menu-close]').forEach(el => {
      el.addEventListener('click', () => this.closeBottomMenu());
    });
    
    const deleteBtn = this.bottomMenu.querySelector('[data-bottom-menu-delete]');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (this.activeCard) {
          if (this.activeCard.classList.contains('channel-card')) {
            this.activeCard.remove();
            this.updateChannelCounter();
          } else if (this.activeCard.classList.contains('group-card')) {
            this.activeCard.remove();
            this.updateGroupCounter();
          }
          this.activeCard = null;
          this.closeBottomMenu();
        }
      });
    }
    
    // Новый обработчик для кнопки "Выбрать несколько"
    const chooseMultipleBtn = this.bottomMenu.querySelector('[data-bottom-menu-choose-multiple]');
    if (chooseMultipleBtn) {
      chooseMultipleBtn.addEventListener('click', () => {
        if (this.activeCard) {
          if (this.activeCard.classList.contains('group-card')) {
            this.enableGroupMultiSelectMode();
          } else if (this.activeCard.classList.contains('channel-card')) {
            this.enableChannelMultiSelectMode();
          }
        }
        this.closeBottomMenu();
      });
    }
    
    // Закрытие при клике вне контейнера меню
    this.bottomMenu.addEventListener('click', (e) => {
      if (!e.target.closest('.bottom-menu__container')) {
        this.closeBottomMenu();
      }
    });

    // Добавляем обработчик для кнопки "Добавить в группу"
    const addToGroupBtn = this.bottomMenu.querySelector('[data-bottom-menu-add-group]');
    if (addToGroupBtn) {
      addToGroupBtn.addEventListener('click', () => {
        this.openAddToGroupModal();
        this.closeBottomMenu();
      });
    }
  }
  
  openBottomMenu() {
    if (this.bottomMenu) {
      // Если активная карточка — группа, меняем текст и иконку первого пункта
      const addGroupButton = this.bottomMenu.querySelector('[data-bottom-menu-add-group]');
      if (this.activeCard && this.activeCard.classList.contains('group-card')) {
        if (addGroupButton) {
          const span = addGroupButton.querySelector('span');
          if (span) {
            span.textContent = 'Редактировать';
          }
          const iconImg = addGroupButton.querySelector('img');
          if (iconImg) {
            // Здесь можно указать путь к требуемой иконке (например, edit.svg)
            iconImg.src = '/icons/edit.svg';
            iconImg.alt = 'Редактировать';
          }
        }
      } else {
        // Если это не группа – оставляем стандартное название и иконку
        if (addGroupButton) {
          const span = addGroupButton.querySelector('span');
          if (span) {
            span.textContent = 'Добавить в группу';
          }
          const iconImg = addGroupButton.querySelector('img');
          if (iconImg) {
            iconImg.src = '/icons/iconplus.svg';
            iconImg.alt = 'Добавить';
          }
        }
      }
      this.bottomMenu.classList.add('active');
    }
  }
  
  closeBottomMenu() {
    if (this.bottomMenu) {
      this.bottomMenu.classList.remove('active');
    }
  }

  openAddToGroupModal() {
    const modal = document.getElementById('add-to-group-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.classList.add('active');

    const searchInput = modal.querySelector('[data-group-search]');
    const dropdown = modal.querySelector('[data-group-dropdown]');
    const arrow = modal.querySelector('.modal__search-arrow');
    const addButton = modal.querySelector('.modal__button--add');
    let selectedGroup = null;

    // Отображаем выбранные каналы
    const channelsList = modal.querySelector('.modal__channels-list');
    if (channelsList) {
      channelsList.innerHTML = Array.from(this.selectedCards)
        .map(card => {
          const title = card.querySelector('.channel-card__title').textContent;
          return `<div class="modal__channel"><span>• ${title}</span></div>`;
        })
        .join('');
    }

    // Функция для отрисовки списка групп
    const renderGroups = () => {
      dropdown.innerHTML = this.groups
        .map(group => `
          <div class="modal__search-item" data-group-id="${group.id}">
            <img src="${group.avatar}" alt="${group.title}" class="modal__group-avatar">
            <div class="modal__group-details">
              <div class="modal__group-title">${group.title}</div>
              <div class="modal__group-count">${group.members} каналов</div>
            </div>
          </div>
        `)
        .join('');
    };

    // Обработчик клика по инпуту
    const handleInputClick = (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
      arrow.classList.toggle('active');
      if (!dropdown.children.length) {
        renderGroups();
      }
    };

    // Обработчик выбора группы
    const handleDropdownClick = (e) => {
      const item = e.target.closest('.modal__search-item');
      if (item) {
        const groupId = parseInt(item.dataset.groupId);
        const group = this.groups.find(g => g.id === groupId);
        
        if (group) {
          selectedGroup = group;
          searchInput.value = group.title;
          dropdown.classList.remove('active');
          arrow.classList.remove('active');
          addButton.disabled = false;

          // Подсвечиваем выбранный элемент
          dropdown.querySelectorAll('.modal__search-item').forEach(el => {
            el.classList.toggle('selected', parseInt(el.dataset.groupId) === groupId);
          });
        }
      }
    };

    // Закрытие дропдауна при клике вне
    const handleClickOutside = (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
        arrow.classList.remove('active');
      }
    };

    // Удаляем старые обработчики перед добавлением новых
    searchInput.removeEventListener('click', handleInputClick);
    dropdown.removeEventListener('click', handleDropdownClick);
    document.removeEventListener('click', handleClickOutside);

    // Добавляем обработчики
    searchInput.addEventListener('click', handleInputClick);
    dropdown.addEventListener('click', handleDropdownClick);
    document.addEventListener('click', handleClickOutside);

    // Обработчики закрытия модального окна
    const closeButtons = modal.querySelectorAll('[data-modal-close-add-to-group]');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.style.display = 'none';
          // Очищаем состояние при закрытии
          searchInput.value = '';
          dropdown.innerHTML = '';
          addButton.disabled = true;
          selectedGroup = null;
        }, 300);
      });
    });

    // Обработчик добавления в группу
    addButton.addEventListener('click', () => {
      if (selectedGroup) {
        console.log('Добавление в группу:', selectedGroup);
        modal.classList.remove('active');
        setTimeout(() => {
          modal.style.display = 'none';
          // Очищаем состояние при закрытии
          searchInput.value = '';
          dropdown.innerHTML = '';
          addButton.disabled = true;
          selectedGroup = null;
        }, 300);
      }
    });
  }

  // ***************** Методы для режима множественного выделения каналов *****************

  enableChannelMultiSelectMode() {
    this.multiSelectMode = true;
    this.selectedCards.clear();

    // Показываем шапку для каналов
    const multiSelectHeader = document.querySelector('.multi-select-header');
    if (multiSelectHeader) {
      multiSelectHeader.style.display = 'flex';
      const selectAllBtn = multiSelectHeader.querySelector('.select-all-btn');
      selectAllBtn.addEventListener('click', () => {
        const cards = document.querySelectorAll('.channel-card');
        if (this.selectedCards.size === cards.length && cards.length > 0) {
          cards.forEach(card => {
            const checkbox = card.querySelector('.card-select-checkbox');
            if (checkbox) {
              checkbox.checked = false;
            }
            card.classList.remove('selected');
          });
          this.selectedCards.clear();
        } else {
          cards.forEach(card => {
            const checkbox = card.querySelector('.card-select-checkbox');
            if (checkbox) {
              checkbox.checked = true;
            }
            card.classList.add('selected');
            this.selectedCards.add(card);
          });
        }
        this.updateChannelMultiSelectHeader();
        this.updateChannelMultiSelectActions();
      });
    }

    // Показываем панель действий для каналов
    const multiSelectActions = document.querySelector('.multi-select-actions');
    if (multiSelectActions) {
      multiSelectActions.style.display = 'flex';
      multiSelectActions.querySelector('.action-cancel')
        .addEventListener('click', () => {
          this.disableChannelMultiSelectMode();
        });
      multiSelectActions.querySelector('.action-add-group')
        .addEventListener('click', () => {
          console.log('Добавить в группу (каналы):', this.selectedCards);
        });
      multiSelectActions.querySelector('.action-delete')
        .addEventListener('click', () => {
          this.confirmDeletion(() => {
            this.selectedCards.forEach(card => {
              card.remove();
            });
            this.selectedCards.clear();
            this.updateChannelMultiSelectHeader();
            this.updateChannelMultiSelectActions();
            this.updateChannelCounter();
            this.disableChannelMultiSelectMode();
          });
        });
    }

    // Меняем высоту блока с карточками каналов
    const channelsContent = document.querySelector('[data-channels-content]');
    if (channelsContent) {
      channelsContent.classList.add('multi-select');
    }

    // Для каждой карточки канала показываем чекбокс и вешаем обработчики
    const cards = document.querySelectorAll('.channel-card');
    cards.forEach(card => {
      const checkbox = card.querySelector('.card-select-checkbox');
      if (checkbox) {
        // Убираем скрывающий класс и добавляем класс отображения
        checkbox.classList.remove('checkbox-hidden');
        checkbox.classList.add('visible');
        checkbox.checked = card.classList.contains('selected');
        checkbox.addEventListener('click', (e) => {
          e.stopPropagation();
          card.classList.toggle('selected');
          if (card.classList.contains('selected')) {
            this.selectedCards.add(card);
          } else {
            this.selectedCards.delete(card);
          }
          this.updateChannelMultiSelectHeader();
          this.updateChannelMultiSelectActions();
        });
      }
      card.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'input') return;
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        card.classList.toggle('selected');
        if (card.classList.contains('selected')) {
          this.selectedCards.add(card);
        } else {
          this.selectedCards.delete(card);
        }
        this.updateChannelMultiSelectHeader();
        this.updateChannelMultiSelectActions();
      });
    });
  }

  disableChannelMultiSelectMode() {
    this.multiSelectMode = false;
    this.selectedCards.clear();

    const multiSelectHeader = document.querySelector('.multi-select-header');
    if (multiSelectHeader) {
        multiSelectHeader.style.display = 'none';
    }
    const multiSelectActions = document.querySelector('.multi-select-actions');
    if (multiSelectActions) {
        multiSelectActions.style.display = 'none';
    }
    const channelsContent = document.querySelector('[data-channels-content]');
    if (channelsContent) {
        channelsContent.classList.remove('multi-select');
    }
    
    // Очищаем состояние чекбоксов и выделения без пересоздания карточек
    const cards = document.querySelectorAll('.channel-card');
    cards.forEach(card => {
        const checkbox = card.querySelector('.card-select-checkbox');
        if (checkbox) {
            checkbox.checked = false;
            checkbox.classList.remove('visible');
            checkbox.classList.add('checkbox-hidden');
        }
        card.classList.remove('selected');
    });

    // Переинициализируем карточки
    this.renderChannelCards();
    this.initDropdowns();
  }

  initCardMenuHandlers() {
    // Инициализация для каналов
    const channelCards = document.querySelectorAll('.channel-card');
    channelCards.forEach(card => {
      const menuButton = card.querySelector('[data-dropdown-trigger]');
      if (menuButton) {
        menuButton.addEventListener('click', (e) => {
          e.stopPropagation();
          this.activeCard = card;
          this.showBottomMenu(false);
        });
      }
    });

    // Инициализация для групп
    const groupCards = document.querySelectorAll('.group-card');
    groupCards.forEach(card => {
      const menuButton = card.querySelector('[data-group-dropdown-trigger]');
      if (menuButton) {
        menuButton.addEventListener('click', (e) => {
          e.stopPropagation();
          this.activeCard = card;
          this.showBottomMenu(true);
        });
      }
    });
  }

  updateChannelMultiSelectHeader() {
    const header = document.querySelector('.multi-select-header');
    if (header) {
      const countElem = header.querySelector('.selected-count');
      countElem.textContent = this.selectedCards.size;
      const selectAllBtn = header.querySelector('.select-all-btn');
      const cards = document.querySelectorAll('.channel-card');
      selectAllBtn.textContent = (this.selectedCards.size === cards.length && cards.length > 0)
        ? 'Сбросить'
        : 'Выбрать все';
    }
  }

  updateChannelMultiSelectActions() {
    const actions = document.querySelector('.multi-select-actions');
    if (actions) {
      const addGroupBtn = actions.querySelector('.action-add-group');
      const deleteBtn = actions.querySelector('.action-delete');
      if (this.selectedCards.size > 0) {
        addGroupBtn.disabled = false;
        deleteBtn.disabled = false;
      } else {
        addGroupBtn.disabled = true;
        deleteBtn.disabled = true;
      }
    }
  }

  // ***************** Методы для режима множественного выделения групп *****************

  enableGroupMultiSelectMode() {
    this.multiSelectMode = true;
    this.selectedCards.clear();

    const multiSelectHeader = document.querySelector('.multi-select-header-group');
    if (multiSelectHeader) {
      multiSelectHeader.style.display = 'flex';
      const selectAllBtn = multiSelectHeader.querySelector('.select-all-btn-group');
      selectAllBtn.addEventListener('click', () => {
        const cards = document.querySelectorAll('.group-card');
        if (this.selectedCards.size === cards.length && cards.length > 0) {
          cards.forEach(card => {
            const checkbox = card.querySelector('.group-select-checkbox');
            if (checkbox) {
              checkbox.checked = false;
            }
            card.classList.remove('selected');
          });
          this.selectedCards.clear();
        } else {
          cards.forEach(card => {
            const checkbox = card.querySelector('.group-select-checkbox');
            if (checkbox) {
              checkbox.checked = true;
            }
            card.classList.add('selected');
            this.selectedCards.add(card);
          });
        }
        this.updateGroupMultiSelectHeader();
        this.updateGroupMultiSelectActions();
      });
    }

    const multiSelectActions = document.querySelector('.multi-select-actions-group');
    if (multiSelectActions) {
      multiSelectActions.style.display = 'flex';
      multiSelectActions.querySelector('.action-cancel-group')
        .addEventListener('click', () => {
          this.disableGroupMultiSelectMode();
        });
      multiSelectActions.querySelector('.action-delete-group')
        .addEventListener('click', () => {
          this.confirmDeletion(() => {
            this.selectedCards.forEach(card => card.remove());
            this.selectedCards.clear();
            this.updateGroupMultiSelectHeader();
            this.updateGroupMultiSelectActions();
            this.updateGroupCounter();
            this.disableGroupMultiSelectMode();
          });
        });
    }

    const groupsContent = document.querySelector('[data-groups-content]');
    if (groupsContent) {
      groupsContent.classList.add('multi-select');
    }

    const cards = document.querySelectorAll('.group-card');
    cards.forEach(card => {
      const checkbox = card.querySelector('.group-select-checkbox');
      if (checkbox) {
        // Показываем чекбокс, убирая класс скрытия
        checkbox.classList.remove('checkbox-hidden');
        checkbox.classList.add('visible');
        checkbox.checked = card.classList.contains('selected');
        checkbox.addEventListener('click', (e) => {
          e.stopPropagation();
          card.classList.toggle('selected');
          if (card.classList.contains('selected')) {
            this.selectedCards.add(card);
          } else {
            this.selectedCards.delete(card);
          }
          this.updateGroupMultiSelectHeader();
          this.updateGroupMultiSelectActions();
        });
      }
      card.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'input') return;
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        card.classList.toggle('selected');
        if (card.classList.contains('selected')) {
          this.selectedCards.add(card);
        } else {
          this.selectedCards.delete(card);
        }
        this.updateGroupMultiSelectHeader();
        this.updateGroupMultiSelectActions();
      });
    });
  }

  disableGroupMultiSelectMode() {
    this.multiSelectMode = false;
    this.selectedCards.clear();

    const header = document.querySelector('.multi-select-header-group');
    if (header) {
        header.style.display = 'none';
    }
    const actions = document.querySelector('.multi-select-actions-group');
    if (actions) {
        actions.style.display = 'none';
    }
    const groupsContent = document.querySelector('[data-groups-content]');
    if (groupsContent) {
        groupsContent.classList.remove('multi-select');
    }
    
    // Удаляем все обработчики событий с карточек групп
    const cards = document.querySelectorAll('.group-card');
    cards.forEach(card => {
        const checkbox = card.querySelector('.group-select-checkbox');
        if (checkbox) {
            checkbox.checked = false;
            checkbox.classList.remove('visible');
            checkbox.classList.add('checkbox-hidden');
            
            // Удаляем все обработчики событий
            const newCheckbox = checkbox.cloneNode(true);
            checkbox.parentNode.replaceChild(newCheckbox, checkbox);
        }
        card.classList.remove('selected');
        
        // Удаляем обработчик клика с карточки
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
    });

    // Переинициализируем обработчики меню
    this.initCardMenuHandlers();
  }

  updateGroupMultiSelectHeader() {
    const header = document.querySelector('.multi-select-header-group');
    if (header) {
      const countElem = header.querySelector('.selected-count');
      countElem.textContent = this.selectedCards.size;
      const selectAllBtn = header.querySelector('.select-all-btn-group');
      const cards = document.querySelectorAll('.group-card');
      selectAllBtn.textContent = (this.selectedCards.size === cards.length && cards.length > 0)
        ? 'Сбросить'
        : 'Выбрать все';
    }
  }

  updateGroupMultiSelectActions() {
    const actions = document.querySelector('.multi-select-actions-group');
    if (actions) {
      const deleteBtn = actions.querySelector('.action-delete-group');
      if (this.selectedCards.size > 0) {
        deleteBtn.disabled = false;
      } else {
        deleteBtn.disabled = true;
      }
    }
  }

  updateCardsVisibility() {
    const channelsContent = document.querySelector('[data-channels-content]');
    const groupsContent = document.querySelector('[data-groups-content]');
    if (!channelsContent || !groupsContent) return;
    
    const channelsCard = channelsContent.closest('.create-card');
    const groupsCard = groupsContent.closest('.create-card');
    
    if (channelsCard.classList.contains('expanded') && !groupsCard.classList.contains('expanded')) {
      channelsCard.style.display = 'block';
      groupsCard.style.display = 'none';
    }
    else if (groupsCard.classList.contains('expanded') && !channelsCard.classList.contains('expanded')) {
      groupsCard.style.display = 'block';
      channelsCard.style.display = 'none';
    }
    else {
      channelsCard.style.display = 'block';
      groupsCard.style.display = 'block';
    }
  }

  confirmDeletion(callback) {
    const modal = document.getElementById('confirm-delete-modal');
    if (!modal) {
      // Если модальное окно не найдено, выполняем callback сразу
      callback();
      return;
    }
    // Для отображения модального окна устанавливаем display в 'flex'
    modal.style.display = 'flex';
    modal.classList.add('active');

    // Назначаем обработчики для кнопок отмены
    const cancelBtns = modal.querySelectorAll('[data-modal-close-confirm]');
    cancelBtns.forEach(btn => {
      btn.onclick = () => {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.style.display = 'none';
        }, 30);
      };
    });

    // Обработчик для подтверждения удаления
    const confirmBtn = modal.querySelector('#confirm-delete-button');
    confirmBtn.onclick = () => {
      callback();
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 30);
    };
  }
} 