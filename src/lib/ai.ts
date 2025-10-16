import Groq from 'groq-sdk';
import { Mistral } from '@mistralai/mistralai';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Initialize Mistral client
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

// AI Service Types
export type AIProvider = 'groq' | 'mistral';

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Groq Service
export async function callGroq(
  messages: AIMessage[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: 'json_object' };
  }
): Promise<AIResponse> {
  try {
    const model = options?.model || process.env.GROQ_MODEL || 'llama-3.1-70b-versatile'
    console.log('Groq API call:', { model, response_format: options?.response_format })
    
    const response = await groq.chat.completions.create({
      model,
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.max_tokens || 1024,
      response_format: options?.response_format,
    });

    const choice = response.choices[0];
    if (!choice?.message?.content) {
      throw new Error('No content received from Groq');
    }

    return {
      content: choice.message.content,
      provider: 'groq',
      model: response.model,
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
      } : undefined,
    };
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error(`Groq API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Mistral Service
export async function callMistral(
  messages: AIMessage[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: 'json_object' };
  }
): Promise<AIResponse> {
  try {
    const model = options?.model || process.env.MISTRAL_MODEL || 'mistral-small-2503'
    console.log('Mistral API call:', { model, response_format: options?.response_format })
    
    const response = await mistral.chat.complete({
      model,
      messages,
      temperature: options?.temperature || 0.7,
      maxTokens: options?.max_tokens || 1024,
      responseFormat: options?.response_format,
    });

    const choice = response.choices?.[0];
    if (!choice?.message?.content) {
      throw new Error('No content received from Mistral');
    }

    // Handle both string and ContentChunk array responses
    const content = typeof choice.message.content === 'string' 
      ? choice.message.content
      : Array.isArray(choice.message.content)
        ? choice.message.content.map(chunk => {
            if (typeof chunk === 'string') return chunk
            if ('text' in chunk && chunk.text) return chunk.text
            return chunk.toString()
          }).join('')
        : String(choice.message.content);

    return {
      content,
      provider: 'mistral',
      model: response.model || 'mistral-small-2503',
      usage: response.usage && 
             response.usage.promptTokens !== undefined &&
             response.usage.completionTokens !== undefined &&
             response.usage.totalTokens !== undefined ? {
        prompt_tokens: response.usage.promptTokens,
        completion_tokens: response.usage.completionTokens,
        total_tokens: response.usage.totalTokens,
      } : undefined,
    };
  } catch (error) {
    console.error('Mistral API error:', error);
    throw new Error(`Mistral API failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Unified AI Service with fallback
export async function callAI(
  messages: AIMessage[],
  options?: {
    provider?: AIProvider;
    model?: string;
    temperature?: number;
    max_tokens?: number;
    fallback?: boolean;
    response_format?: { type: 'json_object' };
  }
): Promise<AIResponse> {
  const { provider = 'groq', fallback = true, ...restOptions } = options || {};

  try {
    if (provider === 'groq') {
      return await callGroq(messages, restOptions);
    } else {
      return await callMistral(messages, restOptions);
    }
  } catch (error) {
    console.error(`Primary AI service (${provider}) failed:`, error);
    
    if (fallback) {
      console.log('Attempting fallback to alternative AI service...');
      const fallbackProvider = provider === 'groq' ? 'mistral' : 'groq';
      
      try {
        if (fallbackProvider === 'groq') {
          return await callGroq(messages, restOptions);
        } else {
          return await callMistral(messages, restOptions);
        }
      } catch (fallbackError) {
        console.error(`Fallback AI service (${fallbackProvider}) also failed:`, fallbackError);
        throw error; // Throw original error
      }
    }
    
    throw error;
  }
}

// Export clients for direct use if needed
export { groq, mistral };

// Enhanced AI Generation for Fitness Plans
import type { UserProfile } from '@/types'
import type { GenerateMealPlanInput, GenerateWorkoutPlanInput, MealPlanPayload, WorkoutPlanPayload } from '@/types/plans'
import { MealPlanPayloadSchema, WorkoutPlanPayloadSchema } from '@/lib/validation/plans'

// Helper function to attempt JSON completion when response is truncated
function completeJSON(truncatedJSON: string): string {
  let completed = truncatedJSON
  
  // Count open/close braces and brackets to determine what's missing
  let braceCount = 0
  let bracketCount = 0
  let inString = false
  let escaped = false
  
  for (let i = 0; i < completed.length; i++) {
    const char = completed[i]
    
    if (escaped) {
      escaped = false
      continue
    }
    
    if (char === '\\') {
      escaped = true
      continue
    }
    
    if (char === '"') {
      inString = !inString
      continue
    }
    
    if (!inString) {
      if (char === '{') braceCount++
      else if (char === '}') braceCount--
      else if (char === '[') bracketCount++
      else if (char === ']') bracketCount--
    }
  }
  
  // Close any unclosed strings
  if (inString) {
    completed += '"'
  }
  
  // Close any unclosed arrays
  while (bracketCount > 0) {
    completed += ']'
    bracketCount--
  }
  
  // Close any unclosed objects
  while (braceCount > 0) {
    completed += '}'
    braceCount--
  }
  
  return completed
}

// Generate a fallback 7-day meal plan with improved JSON handling
async function generateFallbackMealPlan(
  input: GenerateMealPlanInput,
  profile: UserProfile,
  userInfo: {
    age: number;
    gender: string;
    weight: number;
    height: number;
    activityLevel: string;
    primaryGoal: string;
    dietaryPreference?: string;
    allergies: string[];
    targetCalories: number;
    targetMacros: { protein: number; carbs: number; fats: number };
    mealsPerDay: number;
  },
  preferences: {
    goal: string;
    cuisinePreferences: string[];
    cookingTime: string;
    budget: string;
    mealPrepFriendly: boolean;
  }
): Promise<{ success: true; data: MealPlanPayload } | { success: false; error: string }> {
  try {
    console.log('Attempting fallback meal plan generation with improved handling...')
    
    const systemPrompt = `You are a certified nutritionist creating personalized meal plans. You must respond with valid JSON only.

The JSON must exactly match this structure:
{
  "title": "string - descriptive plan title",
  "goal": "string - primary goal like Weight Loss, Muscle Gain, etc",
  "calories": number,
  "macros": {
    "protein": number,
    "carbs": number, 
    "fats": number,
    "calories": number
  },
  "days": [
    {
      "dayIndex": number, // 0-6 (Monday-Sunday)
      "dayLabel": "string - e.g. Monday",
      "meals": [
        {
          "name": "string",
          "timeOfDay": "string - e.g. Breakfast, Lunch, Dinner, Snack 1",
          "calories": number,
          "macros": { "protein": number, "carbs": number, "fats": number, "calories": number },
          "ingredients": ["string ingredients with quantities"],
          "instructions": ["string step by step instructions"],
          "prepTime": number // minutes
        }
      ],
      "totalCalories": number,
      "totalMacros": { "protein": number, "carbs": number, "fats": number, "calories": number }
    }
  ],
  "groceryList": []
}`

    const userPrompt = `Create a complete 7-day Filipino meal plan for:

User Profile:
- Age: ${userInfo.age}, Gender: ${userInfo.gender}
- Weight: ${userInfo.weight}kg, Height: ${userInfo.height}cm  
- Activity Level: ${userInfo.activityLevel}
- Primary Goal: ${userInfo.primaryGoal}
- Dietary Preference: ${userInfo.dietaryPreference || 'none'}
- Allergies: ${userInfo.allergies.length > 0 ? userInfo.allergies.join(', ') : 'none'}

Plan Requirements:
- Title: ${input.title || `Filipino ${preferences.goal} Meal Plan`}
- Daily Calories: ${userInfo.targetCalories}
- Daily Macros: ${userInfo.targetMacros.protein}g protein, ${userInfo.targetMacros.carbs}g carbs, ${userInfo.targetMacros.fats}g fats
- Meals per day: ${userInfo.mealsPerDay} meals EACH day (Total: ${userInfo.mealsPerDay * 7} meals for the week)
- Cuisine Focus: FILIPINO DISHES AND FOODS ONLY
- Include traditional Filipino dishes like Adobo, Sinigang, Pancit, Tinola, Sisig, Kare-Kare, Lumpia, etc.
- Use authentic Filipino ingredients like coconut milk, fish sauce, soy sauce, vinegar, tamarind, kangkong, malunggay, etc.
- Create ALL 7 UNIQUE days (Monday through Sunday) with different meals each day
- Ensure proper nutrition balance while maintaining Filipino authenticity

IMPORTANT: 
1. Return ONLY the JSON object. No explanations, no additional text.
2. Create 7 COMPLETE and DIFFERENT days with maximum variety
3. Keep ingredient lists concise but complete
4. Instructions should be brief but clear
5. Focus on popular, authentic Filipino dishes`

    const aiResponse = await callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      {
        provider: 'groq', // Try Groq first as fallback
        temperature: 0.6,
        max_tokens: 16000, // Full 16k tokens for complete plan
        response_format: { type: 'json_object' },
        fallback: true // Allow fallback to Mistral if Groq fails
      }
    )

    console.log('Fallback plan response length:', aiResponse.content.length)
    console.log('Fallback plan provider:', aiResponse.provider)
    
    let responseContent = aiResponse.content.trim()
    
    // More aggressive JSON completion for fallback
    if (!responseContent.endsWith('}')) {
      console.log('Applying JSON completion to fallback response...')
      responseContent = completeJSON(responseContent)
    }
    
    const parsed = JSON.parse(responseContent)
    
    // Fix grocery list if needed (we don't use it)
    if (parsed.groceryList && !Array.isArray(parsed.groceryList)) {
      parsed.groceryList = []
    } else if (Array.isArray(parsed.groceryList) && parsed.groceryList.length > 0 && typeof parsed.groceryList[0] === 'string') {
      parsed.groceryList = []
    }
    
    const validationResult = MealPlanPayloadSchema.safeParse(parsed)
    
    if (validationResult.success) {
      console.log('Fallback meal plan generated successfully!')
      return { success: true, data: validationResult.data }
    } else {
      console.error('Fallback plan validation failed:', validationResult.error)
      return { success: false, error: `Fallback validation failed: ${validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}` }
    }
  } catch (error) {
    console.error('Fallback meal plan generation failed:', error)
    return { success: false, error: `Fallback generation failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}


// Meal Plan Generation
export async function generateMealPlan(
  input: GenerateMealPlanInput,
  profile: UserProfile
): Promise<{ success: true; data: MealPlanPayload } | { success: false; error: string }> {
  try {
    // Build context from user profile and input
    const userInfo = {
      age: profile.age,
      gender: profile.gender,
      weight: profile.weight,
      height: profile.height,
      activityLevel: profile.activityLevel,
      primaryGoal: profile.primaryGoal,
      dietaryPreference: profile.dietaryPreference,
      allergies: profile.allergies || [],
      targetCalories: input.targetCalories || profile.targetCalories,
      targetMacros: profile.macros,
      mealsPerDay: input.mealsPerDay || profile.mealsPerDay || 3
    }

    // Use user's macro goals if provided, otherwise fall back to profile macros
    const targetMacros = input.macroGoals && (input.macroGoals.protein || input.macroGoals.carbs || input.macroGoals.fats) 
      ? {
          protein: input.macroGoals.protein || profile.macros.protein,
          carbs: input.macroGoals.carbs || profile.macros.carbs,
          fats: input.macroGoals.fats || profile.macros.fats
        }
      : profile.macros

    const preferences = {
      goal: input.goal || (profile.primaryGoal === 'weight-loss' ? 'Weight Loss' : 
                          profile.primaryGoal === 'muscle-gain' ? 'Muscle Gain' : 'General Health'),
      cuisinePreferences: input.cuisinePreferences || ['filipino'],
      cookingTime: input.cookingTime || 'moderate',
      cookingSkill: input.cookingSkill || 'intermediate',
      budget: input.budget || 'moderate',
      mealPrepFriendly: input.mealPrepFriendly || false
    }

    // Create comprehensive prompt
    const systemPrompt = `You are a certified nutritionist creating personalized meal plans. You must respond with valid JSON only.

The JSON must exactly match this structure:
{
  "title": "string - descriptive plan title",
  "goal": "string - primary goal like Weight Loss, Muscle Gain, etc",
  "calories": number,
  "macros": {
    "protein": number,
    "carbs": number, 
    "fats": number,
    "calories": number
  },
  "days": [
    {
      "dayIndex": number, // 0-6 (Monday-Sunday)
      "dayLabel": "string - e.g. Monday",
      "meals": [
        {
          "name": "string",
          "timeOfDay": "string - e.g. Breakfast, Lunch, Dinner, Snack 1",
          "calories": number,
          "macros": { "protein": number, "carbs": number, "fats": number, "calories": number },
          "ingredients": ["string ingredients with quantities"],
          "instructions": ["string step by step instructions"],
          "prepTime": number // minutes
        }
      ],
      "totalCalories": number,
      "totalMacros": { "protein": number, "carbs": number, "fats": number, "calories": number }
    }
  ],
  "groceryList": []
}`

    // Build cooking skill guidance
    let cookingGuidance = ''
    if (preferences.cookingSkill === 'beginner') {
      cookingGuidance = `
COOKING SKILL: Beginner
- Keep recipes SIMPLE with basic techniques only
- Use common, easy-to-find ingredients
- Limit steps to 5-8 per recipe
- Avoid complex techniques like deboning, filleting, or intricate knife work
- Include plenty of one-pot meals and simple stir-fries
- Provide clear, beginner-friendly instructions
`
    } else if (preferences.cookingSkill === 'intermediate') {
      cookingGuidance = `
COOKING SKILL: Intermediate
- Include moderate complexity recipes
- Mix of simple and more involved techniques
- Can include multi-step recipes
- Assume familiarity with basic cooking methods
`
    } else {
      cookingGuidance = `
COOKING SKILL: Advanced
- Can include complex Filipino recipes
- Advanced techniques welcomed (deboning, proper braising, etc.)
- Traditional preparation methods
- Authentic, restaurant-quality dishes
`
    }

    const userPrompt = `Create a complete 7-day Filipino meal plan for:

User Profile:
- Age: ${userInfo.age}, Gender: ${userInfo.gender}
- Weight: ${userInfo.weight}kg, Height: ${userInfo.height}cm  
- Activity Level: ${userInfo.activityLevel}
- Primary Goal: ${userInfo.primaryGoal}
- Dietary Preference: ${userInfo.dietaryPreference || 'none'}
- Allergies: ${userInfo.allergies.length > 0 ? userInfo.allergies.join(', ') : 'none'}

Plan Requirements:
- Title: ${input.title || `Filipino ${preferences.goal} Meal Plan`}
- Daily Calories: ${userInfo.targetCalories}
- Daily Macros: ${targetMacros.protein}g protein, ${targetMacros.carbs}g carbs, ${targetMacros.fats}g fats
- Meals per day: ${userInfo.mealsPerDay} meals EACH day (Total: ${userInfo.mealsPerDay * 7} meals for the week)
- Cuisine Focus: FILIPINO DISHES AND FOODS ONLY
- Include traditional Filipino dishes like Adobo, Sinigang, Pancit, Tinola, Sisig, Kare-Kare, Lumpia, etc.
- Use authentic Filipino ingredients like coconut milk, fish sauce, soy sauce, vinegar, tamarind, kangkong, malunggay, etc.
- Consider Filipino breakfast items like tapsilog, longsilog, bangsilog, etc.
- Include healthy Filipino snacks like fresh fruits (mango, banana, rambutan), kakanin, etc.
- Create ALL 7 UNIQUE days (Monday through Sunday) with different meals each day
- Ensure proper nutrition balance while maintaining Filipino authenticity
- Cooking time preference: ${preferences.cookingTime}
- Budget consideration: ${preferences.budget}
- Meal prep friendly: ${preferences.mealPrepFriendly ? 'Yes - include batch cooking tips' : 'No'}

${cookingGuidance}

MACRO TARGET EMPHASIS:
- STRICTLY aim for ${targetMacros.protein}g protein daily - prioritize protein-rich Filipino dishes
- Target ${targetMacros.carbs}g carbs daily - adjust rice portions accordingly
- Target ${targetMacros.fats}g fats daily - balance coconut-based and lean preparations
- Distribute macros evenly across meals OR front-load protein for muscle building goals

IMPORTANT: 
1. Return ONLY the JSON object. No explanations, no additional text, no markdown formatting.
2. Create 7 COMPLETE and DIFFERENT days, not repeated patterns
3. Each day must have EXACTLY ${userInfo.mealsPerDay} meals
4. Focus exclusively on Filipino cuisine and ingredients
5. Ensure each meal has authentic Filipino flavors and cooking methods
6. RESPECT the cooking skill level - don't make it too complex or too simple
7. Ensure daily macro totals match the targets (±5% tolerance)`

    // Use Mistral for reliable JSON generation
    const aiResponse = await callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      {
        provider: 'mistral',
        temperature: 0.7,
        max_tokens: 16000, // Increased to 16k for comprehensive 7-day meal plans with full details
        response_format: { type: 'json_object' },
        fallback: false
      }
    )

    // Validate and parse the AI response
    console.log('Raw AI Response Length:', aiResponse.content.length)
    console.log('Raw AI Response (first 500 chars):', aiResponse.content.substring(0, 500))
    
    try {
      // Check if response looks truncated
      let responseContent = aiResponse.content.trim()
      
      // Try to detect and fix truncated JSON
      if (!responseContent.endsWith('}')) {
        console.warn('Response appears truncated, attempting to complete JSON...')
        responseContent = completeJSON(responseContent)
      }
      
      // Parse the JSON
      const parsed = JSON.parse(responseContent)
      
      // Fix grocery list if it's not in the right format (we don't need it anyway)
      if (parsed.groceryList && !Array.isArray(parsed.groceryList)) {
        parsed.groceryList = []
      } else if (Array.isArray(parsed.groceryList) && parsed.groceryList.length > 0 && typeof parsed.groceryList[0] === 'string') {
        parsed.groceryList = [] // AI returned strings instead of objects, just empty it
      }
      
      const validationResult = MealPlanPayloadSchema.safeParse(parsed)
      
      if (validationResult.success) {
        return { success: true, data: validationResult.data }
      } else {
        console.error('AI Response validation failed:', validationResult.error)
        return { success: false, error: `Validation failed: ${validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}` }
      }
    } catch (parseError) {
      console.error('JSON Parse error:', parseError)
      console.error('Response content:', aiResponse.content.substring(0, 1000))
      
      // If JSON parse fails due to truncation, try generating with fallback approach
      if (parseError instanceof SyntaxError && parseError.message.includes('Unexpected end of JSON input')) {
        console.log('Attempting to generate meal plan with improved handling...')
        return await generateFallbackMealPlan(input, profile, userInfo, preferences)
      }
      
      return { success: false, error: `JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` }
    }
    
  } catch (error) {
    console.error('Meal plan generation error:', error)
    return { 
      success: false, 
      error: `Failed to generate meal plan: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Workout Plan Generation
export async function generateWorkoutPlan(
  input: GenerateWorkoutPlanInput,
  profile: UserProfile
): Promise<{ success: true; data: WorkoutPlanPayload } | { success: false; error: string }> {
  try {
    // Import ExerciseDB helper (dynamic import to avoid server/client issues)
    const { getSampleExercisesByCategory, fetchExercisesForWorkout, formatExercisesForAI } = await import('@/lib/ai/exercisedb-helper')
    
    // Build context from user profile and input
    const userInfo = {
      age: profile.age,
      gender: profile.gender,
      fitnessLevel: profile.fitnessLevel,
      primaryGoal: profile.primaryGoal,
      activityLevel: profile.activityLevel
    }

    const workoutPrefs = {
      daysPerWeek: input.daysPerWeek || (profile.activityLevel === 'sedentary' ? 3 : 
                                        profile.activityLevel === 'lightly-active' ? 4 : 5),
      sessionLength: input.sessionLength || 60,
      focus: input.focus || (profile.primaryGoal === 'muscle-gain' ? 'hypertrophy' : 
                            profile.primaryGoal === 'weight-loss' ? 'endurance' : 'general'),
      split: input.split || 'full-body',
      equipment: input.equipment || ['dumbbells', 'barbell', 'bodyweight'],
      injuries: input.injuries || [],
      experience: input.experience || profile.fitnessLevel,
      customSplitConfig: input.customSplitConfig
    }

    // Fetch ExerciseDB exercises and prepare prompt section
    let exerciseDBList = ''
    try {
      const exercisesForAI = await fetchExercisesForWorkout({ equipment: workoutPrefs.equipment, limit: 120 })
      exerciseDBList = exercisesForAI.length > 0 
        ? formatExercisesForAI(exercisesForAI)
        : getSampleExercisesByCategory()
    } catch (e) {
      console.warn('Falling back to sample ExerciseDB list due to fetch error:', e)
      exerciseDBList = getSampleExercisesByCategory()
    }

    // Create comprehensive prompt with ExerciseDB integration
    const systemPrompt = `You are a certified personal trainer creating personalized workout plans. You must respond with valid JSON only.

The JSON must exactly match this structure:
{
  "title": "string - descriptive plan title",
  "focus": "string - primary focus like Strength, Hypertrophy, etc",
  "daysPerWeek": number,
  "schedule": [
    {
      "dayIndex": number, // 0-6 (Monday-Sunday)
      "dayLabel": "string - e.g. Monday - Push Day",
      "isRestDay": boolean,
      "blocks": [
        {
          "type": "warmup|main|accessory|cooldown",
          "name": "string - block description",
          "exercises": [
            {
              "exerciseId": "string|null - ExerciseDB ID (e.g., \"0001\") or null for custom",
              "name": "string - exercise name",
              "sets": number,
              "reps": "string - e.g. 8-12, AMRAP, 30 seconds",
              "restSeconds": number,
              "rpe": number, // 1-10 optional
              "equipment": ["string - equipment used"],
              "muscleGroups": ["string - primary muscles worked"]
            }
          ]
        }
      ],
      "totalTime": number, // estimated minutes
      "focus": "string - day focus like Upper Body, Legs, etc"
    }
  ]
}

IMPORTANT: For exercises, prefer using ExerciseDB IDs when available. Set exerciseId to the ID string (e.g., "0001") or null if creating a custom exercise.`

    // Build split-specific guidance
    let splitGuidance = ''
    if (workoutPrefs.split === 'full-body') {
      splitGuidance = `
SPLIT TYPE: Full Body
- Train all major muscle groups in each session
- Include at least one exercise for: chest, back, legs, shoulders, arms, core
- Focus on compound movements (squats, deadlifts, bench press, rows, overhead press)
- Suitable for ${workoutPrefs.daysPerWeek} days per week
`
    } else if (workoutPrefs.split === 'upper-lower') {
      splitGuidance = `
SPLIT TYPE: Upper/Lower Split
- Alternate between upper body and lower body days
- Upper days: Chest, back, shoulders, arms
- Lower days: Quads, hamstrings, glutes, calves, core
- Typically 4 days per week (Upper/Lower/Rest/Upper/Lower/Rest/Rest)
`
    } else if (workoutPrefs.split === 'push-pull-legs') {
      splitGuidance = `
SPLIT TYPE: Push/Pull/Legs (PPL)
- Push Day: Chest, shoulders, triceps (pressing movements)
- Pull Day: Back, biceps, forearms (pulling movements)
- Leg Day: Quads, hamstrings, glutes, calves, core
- Can be run 3x/week (once through) or 6x/week (twice through)
- STRICT separation: No pull exercises on push days, no push exercises on pull days
`
    } else if (workoutPrefs.split === 'bro-split') {
      splitGuidance = `
SPLIT TYPE: Bro Split (Body Part Split)
- Focus on ONE major muscle group per day with high volume
- Day 1: Chest (4-6 exercises, 15-20 sets)
- Day 2: Back (4-6 exercises, 15-20 sets)
- Day 3: Legs (4-6 exercises, 15-20 sets)
- Day 4: Shoulders (4-5 exercises, 12-15 sets)
- Day 5: Arms - Biceps & Triceps (3-4 exercises each, 12-16 sets total)
- Typically 5-6 days per week with dedicated muscle group focus
`
    } else if (workoutPrefs.split === 'custom' && workoutPrefs.customSplitConfig) {
      splitGuidance = `
SPLIT TYPE: Custom Split (User Defined)
The user has defined a custom split. You MUST follow their exact muscle group assignments:
${workoutPrefs.customSplitConfig.map((day) => 
  `- ${day.label}: ${day.muscleGroups.join(', ')}`
).join('\n')}

IMPORTANT: Only include exercises for the specified muscle groups on each day. Do not add extra muscle groups.
`
    } else {
      splitGuidance = `
SPLIT TYPE: Custom
- Create a balanced split based on ${workoutPrefs.daysPerWeek} days per week
- Ensure all major muscle groups are trained at least once per week
`
    }

    const userPrompt = `Create a ${workoutPrefs.daysPerWeek}-day workout plan for:

User Profile:
- Age: ${userInfo.age}, Gender: ${userInfo.gender}
- Fitness Level: ${userInfo.fitnessLevel}
- Primary Goal: ${userInfo.primaryGoal}
- Activity Level: ${userInfo.activityLevel}

Workout Requirements:
- Title: ${input.title || `${workoutPrefs.focus} Training Plan`}
- Days per week: ${workoutPrefs.daysPerWeek}
- Session length: ~${workoutPrefs.sessionLength} minutes
- Focus: ${workoutPrefs.focus}
- Available equipment: ${workoutPrefs.equipment.join(', ')}
- Injuries/limitations: ${workoutPrefs.injuries.length > 0 ? workoutPrefs.injuries.join(', ') : 'none'}
- Experience level: ${workoutPrefs.experience}

${splitGuidance}

${exerciseDBList}

IMPORTANT INSTRUCTIONS:
- You are a certified personal trainer focused on safety and proper form
- **USE ExerciseDB IDs from the list above when possible** - this provides users with animated GIFs
- Respect the split type exactly as specified above
- For bro splits, use high volume for the target muscle group
- For custom splits, ONLY include the muscle groups specified for each day
- Avoid exercises that conflict with listed injuries
- Only use equipment the user has available
- Include warm-up and cool-down blocks
- Use progressive overload principles
- Set exerciseId to the ID string (e.g., "0001") when using ExerciseDB exercises
- Set exerciseId to null if creating a custom exercise not in the database

Return only the JSON response.`

    // Use Mistral for reliable workout plan generation
    const aiResponse = await callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      {
        provider: 'mistral',
        temperature: 0.7,
        max_tokens: 6000,
        response_format: { type: 'json_object' },
        fallback: false
      }
    )

    // Validate and parse the AI response
    try {
      // Since we're using JSON mode, parse directly
      const parsed = JSON.parse(aiResponse.content)
      const validationResult = WorkoutPlanPayloadSchema.safeParse(parsed)
      
      if (validationResult.success) {
        return { success: true, data: validationResult.data }
      } else {
        console.error('AI Response validation failed:', validationResult.error)
        return { success: false, error: `Validation failed: ${validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}` }
      }
    } catch (parseError) {
      console.error('JSON Parse error:', parseError)
      console.error('Response content:', aiResponse.content.substring(0, 1000))
      return { success: false, error: `JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` }
    }
    
  } catch (error) {
    console.error('Workout plan generation error:', error)
    return { 
      success: false, 
      error: `Failed to generate workout plan: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}
