import { Search } from './search.js';

export class NewPost {
  constructor() {
    this.attachments = new Set();
    this.photoPosition = 'left'; // Просто для отображения активной кнопки
    this.hasChanges = false; // Добавляем флаг для отслеживания изменений
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this); // Привязываем контекст
    this.init();
    this.initExitConfirmation();
  }

  init() {
    const channels = window.channels?.map(c => c.title) || [];
    const savedTags = JSON.parse(localStorage.getItem('selectedChannels') || '[]');
    this.search = new Search(channels, false, savedTags);
    const searchTags = document.querySelector('.search-tags');
    if (searchTags && savedTags.length > 0) {
      savedTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'search-tag';
        tagElement.innerHTML = `
          ${tag}
          <button class="search-tag-remove" data-tag="${tag}">×</button>
        `;
        tagElement.querySelector('.search-tag-remove').addEventListener('click', () => {
          this.search.removeTag(tag);
        });
        searchTags.appendChild(tagElement);
      });
    }

    this.initEditor();
    this.initFileUpload();
    this.initPhotoPosition();
    this.initButtons();

    // Добавляем отслеживание изменений в редакторе
    if (this.editor) {
      this.editor.addEventListener('input', () => {
        this.hasChanges = true;
      });
    }

    // Отслеживаем изменения в поиске каналов
    const searchInput = document.querySelector('[data-search-input]');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.hasChanges = true;
      });
    }
  }

  /**
   * Функция для вычисления координат каретки в textarea.
   * Основана на принципах библиотеки textarea-caret-position.
   */
  getCaretCoordinates(element, position) {
    const div = document.createElement('div');
    const style = window.getComputedStyle(element);
    const properties = [
      'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',
      'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign',
      'textTransform', 'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing'
    ];
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    properties.forEach(prop => {
      div.style[prop] = style[prop];
    });

    // Настраиваем поведение для многострочного ввода
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    // Если это input, перевод строки не используется
    if (element.nodeName === 'INPUT') {
      div.style.whiteSpace = 'pre';
    }

    // Заменяем переносы строк на <br/> чтобы добиться корректного расчёта высоты
    const textBeforeCaret = element.value.substring(0, position).replace(/\n/g, '<br/>');
    div.innerHTML = textBeforeCaret || '<br/>';
    
    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);

    // Учитываем прокрутку исходного элемента (если она есть)
    div.scrollTop = element.scrollTop;

    document.body.appendChild(div);
    const spanRect = span.getBoundingClientRect();
    const coordinates = {
      left: spanRect.left + window.scrollX,
      top: spanRect.top + window.scrollY
    };
    document.body.removeChild(div);
    return coordinates;
  }

  initEditor() {
    this.editor = document.querySelector('[data-editor]');
    this.editorContainer = document.querySelector('[data-editor-container]');
    this.toolbar = document.querySelector('[data-toolbar]');
    this.counter = document.querySelector('[data-counter]');
    
    if (!this.editor || !this.toolbar || !this.counter || !this.editorContainer) return;

    // Обработка счетчика символов
    this.editor.addEventListener('input', () => {
      this.counter.textContent = this.editor.value.length;
    });

    // При выделении текста
    this.editor.addEventListener('mouseup', () => {
      const selectedText = this.editor.value.substring(
        this.editor.selectionStart, 
        this.editor.selectionEnd
      );

      if (!selectedText) {
        this.toolbar.classList.remove('active');
        return;
      }

      const tempElement = document.createElement('span');
      
      const textBeforeSelection = this.editor.value.substring(0, this.editor.selectionStart);
      
      const mirror = document.createElement('div');
      const styles = window.getComputedStyle(this.editor);
      
      mirror.style.position = 'absolute';
      mirror.style.top = '0';
      mirror.style.left = '0';
      mirror.style.visibility = 'hidden';
      mirror.style.whiteSpace = 'pre-wrap';
      mirror.style.padding = styles.padding;
      mirror.style.width = styles.width;
      mirror.style.font = styles.font;
      mirror.style.lineHeight = styles.lineHeight;
      mirror.textContent = textBeforeSelection;
      mirror.appendChild(tempElement);
      
      this.editorContainer.appendChild(mirror);
      
      const editorRect = this.editor.getBoundingClientRect();
      const markerRect = tempElement.getBoundingClientRect();
      const relativeLeft = markerRect.left - editorRect.left + parseInt(styles.paddingLeft, 10);
      const relativeTop = markerRect.top - editorRect.top + parseInt(styles.paddingTop, 10) + parseFloat(styles.lineHeight);

      // Задаём минимальное значение left равное 106px
      const minLeft = 106;
      const adjustedLeft = Math.max(relativeLeft, minLeft);

      this.toolbar.style.position = 'absolute';
      this.toolbar.style.left = `${adjustedLeft}px`;
      this.toolbar.style.top = `${relativeTop}px`;
      this.toolbar.style.transform = 'translateX(-50%)';
      this.toolbar.classList.add('active');

      console.log('Установленные стили тулбара:', {
        left: this.toolbar.style.left,
        top: this.toolbar.style.top,
        transform: this.toolbar.style.transform,
        position: this.toolbar.style.position
      });
    });

    document.addEventListener('mousedown', (e) => {
      if (!this.editorContainer.contains(e.target) && !this.toolbar.contains(e.target)) {
        this.toolbar.classList.remove('active');
      }
    });

    this.editor.addEventListener('scroll', () => {
      if (this.toolbar.classList.contains('active')) {
        const selectedText = this.editor.value.substring(
          this.editor.selectionStart, 
          this.editor.selectionEnd
        );
        
        if (selectedText) {
          const textBeforeSelection = this.editor.value.substring(0, this.editor.selectionStart);
          const mirror = document.createElement('div');
          const tempElement = document.createElement('span');
          const styles = window.getComputedStyle(this.editor);
          
          mirror.style.position = 'absolute';
          mirror.style.top = '0';
          mirror.style.left = '0';
          mirror.style.visibility = 'hidden';
          mirror.style.whiteSpace = 'pre-wrap';
          mirror.style.padding = styles.padding;
          mirror.style.width = styles.width;
          mirror.style.font = styles.font;
          mirror.style.lineHeight = styles.lineHeight;
          
          mirror.textContent = textBeforeSelection;
          mirror.appendChild(tempElement);
          
          this.editorContainer.appendChild(mirror);
          
          const editorRect = this.editor.getBoundingClientRect();
          const markerRect = tempElement.getBoundingClientRect();
          
          const relativeLeft = markerRect.left - editorRect.left + 
                              parseInt(styles.paddingLeft, 10);
          const relativeTop = markerRect.top - editorRect.top + 
                             parseInt(styles.paddingTop, 10) + 
                             parseFloat(styles.lineHeight);
          
          this.editorContainer.removeChild(mirror);
          
          this.toolbar.style.left = `${relativeLeft}px`;
          this.toolbar.style.top = `${relativeTop}px`;
        }
      }
    });

    this.toolbar.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const format = button.dataset.format;
        const selection = window.getSelection();
        const selectedText = selection.toString();

        if (!selectedText) return;

        let formattedText = '';
        switch (format) {
          case 'clear':
            formattedText = selectedText.replace(/[\*_~\[\]\(\)]/g, '');
            break;
          case 'underline':
            formattedText = `__${selectedText}__`;
            break;
          case 'strike':
            formattedText = `~~${selectedText}~~`;
            break;
          case 'italic':
            formattedText = `_${selectedText}_`;
            break;
          case 'bold':
            formattedText = `**${selectedText}**`;
            break;
          case 'link':
            this.showLinkModal(selectedText);
            return;
        }

        if (formattedText) {
          const start = this.editor.selectionStart;
          const end = this.editor.selectionEnd;
          this.editor.value = this.editor.value.substring(0, start) + 
                             formattedText + 
                             this.editor.value.substring(end);
          this.toolbar.classList.remove('active');
        }
      });
    });
  }

  initFileUpload() {
    const uploadButton = document.querySelector('.new-post-upload');
    const fileInput = document.querySelector('[data-file-input]');
    const photoPosition = document.querySelector('[data-photo-position]');
    const attachmentsContainer = document.querySelector('[data-attachments-container]');
    
    if (!uploadButton || !fileInput || !photoPosition || !attachmentsContainer) return;

    // Убедимся, что у нас есть контейнер для photo-tags
    let photoTags = attachmentsContainer.querySelector('.photo-tags');
    if (!photoTags) {
        // Удаляем старый контейнер с неправильными классами, если он есть
        const oldTags = attachmentsContainer.querySelector('.search-tags.attachments-tags');
        if (oldTags) {
            oldTags.remove();
        }
        
        // Создаем новый контейнер с правильным классом
        photoTags = document.createElement('div');
        photoTags.className = 'photo-tags';
        attachmentsContainer.appendChild(photoTags);
    }

    uploadButton.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        this.hasChanges = true; // Отмечаем изменения при загрузке файлов
        // Показываем меню выбора позиции
        photoPosition.style.display = 'block';
        
        // Добавляем файлы
        files.forEach(file => {
          // Проверяем, не добавлен ли уже этот файл
          const isFileAlreadyAdded = Array.from(this.attachments).some(
            attachment => attachment.file.name === file.name
          );

          if (!isFileAlreadyAdded) {
            const attachment = {
              file,
              position: this.photoPosition
            };
            this.attachments.add(attachment);
            this.renderPhotoTag(file.name);
          }
        });
      }
      // Очищаем input
      fileInput.value = '';
    });
  }

  initPhotoPosition() {
    const container = document.querySelector('[data-photo-position]');
    const buttons = container.querySelectorAll('.photo-position-button');
    const closeButton = container.querySelector('.photo-position-close');
    
    if (!container || !buttons || !closeButton) return;

    // Устанавливаем активную кнопку при инициализации
    buttons.forEach(button => {
      if (button.dataset.position === this.photoPosition) {
        button.classList.add('active');
      }
    });

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        this.photoPosition = button.dataset.position;
      });
    });

    closeButton.addEventListener('click', () => {
      container.style.display = 'none';
    });
  }

  renderPhotoTag(fileName) {
    const container = document.querySelector('[data-attachments-container]');
    const photoTags = container?.querySelector('.photo-tags');
    if (!photoTags) return;

    const tag = document.createElement('div');
    tag.className = 'photo-tag';
    tag.innerHTML = `
        <span class="photo-tag-text">Фото "${fileName}"</span>
        <button class="photo-tag-remove">×</button>
    `;

    photoTags.appendChild(tag);

    tag.querySelector('.photo-tag-remove').addEventListener('click', () => {
        tag.remove();
        // Находим и удаляем attachment по имени файла
        const attachmentToRemove = Array.from(this.attachments)
            .find(attachment => attachment.file.name === fileName);
        if (attachmentToRemove) {
            this.attachments.delete(attachmentToRemove);
        }
    });
  }

  initButtons() {
    this.linkButton = document.querySelector('[data-button-trigger]');
    this.hiddenButton = document.querySelector('[data-hidden-trigger]');
    this.attachmentsList = document.querySelector('[data-attachments-list]');
    
    this.buttonAttachment = null;
    this.hiddenAttachment = null;
    
    if (this.linkButton) {
      this.linkButton.addEventListener('click', () => {
        this.showModal('button');
      });
    }

    if (this.hiddenButton) {
      this.hiddenButton.addEventListener('click', () => {
        this.showModal('hidden');
        // Инициализируем счетчики для текстовых полей
        const textareas = document.querySelectorAll('[data-modal="hidden"] .modal-textarea');
        const counters = document.querySelectorAll('[data-modal="hidden"] [data-hidden-counter]');
        
        textareas.forEach((textarea, index) => {
          // Устанавливаем начальное значение счетчика
          counters[index].textContent = textarea.value.length;
          
          // Добавляем обработчик события input
          textarea.addEventListener('input', () => {
            counters[index].textContent = textarea.value.length;
          });
        });
      });
    }
  }

  showModal(type, editData = null) {
    const modal = document.querySelector(`[data-modal="${type}"]`);
    if (!modal) return;

    // Заполняем поля если это редактирование
    if (editData) {
      if (type === 'button') {
        modal.querySelector('[data-button-text]').value = editData.text;
        modal.querySelector('[data-button-link]').value = editData.link;
      } else {
        modal.querySelector('.modal-input').value = editData.text;
        modal.querySelectorAll('.modal-textarea')[0].value = editData.nonSubscriberText;
        modal.querySelectorAll('.modal-textarea')[1].value = editData.subscriberText;
      }
    }

    modal.style.display = 'flex';

    const closeModal = () => {
      modal.style.display = 'none';
      // Очищаем поля
      modal.querySelectorAll('input, textarea').forEach(el => el.value = '');
      // Удаляем обработчик клика при закрытии
      document.removeEventListener('mousedown', handleClickOutside);
    };

    // Обработчик клика вне модального окна
    const handleClickOutside = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };

    // Добавляем обработчик клика
    document.addEventListener('mousedown', handleClickOutside);

    // Обработчики закрытия - обновленные селекторы
    modal.querySelector('.modal__close').addEventListener('click', closeModal);
    modal.querySelector('.modal-button--cancel').addEventListener('click', closeModal);

    // Обработчик добавления
    modal.querySelector('.modal-button--add').addEventListener('click', () => {
      if (type === 'button') {
        const text = modal.querySelector('[data-button-text]').value;
        const link = modal.querySelector('[data-button-link]').value;
        if (!text || !link) return;
        
        this.renderAttachment({
          type: 'button',
          text,
          link
        }, editData ? true : false);
      } else {
        const buttonText = modal.querySelector('.modal-input').value;
        const nonSubscriberText = modal.querySelectorAll('.modal-textarea')[0].value;
        const subscriberText = modal.querySelectorAll('.modal-textarea')[1].value;
        if (!buttonText || !nonSubscriberText || !subscriberText) return;

        this.renderAttachment({
          type: 'hidden',
          text: buttonText,
          nonSubscriberText,
          subscriberText
        }, editData ? true : false);
      }
      this.hasChanges = true; // Отмечаем изменения при добавлении через модальное окно
      closeModal();
    });

    // Обновляем счетчики при редактировании
    if (editData && type === 'hidden') {
      const textareas = modal.querySelectorAll('.modal-textarea');
      const counters = modal.querySelectorAll('[data-hidden-counter]');
      
      textareas.forEach((textarea, index) => {
        counters[index].textContent = textarea.value.length;
      });
    }
  }

  renderAttachment(data, isEdit = false) {
    const itemHTML = `
      <div class='new-post-attachments-container__item' data-attachment="${data.type}">
        <div class='new-post-attachments-container__item-grip'>
          <a class='new-post-attachments-container__item-grip-icon'><img src='/icons/grip.svg' alt='grip' /></a>
          <div class='new-post-attachments-container__item-grip-text'>
            <span class='new-post-attachments-container__item-grip-span'>${data.text}</span>
            ${data.type === 'button' ? `<img src='/icons/externalpurp.svg' alt='external' />` : ''}
          </div>
        </div>
        <div class='new-post-attachments-container__item-controls'>
          <a class='new-post-attachments-container__item-controls-icon' data-action="edit"><img src='/icons/edit.svg' alt='edit' /></a>
          <a class='new-post-attachments-container__item-controls-icon' data-action="delete"><img src='/icons/garbage.svg' alt='delete' /></a>
        </div>
      </div>
    `;

    if (!isEdit) {
      // Если это новый элемент
      if (data.type === 'button') {
        if (this.buttonAttachment) return;
        this.buttonAttachment = data;
        this.linkButton.disabled = true;
      } else {
        if (this.hiddenAttachment) return;
        this.hiddenAttachment = data;
        this.hiddenButton.disabled = true;
      }
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = itemHTML;
    const newItem = tempDiv.firstElementChild;

    if (isEdit) {
      // Заменяем существующий элемент
      const existingItem = this.attachmentsList.querySelector(`[data-attachment="${data.type}"]`);
      if (existingItem) {
        this.attachmentsList.replaceChild(newItem, existingItem);
      }
    } else {
      this.attachmentsList.appendChild(newItem);
    }

    // Добавляем обработчики
    newItem.querySelector('[data-action="edit"]').addEventListener('click', () => {
      this.showModal(data.type, data);
    });

    newItem.querySelector('[data-action="delete"]').addEventListener('click', () => {
      newItem.remove();
      if (data.type === 'button') {
        this.buttonAttachment = null;
        this.linkButton.disabled = false;
      } else {
        this.hiddenAttachment = null;
        this.hiddenButton.disabled = false;
      }
    });

    this.hasChanges = true; // Отмечаем изменения при добавлении вложений
  }

  showLinkModal(selectedText) {
    const modal = document.querySelector('[data-modal="link"]');
    if (!modal) return;

    modal.style.display = 'flex';

    const closeModal = () => {
      modal.style.display = 'none';
      modal.querySelector('[data-link-input]').value = '';
      document.removeEventListener('mousedown', handleClickOutside);
    };

    const handleClickOutside = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Обновленные селекторы для закрытия
    modal.querySelector('.modal__close').addEventListener('click', closeModal);
    modal.querySelector('.modal-button--cancel').addEventListener('click', closeModal);

    modal.querySelector('.modal-button--add').addEventListener('click', () => {
      const url = modal.querySelector('[data-link-input]').value;
      if (!url) return;

      const formattedText = `[${selectedText}](${url})`;
      const start = this.editor.selectionStart;
      const end = this.editor.selectionEnd;
      
      this.editor.value = this.editor.value.substring(0, start) + 
                         formattedText + 
                         this.editor.value.substring(end);
      
      this.toolbar.classList.remove('active');
      closeModal();
    });
  }

  initExitConfirmation() {
    // Добавляем обработчик beforeunload
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    // Обработка клика по кнопке назад в браузере
    window.addEventListener('popstate', (e) => {
      if (!this.hasChanges) return;
      
      e.preventDefault();
      history.pushState(null, '', window.location.pathname);
      this.showExitConfirmation();
    });

    history.pushState(null, '', window.location.pathname);

    // Обработка клика по всем ссылкам
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href === '/preview') return;

      if (this.hasChanges) {
        e.preventDefault();
        this.showExitConfirmation();
      }
    });
  }

  showExitConfirmation() {
    const modal = document.querySelector('[data-modal="exit"]');
    if (!modal) return;

    // Показываем модальное окно
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    
    // Принудительный reflow
    modal.offsetHeight;
    
    // Анимация появления
    modal.style.opacity = '1';
    modal.classList.add('active');

    const closeModal = () => {
      modal.style.opacity = '0';
      modal.classList.remove('active');
      
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    };

    // Очищаем предыдущие обработчики
    const cancelButton = modal.querySelector('.modal-button--cancel');
    const exitButton = modal.querySelector('.modal-button--exit');
    const closeButton = modal.querySelector('.modal__close');
    
    const newCancelButton = cancelButton.cloneNode(true);
    const newExitButton = exitButton.cloneNode(true);
    const newCloseButton = closeButton.cloneNode(true);
    
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
    exitButton.parentNode.replaceChild(newExitButton, exitButton);
    closeButton.parentNode.replaceChild(newCloseButton, closeButton);

    // Добавляем новые обработчики
    newCancelButton.addEventListener('click', closeModal);
    newCloseButton.addEventListener('click', closeModal);
    
    newExitButton.addEventListener('click', () => {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
      window.location.href = '/';
    });

    // Обработчик клика вне модального окна
    const handleClickOutside = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };

    modal.addEventListener('click', handleClickOutside);
  }

  // Добавляем метод handleBeforeUnload
  handleBeforeUnload(e) {
    if (!this.hasChanges) return;
    
    const targetPath = window.location.pathname;
    if (targetPath === '/preview') return;
    
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
}
