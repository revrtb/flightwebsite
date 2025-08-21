#!/usr/bin/env python

from app import generate_mock_flights

def test_flight_generation():
    print("Testing enhanced mock flight generation...")
    
    flights = generate_mock_flights()
    print("Generated {} flights".format(len(flights)))
    
    print("\nSample flights:")
    for i, flight in enumerate(flights[:5]):
        print("{}. {}: {} → {}".format(
            i+1, 
            flight['id'], 
            flight['departure_airport']['code'], 
            flight['arrival_airport']['code']
        ))
        print("   Price: ${} | Duration: {}".format(flight['price'], flight['duration']))
        print("   Airline: {} | Stops: {}".format(flight['airline'], flight['stops']))
        print("   Route Type: {} | Seats: {}".format(flight['route_type'], flight['available_seats']))
        print()
    
    # Check route distribution
    major_routes = [f for f in flights if f['route_type'] == 'major']
    regional_routes = [f for f in flights if f['route_type'] == 'regional']
    
    print("Route distribution:")
    print("  Major routes: {}".format(len(major_routes)))
    print("  Regional routes: {}".format(len(regional_routes)))
    
    # Check price range
    prices = [f['price'] for f in flights]
    print("Price range: ${} - ${}".format(min(prices), max(prices)))
    
    # Check unique routes
    unique_routes = set()
    for f in flights:
        route = (f['departure_airport']['code'], f['arrival_airport']['code'])
        unique_routes.add(route)
    
    print("Unique routes: {}".format(len(unique_routes)))

if __name__ == "__main__":
    test_flight_generation()
