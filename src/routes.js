import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Products from './components/Products.vue'
import Orders from './components/Orders.vue'
import Employees from './components/Employees.vue'
import NotFound from './components/NotFound.vue'
import Categories from './components/Categories.vue'
import Customers from './components/Customers.vue'
import Report from './components/Report.vue'
import Roles from './components/Roles.vue'
import Profile from './components/Profile.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => Categories,
    meta: { requiresAuth: true, permission: 'manage_categories' }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => Products,
    meta: { requiresAuth: true, permission: 'manage_products' }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => Orders,
    meta: { requiresAuth: true, permission: 'manage_orders' }
  },
  {
    path: '/employees',
    name: 'Employees',
    component: () => Employees,
    meta: { requiresAuth: true, permission: 'manage_employees' }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: () => Customers,
    meta: { requiresAuth: true, permission: 'manage_customers' }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => Report,
    meta: { requiresAuth: true, permission: 'manage_report' }
  },
  {
    path: '/roles',
    name: 'Roles',
    component: () => Roles,
    meta: { requiresAuth: true, permission: 'manage_roles' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => Profile,
    meta: { requiresAuth: true, permission: 'manage_profile' }
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  // Add other routes as needed
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {

  const { isAuthenticated, hasPermission } = useAuth()

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated.value) {
      next('/login')
    } else if (to.meta.permission && !hasPermission(to.meta.permission)) {
      next('/') // Redirect to dashboard if user doesn't have the required permission
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router