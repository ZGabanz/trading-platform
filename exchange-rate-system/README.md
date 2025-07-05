# Exchange Rate System - Architecture & Implementation

## Project Overview

Comprehensive exchange rate management and deal automation system built with microservices architecture to solve profit instability issues and automate P2P trading operations.

## System Architecture

### Core Services

- **pricing-core**: Main rate calculation service
- **p2p-indicative-parser**: Real-time P2P market data parsing
- **rapira-parser**: Spot rate service integration
- **deal-automation**: Automated trading and deal management
- **notification-service**: Multi-channel alert system
- **reporting-service**: Analytics and business intelligence

### Frontend Applications

- **manager-panel**: Operations dashboard for managers
- **partner-cabinet**: Self-service portal for partners
- **trading-ui**: Real-time trading interface

## Key Features

### 1. Fixed Spread Module (pricing.v1)

- Stabilized partner payouts with configurable spreads
- KPI-driven pricing with deviation monitoring
- Partner notification system for rate changes
- Boundary validation and risk controls

### 2. Indicative P2P Rate Parser (pricing.p2p.indicative)

- Real-time P2P market price aggregation (Bybit, HTX)
- Weighted average calculation based on volume
- Historical delta analysis between spot and P2P rates
- Hybrid pricing: `Final_rate = (Spot + Indicative_P2P) / 2 + fixed_spread`

### 3. Dynamic Spread System (pricing.v2.volatility)

- Volatility-based spread adjustments
- Market storm protection with automatic spread increases
- Configurable volatility thresholds and responses
- Spread smoothing to prevent sudden jumps

### 4. Deal Automation System (backoffice.trading.v1)

- Automated P2P deal execution and closing
- Partner API integration for self-service
- Real-time deal monitoring and reporting
- Role-based access control and audit trails

## Technology Stack

### Backend Services

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with OpenAPI/Swagger
- **Database**: PostgreSQL 15+ with TypeORM
- **Cache**: Redis 7+ for rate caching
- **Message Queue**: Bull Queue with Redis
- **API Gateway**: Kong or custom Next.js middleware

### Frontend

- **Framework**: Next.js 14+ with TypeScript
- **UI Components**: Tailwind CSS + Headless UI
- **State Management**: Zustand
- **Data Fetching**: SWR with real-time updates
- **Charts**: Recharts + TradingView widgets

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional)
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + ELK Stack
- **CI/CD**: GitHub Actions

## Performance Requirements

- **API Response Time**: < 500ms for pricing endpoints
- **Rate Cache TTL**: 5-30 seconds configurable
- **System Uptime**: > 99.9%
- **Automated Deals**: > 70% of total volume
- **Rate Accuracy**: < 2% deviation from actual

## Security Features

- JWT-based authentication and authorization
- API rate limiting and IP whitelisting
- Encrypted data at rest and in transit
- Comprehensive audit logging
- Regular security scanning

## Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Quick Start

```bash
# Clone and setup
git clone <repository>
cd exchange-rate-system

# Install dependencies
npm install

# Start development environment
docker-compose up -d
npm run dev:all

# Access services
# - Manager Panel: http://localhost:3000
# - Partner Cabinet: http://localhost:3001
# - API Gateway: http://localhost:3002
# - Grafana: http://localhost:3003
```

## Implementation Phases

### Phase 1: Core Foundation (Week 1)

- [x] Project structure and configuration
- [ ] Database schema and migrations
- [ ] Basic API gateway setup
- [ ] Fixed spread calculation module
- [ ] Basic monitoring setup

### Phase 2: P2P Integration (Week 2)

- [ ] Bybit P2P parser implementation
- [ ] HTX P2P parser implementation
- [ ] Weighted average calculation
- [ ] Historical data storage
- [ ] Hybrid rate calculation

### Phase 3: Volatility System (Week 3-4)

- [ ] Volatility analysis algorithms
- [ ] Dynamic spread calculations
- [ ] Market storm detection
- [ ] Alert systems integration
- [ ] Backtesting framework

### Phase 4: Deal Automation (Week 5-8)

- [ ] Partner API development
- [ ] Deal execution engine
- [ ] P2P auto-closing integration
- [ ] Reporting dashboard
- [ ] Full system integration

## Contributing

1. Follow TypeScript strict mode
2. Use conventional commits
3. Write tests for business logic
4. Document API endpoints
5. Update monitoring dashboards

## License

Proprietary - Internal Use Only
