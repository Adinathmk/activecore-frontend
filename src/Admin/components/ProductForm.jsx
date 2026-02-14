    import { X, XCircle, XIcon } from "lucide-react";
    import React, { useEffect, useState } from "react";

    function ProductForm({ isFormOpen,onSave,product,onClose}) {
    

    useEffect(()=>{
         if (product) {
            setFormData({
                ...formData,
                ...product,
            });
        }
        else{
           setFormData({
                name: "",
                description: "",
                price: "",
                prevPrice: "",
                count: "",
                images: [""],
                category: "men",
                type: "",
                rating: "",
                reviews: "",
                sizes: [],
                features: [""],
                isNewArrival: false,
                isTopSelling: false,
                is_active: true,
            });
        }
    },[product])

    useEffect(() => {
    if (isFormOpen) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden"; // ✅ stop scroll on html too
    } else {
        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "intial";
    }

    return () => {
        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "initial";
    };
    }, [isFormOpen]);


    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        prevPrice: "",
        count: "",
        images: [""],
        category: "men",
        type: "",
        rating: "",
        reviews: "",
        sizes: [],
        features: [""],
        isNewArrival: false,
        isTopSelling: false,
        is_active: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleArrayChange = (index, field, value) => {
        const updated = [...formData[field]];
        updated[index] = value;
        setFormData({ ...formData, [field]: updated });
    };

    const addArrayField = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ""] });
    };

    const deleteArrayField = (index, field) => {
        if(formData[field].length===1){
            return null
        }
        const updated = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: updated });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data={...formData,created_at:new Date().toISOString()}
        if (product) {
            onSave({ ...formData, id: product.id }); 
        } else {
            onSave(data);
        }
        onClose();
    };

    
    if (!isFormOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-2 sm:px-4 md:px-4 overflow-y-auto py-4">
        <div className="bg-white w-full max-w-3xl rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-4 sm:p-5 md:p-5 relative mx-2 my-auto ">
            {/* Close button */}
            <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm"
            >
            <X size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Header */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-4 sm:mb-4 text-center sm:text-left">
            Add New Product
            </h2>

            <form onSubmit={handleSubmit} className="sm:space-y-1">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                <label className="text-xs sm:text-sm text-gray-600">Product Name</label>
                <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                    placeholder="Geo Seamless T-Shirt"
                    required
                />
                </div>
                <div>
                <label className="text-xs sm:text-sm text-gray-600">Category</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors "
                >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                </select>
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="text-xs sm:text-sm text-gray-600">Description</label>
                <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                rows={2}
                placeholder="Write a short product description..."
                />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                <label className="text-xs sm:text-sm text-gray-600 ">Price</label>
                <input
                    type="number"
                    name="price"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Price"
                    className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                    required
                />
                </div>
                <div>
                <label className="text-xs sm:text-sm text-gray-600 ">Previous Price</label>
                <input
                    type="number"
                    name="prevPrice"
                    min='0'
                    value={formData.prevPrice}
                    onChange={handleChange}
                    placeholder="Previous Price"
                    required
                    className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                />
                </div>
                <div>
                <label className="text-xs sm:text-sm text-gray-600 ">Stock Count</label>
                <input
                    type="number"
                    name="count"
                    min='0'
                    value={formData.count}
                    onChange={handleChange}
                    placeholder="Stock Count"
                    required
                    className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                />
                </div>
            </div>

            {/* Images */}
            <div>
                <label className="text-xs sm:text-sm text-gray-600">Image URLs</label>
                {formData.images.map((imgUrl, i) => (
                <div className="relative">
                    <input
                    
                    key={i}
                    value={imgUrl}
                    required
                    onChange={(e) => handleArrayChange(i, "images", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className=" w-full mt-1 mb-2 p-3 sm:pr-9 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"  
                    />
                    <XCircle  className="absolute right-3 top-1/3   hover:text-red-600 cursor-pointer" size={20}
                    onClick={()=>deleteArrayField(i,"images")}/>
                </div>    
                
                
                ))}
                <button
                type="button"
                onClick={() => addArrayField("images")}
                className="text-blue-600 text-xs sm:text-sm hover:underline mt-1"
                >
                + Add another image
                </button>
            </div>

            {/* Sizes */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"> 
                <div>
                    <label className="text-xs sm:text-sm text-gray-600">Available Sizes</label>
                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-2">
                        {["S", "M", "L", "XL"].map((size) => (
                            <label key={size} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={formData.sizes.includes(size)}
                                onChange={(e) => {
                                const updated = e.target.checked
                                    ? [...formData.sizes, size]
                                    : formData.sizes.filter((s) => s !== size);
                                setFormData({ ...formData, sizes: updated });
                                }}
                                className="w-4 h-4"
                            />
                            {size}
                            </label>
                        ))}                    
                    </div>
                </div>                
                <div>
                    <label className="text-xs sm:text-sm text-gray-600 ">Rating</label>
                    <input
                        type="number"
                        name="rating"
                        min="0"
                        value={formData.rating}
                        onChange={handleChange}
                        placeholder="Rating"
                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                        required
                    />
                </div>
                <div>
                    <label className="text-xs sm:text-sm text-gray-600 ">Reviews</label>
                    <input
                        type="number"
                        name="reviews"
                        min="0"
                        value={formData.reviews}
                        onChange={handleChange}
                        placeholder="Reviews"
                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                        required
                    />
                </div>
            </div>

            {/* Features */}
            <div>
                <label className="text-xs sm:text-sm text-gray-600">Features</label>
                
                {formData.features.map((feature, i) => (
                <div className="relative">
                    <input
                        key={i}
                        value={feature}
                        required
                        onChange={(e) =>
                        handleArrayChange(i, "features", e.target.value)
                        }
                        placeholder="Feature description"
                        className="w-full mt-1 mb-2 p-3 sm:pr-10  text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                    />
                        <XCircle  className="absolute right-3 top-1/3 hover:text-red-600 cursor-pointer" size={20}
                    onClick={()=>deleteArrayField(i,"features")}/>
                </div>
                ))}
               
                
                <button
                type="button"
                onClick={() => addArrayField("features")}
                className="text-blue-600 text-xs sm:text-sm hover:underline mt-1"
                >
                + Add another feature
                </button>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1  md:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex gap-2 items-center mt-5">
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <input
                        type="checkbox"
                        name="isNewArrival"
                        checked={formData.isNewArrival}
                        onChange={handleChange}
                        className="w-4 h-4"
                    />
                    New Arrival
                    </label>
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                    <input
                        type="checkbox"
                        name="isTopSelling"
                        checked={formData.isTopSelling}
                        onChange={handleChange}
                        className="w-4 h-4"
                    />
                    Top Selling
                    </label>                    
                </div>
                <div>
                    <label className="text-xs sm:text-sm text-gray-600">Type</label>
                    <input
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                        placeholder="Geo Seamless T-Shirt"
                        required
                    />
                </div>                
            </div>

            {/* Submit Buttons */}
            <div className=" flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 text-sm sm:text-base bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto order-2 sm:order-1"
                >
                Cancel
                </button>
                <button
                type="submit"   
                className="px-5 py-3 text-sm sm:text-base bg-black text-white rounded-lg hover:bg-gray-800 shadow-md transition-colors w-full sm:w-auto order-1 sm:order-2"
                >
                Save Product
                </button>
            </div>
            </form>
        </div>
        </div>
    );
    }

    export default ProductForm;