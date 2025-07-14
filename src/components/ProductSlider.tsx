import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductSliderProps {
  products: Product[];
  title: string;
  onAddToCart?: (product: Product) => void;
  onAddToSale?: (product: Product) => void;
  showAddToCart?: boolean;
  showSellButton?: boolean;
}

const ProductSlider: React.FC<ProductSliderProps> = ({ 
  products, 
  title, 
  onAddToCart, 
  onAddToSale,
  showAddToCart = false,
  showSellButton = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex(prev => 
      prev + slidesToShow >= products.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, products.length - slidesToShow) : prev - 1
    );
  };

  if (products.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={prevSlide}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
            width: `${(products.length / slidesToShow) * 100}%`
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="px-2"
              style={{ width: `${100 / products.length}%` }}
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onAddToSale={onAddToSale}
                showAddToCart={showAddToCart}
                showSellButton={showSellButton}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;