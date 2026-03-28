import React from 'react';
import { SEO } from '../components/SEO';
import { motion } from 'framer-motion';

export const About = () => {
  return (
    <div className="min-h-screen bg-brand-dark text-white relative overflow-hidden">
      <SEO title="Hakkımızda" description="Kumpir Salad'ın kuruluş hikayesi, vizyonu ve misyonu." />
      
      {/* Background Video */}
      <div className="absolute inset-0 z-0 opacity-30">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="https://cdn.pixabay.com/video/2023/08/08/175152-852857786_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-brand-dark" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">Bizim <span className="text-brand-orange">Hikayemiz</span></h1>
          <div className="w-32 h-2 bg-brand-green mx-auto rounded-full"></div>
        </motion.div>

        <div className="space-y-16 text-lg md:text-2xl leading-relaxed font-light text-gray-200">
          <motion.p 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            2015 yılında, geleneksel Türk sokak lezzetlerini modern ve kurumsal bir anlayışla sunma hayaliyle yola çıktık. 
            <strong className="text-white font-bold"> "Kumpir Salad" </strong> fikri, herkesin sevdiği kumpiri ve sağlıklı yaşamın vazgeçilmezi salataları aynı çatı altında, 
            en yüksek kalite standartlarında buluşturma arzumuzdan doğdu.
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border-l-4 border-brand-orange pl-8 py-2"
          >
            Tıpkı ANNE ELİ DEĞMİŞ GİBİ kocaman porselen tabaklarda sunduğu o doyurucu ve estetik deneyim gibi, biz de 
            müşterilerimize görsel bir şölen sunmayı hedefledik. Özel fırınlarımızda pişen devasa patatesler, 
            günlük olarak hazırlanan 30'dan fazla YEMEK çeşidiyle buluşuyor.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 text-center"
          >
            <h3 className="text-3xl font-bold text-brand-green mb-4">Vizyonumuz</h3>
            <p className="text-xl">
              Türkiye'nin ve dünyanın dört bir yanında, kalite ve lezzetten ödün vermeden büyüyen global bir marka olmak.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
