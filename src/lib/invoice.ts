import { Vehicle, SaleRecord, formatPrice } from '../data/mockData';

export interface DealershipInfo {
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  email: string;
  website: string;
  gstin?: string;
  pan?: string;
  stateCode?: string;
}

export const PATEL_MOTORS_DEALERSHIP: DealershipInfo = {
  name: "Patel Motors",
  tagline: "Buy, Sell & Exchange Premium Pre-Owned Two Wheelers",
  address: "Basement 2, Kohinoor Square, East Tower, N C. Kelkar Rd, Ram Ganesh Gadkari Chowk, Dadar West",
  city: "Mumbai",
  state: "Maharashtra",
  pinCode: "400028",
  phone: "+91 84520 88500",
  email: "sales@patelmotors.in",
  website: "https://maps.app.goo.gl/5puPNNYsbCpFjaPbA",
  gstin: "27AABCP1234F1Z8",
  pan: "AABCP1234F",
  stateCode: "27 (Maharashtra)"
};

/**
 * Converts a number into Indian currency words representation
 * e.g. 1580000 -> "Fifteen Lakh Eighty Thousand Rupees Only"
 */
export function numberToWordsIndian(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Zero Rupees Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertHundreds(n: number): string {
    let str = '';
    if (n > 99) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '') + ' ';
    } else if (n > 0) {
      str += units[n] + ' ';
    }
    return str.trim();
  }

  let num = Math.floor(Math.abs(amount));
  let result = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remainder = num;

  if (crore > 0) {
    result += convertHundreds(crore) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertHundreds(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertHundreds(thousand) + ' Thousand ';
  }
  if (remainder > 0) {
    result += convertHundreds(remainder) + ' ';
  }

  return (result.trim() + ' Rupees Only');
}

export function generateInvoiceNumber(bike?: Vehicle): string {
  const currentYear = new Date().getFullYear();
  const nextYearShort = String(currentYear + 1).slice(-2);
  const finYear = `${currentYear}-${nextYearShort}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bikePrefix = bike?.make ? bike.make.substring(0, 3).toUpperCase() : 'MOT';
  return `PM/${finYear}/${bikePrefix}-${randomSuffix}`;
}

export function generateInvoiceHtml(bike: Vehicle, sale: SaleRecord, dealership: DealershipInfo = PATEL_MOTORS_DEALERSHIP): string {
  const salePriceFormatted = formatPrice(sale.salePrice);
  const rtoFormatted = sale.rtoCharges ? formatPrice(sale.rtoCharges) : (sale.taxAmount ? formatPrice(sale.taxAmount) : '₹0');
  const discountFormatted = sale.discount ? formatPrice(sale.discount) : '₹0';
  const finalFormatted = formatPrice(sale.finalAmount);
  const paidFormatted = formatPrice(sale.amountPaid);
  const balanceFormatted = formatPrice(sale.balanceDue);
  const amountWords = numberToWordsIndian(sale.finalAmount);

  const deliveryTime = sale.deliveryTime || '11:00 AM IST';
  const deliveryDate = sale.saleDate || new Date().toISOString().split('T')[0];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sale Invoice #${sale.invoiceNumber} - ${dealership.name}</title>
  <style>
    @page { 
      size: A4 portrait; 
      margin: 10mm; 
    }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 16px;
      font-size: 11px;
      line-height: 1.4;
      background: #f8fafc;
    }
    .invoice-wrapper {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1.5px solid #0f172a;
      padding: 24px 28px;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    /* Header */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 14px;
    }
    .brand-section {
      flex: 1;
    }
    .brand-name {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #09090b;
      margin: 0;
      line-height: 1;
    }
    .brand-sub {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #ea580c;
      margin-top: 4px;
    }
    .brand-info {
      font-size: 10px;
      color: #334155;
      margin-top: 6px;
      line-height: 1.4;
    }
    .invoice-header-meta {
      text-align: right;
      min-width: 200px;
    }
    .doc-badge {
      display: inline-block;
      background: #0f172a;
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 2px;
      margin-bottom: 6px;
    }
    .invoice-no {
      font-size: 13px;
      font-weight: 800;
      color: #09090b;
      font-family: monospace;
    }
    .meta-line {
      font-size: 10.5px;
      color: #475569;
      margin-top: 2px;
    }
    .meta-line strong {
      color: #09090b;
    }
    .status-pill {
      display: inline-block;
      font-weight: 800;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 3px;
      text-transform: uppercase;
      margin-top: 4px;
      background: ${sale.paymentStatus === 'Paid in Full' ? '#dcfce7; color: #15803d;' : '#fef3c7; color: #b45309;'};
    }

    /* Two Columns */
    .columns-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .info-card {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      padding: 10px 12px;
      border-radius: 4px;
    }
    .info-card-header {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .info-card-body {
      font-size: 10.5px;
      line-height: 1.45;
      color: #1e293b;
    }
    .info-card-body strong {
      color: #09090b;
      font-size: 11.5px;
    }

    /* Vehicle details specs grid */
    .bike-specs-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    .bike-specs-table td {
      padding: 2px 4px;
      font-size: 10px;
      border: none;
    }
    .bike-specs-table td.label {
      color: #64748b;
      width: 38%;
      font-weight: 600;
    }
    .bike-specs-table td.val {
      color: #09090b;
      font-weight: 700;
    }

    /* Table */
    .line-items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      border: 1px solid #cbd5e1;
    }
    .line-items-table th {
      background: #0f172a;
      color: #ffffff;
      padding: 7px 10px;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: left;
    }
    .line-items-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 10.5px;
      vertical-align: top;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }

    /* Summary & Totals */
    .bottom-split {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }
    .payment-details-box {
      border: 1px solid #cbd5e1;
      padding: 10px 12px;
      border-radius: 4px;
      background: #f8fafc;
    }
    .payment-title {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .payment-row {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      padding: 2.5px 0;
      color: #334155;
    }
    .payment-row strong {
      color: #09090b;
    }
    .words-box {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed #cbd5e1;
      font-size: 10px;
      color: #475569;
    }
    .words-box strong {
      color: #09090b;
      text-transform: capitalize;
    }

    .totals-box {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      padding: 10px 14px;
      border-radius: 4px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 3.5px 0;
      font-size: 10.5px;
      color: #475569;
    }
    .totals-row.grand-total {
      border-top: 2px solid #0f172a;
      padding-top: 6px;
      margin-top: 4px;
      font-size: 13px;
      font-weight: 900;
      color: #09090b;
    }
    .totals-row.amount-paid {
      color: #15803d;
      font-weight: 700;
    }
    .totals-row.balance {
      color: ${sale.balanceDue > 0 ? '#b91c1c' : '#64748b'};
      font-weight: 700;
    }

    /* Terms & Signatures */
    .terms-box {
      border-top: 1px solid #cbd5e1;
      padding-top: 10px;
      margin-bottom: 16px;
      font-size: 9px;
      color: #475569;
      line-height: 1.45;
    }
    .terms-title {
      font-weight: 800;
      color: #09090b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .signatures-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 14px;
      border-top: 1px dashed #cbd5e1;
    }
    .sig-col {
      text-align: center;
      width: 220px;
    }
    .sig-line {
      border-bottom: 1px solid #09090b;
      height: 35px;
      margin-bottom: 6px;
    }
    .sig-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #09090b;
    }
    .sig-sub {
      font-size: 9px;
      color: #64748b;
    }

    .no-print {
      max-width: 820px;
      margin: 12px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .print-btn {
      background: #0f172a;
      color: #ffffff;
      padding: 8px 18px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 640px) {
      body { padding: 6px; font-size: 10px; }
      .invoice-wrapper { padding: 12px 14px; border-width: 1px; }
      .top-bar { flex-direction: column; gap: 10px; }
      .invoice-header-meta { text-align: left; min-width: auto; }
      .columns-grid { grid-template-columns: 1fr; gap: 8px; }
      .brand-name { font-size: 20px; }
      .specs-grid { grid-template-columns: 1fr; }
      .footer-signatures { flex-direction: row; justify-content: space-between; gap: 8px; }
      .sig-col { width: 45%; }
    }

    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-wrapper { border: 1px solid #000; box-shadow: none; padding: 16px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div style="font-size: 12px; color: #475569; font-weight: 600;">
      Official Sale Invoice & Delivery Receipt • ${dealership.name}
    </div>
    <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
  </div>

  <div class="invoice-wrapper">
    <!-- Top Dealership Header -->
    <div class="top-bar">
      <div class="brand-section">
        <h1 class="brand-name">${dealership.name}</h1>
        <div class="brand-sub">${dealership.tagline}</div>
        <div class="brand-info">
          ${dealership.address}<br />
          ${dealership.city}, ${dealership.state} - ${dealership.pinCode}<br />
          Phone: ${dealership.phone} | Email: ${dealership.email}<br />
          GSTIN: <strong>${dealership.gstin || '27AABCP1234F1Z8'}</strong> | PAN: <strong>${dealership.pan || 'AABCP1234F'}</strong> | State Code: <strong>${dealership.stateCode || '27'}</strong>
        </div>
      </div>
      <div class="invoice-header-meta">
        <div class="doc-badge">Vehicle Sale Invoice & Challan</div>
        <div class="invoice-no">#${sale.invoiceNumber}</div>
        <div class="meta-line">Date: <strong>${deliveryDate}</strong></div>
        <div class="meta-line">Delivery Time: <strong>${deliveryTime}</strong></div>
        <div><span class="status-pill">${sale.paymentStatus}</span></div>
      </div>
    </div>

    <!-- 2 Column Customer & Vehicle Record -->
    <div class="columns-grid">
      <!-- Customer Information Card -->
      <div class="info-card">
        <div class="info-card-header">1. Purchaser / Customer Details</div>
        <div class="info-card-body">
          <strong>${sale.customerName}</strong><br />
          Contact: <strong>${sale.customerPhone}</strong><br />
          ${sale.customerEmail ? `Email: ${sale.customerEmail}<br />` : ''}
          ${sale.customerAddress ? `Address: ${sale.customerAddress}<br />` : 'Address: Mumbai, Maharashtra<br />'}
          ${sale.customerIdentity ? `ID / Aadhar / PAN: <strong>${sale.customerIdentity}</strong><br />` : ''}
          ${sale.customerGst ? `Customer GSTIN: <span style="font-family: monospace;">${sale.customerGst}</span><br />` : ''}
        </div>
      </div>

      <!-- Vehicle Particulars Card -->
      <div class="info-card">
        <div class="info-card-header">2. Vehicle Particulars & RTO Record</div>
        <div class="info-card-body">
          <strong>${bike.year} ${bike.make} ${bike.model} ${bike.variant ? `(${bike.variant})` : ''}</strong>
          <table class="bike-specs-table">
            <tr>
              <td class="label">Reg. Number:</td>
              <td class="val" style="font-family: monospace; font-size: 11px;">${bike.registration || 'Unregistered / In-Process'}</td>
            </tr>
            <tr>
              <td class="label">Chassis / VIN:</td>
              <td class="val" style="font-family: monospace;">${bike.chassisNumber || 'Verified on Chassis'}</td>
            </tr>
            <tr>
              <td class="label">Engine Number:</td>
              <td class="val" style="font-family: monospace;">${bike.engineNumber || 'Verified on Crankcase'}</td>
            </tr>
            <tr>
              <td class="label">Odometer:</td>
              <td class="val">${bike.mileage.toLocaleString('en-IN')} KM</td>
            </tr>
            <tr>
              <td class="label">Engine / Color:</td>
              <td class="val">${bike.engine || (bike.engineCC ? `${bike.engineCC} cc` : 'Standard')} • ${bike.color || 'Standard'}</td>
            </tr>
            <tr>
              <td class="label">Ownership / Fuel:</td>
              <td class="val">${bike.ownership || '1st Owner'} • ${bike.fuelType || 'Petrol'}</td>
            </tr>
            <tr>
              <td class="label">Insurance / RTO:</td>
              <td class="val">${sale.insuranceCompany || bike.insuranceStatus || 'Valid'} • ${bike.rcStatus || 'Clear Mumbai Title'}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>

    <!-- Table of Charges & Consideration -->
    <table class="line-items-table">
      <thead>
        <tr>
          <th style="width: 5%;" class="text-center">#</th>
          <th style="width: 50%;">Description of Goods / Particulars</th>
          <th style="width: 15%;" class="text-center">Year / Make</th>
          <th style="width: 15%;" class="text-center">Odo (KM)</th>
          <th style="width: 15%;" class="text-right">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center">1</td>
          <td>
            <strong>${bike.make} ${bike.model} ${bike.variant || ''}</strong>
            <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">
              Pre-owned motorcycle sold in verified showroom condition. Verified clear title, 50-point technical inspection certified.
            </div>
            <div style="font-size: 9px; color: #475569; margin-top: 3px; font-family: monospace;">
              Reg: ${bike.registration || 'N/A'} | Chassis: ${bike.chassisNumber || 'Verified'}
            </div>
          </td>
          <td class="text-center">${bike.year}</td>
          <td class="text-center" style="font-family: monospace;">${bike.mileage.toLocaleString('en-IN')}</td>
          <td class="text-right" style="font-weight: 700; font-family: monospace;">${salePriceFormatted}</td>
        </tr>
        ${sale.rtoCharges || sale.taxAmount ? `
        <tr>
          <td class="text-center">2</td>
          <td>
            <strong>RTO Documentation & Ownership Transfer Processing</strong>
            <div style="font-size: 9.5px; color: #64748b;">Government fee, RTO paperwork filing, Form 29 & Form 30 verification.</div>
          </td>
          <td class="text-center">-</td>
          <td class="text-center">-</td>
          <td class="text-right" style="font-weight: 700; font-family: monospace;">${rtoFormatted}</td>
        </tr>` : ''}
      </tbody>
    </table>

    <!-- Bottom Split: Payment Settlement + Financial Totals -->
    <div class="bottom-split">
      <div class="payment-details-box">
        <div class="payment-title">Payment & Settlement Details</div>
        <div class="payment-row">
          <span>Payment Mode:</span>
          <strong>${sale.paymentMethod}</strong>
        </div>
        ${sale.paymentRef ? `
        <div class="payment-row">
          <span>Transaction Ref / UTR:</span>
          <strong style="font-family: monospace;">${sale.paymentRef}</strong>
        </div>` : ''}
        ${sale.hypothecation ? `
        <div class="payment-row">
          <span>Hypothecation Status:</span>
          <strong>${sale.hypothecation}</strong>
        </div>` : ''}
        <div class="payment-row">
          <span>Payment Status:</span>
          <strong style="color: ${sale.paymentStatus === 'Paid in Full' ? '#15803d' : '#b45309'};">${sale.paymentStatus}</strong>
        </div>
        <div class="words-box">
          Amount in Words:<br />
          <strong>${amountWords}</strong>
        </div>
      </div>

      <div class="totals-box">
        <div class="totals-row">
          <span>Agreed Vehicle Price:</span>
          <span style="font-family: monospace; font-weight: 600;">${salePriceFormatted}</span>
        </div>
        ${(sale.rtoCharges || sale.taxAmount) ? `
        <div class="totals-row">
          <span>RTO / Transfer Charges:</span>
          <span style="font-family: monospace;">+${rtoFormatted}</span>
        </div>` : ''}
        ${sale.discount ? `
        <div class="totals-row" style="color: #b91c1c;">
          <span>Special Dealer Discount:</span>
          <span style="font-family: monospace;">-${discountFormatted}</span>
        </div>` : ''}
        <div class="totals-row grand-total">
          <span>Total Net Invoice:</span>
          <span style="font-family: monospace;">${finalFormatted}</span>
        </div>
        <div class="totals-row amount-paid">
          <span>Amount Paid (${sale.paymentMethod}):</span>
          <span style="font-family: monospace;">${paidFormatted}</span>
        </div>
        ${sale.balanceDue > 0 ? `
        <div class="totals-row balance">
          <span>Balance Due:</span>
          <span style="font-family: monospace;">${balanceFormatted}</span>
        </div>` : `
        <div class="totals-row" style="color: #15803d; font-size: 10px; font-weight: 700;">
          <span>Balance Payable:</span>
          <span>NIL (Fully Settled)</span>
        </div>`}
      </div>
    </div>

    <!-- Terms, RTO Transfer & Undertaking -->
    <div class="terms-box">
      <div class="terms-title">Terms & Delivery Undertaking (Motor Vehicles Act)</div>
      1. <strong>Delivery & Inspection:</strong> The purchaser confirms having physically inspected and test-driven the motorcycle and acknowledges taking possession in fully satisfactory running condition.<br />
      2. <strong>Transfer of Liability:</strong> From the date (${deliveryDate}) and time (${deliveryTime}) of physical delivery, all traffic fines, e-challans, third-party claims, and road liabilities rest exclusively with the purchaser.<br />
      3. <strong>Title & Ownership:</strong> Patel Motors warrants genuine odometer reading, non-accidental chassis, and clear unencumbered title. Forms 29 & 30 have been signed for transfer at the concerned RTO.<br />
      4. <strong>Subject to Jurisdiction:</strong> Any dispute arising out of this transaction shall be subject to the exclusive jurisdiction of the Courts in Mumbai.
    </div>

    <!-- Dual Signatures -->
    <div class="signatures-section">
      <div class="sig-col">
        <div class="sig-line"></div>
        <div class="sig-title">Purchaser's Signature</div>
        <div class="sig-sub">${sale.customerName} (Buyer)</div>
      </div>

      <div class="sig-col">
        <div style="font-size: 8px; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px;">Dealership Seal</div>
        <div class="sig-line"></div>
        <div class="sig-title">For PATEL MOTORS</div>
        <div class="sig-sub">Authorized Signatory (Dadar West, Mumbai)</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function printInvoice(bike: Vehicle, sale: SaleRecord): void {
  const html = generateInvoiceHtml(bike, sale);
  
  // Try popup window first if allowed
  try {
    const printWindow = window.open('', '_blank', 'width=950,height=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 400);
      return;
    }
  } catch (e) {
    // Popup was blocked or restricted by iframe sandbox
  }

  // Robust iframe fallback that works cleanly inside sandboxed iframes
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }, 400);
    }
  } catch (err) {
    console.error('Invoice printing failed:', err);
  }
}
