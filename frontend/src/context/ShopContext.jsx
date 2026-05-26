import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const ShopContext = createContext();

const friendlyError = (error) => {
  if (!error.response) return 'Connection error. Please check your internet.'
  if (error.response.status === 401) return 'Please log in to continue.'
  if (error.response.status >= 500) return 'Something went wrong. Please try again.'
  return error.response?.data?.message || 'An error occurred.'
}

const ShopContextProvider = (props) => {
  const currency = '₨';
  const delivery_fee = 200;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (!savedCart) return {};
    const parsed = JSON.parse(savedCart);
    const isNested = Object.values(parsed).some(v => typeof v === 'object' && v !== null);
    return isNested ? {} : parsed;
  });

  const [products, setProducts] = useState([]);
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const addToCart = async (itemId, qty = 1) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = (cartData[itemId] || 0) + qty;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(backendUrl + '/api/cart/add', { itemId }, { headers: { token } });
      } catch (error) {
        toast.error(friendlyError(error));
      }
    }
  };

  const getCartCount = () => {
    return Object.values(cartItems).reduce((sum, qty) => sum + (qty > 0 ? qty : 0), 0);
  };

  const updateQuantity = async (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(backendUrl + '/api/cart/update', { itemId, quantity }, { headers: { token } });
      } catch (error) {
        toast.error(friendlyError(error));
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = products.find(product => product._id === itemId);
      if (cartItems[itemId] > 0 && itemInfo) {
        totalAmount += itemInfo.price * cartItems[itemId];
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token } });
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (!token && localStorage.getItem('token')) {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    token,
    setToken,
    user,
    setUser
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
