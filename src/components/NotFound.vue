<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-lg">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 class="text-2xl font-medium text-gray-600 mb-4">Page Not Found</h2>
          <p class="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <router-link to="/" class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Go to Dashboard
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // No additional logic needed
  </script>