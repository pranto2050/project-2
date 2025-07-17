import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Filter, 
  Download,
  BarChart3,
  Clock,
  RefreshCw
} from 'lucide-react';

interface SaleRecord {
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  unit: string;
  dateOfSale: string;
  timestamp?: string;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  customerAddress?: string;
  soldByEmail?: string;
  warrantyEndDate?: string;
}

interface TodaysSalesDashboardProps {
  refreshTrigger?: number; // Optional prop to trigger refresh from parent
  className?: string;
}

interface SalesStats {
  totalProducts: number;
  totalRevenue: number;
  uniqueProductCount: number;
  salesCount: number;
}

const TodaysSalesDashboard: React.FC<TodaysSalesDashboardProps> = ({ 
  refreshTrigger, 
  className = "" 
}) => {
  const [todaysStats, setTodaysStats] = useState<SalesStats>({
    totalProducts: 0,
    totalRevenue: 0,
    uniqueProductCount: 0,
    salesCount: 0
  });

  const [monthlyStats, setMonthlyStats] = useState<SalesStats>({
    totalProducts: 0,
    totalRevenue: 0,
    uniqueProductCount: 0,
    salesCount: 0
  });

  const [customStats, setCustomStats] = useState<SalesStats>({
    totalProducts: 0,
    totalRevenue: 0,
    uniqueProductCount: 0,
    salesCount: 0
  });

  const [showMonthlyView, setShowMonthlyView] = useState(false);
  const [showCustomDateView, setShowCustomDateView] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  // Fetch sales data
  const fetchSalesData = async (): Promise<SaleRecord[]> => {
    try {
      const response = await fetch('http://localhost:3001/api/soldproducts');
      if (!response.ok) throw new Error('Failed to fetch sales data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching sales data:', error);
      return [];
    }
  };

  // Calculate stats for a given date range
  const calculateStats = (salesData: SaleRecord[], startDate: string, endDate: string): SalesStats => {
    const filteredSales = salesData.filter(sale => {
      const saleDate = sale.timestamp ? new Date(sale.timestamp) : new Date(sale.dateOfSale);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Set end date to end of day for inclusive filtering
      end.setHours(23, 59, 59, 999);
      
      return saleDate >= start && saleDate <= end;
    });

    const totalProducts = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const uniqueProductCount = new Set(filteredSales.map(sale => sale.productId)).size;
    const salesCount = filteredSales.length;

    return {
      totalProducts,
      totalRevenue,
      uniqueProductCount,
      salesCount
    };
  };

  // Load all stats
  const loadStats = async () => {
    setLoading(true);
    try {
      const salesData = await fetchSalesData();
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Today's stats
      const todaysData = calculateStats(salesData, todayStr, todayStr);
      setTodaysStats(todaysData);

      // Monthly stats (current month)
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyData = calculateStats(
        salesData, 
        firstDayOfMonth.toISOString().split('T')[0], 
        todayStr
      );
      setMonthlyStats(monthlyData);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load custom date range stats
  const loadCustomStats = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    try {
      const salesData = await fetchSalesData();
      const customData = calculateStats(salesData, startDate, endDate);
      setCustomStats(customData);
      setShowCustomDateView(true);
    } catch (error) {
      console.error('Error loading custom stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  // Initial load
  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

  // Format date range for display
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  // Export functionality
  const handleExport = () => {
    const data = showMonthlyView ? monthlyStats : showCustomDateView ? customStats : todaysStats;
    const title = showMonthlyView ? 'Monthly Sales Report' : showCustomDateView ? `Custom Range Sales Report (${formatDateRange(startDate, endDate)})` : "Today's Sales Report";
    
    const exportData = {
      title,
      generatedAt: new Date().toISOString(),
      stats: data,
      dateRange: showCustomDateView ? { startDate, endDate } : undefined
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className={`bg-white/10 backdrop-blur-xl border border-${color}-500/20 rounded-2xl p-6 shadow-lg shadow-${color}-500/10`}>
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 bg-gradient-to-br from-${color}-400 to-${color}-500 rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-slate-400 text-sm">{title}</p>
          <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-cyan-400" />
              Sales Dashboard
            </h2>
            <p className="text-slate-400 flex items-center mt-1">
              <Clock className="w-4 h-4 mr-2" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadStats}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl border border-cyan-500/30 transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl border border-green-500/30 transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Sales Section */}
      {!showMonthlyView && !showCustomDateView && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
              Today's Sales - {new Date().toLocaleDateString()}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Products Sold Today"
              value={todaysStats.totalProducts || 'N/A'}
              icon={<Package className="w-6 h-6 text-slate-900" />}
              color="blue"
              subtitle={`${todaysStats.salesCount} transactions`}
            />
            <StatCard
              title="Revenue Today"
              value={todaysStats.totalRevenue ? formatCurrency(todaysStats.totalRevenue) : 'N/A'}
              icon={<DollarSign className="w-6 h-6 text-slate-900" />}
              color="green"
              subtitle={todaysStats.totalRevenue ? `Avg: ${formatCurrency(todaysStats.totalRevenue / (todaysStats.salesCount || 1))}` : undefined}
            />
            <StatCard
              title="Unique Products"
              value={todaysStats.uniqueProductCount || 'N/A'}
              icon={<TrendingUp className="w-6 h-6 text-slate-900" />}
              color="purple"
              subtitle="Different items sold"
            />
            <StatCard
              title="Transactions"
              value={todaysStats.salesCount || 'N/A'}
              icon={<BarChart3 className="w-6 h-6 text-slate-900" />}
              color="orange"
              subtitle="Sales completed"
            />
          </div>
        </div>
      )}

      {/* Monthly Sales Section */}
      {showMonthlyView && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
              Monthly Sales Report - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => setShowMonthlyView(false)}
              className="px-4 py-2 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 rounded-xl border border-slate-500/30 transition-all duration-300"
            >
              Back to Today
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Products Sold This Month"
              value={monthlyStats.totalProducts || 'N/A'}
              icon={<Package className="w-6 h-6 text-slate-900" />}
              color="blue"
              subtitle={`${monthlyStats.salesCount} transactions`}
            />
            <StatCard
              title="Monthly Revenue"
              value={monthlyStats.totalRevenue ? formatCurrency(monthlyStats.totalRevenue) : 'N/A'}
              icon={<DollarSign className="w-6 h-6 text-slate-900" />}
              color="green"
              subtitle={monthlyStats.totalRevenue ? `Avg: ${formatCurrency(monthlyStats.totalRevenue / (monthlyStats.salesCount || 1))}` : undefined}
            />
            <StatCard
              title="Unique Products"
              value={monthlyStats.uniqueProductCount || 'N/A'}
              icon={<TrendingUp className="w-6 h-6 text-slate-900" />}
              color="purple"
              subtitle="Different items sold"
            />
            <StatCard
              title="Total Transactions"
              value={monthlyStats.salesCount || 'N/A'}
              icon={<BarChart3 className="w-6 h-6 text-slate-900" />}
              color="orange"
              subtitle="Sales completed"
            />
          </div>
        </div>
      )}

      {/* Custom Date Range Section */}
      {showCustomDateView && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-cyan-400" />
              Custom Range Report - {formatDateRange(startDate, endDate)}
            </h3>
            <button
              onClick={() => setShowCustomDateView(false)}
              className="px-4 py-2 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 rounded-xl border border-slate-500/30 transition-all duration-300"
            >
              Back to Today
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Products Sold"
              value={customStats.totalProducts || 'N/A'}
              icon={<Package className="w-6 h-6 text-slate-900" />}
              color="blue"
              subtitle={`${customStats.salesCount} transactions`}
            />
            <StatCard
              title="Total Revenue"
              value={customStats.totalRevenue ? formatCurrency(customStats.totalRevenue) : 'N/A'}
              icon={<DollarSign className="w-6 h-6 text-slate-900" />}
              color="green"
              subtitle={customStats.totalRevenue ? `Avg: ${formatCurrency(customStats.totalRevenue / (customStats.salesCount || 1))}` : undefined}
            />
            <StatCard
              title="Unique Products"
              value={customStats.uniqueProductCount || 'N/A'}
              icon={<TrendingUp className="w-6 h-6 text-slate-900" />}
              color="purple"
              subtitle="Different items sold"
            />
            <StatCard
              title="Total Transactions"
              value={customStats.salesCount || 'N/A'}
              icon={<BarChart3 className="w-6 h-6 text-slate-900" />}
              color="orange"
              subtitle="Sales completed"
            />
          </div>
        </div>
      )}

      {/* Action Buttons & Date Filter */}
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-lg shadow-cyan-500/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Report Button */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Reports</h4>
            <button
              onClick={() => {
                setShowMonthlyView(true);
                setShowCustomDateView(false);
              }}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 rounded-xl text-blue-400 font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/20"
            >
              <Calendar className="w-5 h-5" />
              <span>View Monthly Report</span>
            </button>
          </div>

          {/* Custom Date Range Filter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Custom Date Range</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={loadCustomStats}
              disabled={!startDate || !endDate || loading}
              className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 rounded-xl text-green-400 font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Filter className="w-5 h-5" />
              <span>Filter Range</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-12 w-12 text-cyan-400 mb-4">
                <RefreshCw className="w-12 h-12" />
              </div>
              <span className="text-white text-lg font-semibold">Loading Sales Data...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysSalesDashboard;
