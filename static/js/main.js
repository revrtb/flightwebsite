// Main JavaScript for American Airlines Homepage

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializePage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load airports data
    loadAirports();
    
    // Set default dates
    setDefaultDates();
    
    // Set initial trip type visibility based on default selection
    handleTripTypeChange();
});

function initializePage() {
    console.log('American Airlines website initialized');
}

function setupEventListeners() {
    // Flight search form submission
    const searchForm = document.getElementById('flightSearchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleFlightSearch);
    }
    
    // Trip type change handler
    const tripTypeSelect = document.getElementById('tripType');
    if (tripTypeSelect) {
        tripTypeSelect.addEventListener('change', handleTripTypeChange);
    }
    
    // Origin and destination change handlers
    const originSelect = document.getElementById('origin');
    const destinationSelect = document.getElementById('destination');
    
    if (originSelect) {
        originSelect.addEventListener('change', function() {
            updateDestinationOptions(this.value);
        });
    }
    
    if (destinationSelect) {
        destinationSelect.addEventListener('change', function() {
            validateOriginDestination();
        });
    }
}

function loadAirports() {
    fetch('/api/airports')
        .then(response => response.json())
        .then(airports => {
            populateAirportSelects(airports);
        })
        .catch(error => {
            console.error('Error loading airports:', error);
        });
}

function populateAirportSelects(airports) {
    const originSelect = document.getElementById('origin');
    const destinationSelect = document.getElementById('destination');
    
    if (originSelect && destinationSelect) {
        // Clear existing options
        originSelect.innerHTML = '<option value="">Select departure city</option>';
        destinationSelect.innerHTML = '<option value="">Select arrival city</option>';
        
        // Add airport options
        airports.forEach(airport => {
            const originOption = document.createElement('option');
            originOption.value = airport.code;
            originOption.textContent = `${airport.city} (${airport.code})`;
            originSelect.appendChild(originOption);
            
            const destOption = document.createElement('option');
            destOption.value = airport.code;
            destOption.textContent = `${airport.city} (${airport.code})`;
            destinationSelect.appendChild(destOption);
        });
    }
}

function updateDestinationOptions(selectedOrigin) {
    const destinationSelect = document.getElementById('destination');
    if (destinationSelect) {
        // Enable/disable destination options based on origin selection
        Array.from(destinationSelect.options).forEach(option => {
            if (option.value === selectedOrigin) {
                option.disabled = true;
                if (destinationSelect.value === selectedOrigin) {
                    destinationSelect.value = '';
                }
            } else {
                option.disabled = false;
            }
        });
    }
}

function validateOriginDestination() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    
    if (origin && destination && origin === destination) {
        alert('Origin and destination cannot be the same city.');
        document.getElementById('destination').value = '';
    }
}

function setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const departDateInput = document.getElementById('departDate');
    const returnDateInput = document.getElementById('returnDate');
    
    if (departDateInput) {
        departDateInput.value = tomorrow.toISOString().split('T')[0];
        departDateInput.min = today.toISOString().split('T')[0];
    }
    
    if (returnDateInput) {
        returnDateInput.value = nextWeek.toISOString().split('T')[0];
        returnDateInput.min = tomorrow.toISOString().split('T')[0];
    }
}

function handleTripTypeChange() {
    const tripTypeSelect = document.getElementById('tripType');
    const returnDateGroup = document.getElementById('returnDateGroup');
    
    if (!tripTypeSelect || !returnDateGroup) {
        return; // Elements not found, exit early
    }
    
    const tripType = tripTypeSelect.value;
    
    if (tripType === 'oneway') {
        returnDateGroup.style.display = 'none';
    } else {
        returnDateGroup.style.display = 'block';
    }
}

function handleFlightSearch(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const searchParams = new URLSearchParams();
    
    // Get form values
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const departDate = document.getElementById('departDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const tripType = document.getElementById('tripType').value;
    const passengers = document.getElementById('passengers').value;
    
    // Validate required fields
    if (!origin || !destination || !departDate) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Build search parameters
    searchParams.append('origin', origin);
    searchParams.append('destination', destination);
    searchParams.append('date', departDate);
    if (returnDate && tripType === 'roundtrip') {
        searchParams.append('returnDate', returnDate);
    }
    searchParams.append('tripType', tripType);
    searchParams.append('passengers', passengers);
    
    // Store search data in session storage for the results page
    sessionStorage.setItem('flightSearch', JSON.stringify({
        origin: origin,
        destination: destination,
        departDate: departDate,
        returnDate: returnDate,
        tripType: tripType,
        passengers: passengers
    }));
    
    // Redirect to search results page
    window.location.href = `/search?${searchParams.toString()}`;
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Utility function to format time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Utility function to show loading state
function showLoading(element) {
    if (element) {
        element.classList.add('loading');
        element.disabled = true;
    }
}

// Utility function to hide loading state
function hideLoading(element) {
    if (element) {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

// Utility function to show success message
function showSuccess(message) {
    // Create a temporary success alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Utility function to show error message
function showError(message) {
    // Create a temporary error alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll for feature cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe feature cards for animation
document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
});

// Add destination card hover effects
document.querySelectorAll('.destination-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});
