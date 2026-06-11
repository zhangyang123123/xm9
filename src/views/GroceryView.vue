<script setup lang="ts">
import { computed, ref } from 'vue';
import { RefreshCw, ShoppingBag, CheckCircle2, CheckCircle, Circle } from 'lucide-vue-next';
import { useAppStore } from '@/store';
import { DAYS_ORDER, MEALS_ORDER, DAY_LABELS, MEAL_LABELS } from '@/types';
import { formatQty } from '@/utils/helpers';

const groceryStore = useAppStore();
const { computeGroceryList, toggleGroceryChecked, clearAllGroceryChecked } = groceryStore;
const checkedGrocery = computed(() => groceryStore.state.checkedGrocery);
const schedule = computed(() => groceryStore.state.schedule);

const groceryKey = (name: string, unit: string) => `${name}|${unit}`;

const items = computed(() => {
  return computeGroceryList().map((i) => ({
    ...i,
    key: groceryKey(i.name, i.unit),
    checked: !!checkedGrocery.value[groceryKey(i.name, i.unit)],
  }));
});

const checkedCount = computed(() => items.value.filter((i) => i.checked).length);
const progressPercent = computed(() =>
  items.value.length === 0 ? 0 : Math.round((checkedCount.value / items.value.length) * 100),
);

// 本周已排餐列表概览
const mealPlanSummary = computed(() => {
  const rows: Array<{ day: string; meals: Array<{ label: string; name?: string; emoji?: string }> }> = [];
  for (const d of DAYS_ORDER) {
    const meals = MEALS_ORDER.map((m) => {
      const r = schedule.value[d][m];
      return {
        label: MEAL_LABELS[m],
        name: r?.name,
        emoji: r?.emoji,
      };
    });
    rows.push({ day: DAY_LABELS[d], meals });
  }
  return rows;
});

const showSummary = ref(false);

const confirmReset = () => {
  if (checkedCount.value === 0) return;
  if (confirm('确定重置所有勾选状态吗？')) clearAllGroceryChecked();
};

const toggleAll = () => {
  const allChecked = checkedCount.value === items.value.length && items.value.length > 0;
  for (const it of items.value) {
    if (allChecked && it.checked) {
      toggleGroceryChecked(it.key);
    } else if (!allChecked && !it.checked) {
      toggleGroceryChecked(it.key);
    }
  }
};
</script>

<template>
  <div class="space-y-5">
    <!-- 顶部概览 -->
    <div class="bg-gradient-to-br from-sage-500 to-sage-600 rounded-3xl p-5 shadow-warm text-white relative overflow-hidden">
      <div class="absolute -right-6 -top-6 text-[140px] opacity-10 leading-none select-none">🛒</div>
      <div class="relative z-10">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="font-display text-xl flex items-center gap-2">
              <ShoppingBag class="w-5 h-5" />
              <span>本周买菜清单</span>
            </h3>
            <p class="text-sm text-white/80 mt-1.5">
              共 <span class="font-bold">{{ items.length }}</span> 项食材
              <span v-if="items.length">，已购 <span class="font-bold">{{ checkedCount }}</span> 项</span>
            </p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <button
              @click="showSummary = !showSummary"
              class="h-9 px-3.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-medium transition-all"
            >
              {{ showSummary ? '收起菜单' : '查看菜单' }}
            </button>
            <button
              @click="confirmReset"
              :disabled="checkedCount === 0"
              class="h-9 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-white text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw class="w-3.5 h-3.5" />
              <span>重置勾选</span>
            </button>
          </div>
        </div>

        <!-- 进度条 -->
        <div v-if="items.length > 0" class="mt-4">
          <div class="flex items-center justify-between text-xs text-white/80 mb-1.5">
            <span>采购进度</span>
            <span>{{ progressPercent }}%</span>
          </div>
          <div class="h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur">
            <div
              class="h-full bg-white rounded-full transition-all duration-500"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 菜单摘要 -->
    <div v-if="showSummary" class="bg-white rounded-3xl p-5 shadow-card border border-warm-100 animate-fade-in">
      <h4 class="font-display text-lg text-clay-800 mb-3 flex items-center gap-2">
        <span>📋</span>
        <span>本周菜单摘要</span>
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        <div
          v-for="row in mealPlanSummary"
          :key="row.day"
          class="rounded-2xl border border-warm-100 bg-warm-50/50 p-3"
        >
          <div class="font-display text-warm-600 text-sm mb-2 text-center">{{ row.day }}</div>
          <div class="space-y-1.5">
            <div v-for="m in row.meals" :key="m.label" class="text-xs">
              <span class="text-clay-500">{{ m.label }}：</span>
              <span v-if="m.name" class="text-clay-700 font-medium">
                <span>{{ m.emoji }}</span> {{ m.name }}
              </span>
              <span v-else class="text-clay-300">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="items.length === 0" class="bg-white rounded-3xl p-12 shadow-card border border-warm-100 text-center">
      <div class="text-6xl mb-4">🥗</div>
      <div class="font-display text-xl text-clay-800 mb-2">还没有安排菜呢</div>
      <div class="text-sm text-clay-500">先去「本周排餐」选几道菜，食材清单会自动生成哦~</div>
    </div>

    <!-- 清单列表 -->
    <div v-else class="space-y-4">
      <!-- 操作栏 -->
      <div class="flex items-center justify-between">
        <div class="text-sm text-clay-500">
          点击卡片或勾选框，标记已买到的食材 🍀
        </div>
        <button
          @click="toggleAll"
          class="h-9 px-3.5 rounded-xl bg-white border border-warm-100 text-sm font-medium text-clay-600 hover:bg-warm-50 transition-all flex items-center gap-1.5"
        >
          <component
            :is="checkedCount === items.length && items.length > 0 ? CheckCircle : Circle"
            class="w-4 h-4"
          />
          <span>{{ checkedCount === items.length && items.length > 0 ? '全部取消' : '全部勾选' }}</span>
        </button>
      </div>

      <!-- 食材卡片网格 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="item in items"
          :key="item.key"
          @click="toggleGroceryChecked(item.key)"
          class="rounded-2xl p-4 border-2 bg-white cursor-pointer transition-all hover:shadow-card group select-none"
          :class="item.checked
            ? 'border-sage-200 bg-sage-50/50'
            : 'border-warm-100 hover:border-warm-300'"
        >
          <div class="flex items-start gap-3">
            <input
              type="checkbox"
              class="custom-checkbox mt-0.5"
              :checked="item.checked"
              @click.stop="toggleGroceryChecked(item.key)"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline justify-between gap-2">
                <div
                  class="font-medium text-base"
                  :class="item.checked ? 'text-clay-400 line-through' : 'text-clay-800'"
                >
                  {{ item.name }}
                </div>
                <div
                  class="font-display text-lg flex-shrink-0 whitespace-nowrap"
                  :class="item.checked ? 'text-sage-400' : 'text-warm-600'"
                >
                  {{ formatQty(item.totalQuantity) }}
                  <span class="text-sm font-sans opacity-80 ml-0.5">{{ item.unit }}</span>
                </div>
              </div>
              <div
                v-if="item.usedIn.length"
                class="text-xs mt-1.5 leading-relaxed"
                :class="item.checked ? 'text-clay-400' : 'text-clay-500'"
              >
                用于：{{ item.usedIn.join('、') }}
              </div>
            </div>
            <CheckCircle2
              v-if="item.checked"
              class="w-5 h-5 text-sage-500 flex-shrink-0 animate-bounce-soft"
            />
          </div>
        </div>
      </div>

      <!-- 完成状态 -->
      <div
        v-if="checkedCount === items.length && items.length > 0"
        class="bg-gradient-to-r from-sage-500 to-sage-600 rounded-3xl p-6 text-white text-center shadow-warm animate-slide-up"
      >
        <div class="text-5xl mb-2">🎉</div>
        <div class="font-display text-2xl">所有食材都买齐啦！</div>
        <div class="text-sm text-white/80 mt-1">准备好做一顿丰盛的家常菜吧~</div>
      </div>
    </div>
  </div>
</template>
