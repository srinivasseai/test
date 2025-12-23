@echo off
echo 🧪 API Key Testing Tool (Windows)
echo.

set BASE_URL=http://localhost:3001

echo 1️⃣ Creating a new API key...
curl -X POST %BASE_URL%/api/auth/keys ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test API Key\",\"role\":\"Admin\"}" ^
  -o api_key_response.json

if %errorlevel% neq 0 (
    echo ❌ Failed to create API key. Make sure server is running on port 3001
    pause
    exit /b 1
)

echo ✅ API Key created! Check api_key_response.json for details
echo.

echo 2️⃣ Testing health endpoint...
curl -s %BASE_URL%/api/health
echo.
echo.

echo 3️⃣ To test your API key manually:
echo.
echo First, get your API key from api_key_response.json
echo Then run:
echo curl -H "Authorization: Bearer YOUR_API_KEY_HERE" %BASE_URL%/api/auth/keys
echo.

echo 💡 Your API key is now saved permanently and will survive server restarts!
echo.
pause