import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Star, Award } from "lucide-react";
import axios from "axios";
import { UserContext } from "../Context/UserContext";

export default function ProductPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser, cart, setCart } = useContext(UserContext);

  // Local wishlist state for UI
  const [wishlist, setWishlist] = useState(user?.wishlist || []);

  // Sync wishlist when user changes
  useEffect(() => {
    if (user?.wishlist) {
      setWishlist(user.wishlist);
    }
  }, [user]);

  // Check if product is liked
  const liked = product ? wishlist.some((item) => item.id === product.id) : false;

  // Fetch product from DB
  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      axios
        .get(`http://localhost:3005/products/${id}`)
        .then((response) => {
          setProduct(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching product:", err);
          setError("Failed to load product");
          setLoading(false);
        });
    }
  }, [id]);

  const handleBuyNow = (product) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate("/payment", { state: { product } });
  };

  // Add to Cart
  const handleAddToCart = (product) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    const updatedCart = existingItem
      ? cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...cart, { ...product, quantity: 1 }];

    setCart(updatedCart);
    
    // Show feedback
    alert("Product added to cart!");
  };

  // Toggle Wishlist
  const toggleWishlist = async (product) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const exists = wishlist.some((item) => item.id === product.id);
    const updatedWishlist = exists
      ? wishlist.filter((item) => item.id !== product.id)
      : [...wishlist, product];

    setWishlist(updatedWishlist);

    const updatedUser = { ...user, wishlist: updatedWishlist };
    setUser(updatedUser);

    try {
      await axios.patch(`http://localhost:3005/users/${user.id}`, {
        wishlist: updatedWishlist,
      });
    } catch (err) {
      console.error("Failed to update wishlist in DB:", err);
      // Revert on error
      setWishlist(user?.wishlist || []);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">{error || "Product not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Image Section */}
          <div className="flex flex-col">
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
              <div className="aspect-square flex items-center justify-center p-8">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/500?text=Image+Not+Available";
                  }}
                />
              </div>
              
              {/* Veg Icon */}
              <div className="absolute top-4 left-4 w-8 h-8 border-2 border-green-600 rounded-md flex items-center justify-center bg-white shadow-sm">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
              
              {/* Wishlist Button */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => toggleWishlist(product)}
                  className="p-2.5 bg-white rounded-full shadow-md hover:scale-110 transition-transform active:scale-95"
                  aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      liked ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Right - Product Details */}
          <div className="flex flex-col space-y-6">
            {/* Title & Subtitle */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              <p className="text-lg text-gray-600">{product.subtitle}</p>
            </div>

            {/* Rating (if available) */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({product.rating}/5)</span>
              </div>
            )}

            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-4xl lg:text-5xl font-bold text-gray-900">
                  ₹{product.currentPrice}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  ₹{product.originalPrice}
                </span>
                <span className="text-xl font-bold text-green-600">
                  {product.discount}
                </span>
              </div>
              <p className="text-sm text-gray-500">Inclusive of all taxes</p>
            </div>

            {/* Selected Flavor */}
            <div className="border-2 border-teal-500 rounded-xl p-4 bg-teal-50">
              <p className="text-gray-900">
                <span className="font-medium">Selected: </span>
                <span className="font-semibold">{product.subtitle}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-white border-2 border-gray-300 text-gray-900 font-semibold py-3.5 px-6 rounded-xl 
                  hover:bg-gray-50 hover:border-gray-400 active:scale-95 transition-all duration-150 text-base"
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleBuyNow(product)}
                className="w-full bg-teal-500 text-white font-bold py-3.5 px-6 rounded-xl 
                  hover:bg-teal-600 active:scale-95 transition-all duration-150 text-base shadow-md hover:shadow-lg"
              >
                BUY NOW
              </button>
            </div>

            {/* Features Section */}
            <div className="mt-6 space-y-4">
              <div className="flex gap-4 items-start bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="w-12 h-12 bg-white rounded-full flex-shrink-0 flex items-center justify-center border-2 border-gray-200 shadow-sm">
                  <Award className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-base">USA Patented</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Biozyme range proven for 50% higher protein absorption
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8 lg:p-12 border border-gray-200">
          <div className="max-w-4xl">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">About Prowell</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Prowell is a leading sports nutrition and wellness brand committed to empowering individuals on their fitness journey.
                With a focus on scientific innovation and quality, Prowell delivers premium supplements that help athletes and fitness
                enthusiasts achieve their health and performance goals.
              </p>
              <p>
                Founded with the vision of making world-class nutrition accessible, Prowell combines cutting-edge research with
                high-quality ingredients to create products that deliver real results. Every product undergoes rigorous testing to ensure
                purity, potency, and safety.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}