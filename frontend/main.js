/**
 * Frontend application entry point.
 * Handles fetching portfolios, rendering UI components, and displaying charts using Chart.js.
 */

/**
 * @typedef {Object} Portfolio
 * @property {number} id
 * @property {string} name
 * @property {number} clientId
 * @property {Array<Holding>} holdings
 */

/**
 * @typedef {Object} Holding
 * @property {string} symbol
 * @property {number} quantity
 */

/**
 * @typedef {Object} Signal
 * @property {string} date - ISO date string
 * @property {string} symbol
 * @property {'Buy'|'Hold'|'Sell'} recommendation
 * @property {string} provenance
 */

/**
 * Show a toast notification with the given message.
 * @param {string} message
 * @param {'error'|'success'} [type='error']
 */
function showToast(message, type = 'error') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = type === 'success' ? getComputedStyle(document.documentElement).getPropertyValue('--color-success') : getComputedStyle(document.documentElement).getPropertyValue('--color-error');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

/**
 * Initialize the application: fetch portfolios and set up UI.
 */
function initApp() {
    fetchPortfolios()
        .then(portfolios => {
            renderPortfolioTable(portfolios);
        })
        .catch(err => {
            console.error('Error loading portfolios:', err);
            showToast(`Failed to load portfolios: ${err.message}`);
        });
}

/**
 * Fetch the list of portfolios from the backend.
 * @returns {Promise<Array<Portfolio>>}
 */
async function fetchPortfolios() {
    const response = await fetch('/api/portfolios');
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    /** @type {Array<Portfolio>} */
    const data = await response.json();
    return data;
}

/**
 * Render the portfolio table into the DOM and attach click handlers.
 * @param {Array<Portfolio>} portfolios
 */
function renderPortfolioTable(portfolios) {
    const tbody = document.querySelector('#portfolio-table tbody');
    tbody.innerHTML = '';
    portfolios.forEach(portfolio => {
        const tr = document.createElement('tr');
        tr.dataset.portfolioId = portfolio.id;
        tr.innerHTML = `
            <td>${portfolio.id}</td>
            <td>${portfolio.name}</td>
            <td>${portfolio.clientId}</td>
        `;
        tr.addEventListener('click', () => {
            // Highlight selected row
            document.querySelectorAll('#portfolio-table tr.selected').forEach(row => row.classList.remove('selected'));
            tr.classList.add('selected');
            // Load signals for this portfolio
            fetchSignals(portfolio.id)
                .then(signals => {
                    renderSignalList(signals);
                    // Assume the first signal's symbol is representative for charting
                    const symbol = signals.length ? signals[0].symbol : null;
                    if (symbol) {
                        renderChart(symbol, signals);
                    } else {
                        clearChart();
                    }
                })
                .catch(err => {
                    console.error('Error loading signals:', err);
                    showToast(`Failed to load signals: ${err.message}`);
                });
        });
        tbody.appendChild(tr);
    });
}

/**
 * Fetch signals for a specific portfolio.
 * @param {number} portfolioId
 * @returns {Promise<Array<Signal>>}
 */
async function fetchSignals(portfolioId) {
    const response = await fetch(`/api/portfolios/${portfolioId}/signals`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    /** @type {Array<Signal>} */
    const data = await response.json();
    return data;
}

/**
 * Render a simple list of signals below the chart.
 * @param {Array<Signal>} signals
 */
function renderSignalList(signals) {
    const list = document.getElementById('signal-list');
    list.innerHTML = '';
    signals.forEach(sig => {
        const li = document.createElement('li');
        li.textContent = `${sig.date} – ${sig.symbol} – ${sig.recommendation} (source: ${sig.provenance})`;
        list.appendChild(li);
    });
}

let chartInstance = null;
/**
 * Render a Chart.js line chart for the given symbol and overlay signal markers.
 * @param {string} symbol
 * @param {Array<Signal>} signals
 */
function renderChart(symbol, signals) {
    const ctx = document.getElementById('chart-canvas').getContext('2d');
    // Prepare data points: use signal dates as x-axis and map recommendation to numeric values.
    const sortedSignals = [...signals].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedSignals.map(s => s.date);
    const recommendationMap = { 'Buy': 1, 'Hold': 0, 'Sell': -1 };
    const dataValues = sortedSignals.map(s => recommendationMap[s.recommendation]);
    const pointBackgroundColors = sortedSignals.map(s => {
        switch (s.recommendation) {
            case 'Buy': return getComputedStyle(document.documentElement).getPropertyValue('--color-success');
            case 'Hold': return getComputedStyle(document.documentElement).getPropertyValue('--color-accent');
            case 'Sell': return getComputedStyle(document.documentElement).getPropertyValue('--color-error');
            default: return '#888';
        }
    });
    const chartConfig = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `${symbol} Recommendation`,
                data: dataValues,
                fill: false,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-primary'),
                tension: 0.1,
                pointRadius: 6,
                pointBackgroundColor: pointBackgroundColors,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const rec = sortedSignals[ctx.dataIndex].recommendation;
                            return `Recommendation: ${rec}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: value => {
                            if (value === 1) return 'Buy';
                            if (value === 0) return 'Hold';
                            if (value === -1) return 'Sell';
                            return '';
                        }
                    },
                    min: -1.5,
                    max: 1.5
                }
            }
        }
    };
    // Destroy previous chart if exists
    if (chartInstance) {
        chartInstance.destroy();
    }
    chartInstance = new Chart(ctx, chartConfig);
}

/**
 * Clear the chart canvas when no data is available.
 */
function clearChart() {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    const ctx = document.getElementById('chart-canvas').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// Attach initApp to DOMContentLoaded event
document.addEventListener('DOMContentLoaded', initApp);
