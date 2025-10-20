
import Navbar from './components/navbar'
import {BrowserRouter as Router, Route , Routes , Navigate} from "react-router-dom";
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
import { UserContext } from "./Context/UserContext.jsx";
import { useContext } from "react";
import SearchResults from "./pages/SearchResults";


function App() {
 const { user } = useContext(UserContext);

  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path={"/"} element={<Home />} />
        <Route path={"/auth"} element={<Auth/>}/>
        <Route path={"/Products"} element = {<AllProducts/>}/>
        <Route path="/cart" element={<ProtectedRoute> 
                                       <Cart />
                                    </ProtectedRoute>}/>
      <Route path="/wishlist" element={<ProtectedRoute>
                                        <Wishlist />
                                      </ProtectedRoute> }/>
        <Route path={"/productpage/:id"} element = {<ProductPage/>}/>
        <Route path={"/orders"} element ={<Orders/>}/>
        <Route path={"/signup"} element = {<Signup/>}/>
        <Route path="/search" element={<SearchResults />} />
        <Route path={"/payment"} element = {<Payment/>}/>
        <Route path={"/login"} element = {<Login/>}/>
        <Route path={'/profile'} element={<UserProfile/>}/>
      </Routes>
    </Router>
  )
}

export default App
