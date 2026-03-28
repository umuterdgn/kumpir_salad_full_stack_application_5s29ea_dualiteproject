import React, { useState, useEffect } from 'react';
import { X, Info, Plus } from 'lucide-react';
import { Product, Extra, useAppStore } from '../store';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [totalPrice, setTotalPrice] = useState(product.price);
  
  const addToCart = useAppStore(state => state.addToCart);

  useEffect(() => {
    const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    setTotalPrice((product.price + extrasTotal) * quantity);
  }, [quantity, selectedExtras, product.price]);

  const handleExtraToggle = (extra: Extra) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.name === extra.name);
      if (exists) return prev.filter(e => e.name !== extra.name);
      return [...prev, extra];
    });
  };

  const handleAdd = () => {
    addToCart(product, quantity, note, selectedExtras);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row transform transition-all">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-md text-gray-600 hover:text-brand-orange z-10 transition-colors">
          <X size={20} />
        </button>
        
        <div className="md:w-1/2 h-64 md:h-auto relative">
          <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
        </div>
        
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col bg-white">
          <h2 className="text-3xl font-bold text-brand-dark mb-2">{product.name}</h2>
          <p className="text-brand-orange text-2xl font-bold mb-4">{product.price.toFixed(2)} ₺</p>
          
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Extras Section */}
          {product.extras && product.extras.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-brand-dark mb-3 flex items-center gap-2">
                <Plus size={18} className="text-brand-orange"/> Ekstra Malzemeler
              </h4>
              <div className="space-y-2">
                {product.extras.map((extra, idx) => (
                  <label key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-orange-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-brand-orange rounded border-gray-300 focus:ring-brand-orange"
                        checked={selectedExtras.some(e => e.name === extra.name)}
                        onChange={() => handleExtraToggle(extra)}
                      />
                      <span className="text-sm font-medium text-gray-700">{extra.name}</span>
                    </div>
                    <span className="text-sm font-bold text-brand-orange">+{extra.price.toFixed(2)} ₺</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-brand-dark mb-1">İçindekiler:</h4>
              <p className="text-sm text-gray-500">{product.ingredients.join(', ')}</p>
            </div>
          )}

          {product.allergens && product.allergens.length > 0 && (
            <div className="mb-6 bg-orange-50 p-3 rounded-xl flex items-start gap-2 border border-orange-100">
              <Info size={16} className="text-brand-orange shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-brand-orange mb-1">Alerjen Uyarısı:</h4>
                <p className="text-xs text-orange-800">{product.allergens.join(', ')}</p>
              </div>
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Özel Notunuz</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange text-sm p-3 outline-none transition-all"
                rows={2}
                placeholder="Örn: Ketçap olmasın, az pişmiş olsun..."
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-xl h-14 bg-gray-50">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-5 text-gray-500 hover:text-brand-dark text-lg font-bold">-</button>
                <span className="font-bold w-8 text-center text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-5 text-gray-500 hover:text-brand-dark text-lg font-bold">+</button>
              </div>
              <button 
                onClick={handleAdd}
                className="flex-1 bg-brand-green text-white h-14 rounded-xl font-bold text-lg hover:bg-green-700 transition-all transform active:scale-95 shadow-lg flex justify-between items-center px-6"
              >
                <span>Sepete Ekle</span>
                <span>{totalPrice.toFixed(2)} ₺</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
