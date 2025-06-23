function initInvoices() {
    loadAllInvoices();
    setupInvoiceForm();
}

function loadAllInvoices() {
    const tbody = document.getElementById('all-invoices');
    tbody.innerHTML = '';
    
    invoices.forEach(invoice => {
        const serialCount = invoice.items.reduce((count, item) => count + item.serials.length, 0);
        const itemCount = invoice.items.length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.id}</td>
            <td>${formatDate(invoice.date)}</td>
            <td>${invoice.customer}</td>
            <td>${itemCount} item(s)</td>
            <td>${serialCount} serial(s)</td>
            <td>₹${invoice.amount.toFixed(2)}</td>
            <td><span class="badge bg-${getStatusColor(invoice.status)}">${capitalizeFirstLetter(invoice.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="showInvoiceDetails('${invoice.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function setupInvoiceForm() {
    // Add event listeners for invoice form
    document.getElementById('invoice-search').addEventListener('input', searchInvoices);
}

function searchInvoices(e) {
    const query = e.target.value.toLowerCase();
    
    if (query.length < 2) {
        loadAllInvoices();
        return;
    }
    
    const filtered = invoices.filter(invoice => 
        invoice.id.toLowerCase().includes(query) || 
        invoice.customer.toLowerCase().includes(query) ||
        invoice.items.some(item => 
            item.description.toLowerCase().includes(query) ||
            item.serials.some(serial => serial.toLowerCase().includes(query))
        )
    );
    
    const tbody = document.getElementById('all-invoices');
    tbody.innerHTML = '';
    
    filtered.forEach(invoice => {
        const serialCount = invoice.items.reduce((count, item) => count + item.serials.length, 0);
        const itemCount = invoice.items.length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.id}</td>
            <td>${formatDate(invoice.date)}</td>
            <td>${invoice.customer}</td>
            <td>${itemCount} item(s)</td>
            <td>${serialCount} serial(s)</td>
            <td>₹${invoice.amount.toFixed(2)}</td>
            <td><span class="badge bg-${getStatusColor(invoice.status)}">${capitalizeFirstLetter(invoice.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="showInvoiceDetails('${invoice.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterInvoices(criteria) {
    let filtered = [];
    
    switch(criteria) {
        case 'all':
            filtered = invoices;
            break;
        case 'with-serial':
            filtered = invoices.filter(inv => inv.hasSerials);
            break;
        case 'no-serial':
            filtered = invoices.filter(inv => !inv.hasSerials);
            break;
        case 'last-month':
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            filtered = invoices.filter(inv => new Date(inv.date) >= oneMonthAgo);
            break;
    }
    
    const tbody = document.getElementById('all-invoices');
    tbody.innerHTML = '';
    
    filtered.forEach(invoice => {
        const serialCount = invoice.items.reduce((count, item) => count + item.serials.length, 0);
        const itemCount = invoice.items.length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.id}</td>
            <td>${formatDate(invoice.date)}</td>
            <td>${invoice.customer}</td>
            <td>${itemCount} item(s)</td>
            <td>${serialCount} serial(s)</td>
            <td>₹${invoice.amount.toFixed(2)}</td>
            <td><span class="badge bg-${getStatusColor(invoice.status)}">${capitalizeFirstLetter(invoice.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="showInvoiceDetails('${invoice.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function exportInvoices() {
    alert('Invoices exported to CSV file!');
}

function printInvoices() {
    alert('Invoice list sent to printer!');
}

function printSelectedInvoice() {
    alert('Invoice sent to printer!');
}

// Add new item row to invoice form
function addItemRow() {
    const tbody = document.getElementById('invoice-items');
    const rowCount = tbody.children.length;
    
    const row = document.createElement('tr');
    row.id = `item-row-${rowCount}`;
    row.innerHTML = `
        <td>
            <input type="text" class="form-control form-control-sm item-desc" placeholder="Description" onchange="updateInvoicePreview()">
            <div class="form-check mt-2">
                <input class="form-check-input item-has-serial" type="checkbox" id="has-serial-${rowCount}" checked>
                <label class="form-check-label" for="has-serial-${rowCount}">Has serial numbers</label>
            </div>
        </td>
        <td><input type="text" class="form-control form-control-sm item-hsn" placeholder="HSN/SAC" onchange="updateInvoicePreview()"></td>
        <td><input type="number" class="form-control form-control-sm item-qty" value="1" min="1" onchange="calculateItemAmount(${rowCount}); updateInvoicePreview()"></td>
        <td><input type="number" class="form-control form-control-sm item-rate" value="0" min="0" step="0.01" onchange="calculateItemAmount(${rowCount}); updateInvoicePreview()"></td>
        <td class="item-amount">₹0.00</td>
        <td>
            <button class="btn btn-sm btn-outline-primary" onclick="showSerialsForItem(${rowCount})">
                <i class="bi bi-upc-scan"></i>
            </button>
        </td>
        <td>
            <button class="btn btn-sm btn-outline-danger" onclick="removeItemRow(${rowCount})">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
    calculateTotals();
}

// Remove item row from invoice form
function removeItemRow(rowId) {
    const row = document.getElementById(`item-row-${rowId}`);
    if (row) {
        row.remove();
        renumberItemRows();
        calculateTotals();
        updateInvoicePreview();
    }
}

// Renumber item rows after deletion
function renumberItemRows() {
    const tbody = document.getElementById('invoice-items');
    Array.from(tbody.children).forEach((row, index) => {
        row.id = `item-row-${index}`;
        const checkbox = row.querySelector('.form-check-input');
        if (checkbox) {
            checkbox.id = `has-serial-${index}`;
            row.querySelector('.form-check-label').htmlFor = `has-serial-${index}`;
        }
        const btn = row.querySelector('button.btn-outline-primary');
        if (btn) {
            btn.setAttribute('onclick', `showSerialsForItem(${index})`);
        }
        const delBtn = row.querySelector('button.btn-outline-danger');
        if (delBtn) {
            delBtn.setAttribute('onclick', `removeItemRow(${index})`);
        }
    });
}

// Calculate item amount
function calculateItemAmount(rowId) {
    const row = document.getElementById(`item-row-${rowId}`);
    if (!row) return;
    
    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
    const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
    const amount = qty * rate;
    
    row.querySelector('.item-amount').textContent = `₹${amount.toFixed(2)}`;
    calculateTotals();
}

// Calculate invoice totals
function calculateTotals() {
    const rows = document.getElementById('invoice-items').children;
    let subtotal = 0;
    
    Array.from(rows).forEach(row => {
        const amountText = row.querySelector('.item-amount').textContent;
        const amount = parseFloat(amountText.replace('₹', '')) || 0;
        subtotal += amount;
    });
    
    const taxRate = 18; // Default tax rate
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

// Update invoice preview
function updateInvoicePreview() {
    const invoiceNo = document.getElementById('invoice-number').value || '-';
    const invoiceDate = document.getElementById('invoice-date').value || '-';
    const invoiceType = document.getElementById('invoice-type').value || '-';
    const dueDate = document.getElementById('due-date').value || '-';
    const customerSelect = document.getElementById('customer');
    const customer = customerSelect.options[customerSelect.selectedIndex].text || '-';
    
    document.getElementById('preview-invoice-no').textContent = invoiceNo;
    document.getElementById('preview-date').textContent = formatDate(invoiceDate);
    document.getElementById('preview-type').textContent = capitalizeFirstLetter(invoiceType);
    document.getElementById('preview-due-date').textContent = dueDate ? formatDate(dueDate) : '-';
    document.getElementById('preview-customer').textContent = customer;
    
    // Update items in preview
    const previewItems = document.getElementById('preview-items');
    previewItems.innerHTML = '';
    
    const rows = document.getElementById('invoice-items').children;
    let subtotal = 0;
    
    Array.from(rows).forEach(row => {
        const desc = row.querySelector('.item-desc').value || 'Item';
        const qty = row.querySelector('.item-qty').value || 0;
        const rate = row.querySelector('.item-rate').value || 0;
        const amount = (parseFloat(qty) * parseFloat(rate)) || 0;
        subtotal += amount;
        
        const itemRow = document.createElement('tr');
        itemRow.innerHTML = `
            <td>${desc}</td>
            <td>${qty}</td>
            <td>₹${parseFloat(rate).toFixed(2)}</td>
            <td>₹${amount.toFixed(2)}</td>
        `;
        previewItems.appendChild(itemRow);
    });
    
    const taxRate = 18; // Default tax rate
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    
    document.getElementById('preview-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('preview-tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('preview-total').textContent = `₹${total.toFixed(2)}`;
}

// Show serial numbers for a specific item
function showSerialsForItem(rowId) {
    const row = document.getElementById(`item-row-${rowId}`);
    if (!row) return;
    
    const hasSerial = row.querySelector('.item-has-serial').checked;
    if (!hasSerial) {
        alert('This item is marked as not having serial numbers. Please check the "Has serial numbers" checkbox if you want to add serials.');
        return;
    }
    
    const desc = row.querySelector('.item-desc').value || `Item ${rowId + 1}`;
    const qty = parseInt(row.querySelector('.item-qty').value) || 1;
    
    // Clear scanned serials
    document.getElementById('scanned-serials').innerHTML = '';
    document.getElementById('serial-scanner').value = '';
    document.getElementById('serial-scanner').focus();
    
    // Show message about how many serials needed
    alert(`Please scan or enter ${qty} serial number(s) for: ${desc}`);
    
    // Store the current row ID in a global variable
    window.currentItemRow = rowId;
}

// Handle serial number scanning
document.getElementById('serial-scanner').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const serial = this.value.trim();
        if (serial) {
            const scannedDiv = document.getElementById('scanned-serials');
            const badge = document.createElement('span');
            badge.className = 'badge bg-primary serial-number-badge me-2 mb-2';
            badge.textContent = serial;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn-close btn-close-white btn-sm';
            removeBtn.style.fontSize = '0.5rem';
            removeBtn.onclick = function() {
                badge.remove();
            };
            
            badge.appendChild(removeBtn);
            scannedDiv.appendChild(badge);
            this.value = '';
        }
    }
});

// Assign scanned serials to item
function assignSerials() {
    if (typeof window.currentItemRow === 'undefined') {
        alert('Please select an item first by clicking the scan button next to it.');
        return;
    }
    
    const scannedBadges = document.getElementById('scanned-serials').querySelectorAll('.badge');
    const serials = Array.from(scannedBadges).map(badge => badge.textContent.replace('×', '').trim());
    
    const row = document.getElementById(`item-row-${window.currentItemRow}`);
    if (row) {
        const qty = parseInt(row.querySelector('.item-qty').value) || 1;
        
        if (serials.length !== qty) {
            alert(`Warning: Item quantity is ${qty} but you've entered ${serials.length} serial number(s).`);
        }
        
        // In a real app, you would store these serials with the item
        alert(`Assigned ${serials.length} serial number(s) to this item: ${serials.join(', ')}`);
        
        // Clear scanned serials
        document.getElementById('scanned-serials').innerHTML = '';
        window.currentItemRow = undefined;
    }
}

// Save new invoice
function saveInvoice() {
    const invoiceNo = document.getElementById('invoice-number').value;
    const invoiceDate = document.getElementById('invoice-date').value;
    const invoiceType = document.getElementById('invoice-type').value;
    const dueDate = document.getElementById('due-date').value;
    const customerId = document.getElementById('customer').value;
    const customerSelect = document.getElementById('customer');
    const customer = customerSelect.options[customerSelect.selectedIndex].text;
    const notes = document.getElementById('notes').value;
    const extractedText = document.getElementById('extracted-text').textContent;
    const fileInput = document.getElementById('pdf-file');
    
    if (!invoiceNo || !invoiceDate || !invoiceType || !customerId) {
        alert('Please fill in all required fields (marked with *)');
        return;
    }
    
    // Collect items
    const items = [];
    const rows = document.getElementById('invoice-items').children;
    let hasSerials = false;
    
    Array.from(rows).forEach(row => {
        const desc = row.querySelector('.item-desc').value;
        const hsn = row.querySelector('.item-hsn').value;
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const amount = qty * rate;
        const itemHasSerial = row.querySelector('.item-has-serial').checked;
        
        if (itemHasSerial) hasSerials = true;
        
        items.push({
            description: desc,
            hsn: hsn,
            quantity: qty,
            rate: rate,
            amount: amount,
            serials: [] // In a real app, you would get these from the scanned serials
        });
    });
    
    if (items.length === 0) {
        alert('Please add at least one item to the invoice');
        return;
    }
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = 18; // Default tax rate
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    
    // Create new invoice object
    const newInvoice = {
        id: invoiceNo,
        date: invoiceDate,
        customer: customer,
        type: invoiceType,
        amount: total,
        status: 'pending',
        items: items,
        hasSerials: hasSerials,
        extractedText: extractedText,
        fileUrl: fileInput.files.length > 0 ? URL.createObjectURL(fileInput.files[0]) : null
    };
    
    // Add to invoices array
    invoices.push(newInvoice);
    
    // Update UI
    loadRecentInvoices();
    loadAllInvoices();
    
    // Show success message
    alert('Invoice saved successfully!');
    
    // Clear form
    clearForm();
    
    // Switch to invoices tab
    showTab('invoices');
}

// Clear invoice form
function clearForm() {
    document.getElementById('invoice-number').value = '';
    document.getElementById('invoice-date').valueAsDate = new Date();
    document.getElementById('invoice-type').value = '';
    document.getElementById('due-date').value = '';
    document.getElementById('customer').value = '';
    document.getElementById('notes').value = '';
    
    // Clear items
    document.getElementById('invoice-items').innerHTML = '';
    addItemRow();
    
    // Clear PDF
    clearPDF();
    
    // Update preview
    updateInvoicePreview();
}

// Save as draft
function saveDraft() {
    alert('Draft saved successfully!');
}

// Print invoice
function printInvoice() {
    alert('Invoice printed and saved!');
    saveInvoice();
}