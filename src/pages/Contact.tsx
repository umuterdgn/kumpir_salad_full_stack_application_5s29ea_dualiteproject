import React, { useState } from "react";
import { SEO } from "../components/SEO";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      toast.success(
        "Mesajınız başarıyla gönderildi. En kısa sürede dönüş yapacağız.",
      );
      setFormData({ name: "", email: "", message: "" });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <SEO
        title="İletişim"
        description="Kumpir Salad iletişim bilgileri ve mesaj formu."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-4">
            İletişime Geçin
          </h1>
          <p className="text-gray-600 text-lg">
            Görüş, öneri ve sorularınız için buradayız.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/3 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="bg-orange-100 p-4 rounded-full text-brand-orange shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">
                  Adres
                </h3>
                <p className="text-gray-600">
                  PRİMEMEAL AVM İSKENDERUN, HATAY , Türkiye
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="bg-orange-100 p-4 rounded-full text-brand-orange shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">
                  Adres
                </h3>
                <p className="text-gray-600">
                  {" "}
                  Karağaç Konarlımh Uğurmumcu 9 Karağaç, HATAY , Türkiye
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="bg-green-100 p-4 rounded-full text-brand-green shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">
                  Telefon
                </h3>
                <p className="text-gray-600">+90 (212) 555 01 23</p>
                <p className="text-gray-600">+90 (532) 555 01 23</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 p-4 rounded-full text-blue-600 shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">
                  E-Posta
                </h3>
                <p className="text-gray-600">info@kumpirsalad.com</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
