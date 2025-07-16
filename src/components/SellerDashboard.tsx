import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Plus, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Search,
  Filter,
  User,
  Building2,
  BarChart3,
  RefreshCw,
  Shield,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  ShoppingBag
} from 'lucide-react';
import { User as UserType, Product, SaleRecord, ReturnRecord, Category, DailySales, CustomerDetails } from '../types';
import { getProducts, updateStock, getSalesLogs, getPurchaseLogs, getReturnLogs, getTodaysSales, getCategories } from '../utils/storage';
import SalesModal from './SalesModal';
import ReceiptModal from './ReceiptModal';
import ProductEditModal from './ProductEditModal';
import ProductDetailModal from './ProductDetailModal';
import QuantityModal from './QuantityModal';
import PurchaseQuantityModal from './PurchaseQuantityModal';
import WarrantyManagement from './WarrantyManagement';
import SoldProducts from './SoldProducts';
import BrandManagement from './BrandManagement';
import PurchaseModal from './PurchaseModal';
import ReturnModal from './ReturnModal';

interface SellerDashboardProps {
  user: UserType;
  onLogout: () => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ user, onLogout }) => {
  // Move all hooks to the top, before any conditional returns
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  // Remove unused variables and functions
  // const [setSortBy] = useState('name');
  // const [setSortOrder] = useState<'asc' | 'desc'>('asc');
  // const handleCategoryAdd = async () => { ... };
  // const netProfit = totalRevenue - totalPurchases - totalReturns;
  // const handleSeeMore = (product: Product) => { ... };
  
  // Enhanced 3-dropdown filter system
  const [selectedProductType, setSelectedProductType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showPurchaseQuantityModal, setShowPurchaseQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [salesItems, setSalesItems] = useState<any[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);
  const [notification, setNotification] = useState<string>('');
  const [lastReceiptNumber, setLastReceiptNumber] = useState('');
  const [todaysSalesData, setTodaysSalesData] = useState<DailySales>({
    date: new Date().toISOString().split('T')[0],
    sales: [],
    totalAmount: 0,
    totalItems: 0
  });
  const [completedSaleItems, setCompletedSaleItems] = useState<any[]>([]);
  const [completedCustomerDetails, setCompletedCustomerDetails] = useState<any>(null);

  // Product type and brand data structure
  const productTypeData: { [category: string]: string[] } = {
    'Network': ['Router', 'Switch', 'ONU', 'Access Point', 'Modem', 'Network Card'],
    'Storage': ['SSD', 'HDD', 'USB Drive', 'Memory Card', 'External Drive', 'NAS'],
    'Computing': ['CPU', 'GPU', 'RAM', 'Motherboard', 'Power Supply', 'Cooling'],
    'Peripheral': ['Mouse', 'Keyboard', 'Monitor', 'Speaker', 'Webcam', 'Printer'],
    'Camera': ['DSLR', 'Mirrorless', 'Action Camera', 'Webcam', 'Security Camera'],
    'Router': ['Wireless Router', 'Gaming Router', 'Mesh Router', 'Travel Router']
  };

  const brandData: { [productType: string]: string[] } = {
    'Router': ['TP-Link', 'MikroTik', 'Netgear', 'D-Link', 'Cisco', 'Asus', 'Huawei', 'Linksys'],
    'Switch': ['Cisco', 'HP', 'Dell', 'Netgear', 'TP-Link', 'MikroTik', 'Juniper'],
    'ONU': ['Huawei', 'ZTE', 'Alcatel', 'Nokia', 'Ericsson', 'Cisco'],
    'Access Point': ['Ubiquiti', 'Cisco', 'Aruba', 'Ruckus', 'TP-Link', 'Netgear'],
    'Modem': ['Huawei', 'ZTE', 'Motorola', 'Netgear', 'TP-Link', 'D-Link'],
    'Network Card': ['Intel', 'Realtek', 'Broadcom', 'Qualcomm', 'Marvell'],
    'SSD': ['Samsung', 'WD', 'Crucial', 'Kingston', 'SanDisk', 'Intel', 'ADATA'],
    'HDD': ['Seagate', 'WD', 'Toshiba', 'Hitachi', 'Samsung'],
    'USB Drive': ['SanDisk', 'Kingston', 'Samsung', 'WD', 'PNY', 'ADATA'],
    'Memory Card': ['SanDisk', 'Samsung', 'Kingston', 'Lexar', 'PNY', 'ADATA'],
    'External Drive': ['WD', 'Seagate', 'Samsung', 'Toshiba', 'LaCie'],
    'NAS': ['Synology', 'QNAP', 'WD', 'Seagate', 'Asustor', 'Terramaster'],
    'CPU': ['Intel', 'AMD', 'ARM'],
    'GPU': ['NVIDIA', 'AMD', 'Intel'],
    'RAM': ['Corsair', 'G.Skill', 'Kingston', 'Crucial', 'ADATA', 'Team Group'],
    'Motherboard': ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'Intel', 'Biostar'],
    'Power Supply': ['Corsair', 'EVGA', 'Seasonic', 'Cooler Master', 'Thermaltake'],
    'Cooling': ['Noctua', 'Corsair', 'Cooler Master', 'be quiet!', 'Arctic', 'NZXT'],
    'Mouse': ['Logitech', 'Razer', 'SteelSeries', 'Corsair', 'Microsoft', 'HP'],
    'Keyboard': ['Logitech', 'Razer', 'Corsair', 'SteelSeries', 'Cherry', 'Ducky'],
    'Monitor': ['Samsung', 'LG', 'Dell', 'ASUS', 'Acer', 'BenQ', 'ViewSonic'],
    'Speaker': ['Logitech', 'Creative', 'Bose', 'JBL', 'Harman Kardon', 'Klipsch'],
    'Webcam': ['Logitech', 'Microsoft', 'Razer', 'Creative', 'HP', 'Dell'],
    'Printer': ['HP', 'Canon', 'Epson', 'Brother', 'Samsung', 'Xerox'],
    'DSLR': ['Canon', 'Nikon', 'Sony', 'Pentax', 'Fujifilm'],
    'Mirrorless': ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'Panasonic', 'Olympus'],
    'Action Camera': ['GoPro', 'DJI', 'Sony', 'Garmin', 'Insta360'],
    'Security Camera': ['Hikvision', 'Dahua', 'Axis', 'Bosch', 'Sony', 'Panasonic']
  };

  // Now check for seller access
  if (!user || user.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
        <div className="text-white text-xl">Access Denied</div>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  // Update product types when category changes
  useEffect(() => {
    if (selectedCategory) {
      const types = productTypeData[selectedCategory] || [];
      setProductTypes(types);
      setSelectedProductType('');
      setSelectedBrand('');
      setBrands([]);
    } else {
      setProductTypes([]);
      setSelectedProductType('');
      setSelectedBrand('');
      setBrands([]);
    }
  }, [selectedCategory, productTypeData]);

  // Update brands when product type changes
  useEffect(() => {
    if (selectedProductType) {
      const brandList = brandData[selectedProductType] || [];
      setBrands(brandList);
      setSelectedBrand('');
    } else {
      setBrands([]);
      setSelectedBrand('');
    }
  }, [selectedProductType, brandData]);

  const loadData = async () => {
    try {
      const [productsData, categoriesData, salesData, , returnsData, todaysSales] = await Promise.all([
        getProducts(),
        getCategories(),
        getSalesLogs(),
        getPurchaseLogs(),
        getReturnLogs(),
        getTodaysSales()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setSales(salesData);
      // setPurchases(purchasesData); // Not used in seller dashboard
      setReturns(returnsData);
      setTodaysSalesData(todaysSales);
    } catch (error) {
      console.error('Failed to load data:', error);
      showNotification('Failed to load data');
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleProductUpdate = async (updatedProduct: Product) => {
    try {
      // For sellers, we'll use a simplified update approach
      const success = await updateStock(updatedProduct.id, updatedProduct.stock);
      if (success) {
        await loadData();
        showNotification('Product updated successfully');
      } else {
        showNotification('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showNotification('Failed to update product');
    }
  };

  const handleProductEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowProductEditModal(true);
  };

  const addToSale = (product: Product) => {
    setSelectedProduct(product);
    setShowQuantityModal(true);
  };

  const addToPurchase = (product: Product) => {
    setSelectedProduct(product);
    setShowPurchaseQuantityModal(true);
  };

  const handleQuantityConfirm = (quantity: number) => {
    if (!selectedProduct) return;

    const totalPrice = quantity * selectedProduct.pricePerUnit;
    const saleItem = {
      product: selectedProduct,
      quantity,
      totalPrice
    };

    setSalesItems(prev => {
      const existingItem = prev.find(item => item.product.id === selectedProduct.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === selectedProduct.id
            ? { ...item, quantity: item.quantity + quantity, totalPrice: item.totalPrice + totalPrice }
            : item
        );
      } else {
        return [...prev, saleItem];
      }
    });

    showNotification(`Added ${quantity} ${selectedProduct.unit} of ${selectedProduct.name} to sale`);
    setSelectedProduct(null);
  };

  const handlePurchaseQuantityConfirm = (quantity: number, customPrice?: number) => {
    if (!selectedProduct) return;

    const pricePerUnit = customPrice || selectedProduct.pricePerUnit;
    const totalCost = quantity * pricePerUnit;
    const purchaseItem = {
      product: selectedProduct,
      quantity,
      totalCost
    };

    setPurchaseItems(prev => {
      const existingItem = prev.find(item => item.product.id === selectedProduct.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === selectedProduct.id
            ? { ...item, quantity: item.quantity + quantity, totalCost: item.totalCost + totalCost }
            : item
        );
      } else {
        return [...prev, purchaseItem];
      }
    });

    showNotification(`Added ${quantity} ${selectedProduct.unit} of ${selectedProduct.name} to purchase`);
    setSelectedProduct(null);
  };

  const removeFromSale = (productId: string) => {
    setSalesItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const removeFromPurchase = (productId: string) => {
    setPurchaseItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const completeSale = async (customDateTime?: string, warrantyInfo?: { dateOfSale: string; warrantyEndDate: string }, customerDetails?: CustomerDetails) => {
    if (salesItems.length === 0) return;

    const receiptNumber = `RCP${Date.now()}`;
    setLastReceiptNumber(receiptNumber);

    const itemsToProcess = salesItems;

    try {
      for (const item of itemsToProcess) {
        // Update stock
        await updateStock(item.product.id, item.product.stock - item.quantity);

        // Create sale record with seller information
        const saleData = {
          productId: item.product.id,
          productName: item.product.name,
          customerId: user.id,
          customerEmail: user.email,
          quantity: item.quantity,
          pricePerUnit: item.product.pricePerUnit,
          totalPrice: item.totalPrice,
          unit: item.product.unit,
          currency: 'BDT',
          dateOfSale: warrantyInfo?.dateOfSale || new Date().toISOString().split('T')[0],
          warrantyEndDate: warrantyInfo?.warrantyEndDate || (() => {
            const saleDate = new Date(warrantyInfo?.dateOfSale || new Date());
            const endDate = new Date(saleDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
            return endDate.toISOString().split('T')[0];
          })(),
          timestamp: customDateTime || new Date().toISOString(),
          commonId: item.product.commonId || '',
          uniqueId: item.product.uniqueId || '',
          sellerId: user.id,
          sellerName: user.name,
          sellerRole: user.role,
          customer: customerDetails ? {
            mobile: customerDetails.mobile,
            email: customerDetails.email,
            address: customerDetails.address
          } : undefined
        };

        // Save sale with warranty information
        const result = await fetch('http://localhost:3001/api/sales-with-warranty', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(saleData)
        });

        if (!result.ok) {
          throw new Error('Failed to save sale with warranty');
        }
      }

      const completedSaleItems = [...itemsToProcess];
      
      setSalesItems([]);
      await loadData();
      setShowSalesModal(false);
      
      setCompletedSaleItems(completedSaleItems);
      setCompletedCustomerDetails(customerDetails);
      setShowReceiptModal(true);
      showNotification('Sale completed successfully!');
    } catch (error) {
      console.error('Error completing sale:', error);
      showNotification('Failed to complete sale. Please try again.');
    }
  };

  const completePurchase = (_customDateTime?: string) => {
    showNotification('Purchase completion requires admin access. Please contact administrator.');
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === '' || product.category === selectedCategory) &&
    (selectedProductType === '' || 
     product.name.toLowerCase().includes(selectedProductType.toLowerCase()) ||
     (product.networkItem && product.networkItem.toLowerCase().includes(selectedProductType.toLowerCase()))) &&
    (selectedBrand === '' || (product.brand && product.brand.toLowerCase().includes(selectedBrand.toLowerCase())))
  );

  const lowStockProducts = products.filter(p => p.stock <= 10);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'sold-products', label: 'Sold Products', icon: Package },
    { id: 'purchases', label: 'Purchases', icon: TrendingUp },
    { id: 'returns', label: 'Returns', icon: RefreshCw },
    { id: 'warranty', label: 'Warranty', icon: Shield },
    { id: 'categories', label: 'Categories', icon: Filter },
    { id: 'brands', label: 'Brands', icon: Building2 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 pb-8">
      <div className="container mx-auto px-4">
        {notification && (
          <div className="fixed top-24 right-4 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg z-50 border border-green-400/30">
            {notification}
          </div>
        )}

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 mb-8 shadow-lg shadow-cyan-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                <User className="w-8 h-8 text-slate-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Seller Dashboard</h1>
                <p className="text-green-400">Welcome back, {user.name}</p>
                <p className="text-slate-400 text-sm">Role: {user.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl border border-red-500/30 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-2 mb-6 shadow-lg shadow-cyan-500/10">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
              <h2 className="text-xl font-bold text-white mb-4">Today's Sales Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Total Sales</p>
                  <p className="text-green-400 text-2xl font-bold">৳{todaysSalesData.totalAmount.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Total Items Sold</p>
                  <p className="text-green-400 text-2xl font-bold">{todaysSalesData.totalItems}</p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-2">Sales Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="py-2 px-4 text-slate-400">Product</th>
                        <th className="py-2 px-4 text-slate-400">Quantity</th>
                        <th className="py-2 px-4 text-slate-400">Price</th>
                        <th className="py-2 px-4 text-slate-400">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaysSalesData.sales.map((sale, index) => (
                        <tr key={index} className="border-b border-slate-700/30">
                          <td className="py-2 px-4 text-white">{sale.productName}</td>
                          <td className="py-2 px-4 text-slate-300">{sale.quantitySold}</td>
                          <td className="py-2 px-4 text-slate-300">৳{sale.pricePerUnit}</td>
                          <td className="py-2 px-4 text-green-400 font-bold">৳{sale.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
              <h2 className="text-xl font-bold text-white mb-4">Inventory Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Total Products</p>
                  <p className="text-green-400 text-2xl font-bold">{products.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Low Stock (≤ 10)</p>
                  <p className="text-red-400 text-2xl font-bold">{lowStockProducts.length}</p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-2">Low Stock Products</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="py-2 px-4 text-slate-400">Product</th>
                        <th className="py-2 px-4 text-slate-400">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map((product, index) => (
                        <tr key={index} className="border-b border-slate-700/30">
                          <td className="py-2 px-4 text-white">{product.name}</td>
                          <td className="py-2 px-4 text-slate-300">{product.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Product Inventory</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowProductEditModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
                <button
                  onClick={() => setShowProductEditModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Product</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                >
                  <option value="">All Product Types</option>
                  {productTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand, index) => (
                    <option key={index} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-3 px-4 text-slate-400">Product</th>
                    <th className="py-3 px-4 text-slate-400">Category</th>
                    <th className="py-3 px-4 text-slate-400">Brand</th>
                    <th className="py-3 px-4 text-slate-400">Stock</th>
                    <th className="py-3 px-4 text-slate-400">Price</th>
                    <th className="py-3 px-4 text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-slate-700/30 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{product.name}</td>
                      <td className="py-3 px-4 text-slate-300">{product.category}</td>
                      <td className="py-3 px-4 text-slate-300">{product.brand}</td>
                      <td className="py-3 px-4 text-slate-300">{product.stock}</td>
                      <td className="py-3 px-4 text-green-400 font-bold">৳{product.pricePerUnit}</td>
                      <td className="py-3 px-4 text-slate-400 flex space-x-2">
                        <button
                          onClick={() => handleProductEdit(product)}
                          className="p-2 hover:bg-cyan-500/20 rounded-lg text-cyan-400"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => showNotification('Product deletion requires admin access. Please contact administrator.')}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Sale</h2>
              <button
                onClick={() => setShowSalesModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Complete Sale</span>
              </button>
            </div>

            {salesItems.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-2">Items in Cart</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="py-2 px-4 text-slate-400">Product</th>
                        <th className="py-2 px-4 text-slate-400">Quantity</th>
                        <th className="py-2 px-4 text-slate-400">Price</th>
                        <th className="py-2 px-4 text-slate-400">Total</th>
                        <th className="py-2 px-4 text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesItems.map((item, index) => (
                        <tr key={index} className="border-b border-slate-700/30">
                          <td className="py-2 px-4 text-white">{item.product.name}</td>
                          <td className="py-2 px-4 text-slate-300">{item.quantity}</td>
                          <td className="py-2 px-4 text-slate-300">৳{item.product.pricePerUnit}</td>
                          <td className="py-2 px-4 text-green-400 font-bold">৳{item.totalPrice}</td>
                          <td className="py-2 px-4 text-slate-400 flex space-x-2">
                            <button
                              onClick={() => removeFromSale(item.product.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-2">Add Items to Sale</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.filter(p => p.stock > 0).map((product) => (
                  <div
                    key={product.id}
                    className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 shadow-lg shadow-cyan-500/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-900" />
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">৳{product.pricePerUnit}</div>
                        <div className="text-slate-400 text-sm">Stock: {product.stock}</div>
                      </div>
                    </div>
                    
                    <h3 className="text-white font-bold text-lg mb-1">{product.name}</h3>
                    <p className="text-slate-400 text-sm mb-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <span>{product.category} • {product.brand}</span>
                      <button
                        onClick={() => addToSale(product)}
                        disabled={product.stock === 0}
                        className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add to Sale
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sold-products' && (
          <SoldProducts sales={sales} />
        )}

        {activeTab === 'purchases' && (
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Purchase</h2>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Complete Purchase</span>
              </button>
            </div>

            {purchaseItems.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-2">Items in Cart</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="py-2 px-4 text-slate-400">Product</th>
                        <th className="py-2 px-4 text-slate-400">Quantity</th>
                        <th className="py-2 px-4 text-slate-400">Price</th>
                        <th className="py-2 px-4 text-slate-400">Total</th>
                        <th className="py-2 px-4 text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseItems.map((item, index) => (
                        <tr key={index} className="border-b border-slate-700/30">
                          <td className="py-2 px-4 text-white">{item.product.name}</td>
                          <td className="py-2 px-4 text-slate-300">{item.quantity}</td>
                          <td className="py-2 px-4 text-slate-300">৳{item.product.pricePerUnit}</td>
                          <td className="py-2 px-4 text-green-400 font-bold">৳{item.totalCost}</td>
                          <td className="py-2 px-4 text-slate-400 flex space-x-2">
                            <button
                              onClick={() => removeFromPurchase(item.product.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-2">Add Items to Purchase</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.filter(p => p.stock > 0).map((product) => (
                  <div
                    key={product.id}
                    className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 shadow-lg shadow-cyan-500/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-slate-900" />
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">৳{product.pricePerUnit}</div>
                        <div className="text-slate-400 text-sm">Stock: {product.stock}</div>
                      </div>
                    </div>
                    
                    <h3 className="text-white font-bold text-lg mb-1">{product.name}</h3>
                    <p className="text-slate-400 text-sm mb-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <span>{product.category} • {product.brand}</span>
                      <button
                        onClick={() => addToPurchase(product)}
                        disabled={product.stock === 0}
                        className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add to Purchase
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Return</h2>
              <button
                onClick={() => setShowReturnModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Complete Return</span>
              </button>
            </div>

            {returns.map((returnRecord, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg shadow-cyan-500/10">
                <h3 className="text-lg font-bold text-white mb-2">Return #{returnRecord.productID.substring(0, 8)}</h3>
                <p className="text-slate-400 text-sm mb-2">Date: {new Date(returnRecord.timestamp).toLocaleDateString()}</p>
                <p className="text-slate-400 text-sm mb-2">Product: {returnRecord.productName}</p>
                <p className="text-slate-400 text-sm mb-2">Reason: {returnRecord.reason || 'N/A'}</p>
                <p className="text-slate-400 text-sm mb-2">Total Refund: ৳{returnRecord.totalRefund.toLocaleString()}</p>
                <div className="flex items-center space-x-2 mt-4">
                  <button
                    onClick={() => showNotification('Return processing requires admin access. Please contact administrator.')}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-all duration-300"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Process Return</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'warranty' && (
          <WarrantyManagement user={user} />
        )}

        {activeTab === 'categories' && (
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Category Management</h2>
              <button
                onClick={() => setShowProductEditModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Category</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-3 px-4 text-slate-400">Category</th>
                    <th className="py-3 px-4 text-slate-400">Description</th>
                    <th className="py-3 px-4 text-slate-400">Created Date</th>
                    <th className="py-3 px-4 text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-slate-700/30 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{category.name}</td>
                      <td className="py-3 px-4 text-slate-300">{category.description}</td>
                      <td className="py-3 px-4 text-slate-300">{new Date(category.createdDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-slate-400 flex space-x-2">
                        <button
                          onClick={() => showNotification('Category deletion requires admin access. Please contact administrator.')}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'brands' && (
          <BrandManagement products={products} />
        )}

        {/* Sales Modal */}
        {showSalesModal && (
          <SalesModal
            isOpen={showSalesModal}
            onClose={() => setShowSalesModal(false)}
            salesItems={salesItems}
            onRemoveItem={removeFromSale}
            onCompleteSale={completeSale}
          />
        )}

        {/* Receipt Modal */}
        {showReceiptModal && (
          <ReceiptModal
            isOpen={showReceiptModal}
            onClose={() => setShowReceiptModal(false)}
            salesItems={completedSaleItems}
            receiptNumber={lastReceiptNumber}
            cashierName={user.name}
            customerDetails={completedCustomerDetails}
          />
        )}

        {/* Product Edit Modal */}
        {showProductEditModal && (
          <ProductEditModal
            isOpen={showProductEditModal}
            onClose={() => setShowProductEditModal(false)}
            product={selectedProduct}
            onSave={handleProductUpdate}
          />
        )}

        {/* Product Detail Modal */}
        {showProductDetailModal && selectedProduct && (
          <ProductDetailModal
            isOpen={showProductDetailModal}
            onClose={() => setShowProductDetailModal(false)}
            product={selectedProduct}
          />
        )}

        {/* Quantity Selection Modal */}
        {showQuantityModal && selectedProduct && (
          <QuantityModal
            isOpen={showQuantityModal}
            onClose={() => setShowQuantityModal(false)}
            product={selectedProduct}
            onConfirm={handleQuantityConfirm}
          />
        )}

        {/* Purchase Quantity Selection Modal */}
        {showPurchaseQuantityModal && selectedProduct && (
          <PurchaseQuantityModal
            isOpen={showPurchaseQuantityModal}
            onClose={() => setShowPurchaseQuantityModal(false)}
            product={selectedProduct}
            onConfirm={handlePurchaseQuantityConfirm}
          />
        )}

        {/* Purchase Modal */}
        {showPurchaseModal && (
          <PurchaseModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            purchaseItems={purchaseItems}
            onRemoveItem={removeFromPurchase}
            onCompletePurchase={completePurchase}
          />
        )}

        {/* Return Modal */}
        {showReturnModal && (
          <ReturnModal
            isOpen={showReturnModal}
            onClose={() => setShowReturnModal(false)}
            onProcessReturn={() => showNotification('Return processing requires admin access. Please contact administrator.')}
          />
        )}
      </div>
    </div>
  );
};

export default SellerDashboard; 