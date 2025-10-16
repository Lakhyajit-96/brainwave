# Brainwave Setup Guide 🚀

This guide will walk you through setting up the Brainwave full-stack SaaS application from scratch.

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js v18+ installed
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] A code editor (VS Code recommended)
- [ ] A Supabase account (free tier works)
- [ ] An OpenAI API account
- [ ] A PayPal Developer account
- [ ] A Resend account for emails

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/Lakhyajit-96/brainwave.git
cd brainwave

# Install dependencies
npm install
```

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Go to Project Settings > API
4. Copy the following:
   - Project URL
   - `anon` public key
   - `service_role` secret key
5. Go to Project Settings > Database
6. Copy the connection string (Connection pooling > Transaction mode)
7. Replace `[YOUR-PASSWORD]` with your database password

### 3. OpenAI API Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy and save it securely (you won't see it again)

### 4. PayPal Developer Setup

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Log in with your PayPal account
3. Go to Dashboard > My Apps & Credentials
4. Under "Sandbox", create a new app
5. Copy the Client ID and Secret
6. For production, switch to "Live" and create a live app

### 5. Resend Email Setup

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Go to API Keys
4. Create a new API key
5. Copy the API key
6. Add and verify your domain (or use their test domain)

### 6. Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox

# Resend Email Configuration
RESEND_API_KEY=re_your_resend_key
RESEND_FROM_EMAIL=onboarding@yourdomain.com

# Application Configuration
VITE_APP_URL=http://localhost:3000
VITE_APP_NAME=Brainwave
VITE_API_URL=http://localhost:5000

# Server Configuration
PORT=5000
NODE_ENV=development

# Database URL (from Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-min-32-chars
```

**Security Note:** Generate strong random strings for JWT_SECRET and SESSION_SECRET. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 7. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:migrate

# (Optional) Seed initial data
# You can manually add data through Prisma Studio
npm run prisma:studio
```

### 8. Run the Application

#### Development Mode (Recommended)
```bash
# Runs both frontend and backend concurrently
npm run dev
```

This will start:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

#### Run Separately
```bash
# Terminal 1 - Frontend
npm run dev:client

# Terminal 2 - Backend
npm run dev:server
```

### 9. Create Admin User

To access the admin dashboard, you need to manually set a user's role to ADMIN:

1. Register a new account through the app
2. Open Prisma Studio: `npm run prisma:studio`
3. Go to the `User` table
4. Find your user and change `role` from `USER` to `ADMIN`
5. Save changes
6. Refresh your app and navigate to `/admin`

### 10. Test the Features

#### Test Authentication
1. Go to http://localhost:3000/register
2. Create a new account
3. Log in with your credentials
4. Try Google OAuth (if configured)

#### Test AI Features
1. Log in to your account
2. Go to Dashboard
3. Try the AI chat interface
4. Check your OpenAI usage dashboard

#### Test Payments
1. Go to Pricing page
2. Select a paid plan
3. Use PayPal sandbox credentials:
   - Email: sb-buyer@personal.example.com
   - Password: (check PayPal sandbox accounts)

#### Test Admin Dashboard
1. Set your user role to ADMIN (see step 9)
2. Navigate to `/admin`
3. View statistics, users, contacts, etc.

## Common Issues & Solutions

### Issue: Prisma Client not found
```bash
npm run prisma:generate
```

### Issue: Database connection failed
- Check your DATABASE_URL is correct
- Ensure your Supabase project is active
- Verify the password in the connection string

### Issue: CORS errors
- Make sure VITE_APP_URL and VITE_API_URL are set correctly
- Check that the backend is running on port 5000

### Issue: OpenAI API errors
- Verify your API key is valid
- Check you have credits in your OpenAI account
- Ensure you're not hitting rate limits

### Issue: PayPal payment not working
- Make sure you're using sandbox mode in development
- Use PayPal sandbox test accounts
- Check your PayPal app credentials

### Issue: Emails not sending
- Verify your Resend API key
- Check the FROM email is verified in Resend
- Look at server logs for error messages

## Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add all environment variables
5. Change:
   - `VITE_APP_URL` to your Vercel domain
   - `VITE_API_URL` to your API domain
   - `NODE_ENV` to `production`
   - `PAYPAL_MODE` to `live` (when ready)
6. Deploy

### Render Deployment

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Create a new Web Service
4. Connect your repository
5. Add environment variables
6. Deploy

### Environment Variables for Production

Update these in production:
- `NODE_ENV=production`
- `VITE_APP_URL=https://yourdomain.com`
- `VITE_API_URL=https://api.yourdomain.com`
- `PAYPAL_MODE=live` (when ready for real payments)
- Use strong, unique secrets for JWT_SECRET and SESSION_SECRET

## Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth works
- [ ] Dashboard loads correctly
- [ ] AI chat responds
- [ ] Subscription plans display
- [ ] PayPal payment flow works
- [ ] Admin dashboard accessible (for admin users)
- [ ] Contact form sends emails
- [ ] Waitlist signup works
- [ ] Profile update works
- [ ] Logout works

## Next Steps

1. **Customize the landing page** - Update content, images, and branding
2. **Configure Google OAuth** - Add Google OAuth credentials
3. **Set up custom domain** - Point your domain to the deployment
4. **Add more AI features** - Extend AI capabilities
5. **Implement analytics** - Add Google Analytics or similar
6. **Set up monitoring** - Use Sentry or similar for error tracking
7. **Configure backups** - Set up database backups
8. **Add tests** - Write unit and integration tests
9. **Optimize performance** - Add caching, CDN, etc.
10. **Launch!** 🚀

## Support

If you encounter any issues:
1. Check the console for error messages
2. Review the server logs
3. Verify all environment variables are set
4. Check the GitHub issues
5. Email: lakhya911@gmail.com

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [PayPal Developer Docs](https://developer.paypal.com/docs)

---

**Happy Coding! 🎉**
