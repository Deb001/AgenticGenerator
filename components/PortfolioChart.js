import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';

const chartOptions = {
  // Configuration options for Chart.js.
};

function PortfolioChart() {
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    if (!dataFetched) {
      fetchData();
      setDataFetched(true);
    }
  }, [dataFetched]);

  async function fetchData() {
    try {
      const response = await fetch('/api/portfolio'); // Adjust API endpoint as necessary.
      const data = await response.json();
      renderChart(data);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      displayErrorMessage();
    }
  }

  function renderChart(chartData) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Portfolio Performance',
          data: chartData.data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: chartOptions
    });
  }

  function displayErrorMessage() {
    const errorContainer = document.getElementById('error-message');
    errorContainer.textContent = 'Error fetching portfolio data.';
    errorContainer.style.display = 'block';
  }

  return (
    <div>
      <canvas id="portfolioChart" width="400" height="200"></canvas>
      <div id="error-message" style={{ color: 'red', display: 'none' }}></div>
    </div>
  );
}

export default PortfolioChart;