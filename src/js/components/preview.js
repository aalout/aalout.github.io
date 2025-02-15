export class Preview {
    constructor() {
        this.init();
    }

    init() {
        this.timeInput = document.querySelector('.time-input');
        this.timeInputContainer = document.querySelector('.time-input-container');
        this.resetButton = document.querySelector('.time-reset-button');

        if (!this.timeInput || !this.resetButton || !this.timeInputContainer) return;

        // Создаем кастомный элемент для отображения текста "Сейчас"
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        // Устанавливаем значение по умолчанию в формате datetime-local
        this.timeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        // Добавляем дата-атрибут для определения начального состояния
        this.timeInput.dataset.isNow = 'true';
        
        this.bindEvents();
    }

    bindEvents() {
        this.timeInputContainer.addEventListener('click', (e) => {
            if (e.target === this.timeInput) return;

            this.timeInput.focus();
            const event = new MouseEvent('mousedown');
            this.timeInput.dispatchEvent(event);
        });

        this.timeInput.addEventListener('change', (e) => {
            if (e.target.value) {
                this.timeInput.classList.add('has-value');
                this.timeInput.dataset.isNow = 'false';
            }
        });

        this.timeInput.addEventListener('keydown', (e) => {
            e.preventDefault();
        });

        this.resetButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            this.timeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
            this.timeInput.dataset.isNow = 'true';
            this.timeInput.classList.remove('has-value');
        });
    }

    getPublishTime() {
        return this.timeInput.dataset.isNow === 'true' ? null : this.timeInput.value;
    }
}
