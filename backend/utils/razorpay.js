import Razorpay from 'razorpay';

// Initialize Razorpay only if credentials are available
let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.log('⚠️  Razorpay credentials not found. Payment features will be disabled.');
}

// Create order
export const createOrder = async (amount, currency = 'INR', receipt = null, notes = {}) => {
  if (!razorpay) {
    throw new Error('Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment variables.');
  }
  
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to smallest currency unit (paise for INR)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(`Order creation failed: ${error.message}`);
  }
};

// Verify payment signature
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const text = `${orderId}|${paymentId}`;
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    throw new Error(`Payment signature verification failed: ${error.message}`);
  }
};

// Fetch payment details
export const fetchPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    throw new Error(`Payment fetch failed: ${error.message}`);
  }
};

// Create refund
export const createRefund = async (paymentId, amount = null, notes = {}) => {
  try {
    const refundData = {
      payment_id: paymentId,
      notes,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to smallest currency unit
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);
    return refund;
  } catch (error) {
    throw new Error(`Refund creation failed: ${error.message}`);
  }
};

// Fetch refund details
export const fetchRefund = async (refundId) => {
  try {
    const refund = await razorpay.payments.fetchRefund(refundId);
    return refund;
  } catch (error) {
    throw new Error(`Refund fetch failed: ${error.message}`);
  }
};

// Create customer
export const createCustomer = async (name, email, contact) => {
  try {
    const customer = await razorpay.customers.create({
      name,
      email,
      contact,
    });
    return customer;
  } catch (error) {
    throw new Error(`Customer creation failed: ${error.message}`);
  }
};

// Fetch customer details
export const fetchCustomer = async (customerId) => {
  try {
    const customer = await razorpay.customers.fetch(customerId);
    return customer;
  } catch (error) {
    throw new Error(`Customer fetch failed: ${error.message}`);
  }
};

// Create subscription (for recurring bookings)
export const createSubscription = async (planId, customerId, startAt = null, notes = {}) => {
  try {
    const subscriptionData = {
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // Default to 12 months
      notes,
    };

    if (startAt) {
      subscriptionData.start_at = startAt;
    }

    const subscription = await razorpay.subscriptions.create(subscriptionData);
    return subscription;
  } catch (error) {
    throw new Error(`Subscription creation failed: ${error.message}`);
  }
};

// Fetch subscription details
export const fetchSubscription = async (subscriptionId) => {
  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    return subscription;
  } catch (error) {
    throw new Error(`Subscription fetch failed: ${error.message}`);
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId, cancelAtCycleEnd = false) => {
  try {
    const subscription = await razorpay.subscriptions.cancel(subscriptionId, {
      cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0,
    });
    return subscription;
  } catch (error) {
    throw new Error(`Subscription cancellation failed: ${error.message}`);
  }
};

export default razorpay;

