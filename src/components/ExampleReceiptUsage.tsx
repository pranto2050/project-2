import React from 'react';
import ReceiptDownloader from './ReceiptDownloader';
import ReceiptButton from './ReceiptButton';
import { SaleItem, CustomerDetails } from '../types';

// Example usage of the new receipt components

const ExampleReceiptUsage: React.FC = () => {
  // Example data - replace with your actual data
  const exampleSalesItems: SaleItem[] = [
    {
      product: {
        id: 'IT2025-1752671000100',
        name: 'TP-Link Archer AX73 AX5400 Dual-Band Wi-Fi 6 Router',
        brand: 'TP-Link',
        supplier: 'TP-Link Bangladesh',
        addedDate: '2025-07-16',
        pricePerUnit: 12000,
        stock: 50,
        unit: 'Piece',
        category: 'Network',
        rating: 4.5,
        image: '/path/to/image.jpg',
        description: 'High-end Wi-Fi 6 router',
        commonId: 'common-123',
        uniqueId: 'unique-123'
      },
      quantity: 2,
      totalPrice: 24000
    }
  ];

  const exampleCustomer: CustomerDetails = {
    name: 'Md.Pranto Islam',
    mobile: '01979728818',
    email: 'pranto@gmail.com',
    address: 'Uttara, Dhaka-1230'
  };

  const receiptNumber = 's-1752696374728';
  const cashierName = 'a@gmail.com';

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Receipt Component Examples</h2>
      
      {/* Example 1: Full ReceiptDownloader with both buttons */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">1. Complete Receipt Downloader</h3>
        <ReceiptDownloader
          salesItems={exampleSalesItems}
          receiptNumber={receiptNumber}
          cashierName={cashierName}
          customerDetails={exampleCustomer}
          showPrintButton={true}
          showDownloadButton={true}
          buttonSize="md"
          variant="default"
        />
      </div>

      {/* Example 2: Outline variant */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">2. Outline Style Buttons</h3>
        <ReceiptDownloader
          salesItems={exampleSalesItems}
          receiptNumber={receiptNumber}
          cashierName={cashierName}
          customerDetails={exampleCustomer}
          variant="outline"
          buttonSize="lg"
        />
      </div>

      {/* Example 3: Minimal variant */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">3. Minimal Style Buttons</h3>
        <ReceiptDownloader
          salesItems={exampleSalesItems}
          receiptNumber={receiptNumber}
          cashierName={cashierName}
          customerDetails={exampleCustomer}
          variant="minimal"
          buttonSize="sm"
        />
      </div>

      {/* Example 4: Only download button */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">4. Download Only</h3>
        <ReceiptDownloader
          salesItems={exampleSalesItems}
          receiptNumber={receiptNumber}
          cashierName={cashierName}
          customerDetails={exampleCustomer}
          showPrintButton={false}
          showDownloadButton={true}
        />
      </div>

      {/* Example 5: Individual ReceiptButton components */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">5. Individual Receipt Buttons</h3>
        <div className="flex space-x-4">
          <ReceiptButton
            salesItems={exampleSalesItems}
            receiptNumber={receiptNumber}
            cashierName={cashierName}
            customerDetails={exampleCustomer}
            type="download"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          />
          
          <ReceiptButton
            salesItems={exampleSalesItems}
            receiptNumber={receiptNumber}
            cashierName={cashierName}
            customerDetails={exampleCustomer}
            type="print"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          />
        </div>
      </div>

      {/* Example 6: Custom styled ReceiptButton */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">6. Custom Styled Receipt Button</h3>
        <ReceiptButton
          salesItems={exampleSalesItems}
          receiptNumber={receiptNumber}
          cashierName={cashierName}
          customerDetails={exampleCustomer}
          type="download"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full flex items-center space-x-2 transform hover:scale-105 transition-all duration-200"
        >
          <span>📄</span>
          <span>Get My Receipt</span>
        </ReceiptButton>
      </div>
    </div>
  );
};

export default ExampleReceiptUsage;
