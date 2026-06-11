<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, Search, Filter } from 'lucide-vue-next';
import type { Recipe, DayOfWeek, MealType, DishType } from '@/types';
import { DAYS_ORDER, DAY_LABELS, MEALS_ORDER, MEAL_LABELS, MEAL_EMOJIS, DISH_LABELS, DISH_COLORS } from '@/types';
import { useAppStore } from '@/store';
import { cn } from '@/utils/helpers';

interface Props {
  visible: boolean;
  defaultDay?: DayOfWeek;
  defaultMeal?: MealType;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '选择菜谱',
});
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', recipe: Recipe, day: DayOfWeek, meal: MealType): void;
}>();

const pickerStore = useAppStore();
const recipes = computed(() => pickerStore.state.recipes);

const selectedDay = ref<DayOfWeek>(props.defaultDay || 'monday');
const selectedMeal = ref<MealType>(props.defaultMeal || 'dinner');
const search = ref('');
const dishTypeFilter = ref<DishType | 'all'>('all');

const filteredRecipes = computed(() => {
  return recipes.value.filter((r) => {
    if (!r.mealTypes.includes(selectedMeal.value)) return false;
    if (dishTypeFilter.value !== 'all' && r.dishType !== dishTypeFilter.value) return false;
    if (search.value.trim() && !r.name.includes(search.value.trim())) return false;
    return true;
  });
});

const confirm = (r: Recipe) => {
  emit('confirm', r, selectedDay.value, selectedMeal.value);
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" @click.self="emit('close')">
      <div class="absolute inset-0 bg-clay-900/40 backdrop-blur-sm"></div>

      <div class="relative bg-warm-50 rounded-3xl shadow-warm max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up border border-warm-100">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-warm-100 bg-white/60 backdrop-blur flex items-center justify-between gap-3">
          <h2 class="font-display text-xl text-clay-800 flex items-center gap-2">
            <span>🍽️</span>
            <span>{{ title }}</span>
          </h2>
          <button class="w-9 h-9 rounded-xl flex items-center justify-center text-clay-400 hover:text-warm-600 hover:bg-warm-100 transition-all" @click="emit('close')">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 排餐目标选择 -->
        <div class="px-6 py-4 border-b border-warm-100 bg-gradient-to-br from-white to-warm-50 space-y-3">
          <div>
            <label class="text-xs font-medium text-clay-500 mb-1.5 block">选择日期</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="d in DAYS_ORDER"
                :key="d"
                @click="selectedDay = d"
                class="px-3 h-8 rounded-lg text-sm font-medium transition-all"
                :class="selectedDay === d ? 'bg-warm-500 text-white shadow-sm' : 'bg-white text-clay-600 border border-warm-100 hover:border-warm-200'"
              >
                {{ DAY_LABELS[d] }}
              </button>
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-clay-500 mb-1.5 block">选择餐次</label>
            <div class="flex gap-2">
              <button
                v-for="m in MEALS_ORDER"
                :key="m"
                @click="selectedMeal = m"
                class="flex-1 h-10 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5"
                :class="selectedMeal === m ? 'bg-warm-500 text-white shadow-sm' : 'bg-white text-clay-600 border border-warm-100 hover:border-warm-200'"
              >
                <span>{{ MEAL_EMOJIS[m] }}</span>
                <span>{{ MEAL_LABELS[m] }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 搜索筛选 -->
        <div class="px-6 py-3 border-b border-warm-100 bg-white/40 space-y-2">
          <div class="relative">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-clay-400" />
            <input
              v-model="search"
              type="text"
              placeholder="搜索菜名..."
              class="w-full h-10 pl-10 pr-4 rounded-xl border-2 border-warm-100 bg-white focus:border-warm-400 focus:outline-none transition-all text-sm placeholder:text-clay-300"
            />
          </div>
          <div class="flex gap-1.5 flex-wrap items-center">
            <Filter class="w-3.5 h-3.5 text-clay-400" />
            <button
              @click="dishTypeFilter = 'all'"
              class="px-3 h-7 rounded-lg text-xs font-medium transition-all"
              :class="dishTypeFilter === 'all' ? 'bg-clay-600 text-white' : 'bg-white text-clay-500 border border-warm-100 hover:border-warm-200'"
            >
              全部
            </button>
            <button
              v-for="(label, d) in DISH_LABELS"
              :key="d"
              @click="dishTypeFilter = d as DishType"
              class="px-3 h-7 rounded-lg text-xs font-medium transition-all border"
              :class="dishTypeFilter === d
                ? [DISH_COLORS[d as DishType].bg, DISH_COLORS[d as DishType].text, DISH_COLORS[d as DishType].border]
                : 'bg-white text-clay-500 border-warm-100 hover:border-warm-200'"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <!-- 菜谱列表 -->
        <div class="flex-1 overflow-y-auto p-5">
          <div v-if="filteredRecipes.length === 0" class="h-full flex flex-col items-center justify-center text-clay-400 py-12">
            <div class="text-5xl mb-3">🥺</div>
            <p class="text-sm">没找到合适的菜谱，换个筛选条件试试？</p>
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="r in filteredRecipes"
              :key="r.id"
              @click="confirm(r)"
              class="text-left p-4 rounded-2xl bg-white border border-warm-100 hover:border-warm-300 hover:shadow-card transition-all group"
            >
              <div class="flex items-center gap-3">
                <div class="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">{{ r.emoji }}</div>
                <div class="min-w-0 flex-1">
                  <div class="font-display text-lg text-clay-800 truncate leading-tight">{{ r.name }}</div>
                  <div class="mt-1 flex flex-wrap gap-1">
                    <span
                      class="text-[10px] px-1.5 py-0.5 rounded-md border"
                      :class="[DISH_COLORS[r.dishType].bg, DISH_COLORS[r.dishType].text, DISH_COLORS[r.dishType].border]"
                    >{{ DISH_LABELS[r.dishType] }}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-warm-50 text-warm-600 border border-warm-100">
                      {{ r.ingredients.length }}种食材
                    </span>
                  </div>
                </div>
                <div class="w-8 h-8 rounded-lg bg-warm-50 text-warm-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <span class="text-lg">＋</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
