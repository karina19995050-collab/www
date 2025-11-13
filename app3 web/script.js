// Данные приложения
let currentDate = new Date();
let startDate = null;
let markedDays = {}; // Объект для хранения отмеченных дней
let cigarettePrice = 0;
let cigarettesPerDay = 0;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initTabs();
    initCalendar();
    initStats();
    updateStats();
    
    // Обновление статистики каждую минуту
    setInterval(updateStats, 60000);
});

// Загрузка данных из localStorage
function loadData() {
    const savedStartDate = localStorage.getItem('quitSmokingStartDate');
    const savedMarkedDays = localStorage.getItem('quitSmokingMarkedDays');
    const savedPrice = localStorage.getItem('cigarettePrice');
    const savedPerDay = localStorage.getItem('cigarettesPerDay');
    
    if (savedStartDate) {
        startDate = new Date(savedStartDate);
    }
    
    if (savedMarkedDays) {
        markedDays = JSON.parse(savedMarkedDays);
    }
    
    if (savedPrice) {
        cigarettePrice = parseFloat(savedPrice);
        document.getElementById('cigarette-price').value = cigarettePrice;
    }
    
    if (savedPerDay) {
        cigarettesPerDay = parseFloat(savedPerDay);
        document.getElementById('cigarettes-per-day').value = cigarettesPerDay;
    }
}

// Сохранение данных в localStorage
function saveData() {
    if (startDate) {
        localStorage.setItem('quitSmokingStartDate', startDate.toISOString());
    }
    localStorage.setItem('quitSmokingMarkedDays', JSON.stringify(markedDays));
    localStorage.setItem('cigarettePrice', cigarettePrice.toString());
    localStorage.setItem('cigarettesPerDay', cigarettesPerDay.toString());
}

// Инициализация вкладок
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Убираем активный класс со всех кнопок и контента
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и контенту
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// Инициализация календаря
function initCalendar() {
    updateCalendar();
    
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });
}

// Обновление календаря
function updateCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('current-month-year');
    
    // Устанавливаем заголовок месяца
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                   'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    monthYear.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Очищаем календарь
    calendarGrid.innerHTML = '';
    
    // Добавляем заголовки дней недели
    const dayHeaders = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });
    
    // Получаем первый день месяца и количество дней
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Понедельник = 0
    
    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Добавляем дни текущего месяца
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        cellDate.setHours(0, 0, 0, 0);
        const dateKey = formatDateKey(cellDate);
        
        // Проверяем, является ли день сегодняшним
        if (cellDate.getTime() === today.getTime()) {
            dayElement.classList.add('today');
        }
        
        // Проверяем, отмечен ли день
        if (markedDays[dateKey] !== undefined) {
            if (markedDays[dateKey]) {
                dayElement.classList.add('checked');
            } else {
                dayElement.classList.add('unchecked');
            }
        }
        
        // Обработчик клика
        dayElement.addEventListener('click', () => {
            if (cellDate > today) return; // Нельзя отмечать будущие дни
            
            // Переключаем состояние дня
            if (markedDays[dateKey] === undefined) {
                markedDays[dateKey] = true; // По умолчанию отмечаем как "не курил"
            } else if (markedDays[dateKey] === true) {
                markedDays[dateKey] = false; // Переключаем на "курил"
            } else {
                delete markedDays[dateKey]; // Удаляем отметку
            }
            
            // Если это первый отмеченный день, устанавливаем его как дату начала
            if (startDate === null && markedDays[dateKey] === true) {
                startDate = new Date(cellDate);
            }
            
            saveData();
            updateCalendar();
            updateStats();
        });
        
        calendarGrid.appendChild(dayElement);
    }
}

// Форматирование ключа даты
function formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Инициализация статистики
function initStats() {
    const priceInput = document.getElementById('cigarette-price');
    const perDayInput = document.getElementById('cigarettes-per-day');
    
    priceInput.addEventListener('input', (e) => {
        cigarettePrice = parseFloat(e.target.value) || 0;
        saveData();
        updateStats();
    });
    
    perDayInput.addEventListener('input', (e) => {
        cigarettesPerDay = parseFloat(e.target.value) || 0;
        saveData();
        updateStats();
    });
}

// Обновление статистики
function updateStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Подсчитываем дни без курения
    let daysCount = 0;
    let lastCheckedDate = null;
    
    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        // Подсчитываем последовательные дни без курения с даты начала
        for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
            const dateKey = formatDateKey(d);
            if (markedDays[dateKey] === true) {
                daysCount++;
                lastCheckedDate = new Date(d);
            } else if (markedDays[dateKey] === false) {
                // Если встретили день, когда курили, сбрасываем счетчик
                daysCount = 0;
            }
        }
    } else {
        // Если нет даты начала, ищем последний отмеченный день
        let maxDate = null;
        for (const dateKey in markedDays) {
            if (markedDays[dateKey] === true) {
                const date = new Date(dateKey);
                if (!maxDate || date > maxDate) {
                    maxDate = date;
                }
            }
        }
        
        if (maxDate) {
            startDate = maxDate;
            startDate.setHours(0, 0, 0, 0);
            daysCount = calculateDaysSince(maxDate);
        }
    }
    
    // Обновляем отображение дней
    document.getElementById('days-count').textContent = daysCount;
    
    // Вычисляем часы и минуты
    let hours = 0;
    let minutes = 0;
    
    if (lastCheckedDate || startDate) {
        const start = lastCheckedDate || startDate;
        const now = new Date();
        const diff = now - start;
        const totalMinutes = Math.floor(diff / 60000);
        const totalHours = Math.floor(totalMinutes / 60);
        
        hours = totalHours % 24;
        minutes = totalMinutes % 60;
    }
    
    document.getElementById('hours-count').textContent = hours;
    document.getElementById('minutes-count').textContent = minutes;
    
    // Вычисляем сэкономленные деньги и сигареты
    const cigarettesSaved = daysCount * cigarettesPerDay * 20; // Предполагаем 20 сигарет в пачке
    const moneySaved = daysCount * cigarettesPerDay * cigarettePrice;
    
    document.getElementById('cigarettes-saved').textContent = Math.round(cigarettesSaved);
    document.getElementById('money-saved').textContent = Math.round(moneySaved) + ' ₽';
    
    // Обновляем достижение
    updateAchievement(daysCount);
}

// Подсчет дней с определенной даты
function calculateDaysSince(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    
    let days = 0;
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
        const dateKey = formatDateKey(d);
        if (markedDays[dateKey] === true) {
            days++;
        } else if (markedDays[dateKey] === false) {
            days = 0; // Сбрасываем при встрече дня с курением
        }
    }
    
    return days;
}

// Обновление достижений
function updateAchievement(days) {
    const achievementText = document.getElementById('achievement-text');
    
    if (days === 0) {
        achievementText.textContent = 'Начните свой путь!';
    } else if (days === 1) {
        achievementText.textContent = 'Первый день! Вы молодец! 🎉';
    } else if (days < 7) {
        achievementText.textContent = `${days} дня без курения! Продолжайте! 💪`;
    } else if (days < 30) {
        achievementText.textContent = `${days} дней! Отличный результат! ⭐`;
    } else if (days < 90) {
        achievementText.textContent = `${days} дней! Вы на правильном пути! 🌟`;
    } else if (days < 180) {
        achievementText.textContent = `${days} дней! Невероятно! 🏆`;
    } else if (days < 365) {
        achievementText.textContent = `${days} дней! Вы настоящий чемпион! 👑`;
    } else {
        achievementText.textContent = `${days} дней! Легенда! 🎖️`;
    }
}

