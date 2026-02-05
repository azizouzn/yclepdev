const STORAGE_KEY = 'yclep_user_prefs';
const MAX_CATEGORIES = 3;

interface UserPreferences {
  preferredCategories: { [key: string]: number }; // Store category with view count
}

// Function to get the current user preferences from localStorage
const getPreferences = (): UserPreferences => {
  try {
    const storedPrefs = localStorage.getItem(STORAGE_KEY);
    if (storedPrefs) {
      return JSON.parse(storedPrefs);
    }
  } catch (error) {
    console.error("Failed to parse user preferences:", error);
  }
  return { preferredCategories: {} };
};

// Function to save user preferences to localStorage
const savePreferences = (prefs: UserPreferences) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error("Failed to save user preferences:", error);
  }
};

/**
 * Adds a new category to the user's preferred list or increments its count.
 * It sorts by count and keeps the top MAX_CATEGORIES.
 * @param category The category to add.
 */
export const addPreferredCategory = (category: string): void => {
  if (!category) return;
  const prefs = getPreferences();
  
  // Increment the count for the given category
  prefs.preferredCategories[category] = (prefs.preferredCategories[category] || 0) + 1;
  
  // Sort categories by view count in descending order
  const sortedCategories = Object.entries(prefs.preferredCategories)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, MAX_CATEGORIES);

  // Rebuild the object with only the top categories
  prefs.preferredCategories = Object.fromEntries(sortedCategories);
  
  savePreferences(prefs);
};

/**
 * Retrieves the list of preferred categories, sorted by preference.
 * @returns An array of category strings.
 */
export const getPreferredCategories = (): string[] => {
    const prefs = getPreferences();
    return Object.entries(prefs.preferredCategories)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([category]) => category);
};
