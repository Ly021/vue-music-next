import { createRouter, createWebHashHistory } from 'vue-router'
// import Recommend from '@/views/recommend'
const Recommend = () => import('@/views/recommend'/* webpackChunkName: "recommend" */)
// 将recommend变成异步组件
const Search = () => import('@/views/search'/* webpackChunkName: "search" */)
const Singer = () => import('@/views/singer'/* webpackChunkName: "singer" */)
const Toplist = () => import('@/views/top-list'/* webpackChunkName: "top-list" */)
const SingerDetail = () => import('@/views/singer-detail'/* webpackChunkName: "singer-detail" */)
const Album = () => import('@/views/album'/* webpackChunkName: "album" */)
const TopDetail = () => import('@/views/top-detail'/* webpackChunkName: "top-detail" */)
const UserCenter = () => import('@/views/user-center'/* webpackChunkName: "user-center" */)
// 每个对象都为功能函数，可以实现异步组件加载了

const routes = [
  {
    path: '/',
    redirect: '/recommend'
    // 根路径下默认为推荐页面
  },
  {
    path: '/recommend',
    component: Recommend,
    children: [
      {
        path: ':id',
        component: Album
      }
    ]
  },
  {
    path: '/search',
    component: Search,
    children: [
      {
        path: ':id',
        component: SingerDetail
      }
    ]
  },
  {
    path: '/singer',
    component: Singer,
    children: [ // 二级路由，path括号不能用/而要用：
      {
        path: ':id',
        component: SingerDetail
      }
    ]
  },
  {
    path: '/top-list',
    component: Toplist,
    children: [
      {
        path: ':id',
        component: TopDetail
      }
    ]
  },
  {
    path: '/user',
    components: {
      user: UserCenter
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
