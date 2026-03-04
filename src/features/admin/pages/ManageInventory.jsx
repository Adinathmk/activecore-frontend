import React, { useEffect, useState } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { parseApiError } from '@/features/admin/utils/errorHandler';
import { 
    fetchAdminVariantsApi, 
    createAdminVariantApi, 
    updateAdminVariantApi, 
    deleteAdminVariantApi 
} from '@/features/admin/api/admin.api';
import VariantForm from '@/features/admin/components/VariantForm';

function ManageInventory() {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);

    // Search debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchVariants = async (search = '') => {
        try {
            setLoading(true);
            const { data } = await fetchAdminVariantsApi(search);
            setVariants(data?.results || data || []);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            toast.error(parseApiError(error, "Failed to load inventory."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVariants(debouncedSearch);
    }, [debouncedSearch]);

    const handleSaveVariant = async (formData) => {
        try {
            if (formData.id) {
                await updateAdminVariantApi(formData.id, formData);
                toast.success("Variant/Inventory updated!");
            } else {
                await createAdminVariantApi(formData);
                toast.success("Variant created!");
            }
            setIsFormOpen(false);
            fetchVariants(debouncedSearch);
        } catch (error) {
            console.error("Error saving variant:", error);
            toast.error(parseApiError(error, "Failed to save variant."));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this variant?")) return;
        try {
            await deleteAdminVariantApi(id);

            toast.success("Variant deleted successfully");

            // refetch using current search filter
            fetchVariants(debouncedSearch);
        } catch (error) {
            console.error("Error deleting variant:", error);
            toast.error(parseApiError(error, "Failed to delete variant."));
        }
    };

    return (
        <div className='bg-white min-h-screen p-4 md:p-6 lg:p-8'>
            <VariantForm 
                isFormOpen={isFormOpen} 
                onSave={handleSaveVariant} 
                variant={editingVariant} 
                onClose={() => setIsFormOpen(false)} 
            />

            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
                    <div>
                        <h1 className='font-bold text-2xl lg:text-3xl text-gray-900'>Manage Inventory</h1>
                        <p className='text-gray-600 mt-1'>Control stock counts and pricing for all product variants</p>
                    </div>
                    <button 
                        className='bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2'
                        onClick={() => { setEditingVariant(null); setIsFormOpen(true); }}
                    >
                        <span>+</span>
                        <span>Add Variant</span>
                    </button>
                </div>

                {/* Filters */}
                <div className='bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200 mb-8'>
                    <div className='relative w-full md:w-1/2'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Search SKU or Product Name</label>
                        <div className='relative'>
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                            <input 
                                type='text' 
                                placeholder='Search...' 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 bg-white transition-all'
                            />
                        </div>
                    </div>
                </div>

                {/* List Table */}
                <div className='bg-white border text-sm md:text-md border-gray-200 rounded-xl shadow-sm overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='w-full min-w-[800px]'>
                            <thead className='bg-gray-50 border-b border-gray-200'>
                                <tr>
                                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>Product</th>
                                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>SKU</th>
                                    <th className='px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider'>Size</th>
                                    <th className='px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider'>Price / Sell</th>
                                    <th className='px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider'>Stock</th>
                                    <th className='px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider'>Status</th>
                                    <th className='px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                                {loading && variants.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            Loading inventory data...
                                        </td>
                                    </tr>
                                ) : variants.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            No variants found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    variants.map((variant) => (
                                        <tr key={variant.id} className='hover:bg-gray-50 transition-colors'>
                                            <td className='px-6 py-4 font-medium text-gray-900'>
                                                {variant.product_name}
                                            </td>
                                            <td className='px-6 py-4 text-gray-500 font-mono text-sm'>
                                                {variant.sku}
                                            </td>
                                            <td className='px-6 py-4 text-center'>
                                                <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-sm border border-gray-200">
                                                    {variant.size}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-right text-gray-700 font-medium'>
                                                <div className="flex flex-col items-end">
                                                    <span className={variant.discount_percent > 0 ? "line-through text-gray-400 text-xs" : ""}>
                                                        ₹{variant.price}
                                                    </span>
                                                    {variant.discount_percent > 0 && (
                                                        <span className="text-green-600 font-bold">
                                                            ₹{variant.selling_price} (-{variant.discount_percent}%)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 text-center'>
                                                <div className="flex flex-col items-center">
                                                    <span className={`font-bold ${variant.stock <= 5 ? 'text-red-500' : 'text-gray-900'}`}>
                                                        {variant.stock} total
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        ({variant.available_stock} avail)
                                                    </span>
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 text-center'>
                                                {variant.is_active ? 
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                    </span> : 
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Inactive
                                                    </span>
                                                }
                                            </td>
                                            <td className='px-6 py-4 text-right'>
                                                <div className='flex items-center justify-end gap-3'>
                                                    <button 
                                                        title="Edit Stock/Price"
                                                        onClick={() => { setEditingVariant(variant); setIsFormOpen(true); }}
                                                        className='p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors'
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button 
                                                        title="Delete Variant"
                                                        onClick={() => handleDelete(variant.id)}
                                                        className='p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors'
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageInventory;
