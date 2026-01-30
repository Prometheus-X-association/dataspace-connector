# PDC Dashboard

A modern, responsive dashboard for Provider Data Connector (PDC) built with Vite, React, TypeScript, and Tailwind CSS. Features authentication, configuration management, and data exchange monitoring.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access at http://localhost:8080
```

For detailed Docker deployment instructions, see [DOCKER_README.md](DOCKER_README.md)

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
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
- **Refresh**: Update data on demand
- **Real-time Status**: View exchange status and timestamps

## 📁 Project Structure

```
pdc-dashboard/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/        # shadcn/ui components
│   │   └── ProtectedRoute.tsx
│   ├── pages/         # Page components
│   │   ├── Login.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ConfigurationTab.tsx
│   │   └── DataExchangesTab.tsx
│   ├── services/      # API service layer
│   │   └── api.ts
│   ├── types/         # TypeScript type definitions
│   ├── lib/           # Utility libraries
│   ├── App.tsx        # Main App with routing
│   └── main.tsx       # Application entry point
├── Dockerfile         # Docker image definition
├── docker-compose.yml # Docker Compose configuration
├── nginx.conf        # Nginx configuration
└── package.json      # Dependencies and scripts
```

## 🛠️ API Endpoints

The dashboard connects to the Provider Data Connector API:

- `POST /login` - Authenticate with secret and serviceKey
- `GET /private/configuration` - Get current configuration
- `PUT /private/configuration` - Update configuration
- `POST /private/configuration/reload` - Reload from config.json
- `GET /dataexchanges/` - Get all data exchanges
- `GET /dataexchanges/{id}` - Get specific data exchange

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```bash
VITE_API_BASE_URL=https://provider-data-connector-253244a6c16c.herokuapp.com
```

### Prerequisites

- Node.js (v20 or higher)
- npm or pnpm
- Docker (for containerized deployment)

## 📜 Available Scripts

## 📜 Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐳 Docker Deployment

### Quick Deploy

```bash
docker-compose up -d
```

Access the dashboard at `http://localhost:8080`

### Custom Configuration

Edit `docker-compose.yml` to change the API endpoint:

```yaml
environment:
  - VITE_API_BASE_URL=https://your-api-endpoint.com
```

For complete Docker instructions, see [DOCKER_README.md](DOCKER_README.md)

## 🎨 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Container**: Docker + Nginx Alpine

## 🔒 Security

- JWT token-based authentication
- Secure token storage in localStorage
- Automatic token refresh handling
- Protected routes with authentication checks
- API request/response interceptors

## 📝 Usage

1. **Login**: Enter your secret and serviceKey credentials
2. **Configuration Tab**: 
   - View current configuration
   - Edit JSON directly
   - Click "Reload from File" to sync with config.json
   - Click "Update Configuration" to save changes
3. **Data Exchanges Tab**:
   - Browse all data exchanges
   - Use pagination to navigate
   - Click any exchange to view details
   - Click "Refresh" to update the list

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
