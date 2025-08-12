# Razorpay Integration Setup Guide

## Overview
This guide will help you set up Razorpay payment gateway integration for the QuickCourt sports facility booking platform.

## Prerequisites
- Razorpay account (sign up at https://razorpay.com)
- Node.js and npm installed
- QuickCourt backend and frontend setup

## Step 1: Create Razorpay Account
1. Go to https://razorpay.com and sign up for an account
2. Complete the KYC process
3. Navigate to Settings > API Keys in your Razorpay dashboard

## Step 2: Get API Keys
1. In your Razorpay dashboard, go to Settings > API Keys
2. Generate a new key pair
3. Copy the Key ID and Key Secret

## Step 3: Configure Environment Variables

### Backend Configuration
Update your `backend/.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend Configuration
Create a `.env` file in the frontend directory:

```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
```

## Step 4: Update Payment Page
In `frontend/src/pages/user/PaymentPage.jsx`, update the key:

```javascript
const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use environment variable
  // ... rest of the options
}
```

## Step 5: Test the Integration

### Test Mode
- Use test mode keys for development
- Test with these card numbers:
  - Success: 4111 1111 1111 1111
  - Failure: 4000 0000 0000 0002

### Production Mode
- Switch to live keys when going to production
- Update the key IDs in your environment variables

## Step 6: Webhook Setup (Optional)
For production, set up webhooks to handle payment status updates:

1. In Razorpay dashboard, go to Settings > Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`

## Payment Flow
1. User selects court and time slot
2. User clicks "Confirm Booking"
3. Backend creates Razorpay order
4. Frontend opens Razorpay payment modal
5. User completes payment
6. Payment is verified and booking is confirmed

## Features Implemented
- ✅ Razorpay order creation
- ✅ Payment modal integration
- ✅ Payment verification
- ✅ Booking confirmation
- ✅ Error handling
- ✅ Payment status tracking

## Troubleshooting

### Common Issues
1. **Payment not processing**: Check if Razorpay script is loaded
2. **Invalid signature**: Verify key secret is correct
3. **Order not found**: Check if order creation was successful

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify API keys are correct
3. Check backend logs for payment errors
4. Ensure Razorpay script is loaded before payment initialization

## Security Notes
- Never expose your Razorpay secret key in frontend code
- Always verify payment signatures on the backend
- Use HTTPS in production
- Implement proper error handling

## Support
- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
- QuickCourt Issues: Create an issue in the repository


