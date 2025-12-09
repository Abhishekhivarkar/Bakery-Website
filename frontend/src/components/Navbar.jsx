import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import logo from "../assets/homePage/logo White.png";
import { FaShoppingCart } from "react-icons/fa";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get cart from Redux
  const cart = useSelector((state) => state.cart || { items: [] });
  const cartCount = cart.items?.length || 0;

  // Fetch categories from backend (old code logic)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/product", {
          params: {
            limit: 100
          }
        });
        
        if (response.data && response.data.success) {
          const uniqueCategories = [...new Set(response.data.products.map(p => p.category))];
          setCategories(uniqueCategories.filter(cat => cat && cat.trim() !== ""));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories(["Classic Cakes", "Premium Cakes", "Donuts", "Cookies", "Special Pizza", "Customize Cake"]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Sync user from localStorage/API (old code logic)
  useEffect(() => {
    const syncUserFromStorageOrAPI = async () => {
      try {
        const stored = localStorage.getItem("userInfo");

        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          const token = localStorage.getItem("userToken");

          if (!token) {
            setUser(null);
          } else {
            const res = await axios.get("http://localhost:5000/api/auth/me", {
              headers: { Authorization: `Bearer ${token}` },
            });

            const u = res.data.user || res.data;
            const cleanedUser = {
              id: u.id || u._id,
              username: u.username,
              email: u.email,
              profilePicture: u.profilePicture || "",
            };

            setUser(cleanedUser);
            localStorage.setItem("userInfo", JSON.stringify(cleanedUser));
          }
        }
      } catch (err) {
        console.error("Failed to sync user:", err);
        localStorage.removeItem("userToken");
        localStorage.removeItem("userInfo");
        setUser(null);
      }
    };

    syncUserFromStorageOrAPI();
    window.addEventListener("storage", syncUserFromStorageOrAPI);

    return () => {
      window.removeEventListener("storage", syncUserFromStorageOrAPI);
    };
  }, []);

  // Listen for cart updates from localStorage (as backup)
  useEffect(() => {
    const handleCartUpdate = () => {
      // This will trigger when localStorage changes from other tabs/windows
      // But Redux should handle it automatically
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  // Debug: Log cart changes
  useEffect(() => {
    console.log("🛒 Navbar cart updated:", cartCount, "items");
  }, [cartCount]);

  // Menu items from old code (better dropdown logic)
  const menuItems = [
    {
      name: "Menu",
      dropdown: categories.map(cat => ({
        label: cat,
        path: `/menu?category=${encodeURIComponent(cat)}`
      })).concat([
        { label: "All Products", path: "/menu" },
        { label: "Featured", path: "/menu?featured=true" },
        { label: "New Arrivals", path: "/menu?new=true" }
      ])
    },
    {
      name: "Categories",
      dropdown: categories.length > 0 
        ? categories.map(cat => ({
            label: cat,
            path: `/menu?category=${encodeURIComponent(cat)}`
          }))
        : [
            { label: "Classic Cakes", path: "/menu?category=Classic+Cakes" },
            { label: "Premium Cakes", path: "/menu?category=Premium+Cakes" },
            { label: "Donuts & Cookies", path: "/menu?category=Donuts+%26+Cookies" },
            { label: "Special Pizza", path: "/menu?category=Special+Pizza" }
          ]
    },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed left-1/2 -translate-x-1/2 w-[100%] lg:w-[100%] z-50">
      <div
        className="bg-[#6f482a]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)]
        border border-white/20 px-5 sm:px-8 md:px-10 py-3 
        flex items-center justify-between transition-all"
      >
        {/* LOGO (from new code styling) */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="logo"
            className="h-10 sm:h-12 drop-shadow-md transition"
          />
        </Link>

        {/* DESKTOP MENU (from new code styling) */}
        <ul className="hidden xl:flex items-center space-x-8 text-white font-semibold">
          {menuItems.map((item) =>
            item.dropdown ? (
              <li key={item.name} className="relative group cursor-pointer">
                <span className="flex items-center hover:text-[#d78f52] transition">
                  {item.name}
                  <ChevronDown
                    size={16}
                    className="ml-1 group-hover:rotate-180 transition-transform duration-300"
                  />
                </span>

                <div className="absolute left-0 right-0 top-full h-4"></div>

                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 min-w-48 max-w-64
                  bg-white/95 backdrop-blur-md shadow-xl rounded-xl py-2 mt-3
                  opacity-0 scale-95 pointer-events-none
                  group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
                  transition-all duration-300 ease-out"
                >
                  {loading ? (
                    <div className="px-4 py-2 text-sm text-[#8b5e3c]">
                      Loading categories...
                    </div>
                  ) : item.dropdown.length > 0 ? (
                    item.dropdown.map((d, index) => (
                      <Link
                        key={index}
                        to={d.path}
                        className="block px-4 py-2 text-sm text-[#8b5e3c]
                        hover:bg-[#f8e9dd] hover:text-[#c57b41] transition truncate"
                        title={d.label}
                        onClick={() => setOpen(false)}
                      >
                        {d.label}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-[#8b5e3c]">
                      No categories found
                    </div>
                  )}
                </div>
              </li>
            ) : (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="hover:text-[#d78f52] transition"
                >
                  {item.name}
                </Link>
              </li>
            )
          )}
        </ul>

        {/* DESKTOP RIGHT SIDE BUTTONS (from new code styling) */}
        <div className="hidden xl:flex items-center gap-5">
          <Link to="/order">
            <button
              className="px-6 py-2 rounded-full bg-white 
              text-[#8b5e3c] font-semibold shadow-lg hover:scale-105 transition border border-[#6f482a]"
            >
              Order Now
            </button>
          </Link>

          {user ? (
            <div className="flex items-center gap-5">
              {/* CART */}
              <Link to="/cart">
                <div className="relative">
                  <FaShoppingCart
                    size={26}
                    className="text-white hover:text-[#f3d2ae] transition"
                  />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs 
                      w-5 h-5 flex items-center justify-center rounded-full"
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* PROFILE */}
              <Link to="/profile">
                <div className="w-10 h-10 rounded-full overflow-hidden hover:scale-110 transition border-2 border-white/50">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#d78f52] text-white flex items-center justify-center text-lg font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ) : (
            <Link to="/login">
              <button
                className="px-6 py-2 rounded-full bg-white 
                text-[#8b5e3c] font-semibold shadow-lg hover:scale-105 transition border border-[#6f482a]"
              >
                Login Now
              </button>
            </Link>
          )}
        </div>

        {/* MOBILE MENU BUTTON (from new code styling) */}
        <button className="xl:hidden text-white hover:text-[#f3d2ae] transition" onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU (from new code styling) */}
      <div
        className={`xl:hidden bg-white/90 backdrop-blur-xl mt-3 rounded-2xl shadow-xl overflow-hidden 
        transition-all duration-500 ${open ? "max-h-[600px] py-4" : "max-h-0"}`}
      >
        <ul className="flex flex-col space-y-4 px-6 text-[#8b5e3c] font-semibold">
          {menuItems.map((item) =>
            item.dropdown ? (
              <details key={item.name} className="group" open={open}>
                <summary className="cursor-pointer flex justify-between items-center list-none">
                  {item.name}
                  <ChevronDown 
                    size={20} 
                    className="transition-transform group-open:rotate-180" 
                  />
                </summary>

                <div className="mt-2 flex flex-col space-y-2 pl-3 border-l-2 border-[#f3d2ae]">
                  {loading ? (
                    <div className="text-sm text-gray-500 py-1">
                      Loading...
                    </div>
                  ) : item.dropdown.length > 0 ? (
                    item.dropdown.map((d, index) => (
                      <Link
                        key={index}
                        to={d.path}
                        onClick={() => setOpen(false)}
                        className="text-sm hover:text-[#c57b41] transition py-1"
                      >
                        {d.label}
                      </Link>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 py-1">
                      No categories
                    </div>
                  )}
                </div>
              </details>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setOpen(false)}
                className="hover:text-[#c57b41] transition py-2"
              >
                {item.name}
              </Link>
            )
          )}

          {/* MOBILE AUTH & CART (from old code logic with new styling) */}
          <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
            {/* Quick Menu Links */}
            <div className="grid grid-cols-2 gap-2">
              <Link 
                to="/menu" 
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-center bg-[#f8e9dd] text-[#8b5e3c] rounded-lg hover:bg-[#f3d2ae] transition"
              >
                Browse Menu
              </Link>
              <Link 
                to="/cart" 
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-center bg-[#6f482a] text-white rounded-lg hover:bg-[#8b5e3c] transition"
              >
                View Cart ({cartCount})
              </Link>
            </div>

            {!user ? (
              <div className="flex gap-3">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1">
                  <button className="w-full px-6 py-2 rounded-full bg-white text-[#8b5e3c] font-semibold shadow hover:scale-105 transition border border-[#6f482a]">
                    Login
                  </button>
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="flex-1">
                  <button className="w-full px-6 py-2 rounded-full bg-gradient-to-r from-[#dda56a] to-[#e8b381] text-white font-semibold shadow hover:scale-105 transition">
                    Register
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-3">
                  <Link to="/profile" onClick={() => setOpen(false)}>
                    <div className="w-10 h-10 rounded-full overflow-hidden hover:scale-110 transition border-2 border-[#8b5e3c]">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#d78f52] text-white flex items-center justify-center text-lg font-bold">
                          {user?.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div>
                    <p className="font-semibold text-[#6f482a]">{user?.username}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <Link to="/cart" onClick={() => setOpen(false)}>
                  <div className="relative">
                    <FaShoppingCart
                      size={24}
                      className="text-[#6f482a] hover:text-[#c57b41] transition"
                    />
                    {cartCount > 0 && (
                      <span
                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs 
                        w-5 h-5 flex items-center justify-center rounded-full font-bold"
                      >
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            )}
          </div>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;