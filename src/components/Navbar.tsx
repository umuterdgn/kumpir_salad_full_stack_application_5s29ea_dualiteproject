import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Menu as MenuIcon, X, BellRing } from "lucide-react";
import { useAppStore } from "../store";
import { CartDrawer } from "./CartDrawer";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const socket = io(window.location.origin);

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cart = useAppStore((state) => state.cart);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const callWaiter = () => {
    // In a real app, table number would be known via QR code URL parameter
    const tableNo = prompt("Lütfen masa numaranızı giriniz (Örn: 5):");
    if (tableNo) {
      socket.emit("call_waiter", {
        table: `Masa ${tableNo}`,
        time: new Date(),
      });
      toast.success("Garson çağrıldı, en kısa sürede masanızda olacak.");
    }
  };

  return (
    <>
      {/* BURASI DEĞİŞTİ: sticky, bg-white, border ve shadow kaldırıldı. absolute ve bg-transparent eklendi */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300">
        {" "}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                  KS
                </div>
                {/* İPUCU: Arkadaki video koyuysa 'text-brand-dark' yerine 'text-white' yazabilirsin */}
                <span className="font-bold text-2xl text-brand-dark tracking-tight">
                  Kumpir Salad
                </span>
              </Link>
            </div>

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

              <button
                onClick={callWaiter}
                className="flex items-center gap-2 text-brand-green hover:text-green-700 font-medium transition-colors bg-green-50/80 backdrop-blur-sm px-4 py-2 rounded-full">
                <BellRing size={18} />
                Garson Çağır
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-brand-dark hover:text-brand-orange transition-colors">
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-orange rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center md:hidden gap-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-brand-dark">
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-orange rounded-full">
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
        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t absolute w-full shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
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
              <Link
                to="/hakkimizda"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-brand-dark font-medium">
                Hakkımızda
              </Link>
              <Link
                to="/iletisim"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-brand-dark font-medium">
                İletişim
              </Link>
              <button
                onClick={() => {
                  callWaiter();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-brand-green font-medium">
                Garson Çağır
              </button>
            </div>
          </div>
        )}
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
