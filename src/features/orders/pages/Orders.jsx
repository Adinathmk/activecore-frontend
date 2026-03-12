import React, { useEffect, useState } from 'react'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ShoppingBag, X, Package, Calendar, CreditCard, MapPin, Download, ChevronRight, ArrowLeft, Receipt, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { getOrdersAPI } from '../api/order.api';
import { OrdersSkeleton } from '@/shared/components/Skeleton';

function Orders() {
    const [isViewAll, setViewAll] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    const getStatusConfig = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'pending':    return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#fbbf24', icon: Clock };
            case 'processing': return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6', icon: AlertCircle };
            case 'confirmed':  return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6', icon: AlertCircle };
            case 'shipped':    return { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe', dot: '#8b5cf6', icon: Truck };
            case 'delivered':  return { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0', dot: '#10b981', icon: CheckCircle };
            case 'cancelled':  return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', dot: '#f87171', icon: XCircle };
            default:           return { bg: '#f9fafb', text: '#4b5563', border: '#e5e7eb', dot: '#9ca3af', icon: Package };
        }
    };

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const generateInvoice = (order) => {
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 18;

        const paymentLabel = order.payment_method === 'ONLINE'
            ? (order.is_paid ? 'Paid Online' : 'Online Payment Pending')
            : (order.is_paid ? 'Cash on Delivery (Paid)' : 'Cash on Delivery');

        // ── Full-bleed header ──
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageW, 42, 'F');

        // Subtle accent strip
        doc.setFillColor(37, 99, 235); // blue-600
        doc.rect(0, 38, pageW, 4, 'F');

        // Brand
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text('ACTIVECORE', margin, 18);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text('activecoreindia.com', margin, 25);

        // Invoice label right side
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(255, 255, 255);
        doc.text('TAX INVOICE', pageW - margin, 15, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`#${order.id}`, pageW - margin, 22, { align: 'right' });
        doc.text(
            new Date(order.placed_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
            pageW - margin, 29, { align: 'right' }
        );

        let y = 54;

        // ── Meta row: 3 pills ──
        const metaItems = [
            { label: 'STATUS', value: order.status },
            { label: 'PAYMENT', value: paymentLabel },
            { label: 'ITEMS', value: `${order.items.length} item${order.items.length !== 1 ? 's' : ''}` },
        ];
        const pillW = (pageW - margin * 2 - 8) / 3;

        metaItems.forEach(({ label, value }, i) => {
            const x = margin + i * (pillW + 4);
            doc.setFillColor(248, 250, 252); // slate-50
            doc.setDrawColor(226, 232, 240); // slate-200
            doc.roundedRect(x, y, pillW, 18, 2, 2, 'FD');
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 116, 139); // slate-500
            doc.text(label, x + 6, y + 6.5);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text(value, x + 6, y + 14);
        });

        y += 28;

        // ── Section header ──
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text('ORDER ITEMS', margin, y);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin + 36, y - 1, pageW - margin, y - 1);

        y += 5;

        // ── Items table ──
        const tableRows = order.items.map(item => [
            item.product_name,
            item.variant_size || '—',
            String(item.quantity),
            `₹${Number(item.final_unit_price).toLocaleString('en-IN')}`,
            `₹${Number(item.total_price).toLocaleString('en-IN')}`,
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Product', 'Size', 'Qty', 'Unit Price', 'Amount']],
            body: tableRows,
            margin: { left: margin, right: margin },
            styles: {
                fontSize: 9,
                cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
                textColor: [30, 41, 59],
                lineColor: [226, 232, 240],
                lineWidth: 0.3,
            },
            headStyles: {
                fillColor: [15, 23, 42],
                textColor: [248, 250, 252],
                fontStyle: 'bold',
                fontSize: 8.5,
                cellPadding: { top: 6, bottom: 6, left: 5, right: 5 },
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { halign: 'center', cellWidth: 20 },
                2: { halign: 'center', cellWidth: 14 },
                3: { halign: 'right', cellWidth: 30 },
                4: { halign: 'right', cellWidth: 30, fontStyle: 'bold' },
            },
            tableLineColor: [226, 232, 240],
            tableLineWidth: 0.3,
        });

        y = doc.lastAutoTable.finalY + 10;

        // ── Totals block ──
        const blockW = 80;
        const blockX = pageW - margin - blockW;

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(blockX, y, blockW, 44, 3, 3, 'FD');

        const totalsLines = [
            ['Subtotal', `₹${Number(order.subtotal_amount || 0).toLocaleString('en-IN')}`],
            ['Shipping', `₹${Number(order.shipping_amount || 0).toLocaleString('en-IN')}`],
            ['GST (18%)', `₹${Number(order.tax_amount || 0).toLocaleString('en-IN')}`],
        ];

        let ty = y + 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);

        totalsLines.forEach(([label, val]) => {
            doc.text(label, blockX + 6, ty);
            doc.text(val, blockX + blockW - 6, ty, { align: 'right' });
            ty += 7;
        });

        // Divider inside block
        doc.setDrawColor(203, 213, 225);
        doc.line(blockX + 6, ty - 2, blockX + blockW - 6, ty - 2);
        ty += 4;

        // Total row
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(blockX, ty - 5, blockW, 12, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text('TOTAL', blockX + 6, ty + 3);
        doc.text(`₹${Number(order.total_amount).toLocaleString('en-IN')}`, blockX + blockW - 6, ty + 3, { align: 'right' });

        // ── Footer ──
        const footerY = pageH - 18;
        doc.setFillColor(15, 23, 42);
        doc.rect(0, footerY - 6, pageW, pageH, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('Thank you for shopping with ActiveCore  •  This is a computer-generated invoice', pageW / 2, footerY + 2, { align: 'center' });

        doc.save(`ActiveCore-Invoice-${order.id}.pdf`);
    };

    useEffect(() => {
        const fetchUserOrders = async () => {
            setOrdersLoading(true);
            try {
                const data = await getOrdersAPI();
                setOrders(data);
            } catch (err) {
                console.error('Error fetching orders:', err);
            } finally {
                setOrdersLoading(false);
            }
        };

        if (currentUser?.id) {
            fetchUserOrders();
            const timer = setTimeout(() => {
                fetchUserOrders();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentUser?.id]);

    const displayedOrders = isViewAll
        ? [...orders].sort((a, b) => new Date(b.placed_at) - new Date(a.placed_at))
        : [...orders].sort((a, b) => new Date(b.placed_at) - new Date(a.placed_at)).slice(0, 5);

    return (
        <>
            <div className="min-h-screen bg-gray-50/60 py-6 sm:py-10 px-4">
                <div className="max-w-3xl mx-auto">

                    {/* Page Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                                <ShoppingBag size={17} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Orders</h1>
                        </div>
                        <p className="text-sm text-gray-500 ml-12">
                            {orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? 's' : ''} placed` : 'Track and manage your purchases'}
                        </p>
                    </div>

                    {/* Orders Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {ordersLoading ? (
                            <div className="p-6"><OrdersSkeleton /></div>
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                    <Package size={28} className="text-gray-400" />
                                </div>
                                <p className="font-semibold text-gray-800 text-lg">No orders yet</p>
                                <p className="text-sm text-gray-500 mt-1 max-w-xs">When you place an order, it'll show up here so you can track it.</p>
                            </div>
                        ) : (
                            <>
                                <div className="divide-y divide-gray-100">
                                    {displayedOrders.map((order) => {
                                        const cfg = getStatusConfig(order.status);
                                        const StatusIcon = cfg.icon;
                                        return (
                                            <div
                                                key={order.id}
                                                onClick={() => handleOrderClick(order)}
                                                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors duration-150 cursor-pointer group"
                                            >
                                                {/* Status icon */}
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border" style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
                                                    <StatusIcon size={17} style={{ color: cfg.text }} />
                                                </div>

                                                {/* Order info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="font-semibold text-gray-900 text-sm truncate">{order.id}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(order.placed_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        &nbsp;·&nbsp;
                                                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>

                                                {/* Right: amount + badge */}
                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <p className="font-bold text-gray-900 text-sm">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border" style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
                                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                                                        {order.status}
                                                    </span>
                                                </div>

                                                <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer toggle */}
                                {orders.length > 5 && (
                                    <div className="border-t border-gray-100 px-5 py-3">
                                        <button
                                            onClick={() => setViewAll(v => !v)}
                                            className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 py-1.5 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            {isViewAll ? 'Show fewer orders' : `View all ${orders.length} orders`}
                                            <ChevronRight size={14} className={`transition-transform ${isViewAll ? 'rotate-90' : ''}`} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Order Details Modal ── */}
            {isModalOpen && selectedOrder && (() => {
                const cfg = getStatusConfig(selectedOrder.status);
                const StatusIcon = cfg.icon;
                return (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
                        <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">

                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                                        <Receipt size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-900 text-base leading-tight">Order Details</h2>
                                        <p className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-[180px] sm:max-w-none">{selectedOrder.id}</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Scrollable body */}
                            <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5 space-y-5">

                                {/* Status banner */}
                                <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
                                    <StatusIcon size={20} style={{ color: cfg.text }} />
                                    <div>
                                        <p className="font-bold text-sm" style={{ color: cfg.text }}>{selectedOrder.status}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {selectedOrder.status === 'Delivered' && 'Your order has been delivered'}
                                            {selectedOrder.status === 'Shipped' && 'Your order is on its way'}
                                            {selectedOrder.status === 'Processing' && 'We\'re preparing your order'}
                                            {selectedOrder.status === 'Pending' && 'Order received, awaiting confirmation'}
                                            {selectedOrder.status === 'Cancelled' && 'This order has been cancelled'}
                                        </p>
                                    </div>
                                </div>

                                {/* Meta info row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Calendar size={13} className="text-gray-400" />
                                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Date</span>
                                        </div>
                                        <p className="font-semibold text-gray-900 text-sm">
                                            {new Date(selectedOrder.placed_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <CreditCard size={13} className="text-gray-400" />
                                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Payment</span>
                                        </div>
                                        <p className="font-semibold text-gray-900 text-sm leading-snug">
                                            {selectedOrder.payment_method === "ONLINE"
                                                ? selectedOrder.is_paid ? "Paid Online ✓" : "Online — Pending"
                                                : selectedOrder.is_paid ? "COD (Paid) ✓" : "Cash on Delivery"}
                                        </p>
                                    </div>
                                </div>

                                {/* Order items */}
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                                        Items ({selectedOrder.items.length})
                                    </p>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item, index) => (
                                            <div key={index} className="flex gap-3.5 p-3.5 border border-gray-100 rounded-xl bg-white hover:border-gray-200 transition-colors">
                                                <img
                                                    src={item.primary_image_url || '/placeholder-image.jpg'}
                                                    alt={item.product_name}
                                                    className="w-16 h-16 object-cover rounded-lg shrink-0 bg-gray-100"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{item.product_name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-medium">Size {item.variant_size}</span>
                                                        <span className="text-xs text-gray-400">×{item.quantity}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">₹{Number(item.final_unit_price).toLocaleString('en-IN')} each</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-gray-900 text-sm">₹{Number(item.total_price).toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Price breakdown */}
                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Summary</p>
                                    <div className="space-y-2">
                                        {[
                                            ['Subtotal', selectedOrder.subtotal_amount || 0],
                                            ['Shipping', selectedOrder.shipping_amount || 0],
                                            ['GST', selectedOrder.tax_amount || 0],
                                        ].map(([label, val]) => (
                                            <div key={label} className="flex justify-between text-sm">
                                                <span className="text-gray-500">{label}</span>
                                                <span className="text-gray-700 font-medium">₹{Number(val).toLocaleString('en-IN')}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200">
                                            <span className="font-bold text-gray-900">Total</span>
                                            <span className="font-bold text-gray-900 text-lg">₹{Number(selectedOrder.total_amount).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stripe confirm */}
                                {selectedOrder.payment_method === "ONLINE" && selectedOrder.is_paid && (
                                    <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                                        <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                                        <p className="text-sm text-emerald-700 font-medium">Payment confirmed via Stripe</p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 bg-white">
                                <button
                                    onClick={() => generateInvoice(selectedOrder)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all duration-150 font-semibold text-sm shadow-md shadow-blue-200"
                                >
                                    <Download size={15} />
                                    Download Invoice
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="px-5 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </>
    );
}

export default Orders;