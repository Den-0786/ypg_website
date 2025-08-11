@echo off
echo 🚀 Setting up Django Backend for YPG Website...

cd backend

echo.
echo 1️⃣ Creating database migrations...
python manage.py makemigrations
if errorlevel 1 goto error

echo.
echo 2️⃣ Applying database migrations...
python manage.py migrate
if errorlevel 1 goto error

echo.
echo 3️⃣ Creating supervisor user...
python manage.py setup_supervisor --username supervisor --password admin123
if errorlevel 1 goto error

echo.
echo ✅ Django Backend Setup Complete!
echo.
echo 🔐 Login Credentials:
echo    Username: supervisor
echo    Password: admin123
echo.
echo 🚀 To start Django server:
echo    cd ypg_website/backend
echo    python manage.py runserver 8000
echo.
echo 🌐 Django will be available at: http://localhost:8000
echo 📱 Next.js frontend at: http://localhost:3002
goto end

:error
echo ❌ Setup failed. Please check the error messages above.
pause

:end
pause



