-- Portfolio Management System Database Schema
-- For Indian Equity Markets Advisory Platform

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table to store client information
CREATE TABLE clients (
    client_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    risk_profile VARCHAR(20) CHECK (risk_profile IN ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH')),
    investment_horizon VARCHAR(20) CHECK (investment_horizon IN ('SHORT', 'MEDIUM', 'LONG')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stocks master table for Indian equity securities
CREATE TABLE stocks (
    stock_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    exchange VARCHAR(50) DEFAULT 'NSE',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio holdings table
CREATE TABLE portfolio_holdings (
    holding_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    stock_id UUID NOT NULL REFERENCES stocks(stock_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    purchase_price DECIMAL(15,2) NOT NULL,
    purchase_date DATE NOT NULL,
    current_price DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, stock_id)
);

-- Stock price history table
CREATE TABLE stock_prices (
    price_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_id UUID NOT NULL REFERENCES stocks(stock_id),
    date DATE NOT NULL,
    open_price DECIMAL(15,2),
    high_price DECIMAL(15,2),
    low_price DECIMAL(15,2),
    close_price DECIMAL(15,2) NOT NULL,
    volume BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stock_id, date)
);

-- Technical indicators table
CREATE TABLE technical_indicators (
    indicator_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_id UUID NOT NULL REFERENCES stocks(stock_id),
    date DATE NOT NULL,
    sma_20 DECIMAL(15,2),
    sma_50 DECIMAL(15,2),
    sma_200 DECIMAL(15,2),
    rsi DECIMAL(10,2),
    macd DECIMAL(10,2),
    macd_signal DECIMAL(10,2),
    macd_histogram DECIMAL(10,2),
    bollinger_upper DECIMAL(15,2),
    bollinger_lower DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stock_id, date)
);

-- Market sentiment data table
CREATE TABLE market_sentiment (
    sentiment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_id UUID NOT NULL REFERENCES stocks(stock_id),
    date DATE NOT NULL,
    news_sentiment DECIMAL(5,2) CHECK (news_sentiment BETWEEN -1 AND 1),
    social_media_sentiment DECIMAL(5,2) CHECK (social_media_sentiment BETWEEN -1 AND 1),
    analyst_rating DECIMAL(3,1) CHECK (analyst_rating BETWEEN 1 AND 5),
    buzz_volume INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stock_id, date)
);

-- Advisory signals table
CREATE TABLE advisory_signals (
    signal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    stock_id UUID NOT NULL REFERENCES stocks(stock_id),
    signal_type VARCHAR(10) CHECK (signal_type IN ('BUY', 'SELL', 'HOLD')),
    confidence_score DECIMAL(5,2) CHECK (confidence_score BETWEEN 0 AND 1),
    rationale TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio performance history
CREATE TABLE portfolio_performance (
    performance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    daily_return DECIMAL(10,4),
    cumulative_return DECIMAL(10,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, date)
);

-- User authentication table (for advisors)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'ADVISOR' CHECK (role IN ('ADVISOR', 'ADMIN')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Client-advisor mapping table
CREATE TABLE client_advisor_mapping (
    mapping_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    advisor_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(client_id, advisor_id)
);

-- Indexes for performance optimization
CREATE INDEX idx_portfolio_client ON portfolio_holdings(client_id);
CREATE INDEX idx_portfolio_stock ON portfolio_holdings(stock_id);
CREATE INDEX idx_prices_stock_date ON stock_prices(stock_id, date DESC);
CREATE INDEX idx_indicators_stock_date ON technical_indicators(stock_id, date DESC);
CREATE INDEX idx_signals_client ON advisory_signals(client_id);
CREATE INDEX idx_signals_stock ON advisory_signals(stock_id);
CREATE INDEX idx_performance_client_date ON portfolio_performance(client_id, date DESC);
CREATE INDEX idx_sentiment_stock_date ON market_sentiment(stock_id, date DESC);

-- Views for common queries

-- View for client portfolio summary
CREATE VIEW client_portfolio_summary AS
SELECT 
    c.client_id,
    c.first_name,
    c.last_name,
    c.risk_profile,
    COUNT(ph.holding_id) as total_holdings,
    SUM(ph.quantity * COALESCE(ph.current_price, ph.purchase_price)) as portfolio_value,
    MAX(pp.date) as last_updated
FROM clients c
LEFT JOIN portfolio_holdings ph ON c.client_id = ph.client_id
LEFT JOIN portfolio_performance pp ON c.client_id = pp.client_id
GROUP BY c.client_id, c.first_name, c.last_name, c.risk_profile;

-- View for current advisory signals
CREATE VIEW current_advisory_signals AS
SELECT 
    s.signal_id,
    s.client_id,
    c.first_name,
    c.last_name,
    s.stock_id,
    st.symbol,
    st.company_name,
    s.signal_type,
    s.confidence_score,
    s.rationale,
    s.generated_at,
    s.valid_until
FROM advisory_signals s
JOIN clients c ON s.client_id = c.client_id
JOIN stocks st ON s.stock_id = st.stock_id
WHERE s.is_active = TRUE AND s.valid_until > CURRENT_TIMESTAMP;

-- View for stock technical analysis
CREATE VIEW stock_technical_analysis AS
SELECT 
    t.stock_id,
    s.symbol,
    s.company_name,
    t.date,
    t.sma_20,
    t.sma_50,
    t.sma_200,
    t.rsi,
    t.macd,
    t.macd_signal,
    t.bollinger_upper,
    t.bollinger_lower,
    sp.close_price
FROM technical_indicators t
JOIN stocks s ON t.stock_id = s.stock_id
JOIN stock_prices sp ON t.stock_id = sp.stock_id AND t.date = sp.date;

-- Stored procedures for common operations

-- Procedure to calculate portfolio value
CREATE OR REPLACE PROCEDURE calculate_portfolio_value(
    p_client_id UUID,
    p_calculated_date DATE DEFAULT CURRENT_DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO portfolio_performance (client_id, date, total_value)
    SELECT 
        p_client_id,
        p_calculated_date,
        SUM(ph.quantity * COALESCE(ph.current_price, ph.purchase_price))
    FROM portfolio_holdings ph
    WHERE ph.client_id = p_client_id
    ON CONFLICT (client_id, date) 
    DO UPDATE SET total_value = EXCLUDED.total_value;
END;
$$;

-- Procedure to generate advisory signal
CREATE OR REPLACE PROCEDURE generate_advisory_signal(
    p_client_id UUID,
    p_stock_id UUID,
    p_signal_type VARCHAR(10),
    p_confidence_score DECIMAL(5,2),
    p_rationale TEXT,
    p_valid_days INTEGER DEFAULT 7
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Deactivate previous signals for this client-stock combination
    UPDATE advisory_signals 
    SET is_active = FALSE 
    WHERE client_id = p_client_id AND stock_id = p_stock_id AND is_active = TRUE;
    
    -- Insert new signal
    INSERT INTO advisory_signals (
        client_id, 
        stock_id, 
        signal_type, 
        confidence_score, 
        rationale, 
        valid_until
    ) VALUES (
        p_client_id,
        p_stock_id,
        p_signal_type,
        p_confidence_score,
        p_rationale,
        CURRENT_TIMESTAMP + (p_valid_days * INTERVAL '1 day')
    );
END;
$$;

-- Function to get client performance history
CREATE OR REPLACE FUNCTION get_client_performance_history(
    p_client_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    performance_date DATE,
    portfolio_value DECIMAL(15,2),
    daily_return DECIMAL(10,4),
    cumulative_return DECIMAL(10,4)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.date as performance_date,
        pp.total_value as portfolio_value,
        pp.daily_return,
        pp.cumulative_return
    FROM portfolio_performance pp
    WHERE pp.client_id = p_client_id
    AND pp.date >= CURRENT_DATE - (p_days * INTERVAL '1 day')
    ORDER BY pp.date DESC;
END;
$$;

-- Function to calculate technical indicators
CREATE OR REPLACE FUNCTION calculate_technical_indicators(
    p_stock_id UUID,
    p_calc_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    sma_20 DECIMAL(15,2),
    sma_50 DECIMAL(15,2),
    sma_200 DECIMAL(15,2),
    rsi DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH price_data AS (
        SELECT date, close_price,
               LAG(close_price, 1) OVER (ORDER BY date) as prev_close
        FROM stock_prices
        WHERE stock_id = p_stock_id
        AND date <= p_calc_date
        ORDER BY date DESC
        LIMIT 200
    )
    SELECT 
        AVG(close_price) FILTER (WHERE row_number <= 20) as sma_20,
        AVG(close_price) FILTER (WHERE row_number <= 50) as sma_50,
        AVG(close_price) FILTER (WHERE row_number <= 200) as sma_200,
        CASE WHEN AVG(LOSS) = 0 THEN 100
             ELSE 100 - (100 / (1 + (AVG(GAIN) / AVG(LOSS))))
        END as rsi
    FROM (
        SELECT *,
               ROW_NUMBER() OVER (ORDER BY date DESC) as row_number,
               CASE WHEN close_price > prev_close THEN close_price - prev_close ELSE 0 END as GAIN,
               CASE WHEN close_price < prev_close THEN prev_close - close_price ELSE 0 END as LOSS
        FROM price_data
    ) sub;
END;
$$;

-- Triggers for automatic updates

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_updated_at 
    BEFORE UPDATE ON portfolio_holdings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion for demonstration
INSERT INTO stocks (symbol, company_name, sector, industry) VALUES
('RELIANCE', 'Reliance Industries Limited', 'Energy', 'Oil & Gas'),
('TCS', 'Tata Consultancy Services Limited', 'IT', 'Software'),
('HDFCBANK', 'HDFC Bank Limited', 'Financial', 'Banking'),
('INFY', 'Infosys Limited', 'IT', 'Software'),
('HINDUNILVR', 'Hindustan Unilever Limited', 'FMCG', 'Consumer Goods');

INSERT INTO clients (first_name, last_name, email, risk_profile, investment_horizon) VALUES
('Rajesh', 'Sharma', 'rajesh.sharma@email.com', 'MEDIUM', 'LONG'),
('Priya', 'Patel', 'priya.patel@email.com', 'HIGH', 'MEDIUM'),
('Amit', 'Kumar', 'amit.kumar@email.com', 'LOW', 'SHORT');

-- Comments for documentation
COMMENT ON TABLE clients IS 'Stores client personal information and risk profiles';
COMMENT ON TABLE portfolio_holdings IS 'Tracks individual stock holdings for each client';
COMMENT ON TABLE advisory_signals IS 'Stores generated Buy/Hold/Sell signals for clients';
COMMENT ON TABLE technical_indicators IS 'Calculated technical indicators for stock analysis';
COMMENT ON TABLE market_sentiment IS 'Market buzz and sentiment data for stocks';