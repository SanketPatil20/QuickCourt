import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
export const createPaymentIntent = async (amount, currency = 'inr', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit (paise for INR)
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(`Payment intent creation failed: ${error.message}`);
  }
};

// Confirm payment intent
export const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Payment confirmation failed: ${error.message}`);
  }
};

// Retrieve payment intent
export const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Payment retrieval failed: ${error.message}`);
  }
};

// Create refund
export const createRefund = async (paymentIntentId, amount = null, reason = 'requested_by_customer') => {
  try {
    const refundData = {
      payment_intent: paymentIntentId,
      reason,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to smallest currency unit
    }

    const refund = await stripe.refunds.create(refundData);
    return refund;
  } catch (error) {
    throw new Error(`Refund creation failed: ${error.message}`);
  }
};

// Create customer
export const createCustomer = async (email, name, phone) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
    });
    return customer;
  } catch (error) {
    throw new Error(`Customer creation failed: ${error.message}`);
  }
};

// Update customer
export const updateCustomer = async (customerId, updateData) => {
  try {
    const customer = await stripe.customers.update(customerId, updateData);
    return customer;
  } catch (error) {
    throw new Error(`Customer update failed: ${error.message}`);
  }
};

// Retrieve customer
export const retrieveCustomer = async (customerId) => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    throw new Error(`Customer retrieval failed: ${error.message}`);
  }
};

// List payment methods for customer
export const listPaymentMethods = async (customerId, type = 'card') => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type,
    });
    return paymentMethods;
  } catch (error) {
    throw new Error(`Payment methods retrieval failed: ${error.message}`);
  }
};

// Create setup intent for saving payment method
export const createSetupIntent = async (customerId) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });
    return setupIntent;
  } catch (error) {
    throw new Error(`Setup intent creation failed: ${error.message}`);
  }
};

// Webhook signature verification
export const verifyWebhookSignature = (payload, signature, endpointSecret) => {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    return event;
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};

export default stripe;



