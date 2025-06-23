// Set PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// Sample data for the application
let invoices = [
    {
        id: 'ID2526-SI0023700',
        date: '2025-06-13',
        customer: 'C-DOT SYSTEMS PVT LTD',
        type: 'sale',
        amount: 9000.00,
        status: 'paid',
        items: [
            {
                description: 'EPSON INK BOTTLE 7741 BK',
                hsn: '32151190',
                quantity: 15,
                rate: 508.47,
                amount: 7627.12,
                serials: []
            }
        ],
        hasSerials: false,
        extractedText: "Invoice No: ID2526-SI0023700\nDate: 13/06/2025\nCustomer: C-DOT SYSTEMS PVT LTD\nItems: EPSON INK BOTTLE 7741 BK\nQuantity: 15\nRate: 508.47\nAmount: 7627.12",
        fileUrl: "data:application/pdf;base64,..."
    },
    {
        id: '6/25-26/366',
        date: '2025-06-16',
        customer: 'ALTAA VISTAA BUSINESS SOLUTIONS PVT LTD',
        type: 'sale',
        amount: 15340.00,
        status: 'pending',
        items: [
            {
                description: 'Dell Docking Station WD22TB4',
                hsn: '84733099',
                quantity: 1,
                rate: 13000.00,
                amount: 13000.00,
                serials: ['CN0T7G63CMC0049K0873']
            }
        ],
        hasSerials: true,
        extractedText: "Invoice No: 6/25-26/366\nDate: 16/06/2025\nCustomer: ALTAA VISTAA BUSINESS SOLUTIONS PVT LTD\nItems: Dell Docking Station WD22TB4\nSerial: CN0T7G63CMC0049K0873\nQuantity: 1\nRate: 13000.00\nAmount: 13000.00",
        fileUrl: "data:application/pdf;base64,..."
    }
];

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initDashboard();
    initInvoices();
    initSearch();
    initReports();
    initSettings();
    
    
    // Set today's date as default for new invoices
    document.getElementById('invoice-date').valueAsDate = new Date();
    
    // Add first empty item row
    addItemRow();
    
    // Set up PDF upload functionality
    setupPDFUpload();
});

// Function to show a specific tab
function showTab(tabId) {
    const tab = document.getElementById(tabId);
    const tabInstance = new bootstrap.Tab(tab);
    tabInstance.show();
}