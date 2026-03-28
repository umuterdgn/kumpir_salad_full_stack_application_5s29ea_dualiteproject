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
  ShoppingCart,
  TrendingUp,
  Eye,
  Percent,
  Layers,
  Image as ImageIcon,
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

  // POS & Form States
  const [posCategory, setPosCategory] = useState<string>("all");
  const [posTable, setPosTable] = useState("");
  const [posSelectedProduct, setPosSelectedProduct] = useState<Product | null>(
    null,
  );
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
  });
  const [categoryName, setCategoryName] = useState("");
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [ordRes, statRes, prodRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/api/orders`, config),
        axios.get(`${API_URL}/api/stats`, config),
        axios.get(`${API_URL}/api/products`),
        axios.get(`${API_URL}/api/categories`),
      ]);
      setOrders(ordRes.data);
      setStats(statRes.data);
      setProducts(prodRes.data);
      setCategories(catRes.data);
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

  // --- ACTIONS ---
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isEditing) {
        await axios.put(
          `${API_URL}/api/products/${formData._id}`,
          formData,
          config,
        );
      } else {
        await axios.post(`${API_URL}/api/products`, formData, config);
      }
      toast.success("Başarılı!");
      setIsEditing(false);
      setFormData({
        name: "",
        description: "",
        price: 0,
        image: "",
        category: "",
      });
      fetchData();
    } catch (err) {
      toast.error("Hata!");
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
      },
    ],
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
            className="w-full flex items-center justify-center p-3 text-red-400 font-black">
            <LogOut size={20} />{" "}
            {isSidebarOpen && <span className="ml-2">Çıkış</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b p-4 flex justify-between items-center px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-gray-100 rounded-lg">
              <ChevronLeft className={!isSidebarOpen ? "rotate-180" : ""} />
            </button>
            <h1 className="text-xl font-black uppercase">{activeTab}</h1>
          </div>
          <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-black">
            {userRole?.toUpperCase()}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* TAB: POS */}
          {activeTab === "pos" && (
            <div className="flex flex-col xl:flex-row gap-8 h-full">
              <div className="flex-1 space-y-6">
                {isEditingOrder && (
                  <div className="bg-blue-600 text-white p-4 rounded-2xl font-black animate-pulse flex justify-between">
                    DÜZENLEME MODU AKTİF{" "}
                    <button
                      onClick={() => {
                        setIsEditingOrder(false);
                        clearCart();
                      }}
                      className="bg-white text-blue-600 px-4 rounded-lg">
                      İPTAL
                    </button>
                  </div>
                )}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setPosCategory("all")}
                    className={`px-6 py-2 rounded-xl font-black ${posCategory === "all" ? "bg-black text-white" : "bg-white"}`}>
                    TÜMÜ
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => setPosCategory(c._id)}
                      className={`px-6 py-2 rounded-xl font-black ${posCategory === c._id ? "bg-black text-white" : "bg-white"}`}>
                      {c.name.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        className="bg-white p-4 rounded-[30px] shadow-sm border-b-4 hover:border-[#FF6B00] cursor-pointer transition-all">
                        <img
                          src={p.image}
                          className="w-full h-24 object-cover rounded-2xl mb-2"
                        />
                        <h4 className="font-black text-xs h-8 overflow-hidden">
                          {p.name}
                        </h4>
                        <p className="text-[#FF6B00] font-black">{p.price} ₺</p>
                      </div>
                    ))}
                </div>
              </div>
              <div className="w-full xl:w-96 bg-white rounded-[40px] shadow-2xl border flex flex-col p-6 h-fit sticky top-0">
                <h3 className="font-black text-xl mb-4">ADİSYON</h3>
                <div className="flex-1 space-y-4 mb-6 max-h-[40vh] overflow-y-auto">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border-l-4 border-[#FF6B00]">
                      <div className="flex-1">
                        <p className="font-black text-xs">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {item.quantity} Adet
                        </p>
                      </div>
                      <p className="font-black text-sm mr-2">
                        {getItemPrice(item) * item.quantity} ₺
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="MASA NO"
                  value={posTable}
                  onChange={(e) => setPosTable(e.target.value)}
                  className="w-full border-2 p-4 rounded-2xl mb-4 font-black text-center text-2xl focus:border-[#FF6B00] outline-none"
                />
                <button
                  onClick={handlePosSubmit}
                  className="w-full bg-[#06392E] text-white py-5 rounded-2xl font-black text-xl shadow-xl uppercase">
                  {isEditingOrder ? "GÜNCELLE" : "MUTFAĞA GÖNDER"}
                </button>
              </div>
            </div>
          )}

          {/* TAB: WAITER CALLS */}
          {activeTab === "waiter" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {waiterCalls.length > 0 ? (
                waiterCalls.map((call) => (
                  <div
                    key={call.id}
                    className="bg-white p-8 rounded-[40px] shadow-xl border-t-8 border-orange-500 text-center relative overflow-hidden">
                    <BellRing
                      className="mx-auto mb-4 text-orange-500 animate-bounce"
                      size={48}
                    />
                    <h2 className="text-4xl font-black">{call.table}</h2>
                    <p className="text-gray-400 font-bold mt-2">
                      {new Date(call.time).toLocaleTimeString()}
                    </p>
                    <button
                      onClick={() =>
                        setWaiterCalls(
                          waiterCalls.filter((c) => c.id !== call.id),
                        )
                      }
                      className="mt-6 w-full bg-black text-white py-3 rounded-2xl font-black">
                      TAMAMLANDI
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-20 opacity-20 font-black text-4xl uppercase tracking-widest">
                  Bekleyen Çağrı Yok
                </div>
              )}
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-[40px] shadow-xl border overflow-hidden">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50 font-black text-[10px] text-gray-400 uppercase">
                  <tr>
                    <th className="px-8 py-6 text-left">MASA</th>
                    <th className="px-8 py-6 text-left">DETAY</th>
                    <th className="px-8 py-6 text-left">TUTAR</th>
                    <th className="px-8 py-6 text-right">İŞLEMLER</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-8 py-6 font-black">
                        <span className="bg-[#06392E] text-white px-4 py-2 rounded-xl">
                          {o.tableNumber}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {o.items.map((i: any, idx: number) => (
                          <div key={idx} className="text-xs font-bold">
                            <span className="text-[#FF6B00]">
                              {i.quantity}x
                            </span>{" "}
                            {products.find(
                              (p) => p._id === (i.product?._id || i.product),
                            )?.name || "Ürün"}
                          </div>
                        ))}
                      </td>
                      <td className="px-8 py-6 font-black text-lg text-[#FF6B00]">
                        {o.totalAmount.toFixed(2)} ₺
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            updateOrderStatus(o._id, e.target.value)
                          }
                          className={`border rounded-xl p-2 text-[10px] font-black ${o.status === "Beklemede" ? "bg-yellow-50" : "bg-green-50"}`}>
                          <option value="Beklemede">BEKLEMEDE</option>
                          <option value="Hazırlanıyor">MUTFAKTA</option>
                          <option value="Tamamlandı">ÖDENDİ</option>
                          <option value="İptal">İPTAL</option>
                        </select>
                        <button
                          onClick={() => startEditOrder(o)}
                          className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <Edit3 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[40px] shadow-xl border h-fit">
                <h3 className="text-xl font-black mb-6 uppercase">
                  {isEditingCategory ? "Düzenle" : "Yeni Kategori"}
                </h3>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full border-2 rounded-2xl p-4 font-black"
                    placeholder="KATEGORİ ADI"
                  />
                  <button className="w-full bg-[#06392E] text-white py-4 rounded-2xl font-black shadow-lg uppercase">
                    {isEditingCategory ? "Güncelle" : "Ekle"}
                  </button>
                </form>
              </div>
              <div className="xl:col-span-2 bg-white rounded-[40px] shadow-xl border overflow-hidden">
                <table className="min-w-full divide-y">
                  <tbody className="divide-y">
                    {categories.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-50">
                        <td className="px-10 py-6 font-black uppercase">
                          {c.name}
                        </td>
                        <td className="px-10 py-6 text-right space-x-4">
                          <button
                            onClick={() => {
                              setCategoryName(c.name);
                              setIsEditingCategory(true);
                              setEditingCategoryId(c._id);
                            }}
                            className="text-blue-500 font-black text-xs uppercase">
                            Düzenle
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("Silinsin mi?")) {
                                await axios.delete(
                                  `${API_URL}/api/categories/${c._id}`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  },
                                );
                                fetchData();
                              }
                            }}
                            className="text-red-500 font-black text-xs uppercase">
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

          {/* TAB: MENU SETTINGS */}
          {activeTab === "menu" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[40px] shadow-xl border h-fit">
                <h3 className="font-black text-xl mb-6 uppercase">
                  {isEditing ? "Ürünü Düzenle" : "Yeni Ürün"}
                </h3>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border-2 rounded-2xl p-3 font-bold"
                    placeholder="ÜRÜN ADI"
                  />
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full border-2 rounded-2xl p-3 font-bold h-20"
                    placeholder="AÇIKLAMA"
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
                    className="w-full border-2 rounded-2xl p-3 font-bold"
                    placeholder="FİYAT"
                  />
                  <select
                    required
                    value={formData.category as string}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full border-2 rounded-2xl p-3 font-bold bg-white">
                    <option value="">KATEGORİ</option>
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
                    className="w-full border-2 rounded-2xl p-3 font-bold"
                    placeholder="RESİM URL"
                  />
                  <button className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black shadow-xl uppercase">
                    {isEditing ? "Güncelle" : "Kataloğa Ekle"}
                  </button>
                </form>
              </div>
              <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white border-2 rounded-[30px] p-5 flex items-center gap-4 hover:border-[#FF6B00]">
                    <img
                      src={p.image}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-black text-sm leading-tight">
                        {p.name}
                      </p>
                      <p className="text-[#FF6B00] font-black text-sm">
                        {p.price} ₺
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setFormData({
                            ...p,
                            category:
                              typeof p.category === "object"
                                ? (p.category as any)._id
                                : p.category,
                          });
                          setIsEditing(true);
                        }}
                        className="p-2 text-blue-600">
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="p-2 text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: STATS */}
          {activeTab === "stats" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#06392E] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                  <h3 className="text-[10px] font-black uppercase opacity-60 mb-2">
                    Toplam Ciro
                  </h3>
                  <p className="text-4xl font-black">
                    {dynamicStats.revenue.toFixed(2)} ₺
                  </p>
                  <TrendingUp
                    className="absolute bottom-4 right-4 opacity-10"
                    size={60}
                  />
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-xl border-b-8 border-[#FF6B00]">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2">
                    Toplam Adisyon
                  </h3>
                  <p className="text-4xl font-black text-gray-800">
                    {dynamicStats.count}
                  </p>
                </div>
                <div className="bg-white p-8 rounded-[40px] shadow-xl border-b-8 border-blue-500">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2">
                    Görüntülenme
                  </h3>
                  <p className="text-4xl font-black text-gray-800">
                    {stats.events?.find((e: any) => e._id === "view")?.count ||
                      0}
                  </p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[40px] shadow-xl border">
                <ReactECharts
                  option={chartOption}
                  style={{ height: "400px" }}
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
