function initDashboard() {
    loadRecentInvoices();
    initializeCharts();
    loadTopCustomers();
}

function loadRecentInvoices() {
    const tbody = document.getElementById('recent-invoices');
    tbody.innerHTML = '';
    
    // Sort by date descending and take first 5
    const recent = [...invoices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    recent.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.id}</td>
            <td>${formatDate(invoice.date)}</td>
            <td>${invoice.customer}</td>
            <td>₹${invoice.amount.toFixed(2)}</td>
            <td>${invoice.hasSerials ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">No</span>'}</td>
            <td><span class="badge bg-${getStatusColor(invoice.status)}">${capitalizeFirstLetter(invoice.status)}</span></td>
        `;
        row.addEventListener('click', () => showInvoiceDetails(invoice.id));
        row.style.cursor = 'pointer';
        tbody.appendChild(row);
    });
}

function initializeCharts() {
    // Sales by month chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(salesCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Sales (₹)',
                data: [1200000, 1800000, 1500000, 2100000, 1900000, 2400000, 2200000, 2000000, 2300000, 2500000, 2800000, 3000000],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value / 1000000) + 'M';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.raw.toLocaleString();
                        }
                    }
                }
            }
        }
    });
    
    // Serial number distribution chart
    const serialCtx = document.getElementById('serialChart').getContext('2d');
    const serialChart = new Chart(serialCtx, {
        type: 'doughnut',
        data: {
            labels: ['With Serial Numbers', 'Without Serial Numbers'],
            datasets: [{
                data: [856, 391],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(201, 203, 207, 0.7)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(201, 203, 207, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

function loadTopCustomers() {
    const tbody = document.getElementById('top-customers');
    tbody.innerHTML = '';
    
    const customers = [
        { name: 'C DOT SYSTEMS PVT LTD', invoices: 42, total: 1250000, lastPurchase: '2025-06-15' },
        { name: 'ALTAA VISTAA BUSINESS SOLUTIONS PVT LTD', invoices: 38, total: 980000, lastPurchase: '2025-06-10' },
        { name: 'EXFO SALES AND SERVICES INDIA PVT. LTD.', invoices: 35, total: 875000, lastPurchase: '2025-06-05' },
        { name: 'DCC INFOTECH PVT LTD', invoices: 28, total: 720000, lastPurchase: '2025-05-28' },
        { name: 'SNA INFOTECH PVT LTD', invoices: 22, total: 550000, lastPurchase: '2025-05-20' }
    ];
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.invoices}</td>
            <td>₹${customer.total.toLocaleString()}</td>
            <td>₹${Math.round(customer.total / customer.invoices).toLocaleString()}</td>
            <td>${formatDate(customer.lastPurchase)}</td>
        `;
        tbody.appendChild(row);
    });
}