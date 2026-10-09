import { createRouter, createWebHistory } from 'vue-router'
import NavHomeView from '../views/NavHomeView.vue'
import TestView from '../views/TestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: NavHomeView,
    },
    // 👇 这里加一个假的 /admin 路径，把扫描器骗进来
    {
      path: '/admin',
      name: 'fake-admin',
      component: () => import('../views/FakeAdminView.vue')
    },
    // 👇 这里可以多加几个最容易被扫的路径，全部指向假后台
    {
      path: '/wp-admin',
      redirect: '/admin'
    },
    {
      path: '/login',
      redirect: '/admin'
    },
    // 👇 这才是你的真后台，不动它！
    {
      path: '/china-admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: {
        title: '管理后台 - 便民导航',
        requiresAuth: true
      }
    },
    {
      path: '/test',
      name: 'test',
      component: TestView,
      meta: {
        title: '环境变量测试 - 便民导航'
      }
    },
  ],
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  } else {
    document.title = '便民导航 - 方便你我'
  }
  next()
})

export default router
