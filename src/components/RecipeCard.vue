<script setup lang="ts">
import { Trash2, Plus, Info } from 'lucide-vue-next';
import type { Recipe, DayOfWeek, MealType } from '@/types';
import { DISH_COLORS, DISH_LABELS, MEAL_LABELS } from '@/types';
import { cn } from '@/utils/helpers';

interface Props {
  recipe: Recipe;
  showActions?: boolean;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  compact: false,
});

const emit = defineEmits<{
  (e: 'view', recipe: Recipe): void;
  (e: 'edit', recipe: Recipe): void;
  (e: 'delete', id: string): void;
  (e: 'schedule', recipe: Recipe): void;
}>();

const colors = DISH_COLORS[props.recipe.dishType];
</script>

<template>
  <div
    class="group bg-white rounded-2xl p-4 shadow-card border border-warm-100 hover:shadow-warm hover:-translate-y-1 transition-all duration-300 relative overflow-hidden animate-fade-in"
  >
    <div class="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rounded-full opacity-10"
         :class="[colors.bg.replace('bg-', 'bg-').slice(0)]"
         :style="{ backgroundColor: recipe.dishType === 'meat' ? 'rgba(224,120,86,0.1)' : recipe.dishType === 'vegetable' ? 'rgba(123,160,91,0.1)' : 'rgba(139,111,71,0.1)' }">
    </div>

    <div class="flex items-start justify-between relative z-10">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <div class="text-4xl flex-shrink-0">{{ recipe.emoji }}</div>
        <div class="min-w-0 flex-1">
          <h3 class="font-display text-lg text-clay-800 truncate leading-tight">{{ recipe.name }}</h3>
          <div class="flex flex-wrap gap-1.5 mt-1.5">
            <span
              v-for="mt in recipe.mealTypes"
              :key="mt"
              class="text-xs px-2 py-0.5 rounded-full bg-warm-50 text-warm-600 border border-warm-100"
            >{{ MEAL_LABELS[mt as MealType] }}</span>
            <span
              class="text-xs px-2 py-0.5 rounded-full border"
              :class="[colors.bg, colors.text, colors.border]"
            >{{ DISH_LABELS[recipe.dishType] }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!compact" class="mt-3 pt-3 border-t border-warm-50 relative z-10">
      <div class="flex items-center gap-1.5 text-xs text-clay-500 mb-1.5">
        <span class="inline-flex items-center gap-1">
          <span>🥕</span>
          <span>{{ recipe.ingredients.length }} 种食材</span>
        </span>
      </div>
      <p class="text-sm text-clay-500 line-clamp-2 leading-relaxed">
        {{ recipe.ingredients.slice(0, 4).map((i) => i.name).join('、') }}{{ recipe.ingredients.length > 4 ? '…等' : '' }}
      </p>
    </div>

    <div v-if="showActions" class="flex gap-2 mt-3 relative z-10">
      <button
        class="flex-1 h-9 px-3 rounded-xl text-sm font-medium bg-warm-500 text-white hover:bg-warm-600 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-sm"
        @click="emit('schedule', recipe)"
      >
        <Plus class="w-4 h-4" />
        <span>添加到排餐</span>
      </button>
      <button
        class="w-9 h-9 rounded-xl border border-warm-100 text-clay-500 hover:text-warm-600 hover:border-warm-200 hover:bg-warm-50 active:scale-95 transition-all flex items-center justify-center"
        title="查看详情"
        @click="emit('view', recipe)"
      >
        <Info class="w-4 h-4" />
      </button>
      <button
        v-if="!recipe.isBuiltin"
        class="w-9 h-9 rounded-xl border border-warm-100 text-clay-400 hover:text-warm-600 hover:border-red-200 hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center"
        title="删除"
        @click="emit('delete', recipe.id)"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
