<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Customer Management</h1>

        <!-- Filters and Search -->
        <div class="mb-6 flex flex-wrap gap-4 items-center">
            <div class="flex-grow">
                <input v-model="searchQuery" type="text" placeholder="Search customers..."
                    class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @input="handleSearch">
            </div>
            <select v-model="filterStatus"
                class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @change="handleStatusFilter">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
            <select v-model="sortBy"
                class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @change="handleSort">
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="spent_desc">Total Spent: High to Low</option>
                <option value="spent_asc">Total Spent: Low to High</option>
                <option value="orders_desc">Orders: Most to Least</option>
                <option value="orders_asc">Orders: Least to Most</option>
            </select>
        </div>

        <!-- Customer Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total
                            Spent</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Orders</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="customer in paginatedCustomers" :key="customer.id">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">{{ customer.name }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-500">{{ customer.email }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">${{ customer.totalSpent.toFixed(2) }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">{{ customer.orderCount }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="getStatusClass(customer.status)">
                                {{ customer.status }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button @click="viewCustomerDetails(customer)"
                                class="text-indigo-600 hover:text-indigo-900 mr-2">View</button>
                            <button @click="editCustomer(customer)"
                                class="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                            <button @click="deleteCustomer(customer.id)"
                                class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="mt-4 flex justify-between items-center">
            <div>
                <p class="text-sm text-gray-700">
                    Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredCustomers.length }} results
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

        <!-- Customer Details Modal -->
        <div v-if="showCustomerModal"
            class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 class="text-2xl font-bold mb-4">Customer Details</h2>
                <div v-if="selectedCustomer" class="space-y-4">
                    <div class="flex justify-between">
                        <span class="font-semibold">Name:</span>
                        <span>{{ selectedCustomer.name }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-semibold">Email:</span>
                        <span>{{ selectedCustomer.email }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-semibold">Total Spent:</span>
                        <span>${{ selectedCustomer.totalSpent.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-semibold">Order Count:</span>
                        <span>{{ selectedCustomer.orderCount }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-semibold">Status:</span>
                        <span :class="getStatusClass(selectedCustomer.status)">{{ selectedCustomer.status }}</span>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-2">Recent Orders:</h3>
                        <ul class="list-disc list-inside">
                            <li v-for="order in selectedCustomer.recentOrders" :key="order.id">
                                Order #{{ order.id }} - ${{ order.total.toFixed(2) }} - {{ formatDate(order.date) }}
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-2">Notes:</h3>
                        <textarea v-model="customerNotes" rows="3"
                            class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                            placeholder="Add notes about this customer..."></textarea>
                    </div>
                </div>
                <div class="mt-6 flex justify-end">
                    <button @click="closeCustomerModal"
                        class="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Close
                    </button>
                    <button @click="saveCustomerNotes"
                        class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Save Notes
                    </button>
                </div>
            </div>
        </div>

        <!-- Edit Customer Modal -->
        <div v-if="showEditModal"
            class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 class="text-2xl font-bold mb-4">Edit Customer</h2>
                <form @submit.prevent="saveCustomerEdit">
                    <div class="mb-4">
                        <label for="editName" class="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" id="editName" v-model="editingCustomer.name" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div class="mb-4">
                        <label for="editEmail" class="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="editEmail" v-model="editingCustomer.email" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div class="mb-4">
                        <label for="editStatus" class="block text-sm font-medium text-gray-700">Status</label>
                        <select id="editStatus" v-model="editingCustomer.status"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div class="flex justify-end">
                        <button type="button" @click="closeEditModal"
                            class="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancel
                        </button>
                        <button type="submit"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';

// Mock data generation
const generateMockData = (count) => {
    const customers = [];
    const statuses = ['active', 'inactive'];

    for (let i = 0; i < count; i++) {
        const orderCount = Math.floor(Math.random() * 20) + 1;
        const totalSpent = parseFloat((Math.random() * 1000 + 50).toFixed(2));
        const recentOrders = [];

        for (let j = 0; j < Math.min(orderCount, 5); j++) {
            recentOrders.push({
                id: Math.floor(Math.random() * 10000) + 1,
                total: parseFloat((Math.random() * 200 + 20).toFixed(2)),
                date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
            });
        }

        customers.push({
            id: i + 1,
            name: `Customer ${i + 1}`,
            email: `customer${i + 1}@example.com`,
            totalSpent: totalSpent,
            orderCount: orderCount,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            recentOrders: recentOrders,
            notes: ''
        });
    }

    return customers;
};

const customers = ref(generateMockData(100));

// Filters and search
const searchQuery = ref('');
const filterStatus = ref('');
const sortBy = ref('name_asc');

const filteredCustomers = computed(() => {
    let result = customers.value;

    if (searchQuery.value) {
        result = result.filter(customer =>
            customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }

    if (filterStatus.value) {
        result = result.filter(customer => customer.status === filterStatus.value);
    }

    result.sort((a, b) => {
        switch (sortBy.value) {
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            case 'spent_desc':
                return b.totalSpent - a.totalSpent;
            case 'spent_asc':
                return a.totalSpent - b.totalSpent;
            case 'orders_desc':
                return b.orderCount - a.orderCount;
            case 'orders_asc':
                return a.orderCount - b.orderCount;
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

const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / itemsPerPage));

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredCustomers.value.length));

const paginatedCustomers = computed(() =>
    filteredCustomers.value.slice(startIndex.value, endIndex.value)
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

// Customer Details Modal
const showCustomerModal = ref(false);
const selectedCustomer = ref(null);
const customerNotes = ref('');

const viewCustomerDetails = (customer) => {
    selectedCustomer.value = customer;
    customerNotes.value = customer.notes;
    showCustomerModal.value = true;
};

const closeCustomerModal = () => {
    showCustomerModal.value = false;
    selectedCustomer.value = null;
};

const saveCustomerNotes = () => {
    if (selectedCustomer.value) {
        const index = customers.value.findIndex(c => c.id === selectedCustomer.value.id);
        if (index !== -1) {
            customers.value[index].notes = customerNotes.value;
        }
    }
    closeCustomerModal();
};

// Edit Customer Modal
const showEditModal = ref(false);
const editingCustomer = ref({});

const editCustomer = (customer) => {
  editingCustomer.value = { ...customer };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingCustomer.value = {};
};

const saveCustomerEdit = () => {
  // Find the index of the customer in the array
  const index = customers.value.findIndex(c => c.id === editingCustomer.value.id);
  
  if (index !== -1) {
    // Update the customer in the array
    customers.value[index] = { ...customers.value[index], ...editingCustomer.value };
    
    // Close the modal
    closeEditModal();
    
    // Optional: Show a success message
    alert('Customer updated successfully');
  }
  
  // If working with an API, you would make an API call here instead
  // For example:
  /*
  try {
    const response = await api.updateCustomer(editingCustomer.value.id, editingCustomer.value);
    if (response.ok) {
      // Update the local state
      customers.value[index] = { ...customers.value[index], ...response.data };
      closeEditModal();
      alert('Customer updated successfully');
    } else {
      throw new Error('Failed to update customer');
    }
  } catch (error) {
    console.error('Error updating customer:', error);
    alert('Failed to update customer. Please try again.');
  }
  */
};

const deleteCustomer = (customerId) => {
    if (confirm('Are you sure you want to delete this customer?')) {
        customers.value = customers.value.filter(c => c.id !== customerId);
    }
};

// Utility functions
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusClass = (status) => {
    return status === 'active'
        ? 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'
        : 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800';
};

onMounted(() => {
    // Any initialization logic can go here
});
</script>