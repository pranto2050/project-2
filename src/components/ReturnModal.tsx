import React, { useState } from 'react';
import { X, Search, Undo2, Package } from 'lucide-react';
import { getProductById } from '../utils/storage';
import { Product } from '../types';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessReturn: (productId: string, quantity: number, reason: string) => void;
}

const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  onProcessReturn
}) => {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');

  const handleSearch = () => {
    if (!productId.trim()) {
      setError('Please enter a product ID');
      return;
    }

    const foundProduct = getProductById(productId.trim());
    if (foundProduct) {
      setProduct(foundProduct);
      setError('');
    } else {
      setProduct(null);
      setError('Product not found');
    }
  };

  const handleReturn = () => {
    if (!product) {
      setError('Please search for a valid product first');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for return');
      return;
    }

    onProcessReturn(product.id, quantity, reason);
    
    // Reset form
    setProductId('');
    setQuantity(1);
    setReason('');
    setProduct(null);
    setError('');
    onClose();
  };

  const totalRefund = product ? quantity * product.pricePerUnit : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Undo2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Return Policy</h2>
                <p className="text-slate-400">Process product returns and refunds</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Search */}
          <div>
            <label className="block text-slate-400 text-sm mb-3">Product ID</label>
            <div className="flex space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="Enter Product ID (e.g., RICE001)"
                  className="w-full pl-4 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 text-orange-400 rounded-xl border border-orange-500/30 transition-all duration-300 flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Product Details */}
          {product && (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{product.name}</h3>
                  <p className="text-slate-400 text-sm">ID: {product.id}</p>
                  <p className="text-orange-400 font-medium">₹{product.pricePerUnit}/{product.unit}</p>
                  <p className="text-slate-500 text-sm">Current Stock: {product.stock} {product.unit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Return Details */}
          {product && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-3">Return Quantity ({product.unit})</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-3">Reason for Return</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for return (e.g., damaged, expired, customer complaint)"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                />
              </div>

              {/* Refund Calculation */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Total Refund Amount:</span>
                  <span className="text-orange-400 text-2xl font-bold">
                    ₹{totalRefund.toFixed(2)}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  {quantity} {product.unit} × ₹{product.pricePerUnit} = ₹{totalRefund.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800/30 border-t border-slate-700/50 p-6">
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-xl border border-slate-600/50 transition-all duration-300"
            >
              Cancel
            </button>
            
            <button
              onClick={handleReturn}
              disabled={!product}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Process Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;