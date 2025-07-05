-- Exchange Rate System Database Schema
-- Created: 2024

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Partners table
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL CHECK (tier IN ('BASIC', 'PREMIUM', 'ENTERPRISE')),
    api_key VARCHAR(255) UNIQUE NOT NULL,
    rate_limit INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partner symbols (many-to-many relationship)
CREATE TABLE partner_symbols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(partner_id, symbol)
);

-- Fixed spread configurations
CREATE TABLE fixed_spread_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    base_spread_percent DECIMAL(10,6) NOT NULL,
    min_spread_percent DECIMAL(10,6) NOT NULL,
    max_spread_percent DECIMAL(10,6) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP,
    partner_notification_required BOOLEAN DEFAULT false,
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spread boundaries
CREATE TABLE spread_boundaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL UNIQUE,
    min_deviation_percent DECIMAL(10,6) NOT NULL,
    max_deviation_percent DECIMAL(10,6) NOT NULL,
    alert_threshold_percent DECIMAL(10,6) NOT NULL,
    emergency_stop_threshold_percent DECIMAL(10,6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volatility spread configurations
CREATE TABLE volatility_spread_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    base_spread DECIMAL(10,6) NOT NULL,
    volatility_multiplier DECIMAL(10,6) NOT NULL,
    low_volatility_threshold DECIMAL(10,6) NOT NULL,
    medium_volatility_threshold DECIMAL(10,6) NOT NULL,
    high_volatility_threshold DECIMAL(10,6) NOT NULL,
    critical_volatility_threshold DECIMAL(10,6) NOT NULL,
    max_volatility_spread DECIMAL(10,6) NOT NULL,
    smoothing_factor DECIMAL(10,6) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- P2P indicative configurations
CREATE TABLE p2p_indicative_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    enabled_sources JSON NOT NULL, -- Array of sources like ['BYBIT', 'HTX']
    top_sellers_count INTEGER DEFAULT 10,
    volume_weight_enabled BOOLEAN DEFAULT true,
    minimum_seller_rating DECIMAL(3,2) DEFAULT 4.0,
    minimum_completion_rate DECIMAL(5,2) DEFAULT 95.0,
    max_price_deviation_percent DECIMAL(10,6) DEFAULT 5.0,
    cache_timeout INTEGER DEFAULT 300,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historical spot rates
CREATE TABLE historical_spot_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    bid DECIMAL(20,8) NOT NULL,
    ask DECIMAL(20,8) NOT NULL,
    spread DECIMAL(20,8) NOT NULL,
    volume DECIMAL(20,8),
    source VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historical P2P rates
CREATE TABLE historical_p2p_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    source VARCHAR(50) NOT NULL,
    weighted_average_price DECIMAL(20,8) NOT NULL,
    median_price DECIMAL(20,8) NOT NULL,
    lowest_price DECIMAL(20,8) NOT NULL,
    highest_price DECIMAL(20,8) NOT NULL,
    total_volume DECIMAL(20,8) NOT NULL,
    offer_count INTEGER NOT NULL,
    data_quality_score INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rate deltas (for volatility analysis)
CREATE TABLE rate_deltas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    spot_rate DECIMAL(20,8) NOT NULL,
    p2p_rate DECIMAL(20,8) NOT NULL,
    delta DECIMAL(20,8) NOT NULL,
    delta_percent DECIMAL(10,6) NOT NULL,
    absolute_delta DECIMAL(20,8) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volatility metrics
CREATE TABLE volatility_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    time_window INTEGER NOT NULL, -- hours
    variance DECIMAL(20,8) NOT NULL,
    standard_deviation DECIMAL(20,8) NOT NULL,
    moving_average DECIMAL(20,8) NOT NULL,
    volatility_index DECIMAL(10,6) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    calculated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pricing results (for audit and analysis)
CREATE TABLE pricing_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    partner_id UUID REFERENCES partners(id),
    spot_rate DECIMAL(20,8) NOT NULL,
    p2p_indicative_rate DECIMAL(20,8),
    fixed_spread DECIMAL(20,8) NOT NULL,
    volatility_spread DECIMAL(20,8) NOT NULL,
    final_rate DECIMAL(20,8) NOT NULL,
    calculation_method VARCHAR(50) NOT NULL,
    confidence INTEGER NOT NULL,
    processing_time INTEGER NOT NULL, -- milliseconds
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pricing alerts
CREATE TABLE pricing_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL', 'EMERGENCY')),
    message TEXT NOT NULL,
    current_value DECIMAL(20,8),
    threshold_value DECIMAL(20,8),
    metadata JSON,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    notifications_sent JSON, -- Array of channels
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deals
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id),
    symbol VARCHAR(20) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    rate DECIMAL(20,8) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('BUY', 'SELL')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    p2p_platform VARCHAR(50),
    p2p_order_id VARCHAR(255),
    execution_price DECIMAL(20,8),
    execution_time TIMESTAMP,
    completion_time TIMESTAMP,
    profit_loss DECIMAL(20,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id),
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    metadata JSON,
    status VARCHAR(20) DEFAULT 'PENDING',
    sent_at TIMESTAMP,
    failed_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System configuration
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'STRING',
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_partners_api_key ON partners(api_key);
CREATE INDEX idx_partners_active ON partners(is_active);
CREATE INDEX idx_spread_configs_symbol ON fixed_spread_configs(symbol);
CREATE INDEX idx_spread_configs_partner ON fixed_spread_configs(partner_id);
CREATE INDEX idx_spread_configs_active ON fixed_spread_configs(is_active);
CREATE INDEX idx_historical_spot_rates_symbol_timestamp ON historical_spot_rates(symbol, timestamp);
CREATE INDEX idx_historical_p2p_rates_symbol_timestamp ON historical_p2p_rates(symbol, timestamp);
CREATE INDEX idx_rate_deltas_symbol_timestamp ON rate_deltas(symbol, timestamp);
CREATE INDEX idx_volatility_metrics_symbol_time ON volatility_metrics(symbol, time_window);
CREATE INDEX idx_pricing_results_symbol_timestamp ON pricing_results(symbol, timestamp);
CREATE INDEX idx_pricing_alerts_symbol_type ON pricing_alerts(symbol, type);
CREATE INDEX idx_pricing_alerts_resolved ON pricing_alerts(is_resolved);
CREATE INDEX idx_deals_partner_status ON deals(partner_id, status);
CREATE INDEX idx_deals_symbol_timestamp ON deals(symbol, created_at);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_partner ON notifications(partner_id);

-- Insert default system configuration
INSERT INTO system_config (key, value, type, description) VALUES
('default_cache_ttl', '300', 'INTEGER', 'Default cache TTL in seconds'),
('pricing_cache_ttl', '30', 'INTEGER', 'Pricing cache TTL in seconds'),
('max_spread_deviation', '10', 'DECIMAL', 'Maximum allowed spread deviation in percent'),
('volatility_analysis_window', '24', 'INTEGER', 'Volatility analysis window in hours'),
('enable_metrics', 'true', 'BOOLEAN', 'Enable metrics collection'),
('enable_alerting', 'true', 'BOOLEAN', 'Enable alerting system'),
('maintenance_mode', 'false', 'BOOLEAN', 'System maintenance mode'),
('api_version', '1.0.0', 'STRING', 'Current API version');

-- Insert default spread boundaries
INSERT INTO spread_boundaries (symbol, min_deviation_percent, max_deviation_percent, alert_threshold_percent, emergency_stop_threshold_percent) VALUES
('EUR/USD', 0.1, 5.0, 2.0, 10.0),
('GBP/USD', 0.1, 5.0, 2.0, 10.0),
('USD/JPY', 0.1, 5.0, 2.0, 10.0),
('USDT/EUR', 0.1, 5.0, 2.0, 10.0),
('USDT/USD', 0.1, 3.0, 1.5, 8.0);

-- Insert default P2P indicative configs
INSERT INTO p2p_indicative_configs (symbol, enabled_sources, top_sellers_count, volume_weight_enabled, minimum_seller_rating, minimum_completion_rate, max_price_deviation_percent, cache_timeout, is_active) VALUES
('USDT/EUR', '["BYBIT", "HTX"]', 10, true, 4.0, 95.0, 5.0, 300, true),
('USDT/USD', '["BYBIT", "HTX"]', 10, true, 4.0, 95.0, 3.0, 300, true),
('USDC/EUR', '["BYBIT", "HTX"]', 10, true, 4.0, 95.0, 5.0, 300, true),
('USDC/USD', '["BYBIT", "HTX"]', 10, true, 4.0, 95.0, 3.0, 300, true);

-- Insert test partner
INSERT INTO partners (name, tier, api_key, rate_limit, is_active) VALUES
('Test Partner', 'PREMIUM', 'test-partner-abc123', 1000, true);

-- Insert test partner symbols
INSERT INTO partner_symbols (partner_id, symbol) 
SELECT id, 'USDT/EUR' FROM partners WHERE api_key = 'test-partner-abc123'
UNION ALL
SELECT id, 'USDT/USD' FROM partners WHERE api_key = 'test-partner-abc123';

-- Insert test fixed spread configs
INSERT INTO fixed_spread_configs (symbol, partner_id, base_spread_percent, min_spread_percent, max_spread_percent, is_active, valid_from, created_by, updated_by)
SELECT 'USDT/EUR', id, 0.5, 0.1, 2.0, true, CURRENT_TIMESTAMP, 'system', 'system' FROM partners WHERE api_key = 'test-partner-abc123'
UNION ALL
SELECT 'USDT/USD', id, 0.3, 0.1, 1.5, true, CURRENT_TIMESTAMP, 'system', 'system' FROM partners WHERE api_key = 'test-partner-abc123'; 