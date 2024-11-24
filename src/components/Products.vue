<template>
    <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Add Product Button -->
            <div class="mb-6">
                <button @click="openProductModal(null)"
                    class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    Add New Product
                </button>
            </div>

            <!-- Filters and Search -->
            <div class="mb-6 flex flex-wrap gap-4 items-center">
                <div class="flex-grow">
                    <input v-model="searchQuery" type="text" placeholder="Search products..."
                        class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="handleSearch">
                </div>
                <select v-model="selectedCategory"
                    class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @change="handleCategoryFilter">
                    <option value="">All Categories</option>
                    <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                </select>
                <select v-model="sortBy"
                    class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @change="handleSort">
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                </select>
            </div>

            <!-- Product Table -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="product in paginatedProducts" :key="product.id">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-10 w-10">
                                        <img class="h-10 w-10 rounded-full" :src="product.image" :alt="product.title">
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">{{ product.title }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">{{ product.category }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${{ product.price.toFixed(2) }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button @click="openProductModal(product)"
                                    class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                                <button @click="deleteProduct(product.id)"
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
                        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredProducts.length }} results
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

            <!-- Product Modal -->
            <div v-if="showProductModal"
                class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                    <h2 class="text-2xl font-bold mb-4">{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
                    <form @submit.prevent="saveProduct">
                        <div class="mb-4">
                            <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" id="title" v-model="productForm.title" required
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>
                        <div class="mb-4">
                            <label for="price" class="block text-sm font-medium text-gray-700">Price</label>
                            <input type="number" id="price" v-model="productForm.price" required step="0.01"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>
                        <div class="mb-4">
                            <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
                            <select id="category" v-model="productForm.category" required
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                <option v-for="category in categories" :key="category" :value="category">{{ category }}
                                </option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" v-model="productForm.description" rows="3"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"></textarea>
                        </div>
                        <div class="mb-4">
                            <label for="image" class="block text-sm font-medium text-gray-700">Image URL</label>
                            <input type="url" id="image" v-model="productForm.image" required
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>
                        <div class="flex justify-end">
                            <button type="button" @click="closeProductModal"
                                class="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Cancel
                            </button>
                            <button type="submit"
                                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                {{ editingProduct ? 'Update' : 'Add' }} Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { UserIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';
// Product data
const products = ref([]);
const categories = ref([]);

// Fetch products from API
const fetchProducts = async () => {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        products.value = await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
    }
};

// Fetch categories from API
const fetchCategories = async () => {
    try {
        const response = await fetch('https://fakestoreapi.com/products/categories');
        categories.value = await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

onMounted(() => {
    fetchProducts();
    fetchCategories();
});

// Filters and search
const searchQuery = ref('');
const selectedCategory = ref('');
const sortBy = ref('price_asc');

const filteredProducts = computed(() => {
    let result = products.value;

    if (searchQuery.value) {
        result = result.filter(product =>
            product.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }

    if (selectedCategory.value) {
        result = result.filter(product => product.category === selectedCategory.value);
    }

    result.sort((a, b) => {
        switch (sortBy.value) {
            case 'price_asc':
                return a.price - b.price;
            case 'price_desc':
                return b.price - a.price;
            case 'name_asc':
                return a.title.localeCompare(b.title);
            case 'name_desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });

    return result;
});

const handleSearch = () => {
    currentPage.value = 1;
};

const handleCategoryFilter = () => {
    currentPage.value = 1;
};

const handleSort = () => {
    currentPage.value = 1;
};

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage));

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredProducts.value.length));

const paginatedProducts = computed(() =>
    filteredProducts.value.slice(startIndex.value, endIndex.value)
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

// Product Modal
const showProductModal = ref(false);
const editingProduct = ref(null);
const productForm = ref({
    title: '',
    price: 0,
    category: '',
    description: '',
    image: ''
});

const openProductModal = (product) => {
    if (product) {
        editingProduct.value = product;
        productForm.value = { ...product };
    } else {
        editingProduct.value = null;
        productForm.value = {
            title: '',
            price: 0,
            category: '',
            description: '',
            image: ''
        };
    }
    showProductModal.value = true;
};

const closeProductModal = () => {
    showProductModal.value = false;
    editingProduct.value = null;
};

const saveProduct = async () => {
    try {
        if (editingProduct.value) {
            // Update existing product
            const response = await fetch(`https://fakestoreapi.com/products/${editingProduct.value.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productForm.value)
            });
            const updatedProduct = await response.json();
            const index = products.value.findIndex(p => p.id === updatedProduct.id);
            if (index !== -1) {
                products.value[index] = updatedProduct;
            }
        } else {
            // Add new product
            const response = await fetch('https://fakestoreapi.com/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productForm.value)
            });
            const newProduct = await response.json();
            products.value.push(newProduct);
        }
        closeProductModal();
    } catch (error) {
        console.error('Error saving product:', error);
    }
};

const deleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await fetch(`https://fakestoreapi.com/products/${productId}`, {
                method: 'DELETE'
            });
            products.value = products.value.filter(p => p.id !== productId);
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }
};
</script>