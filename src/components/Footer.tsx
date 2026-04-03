import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-xl">
                KS
              </div>
              <span className="font-bold text-2xl tracking-tight">Kumpir Salad</span>
            </div>
            <p className="text-gray-300 mb-6">
              En taze malzemelerle hazırlanan eşsiz lezzetler. Kumpir ve salatanın mükemmel uyumu.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-brand-orange transition-colors"><Facebook size={24} /></a>
              <a href="#" className="text-gray-300 hover:text-brand-orange transition-colors"><Instagram size={24} /></a>
              <a href="#" className="text-gray-300 hover:text-brand-orange transition-colors"><Twitter size={24} /></a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-brand-orange">Hızlı Linkler</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Ana Sayfa</Link></li>
              <li><Link to="/menu" className="text-gray-300 hover:text-white transition-colors">Menü</Link></li>
              <li><Link to="/hakkimizda" className="text-gray-300 hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link to="/iletisim" className="text-gray-300 hover:text-white transition-colors">İletişim</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-brand-orange">İletişim</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-brand-green shrink-0 mt-1" size={20} />
                <span className="text-gray-300">PRİMEMEAL AVM İSKENDERUN, HATAY, Türkiye <br />
                Karağaç Konarlı Uğurmumcu cad.</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-brand-green shrink-0" size={20} />
                <span className="text-gray-300">+90 (212) 555 01 23</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-brand-green shrink-0" size={20} />
                <span className="text-gray-300">info@kumpirsalad.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-brand-orange">Çalışma Saatleri</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex justify-between border-b border-gray-700 pb-2">
                <span>Pzt - Cum:</span>
                <span>10:00 - 22:00</span>
              </li>
              <li className="flex justify-between border-b border-gray-700 pb-2">
                <span>Cumartesi:</span>
                <span>10:00 - 23:00</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>Pazar:</span>
                <span>11:00 - 22:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} NexiumDMA. Tüm hakları saklıdır.
          </p>
          <div className="mt-4 md:mt-0">
            <Link to="/admin-login" className="text-gray-500 hover:text-brand-orange text-sm transition-colors">
              Yönetici Girişi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
