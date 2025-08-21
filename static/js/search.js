// Search Results JavaScript for American Airlines

let allFlights = [];
let filteredFlights = [];
let currentFilters = {};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the search page
    initializeSearchPage();
    
    // Set up event listeners
    setupSearchEventListeners();
    
    // Load flight results
    loadFlightResults();
});

function initializeSearchPage() {
    console.log('Search page initialized');
    
    // Display search summary
    displaySearchSummary();
}

function setupSearchEventListeners() {
    // Filter form submission
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    // Clear filters button
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Sort dropdown change
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    // Results per page change
    const resultsPerPageSelect = document.getElementById('resultsPerPage');
    if (resultsPerPageSelect) {
        resultsPerPageSelect.addEventListener('change', handleResultsPerPageChange);
    }
    
    // Filter checkboxes
    const filterCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });
    
    // Price range inputs
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    if (minPriceInput) {
        minPriceInput.addEventListener('input', updateFilters);
    }
    if (maxPriceInput) {
        maxPriceInput.addEventListener('input', updateFilters);
    }
}

function displaySearchSummary() {
    const searchData = sessionStorage.getItem('flightSearch');
    if (searchData) {
        const search = JSON.parse(searchData);
        const summaryElement = document.getElementById('searchSummary');
        
        if (summaryElement) {
            const origin = search.origin;
            const destination = search.destination;
            const departDate = new Date(search.departDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            let summaryText = `${origin} to ${destination} • ${departDate}`;
            
            if (search.tripType === 'roundtrip' && search.returnDate) {
                const returnDate = new Date(search.returnDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                summaryText += ` • Return ${returnDate}`;
            }
            
            summaryText += ` • ${search.passengers} passenger${search.passengers > 1 ? 's' : ''}`;
            
            summaryElement.textContent = summaryText;
        }
    }
}

function loadFlightResults() {
    const searchData = sessionStorage.getItem('flightSearch');
    if (!searchData) {
        showError('No search data found. Please search for flights again.');
        return;
    }
    
    const search = JSON.parse(searchData);
    showLoadingSpinner();
    
    // Build API query parameters with enhanced filtering
    const params = new URLSearchParams({
        origin: search.origin,
        destination: search.destination,
        date: search.departDate,
        limit: '100'  // Get more results for better filtering
    });
    
    fetch(`/api/flights?${params.toString()}`)
        .then(response => response.json())
        .then(flights => {
            allFlights = flights;
            filteredFlights = [...flights];
            hideLoadingSpinner();
            displayFlightResults();
            updateResultCount();
            
            // Apply any existing filters
            if (Object.keys(currentFilters).length > 0) {
                applyFilters();
            }
        })
        .catch(error => {
            console.error('Error loading flights:', error);
            hideLoadingSpinner();
            showError('Error loading flight results. Please try again.');
        });
}

function displayFlightResults() {
    const resultsContainer = document.getElementById('flightResults');
    if (!resultsContainer) return;
    
    if (filteredFlights.length === 0) {
        resultsContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5>No flights found</h5>
                <p class="text-muted">Try adjusting your search criteria or filters.</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = filteredFlights.map(flight => createFlightCard(flight)).join('');
    
    // Add click handlers to book buttons
    document.querySelectorAll('.book-flight-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const flightId = this.dataset.flightId;
            bookFlight(flightId);
        });
    });
}

function createFlightCard(flight) {
    const departureTime = formatTime(flight.departure_time);
    const arrivalTime = formatTime(flight.arrival_time);
    const price = formatCurrency(flight.price);
    const stopsText = flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`;
    const routeTypeBadge = flight.route_type === 'major' ? 
        '<span class="badge bg-success me-2">Major Route</span>' : 
        '<span class="badge bg-info me-2">Regional</span>';
    
    return `
        <div class="card flight-card mb-3">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="d-flex align-items-center">
                                ${routeTypeBadge}
                                <span class="badge bg-primary">${flight.airline}</span>
                            </div>
                            <div class="text-end">
                                <small class="text-muted">${flight.available_seats} seats available</small>
                            </div>
                        </div>
                        
                        <div class="flight-route">
                            <div class="route-info">
                                <div class="airport-code">${flight.departure_airport.code}</div>
                                <div class="city-name">${flight.departure_airport.city}</div>
                                <div class="time">${departureTime}</div>
                            </div>
                            
                            <div class="flight-arrow">
                                <i class="fas fa-plane"></i>
                                <div class="flight-duration">${flight.duration}</div>
                            </div>
                            
                            <div class="route-info">
                                <div class="airport-code">${flight.arrival_airport.code}</div>
                                <div class="city-name">${flight.arrival_airport.city}</div>
                                <div class="time">${arrivalTime}</div>
                            </div>
                        </div>
                        
                        <div class="flight-details">
                            <div class="detail-item">
                                <div class="detail-label">Stops</div>
                                <div class="detail-value">${stopsText}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Aircraft</div>
                                <div class="detail-value">${flight.aircraft}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Flight</div>
                                <div class="detail-value">${flight.id}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-4 text-end">
                        <div class="flight-price mb-3">
                            <div class="price-amount">${price}</div>
                            <div class="price-label">per passenger</div>
                        </div>
                        <div class="d-grid">
                            <button class="btn btn-primary book-flight-btn" data-flight-id="${flight.id}">
                                <i class="fas fa-plane me-2"></i>
                                Book Flight
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateFilters() {
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    
    // Get selected airlines
    const selectedAirlines = [];
    document.querySelectorAll('input[name="airline"]:checked').forEach(checkbox => {
        selectedAirlines.push(checkbox.value);
    });
    
    // Get selected stops
    const selectedStops = [];
    document.querySelectorAll('input[name="stops"]:checked').forEach(checkbox => {
        selectedStops.push(parseInt(checkbox.value));
    });
    
    // Get selected departure times
    const selectedTimes = [];
    document.querySelectorAll('input[name="departureTime"]:checked').forEach(checkbox => {
        selectedTimes.push(checkbox.value);
    });
    
    // Get selected route types
    const selectedRouteTypes = [];
    document.querySelectorAll('input[name="routeType"]:checked').forEach(checkbox => {
        selectedRouteTypes.push(checkbox.value);
    });
    
    currentFilters = {
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        airlines: selectedAirlines,
        stops: selectedStops,
        departureTimes: selectedTimes,
        routeTypes: selectedRouteTypes
    };
}

function clearFilters() {
    // Clear price inputs
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    
    // Reset checkboxes to default state
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.id === 'nonstop' || checkbox.id === 'aa' || checkbox.id === 'ae' || 
            checkbox.id === 'ac' || checkbox.id === 'major' || checkbox.id === 'regional') {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    });
    
    // Reset sort to default
    document.getElementById('sortBy').value = 'price';
    
    // Clear current filters
    currentFilters = {};
    
    // Reload results without filters
    loadFlightResults();
}

function handleResultsPerPageChange() {
    const resultsPerPage = document.getElementById('resultsPerPage').value;
    // Update the limit parameter for future API calls
    currentFilters.limit = parseInt(resultsPerPage);
    
    // Reload results with new limit
    if (Object.keys(currentFilters).length > 0) {
        applyFilters();
    } else {
        loadFlightResults();
    }
}

function applyFilters() {
    updateFilters();
    
    // Build API query with current filters
    const searchData = sessionStorage.getItem('flightSearch');
    if (!searchData) return;
    
    const search = JSON.parse(searchData);
    const params = new URLSearchParams({
        origin: search.origin,
        destination: search.destination,
        date: search.departDate,
        limit: '100'
    });
    
    // Add filter parameters
    if (currentFilters.minPrice) params.append('min_price', currentFilters.minPrice);
    if (currentFilters.maxPrice) params.append('max_price', currentFilters.maxPrice);
    if (currentFilters.stops.length > 0) params.append('stops', currentFilters.stops[0]); // API supports single value
    if (currentFilters.airlines.length > 0) params.append('airline', currentFilters.airlines[0]); // API supports single value
    if (currentFilters.departureTimes.length > 0) params.append('departure_time', currentFilters.departureTimes[0]); // API supports single value
    
    // Add sorting
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        params.append('sort_by', sortSelect.value);
    }
    
    showLoadingSpinner();
    
    fetch(`/api/flights?${params.toString()}`)
        .then(response => response.json())
        .then(flights => {
            filteredFlights = flights;
            hideLoadingSpinner();
            displayFlightResults();
            updateResultCount();
        })
        .catch(error => {
            console.error('Error applying filters:', error);
            hideLoadingSpinner();
            // Fallback to client-side filtering
            filterFlights();
            displayFlightResults();
            updateResultCount();
        });
}

function filterFlights() {
    filteredFlights = allFlights.filter(flight => {
        // Price filter
        if (currentFilters.minPrice && flight.price < currentFilters.minPrice) return false;
        if (currentFilters.maxPrice && flight.price > currentFilters.maxPrice) return false;
        
        // Airline filter
        if (currentFilters.airlines.length > 0 && !currentFilters.airlines.includes(flight.airline)) return false;
        
        // Stops filter
        if (currentFilters.stops.length > 0 && !currentFilters.stops.includes(flight.stops)) return false;
        
        // Departure time filter
        if (currentFilters.departureTimes.length > 0) {
            const departureHour = parseInt(flight.departure_time.split(':')[0]);
            let timeCategory = '';
            
            if (departureHour >= 6 && departureHour < 12) timeCategory = 'morning';
            else if (departureHour >= 12 && departureHour < 18) timeCategory = 'afternoon';
            else timeCategory = 'evening';
            
            if (!currentFilters.departureTimes.includes(timeCategory)) return false;
        }
        
        return true;
    });
}

function handleSortChange() {
    const sortBy = document.getElementById('sortBy').value;
    sortFlights(sortBy);
    displayFlightResults();
}

function sortFlights(sortBy) {
    switch (sortBy) {
        case 'price':
            filteredFlights.sort((a, b) => a.price - b.price);
            break;
        case 'duration':
            filteredFlights.sort((a, b) => {
                const durationA = parseFloat(a.duration.split('h')[0]);
                const durationB = parseFloat(b.duration.split('h')[0]);
                return durationA - durationB;
            });
            break;
        case 'departure':
            filteredFlights.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
            break;
        default:
            break;
    }
}

function updateResultCount() {
    const resultCountElement = document.getElementById('resultCount');
    if (resultCountElement) {
        const total = allFlights.length;
        const filtered = filteredFlights.length;
        
        if (filtered === total) {
            resultCountElement.textContent = `${total} flight${total !== 1 ? 's' : ''} found`;
        } else {
            resultCountElement.textContent = `${filtered} of ${total} flight${total !== 1 ? 's' : ''} shown`;
        }
    }
}

function bookFlight(flightId) {
    // Store selected flight in session storage
    const selectedFlight = allFlights.find(f => f.id === flightId);
    if (selectedFlight) {
        sessionStorage.setItem('selectedFlight', JSON.stringify(selectedFlight));
        window.location.href = `/booking/${flightId}`;
    }
}

function showLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'block';
    }
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Utility functions (same as main.js)
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

// Initialize filters on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set up filter checkboxes with proper names
    const airlineCheckboxes = document.querySelectorAll('input[id^="aa"], input[id^="ae"], input[id^="ac"]');
    airlineCheckboxes.forEach(checkbox => {
        checkbox.name = 'airline';
    });
    
    const stopCheckboxes = document.querySelectorAll('input[id="nonstop"], input[id="onestop"]');
    stopCheckboxes.forEach(checkbox => {
        checkbox.name = 'stops';
    });
    
    const timeCheckboxes = document.querySelectorAll('input[id="morning"], input[id="afternoon"], input[id="evening"]');
    timeCheckboxes.forEach(checkbox => {
        checkbox.name = 'departureTime';
    });
    
    const routeTypeCheckboxes = document.querySelectorAll('input[id="major"], input[id="regional"]');
    routeTypeCheckboxes.forEach(checkbox => {
        checkbox.name = 'routeType';
    });
});
