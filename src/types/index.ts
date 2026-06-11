export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type DishType = 'meat' | 'vegetable' | 'soup';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  mealTypes: MealType[];
  dishType: DishType;
  ingredients: Ingredient[];
  steps: string;
  isBuiltin: boolean;
  createdAt: number;
}

export type ScheduleRecipe = Pick<Recipe, 'id' | 'name' | 'emoji' | 'ingredients' | 'dishType'>;

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  breakfast: ScheduleRecipe | null;
  lunch: ScheduleRecipe | null;
  dinner: ScheduleRecipe | null;
}

export interface GroceryItem {
  name: string;
  totalQuantity: number;
  unit: string;
  usedIn: string[];
}

export interface GroceryState {
  checkedItems: Record<string, boolean>;
}

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
};

export const MEAL_EMOJIS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
};

export const DISH_LABELS: Record<DishType, string> = {
  meat: '荤菜',
  vegetable: '素菜',
  soup: '汤品',
};

export const DISH_COLORS: Record<DishType, { bg: string; text: string; border: string }> = {
  meat: { bg: 'bg-warm-50', text: 'text-warm-700', border: 'border-warm-200' },
  vegetable: { bg: 'bg-sage-50', text: 'text-sage-700', border: 'border-sage-200' },
  soup: { bg: 'bg-clay-50', text: 'text-clay-700', border: 'border-clay-200' },
};

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: '周一',
  tuesday: '周二',
  wednesday: '周三',
  thursday: '周四',
  friday: '周五',
  saturday: '周六',
  sunday: '周日',
};

export const DAYS_ORDER: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

export const MEALS_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner'];
