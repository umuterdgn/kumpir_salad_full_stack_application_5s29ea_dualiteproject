import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Menu as MenuIcon, X, BellRing } from "lucide-react";
import { useAppStore } from "../store";
import { CartDrawer } from "./CartDrawer";
import { WaiterModal } from "./WaiterModal";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

const socket = io(window.location.origin);

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);

  const cart = useAppStore((state) => state.cart);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleWaiterConfirm = (tableNo, phone) => {
    socket.emit("call_waiter", {
      table: `Masa ${tableNo}`,
      phone: phone,
      time: new Date(),
    });
    toast.success("Garson çağrıldı, en kısa sürede masanızda olacak.", {
      icon: "🛎️",
      style: { borderRadius: "15px", background: "#333", color: "#fff" },
    });
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* SOL: GENİŞ LOGO */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <img
                  src={logo}
                  alt="Kumpir Salad"
                  // Logoyu sola yaslı ve geniş yaptık
                  className="w-48 md:w-64 h-auto object-contain transition-transform duration-300 hover:scale-105"
                />
              </Link>
            </div>

            {/* SAĞ: MASAÜSTÜ MENÜ */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-brand-dark hover:text-brand-orange font-medium transition-colors">
                Ana Sayfa
              </Link>
              <Link
                to="/menu"
                className="text-brand-dark hover:text-brand-orange font-medium transition-colors">
                Menü
              </Link>
              <Link
                to="/hakkimizda"
                className="text-brand-dark hover:text-brand-orange font-medium transition-colors">
                Hakkımızda
              </Link>
              <Link
                to="/iletisim"
                className="text-brand-dark hover:text-brand-orange font-medium transition-colors">
                İletişim
              </Link>

              {/* Garson Çağır Butonu */}
              <button
                onClick={() => setIsWaiterModalOpen(true)}
                className="flex items-center gap-2 text-brand-green hover:text-white hover:bg-brand-green font-semibold transition-all bg-green-50 px-5 py-2.5 rounded-2xl border border-brand-green/20">
                <BellRing size={18} />
                Sipariş Ver
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-brand-dark hover:text-brand-orange transition-colors">
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-brand-orange rounded-full transform translate-x-1/4 -translate-y-1/4 shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* SAĞ: MOBİL MENÜ BUTONLARI */}
            <div className="flex items-center md:hidden gap-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-brand-dark">
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-brand-orange rounded-full transform translate-x-1/4 -translate-y-1/4 shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-brand-dark">
                {isOpen ? <X size={28} /> : <MenuIcon size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobil Dropdown Menü */}
        {isOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t absolute w-full shadow-lg p-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-brand-dark font-medium">
              Ana Sayfa
            </Link>
            <Link
              to="/menu"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-brand-dark font-medium">
              Menü
            </Link>
            <button
              onClick={() => {
                setIsWaiterModalOpen(true);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-3 text-brand-green font-bold flex items-center gap-2 bg-green-50 rounded-xl">
              <BellRing size={20} /> Sipariş Ver
            </button>
          </div>
        )}
      </nav>

      {/* MODALLAR */}
      <WaiterModal
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        onConfirm={handleWaiterConfirm}
      />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
