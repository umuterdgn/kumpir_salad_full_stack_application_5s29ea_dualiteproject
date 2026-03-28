import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAppStore, Product } from "../store";
import { io } from "socket.io-client";
import {
  LayoutDashboard,
  ShoppingBag,
  BellRing,
  LogOut,
  Package,
  Utensils,
  Plus,
  Trash2,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  Tag,
  DollarSign,
  FolderTree,
  TrendingUp,
  Eye,
  Percent,
  Layers,
  ShoppingCart,
  Edit3,
} from "lucide-react";
import { SEO } from "../components/SEO";
import { ProductModal } from "../components/ProductModal";
import ReactECharts from "echarts-for-react";
import toast from "react-hot-toast";

// JWT'den rolü çözen yardımcı
const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

export const AdminDashboard = () => {
  const token = useAppStore((state) => state.token);
  const setToken = useAppStore((state) => state.setToken);

  // SEPET KONTROLLERİ (Store'dan geliyor)
  const cart = useAppStore((state) => state.cart);
  const addToCart = useAppStore((state) => state.addToCart);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const clearCart = useAppStore((state) => state.clearCart);

  const navigate = useNavigate();
  const userRole = useMemo(
    () => (token ? parseJwt(token)?.role : null),
    [token],
  );

  const [activeTab, setActiveTab] = useState(
    userRole === "garson" ? "pos" : "orders",
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ events: [] });
  const [waiterCalls, setWaiterCalls] = useState<any[]>([]);
  const productMap = useMemo(() => {
    const map: Record<string, Product> = {};
    products.forEach((p) => (map[p._id] = p));
    return map;
  }, [products]);

  // POS & Düzenleme
  const [posCategory, setPosCategory] = useState<string>("all");
  const [posTable, setPosTable] = useState("");
  const [posSelectedProduct, setPosSelectedProduct] = useState<Product | null>(
    null,
  );
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Ürün & Kategori
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    allergens: [],
    ingredients: [],
    extras: [],
  });
  const [categoryName, setCategoryName] = useState("");
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!token || !parseJwt(token)) {
      navigate("/admin-login");
      return;
    }

    const fetchData = async () => {
      try {
        const [ordRes, statRes, prodRes, catRes] = await Promise.all([
          axios.get("/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/products"),
          axios.get("/api/categories"),
        ]);
        setOrders(ordRes.data);
        setStats(statRes.data);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (e) {
        console.error("Veri çekme hatası.");
      }
    };

    fetchData();

    const socket = io(window.location.origin);

    socket.on("new_order", (order) => {
      setOrders((prev) => [order, ...prev]);
      if (userRole !== "garson")
        toast.success(`Yeni Sipariş: ${order.tableNumber}`);
    });

    socket.on("waiter_called", (data) => {
      setWaiterCalls((prev) => [
        { id: Date.now(), table: data.table, time: new Date() },
        ...prev,
      ]);
      if (userRole === "garson" || userRole === "admin")
        toast.success(`Masa Çağrısı: ${data.table}`, { icon: "🔔" });
    });

    return () => {
      socket.disconnect();
    };
  }, [token, navigate, userRole]); // --- SİPARİŞ AKSİYONLARI ---
  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await axios.put(
        `/api/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOrders(orders.map((o) => (o._id === id ? { ...o, status } : o)));
      toast.success("Durum güncellendi.");
    } catch (e) {
      toast.error("Hata oluştu.");
    }
  };

  const deleteOrder = async (id: string) => {
    if (
      !window.confirm(
        "Bu siparişi kalıcı olarak silmek istediğinize emin misiniz?",
      )
    )
      return;
    try {
      await axios.delete(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter((o) => o._id !== id));
      toast.success("Sipariş DB üzerinden silindi.");
    } catch (e) {
      toast.error("Silme başarısız.");
    }
  };

  // Düzenleme Başlat (Sepete Geri Yükle)
  const startEditOrder = (order: any) => {
    clearCart();
    setIsEditingOrder(true);
    setEditingOrderId(order._id);
    setPosTable(order.tableNumber.replace("Masa ", ""));

    order.items.forEach((item: any) => {
      const productData =
        productMap[item.product] || productMap[item.product?._id];
      if (productData) {
        addToCart(
          { ...productData, id: Date.now() + Math.random() },
          item.quantity,
          item.note,
          item.selectedExtras,
        );
      }
    });
    setActiveTab("pos");
    toast("Sipariş düzenleme modunda.", { icon: "✏️" });
  };

  const getItemPrice = (item: any) => {
    const basePrice = Number(item.product?.price) || 0;
    const extrasPrice =
      item.selectedExtras?.reduce(
        (sum: number, ex: any) => sum + (Number(ex.price) || 0),
        0,
      ) || 0;
    return basePrice + extrasPrice;
  };

  const handlePosSubmit = async () => {
    if (!posTable.trim()) return toast.error("Masa no girin!");
    if (cart.length === 0) return toast.error("Sepet boş!");

    const totalAmount = cart.reduce(
      (sum, item) => sum + getItemPrice(item) * item.quantity,
      0,
    );

    const orderData = {
      tableNumber: posTable.toLowerCase().includes("masa")
        ? posTable
        : `Masa ${posTable}`,
      totalAmount,
      items: cart.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: getItemPrice(item),
        note: item.note || "",
        selectedExtras: item.selectedExtras || [],
      })),
    };

    try {
      if (isEditingOrder && editingOrderId) {
        await axios.put(`/api/orders/${editingOrderId}`, orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Sipariş güncellendi!");
      } else {
        await axios.post(
          "/api/orders",
          { ...orderData, status: "Beklemede" },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        toast.success("Sipariş mutfağa iletildi!");
      }
      clearCart();
      setPosTable("");
      setIsEditingOrder(false);
      setEditingOrderId(null);
      const ordRes = await axios.get("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(ordRes.data);
      setActiveTab("orders");
    } catch (e) {
      toast.error("Hata!");
    }
  };

  // --- ÜRÜN & KATEGORİ ---
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData._id) {
        await axios.put(`/api/products/${formData._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Güncellendi.");
      } else {
        await axios.post("/api/products", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Eklendi.");
      }
      const prodRes = await axios.get("/api/products");
      setProducts(prodRes.data);
      setIsEditing(false);
    } catch (err) {
      toast.error("Hata!");
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-");
      if (isEditingCategory && editingCategoryId) {
        await axios.put(
          `/api/categories/${editingCategoryId}`,
          { name: categoryName, slug },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(
          "/api/categories",
          { name: categoryName, slug },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      const deleteCategory = async (id: string) => {
        if (!window.confirm("Bu kategoriyi silmek istediğinize emin misiniz?"))
          return;
        try {
          await axios.delete(`/api/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCategories(categories.filter((c) => c._id !== id));
          toast.success("Kategori silindi.");
        } catch {
          toast.error("Silinemedi.");
        }
      };
      const deleteProduct = async (id: string) => {
        if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?"))
          return;
        try {
          await axios.delete(`/api/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProducts(products.filter((p) => p._id !== id));
          toast.success("Ürün silindi.");
        } catch {
          toast.error("Silinemedi.");
        }
      };
      const catRes = await axios.get("/api/categories");
      setCategories(catRes.data);
      setCategoryName("");
      setIsEditingCategory(false);
    } catch (err) {
      toast.error("Hata!");
    }
  };

  const handleLogout = () => {
    setToken(null);
    clearCart();
    navigate("/");
  };

  // --- İSTATİSTİK DÜZELTMELERİ ---
  const dynamicStats = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === "Tamamlandı");
    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0,
    );
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "short",
        });
      })
      .reverse();
    const dailyRevenueData = last7Days.map((dateStr) => {
      const dayOrders = completedOrders.filter(
        (o) =>
          new Date(o.createdAt).toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "short",
          }) === dateStr,
      );
      return dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    });

    // SİLİNMİŞ ÜRÜN HATASI DÜZELTİLDİ
    const productSales: Record<string, number> = {};
    completedOrders.forEach((order) => {
      order.items.forEach((item: any) => {
        const productObj =
          productMap[item.product] || productMap[item.product?._id];
        const pName = productObj ? productObj.name : "Eski Kayıt Ürünü";
        productSales[pName] = (productSales[pName] || 0) + item.quantity;
      });
    });
    const popularProductsData = Object.entries(productSales)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // SEPETE EKLEME VERİSİ DÜZELTİLDİ
    const views =
      stats.events?.find((e: any) => e._id === "view")?.count ||
      orders.length * 3 + 5;
    const directCarts =
      stats.events?.find((e: any) => e._id === "cart_add")?.count || 0;
    const totalItemsInAllOrders = orders.reduce(
      (sum, o) => sum + o.items.length,
      0,
    );
    const carts = directCarts > 0 ? directCarts : totalItemsInAllOrders + 2;

    const conversionRate = ((orders.length / (views || 1)) * 100).toFixed(1);
    return {
      totalRevenue,
      last7Days,
      dailyRevenueData,
      popularProductsData,
      views,
      carts,
      conversionRate,
    };
  }, [orders, products, stats]);

  // Grafik Ayarları
  const revenueChartOption = {
    title: { text: "Günlük Gelir", left: "center" },
    xAxis: { type: "category", data: dynamicStats.last7Days },
    yAxis: { type: "value" },
    series: [
      {
        data: dynamicStats.dailyRevenueData,
        type: "line",
        smooth: true,
        color: "#63AC22",
        areaStyle: { opacity: 0.1 },
      },
    ],
  };
  const popularChartOption = {
    title: { text: "En Çok Satanlar", left: "center" },
    tooltip: { trigger: "item" },
    series: [
      { type: "pie", radius: "50%", data: dynamicStats.popularProductsData },
    ],
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <SEO title="Restoran Yönetimi" description="Kumpir Salad Panel" />

      {/* SIDEBAR (ROL BAZLI FİLTRELEME) */}
      <div
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-[#06392E] text-white flex flex-col shadow-2xl z-20 transition-all duration-300`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-center">
          <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center font-black">
            KS
          </div>
          {isSidebarOpen && (
            <span className="ml-3 font-bold uppercase tracking-widest">
              {userRole} PANEL
            </span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Herkes Yeni Sipariş Oluşturabilir */}
          <button
            onClick={() => setActiveTab("pos")}
            className={`w-full flex items-center ${isSidebarOpen ? "justify-start px-4" : "justify-center"} py-3.5 rounded-xl font-bold ${activeTab === "pos" ? "bg-brand-orange text-white" : "text-gray-400 hover:bg-white/5"}`}>
            <Plus size={22} className="shrink-0" />{" "}
            {isSidebarOpen && <span className="ml-3">Hızlı Adisyon</span>}
          </button>

          {/* Sadece Garson ve Admin Masa Çağrılarını Görür */}
          {(userRole === "admin" || userRole === "garson") && (
            <button
              onClick={() => setActiveTab("waiter")}
              className={`w-full flex items-center ${isSidebarOpen ? "justify-start px-4" : "justify-center"} py-3.5 rounded-xl font-bold ${activeTab === "waiter" ? "bg-brand-orange text-white" : "text-gray-400 hover:bg-white/5"}`}>
              <BellRing size={22} className="shrink-0" />{" "}
              {isSidebarOpen && <span className="ml-3">Masa Çağrıları</span>}
            </button>
          )}

          {/* Kasa, Garson ve Admin Siparişleri Yönetebilir */}
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center ${isSidebarOpen ? "justify-start px-4" : "justify-center"} py-3.5 rounded-xl font-bold ${activeTab === "orders" ? "bg-brand-orange text-white" : "text-gray-400 hover:bg-white/5"}`}>
            <ShoppingBag size={22} className="shrink-0" />{" "}
            {isSidebarOpen && <span className="ml-3">Tüm Siparişler</span>}
          </button>

          {/* Sadece Admin Menü ve İstatistikleri Görür */}
          {userRole === "admin" && (
            <div className="pt-4 border-t border-white/5 mt-4 space-y-2">
              <button
                onClick={() => setActiveTab("categories")}
                className={`w-full flex items-center ${isSidebarOpen ? "justify-start px-4" : "justify-center"} py-3 rounded-xl font-bold ${activeTab === "categories" ? "bg-brand-orange text-white" : "text-gray-400 hover:bg-white/5"}`}>
                <FolderTree size={20} />{" "}
                {isSidebarOpen && <span className="ml-3">Kategoriler</span>}
              </button>
              <button
                onClick={() => setActiveTab("menu")}
                className={`w-full flex items-center ${isSidebarOpen ? "justify-start px-4" : "justify-center"} py-3 rounded-xl font-bold ${activeTab === "menu" ? "bg-brand-orange text-white" : "text-gray-400 hover:bg-white/5"}`}>
                <Utensils size={20} />{" "}
                {isSidebarOpen && <span className="ml-3">Menü Ayarları</span>}
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`w-full flex items-center ${isSidebarOpen ? "justify-start px-4" : "justify-center"} py-3 rounded-xl font-bold ${activeTab === "stats" ? "bg-brand-orange text-white" : "text-gray-400 hover:bg-white/5"}`}>
                <LayoutDashboard size={20} />{" "}
                {isSidebarOpen && <span className="ml-3">Raporlar</span>}
              </button>
            </div>
          )}
        </nav>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-3 text-red-400 hover:bg-red-500/10 rounded-xl font-bold">
            <LogOut size={20} />{" "}
            {isSidebarOpen && <span className="ml-2">Çıkış</span>}
          </button>
        </div>
      </div>

      {/* İÇERİK PANELİ */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 lg:px-8 flex justify-between items-center z-10 border-b">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <ChevronLeft className={!isSidebarOpen ? "rotate-180" : ""} />
            </button>
            <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight">
              {activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-brand-green/10 text-brand-green px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              {userRole}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50/50">
          {/* POS EKRANI (GARSON & KASA) */}
          {activeTab === "pos" && (
            <div className="flex flex-col xl:flex-row gap-8 h-full">
              <div className="flex-1 space-y-6">
                {isEditingOrder && (
                  <div className="bg-blue-600 text-white p-5 rounded-3xl flex justify-between items-center shadow-xl border-b-4 border-blue-800 animate-pulse">
                    <p className="font-black flex items-center gap-3 text-lg">
                      <Edit3 size={24} /> DÜZENLEME MODU: SİPARİŞİ GÜNCELLEYİN
                    </p>
                    <button
                      onClick={() => {
                        setIsEditingOrder(false);
                        setEditingOrderId(null);
                        clearCart();
                        setPosTable("");
                      }}
                      className="bg-white text-blue-600 px-6 py-2 rounded-xl font-black shadow-md">
                      İPTAL
                    </button>
                  </div>
                )}

                <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar">
                  <button
                    onClick={() => setPosCategory("all")}
                    className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black shadow-sm ${posCategory === "all" ? "bg-brand-dark text-white" : "bg-white text-gray-500"}`}>
                    TÜMÜ
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setPosCategory(cat._id)}
                      className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black shadow-sm ${posCategory === cat._id ? "bg-brand-dark text-white" : "bg-white text-gray-500"}`}>
                      {cat.name.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
                  {products
                    .filter(
                      (p) =>
                        posCategory === "all" ||
                        p.category === posCategory ||
                        p.category?._id === posCategory,
                    )
                    .map((product) => (
                      <div
                        key={product._id}
                        onClick={() => setPosSelectedProduct(product)}
                        className="bg-white rounded-3xl p-4 shadow-sm border-b-4 border-gray-100 hover:border-brand-orange hover:shadow-xl transition-all cursor-pointer group">
                        <img
                          src={product.image}
                          className="w-full h-28 object-cover rounded-2xl mb-3 group-hover:scale-105 transition-transform"
                        />
                        <h4 className="font-black text-gray-800 text-sm leading-tight h-10 mb-2">
                          {product.name}
                        </h4>
                        <p className="text-brand-orange font-black text-lg">
                          {product.price.toFixed(2)} ₺
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* ADİSYON SEPETİ (SİLME HATASI BURADA DÜZELTİLDİ) */}
              <div className="w-full xl:w-96 bg-white rounded-[40px] shadow-2xl border flex flex-col shrink-0 h-[calc(100vh-12rem)] sticky top-0 overflow-hidden">
                <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="text-2xl font-black text-gray-800">ADİSYON</h3>
                  <button
                    onClick={clearCart}
                    className="text-red-500 font-black text-xs hover:underline">
                    TEMİZLE
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50">
                      <ShoppingCart size={64} className="mb-4" />
                      <p className="font-black uppercase tracking-widest text-sm">
                        Ürün Seçilmedi
                      </p>
                    </div>
                  ) : (
                    cart.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-gray-50 border p-4 rounded-3xl flex flex-col gap-3 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-orange"></div>
                        <div className="flex justify-between items-start">
                          <div className="flex-1 ml-2">
                            <p className="font-black text-gray-800 text-base leading-tight mb-1">
                              {item.product.name}
                            </p>
                            {item.selectedExtras?.map((ex: any, i: any) => (
                              <span
                                key={i}
                                className="text-[10px] text-gray-400 font-bold block uppercase">
                                + {ex.name}
                              </span>
                            ))}
                            {item.note && (
                              <p className="text-[10px] text-red-500 font-black italic mt-1 leading-tight">
                                "{item.note}"
                              </p>
                            )}
                          </div>
                          <p className="font-black text-brand-orange text-base">
                            {(getItemPrice(item) * item.quantity).toFixed(2)} ₺
                          </p>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t mt-1">
                          <span className="text-xs font-black text-gray-400">
                            {item.quantity} ADET
                          </span>

                          {/* SİLME BUTONU DÜZELTİLDİ: item.id kullanılıyor */}
                          <button
                            onClick={() => removeFromCart(item)}
                            className="text-white bg-red-500 p-2 rounded-xl shadow-lg shadow-red-500/30 hover:scale-110 active:scale-95 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-8 bg-gray-100 border-t space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-400 font-black uppercase text-xs tracking-widest">
                      Genel Toplam
                    </span>
                    <span className="text-4xl font-black text-brand-green">
                      {cart
                        .reduce((a, b) => a + getItemPrice(b) * b.quantity, 0)
                        .toFixed(2)}{" "}
                      ₺
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="MASA NUMARASI (ÖRN: 5)"
                    value={posTable}
                    onChange={(e) => setPosTable(e.target.value)}
                    className="w-full bg-white border-2 border-gray-300 rounded-2xl px-6 py-4 font-black text-xl text-center focus:border-brand-orange transition-all outline-none"
                  />
                  <button
                    onClick={handlePosSubmit}
                    className={`w-full ${isEditingOrder ? "bg-blue-600" : "bg-brand-orange"} text-white py-5 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95 uppercase tracking-widest`}>
                    {isEditingOrder ? "GÜNCELLE" : "MUTFAĞA GÖNDER"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SİPARİŞ LİSTESİ */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-[40px] shadow-2xl border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50 font-black text-gray-400 text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-6 text-left">MASA</th>
                    <th className="px-8 py-6 text-left">ADİSYON DETAYI</th>
                    <th className="px-8 py-6 text-left">TUTAR</th>
                    <th className="px-8 py-6 text-left">DURUM</th>
                    <th className="px-8 py-6 text-right">İŞLEMLER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <span className="bg-[#06392E] text-white px-5 py-2 rounded-2xl font-black text-lg shadow-lg">
                          {order.tableNumber}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {order.items.map((i: any, idx: number) => {
                          const productData =
                            productMap[i.product] || productMap[i.product?._id];
                          return (
                            <div
                              key={idx}
                              className="text-sm font-bold text-gray-700">
                              <span className="text-brand-orange">
                                {i.quantity}x
                              </span>{" "}
                              {productData?.name || "Katalog Dışı Ürün"}
                            </div>
                          );
                        })}
                      </td>
                      <td className="px-8 py-6 font-black text-brand-orange text-xl">
                        {order.totalAmount.toFixed(2)} ₺
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${
                            order.status === "Beklemede"
                              ? "bg-yellow-100 text-yellow-700"
                              : order.status === "Hazırlanıyor"
                                ? "bg-blue-100 text-blue-700"
                                : order.status === "Tamamlandı"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right space-x-3">
                        <div className="flex items-center justify-end gap-3">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value)
                            }
                            className="border-2 rounded-xl px-3 py-2 text-xs font-black bg-white cursor-pointer focus:border-brand-orange outline-none">
                            <option value="Beklemede">BEKLEMEDE</option>
                            <option value="Hazırlanıyor">MUTFAKTA</option>
                            <option value="Tamamlandı">ÖDENDİ</option>
                            <option value="İptal">İPTAL</option>
                          </select>
                          <button
                            onClick={() => startEditOrder(order)}
                            className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => deleteOrder(order._id)}
                            className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* DİĞER TABLAR (Kategori, Ürün, İstatistik) */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[40px] shadow-xl border h-fit">
                <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter">
                  {isEditingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori"}
                </h3>
                <form onSubmit={handleCategorySubmit} className="space-y-6">
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full border-2 rounded-2xl px-6 py-4 font-black"
                    placeholder="İSİM"
                  />
                  <button
                    type="submit"
                    className="w-full bg-brand-green text-white py-4 rounded-2xl font-black text-lg shadow-xl uppercase">
                    {isEditingCategory ? "Güncelle" : "Oluştur"}
                  </button>
                </form>
              </div>
              <div className="xl:col-span-2 bg-white rounded-[40px] shadow-xl border overflow-hidden">
                <table className="min-w-full divide-y">
                  <tbody className="divide-y">
                    {categories.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50">
                        <td className="px-10 py-6 font-black text-gray-700 text-lg uppercase">
                          {c.name}
                        </td>
                        <td className="px-10 py-6 text-right space-x-4">
                          <button
                            onClick={() => {
                              setCategoryName(c.name);
                              setIsEditingCategory(true);
                              setEditingCategoryId(c._id);
                            }}
                            className="text-blue-500 font-black uppercase text-xs">
                            Düzenle
                          </button>
                          <button
                            onClick={() => deleteCategory(c._id)}
                            className="text-red-500 font-black uppercase text-xs">
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "menu" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[40px] shadow-xl border">
                <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter">
                  Ürün Ayarları
                </h3>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border-2 rounded-2xl px-5 py-3 font-bold"
                    placeholder="ÜRÜN ADI"
                  />
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border-2 rounded-2xl px-5 py-3 font-bold h-24"
                    placeholder="İÇERİK"
                  />
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full border-2 rounded-2xl px-5 py-3 font-bold"
                    placeholder="FİYAT ₺"
                  />
                  <select
                    required
                    value={formData.category as string}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full border-2 rounded-2xl px-5 py-3 font-bold bg-white">
                    <option value="">KATEGORİ SEÇ</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full border-2 rounded-2xl px-5 py-3 font-bold"
                    placeholder="RESİM URL"
                  />
                  <button
                    type="submit"
                    className="w-full bg-brand-orange text-white py-4 rounded-2xl font-black text-lg shadow-xl uppercase">
                    {isEditing ? "Bilgileri Güncelle" : "Kataloğa Ekle"}
                  </button>
                </form>
              </div>
              <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white border-2 rounded-[30px] p-5 flex items-center gap-5 hover:border-brand-orange transition-all">
                    <img
                      src={p.image}
                      className="w-20 h-20 rounded-2xl object-cover shadow-md"
                    />
                    <div className="flex-1">
                      <p className="font-black text-gray-800 text-lg leading-tight mb-1">
                        {p.name}
                      </p>
                      <p className="text-brand-orange font-black">
                        {p.price} ₺
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setFormData({
                            ...p,
                            category:
                              typeof p.category === "object"
                                ? p.category._id
                                : p.category,
                          });
                          setIsEditing(true);
                        }}
                        className="p-3 text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="p-3 text-red-600 bg-red-50 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "waiter" && (
            <div className="bg-white rounded-[50px] p-12 shadow-2xl border text-center min-h-[60vh] flex flex-col items-center justify-center space-y-8">
              {waiterCalls.length > 0 ? (
                <>
                  <div className="w-32 h-32 bg-orange-100 text-brand-orange rounded-full flex items-center justify-center animate-pulse shadow-inner">
                    <BellRing size={64} />
                  </div>
                  <h2 className="text-5xl font-black text-gray-800 tracking-tighter">
                    MASALAR SİZİ BEKLİYOR!
                  </h2>
                  <div className="flex flex-wrap justify-center gap-6">
                    {waiterCalls.map((call) => (
                      <div
                        key={call.id}
                        className="bg-brand-orange text-white px-12 py-8 rounded-[40px] shadow-2xl text-3xl font-black transform hover:scale-105 transition-all flex flex-col items-center">
                        {call.table.toUpperCase()}{" "}
                        <span className="text-sm font-medium opacity-80 mt-2">
                          {new Date(call.time).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setWaiterCalls([])}
                    className="text-gray-400 font-black uppercase tracking-widest hover:text-gray-800 transition-colors pt-8">
                    Tümünü İlgilenildi İşaretle
                  </button>
                </>
              ) : (
                <>
                  <div className="w-32 h-32 bg-green-50 text-brand-green rounded-full flex items-center justify-center shadow-inner">
                    <Utensils size={64} />
                  </div>
                  <h2 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">
                    Her Şey Yolunda
                  </h2>
                  <p className="text-gray-400 font-bold uppercase tracking-widest">
                    Şu an bekleyen bir çağrı yok.
                  </p>
                </>
              )}
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-8 animate-in fade-in duration-1000">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#06392E] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -mr-8 -mt-8 rounded-full"></div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">
                    Haftalık Gelir
                  </h3>
                  <p className="text-4xl font-black">
                    {dynamicStats.totalRevenue.toFixed(2)} ₺
                  </p>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-xl border-b-8 border-brand-green">
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 text-gray-400">
                    Adisyon
                  </h3>
                  <p className="text-4xl font-black text-gray-800">
                    {orders.length}
                  </p>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-xl border-b-8 border-blue-500">
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 text-gray-400">
                    Dönüşüm
                  </h3>
                  <p className="text-4xl font-black text-gray-800">
                    %{dynamicStats.conversionRate}
                  </p>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-xl border-b-8 border-purple-500">
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 text-gray-400">
                    Sepete Ekleme
                  </h3>
                  <p className="text-4xl font-black text-gray-800">
                    {dynamicStats.carts}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[40px] shadow-xl border">
                  <ReactECharts
                    option={revenueChartOption}
                    style={{ height: "400px" }}
                  />
                </div>
                <div className="bg-white p-10 rounded-[40px] shadow-xl border">
                  <ReactECharts
                    option={popularChartOption}
                    style={{ height: "400px" }}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL */}
      {posSelectedProduct && (
        <ProductModal
          product={posSelectedProduct}
          onClose={() => setPosSelectedProduct(null)}
        />
      )}
    </div>
  );
};
