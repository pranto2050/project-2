import { useMemo, useEffect, useState } from "react";
import { Layers, Router, Tag, CheckCircle } from "lucide-react";
import { Product } from '../types';

interface Brand {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  logoFile: string;
  createdDate: string;
}

interface ProductFilterBarProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
}

export default function ProductFilterBar({
  products,
  selectedCategory, setSelectedCategory,
  selectedType, setSelectedType,
  selectedBrand, setSelectedBrand,
  selectedStatus, setSelectedStatus
}: ProductFilterBarProps) {
  const [brands, setBrands] = useState<Brand[]>([]);

  // Load brands from database
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/brands');
        if (response.ok) {
          const brandsData = await response.json();
          setBrands(brandsData);
        }
      } catch (error) {
        console.error('Failed to load brands:', error);
      }
    };
    loadBrands();
  }, []);

  // Unique options for each dropdown, filtered by previous selections
  const categoryOptions = useMemo(
    () => {
      // Since all products in new structure are network devices, return Network category
      const categories = [...new Set(products.map(p => p.category || 'Network').filter(Boolean))];
      return categories.length > 0 ? categories : ['Network'];
    },
    [products]
  );

  // Define network device types
  const networkDeviceTypes = ["Router", "Switch", "ONU", "Others"];

  // Type options - network device types for Network category, types for others
  const typeOptions = useMemo(() => {
    if (selectedCategory === "Network") {
      return networkDeviceTypes;
    }
    // For other categories, show types from products
    return [...new Set(products.filter(p => !selectedCategory || p.category === selectedCategory).map(p => p.type).filter(Boolean))];
  }, [products, selectedCategory]);

  // Brand options - use brands from database
  const brandOptions = useMemo(
    () => {
      // Always show brands from the brands database
      const databaseBrands = brands.map(brand => brand.name).filter(Boolean);
      
      // Also include brands from products to ensure we don't miss any
      const productBrands = [...new Set(products.filter(p =>
        (!selectedCategory || p.category === selectedCategory) &&
        (!selectedType || p.type === selectedType)
      ).map(p => p.brand).filter(Boolean))];
      
      // Combine and deduplicate
      return [...new Set([...databaseBrands, ...productBrands])];
    },
    [products, selectedCategory, selectedType, brands]
  );

  const statusOptions = useMemo(
    () => [...new Set(products.filter(p =>
      (!selectedCategory || p.category === selectedCategory) &&
      (!selectedType || p.type === selectedType) &&
      (!selectedBrand || p.brand === selectedBrand)
    ).map(p => p.availability || 'Unknown').filter(Boolean))],
    [products, selectedCategory, selectedType, selectedBrand]
  );

  return (
    <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between bg-white/5 border border-cyan-500/10 rounded-xl p-3 sm:p-4 shadow-sm">
      {/* Category */}
      <div className="relative w-full sm:w-auto">
        <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
        <select
          value={selectedCategory}
          onChange={e => {
            setSelectedCategory(e.target.value);
            setSelectedType("");
            setSelectedBrand("");
            setSelectedStatus("");
          }}
          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
        >
          <option value="">All Categories</option>
          {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Type (Network Types or Subcategories) */}
      <div className="relative w-full sm:w-auto">
        <Router className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
        <select
          value={selectedType}
          onChange={e => {
            setSelectedType(e.target.value);
            setSelectedBrand("");
            setSelectedStatus("");
          }}
          disabled={!selectedCategory}
          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all disabled:opacity-60"
        >
          <option value="">
            {selectedCategory === "Network" ? "All Types" : "All Subcategories"}
          </option>
          {typeOptions.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      {/* Brand */}
      <div className="relative w-full sm:w-auto">
        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
        <select
          value={selectedBrand}
          onChange={e => {
            setSelectedBrand(e.target.value);
            setSelectedStatus("");
          }}
          disabled={!selectedCategory}
          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all disabled:opacity-60"
        >
          <option value="">All Brands</option>
          {brandOptions.map(brand => <option key={brand} value={brand}>{brand}</option>)}
        </select>
      </div>

      {/* Status */}
      <div className="relative w-full sm:w-auto">
        <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
        >
          <option value="">All Status</option>
          {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>
    </div>
  );
} 