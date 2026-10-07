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
}

export const PATEL_MOTORS_DEALERSHIP: DealershipInfo = {
  name: "Patel Motors",
  tagline: "Buy & Sell Quality Bikes With Complete Confidence",
  address: "Showroom No. 4, L.B.S. Marg, Opp. Marathon Heights, Mulund West",
  city: "Mumbai",
  state: "Maharashtra",
  pinCode: "400080",
  phone: "+91 98201 55443 / +91 74001 13999",
  email: "sales@patelmotors.in",
  website: "https://patelmotors.in",
  gstin: "27AABCP1234F1Z8"
};

export function generateInvoiceNumber(bike?: Vehicle): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bikePrefix = bike?.make ? bike.make.substring(0, 3).toUpperCase() : 'MOT';
  return `PM-${dateStr}-${bikePrefix}-${randomSuffix}`;
}

export function generateInvoiceHtml(bike: Vehicle, sale: SaleRecord, dealership: DealershipInfo = PATEL_MOTORS_DEALERSHIP): string {
  const salePriceFormatted = formatPrice(sale.salePrice);
  const taxFormatted = sale.taxAmount ? formatPrice(sale.taxAmount) : '₹0';
  const discountFormatted = sale.discount ? formatPrice(sale.discount) : '₹0';
  const finalFormatted = formatPrice(sale.finalAmount);
  const paidFormatted = formatPrice(sale.amountPaid);
  const balanceFormatted = formatPrice(sale.balanceDue);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice #${sale.invoiceNumber} - ${dealership.name}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #18181b; margin: 0; padding: 20px; font-size: 13px; line-height: 1.5; }
    .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #e4e4e7; padding: 32px; border-radius: 8px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #18181b; padding-bottom: 20px; margin-bottom: 24px; }
    .brand-title { font-size: 26px; font-weight: 800; letter-spacing: 1px; color: #09090b; text-transform: uppercase; margin: 0; }
    .brand-tagline { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #71717a; margin-top: 4px; }
    .brand-contact { font-size: 11px; color: #52525b; margin-top: 8px; line-height: 1.4; }
    .invoice-meta { text-align: right; }
    .invoice-badge { display: inline-block; background: #18181b; color: #fff; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; margin-bottom: 8px; }
    .invoice-number { font-size: 15px; font-weight: 700; color: #09090b; }
    .invoice-date { font-size: 12px; color: #71717a; margin-top: 2px; }
    .two-cols { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
    .col-box { flex: 1; background: #f4f4f5; padding: 14px 18px; border-radius: 6px; }
    .col-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #71717a; margin-bottom: 8px; border-bottom: 1px solid #e4e4e7; padding-bottom: 4px; }
    .col-text { font-size: 12px; line-height: 1.5; color: #27272a; }
    .col-text strong { color: #09090b; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #18181b; color: #fff; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 12px; border-bottom: 1px solid #e4e4e7; font-size: 12px; }
    .specs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 16px; font-size: 11px; color: #52525b; margin-top: 6px; }
    .specs-grid span { color: #18181b; font-weight: 600; }
    .totals-box { margin-left: auto; width: 320px; margin-bottom: 24px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #52525b; }
    .totals-row.grand { border-top: 2px solid #18181b; padding-top: 10px; margin-top: 6px; font-size: 16px; font-weight: 800; color: #09090b; }
    .payment-summary { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px; display: flex; justify-content: space-between; }
    .payment-item { font-size: 11px; }
    .payment-item-label { color: #71717a; text-transform: uppercase; font-size: 9px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px; }
    .payment-item-val { font-size: 13px; font-weight: 700; color: #09090b; }
    .footer { border-top: 1px solid #e4e4e7; padding-top: 20px; font-size: 10px; color: #71717a; line-height: 1.5; display: flex; justify-content: space-between; }
    .terms { max-width: 60%; }
    .signature-box { text-align: right; margin-top: 10px; }
    .signature-line { width: 160px; border-bottom: 1px solid #18181b; margin-bottom: 4px; display: inline-block; }
    @media print {
      body { padding: 0; }
      .invoice-container { border: none; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div>
        <h1 class="brand-title">${dealership.name}</h1>
        <div class="brand-tagline">${dealership.tagline}</div>
        <div class="brand-contact">
          ${dealership.address}<br />
          ${dealership.city}, ${dealership.state} - ${dealership.pinCode}<br />
          Phone: ${dealership.phone} | Email: ${dealership.email}<br />
          ${dealership.gstin ? `GSTIN: ${dealership.gstin}` : ''}
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-badge">Tax / Sale Invoice</div>
        <div class="invoice-number">${sale.invoiceNumber}</div>
        <div class="invoice-date">Date: ${sale.saleDate}</div>
        <div class="invoice-date">Status: <span style="font-weight: 700; color: #059669;">${sale.paymentStatus}</span></div>
      </div>
    </div>

    <div class="two-cols">
      <div class="col-box">
        <div class="col-title">Sold To / Customer Details</div>
        <div class="col-text">
          <strong>${sale.customerName}</strong><br />
          Phone: ${sale.customerPhone}<br />
          ${sale.customerEmail ? `Email: ${sale.customerEmail}<br />` : ''}
          ${sale.customerAddress ? `Address: ${sale.customerAddress}<br />` : ''}
          ${sale.customerGst ? `GSTIN: ${sale.customerGst}<br />` : ''}
        </div>
      </div>
      <div class="col-box">
        <div class="col-title">Dealership Vehicle Record</div>
        <div class="col-text">
          <strong>${bike.year} ${bike.make} ${bike.model}</strong><br />
          Variant: ${bike.variant || 'Standard Spec'}<br />
          Registration: ${bike.registration || 'Unregistered / Temp'}<br />
          Color: ${bike.color || 'Standard'} | Mileage: ${bike.mileage.toLocaleString('en-IN')} KM<br />
          Ownership: ${bike.ownership || '1st Owner'}
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 55%;">Motorcycle Description & Identifiers</th>
          <th style="width: 15%; text-align: center;">Year</th>
          <th style="width: 15%; text-align: center;">Odo (KM)</th>
          <th style="width: 15%; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong style="font-size: 13px; color: #09090b;">${bike.make} ${bike.model} - ${bike.variant || ''}</strong>
            <div class="specs-grid">
              <div>Reg No: <span>${bike.registration || 'N/A'}</span></div>
              <div>Engine CC: <span>${bike.engine || (bike.engineCC ? `${bike.engineCC} cc` : 'N/A')}</span></div>
              <div>Chassis/VIN: <span>${bike.chassisNumber || 'Verified by Inspection'}</span></div>
              <div>Engine No: <span>${bike.engineNumber || 'Verified on Chassis'}</span></div>
              <div>RC Status: <span>${bike.rcStatus || 'Clear Title'}</span></div>
              <div>Insurance: <span>${bike.insuranceStatus || 'Valid'}</span></div>
            </div>
          </td>
          <td style="text-align: center; font-weight: 600;">${bike.year}</td>
          <td style="text-align: center;">${bike.mileage.toLocaleString('en-IN')}</td>
          <td style="text-align: right; font-weight: 700; font-size: 13px;">${salePriceFormatted}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals-box">
      <div class="totals-row">
        <span>Agreed Sale Price:</span>
        <span style="font-weight: 600;">${salePriceFormatted}</span>
      </div>
      ${sale.taxAmount ? `
      <div class="totals-row">
        <span>Taxes / Applicable RTO Fees:</span>
        <span>${taxFormatted}</span>
      </div>` : ''}
      ${sale.discount ? `
      <div class="totals-row" style="color: #dc2626;">
        <span>Special Dealer Discount:</span>
        <span>-${discountFormatted}</span>
      </div>` : ''}
      <div class="totals-row grand">
        <span>Final Total:</span>
        <span>${finalFormatted}</span>
      </div>
    </div>

    <div class="payment-summary">
      <div class="payment-item">
        <div class="payment-item-label">Payment Method</div>
        <div class="payment-item-val">${sale.paymentMethod}</div>
      </div>
      <div class="payment-item">
        <div class="payment-item-label">Amount Paid</div>
        <div class="payment-item-val" style="color: #059669;">${paidFormatted}</div>
      </div>
      <div class="payment-item">
        <div class="payment-item-label">Balance Due</div>
        <div class="payment-item-val" style="color: ${sale.balanceDue > 0 ? '#dc2626' : '#71717a'};">${balanceFormatted}</div>
      </div>
      <div class="payment-item">
        <div class="payment-item-label">Payment Status</div>
        <div class="payment-item-val">${sale.paymentStatus}</div>
      </div>
    </div>

    <div class="footer">
      <div class="terms">
        <strong>Terms & Conditions:</strong><br />
        1. All pre-owned motorcycles are sold after comprehensive physical and mechanical verification.<br />
        2. Delivery is subject to full payment clearance and submission of RTO transfer documents.<br />
        3. Patel Motors guarantees clean title and unencumbered vehicle possession at the time of delivery.
      </div>
      <div class="signature-box">
        <br /><br />
        <div class="signature-line"></div><br />
        <strong>Authorized Signatory</strong><br />
        Patel Motors, Mumbai
      </div>
    </div>
  </div>
</body>
</html>
`;
}

export function printInvoice(bike: Vehicle, sale: SaleRecord): void {
  const html = generateInvoiceHtml(bike, sale);
  const printWindow = window.open('', '_blank', 'width=900,height=750');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 350);
  }
}
