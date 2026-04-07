import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppStore, Product } from "../store";
import { io } from "socket.io-client";
import {
  LayoutDashboard,
  ShoppingBag,
  BellRing,
  LogOut,
  Utensils,
  Plus,
  Trash2,
  ChevronLeft,
  Edit3,
  FolderTree,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import { SEO } from "../components/SEO";
import { ProductModal } from "../components/ProductModal";
import ReactECharts from "echarts-for-react";
import toast from "react-hot-toast";

// Vercel/Vite ortam değişkeni
const API_URL = import.meta.env.VITE_API_URL || "";

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

  // Veri State'leri
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ events: [] });
  const [waiterCalls, setWaiterCalls] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]); // YENİ: Franchise State'i

  // POS & Form States
  const [posCategory, setPosCategory] = useState<string>("all");
  const [posTable, setPosTable] = useState("");
  const [posSelectedProduct, setPosSelectedProduct] = useState<Product | null>(
    null,
  );
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // --- ÜRÜN FORM STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    extras: [],
  });

  // --- YENİ EKLENEN SÜRÜKLE BIRAK STATE'LERİ ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Ekstra ekleme inputları için geçici stateler
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState<number | "">("");

  // --- KATEGORİ FORM STATES ---
  const [categoryName, setCategoryName] = useState("");
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [ordRes, statRes, prodRes, catRes, franRes] = await Promise.all([
        axios.get(`${API_URL}/api/orders`, config),
        axios.get(`${API_URL}/api/stats`, config),
        axios.get(`${API_URL}/api/products`),
        axios.get(`${API_URL}/api/categories`),
        axios
          .get(`${API_URL}/api/franchise`, config)
          .catch(() => ({ data: [] })), // YENİ: Franchise Verisini Çek
      ]);
      setOrders(ordRes.data);
      setStats(statRes.data);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setFranchises(franRes.data);
    } catch (e) {
      console.error("Veri çekme hatası.");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
      return;
    }
    fetchData();

    const socket = io(API_URL || window.location.origin);
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
      toast.success(`Masa Çağrısı: ${data.table}`, { icon: "🔔" });
    });
    return () => {
      socket.disconnect();
    };
  }, [token]);

  // --- EKSTRA (EXTRAS) YÖNETİMİ FONKSİYONLARI ---
  const handleAddExtra = () => {
    if (!newExtraName.trim() || newExtraPrice === "") {
      toast.error("Lütfen ekstra adı ve fiyatını girin.");
      return;
    }
    setFormData({
      ...formData,
      extras: [
        ...(formData.extras || []),
        { name: newExtraName, price: Number(newExtraPrice) },
      ],
    });
    setNewExtraName("");
    setNewExtraPrice("");
  };

  const handleRemoveExtra = (index: number) => {
    const updatedExtras = [...(formData.extras || [])];
    updatedExtras.splice(index, 1);
    setFormData({ ...formData, extras: updatedExtras });
  };

  const cancelEditingProduct = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      description: "",
      price: 0,
      image: "",
      category: "",
      extras: [],
    });
    setNewExtraName("");
    setNewExtraPrice("");
    setImageFile(null);
  };

  // --- ACTIONS ---
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.loading("Kaydediliyor...", { id: "product-save" });
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let finalImageUrl = formData.image;

      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("image", imageFile);

        const uploadRes = await axios.post(
          `${API_URL}/api/upload`,
          uploadData,
          {
            headers: {
              ...config.headers,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        finalImageUrl = uploadRes.data.imageUrl;
      }

      const productData = { ...formData, image: finalImageUrl };

      if (isEditing) {
        await axios.put(
          `${API_URL}/api/products/${formData._id}`,
          productData,
          config,
        );
      } else {
        await axios.post(`${API_URL}/api/products`, productData, config);
      }

      toast.success("Başarılı!", { id: "product-save" });
      cancelEditingProduct();
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Hata oluştu!", { id: "product-save" });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Silinsin mi?")) return;
    await axios.delete(`${API_URL}/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = categoryName.toLowerCase().replace(/\s+/g, "-");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    if (isEditingCategory) {
      await axios.put(
        `${API_URL}/api/categories/${editingCategoryId}`,
        { name: categoryName, slug },
        config,
      );
    } else {
      await axios.post(
        `${API_URL}/api/categories`,
        { name: categoryName, slug },
        config,
      );
    }
    setCategoryName("");
    setIsEditingCategory(false);
    fetchData();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await axios.put(
      `${API_URL}/api/orders/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    fetchData();
    toast.success("Güncellendi");
  };

  const startEditOrder = (order: any) => {
    clearCart();
    setIsEditingOrder(true);
    setEditingOrderId(order._id);
    setPosTable(order.tableNumber.replace("Masa ", ""));
    order.items.forEach((item: any) => {
      const p = products.find(
        (prod) => prod._id === (item.product?._id || item.product),
      );
      if (p) addToCart(p, item.quantity, item.note, item.selectedExtras);
    });
    setActiveTab("pos");
  };

  const getItemPrice = (item: any) => {
    const base = Number(item.product?.price) || 0;
    const extras =
      item.selectedExtras?.reduce(
        (s: number, e: any) => s + (Number(e.price) || 0),
        0,
      ) || 0;
    return base + extras;
  };

  const handlePosSubmit = async () => {
    if (!posTable.trim() || cart.length === 0)
      return toast.error("Eksik bilgi!");
    const orderData = {
      tableNumber: posTable.includes("Masa") ? posTable : `Masa ${posTable}`,
      totalAmount: cart.reduce((s, i) => s + getItemPrice(i) * i.quantity, 0),
      items: cart.map((i) => ({
        product: i.product._id,
        quantity: i.quantity,
        price: getItemPrice(i),
        note: i.note,
        selectedExtras: i.selectedExtras,
      })),
    };
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isEditingOrder)
        await axios.put(
          `${API_URL}/api/orders/${editingOrderId}`,
          orderData,
          config,
        );
      else
        await axios.post(
          `${API_URL}/api/orders`,
          { ...orderData, status: "Beklemede" },
          config,
        );
      clearCart();
      setPosTable("");
      setIsEditingOrder(false);
      fetchData();
      setActiveTab("orders");
    } catch (e) {
      toast.error("Hata!");
    }
  };

  // --- STATS CALCULATION ---
  const dynamicStats = useMemo(() => {
    const completed = orders.filter((o) => o.status === "Tamamlandı");
    const revenue = completed.reduce((s, o) => s + o.totalAmount, 0);
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
    const dailyData = last7Days.map((dStr) =>
      completed
        .filter(
          (o) =>
            new Date(o.createdAt).toLocaleDateString("tr-TR", {
              day: "2-digit",
              month: "short",
            }) === dStr,
        )
        .reduce((s, o) => s + o.totalAmount, 0),
    );
    return { revenue, last7Days, dailyData, count: orders.length };
  }, [orders]);

  const chartOption = {
    xAxis: { type: "category", data: dynamicStats.last7Days },
    yAxis: { type: "value" },
    series: [
      {
        data: dynamicStats.dailyData,
        type: "line",
        smooth: true,
        color: "#FF6B00",
        areaStyle: {
          color: "rgba(255, 107, 0, 0.1)",
        },
        lineStyle: {
          width: 3,
        },
      },
    ],
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    tooltip: { trigger: "axis" },
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <SEO title="Kumpir Salad Yönetim" />

      {/* SIDEBAR */}
      <div
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-[#06392E] text-white flex flex-col transition-all duration-300 shadow-2xl z-30`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-center">
          <div className="w-10 h-10 bg-[#FF6B00] rounded-xl flex items-center justify-center font-black">
            KS
          </div>
          {isSidebarOpen && (
            <span className="ml-3 font-black tracking-tighter">
              ADMİN PANEL
            </span>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("pos")}
            className={`w-full flex items-center p-4 rounded-2xl font-bold ${activeTab === "pos" ? "bg-[#FF6B00]" : "hover:bg-white/5"}`}>
            <Plus size={22} />{" "}
            {isSidebarOpen && <span className="ml-3">Hızlı Adisyon</span>}
          </button>
          <button
            onClick={() => setActiveTab("waiter")}
            className={`w-full flex items-center p-4 rounded-2xl font-bold ${activeTab === "waiter" ? "bg-[#FF6B00]" : "hover:bg-white/5"}`}>
            <BellRing size={22} />{" "}
            {isSidebarOpen && <span className="ml-3">Masa Çağrıları</span>}
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center p-4 rounded-2xl font-bold ${activeTab === "orders" ? "bg-[#FF6B00]" : "hover:bg-white/5"}`}>
            <ShoppingBag size={22} />{" "}
            {isSidebarOpen && <span className="ml-3">Tüm Siparişler</span>}
          </button>
          {userRole === "admin" && (
            <div className="pt-4 border-t border-white/5 mt-4 space-y-2">
              {/* YENİ EKLENEN FRANCHISE BUTONU */}
              <button
                onClick={() => setActiveTab("franchise")}
                className={`w-full flex items-center p-4 rounded-2xl font-bold ${activeTab === "franchise" ? "bg-[#FF6B00]" : "hover:bg-white/5"}`}>
                <Briefcase size={20} />{" "}
                {isSidebarOpen && (
                  <span className="ml-3">Franchise Talepleri</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("categories")}
                className={`w-full flex items-center p-4 rounded-2xl font-bold ${activeTab === "categories" ? "bg-[#FF6B00]" : "hover:bg-white/5"}`}>
                <FolderTree size={20} />{" "}
                {isSidebarOpen && <span className="ml-3">Kategoriler</span>}
              </button>
              <button
                onClick={() => setActiveTab("menu")}
                className={`w-full flex items-center p-4 rounded-2xl font-bold ${activeTab === "menu" ? "bg-[#FF6B00]" : "hover:bg-white/5"}`}>
                <Utensils size={20} />{" "}
                {isSidebarOpen && <span className="ml-3">Menü Ayarları</span>}
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`w-full flex items-center p-4 rounded-2xl font-bold ${activeTab === "stats" ? "bg-[#FF6B00]" : "hover:bg-white/5"}`}>
                <LayoutDashboard size={20} />{" "}
                {isSidebarOpen && <span className="ml-3">Raporlar</span>}
              </button>
            </div>
          )}
        </nav>
        <div className="p-4">
          <button
            onClick={() => {
              setToken(null);
              navigate("/");
            }}
            className="w-full flex items-center justify-center p-3 text-red-400 font-black hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={20} />{" "}
            {isSidebarOpen && <span className="ml-2">Çıkış</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b p-4 flex justify-between items-center px-8 h-20 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all">
              <ChevronLeft className={!isSidebarOpen ? "rotate-180" : ""} />
            </button>
            <h1 className="text-xl font-black uppercase tracking-tight">
              {activeTab === "pos"
                ? "Hızlı Adisyon"
                : activeTab === "waiter"
                  ? "Masa Çağrıları"
                  : activeTab === "orders"
                    ? "Siparişler"
                    : activeTab === "franchise"
                      ? "Franchise Talepleri"
                      : activeTab === "categories"
                        ? "Kategoriler"
                        : activeTab === "menu"
                          ? "Menü Ayarları"
                          : "Raporlar"}
            </h1>
          </div>
          <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            {userRole}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50">
          {/* TAB: POS */}
          {activeTab === "pos" && (
            <div className="flex flex-col xl:flex-row gap-8 h-full">
              <div className="flex-1 space-y-6">
                {isEditingOrder && (
                  <div className="bg-blue-600 text-white p-4 rounded-2xl font-black animate-pulse flex justify-between items-center shadow-lg">
                    <span>
                      DÜZENLEME MODU AKTİF (Sipariş ID:{" "}
                      {editingOrderId?.slice(-5)})
                    </span>
                    <button
                      onClick={() => {
                        setIsEditingOrder(false);
                        clearCart();
                        setEditingOrderId(null);
                        setPosTable("");
                      }}
                      className="bg-white text-blue-600 px-5 py-2 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all">
                      İPTAL ET
                    </button>
                  </div>
                )}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  <button
                    onClick={() => setPosCategory("all")}
                    className={`px-6 py-2.5 rounded-full font-black text-sm whitespace-nowrap transition-all ${posCategory === "all" ? "bg-black text-white shadow-md" : "bg-white hover:bg-gray-100"}`}>
                    TÜMÜ
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => setPosCategory(c._id)}
                      className={`px-6 py-2.5 rounded-full font-black text-sm whitespace-nowrap transition-all ${posCategory === c._id ? "bg-black text-white shadow-md" : "bg-white hover:bg-gray-100"}`}>
                      {c.name.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products
                    .filter(
                      (p) =>
                        posCategory === "all" ||
                        (typeof p.category === "string"
                          ? p.category === posCategory
                          : (p.category as any)?._id === posCategory),
                    )
                    .map((p) => (
                      <div
                        key={p._id}
                        onClick={() => setPosSelectedProduct(p)}
                        className="bg-white p-4 rounded-[30px] shadow-sm border-b-4 border-white hover:border-[#FF6B00] cursor-pointer transition-all hover:shadow-lg flex flex-col">
                        <img
                          src={p.image}
                          className="w-full h-32 object-cover rounded-2xl mb-3"
                          alt={p.name}
                        />
                        <h4 className="font-black text-sm h-10 overflow-hidden leading-tight text-gray-800 mb-1">
                          {p.name}
                        </h4>
                        <p className="text-[#FF6B00] font-black text-lg mt-auto">
                          {p.price.toFixed(2)} ₺
                        </p>
                      </div>
                    ))}
                </div>
              </div>
              <div className="w-full xl:w-96 bg-white rounded-[40px] shadow-2xl border flex flex-col p-8 h-fit sticky top-4">
                <h3 className="font-black text-2xl mb-6 uppercase tracking-tighter">
                  ADİSYON
                </h3>
                <div className="flex-1 space-y-4 mb-6 max-h-[45vh] overflow-y-auto pr-2 scrollbar-thin">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border-l-4 border-[#FF6B00] shadow-sm">
                      <div className="flex-1 mr-2">
                        <p className="font-black text-sm text-gray-800 leading-tight">
                          {item.product.name}
                        </p>
                        {item.selectedExtras?.map((ex, exIdx) => (
                          <span
                            key={exIdx}
                            className="block text-[11px] text-gray-500 font-bold mt-0.5">
                            + {ex.name} (+{ex.price}₺)
                          </span>
                        ))}
                        <p className="text-xs text-gray-400 font-bold mt-1.5">
                          {item.quantity} Adet x {getItemPrice(item).toFixed(2)}{" "}
                          ₺
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-black text-lg text-gray-900 whitespace-nowrap">
                          {(getItemPrice(item) * item.quantity).toFixed(2)} ₺
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && (
                    <div className="text-center py-10 text-gray-400 font-bold italic text-sm border-2 border-dashed rounded-2xl">
                      Sepet henüz boş.
                    </div>
                  )}
                </div>

                <div className="border-t pt-6 mt-auto space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-500">
                      Toplam Tutar:
                    </span>
                    <span className="font-black text-3xl text-[#FF6B00]">
                      {cart
                        .reduce((s, i) => s + getItemPrice(i) * i.quantity, 0)
                        .toFixed(2)}{" "}
                      ₺
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="MASA NO (Örn: 5)"
                    value={posTable}
                    onChange={(e) => setPosTable(e.target.value)}
                    className="w-full border-2 p-5 rounded-2xl font-black text-center text-3xl focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100 outline-none transition-all placeholder:text-gray-300"
                  />
                  <button
                    onClick={handlePosSubmit}
                    disabled={cart.length === 0 || !posTable.trim()}
                    className="w-full bg-[#06392E] text-white py-5 rounded-2xl font-black text-xl shadow-xl uppercase transition-all hover:bg-opacity-90 disabled:bg-gray-300 disabled:shadow-none disable:cursor-not-allowed">
                    {isEditingOrder
                      ? "DEĞİŞİKLİKLERİ KAYDET"
                      : "SİPARİŞİ MUTFAĞA GÖNDER"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WAITER CALLS */}
          {activeTab === "waiter" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {waiterCalls.length > 0 ? (
                waiterCalls.map((call) => (
                  <div
                    key={call.id}
                    className="bg-white p-8 rounded-[40px] shadow-xl border-t-8 border-orange-500 text-center relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
                    <BellRing
                      className="mx-auto mb-5 text-orange-500 animate-bounce"
                      size={56}
                    />
                    <h2 className="text-5xl font-black text-gray-950 tracking-tighter">
                      {call.table}
                    </h2>
                    <p className="text-gray-400 font-bold mt-3 text-sm">
                      Çağrı Zamanı: {new Date(call.time).toLocaleTimeString()}
                    </p>
                    <button
                      onClick={() =>
                        setWaiterCalls(
                          waiterCalls.filter((c) => c.id !== call.id),
                        )
                      }
                      className="mt-8 w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:bg-opacity-80 transition-all uppercase tracking-wide">
                      HİZMET TAMAMLANDI
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-32 opacity-30 font-black text-5xl uppercase tracking-widest text-gray-400 bg-white rounded-[40px] shadow-inner border-2 border-dashed">
                  Bekleyen Çağrı Yok
                </div>
              )}
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-[40px] shadow-xl border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50 font-black text-[11px] text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-8 py-6 text-left">MASA NO</th>
                    <th className="px-8 py-6 text-left">SİPARİŞ DETAYI</th>
                    <th className="px-8 py-6 text-left">TOPLAM TUTAR</th>
                    <th className="px-8 py-6 text-right">DURUM / İŞLEM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr
                      key={o._id}
                      className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6 font-black">
                        <span className="bg-[#06392E] text-white px-5 py-2.5 rounded-xl text-sm whitespace-nowrap">
                          {o.tableNumber}
                        </span>
                      </td>
                      <td className="px-8 py-6 space-y-1">
                        {o.items.map((i: any, idx: number) => (
                          <div
                            key={idx}
                            className="text-xs font-bold text-gray-700">
                            <span className="text-[#FF6B00] font-black mr-1">
                              {i.quantity}x
                            </span>{" "}
                            {products.find(
                              (p) => p._id === (i.product?._id || i.product),
                            )?.name || "Bilinmeyen Ürün"}
                            {i.selectedExtras?.length > 0 && (
                              <span className="text-gray-400 text-[10px] ml-1">
                                {" "}
                                (+{i.selectedExtras.length} Ekstra)
                              </span>
                            )}
                          </div>
                        ))}
                      </td>
                      <td className="px-8 py-6 font-black text-xl text-[#FF6B00] whitespace-nowrap">
                        {o.totalAmount.toFixed(2)} ₺
                      </td>
                      <td className="px-8 py-6 text-right space-x-2 whitespace-nowrap">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            updateOrderStatus(o._id, e.target.value)
                          }
                          className={`border-2 rounded-xl p-2.5 text-xs font-black outline-none focus:ring-2 transition-all ${o.status === "Beklemede" ? "bg-yellow-50 border-yellow-200 text-yellow-800 focus:ring-yellow-100" : o.status === "Hazırlanıyor" ? "bg-blue-50 border-blue-200 text-blue-800 focus:ring-blue-100" : o.status === "Tamamlandı" ? "bg-green-50 border-green-200 text-green-800 focus:ring-green-100" : "bg-red-50 border-red-200 text-red-800 focus:ring-red-100"}`}>
                          <option value="Beklemede">BEKLEMEDE</option>
                          <option value="Hazırlanıyor">MUTFAKTA</option>
                          <option value="Tamamlandı">ÖDENDİ</option>
                          <option value="İptal">İPTAL</option>
                        </select>
                        <button
                          onClick={() => startEditOrder(o)}
                          title="Siparişi Düzenle"
                          className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              confirm(
                                "Bu siparişi kalıcı olarak silmek istediğinize emin misiniz?",
                              )
                            ) {
                              try {
                                await axios.delete(
                                  `${API_URL}/api/orders/${o._id}`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  },
                                );
                                toast.success("Sipariş silindi.");
                                fetchData();
                              } catch (e) {
                                toast.error("Silinemedi.");
                              }
                            }
                          }}
                          title="Siparişi Sil"
                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-20 text-gray-400 font-bold italic border-t">
                  Henüz sipariş bulunmuyor.
                </div>
              )}
            </div>
          )}

          {/* TAB: FRANCHISE APPLICATIONS (YENİ EKLENEN KISIM) */}
          {activeTab === "franchise" && (
            <div className="bg-white rounded-[40px] shadow-xl border overflow-hidden">
              <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-black text-2xl uppercase tracking-tighter">
                  Franchise Başvuruları
                </h3>
                <span className="bg-[#FF6B00] text-white px-4 py-1 rounded-full text-xs font-bold">
                  Toplam: {franchises.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50 font-black text-[11px] text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-8 py-6 text-left">AD SOYAD / TARİH</th>
                      <th className="px-8 py-6 text-left">İLETİŞİM / BÖLGE</th>
                      <th className="px-8 py-6 text-left">YATIRIM BÜTÇESİ</th>
                      <th className="px-8 py-6 text-left">MESAJ</th>
                      <th className="px-8 py-6 text-right">İŞLEMLER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {franchises.map((f) => (
                      <tr
                        key={f._id}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="font-black text-gray-800">
                            {f.name}
                          </div>
                          <div className="text-[10px] text-gray-400 font-bold">
                            {new Date(f.createdAt).toLocaleDateString("tr-TR")}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <span className="text-[#FF6B00]">{f.phone}</span>
                          </div>
                          <div className="text-xs text-gray-500 font-medium mt-1">
                            Şehir: {f.city || "-"}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-black">
                            {f.investment || "Belirtilmedi"}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <p
                            className="text-xs text-gray-500 max-w-xs truncate"
                            title={f.message}>
                            {f.message || "-"}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={async () => {
                              if (
                                confirm("Başvuruyu silmek istiyor musunuz?")
                              ) {
                                try {
                                  await axios.delete(
                                    `${API_URL}/api/franchise/${f._id}`,
                                    {
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    },
                                  );
                                  fetchData();
                                  toast.success("Başvuru silindi.");
                                } catch (error) {
                                  toast.error("Silme işlemi başarısız.");
                                }
                              }
                            }}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {franchises.length === 0 && (
                <div className="text-center py-20 text-gray-400 font-bold italic">
                  Henüz franchise başvurusu bulunmuyor.
                </div>
              )}
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[40px] shadow-xl border h-fit sticky top-4">
                <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter">
                  {isEditingCategory
                    ? "Kategoriyi Düzenle"
                    : "Yeni Kategori Ekle"}
                </h3>
                <form onSubmit={handleCategorySubmit} className="space-y-5">
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full border-2 rounded-2xl p-4 font-black text-lg focus:border-[#FF6B00] outline-none transition-all placeholder:text-gray-300"
                    placeholder="KATEGORİ ADI (Örn: İçecekler)"
                  />
                  <button className="w-full bg-[#06392E] text-white py-4.5 rounded-2xl font-black text-lg shadow-xl uppercase transition-all hover:bg-opacity-90">
                    {isEditingCategory
                      ? "DEĞİŞİKLİKLERİ KAYDET"
                      : "KATEGORİYİ OLUŞTUR"}
                  </button>
                  {isEditingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingCategory(false);
                        setCategoryName("");
                        setEditingCategoryId(null);
                      }}
                      className="w-full text-gray-400 font-bold uppercase text-xs pt-2 hover:text-gray-600 transition-all">
                      İptal Et
                    </button>
                  )}
                </form>
              </div>
              <div className="xl:col-span-2 bg-white rounded-[40px] shadow-xl border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50 font-black text-[11px] text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-10 py-6 text-left">KATEGORİ ADI</th>
                      <th className="px-10 py-6 text-right">İŞLEMLER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map((c) => (
                      <tr
                        key={c._id}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-10 py-7 font-black text-lg text-gray-800 uppercase tracking-tight">
                          {c.name}
                        </td>
                        <td className="px-10 py-7 text-right space-x-3 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setCategoryName(c.name);
                              setIsEditingCategory(true);
                              setEditingCategoryId(c._id);
                            }}
                            className="text-blue-500 font-black text-xs uppercase bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                            Düzenle
                          </button>
                          <button
                            onClick={async () => {
                              if (
                                confirm(
                                  `${c.name} kategorisini silmek istediğinize emin misiniz? Bu kategoriye ait ürünler kategorisiz kalacaktır.`,
                                )
                              ) {
                                try {
                                  await axios.delete(
                                    `${API_URL}/api/categories/${c._id}`,
                                    {
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    },
                                  );
                                  toast.success("Kategori silindi.");
                                  fetchData();
                                } catch (e) {
                                  toast.error("Silinemedi.");
                                }
                              }
                            }}
                            className="text-red-500 font-black text-xs uppercase bg-red-50 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {categories.length === 0 && (
                  <div className="text-center py-20 text-gray-400 font-bold italic border-t">
                    Henüz kategori bulunmuyor.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: MENU SETTINGS */}
          {activeTab === "menu" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[40px] shadow-xl border h-fit sticky top-4">
                <h3 className="font-black text-2xl mb-8 uppercase tracking-tighter">
                  {isEditing ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                </h3>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border-2 rounded-2xl p-4 font-bold focus:border-[#FF6B00] outline-none transition-all placeholder:text-gray-300"
                    placeholder="ÜRÜN ADI (Örn: Klasik Kumpir)"
                  />
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border-2 rounded-2xl p-4 font-bold h-24 resize-none focus:border-[#FF6B00] outline-none transition-all placeholder:text-gray-300"
                    placeholder="ÜRÜN AÇIKLAMASI / İÇERİĞİ"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full border-2 rounded-2xl p-4 pl-12 font-black text-xl focus:border-[#FF6B00] outline-none transition-all placeholder:text-gray-300"
                      placeholder="0.00"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-gray-400">
                      ₺
                    </span>
                  </div>
                  <select
                    required
                    value={formData.category as string}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full border-2 rounded-2xl p-4 font-bold bg-white focus:border-[#FF6B00] outline-none transition-all appearance-none text-gray-700">
                    <option value="" className="text-gray-300">
                      KATEGORİ SEÇİN
                    </option>
                    {categories.map((c) => (
                      <option
                        key={c._id}
                        value={c._id}
                        className="text-gray-800 font-bold">
                        {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all overflow-hidden min-h-[160px] ${
                      isDragging
                        ? "border-[#FF6B00] bg-orange-50"
                        : "border-gray-300 hover:border-[#FF6B00] bg-gray-50"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        setImageFile(file);
                        setFormData({
                          ...formData,
                          image: URL.createObjectURL(file),
                        });
                      }
                    }}>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setImageFile(file);
                          setFormData({
                            ...formData,
                            image: URL.createObjectURL(file),
                          });
                        }
                      }}
                    />

                    {formData.image ? (
                      <div className="flex flex-col items-center z-0">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-2xl shadow-md mb-3"
                        />
                        <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                          Değiştirmek için tıkla veya sürükle
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center pointer-events-none z-0">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-gray-400">
                          <Plus size={32} />
                        </div>
                        <p className="font-black text-gray-600 text-lg">
                          Resmi Buraya Sürükle
                        </p>
                        <p className="text-sm font-bold text-gray-400">
                          veya seçmek için tıkla
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-2 rounded-3xl p-6 bg-gray-50 border-gray-100 mt-6 shadow-inner">
                    <h4 className="font-black text-sm mb-4 text-gray-600 uppercase tracking-wider">
                      Ürün Ekstraları (Opsiyonel)
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <input
                        type="text"
                        value={newExtraName}
                        onChange={(e) => setNewExtraName(e.target.value)}
                        placeholder="Örn: Kaşar"
                        className="flex-1 border-2 rounded-xl p-3 font-bold text-sm outline-none focus:border-[#FF6B00] bg-white transition-all placeholder:text-gray-300 shadow-sm"
                      />
                      <div className="flex gap-3">
                        <input
                          type="number"
                          value={newExtraPrice}
                          onChange={(e) =>
                            setNewExtraPrice(
                              e.target.value ? Number(e.target.value) : "",
                            )
                          }
                          placeholder="₺ Tutar"
                          className="w-24 border-2 rounded-xl p-3 font-black text-sm outline-none focus:border-[#FF6B00] bg-white transition-all text-center placeholder:text-gray-300 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddExtra}
                          className="bg-[#06392E] text-white px-6 rounded-xl font-black text-sm hover:bg-[#FF6B00] hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2">
                          <Plus size={18} strokeWidth={3} /> EKLE
                        </button>
                      </div>
                    </div>

                    {formData.extras && formData.extras.length > 0 ? (
                      <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                        {formData.extras.map((ex, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center bg-white p-3 px-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-orange-100">
                            <span className="font-bold text-sm text-gray-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#FF6B00]"></span>
                              {ex.name}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="font-black text-sm text-[#FF6B00]">
                                {ex.price.toFixed(2)} ₺
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveExtra(idx)}
                                className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-lg transition-all">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-3 font-medium italic border border-dashed rounded-xl bg-white">
                        Henüz ekstra eklenmedi.
                      </p>
                    )}
                  </div>

                  <button className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black text-xl shadow-xl uppercase mt-8 transition-all hover:bg-orange-600">
                    {isEditing
                      ? "DEĞİŞİKLİKLERİ KAYDET"
                      : "ÜRÜNÜ KATALOĞA EKLE"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={cancelEditingProduct}
                      className="w-full text-gray-400 font-bold uppercase text-xs pt-2 hover:text-gray-600 transition-all">
                      DÜZENLEMEYİ İPTAL ET
                    </button>
                  )}
                </form>
              </div>

              <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 h-fit">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white border-2 border-white rounded-[35px] p-6 flex items-start gap-5 hover:border-[#FF6B00] transition-all hover:shadow-lg flex-col sm:flex-row">
                    <img
                      src={p.image}
                      className="w-full sm:w-24 h-24 rounded-2xl object-cover shadow-md flex-shrink-0"
                      alt={p.name}
                    />
                    <div className="flex-1 space-y-1.5 w-full">
                      <p className="font-black text-lg leading-tight text-gray-900">
                        {p.name}
                      </p>
                      <p className="text-[#FF6B00] font-black text-lg">
                        {p.price.toFixed(2)} ₺
                      </p>
                      <p className="text-xs text-gray-500 font-medium line-clamp-2">
                        {p.description}
                      </p>

                      {p.extras && p.extras.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t mt-3">
                          {p.extras.map((ex, i) => (
                            <span
                              key={i}
                              className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                              {ex.name} (+{ex.price}₺)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-none pt-3 sm:pt-0">
                      <button
                        onClick={() => {
                          setFormData({
                            ...p,
                            category:
                              typeof p.category === "object"
                                ? (p.category as any)._id
                                : p.category,
                            extras: p.extras || [],
                          });
                          setIsEditing(true);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        title="Düzenle"
                        className="flex-1 sm:flex-none p-3 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex justify-center">
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        title="Sil"
                        className="flex-1 sm:flex-none p-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all flex justify-center">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="col-span-2 text-center py-20 text-gray-400 font-bold italic border-2 border-dashed rounded-3xl bg-white">
                    Henüz ürün bulunmuyor.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: STATS */}
          {activeTab === "stats" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#06392E] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden transition-all hover:shadow-emerald-950/30">
                  <h3 className="text-xs font-black uppercase opacity-60 mb-2 tracking-wider">
                    Toplam Ciro (Başarılı)
                  </h3>
                  <p className="text-5xl font-black tracking-tighter">
                    {dynamicStats.revenue.toFixed(2)} ₺
                  </p>
                  <TrendingUp
                    className="absolute bottom-5 right-5 opacity-10"
                    size={80}
                  />
                </div>
                <div className="bg-white p-10 rounded-[40px] shadow-xl border-b-8 border-[#FF6B00]">
                  <h3 className="text-xs font-black uppercase text-gray-400 mb-2 tracking-wider">
                    Toplam Sipariş Sayısı
                  </h3>
                  <p className="text-5xl font-black text-gray-800 tracking-tighter">
                    {dynamicStats.count}
                  </p>
                </div>
                <div className="bg-white p-10 rounded-[40px] shadow-xl border-b-8 border-blue-500">
                  <h3 className="text-xs font-black uppercase text-gray-400 mb-2 tracking-wider">
                    Site Görüntülenme
                  </h3>
                  <p className="text-5xl font-black text-gray-800 tracking-tighter">
                    {stats.events?.find((e: any) => e._id === "view")?.count ||
                      0}
                  </p>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[40px] shadow-xl border border-gray-100">
                <h3 className="font-black text-lg mb-6 uppercase text-gray-700 tracking-tight">
                  Son 7 Günlük Gelir Akışı
                </h3>
                <ReactECharts
                  option={chartOption}
                  style={{ height: "450px" }}
                  notMerge={true}
                  lazyUpdate={true}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {posSelectedProduct && (
        <ProductModal
          product={posSelectedProduct}
          onClose={() => setPosSelectedProduct(null)}
        />
      )}
    </div>
  );
};
