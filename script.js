document.addEventListener('DOMContentLoaded', function() {
    // Calendar state
    let currentDate = new Date();
    let currentView = 'month';
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
    
    // DOM elements
    const calendarTitle = document.getElementById('calendar-title');
    const calendarSubtitle = document.getElementById('calendar-subtitle');
    const calendarDays = document.getElementById('calendar-days');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const todayBtn = document.getElementById('today-btn');
    const addEventBtn = document.getElementById('add-event-btn');
    const viewButtons = document.querySelectorAll('[data-view]');
    
    // Event modal elements
    const eventModalElement = document.getElementById('eventModal');
    const eventDetailsModalElement = document.getElementById('eventDetailsModal');

    const eventModal = new bootstrap.Modal(eventModalElement);
    const eventDetailsModal = new bootstrap.Modal(eventDetailsModalElement);
    const eventForm = document.getElementById('event-form');
    const eventTitleInput = document.getElementById('event-title');
    const eventDateInput = document.getElementById('event-date');
    const eventStartTimeInput = document.getElementById('event-start-time');
    const eventEndTimeInput = document.getElementById('event-end-time');
    const eventColorInput = document.getElementById('event-color');
    const eventDescriptionInput = document.getElementById('event-description');
    const eventIdInput = document.getElementById('event-id');
    const saveEventBtn = document.getElementById('save-event-btn');
    const deleteEventBtn = document.getElementById('delete-event-btn');
    const editEventBtn = document.getElementById('edit-event-btn');
    
    // Hungarian month names
    const hungarianMonths = [
        'január', 'február', 'március', 'április', 'május', 'június',
        'július', 'augusztus', 'szeptember', 'október', 'november', 'december'
    ];
    
    // Hungarian day names
    const hungarianDays = [
        'vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'
    ];
    
    const hungarianDaysShort = [
        'vas', 'hét', 'ked', 'sze', 'csü', 'pén', 'szo'
    ];
    
    // Initialize calendar
    renderCalendar();
    
    // Event listeners
    prevMonthBtn.addEventListener('click', () => {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else if (currentView === 'week') {
            currentDate.setDate(currentDate.getDate() - 7);
        } else if (currentView === 'day') {
            currentDate.setDate(currentDate.getDate() - 1);
        }
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (currentView === 'week') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else if (currentView === 'day') {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        renderCalendar();
    });
    
    todayBtn.addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
    });
    
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentView = button.getAttribute('data-view');
            renderCalendar();
        });
    });
    
    addEventBtn.addEventListener('click', () => {
        clearEventForm();
        document.getElementById('eventModalLabel').textContent = 'Esemény hozzáadása';
        deleteEventBtn.classList.add('d-none');
        
        // Set default date to current selected date
        const dateStr = formatDateForInput(currentDate);
        eventDateInput.value = dateStr;
        
        eventModal.show();
    });
    
    saveEventBtn.addEventListener('click', saveEvent);
    deleteEventBtn.addEventListener('click', deleteEvent);
    
    // Calendar rendering functions
    function renderCalendar() {
        updateCalendarTitle();
        
        if (currentView === 'month') {
            renderMonthView();
        } else if (currentView === 'week') {
            renderWeekView();
        } else if (currentView === 'day') {
            renderDayView();
        }
    }
    
    function updateCalendarTitle() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Format: "2023. január" (Hungarian date format)
        calendarTitle.textContent = `${year}. ${hungarianMonths[month]}`;
        
        if (currentView === 'week') {
            const weekStart = new Date(currentDate);
            const day = currentDate.getDay();
            weekStart.setDate(currentDate.getDate() - day);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            // Format: "január 1 - 7, 2023" in Hungarian style
            const startMonth = hungarianMonths[weekStart.getMonth()];
            const endMonth = hungarianMonths[weekEnd.getMonth()];
            const startDay = weekStart.getDate();
            const endDay = weekEnd.getDate();
            const year = weekStart.getFullYear();
            
            if (startMonth === endMonth) {
                calendarSubtitle.textContent = `${startMonth} ${startDay} - ${endDay}, ${year}`;
            } else {
                calendarSubtitle.textContent = `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
            }
        } else if (currentView === 'day') {
            // Format: "hétfő, január 1" in Hungarian style
            const dayName = hungarianDays[currentDate.getDay()];
            const monthName = hungarianMonths[currentDate.getMonth()];
            const dayNumber = currentDate.getDate();
            
            calendarSubtitle.textContent = `${dayName}, ${monthName} ${dayNumber}`;
        } else {
            calendarSubtitle.textContent = '';
        }
    }
    
    function renderMonthView() {
        calendarDays.innerHTML = '';
        calendarDays.className = 'calendar-grid';
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const dayElement = createDayElement(prevMonthLastDay - i, true);
            dayElement.dataset.date = formatDate(new Date(year, month - 1, prevMonthLastDay - i));
            calendarDays.appendChild(dayElement);
        }
        
        // Current month days
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = i === today.getDate() && 
                            month === today.getMonth() && 
                            year === today.getFullYear();
            
            const dayElement = createDayElement(i, false, isToday);
            dayElement.dataset.date = formatDate(new Date(year, month, i));
            calendarDays.appendChild(dayElement);
        }
        
        // Next month days
        const totalDaysDisplayed = startingDayOfWeek + daysInMonth;
        const remainingCells = 42 - totalDaysDisplayed; // 6 rows of 7 days
        
        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = createDayElement(i, true);
            dayElement.dataset.date = formatDate(new Date(year, month + 1, i));
            calendarDays.appendChild(dayElement);
        }
        
        // Add events to the calendar
        addEventsToCalendar();
    }
    
    function renderWeekView() {
        calendarDays.innerHTML = '';
        calendarDays.className = 'calendar-grid week-view';
        
        const weekStart = new Date(currentDate);
        const day = currentDate.getDay();
        weekStart.setDate(currentDate.getDate() - day);
        
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            
            const isToday = date.getDate() === today.getDate() && 
                           date.getMonth() === today.getMonth() && 
                           date.getFullYear() === today.getFullYear();
            
            const dayElement = createDayElement(date.getDate(), false, isToday);
            dayElement.dataset.date = formatDate(date);
            
            // Add day name
            const dayName = document.createElement('div');
            dayName.className = 'day-name';
            dayName.textContent = hungarianDaysShort[date.getDay()];
            dayElement.querySelector('.day-number').prepend(dayName);
            
            calendarDays.appendChild(dayElement);
        }
        
        // Add events to the calendar
        addEventsToCalendar();
    }
    
    function renderDayView() {
        calendarDays.innerHTML = '';
        calendarDays.className = 'day-view';
        
        // Create hour slots
        for (let hour = 0; hour < 24; hour++) {
            const hourSlot = document.createElement('div');
            hourSlot.className = 'hour-slot';
            
            const hourLabel = document.createElement('div');
            hourLabel.className = 'hour-label';
            hourLabel.textContent = formatHour(hour);
            
            const hourEvents = document.createElement('div');
            hourEvents.className = 'hour-events';
            hourEvents.dataset.hour = hour;
            
            hourSlot.appendChild(hourLabel);
            hourSlot.appendChild(hourEvents);
            calendarDays.appendChild(hourSlot);
        }
        
        // Add events to day view
        const dateStr = formatDate(currentDate);
        const dayEvents = events.filter(event => event.date === dateStr);
        
        dayEvents.forEach(event => {
            if (event.startTime) {
                const startHour = parseInt(event.startTime.split(':')[0]);
                const startMinute = parseInt(event.startTime.split(':')[1]);
                
                let duration = 60; // Default 1 hour
                if (event.endTime) {
                    const endHour = parseInt(event.endTime.split(':')[0]);
                    const endMinute = parseInt(event.endTime.split(':')[1]);
                    duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
                }
                
                const hourSlot = document.querySelector(`.hour-events[data-hour="${startHour}"]`);
                if (hourSlot) {
                    const eventElement = document.createElement('div');
                    eventElement.className = `day-event ${event.color}`;
                    eventElement.textContent = event.title;
                    eventElement.dataset.eventId = event.id;
                    
                    // Position the event
                    eventElement.style.top = `${(startMinute / 60) * 100}%`;
                    eventElement.style.height = `${(duration / 60) * 100}%`;
                    
                    eventElement.addEventListener('click', () => showEventDetails(event));
                    hourSlot.appendChild(eventElement);
                }
            }
        });
    }
    
    function createDayElement(dayNumber, isOtherMonth = false, isToday = false) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        const dayNumberElement = document.createElement('div');
        dayNumberElement.className = 'day-number';
        dayNumberElement.textContent = dayNumber;
        
        dayElement.appendChild(dayNumberElement);
        
        // Add click event to add event on that day
        dayElement.addEventListener('click', (e) => {
            if (e.target === dayElement || e.target === dayNumberElement) {
                clearEventForm();
                document.getElementById('eventModalLabel').textContent = 'Esemény hozzáadása';
                deleteEventBtn.classList.add('d-none');
                
                // Set the date input to the clicked day
                eventDateInput.value = dayElement.dataset.date;
                eventModal.show();
            }
        });
        
        return dayElement;
    }
    
    function addEventsToCalendar() {
        if (currentView === 'day') return;
        
        const dayElements = document.querySelectorAll('.calendar-day');
        
        dayElements.forEach(dayElement => {
            const date = dayElement.dataset.date;
            const dayEvents = events.filter(event => event.date === date);
            
            // Sort events by start time
            dayEvents.sort((a, b) => {
                if (!a.startTime) return -1;
                if (!b.startTime) return 1;
                return a.startTime.localeCompare(b.startTime);
            });
            
            // Limit to 3 events per day in month view
            const maxEvents = currentView === 'month' ? 3 : dayEvents.length;
            const displayEvents = dayEvents.slice(0, maxEvents);
            
            displayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = `event ${event.color}`;
                
                let eventText = event.title;
                if (event.startTime) {
                    eventText = `${formatTime(event.startTime)} ${eventText}`;
                }
                
                eventElement.textContent = eventText;
                eventElement.dataset.eventId = event.id;
                eventElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showEventDetails(event);
                });
                
                dayElement.appendChild(eventElement);
            });
            
            // Add "more" indicator if there are more events
            if (dayEvents.length > maxEvents) {
                const moreElement = document.createElement('div');
                moreElement.className = 'more-events';
                moreElement.textContent = `+ ${dayEvents.length - maxEvents} további`;
                moreElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // TODO: Show all events for this day
                    alert(`${dayEvents.length - maxEvents} további esemény ezen a napon`);
                });
                
                dayElement.appendChild(moreElement);
            }
        });
    }
    
    // Event handling functions
    function saveEvent() {
        const title = eventTitleInput.value.trim();
        const date = eventDateInput.value;
        const startTime = eventStartTimeInput.value;
        const endTime = eventEndTimeInput.value;
        const color = eventColorInput.value;
        const description = eventDescriptionInput.value.trim();
        const eventId = eventIdInput.value;
        
        if (!title || !date) {
            alert('Kérjük, adja meg az esemény címét és dátumát');
            return;
        }
        
        if (startTime && endTime && startTime > endTime) {
            alert('A befejezés időpontja nem lehet korábbi, mint a kezdés időpontja');
            return;
        }
        
        if (eventId) {
            // Update existing event
            const eventIndex = events.findIndex(event => event.id === eventId);
            if (eventIndex !== -1) {
                events[eventIndex] = {
                    ...events[eventIndex],
                    title,
                    date,
                    startTime,
                    endTime,
                    color,
                    description
                };
            }
        } else {
            // Add new event
            const newEvent = {
                id: generateId(),
                title,
                date,
                startTime,
                endTime,
                color,
                description
            };
            
            events.push(newEvent);
        }
        
        // Save to localStorage
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        
        // Close modal and refresh calendar
        eventModal.hide();
        renderCalendar();
    }
    
    function deleteEvent() {
        const eventId = eventIdInput.value;
        if (!eventId) return;
        
        if (confirm('Biztosan törölni szeretné ezt az eseményt?')) {
            events = events.filter(event => event.id !== eventId);
            
            // Save to localStorage
            localStorage.setItem('calendarEvents', JSON.stringify(events));
            
            // Close modal and refresh calendar
            eventModal.hide();
            renderCalendar();
        }
    }
    
    function showEventDetails(event) {
        const detailsTitle = document.getElementById('event-details-title');
        const detailsDate = document.querySelector('.event-details-date');
        const detailsTime = document.querySelector('.event-details-time');
        const detailsDescription = document.querySelector('.event-details-description');
        
        detailsTitle.textContent = event.title;
        
        // Format date in Hungarian style
        const eventDate = new Date(event.date);
        const dayName = hungarianDays[eventDate.getDay()];
        const monthName = hungarianMonths[eventDate.getMonth()];
        const dayNumber = eventDate.getDate();
        const year = eventDate.getFullYear();
        
        detailsDate.textContent = `${year}. ${monthName} ${dayNumber}, ${dayName}`;
        
        // Format time
        if (event.startTime) {
            let timeText = `${formatTime(event.startTime)}`;
            if (event.endTime) {
                timeText += ` - ${formatTime(event.endTime)}`;
            }
            detailsTime.textContent = timeText;
            detailsTime.classList.remove('d-none');
        } else {
            detailsTime.classList.add('d-none');
        }
        
        // Description
        if (event.description) {
            detailsDescription.textContent = event.description;
            detailsDescription.classList.remove('d-none');
        } else {
            detailsDescription.classList.add('d-none');
        }
        
        // Set up edit button
        editEventBtn.onclick = () => {
            eventDetailsModal.hide();
            editEvent(event);
        };
        
        eventDetailsModal.show();
    }
    
    function editEvent(event) {
        document.getElementById('eventModalLabel').textContent = 'Esemény szerkesztése';
        
        eventTitleInput.value = event.title;
        eventDateInput.value = event.date;
        eventStartTimeInput.value = event.startTime || '';
        eventEndTimeInput.value = event.endTime || '';
        eventColorInput.value = event.color;
        eventDescriptionInput.value = event.description || '';
        eventIdInput.value = event.id;
        
        deleteEventBtn.classList.remove('d-none');
        
        eventModal.show();
    }
    
    function clearEventForm() {
        eventForm.reset();
        eventIdInput.value = '';
    }
    
    // Utility functions
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    function formatDateForInput(date) {
        return formatDate(date);
    }
    
    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        return `${hour}:${minutes}`;
    }
    
    function formatHour(hour) {
        return `${hour}:00`;
    }
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
});