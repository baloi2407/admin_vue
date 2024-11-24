<template>
      <!-- Dashboard Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <!-- Revenue Overview -->
            <div class="bg-white p-4 rounded-lg shadow">
              <h2 class="text-lg font-semibold mb-4">Revenue Overview</h2>
              <div class="h-48">
                <LineChart :data="revenueData" />
              </div>
            </div>

            <!-- Latest Orders -->
            <div class="bg-white p-4 rounded-lg shadow">
              <h2 class="text-lg font-semibold mb-4">Latest Orders</h2>
              <ul class="space-y-2">
                <li v-for="order in latestOrders" :key="order.id" class="flex justify-between items-center">
                  <span>{{ order.id }}</span>
                  <span :class="{ 'text-green-500': order.status === 'Completed', 'text-yellow-500': order.status === 'Pending' }">
                    {{ order.status }}
                  </span>
                </li>
              </ul>
            </div>

            <!-- Inventory Status -->
            <div class="bg-white p-4 rounded-lg shadow">
              <h2 class="text-lg font-semibold mb-4">Inventory Status</h2>
              <div class="h-48">
                <DoughnutChart :data="inventoryData" />
              </div>
            </div>

            <!-- New Customers -->
            <div class="bg-white p-4 rounded-lg shadow">
              <h2 class="text-lg font-semibold mb-4">New Customers</h2>
              <ul class="space-y-2">
                <li v-for="customer in newCustomers" :key="customer.id" class="flex items-center">
                  <img :src="customer.avatar" alt="Customer avatar" class="w-8 h-8 rounded-full mr-2">
                  <span>{{ customer.name }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

</template>

<script setup>
import { Line, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const revenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [12000, 19000, 15000, 22000, 18000, 25000],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }
  ]
};

const inventoryData = {
  labels: ['In Stock', 'Low Stock', 'Out of Stock'],
  datasets: [
    {
      data: [300, 50, 100],
      backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
    }
  ]
};

const latestOrders = [
  { id: '#1234', status: 'Completed' },
  { id: '#1235', status: 'Pending' },
  { id: '#1236', status: 'Completed' },
  { id: '#1237', status: 'Pending' }
];

const newCustomers = [
  { id: 1, name: 'John Doe', avatar: '/placeholder.svg?height=32&width=32' },
  { id: 2, name: 'Jane Smith', avatar: '/placeholder.svg?height=32&width=32' },
  { id: 3, name: 'Bob Johnson', avatar: '/placeholder.svg?height=32&width=32' }
];

const LineChart = Line;
const DoughnutChart = Doughnut;
</script>

<style scoped>
/* Add any additional styles here */
</style>