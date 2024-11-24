<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Role and Permission Management</h1>

        <!-- Roles Section -->
        <div class="mb-12">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Roles</h2>

            <!-- Add Role Button -->
            <button @click="openRoleModal(null)"
                class="mb-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Add New Role
            </button>

            <!-- Role Filters and Search -->
            <div class="mb-4 flex flex-wrap gap-4 items-center">
                <div class="flex-grow">
                    <input v-model="roleSearchQuery" type="text" placeholder="Search roles..."
                        class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="handleRoleSearch">
                </div>
                <select v-model="roleSortBy"
                    class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @change="handleRoleSort">
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                    <option value="permissions_asc">Permissions: Least to Most</option>
                    <option value="permissions_desc">Permissions: Most to Least</option>
                </select>
            </div>

            <!-- Roles Table -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Permissions Count</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="role in paginatedRoles" :key="role.id">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{{ role.name }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-500">{{ role.permissions.length }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button @click="openRoleModal(role)"
                                    class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                                <button @click="deleteRole(role.id)"
                                    class="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Role Pagination -->
            <div class="mt-4 flex justify-between items-center">
                <div>
                    <p class="text-sm text-gray-700">
                        Showing {{ roleStartIndex + 1 }} to {{ roleEndIndex }} of {{ filteredRoles.length }} results
                    </p>
                </div>
                <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <a href="#"
                            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            @click.prevent="prevRolePage">
                            <span class="sr-only">Previous</span>
                            <ChevronLeftIcon class="h-5 w-5" />
                        </a>
                        <a href="#" v-for="page in roleTotalPages" :key="page"
                            :class="['relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium', roleCurrentPage === page ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50']"
                            @click.prevent="goToRolePage(page)">
                            {{ page }}
                        </a>
                        <a href="#"
                            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            @click.prevent="nextRolePage">
                            <span class="sr-only">Next</span>
                            <ChevronRightIcon class="h-5 w-5" />
                        </a>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Permissions Section -->
        <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Permissions</h2>

            <!-- Add Permission Button -->
            <button @click="openPermissionModal(null)"
                class="mb-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                Add New Permission
            </button>

            <!-- Permission Filters and Search -->
            <div class="mb-4 flex flex-wrap gap-4 items-center">
                <div class="flex-grow">
                    <input v-model="permissionSearchQuery" type="text" placeholder="Search permissions..."
                        class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        @input="handlePermissionSearch">
                </div>
                <select v-model="permissionSortBy"
                    class="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @change="handlePermissionSort">
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                </select>
            </div>

            <!-- Permissions Table -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Permission Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="permission in paginatedPermissions" :key="permission.id">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{{ permission.name }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-500">{{ permission.description }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button @click="openPermissionModal(permission)"
                                    class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                                <button @click="deletePermission(permission.id)"
                                    class="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Permission Pagination -->
            <div class="mt-4 flex justify-between items-center">
                <div>
                    <p class="text-sm text-gray-700">
                        Showing {{ permissionStartIndex + 1 }} to {{ permissionEndIndex }} of {{
                        filteredPermissions.length }} results
                    </p>
                </div>
                <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <a href="#"
                            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            @click.prevent="prevPermissionPage">
                            <span class="sr-only">Previous</span>
                            <ChevronLeftIcon class="h-5 w-5" />
                        </a>
                        <a href="#" v-for="page in permissionTotalPages" :key="page"
                            :class="['relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium', permissionCurrentPage === page ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50']"
                            @click.prevent="goToPermissionPage(page)">
                            {{ page }}
                        </a>
                        <a href="#"
                            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            @click.prevent="nextPermissionPage">
                            <span class="sr-only">Next</span>
                            <ChevronRightIcon class="h-5 w-5" />
                        </a>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Role Modal -->
        <div v-if="showRoleModal"
            class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 class="text-2xl font-bold mb-4">{{ editingRole ? 'Edit Role' : 'Add New Role' }}</h2>
                <form @submit.prevent="saveRole">
                    <div class="mb-4">
                        <label for="roleName" class="block text-sm font-medium text-gray-700">Role Name</label>
                        <input type="text" id="roleName" v-model="roleForm.name" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700">Permissions</label>
                        <div class="mt-2 space-y-2">
                            <div v-for="permission in permissions" :key="permission.id" class="flex items-center">
                                <input :id="'permission-' + permission.id" type="checkbox" :value="permission.id"
                                    v-model="roleForm.permissions"
                                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                                <label :for="'permission-' + permission.id" class="ml-2 block text-sm text-gray-900">
                                    {{ permission.name }}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end">
                        <button type="button" @click="closeRoleModal"
                            class="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancel
                        </button>
                        <button type="submit"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            {{ editingRole ? 'Update' : 'Add' }} Role
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Permission Modal -->
        <div v-if="showPermissionModal"
            class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 class="text-2xl font-bold mb-4">{{ editingPermission ? 'Edit Permission' : 'Add New Permission' }}
                </h2>
                <form @submit.prevent="savePermission">
                    <div class="mb-4">
                        <label for="permissionName" class="block text-sm font-medium text-gray-700">Permission
                            Name</label>
                        <input type="text" id="permissionName" v-model="permissionForm.name" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>
                    <div class="mb-4">
                        <label for="permissionDescription"
                            class="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="permissionDescription" v-model="permissionForm.description" rows="3"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"></textarea>
                    </div>
                    <div class="flex justify-end">
                        <button type="button" @click="closePermissionModal"
                            class="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cancel
                        </button>
                        <button type="submit"
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            {{ editingPermission ? 'Update' : 'Add' }} Permission
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
const generateMockData = () => {
    const mockPermissions = [
        { id: 1, name: 'manage_products', description: 'Create, read, update, and delete products' },
        { id: 2, name: 'manage_categories', description: 'Create, read, update, and delete categories' },
        { id: 3, name: 'manage_customers', description: 'Create, read, update, and delete customer information' },
        { id: 4, name: 'manage_orders', description: 'View and update order status' },
        { id: 5, name: 'manage_employees', description: 'Create, read, update, and delete employee accounts' },
        { id: 6, name: 'manage_roles', description: 'Create, read, update, and delete roles and permissions' },
        { id: 7, name: 'view_reports', description: 'Access and view sales and inventory reports' },
    ];

    const mockRoles = [
        { id: 1, name: 'Admin', permissions: [1, 2, 3, 4, 5, 6, 7] },
        { id: 2, name: 'Manager', permissions: [1, 2, 3, 4, 7] },
        { id: 3, name: 'Employee', permissions: [1, 2, 3, 4] },
    ];

    return { mockPermissions, mockRoles };
};

const { mockPermissions, mockRoles } = generateMockData();

const roles = ref(mockRoles);
const permissions = ref(mockPermissions);

// Roles CRUD
const roleSearchQuery = ref('');
const roleSortBy = ref('name_asc');
const roleCurrentPage = ref(1);
const roleItemsPerPage = 5;

const filteredRoles = computed(() => {
    let result = roles.value;

    if (roleSearchQuery.value) {
        result = result.filter(role =>
            role.name.toLowerCase().includes(roleSearchQuery.value.toLowerCase())
        );
    }

    result.sort((a, b) => {
        switch (roleSortBy.value) {
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            case 'permissions_asc':
                return a.permissions.length - b.permissions.length;
            case 'permissions_desc':
                return b.permissions.length - a.permissions.length;
            default:
                return 0;
        }
    });

    return result;
});

const roleTotalPages = computed(() => Math.ceil(filteredRoles.value.length / roleItemsPerPage));
const roleStartIndex = computed(() => (roleCurrentPage.value - 1) * roleItemsPerPage);
const roleEndIndex = computed(() => Math.min(roleStartIndex.value + roleItemsPerPage, filteredRoles.value.length));
const paginatedRoles = computed(() => filteredRoles.value.slice(roleStartIndex.value, roleEndIndex.value));

const handleRoleSearch = () => {
    roleCurrentPage.value = 1;
};

const handleRoleSort = () => {
    roleCurrentPage.value = 1;
};

const prevRolePage = () => {
    if (roleCurrentPage.value > 1) {
        roleCurrentPage.value--;
    }
};

const nextRolePage = () => {
    if (roleCurrentPage.value < roleTotalPages.value) {
        roleCurrentPage.value++;
    }
};

const goToRolePage = (page) => {
    roleCurrentPage.value = page;
};

const showRoleModal = ref(false);
const editingRole = ref(null);
const roleForm = ref({ name: '', permissions: [] });

const openRoleModal = (role) => {
    if (role) {
        editingRole.value = role;
        roleForm.value = { ...role };
    } else {
        editingRole.value = null;
        roleForm.value = { name: '', permissions: [] };
    }
    showRoleModal.value = true;
};

const closeRoleModal = () => {
    showRoleModal.value = false;
    editingRole.value = null;
};

const saveRole = () => {
    if (editingRole.value) {
        const index = roles.value.findIndex(r => r.id === editingRole.value.id);
        if (index !== -1) {
            roles.value[index] = { ...roles.value[index], ...roleForm.value };
        }
    } else {
        const newRole = {
            id: roles.value.length + 1,
            ...roleForm.value
        };
        roles.value.push(newRole);
    }
    closeRoleModal();
};

const deleteRole = (roleId) => {
    if (confirm('Are you sure you want to delete this role?')) {
        roles.value = roles.value.filter(r => r.id !== roleId);
    }
};

// Permissions CRUD
const permissionSearchQuery = ref('');
const permissionSortBy = ref('name_asc');
const permissionCurrentPage = ref(1);
const permissionItemsPerPage = 5;

const filteredPermissions = computed(() => {
    let result = permissions.value;

    if (permissionSearchQuery.value) {
        result = result.filter(permission =>
            permission.name.toLowerCase().includes(permissionSearchQuery.value.toLowerCase()) ||
            permission.description.toLowerCase().includes(permissionSearchQuery.value.toLowerCase())
        );
    }

    result.sort((a, b) => {
        switch (permissionSortBy.value) {
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });

    return result;
});

const permissionTotalPages = computed(() => Math.ceil(filteredPermissions.value.length / permissionItemsPerPage));
const permissionStartIndex = computed(() => (permissionCurrentPage.value - 1) * permissionItemsPerPage);
const permissionEndIndex = computed(() => Math.min(permissionStartIndex.value + permissionItemsPerPage, filteredPermissions.value.length));
const paginatedPermissions = computed(() => filteredPermissions.value.slice(permissionStartIndex.value, permissionEndIndex.value));

const handlePermissionSearch = () => {
    permissionCurrentPage.value = 1;
};

const handlePermissionSort = () => {
    permissionCurrentPage.value = 1;
};

const prevPermissionPage = () => {
    if (permissionCurrentPage.value > 1) {
        permissionCurrentPage.value--;
    }
};

const nextPermissionPage = () => {
    if (permissionCurrentPage.value < permissionTotalPages.value) {
        permissionCurrentPage.value++;
    }
};

const goToPermissionPage = (page) => {
    permissionCurrentPage.value = page;
};

const showPermissionModal = ref(false);
const editingPermission = ref(null);
const permissionForm = ref({ name: '', description: '' });

const openPermissionModal = (permission) => {
    if (permission) {
        editingPermission.value = permission;
        permissionForm.value = { ...permission };
    } else {
        editingPermission.value = null;
        permissionForm.value = { name: '', description: '' };
    }
    showPermissionModal.value = true;
};

const closePermissionModal = () => {
    showPermissionModal.value = false;
    editingPermission.value = null;
};

const savePermission = () => {
    if (editingPermission.value) {
        const index = permissions.value.findIndex(p => p.id === editingPermission.value.id);
        if (index !== -1) {
            permissions.value[index] = { ...permissions.value[index], ...permissionForm.value };
        }
    } else {
        const newPermission = {
            id: permissions.value.length + 1,
            ...permissionForm.value
        };
        permissions.value.push(newPermission);
    }
    closePermissionModal();
};

const deletePermission = (permissionId) => {
    if (confirm('Are you sure you want to delete this permission?')) {
        permissions.value = permissions.value.filter(p => p.id !== permissionId);
        // Remove the permission from all roles
        roles.value = roles.value.map(role => ({
            ...role,
            permissions: role.permissions.filter(id => id !== permissionId)
        }));
    }
};

onMounted(() => {
    // Any initialization logic can go here
});
</script>