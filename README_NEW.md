# Brainwave - Full-Stack SaaS Application 🚀

A modern, AI-powered SaaS platform built with React, Node.js, Express, Prisma, PostgreSQL, and integrated with OpenAI, PayPal, and Supabase. This project transforms a beautiful landing page into a fully functional, production-ready SaaS application.

## 🌟 Features

### Frontend
- ✨ Beautiful, modern UI with smooth animations
- 📱 Fully responsive design
- 🎨 Built with React 18 + Vite
- 💅 Styled with Tailwind CSS
- 🔄 React Router for navigation
- 🎭 Parallax effects and scroll animations

### Backend & Database
- 🔐 **Authentication System**
  - Email/Password authentication
  - Google OAuth integration
  - JWT-based sessions
  - Secure password hashing with bcrypt

- 💳 **Subscription & Payments**
  - Multiple subscription tiers (Free, Basic, Premium, Enterprise)
  - PayPal payment integration
  - Subscription management
  - Payment history tracking

- 🤖 **AI Integration**
  - OpenAI GPT-4 integration
  - AI chat interface
  - Chat history
  - Usage limits based on subscription tier
  - DALL-E image generation (Premium feature)

- 📊 **Admin Dashboard**
  - User management
  - Contact form submissions
  - Waitlist management
  - Analytics and statistics
  - Content management system

- 📧 **Email System**
  - Resend email integration
  - Contact form notifications
  - Waitlist confirmation emails
  - Transactional emails

- 📈 **Analytics**
  - Event tracking
  - User behavior analytics
  - Custom metadata support

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.10
- **Styling:** Tailwind CSS 3.4.14
- **Routing:** React Router DOM 6.26.2
- **State Management:** React Context API
- **HTTP Client:** Axios 1.7.7
- **Animations:** react-just-parallax, scroll-lock

### Backend
- **Runtime:** Node.js
- **Framework:** Express 4.21.1
- **Database ORM:** Prisma 5.20.0
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Passport.js, JWT, bcryptjs
- **Payment:** PayPal SDK
- **AI:** OpenAI API 4.67.3
- **Email:** Resend 4.0.1
- **Validation:** Zod 3.23.8, express-validator

### Security & Performance
- Helmet.js for security headers
- Express rate limiting
- CORS configuration
- Compression middleware
- Cookie parser
- Session management

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or Supabase account)
- OpenAI API key
- PayPal developer account
- Resend API key

### Step 1: Clone the Repository
```bash
git clone https://github.com/Lakhyajit-96/brainwave.git
cd brainwave
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Setup
Copy `.env.example` to `.env` and fill in your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Resend Email Configuration
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@yourdomain.com

# Application Configuration
VITE_APP_URL=http://localhost:3000
VITE_APP_NAME=Brainwave
VITE_API_URL=http://localhost:5000

# Server Configuration
PORT=5000
NODE_ENV=development

# Database URL
DATABASE_URL=your_postgresql_connection_string

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Session Secret
SESSION_SECRET=your-super-secret-session-key
```

### Step 4: Database Setup
```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/edit data
npm run prisma:studio
```

### Step 5: Run the Application

#### Development Mode (Both servers)
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

#### Run Separately
```bash
# Frontend only
npm run dev:client

# Backend only
npm run dev:server
```

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

## 📁 Project Structure

```
brainwave/
├── prisma/
│   └── schema.prisma          # Database schema
├── server/
│   ├── config/
│   │   └── passport.js        # Passport authentication config
│   ├── middleware/
│   │   ├── auth.js           # Authentication middleware
│   │   ├── errorHandler.js   # Error handling
│   │   └── rateLimiter.js    # Rate limiting
│   ├── routes/
│   │   ├── admin.js          # Admin routes
│   │   ├── ai.js             # AI/OpenAI routes
│   │   ├── analytics.js      # Analytics routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── contact.js        # Contact form routes
│   │   ├── content.js        # Content management
│   │   ├── payment.js        # Payment/PayPal routes
│   │   ├── subscription.js   # Subscription management
│   │   ├── user.js           # User profile routes
│   │   └── waitlist.js       # Waitlist routes
│   └── index.js              # Express server entry
├── src/
│   ├── assets/               # Images, SVGs, icons
│   ├── components/           # React components
│   │   ├── Benefits.jsx
│   │   ├── Button.jsx
│   │   ├── Collaboration.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── Pricing.jsx
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx   # Authentication context
│   ├── lib/
│   │   ├── api.js            # API client & endpoints
│   │   └── supabase.js       # Supabase client
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── PricingPage.jsx
│   │   ├── Profile.jsx
│   │   └── Register.jsx
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles
├── .env                      # Environment variables
├── .env.example              # Environment template
├── .gitignore
├── package.json
├── vite.config.js            # Vite configuration
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify` - Verify JWT token

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `DELETE /api/user/account` - Delete account

### Subscription
- `GET /api/subscription/plans` - Get all plans
- `GET /api/subscription/current` - Get current subscription
- `POST /api/subscription/update` - Update subscription
- `POST /api/subscription/cancel` - Cancel subscription

### Payment
- `POST /api/payment/create-order` - Create PayPal order
- `POST /api/payment/capture-order` - Capture payment
- `GET /api/payment/history` - Get payment history

### AI
- `POST /api/ai/chat` - AI chat completion
- `GET /api/ai/history` - Get chat history
- `DELETE /api/ai/history/:id` - Delete chat
- `POST /api/ai/generate-image` - Generate image (Premium)

### Contact & Waitlist
- `POST /api/contact/submit` - Submit contact form
- `POST /api/waitlist/join` - Join waitlist
- `GET /api/waitlist/count` - Get waitlist count

### Admin (Requires ADMIN role)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/contacts` - Get contacts
- `PATCH /api/admin/contacts/:id` - Update contact status
- `GET /api/admin/waitlist` - Get waitlist
- `GET /api/admin/content` - Get all content
- `POST /api/admin/content` - Create content
- `PUT /api/admin/content/:id` - Update content
- `DELETE /api/admin/content/:id` - Delete content

## 🎯 Subscription Tiers

### Free Plan ($0/month)
- Basic AI features
- 10 AI requests per day
- Email support
- Access to community

### Basic Plan ($9.99/month)
- All Free features
- 100 AI requests per day
- Priority email support
- Advanced analytics
- Custom branding

### Premium Plan ($29.99/month) - POPULAR
- All Basic features
- Unlimited AI requests
- 24/7 priority support
- Advanced AI models
- API access
- Team collaboration

### Enterprise Plan ($99.99/month)
- All Premium features
- Dedicated account manager
- Custom AI training
- SLA guarantee
- Advanced security
- Unlimited storage

## 🚀 Deployment

### Vercel (Recommended for Frontend + Backend)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Render (Backend)
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

### Supabase (Database)
- Database is already hosted on Supabase
- Update `DATABASE_URL` in production environment

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- Input validation with Zod
- SQL injection protection via Prisma
- XSS protection
- CSRF protection

## 📊 Database Schema

The application uses Prisma ORM with the following main models:
- **User** - User accounts and profiles
- **Subscription** - User subscriptions
- **Payment** - Payment records
- **Contact** - Contact form submissions
- **AIChat** - AI conversation history
- **Analytics** - Event tracking
- **Waitlist** - Waitlist entries
- **Content** - Dynamic content management

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Lakhyajit**
- Email: lakhya911@gmail.com
- GitHub: [@Lakhyajit-96](https://github.com/Lakhyajit-96)

## 🙏 Acknowledgments

- Original landing page design inspiration from JavaScript Mastery
- OpenAI for AI capabilities
- Supabase for database hosting
- PayPal for payment processing
- Resend for email services

## 📞 Support

For support, email lakhya911@gmail.com or open an issue in the repository.

---

**Built with ❤️ by Lakhyajit**
