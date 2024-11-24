<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Add Employee Button -->
    <div class="mb-6">
      <button @click="openEmployeeModal(null)" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" :disabled="!canCreate">
        Add New Employee
      </button>
    </div>

    <!-- Filters and Search -->
    <div class="mb-6 flex flex-wrap gap-4 items-center">
      <div class="flex-grow">
        <input v-model="searchQuery" type="text" placeholder="Search employees..." class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" @input="handleSearch">
      </div>
      <select v-model="filterDepartment" class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" @change="handleDepartmentFilter">
        <option value="">All Departments</option>
        <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
      </select>
      <select v-model="sortBy" class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" @change="handleSort">
        <option value="name_asc">Name: A to Z</option>
        <option value="name_desc">Name: Z to A</option>
        <option value="hireDate_asc">Hire Date: Oldest First</option>
        <option value="hireDate_desc">Hire Date: Newest First</option>
      </select>
    </div>

    <!-- Employee Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="employee in paginatedEmployees" :key="employee.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ employee.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ employee.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ employee.department }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {{ employee.role }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(employee.hireDate) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="openEmployeeModal(employee)" class="text-indigo-600 hover:text-indigo-900 mr-2" :disabled="!canUpdate">Edit</button>
              <button @click="deleteEmployee(employee.id)" class="text-red-600 hover:text-red-900" :disabled="!canDelete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex justify-between items-center">
      <div>
        <p class="text-sm text-gray-700">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredEmployees.length }} results
        </p>
      </div>
      <div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" @click.prevent="prevPage">
            <span class="sr-only">Previous</span>
            <ChevronLeftIcon class="h-5 w-5" />
          </a>
          <a href="#" v-for="page in totalPages" :key="page" :class="['relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium', currentPage === page ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50']" @click.prevent="goToPage(page)">
            {{ page }}
          </a>
          <a href="#" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" @click.prevent="nextPage">
            <span class="sr-only">Next</span>
            <ChevronRightIcon class="h-5 w-5" />
          </a>
        </nav>
      </div>
    </div>

    <!-- Employee Modal -->
    <div v-if="showEmployeeModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">{{ editingEmployee ? 'Edit Employee' : 'Add New Employee' }}</h2>
        <form @submit.prevent="saveEmployee">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" id="name" v-model="employeeForm.name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
          </div>
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" v-model="employeeForm.email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
          </div>
          <div class="mb-4">
            <label for="department" class="block text-sm font-medium text-gray-700">Department</label>
            <select id="department" v-model="employeeForm.department" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
            <select id="role" v-model="employeeForm.role" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="hireDate" class="block text-sm font-medium text-gray-700">Hire Date</label>
            <input type="date" id="hireDate" v-model="employeeForm.hireDate" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
          </div>
          <div class="flex justify-end">
            <button type="button" @click="closeEmployeeModal" class="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {{ editingEmployee ? 'Update' : 'Add' }} Employee
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
import { useAuth } from '../../composables/useAuth';

const { hasPermission } = useAuth();

// Employee data
const employees = ref([]);
const departments = ['Sales', 'Marketing', 'IT', 'HR', 'Finance', 'Operations'];
const roles = ['Employee', 'Manager', 'Director', 'VP', 'C-Level'];

// Fetch employees (simulated API call)
const fetchEmployees = async () => {
  // Simulated API response
  const response = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', department: 'Sales', role: 'Manager', hireDate: '2022-03-15' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', department: 'IT', role: 'Employee', hireDate: '2023-01-10' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', department: 'Marketing', role: 'Director', hireDate: '2021-11-05' },
    { id: 4, name: 'Diana Ross', email: 'diana@example.com', department: 'HR', role: 'Manager', hireDate: '2022-07-20' },
    { id: 5, name: 'Edward Norton', email: 'edward@example.com', department: 'Finance', role: 'Employee', hireDate: '2023-04-01' },
    // Add more employees as needed
  ];
  employees.value = response;
};

onMounted(fetchEmployees);

// Filters and search
const searchQuery = ref('');
const filterDepartment = ref('');
const sortBy = ref('name_asc');

const filteredEmployees = computed(() => {
  let result = employees.value;

  if (searchQuery.value) {
    result = result.filter(employee => 
      employee.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (filterDepartment.value) {
    result = result.filter(employee => employee.department === filterDepartment.value);
  }

  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'hireDate_asc':
        return new Date(a.hireDate) - new Date(b.hireDate);
      case 'hireDate_desc':
        return new Date(b.hireDate) - new Date(a.hireDate);
      default:
        return 0;
    }
  });

  return result;
});

const handleSearch = () => {
  currentPage.value = 1;
};

const handleDepartmentFilter = () => {
  currentPage.value = 1;
};

const handleSort = () => {
  currentPage.value = 1;
};

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

const totalPages = computed(() => Math.ceil(filteredEmployees.value.length / itemsPerPage));

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredEmployees.value.length));

const paginatedEmployees = computed(() => 
  filteredEmployees.value.slice(startIndex.value, endIndex.value)
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

// Employee Modal
const showEmployeeModal = ref(false);
const editingEmployee = ref(null);
const employeeForm = ref({
  name: '',
  email: '',
  department: '',
  role: '',
  hireDate: ''
});

const openEmployeeModal = (employee) => {
  if (employee) {
    editingEmployee.value = employee;
    employeeForm.value = { ...employee };
  } else {
    editingEmployee.value = null;
    employeeForm.value = {
      name: '',
      email: '',
      department: '',
      role: '',
      hireDate: ''
    };
  }
  showEmployeeModal.value = true;
};

const closeEmployeeModal = () => {
  showEmployeeModal.value = false;
  editingEmployee.value = null;
};

const saveEmployee = async () => {
  try {
    if (editingEmployee.value) {
      // Update existing employee
      const index = employees.value.findIndex(e => e.id === editingEmployee.value.id);
      if (index !== -1) {
        employees.value[index] = { ...employees.value[index], ...employeeForm.value };
      }
    } else {
      // Add new employee
      const newEmployee = {
        id: employees.value.length + 1,
        ...employeeForm.value
      };
      employees.value.push(newEmployee);
    }
    closeEmployeeModal();
  } catch (error) {
    console.error('Error saving employee:', error);
  }
};

const deleteEmployee = async (employeeId) => {
  if (confirm('Are you sure you want to delete this employee?')) {
    try {
      employees.value = employees.value.filter(e => e.id !== employeeId);
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  }
};

// Authorization
const canCreate = computed(() => hasPermission('manage_employees'));
const canUpdate = computed(() => hasPermission('manage_employees'));
const canDelete = computed(() => hasPermission('manage_employees'));

// Utility functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
</script>