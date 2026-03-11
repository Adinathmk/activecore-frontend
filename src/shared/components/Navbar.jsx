import { Search, Heart, ShoppingCart, User, Menu, X, LogOut, Package, User as UserIcon, LogIn } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { searchProducts } from '@/features/products/api/product.api';
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from '@/features/cart/hooks/useCart';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from "@/components/ui/sonner";
import SearchProductModal from './SearchProductModal';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { cart } = useCart();
  const { wishlistCount } = useWishlist();
  const { currentUser, logoutUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const profileModalRef = useRef(null);
  const searchModalRef = useRef(null);
  const navigate = useNavigate();

  const activeClass = "text-purple-600 font-medium";
  const inactiveClass = "text-gray-700 font-medium";

 useEffect(() => {
  const handleClickOutside = (event) => {
    if (profileModalRef.current && !profileModalRef.current.contains(event.target)) {
      setIsProfileModalOpen(false);
    }

    // Check if click is inside searchModalRef OR inside the portal modal (data attribute)
    const clickedInsideSearch = searchModalRef.current?.contains(event.target);
    const clickedInsidePortal = event.target.closest('[data-search-portal]');
    
    if (!clickedInsideSearch && !clickedInsidePortal) {
      setIsSearchOpen(false);
      setSearchValue('');
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  const handleSignOut = () => {
    logoutUser();
    setIsProfileModalOpen(false);
  };

  const handleProfileClick = () => {
    if (!currentUser) navigate('/login');
    else setIsProfileModalOpen(!isProfileModalOpen);
  };

  const handleProfile = () => {
    setIsProfileModalOpen(false);
    navigate('/profile');
  };

  const handleOrders = () => {
    setIsProfileModalOpen(false);
    navigate('/orders');
  };

  const handleLogin = () => navigate('/login');

  const getUserDisplayName = () => {
    if (!currentUser) return 'User';
    const name = `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim();
    if (name) return name;
    if (currentUser.email) return currentUser.email.split('@')[0];
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name === 'User') return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Left - Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-gray-900 tracking-tight cursor-pointer">Active Core</Link>
          </div>

          {/* Center - Categories */}
          <div className="hidden lg:flex items-center justify-center flex-1 max-w-2xl">
            <div className="flex items-center space-x-8">
              <NavLink to="/products/men" className={({ isActive }) => `group flex items-center space-x-1 px-3 py-2 text-sm transition-colors duration-300 ${isActive ? activeClass : inactiveClass}`}>Men</NavLink>
              <NavLink to="/products/women" className={({ isActive }) => `group flex items-center space-x-1 px-3 py-2 text-sm transition-colors duration-300 ${isActive ? activeClass : inactiveClass}`}>Women</NavLink>
              <NavLink to="/products/accessories" className={({ isActive }) => `group flex items-center space-x-1 px-3 py-2 text-sm transition-colors duration-300 ${isActive ? activeClass : inactiveClass}`}>Accessories</NavLink>
            </div>
          </div>

          {/* Right - Desktop Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">

            {/* Desktop Search */}
            <div className="hidden lg:block relative" ref={searchModalRef}>
              <div className={`flex items-center bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-2 py-2 overflow-hidden transition-all duration-300 ease-in-out ${isSearchOpen ? 'w-64 shadow-md' : 'w-10 hover:bg-gray-100'}`}>
                <Search
                  className="text-gray-500 flex-shrink-0 cursor-pointer transition-transform duration-300"
                  size={15}
                  onClick={() => setIsSearchOpen(true)}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className={`bg-transparent text-sm text-gray-700 placeholder-gray-500 focus:outline-none ml-2 transition-all duration-300 ${isSearchOpen ? 'opacity-100 w-full' : 'opacity-0 w-0'}`}
                  autoFocus={isSearchOpen}
                />
                {isSearchOpen && (
                  <button onClick={() => { setIsSearchOpen(false); setSearchValue(''); }} className="ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full flex-shrink-0">
                    <X size={18} />
                  </button>
                )}
              </div>
              {/* Portal-based modal — escapes navbar stacking context */}
              {isSearchOpen && searchValue && (
                <SearchProductModal
                  value={searchValue}
                  setIsSearchOpen={setIsSearchOpen}
                  anchorRef={searchModalRef}
                />
              )}
            </div>

            {/* Notifications */}
            {currentUser && <NotificationBell />}

            {/* Wishlist */}
            <button onClick={() => navigate('/wishlist')} className="cursor-pointer text-gray-600 hover:text-purple-600 transition-all duration-300 p-2 hover:bg-purple-50 rounded-lg relative group">
              <Heart size={22} className="group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg shadow-pink-500/40 ring-2 ring-white">{wishlistCount}</span>
            </button>

            {/* Cart */}
            <button onClick={() => navigate('/cart')} className="cursor-pointer text-gray-600 hover:text-purple-600 transition-all duration-300 p-2 hover:bg-purple-50 rounded-lg relative group">
              <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg shadow-purple-500/40 ring-2 ring-white">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
            </button>

            {/* Profile/Login */}
            <div className="relative hidden sm:block" ref={profileModalRef}>
              {currentUser ? (
                <>
                  <button onClick={handleProfileClick} className="cursor-pointer flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-all duration-300 px-3 py-2 hover:bg-purple-50 rounded-lg group">
                    <User size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium hidden xl:block">Account</span>
                  </button>

                  {isProfileModalOpen && (
                    <div className="absolute -right-4 sm:right-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-3 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center space-x-3">
                        {currentUser?.profile_image ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100">
                            <img src={currentUser.profile_image} alt="Profile" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {getUserInitials()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">Hello, {getUserDisplayName()}!</p>
                          <p className="text-xs text-gray-500 truncate mt-1">Welcome to Active Core</p>
                        </div>
                      </div>
                      <div className="py-2">
                        <button onClick={handleProfile} className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200">
                          <UserIcon size={18} className="text-gray-500" /> <span className="font-medium">Profile</span>
                        </button>
                        <button onClick={handleOrders} className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200">
                          <Package size={18} className="text-gray-500" /> <span className="font-medium">Orders</span>
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button onClick={handleSignOut} className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200">
                          <LogOut size={18} /> <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button onClick={handleLogin} className="cursor-pointer flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-all duration-300 px-3 py-2 hover:bg-purple-50 rounded-lg group">
                  <LogIn size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium hidden xl:block">Login</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden cursor-pointer text-gray-600 hover:text-purple-600 transition-all duration-300 p-2 hover:bg-purple-50 rounded-lg">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-50 animate-in slide-in-from-right duration-300 overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link to="/" className="text-2xl font-bold text-gray-900 tracking-tight cursor-pointer">Active Core</Link>
            <button onClick={() => setIsMenuOpen(false)} className="cursor-pointer text-gray-600 hover:text-gray-800 transition-colors p-2">
              <X size={28} />
            </button>
          </div>

          <div className="p-6 pb-32 space-y-8">
            {/* Mobile Search */}
            <div>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-4">
                <Search className="text-gray-500 flex-shrink-0" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setIsMobileSearchOpen(true)}
                  className="bg-transparent text-sm text-gray-700 placeholder-gray-500 focus:outline-none ml-3 w-full"
                />
                {searchValue && (
                  <button onClick={() => { setSearchValue(''); setIsMobileSearchOpen(false); }} className="ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full">
                    <X size={18} />
                  </button>
                )}
              </div>
              {isMobileSearchOpen && searchValue && (
                <MobileSearchResults
                  value={searchValue}
                  onSelect={() => {
                    setIsMenuOpen(false);
                    setIsMobileSearchOpen(false);
                    setSearchValue('');
                  }}
                />
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h3 className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Categories</h3>
              <NavLink to="/products/men" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `block px-5 py-4 rounded-2xl text-base font-medium transition-all duration-300 shadow-sm border border-gray-100 ${isActive ? activeClass : inactiveClass}`}>Men</NavLink>
              <NavLink to="/products/women" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `block px-5 py-4 rounded-2xl text-base font-medium transition-all duration-300 shadow-sm border border-gray-100 ${isActive ? activeClass : inactiveClass}`}>Women</NavLink>
              <NavLink to="/products/accessories" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `block px-5 py-4 rounded-2xl text-base font-medium transition-all duration-300 shadow-sm border border-gray-100 ${isActive ? activeClass : inactiveClass}`}>Accessories</NavLink>
            </div>

            {/* Profile Options */}
            <div className="space-y-2">
              <h3 className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Account</h3>
              {currentUser ? (
                <>
                  <div className="px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 mb-3 flex items-center space-x-3">
                    {currentUser?.profile_image ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                        <img src={currentUser.profile_image} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {getUserInitials()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Hello, {getUserDisplayName()}!</p>
                      <p className="text-xs text-gray-500 mt-1">Welcome to Active Core</p>
                    </div>
                  </div>
                  <button onClick={() => { setIsMenuOpen(false); navigate('/profile'); }} className="w-full flex items-center space-x-3 px-5 py-4 rounded-2xl text-base font-medium text-gray-700 shadow-sm border border-gray-100 hover:text-purple-600 hover:border-purple-200">
                    <UserIcon size={20} /> <span>Profile</span>
                  </button>
                  <button onClick={() => { setIsMenuOpen(false); navigate('/orders'); }} className="w-full flex items-center space-x-3 px-5 py-4 rounded-2xl text-base font-medium text-gray-700 shadow-sm border border-gray-100 hover:text-purple-600 hover:border-purple-200">
                    <Package size={20} /> <span>Orders</span>
                  </button>
                  <button onClick={() => { setIsMenuOpen(false); handleSignOut(); }} className="w-full flex items-center space-x-3 px-5 py-4 rounded-2xl text-base font-medium text-red-600 shadow-sm border border-gray-100 hover:bg-red-50 hover:border-red-200">
                    <LogOut size={20} /> <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="w-full flex items-center space-x-3 px-5 py-4 rounded-2xl text-base font-medium text-gray-700 shadow-sm border border-gray-100 hover:text-purple-600 hover:border-purple-200">
                  <LogIn size={20} /> <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ── Inline mobile search results ── */
function MobileSearchResults({ value, onSelect }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!value.trim()) { setProducts([]); return; }
    const delay = setTimeout(async () => {
      try {
        setIsLoading(true);
        const data = await searchProducts(value, 10);
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [value]);

  const handleProductClick = (slug) => {
    // Navigate first — before any state changes unmount this component
    navigate(`/product/${slug}`);
    // Then clean up the menu state after a tiny delay
    setTimeout(() => {
      onSelect();
    }, 50);
  };

  if (isLoading) return (
    <div className="mt-2 space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100">
          <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!products.length) return (
    <p className="mt-3 text-center text-sm text-gray-400">No products found</p>
  );

  return (
    <div className="mt-2 space-y-2">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => handleProductClick(product.slug)}
          className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
            {product.primary_image
              ? <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No img</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{product.name}</p>
            <p className="text-xs text-gray-500">{product.product_type}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-gray-900">₹{product.price}</p>
            <p className={`text-xs ${product.in_stock ? 'text-green-600' : 'text-red-500'}`}>
              {product.in_stock ? 'In Stock' : 'Sold Out'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}