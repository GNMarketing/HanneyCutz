document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });

    // Navbar Scroll Effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Initialize Flatpickr for Date Selection
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    
    const flatpickrInstance = flatpickr(dateInput, {
        minDate: 'today',
        maxDate: new Date().fp_incr(30), // 30 days from now
        disable: [
            function(date) {
                // Disable Sundays
                return (date.getDay() === 0);
            }
        ],
        onChange: function(selectedDates, dateStr) {
            updateAvailableTimes(dateStr);
        }
    });

    // Update Available Times Based on Selected Date
    function updateAvailableTimes(selectedDate) {
        timeSelect.disabled = false;
        timeSelect.innerHTML = '<option value="" disabled selected>Select time</option>';
        
        const date = new Date(selectedDate);
        const dayOfWeek = date.getDay();
        let startHour, endHour, interval = 30;
        
        // Set hours based on day of week
        if (dayOfWeek === 6) { // Saturday
            startHour = 9;
            endHour = 17;
        } else { // Weekdays (Mon-Fri)
            startHour = 9.5; // 9:30 AM
            endHour = 18.5;  // 6:30 PM
        }
        
        // Generate time slots
        const startTime = startHour * 60;
        const endTime = endHour * 60;
        
        for (let minutes = startTime; minutes < endTime; minutes += interval) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            
            const option = document.createElement('option');
            option.value = timeString;
            option.textContent = timeString;
            timeSelect.appendChild(option);
        }
    }

    // Booking Form Submission
    const bookingForm = document.getElementById('appointmentForm');
    
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(bookingForm);
        const bookingDetails = {};
        
        for (let [key, value] of formData.entries()) {
            bookingDetails[key] = value;
        }
        
        // Here you would typically send this data to a server
        console.log('Booking Details:', bookingDetails);
        
        // Show confirmation (in a real app, you'd want something more sophisticated)
        alert(`Booking confirmed for ${bookingDetails.date} at ${bookingDetails.time}\nWe'll send a confirmation to ${bookingDetails.email}`);
        
        // Reset form
        bookingForm.reset();
        timeSelect.disabled = true;
    });

    // Initialize Mapbox
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [-6.2603, 53.3498], // Default to Dublin coordinates
        zoom: 12
    });
    
    // Add marker for the van
    const vanMarker = new mapboxgl.Marker({
        color: '#8B5A2B',
        scale: 1.2
    })
    .setLngLat([-6.2603, 53.3498])
    .addTo(map);
    
    // Simulate van movement (in a real app, you'd get this from GPS)
    function updateVanLocation() {
        // Random movement within Dublin area for demo purposes
        const currentLngLat = vanMarker.getLngLat();
        const newLng = currentLngLat.lng + (Math.random() * 0.01 - 0.005);
        const newLat = currentLngLat.lat + (Math.random() * 0.01 - 0.005);
        
        vanMarker.setLngLat([newLng, newLat]);
        
        // Update location text
        document.getElementById('currentLocation').textContent = `Near ${getRandomLocation()}, Dublin`;
        
        // Adjust map view
        map.flyTo({
            center: [newLng, newLat],
            essential: true
        });
    }
    
    // Helper function for demo location names
    function getRandomLocation() {
        const locations = [
            'Grafton Street', 'Temple Bar', 'St. Stephen\'s Green', 
            'Docklands', 'Rathmines', 'Portobello', 'Smithfield', 
            'Parnell Street', 'O\'Connell Street', 'Merrion Square'
        ];
        return locations[Math.floor(Math.random() * locations.length)];
    }
    
    // Update van status (open/closed)
    function updateVanStatus() {
        const now = new Date();
        const hours = now.getHours();
        const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        let isOpen = false;
        
        if (day === 0) { // Sunday
            isOpen = false;
        } else if (day === 6) { // Saturday
            isOpen = hours >= 9 && hours < 17;
        } else { // Weekday
            isOpen = (hours >= 9 && minutes >= 30) && hours < 18;
        }
        
        if (isOpen) {
            statusDot.className = 'status-dot open';
            statusText.textContent = 'Open Now';
            statusText.style.color = '#4CAF50';
        } else {
            statusDot.className = 'status-dot closed';
            statusText.textContent = 'Closed Now';
            statusText.style.color = '#F44336';
        }
        
        // Update next available time
        updateNextAvailableTime(day, hours);
    }
    
    function updateNextAvailableTime(day, currentHour) {
        const nextAvailableElement = document.getElementById('nextAvailable');
        
        if (day === 0) { // Sunday
            nextAvailableElement.textContent = 'Tomorrow at 09:30';
            return;
        }
        
        let nextAvailable = '';
        const now = new Date();
        
        if (day === 6) { // Saturday
            if (currentHour < 9) {
                nextAvailable = 'Today at 09:00';
            } else if (currentHour >= 17) {
                nextAvailable = 'Monday at 09:30';
            } else {
                const nextSlot = new Date(now);
                nextSlot.setHours(nextSlot.getHours() + 1);
                const hours = nextSlot.getHours().toString().padStart(2, '0');
                const minutes = nextSlot.getMinutes().toString().padStart(2, '0');
                nextAvailable = `Today at ${hours}:${minutes}`;
            }
        } else { // Weekday
            if (currentHour < 9 || (currentHour === 9 && now.getMinutes() < 30)) {
                nextAvailable = 'Today at 09:30';
            } else if (currentHour >= 18 || (currentHour === 17 && now.getMinutes() >= 30)) {
                if (day === 5) { // Friday
                    nextAvailable = 'Saturday at 09:00';
                } else {
                    nextAvailable = 'Tomorrow at 09:30';
                }
            } else {
                const nextSlot = new Date(now);
                nextSlot.setMinutes(nextSlot.getMinutes() + 30);
                const hours = nextSlot.getHours().toString().padStart(2, '0');
                const minutes = nextSlot.getMinutes().toString().padStart(2, '0');
                nextAvailable = `Today at ${hours}:${minutes}`;
            }
        }
        
        nextAvailableElement.textContent = nextAvailable;
    }
    
    // Initialize and update van status and location
    updateVanStatus();
    updateVanLocation();
    
    // Update van status every minute
    setInterval(updateVanStatus, 60000);
    
    // Update van location every 30 seconds (for demo)
    setInterval(updateVanLocation, 30000);
    
    // Add current year to footer
    document.querySelector('.footer-bottom p').innerHTML = `&copy; ${new Date().getFullYear()} HanneyCutz. All rights reserved.`;
});
