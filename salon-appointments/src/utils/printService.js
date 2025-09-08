export const printInvoice = (invoiceData) => {
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice Print</title>
      <style>
        body { 
          font-family: 'Monospace', monospace; 
          width: 80mm; 
          margin: 0; 
          padding: 10px;
          font-size: 14px;
        }
        .header { text-align: center; margin-bottom: 10px; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 3px 0; }
        .total { font-weight: bold; font-size: 16px; }
        @media print {
          body { width: 80mm; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>BEAUTY SALON</h2>
        <p>123 Beauty Street, City</p>
        <p>GST: GST123456789</p>
      </div>
      
      <div class="divider"></div>
      
      <div>
        <p><strong>Invoice:</strong> ${invoiceData.invoiceNumber}</p>
        <p><strong>Date:</strong> ${invoiceData.date}</p>
        <p><strong>Time:</strong> ${invoiceData.time}</p>
      </div>
      
      <div class="divider"></div>
      
      <div>
        <p><strong>Customer:</strong> ${invoiceData.customer.name}</p>
        <p><strong>Phone:</strong> ${invoiceData.customer.phone}</p>
      </div>
      
      <div class="divider"></div>
      
      <table>
        <tr>
          <th>Service</th>
          <th class="text-right">Amount</th>
        </tr>
        ${invoiceData.services.map(service => `
          <tr>
            <td>${service.name}</td>
            <td class="text-right">₹${service.price}</td>
          </tr>
        `).join('')}
      </table>
      
      <div class="divider"></div>
      
      <table>
        <tr>
          <td>Subtotal:</td>
          <td class="text-right">₹${invoiceData.subtotal}</td>
        </tr>
        <tr>
          <td>GST (18%):</td>
          <td class="text-right">₹${invoiceData.tax}</td>
        </tr>
        <tr class="total">
          <td>TOTAL:</td>
          <td class="text-right">₹${invoiceData.total}</td>
        </tr>
      </table>
      
      <div class="divider"></div>
      
      <p><strong>Payment Mode:</strong> ${invoiceData.paymentMethod}</p>
      <p><strong>Staff:</strong> ${invoiceData.staff}</p>
      
      <div class="divider"></div>
      
      <p class="text-center">Thank You! Visit Again!</p>
      <p class="text-center">${new Date().toLocaleDateString()}</p>
      
      <div class="no-print" style="margin-top: 20px;">
        <button onclick="window.print()">Print Now</button>
        <button onclick="window.close()">Close</button>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=300,height=600');
  printWindow.document.write(printContent);
  printWindow.document.close();
};