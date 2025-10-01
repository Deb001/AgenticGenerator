import sqlite3
from flask import Flask, jsonify, request, render_template
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup
import re
from typing import Dict, List, Tuple, Optional

app = Flask(__name__)

# Database setup
def init_db():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect('portfolio.db')
    cursor = conn.cursor()
    
    # Clients table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            risk_profile TEXT CHECK(risk_profile IN ('Low', 'Medium', 'High')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Portfolio table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS portfolio (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER,
            stock_symbol TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            purchase_price REAL NOT NULL,
            purchase_date DATE NOT NULL,
            FOREIGN KEY (client_id) REFERENCES clients (id)
        )
    ''')
    
    # Advisory signals table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS advisory_signals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER,
            stock_symbol TEXT NOT NULL,
            signal TEXT CHECK(signal IN ('Buy', 'Hold', 'Sell')),
            confidence_score REAL,
            reasoning TEXT,
            generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Technical Indicators
class TechnicalIndicators:
    """Class for calculating technical indicators"""
    
    @staticmethod
    def calculate_sma(data: pd.Series, window: int) -> pd.Series:
        """Calculate Simple Moving Average"""
        return data.rolling(window=window).mean()
    
    @staticmethod
    def calculate_rsi(data: pd.Series, window: int = 14) -> pd.Series:
        """Calculate Relative Strength Index"""
        delta = data.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    @staticmethod
    def calculate_macd(data: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[pd.Series, pd.Series]:
        """Calculate MACD indicator"""
        ema_fast = data.ewm(span=fast).mean()
        ema_slow = data.ewm(span=slow).mean()
        macd = ema_fast - ema_slow
        signal_line = macd.ewm(span=signal).mean()
        return macd, signal_line

# Market Buzz Analysis
class MarketBuzzAnalyzer:
    """Class for market sentiment analysis"""
    
    @staticmethod
    def get_news_sentiment(symbol: str) -> float:
        """
        Analyze market sentiment for a given stock symbol
        Returns sentiment score between -1 (negative) and 1 (positive)
        """
        try:
            # Simulate news sentiment analysis (in real implementation, use news APIs)
            news_sources = [
                f"https://www.moneycontrol.com/news/tags/{symbol.lower()}.html",
                f"https://economictimes.indiatimes.com/markets/stocks/news/{symbol.lower()}"
            ]
            
            positive_keywords = ['buy', 'bullish', 'growth', 'profit', 'positive', 'recommend', 'outperform']
            negative_keywords = ['sell', 'bearish', 'loss', 'negative', 'avoid', 'underperform']
            
            total_score = 0
            count = 0
            
            for source in news_sources:
                try:
                    response = requests.get(source, timeout=10)
                    soup = BeautifulSoup(response.content, 'html.parser')
                    text = soup.get_text().lower()
                    
                    positive_count = sum(text.count(keyword) for keyword in positive_keywords)
                    negative_count = sum(text.count(keyword) for keyword in negative_keywords)
                    
                    if positive_count + negative_count > 0:
                        sentiment = (positive_count - negative_count) / (positive_count + negative_count)
                        total_score += sentiment
                        count += 1
                except:
                    continue
            
            return total_score / count if count > 0 else 0
            
        except Exception as e:
            print(f"Error in sentiment analysis: {e}")
            return 0

# Advisory Signal Generator
class AdvisorySignalGenerator:
    """Generate advisory signals based on technical indicators and market sentiment"""
    
    @staticmethod
    def generate_signal(client_id: int, symbol: str) -> Dict:
        """Generate advisory signal for a specific stock"""
        try:
            # Get historical data
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)
            
            stock_data = yf.download(f"{symbol}.NS", start=start_date, end=end_date)
            if stock_data.empty:
                return {"signal": "Hold", "confidence": 0.5, "reasoning": "Insufficient data"}
            
            close_prices = stock_data['Close']
            
            # Calculate technical indicators
            sma_50 = TechnicalIndicators.calculate_sma(close_prices, 50).iloc[-1]
            sma_200 = TechnicalIndicators.calculate_sma(close_prices, 200).iloc[-1]
            rsi = TechnicalIndicators.calculate_rsi(close_prices).iloc[-1]
            macd, signal_line = TechnicalIndicators.calculate_macd(close_prices)
            macd_value = macd.iloc[-1]
            macd_signal = signal_line.iloc[-1]
            
            # Get market sentiment
            sentiment_score = MarketBuzzAnalyzer.get_news_sentiment(symbol)
            
            # Generate signal based on rules
            signal_score = 0
            reasoning = []
            
            # Price vs SMA
            current_price = close_prices.iloc[-1]
            if current_price > sma_50 * 1.05:
                signal_score += 0.2
                reasoning.append("Price above 50-day SMA")
            elif current_price < sma_50 * 0.95:
                signal_score -= 0.2
                reasoning.append("Price below 50-day SMA")
            
            # RSI analysis
            if rsi > 70:
                signal_score -= 0.3
                reasoning.append("RSI indicates overbought")
            elif rsi < 30:
                signal_score += 0.3
                reasoning.append("RSI indicates oversold")
            
            # MACD analysis
            if macd_value > macd_signal:
                signal_score += 0.2
                reasoning.append("MACD bullish crossover")
            else:
                signal_score -= 0.2
                reasoning.append("MACD bearish crossover")
            
            # Market sentiment
            signal_score += sentiment_score * 0.3
            reasoning.append(f"Market sentiment: {'Positive' if sentiment_score > 0 else 'Negative'}")
            
            # Determine final signal
            if signal_score > 0.3:
                signal = "Buy"
                confidence = min(0.9, (signal_score + 1) / 2)
            elif signal_score < -0.3:
                signal = "Sell"
                confidence = min(0.9, (-signal_score + 1) / 2)
            else:
                signal = "Hold"
                confidence = 0.5
            
            # Store signal in database
            conn = sqlite3.connect('portfolio.db')
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO advisory_signals (client_id, stock_symbol, signal, confidence_score, reasoning)
                VALUES (?, ?, ?, ?, ?)
            ''', (client_id, symbol, signal, confidence, '; '.join(reasoning)))
            conn.commit()
            conn.close()
            
            return {
                "signal": signal,
                "confidence": round(confidence, 2),
                "reasoning": reasoning
            }
            
        except Exception as e:
            print(f"Error generating signal: {e}")
            return {"signal": "Hold", "confidence": 0.5, "reasoning": "Error in analysis"}

# Flask Routes
@app.route('/')
def index():
    """Serve the main dashboard page"""
    return render_template('index.html')

@app.route('/api/clients', methods=['GET', 'POST'])
def handle_clients():
    """API endpoint for client management"""
    conn = sqlite3.connect('portfolio.db')
    cursor = conn.cursor()
    
    if request.method == 'GET':
        cursor.execute('SELECT * FROM clients')
        clients = cursor.fetchall()
        return jsonify([{
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'phone': row[3],
            'risk_profile': row[4],
            'created_at': row[5]
        } for row in clients])
    
    elif request.method == 'POST':
        data = request.get_json()
        cursor.execute('''
            INSERT INTO clients (name, email, phone, risk_profile)
            VALUES (?, ?, ?, ?)
        ''', (data['name'], data['email'], data['phone'], data['risk_profile']))
        conn.commit()
        client_id = cursor.lastrowid
        conn.close()
        return jsonify({'message': 'Client created successfully', 'client_id': client_id}), 201

@app.route('/api/portfolio/<int:client_id>', methods=['GET', 'POST'])
def handle_portfolio(client_id):
    """API endpoint for portfolio management"""
    conn = sqlite3.connect('portfolio.db')
    cursor = conn.cursor()
    
    if request.method == 'GET':
        cursor.execute('''
            SELECT p.id, p.stock_symbol, p.quantity, p.purchase_price, p.purchase_date
            FROM portfolio p WHERE p.client_id = ?
        ''', (client_id,))
        portfolio = cursor.fetchall()
        
        portfolio_data = []
        for row in portfolio:
            stock_data = yf.download(f"{row[1]}.NS", period="1d")
            current_price = stock_data['Close'].iloc[-1] if not stock_data.empty else row[2]
            gain_loss = (current_price - row[2]) * row[1]
            
            portfolio_data.append({
                'id': row[0],
                'symbol': row[1],
                'quantity': row[2],
                'purchase_price': row[3],
                'current_price': current_price,
                'gain_loss': gain_loss,
                'purchase_date': row[4]
            })
        
        return jsonify(portfolio_data)
    
    elif request.method == 'POST':
        data = request.get_json()
        cursor.execute('''
            INSERT INTO portfolio (client_id, stock_symbol, quantity, purchase_price, purchase_date)
            VALUES (?, ?, ?, ?, ?)
        ''', (client_id, data['symbol'], data['quantity'], data['purchase_price'], data['purchase_date']))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Stock added to portfolio'}), 201

@app.route('/api/signals/<int:client_id>')
def get_signals(client_id):
    """API endpoint to get advisory signals for a client"""
    conn = sqlite3.connect('portfolio.db')
    cursor = conn.cursor()
    
    # Get client's portfolio
    cursor.execute('SELECT stock_symbol FROM portfolio WHERE client_id = ?', (client_id,))
    stocks = [row[0] for row in cursor.fetchall()]
    
    signals = []
    for symbol in stocks:
        signal = AdvisorySignalGenerator.generate_signal(client_id, symbol)
        signals.append({
            'symbol': symbol,
            'signal': signal['signal'],
            'confidence': signal['confidence'],
            'reasoning': signal['reasoning']
        })
    
    return jsonify(signals)

@app.route('/api/analysis/<symbol>')
def get_technical_analysis(symbol):
    """API endpoint for technical analysis data"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        
        stock_data = yf.download(f"{symbol}.NS", start=start_date, end=end_date)
        close_prices = stock_data['Close']
        
        # Calculate indicators
        sma_50 = TechnicalIndicators.calculate_sma(close_prices, 50)
        sma_200 = TechnicalIndicators.calculate_sma(close_prices, 200)
        rsi = TechnicalIndicators.calculate_rsi(close_prices)
        macd, signal_line = TechnicalIndicators.calculate_macd(close_prices)
        
        return jsonify({
            'dates': stock_data.index.strftime('%Y-%m-%d').tolist(),
            'prices': close_prices.tolist(),
            'sma_50': sma_50.tolist(),
            'sma_200': sma_200.tolist(),
            'rsi': rsi.tolist(),
            'macd': macd.tolist(),
            'macd_signal': signal_line.tolist()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)