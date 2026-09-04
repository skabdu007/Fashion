import { Suspense, lazy } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import RouteAnimator from "./components/ui/RouteAnimator";
import PageTransition from "./components/ui/PageTransition";
import LoadingSpinner from "./components/ui/LoadingSpinner";
const Home = lazy(() => import("./pages/Home"));
import AddCustomer from "./pages/customer/AddCustomer";
import AllCustomers from "./pages/customer/AllCustomers";
import BlockedCustomers from "./pages/customer/BlockedCustomers";
import CustomerAnalytics from "./pages/customer/CustomerAnalytics";
import Dashboard from "./pages/customer/Dashboard";
import Profile from "./pages/customer/Profile";
import SearchCustomer from "./pages/customer/SearchCustomer";
import UpdateCustomer from "./pages/customer/UpdateCustomer";
import CustomerDashboard from "./pages/customer/customerDashboard";
import CustomerLogin from "./pages/customer/customerlogin";
import CustomerRegister from "./pages/customer/customerregister";
import Wallet from "./pages/wallet/wallet";
const AddMoney = lazy(() => import("./pages/wallet/AddMoney"));
const WalletBalance = lazy(() => import("./pages/wallet/WalletBalance"));
const WalletHistory = lazy(() => import("./pages/wallet/WalletHistory"));
const BankAccount = lazy(() => import("./pages/wallet/BankAccount"));
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminRegister from "./pages/admin/AdminRegister";
import AddVendor from "./pages/vendor/AddVendor";
import AllVendors from "./pages/vendor/AllVendors";
import BlockedVendors from "./pages/vendor/BlockedVendors";
import SearchVendor from "./pages/vendor/SearchVendor";
import UpdateVendor from "./pages/vendor/UpdateVendor";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";
import VendorApproval from "./pages/vendor/VendorApproval";
import VendorDashboard from "./pages/vendor/Dashboard";
import VendorPanel from "./pages/vendor/vendorDashboard";
import VendorInventory from "./pages/vendor/VendorInventory";
import VendorProfile from "./pages/vendor/VendorProfile";
import VendorLogin from "./pages/vendor/vendorlogin";
import VendorRegister from "./pages/vendor/vendorregister";
import Cart from "./pages/cart/cart";
import Category from "./pages/category/Category";
import AddCategory from "./pages/category/addcategory";
const Orders = lazy(() => import("./pages/orders/orders"));
import Subscription from "./pages/Subscription/Subscription";
import Payment from "./pages/payment/payment";
import PaymentFailed from "./pages/payment/PaymentFailed";
import PaymentProcessing from "./pages/payment/PaymentProcessing";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import ShopCheckout from "./pages/checkout/Checkout";
import AllOrders from "./pages/orders/AllOrders";
import CancelledOrders from "./pages/orders/CancelledOrders";
import CancelOrder from "./pages/orders/CancelOrder";
import OrderAnalytics from "./pages/orders/OrderAnalytics";
import OrderCheckout from "./pages/orders/Checkout";
import OrderDashboard from "./pages/orders/OrderDashboard";
import OrderDetails from "./pages/orders/OrderDetails";
import OrderSuccess from "./pages/orders/OrderSuccess";
import UpdateOrderStatus from "./pages/orders/UpdateOrderStatus";
import VendorOrderDetails from "./pages/orders/VendorOrderDetails";
import VendorOrders from "./pages/orders/VendorOrders";
import VendorSalesAnalytics from "./pages/orders/VendorSalesAnalytics";
import Notifications from "./pages/notification/notification";
import AddProduct from "./pages/Product/AddProduct";
import AllProduct from "./pages/Product/AllProduct";
import LowStockProducts from "./pages/Product/LowStockProducts";
import ProductAnalytics from "./pages/Product/ProductAnalytics";
import ProductDashboard from "./pages/Product/ProductDashboard";
const ProductDetails = lazy(() => import("./pages/Product/ProductDetails"));
import TopRatedProducts from "./pages/Product/TopRatedProducts";
import TopSellingProducts from "./pages/Product/TopSellingProducts";
import UpdateProduct from "./pages/Product/UpdateProduct";
import AuctionDashboard from "./pages/auction/AuctionDashboard";
const AuctionAddProduct = lazy(() => import("./pages/auction/AddProduct"));
import AuctionLiveDashboard from "./pages/auction/AuctionLiveDashboard";
const AuctionProductLimit = lazy(() => import("./pages/auction/AuctionProductLimit"));
const AuctionProductSelection = lazy(() => import("./pages/auction/AuctionProductSelection"));
const CreateAuctionRoom = lazy(() => import("./pages/auction/CreateAuctionRoom"));
import Hosting from "./pages/auction/Hosting";
import HostingManager from "./pages/auction/HostingManager";
import LiveBidding from "./pages/auction/livebidding";
import RoomsList from "./pages/auction/RoomsList";
import WinnerList from "./pages/auction/winnerlist";
import AuctionUserPage from "./pages/auction/AuctionUserPage";
import JoinRoom from "./pages/auction/JoinRoom";
import WinnerPage from "./pages/auction/WinnerPage";

const renderLazy = (element) => (
  <Suspense fallback={<div className="shop-shell"><div className="shop-container"><LoadingSpinner centered label="Loading page..." /></div></div>}>
    {element}
  </Suspense>
);

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <RouteAnimator>
          <Route path="/" element={<PageTransition>{renderLazy(<Home />)}</PageTransition>} />
          <Route path="/customer/login" element={<PageTransition><CustomerLogin /></PageTransition>} />
          <Route path="/customer/register" element={<PageTransition><CustomerRegister /></PageTransition>} />
          <Route path="/customer/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/customer/dashboard" element={<PageTransition><CustomerDashboard /></PageTransition>} />
          <Route path="/admin/customers" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/admin/customers/all" element={<PageTransition><AllCustomers /></PageTransition>} />
          <Route path="/admin/customers/add" element={<PageTransition><AddCustomer /></PageTransition>} />
          <Route path="/admin/customers/update/:id" element={<PageTransition><UpdateCustomer /></PageTransition>} />
          <Route path="/subscriptions"element={<PageTransition><Subscription /></PageTransition>}/>
          <Route path="/admin/customers/blocked" element={<PageTransition><BlockedCustomers /></PageTransition>} />
          <Route path="/admin/customers/analytics" element={<PageTransition><CustomerAnalytics /></PageTransition>} />
          <Route path="/admin/customers/search" element={<PageTransition><SearchCustomer /></PageTransition>} />
          <Route path="/wallet" element={<PageTransition><Wallet /></PageTransition>} />
          <Route path="/wallet/add-money" element={<PageTransition>{renderLazy(<AddMoney />)}</PageTransition>} />
          <Route path="/wallet/history" element={<PageTransition>{renderLazy(<WalletHistory />)}</PageTransition>} />
          <Route path="/wallet/walletbalance" element={<PageTransition>{renderLazy(<WalletBalance />)}</PageTransition>} />
          <Route path="/wallet/bank-account" element={<PageTransition><ProtectedRoute>{renderLazy(<BankAccount />)}</ProtectedRoute></PageTransition>} />
          <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path="/admin/register" element={<PageTransition><AdminRegister /></PageTransition>} />
          <Route path="/admin/dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="/admin/profile" element={<PageTransition><AdminProfile /></PageTransition>} />
          <Route path="/admin/category" element={<PageTransition><AddCategory /></PageTransition>} />
          <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
          <Route path="/admin/orders-dashboard" element={<PageTransition><OrderDashboard /></PageTransition>} />
          <Route path="/admin/orders" element={<PageTransition><AllOrders /></PageTransition>} />
          <Route path="/admin/orders/manage" element={<PageTransition><AdminOrders /></PageTransition>} />
          <Route path="/admin/orders/update/:id" element={<PageTransition><UpdateOrderStatus /></PageTransition>} />
          <Route path="/admin/orders/analytics" element={<PageTransition><OrderAnalytics /></PageTransition>} />
          <Route path="/admin/order/:id" element={<PageTransition><OrderDetails /></PageTransition>} />
          <Route path="/admin/orders/cancelled" element={<PageTransition><CancelledOrders /></PageTransition>} />
          <Route path="/order/:id" element={<PageTransition><OrderDetails /></PageTransition>} />
          <Route path="/orders/checkout" element={<PageTransition><OrderCheckout /></PageTransition>} />
          <Route path="/order-success" element={<PageTransition><OrderSuccess /></PageTransition>} />
          <Route path="/order/cancel/:id" element={<PageTransition><CancelOrder /></PageTransition>} />
          <Route path="/vendor/orders" element={<PageTransition><VendorOrders /></PageTransition>} />
          <Route path="/vendor/order/:id" element={<PageTransition><VendorOrderDetails /></PageTransition>} />
          <Route path="/vendor/sales-analytics" element={<PageTransition><VendorSalesAnalytics /></PageTransition>} />
          <Route path="/admin/vendors" element={<PageTransition><VendorDashboard /></PageTransition>} />
          <Route path="/admin/vendors/all" element={<PageTransition><AllVendors /></PageTransition>} />
          <Route path="/admin/vendors/add" element={<PageTransition><AddVendor /></PageTransition>} />
          <Route path="/admin/vendors/update/:id" element={<PageTransition><UpdateVendor /></PageTransition>} />
          <Route path="/admin/vendors/search" element={<PageTransition><SearchVendor /></PageTransition>} />
          <Route path="/admin/vendors/analytics" element={<PageTransition><VendorAnalytics /></PageTransition>} />
          <Route path="/admin/vendor-approval" element={<PageTransition><VendorApproval /></PageTransition>} />
          <Route path="/admin/vendors/blocked" element={<PageTransition><BlockedVendors /></PageTransition>} />
          <Route path="/admin/productDashboard" element={<PageTransition><ProductDashboard /></PageTransition>} />
          <Route path="/admin/products/add" element={<PageTransition><AddProduct /></PageTransition>} />
          <Route path="/admin/products/all" element={<PageTransition><AllProduct /></PageTransition>} />
          <Route path="/admin/products/update/:id" element={<PageTransition><UpdateProduct /></PageTransition>} />
          <Route path="/admin/products/top-selling" element={<PageTransition><TopSellingProducts /></PageTransition>} />
          <Route path="/admin/products/top-rated" element={<PageTransition><TopRatedProducts /></PageTransition>} />
          <Route path="/admin/products/low-stock" element={<PageTransition><LowStockProducts /></PageTransition>} />
          <Route path="/admin/products/analytics" element={<PageTransition><ProductAnalytics /></PageTransition>} />
          <Route path="/products/:id" element={<PageTransition>{renderLazy(<ProductDetails />)}</PageTransition>} />
          <Route path="/vendor/login" element={<PageTransition><VendorLogin /></PageTransition>} />
          <Route path="/vendor/register" element={<PageTransition><VendorRegister /></PageTransition>} />
          <Route path="/vendor/dashboard" element={<PageTransition><VendorPanel /></PageTransition>} />
          <Route path="/vendor/profile" element={<PageTransition><VendorProfile /></PageTransition>} />
          <Route path="/vendor/inventory" element={<PageTransition><VendorInventory /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
          <Route path="/orders" element={<PageTransition>{renderLazy(<Orders />)}</PageTransition>} />
          <Route path="/category" element={<PageTransition><Category /></PageTransition>} />
          <Route path="/subscription" element={<PageTransition><Subscription /></PageTransition>} />
          <Route path="/checkout" element={<PageTransition><ShopCheckout /></PageTransition>} />
          <Route path="/payment" element={<PageTransition><Payment /></PageTransition>} />
          <Route path="/payment/processing" element={<PageTransition><PaymentProcessing /></PageTransition>} />
          <Route path="/payment/success" element={<PageTransition><PaymentSuccess /></PageTransition>} />
          <Route path="/payment/failed" element={<PageTransition><PaymentFailed /></PageTransition>} />
          <Route path="/admin/auction-dashboard" element={<PageTransition><AuctionDashboard /></PageTransition>} />
          <Route path="/admin/auction/limit" element={<PageTransition><ProtectedRoute role="SUPER_ADMIN">{renderLazy(<AuctionProductLimit />)}</ProtectedRoute></PageTransition>} />
          <Route path="/admin/auction/add-product" element={<PageTransition><ProtectedRoute role="SUPER_ADMIN">{renderLazy(<AuctionAddProduct />)}</ProtectedRoute></PageTransition>} />
          <Route path="/admin/auction/select-products" element={<PageTransition><ProtectedRoute role="SUPER_ADMIN">{renderLazy(<AuctionProductSelection />)}</ProtectedRoute></PageTransition>} />
          <Route path="/admin/create-auction-room" element={<PageTransition><ProtectedRoute role="SUPER_ADMIN">{renderLazy(<CreateAuctionRoom />)}</ProtectedRoute></PageTransition>} />
          <Route path="/admin/rooms" element={<PageTransition><RoomsList /></PageTransition>} />
          <Route path="/admin/hosting" element={<PageTransition><Hosting /></PageTransition>} />
          <Route path="/admin/live-bidding" element={<PageTransition><LiveBidding /></PageTransition>} />
          <Route path="/admin/winners" element={<PageTransition><WinnerList /></PageTransition>} />
          <Route path="/admin/live-auction/:auction_id" element={<PageTransition><AuctionLiveDashboard /></PageTransition>} />
          <Route path="/admin/hosting-manager" element={<PageTransition><HostingManager /></PageTransition>} />
          <Route path="/auction/join" element={<PageTransition><JoinRoom /></PageTransition>} />
          <Route path="/auction/winner/:auction_id" element={<PageTransition><WinnerPage /></PageTransition>} />
          <Route path="/auction/:auction_id" element={<PageTransition><AuctionUserPage /></PageTransition>} />
          <Route path="*" element={<PageTransition><h2 style={{ padding: "40px" }}>404 - Page Not Found</h2></PageTransition>} />
        </RouteAnimator>
      </AppShell>
    </BrowserRouter>
  );
}
