# Cobia - Crypto Analysis & Alert Service

![Cobia Logo](https://via.placeholder.com/150x50?text=Cobia)

Cobia is an advanced cryptocurrency analysis and alert service that tracks whale wallets and predicts profit opportunities using AI. The platform provides real-time monitoring, detailed analytics, and automated alerts for cryptocurrency traders and investors.

## Features

### User Management
- Secure user authentication with JWT tokens
- User registration and login
- Profile management
- Subscription tier system (Free, Pro, Whale)

### Wallet Management
- Add and track multiple cryptocurrency wallets
- Real-time balance monitoring
- Transaction history tracking
- Wallet categorization and organization

### Payment Integration
- Toss Payments integration for KRW payments
- Bitcoin payment support
- Subscription management
- Payment history tracking

### AI-Powered Analytics
- Whale wallet tracking
- Profit prediction using AI models
- Automated report generation
- Market trend analysis

### Admin Features
- User management dashboard
- Payment history monitoring
- Subscription management
- System analytics

## Tech Stack

- **Backend Framework**: Django 4.2
- **API Framework**: Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: SimpleJWT
- **API Documentation**: Swagger/OpenAPI
- **Payment Processing**: Toss Payments API
- **Cryptocurrency**: Bitcoin integration

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cobia.git
cd cobia
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create a superuser:
```bash
python manage.py createsuperuser
```

7. Start the development server:
```bash
python manage.py runserver
```

## API Documentation

The API documentation is available through Swagger UI at:
```
http://localhost:8000/api/docs/
```

Key API endpoints:
- Authentication: `/api/auth/`
- Wallets: `/api/wallets/`
- Reports: `/api/reports/`
- Payments: `/api/payments/`
- Subscriptions: `/api/subscriptions/`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

- **Your Name** - [GitHub Profile](https://github.com/yourusername)
- Email: your.email@example.com

## Acknowledgments

- Thanks to all contributors who have helped with the project
- Special thanks to the open-source community for their valuable tools and libraries