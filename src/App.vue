<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChefHat, Calendar, BookOpen, ShoppingCart, X } from 'lucide-vue-next';
import { cn } from '@/utils/helpers';

const route = useRoute();
const router = useRouter();

interface NavItem {
  path: string;
  name: string;
  label: string;
  icon: any;
  emoji: string;
}

const navItems: NavItem[] = [
  { path: '/schedule', name: 'schedule', label: '本周排餐', icon: Calendar, emoji: '📅' },
  { path: '/recipes', name: 'recipes', label: '菜谱库', icon: BookOpen, emoji: '📚' },
  { path: '/grocery', name: 'grocery', label: '买菜清单', icon: ShoppingCart, emoji: '🛒' },
];

const currentTitle = computed(() => {
  const item = navItems.find((n) => n.path === route.path);
  return item ? `${item.emoji} ${item.label}` : '回家吃饭';
});

const currentYear = new Date().getFullYear();

const showMobileMenu = ref(false);

const navigate = (path: string) => {
  router.push(path);
  showMobileMenu.value = false;
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-40 backdrop-blur-xl bg-warm-50/80 border-b border-warm-100">
      <div class="container">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div
            @click="navigate('/schedule')"
            class="flex items-center gap-2.5 cursor-pointer group"
          >
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-warm-500 to-warm-600 shadow-warm flex items-center justify-center group-hover:scale-105 transition-transform">
              <ChefHat class="w-5 h-5 text-white" />
            </div>
            <div class="hidden sm:block">
              <div class="font-display text-xl text-clay-800 leading-none">回家吃饭</div>
              <div class="text-[10px] text-clay-400 mt-0.5 tracking-wider">FAMILY MEAL PLANNER</div>
            </div>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-white/70 border border-warm-100 shadow-card">
            <button
              v-for="item in navItems"
              :key="item.path"
              @click="navigate(item.path)"
              class="px-4 h-10 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
              :class="route.path === item.path
                ? 'bg-warm-500 text-white shadow-sm'
                : 'text-clay-600 hover:bg-warm-50'"
            >
              <span class="text-base">{{ item.emoji }}</span>
              <span>{{ item.label }}</span>
            </button>
          </nav>

          <!-- Mobile menu button -->
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden w-11 h-11 rounded-xl border-2 border-warm-100 bg-white text-clay-600 flex items-center justify-center"
          >
            <component :is="showMobileMenu ? X : navItems.find(n => n.path === route.path)?.icon || Calendar" class="w-5 h-5" />
          </button>
        </div>

        <!-- Mobile Navigation -->
        <div
          v-if="showMobileMenu"
          class="md:hidden pb-4 -mt-1 animate-slide-up"
        >
          <nav class="flex gap-2 p-1 rounded-2xl bg-white/70 border border-warm-100 shadow-card">
            <button
              v-for="item in navItems"
              :key="item.path"
              @click="navigate(item.path)"
              class="flex-1 h-12 rounded-xl text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5"
              :class="route.path === item.path
                ? 'bg-warm-500 text-white shadow-sm'
                : 'text-clay-600 hover:bg-warm-50'"
            >
              <span class="text-xl leading-none">{{ item.emoji }}</span>
              <span>{{ item.label }}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Page Title Bar -->
    <div class="border-b border-warm-100/60 bg-gradient-to-b from-warm-50/50 to-transparent">
      <div class="container py-4">
        <h1 class="font-display text-2xl sm:text-3xl text-clay-800 flex items-center gap-2">
          {{ currentTitle }}
        </h1>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 container py-5 sm:py-6 pb-20 md:pb-8">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="border-t border-warm-100 bg-white/40 backdrop-blur py-6 hidden md:block">
      <div class="container text-center text-xs text-clay-400 space-y-1">
        <div class="flex items-center justify-center gap-2">
          <span>🍲</span>
          <span class="font-display text-sm text-clay-600">回家吃饭</span>
          <span>·</span>
          <span>用心做好每一餐</span>
        </div>
        <div>数据安全存储在您的浏览器本地 · {{ currentYear }}</div>
      </div>
    </footer>

    <!-- 移动端底部导航 -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2 bg-gradient-to-t from-warm-50 via-warm-50/95 to-transparent">
      <div class="flex gap-1.5 p-1.5 rounded-3xl bg-white/95 backdrop-blur-xl border border-warm-100 shadow-warm">
        <button
          v-for="item in navItems"
          :key="item.path"
          @click="navigate(item.path)"
          class="flex-1 h-14 rounded-2xl transition-all flex flex-col items-center justify-center gap-0.5"
          :class="route.path === item.path
            ? 'bg-gradient-to-br from-warm-500 to-warm-600 text-white shadow-md scale-[0.97]'
            : 'text-clay-500 active:bg-warm-50'"
        >
          <span class="text-2xl leading-none">{{ item.emoji }}</span>
          <span class="text-[10px] font-medium">{{ item.label }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
