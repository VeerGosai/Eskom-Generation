// 2025 Copyright Veer Gosai (veergosai.com) 

const csvUrl = 'https://raw.githubusercontent.com/VeerGosai/Eskom-Generation/main/output.csv';
const labelUrl = 'https://raw.githubusercontent.com/VeerGosai/Eskom-Generation/main/label.csv';

let csvData = [];
let headers = [];
let labelMap = {};
let chart;

async function fetchCSVData() {
    const response = await fetch(csvUrl);
    const text = await response.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) {
        console.error("CSV data is empty or malformed.");
        return;
    }

    headers = lines[0].split(',');

    csvData = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, idx) => {
            obj[header] = values[idx] ? values[idx].trim() : '';
        });
        return obj;
    });
}

async function fetchLabels() {
    const response = await fetch(labelUrl);
    const text = await response.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

    lines.forEach(line => {
        const [key, friendly, category, color] = line.split(',');
        if (key && friendly) {
            labelMap[key] = {
                label: friendly.trim(),
                category: category ? category.trim() : '',
                color: color ? color.trim() : getColor()
            };
        }
    });
}

function populateDropdown() {
    const select = document.getElementById('series-select');
    select.innerHTML = '';

    headers.slice(1).forEach((header) => {
        const option = document.createElement('option');
        option.value = header;
        option.text = labelMap[header]?.label || header;
        select.appendChild(option);
    });

    select.addEventListener('change', plotData);

    if (select.options.length > 0) {
        select.selectedIndex = 0;
        plotData();
    }
}

function plotData() {
    if (!csvData.length) return;

    const select = document.getElementById('series-select');
    const selectedHeader = select.value;
    const timeHeader = headers[0];

    const xLabels = csvData.map(row => new Date(row[timeHeader]));
    const dataPoints = csvData.map(row => parseFloat(row[selectedHeader]) || 0);

    const friendlyLabel = labelMap[selectedHeader]?.label || selectedHeader;
    const lineColor = labelMap[selectedHeader]?.color || getColor();

    const dataset = {
        label: friendlyLabel,
        data: dataPoints,
        borderColor: lineColor,
        backgroundColor: lineColor + '33', 
        fill: true,
        tension: 0.4, 
        pointRadius: 2
    };

    if (chart) {
        chart.destroy();
    }

    const ctx = document.getElementById('chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xLabels,
            datasets: [dataset]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Energy Generation Over Time',
                    font: { size: 18 }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        tooltipFormat: 'MMM d, HH:mm'
                    },
                    title: {
                        display: true,
                        text: 'Date/Time'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Megawatts (MW)'
                    }
                }
            }
        }
    });
}

function getColor() {
    const colors = ['#007bff', '#dc3545', '#28a745', '#ffc107', '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14'];
    return colors[Math.floor(Math.random() * colors.length)];
}

async function init() {
    await fetchCSVData();
    await fetchLabels();
    populateDropdown();
}

document.addEventListener('DOMContentLoaded', init);
