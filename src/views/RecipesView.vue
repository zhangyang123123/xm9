<script setup lang="ts">import { ref, computed } from 'vue';
import { Plus, Search, Sparkles, Filter } from 'lucide-vue-next';
import type { Recipe, DishType, MealType } from '@/types';
import { DISH_LABELS, DISH_COLORS, MEAL_LABELS } from '@/types';
import { useAppStore } from '@/store';
import RecipeCard from '@/components/RecipeCard.vue';
import RecipeForm from '@/components/RecipeForm.vue';
import RecipeDetail from '@/components/RecipeDetail.vue';
import RecipePicker from '@/components/RecipePicker.vue';
import { cn } from '@/utils/helpers';
const recipesStore = useAppStore();
const recipes = computed(() => recipesStore.state.recipes);
const { addRecipe, deleteRecipe, setSchedule, getRandomRecipe } = recipesStore;
const searchQuery = ref('');
const mealFilter = ref<MealType | 'all'>('all');
const dishFilter = ref<DishType | 'all'>('all');
const showAddForm = ref(false);
const showDetail = ref(false);
const showPicker = ref(false);
const detailRecipe = ref<Recipe | null>(null);
const scheduleRecipe = ref<Recipe | null>(null);
const lastRandomId = ref<string | null>(null);
const randomRecipe = ref<Recipe | null>(null);
const isRolling = ref(false);
const filteredRecipes = computed(() => {
 return recipes.value.filter((r) => {
 if (searchQuery.value.trim() && !r.name.toLowerCase().includes(searchQuery.value.trim().toLowerCase())) {
 return false;
 }
 if (mealFilter.value !== 'all' && !r.mealTypes.includes(mealFilter.value as MealType)) {
 return false;
 }
 if (dishFilter.value !== 'all' && r.dishType !== dishFilter.value) {
 return false;
 }
 return true;
 });
});
const builtinCount = computed(() => recipes.value.filter((r) => r.isBuiltin).length);
const customCount = computed(() => recipes.value.filter((r) => !r.isBuiltin).length);
const rollRandom = () => {
 isRolling.value = true;
 let count = 0;
 const interval = setInterval(() => {
 randomRecipe.value = getRandomRecipe({
 mealType: mealFilter.value !== 'all' ? mealFilter.value : undefined,
 dishType: dishFilter.value !== 'all' ? dishFilter.value : undefined,
 });
 count++;
 if (count >= 10) {
 clearInterval(interval);
 randomRecipe.value = getRandomRecipe({
 mealType: mealFilter.value !== 'all' ? mealFilter.value : undefined,
 dishType: dishFilter.value !== 'all' ? dishFilter.value : undefined,
 excludeId: lastRandomId.value ?? undefined,
 });
 if (randomRecipe.value)
 lastRandomId.value = randomRecipe.value.id;
 isRolling.value = false;
 }
 }, 80);
};
const handleView = (r: Recipe) => {
 detailRecipe.value = r;
 showDetail.value = true;
};
const handleSchedule = (r: Recipe) => {
 scheduleRecipe.value = r;
 showPicker.value = true;
};
const handleConfirmSchedule = (r: Recipe, day: any, meal: any) => {
 setSchedule(day, meal, r);
};
const handleSaveRecipe = (data: any) => {
 addRecipe(data);
};
const confirmDelete = (id: string) => {
 const r = recipes.value.find((x) => x.id === id);
 if (r && confirm(`确定删除菜谱「${r.name}」吗？`)) {
 deleteRecipe(id);
 }
};
</script>

<template>
  <div class="space-y-5">
    <!-- 顶部统计和操作 -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="bg-white rounded-2xl p-4 shadow-card border border-warm-100 flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-warm-50 text-warm-600 flex items-center justify-center text-2xl">📚</div>
        <div>
          <div class="text-xs text-clay-500">菜谱总数</div>
          <div class="font-display text-2xl text-clay-800">{{ recipes.length }}</div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-4 shadow-card border border-warm-100 flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-sage-50 text-sage-600 flex items-center justify-center text-2xl">🏠</div>
        <div>
          <div class="text-xs text-clay-500">内置家常</div>
          <div class="font-display text-2xl text-clay-800">{{ builtinCount }}</div>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-4 shadow-card border border-warm-100 flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-clay-50 text-clay-600 flex items-center justify-center text-2xl">✨</div>
        <div>
          <div class="text-xs text-clay-500">自定义</div>
          <div class="font-display text-2xl text-clay-800">{{ customCount }}</div>
        </div>
      </div>
    </div>

    <!-- 随机推荐 + 添加 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- 随机推荐 -->
      <div class="lg:col-span-2 bg-gradient-to-br from-warm-500 to-warm-600 rounded-3xl p-5 shadow-warm text-white relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 text-[180px] opacity-10 leading-none">🎲</div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-display text-xl flex items-center gap-2">
              <Sparkles class="w-5 h-5" />
              <span>今天吃什么？</span>
            </h3>
            <button
              @click="rollRandom"
              :disabled="isRolling"
              class="h-9 px-4 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur text-white text-sm font-medium transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              <span :class="isRolling ? 'animate-spin' : ''">🎰</span>
              <span>{{ isRolling ? '抽取中...' : '帮我选一道' }}</span>
            </button>
          </div>
          <div v-if="randomRecipe"
               class="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/25 cursor-pointer hover:bg-white/25 transition-all"
               @click="!isRolling && handleView(randomRecipe)">
            <div class="flex items-center gap-3">
              <div class="text-4xl" :class="isRolling ? 'animate-bounce-soft' : ''">{{ randomRecipe.emoji }}</div>
              <div class="flex-1">
                <div class="font-display text-xl leading-tight">{{ randomRecipe.name }}</div>
                <div class="text-sm text-white/80 mt-0.5">
                  {{ DISH_LABELS[randomRecipe.dishType] }} · {{ randomRecipe.ingredients.length }} 种食材
                </div>
              </div>
              <button
                @click.stop="handleSchedule(randomRecipe)"
                class="h-9 px-4 rounded-xl bg-white text-warm-600 text-sm font-medium hover:bg-warm-50 transition-all"
              >
                去排餐
              </button>
            </div>
          </div>
          <div v-else class="bg-white/15 backdrop-blur rounded-2xl p-6 border border-white/25 text-center text-white/80">
            点上面的按钮，让命运替你选一道菜 🍽️
          </div>
        </div>
      </div>

      <!-- 操作区 -->
      <div class="bg-white rounded-3xl p-5 shadow-card border border-warm-100 flex flex-col">
        <h3 class="font-display text-xl text-clay-800 mb-3 flex items-center gap-2">
          <span>⚙️</span>
          <span>快捷操作</span>
        </h3>
        <button
          @click="showAddForm = true"
          class="flex-1 min-h-[100px] rounded-2xl border-2 border-dashed border-warm-200 hover:border-warm-400 hover:bg-warm-50 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div class="w-12 h-12 rounded-xl bg-warm-100 group-hover:bg-warm-200 text-warm-600 flex items-center justify-center transition-all group-hover:scale-110">
            <Plus class="w-6 h-6" />
          </div>
          <div class="font-medium text-clay-700 group-hover:text-warm-700 transition-colors">添加新菜谱</div>
          <div class="text-xs text-clay-400">自定义你的拿手菜</div>
        </button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="bg-white rounded-3xl p-4 shadow-card border border-warm-100 space-y-3">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-clay-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索菜谱名称..."
          class="w-full h-12 pl-11 pr-4 rounded-2xl border-2 border-warm-100 bg-warm-50 focus:border-warm-400 focus:bg-white focus:outline-none transition-all placeholder:text-clay-300"
        />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div class="text-xs text-clay-500 mb-1.5 flex items-center gap-1">
            <Filter class="w-3 h-3" />
            <span>餐次分类</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              @click="mealFilter = 'all'"
              class="px-3 h-8 rounded-lg text-xs font-medium transition-all"
              :class="mealFilter === 'all' ? 'bg-warm-500 text-white' : 'bg-warm-50 text-clay-600 border border-warm-100 hover:border-warm-200'"
            >全部</button>
            <button
              v-for="(label, m) in MEAL_LABELS"
              :key="m"
              @click="mealFilter = m as MealType"
              class="px-3 h-8 rounded-lg text-xs font-medium transition-all"
              :class="mealFilter === m ? 'bg-warm-500 text-white' : 'bg-warm-50 text-clay-600 border border-warm-100 hover:border-warm-200'"
            >{{ label }}</button>
          </div>
        </div>
        <div>
          <div class="text-xs text-clay-500 mb-1.5 flex items-center gap-1">
            <Filter class="w-3 h-3" />
            <span>菜式类型</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              @click="dishFilter = 'all'"
              class="px-3 h-8 rounded-lg text-xs font-medium transition-all"
              :class="dishFilter === 'all' ? 'bg-warm-500 text-white' : 'bg-warm-50 text-clay-600 border border-warm-100 hover:border-warm-200'"
            >全部</button>
            <button
              v-for="(label, d) in DISH_LABELS"
              :key="d"
              @click="dishFilter = d as DishType"
              class="px-3 h-8 rounded-lg text-xs font-medium transition-all border"
              :class="dishFilter === d
                ? [DISH_COLORS[d as DishType].bg, DISH_COLORS[d as DishType].text, DISH_COLORS[d as DishType].border]
                : 'bg-warm-50 text-clay-600 border-warm-100 hover:border-warm-200'"
            >{{ label }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 菜谱网格 -->
    <div v-if="filteredRecipes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <RecipeCard
        v-for="r in filteredRecipes"
        :key="r.id"
        :recipe="r"
        @view="handleView"
        @delete="confirmDelete"
        @schedule="handleSchedule"
      />
    </div>
    <div v-else class="bg-white rounded-3xl p-12 shadow-card border border-warm-100 text-center">
      <div class="text-6xl mb-4">🥣</div>
      <div class="font-display text-xl text-clay-700 mb-2">没找到符合条件的菜谱</div>
      <div class="text-sm text-clay-500">换个筛选条件，或者添加一道新菜吧~</div>
    </div>

    <!-- Modals -->
    <RecipeForm
      :visible="showAddForm"
      @close="showAddForm = false"
      @save="handleSaveRecipe"
    />
    <RecipeDetail
      :visible="showDetail"
      :recipe="detailRecipe"
      @close="showDetail = false"
      @schedule="handleSchedule"
    />
    <RecipePicker
      :visible="showPicker"
      title="排餐到..."
      @close="showPicker = false"
      @confirm="handleConfirmSchedule"
    />
  </div>
</template>
