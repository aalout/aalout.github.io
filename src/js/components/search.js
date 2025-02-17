export class Search {
  constructor(items = [], isMainPage = false, initialTags = []) {
    this.items = items;
    this.tags = Array.isArray(initialTags) ? [...initialTags] : [];
    this.isMainPage = isMainPage;
    this.init();
  }
  init() {
    this.input = document.querySelector('[data-search-input]');
    this.dropdown = document.querySelector('[data-search-dropdown]');
    this.tagsContainer = document.querySelector('.search-tags');
    this.arrowIcon = document.querySelector('[data-search-arrow]');
    this.placeholder = document.querySelector('[data-search-placeholder]');
    if (!this.input || !this.dropdown || !this.tagsContainer) return;
    this.bindEvents();
    this.renderDropdown('');
    if (this.input) {
      this.input.placeholder = this.isMainPage ? '' : 'Поиск каналов';
    }
    if (this.tags.length > 0) {
      this.tags.forEach(tag => {
        this.renderTag(tag);
      });
    }
    this.updatePlaceholderVisibility();
  }
  bindEvents() {
    this.input.addEventListener('input', () => {
      this.handleSearch();
      this.handleTagsVisibility();
      this.updatePlaceholderVisibility();
    });
    this.input.addEventListener('focus', () => {
      this.showDropdown();
      this.handleTagsVisibility();
      this.updatePlaceholderVisibility();
    });
    this.input.addEventListener('blur', () => {
      setTimeout(() => {
        this.handleTagsVisibility();
        this.updatePlaceholderVisibility();
      }, 100);
    });
    this.input.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showDropdown();
    });
    document.addEventListener('click', (e) => this.handleClickOutside(e));
  }
  handleSearch() {
    const value = this.input.value;
    this.renderDropdown(value);
  }
  showDropdown() {
    this.dropdown.classList.add('active');
    if (this.arrowIcon) this.arrowIcon.classList.add('active');
    this.renderDropdown(this.input.value);
  }
  hideDropdown() {
    this.dropdown.classList.remove('active');
    if (this.arrowIcon) this.arrowIcon.classList.remove('active');
  }
  handleClickOutside(e) {
    if (!this.dropdown.contains(e.target) && !this.input.contains(e.target)) {
      this.hideDropdown();
    }
  }
  renderTag(text) {
    const tag = document.createElement('div');
    tag.className = 'search-tag';
    tag.innerHTML = `
      <span>${text}</span>
      <button class="search-tag-remove" data-tag="${text}">
        <img src="/icons/closetag.svg" alt="Close" />
      </button>
    `;
    tag.querySelector('.search-tag-remove').addEventListener('click', () => {
      this.removeTag(text);
    });
    this.tagsContainer.appendChild(tag);
  }
  addTag(text) {
    if (this.tags.includes(text)) return;

    this.tags.unshift(text);

    localStorage.setItem('selectedChannels', JSON.stringify(this.tags));

    this.tagsContainer.innerHTML = '';
    this.tags.forEach(tag => {
      this.renderTag(tag);
    });

    this.input.value = '';
    this.renderDropdown('');
    this.updatePlaceholderVisibility();
  }
  removeTag(text) {
    this.tags = this.tags.filter(t => t !== text);

    localStorage.setItem('selectedChannels', JSON.stringify(this.tags));

    this.tagsContainer.innerHTML = '';
    this.tags.forEach(tag => {
      this.renderTag(tag);
    });
    this.renderDropdown(this.input.value);
    this.updatePlaceholderVisibility();
  }
  renderDropdown(filter = '') {
    const filteredItems = this.items.filter(item => {
      let label;
      if (typeof item === 'string') {
        label = item;
      } else if (typeof item === 'object' && item !== null && item.title) {
        label = item.title;
      } else {
        label = String(item);
      }
      return label.toLowerCase().includes(filter.toLowerCase());
    });
    
    if (filteredItems.length === 0) {
      this.dropdown.innerHTML = '<div class="search-item-empty">Ничего не найдено</div>';
      return;
    }
    
    this.dropdown.innerHTML = filteredItems
      .map(item => {
        let label;
        if (typeof item === 'string') {
          label = item;
        } else if (typeof item === 'object' && item !== null && item.title) {
          label = item.title;
        } else {
          label = String(item);
        }
        const isSelected = this.tags.includes(label);
        return `
          <div class="search-item ${isSelected ? 'selected' : ''}" data-value="${label}">
            ${label}
            <img src="/icons/check.svg" class="search-item__check" alt="Selected" />
          </div>
        `;
      })
      .join('');
    
    this.dropdown.querySelectorAll('.search-item').forEach(item => {
      item.addEventListener('click', () => {
        const value = item.dataset.value;
        if (this.tags.includes(value)) {
          this.removeTag(value);
        } else {
          this.addTag(value);
        }
        this.renderDropdown(this.input.value);
      });
    });
  }
  handleTagsVisibility() {
    if (this.input.value) {
      this.tagsContainer.style.display = 'none';
    } else {
      this.tagsContainer.style.display = 'flex';
    }
  }
  updatePlaceholderVisibility() {
    if (!this.placeholder) return;

    const shouldShowPlaceholder = !this.input.value && this.tags.length === 0 && document.activeElement !== this.input;
    
    if (shouldShowPlaceholder) {
      this.placeholder.style.display = 'block';
    } else {
      this.placeholder.style.display = 'none';
    }
  }
}