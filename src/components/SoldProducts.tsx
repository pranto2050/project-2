import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Package, Download, FileText, BarChart3 } from 'lucide-react';

interface UnifiedSaleItem {
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  dateOfSale: string;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  customerAddress?: string;
  soldBy?: string;
  soldByEmail?: string;
  warranty?: {
    startDate: string;
    endDate: string;
    warrantyPeriod: string;
  };
}

interface SoldProductsProps {
  sales: UnifiedSaleItem[];
}

const SoldProducts: React.FC<SoldProductsProps> = ({ sales }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('all');

  // Process sales data according to design specs - show each sale as one row (no quantity expansion)
  const processedSales = sales.map((sale, index) => ({
    ...sale,
    rowNumber: index + 1,
    totalPrice: sale.quantity * sale.pricePerUnit
  }));

  // Get unique sellers for filter dropdown
  const uniqueSellers = Array.from(new Set(sales.map(sale => sale.soldByEmail).filter(Boolean)));

  // Filter sales based on search and filter criteria
  const getFilteredSales = () => {
    return processedSales.filter(sale => {
      // Text search filter (product name only)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = sale.productName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Date range filter
      if (startDate || endDate) {
        const saleDate = new Date(sale.dateOfSale);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) {
          if (saleDate < start || saleDate > end) return false;
        } else if (start) {
          if (saleDate < start) return false;
        } else if (end) {
          if (saleDate > end) return false;
        }
      }

      // Seller filter
      if (selectedSeller !== 'all' && sale.soldByEmail !== selectedSeller) {
        return false;
      }

      return true;
    });
  };

  const filteredSales = getFilteredSales();

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = filteredSales.slice(startIndex, endIndex);

  // Calculate summary statistics
  const totalSales = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalProducts = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
  const uniqueProducts = new Set(filteredSales.map(sale => sale.productId)).size;

  // Format functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  // Get page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Export to CSV
  const handleExportData = () => {
    const csvContent = [
      ['#', 'Product Name', 'Qty', 'Unit Price', 'Sale Date', 'Seller Email'],
      ...filteredSales.map((sale, index) => [
        (index + 1).toString(),
        sale.productName || 'N/A',
        sale.quantity.toString(),
        sale.pricePerUnit.toString(),
        formatDate(sale.dateOfSale),
        sale.soldByEmail || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sold-products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSelectedSeller('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">📦 Sold Products</h2>
            <p className="text-slate-400">View all successfully completed sales transactions</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">🔍 Search & Filter</h3>
        </div>
        
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Search by Product Name:</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date Range and Seller Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Filter by Date Range - From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Filter by Seller:</label>
              <select
                value={selectedSeller}
                onChange={(e) => setSelectedSeller(e.target.value)}
                className="w-full px-3 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Sellers ▼</option>
                {uniqueSellers.map(seller => (
                  <option key={seller} value={seller}>{seller}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">📊 Sales Summary</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-600">
            <div className="text-2xl font-bold text-emerald-400">{totalSales}</div>
            <div className="text-slate-400 text-sm">Total Sales</div>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-600">
            <div className="text-2xl font-bold text-green-400">{formatCurrency(totalRevenue)}</div>
            <div className="text-slate-400 text-sm">Total Revenue</div>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-600">
            <div className="text-2xl font-bold text-blue-400">{totalProducts}</div>
            <div className="text-slate-400 text-sm">Total Products</div>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-600">
            <div className="text-2xl font-bold text-purple-400">{uniqueProducts}</div>
            <div className="text-slate-400 text-sm">Unique Products</div>
          </div>
        </div>
      </div> 

      {/* Main Table Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-lg shadow-cyan-500/10">
        {/* Table Actions */}
        <div className="p-6 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Sold Products List - Detailed View</h3>
            <div className="flex space-x-3">
              <button
                onClick={handleExportData}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>📊 Export to Excel</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>📋 Print Report</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>🔄 Refresh Data</span>
              </button>
            </div>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">📦 No Sales Found</h3>
            <p className="text-slate-500 mb-4">
              {searchTerm || startDate || endDate || selectedSeller !== 'all'
                ? "No results match your current filters."
                : "No products have been sold yet."}
            </p>
            {(searchTerm || startDate || endDate || selectedSeller !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600 bg-slate-800/30">
                    <th className="text-left p-4 text-slate-300 font-semibold">#</th>
                    <th className="text-left p-4 text-slate-300 font-semibold">Product Name</th>
                    <th className="text-left p-4 text-slate-300 font-semibold">Qty</th>
                    <th className="text-left p-4 text-slate-300 font-semibold">Unit Price</th>
                    <th className="text-left p-4 text-slate-300 font-semibold">Sale Date</th>
                    <th className="text-left p-4 text-slate-300 font-semibold">Seller Email</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSales.map((sale, index) => {
                    const globalIndex = startIndex + index + 1;
                    const saleDate = new Date(sale.dateOfSale);
                    const now = new Date();
                    const diffTime = now.getTime() - saleDate.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    // Color coding based on recency
                    let rowBgClass = 'hover:bg-white/5';
                    if (diffDays <= 1) {
                      rowBgClass = 'bg-green-500/10 hover:bg-green-500/20'; // 🟢 Recent (24 hours)
                    } else if (diffDays <= 7) {
                      rowBgClass = 'bg-yellow-500/10 hover:bg-yellow-500/20'; // 🟡 This week
                    } else if (diffDays <= 30) {
                      rowBgClass = 'bg-blue-500/10 hover:bg-blue-500/20'; // 🔵 This month
                    }

                    return (
                      <tr 
                        key={sale.saleId}
                        className={`border-b border-slate-700/50 transition-colors ${rowBgClass}`}
                      >
                        <td className="p-4 text-slate-300 font-medium">{globalIndex}</td>
                        <td className="p-4 text-white">{sale.productName}</td>
                        <td className="p-4 text-center text-slate-300">{sale.quantity}</td>
                        <td className="p-4 text-emerald-400 font-semibold">{formatCurrency(sale.pricePerUnit)}</td>
                        <td className="p-4 text-slate-300">{formatDate(sale.dateOfSale)}</td>
                        <td className="p-4 text-slate-300">{sale.soldByEmail || 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-slate-600">
                <div className="flex items-center space-x-4">
                  <span className="text-slate-400 text-sm">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredSales.length)} of {filteredSales.length} sales
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-sm">Items per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1 bg-slate-800/50 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={filteredSales.length}>All</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>⬅️ Previous</span>
                  </button>

                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      disabled={page === '...'}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-cyan-500 text-white'
                          : page === '...'
                          ? 'text-slate-500 cursor-default'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next ➡️</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SoldProducts;
