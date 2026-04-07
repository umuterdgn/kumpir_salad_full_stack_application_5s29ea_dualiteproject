import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  TrendingUp,
  Users,
  MapPin,
  Send,
  Briefcase,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios"; // BÖLÜM 1: Axios'u import et

// Ortam değişkenini al
const API_URL = import.meta.env.VITE_API_URL || "";

const Franchise = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    investment: "",
    message: "",
  });

  // BÖLÜM 2: handleSubmit fonksiyonunu gerçek API atacak şekilde güncelle
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basit bir validasyon
    if (!formData.name || !formData.phone) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }

    try {
      const loadingToast = toast.loading("Başvurunuz gönderiliyor...");

      // Backend'e veriyi yolla
      await axios.post(`${API_URL}/api/franchise`, formData);

      toast.dismiss(loadingToast);
      toast.success(
        "Başvurunuz başarıyla alındı! Ekibimiz en kısa sürede sizinle iletişime geçecek.",
      );

      // Formu temizle (Opsiyonel)
      setFormData({
        name: "",
        phone: "",
        city: "",
        investment: "",
        message: "",
      });
    } catch (error) {
      toast.dismiss();
      toast.error(
        "Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
      );
      console.error("Franchise Gönderim Hatası:", error);
    }
  };

  const advantages = [
    {
      icon: <TrendingUp className="text-brand-orange" />,
      title: "Yüksek Kârlılık",
      desc: "Optimize edilmiş maliyet yönetimi ile hızlı yatırım geri dönüşü.",
    },
    {
      icon: <Users className="text-brand-green" />,
      title: "Sürekli Destek",
      desc: "Eğitim, pazarlama ve operasyonel konularda yanınızdayız.",
    },
    {
      icon: <CheckCircle2 className="text-brand-orange" />,
      title: "Hazır Sistem",
      desc: "Tedarik zincirinden reçetelere kadar her şey kurulu.",
    },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-brand-dark mb-6">
            Kumpir Salad{" "}
            <span className="text-brand-green">Ailesine Katılın</span>
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Türkiye'nin yükselen lezzet markasıyla kendi işinizin sahibi olun.
            Güçlü marka imajı ve hazır sistemimizle kazanan tarafta yer alın.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12">
        {/* Avantajlar */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-brand-dark mb-8">
            Neden Franchise?
          </h2>
          <div className="grid gap-6">
            {advantages.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-3 bg-gray-50 rounded-2xl">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-lg text-brand-dark">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-8 bg-brand-green rounded-[2.5rem] text-white relative overflow-hidden group">
            <Briefcase className="absolute right-[-20px] bottom-[-20px] size-40 opacity-10 group-hover:rotate-12 transition-transform" />
            <h3 className="text-2xl font-bold mb-2">Başarıya Giden Yol</h3>
            <p className="opacity-90 leading-relaxed">
              Kumpir Salad, sadece bir restoran değil, bir yaşam tarzıdır.
              Nexium yazılım altyapısıyla desteklenen dijital yönetim
              sistemimizle işletmenizi cebinizden yönetin.
            </p>
          </div>
        </div>

        {/* Başvuru Formu */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[3rem] shadow-xl border border-white">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-brand-dark">
              Başvuru Formu
            </h2>
            <p className="text-gray-500 mt-2">
              Bilgilerinizi bırakın, uzman ekibimiz sizi arasın.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Adınız Soyadınız"
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                type="tel"
                placeholder="Telefon Numaranız"
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            <div className="relative">
              <MapPin
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Düşündüğünüz Şehir/Bölge"
                className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>

            <select
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-green/20 outline-none text-gray-500"
              onChange={(e) =>
                setFormData({ ...formData, investment: e.target.value })
              }>
              <option value="">Yatırım Bütçeniz (Tahmini)</option>
              <option value="500k-1m">500.000 TL - 1.000.000 TL</option>
              <option value="1m-2m">1.000.000 TL - 2.000.000 TL</option>
              <option value="2m+">2.000.000 TL +</option>
            </select>

            <textarea
              placeholder="Eklemek istediğiniz notlar..."
              rows={4}
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-green/20 outline-none resize-none"
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }></textarea>

            <button
              type="submit"
              className="w-full py-5 bg-brand-orange hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
              <Send size={20} />
              Başvuruyu Tamamla
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Franchise;
