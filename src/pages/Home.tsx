import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Star,
  Clock,
  ChefHat,
  MapPin,
  Phone,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { SEO } from "../components/SEO";
import axios from "axios";
import { Product } from "../store";

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .post("/api/events", { eventType: "view", metadata: { page: "home" } })
      .catch(() => {});

    // Fetch products and pick 6 for featured
    axios
      .get("/api/products")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setFeaturedProducts(res.data.slice(0, 6));
        } else {
          // Mock fallback
          setFeaturedProducts([
            {
              _id: "1",
              name: "Klasik Kumpir",
              price: 180,
              image: "https://placehold.co/600x400/E86600/FFF?text=Kumpir",
              description: "Geleneksel lezzet",
              category: "c1",
              allergens: [],
              ingredients: [],
            },
            {
              _id: "2",
              name: "Sezar Salata",
              price: 160,
              image: "https://placehold.co/600x400/63AC22/FFF?text=Salata",
              description: "Taze yeşillikler",
              category: "c2",
              allergens: [],
              ingredients: [],
            },
            {
              _id: "3",
              name: "Kekikli Tavuk",
              price: 220,
              image: "https://placehold.co/600x400/06392E/FFF?text=Tavuk",
              description: "Özel soslu",
              category: "c3",
              allergens: [],
              ingredients: [],
            },
            {
              _id: "4",
              name: "Karışık Kumpir",
              price: 200,
              image: "https://placehold.co/600x400/E86600/FFF?text=Kumpir+Mix",
              description: "Bol malzemeli",
              category: "c1",
              allergens: [],
              ingredients: [],
            },
            {
              _id: "5",
              name: "Ton Balıklı Salata",
              price: 190,
              image: "https://placehold.co/600x400/63AC22/FFF?text=Ton+Salata",
              description: "Hafif ve doyurucu",
              category: "c2",
              allergens: [],
              ingredients: [],
            },
            {
              _id: "6",
              name: "Köri Soslu Tavuk",
              price: 230,
              image: "https://placehold.co/600x400/06392E/FFF?text=Kori+Tavuk",
              description: "Eşsiz baharatlar",
              category: "c3",
              allergens: [],
              ingredients: [],
            },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-brand-light font-sans overflow-hidden">
      <SEO
        title="Ana Sayfa"
        description="Kumpir Salad ile eşsiz kumpir ve salata lezzetlerini keşfedin."
      />

      {/* Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105">
          <source
            src="https://cdn.pixabay.com/video/2019/07/06/24999-347024091_large.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl">
            Lezzetin <span className="text-brand-orange">Yeni</span> Adresi
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-100 mb-10 max-w-2xl drop-shadow-md font-medium">
            Özenle seçilmiş taze malzemeler, usta ellerde sanata dönüşüyor.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}>
            <Link
              to="/menu"
              className="bg-brand-orange hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-3 shadow-[0_10px_30px_rgba(232,102,0,0.4)]">
              Menüyü Keşfet <ArrowRight size={22} />
            </Link>
          </motion.div>
        </div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/50 z-20">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest">Kaydır</span>
            <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center p-1">
              <div className="w-1 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* About & Video Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-extrabold text-brand-dark mb-6">
                Mükemmel Uyumun Sırrı
              </h2>
              <div className="w-20 h-1.5 bg-brand-orange rounded-full mb-8"></div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Kumpir Salad olarak, geleneksel Türk sokak lezzeti kumpiri,
                modern ve sağlıklı salata konseptiyle birleştiriyoruz. Özel
                fırınlarımızda pişen dev patatesler, günlük hazırlanan taptaze
                mezeler ve yeşilliklerle buluşuyor.
              </p>
              <Link
                to="/hakkimizda"
                className="inline-flex items-center gap-2 text-brand-green font-bold hover:text-green-700 transition-colors text-lg">
                Hikayemizi Okuyun <ArrowRight size={20} />
              </Link>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl relative group">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700">
                  <source
                    src="https://cdn.pixabay.com/video/2024/02/11/200157-912127896_large.mp4"
                    type="video/mp4"
                  />
                </video>
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Featured Menu Grid */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-brand-dark mb-4">
              Öne Çıkan Lezzetler
            </h2>
            <p className="text-gray-600 text-lg">
              Şefin tavsiyesi en çok tercih edilen ürünlerimiz.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => navigate("/menu")}>
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-brand-dark">
                      {product.name}
                    </h3>
                    <span className="text-brand-orange font-bold text-lg">
                      {product.price.toFixed(2)} ₺
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="inline-block border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white px-8 py-3 rounded-full font-bold transition-colors">
              Tüm Menüyü Gör
            </Link>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-brand-dark text-white rounded-3xl p-10 shadow-2xl hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-orange rounded-full opacity-20 blur-2xl"></div>
              <Calendar className="text-brand-orange w-12 h-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Çalışma Saatleri</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex justify-between border-b border-gray-700 pb-2">
                  <span>Hafta İçi</span>{" "}
                  <span className="font-bold text-white">10:00 - 22:00</span>
                </li>
                <li className="flex justify-between border-b border-gray-700 pb-2">
                  <span>Cumartesi</span>{" "}
                  <span className="font-bold text-white">10:00 - 22:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Pazar</span>{" "}
                  <span className="font-bold text-white">10:00 - 22:00</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="bg-brand-green text-white rounded-3xl p-10 shadow-2xl hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white rounded-full opacity-20 blur-2xl"></div>
              <MapPin className="text-white w-12 h-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Merkezi Konum</h3>
              <p className="text-green-50 mb-6 leading-relaxed">
                Şehrin kalbinde, ulaşımı kolay ve ferah mekanımızda sizleri
                ağırlamaktan mutluluk duyarız.
              </p>
              <div className="flex items-center gap-3 text-white font-bold">
                <Phone size={20} />
                <span>+90 544 619 20 94</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-brand-dark mb-4">
              Misafirlerimiz Ne Diyor?
            </h2>
            <p className="text-gray-600 text-lg">
              Bizi tercih edenlerin deneyimleri.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Ayşe Y.",
                text: "Kumpirleri gerçekten devasa ve malzemeleri çok taze. Salatalarla birleşimi harika bir fikir olmuş.",
                stars: 5,
              },
              {
                name: "Caner T.",
                text: "Öğle aralarının vazgeçilmezi. Hızlı servis ve güler yüzlü personel. Kesinlikle tavsiye ederim.",
                stars: 5,
              },
              {
                name: "Zeynep K.",
                text: "Mekan tasarımı çok ferah. Tavuklu salataları favorim, sosları efsane.",
                stars: 4,
              },
            ].map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-sm relative">
                <div className="flex text-brand-orange mb-4">
                  {[...Array(review.stars)].map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">"{review.text}"</p>
                <p className="font-bold text-brand-dark">- {review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Integration */}
      <div className="h-96 w-full relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3204.1254091478654!2d36.162744200000006!3d36.5751956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x152f58db95a058f9%3A0x4d54d0439621bc21!2sPrimemall%20AVM%20-%20%C4%B0skenderun!5e0!3m2!1str!2str!4v1772273492048!5m2!1str!2str"
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          title="Location Map"></iframe>
      </div>
    </div>
  );
};
