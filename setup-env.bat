@echo off
echo Creating .env file for QuickCourt backend...
echo.

cd backend

if exist .env (
    echo .env file already exists!
    echo Please check if it has the correct configuration.
) else (
    echo Creating new .env file...
    (
        echo NODE_ENV=development
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/quickcourt
        echo JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure_123456789
        echo JWT_EXPIRE=30d
        echo.
        echo # Cloudinary Configuration ^(optional for testing^)
        echo CLOUDINARY_CLOUD_NAME=quickcourt
        echo CLOUDINARY_API_KEY=123456789012345
        echo CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
        echo.
        echo # Stripe Configuration ^(optional for testing^)
        echo STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
        echo STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
        echo.
        echo # Email Configuration ^(optional for testing^)
        echo EMAIL_HOST=smtp.gmail.com
        echo EMAIL_PORT=587
        echo EMAIL_USER=your_email@gmail.com
        echo EMAIL_PASS=your_app_password
        echo.
        echo # Frontend URL
        echo FRONTEND_URL=http://localhost:5173
    ) > .env
    
    echo .env file created successfully!
    echo.
    echo IMPORTANT: For production, please update the following:
    echo - JWT_SECRET: Use a strong, unique secret key
    echo - CLOUDINARY_*: Add your actual Cloudinary credentials
    echo - STRIPE_*: Add your actual Stripe credentials
    echo - EMAIL_*: Add your actual email credentials
    echo.
)

cd ..
echo Setup complete!
pause



