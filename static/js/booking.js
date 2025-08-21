// Booking Page JavaScript for American Airlines

let selectedFlight = null;
let currentPrice = 0;
let additionalCosts = {
    seatSelection: 0,
    priorityBoarding: 0,
    checkedBag: 0
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the booking page
    initializeBookingPage();
    
    // Set up event listeners
    setupBookingEventListeners();
    
    // Load flight details
    loadFlightDetails();
    
    // Initialize price calculations
    calculateTotalPrice();
});

function initializeBookingPage() {
    console.log('Booking page initialized');
    
    // Get flight ID from URL
    const flightId = window.location.pathname.split('/').pop();
    console.log('Flight ID:', flightId);
}

function setupBookingEventListeners() {
    // Seat selection change
    const seatRadios = document.querySelectorAll('input[name="seatType"]');
    seatRadios.forEach(radio => {
        radio.addEventListener('change', handleSeatSelectionChange);
    });
    
    // Upgrade checkboxes
    const priorityBoardingCheckbox = document.getElementById('priorityBoarding');
    const checkedBagCheckbox = document.getElementById('checkedBag');
    
    if (priorityBoardingCheckbox) {
        priorityBoardingCheckbox.addEventListener('change', handleUpgradeChange);
    }
    
    if (checkedBagCheckbox) {
        checkedBagCheckbox.addEventListener('change', handleUpgradeChange);
    }
    
    // Form submission
    const bookFlightBtn = document.getElementById('bookFlight');
    const confirmBookingBtn = document.getElementById('confirmBooking');
    
    if (bookFlightBtn) {
        bookFlightBtn.addEventListener('click', handleBookFlight);
    }
    
    if (confirmBookingBtn) {
        confirmBookingBtn.addEventListener('click', handleConfirmBooking);
    }
    
    // Form validation
    setupFormValidation();
}

function loadFlightDetails() {
    // Get flight data from session storage
    const flightData = sessionStorage.getItem('selectedFlight');
    if (flightData) {
        selectedFlight = JSON.parse(flightData);
        displayFlightSummary();
        displayPriceSummary();
    } else {
        showError('No flight selected. Please search for flights again.');
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    }
}

function displayFlightSummary() {
    const summaryContainer = document.getElementById('flightSummary');
    if (!summaryContainer || !selectedFlight) return;
    
    const departureTime = formatTime(selectedFlight.departure_time);
    const arrivalTime = formatTime(selectedFlight.arrival_time);
    const price = formatCurrency(selectedFlight.price);
    const stopsText = selectedFlight.stops === 0 ? 'Nonstop' : `${selectedFlight.stops} stop${selectedFlight.stops > 1 ? 's' : ''}`;
    
    summaryContainer.innerHTML = `
        <div class="row">
            <div class="col-md-8">
                <div class="flight-route">
                    <div class="route-info">
                        <div class="airport-code">${selectedFlight.departure_airport.code}</div>
                        <div class="city-name">${selectedFlight.departure_airport.city}</div>
                        <div class="time">${departureTime}</div>
                    </div>
                    
                    <div class="flight-arrow">
                        <i class="fas fa-plane"></i>
                    </div>
                    
                    <div class="route-info">
                        <div class="airport-code">${selectedFlight.arrival_airport.code}</div>
                        <div class="city-name">${selectedFlight.arrival_airport.city}</div>
                        <div class="time">${arrivalTime}</div>
                    </div>
                </div>
                
                <div class="flight-details mt-3">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="detail-item">
                                <div class="detail-label">Duration</div>
                                <div class="detail-value">${selectedFlight.duration}</div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="detail-item">
                                <div class="detail-label">Stops</div>
                                <div class="detail-value">${stopsText}</div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="detail-item">
                                <div class="detail-label">Airline</div>
                                <div class="detail-value">${selectedFlight.airline}</div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="detail-item">
                                <div class="detail-label">Aircraft</div>
                                <div class="detail-value">${selectedFlight.aircraft}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4 text-end">
                <div class="flight-price">
                    <div class="price-amount">${price}</div>
                    <div class="price-label">per passenger</div>
                </div>
            </div>
        </div>
    `;
    
    // Set initial price
    currentPrice = selectedFlight.price;
}

function displayPriceSummary() {
    const priceContainer = document.getElementById('priceSummary');
    if (!priceContainer) return;
    
    updatePriceSummary();
}

function updatePriceSummary() {
    const priceContainer = document.getElementById('priceSummary');
    if (!priceContainer) return;
    
    const basePrice = selectedFlight.price;
    const seatCost = additionalCosts.seatSelection;
    const priorityCost = additionalCosts.priorityBoarding;
    const bagCost = additionalCosts.checkedBag;
    const total = basePrice + seatCost + priorityCost + bagCost;
    
    priceContainer.innerHTML = `
        <div class="price-item">
            <span>Base Fare</span>
            <span>${formatCurrency(basePrice)}</span>
        </div>
        ${seatCost > 0 ? `<div class="price-item">
            <span>Seat Selection</span>
            <span>${formatCurrency(seatCost)}</span>
        </div>` : ''}
        ${priorityCost > 0 ? `<div class="price-item">
            <span>Priority Boarding</span>
            <span>${formatCurrency(priorityCost)}</span>
        </div>` : ''}
        ${bagCost > 0 ? `<div class="price-item">
            <span>Checked Bag</span>
            <span>${formatCurrency(bagCost)}</span>
        </div>` : ''}
        <hr>
        <div class="price-item price-total">
            <span>Total</span>
            <span>${formatCurrency(total)}</span>
        </div>
    `;
}

function handleSeatSelectionChange() {
    const selectedSeat = document.querySelector('input[name="seatType"]:checked');
    if (selectedSeat) {
        switch (selectedSeat.value) {
            case 'economy_basic':
                additionalCosts.seatSelection = 0;
                break;
            case 'economy_standard':
                additionalCosts.seatSelection = 15;
                break;
            case 'economy_premium':
                additionalCosts.seatSelection = 35;
                break;
            default:
                additionalCosts.seatSelection = 0;
        }
        calculateTotalPrice();
    }
}

function handleUpgradeChange() {
    const priorityBoarding = document.getElementById('priorityBoarding');
    const checkedBag = document.getElementById('checkedBag');
    
    additionalCosts.priorityBoarding = priorityBoarding.checked ? 25 : 0;
    additionalCosts.checkedBag = checkedBag.checked ? 30 : 0;
    
    calculateTotalPrice();
}

function calculateTotalPrice() {
    updatePriceSummary();
}

function setupFormValidation() {
    // Real-time validation for form fields
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });
    
    // Credit card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
    }
    
    // CVV validation
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', validateCVV);
    }
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/\D/g, ''))) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback d-block';
    errorDiv.textContent = message;
    
    field.classList.add('is-invalid');
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function formatCardNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    event.target.value = value.substring(0, 19);
}

function formatExpiryDate(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value.substring(0, 5);
}

function validateCVV(event) {
    let value = event.target.value.replace(/\D/g, '');
    event.target.value = value.substring(0, 4);
}

function validateAllFields() {
    const requiredFields = document.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    // Check terms acceptance
    const termsCheckbox = document.getElementById('termsAccept');
    if (termsCheckbox && !termsCheckbox.checked) {
        showError('Please accept the terms and conditions');
        isValid = false;
    }
    
    return isValid;
}

function handleBookFlight() {
    if (validateAllFields()) {
        // Show confirmation dialog
        if (confirm('Are you sure you want to proceed with this booking?')) {
            showSuccess('Flight booking successful! Redirecting to confirmation...');
            setTimeout(() => {
                // In a real application, this would submit to a payment processor
                // For demo purposes, we'll just show a success message
                showSuccess('Thank you for your booking! Your confirmation has been sent to your email.');
            }, 2000);
        }
    } else {
        showError('Please fill in all required fields correctly.');
    }
}

function handleConfirmBooking() {
    handleBookFlight();
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
}

function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Auto-save form data to localStorage
function autoSaveForm() {
    const formData = {
        firstName: document.getElementById('firstName')?.value || '',
        lastName: document.getElementById('lastName')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        dateOfBirth: document.getElementById('dateOfBirth')?.value || '',
        passportNumber: document.getElementById('passportNumber')?.value || '',
        address: document.getElementById('address')?.value || ''
    };
    
    localStorage.setItem('passengerFormData', JSON.stringify(formData));
}

// Load saved form data
function loadSavedFormData() {
    const savedData = localStorage.getItem('passengerFormData');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                field.value = data[key];
            }
        });
    }
}

// Set up auto-save
document.addEventListener('DOMContentLoaded', function() {
    const formFields = document.querySelectorAll('#passengerForm input, #passengerForm textarea');
    formFields.forEach(field => {
        field.addEventListener('input', autoSaveForm);
    });
    
    // Load saved data
    loadSavedFormData();
});

// Progress bar update
function updateProgressBar(step) {
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((stepElement, index) => {
        if (index <= step) {
            stepElement.classList.add('active');
        } else {
            stepElement.classList.remove('active');
        }
    });
}

// Initialize progress bar
document.addEventListener('DOMContentLoaded', function() {
    updateProgressBar(0);
});
