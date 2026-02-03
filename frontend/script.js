// ==============================
// NSE Stock Screener – Frontend
// Vanilla JavaScript implementation
// ==============================

// ----- Configuration -----
const YAHOO_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=';
const YAHOO_SUMMARY_URL = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary/'; // Append SYMBOL?modules=summaryProfile
const PAGE_SIZE = 10;

// ----- State -----
let allStocks = []; // Full data after fetch
let filteredStocks = []; // After applying filters
let currentPage = 1;
let currentSort = { key: 'symbol', asc: true };
let watchlist = [];

// ----- DOM Elements -----
const searchInput = document.getElementById('search-input');
const resultsBody = document.getElementById('results-body');
const paginationInfo = document.getElementById('page-info');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const filtersForm = document.getElementById('filters-form');
const sectorFilter = document.getElementById('sector-filter');
const clearFiltersBtn = document.getElementById('clear-filters');
const modal = document.getElementById('detail-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');
const toastContainer = document.getElementById('toast-container');
const watchlistPanel = document.getElementById('watchlist-items');
const exportBtn = document.getElementById('export-watchlist');
const importBtn = document.getElementById('import-watchlist');
const importFileInput = document.getElementById('import-file');

// ----- Utility Functions -----
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function formatNumber(num) {
  if (num === null || num === undefined) return 'N/A';
  return Number(num).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function formatPercent(num) {
  if (num === null || num === undefined) return 'N/A';
  const sign = num > 0 ? '+' : '';
  return `${sign}${Number(num).toFixed(2)}%`;
}

function safeParseFloat(value) {
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}

// ----- Data Fetching -----
async function fetchQuote(symbol) {
  const url = `${YAHOO_QUOTE_URL}${encodeURIComponent(symbol)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch quote for ${symbol}`);
  const data = await resp.json();
  if (!data.quoteResponse.result.length) throw new Error(`No data for ${symbol}`);
  return data.quoteResponse.result[0];
}

async function fetchSummary(symbol) {
  const url = `${YAHOO_SUMMARY_URL}${encodeURIComponent(symbol)}?modules=summaryProfile`;
  const resp = await fetch(url);
  if (!resp.ok) return {};
  const data = await resp.json();
  const profile = data.quoteSummary?.result?.[0]?.summaryProfile || {};
  return {
    sector: profile.sector || 'N/A',
  };
}

async function fetchStockData(symbol) {
  try {
    const [quote, summary] = await Promise.all([fetchQuote(symbol), fetchSummary(symbol)]);
    return {
      symbol: quote.symbol,
      shortName: quote.shortName || quote.longName || 'N/A',
      sector: summary.sector,
      price: quote.regularMarketPrice ?? null,
      changePercent: quote.regularMarketChangePercent ?? null,
      marketCap: quote.marketCap ?? null,
      peRatio: quote.trailingPE ?? null,
      dividendYield: quote.dividendYield ? quote.dividendYield * 100 : null, // convert to %
      week52High: quote.fiftyTwoWeekHigh ?? null,
      week52Low: quote.fiftyTwoWeekLow ?? null,
    };
  } catch (e) {
    console.warn(e);
    return null; // Skip symbols that error out
  }
}

async function handleSearch(query) {
  const symbols = query
    .split(/[,\s]+/)
    .map(s => s.trim())
    .filter(s => s.length);

  if (!symbols.length) {
    allStocks = [];
    applyFiltersAndRender();
    return;
  }

  showToast('Fetching data…', 'info');
  const promises = symbols.map(fetchStockData);
  const results = await Promise.all(promises);
  allStocks = results.filter(r => r !== null);

  // Populate sector filter options dynamically
  const sectors = [...new Set(allStocks.map(s => s.sector).filter(Boolean))].sort();
  sectorFilter.innerHTML = '<option value="">All</option>' + sectors.map(sec => `<option value="${sec}">${sec}</option>`).join('');

  applyFiltersAndRender();
  showToast('Data loaded', 'info');
}

const debouncedSearch = debounce(e => handleSearch(e.target.value), 500);
searchInput.addEventListener('input', debouncedSearch);

// ----- Filtering -----
function getFilterValues() {
  const formData = new FormData(filtersForm);
  return {
    sector: formData.get('sector') || '',
    marketCapMin: safeParseFloat(formData.get('marketcapMin')),
    marketCapMax: safeParseFloat(formData.get('marketcapMax')),
    peMin: safeParseFloat(formData.get('peMin')),
    peMax: safeParseFloat(formData.get('peMax')),
    divYieldMin: safeParseFloat(formData.get('divYieldMin')),
    divYieldMax: safeParseFloat(formData.get('divYieldMax')),
    priceMin: safeParseFloat(formData.get('priceMin')),
    priceMax: safeParseFloat(formData.get('priceMax')),
  };
}

function passesFilters(stock, filters) {
  if (filters.sector && stock.sector !== filters.sector) return false;
  if (filters.marketCapMin !== null && (stock.marketCap ?? 0) < filters.marketCapMin * 1e7) return false; // convert Cr to actual
  if (filters.marketCapMax !== null && (stock.marketCap ?? 0) > filters.marketCapMax * 1e7) return false;
  if (filters.peMin !== null && (stock.peRatio ?? 0) < filters.peMin) return false;
  if (filters.peMax !== null && (stock.peRatio ?? 0) > filters.peMax) return false;
  if (filters.divYieldMin !== null && (stock.dividendYield ?? 0) < filters.divYieldMin) return false;
  if (filters.divYieldMax !== null && (stock.dividendYield ?? 0) > filters.divYieldMax) return false;
  if (filters.priceMin !== null && (stock.price ?? 0) < filters.priceMin) return false;
  if (filters.priceMax !== null && (stock.price ?? 0) > filters.priceMax) return false;
  return true;
}

function applyFiltersAndRender() {
  const filters = getFilterValues();
  filteredStocks = allStocks.filter(s => passesFilters(s, filters));
  sortStocks();
  currentPage = 1;
  renderTable();
}

filtersForm.addEventListener('submit', e => {
  e.preventDefault();
  applyFiltersAndRender();
});

clearFiltersBtn.addEventListener('click', () => {
  filtersForm.reset();
  applyFiltersAndRender();
});

// ----- Sorting -----
function sortStocks() {
  const { key, asc } = currentSort;
  filteredStocks.sort((a, b) => {
    const valA = a[key];
    const valB = b[key];
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    if (typeof valA === 'string') {
      return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return asc ? valA - valB : valB - valA;
  });
}

// Header click sorting
document.querySelectorAll('#results-table th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const sortKey = th.dataset.sort;
    if (currentSort.key === sortKey) {
      currentSort.asc = !currentSort.asc;
    } else {
      currentSort.key = sortKey;
      currentSort.asc = true;
    }
    sortStocks();
    renderTable();
  });
});

// ----- Pagination -----
function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / PAGE_SIZE));
  paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

nextPageBtn.addEventListener('click', () => {
  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / PAGE_SIZE));
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
});

// ----- Rendering -----
function renderTable() {
  resultsBody.innerHTML = '';
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredStocks.slice(start, start + PAGE_SIZE);
  pageItems.forEach(stock => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${stock.symbol}</td>
      <td>${stock.shortName}</td>
      <td>${stock.sector}</td>
      <td>${formatNumber(stock.price)}</td>
      <td>${formatPercent(stock.changePercent)}</td>
      <td>${stock.marketCap ? formatNumber(stock.marketCap / 1e7) : 'N/A'}</td>
      <td>${stock.peRatio !== null ? stock.peRatio.toFixed(2) : 'N/A'}</td>
      <td>${stock.dividendYield !== null ? stock.dividendYield.toFixed(2) : 'N/A'}</td>
      <td>${formatNumber(stock.week52High)}</td>
      <td>${formatNumber(stock.week52Low)}</td>
      <td><button class="btn watch-btn" data-symbol="${stock.symbol}">★</button></td>
    `;
    // Row click opens modal (except watch button)
    tr.addEventListener('click', e => {
      if (e.target.classList.contains('watch-btn')) return; // ignore
      openModal(stock);
    });
    // Watch button handler
    tr.querySelector('.watch-btn').addEventListener('click', e => {
      e.stopPropagation();
      toggleWatchlist(stock.symbol);
    });
    resultsBody.appendChild(tr);
  });
  renderPagination();
  updateWatchButtons();
}

function updateWatchButtons() {
  document.querySelectorAll('.watch-btn').forEach(btn => {
    const sym = btn.dataset.symbol;
    btn.textContent = watchlist.includes(sym) ? '★' : '☆';
    btn.title = watchlist.includes(sym) ? 'Remove from watchlist' : 'Add to watchlist';
  });
}

// ----- Modal -----
function openModal(stock) {
  modalBody.innerHTML = `
    <h3>${stock.shortName} (${stock.symbol})</h3>
    <p><strong>Sector:</strong> ${stock.sector}</p>
    <p><strong>Current Price:</strong> ₹ ${formatNumber(stock.price)}</p>
    <p><strong>Change:</strong> ${formatPercent(stock.changePercent)}</p>
    <p><strong>Market Cap:</strong> ₹ ${stock.marketCap ? formatNumber(stock.marketCap) : 'N/A'}</p>
    <p><strong>P/E Ratio:</strong> ${stock.peRatio !== null ? stock.peRatio.toFixed(2) : 'N/A'}</p>
    <p><strong>Dividend Yield:</strong> ${stock.dividendYield !== null ? stock.dividendYield.toFixed(2) + '%' : 'N/A'}</p>
    <p><strong>52‑Week High:</strong> ₹ ${formatNumber(stock.week52High)}</p>
    <p><strong>52‑Week Low:</strong> ₹ ${formatNumber(stock.week52Low)}</p>
    <button class="btn" id="modal-watch-toggle">${watchlist.includes(stock.symbol) ? 'Remove from' : 'Add to'} Watchlist</button>
  `;
  const toggleBtn = document.getElementById('modal-watch-toggle');
  toggleBtn.addEventListener('click', () => {
    toggleWatchlist(stock.symbol);
    toggleBtn.textContent = watchlist.includes(stock.symbol) ? 'Remove from Watchlist' : 'Add to Watchlist';
  });
  modal.classList.remove('hidden');
}

closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', e => {
  if (e.target === modal) modal.classList.add('hidden');
});

// ----- Watchlist Management -----
function loadWatchlist() {
  const stored = localStorage.getItem('nseWatchlist');
  watchlist = stored ? JSON.parse(stored) : [];
  renderWatchlist();
}

function saveWatchlist() {
  localStorage.setItem('nseWatchlist', JSON.stringify(watchlist));
}

function toggleWatchlist(symbol) {
  if (watchlist.includes(symbol)) {
    watchlist = watchlist.filter(s => s !== symbol);
    showToast(`${symbol} removed from watchlist`, 'info');
  } else {
    watchlist.push(symbol);
    showToast(`${symbol} added to watchlist`, 'info');
  }
  saveWatchlist();
  renderWatchlist();
  updateWatchButtons();
}

function renderWatchlist() {
  watchlistPanel.innerHTML = '';
  if (!watchlist.length) {
    watchlistPanel.innerHTML = '<li>No symbols added.</li>';
    return;
  }
  watchlist.forEach(sym => {
    const li = document.createElement('li');
    li.textContent = sym;
    const rmBtn = document.createElement('button');
    rmBtn.textContent = '✕';
    rmBtn.title = 'Remove';
    rmBtn.className = 'btn';
    rmBtn.style.marginLeft = '0.5rem';
    rmBtn.addEventListener('click', () => toggleWatchlist(sym));
    li.appendChild(rmBtn);
    watchlistPanel.appendChild(li);
  });
}

exportBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(watchlist, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'watchlist.json';
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => importFileInput.click());

importFileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const arr = JSON.parse(ev.target.result);
      if (Array.isArray(arr)) {
        watchlist = arr.filter(item => typeof item === 'string');
        saveWatchlist();
        renderWatchlist();
        updateWatchButtons();
        showToast('Watchlist imported', 'info');
      } else {
        throw new Error('Invalid format');
      }
    } catch (err) {
      showToast('Failed to import watchlist', 'error');
    }
  };
  reader.readAsText(file);
});

// ----- Initialization -----
loadWatchlist();
applyFiltersAndRender();
