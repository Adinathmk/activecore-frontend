import React, { useState, useEffect } from 'react';
import { Heart, Share2, Truck, Shield, RotateCcw, Star, Check, ShoppingBag, ArrowLeft, ChevronRight ,ArrowRight,TruckIcon} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import CheckoutModal from '../components/BuyingModal';
import { useAuth } from '../contexts/AuthContext';

const ProductDetails = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { id } = useParams();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { handleAddToCart, getCartItem,removeFromCart, isInCart } = useCart();  
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [product,SetProduct]=useState({})
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

 useEffect(() => {
  const fetchProduct = async () => {
    try {
      const { data } = await axiosInstance.get(`/products?id=${id}`);
      SetProduct(data[0]);
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  };

  if (id) fetchProduct(); // call only if id exists
}, [id]); 
 
  const isWishlisted = isInWishlist(product.id);
  const cartItem = getCartItem(product.id);
  const isInCartItem = isInCart(product.id);
  const itemCount = cartItem?.quantity || 0;

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handleWishlistClick = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCartClick = () => {
    if(isInCartItem){
        removeFromCart(product.id)  
        return      
    }
    handleAddToCart(product);
  };

  const handleBuyNowClick = () => {
    if(!currentUser){
        toast.info('Please login before buying');
        return;
    }   

    if(!selectedSize&&product.category!=='accessories'){
        toast.info('Select size before buying');
        return;
    }    
    setIsCheckoutOpen(true)
  };

  const getButtonText = () => {
    if (!isInCartItem) {
      return "Add to Cart";
    }
    return itemCount === 1 ? "Added to Cart" :'';
  };

  const getButtonIcon = () => {
    if (!isInCartItem) {
      return <ShoppingBag className="w-5 h-5" />;
    }
    return itemCount === 1 ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">   
     <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={[{...product,quantity:quantity}]}
        totalAmount={((product.price * quantity)+((product.price * quantity)* 0.18))}
      />  
      

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          {/* Product Images */}
          <div className="space-y-8">
            
            {/* Main Image */}
            <div className="relative aspect-[8/9] overflow-hidden bg-gray-50 rounded-lg">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              
              {/* Wishlist Button */}
              <button
                onClick={handleWishlistClick}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-sm transition-all ease-in-out`}
              >
               <Heart 
                className={`w-7 h-7 transition ${
                    isWishlisted 
                    ? 'fill-red-500 text-red-500 ' 
                    : 'text-gray-800 hover:fill-gray-800 '
                }`} 
                />
              </button>
                <button
                onClick={()=>setActiveImage((prev)=>(prev-1+product.images.length)%product.images.length)}
                className=" absolute left-7 top-1/2 cursor-pointer transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
                >
                <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                onClick={()=>setActiveImage((prev)=>(prev+1)%product.images.length)}
                className="absolute right-7 cursor-pointer top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
                >
                <ArrowRight className="h-5 w-5" />
                </button>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`aspect-square cursor-pointer overflow-hidden bg-gray-50 rounded-lg border-2 transition-all ${
                    activeImage === index 
                      ? 'border-gray-900 ring-2 ring-gray-900 ring-opacity-10' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
                

            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-light tracking-tight text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600 mt-3 font-light">{product.category}</p>
              </div>
              

              {/* Rating  */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 font-light">
                    {product.rating} ({product.reviews.toLocaleString()} reviews)
                  </span>
                </div>
                
                {/* Badges */}
                <div className="flex items-center space-x-3">
                {product.isNewArrival && (
                    <span className="bg-black text-white text-xs tracking-wider font-light px-4 py-2 uppercase">
                    New Arrival
                    </span>
                )}
                {product.isTopSelling && (
                    <span className="bg-black text-white text-xs tracking-wider font-light px-4 py-2 uppercase">
                    Best seller
                    </span>
                )}
                </div>
        
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-light text-gray-900">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.price >= product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through font-light">
                      ₹{product.prevPrice.toLocaleString()}
                    </span>
                    <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded font-light">
                      Save ₹{(product.prevPrice - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed font-light text-lg border-t border-gray-100 pt-6">
              {product.description}
            </p>

            {/* Features */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-light text-gray-900 mb-4">Key Features</h3>
              <ul className="space-y-3">
                {product.features?.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600 font-light">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-4"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Size Selection */}
            {product.category!=='accessories'&&< div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-light text-gray-900">Size</h3>
                 <div className="flex  gap-5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-4 border transition-all font-light rounded-lg ${
                      selectedSize === size
                        ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              </div>
             
            </div>}

            {/* Buy now section*/}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex space-x-4">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-6 py-4 text-gray-600 hover:text-gray-900 transition-colors font-light hover:bg-gray-50 rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="px-6 py-4 text-gray-900 font-light min-w-[60px] text-center bg-gray-50">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-6 py-4 text-gray-600 hover:text-gray-900 transition-colors font-light hover:bg-gray-50 rounded-r-lg"
                  >
                    +
                  </button>
                </div>
                <button 
                onClick={() =>handleBuyNowClick() }
                className="w-full py-4 px-8 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-light rounded-lg flex items-center justify-center gap-3"
              >
                <Truck className="w-5 h-5" />
                <span className="text-base tracking-wide">Buy Now</span>
              </button>

               
              </div>
               {/* Add to Cart Button */}
                <div className='flex '>
                    <button 
                  onClick={handleAddToCartClick}
                  className={`flex-1 py-4 px-8 flex items-center justify-center gap-3 transition-all font-light rounded-lg border ${
                    isInCartItem
                      ? 'bg-green-600 text-white hover:bg-green-700 border-green-600'
                      : 'bg-white text-gray-900 hover:bg-gray-50 border-gray-900'
                  }`}
                >
                  {getButtonIcon()}
                  <span className="text-base tracking-wide">
                    {getButtonText()}
                  </span>
                </button>
                </div>
                

              {/* Buy Now Button */}
              
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
              <div className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Truck className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-light text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600 font-light">On orders over ₹500</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <RotateCcw className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-light text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-600 font-light">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Shield className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-light text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-600 font-light">100% secure checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;