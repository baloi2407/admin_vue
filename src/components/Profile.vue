<template>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Employee Profile</h1>

        <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="p-6">
                <!-- Avatar Section -->
                <div class="flex items-center space-x-6 mb-6">
                    <div class="relative">
                        <img :src="employee.avatarUrl || '/placeholder.svg?height=128&width=128'" alt="Employee avatar"
                            class="w-32 h-32 rounded-full object-cover">
                        <label for="avatar-upload"
                            class="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer">
                            <UploadIcon class="w-5 h-5 text-gray-600" />
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" class="hidden"
                            @change="handleAvatarUpload">
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">{{ employee.name }}</h2>
                        <p class="text-sm text-gray-500">{{ employee.role }}</p>
                    </div>
                </div>

                <!-- Personal Information Form -->
                <form @submit.prevent="updateProfile">
                    <div class="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="name" v-model="form.name" required
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" id="email" v-model="form.email" required
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>
                        <div>
                            <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" id="phone" v-model="form.phone"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>
                        <div>
                            <label for="department" class="block text-sm font-medium text-gray-700">Department</label>
                            <input type="text" id="department" v-model="form.department"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>
                    </div>

                    <div class="mt-6">
                        <button type="submit"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Update Profile
                        </button>
                    </div>
                </form>

                <!-- Change Password Section -->
                <div class="mt-10">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                    <form @submit.prevent="changePassword">
                        <div class="space-y-4">
                            <div>
                                <label for="current-password" class="block text-sm font-medium text-gray-700">Current
                                    Password</label>
                                <input type="password" id="current-password" v-model="passwordForm.currentPassword"
                                    required
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                            </div>
                            <div>
                                <label for="new-password" class="block text-sm font-medium text-gray-700">New
                                    Password</label>
                                <input type="password" id="new-password" v-model="passwordForm.newPassword" required
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                            </div>
                            <div>
                                <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirm
                                    New Password</label>
                                <input type="password" id="confirm-password" v-model="passwordForm.confirmPassword"
                                    required
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                            </div>
                        </div>
                        <div class="mt-4">
                            <button type="submit"
                                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Role and Permissions Section -->
                <div class="mt-10">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Role and Permissions</h3>
                    <div class="bg-gray-50 rounded-md p-4">
                        <p class="font-medium text-gray-700">Current Role: {{ employee.role }}</p>
                        <div class="mt-2">
                            <h4 class="text-sm font-medium text-gray-700">Permissions:</h4>
                            <ul class="mt-2 space-y-1">
                                <li v-for="permission in employee.permissions" :key="permission"
                                    class="text-sm text-gray-600">
                                    {{ permission }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="message"
            :class="['mt-4 p-4 rounded-md', message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
            {{ message.text }}
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { UploadIcon } from 'lucide-vue-next';

// Mock employee data
const employee = reactive({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    department: 'Sales',
    role: 'Sales Manager',
    avatarUrl: null,
    permissions: ['manage_products', 'view_reports', 'manage_customers']
});

const form = reactive({
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    department: employee.department
});

const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const message = ref(null);

const updateProfile = async () => {
    try {
        // Simulating an API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the employee object with form data
        Object.assign(employee, form);

        setMessage('Profile updated successfully', 'success');
    } catch (error) {
        setMessage('Failed to update profile. Please try again.', 'error');
    }
};

const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setMessage('New passwords do not match', 'error');
        return;
    }

    try {
        // Simulating an API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setMessage('Password changed successfully', 'success');
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
    } catch (error) {
        setMessage('Failed to change password. Please try again.', 'error');
    }
};

const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        // Simulating file upload and getting a URL
        await new Promise(resolve => setTimeout(resolve, 1000));
        const fakeUploadedUrl = URL.createObjectURL(file);

        employee.avatarUrl = fakeUploadedUrl;
        setMessage('Avatar updated successfully', 'success');
    } catch (error) {
        setMessage('Failed to upload avatar. Please try again.', 'error');
    }
};

const setMessage = (text, type) => {
    message.value = { text, type };
    setTimeout(() => {
        message.value = null;
    }, 5000);
};
</script>