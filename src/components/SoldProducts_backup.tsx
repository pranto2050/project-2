import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, Calendar, DollarSign, Package, User, Fingerprint, Download, Phone } from 'lucide-react';
import { SaleRecord } from '../types';

interface SoldProductsProps {
  sales: SaleRecord[];
}

// Interface for flattened sale items (individual products from bulk sales)
interface FlattenedSaleItem {
  saleId: string;
  productID: string;
  productName: string;
  quantitySold: number;
  pricePerUnit: number;
  totalPrice: number;
  unit: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  commonId: string;
  uniqueId: string;
  customerName?: string;
  customerMobile?: string;
  customerEmail?: string;
  customerAddress?: string;
  // Individual item details
  itemIndex: number;
  individualPrice: number;
  individualQuantity: number;
}

const SoldProducts: React.FC<SoldProductsProps> = ({ sales }) => {
  const [soldProducts, setSoldProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'uniqueId' | 'commonId' | 'productName' | 'mobileNumber'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'productName'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{ mobile: string; email: string; address: string } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch sold products data
  useEffect(() => {
    const fetchSoldProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/soldproducts');
        const data = await response.json();
        if (data.success) {
          setSoldProducts(data.soldProducts);
        }
      } catch (error) {
        console.error('Error fetching sold products:', error);
        setSearchError('Failed to fetch sold products data');
      }
    };

    fetchSoldProducts();
  }, []);

  // Flatten sales data to show individual products from bulk sales
  const flattenSales = (salesData: SaleRecord[]): FlattenedSaleItem[] => {
    const flattened: FlattenedSaleItem[] = [];
    
    salesData.forEach(sale => {
      // If it's a bulk sale with multiple items, create individual entries
      if (sale.quantitySold > 1) {
        for (let i = 0; i < sale.quantitySold; i++) {
          flattened.push({
            ...sale,
            saleId: sale.productID + '-' + Date.now() + '-' + i, // Generate unique saleId
            itemIndex: i + 1,
            individualPrice: sale.pricePerUnit,
            individualQuantity: 1,
            totalPrice: sale.pricePerUnit, // Individual item price
            customerName: sale.customer?.name,
            customerMobile: sale.customer?.mobile,
            customerEmail: sale.customer?.email,
            customerAddress: sale.customer?.address,
          });
        }
      } else {
        // Single item sale
        flattened.push({
          ...sale,
          saleId: sale.productID + '-' + Date.now(), // Generate unique saleId
          itemIndex: 1,
          individualPrice: sale.pricePerUnit,
          individualQuantity: sale.quantitySold,
          customerName: sale.customer?.name,
          customerMobile: sale.customer?.mobile,
          customerEmail: sale.customer?.email,
          customerAddress: sale.customer?.address,
        });
      }
    });
    
    return flattened;
  };

  // Search by mobile number using API
  const searchByMobileNumber = async (mobileNumber: string): Promise<FlattenedSaleItem[]> => {
    setIsSearching(true);
    setSearchError(null);
    setCustomerInfo(null);
    
    try {
      const response = await fetch(`http://localhost:3001/api/warranty/search?type=mobileNumber&value=${encodeURIComponent(mobileNumber.trim())}&page=1&limit=100`);
      const data = await response.json();
      
      if (data.success && data.data) {
        // Transform API response to match our FlattenedSaleItem interface
        const transformedResults = data.data.map((item: any, index: number) => ({
          saleId: item.saleId,
          productID: item.commonId || item.uniqueId || 'N/A',
          productName: item.productName,
          quantitySold: item.quantity,
          pricePerUnit: item.salePrice / item.quantity,
          totalPrice: item.salePrice / item.quantity, // Individual item price
          unit: item.unit || 'piece',
          timestamp: item.purchaseDate,
          userId: item.customerId,
          userEmail: item.customerEmail,
          commonId: item.commonId,
          uniqueId: item.uniqueId,
          customerMobile: item.customerMobile,
          customerEmail: item.customerEmail,
          customerAddress: item.customerAddress,
          itemIndex: index + 1,
          individualPrice: item.salePrice / item.quantity,
          individualQuantity: 1,
        }));
        
        // Set customer info if available
        if (transformedResults.length > 0) {
          const firstResult = transformedResults[0];
          setCustomerInfo({
            mobile: firstResult.customerMobile || 'N/A',
            email: firstResult.customerEmail || 'N/A',
            address: firstResult.customerAddress || 'N/A'
          });
        }
        
        return transformedResults;
      }
      return [];
    } catch (error) {
      console.error('Error searching by mobile number:', error);
      setSearchError('Failed to search by mobile number. Please try again.');
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // State for sales data
  const [salesData, setSalesData] = useState<FlattenedSaleItem[]>([]);
  const [apiSearchResults, setApiSearchResults] = useState<FlattenedSaleItem[]>([]);

  // Load initial sales data from soldProducts API instead of sales prop
  useEffect(() => {
    if (soldProducts.length > 0) {
      // Transform soldProducts data to FlattenedSaleItem format
      const transformedData: FlattenedSaleItem[] = soldProducts.map((item, index) => ({
        saleId: item.id || `sale-${index}`,
        productID: item.productID,
        productName: item.productName,
        quantitySold: item.quantitySold,
        pricePerUnit: item.pricePerUnit,
        totalPrice: item.totalPrice,
        unit: item.unit || 'piece',
        timestamp: item.timestamp,
        userId: item.userId,
        userEmail: item.userEmail,
        commonId: item.productID,
        uniqueId: item.productID,
        customerName: item.customerName,
        customerMobile: item.customerMobile,
        customerEmail: item.customerEmail,
        customerAddress: item.customerAddress,
        itemIndex: 1,
        individualPrice: item.pricePerUnit,
        individualQuantity: item.quantitySold,
      }));
      setSalesData(transformedData);
    } else {
      // Fallback to sales prop if soldProducts is not available
      const flattenedData = flattenSales(sales);
      setSalesData(flattenedData);
    }
  }, [soldProducts, sales]);

  // Handle search based on filter type
  useEffect(() => {
    const performSearch = async () => {
      if (filterBy === 'mobileNumber' && searchTerm.trim()) {
        // Use API search for mobile number
        const results = await searchByMobileNumber(searchTerm);
        setApiSearchResults(results);
      } else {
        // Clear API results for local searches
        setApiSearchResults([]);
        setCustomerInfo(null);
        setSearchError(null);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterBy]);

  // Filter and sort sales data
  const getFilteredSales = (): FlattenedSaleItem[] => {
    let dataToFilter: FlattenedSaleItem[] = [];
    
    // Use API results for mobile search, otherwise use local data
    if (filterBy === 'mobileNumber' && searchTerm.trim()) {
      dataToFilter = apiSearchResults;
    } else {
      dataToFilter = salesData;
    }

    return dataToFilter
      .filter(sale => {
        // Text search filter
        if (searchTerm && filterBy !== 'mobileNumber') {
          const searchLower = searchTerm.toLowerCase().trim();
          
          switch (filterBy) {
            case 'uniqueId':
              return sale.uniqueId?.toLowerCase().includes(searchLower) || false;
            case 'commonId':
              return sale.commonId?.toLowerCase().includes(searchLower) || false;
            case 'productName':
              return sale.productName.toLowerCase().includes(searchLower);
            case 'all':
              return (
                sale.uniqueId?.toLowerCase().includes(searchLower) ||
                sale.commonId?.toLowerCase().includes(searchLower) ||
                sale.productName.toLowerCase().includes(searchLower) ||
                sale.userEmail.toLowerCase().includes(searchLower) ||
                sale.customerMobile?.toLowerCase().includes(searchLower) ||
                false
              );
            default:
              return true;
          }
        }

        // Date range filter
        if (startDate || endDate) {
          const saleDate = new Date(sale.timestamp);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          if (start && end) {
            return saleDate >= start && saleDate <= end;
          } else if (start) {
            return saleDate >= start;
          } else if (end) {
            return saleDate <= end;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sortBy) {
          case 'date':
            aValue = new Date(a.timestamp);
            bValue = new Date(b.timestamp);
            break;
          case 'amount':
            aValue = a.totalPrice;
            bValue = b.totalPrice;
            break;
          case 'productName':
            aValue = a.productName.toLowerCase();
            bValue = b.productName.toLowerCase();
            break;
          default:
            aValue = new Date(a.timestamp);
            bValue = new Date(b.timestamp);
        }
        
        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
  };

  const filteredSales = getFilteredSales();

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = filteredSales.slice(startIndex, endIndex);

  // Calculate totals
  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

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

  const handleExportData = () => {
    const csvContent = [
      ['Product Name', 'Product ID', 'Quantity', 'Price (৳)', 'Total (৳)', 'Sale Date', 'Customer Name', 'Mobile Number', 'Customer Email', 'Sold By'],
      ...filteredSales.map(sale => [
        sale.productName,
        sale.productID,
        `${sale.individualQuantity} ${sale.unit}`,
        sale.individualPrice.toString(),
        sale.totalPrice.toString(),
        formatDate(sale.timestamp),
        sale.customerName || 'N/A',
        sale.customerMobile || 'N/A',
        sale.customerEmail || 'N/A',
        sale.userEmail
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

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBy('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    setCustomerInfo(null);
    setSearchError(null);
    setApiSearchResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Sold Products</h2>
              <p className="text-slate-400">View all sold products with detailed customer information</p>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="flex space-x-4">
            <div className="text-center">
              <p className="text-slate-400 text-sm">Total Items</p>
              <p className="text-green-400 font-bold text-lg">{filteredSales.length}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-emerald-400 font-bold text-lg">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {searchError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-400 text-sm">⚠️ {searchError}</span>
              <button
                onClick={() => setSearchError(null)}
                className="text-red-400 hover:text-red-300 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Customer Information Header */}
        {customerInfo && filterBy === 'mobileNumber' && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <User className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-medium text-lg">Customer Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Mobile Number:</p>
                <p className="text-white font-medium">{customerInfo.mobile}</p>
              </div>
              <div>
                <p className="text-slate-400">Email Address:</p>
                <p className="text-white font-medium">{customerInfo.email}</p>
              </div>
              <div>
                <p className="text-slate-400">Address:</p>
                <p className="text-white font-medium">{customerInfo.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="space-y-4">
          {/* Primary Search Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={
                  filterBy === 'mobileNumber' 
                    ? 'Enter mobile number (e.g., 017XXXXXXXX)' 
                    : filterBy === 'uniqueId'
                    ? 'Enter Unique ID (e.g., CAM-1001-0003)'
                    : filterBy === 'commonId'
                    ? 'Enter Common ID (e.g., CAM-1001)'
                    : filterBy === 'productName'
                    ? 'Enter product name'
                    : 'Search sold products...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
              />
            </div>

            {/* Filter By */}
            <select
              value={filterBy}
              onChange={(e) => {
                setFilterBy(e.target.value as any);
                setSearchTerm('');
                setCustomerInfo(null);
                setSearchError(null);
                setApiSearchResults([]);
              }}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
            >
              <option value="all" className="bg-slate-800">All Fields</option>
              <option value="uniqueId" className="bg-slate-800">Unique ID</option>
              <option value="commonId" className="bg-slate-800">Common ID</option>
              <option value="productName" className="bg-slate-800">Product Name</option>
              <option value="mobileNumber" className="bg-slate-800">Mobile Number</option>
            </select>

            {/* Sort By */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
            >
              <option value="date-desc" className="bg-slate-800">Date (Newest)</option>
              <option value="date-asc" className="bg-slate-800">Date (Oldest)</option>
              <option value="amount-desc" className="bg-slate-800">Amount (High-Low)</option>
              <option value="amount-asc" className="bg-slate-800">Amount (Low-High)</option>
              <option value="productName-asc" className="bg-slate-800">Product Name A-Z</option>
              <option value="productName-desc" className="bg-slate-800">Product Name Z-A</option>
            </select>

            {/* Items Per Page */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
            >
              <option value={10} className="bg-slate-800">10 per page</option>
              <option value={20} className="bg-slate-800">20 per page</option>
              <option value={50} className="bg-slate-800">50 per page</option>
            </select>
          </div>

          {/* Secondary Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
              // Filter Section
                onClick={() => setShowDateFilter(!showDateFilter)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  showDateFilter 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'bg-white/10 text-slate-400 border border-white/20 hover:bg-white/20'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Date Filter</span>
              </button>

              {(searchTerm || startDate || endDate) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all duration-300"
                >
                  <Filter className="w-4 h-4" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Date Range Filter */}
          {showDateFilter && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="w-full px-4 py-2 bg-slate-600/20 hover:bg-slate-600/30 text-slate-400 border border-slate-500/30 rounded-lg transition-all duration-300"
                >
                  Clear Dates
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-lg shadow-cyan-500/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>Product</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Fingerprint className="w-4 h-4" />
                    <span>ID</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>Quantity</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Price</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Total</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Sale Date</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Customer Name</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Mobile Number</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Customer Email</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Sold By</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {currentSales.map((sale, index) => (
                <tr 
                  key={`${sale.saleId}-${sale.itemIndex}-${index}`}
                  className="hover:bg-white/5 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {sale.productName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-cyan-400">
                      {sale.productID}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {sale.individualQuantity} {sale.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-300">
                      {formatCurrency(sale.individualPrice)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-400">
                      {formatCurrency(sale.totalPrice)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {formatDate(sale.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {sale.customerName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-cyan-400">
                      {sale.customerMobile || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-300">
                      {sale.customerEmail || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-400">
                      {sale.userEmail}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-800/30 px-6 py-4 border-t border-slate-700/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredSales.length)} of {filteredSales.length} items
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white/10 hover:bg-white/20 disabled:bg-slate-700/50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={page === '...'}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                      page === currentPage
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : page === '...'
                        ? 'text-slate-400 cursor-default'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white/10 hover:bg-white/20 disabled:bg-slate-700/50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* No Results */}
      {filteredSales.length === 0 && !isSearching && (
        <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-12 text-center shadow-lg shadow-cyan-500/10">
          <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
          <p className="text-slate-400">
            {searchTerm || startDate || endDate
              ? `No sold products match your search criteria "${searchTerm}".`
              : 'No sales have been recorded yet.'
            }
          </p>
          {(searchTerm || startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-lg transition-all duration-300"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-12 text-center shadow-lg shadow-cyan-500/10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-white mb-2">Searching...</h3>
          <p className="text-slate-400">Please wait while we search for sales records.</p>
        </div>
      )}
    </div>
  );
};

export default SoldProducts;
