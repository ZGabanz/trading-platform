# Financial Dashboard

A modern financial dashboard built with Next.js 14, featuring real-time exchange rates, currency conversion, system monitoring, and deal management.

## Features

- 🏦 **Currency Converter** - Real-time currency conversion with rate limiting
- 📊 **System Status** - Monitor API services and system health
- 💼 **Deal Management** - Create, track, and manage financial deals
- 📈 **Rate Limiting** - Built-in rate limiting with exponential backoff
- 🔄 **Caching** - Smart caching system for API responses
- 📱 **Responsive Design** - Modern UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **API**: Next.js API routes with mock data
- **Deployment**: Vercel, Render.com, or local development

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd financial-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Mock API Endpoints

- `GET /api/system/health` - System health status
- `POST /api/v1/pricing/calculate` - Exchange rate calculation
- `GET /api/v1/pricing/rates` - Current exchange rates
- `GET /api/deals` - Deal management
- `POST /api/deals` - Create new deal
- `GET /api/deals/stats` - Deal statistics

## Configuration

### Environment Variables

| Variable              | Description  | Default                 |
| --------------------- | ------------ | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Base API URL | `http://localhost:3000` |
| `NODE_ENV`            | Environment  | `development`           |

### Rate Limiting Configuration

Edit `lib/api/exchange-rates.ts` to adjust:

- `RATE_LIMIT_DELAY`: Minimum delay between requests (ms)
- `MAX_RETRIES`: Maximum retry attempts
- `RETRY_DELAY_BASE`: Base delay for exponential backoff (ms)
- `CACHE_DURATION`: Cache duration (ms)

## Development

### Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes (mock implementations)
│   │   ├── system/        # System health endpoints
│   │   ├── v1/            # Versioned API endpoints
│   │   │   └── pricing/   # Pricing API mocks
│   │   └── deals/         # Deal management mocks
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── currency-converter.tsx
│   ├── deal-management.tsx
│   └── system-status.tsx
├── lib/                   # Utilities
│   └── api/
│       └── exchange-rates.ts  # Main API client
├── next.config.js         # Next.js configuration
├── vercel.json           # Vercel deployment config
└── render.yaml           # Render.com deployment config
```

### Adding New Features

1. **New Mock API Endpoint**: Add to `app/api/` directory
2. **New Component**: Add to `components/` directory
3. **New Utility**: Add to `lib/` directory

## Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Render.com

1. Connect your repository
2. Set environment variables
3. Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## API Features

### Rate Limiting & Caching

- Built-in rate limiting with exponential backoff
- 5-second cache for GET requests
- Request statistics tracking
- 429 error handling

### Real-time Statistics

- Request count tracking
- Cache hit/miss statistics
- Retry attempt monitoring

## Troubleshooting

### Common Issues

1. **Rate limiting errors**
   - Check browser console for statistics
   - Adjust rate limiting parameters if needed

### Debug Commands

```bash
# Check rate limiting stats
import { getRateLimitStats } from '@/lib/api/exchange-rates'
console.log(getRateLimitStats())
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
