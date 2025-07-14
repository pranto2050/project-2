import jsPDF from 'jspdf';

export interface ReceiptItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface CustomerDetails {
  mobile: string;
  email: string;
  address: string;
}

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  time: string;
  items: ReceiptItem[];
  totalAmount: number;
  totalItems: number;
  cashierName: string;
  storeName: string;
  customer?: CustomerDetails;
}

export const generatePDFReceipt = (receiptData: ReceiptData): Promise<jsPDF> => {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FRIENDS IT ZONE', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Grocery & Electronics Store', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.text('HARINAKUNDA UPAZILA MORE, MASTER MARKET 2', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 6;
    doc.text('Phone: 01718000117, 01947533013', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(10);
    doc.text('Receipt', pageWidth / 2, yPosition, { align: 'center' });
    
    // Receipt details
    yPosition += 15;
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt #: ${receiptData.receiptNumber}`, margin, yPosition);
    doc.text(`Date: ${receiptData.date}`, pageWidth - margin - 50, yPosition);
    
    yPosition += 8;
    doc.text(`Time: ${receiptData.time}`, margin, yPosition);
    doc.text(`Cashier: ${receiptData.cashierName}`, pageWidth - margin - 60, yPosition);
    
    // Customer details if provided
    if (receiptData.customer) {
      yPosition += 8;
      doc.text(`Customer Mobile: ${receiptData.customer.mobile}`, margin, yPosition);
      doc.text(`Customer Email: ${receiptData.customer.email}`, pageWidth - margin - 80, yPosition);
      
      yPosition += 8;
      doc.text(`Customer Address: ${receiptData.customer.address}`, margin, yPosition);
    }
    
    // Line separator
    yPosition += 10;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    
    // Table headers
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Item', margin, yPosition);
    doc.text('Qty', margin + 80, yPosition);
    doc.text('Rate', margin + 110, yPosition);
    doc.text('Amount', pageWidth - margin - 30, yPosition);
    
    yPosition += 5;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    
    // Items
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    receiptData.items.forEach((item) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Product name (truncate if too long)
      const productName = item.productName.length > 25 
        ? item.productName.substring(0, 25) + '...' 
        : item.productName;
      
      doc.text(productName, margin, yPosition);
      doc.text(`${item.quantity} ${item.unit}`, margin + 80, yPosition);
      doc.text(`৳${item.pricePerUnit.toFixed(2)}`, margin + 110, yPosition);
      doc.text(`৳${item.totalPrice.toFixed(2)}`, pageWidth - margin - 30, yPosition, { align: 'right' });
      
      yPosition += 8;
    });
    
    // Total section
    yPosition += 5;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Total Items: ${receiptData.totalItems}`, margin, yPosition);
    doc.text(`Total Amount: ৳${receiptData.totalAmount.toFixed(2)}`, pageWidth - margin - 50, yPosition, { align: 'right' });
    
    // Footer
    yPosition += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Thank you for shopping at FRIENDS IT ZONE!', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 8;
    doc.text('HARINAKUNDA UPAZILA MORE, MASTER MARKET 2', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 6;
    doc.text('Phone: 01718000117, 01947533013', pageWidth / 2, yPosition, { align: 'center' });
    
    resolve(doc);
  });
};

export const downloadPDFReceipt = async (receiptData: ReceiptData) => {
  const doc = await generatePDFReceipt(receiptData);
  doc.save(`receipt_${receiptData.receiptNumber}_${receiptData.date}.pdf`);
};

export const printPDFReceipt = async (receiptData: ReceiptData) => {
  const doc = await generatePDFReceipt(receiptData);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(pdfUrl);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};