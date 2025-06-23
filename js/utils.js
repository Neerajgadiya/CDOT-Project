// Helper Functions
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getStatusColor(status) {
    switch(status) {
        case 'paid': return 'success';
        case 'pending': return 'warning';
        case 'overdue': return 'danger';
        default: return 'secondary';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// PDF Upload and Text Extraction Functions
function setupPDFUpload() {
    const dropzone = document.getElementById('pdf-upload-area');
    const fileInput = document.getElementById('pdf-file');
    
    if (!dropzone || !fileInput) {
        console.error('PDF upload elements not found!');
        return;
    }

    // Click handler
    dropzone.addEventListener('click', (e) => {
        // Prevent triggering if clicking on child elements
        if (e.target === dropzone || e.target.tagName === 'H5' || e.target.tagName === 'P') {
            fileInput.click();
        }
    });

    // File input change handler
    fileInput.addEventListener('change', function(e) {
        if (this.files && this.files.length > 0) {
            handleFileSelect(e);
        }
    });

    // Drag and drop events
    ['dragover', 'dragenter'].forEach(event => {
        dropzone.addEventListener(event, (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });
    });

    ['dragleave', 'dragend'].forEach(event => {
        dropzone.addEventListener(event, () => {
            dropzone.classList.remove('drag-over');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            const changeEvent = new Event('change');
            fileInput.dispatchEvent(changeEvent);
        }
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const dropzone = document.getElementById('pdf-upload-area');
    
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
    }
    
    // Update UI
    dropzone.innerHTML = `
        <i class="bi bi-file-earmark-pdf text-danger"></i>
        <h5>${file.name}</h5>
        <p class="text-muted">${formatFileSize(file.size)}</p>
    `;
    
    // Auto-extract if setting is enabled
    if (document.getElementById('auto-extract')?.checked) {
        extractTextFromPDF(file);
    }
}

async function extractTextFromPDF(file) {
    if (!file) {
        alert('Please select a PDF file first');
        return;
    }

    const progressBar = document.getElementById('uploadProgress');
    const progressBarInner = progressBar.querySelector('.progress-bar');
    progressBar.style.display = 'block';
    progressBarInner.style.width = '0%';
    
    try {
        // Initialize PDF.js
        const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
        
        // Update progress
        loadingTask.onProgress = ({ loaded, total }) => {
            const progress = Math.round((loaded / total) * 100);
            progressBarInner.style.width = `${progress}%`;
            progressBarInner.setAttribute('aria-valuenow', progress);
        };
        
        const pdf = await loadingTask.promise;
        let fullText = '';
        
        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
            
            // Update progress between pages
            const pageProgress = Math.round((i / pdf.numPages) * 100);
            progressBarInner.style.width = `${pageProgress}%`;
            progressBarInner.setAttribute('aria-valuenow', pageProgress);
        }
        
        // Display extracted text
        document.getElementById('extracted-text').textContent = fullText;
        
        // Auto-populate form fields if text was extracted
        if (fullText.trim()) {
            autoPopulateForm(fullText);
        }
        
    } catch (error) {
        console.error('Error extracting text:', error);
        document.getElementById('extracted-text').textContent = 'Error extracting text from PDF: ' + error.message;
    } finally {
        progressBar.style.display = 'none';
    }
}

function autoPopulateForm(text) {
    // Try to find invoice number
    const invoiceNoMatch = text.match(/(invoice\s*no\.?|inv\.?)\s*[:#]?\s*([A-Z0-9\/-]+)/i);
    if (invoiceNoMatch && invoiceNoMatch[2]) {
        document.getElementById('invoice-number').value = invoiceNoMatch[2].trim();
    }
    
    // Try to find date (handles various date formats)
    const dateMatch = text.match(/(date|invoice date)\s*[:]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
    if (dateMatch && dateMatch[2]) {
        const dateStr = dateMatch[2];
        const dateParts = dateStr.split(/[\/\-\.]/);
        if (dateParts.length === 3) {
            let day, month, year;
            
            // Handle different date formats
            if (dateParts[0].length === 4) {
                [year, month, day] = dateParts;
            } else if (parseInt(dateParts[2]) > 31) {
                [day, month, year] = dateParts;
            } else {
                [month, day, year] = dateParts;
            }
            
            // Pad with zeros and handle 2-digit years
            day = day.padStart(2, '0');
            month = month.padStart(2, '0');
            year = year.length === 2 ? '20' + year : year;
            
            document.getElementById('invoice-date').value = `${year}-${month}-${day}`;
        }
    }
    
    // Try to find customer
    const customerMatch = text.match(/(customer|client|vendor|to)\s*[:]?\s*([^\n\r]+)/i);
    if (customerMatch && customerMatch[2]) {
        const customerName = customerMatch[2].trim();
        const customerSelect = document.getElementById('customer');
        for (let i = 0; i < customerSelect.options.length; i++) {
            if (customerSelect.options[i].text.toLowerCase().includes(customerName.toLowerCase())) {
                customerSelect.value = customerSelect.options[i].value;
                break;
            }
        }
    }
    
    // Update preview
    updateInvoicePreview();
}

function clearPDF() {
    document.getElementById('pdf-file').value = '';
    document.getElementById('pdf-upload-area').innerHTML = `
        <i class="bi bi-cloud-arrow-up"></i>
        <h5>Click to upload PDF</h5>
        <p class="text-muted">Drag & drop PDF invoice or click to browse</p>
    `;
    document.getElementById('extracted-text').textContent = 'Text will appear here after upload...';
}

function extractText() {
    const fileInput = document.getElementById('pdf-file');
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a PDF file first');
        return;
    }
    extractTextFromPDF(fileInput.files[0]);
}

function viewPDF(pdfUrl) {
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfModal = new bootstrap.Modal(document.getElementById('pdfViewerModal'));
    
    pdfViewer.src = pdfUrl;
    pdfModal.show();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupPDFUpload();
});