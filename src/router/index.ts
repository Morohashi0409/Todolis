import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'ServiceIntro',
    component: () => import('@/views/service-intro/service-intro.vue'),
    meta: {
      title: 'Taskel - 続ける力を、シェアしよう'
    }
  },
  {
    path: '/create',
    name: 'GroupCreation',
    component: () => import('@/views/group-creation/group-creation.vue'),
    meta: {
      title: 'グループ作成 - Taskel'
    }
  },
  {
    path: '/links',
    name: 'LinkDisplay',
    component: () => import('@/views/link-display/link-display.vue'),
    meta: {
      title: '作成完了 - Taskel'
    }
  },
  {
    path: '/space/:spaceId',
    name: 'GoalDisplay',
    component: () => import('@/views/goal-display/goal-display.vue'),
    meta: {
      title: 'タスク一覧 - Taskel'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ページタイトルの設定
router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router
