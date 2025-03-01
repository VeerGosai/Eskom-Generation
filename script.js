// script.js

// URLs to your CSV files
const csvUrl = 'https://raw.githubusercontent.com/VeerGosai/Eskom-Generation/main/output.csv';
const labelUrl = 'https://raw.githubusercontent.com/VeerGosai/Eskom-Generation/main/label.csv';

// Global variables
let csvData = [];
let headers = [];
// labelMap will hold objects like:
//   labelMap[headerName] = { label: "...", category: "...", color: "..." }
let labelMap = {};
let chart; // Chart.js instance

/**
 * Fetches and parses the main CSV data (output.csv).
 */
async function fetchCSVData() {
  const response = await fetch(csvUrl);
  const text = await response.text();
  // Split lines; handle CRLF vs LF
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  // First line is the header row
  headers = lines[0].split(',');

  // Convert subsequent lines to objects
  csvData = lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx];
    });
    return obj;
  });
}

/**
 * Fetches and parses the label CSV (label.csv),
 * building a dictionary of { headerName -> { label, category, color } }.
 */
async function fetchLabels() {
  const response = await fetch(labelUrl);
  const text = await response.text();
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

  // Each line is expected to be: "HeaderName,FriendlyLabel,Category,Color"
  lines.forEach(line => {
    const [key, friendly, category, color] = line.split(',');
    if (key && friendly) {
      labelMap[key] = {
        label: friendly.trim(),
        category: category ? category.trim() : '',
        color: color ? color.trim() : ''
      };
    }
  });
}

/**
 * Populate the dropdown with the available series (columns).
 * Skip the first column (Date/Time).
 */
function populateDropdown() {
  const select = document.getElementById('series-select');
  // Clear any existing options
  select.innerHTML = '';

  headers.slice(1).forEach(header => {
    const option = document.createElement('option');
    option.value = header;
    // If we have a friendly label, use it; otherwise fallback to the raw header
    const friendlyLabel = labelMap[header]?.label || header;
    option.text = friendlyLabel;
    select.appendChild(option);
  });

  // Listen for changes
  select.addEventListener('change', plotData);
}

/**
 * Renders the selected series on a Chart.js line chart.
 */
function plotData() {
  if (!csvData.length) return;

  const select = document.getElementById('series-select');
  const selectedHeader = select.value;
  // The first column is our Date/Time
  const timeHeader = headers[0];

  // Build arrays for Chart.js
  const xLabels = csvData.map(row => row[timeHeader]);
  const dataPoints = csvData.map(row => parseFloat(row[selectedHeader]));
  
  // Use the friendly label and color from labelMap, if available
  const friendlyLabel = labelMap[selectedHeader]?.label || selectedHeader;
  const lineColor = labelMap[selectedHeader]?.color || getColor(0);

  // Prepare the dataset
  const dataset = {
    label: friendlyLabel,
    data: dataPoints,
    borderColor: lineColor,
    fill: false,
    tension: 0.1
  };

  // Destroy previous chart instance if any
  if (chart) {
    chart.destroy();
  }

  // Create a new chart
  const ctx = document.getElementById('chart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xLabels,
      datasets: [dataset]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Energy Plot'
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            parser: 'YYYY-MM-DD HH:mm:ss',
            tooltipFormat: 'lll' // e.g. "Feb 21, 2025 12:00 AM"
          },
          title: {
            display: true,
            text: 'Date/Time'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Value'
          }
        }
      }
    }
  });
}

/**
 * Simple color fallback if no color is defined in label.csv.
 */
function getColor(index) {
  const colors = [
    '#007bff', '#dc3545', '#28a745', '#ffc107', '#17a2b8',
    '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#343a40'
  ];
  return colors[index % colors.length];
}

/**
 * Initialization sequence: fetch data, fetch labels, build UI, plot the first series by default.
 */
async function init() {
  await fetchCSVData();
  await fetchLabels();
  populateDropdown();
  plotData(); // Plot the first series automatically
}

// Kick off once DOM is ready
document.addEventListener('DOMContentLoaded', init);
