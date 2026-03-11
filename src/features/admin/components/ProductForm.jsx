import { X, XCircle, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { fetchAdminCategoriesApi, fetchAdminProductTypesApi, fetchAdminProductDetailApi } from "@/features/admin/api/admin.api";
import { toast } from "@/components/ui/sonner";

function ProductForm({ isFormOpen, onSave, product, onClose }) {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  const defaultFormData = {
    name: "",
    description: "",
    category: "",
    product_type: "",
    isNewArrival: false,
    isTopSelling: false,
    is_featured: false,
    is_active: true,
    features: [""],
    images: [{ id: null, image_url: "", file: null, is_primary: true, is_secondary: false }],
  };

  const [formData, setFormData] = useState(defaultFormData);



  useEffect(() => {
  if (!isFormOpen) return;

  const loadData = async () => {
    try {
      setLoading(true);

      const [catRes, typeRes] = await Promise.all([
        fetchAdminCategoriesApi(),
        fetchAdminProductTypesApi(),
      ]);

      setCategories(catRes.data);
      setProductTypes(typeRes.data);

      if (product) {
        const detailRes = await fetchAdminProductDetailApi(product.id);
        const detail = detailRes.data;

        setFormData({
          name: detail.name || "",
          description: detail.description || "",
          category: String(detail.category?.id || ""),
          product_type: String(detail.product_type?.id || ""),
          isNewArrival: detail.is_new_arrival || false,
          isTopSelling: detail.is_top_selling || false,
          is_featured: detail.is_featured || false,
          is_active: detail.is_active ?? true,
          features: detail.features?.length
            ? detail.features.map((f) => f.text)
            : [""],
          images: detail.images?.length
            ? detail.images.map((img) => ({
                id: img.id,
                image_url: img.image,
                file: null, // New file to override
                is_primary: img.is_primary,
                is_secondary: img.is_secondary,
              }))
            : [{ id: null, image_url: "", file: null, is_primary: true, is_secondary: false }],

        });
      } else {
        setFormData(defaultFormData);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [isFormOpen, product]);

  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "initial";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "initial";
    };
  }, [isFormOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // -- Features --
  const handleFeatureChange = (index, value) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData({ ...formData, features: updated });
  };
  const addFeature = () => setFormData({ ...formData, features: [...formData.features, ""] });
  const deleteFeature = (index) => {
    if (formData.features.length === 1) return;
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  // -- Images --
  const handleImageChange = (index, field, value) => {
    let updated = [...formData.images];
    
    if (field === "is_primary" && value === true) {
      updated = updated.map((img, i) => ({
        ...img,
        is_primary: i === index,
        is_secondary: i === index ? false : img.is_secondary,
      }));
    } else if (field === "is_secondary" && value === true) {
      updated = updated.map((img, i) => ({
        ...img,
        is_secondary: i === index,
      }));
    } else {
      updated[index][field] = value;
    }
    setFormData({ ...formData, images: updated });
  };
  const handleImageFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      let updated = [...formData.images];
      updated[index] = { ...updated[index], file: file, image_url: url };
      setFormData({ ...formData, images: updated });
    }
  };
  const addImage = () => setFormData({ ...formData, images: [...formData.images, { id: null, image_url: "", file: null, is_primary: false, is_secondary: false }] });
  const deleteImage = (index) => {
    if (formData.images.length === 1) return;
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.product_type) {
        toast.error("Category and Product Type are required.");
        return;
    }

    const hasEmptyImageBlocks = formData.images.some(img => !img.file && !img.id);
    if (hasEmptyImageBlocks) {
      toast.error("Please upload a file for all image slots, or remove the empty image slots using the 'X' button.");
      return;
    }

    const validImages = formData.images.filter(img => img.file || img.id);
    const hasPrimary = validImages.some(img => img.is_primary);
    if (!hasPrimary) {
      toast.error("Exactly one image must be selected as Primary.");
      return;
    }

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("description", formData.description);
    payload.append("category", formData.category);
    payload.append("product_type", formData.product_type);
    payload.append("is_new_arrival", formData.isNewArrival);
    payload.append("is_top_selling", formData.isTopSelling);
    payload.append("is_featured", formData.is_featured);
    payload.append("is_active", formData.is_active);

    const validFeatures = formData.features.filter(f => f.trim() !== "");
    payload.append("features", JSON.stringify(validFeatures));

    let imgIndex = 0;
    formData.images.forEach((img) => {
      // Only include images that either have a new file to upload or an existing ID
      if (img.file || img.id) {
        if (img.id) {
            payload.append(`images[${imgIndex}][id]`, img.id);
        }
        if (img.file) {
            payload.append(`images[${imgIndex}][image]`, img.file);
        }
        payload.append(`images[${imgIndex}][is_primary]`, img.is_primary);
        payload.append(`images[${imgIndex}][is_secondary]`, img.is_secondary);
        imgIndex++;
      }
    });

    setIsSubmitting(true);
    try {
      if (product) {
        console.log("--- Edit Payload Debug ---");
        for (let [key, value] of payload.entries()) {
          console.log(key, value);
        }
        await onSave(payload);
      } else {
        console.log("--- Create Payload Debug ---");
        for (let [key, value] of payload.entries()) {
          console.log(key, value);
        }
        await onSave(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isFormOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[100] px-2 sm:px-4 md:px-4 overflow-y-auto py-4">
      <div className="bg-white w-full max-w-4xl rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-4 sm:p-5 md:p-6 relative mx-2 my-auto max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm transition-colors z-10"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>

        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-center sm:text-left border-b pb-4">
          {product ? "Edit Product" : "Add New Product"}
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- Basic Info --- */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Product Name *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full mt-1.5 p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors shadow-sm"
                    placeholder="E.g. Geo Seamless T-Shirt"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full mt-1.5 p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors shadow-sm"
                    rows={3}
                    placeholder="Detailed product description..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full mt-1.5 p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors shadow-sm bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Product Type *</label>
                  <select
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleChange}
                    required
                    className="w-full mt-1.5 p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors shadow-sm bg-white"
                  >
                    <option value="">Select Product Type</option>
                    {productTypes.map((pt) => (
                      <option key={pt.id} value={String(pt.id)}>
                        {pt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* --- Images Section --- */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Images</h3>
                <button
                  type="button"
                  onClick={addImage}
                  className="text-xs font-medium bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Plus size={14} /> Add Image
                </button>
              </div>

              <div className="space-y-3">
                {formData.images.map((img, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex-1 w-full flex flex-col sm:flex-row gap-3 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(i, e)}
                        className="w-full text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                        required={i === 0 && !img.image_url}
                      />
                      {img.image_url && (
                        <div className="h-12 w-12 relative rounded-md overflow-hidden border border-gray-200 shrink-0 bg-gray-50">
                          <img src={img.image_url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 px-1">
                      <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="primary_image"
                          checked={img.is_primary}
                          onChange={(e) => handleImageChange(i, "is_primary", e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        Primary
                      </label>
                      <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={img.is_secondary}
                          onChange={(e) => handleImageChange(i, "is_secondary", e.target.checked)}
                          disabled={img.is_primary}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        Secondary
                      </label>
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteImage(i)}
                          className="text-gray-400 hover:text-red-500 ml-auto sm:ml-2"
                        >
                          <XCircle size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Features Section --- */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Features</h3>
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-xs font-medium bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Plus size={14} /> Add Feature
                </button>
              </div>
              <div className="space-y-3">
                {formData.features.map((feature, i) => (
                  <div key={i} className="flex items-center relative">
                    <input
                      value={feature}
                      onChange={(e) => handleFeatureChange(i, e.target.value)}
                      placeholder="E.g. Breathable tech fabric"
                      className="w-full p-2.5 pr-10 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-300 shadow-sm"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteFeature(i)}
                        className="absolute right-3 text-gray-400 hover:text-red-500"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* --- Visibility & Status Flags --- */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Status & Flags</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer bg-white p-3 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <span className="font-medium">Active (Visible)</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer bg-white p-3 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <span className="font-medium">Featured (Max 4)</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer bg-white p-3 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={formData.isNewArrival}
                    onChange={handleChange}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <span className="font-medium">New Arrival</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer bg-white p-3 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    name="isTopSelling"
                    checked={formData.isTopSelling}
                    onChange={handleChange}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <span className="font-medium">Top Selling</span>
                </label>
              </div>
            </div>

            {/* --- Submit Buttons --- */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 shadow-sm transition-colors w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {product ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  product ? "Update Product" : "Create Product"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ProductForm;