# PDC Dashboard - Docker Deployment

Docker-based dashboard for Provider Data Connector with easy deployment.

## Quick Start with Docker

### Using Docker Compose (Recommended)

1. **Build and run the container:**
   ```bash
   docker-compose up -d
   ```

2. **Access the dashboard:**
   Open your browser to `http://localhost:8080`

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t pdc-dashboard .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 8080:80 --name pdc-dashboard pdc-dashboard
   ```

3. **Stop the container:**
   ```bash
   docker stop pdc-dashboard
   docker rm pdc-dashboard
   ```

## Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
VITE_API_BASE_URL=https://provider-data-connector-253244a6c16c.herokuapp.com
```

### Custom API Endpoint

To use a different API endpoint, modify the `VITE_API_BASE_URL` in `docker-compose.yml`:

```yaml
environment:
  - VITE_API_BASE_URL=https://your-api-endpoint.com
```

## Features

### 🔐 Authentication
- Secure login with secret and serviceKey
- JWT token stored in localStorage
- Automatic redirect on authentication failure

### ⚙️ Configuration Management
- View current configuration
- Edit configuration in JSON format
- Validate JSON before saving
- Reload configuration from config.json file
- Update configuration via API

### 📊 Data Exchanges
- View all data exchanges
- Paginated list (5 items per page)
- Click to view full details in modal
- Refresh data on demand

## Development

### Prerequisites
- Node.js 20+
- npm or yarn

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

### Project Structure

```
pdc-dashboard/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # shadcn/ui components
│   │   └── ProtectedRoute.tsx
│   ├── pages/           # Page components
│   │   ├── Login.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ConfigurationTab.tsx
│   │   └── DataExchangesTab.tsx
│   ├── services/        # API service layer
│   │   └── api.ts
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app with routing
│   └── main.tsx         # Entry point
├── Dockerfile           # Docker image definition
├── docker-compose.yml   # Docker Compose configuration
├── nginx.conf          # Nginx configuration
└── package.json        # Dependencies and scripts
```

## API Endpoints Used

- `POST /login` - Authentication
- `GET /private/configuration` - Get configuration
- `PUT /private/configuration` - Update configuration
- `POST /private/configuration/reload` - Reload from file
- `GET /dataexchanges/` - Get all data exchanges
- `GET /dataexchanges/{id}` - Get specific data exchange

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Container**: Docker + Nginx

## Deployment

### Production Build

The Docker image uses a multi-stage build:
1. Build stage: Compiles the React app
2. Production stage: Serves with Nginx

### Container Optimization

- Alpine Linux base (minimal size)
- Multi-stage build (smaller final image)
- Gzip compression enabled
- Static asset caching (1 year)
- SPA routing support

### Health Check

Add to `docker-compose.yml` for health monitoring:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Troubleshooting

### Authentication Issues
- Verify API endpoint is correct
- Check secret and serviceKey credentials
- Ensure network connectivity to API

### Configuration Updates Failing
- Validate JSON syntax before saving
- Check API permissions
- Verify authentication token is valid

### Container Not Starting
- Check port 8080 is available
- Review Docker logs: `docker-compose logs`
- Verify Docker daemon is running

## License

MIT License
