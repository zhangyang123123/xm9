<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X, Plus, Minus } from 'lucide-vue-next';
import type { Recipe, MealType, DishType, Ingredient } from '@/types';
import { MEAL_LABELS, DISH_LABELS, DISH_COLORS } from '@/types';
import { cn } from '@/utils/helpers';

interface Props {
  visible: boolean;
  editRecipe?: Recipe | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: Omit<Recipe, 'id' | 'isBuiltin' | 'createdAt'>): void;
}>();

const name = ref('');
const emoji = ref('🍽️');
const mealTypes = ref<MealType[]>(['lunch', 'dinner']);
const dishType = ref<DishType>('meat');
const ingredients = ref<Ingredient[]>([
  { name: '', quantity: 100, unit: '克' },
]);
const steps = ref('');

const EMOJI_OPTIONS = ['🍽️','🍜','🥣','🥞','🥟','🥩','🍗','🍖','🥘','🍛','🐟','🥦','🍆','🍅','🥬','🫛','🧈','🍲','🥣','🫕','🌽','🍚','🥗','🍱','🥓','🍳','🥯','🥪','🌮','🍝'];
const UNIT_OPTIONS = ['克', '个', '根', '毫升', '勺', '瓣', '粒', '条', '把', '片', '盒', '包'];

watch(
  () => props.visible,
  (v) => {
    if (v) {
      if (props.editRecipe) {
        const r = props.editRecipe;
        name.value = r.name;
        emoji.value = r.emoji;
        mealTypes.value = [...r.mealTypes];
        dishType.value = r.dishType;
        ingredients.value = r.ingredients.map((i) => ({ ...i }));
        steps.value = r.steps;
      } else {
        resetForm();
      }
    }
  },
  { immediate: true },
);

const resetForm = () => {
  name.value = '';
  emoji.value = '🍽️';
  mealTypes.value = ['lunch', 'dinner'];
  dishType.value = 'meat';
  ingredients.value = [{ name: '', quantity: 100, unit: '克' }];
  steps.value = '';
};

const addIngredient = () => {
  ingredients.value.push({ name: '', quantity: 100, unit: '克' });
};
const removeIngredient = (idx: number) => {
  if (ingredients.value.length > 1) {
    ingredients.value.splice(idx, 1);
  }
};

const isValid = computed(() => {
  return (
    name.value.trim().length > 0 &&
    mealTypes.value.length > 0 &&
    ingredients.value.every((i) => i.name.trim().length > 0 && i.quantity > 0)
  );
});

const toggleMeal = (m: MealType) => {
  const idx = mealTypes.value.indexOf(m);
  if (idx >= 0) mealTypes.value.splice(idx, 1);
  else mealTypes.value.push(m);
};

const submit = () => {
  if (!isValid.value) return;
  emit('save', {
    name: name.value.trim(),
    emoji: emoji.value,
    mealTypes: [...mealTypes.value],
    dishType: dishType.value,
    ingredients: ingredients.value.map((i) => ({
      name: i.name.trim(),
      quantity: Number(i.quantity),
      unit: i.unit.trim() || '克',
    })),
    steps: steps.value.trim(),
  });
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" @click.self="emit('close')">
      <div class="absolute inset-0 bg-clay-900/40 backdrop-blur-sm"></div>

      <div class="relative bg-warm-50 rounded-3xl shadow-warm max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up border border-warm-100">
        <div class="flex items-center justify-between px-6 py-4 border-b border-warm-100 bg-white/60 backdrop-blur">
          <h2 class="font-display text-xl text-clay-800">
            {{ editRecipe ? '编辑菜谱' : '✨ 添加新菜谱' }}
          </h2>
          <button class="w-9 h-9 rounded-xl flex items-center justify-center text-clay-400 hover:text-warm-600 hover:bg-warm-100 transition-all" @click="emit('close')">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- 菜名 + emoji -->
          <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div class="sm:col-span-1">
              <label class="block text-sm text-clay-600 mb-1.5 font-medium">图标</label>
              <select
                v-model="emoji"
                class="w-full h-12 px-3 rounded-xl border-2 border-warm-100 bg-white focus:border-warm-400 focus:outline-none text-2xl text-center transition-all"
              >
                <option v-for="e in EMOJI_OPTIONS" :key="e" :value="e">{{ e }}</option>
              </select>
            </div>
            <div class="sm:col-span-4">
              <label class="block text-sm text-clay-600 mb-1.5 font-medium">菜名</label>
              <input
                v-model="name"
                type="text"
                placeholder="例如：可乐鸡翅"
                class="w-full h-12 px-4 rounded-xl border-2 border-warm-100 bg-white focus:border-warm-400 focus:outline-none transition-all placeholder:text-clay-300"
              />
            </div>
          </div>

          <!-- 分类 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-clay-600 mb-2 font-medium">适合餐次（可多选）</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(label, m) in MEAL_LABELS"
                  :key="m"
                  type="button"
                  @click="toggleMeal(m as MealType)"
                  class="px-4 h-10 rounded-xl text-sm font-medium transition-all border-2"
                  :class="mealTypes.includes(m as MealType) ? 'bg-warm-500 text-white border-warm-500 shadow-sm' : 'bg-white text-clay-600 border-warm-100 hover:border-warm-200'"
                >
                  {{ label }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm text-clay-600 mb-2 font-medium">菜式类型</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(label, d) in DISH_LABELS"
                  :key="d"
                  type="button"
                  @click="dishType = d as DishType"
                  class="px-4 h-10 rounded-xl text-sm font-medium transition-all border-2"
                  :class="dishType === d
                    ? [DISH_COLORS[d as DishType].bg, DISH_COLORS[d as DishType].text, DISH_COLORS[d as DishType].border]
                    : 'bg-white text-clay-600 border-warm-100 hover:border-warm-200'"
                >
                  {{ label }}
                </button>
              </div>
            </div>
          </div>

          <!-- 食材列表 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm text-clay-600 font-medium">🥕 食材清单</label>
              <button
                type="button"
                @click="addIngredient"
                class="text-sm text-warm-600 hover:text-warm-700 flex items-center gap-1 font-medium"
              >
                <Plus class="w-4 h-4" />
                <span>添加食材</span>
              </button>
            </div>
            <div class="space-y-2">
              <div v-for="(_, idx) in ingredients" :key="idx" class="grid grid-cols-12 gap-2 items-center">
                <input
                  v-model="ingredients[idx].name"
                  type="text"
                  placeholder="食材名称"
                  class="col-span-5 h-11 px-3 rounded-xl border-2 border-warm-100 bg-white focus:border-warm-400 focus:outline-none transition-all placeholder:text-clay-300 text-sm"
                />
                <input
                  v-model.number="ingredients[idx].quantity"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="用量"
                  class="col-span-3 h-11 px-3 rounded-xl border-2 border-warm-100 bg-white focus:border-warm-400 focus:outline-none transition-all placeholder:text-clay-300 text-sm"
                />
                <select
                  v-model="ingredients[idx].unit"
                  class="col-span-3 h-11 px-3 rounded-xl border-2 border-warm-100 bg-white focus:border-warm-400 focus:outline-none transition-all text-sm"
                >
                  <option v-for="u in UNIT_OPTIONS" :key="u" :value="u">{{ u }}</option>
                </select>
                <button
                  type="button"
                  @click="removeIngredient(idx)"
                  :disabled="ingredients.length <= 1"
                  class="col-span-1 w-11 h-11 rounded-xl flex items-center justify-center text-clay-400 hover:text-warm-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-clay-400 transition-all"
                >
                  <Minus class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- 做法 -->
          <div>
            <label class="block text-sm text-clay-600 mb-2 font-medium">📝 做法步骤（可选）</label>
            <textarea
              v-model="steps"
              rows="4"
              placeholder="分步骤描述做法，按行分隔..."
              class="w-full px-4 py-3 rounded-xl border-2 border-warm-100 bg-white focus:border-warm-400 focus:outline-none transition-all placeholder:text-clay-300 text-sm resize-none leading-relaxed"
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-warm-100 bg-white/60 backdrop-blur flex gap-3 justify-end">
          <button
            @click="emit('close')"
            class="px-5 h-11 rounded-xl border-2 border-warm-100 text-clay-600 font-medium hover:bg-warm-50 transition-all"
          >
            取消
          </button>
          <button
            @click="submit"
            :disabled="!isValid"
            class="px-6 h-11 rounded-xl bg-warm-500 text-white font-medium hover:bg-warm-600 active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-sm transition-all"
          >
            {{ editRecipe ? '保存修改' : '添加菜谱' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
