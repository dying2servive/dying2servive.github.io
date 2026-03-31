import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/orders',
      name: 'order-search',
      component: () => import('../views/OrderSearchView.vue'),
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue'),
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('../views/admin/ProductsView.vue'),
        },
        {
          path: 'products/new',
          name: 'admin-product-create',
          component: () => import('../views/admin/ProductEditView.vue'),
        },
        {
          path: 'products/:id/edit',
          name: 'admin-product-edit',
          component: () => import('../views/admin/ProductEditView.vue'),
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('../views/admin/OrdersView.vue'),
        },
        {
          path: 'config',
          name: 'admin-config',
          component: () => import('../views/admin/ConfigView.vue'),
        },
      ]
    }
  ],
})

// Admin authentication guard
router.beforeEach((to, from, next) => {
  if (to.path.startsWith('/admin')) {
    const adminSecret = import.meta.env.VITE_ADMIN_SECRET || undefined
    const urlSecret = to.query.s as string || ''

    // If URL has the correct secret, save it and proceed
    if (urlSecret.trim() && urlSecret === adminSecret) {
      sessionStorage.setItem('wqqh_admin_auth', 'true')
      // Remove the query param to keep URL clean (optional but good for UX)
      const query = { ...to.query }
      delete query.s
      return next({ path: to.path, query })
    }

    // Check if previously authenticated in this session
    const isAuth = sessionStorage.getItem('wqqh_admin_auth') === 'true'
    if (isAuth) {
      return next()
    }

    // Not authenticated, redirect to home
    return next({ path: '/' })
  }
  
  next()
})

export default router
