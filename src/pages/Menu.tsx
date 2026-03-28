import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SEO } from '../components/SEO';
import { ProductModal } from '../components/ProductModal';
import { Product } from '../store';

export const Menu = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/products')
        ]);
        
        // Sadece veritabanından (DB) gelen verileri state'e yazıyoruz
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (e) {
        console.error("Menü verileri çekilemedi:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    axios.post('/api/events', { eventType: 'view', metadata: { page: 'menu' } }).catch(() => {});
  }, []);

  // Kategori filtreleme mantığı (DB'den gelen String ID'ye göre)
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory || p.category?._id === activeCategory);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    axios.post('/api/events', { eventType: 'click', productId: product._id }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-brand-light py-12">
      <SEO title="Menü" description="Kumpir Salad'ın zengin menüsünü inceleyin. Atıştırmalıklar, etler, tavuklar, kumpirler ve daha fazlası." />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-dark mb-4">Lezzet Menümüz</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Taptaze malzemelerle hazırlanan, damak çatlatan lezzetlerimizi keşfedin.</p>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-4 hide-scrollbar justify-start md:justify-center">
          <button
            onClick={() => setActiveCategory('all')}
            className={`whitespace-nowrap px-6 py-3 rounded-full font-bold transition-colors ${
              activeCategory === 'all' ? 'bg-brand-orange text-white' : 'bg-white text-brand-dark hover:bg-orange-50'
            } shadow-sm`}
          >
            Tümü
          </button>
          
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-bold transition-colors ${
                activeCategory === cat._id ? 'bg-brand-orange text-white' : 'bg-white text-brand-dark hover:bg-orange-50'
              } shadow-sm`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500 font-medium">Menümüz şu an güncellenmektedir. Lütfen daha sonra tekrar kontrol edin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <div key={product._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                <div className="relative h-48 overflow-hidden group cursor-pointer" onClick={() => handleProductClick(product)}>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white text-brand-dark px-4 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all">
                      Detaylı İncele
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-brand-dark">{product.name}</h3>
                    <span className="text-brand-orange font-bold text-lg whitespace-nowrap ml-2">{product.price.toFixed(2)} ₺</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <button 
                    onClick={() => handleProductClick(product)}
                    className="mt-auto w-full border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white font-bold py-2 rounded-lg transition-colors"
                  >
                    Seçenekleri Gör
                  </button>
                </div>
              </div>
            ))}
            
            {/* Eğer o kategoriye ait ürün yoksa */}
            {filteredProducts.length === 0 && (
               <div className="col-span-full text-center py-10">
                 <p className="text-gray-500 font-medium">Bu kategoride henüz ürün bulunmuyor.</p>
               </div>
            )}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};