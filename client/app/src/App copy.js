// React imports: core hooks and router utilities
import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

// Animation on scroll library import & styles
import AOS from "aos";
import "aos/dist/aos.css";

// Global CSS styles
import "./styles/root.css";
import "./styles/layouts/Loading.css";

// Layout components for consistent page structure
import Header from "./Components/Layout/Header";
import Main from "./Components/Layout/Main";
import Cta from "./Components/Layout/Cta";
import ImpressiveIntro from "./Components/Layout/ImpressiveIntro";
import WhatItDoes from "./Components/Layout/WhatItDoes";
import Footer from "./Components/Layout/Footer";
import Pricing from "./Components/Layout/Pricing";
import Contact from "./Components/Layout/Contact";
import Why from "./Components/Layout/Why";
import Support from "./Components/Layout/Support";

// Authentication components
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";

// User dashboard & pages components
import AdminDashboard from "./Components/User/Dashboard";
import Customers from "./Components/User/Pages/Customers";
import GeneralSettings from "./Components/User/Pages/generalSettings";
import IntegrationSettings from "./Components/User/Pages/IntegrationSettings";
import MyAccount from "./Components/User/Pages/MyAccount";
import Suppliers from "./Components/User/Pages/Suppliers";
import InvoiceReceived from "./Components/User/Pages/InvoiceReceived";
import InvoiceIssued from "./Components/User/Pages/InvoiceIssued";
import IncomeExpenses from "./Components/User/Pages/IncomeExpenses";
import Expenses from "./Components/User/Pages/Expenses";
import BankStatement from "./Components/User/Pages/BankStatement";
import Export from "./Components/User/Pages/Export";
import Pays from "./Components/User/Pages/Pays";
import UpdatePlane from "./Components/User/Pages/UpdatePlane";
import InvoiceEditorA4 from "./Components/User/Pages/InvoiceEditorA4";

import PaymenInfo from "./Components/User/Pages/PaymenInfo";

// Utility & styles imports
import GetBackendURL from "./Components/GetBackendURL";
import AllTransaction from "./styles/admin/pages/Alltransaction";
import { autocompleteClasses } from "@mui/material";

import getUserSetting from "../public/fetchAPI/GeneralSetting";
import { getUserInfo } from "../../../server/controllers/authController";

// ----------- Page Components ------------- //

// HomePage: landing page composed of various sections with AOS animations
const HomePage = () => (
  <>
    <Header />
    <div data-aos="fade-up"><Main /></div>
    <div data-aos="fade-up">
      <Cta
        headline="Vyzkoušejte novinku mezi fakturačními nástroji"
        text="Fakturka je moderní a přehledný nástroj pro podnikatele..."
        btn="Vyzkoušet zdarma"
      />
    </div>
    <div data-aos="fade-up"><ImpressiveIntro /></div>
    <div data-aos="fade-up"><WhatItDoes /></div>
    <div data-aos="fade-up">
      <Cta
        headline="Zbavte se papírování jednou provždy"
        text="Fakturka vám ušetří čas, nervy a chyby..."
        btn="Začněte během 1 minuty"
      />
    </div>
    <div data-aos="fade-up"><Pricing /></div>
    <Footer />
  </>
);

// Simple page components for login and registration
const LoginPage = () => (
  <>
    <Header />
    <Login />
  </>
);

const CreateAccount = () => (
  <>
    <Header />
    <Register />
  </>
);

// Other simple feature and price info pages
const Features = () => (
  <>
    <Header />
    <WhatItDoes />
  </>
);

const Prices = () => (
  <>
    <Header />
    <Pricing />
  </>
);

// ----------- Main App Component ------------- //

const App = () => {
  // State for splash/loading screen visibility
  const [loading, setLoading] = useState(true);
  // State to track if user is logged in or not
  const [isLogged, setIsLogged] = useState(null);

  // React Router hooks for current location and navigation
  const location = useLocation();
  const navigate = useNavigate();

   const publicPaths = [
    "/",
    "",
    "/prihlaseni",
    "/vytvorit-ucet",
    "/co-umi-fakturka",
    "/nase-ceny",
    "/podpora",
    "/proc-fakturka",
    "/kontakty",
  ];


  // Initialize AOS (Animate On Scroll) library once on mount
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in ms
      once: true,     // Animate only once per element
    });
  }, []);

  // Refresh AOS animations on every route change
  useEffect(() => {
    AOS.refresh();
  }, [location]);

  // Show loading screen briefly when app starts
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // Check if current path is "/logout", then perform logout action
  useEffect(() => {
    const performLogout = async () => {
      if (location.pathname === "/logout") {
        await logout();
      }
    };
    performLogout();
  }, [location, navigate]);

  // Logout function: calls backend logout API and redirects home
  const logout = async () => {
    try {
      const response = await fetch(`${GetBackendURL()}/auth/logout`, {
        method: "POST",
        credentials: "include", // include cookies/session info
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        // Log error if logout failed
        console.error(`Logout failed with status ${response.status}`);
        return;
      }
      // Redirect to homepage after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

 useEffect(() => {
  const checkLoginStatus = async () => {
    try {
      const res = await fetch(`${GetBackendURL()}/auth/isUserLogged`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
         const path = location.pathname.replace(/\/+$/, "") || "/";
          if (!publicPaths.includes(path)) {
  navigate("/");
}
        setIsLogged(false);

        return;
      }

      const data = await res.json();
      console.log("You are logged in:", data);

      const { loggedIn } = data;
      setIsLogged(loggedIn);

      const path = location.pathname.replace(/\/+$/, "") || "/";

      // Redirect to /app if logged in and on root path
      if (loggedIn && path === "/") {
        window.location.href = "/app";
        return;
      }

      // Call redirect automation
      AutomateRedirect();

      // Redirect logged-in users away from login/register pages
      if (
        loggedIn &&
        ["/prihlaseni", "/vytvorit-ucet"].includes(path)
      ) {
        console.log("User logged in, redirecting to dashboard");
        navigate("/app");
        return;
      }

      // Redirect not logged-in users away from /app
      if (!loggedIn && path === "/app") {
        console.log("User not logged in, redirecting to login");
        navigate("/prihlaseni");
      }

    } catch (err) {
      console.error("Error in checkLoginStatus:", err);
      setIsLogged(false);
    }
  };

  checkLoginStatus();
}, [location, navigate]);

/* useEffect(() =>{
    const fetchSetting = async () =>{
      const data = await getUserInfo();
      if(data) {
        console.log(data);
      }
    }

    fetchSetting()
     
} , []); */



  // Render loading screen while app is initializing
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>
          <span>Fa</span>kturka...
        </p>
      </div>
    );
  }

  // Function to redirect users from public pages to app/dashboard if logged in
const AutomateRedirect = () => {
  
 
  if (publicPaths.includes(location.pathname)) {
    window.location.href = "/app";
  }
};










  // Main app route definitions using React Router
  return (
    <Routes>
      {/* Public & Marketing Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/prihlaseni" element={<LoginPage />} />
      <Route path="/vytvorit-ucet" element={<CreateAccount />} />
      <Route path="/kontakty" element={<Contact />} />
      <Route path="/proc-fakturka" element={<Why />} />
      <Route path="/podpora" element={<Support />} />
      <Route path="/co-umi-fakturka" element={<Features />} />
      <Route path="/nase-ceny" element={<Prices />} />

      {/* User Dashboard & Pages */}
      <Route path="/app" element={<AdminDashboard />} />
      <Route path="/odberatele" element={<Customers />} />
      <Route path="/nastaveni/obecna" element={<GeneralSettings />} />
      <Route path="/nastaveni/integrace" element={<IntegrationSettings />} />
      <Route path="/moj-ucet/nastaveni" element={<MyAccount />} />
      <Route path="/dodavatele" element={<Suppliers />} />
      <Route path="/faktury-prijate" element={<InvoiceReceived />} />
      <Route path="/faktury-vydane" element={<InvoiceIssued />} />
      <Route path="/transakce/prijmy" element={<IncomeExpenses />} />
      <Route path="/transakce/vydaje" element={<Expenses />} />
      <Route path="/transakce/export" element={<Export />} />
      <Route path="/nasteveni/zmena/plan" element={<UpdatePlane />} />
      <Route path="/platba-predplatne" element={<Pays />} />
      <Route path="/transakce/vsechny" element={<AllTransaction />} />
      <Route path="/faktury-vydane/nova" element={<InvoiceEditorA4 />} />
      
      <Route path="/success" element={<PaymenInfo info = {"success"} />} />

      <Route path="/cancel" element={<PaymenInfo info = {"cancel"} />} />

      <Route path="/moje-platba/predplatne" element={<PaymenInfo info = {"paid-info"} />} />

      

      
    </Routes>
  );
};

export default App;
