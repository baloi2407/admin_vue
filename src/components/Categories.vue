<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Add Category Button -->
        <div class="mb-6">
            <button @click="openCategoryModal(null)"
                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Add New Category
            </button>
        </div>

        <!-- Filters and Search -->
        <div class="mb-6 flex flex-wrap gap-4 items-center">
            <div class="flex-grow">
                <input v-model="searchQuery" type="text" placeholder="Search categories..."
                    class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @input="handleSearch">
            </div>
            <select v-model="sortBy"
                class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @change="handleSort">
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="products_asc">Products: Low to High</option>
                <option value="products_desc">Products: High to Low</option>
            </select>
        </div>

        <!-- Category Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category Name</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Number of Products</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="category in paginatedCategories" :key="category.name">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">{{ category.productCount }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button @click="openCategoryModal(category)"
                                class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                            <button @click="deleteCategory(category.name)"
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
                    Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredCategories.length }} results
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

        <!-- Category Modal -->
        <div v-if="showCategoryModal"
            class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 class="text-2xl font-bold mb-4">{{ editingCategory ? 'Edit Category' : 'Add New Category' }}</h2>
                <form @submit.prevent="saveCategory">
                    <div class="mb-4">
                        <label for="name" class="block text-sm font-medium text-gray-700">Category Name</label>
                        <input type="text" id="name" v-model="categoryForm.name" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div class="mb-4">
                        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" v-model="categoryForm.description" rows="3"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"></textarea>
                    </div>
                    <div class="flex justify-end">
                        <button type="button" @click="closeCategoryModal"
                            class="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancel
                        </button>
                        <button type="submit"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            {{ editingCategory ? 'Update' : 'Add' }} Category
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

// Category data
const categories = ref([]);

// Fetch categories from API
const fetchCategories = async () => {
    try {
        const response = await fetch('https://fakestoreapi.com/products/categories');
        const categoryNames = await response.json();
        const categoriesWithCounts = await Promise.all(categoryNames.map(async (name) => {
            const productsResponse = await fetch(`https://fakestoreapi.com/products/category/${name}`);
            const products = await productsResponse.json();
            return {
                name: name,
                productCount: products.length,
                description: `Description for ${name}` // You might want to store this in your backend in a real application
            };
        }));
        categories.value = categoriesWithCounts;
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

onMounted(fetchCategories);

// Filters and search
const searchQuery = ref('');
const sortBy = ref('name_asc');

const filteredCategories = computed(() => {
    let result = categories.value;

    if (searchQuery.value) {
        result = result.filter(category =>
            category.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            category.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }

    result.sort((a, b) => {
        switch (sortBy.value) {
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            case 'products_asc':
                return a.productCount - b.productCount;
            case 'products_desc':
                return b.productCount - a.productCount;
            default:
                return 0;
        }
    });

    return result;
});

const handleSearch = () => {
    currentPage.value = 1;
};

const handleSort = () => {
    currentPage.value = 1;
};

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

const totalPages = computed(() => Math.ceil(filteredCategories.value.length / itemsPerPage));

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredCategories.value.length));

const paginatedCategories = computed(() =>
    filteredCategories.value.slice(startIndex.value, endIndex.value)
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

// Category Modal
const showCategoryModal = ref(false);
const editingCategory = ref(null);
const categoryForm = ref({
    name: '',
    description: ''
});

const openCategoryModal = (category) => {
    if (category) {
        editingCategory.value = category;
        categoryForm.value = { ...category };
    } else {
        editingCategory.value = null;
        categoryForm.value = {
            name: '',
            description: ''
        };
    }
    showCategoryModal.value = true;
};

const closeCategoryModal = () => {
    showCategoryModal.value = false;
    editingCategory.value = null;
};

const saveCategory = async () => {
    try {
        if (editingCategory.value) {
            // Update existing category
            const index = categories.value.findIndex(c => c.name === editingCategory.value.name);
            if (index !== -1) {
                categories.value[index] = { ...categories.value[index], ...categoryForm.value };
            }
        } else {
            // Add new category
            const newCategory = {
                ...categoryForm.value,
                productCount: 0
            };
            categories.value.push(newCategory);
        }
        closeCategoryModal();
    } catch (error) {
        console.error('Error saving category:', error);
    }
};

const deleteCategory = async (categoryName) => {
    if (confirm('Are you sure you want to delete this category?')) {
        try {
            categories.value = categories.value.filter(c => c.name !== categoryName);
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    }
};
</script>