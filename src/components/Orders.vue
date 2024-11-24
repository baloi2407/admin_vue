<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Order Management</h1>

    <!-- Filters and Search -->
    <div class="mb-6 flex flex-wrap gap-4 items-center">
      <div class="flex-grow">
        <input v-model="searchQuery" type="text" placeholder="Search orders..."
          class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="handleSearch">
      </div>
      <select v-model="filterStatus"
        class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @change="handleStatusFilter">
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
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

    <!-- Order Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="order in paginatedOrders" :key="order.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">#{{ order.id }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(order.date) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ order.customerId }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">${{ order.total.toFixed(2) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(order.status)">
                {{ order.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="openOrderModal(order)" class="text-indigo-600 hover:text-indigo-900 mr-2">View</button>
              <button @click="deleteOrder(order.id)" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
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

    <!-- Order Modal -->
    <div v-if="showOrderModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 class="text-2xl font-bold mb-4">Order Details</h2>
        <div v-if="selectedOrder" class="space-y-4">
          <div class="flex justify-between">
            <span class="font-semibold">Order ID:</span>
            <span>#{{ selectedOrder.id }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold">Date:</span>
            <span>{{ formatDate(selectedOrder.date) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold">Customer:</span>
            <span>{{ selectedOrder.customer }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold">Total:</span>
            <span>${{ selectedOrder.total.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold">Status:</span>
            <select v-model="selectedOrder.status"
              class="px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <h3 class="font-semibold mb-2">Order Items:</h3>
            <ul class="list-disc list-inside">
              <li v-for="item in selectedOrder.items" :key="item.id">
                {{ item.name }} - Quantity: {{ item.quantity }} - ${{ item.price.toFixed(2) }}
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button @click="closeOrderModal"
            class="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Close
          </button>
          <button @click="updateOrderStatus"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Update Status
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';

// Custom order data
const generateMockOrders = (count) => {
  const orders = [];
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const customers = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Williams', 'Charlie Brown'];

  for (let i = 1; i <= count; i++) {
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const items = [];
    let total = 0;

    for (let j = 1; j <= itemCount; j++) {
      const price = parseFloat((Math.random() * 100 + 10).toFixed(2));
      const quantity = Math.floor(Math.random() * 3) + 1;
      items.push({
        id: j,
        name: `Product ${j}`,
        price: price,
        quantity: quantity
      });
      total += price * quantity;
    }

    orders.push({
      id: i,
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      customer: customers[Math.floor(Math.random() * customers.length)],
      total: parseFloat(total.toFixed(2)),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      items: items
    });
  }

  return orders;
};

const orders = ref([]);

// Fetch orders from API (commented out for future use)
const fetchOrders = async () => {
  try {
    const response = await fetch('http://localhost:3000/orders');
    if (!response.ok) throw new Error('Failed to fetch orders');
    const data = await response.json();
    orders.value = data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Optionally, show an error message to the user
  }
};

onMounted(() => {
  // Uncomment the following line when ready to fetch from API
  fetchOrders();
});

// Filters and search
const searchQuery = ref('');
const filterStatus = ref('');
const sortBy = ref('date_desc');

const filteredOrders = computed(() => {
  let result = orders.value;

  if (searchQuery.value) {
    result = result.filter(order =>
      order.id.toString().includes(searchQuery.value) ||
      order.customer.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (filterStatus.value) {
    result = result.filter(order => order.status === filterStatus.value);
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

const handleStatusFilter = () => {
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

// Order Modal
const showOrderModal = ref(false);
const selectedOrder = ref(null);

const openOrderModal = (order) => {
  selectedOrder.value = { ...order };
  showOrderModal.value = true;
};

const closeOrderModal = () => {
  showOrderModal.value = false;
  selectedOrder.value = null;
};

const updateOrderStatus = async () => {
  try {
    // Simulating API call (replace with actual API call when ready)
    // const response = await fetch(`https://api.example.com/orders/${selectedOrder.value.id}`, {
    //   method: 'PATCH',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ status: selectedOrder.value.status }),
    // });
    // if (!response.ok) throw new Error('Failed to update order status');

    const index = orders.value.findIndex(o => o.id === selectedOrder.value.id);
    if (index !== -1) {
      orders.value[index].status = selectedOrder.value.status;
    }
    closeOrderModal();
  } catch (error) {
    console.error('Error updating order status:', error);
    // Handle error (e.g., show error message to user)
  }
};

const deleteOrder = async (orderId) => {
  if (confirm('Are you sure you want to delete this order?')) {
    try {
      // Simulating API call (replace with actual API call when ready)
      // await fetch(`https://api.example.com/orders/${orderId}`, { method: 'DELETE' });
      orders.value = orders.value.filter(o => o.id !== orderId);
    } catch (error) {
      console.error('Error deleting order:', error);
      // Handle error (e.g., show error message to user)
    }
  }
};

// Utility functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusClass = (status) => {
  const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
  switch (status) {
    case 'pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'processing':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'shipped':
      return `${baseClasses} bg-purple-100 text-purple-800`;
    case 'delivered':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'cancelled':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return baseClasses;
  }
};
</script>