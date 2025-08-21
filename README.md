# American Airlines Website

A modern, responsive airline website built with Flask, featuring flight search, booking, and mock data similar to the real American Airlines website.

## Features

### 🏠 Homepage
- **Hero Section**: Eye-catching design with flight search form
- **Flight Search**: Comprehensive search form with origin/destination, dates, passengers
- **Popular Destinations**: Visual showcase of popular travel destinations
- **Responsive Design**: Mobile-first approach with Bootstrap 5

### 🔍 Flight Search
- **Real-time Results**: Dynamic flight search with mock data
- **Advanced Filtering**: Price range, stops, airlines, departure times
- **Sorting Options**: Sort by price, duration, or departure time
- **Interactive Cards**: Detailed flight information with booking buttons

### ✈️ Flight Booking
- **Multi-step Process**: Progress indicator for booking flow
- **Flight Summary**: Complete flight details display
- **Passenger Information**: Comprehensive passenger form with validation
- **Seat Selection**: Economy class options with pricing
- **Upgrades**: Priority boarding and checked baggage options
- **Payment Processing**: Credit card form with validation
- **Price Calculator**: Real-time price updates with add-ons

### 🔐 User Authentication
- **Sign In System**: Secure login with mock user credentials
- **Client Area**: Personalized dashboard for signed-in users
- **Booking History**: View past and upcoming flights
- **Profile Management**: User information and AAdvantage status
- **Session Management**: Secure user sessions with Flask

### 🎨 Design Features
- **Modern UI/UX**: Clean, professional airline website design
- **Bootstrap 5**: Latest Bootstrap framework for responsive design
- **Font Awesome Icons**: Professional iconography throughout
- **Smooth Animations**: CSS transitions and hover effects
- **Color Scheme**: American Airlines brand colors and styling

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **CSS Framework**: Bootstrap 5.3.0
- **Icons**: Font Awesome 6.0.0
- **Mock Data**: Python-generated flight and airport data

## Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd travel_website
```

### 2. Create Virtual Environment (Recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python app.py
```

### 5. Access the Website
Open your browser and navigate to: `http://127.0.0.1:5001`

## Project Structure

```
travel_website/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── templates/            # HTML templates
│   ├── index.html       # Homepage
│   ├── search.html      # Flight search results
│   ├── booking.html     # Flight booking page
│   ├── signin.html      # Sign-in page
│   └── client_area.html # User dashboard
└── static/              # Static assets
    ├── css/
    │   └── main.css     # Main stylesheet
    └── js/
        ├── main.js      # Homepage JavaScript
        ├── search.js    # Search results JavaScript
        └── booking.js   # Booking page JavaScript
```

## API Endpoints

### Flights API
- `GET /api/flights` - Get flight search results
  - Query parameters: `origin`, `destination`, `date`
  - Returns: JSON array of flight objects

### Airports API
- `GET /api/airports` - Get list of available airports
  - Returns: JSON array of airport objects

## Authentication Routes

### Sign In
- `GET /signin` - Display sign-in form
- `POST /signin` - Process sign-in credentials
- `GET /signout` - Sign out user and clear session
- `GET /client-area` - User dashboard (requires authentication)

## Mock User Data

**Demo Account Credentials:**
- **Email:** demo@example.com
- **Password:** demo123

The system generates realistic mock data including:
- User profile information
- AAdvantage loyalty program details
- Past flight bookings (3-5 flights)
- Upcoming flight bookings (1-2 flights)
- Confirmation numbers and seat assignments

## Mock Data

The application generates realistic mock data including:

- **50+ Flights**: Randomly generated with realistic routes and times
- **15 Airports**: Major US airports (JFK, LAX, ORD, DFW, etc.)
- **Realistic Pricing**: $150-$800 range with market-appropriate fares
- **Flight Details**: Duration, stops, aircraft types, airline information

## Key Features Implementation

### Flight Search Form
- Dynamic airport dropdowns
- Date validation and defaults
- Trip type handling (round-trip, one-way)
- Passenger count selection

### Search Results
- Real-time filtering and sorting
- Responsive flight cards
- Price and time formatting
- Direct booking integration

### Booking Process
- Multi-step progress indicator
- Form validation and error handling
- Real-time price calculations
- Auto-save functionality

## Customization

### Adding New Airports
Edit the `get_airports()` function in `app.py`:

```python
@app.route('/api/airports')
def get_airports():
    airports = [
        {'code': 'NEW', 'name': 'New Airport (NEW)', 'city': 'New City'},
        # Add more airports...
    ]
    return jsonify(airports)
```

### Modifying Flight Data
Update the `generate_mock_flights()` function in `app.py` to:
- Change price ranges
- Add new aircraft types
- Modify airline options
- Adjust flight duration ranges

### Styling Changes
Edit `static/css/main.css` to:
- Change color scheme
- Modify layout spacing
- Add custom animations
- Update typography

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Running in Development Mode
```bash
export FLASK_ENV=development
python app.py
```

### Debug Mode
The application runs with debug mode enabled by default for development.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and demonstration purposes. American Airlines branding and design elements are used for demonstration only.

## Future Enhancements

- User authentication and accounts
- Real payment processing integration
- Flight tracking and notifications
- Mobile app development
- Multi-language support
- Advanced seat mapping
- Baggage tracking
- Loyalty program integration

## Support

For questions or issues, please check the code comments or create an issue in the repository.

---

**Note**: This is a demonstration website with mock data. It does not process real bookings or payments.
