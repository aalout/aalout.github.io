import { CreateSearch } from './components/createSearch.js';
import { Search } from './components/search.js';
import { NewPost } from './components/newPost.js';
import { Preview } from './components/preview.js';
import { CreateGroup } from './components/createGroup.js';
import { Tabs } from './components/tabs.js';
import { Onboarding } from './components/onboarding.js';

export class Router {
  constructor(routes) {
    this.routes = {
      '/': (appEl) => {
        new Search(window.channels?.map(c => c.title) || [], true);
        new Tabs();
        new Onboarding();
      },
      '/create': (appEl) => {
        new CreateSearch();
      },
      '/new-post': (appEl) => {
        new NewPost();
      },
      '/preview': (appEl) => {
        new Preview();
      },
      '/create-group': (appEl) => {
        new CreateGroup();
      },
      '/edit-group': (appEl) => {
        new EditGroup();
      }
    };
    this.currentPath = '';
    
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });
  }

  init() {
    this.handleRoute(window.location.pathname);
  }

  async handleRoute(pathname) {
    this.currentPath = pathname;
    const app = document.getElementById('app');
    
    // Получаем шаблон для текущего маршрута
    const templateId = `route-${pathname}`;
    const template = document.getElementById(templateId);
    
    if (template) {
      // Клонируем содержимое шаблона
      const content = template.content.cloneNode(true);
      
      // Очищаем и вставляем новое содержимое
      app.innerHTML = '';
      app.appendChild(content);
      
      // Вызываем обработчик маршрута после рендеринга
      const route = this.routes[pathname] || this.routes['/'];
      route(app);
    }
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute(path);
  }
} 