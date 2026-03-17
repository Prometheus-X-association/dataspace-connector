# PDC Dashboard

A modern, responsive dashboard for Provider Data Connector (PDC) built with Vite, React, TypeScript, and Tailwind CSS. Features authentication, configuration management, and data exchange monitoring.

## 🚀 Quick Start

### Using Docker with Docker Compose (Recommended)

The dashboard is automatically included when running the dataspace-connector with Docker Compose:

```bash
# From the project root
docker-compose up -d

# Access the dashboard at: https://${DNS}/dashboard
# (or http://localhost:3000/dashboard for local development)
```

**Note**: The dashboard is served at the `/dashboard` path of your connector instance, not as a standalone service.

### Local Development (Dashboard Only)

To develop the dashboard independently:

```bash
# Navigate to the dashboard directory
cd dashboard

# Install dependencies
pnpm install

# Start development server
pnpm run dev
# Dashboard available at http://localhost:5173

# Build for production
pnpm run build
```

## ✨ Features

### 🔐 Authentication
- Secure login with secret and serviceKey
- JWT token management with localStorage
- Protected routes with automatic redirect
- Session persistence

### ⚙️ Configuration Management
- **View Configuration**: Get current configuration from API
- **Edit Configuration**: JSON editor with syntax highlighting
- **Validate**: JSON validation before saving
- **Reload**: Reload configuration from config.json file
- **Update**: Save changes via API endpoint

### 📊 Data Exchange Monitoring
- **List View**: Paginated list of all data exchanges (5 per page)
- **Pagination**: Navigate through exchanges easily
- **Details Modal**: Click any exchange to view full details
- **Download**: Export exchanges as JSON
- **Refresh**: Update data on demand
- **Real-time Status**: View connector status and exchange timestamps

## 📁 Project Structure

```
dashboard/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui base components
│   │   ├── ConnectorStatus.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/             # Page components
│   │   ├── Login.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ConfigurationTab.tsx
│   │   └── DataExchangesTab.tsx
│   ├── services/          # API service layer
│   │   └── api.ts
│   ├── types/             # TypeScript type definitions
│   ├── lib/               # Utility libraries (cn helper)
│   ├── App.tsx            # Main App with routing
│   └── main.tsx           # Application entry point
├── tests/                 # Test files
│   ├── api/              # API tests
│   └── ui/               # Component tests
├── Dockerfile             # Multi-stage Docker build
├── nginx.conf            # Nginx configuration for SPA
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies and scripts
```

## 🛠️ API Integration

The dashboard connects to the Provider Data Connector API using same-origin requests:

- `POST /login` - Authenticate with secret and serviceKey
- `GET /private/configuration` - Get current configuration
- `PUT /private/configuration` - Update configuration
- `POST /private/configuration/reload` - Reload from config.json
- `GET /dataexchanges/` - Get all data exchanges
- `GET /dataexchanges/{id}` - Get specific data exchange
- `GET /` - Health check endpoint

**Note**: The dashboard uses `window.location.origin` for API calls, meaning it automatically connects to the same server it's hosted on. No additional API URL configuration is needed when deployed via Docker Compose.

## 📜 Available Scripts

- `pnpm run dev` - Start development server (http://localhost:5173)
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint
- `pnpm run test` - Run tests with Vitest
- `pnpm run test:ui` - Run tests with UI
- `pnpm run test:coverage` - Generate test coverage report

## 🐳 Docker Deployment

### Production Deployment

The dashboard is included in the main docker-compose setup:

**docker-compose.yml** (Development/Local):
```yaml
services:
  dataspace-connector:
    # ... connector configuration
  
  pdc-dashboard:
    # ... dashboard configuration
  
  nginx-proxy:
    # Local proxy for development - exposes port 3000
    # Routes /dashboard to pdc-dashboard
    # Routes everything else to dataspace-connector
```

**docker-compose.prod.yml** (Production with Traefik):
- Uses Traefik for routing (no nginx-proxy needed)
- Dashboard served at `https://${DNS}/dashboard`

**Note**: 
- **Local Development**: Uses `nginx-proxy` to expose services at `http://localhost:3000`
  - Main API: `http://localhost:3000/`
  - Dashboard: `http://localhost:3000/dashboard`
- **Production**: Uses Traefik with proper SSL/TLS
  - Main API: `https://${DNS}/`
  - Dashboard: `https://${DNS}/dashboard`

### Docker Build Details

The dashboard uses a **multi-stage Docker build**:

1. **Build Stage**: Uses Node 20 Alpine to build the React app
2. **Production Stage**: Uses Nginx Alpine to serve static files
3. **Optimizations**: 
   - Gzip compression enabled
   - Static asset caching (1 day)
   - HTML no-cache for updates
   - SPA routing support (try_files)

### Environment Variables

The dashboard doesn't require environment variables in production as it uses same-origin API calls. For development, you can create a `.env.local` file:

```bash
# Optional - only needed for development against remote API
VITE_API_BASE_URL=https://your-remote-api.com
```

**Note**: This variable is ignored in the current implementation. Modify `src/services/api.ts` if you need to use it.

## 🎨 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Notifications**: Sonner (Toast notifications)
- **Icons**: Lucide React
- **Container**: Docker + Nginx Alpine
- **Testing**: Vitest + Testing Library

## 🔒 Security

- JWT token-based authentication
- Secure token storage in localStorage
- Automatic token refresh handling
- Protected routes with authentication checks
- API request/response interceptors
- 401 auto-redirect to login
- CORS handled by the connector

## 📝 Usage

### Login
1. Navigate to `/dashboard` or `/dashboard/login`
2. Enter your PDC credentials:
   - **Secret Key**: Your connector's secret key
   - **Service Key**: Your connector's service key
3. Click "Sign In"

### Configuration Management
1. Go to the **Configuration** tab
2. View current configuration as JSON
3. Edit the JSON directly in the textarea
4. Use **Reload from File** to sync with the server's config.json
5. Use **Update Configuration** to save your changes
6. JSON validation prevents invalid configurations

### Data Exchange Monitoring
1. Go to the **Data Exchanges** tab
2. Browse paginated list of exchanges (5 per page)
3. Click any exchange row to view full details in a modal
4. Use **Previous/Next** buttons for pagination
5. Click **Refresh** to reload data
6. Click **Download All** to export all exchanges as JSON
7. View connector status indicator in the header

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Generate coverage
pnpm test:coverage
```

Tests cover:
- API service functionality
- Component rendering
- User interactions
- Protected routes
- Authentication flows

## 🐛 Troubleshooting

### Dashboard not accessible
- Check that docker-compose is running: `docker-compose ps`
- Verify the dashboard container is healthy: `docker-compose logs pdc-dashboard`
- Ensure Traefik is properly configured and running

### Authentication fails
- Verify your secret and service keys are correct
- Check connector API is accessible: `curl http://localhost:3000/`
- Review browser console for API errors

### Configuration not loading
- Ensure you're authenticated (check localStorage for `authToken`)
- Verify API endpoint `/private/configuration` is accessible
- Check connector logs for errors

### Build fails
- Ensure Node.js 20+ is installed
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Check for TypeScript errors: `pnpm run build`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
