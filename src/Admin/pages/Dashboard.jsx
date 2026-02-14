import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import axiosInstance from '../../api/axiosInstance';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// --- Icons ---
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const ProductsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
const SalesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 12v4m0 4v.01M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
  </svg>
);
const RevenueIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

// --- StatCard Component ---
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div className="bg-gray-100 p-4 rounded-full">{icon}</div>
  </div>
);

// --- ChartCard Component ---
const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md">
    <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
    <div className="h-64">{children}</div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, products: 0, sales: 0, revenue: '0' });
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([
          axiosInstance.get('/users'),
          axiosInstance.get('/products')
        ]);

        const Users = usersRes.data;
        const Products = productsRes.data;

        const TotalUsers = Users.filter(u => u.role !== 'admin').length;
        const TotalProducts = Products.length;

        const Orders = Users.flatMap(u => u.orders || []);
        const TotalSales = Orders.length;
        const TotalRevenue = Orders.reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0);
        const FormattedTotalRevenue = TotalRevenue.toFixed(0);

        setStats({ users: TotalUsers, products: TotalProducts, sales: TotalSales, revenue: FormattedTotalRevenue });

        // --- Chart Calculations ---
        const revenueByProduct = {};
        const topSellingProducts = {};
        const revenueByCategory = {};
        const orderStatusDist = {};

        const productCategoryMap = Products.reduce((acc, p) => {
          acc[p.name] = p.category || 'Other';
          return acc;
        }, {});

        Orders.forEach(order => {
          orderStatusDist[order.status] = (orderStatusDist[order.status] || 0) + 1;

          order.items.forEach(item => {
            const revenue = parseFloat(item.total) || item.price * item.quantity || 0;
            revenueByProduct[item.name] = (revenueByProduct[item.name] || 0) + revenue;
            topSellingProducts[item.name] = (topSellingProducts[item.name] || 0) + item.quantity;

            const category = productCategoryMap[item.name] || 'Other';
            revenueByCategory[category] = (revenueByCategory[category] || 0) + revenue;
          });
        });

        const shortenName = (name) => name.split(" ").slice(0, 2).join(" ");

        const top4RevenueProducts = Object.fromEntries(
          Object.entries(revenueByProduct)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, value]) => [shortenName(name), value])
        );

        const top4SellingProducts = Object.fromEntries(
          Object.entries(topSellingProducts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, value]) => [shortenName(name), value])
        );

        setChartData({
          revenueByProduct: {
            labels: Object.keys(top4RevenueProducts),
            datasets: [{ label: 'Revenue (₹)', data: Object.values(top4RevenueProducts), backgroundColor: 'rgba(75, 192, 192, 0.6)' }],
          },
          topSellingProducts: {
            labels: Object.keys(top4SellingProducts),
            datasets: [{ label: 'Quantity Sold', data: Object.values(top4SellingProducts), backgroundColor: 'rgba(255, 99, 132, 0.6)' }],
          },
          orderStatusDist: {
            labels: Object.keys(orderStatusDist),
            datasets: [{ data: Object.values(orderStatusDist), backgroundColor: ['#3B82F6', '#F44336', '#4CAF50','#8B5CF6','#FB923C'] }],
          },
          revenueByCategory: {
            labels: Object.keys(revenueByCategory),
            datasets: [{ label: 'Revenue (₹)', data: Object.values(revenueByCategory), backgroundColor: 'rgba(153, 102, 255, 0.6)' }],
          },
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.users} icon={<UsersIcon />} />
        <StatCard title="Total Products" value={stats.products} icon={<ProductsIcon />} />
        <StatCard title="Total Sales" value={stats.sales} icon={<SalesIcon />} />
        <StatCard title="Total Revenue" value={`₹${stats.revenue}`} icon={<RevenueIcon />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Revenue by Product">
          <Bar options={{ responsive: true, maintainAspectRatio: false }} data={chartData.revenueByProduct} />
        </ChartCard>
        <ChartCard title="Top Selling Products">
          <Bar options={{ responsive: true, maintainAspectRatio: false }} data={chartData.topSellingProducts} />
        </ChartCard>
        <ChartCard title="Revenue by Category">
          <Bar options={{ responsive: true, maintainAspectRatio: false }} data={chartData.revenueByCategory} />
        </ChartCard>
        <ChartCard title="Order Status Distribution">
          <Pie options={{ responsive: true, maintainAspectRatio: false }} data={chartData.orderStatusDist} />
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
