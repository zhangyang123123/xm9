import { reactive, watch } from 'vue';
import type { Recipe, WeeklySchedule, DayOfWeek, MealType, ScheduleRecipe, GroceryItem } from '@/types';
import { DAYS_ORDER, MEALS_ORDER } from '@/types';
import { BUILTIN_RECIPES } from '@/data/builtinRecipes';

const STORAGE_KEYS = {
  recipes: 'hfc_recipes',
  schedule: 'hfc_schedule',
  groceryChecked: 'hfc_grocery_checked',
};

const createEmptySchedule = (): WeeklySchedule => ({
  monday: { breakfast: null, lunch: null, dinner: null },
  tuesday: { breakfast: null, lunch: null, dinner: null },
  wednesday: { breakfast: null, lunch: null, dinner: null },
  thursday: { breakfast: null, lunch: null, dinner: null },
  friday: { breakfast: null, lunch: null, dinner: null },
  saturday: { breakfast: null, lunch: null, dinner: null },
  sunday: { breakfast: null, lunch: null, dinner: null },
});

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

export interface AppState {
  recipes: Recipe[];
  schedule: WeeklySchedule;
  checkedGrocery: Record<string, boolean>;
}

const state = reactive<AppState>({
  recipes: loadFromStorage<Recipe[]>(STORAGE_KEYS.recipes, BUILTIN_RECIPES),
  schedule: loadFromStorage<WeeklySchedule>(STORAGE_KEYS.schedule, createEmptySchedule()),
  checkedGrocery: loadFromStorage<Record<string, boolean>>(STORAGE_KEYS.groceryChecked, {}),
});

watch(
  () => state.recipes,
  (v) => saveToStorage(STORAGE_KEYS.recipes, v),
  { deep: true },
);
watch(
  () => state.schedule,
  (v) => saveToStorage(STORAGE_KEYS.schedule, v),
  { deep: true },
);
watch(
  () => state.checkedGrocery,
  (v) => saveToStorage(STORAGE_KEYS.groceryChecked, v),
  { deep: true },
);

export const useAppStore = () => {
  const addRecipe = (recipeData: Omit<Recipe, 'id' | 'isBuiltin' | 'createdAt'>) => {
    const newRecipe: Recipe = {
      ...recipeData,
      id: `recipe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      isBuiltin: false,
      createdAt: Date.now(),
    };
    state.recipes.push(newRecipe);
  };

  const deleteRecipe = (id: string) => {
    const idx = state.recipes.findIndex((r) => r.id === id);
    if (idx >= 0) state.recipes.splice(idx, 1);
    for (const day of DAYS_ORDER) {
      for (const meal of MEALS_ORDER) {
        if (state.schedule[day][meal]?.id === id) {
          state.schedule[day][meal] = null;
        }
      }
    }
  };

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    const idx = state.recipes.findIndex((r) => r.id === id);
    if (idx >= 0) {
      state.recipes[idx] = { ...state.recipes[idx], ...updates };
    }
  };

  const setSchedule = (day: DayOfWeek, meal: MealType, recipe: Recipe | null) => {
    const scheduleRecipe: ScheduleRecipe | null = recipe
      ? { id: recipe.id, name: recipe.name, emoji: recipe.emoji, ingredients: recipe.ingredients, dishType: recipe.dishType }
      : null;
    state.schedule[day][meal] = scheduleRecipe;
  };

  const clearAllSchedule = () => {
    const empty = createEmptySchedule();
    for (const day of DAYS_ORDER) {
      for (const meal of MEALS_ORDER) {
        state.schedule[day][meal] = empty[day][meal];
      }
    }
  };

  const clearDaySchedule = (day: DayOfWeek) => {
    state.schedule[day].breakfast = null;
    state.schedule[day].lunch = null;
    state.schedule[day].dinner = null;
  };

  const toggleGroceryChecked = (key: string) => {
    state.checkedGrocery[key] = !state.checkedGrocery[key];
  };

  const clearAllGroceryChecked = () => {
    for (const k of Object.keys(state.checkedGrocery)) {
      delete state.checkedGrocery[k];
    }
  };

  const computeGroceryList = (): GroceryItem[] => {
    const map = new Map<string, { name: string; qty: number; unit: string; usedIn: string[] }>();

    for (const day of DAYS_ORDER) {
      for (const meal of MEALS_ORDER) {
        const s = state.schedule[day][meal];
        if (!s) continue;
        for (const ing of s.ingredients) {
          const key = `${ing.name.trim()}|${ing.unit.trim()}`;
          const existing = map.get(key);
          if (existing) {
            existing.qty += Number(ing.quantity) || 0;
            if (!existing.usedIn.includes(s.name)) existing.usedIn.push(s.name);
          } else {
            map.set(key, {
              name: ing.name.trim(),
              qty: Number(ing.quantity) || 0,
              unit: ing.unit.trim(),
              usedIn: [s.name],
            });
          }
        }
      }
    }

    return Array.from(map.values())
      .map((v) => ({
        name: v.name,
        totalQuantity: Number(v.qty.toFixed(2)),
        unit: v.unit,
        usedIn: v.usedIn,
        checked: false,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh'));
  };

  const getRandomRecipe = (filter?: {
    dishType?: Recipe['dishType'];
    mealType?: MealType;
    excludeId?: string;
  }): Recipe | null => {
    let pool = state.recipes;
    if (filter?.dishType) pool = pool.filter((r) => r.dishType === filter.dishType);
    if (filter?.mealType) pool = pool.filter((r) => r.mealTypes.includes(filter.mealType));
    if (filter?.excludeId) pool = pool.filter((r) => r.id !== filter.excludeId);
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  return {
    state,
    addRecipe,
    deleteRecipe,
    updateRecipe,
    setSchedule,
    clearAllSchedule,
    clearDaySchedule,
    toggleGroceryChecked,
    clearAllGroceryChecked,
    computeGroceryList,
    getRandomRecipe,
  };
};
