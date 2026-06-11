import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import ScheduleView from '@/views/ScheduleView.vue';
import RecipesView from '@/views/RecipesView.vue';
import GroceryView from '@/views/GroceryView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/schedule' as const,
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: ScheduleView,
    meta: { title: '本周排餐', icon: '📅' },
  },
  {
    path: '/recipes',
    name: 'recipes',
    component: RecipesView,
    meta: { title: '菜谱库', icon: '📚' },
  },
  {
    path: '/grocery',
    name: 'grocery',
    component: GroceryView,
    meta: { title: '买菜清单', icon: '🛒' },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
