from sqlalchemy import create_engine, Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import os

# Create a base class for all models
Base = declarative_base()

class Portfolio(Base):
    __tablename__ = 'portfolios'
    
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey('clients.id'))
    stock_symbol = Column(String, nullable=False)
    investment_amount = Column(Float, nullable=False)
    purchase_date = Column(Date, nullable=False)
    
    # Define the relationship to Client model
    client = relationship("Client", back_populates="portfolios")

# Create a database engine and session
engine = create_engine('sqlite:///portfolio.db')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()

# Example of adding a new portfolio entry
new_portfolio = Portfolio(client_id=1, stock_symbol='AAPL', investment_amount=1500.0, purchase_date='2023-04-01')
session.add(new_portfolio)
session.commit()