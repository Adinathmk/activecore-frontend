import React from 'react';
import { 
  FaInstagram, 
  FaPinterest,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaApplePay
} from 'react-icons/fa';

const MinimalWhiteFooter = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 justify-items-center">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-light text-gray-900 mb-4 tracking-tight">Active Core</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Fit for Performance, Made for You
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-medium text-gray-900 uppercase tracking-wider mb-4">Navigate</h4>
            <ul className="space-y-2">
              {['Shop', 'Collections'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-medium text-gray-900 uppercase tracking-wider mb-4">Help</h4>
            <ul className="space-y-2">
              {['Contact', 'About'].map((item) => (
                <li key={item}>
                  <a href={`/${item.toLowerCase()}`} className="text-gray-500 hover:text-gray-900 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-medium text-gray-900 uppercase tracking-wider mb-4">Connect</h4>
            <div className="flex space-x-3 mb-4">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaInstagram size={16} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaPinterest size={16} />
              </a>
            </div>
            <p className="text-gray-400 text-xs">
              Sign up for updates<br />
              <a href="#" className="text-gray-900 hover:underline">Subscribe</a>
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-xs mb-4 md:mb-0">
            © 2025 Active Core. Crafted with care.
          </div>
          <div className="flex items-center space-x-2">
            {[FaCcVisa, FaCcMastercard, FaCcPaypal, FaApplePay].map((Icon, index) => (
              <Icon key={index} className="text-gray-400" size={18} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MinimalWhiteFooter;