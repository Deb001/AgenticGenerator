// script.js - Main frontend JavaScript for Portfolio Management System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

/**
 * Main application initialization
 */
function initApp() {
    // Load client data and portfolio information
    loadClientData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize charts
    initCharts();
}

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
    // Portfolio management
    document.getElementById('addStockBtn')?.addEventListener('click', addStockToPortfolio);
    document.getElementById('removeStockBtn')?.addEventListener('click', removeStockFromPortfolio);
    document.getElementById('updatePortfolioBtn')?.addEventListener('click', updatePortfolio);
    
    // Client management
    document.getElementById('addClientBtn')?.addEventListener('click', addNewClient);
    document.getElementById('refreshDataBtn')?.addEventListener('click', refreshAllData);
    
    // Signal generation
    document.getElementById('generateSignalBtn')?.addEventListener('click', generateAdvisorySignals);
}

/**
 * Load client data and portfolio information from backend
 */
async function loadClientData() {
    try {
        showLoading('Loading client data...');
        
        const [clientsResponse, portfolioResponse] = await Promise.all([
            fetch('/api/clients'),
            fetch('/api/portfolio')
        ]);
        
        if (!clientsResponse.ok || !portfolioResponse.ok) {
            throw new Error('Failed to load data from server');
        }
        
        const clients = await clientsResponse.json();
        const portfolio = await portfolioResponse.json();
        
        populateClientDropdown(clients);
        displayPortfolioData(portfolio);
        updateDashboardMetrics(portfolio);
        
    } catch (error) {
        showError('Error loading data: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Populate client dropdown with available clients
 * @param {Array} clients - Array of client objects
 */
function populateClientDropdown(clients) {
    const dropdown = document.getElementById('clientDropdown');
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = `${client.name} (${client.id})`;
        dropdown.appendChild(option);
    });
}

/**
 * Display portfolio data in the UI
 * @param {Array} portfolio - Array of portfolio items
 */
function displayPortfolioData(portfolio) {
    const portfolioTable = document.getElementById('portfolioTable');
    if (!portfolioTable) return;
    
    const tbody = portfolioTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    portfolio.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.stock_symbol}</td>
            <td>${item.quantity}</td>
            <td>₹${item.average_price.toFixed(2)}</td>
            <td>₹${item.current_price.toFixed(2)}</td>
            <td>₹${(item.quantity * item.current_price).toFixed(2)}</td>
            <td>${calculateProfitLoss(item)}</td>
            <td><span class="badge ${getSignalBadgeClass(item.signal)}">${item.signal}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="showStockDetails('${item.stock_symbol}')">
                    Details
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Calculate profit/loss for a portfolio item
 * @param {Object} item - Portfolio item
 * @returns {string} Formatted P/L percentage
 */
function calculateProfitLoss(item) {
    const investment = item.quantity * item.average_price;
    const currentValue = item.quantity * item.current_price;
    const pl = ((currentValue - investment) / investment) * 100;
    
    return `<span class="${pl >= 0 ? 'text-success' : 'text-danger'}">${pl >= 0 ? '+' : ''}${pl.toFixed(2)}%</span>`;
}

/**
 * Get CSS class for signal badge
 * @param {string} signal - Advisory signal
 * @returns {string} CSS class
 */
function getSignalBadgeClass(signal) {
    switch (signal?.toUpperCase()) {
        case 'BUY': return 'bg-success';
        case 'SELL': return 'bg-danger';
        case 'HOLD': return 'bg-warning';
        default: return 'bg-secondary';
    }
}

/**
 * Add stock to portfolio
 */
async function addStockToPortfolio() {
    const symbol = document.getElementById('stockSymbol').value.trim();
    const quantity = parseInt(document.getElementById('stockQuantity').value);
    const price = parseFloat(document.getElementById('stockPrice').value);
    const clientId = document.getElementById('clientDropdown').value;
    
    if (!symbol || !quantity || !price || !clientId) {
        showError('Please fill all fields');
        return;
    }
    
    try {
        showLoading('Adding stock to portfolio...');
        
        const response = await fetch('/api/portfolio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                stock_symbol: symbol,
                quantity: quantity,
                average_price: price
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add stock');
        }
        
        const result = await response.json();
        showSuccess('Stock added successfully');
        loadClientData(); // Refresh data
        
    } catch (error) {
        showError('Error adding stock: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Remove stock from portfolio
 */
async function removeStockFromPortfolio() {
    const symbol = prompt('Enter stock symbol to remove:');
    if (!symbol) return;
    
    try {
        showLoading('Removing stock...');
        
        const response = await fetch(`/api/portfolio/${symbol}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to remove stock');
        }
        
        showSuccess('Stock removed successfully');
        loadClientData(); // Refresh data
        
    } catch (error) {
        showError('Error removing stock: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Update portfolio with current market data
 */
async function updatePortfolio() {
    try {
        showLoading('Updating portfolio with current market data...');
        
        const response = await fetch('/api/portfolio/update', {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to update portfolio');
        }
        
        const updatedData = await response.json();
        showSuccess('Portfolio updated successfully');
        displayPortfolioData(updatedData);
        
    } catch (error) {
        showError('Error updating portfolio: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Add new client
 */
async function addNewClient() {
    const name = prompt('Enter client name:');
    const email = prompt('Enter client email:');
    const phone = prompt('Enter client phone:');
    
    if (!name || !email) {
        showError('Name and email are required');
        return;
    }
    
    try {
        showLoading('Adding new client...');
        
        const response = await fetch('/api/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add client');
        }
        
        showSuccess('Client added successfully');
        loadClientData(); // Refresh data
        
    } catch (error) {
        showError('Error adding client: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Generate advisory signals for portfolio
 */
async function generateAdvisorySignals() {
    try {
        showLoading('Generating advisory signals...');
        
        const response = await fetch('/api/signals/generate', {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate signals');
        }
        
        const signals = await response.json();
        showSuccess('Signals generated successfully');
        updateSignalsDisplay(signals);
        
    } catch (error) {
        showError('Error generating signals: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Update signals display in the UI
 * @param {Array} signals - Array of signal objects
 */
function updateSignalsDisplay(signals) {
    const signalsContainer = document.getElementById('signalsContainer');
    if (!signalsContainer) return;
    
    signalsContainer.innerHTML = '';
    
    signals.forEach(signal => {
        const card = document.createElement('div');
        card.className = 'card mb-2';
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${signal.stock_symbol}</h5>
                <h6 class="card-subtitle mb-2 ${getSignalTextClass(signal.signal)}">
                    ${signal.signal}
                </h6>
                <p class="card-text">${signal.reason}</p>
                <small class="text-muted">Confidence: ${signal.confidence}%</small>
            </div>
        `;
        signalsContainer.appendChild(card);
    });
}

/**
 * Get text class for signal display
 * @param {string} signal - Advisory signal
 * @returns {string} CSS class
 */
function getSignalTextClass(signal) {
    switch (signal?.toUpperCase()) {
        case 'BUY': return 'text-success';
        case 'SELL': return 'text-danger';
        case 'HOLD': return 'text-warning';
        default: return 'text-secondary';
    }
}

/**
 * Show detailed stock information
 * @param {string} symbol - Stock symbol
 */
async function showStockDetails(symbol) {
    try {
        showLoading('Loading stock details...');
        
        const response = await fetch(`/api/stocks/${symbol}`);
        if (!response.ok) {
            throw new Error('Failed to load stock details');
        }
        
        const stockData = await response.json();
        displayStockModal(stockData);
        
    } catch (error) {
        showError('Error loading stock details: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * Display stock details in modal
 * @param {Object} stockData - Stock data object
 */
function displayStockModal(stockData) {
    // Implementation for modal display
    console.log('Displaying stock details:', stockData);
    // This would typically open a Bootstrap modal with detailed information
}

/**
 * Initialize charts for data visualization
 */
function initCharts() {
    // Initialize performance chart
    initPerformanceChart();
    
    // Initialize allocation chart
    initAllocationChart();
    
    // Initialize signals chart
    initSignalsChart();
}

/**
 * Initialize performance chart
 */
async function initPerformanceChart() {
    try {
        const response = await fetch('/api/portfolio/performance');
        if (response.ok) {
            const performanceData = await response.json();
            // Chart.js implementation would go here
            console.log('Performance data:', performanceData);
        }
    } catch (error) {
        console.error('Error loading performance data:', error);
    }
}

/**
 * Initialize allocation chart
 */
async function initAllocationChart() {
    try {
        const response = await fetch('/api/portfolio/allocation');
        if (response.ok) {
            const allocationData = await response.json();
            // Chart.js implementation would go here
            console.log('Allocation data:', allocationData);
        }
    } catch (error) {
        console.error('Error loading allocation data:', error);
    }
}

/**
 * Initialize signals chart
 */
async function initSignalsChart() {
    try {
        const response = await fetch('/api/signals/distribution');
        if (response.ok) {
            const signalsData = await response.json();
            // Chart.js implementation would go here
            console.log('Signals distribution:', signalsData);
        }
    } catch (error) {
        console.error('Error loading signals distribution:', error);
    }
}

/**
 * Update dashboard metrics
 * @param {Array} portfolio - Portfolio data
 */
function updateDashboardMetrics(portfolio) {
    const totalValue = portfolio.reduce((sum, item) => sum + (item.quantity * item.current_price), 0);
    const totalInvestment = portfolio.reduce((sum, item) => sum + (item.quantity * item.average_price), 0);
    const totalPL = ((totalValue - totalInvestment) / totalInvestment) * 100;
    
    document.getElementById('totalValue').textContent = `₹${totalValue.toFixed(2)}`;
    document.getElementById('totalInvestment').textContent = `₹${totalInvestment.toFixed(2)}`;
    document.getElementById('totalPL').textContent = `${totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}%`;
    document.getElementById('totalPL').className = totalPL >= 0 ? 'text-success' : 'text-danger';
}

/**
 * Refresh all data
 */
async function refreshAllData() {
    await loadClientData();
    initCharts();
}

/**
 * Show loading indicator
 * @param {string} message - Loading message
 */
function showLoading(message = 'Loading...') {
    // Implementation for loading indicator
    console.log('Loading:', message);
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    // Implementation to hide loading indicator
    console.log('Loading complete');
}

/**
 * Show success message
 * @param {string} message - Success message
 */
function showSuccess(message) {
    // Implementation for success notification (Bootstrap toast)
    console.log('Success:', message);
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    // Implementation for error notification (Bootstrap toast)
    console.error('Error:', message);
}

// Export functions for testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateProfitLoss,
        getSignalBadgeClass,
        getSignalTextClass
    };
}