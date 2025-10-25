import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  /** ----------------- USER STATE ----------------- **/
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error("Failed to parse user from localStorage", err);
      return null;
    }
  });

  /** ----------------- CART STATE ----------------- **/
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (err) {
      console.error("Failed to parse cart from localStorage", err);
      return [];
    }
  });

  /** ----------------- WISHLIST STATE ----------------- **/
  const [wishlist, setWishlist] = useState([]);
  useEffect(() => {
    if (user?.wishlist) setWishlist(user.wishlist);
    else setWishlist([]);
  }, [user]);

  /** ----------------- SYNC TO LOCALSTORAGE + DB ----------------- **/
  useEffect(() => {
    try {
      if (user) {
        // Save user and cart when logged in
        localStorage.setItem("user", JSON.stringify({ ...user, wishlist }));
        localStorage.setItem("cart", JSON.stringify(cart));

        // Debounced DB update
        const timer = setTimeout(() => {
          axios
            .patch(`https://powell-895j.onrender.com/${user.id}`, { ...user, wishlist, cart })
            .then(() => console.log("Synced user data with DB"))
            .catch((err) => console.error("Failed to update user in DB", err));
        }, 500);

        return () => clearTimeout(timer);
      } else {
        // Remove cart and user from localStorage when logged out
        localStorage.removeItem("user");
        localStorage.removeItem("cart");
      }
    } catch (err) {
      console.error("Failed to sync user/cart to localStorage", err);
    }
  }, [user, wishlist, cart]);

  /** ----------------- LOAD USER DATA ON LOGIN ----------------- **/
  useEffect(() => {
    if (!user?.id) {
      setCart([]);
      setWishlist([]);
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await axios.get(`https://powell-895j.onrender.com/${user.id}`);
        setCart(res.data.cart || []);
        setWishlist(res.data.wishlist || []);
      } catch (err) {
        console.error("Failed to fetch user data from DB", err);
      }
    };

    fetchUserData();
  }, [user?.id]);

  /** ----------------- WISHLIST HELPERS ----------------- **/
  const addToWishlist = (item) => {
    if (!user) return;
    setWishlist((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const clearWishlist = () => setWishlist([]);

  /** ----------------- CART HELPERS ----------------- **/
  const addToCart = (item) => {
    if (!user) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  /** ----------------- LOGOUT ----------------- **/
  const logout = () => {
    setUser(null);
    setCart([]);
    setWishlist([]);
    // localStorage.removeItem("user");
    // localStorage.removeItem("cart");
    // handled by useEffect now
  };

  /** ----------------- PROVIDER ----------------- **/
  return (
    <UserContext.Provider
      value={{
        /** USER **/
        user,
        setUser,
        logout,

        /** CART **/
        cart,
        setCart,
        addToCart,
        removeFromCart,
        clearCart,

        /** WISHLIST **/
        wishlist,
        setWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
