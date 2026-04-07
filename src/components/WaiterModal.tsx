import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Hash, BellRing } from "lucide-react";
import toast from "react-hot-toast";

export const WaiterModal = ({ isOpen, onClose, onConfirm }) => {
  const [tableNo, setTableNo] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tableNo || !phone) {
      toast.error("Lütfen tüm alanları doldurunuz.");
      return;
    }
    // Telefon numarası basit doğrulama (10 hane kontrolü)
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Geçerli bir telefon numarası giriniz.");
      return;
    }
    onConfirm(tableNo, phone);
    setTableNo("");
    setPhone("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Arka Plan Karartma */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
          />
          
          {/* Modal İçeriği */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden border border-white/20"
          >
            {/* Üst Dekorasyon Çizgisi */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-green to-emerald-400" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-brand-dark"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-brand-green/10 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3">
                <BellRing className="text-brand-green" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-brand-dark">Garson Çağır</h3>
              <p className="text-gray-500 text-sm mt-2 font-medium">
                Size daha iyi hizmet verebilmemiz için bilgilerinizi rica ederiz.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Masa Numarası</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green/60" size={18} />
                  <input
                    type="number"
                    placeholder="Örn: 12"
                    value={tableNo}
                    onChange={(e) => setTableNo(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Telefon Numarası</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green/60" size={18} />
                  <input
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-2xl shadow-lg shadow-brand-green/20 transition-all active:scale-[0.97] mt-2 flex items-center justify-center gap-2"
              >
                Servis İste
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};