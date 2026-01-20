from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import json
from datetime import datetime, timedelta
import random

app = Flask(__name__)
app.secret_key = 'airline_demo_secret_key'

# Mock user data
MOCK_USERS = {
    'demo@example.com': {
        'password': 'demo123',
        'name': 'John Smith',
        'email': 'demo@example.com',
        'phone': '+1-555-0123',
        'address': '123 Main St, New York, NY 10001',
        'date_of_birth': '1985-03-15',
        'passport_number': 'US123456789',
        'aadvantage_number': 'AA123456789'
    }
}

# Mock booking data
def generate_mock_bookings(user_email):
    airports = [
        {'code': 'JFK', 'name': 'New York (JFK)', 'city': 'New York'},
        {'code': 'LAX', 'name': 'Los Angeles (LAX)', 'city': 'Los Angeles'},
        {'code': 'ORD', 'name': 'Chicago (ORD)', 'city': 'Chicago'},
        {'code': 'DFW', 'name': 'Dallas (DFW)', 'city': 'Dallas'},
        {'code': 'ATL', 'name': 'Atlanta (ATL)', 'city': 'Atlanta'},
        {'code': 'MIA', 'name': 'Miami (MIA)', 'city': 'Miami'},
        {'code': 'SEA', 'name': 'Seattle (SEA)', 'city': 'Seattle'},
        {'code': 'DEN', 'name': 'Denver (DEN)', 'city': 'Denver'},
        {'code': 'SFO', 'name': 'San Francisco (SFO)', 'city': 'San Francisco'},
        {'code': 'BOS', 'name': 'Boston (BOS)', 'city': 'Boston'}
    ]
    
    airlines = ['American Airlines', 'American Eagle', 'American Connection']
    aircraft_types = ['Boeing 737', 'Boeing 777', 'Boeing 787', 'Airbus A320', 'Airbus A321']
    
    # Generate 3-5 past bookings and 1-2 upcoming bookings
    bookings = []
    
    # Past bookings
    for i in range(random.randint(3, 5)):
        departure_airport = random.choice(airports)
        arrival_airport = random.choice([a for a in airports if a['code'] != departure_airport['code']])
        
        # Past date (within last 6 months)
        days_ago = random.randint(30, 180)
        departure_date = datetime.now() - timedelta(days=days_ago)
        
        # Flight duration between 1-6 hours
        duration_hours = random.randint(1, 6)
        duration_minutes = random.randint(0, 59)
        
        # Price between $150-$800
        base_price = random.randint(150, 800)
        
        booking = {
            'id': f'BK{random.randint(10000, 99999)}',
            'type': 'past',
            'airline': random.choice(airlines),
            'departure_airport': departure_airport,
            'arrival_airport': arrival_airport,
            'departure_date': departure_date.strftime('%Y-%m-%d'),
            'departure_time': f'{random.randint(6, 22):02d}:{random.choice([0, 15, 30, 45]):02d}',
            'duration': f'{duration_hours}h {duration_minutes}m',
            'aircraft': random.choice(aircraft_types),
            'price': base_price,
            'stops': random.choice([0, 1]),
            'status': 'completed',
            'seat': f'{random.choice(["A", "B", "C", "D", "E", "F"])}{random.randint(1, 30)}',
            'confirmation_number': f'AA{random.randint(100000, 999999)}'
        }
        bookings.append(booking)
    
    # Upcoming bookings
    for i in range(random.randint(1, 2)):
        departure_airport = random.choice(airports)
        arrival_airport = random.choice([a for a in airports if a['code'] != departure_airport['code']])
        
        # Future date (within next 3 months)
        days_ahead = random.randint(7, 90)
        departure_date = datetime.now() + timedelta(days=days_ahead)
        
        # Flight duration between 1-6 hours
        duration_hours = random.randint(1, 6)
        duration_minutes = random.randint(0, 59)
        
        # Price between $150-$800
        base_price = random.randint(150, 800)
        
        booking = {
            'id': f'BK{random.randint(10000, 99999)}',
            'type': 'upcoming',
            'airline': random.choice(airlines),
            'departure_airport': departure_airport,
            'arrival_airport': arrival_airport,
            'departure_date': departure_date.strftime('%Y-%m-%d'),
            'departure_time': f'{random.randint(6, 22):02d}:{random.choice([0, 15, 30, 45]):02d}',
            'duration': f'{duration_hours}h {duration_minutes}m',
            'aircraft': random.choice(aircraft_types),
            'price': base_price,
            'stops': random.choice([0, 1]),
            'status': 'confirmed',
            'seat': f'{random.choice(["A", "B", "C", "D", "E", "F"])}{random.randint(1, 30)}',
            'confirmation_number': f'AA{random.randint(100000, 999999)}'
        }
        bookings.append(booking)
    
    return bookings

# Mock flight data
def generate_mock_flights():
    airports = [
        {'code': 'JFK', 'name': 'New York (JFK)', 'city': 'New York'},
        {'code': 'LAX', 'name': 'Los Angeles (LAX)', 'city': 'Los Angeles'},
        {'code': 'ORD', 'name': 'Chicago (ORD)', 'city': 'Chicago'},
        {'code': 'DFW', 'name': 'Dallas (DFW)', 'city': 'Dallas'},
        {'code': 'ATL', 'name': 'Atlanta (ATL)', 'city': 'Atlanta'},
        {'code': 'MIA', 'name': 'Miami (MIA)', 'city': 'Miami'},
        {'code': 'SEA', 'name': 'Seattle (SEA)', 'city': 'Seattle'},
        {'code': 'DEN', 'name': 'Denver (DEN)', 'city': 'Denver'},
        {'code': 'SFO', 'name': 'San Francisco (SFO)', 'city': 'San Francisco'},
        {'code': 'BOS', 'name': 'Boston (BOS)', 'city': 'Boston'},
        {'code': 'LAS', 'name': 'Las Vegas (LAS)', 'city': 'Las Vegas'},
        {'code': 'PHX', 'name': 'Phoenix (PHX)', 'city': 'Phoenix'},
        {'code': 'IAH', 'name': 'Houston (IAH)', 'city': 'Houston'},
        {'code': 'CLT', 'name': 'Charlotte (CLT)', 'city': 'Charlotte'},
        {'code': 'MCO', 'name': 'Orlando (MCO)', 'city': 'Orlando'},
        {'code': 'DTW', 'name': 'Detroit (DTW)', 'city': 'Detroit'},
        {'code': 'FLL', 'name': 'Fort Lauderdale (FLL)', 'city': 'Fort Lauderdale'},
        {'code': 'BWI', 'name': 'Baltimore (BWI)', 'city': 'Baltimore'},
        {'code': 'IAD', 'name': 'Washington (IAD)', 'city': 'Washington'},
        {'code': 'PHL', 'name': 'Philadelphia (PHL)', 'city': 'Philadelphia'}
    ]
    
    airlines = ['American Airlines', 'American Eagle', 'American Connection']
    aircraft_types = ['Boeing 737-800', 'Boeing 737 MAX 8', 'Boeing 777-200', 'Boeing 777-300ER', 'Boeing 787-8', 'Boeing 787-9', 'Airbus A320', 'Airbus A321', 'Airbus A321neo', 'Embraer E175', 'Embraer E190']
    
    # Common flight routes with realistic pricing
    common_routes = {
        ('JFK', 'LAX'): {'base_price': 350, 'duration_range': (5, 6), 'freq': 8},
        ('JFK', 'SFO'): {'base_price': 380, 'duration_range': (6, 7), 'freq': 6},
        ('JFK', 'MIA'): {'base_price': 220, 'duration_range': (3, 4), 'freq': 12},
        ('JFK', 'ORD'): {'base_price': 180, 'duration_range': (2, 3), 'freq': 15},
        ('LAX', 'ORD'): {'base_price': 280, 'duration_range': (4, 5), 'freq': 10},
        ('LAX', 'DFW'): {'base_price': 250, 'duration_range': (3, 4), 'freq': 12},
        ('ORD', 'DFW'): {'base_price': 160, 'duration_range': (2, 3), 'freq': 18},
        ('ATL', 'LAX'): {'base_price': 320, 'duration_range': (4, 5), 'freq': 8},
        ('ATL', 'SFO'): {'base_price': 350, 'duration_range': (5, 6), 'freq': 6},
        ('MIA', 'LAX'): {'base_price': 300, 'duration_range': (5, 6), 'freq': 6},
        ('SEA', 'JFK'): {'base_price': 400, 'duration_range': (5, 6), 'freq': 4},
        ('DEN', 'JFK'): {'base_price': 280, 'duration_range': (3, 4), 'freq': 10},
        ('BOS', 'LAX'): {'base_price': 380, 'duration_range': (6, 7), 'freq': 4},
        ('LAS', 'JFK'): {'base_price': 320, 'duration_range': (4, 5), 'freq': 6},
        ('PHX', 'JFK'): {'base_price': 300, 'duration_range': (4, 5), 'freq': 8}
    }
    
    flights = []
    flight_id_counter = 1000
    
    # Generate flights for common routes
    for (origin_code, dest_code), route_info in common_routes.items():
        origin_airport = next(a for a in airports if a['code'] == origin_code)
        dest_airport = next(a for a in airports if a['code'] == dest_code)
        
        # Generate multiple flights per route based on frequency
        for flight_num in range(route_info['freq']):
            # Generate departure time between 6 AM and 10 PM
            departure_hour = random.randint(6, 22)
            departure_minute = random.choice([0, 15, 30, 45])
            
            # Flight duration based on route
            duration_hours = random.randint(*route_info['duration_range'])
            duration_minutes = random.randint(0, 59)
            
            # Calculate arrival time
            departure_time = datetime.now().replace(hour=departure_hour, minute=departure_minute, second=0, microsecond=0)
            arrival_time = departure_time + timedelta(hours=duration_hours, minutes=duration_minutes)
            
            # Price variation based on time and demand
            base_price = route_info['base_price']
            time_multiplier = 1.0
            if departure_hour in [6, 7, 8, 19, 20, 21]:  # Peak hours
                time_multiplier = 1.2
            elif departure_hour in [10, 11, 14, 15]:  # Off-peak hours
                time_multiplier = 0.9
            
            # Random price variation
            price_variation = random.uniform(0.8, 1.3)
            final_price = int(base_price * time_multiplier * price_variation)
            
            # Stops (mostly nonstop for major routes, some with stops)
            stops = 0 if random.random() > 0.2 else 1
            
            # Available seats
            available_seats = random.randint(5, 50)
            
            flight = {
                'id': f'AA{flight_id_counter}',
                'airline': random.choice(airlines),
                'departure_airport': origin_airport,
                'arrival_airport': dest_airport,
                'departure_time': departure_time.strftime('%H:%M'),
                'arrival_time': arrival_time.strftime('%H:%M'),
                'duration': f'{duration_hours}h {duration_minutes}m',
                'aircraft': random.choice(aircraft_types),
                'price': final_price,
                'stops': stops,
                'available_seats': available_seats,
                'route_type': 'major'
            }
            flights.append(flight)
            flight_id_counter += 1
    
    # Generate additional random flights for variety
    for i in range(100):
        origin_airport = random.choice(airports)
        dest_airport = random.choice([a for a in airports if a['code'] != origin_airport['code']])
        
        # Skip if this route already exists
        route_key = (origin_airport['code'], dest_airport['code'])
        if route_key in common_routes:
            continue
        
        # Generate departure time
        departure_hour = random.randint(6, 22)
        departure_minute = random.choice([0, 15, 30, 45])
        departure_time = datetime.now().replace(hour=departure_hour, minute=departure_minute, second=0, microsecond=0)
        
        # Flight duration based on distance (estimate)
        # Calculate rough distance for pricing
        duration_hours = random.randint(1, 6)
        duration_minutes = random.randint(0, 59)
        arrival_time = departure_time + timedelta(hours=duration_hours, minutes=duration_minutes)
        
        # Price based on duration and random factors
        base_price = 150 + (duration_hours * 50) + random.randint(-30, 50)
        final_price = max(120, base_price)  # Minimum price of $120
        
        # Stops (more likely for longer flights)
        stops = 0 if duration_hours <= 3 or random.random() > 0.3 else 1
        
        # Available seats
        available_seats = random.randint(5, 50)
        
        flight = {
            'id': f'AA{flight_id_counter}',
            'airline': random.choice(airlines),
            'departure_airport': origin_airport,
            'arrival_airport': dest_airport,
            'departure_time': departure_time.strftime('%H:%M'),
            'arrival_time': arrival_time.strftime('%H:%M'),
            'duration': f'{duration_hours}h {duration_minutes}m',
            'aircraft': random.choice(aircraft_types),
            'price': final_price,
            'stops': stops,
            'available_seats': available_seats,
            'route_type': 'regional'
        }
        flights.append(flight)
        flight_id_counter += 1
    
    return flights

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search')
def search():
    return render_template('search.html')

@app.route('/signin', methods=['GET', 'POST'])
def signin():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if email in MOCK_USERS and MOCK_USERS[email]['password'] == password:
            session['user_email'] = email
            session['user_name'] = MOCK_USERS[email]['name']
            return redirect(url_for('client_area'))
        else:
            return render_template('signin.html', error='Invalid email or password')
    
    return render_template('signin.html')

@app.route('/signout')
def signout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/client-area')
def client_area():
    if 'user_email' not in session:
        return redirect(url_for('signin'))
    
    user = MOCK_USERS[session['user_email']]
    bookings = generate_mock_bookings(session['user_email'])
    
    return render_template('client_area.html', user=user, bookings=bookings)

@app.route('/api/flights')
def get_flights():
    origin = request.args.get('origin', '')
    destination = request.args.get('destination', '')
    date = request.args.get('date', '')
    min_price = request.args.get('min_price', '')
    max_price = request.args.get('max_price', '')
    stops = request.args.get('stops', '')
    airline = request.args.get('airline', '')
    departure_time = request.args.get('departure_time', '')
    sort_by = request.args.get('sort_by', 'price')
    limit = request.args.get('limit', '50')
    
    all_flights = generate_mock_flights()
    
    # Filter flights based on search criteria
    filtered_flights = all_flights.copy()
    
    # Origin and destination filter
    if origin and destination:
        filtered_flights = [
            f for f in filtered_flights 
            if (f['departure_airport']['code'] == origin.upper() and 
                f['arrival_airport']['code'] == destination.upper())
        ]
    elif origin:
        filtered_flights = [
            f for f in filtered_flights 
            if f['departure_airport']['code'] == origin.upper()
        ]
    elif destination:
        filtered_flights = [
            f for f in filtered_flights 
            if f['arrival_airport']['code'] == destination.upper()
        ]
    
    # Price filter
    if min_price:
        try:
            min_price_val = float(min_price)
            filtered_flights = [f for f in filtered_flights if f['price'] >= min_price_val]
        except ValueError:
            pass
    
    if max_price:
        try:
            max_price_val = float(max_price)
            filtered_flights = [f for f in filtered_flights if f['price'] <= max_price_val]
        except ValueError:
            pass
    
    # Stops filter
    if stops:
        try:
            stops_val = int(stops)
            filtered_flights = [f for f in filtered_flights if f['stops'] == stops_val]
        except ValueError:
            pass
    
    # Airline filter
    if airline:
        filtered_flights = [f for f in filtered_flights if airline.lower() in f['airline'].lower()]
    
    # Departure time filter
    if departure_time:
        if departure_time == 'morning':
            filtered_flights = [f for f in filtered_flights if 6 <= int(f['departure_time'].split(':')[0]) < 12]
        elif departure_time == 'afternoon':
            filtered_flights = [f for f in filtered_flights if 12 <= int(f['departure_time'].split(':')[0]) < 18]
        elif departure_time == 'evening':
            filtered_flights = [f for f in filtered_flights if 18 <= int(f['departure_time'].split(':')[0]) <= 22]
    
    # Sort flights
    if sort_by == 'price':
        filtered_flights.sort(key=lambda x: x['price'])
    elif sort_by == 'duration':
        filtered_flights.sort(key=lambda x: int(x['duration'].split('h')[0]))
    elif sort_by == 'departure':
        filtered_flights.sort(key=lambda x: x['departure_time'])
    elif sort_by == 'arrival':
        filtered_flights.sort(key=lambda x: x['arrival_time'])
    elif sort_by == 'stops':
        filtered_flights.sort(key=lambda x: x['stops'])
    
    # Limit results
    try:
        limit_val = int(limit)
        filtered_flights = filtered_flights[:limit_val]
    except ValueError:
        filtered_flights = filtered_flights[:50]
    
    return jsonify(filtered_flights)

@app.route('/api/airports')
def get_airports():
    airports = [
        {'code': 'JFK', 'name': 'New York (JFK)', 'city': 'New York'},
        {'code': 'LAX', 'name': 'Los Angeles (LAX)', 'city': 'Los Angeles'},
        {'code': 'ORD', 'name': 'Chicago (ORD)', 'city': 'Chicago'},
        {'code': 'DFW', 'name': 'Dallas (DFW)', 'city': 'Dallas'},
        {'code': 'ATL', 'name': 'Atlanta (ATL)', 'city': 'Atlanta'},
        {'code': 'MIA', 'name': 'Miami (MIA)', 'city': 'Miami'},
        {'code': 'SEA', 'name': 'Seattle (SEA)', 'city': 'Seattle'},
        {'code': 'DEN', 'name': 'Denver (DEN)', 'city': 'Denver'},
        {'code': 'SFO', 'name': 'San Francisco (SFO)', 'city': 'San Francisco'},
        {'code': 'BOS', 'name': 'Boston (BOS)', 'city': 'Boston'},
        {'code': 'LAS', 'name': 'Las Vegas (LAS)', 'city': 'Las Vegas'},
        {'code': 'PHX', 'name': 'Phoenix (PHX)', 'city': 'Phoenix'},
        {'code': 'IAH', 'name': 'Houston (IAH)', 'city': 'Houston'},
        {'code': 'CLT', 'name': 'Charlotte (CLT)', 'city': 'Charlotte'},
        {'code': 'MCO', 'name': 'Orlando (MCO)', 'city': 'Orlando'},
        {'code': 'DTW', 'name': 'Detroit (DTW)', 'city': 'Detroit'},
        {'code': 'FLL', 'name': 'Fort Lauderdale (FLL)', 'city': 'Fort Lauderdale'},
        {'code': 'BWI', 'name': 'Baltimore (BWI)', 'city': 'Baltimore'},
        {'code': 'IAD', 'name': 'Washington (IAD)', 'city': 'Washington'},
        {'code': 'PHL', 'name': 'Philadelphia (PHL)', 'city': 'Philadelphia'}
    ]
    return jsonify(airports)

@app.route('/api/popular-routes')
def get_popular_routes():
    """Get popular flight routes with sample pricing"""
    popular_routes = [
        {
            'origin': {'code': 'JFK', 'name': 'New York (JFK)', 'city': 'New York'},
            'destination': {'code': 'LAX', 'name': 'Los Angeles (LAX)', 'city': 'Los Angeles'},
            'avg_price': 350,
            'frequency': '8 daily flights',
            'best_time': 'Morning flights',
            'popularity': 'Very High'
        },
        {
            'origin': {'code': 'JFK', 'name': 'New York (JFK)', 'city': 'New York'},
            'destination': {'code': 'MIA', 'name': 'Miami (MIA)', 'city': 'Miami'},
            'avg_price': 220,
            'frequency': '12 daily flights',
            'best_time': 'Afternoon flights',
            'popularity': 'High'
        },
        {
            'origin': {'code': 'LAX', 'name': 'Los Angeles (LAX)', 'city': 'Los Angeles'},
            'destination': {'code': 'ORD', 'name': 'Chicago (ORD)', 'city': 'Chicago'},
            'avg_price': 280,
            'frequency': '10 daily flights',
            'best_time': 'Evening flights',
            'popularity': 'High'
        },
        {
            'origin': {'code': 'ORD', 'name': 'Chicago (ORD)', 'city': 'Chicago'},
            'destination': {'code': 'DFW', 'name': 'Dallas (DFW)', 'city': 'Dallas'},
            'avg_price': 160,
            'frequency': '18 daily flights',
            'best_time': 'All day',
            'popularity': 'Very High'
        },
        {
            'origin': {'code': 'ATL', 'name': 'Atlanta (ATL)', 'city': 'Atlanta'},
            'destination': {'code': 'LAX', 'name': 'Los Angeles (LAX)', 'city': 'Los Angeles'},
            'avg_price': 320,
            'frequency': '8 daily flights',
            'best_time': 'Morning flights',
            'popularity': 'High'
        },
        {
            'origin': {'code': 'SEA', 'name': 'Seattle (SEA)', 'city': 'Seattle'},
            'destination': {'code': 'JFK', 'name': 'New York (JFK)', 'city': 'New York'},
            'avg_price': 400,
            'frequency': '4 daily flights',
            'best_time': 'Red-eye flights',
            'popularity': 'Medium'
        }
    ]
    return jsonify(popular_routes)

@app.route('/api/flight-suggestions')
def get_flight_suggestions():
    """Get flight suggestions based on current search trends"""
    suggestions = [
        {
            'type': 'trending',
            'title': 'Popular This Week',
            'routes': [
                {'from': 'JFK', 'to': 'LAX', 'price': 'From $299', 'trend': '↗️'},
                {'from': 'ORD', 'to': 'MIA', 'price': 'From $179', 'trend': '↗️'},
                {'from': 'ATL', 'to': 'SFO', 'price': 'From $349', 'trend': '↘️'}
            ]
        },
        {
            'type': 'deals',
            'title': 'Special Offers',
            'routes': [
                {'from': 'BOS', 'to': 'LAS', 'price': 'From $199', 'deal': '20% off'},
                {'from': 'PHX', 'to': 'DEN', 'price': 'From $129', 'deal': 'Limited time'},
                {'from': 'CLT', 'to': 'MCO', 'price': 'From $89', 'deal': 'Weekend special'}
            ]
        },
        {
            'type': 'seasonal',
            'title': 'Seasonal Favorites',
            'routes': [
                {'from': 'JFK', 'to': 'MIA', 'price': 'From $189', 'season': 'Winter'},
                {'from': 'LAX', 'to': 'SEA', 'price': 'From $159', 'season': 'Summer'},
                {'from': 'ORD', 'to': 'PHX', 'price': 'From $149', 'season': 'Spring'}
            ]
        }
    ]
    return jsonify(suggestions)

@app.route('/booking/<flight_id>')
def booking(flight_id):
    return render_template('booking.html', flight_id=flight_id)

@app.route('/images')
def images():
    return render_template('images.html')

@app.route('/tables')
def tables():
    return render_template('tables.html')

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5001)