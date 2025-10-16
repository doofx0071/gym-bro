import { NextRequest, NextResponse } from 'next/server'
import { getExerciseById } from '@/lib/apis/exercisedb'
import type { Exercise, RawExerciseFromAPI } from '@/types/exercise'

// Transform helper (same as in exercisedb.ts)
function transformExercise(raw: RawExerciseFromAPI): Exercise {
  return {
    exerciseId: raw.exerciseId,
    name: raw.name,
    gifUrl: raw.gifUrl,
    targetMuscles: raw.targetMuscles || [],
    bodyParts: raw.bodyParts || [],
    equipments: raw.equipments || [],
    secondaryMuscles: raw.secondaryMuscles || [],
    instructions: (raw.instructions || []).map(instruction => 
      instruction.replace(/^Step[:\s]*\d+[:\s]*/i, '').trim()
    ),
  };
}

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await paramsPromise
    
    if (!id) {
      return NextResponse.json(
        { error: 'Exercise ID is required' },
        { status: 400 }
      )
    }

    // Check if this is a valid exercise ID format
    // Accept both 4-digit numbers ("0001") and 7-character alphanumeric ("DhMl549")
    const isValidId = /^\d{4}$/.test(id) || /^[a-zA-Z0-9]{7}$/.test(id)
    
    if (!isValidId) {
      console.log(`Invalid exercise ID format: ${id}`)
      // Return empty alternatives for invalid IDs
      return NextResponse.json({ alternatives: [] }, { status: 200 })
    }

    // Get the current exercise details
    const currentExercise = await getExerciseById(id).catch(() => null);
    
    if (!currentExercise) {
      console.log(`Exercise ${id} not found`);
      return NextResponse.json({ alternatives: [] }, { status: 200 });
    }
    
    // Use the filter endpoint to find similar exercises
    const BASE_URL = process.env.NEXT_PUBLIC_EXERCISEDB_API_URL || 'https://gym-bro-exercisedb-api-v1.vercel.app/api/v1';
    
    // Build filter query params
    const queryParams = new URLSearchParams({
      limit: '25',
      offset: '0',
      muscles: currentExercise.targetMuscles.join(','),
      equipment: currentExercise.equipments.join(','),
      bodyParts: currentExercise.bodyParts.join(','),
    });
    
    const response = await fetch(`${BASE_URL}/exercises/filter?${queryParams}`, {
      cache: 'no-store'
    }).catch(() => null);
    
    if (!response || !response.ok) {
      console.log('Filter API failed, returning empty alternatives');
      return NextResponse.json({ alternatives: [] }, { status: 200 });
    }
    
    const data = await response.json();
    const rawExercises: RawExerciseFromAPI[] = data.data || [];
    
    // Transform and filter
    let alternatives = rawExercises
      .map(transformExercise)
      .filter(ex => ex.exerciseId !== id)
      .slice(0, 5);
    
    // Fallback: If no alternatives found, try broader search by body part only
    if (alternatives.length === 0 && currentExercise.bodyParts.length > 0) {
      const fallbackQueryParams = new URLSearchParams({
        limit: '25',
        offset: '0',
        bodyParts: currentExercise.bodyParts.join(','),
      });
      
      const fallbackResponse = await fetch(`${BASE_URL}/exercises/filter?${fallbackQueryParams}`, {
        cache: 'no-store'
      }).catch(() => null);
      
      if (fallbackResponse && fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const fallbackRaw: RawExerciseFromAPI[] = fallbackData.data || [];
        alternatives = fallbackRaw
          .map(transformExercise)
          .filter(ex => ex.exerciseId !== id)
          .slice(0, 5);
      }
    }
    
    return NextResponse.json({ alternatives }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching alternative exercises:', error)
    // Return empty array instead of error to prevent UI breaks
    return NextResponse.json({ alternatives: [] }, { status: 200 })
  }
}
