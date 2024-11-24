<template>
  <div v-if="isAuthenticated" class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-md">
      <div class="p-4">
        <h1 class="text-2xl font-semibold text-gray-800">E-Shop Admin</h1>
      </div>
      <nav class="mt-4">
        <template v-for="(section, index) in filteredSidebarItems" :key="index">
          <div class="px-4 py-2">
            <h2 class="text-xs font-semibold text-gray-600 uppercase tracking-wide">{{ section.title }}</h2>
            <ul class="mt-2">
              <li v-for="(item, itemIndex) in section.items" :key="itemIndex">
                <router-link :to="item.link" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded" :class="{ 'bg-gray-200': $route.path === item.link }">{{ item.name }}</router-link>
              </li>
            </ul>
          </div>
        </template>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 class="text-lg font-semibold text-gray-800">{{ pageTitle }}</h1>
          <div class="relative">
            <button @click="toggleUserMenu" class="flex items-center text-gray-500 hover:text-gray-600">
              <span class="mr-2">{{ user.name }} </span>
              <UserIcon class="h-6 w-6" />
            </button>
            <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <router-link to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</router-link>
              <a @click.prevent="logout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
            </div>
          </div>
        </div>
      </header>

      <!-- Router View -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <router-view></router-view>
      </main>

      <!-- Footer -->
      <footer class="bg-white shadow-sm mt-auto">
        <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          &copy; 2024 E-Shop Admin. All rights reserved.
        </div>
      </footer>
    </div>
  </div>
  <div v-else>
    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { UserIcon } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'
import { useSidebar } from '../composables/useSidebar'

const { user, isAuthenticated, logout, initAuth } = useAuth()
const { filteredSidebarItems } = useSidebar()
const route = useRoute()

const showUserMenu = ref(false)
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const pageTitle = computed(() => {
  const currentRoute = filteredSidebarItems.value
    .flatMap(section => section.items)
    .find(item => item.link === route.path)
  return currentRoute ? currentRoute.name : 'Dashboard'
})

onMounted(() => {
  initAuth()
})
</script>