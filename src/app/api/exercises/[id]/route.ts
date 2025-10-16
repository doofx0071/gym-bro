import { NextRequest, NextResponse } from 'next/server'
import { getExerciseById } from '@/lib/apis/exercisedb'

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

    const exercise = await getExerciseById(id)
    
    return NextResponse.json(exercise, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching exercise:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercise data' },
      { status: 500 }
    )
  }
}
