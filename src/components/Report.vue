<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Sales Report</h1>

    <!-- Filters and Search -->
    <div class="mb-6 flex flex-wrap gap-4 items-center">
      <div class="flex-grow">
        <input v-model="searchQuery" type="text" placeholder="Search orders..."
          class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="handleSearch">
      </div>
      <div class="flex items-center space-x-2">
        <label for="startDate" class="text-sm font-medium text-gray-700">Start Date:</label>
        <input type="date" id="startDate" v-model="startDate"
          class="px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="applyFilters">
      </div>
      <div class="flex items-center space-x-2">
        <label for="endDate" class="text-sm font-medium text-gray-700">End Date:</label>
        <input type="date" id="endDate" v-model="endDate"
          class="px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="applyFilters">
      </div>
      <select v-model="selectedCategory"
        class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @change="applyFilters">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
      </select>
      <select v-model="sortBy"
        class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @change="handleSort">
        <option value="date_desc">Date: Newest First</option>
        <option value="date_asc">Date: Oldest First</option>
        <option value="total_desc">Total: High to Low</option>
        <option value="total_asc">Total: Low to High</option>
      </select>
    </div>

    <!-- Sales Chart -->
    <div class="mb-8 bg-white p-4 rounded-lg shadow">
      <canvas ref="salesChartRef"></canvas>
    </div>

    <!-- Sales Summary -->
    <div class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Total Sales</h2>
        <p class="text-3xl font-bold text-green-600">${{ totalSales.toFixed(2) }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Total Orders</h2>
        <p class="text-3xl font-bold text-blue-600">{{ totalOrders }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Average Order Value</h2>
        <p class="text-3xl font-bold text-purple-600">${{ averageOrderValue.toFixed(2) }}</p>
      </div>
    </div>

    <!-- Sales Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="order in paginatedOrders" :key="order.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ order.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(order.date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.customer }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.category }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ order.total.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex justify-between items-center">
      <div>
        <p class="text-sm text-gray-700">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredOrders.length }} results
        </p>
      </div>
      <div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <a href="#"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            @click.prevent="prevPage">
            <span class="sr-only">Previous</span>
            <ChevronLeftIcon class="h-5 w-5" />
          </a>
          <a href="#" v-for="page in totalPages" :key="page"
            :class="['relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium', currentPage === page ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50']"
            @click.prevent="goToPage(page)">
            {{ page }}
          </a>
          <a href="#"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            @click.prevent="nextPage">
            <span class="sr-only">Next</span>
            <ChevronRightIcon class="h-5 w-5" />
          </a>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';
import Chart from 'chart.js/auto';

// Mock data generation
const generateMockData = (count) => {
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Toys'];
  const customers = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'];
  const currentDate = new Date();
  const orders = [];

  for (let i = 0; i < count; i++) {
    const date = new Date(currentDate.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    orders.push({
      id: i + 1,
      date: date,
      customer: customers[Math.floor(Math.random() * customers.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      total: parseFloat((Math.random() * 500 + 50).toFixed(2))
    });
  }

  return orders;
};

const orders = ref(generateMockData(100));
const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Toys'];

// Filters and search
const searchQuery = ref('');
const startDate = ref('');
const endDate = ref('');
const selectedCategory = ref('');
const sortBy = ref('date_desc');

const filteredOrders = computed(() => {
  let result = orders.value;

  if (searchQuery.value) {
    result = result.filter(order =>
      order.customer.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.id.toString().includes(searchQuery.value)
    );
  }

  if (startDate.value) {
    result = result.filter(order => new Date(order.date) >= new Date(startDate.value));
  }

  if (endDate.value) {
    result = result.filter(order => new Date(order.date) <= new Date(endDate.value));
  }

  if (selectedCategory.value) {
    result = result.filter(order => order.category === selectedCategory.value);
  }

  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'date_desc':
        return b.date - a.date;
      case 'date_asc':
        return a.date - b.date;
      case 'total_desc':
        return b.total - a.total;
      case 'total_asc':
        return a.total - b.total;
      default:
        return 0;
    }
  });

  return result;
});

const handleSearch = () => {
  currentPage.value = 1;
};

const applyFilters = () => {
  currentPage.value = 1;
};

const handleSort = () => {
  currentPage.value = 1;
};

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage));

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredOrders.value.length));

const paginatedOrders = computed(() =>
  filteredOrders.value.slice(startIndex.value, endIndex.value)
);

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPage = (page) => {
  currentPage.value = page;
};

// Sales summary
const totalSales = computed(() =>
  filteredOrders.value.reduce((sum, order) => sum + order.total, 0)
);

const totalOrders = computed(() => filteredOrders.value.length);

const averageOrderValue = computed(() =>
  totalOrders.value > 0 ? totalSales.value / totalOrders.value : 0
);

// Chart
const salesChartRef = ref(null);
let salesChart = null;

const updateChart = () => {
  if (!salesChartRef.value) return;

  const ctx = salesChartRef.value.getContext('2d');
  const dailySales = {};

  filteredOrders.value.forEach(order => {
    const date = new Date(order.date).toISOString().split('T')[0];
    dailySales[date] = (dailySales[date] || 0) + order.total;
  });

  const sortedDates = Object.keys(dailySales).sort();

  if (salesChart) {
    salesChart.data.labels = sortedDates;
    salesChart.data.datasets[0].data = sortedDates.map(date => dailySales[date]);
    salesChart.update();
  } else {
    salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedDates,
        datasets: [{
          label: 'Daily Sales',
          data: sortedDates.map(date => dailySales[date]),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Sales ($)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
  }
};

onMounted(() => {
  updateChart();
});

watch(filteredOrders, () => {
  updateChart();
});

// Utility functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
</script>