import React, { useState, useContext } from "react";
import { useLocation } from "react-router-dom";

import { 
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  MapPin,
  User,
  Phone,
  Home,
  Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import axios from "axios";

const Payment = () => {
  const { user, cart, setCart, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  
  // Address form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");

  // If Buy Now, paymentItems = single product; else full cart
  const paymentItems = location.state?.product
    ? [{ ...location.state.product, quantity: 1 }]
    : cart;
  
  // Calculate totals
  const subtotal = paymentItems.reduce((acc, item) => acc + (item.currentPrice * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 40;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  // Handle order placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate order processing
    setTimeout(async () => {
      setIsProcessing(false);
      
      // Generate order ID
      const newOrderId = Math.random().toString(36).substr(2, 9).toUpperCase();
      setOrderId(newOrderId);
      setOrderTotal(total);
      
      // Create order object
      const order = {
        orderId: newOrderId,
        items: paymentItems,
        shippingAddress: {
          fullName,
          phone,
          addressLine1,
          addressLine2,
          landmark,
          city,
          state,
          pincode
        },
        paymentMethod: "Cash on Delivery",
        subtotal,
        shipping,
        tax,
        total,
        orderDate: new Date().toISOString(),
        status: "Processing"
      };

      // Save order to DB
      try {
        // Fetch current user data
        const userResponse = await axios.get(`http://localhost:3005/users/${user.id}`);
        const currentOrders = userResponse.data.orders || [];
        
        // Add new order to orders array
        const updatedOrders = [...currentOrders, order];
        
        // Update user with new order
        await axios.patch(`http://localhost:3005/users/${user.id}`, {
          orders: updatedOrders,
          // Only clear cart if order came from cart page (not Buy Now)
          ...((!location.state?.product) && { cart: [] })
        });

        // Update local user state
        const updatedUser = {
          ...user,
          orders: updatedOrders,
          ...((!location.state?.product) && { cart: [] })
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Clear cart in context if order came from cart
        if (!location.state?.product) {
          setCart([]);
          localStorage.setItem("cart", JSON.stringify([]));
        }

        setPaymentSuccess(true);

        // Redirect to home after showing success
        setTimeout(() => {
          navigate("/");
        }, 3000);

      } catch (err) {
        console.error("Failed to save order:", err);
        alert("Failed to place order. Please try again.");
        setIsProcessing(false);
      }
    }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to proceed with your order.</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  // Check if there are items to purchase (either from cart or Buy Now)
  if (paymentItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Items to Purchase</h2>
          <p className="text-gray-600 mb-6">Add items to cart before placing an order.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Order Success Screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="text-center p-10 bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-2">Your order will be delivered soon.</p>
          <p className="text-sm text-gray-500 mb-4">
            Order ID: #{orderId}
          </p>
          <div className="bg-teal-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-teal-700 font-semibold mb-1">Cash on Delivery</p>
            <p className="text-2xl font-bold text-teal-600">
              ₹{orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Please keep the exact amount ready for delivery.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(location.state?.product ? -1 : "/cart")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          {location.state?.product ? "Back to Product" : "Back to Cart"}
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Delivery Address Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
                  <p className="text-sm text-gray-600">Enter your delivery details</p>
                </div>
              </div>

              {/* Address Form */}
              <form onSubmit={handlePlaceOrder}>
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline w-4 h-4 mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Address Line 1 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Home className="inline w-4 h-4 mr-1" />
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="House No., Building Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Road Name, Area, Colony"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Nearby landmark"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* City, State, Pincode Grid */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                        placeholder="6-digit pincode"
                        maxLength="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery Section */}
                <div className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Cash on Delivery</h3>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount to be paid:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
                  <br />
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                  <p className="text-sm text-yellow-700 font-medium">
                    ⚠️ Online payment is not available now. Only Cash on Delivery is supported.
                  </p>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full mt-6 flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all shadow-lg ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transform hover:scale-105"
                  } text-white`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Package size={20} />
                      Place Order - ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <OrderSummary
              paymentItems={paymentItems}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Summary Component
const OrderSummary = ({ paymentItems, subtotal, shipping, tax, total }) => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
    <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
    
    {/* Cart Items */}
    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
      {paymentItems.map((item) => (
        <div key={item.id} className="flex gap-3">
          <img
            src={item.image}
            alt={item.title}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
            <p className="text-sm font-semibold text-gray-900">
              ₹{(item.currentPrice * item.quantity).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      ))}
    </div>

    <div className="border-t border-gray-200 pt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Shipping</span>
        <span className="font-medium text-gray-900">
          {shipping === 0 ? "FREE" : `₹${shipping}`}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Tax (18% GST)</span>
        <span className="font-medium text-gray-900">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="border-t border-gray-200 pt-2 mt-2">
        <div className="flex justify-between">
          <span className="text-base font-semibold text-gray-900">Total (COD)</span>
          <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>

    {shipping === 0 && (
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <p className="text-xs text-green-700 font-medium">
          🎉 You're eligible for FREE shipping!
        </p>
      </div>
    )}

  </div>
);

export default Payment;