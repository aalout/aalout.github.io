export class Onboarding {
  constructor() {
    this.currentStep = 1;
    this.container = document.querySelector('[data-onboarding]');
    this.canvas = document.querySelector('[data-onboarding-canvas]');
    this.ctx = this.canvas.getContext('2d');
    
    // Элементы, которые будем подсвечивать
    this.settingsButton = document.querySelector('.main-search-section__settings');
    this.addPostButton = document.querySelector('.main-button');
    this.searchInput = document.querySelector('.search-input-wrapper');
    
    this.init();
  }

  init() {
    if (!localStorage.getItem('onboardingCompleted')) {
      this.start();
    }
  }

  disableScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
  }

  enableScroll() {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  start() {
    this.container.style.display = 'block';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    this.disableScroll(); // Блокируем скролл при старте онбординга
    this.showStep(1);
    this.bindEvents();
  }

  bindEvents() {
    document.querySelectorAll('[data-onboarding-next]').forEach(btn => {
      btn.addEventListener('click', () => this.nextStep());
    });

    document.querySelectorAll('[data-onboarding-back]').forEach(btn => {
      btn.addEventListener('click', () => this.prevStep());
    });

    document.querySelectorAll('[data-onboarding-close]').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    document.querySelector('[data-onboarding-finish]').addEventListener('click', () => this.finish());
  }

  drawArrow(startX, startY, endX, endY, curvature = 50) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'rgba(133, 111, 255, 1)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    
    // Рисуем изогнутую линию
    this.ctx.moveTo(startX, startY);
    
    if (this.currentStep === 2) {
      // Для второго шага рисуем линию с узлом
      const midY = startY + (endY - startY) / 2;
      const controlPoint = 100; // Расстояние для контрольных точек
      
      // Первая часть - движение вниз
      this.ctx.bezierCurveTo(
        startX, startY + controlPoint,
        startX - controlPoint, midY - controlPoint,
        startX - controlPoint, midY
      );
      
      // Вторая часть - петля вверх
      this.ctx.bezierCurveTo(
        startX - controlPoint, midY + controlPoint,
        startX + controlPoint, midY + controlPoint,
        startX + controlPoint, midY
      );
      
      // Третья часть - движение к цели
      this.ctx.bezierCurveTo(
        startX + controlPoint, midY - controlPoint,
        endX, endY + controlPoint,
        endX, endY
      );
    } else {
      // Для остальных шагов рисуем обычную кривую
      this.ctx.bezierCurveTo(
        startX, startY - curvature,
        endX, endY + curvature,
        endX, endY
      );
    }
    
    this.ctx.stroke();
    
    // Рисуем галочку вместо треугольника
    let angle;
    
    if (this.currentStep === 2) {
      // Для второго шага вычисляем угол по последнему сегменту кривой
      angle = Math.atan2(endY - (endY + curvature), endX - endX);
    } else {
      // Для обычной кривой вычисляем угол по последнему сегменту
      const lastSegmentY = endY + curvature;
      const lastSegmentX = endX;
      angle = Math.atan2(endY - lastSegmentY, endX - lastSegmentX);
    }
    
    const arrowLength = 12;
    const checkmarkAngle = Math.PI / 4;
    
    this.ctx.beginPath();
    this.ctx.setLineDash([]);
    
    // Первая линия галочки с скорректированным углом
    const x1 = endX - arrowLength * Math.cos(angle - checkmarkAngle);
    const y1 = endY - arrowLength * Math.sin(angle - checkmarkAngle);
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(endX, endY);
    
    // Вторая линия галочки с скорректированным углом
    const x2 = endX - arrowLength * Math.cos(angle + checkmarkAngle);
    const y2 = endY - arrowLength * Math.sin(angle + checkmarkAngle);
    this.ctx.lineTo(x2, y2);
    
    this.ctx.strokeStyle = 'rgba(133, 111, 255, 1)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  showStep(step) {
    // Скрываем все модалки
    document.querySelectorAll('.onboarding-modal').forEach(modal => {
      modal.style.display = 'none';
    });

    // Убираем предыдущие подсветки
    this.settingsButton?.classList.remove('highlight');
    this.addPostButton?.classList.remove('highlight');
    this.searchInput?.classList.remove('highlight');

    // Очищаем canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Рисуем затемнение
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const modal = document.querySelector(`[data-onboarding-step="${step}"]`);
    modal.style.display = 'block';

    // Подсвечиваем нужный элемент и рисуем стрелку в зависимости от шага
    switch(step) {
      case 1:
        this.settingsButton?.classList.add('highlight');
        this.drawArrowToElement(modal, this.settingsButton);
        break;
      case 2:
        this.addPostButton?.classList.add('highlight');
        this.drawArrowToElement(modal, this.addPostButton);
        break;
      case 3:
        this.searchInput?.classList.add('highlight');
        this.drawArrowToElement(modal, this.searchInput);
        break;
    }
  }

  // Новый метод для рисования стрелки к элементу
  drawArrowToElement(modal, target) {
    if (!target) return;

    const targetRect = target.getBoundingClientRect();
    const modalRect = modal.getBoundingClientRect();

    // Определяем начальную и конечную точки для стрелки
    let startX, startY, endX, endY;

    // Координаты центра целевого элемента
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    // Координаты центра модального окна
    const modalCenterX = modalRect.left + modalRect.width / 3;
    const modalCenterY = modalRect.top + modalRect.height / 2;

    // Определяем, с какой стороны модалки рисовать стрелку
    if (targetCenterY < modalCenterY) {
      // Цель выше модалки
      startX = modalCenterX;
      startY = modalRect.top;
      endX = targetCenterX;
      endY = targetRect.bottom;
    } else {
      // Цель ниже модалки
      startX = modalCenterX;
      startY = modalRect.bottom;
      endX = targetCenterX;
      endY = targetRect.top;
    }

    // Рисуем стрелку
    this.drawArrow(startX, startY, endX, endY);
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
      this.showStep(this.currentStep);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.showStep(this.currentStep);
    }
  }

  close() {
    // Убираем подсветку со всех элементов
    this.settingsButton?.classList.remove('highlight');
    this.addPostButton?.classList.remove('highlight');
    this.searchInput?.classList.remove('highlight');
    
    this.container.style.display = 'none';
    this.enableScroll(); // Разблокируем скролл при закрытии
    localStorage.setItem('onboardingCompleted', 'true');
  }

  finish() {
    this.close();
  }
} 