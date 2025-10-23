import Navbar from './components/navbar'
import {BrowserRouter as Router, Route , Routes , Navigate , Outlet} from "react-router-dom";
import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import Wishlist from './pages/WishList';
import Cart from './pages/Cart';
import ProductPage from './pages/ProductPage';
import ProtectedRoute from './components/ProtectedRouter.jsx';
import Signup from './pages/Authentication/Singup';
import Login from './pages/Authentication/Login';
import Auth from './pages/Authentication/Auth';
import UserProfile from './pages/UserProfile';
import Payment from './pages/Payment.jsx';
import Orders from "./pages/Orders.jsx"
import SearchResults from "./pages/SearchResults";

{/* ---------- Admin layout (no Navbar) ---------- */}

import Admin from './Admin/Admin.jsx';



// Layout that includes the navbar
function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* renders the nested route */}
    </>
  );
}

// Layout without navbar (for admin)
function AdminLayout() {
  return <Outlet />;
}

function App() {
  return (
   <Router>
      <Routes>

        {/* ---------- Main layout with Navbar ---------- */}

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth/>}/>
          <Route path="/products" element={<AllProducts />} />
          <Route path="/cart" element={
                                        <ProtectedRoute>
                                          <Cart />
                                        </ProtectedRoute>
                                      }/>
          <Route path="/wishlist" element={
                                            <ProtectedRoute>
                                              <Wishlist />
                                            </ProtectedRoute>
                                          }/>
          <Route path="/productpage/:id" element={<ProductPage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* ---------- Admin layout (no Navbar) ---------- */}
        
        <Route element={<AdminLayout />}>

          <Route path="/admin" element={    <ProtectedRoute>
                                              <Admin/>
                                            </ProtectedRoute>}/>
                        
        </Route>

      </Routes>
    </Router>
  )
}

export default App
