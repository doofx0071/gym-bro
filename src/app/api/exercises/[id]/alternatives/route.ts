import { NextRequest, NextResponse } from 'next/server'
import { getAllExercises } from '@/lib/apis/exercisedb'
import { getAlternativesForExercise } from '@/lib/exercises/alternatives'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Exercise ID is required' },
        { status: 400 }
      )
    }

    // Fetch all exercises (with a reasonable limit for performance)
    const allExercises = await getAllExercises({ limit: 200, offset: 0 })
    
    // Find alternatives
    const alternatives = await getAlternativesForExercise(id, allExercises, 5)
    
    return NextResponse.json({ alternatives }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching alternative exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alternative exercises' },
      { status: 500 }
    )
  }
}
