// =============================
// NSE Stock Screener – Vanilla JS
// =============================

// Constants
const YAHOO_SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search';
const YAHOO_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';
const PAGE_SIZE = 10;
const WATCHLIST_STORAGE_KEY = 'nse_watchlist';

// State
let allResults = []; // Full data after fetching details
let filteredResults = []; // After applying filters
let currentPage = 1;
let sortState = { key: 'symbol', asc: true };
let watchlist = loadWatchlist();

// DOM Elements
const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('suggestions');
const applyFiltersBtn = document.getElementById('apply-filters');
const clearFiltersBtn = document.getElementById('clear-filters');
const resultsBody = document.getElementById('results-body');
const paginationDiv = document.getElementById('pagination');
const watchlistUl = document.getElementById('watchlist');

// Filter inputs
const sectorSelect = document.getElementById('sector-select');
const marketCapMin = document.getElementById('marketcap-min');
const marketCapMax = document.getElementById('marketcap-max');
const peMin = document.getElementById('pe-min');
const peMax = document.getElementById('pe-max');
const divYieldMin = document.getElementById('div-yield-min');
const divYieldMax = document.getElementById('div-yield-max');
const highLowSelect = document.getElementById('52w-high-low-select');

// ------------------- Utility Functions -------------------
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<"'>]/g, (c) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return map[c];
    });
}

function loadWatchlist() {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveWatchlist() {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
}

function isInWatchlist(symbol) {
    return watchlist.includes(symbol);
}

function toggleWatchlist(symbol) {
    if (isInWatchlist(symbol)) {
        watchlist = watchlist.filter((s) => s !== symbol);
    } else {
        watchlist.push(symbol);
    }
    saveWatchlist();
    renderWatchlist();
    // Re‑render results to update star icons
    renderTable();
}

// ------------------- API Calls -------------------
async function fetchSuggestions(query) {
    const url = `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(query)}&region=IN&lang=en-IN`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    // Filter NSE symbols (they end with .NS)
    const suggestions = (data?.quotes || [])
        .filter((q) => q.symbol && q.symbol.endsWith('.NS'))
        .map((q) => ({ symbol: q.symbol, name: q.shortname || q.longname || '' }));
    return suggestions;
}

async function fetchDetails(symbols) {
    // Yahoo allows up to 50 symbols per request
    const batches = [];
    for (let i = 0; i < symbols.length; i += 50) {
        batches.push(symbols.slice(i, i + 50));
    }
    const results = [];
    for (const batch of batches) {
        const url = `${YAHOO_QUOTE_URL}?symbols=${batch.join(',')}`;
        const resp = await fetch(url);
        if (!resp.ok) continue;
        const data = await resp.json();
        const quotes = data?.quoteResponse?.result || [];
        results.push(...quotes);
    }
    return results;
}

// ------------------- Rendering -------------------
function renderSuggestions(list) {
    suggestionsBox.innerHTML = '';
    if (list.length === 0) return;
    const fragment = document.createDocumentFragment();
    list.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = `${item.symbol} – ${item.name}`;
        li.dataset.symbol = item.symbol;
        fragment.appendChild(li);
    });
    suggestionsBox.appendChild(fragment);
}

function clearSuggestions() {
    suggestionsBox.innerHTML = '';
}

function renderTable() {
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const pageData = filteredResults.slice(startIdx, startIdx + PAGE_SIZE);
    resultsBody.innerHTML = '';
    const fragment = document.createDocumentFragment();
    pageData.forEach((row) => {
        const tr = document.createElement('tr');
        // Symbol
        const tdSymbol = document.createElement('td');
        tdSymbol.textContent = row.symbol.replace('.NS', '');
        tr.appendChild(tdSymbol);
        // Name
        const tdName = document.createElement('td');
        tdName.textContent = row.shortName || '';
        tr.appendChild(tdName);
        // Sector (may be undefined)
        const tdSector = document.createElement('td');
        tdSector.textContent = row.sector || 'N/A';
        tr.appendChild(tdSector);
        // Price
        const tdPrice = document.createElement('td');
        tdPrice.textContent = row.regularMarketPrice?.toFixed(2) ?? '-';
        tr.appendChild(tdPrice);
        // Market Cap (convert to crore)
        const tdMCap = document.createElement('td');
        const mcapCr = row.marketCap ? (row.marketCap / 1e7).toFixed(2) : '-';
        tdMCap.textContent = mcapCr;
        tr.appendChild(tdMCap);
        // P/E
        const tdPE = document.createElement('td');
        tdPE.textContent = row.trailingPE?.toFixed(2) ?? '-';
        tr.appendChild(tdPE);
        // Dividend Yield (%)
        const tdDiv = document.createElement('td');
        const divYield = row.dividendYield ? (row.dividendYield * 100).toFixed(2) : '-';
        tdDiv.textContent = divYield;
        tr.appendChild(tdDiv);
        // 52W High
        const tdHigh = document.createElement('td');
        tdHigh.textContent = row.fiftyTwoWeekHigh?.toFixed(2) ?? '-';
        tr.appendChild(tdHigh);
        // 52W Low
        const tdLow = document.createElement('td');
        tdLow.textContent = row.fiftyTwoWeekLow?.toFixed(2) ?? '-';
        tr.appendChild(tdLow);
        // Watchlist star
        const tdWatch = document.createElement('td');
        const star = document.createElement('span');
        star.className = isInWatchlist(row.symbol) ? 'star' : 'star inactive';
        star.textContent = '\u2605'; // ★
        star.title = isInWatchlist(row.symbol) ? 'Remove from watchlist' : 'Add to watchlist';
        star.dataset.symbol = row.symbol;
        star.addEventListener('click', () => toggleWatchlist(row.symbol));
        tdWatch.appendChild(star);
        tr.appendChild(tdWatch);
        fragment.appendChild(tr);
    });
    resultsBody.appendChild(fragment);
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredResults.length / PAGE_SIZE) || 1;
    paginationDiv.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const createBtn = (label, page, disabled = false, active = false) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.disabled = disabled;
        if (active) btn.classList.add('active');
        btn.addEventListener('click', () => {
            currentPage = page;
            renderTable();
        });
        return btn;
    };
    // Prev
    fragment.appendChild(createBtn('Prev', Math.max(1, currentPage - 1), currentPage === 1));
    // Page numbers (show max 5)
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    for (let p = startPage; p <= endPage; p++) {
        fragment.appendChild(createBtn(p, p, false, p === currentPage));
    }
    // Next
    fragment.appendChild(createBtn('Next', Math.min(totalPages, currentPage + 1), currentPage === totalPages));
    paginationDiv.appendChild(fragment);
}

function renderWatchlist() {
    watchlistUl.innerHTML = '';
    if (watchlist.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No symbols added.';
        watchlistUl.appendChild(li);
        return;
    }
    const fragment = document.createDocumentFragment();
    watchlist.forEach((sym) => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = sym.replace('.NS', '');
        const btn = document.createElement('button');
        btn.textContent = '✖';
        btn.title = 'Remove';
        btn.addEventListener('click', () => toggleWatchlist(sym));
        li.appendChild(span);
        li.appendChild(btn);
        fragment.appendChild(li);
    });
    watchlistUl.appendChild(fragment);
}

// ------------------- Filtering Logic -------------------
function applyFilters(data) {
    return data.filter((row) => {
        // Sector filter
        if (sectorSelect.value && row.sector !== sectorSelect.value) return false;
        // Market Cap (₹ Cr)
        const mCapCr = row.marketCap ? row.marketCap / 1e7 : null;
        if (marketCapMin.value && (mCapCr === null || mCapCr < parseFloat(marketCapMin.value))) return false;
        if (marketCapMax.value && (mCapCr === null || mCapCr > parseFloat(marketCapMax.value))) return false;
        // P/E
        const pe = row.trailingPE ?? null;
        if (peMin.value && (pe === null || pe < parseFloat(peMin.value))) return false;
        if (peMax.value && (pe === null || pe > parseFloat(peMax.value))) return false;
        // Dividend Yield (%)
        const divYield = row.dividendYield ? row.dividendYield * 100 : null;
        if (divYieldMin.value && (divYield === null || divYield < parseFloat(divYieldMin.value))) return false;
        if (divYieldMax.value && (divYield === null || divYield > parseFloat(divYieldMax.value))) return false;
        // 52W High/Low proximity
        if (highLowSelect.value) {
            const high = row.fiftyTwoWeekHigh ?? null;
            const low = row.fiftyTwoWeekLow ?? null;
            const price = row.regularMarketPrice ?? null;
            if (price === null) return false;
            if (highLowSelect.value === 'high') {
                // Within top 10% of the range
                if (high === null) return false;
                const threshold = high - (high - low) * 0.1;
                if (price < threshold) return false;
            } else if (highLowSelect.value === 'low') {
                // Within bottom 10% of the range
                if (low === null) return false;
                const threshold = low + (high - low) * 0.1;
                if (price > threshold) return false;
            }
        }
        return true;
    });
}

function sortData(data) {
    const { key, asc } = sortState;
    const sorted = [...data];
    sorted.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];
        // Normalise for undefined/null
        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';
        // Numeric sort if both are numbers
        if (typeof valA === 'number' && typeof valB === 'number') {
            return asc ? valA - valB : valB - valA;
        }
        // Fallback to string comparison
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return asc ? -1 : 1;
        if (strA > strB) return asc ? 1 : -1;
        return 0;
    });
    return sorted;
}

function refreshData() {
    // Apply filters, then sort, then paginate
    const filtered = applyFilters(allResults);
    filteredResults = sortData(filtered);
    currentPage = 1; // reset to first page after filter change
    renderTable();
}

// ------------------- Event Handlers -------------------
const debouncedSearch = debounce(async (e) => {
    const query = e.target.value.trim();
    if (query.length < 2) {
        clearSuggestions();
        return;
    }
    const suggestions = await fetchSuggestions(query);
    renderSuggestions(suggestions);
}, 300);

searchInput.addEventListener('input', debouncedSearch);

suggestionsBox.addEventListener('click', async (e) => {
    if (e.target && e.target.dataset && e.target.dataset.symbol) {
        const symbol = e.target.dataset.symbol;
        searchInput.value = symbol.replace('.NS', '');
        clearSuggestions();
        await performSearch([symbol]);
    }
});

applyFiltersBtn.addEventListener('click', () => {
    refreshData();
});

clearFiltersBtn.addEventListener('click', () => {
    sectorSelect.value = '';
    marketCapMin.value = '';
    marketCapMax.value = '';
    peMin.value = '';
    peMax.value = '';
    divYieldMin.value = '';
    divYieldMax.value = '';
    highLowSelect.value = '';
    refreshData();
});

// Sorting via table header click
document.querySelectorAll('#results-table th[data-key]').forEach((th) => {
    th.addEventListener('click', () => {
        const key = th.dataset.key;
        if (sortState.key === key) {
            sortState.asc = !sortState.asc; // toggle direction
        } else {
            sortState.key = key;
            sortState.asc = true;
        }
        refreshData();
    });
});

// ------------------- Main Search Function -------------------
async function performSearch(symbols) {
    // symbols array should contain full symbols like "RELIANCE.NS"
    const details = await fetchDetails(symbols);
    // Store raw data (keep full objects for sorting/filtering)
    allResults = details;
    refreshData();
}

// Initial load – empty watchlist rendering
renderWatchlist();

// Optional: Load a default set of popular NSE symbols on first visit
(async () => {
    const popular = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'HINDUNILVR.NS'];
    await performSearch(popular);
})();
