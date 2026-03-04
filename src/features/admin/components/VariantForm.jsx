import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchAdminProductsApi } from "@/features/admin/api/admin.api";

function VariantForm({ isFormOpen, onSave, variant, onClose }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  
  const defaultFormData = {
    product: "",
    size: "M",
    price: "",
    discount_percent: "0",
    stock: "",
    is_active: true,
  };

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      
      // Fetch products for dropdown to assign variant to
      setLoading(true);
      fetchAdminProductsApi()
        .then((res) => setProducts(res.data?.results || res.data || []))
        .catch((err) => console.error("Error fetching products:", err))
        .finally(() => setLoading(false));

    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "initial";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "initial";
    };
  }, [isFormOpen]);

  useEffect(() => {
    if (variant && isFormOpen) {
      setFormData({
        product: variant.product_id || "",
        size: variant.size || "M",
        price: variant.price || "",
        discount_percent: variant.discount_percent || "0",
        stock: variant.stock ?? variant.available_stock ?? "",
        is_active: variant.is_active !== undefined ? variant.is_active : true,
      });
    } else if (!variant && isFormOpen) {
      setFormData(defaultFormData);
    }
  }, [variant, isFormOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.product) {
      toast.error("Please select a product.");
      return;
    }
    
    const payload = {
      product: parseInt(formData.product, 10),
      size: formData.size,
      price: parseFloat(formData.price),
      discount_percent: parseFloat(formData.discount_percent || 0),
      stock: parseInt(formData.stock || 0, 10),
      is_active: formData.is_active,
    };

    if (variant) {
      onSave({ ...payload, id: variant.id });
    } else {
      onSave(payload);
    }
  };

  if (!isFormOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[110] px-4 overflow-y-auto py-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1.5 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">
          {variant ? "Edit Variant / Inventory" : "Add Variant"}
        </h2>

        {loading ? (
             <div className="flex justify-center items-center py-10">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
             </div>
        ) : (
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <label className="text-sm font-medium text-gray-700 block mb-1.5">Product *</label>
                 <select
                   name="product"
                   value={formData.product}
                   onChange={handleChange}
                   required
                   disabled={!!variant} // Prevent changing product when editing variant
                   className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors bg-white disabled:bg-gray-100"
                 >
                   <option value="">Select a Product</option>
                   {products.map((p) => (
                     <option key={p.id} value={p.id}>
                       {p.name} {p.category ? `(${p.category})` : ""}
                     </option>
                   ))}
                 </select>
               </div>
     
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm font-medium text-gray-700 block mb-1.5">Size *</label>
                   <select
                     name="size"
                     value={formData.size}
                     onChange={handleChange}
                     required
                     className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 bg-white"
                   >
                     {["S", "M", "L", "XL"].map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                 </div>
                 
                 <div>
                   <label className="text-sm font-medium text-gray-700 block mb-1.5">Stock Count *</label>
                   <input
                     type="number"
                     name="stock"
                     min="0"
                     value={formData.stock}
                     onChange={handleChange}
                     className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                     placeholder="0"
                     required
                   />
                 </div>
     
                 <div>
                   <label className="text-sm font-medium text-gray-700 block mb-1.5">Price (₹) *</label>
                   <input
                     type="number"
                     name="price"
                     min="0"
                     step="0.01"
                     value={formData.price}
                     onChange={handleChange}
                     className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                     placeholder="0.00"
                     required
                   />
                 </div>
     
                 <div>
                   <label className="text-sm font-medium text-gray-700 block mb-1.5">Discount %</label>
                   <input
                     type="number"
                     name="discount_percent"
                     min="0"
                     max="100"
                     step="0.01"
                     value={formData.discount_percent}
                     onChange={handleChange}
                     className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                     placeholder="0"
                   />
                 </div>
               </div>
     
               <div className="pt-2">
                 <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer bg-gray-50 p-3 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                   <input
                     type="checkbox"
                     name="is_active"
                     checked={formData.is_active}
                     onChange={handleChange}
                     className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                   />
                   <span className="font-medium">Variant goes Active immediately</span>
                 </label>
               </div>
     
               <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                 <button
                   type="button"
                   onClick={onClose}
                   className="px-5 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                 >
                   {variant ? "Save Changes" : "Create Variant"}
                 </button>
               </div>
             </form>
        )}
      </div>
    </div>
  );
}

export default VariantForm;
