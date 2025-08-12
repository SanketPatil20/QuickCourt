import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // In development mode, just log the email content
  if (process.env.NODE_ENV === 'development') {
    console.log('\n=== EMAIL DEBUG (Development Mode) ===');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    
    // Extract OTP from HTML if it's an OTP email
    if (options.html && options.html.includes('otp-code')) {
      const otpMatch = options.html.match(/<div class="otp-code">(\d{6})<\/div>/);
      if (otpMatch) {
        console.log(`🔐 OTP: ${otpMatch[1]}`);
      }
    }
    
    console.log('=====================================\n');
    return { messageId: 'dev-mode-' + Date.now() };
  }

  // Production mode - send actual email
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define email options
    const mailOptions = {
      from: `QuickCourt <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    return info;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    // In production, we might want to use a fallback service
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  otpVerification: (name, otp) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .otp-box { background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">QuickCourt</div>
        </div>
        <h2>Email Verification</h2>
        <p>Hello ${name},</p>
        <p>Thank you for signing up with QuickCourt! Please use the following OTP to verify your email address:</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p>This OTP will expire in 10 minutes. If you didn't request this verification, please ignore this email.</p>
        <div class="footer">
          <p>Best regards,<br>The QuickCourt Team</p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  bookingConfirmation: (name, bookingDetails) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .booking-details { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">QuickCourt</div>
        </div>
        <h2>Booking Confirmation</h2>
        <p>Hello ${name},</p>
        <p>Your booking has been confirmed! Here are your booking details:</p>
        <div class="booking-details">
          <div class="detail-row">
            <span class="label">Booking ID:</span>
            <span>${bookingDetails.id}</span>
          </div>
          <div class="detail-row">
            <span class="label">Facility:</span>
            <span>${bookingDetails.facility}</span>
          </div>
          <div class="detail-row">
            <span class="label">Court:</span>
            <span>${bookingDetails.court}</span>
          </div>
          <div class="detail-row">
            <span class="label">Date:</span>
            <span>${bookingDetails.date}</span>
          </div>
          <div class="detail-row">
            <span class="label">Time:</span>
            <span>${bookingDetails.time}</span>
          </div>
          <div class="detail-row">
            <span class="label">Total Amount:</span>
            <span>₹${bookingDetails.amount}</span>
          </div>
        </div>
        <p>Please arrive 15 minutes before your scheduled time. Don't forget to bring a valid ID.</p>
        <div class="footer">
          <p>Best regards,<br>The QuickCourt Team</p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  bookingReminder: (name, bookingDetails) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .reminder-box { background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">QuickCourt</div>
        </div>
        <h2>Booking Reminder</h2>
        <p>Hello ${name},</p>
        <div class="reminder-box">
          <p><strong>Don't forget about your upcoming booking!</strong></p>
          <p>Facility: ${bookingDetails.facility}</p>
          <p>Date: ${bookingDetails.date}</p>
          <p>Time: ${bookingDetails.time}</p>
        </div>
        <p>Please arrive 15 minutes before your scheduled time.</p>
        <div class="footer">
          <p>Best regards,<br>The QuickCourt Team</p>
        </div>
      </div>
    </body>
    </html>
  `
};

export default sendEmail;
