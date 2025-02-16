export class Tabs {
  constructor() {
    this.init();
  }

  init() {
    this.tabs = document.querySelectorAll('.main-tab');
    this.contents = document.querySelectorAll('.tab-content');
    
    if (!this.tabs.length || !this.contents.length) return;
    
    this.bindEvents();
  }

  bindEvents() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        this.switchTab(targetTab);
      });
    });
  }

  switchTab(targetTab) {
    // Обновляем активный таб
    this.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === targetTab);
    });

    // Обновляем видимый контент
    this.contents.forEach(content => {в
      content.classList.toggle('active', content.dataset.content === targetTab);
    });
  }
} 