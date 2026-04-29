// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import API from '../api';

// const AppContext = createContext();

// export const AppProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     const u = localStorage.getItem('user');
//     return u ? JSON.parse(u) : null;
//   });
//   const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
//   const [cartLoading, setCartLoading] = useState(false);

//   // const login = (userData, token) => {
//   //   localStorage.setItem('token', token);
//   //   localStorage.setItem('user', JSON.stringify(userData));
//   //   setUser(userData);
//   // };
// const login = (userData, token) => {
//   localStorage.setItem('token', token);
//   localStorage.setItem('user', JSON.stringify(userData));
//   setUser(userData);
//   window.location.href = '/';
// }; 
//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUser(null);
//     setCart({ items: [], total: 0, count: 0 });
//   };

//   const fetchCart = useCallback(async () => {
//     if (!user) return;
//     setCartLoading(true);
//     try {
//       const { data } = await API.get('/cart');
//       setCart(data);
//     } catch (err) {
//       console.error('Cart fetch error:', err);
//     } finally {
//       setCartLoading(false);
//     }
//   }, [user]);

//   const addToCart = async (productId, quantity = 1) => {
//     await API.post('/cart', { product_id: productId, quantity });
//     await fetchCart();
//   };

//   const updateCartItem = async (itemId, quantity) => {
//     await API.put(`/cart/${itemId}`, { quantity });
//     await fetchCart();
//   };

//   const removeFromCart = async (itemId) => {
//     await API.delete(`/cart/${itemId}`);
//     await fetchCart();
//   };

//   const clearCart = async () => {
//     await API.delete('/cart');
//     setCart({ items: [], total: 0, count: 0 });
//   };

//   const addToWishlist = async (productId) => {
//     await API.post('/wishlist', { product_id: productId });
//   };

//   const removeFromWishlist = async (productId) => {
//     await API.delete(`/wishlist/${productId}`);
//   };

//   const checkWishlist = async (productId) => {
//     const { data } = await API.get(`/wishlist/check/${productId}`);
//     return data.inWishlist;
//   };

//   useEffect(() => {
//     fetchCart();
//   }, [fetchCart]);

//   return (
//     <AppContext.Provider value={{
//       user, login, logout,
//       cart, cartLoading, fetchCart, addToCart, updateCartItem, removeFromCart, clearCart,
//       addToWishlist, removeFromWishlist, checkWishlist
//     }}>
//       {children}
//     </AppContext.Provider>
//   );
// };

// export const useApp = () => useContext(AppContext);





// new code for context file
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [cartLoading, setCartLoading] = useState(false);

  // Page load pe token check karo
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCart({ items: [], total: 0, count: 0 });
  };

  const fetchCart = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    setCartLoading(true);
    try {
      const { data } = await API.get('/cart');
      setCart(data);
    } catch (err) {
      console.error('Cart fetch error:', err);
    } finally {
      setCartLoading(false);
    }
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    await API.post('/cart', { product_id: productId, quantity });
    await fetchCart();
  };

  const updateCartItem = async (itemId, quantity) => {
    await API.put(`/cart/${itemId}`, { quantity });
    await fetchCart();
  };

  const removeFromCart = async (itemId) => {
    await API.delete(`/cart/${itemId}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await API.delete('/cart');
    setCart({ items: [], total: 0, count: 0 });
  };

  const addToWishlist = async (productId) => {
    await API.post('/wishlist', { product_id: productId });
  };

  const removeFromWishlist = async (productId) => {
    await API.delete(`/wishlist/${productId}`);
  };

  const checkWishlist = async (productId) => {
    const { data } = await API.get(`/wishlist/check/${productId}`);
    return data.inWishlist;
  };

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      cart, cartLoading, fetchCart, addToCart, updateCartItem, removeFromCart, clearCart,
      addToWishlist, removeFromWishlist, checkWishlist
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);