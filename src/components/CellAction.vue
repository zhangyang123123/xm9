<script setup lang="ts">
import { X } from 'lucide-vue-next';
import type { DayOfWeek, MealType, ScheduleRecipe } from '@/types';
import { DISH_COLORS, DAY_LABELS, MEAL_EMOJIS, MEAL_LABELS } from '@/types';
import { cn, formatQty } from '@/utils/helpers';

interface Props {
  visible: boolean;
  day: DayOfWeek;
  meal: MealType;
  recipe: ScheduleRecipe | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'remove'): void;
  (e: 'change'): void;
}>();

const colors = props.recipe ? DISH_COLORS[props.recipe.dishType] : null;
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" @click.self="emit('close')">
      <div class="absolute inset-0 bg-clay-900/40 backdrop-blur-sm"></div>

      <div class="relative bg-warm-50 rounded-3xl shadow-warm max-w-md w-full overflow-hidden animate-slide-up border border-warm-100">
        <div class="px-5 py-4 border-b border-warm-100 bg-gradient-to-br from-white/80 to-warm-100/60 backdrop-blur flex items-center justify-between">
          <h2 class="font-display text-lg text-clay-800 flex items-center gap-2">
            <span>{{ MEAL_EMOJIS[meal] }}</span>
            <span>{{ DAY_LABELS[day] }} · {{ MEAL_LABELS[meal] }}</span>
          </h2>
          <button class="w-8 h-8 rounded-lg flex items-center justify-center text-clay-400 hover:text-warm-600 hover:bg-warm-100 transition-all" @click="emit('close')">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-5 space-y-4">
          <div v-if="recipe" class="bg-white rounded-2xl p-4 border border-warm-100 shadow-card">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                   :style="{ backgroundColor: recipe.dishType === 'meat' ? 'rgba(224,120,86,0.1)' : recipe.dishType === 'vegetable' ? 'rgba(123,160,91,0.1)' : 'rgba(139,111,71,0.1)' }">
                {{ recipe.emoji }}
              </div>
              <div class="font-display text-xl text-clay-800 flex-1">{{ recipe.name }}</div>
            </div>
            <div class="text-sm text-clay-500 space-y-1 border-t border-warm-50 pt-3">
              <div v-for="(i, idx) in recipe.ingredients.slice(0, 5)" :key="idx" class="flex justify-between">
                <span>{{ i.name }}</span>
                <span class="text-warm-600 font-medium">{{ formatQty(i.quantity) }} {{ i.unit }}</span>
              </div>
              <div v-if="recipe.ingredients.length > 5" class="text-xs text-clay-400 text-center pt-1">
                还有 {{ recipe.ingredients.length - 5 }} 种食材...
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <div class="text-5xl mb-3">📝</div>
            <p class="text-sm text-clay-500">还没安排菜谱，选一道吧！</p>
          </div>

          <div class="flex gap-2">
            <button
              @click="emit('change')"
              class="flex-1 h-11 rounded-xl bg-warm-500 text-white font-medium hover:bg-warm-600 active:scale-95 transition-all shadow-sm"
            >
              {{ recipe ? '更换菜谱' : '选择菜谱' }}
            </button>
            <button
              v-if="recipe"
              @click="emit('remove'); emit('close')"
              class="px-5 h-11 rounded-xl border-2 border-red-100 text-red-500 font-medium hover:bg-red-50 active:scale-95 transition-all"
            >
              移除
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
