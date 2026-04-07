import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import axios from "axios"; // BUNA DİKKAT
import { useAppStore } from "./store"; // BUNA DİKKAT
import Franchise from "./pages/Franchise";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Menu } from "./pages/Menu";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";

// --- CANLI SUNUCU (RENDER) BAĞLANTISI ---
// Vercel'deki Environment Variables kısmına yazdığın linki buradan çeker.
// Eğer lokalde çalışıyorsan otomatik 5000 portuna gider.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
axios.defaults.baseURL = API_URL;

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  const token = useAppStore((state) => state.token);

  // Otomatik Token Ekleme: Kullanıcı giriş yaptığında tüm isteklere token ekler
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  return (
    <HelmetProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: "#63AC22",
                color: "#fff",
                fontWeight: "bold",
              },
              iconTheme: { primary: "#fff", secondary: "#63AC22" },
            },
          }}
        />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/hakkimizda" element={<About />} />
            <Route path="/iletisim" element={<Contact />} />
            <Route path="/admin-login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/franchise" element={<Franchise />} />
          </Routes>
        </Layout>
      </Router>
    </HelmetProvider>
  );
}

export default App;
