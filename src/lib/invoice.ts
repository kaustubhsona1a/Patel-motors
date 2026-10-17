import { Vehicle, SaleRecord, AcquisitionRecord, formatPrice } from '../data/mockData';
import { PATEL_MOTORS_LOGO_DATA_URI, PATEL_MOTORS_LOGO_SVG_RAW } from '../components/PatelMotorsLogo';

export interface DealershipInfo {
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  buyPhone?: string;
  sellPhone?: string;
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
  phone: "+91 98196 55210",
  buyPhone: "+91 98196 55210",
  sellPhone: "+91 93205 56671",
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

/**
 * Computes Indian Financial Year (April 1 to March 31)
 * E.g., Oct 2026 -> "2026-27", Feb 2027 -> "2026-27", Apr 2027 -> "2027-28"
 */
export function getIndianFinancialYear(date: Date = new Date()): string {
  const month = date.getMonth(); // 0 is January, 3 is April
  const year = date.getFullYear();
  const startYear = month >= 3 ? year : year - 1;
  const endYearShort = String(startYear + 1).slice(-2);
  return `${startYear}-${endYearShort}`;
}

/**
 * Derives a clean 2-3 letter standard brand code for motorcycle makes
 */
export function getBrandPrefix(make?: string): string {
  if (!make) return 'MOT';
  const clean = make.trim().toUpperCase();
  if (clean.includes('ROYAL') || clean.includes('ENFIELD')) return 'RE';
  if (clean.includes('HARLEY')) return 'HD';
  if (clean.includes('BMW')) return 'BMW';
  if (clean.includes('KTM')) return 'KTM';
  if (clean.includes('TVS')) return 'TVS';
  const letters = clean.replace(/[^A-Z]/g, '');
  return letters.substring(0, 3) || 'MOT';
}

/**
 * Generates a logical suffix for invoices or delivery notes:
 * 1. Uses the 4 digits from the vehicle's registration number plate (e.g. "MH 02 EA 4921" -> "4921")
 * 2. If unregistered or no plate digits, uses persistent dealership sequential sequence (1001, 1002...)
 */
export function getLogicalVoucherSuffix(type: 'INV' | 'DN', bike?: Partial<Vehicle>): string {
  // 1. If vehicle has a registration plate with numbers (e.g. "MH-02-EA-4921" or "MH01AB1042")
  if (bike?.registration) {
    const regDigits = bike.registration.replace(/\D/g, '');
    if (regDigits.length >= 3) {
      return regDigits.slice(-4);
    }
  }

  // 2. Sequential counter maintained in localStorage for dealership continuity
  try {
    const storageKey = type === 'INV' ? 'pm_invoice_seq' : 'pm_delivery_note_seq';
    const current = parseInt(localStorage.getItem(storageKey) || '1000', 10);
    const next = current + 1;
    localStorage.setItem(storageKey, String(next));
    return String(next);
  } catch {
    // Deterministic fallback using month-day-hour sequence
    const now = new Date();
    const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const fallbackSeq = bike?.id ? Math.abs(bike.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 900 + 100 : 101;
    return `${mmdd}-${fallbackSeq}`;
  }
}

export function generateInvoiceNumber(bike?: Partial<Vehicle>): string {
  const finYear = getIndianFinancialYear();
  const bikePrefix = getBrandPrefix(bike?.make);
  const suffix = getLogicalVoucherSuffix('INV', bike);
  return `PM/${finYear}/${bikePrefix}-${suffix}`;
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
      margin: 8mm; 
    }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 16px;
      font-size: 10.5px;
      line-height: 1.35;
      background: #f8fafc;
    }
    .invoice-wrapper {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1.5px solid #0f172a;
      padding: 18px 22px;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    /* Header */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 12px;
      gap: 12px;
    }
    .brand-section {
      flex: 1;
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .brand-logo-container {
      height: 56px;
      width: 100px;
      border-radius: 6px;
      flex-shrink: 0;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.14);
      border: 1px solid #140908;
      background: #140908;
    }
    .brand-logo-container svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .brand-text-block {
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
      html, body { 
        background: #ffffff !important; 
        padding: 0 !important; 
        margin: 0 !important; 
        -webkit-print-color-adjust: exact !important; 
        print-color-adjust: exact !important; 
      }
      .invoice-wrapper { 
        border: 1px solid #0f172a !important; 
        box-shadow: none !important; 
        padding: 12px 16px !important; 
        max-width: 100% !important; 
        margin: 0 auto !important; 
        page-break-inside: avoid !important; 
        break-inside: avoid !important; 
      }
      .top-bar, .columns-grid, .line-items-table, .bottom-split, .terms-box, .signatures-section {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
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
        <div class="brand-logo-container">
          ${PATEL_MOTORS_LOGO_SVG_RAW}
        </div>
        <div class="brand-text-block">
          <h1 class="brand-name">${dealership.name}</h1>
          <div class="brand-sub">${dealership.tagline}</div>
          <div class="brand-info">
            ${dealership.address}<br />
            ${dealership.city}, ${dealership.state} - ${dealership.pinCode}<br />
            Phone: ${dealership.phone} | Email: ${dealership.email}<br />
            GSTIN: <strong>${dealership.gstin || '27AABCP1234F1Z8'}</strong> | PAN: <strong>${dealership.pan || 'AABCP1234F'}</strong> | State Code: <strong>${dealership.stateCode || '27'}</strong>
          </div>
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

export function generateDeliveryNoteNumber(bike?: Partial<Vehicle>): string {
  const finYear = getIndianFinancialYear();
  const bikePrefix = getBrandPrefix(bike?.make);
  const suffix = getLogicalVoucherSuffix('DN', bike);
  return `PM/DN/${finYear}/${bikePrefix}-${suffix}`;
}

export function generateDeliveryNoteHtml(
  bike: Partial<Vehicle>, 
  acquisition: AcquisitionRecord, 
  dealership: DealershipInfo = PATEL_MOTORS_DEALERSHIP
): string {
  const purchasePrice = Number(acquisition.purchaseAmount) || 0;
  const purchasePriceFormatted = formatPrice(purchasePrice);
  const isSettled = acquisition.settlementStatus === 'Fully Settled' || Boolean(acquisition.settlementDate && (acquisition.balanceDue === 0 || !acquisition.balanceDue));
  const hasBalancePending = !isSettled && (acquisition.hasBalancePending || (acquisition.balanceDue !== undefined && acquisition.balanceDue > 0));
  
  const balanceDue = hasBalancePending ? (acquisition.balanceDue || 0) : 0;
  const amountPaid = acquisition.amountPaid !== undefined 
    ? acquisition.amountPaid 
    : (hasBalancePending ? Math.max(0, purchasePrice - balanceDue) : purchasePrice);
    
  const amountWords = numberToWordsIndian(purchasePrice);
  const deliveryTime = acquisition.handoverTime || '11:00 AM IST';
  const deliveryDate = acquisition.acquisitionDate || new Date().toISOString().split('T')[0];

  const docTitle = isSettled 
    ? 'Final Settlement Acquisition Voucher & Undertaking' 
    : (hasBalancePending ? 'Vehicle Acquisition Note (Balance Holdback)' : 'Vehicle Delivery Note & Undertaking');

  const statusText = isSettled
    ? 'Full Amount Settled'
    : (hasBalancePending ? `Balance Pending: ${formatPrice(balanceDue)}` : (acquisition.paymentStatus || 'Paid in Full (Disbursed)'));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${docTitle} #${acquisition.deliveryNoteNumber} - ${dealership.name}</title>
  <style>
    @page { 
      size: A4 portrait; 
      margin: 8mm; 
    }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 16px;
      font-size: 10.5px;
      line-height: 1.35;
      background: #f8fafc;
    }
    .invoice-wrapper {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1.5px solid #0f172a;
      padding: 18px 22px;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    /* Header */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 12px;
      gap: 12px;
    }
    .brand-section {
      flex: 1;
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .brand-logo-container {
      height: 56px;
      width: 100px;
      border-radius: 6px;
      flex-shrink: 0;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.14);
      border: 1px solid #140908;
      background: #140908;
    }
    .brand-logo-container svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .brand-text-block {
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
      min-width: 240px;
    }
    .doc-badge {
      display: inline-block;
      background: ${isSettled ? '#15803d' : (hasBalancePending ? '#b45309' : '#0f172a')};
      color: #ffffff;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 3px;
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
      padding: 2.5px 8px;
      border-radius: 3px;
      text-transform: uppercase;
      margin-top: 4px;
      background: ${isSettled ? '#dcfce7' : (hasBalancePending ? '#fef3c7' : '#dcfce7')};
      color: ${isSettled ? '#15803d' : (hasBalancePending ? '#b45309' : '#15803d')};
      border: 1px solid ${isSettled ? '#86efac' : (hasBalancePending ? '#fde68a' : '#86efac')};
    }

    /* 2 Columns: Seller & Bike */
    .party-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 14px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 10px 12px;
    }
    .info-title {
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #64748b;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-bottom: 6px;
      font-family: monospace;
    }
    .info-content {
      font-size: 10.5px;
      line-height: 1.45;
      color: #1e293b;
    }
    .spec-table {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3px 8px;
      margin-top: 4px;
      font-family: monospace;
      font-size: 10px;
    }

    /* Table */
    .line-items {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    .line-items th {
      background: #0f172a;
      color: #ffffff;
      padding: 8px 10px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-align: left;
    }
    .line-items th.right, .line-items td.right {
      text-align: right;
    }
    .line-items th.center, .line-items td.center {
      text-align: center;
    }
    .line-items td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
      font-size: 11px;
    }
    .item-name {
      font-weight: 800;
      color: #09090b;
      font-size: 11.5px;
    }
    .item-desc {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 2px;
    }

    /* Settlement Summary */
    .settlement-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 16px;
      margin-bottom: 14px;
    }
    .payment-details {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 10px 12px;
      font-size: 10.5px;
    }
    .amount-words-box {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed #cbd5e1;
      font-size: 9.5px;
      color: #475569;
    }
    .amount-words-val {
      font-weight: 800;
      font-style: italic;
      color: #09090b;
      margin-top: 2px;
    }

    .checklist-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 10px;
      margin-top: 6px;
      font-size: 10px;
      color: #334155;
    }
    .check-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .totals-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 10px 12px;
      font-family: monospace;
      font-size: 11px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 2.5px 0;
      color: #475569;
    }
    .total-row.highlight {
      border-top: 2px solid #0f172a;
      margin-top: 6px;
      padding-top: 6px;
      font-weight: 900;
      font-size: 13px;
      color: #09090b;
    }
    .total-row.settled {
      color: #15803d;
      font-weight: 800;
      font-size: 11px;
      border-bottom: 1px dashed #e2e8f0;
      padding-bottom: 4px;
    }
    .total-row.pending-alert {
      color: #b45309;
      font-weight: 800;
      font-size: 11px;
      background: #fef3c7;
      padding: 4px 6px;
      border-radius: 3px;
      margin-top: 4px;
    }

    /* Special Balance Note & Settlement Boxes */
    .balance-note-box {
      background: #fffbeb;
      border: 1.5px dashed #f59e0b;
      border-radius: 4px;
      padding: 8px 12px;
      margin-bottom: 12px;
      font-size: 10px;
      color: #92400e;
    }
    .balance-note-title {
      font-weight: 800;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #b45309;
      margin-bottom: 4px;
    }

    .settlement-receipt-box {
      background: #f0fdf4;
      border: 1.5px solid #22c55e;
      border-radius: 4px;
      padding: 8px 12px;
      margin-bottom: 12px;
      font-size: 10px;
      color: #14532d;
    }
    .settlement-receipt-title {
      font-weight: 800;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #15803d;
      margin-bottom: 4px;
    }

    /* Terms & Undertaking */
    .terms-box {
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      margin-top: 10px;
      font-size: 8.5px;
      color: #475569;
      line-height: 1.45;
    }
    .terms-box strong {
      color: #09090b;
    }

    /* Dual Signatures */
    .signatures-section {
      display: flex;
      justify-content: space-between;
      margin-top: 18px;
      padding-top: 12px;
      border-top: 1px dashed #cbd5e1;
    }
    .sig-col {
      width: 200px;
      text-align: center;
    }
    .sig-line {
      width: 100%;
      height: 1px;
      background: #94a3b8;
      margin-bottom: 6px;
    }
    .sig-title {
      font-weight: 800;
      font-size: 10px;
      text-transform: uppercase;
      color: #09090b;
    }
    .sig-sub {
      font-size: 8.5px;
      color: #64748b;
      margin-top: 1px;
    }

    @media print {
      html, body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .invoice-wrapper {
        border: 1px solid #0f172a !important;
        box-shadow: none !important;
        padding: 12px 16px !important;
        max-width: 100% !important;
        margin: 0 auto !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .top-bar, .party-grid, .line-items, .settlement-grid, .balance-note-box, .settlement-receipt-box, .terms-box, .signatures-section {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <!-- Header -->
    <div class="top-bar">
      <div class="brand-section">
        <div class="brand-logo-container">
          ${PATEL_MOTORS_LOGO_SVG_RAW}
        </div>
        <div class="brand-text-block">
          <h1 class="brand-name">${dealership.name}</h1>
          <div class="brand-sub">${isSettled ? 'Settled Acquisition Invoice & Final Clearance' : 'Two-Wheeler Acquisition & Delivery Challan'}</div>
          <div class="brand-info">
            ${dealership.address}, ${dealership.city} - ${dealership.pinCode}<br />
            Phone: ${dealership.phone} | Email: ${dealership.email}<br />
            GSTIN: <strong>${dealership.gstin}</strong> | PAN: <strong>${dealership.pan}</strong> | State: <strong>${dealership.stateCode}</strong>
          </div>
        </div>
      </div>
      <div class="invoice-header-meta">
        <div class="doc-badge">${docTitle}</div>
        <div class="invoice-no">#${acquisition.deliveryNoteNumber}</div>
        <div class="meta-line">Date of Handover: <strong>${deliveryDate}</strong></div>
        <div class="meta-line">Time of Handover: <strong>${deliveryTime}</strong></div>
        ${isSettled && acquisition.settlementDate ? `<div class="meta-line">Settlement Date: <strong>${acquisition.settlementDate}</strong></div>` : ''}
        <div class="status-pill">${statusText}</div>
      </div>
    </div>

    <!-- Settlement / Holdback Notice Banner if applicable -->
    ${hasBalancePending ? `
    <div class="balance-note-box">
      <div class="balance-note-title">
        ⚠️ Document Holdback & Balance Payment Terms
      </div>
      <div>
        An amount of <strong>${formatPrice(balanceDue)}</strong> is withheld by Patel Motors from the total agreed consideration of <strong>${purchasePriceFormatted}</strong> pending handover of the remaining vehicle documents.
      </div>
      ${acquisition.balancePaymentNote ? `
      <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #fde68a;">
        <strong>Document / Holdback Condition:</strong> ${acquisition.balancePaymentNote}
      </div>` : ''}
      ${acquisition.pendingDocuments && acquisition.pendingDocuments.length > 0 ? `
      <div style="margin-top: 3px; font-weight: 600;">
        Pending Documents: ${acquisition.pendingDocuments.join(', ')}
      </div>` : ''}
      <div style="margin-top: 4px; font-size: 9px; color: #78350f;">
        Upon verification and receipt of all pending documents, the remaining balance of ${formatPrice(balanceDue)} will be disbursed to the seller, and a Final Settled Inward Invoice will be generated.
      </div>
    </div>` : ''}

    ${isSettled ? `
    <div class="settlement-receipt-box">
      <div class="settlement-receipt-title">
        ✓ Official Clearance & Full Settlement Endorsement
      </div>
      <div>
        All pending vehicle documents have been verified and received from the seller (${acquisition.sellerName}). The outstanding balance payment has been disbursed in full on <strong>${acquisition.settlementDate || deliveryDate}</strong>.
      </div>
      <div style="margin-top: 4px; font-family: monospace; font-size: 9.5px;">
        Balance Payment Mode: <strong>${acquisition.settlementPaymentMethod || 'Bank Transfer (NEFT/RTGS)'}</strong>
        ${acquisition.settlementPaymentRef ? ` | Ref / UTR: <strong>${acquisition.settlementPaymentRef}</strong>` : ''}
      </div>
      ${acquisition.settlementNote ? `
      <div style="margin-top: 3px; font-style: italic;">
        Settlement Remarks: ${acquisition.settlementNote}
      </div>` : ''}
    </div>` : ''}

    <!-- 2 Column Particulars -->
    <div class="party-grid">
      <div class="info-card">
        <div class="info-title">1. Seller / Previous Owner Details (Purchased From)</div>
        <div class="info-content">
          <strong>${acquisition.sellerName}</strong><br />
          Contact: <strong>${acquisition.sellerPhone}</strong><br />
          ${acquisition.sellerEmail ? `Email: ${acquisition.sellerEmail}<br />` : ''}
          ${acquisition.sellerAddress ? `Address: ${acquisition.sellerAddress}<br />` : 'Address: Mumbai, Maharashtra<br />'}
          ${acquisition.sellerIdentity ? `Govt ID Proof: <strong>${acquisition.sellerIdentity}</strong><br />` : ''}
        </div>
      </div>

      <div class="info-card">
        <div class="info-title">2. Motorcycle Handed Over & Verified Specs</div>
        <div class="info-content">
          <strong>${bike.year || ''} ${bike.make || ''} ${bike.model || ''} ${bike.variant ? `(${bike.variant})` : ''}</strong>
          <div class="spec-table">
            <div>Reg No: <strong>${bike.registration || 'N/A'}</strong></div>
            <div>Odo: <strong>${Number(bike.mileage || 0).toLocaleString('en-IN')} KM</strong></div>
            <div>Chassis: <strong>${bike.chassisNumber || 'Verified'}</strong></div>
            <div>Engine: <strong>${bike.engineNumber || 'Verified'}</strong></div>
            <div>Ownership: <span>${bike.ownership || '1st Owner'}</span></div>
            <div>Fuel: <span>${bike.fuelType || 'Petrol'}</span></div>
            <div>Keys Received: <strong>${acquisition.keysCount || 2} Keys</strong></div>
            <div>RC Book: <strong>${acquisition.originalRcReceived !== false || isSettled ? 'Original Received' : 'Pending from Seller'}</strong></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Handover Line Items -->
    <table class="line-items">
      <thead>
        <tr>
          <th>Particulars / Motorcycle Acquired</th>
          <th class="center">Mfg Year</th>
          <th class="center">Odometer</th>
          <th class="right">Agreed Purchase Consideration</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="item-name">${bike.make || ''} ${bike.model || ''} ${bike.variant || ''}</div>
            <div class="item-desc">
              Physical handover of motorcycle in verified roadworthy condition with keys, title verification, and signed RTO transfer forms (Forms 29 & 30).
            </div>
          </td>
          <td class="center" style="font-family: monospace;">${bike.year || ''}</td>
          <td class="center" style="font-family: monospace;">${Number(bike.mileage || 0).toLocaleString('en-IN')} KM</td>
          <td class="right" style="font-family: monospace; font-weight: 800; font-size: 12px;">${purchasePriceFormatted}</td>
        </tr>
      </tbody>
    </table>

    <!-- Settlement Details & Checklist -->
    <div class="settlement-grid">
      <div class="payment-details">
        <div class="info-title">Settlement & Documentation Handover Checklist</div>
        <div>Initial Payment Mode: <strong>${acquisition.paymentMethod}</strong></div>
        ${acquisition.paymentRef ? `<div>Handover Ref / UTR: <strong style="font-family: monospace;">${acquisition.paymentRef}</strong></div>` : ''}
        ${isSettled && acquisition.settlementPaymentMethod ? `
        <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1;">
          Balance Cleared Via: <strong>${acquisition.settlementPaymentMethod}</strong> ${acquisition.settlementPaymentRef ? `(Ref: ${acquisition.settlementPaymentRef})` : ''}
        </div>` : ''}
        
        <div class="checklist-grid">
          <div class="check-item">${acquisition.originalRcReceived !== false || isSettled ? '☑' : '☐'} Original RC Book</div>
          <div class="check-item">${acquisition.rtoFormsSigned !== false ? '☑' : '☐'} RTO Forms 29 & 30 Signed</div>
          <div class="check-item">${acquisition.insuranceCopyReceived !== false ? '☑' : '☐'} Valid Insurance Policy</div>
          <div class="check-item">${acquisition.pucValid !== false ? '☑' : '☐'} Valid PUC Certificate</div>
          <div class="check-item">☑ ${acquisition.keysCount || 2} Original Sets of Keys</div>
          <div class="check-item">☑ Clear Hypothecation / NOC</div>
        </div>

        <div class="amount-words-box">
          Total Consideration in Words:<br />
          <div class="amount-words-val">${amountWords}</div>
        </div>
      </div>

      <div class="totals-box">
        <div class="total-row">
          <span>Agreed Purchase Price:</span>
          <span>${purchasePriceFormatted}</span>
        </div>
        ${hasBalancePending ? `
        <div class="total-row">
          <span>Amount Paid at Handover:</span>
          <span>${formatPrice(amountPaid)}</span>
        </div>
        <div class="total-row pending-alert">
          <span>Balance Withheld for Docs:</span>
          <span>${formatPrice(balanceDue)}</span>
        </div>
        <div class="total-row highlight">
          <span>Net Disbursed so far:</span>
          <span>${formatPrice(amountPaid)}</span>
        </div>
        <div class="total-row" style="font-size: 9px; color: #b45309; margin-top: 4px;">
          <span>Status:</span>
          <span>PARTIAL (BALANCE PENDING)</span>
        </div>` : isSettled ? `
        <div class="total-row">
          <span>Initial Handover Advance:</span>
          <span>${formatPrice(amountPaid)}</span>
        </div>
        <div class="total-row settled">
          <span>Balance Disbursed (${acquisition.settlementDate || 'Settled'}):</span>
          <span>${formatPrice(Math.max(0, purchasePrice - amountPaid))}</span>
        </div>
        <div class="total-row highlight">
          <span>Total Net Disbursed:</span>
          <span>${purchasePriceFormatted}</span>
        </div>
        <div class="total-row" style="font-size: 9.5px; color: #15803d; margin-top: 4px;">
          <span>Seller Balance Due:</span>
          <span>NIL (Fully Settled)</span>
        </div>` : `
        <div class="total-row settled">
          <span>Settlement Status:</span>
          <span>${acquisition.paymentStatus || 'Paid in Full'}</span>
        </div>
        <div class="total-row highlight">
          <span>Total Net Disbursed:</span>
          <span>${purchasePriceFormatted}</span>
        </div>
        <div class="total-row" style="font-size: 9.5px; color: #15803d; margin-top: 4px;">
          <span>Seller Balance Due:</span>
          <span>NIL (Fully Settled)</span>
        </div>`}
      </div>
    </div>

    <!-- Legal Undertaking -->
    <div class="terms-box">
      <strong>Seller Handover Undertaking & Title Warranty:</strong> I/We (${acquisition.sellerName}) hereby confirm having sold and delivered physical possession of the above motorcycle to Patel Motors. I solemnly affirm that I am the sole registered owner, that the vehicle has a clean title, and is completely free of any police seizure, criminal case, unpaid e-challans, or undisclosed finance liens. 
      ${isSettled 
        ? `I have received the entire full agreed purchase price of ${purchasePriceFormatted} in full settlement.` 
        : (hasBalancePending 
            ? `I have received an initial payment of ${formatPrice(amountPaid)}. The remaining balance of ${formatPrice(balanceDue)} shall be paid to me upon delivery of the agreed remaining documents (${acquisition.balancePaymentNote || 'as noted above'}).`
            : `I have received the full agreed purchase price of ${purchasePriceFormatted}.`)} 
      From this handover date (${deliveryDate}) and time (${deliveryTime}), Patel Motors assumes physical custody of the motorcycle.
    </div>

    <!-- Dual Signatures -->
    <div class="signatures-section">
      <div class="sig-col">
        <div class="sig-line"></div>
        <div class="sig-title">Seller's Signature & Handover</div>
        <div class="sig-sub">${acquisition.sellerName} (Previous Owner)</div>
      </div>

      <div class="sig-col">
        <div style="font-size: 8px; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px;">Dealership Seal</div>
        <div class="sig-line"></div>
        <div class="sig-title">For PATEL MOTORS</div>
        <div class="sig-sub">Authorized Signatory (Received By)</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function printDeliveryNote(bike: Partial<Vehicle>, acquisition: AcquisitionRecord): void {
  const html = generateDeliveryNoteHtml(bike, acquisition);
  
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
    console.error('Delivery note printing failed:', err);
  }
}

