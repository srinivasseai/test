# Grafana Mirror Setup

A complete Grafana-like dashboard application with persistent API key management.

## 🚀 Quick Start

### Frontend Setup
```sh
npm install
npm run dev
```

### Backend Setup
```sh
cd server
npm install
npm run dev
```

## 🔑 API Key Management

### Problem Solved
API keys are now **persistent** and survive application restarts! They are stored in `server/data/api-keys.json`.

### Testing API Keys

**Option 1: PowerShell (Recommended for Windows)**
```powershell
.\test-api-key.ps1
```

**Option 2: Node.js**
```sh
node test-api-key.js
```

**Option 3: Manual curl**
```sh
# Create API key
curl -X POST http://localhost:3001/api/auth/keys \
  -H "Content-Type: application/json" \
  -d '{"name":"My API Key","role":"Admin"}'

# Test API key (replace YOUR_API_KEY with actual key)
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:3001/api/auth/keys
```

### API Key Features
- ✅ **Persistent storage** - Keys survive server restarts
- ✅ **Expiration support** - Optional TTL for keys
- ✅ **Role-based access** - Admin, Editor, Viewer roles
- ✅ **Usage tracking** - Last used timestamps
- ✅ **Manual deletion** - Delete keys when needed

## 📚 API Documentation

See [API_KEYS_GUIDE.md](API_KEYS_GUIDE.md) for complete API documentation.

## 🛠 Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Backend**: Node.js, Express, TypeScript
- **Storage**: JSON file-based persistence
- **Authentication**: Bearer token API keys

## 📁 Project Structure

```
├── src/                 # Frontend React application
├── server/              # Backend Express server
│   ├── src/
│   │   ├── api/         # API routes
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Auth middleware
│   │   └── types/       # TypeScript types
│   └── data/            # Persistent storage (auto-created)
│       └── api-keys.json # API keys storage
├── test-api-key.ps1     # PowerShell test script
├── test-api-key.js      # Node.js test script
└── test-api-key.bat     # Windows batch test script
```

## 🔧 Configuration

### Environment Variables
Create `server/.env`:
```env
PORT=3001
NODE_ENV=development
```

### Data Directory
API keys are automatically stored in `server/data/api-keys.json`. This directory is created automatically on first run.

## 🚨 Security Notes

- API keys are stored in plain text in JSON file
- For production, consider using a proper database with encryption
- Keep your `data/` directory secure and backed up
- API keys start with `gm_` prefix for easy identification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with the provided scripts
5. Submit a pull request
