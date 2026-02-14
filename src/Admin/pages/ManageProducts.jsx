import { Delete, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import ProductForm from '../components/ProductForm'

function ManageProducts() {
    const[products,setProducts]=useState([])
    const[filteredProducts,setfilteredProducts]=useState([])
    const[productName,setproductName]=useState('')
    const[category,setCategory]=useState('All Categories')
    const[loading, setLoading] = useState(true)
    const[isFormOpen,setFormOpen]=useState(false)
    const[editingProduct,setEditingProduct]=useState(null)

    const fetchProducts=async()=>{
            try{
                setLoading(true)
                const{data}=await axiosInstance.get('/products')
                setProducts(data)
            }
           catch (e) {
                console.error("Error fetching products:", e);
            } finally {
                setLoading(false)
            }
    }
    
    useEffect(()=>{        
        fetchProducts()        
    },[])

    useEffect(() => {
        let data = products;

        // Filter by product name
        if (productName.trim() !== "") {
            const searchKey = productName.toLowerCase().replace(/[^a-z]/g, "");
            data = data.filter(product =>
            product.name.toLowerCase().replace(/[^a-z]/g, "").includes(searchKey)
            );
        }

        // Filter by category
        if (category !== 'All Categories') {
            data = data.filter(
            product => product.category.toLowerCase() === category.toLowerCase()
            );
        }

        setfilteredProducts(data);
    }, [productName, products, category]);

    const productOnSave = async (formData) => {
        try {
            if (editingProduct) {
            //  Edit existing product
            await axiosInstance.put(`/products/${editingProduct.id}`, formData);
            } else {
            //  Add new product
            await axiosInstance.post('/products', formData);
            }
            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error("Failed to save product!");
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
    const deleteProduct=async(id)=>{
        const updatedProducts=products.filter((product)=>product.id!==id)
        try {
            await axiosInstance.delete(`/products/${id}`);
            setProducts((prev) => prev.filter((product) => product.id !== id));
        }
        catch(error){
            console.error("Error deleting product:", error);
        }       
        
    }
    return (      
        <div className='bg-white min-h-screen p-4 md:p-6 lg:p-8'>
            <ProductForm  isFormOpen={isFormOpen} setFormOpen={setFormOpen} onSave={ productOnSave} product={editingProduct} onClose={onClose}/>                                    
            <div className='max-w-7xl mx-auto'>
                {/* Header Section */}
                <div className='mb-8'>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
                        <div>
                            <h1 className='font-bold text-2xl lg:text-3xl text-gray-900'>Manage Products</h1>
                            <p className='text-gray-600 mt-1'>Manage your product inventory and listings</p>
                        </div>
                        <button className='cursor-pointer bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto flex items-center justify-center gap-2'
                            onClick={()=>{setEditingProduct(null);setFormOpen(true)}}>
                            <span>+</span>
                            <span>Add New Product</span>
                        </button>
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
                                        <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">Image</th>
                                        <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">Name</th>
                                        <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">Price</th>
                                        <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">Stock</th>
                                        <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-gray-500">
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
                                                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                                        <img
                                                            src={product?.images?.[0] || "https://via.placeholder.com/150?text=No+Image"}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                            
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{product.name}</p>
                                                        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-semibold text-gray-900">₹{product.price}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        product.count > 10 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : product.count > 0 
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {product.count > 0 ? `${product.count} in stock` : 'Out of stock'}
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