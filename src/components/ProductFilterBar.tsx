import { useMemo } from "react";
import { Layers, List, Tag, Barcode, Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
}

interface ProductFilterBarProps {
  products: Product[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (value: string) => void;
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (value: string) => void;
}

export default function ProductFilterBar({
  products,
  searchTerm, setSearchTerm,
  selectedCategory, setSelectedCategory,
  selectedSubcategory, setSelectedSubcategory,
  selectedBrand, setSelectedBrand,
  selectedModel, setSelectedModel
}: ProductFilterBarProps) {
  // Unique options for each dropdown, filtered by previous selections
  const categoryOptions = useMemo(
    () => [...new Set(products.map(p => p.category).filter(Boolean))],
    [products]
  );
  const subcategoryOptions = useMemo(
    () => [...new Set(products.filter(p => !selectedCategory || p.category === selectedCategory).map(p => p.subcategory).filter(Boolean))],
    [products, selectedCategory]
  );
  const brandOptions = useMemo(
    () => [...new Set(products.filter(p =>
      selectedCategory && p.category === selectedCategory
    ).map(p => p.brand).filter(Boolean))],
    [products, selectedCategory]
  );
  const modelOptions = useMemo(
    () => [...new Set(products.filter(p =>
      (!selectedCategory || p.category === selectedCategory) &&
      (!selectedSubcategory || p.subcategory === selectedSubcategory) &&
      (!selectedBrand || p.brand === selectedBrand)
    ).map(p => p.model).filter(Boolean))],
    [products, selectedCategory, selectedSubcategory, selectedBrand]
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Search Box - Always at the top */}
      <div className="w-full bg-white/5 border border-cyan-500/10 rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Product ID or Name..."
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-cyan-400/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
          />
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between bg-white/5 border border-cyan-500/10 rounded-xl p-3 sm:p-4 shadow-sm">
        {/* Category */}
        <div className="relative w-full sm:w-auto">
          <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <select
            value={selectedCategory}
            onChange={e => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory("");
              setSelectedBrand("");
              setSelectedModel("");
            }}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
          >
            <option value="">All Categories</option>
            {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        {/* Subcategory */}
        <div className="relative w-full sm:w-auto">
          <List className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <select
            value={selectedSubcategory}
            onChange={e => {
              setSelectedSubcategory(e.target.value);
              setSelectedBrand("");
              setSelectedModel("");
            }}
            disabled={!selectedCategory}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all disabled:opacity-60"
          >
            <option value="">All Subcategories</option>
            {subcategoryOptions.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
        {/* Brand */}
        <div className="relative w-full sm:w-auto">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <select
            value={selectedBrand}
            onChange={e => {
              setSelectedBrand(e.target.value);
              setSelectedModel("");
            }}
            disabled={!selectedCategory}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all disabled:opacity-60"
          >
            <option value="">All Brands</option>
            {brandOptions.map(brand => <option key={brand} value={brand}>{brand}</option>)}
          </select>
        </div>
        {/* Model */}
        <div className="relative w-full sm:w-auto">
          <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            disabled={!selectedBrand}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all disabled:opacity-60"
          >
            <option value="">All Models</option>
            {modelOptions.map(model => <option key={model} value={model}>{model}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
} 