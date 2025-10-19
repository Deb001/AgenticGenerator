from flask import Flask, request, jsonify
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

app = Flask(__name__)
Base = declarative_base()

# Database setup
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///portfolio.db')
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Define the Portfolio model
class Portfolio(Base):
    __tablename__ = 'portfolios'
    id = Column(Integer, primary_key=True)
    client_id = Column(String, nullable=False)
    stock_symbol = Column(String, nullable=False)
    investment_amount = Column(Float, nullable=False)
    purchase_date = Column(DateTime, nullable=False)

Base.metadata.create_all(engine)

# Function to get portfolio data
@app.route('/portfolio/<client_id>', methods=['GET'])
def get_portfolio(client_id):
    try:
        portfolios = session.query(Portfolio).filter_by(client_id=client_id).all()
        if not portfolios:
            return jsonify({'error': 'No portfolio found for this client'}), 404
        
        portfolio_data = []
        for portfolio in portfolios:
            portfolio_data.append({
                'stock_symbol': portfolio.stock_symbol,
                'investment_amount': portfolio.investment_amount,
                'purchase_date': portfolio.purchase_date
            })
        
        return jsonify(portfolio_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Function to update portfolio data
@app.route('/portfolio/<client_id>', methods=['PUT'])
def update_portfolio(client_id):
    try:
        data = request.get_json()
        for item in data:
            stock_symbol = item['stock_symbol']
            investment_amount = item['investment_amount']
            purchase_date = item['purchase_date']
            
            portfolio = Portfolio(client_id=client_id, stock_symbol=stock_symbol, 
                                  investment_amount=investment_amount, purchase_date=purchase_date)
            session.add(portfolio)
        session.commit()
        return '', 204
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)