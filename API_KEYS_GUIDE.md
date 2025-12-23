# Grafana Mirror API Documentation

## API Key Management

Your Grafana Mirror application now supports API keys for programmatic access, similar to Grafana's API key system.

### Authentication

All API requests (except API key creation) require authentication using an API key in the Authorization header:

```
Authorization: Bearer gm_your_api_key_here
```

### API Key Endpoints

#### Create API Key
```http
POST /api/auth/keys
Content-Type: application/json

{
  "name": "My Dashboard API",
  "role": "Editor",
  "secondsToLive": 86400
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Dashboard API",
  "key": "gm_64_character_api_key",
  "role": "Editor",
  "created": "2024-01-01T00:00:00.000Z",
  "expires": "2024-01-02T00:00:00.000Z"
}
```

#### List API Keys
```http
GET /api/auth/keys
```

#### Delete API Key
```http
DELETE /api/auth/keys/{id}
```

### Dashboard API Endpoints

#### List Dashboards
```http
GET /api/dashboards
Authorization: Bearer gm_your_api_key
```

#### Get Dashboard by UID
```http
GET /api/dashboards/uid/{uid}
Authorization: Bearer gm_your_api_key
```

#### Create/Update Dashboard
```http
POST /api/dashboards/db
Authorization: Bearer gm_your_api_key
Content-Type: application/json

{
  "dashboard": {
    "title": "My Dashboard",
    "panels": [...],
    "time": {...},
    "templating": {...}
  },
  "folderId": 0,
  "overwrite": false
}
```

#### Delete Dashboard
```http
DELETE /api/dashboards/uid/{uid}
Authorization: Bearer gm_your_api_key
```

#### Search Dashboards
```http
GET /api/dashboards/search?query=test&limit=10
Authorization: Bearer gm_your_api_key
```

### Roles

- **Admin**: Full access to all operations
- **Editor**: Can create, update, and delete dashboards
- **Viewer**: Read-only access to dashboards

### Example Node.js Integration

```javascript
const axios = require('axios');

const API_KEY = 'gm_your_api_key_here';
const BASE_URL = 'http://localhost:3001';

// Create a dashboard
async function createDashboard() {
  const dashboard = {
    title: 'Automated Dashboard',
    panels: [
      {
        id: 1,
        title: 'Sample Panel',
        type: 'stat',
        targets: [
          {
            datasource: 'your-datasource',
            rawSql: 'SELECT COUNT(*) FROM users'
          }
        ]
      }
    ]
  };

  try {
    const response = await axios.post(`${BASE_URL}/api/dashboards/db`, {
      dashboard,
      folderId: 0
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Dashboard created:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// List all dashboards
async function listDashboards() {
  try {
    const response = await axios.get(`${BASE_URL}/api/dashboards`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    console.log('Dashboards:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

### Getting Started

1. Start your server: `npm run dev`
2. Create an API key: `POST /api/auth/keys`
3. Use the returned API key in your Node.js application
4. Create dashboards programmatically using the dashboard API

Your application now has the same API key functionality as Grafana!