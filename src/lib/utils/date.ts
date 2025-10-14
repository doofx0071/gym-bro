/**
 * Date utility functions for plan generation
 */

/**
 * Gets the start of the current week (Monday at 00:00:00)
 * This ensures consistent week_start_date values for the same week
 */
export function getWeekStartDate(date?: Date): Date {
  const targetDate = date || new Date()
  const dayOfWeek = targetDate.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Calculate days to subtract to get to Monday
  
  const monday = new Date(targetDate)
  monday.setDate(targetDate.getDate() - daysFromMonday)
  monday.setHours(0, 0, 0, 0) // Set to start of day
  
  return monday
}

/**
 * Gets a unique week identifier string (YYYY-WW format)
 */
export function getWeekIdentifier(date?: Date): string {
  const weekStart = getWeekStartDate(date)
  const year = weekStart.getFullYear()
  
  // Calculate week number
  const startOfYear = new Date(year, 0, 1)
  const daysSinceStart = Math.floor((weekStart.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7)
  
  return `${year}-${weekNumber.toString().padStart(2, '0')}`
}

/**
 * Formats date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

/**
 * Formats date range for week display
 */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  
  const startFormat = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(weekStart)
  
  const endFormat = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(weekEnd)
  
  return `${startFormat} - ${endFormat}`
}