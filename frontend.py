from flask import Flask, render_template, request, redirect, url_for
import models
import backend_logic
import security

app = Flask(__name__)
security.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/portfolio', methods=['GET', 'POST'])
def portfolio():
    if request.method == 'POST':
        stock = request.form['stock']
        quantity = int(request.form['quantity'])
        models.add_to_portfolio(stock, quantity)
        return redirect(url_for('index'))
    else:
        portfolios = models.get_all_portfolios()
        return render_template('portfolio.html', portfolios=portfolios)

@app.route('/signals')
def signals():
    signals = backend_logic.calculate_signals()
    return render_template('signals.html', signals=signals)

if __name__ == '__main__':
    app.run(debug=True)