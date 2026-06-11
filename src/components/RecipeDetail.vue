<script setup lang="ts">
import { X } from 'lucide-vue-next';
import type { Recipe } from '@/types';
import { DISH_LABELS, DISH_COLORS, MEAL_LABELS, type MealType } from '@/types';
import { formatQty, cn } from '@/utils/helpers';

interface Props {
  visible: boolean;
  recipe: Recipe | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'schedule', recipe: Recipe): void;
}>();
</script>

<template>
  <Teleport to="body">
    <div v-if="visible && recipe" class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" @click.self="emit('close')">
      <div class="absolute inset-0 bg-clay-900/40 backdrop-blur-sm"></div>

      <div class="relative bg-warm-50 rounded-3xl shadow-warm max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up border border-warm-100">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-warm-100 bg-gradient-to-br from-white/80 to-warm-100/60 backdrop-blur">
          <button class="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-clay-400 hover:text-warm-600 hover:bg-warm-100 transition-all z-10" @click="emit('close')">
            <X class="w-5 h-5" />
          </button>
          <div class="flex items-center gap-4 pr-10">
            <div class="w-16 h-16 rounded-2xl bg-white shadow-card flex items-center justify-center text-4xl flex-shrink-0">
              {{ recipe.emoji }}
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="font-display text-2xl text-clay-800 leading-tight">{{ recipe.name }}</h2>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <span
                  v-for="mt in recipe.mealTypes"
                  :key="mt"
                  class="text-xs px-2.5 py-0.5 rounded-full bg-warm-50 text-warm-600 border border-warm-200 font-medium"
                >{{ MEAL_LABELS[mt as MealType] }}</span>
                <span
                  class="text-xs px-2.5 py-0.5 rounded-full border font-medium"
                  :class="[DISH_COLORS[recipe.dishType].bg, DISH_COLORS[recipe.dishType].text, DISH_COLORS[recipe.dishType].border]"
                >{{ DISH_LABELS[recipe.dishType] }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- 食材 -->
          <div>
            <h3 class="text-sm font-bold text-clay-700 mb-3 flex items-center gap-2">
              <span class="text-lg">🥕</span>
              <span>食材清单</span>
            </h3>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="(ing, idx) in recipe.ingredients"
                :key="idx"
                class="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-warm-100"
              >
                <span class="text-sm text-clay-700">{{ ing.name }}</span>
                <span class="text-sm font-medium text-warm-600 whitespace-nowrap ml-2">
                  {{ formatQty(ing.quantity) }} {{ ing.unit }}
                </span>
              </div>
            </div>
          </div>

          <!-- 做法 -->
          <div v-if="recipe.steps.trim()">
            <h3 class="text-sm font-bold text-clay-700 mb-3 flex items-center gap-2">
              <span class="text-lg">👨‍🍳</span>
              <span>做法步骤</span>
            </h3>
            <div class="p-4 rounded-2xl bg-white border border-warm-100 text-sm text-clay-700 leading-loose whitespace-pre-line">
              {{ recipe.steps }}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-warm-100 bg-white/60 backdrop-blur">
          <button
            @click="emit('schedule', recipe); emit('close')"
            class="w-full h-12 rounded-2xl bg-warm-500 text-white font-medium hover:bg-warm-600 active:scale-[0.98] shadow-warm transition-all flex items-center justify-center gap-2"
          >
            <span>📅</span>
            <span>添加到本周排餐</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
