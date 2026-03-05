import { Delete, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ProductForm from '@/features/admin/components/ProductForm';
import CategoryForm from '@/features/admin/components/CategoryForm';
import ProductTypeForm from '@/features/admin/components/ProductTypeForm';
import { fetchAdminProductsApi, createAdminProductApi, updateAdminProductApi, deleteAdminProductApi, createAdminCategoryApi, createAdminProductTypeApi } from '@/features/admin/api/admin.api';
import { toast } from 'react-toastify';
import { parseApiError } from '@/features/admin/utils/errorHandler';

function ManageProducts() {
    const[products,setProducts]=useState([])
    const[productName,setproductName]=useState('')
    const[category,setCategory]=useState('All Categories')
    const[loading, setLoading] = useState(true)
    const[isFormOpen,setFormOpen]=useState(false)
    const[isCategoryFormOpen, setCategoryFormOpen] = useState(false);
    const[isProductTypeFormOpen, setProductTypeFormOpen] = useState(false);
    const[editingProduct,setEditingProduct]=useState(null)

    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(productName);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [productName]);

    const fetchProducts = async (search = '') => {
        try {
            setLoading(true);
            const { data } = await fetchAdminProductsApi(search);
            setProducts(data?.results || data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error(parseApiError(error, "Failed to load products."));
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(()=>{        
        fetchProducts(debouncedSearch)        
    },[debouncedSearch])

    const filteredProducts = products.filter((product) => {
        if (category === "All Categories") return true;
        return product.category.toLowerCase() === category.toLowerCase();
    });

    const productOnSave = async (formData) => {
        try {
            if (editingProduct) {
                await updateAdminProductApi(editingProduct.id, formData);
                toast.success("Product updated successfully!");
            } else {
                await createAdminProductApi(formData);
                toast.success("Product created successfully!");
            }
            setFormOpen(false);
            fetchProducts(debouncedSearch);
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error(parseApiError(error, "Failed to save product."));
        } finally {
            setEditingProduct(null);
        }
    };

    const changeProduct=(e)=>{
        setproductName(e.target.value)      
    }
    const onClose = () => {
        setFormOpen(false);
        setEditingProduct(null)
    };
   const deleteProduct = async (id) => {
        if (!window.confirm("Delete this product? This cannot be undone.")) return;

        try {
            await deleteAdminProductApi(id);

            // update UI instantly
            setProducts((prev) => prev.filter((p) => p.id !== id));

            toast.success("Product deleted.");

            // re-fetch from backend to stay in sync
            fetchProducts(debouncedSearch);

        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error(parseApiError(error, "Failed to delete product."));
        }
    };
    
    const handleCategorySave = async (formData) => {
        try {
            await createAdminCategoryApi(formData);
            toast.success("Category created successfully!");
        } catch (error) {
            console.error("Error creating category:", error);
            toast.error(parseApiError(error, "Failed to create category."));
        }
    };

    const handleProductTypeSave = async (formData) => {
        try {
            await createAdminProductTypeApi(formData);
            toast.success("Product Type created successfully!");
        } catch (error) {
            console.error("Error creating product type:", error);
            toast.error(parseApiError(error, "Failed to create product type."));
        }
    };

    return (      
        <div className='bg-white min-h-screen p-4 md:p-6 lg:p-8'>
            <ProductForm  isFormOpen={isFormOpen} setFormOpen={setFormOpen} onSave={ productOnSave} product={editingProduct} onClose={onClose}/>                                    
            <CategoryForm isFormOpen={isCategoryFormOpen} onSave={handleCategorySave} onClose={() => setCategoryFormOpen(false)} />
            <ProductTypeForm isFormOpen={isProductTypeFormOpen} onSave={handleProductTypeSave} onClose={() => setProductTypeFormOpen(false)} />
            <div className='max-w-7xl mx-auto'>
                {/* Header Section */}
                <div className='mb-8'>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
                        <div>
                            <h1 className='font-bold text-2xl lg:text-3xl text-gray-900'>Manage Products</h1>
                            <p className='text-gray-600 mt-1'>Manage your product inventory and listings</p>
                        </div>
                        <div className='flex flex-wrap items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0'>
                            <button className='cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm rounded-lg font-medium transition-colors shadow-sm w-full sm:w-auto flex items-center justify-center gap-2'
                                onClick={() => setProductTypeFormOpen(true)}>
                                <span>+</span>
                                <span>Add Type</span>
                            </button>
                            <button className='cursor-pointer bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto flex items-center justify-center gap-2'
                                onClick={()=>{setEditingProduct(null);setFormOpen(true)}}>
                                <span>+</span>
                                <span>Add New Product</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className='bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                            {/* Search Input */}
                            <div className='relative'>
                                <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Search Products
                                </label>
                                <div className='relative'>
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                                    <input 
                                        type='text' 
                                        id='name' 
                                        placeholder='Search product name...' 
                                        value={productName}
                                        className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white'
                                        onChange={changeProduct}
                                    />
                                </div>
                            </div>
                            
                            {/* Category Filter */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Filter by Category
                                </label>
                                <select 
                                    className='w-full px-4 py-3 rounded-lg text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white appearance-none'
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option>All Categories</option>
                                    <option>Men</option>
                                    <option>Women</option>
                                    <option>Accessories</option>
                                </select>
                                
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">Name</th>
                                        <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">Type</th>
                                        <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">Status</th>
                                        <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">Rating</th>
                                        <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">Created</th>
                                        <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Search size={48} className="text-gray-300 mb-3" />
                                                    <p className="text-lg font-medium">No products found</p>
                                                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{product.name}</p>
                                                        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm text-gray-700 capitalize">{product.product_type}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        product.is_active 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {product.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {product.is_featured && (
                                                        <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            Featured
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm font-medium text-gray-900">{product.avg_rating || '0.0'}</span>
                                                        <span className="text-yellow-500 text-sm">★</span>
                                                        <span className="text-xs text-gray-500">({product.rating_count || 0})</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm text-gray-500">
                                                        {product.created_at ? new Date(product.created_at).toLocaleDateString() : '—'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <button className="text-gray-700 hover:text-blue-700 cursor-pointer px-3 py-1.5 rounded-md border border-gray-300 hover:border-blue-300 bg-white hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                                                          onClick={() => {setEditingProduct(product); setFormOpen(true);}}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button className="text-gray-700 hover:text-red-700 cursor-pointer px-3 py-1.5 rounded-md border border-gray-300 hover:border-red-300 bg-white hover:bg-red-50 transition-all duration-200 text-sm font-medium"
                                                            onClick={()=>deleteProduct(product.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                {!loading && filteredProducts.length > 0 && (
                    <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                        <span>Showing {filteredProducts.length} of {products.length} products</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Total: {products.length}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ManageProducts