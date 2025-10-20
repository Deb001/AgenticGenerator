from flask import Flask, render_template
import models  # Assuming this imports the necessary database model classes and functions

app = Flask(__name__)

@app.route('/')
def index():
    """Renders the main page."""
    return render_template('index.html')

@app.route('/portfolio-management')
def portfolio_management():
    """Handles portfolio management functionalities."""
    # Example: Fetching data from the database for the portfolio management page
    portfolios = models.get_portfolios()  # Assuming this function is defined in models.py
    return render_template('portfolio_management.html', portfolios=portfolios)

if __name__ == '__main__':
    app.run(debug=True)