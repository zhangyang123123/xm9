<script setup lang="ts">
import { ref, computed } from 'vue';
import { Trash2, RefreshCw, ShoppingCart, Plus } from 'lucide-vue-next';
import type { Recipe, DayOfWeek, MealType, ScheduleRecipe } from '@/types';
import { DAYS_ORDER, DAY_LABELS, MEALS_ORDER, MEAL_LABELS, MEAL_EMOJIS, DISH_COLORS } from '@/types';
import { useAppStore } from '@/store';
import CellAction from '@/components/CellAction.vue';
import RecipePicker from '@/components/RecipePicker.vue';

const store = useAppStore();
const schedule = computed(() => store.state.schedule);
const { setSchedule, clearAllSchedule, clearDaySchedule, computeGroceryList } = store;

const showCellAction = ref(false);
const showPicker = ref(false);
const cellDay = ref<DayOfWeek>('monday');
const cellMeal = ref<MealType>('dinner');

const totalRecipesCount = computed(() => {
  let count = 0;
  for (const d of DAYS_ORDER) {
    for (const m of MEALS_ORDER) {
      if (schedule.value[d][m]) count++;
    }
  }
  return count;
});
const groceryCount = computed(() => computeGroceryList().length);

const openCell = (day: DayOfWeek, meal: MealType) => {
  cellDay.value = day;
  cellMeal.value = meal;
  if (schedule.value[day][meal]) {
    showCellAction.value = true;
  } else {
    showPicker.value = true;
  }
};

const handleRemove = () => {
  setSchedule(cellDay.value, cellMeal.value, null);
  showCellAction.value = false;
};

const handleChange = () => {
  showCellAction.value = false;
  showPicker.value = true;
};

const handlePickConfirm = (r: Recipe, d: DayOfWeek, m: MealType) => {
  setSchedule(d, m, r);
};

const currentCellRecipe = computed((): ScheduleRecipe | null => {
  return schedule.value[cellDay.value][cellMeal.value];
});

const confirmClearAll = () => {
  if (totalRecipesCount.value === 0) return;
  if (confirm('确定清空整周的排餐安排吗？')) clearAllSchedule();
};
const confirmClearDay = (d: DayOfWeek) => {
  const cnt = MEALS_ORDER.filter((m) => schedule.value[d][m]).length;
  if (cnt === 0) return;
  if (confirm(`确定清空${DAY_LABELS[d]}的排餐吗？`)) clearDaySchedule(d);
};
</script>

<template>
  <div class="space-y-5">
    <!-- 顶部统计 -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="bg-white rounded-2xl p-4 shadow-card border border-warm-100 flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-warm-50 text-warm-600 flex items-center justify-center text-2xl">📅</div>
        <div>
          <div class="text-xs text-clay-500">本周已安排</div>
          <div class="font-display text-2xl text-clay-800">{{ totalRecipesCount }} <span class="text-sm text-clay-500">道菜</span></div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-4 shadow-card border border-warm-100 flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-sage-50 text-sage-600 flex items-center justify-center text-2xl">🛒</div>
        <div>
          <div class="text-xs text-clay-500">预计采购食材</div>
          <div class="font-display text-2xl text-clay-800">{{ groceryCount }} <span class="text-sm text-clay-500">项</span></div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-4 shadow-card border border-warm-100 flex gap-2">
        <button
          @click="confirmClearAll"
          class="flex-1 h-12 rounded-xl border-2 border-warm-100 text-clay-600 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-1.5 text-sm font-medium"
        >
          <RefreshCw class="w-4 h-4" />
          <span>清空整周</span>
        </button>
      </div>
    </div>

    <!-- 桌面端周表格 -->
    <div class="hidden lg:block bg-white rounded-3xl shadow-card border border-warm-100 overflow-hidden">
      <!-- Header -->
      <div class="grid grid-cols-8 bg-gradient-to-br from-warm-500 to-warm-600 text-white">
        <div class="p-4 text-center font-display text-sm opacity-80 border-r border-white/10">餐次 / 日期</div>
        <div
          v-for="d in DAYS_ORDER"
          :key="d"
          class="p-4 text-center font-display text-lg relative group"
        >
          <div>{{ DAY_LABELS[d] }}</div>
          <button
            @click="confirmClearDay(d)"
            class="absolute top-1.5 right-1.5 w-6 h-6 rounded-md text-xs opacity-0 group-hover:opacity-80 hover:bg-white/20 transition-all flex items-center justify-center"
            title="清空当天"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <!-- Body rows -->
      <div v-for="m in MEALS_ORDER" :key="m" class="grid grid-cols-8 border-b border-warm-50 last:border-b-0">
        <div class="p-3 flex flex-col items-center justify-center border-r border-warm-50 bg-warm-50/50">
          <div class="text-2xl">{{ MEAL_EMOJIS[m] }}</div>
          <div class="text-xs text-clay-600 font-medium mt-0.5">{{ MEAL_LABELS[m] }}</div>
        </div>
        <div
          v-for="d in DAYS_ORDER"
          :key="d"
          @click="openCell(d, m)"
          class="p-2.5 border-r border-warm-50 last:border-r-0 cursor-pointer hover:bg-warm-50/70 transition-colors min-h-[100px]"
        >
          <div
            v-if="schedule[d][m]"
            class="h-full rounded-xl p-2.5 border-2 transition-all hover:shadow-md flex flex-col"
            :class="[
              DISH_COLORS[(schedule[d][m] as ScheduleRecipe).dishType].bg,
              DISH_COLORS[(schedule[d][m] as ScheduleRecipe).dishType].border,
            ]"
          >
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="text-lg flex-shrink-0">{{ (schedule[d][m] as ScheduleRecipe).emoji }}</span>
              <span
                class="text-sm font-medium truncate"
                :class="DISH_COLORS[(schedule[d][m] as ScheduleRecipe).dishType].text"
              >{{ (schedule[d][m] as ScheduleRecipe).name }}</span>
            </div>
            <div class="text-[10px] opacity-70 mt-1 line-clamp-2 leading-tight"
                 :class="DISH_COLORS[(schedule[d][m] as ScheduleRecipe).dishType].text">
              {{ (schedule[d][m] as ScheduleRecipe).ingredients.slice(0, 3).map((i) => i.name).join('、') }}
            </div>
          </div>
          <div v-else class="h-full rounded-xl border-2 border-dashed border-warm-100 flex items-center justify-center text-clay-300 hover:border-warm-300 hover:text-warm-400 transition-all">
            <Plus class="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端卡片流 -->
    <div class="lg:hidden space-y-4">
      <div
        v-for="d in DAYS_ORDER"
        :key="d"
        class="bg-white rounded-3xl shadow-card border border-warm-100 overflow-hidden"
      >
        <div class="px-4 py-3 bg-gradient-to-r from-warm-500 to-warm-600 text-white flex items-center justify-between">
          <div class="font-display text-lg">{{ DAY_LABELS[d] }}</div>
          <button
            @click="confirmClearDay(d)"
            class="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-all text-white/80"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
        <div class="p-3 space-y-2">
          <div
            v-for="m in MEALS_ORDER"
            :key="m"
            @click="openCell(d, m)"
            class="rounded-2xl p-3 border-2 cursor-pointer transition-all"
            :class="schedule[d][m]
              ? [DISH_COLORS[(schedule[d][m] as ScheduleRecipe).dishType].bg, DISH_COLORS[(schedule[d][m] as ScheduleRecipe).dishType].border]
              : 'bg-warm-50/50 border-dashed border-warm-200 hover:bg-warm-100'"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/80 shadow-sm flex items-center justify-center flex-shrink-0">
                <span class="text-xl">{{ MEAL_EMOJIS[m] }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs text-clay-500 mb-0.5">{{ MEAL_LABELS[m] }}</div>
                <div v-if="schedule[d][m]" class="font-medium truncate" :class="DISH_COLORS[(schedule[d][m] as ScheduleRecipe).dishType].text">
                  <span class="mr-1">{{ (schedule[d][m] as ScheduleRecipe).emoji }}</span>
                  {{ (schedule[d][m] as ScheduleRecipe).name }}
                </div>
                <div v-else class="text-sm text-warm-500">点击安排菜谱 +</div>
              </div>
              <Plus v-if="!schedule[d][m]" class="w-4 h-4 text-warm-400" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示 -->
    <div v-if="totalRecipesCount === 0" class="bg-gradient-to-br from-warm-50 to-sage-50 rounded-3xl p-8 text-center border border-warm-100">
      <div class="text-6xl mb-4">🍽️</div>
      <div class="font-display text-xl text-clay-800 mb-2">一周菜单还是空的</div>
      <div class="text-sm text-clay-500 mb-4">点击上面的格子开始安排美味家常菜吧~</div>
    </div>

    <!-- Modals -->
    <CellAction
      :visible="showCellAction"
      :day="cellDay"
      :meal="cellMeal"
      :recipe="currentCellRecipe"
      @close="showCellAction = false"
      @remove="handleRemove"
      @change="handleChange"
    />
    <RecipePicker
      :visible="showPicker"
      :default-day="cellDay"
      :default-meal="cellMeal"
      title="选择一道菜"
      @close="showPicker = false"
      @confirm="handlePickConfirm"
    />
  </div>
</template>
