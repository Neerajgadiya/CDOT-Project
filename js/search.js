function initSearch() {
    setupSearchForm();
}

function setupSearchForm() {
    document.getElementById('search-invoice-no').addEventListener('input', performSearch);
    document.getElementById('search-customer').addEventListener('change', performSearch);
    document.getElementById('search-serial').addEventListener('input', performSearch);
    document.getElementById('search-date-from').addEventListener('change', performSearch);
    document.getElementById('search-date-to').addEventListener('change', performSearch);
    document.getElementById('search-type').addEventListener('change', performSearch);
    document.getElementById('search-amount-min').addEventListener('input', performSearch);
    document.getElementById('search-amount-max').addEventListener('input', performSearch);
    document.getElementById('search-item').addEventListener('input', performSearch);
    document.getElementById('search-hsn').addEventListener('input', performSearch);
    document.getElementById('search-serial-type').addEventListener('change', performSearch);
    document.getElementById('search-text').addEventListener('input', performSearch);
}

function performSearch() {
    const invoiceNo = document.getElementById('search-invoice-no').value.toLowerCase();
    const customer = document.getElementById('search-customer').value;
    const serial = document.getElementById('search-serial').value.toLowerCase();
    const dateFrom = document.getElementById('search-date-from').value;
    const dateTo = document.getElementById('search-date-to').value;
    const type = document.getElementById('search-type').value;
    const amountMin = parseFloat(document.getElementById('search-amount-min').value) || 0;
    const amountMax = parseFloat(document.getElementById('search-amount-max').value) || Infinity;
    const itemDesc = document.getElementById('search-item').value.toLowerCase();
    const hsn = document.getElementById('search-hsn').value.toLowerCase();
    const serialType = document.getElementById('search-serial-type').value;
    const text = document.getElementById('search-text').value.toLowerCase();
    
    let filtered = invoices.filter(invoice => {
        // Invoice number match
        if (invoiceNo && !invoice.id.toLowerCase().includes(invoiceNo)) return false;
        
        // Customer match
        if (customer && invoice.customer !== customer) return false;
        
        // Serial number match
        if (serial && !invoice.items.some(item => 
            item.serials.some(s => s.toLowerCase().includes(serial)))
        ) return false;
        
        // Date range
        if (dateFrom && new Date(invoice.date) < new Date(dateFrom)) return false;
        if (dateTo && new Date(invoice.date) > new Date(dateTo)) return false;
        
        // Type match
        if (type && invoice.type !== type) return false;
        
        // Amount range
        if (invoice.amount < amountMin || invoice.amount > amountMax) return false;
        
        // Item description match
        if (itemDesc && !invoice.items.some(item => 
            item.description.toLowerCase().includes(itemDesc))
        ) return false;
        
        // HSN/SAC match
        if (hsn && !invoice.items.some(item => 
            item.hsn.toLowerCase().includes(hsn))
        ) return false;
        
        // Serial type match
        if (serialType === 'with' && !invoice.hasSerials) return false;
        if (serialType === 'without' && invoice.hasSerials) return false;
        
        // Extracted text match
        if (text && !invoice.extractedText.toLowerCase().includes(text)) return false;
        
        return true;
    });
    
    // Display results
    const resultsSection = document.getElementById('search-results-section');
    const resultsBody = document.getElementById('search-results');
    
    resultsBody.innerHTML = '';
    
    if (filtered.length === 0) {
        resultsBody.innerHTML = '<tr><td colspan="7" class="text-center">No invoices found matching your criteria</td></tr>';
    } else {
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
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="showInvoiceDetails('${invoice.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            resultsBody.appendChild(row);
        });
    }
    
    resultsSection.style.display = 'block';
}

function clearSearch() {
    document.getElementById('search-invoice-no').value = '';
    document.getElementById('search-customer').value = '';
    document.getElementById('search-serial').value = '';
    document.getElementById('search-date-from').value = '';
    document.getElementById('search-date-to').value = '';
    document.getElementById('search-type').value = '';
    document.getElementById('search-amount-min').value = '';
    document.getElementById('search-amount-max').value = '';
    document.getElementById('search-item').value = '';
    document.getElementById('search-hsn').value = '';
    document.getElementById('search-serial-type').value = '';
    document.getElementById('search-text').value = '';
    
    document.getElementById('search-results-section').style.display = 'none';
}