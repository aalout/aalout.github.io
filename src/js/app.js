import { Router } from './router.js';

window.addEventListener('DOMContentLoaded', () => {
  const globalDataEl = document.getElementById('global-data');

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

  const router = new Router();
  router.init();
});
