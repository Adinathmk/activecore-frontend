const fs = require('fs');
const filepath = 'c:/Users/ASUS/OneDrive/Desktop/Active core/Frontend/src/features/orders/pages/Orders.jsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace("import axiosInstance from '@/services/axiosInstance';", "import { getOrdersAPI } from '@/features/orders/api/order.api';\nimport { toast } from 'react-toastify';");
content = content.replace(/const fetchUser = async \(\) => \{.+?\}, \[currentUser\?\.id\]\);/s, `const fetchUserOrders = async () => {
            try {
                const data = await getOrdersAPI();
                setOrders(data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                toast.error('Failed to load orders data');
            }
        };
        if (currentUser?.id) fetchUserOrders();
    }, [currentUser?.id]);`);

content = content.replaceAll('order.orderId', 'order.id');
content = content.replaceAll('order.date', 'order.placed_at');
content = content.replaceAll('order.totalAmount', 'order.total_amount');
content = content.replaceAll('item.image', 'item.primary_image_url');
content = content.replaceAll('{item.type}', 'Size: {item.variant_size}');
content = content.replaceAll('item.total', 'item.total_price');
content = content.replaceAll('item.price', 'item.final_unit_price');
content = content.replaceAll('item.gst', 'item.tax_amount');
content = content.replaceAll('selectedOrder.date', 'selectedOrder.placed_at');
content = content.replaceAll('selectedOrder.paymentId', 'selectedOrder.payment_reference');
content = content.replaceAll('selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)', 'selectedOrder.subtotal_amount');
content = content.replaceAll('selectedOrder.items.reduce((sum, item) => sum + parseFloat(item.gst), 0)', 'selectedOrder.tax_amount');
content = content.replaceAll('selectedOrder.totalAmount', 'selectedOrder.total_amount');

fs.writeFileSync(filepath, content, 'utf8');
console.log("Updated Orders.jsx");
