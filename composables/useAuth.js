import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const user = ref(null)

export function useAuth() {
    const router = useRouter()

    const login = async (email, password) => {
        // Simulated API call for authentication
        if (email === 'admin@example.com' && password === 'password') {
            const userData = {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                permissions: ['manage_categories','manage_products', 'manage_orders', 'manage_customers', 'manage_employees','manage_report','manage_roles','manage_profile']
            }
            user.value = userData
            localStorage.setItem('user', JSON.stringify(userData))
            return true
        } else if (email === 'manager@example.com' && password === 'password') {
            const userData = {
                id: 2,
                name: 'Manager User',
                email: 'manager@example.com',
                role: 'manager',
                permissions: ['manage_products', 'manage_orders','manage_profile']
            }
            user.value = userData
            localStorage.setItem('user', JSON.stringify(userData))
            return true
        }
        return false
    }

    const logout = () => {
        user.value = null
        localStorage.removeItem('user')
        router.push('/login')
    }

    const isAuthenticated = computed(() => !!user.value)

    const hasPermission = (permission) => {
        return user.value?.permissions.includes(permission) || false
    }

    const initAuth = () => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            user.value = JSON.parse(storedUser)
        }
    }

    return {
        user,
        login,
        logout,
        isAuthenticated,
        hasPermission,
        initAuth
    }
}