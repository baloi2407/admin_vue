import { computed } from 'vue'
import { useAuth } from './useAuth'

export function useSidebar() {
  const { hasPermission } = useAuth()

  const sidebarItems = computed(() => [
    {
      title: 'Dashboard',
      items: [{ name: 'Overview', link: '/', permission: null }]
    },
    {
      title: 'Product Management',
      items: [
        { name: 'Product List', link: '/products', permission: 'manage_products' },
        { name: 'Categories', link: '/categories', permission: 'manage_categories' }
      ]
    },
    {
      title: 'Order Management',
      items: [
        { name: 'Orders', link: '/orders', permission: 'manage_orders' },
        { name: 'Returns', link: '/returns', permission: 'manage_orders' }
      ]
    },
    {
      title: 'Customer Management',
      items: [
        { name: 'Customers', link: '/customers', permission: 'manage_customers' },
        { name: 'Customer Groups', link: '/customer-groups', permission: 'manage_customers' }
      ]
    },
    {
      title: 'Employee Management',
      items: [
        { name: 'Employees', link: '/employees', permission: 'manage_employees' },
        { name: 'Roles', link: '/roles', permission: 'manage_roles' }
      ]
    },
    {
      title: 'Reporting',
      items: [
        { name: 'Sales Report', link: '/report', permission: 'manage_report' },
        { name: 'Inventory Report', link: '/reports/inventory', permission: 'manage_reports' }
      ]
    }
  ])

  const filteredSidebarItems = computed(() => 
    sidebarItems.value.filter(section => 
      section.items.some(item => item.permission === null || hasPermission(item.permission))
    ).map(section => ({
      ...section,
      items: section.items.filter(item => item.permission === null || hasPermission(item.permission))
    }))
  )

  return {
    filteredSidebarItems
  }
}