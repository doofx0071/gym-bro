"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllExercises, searchExercisesByName, getExercisesByBodyPart, getExercisesByEquipment, resetCircuitBreaker } from '@/lib/apis/exercisedb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter, Dumbbell } from 'lucide-react'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const BODY_PARTS = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core', 'cardio']
const EQUIPMENT_TYPES = ['barbell', 'dumbbell', 'bodyweight', 'cable', 'machine', 'band', 'kettlebell']

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('all')
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all')
  const [page, setPage] = useState(0)
  const limit = 25 // API max limit is 25 per page

  // Reset circuit breaker on mount to give API a fresh start
  useEffect(() => {
    resetCircuitBreaker();
  }, []);

  // Determine which query to use based on filters
  const getQueryFn = () => {
    if (searchQuery.trim()) {
      return () => searchExercisesByName(searchQuery.trim())
    } else if (selectedBodyPart !== 'all') {
      return () => getExercisesByBodyPart({ bodyPart: selectedBodyPart, limit, offset: page * limit })
    } else if (selectedEquipment !== 'all') {
      return () => getExercisesByEquipment({ equipment: selectedEquipment, limit, offset: page * limit })
    } else {
      return () => getAllExercises({ limit, offset: page * limit })
    }
  }

  const { data: exercises = [], isLoading, error } = useQuery({
    queryKey: ['exercises', searchQuery, selectedBodyPart, selectedEquipment, page],
    queryFn: getQueryFn(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(0) // Reset page when searching
  }

  const handleBodyPartChange = (value: string) => {
    setSelectedBodyPart(value)
    setSearchQuery('') // Clear search when filtering
    setPage(0)
  }

  const handleEquipmentChange = (value: string) => {
    setSelectedEquipment(value)
    setSearchQuery('') // Clear search when filtering
    setPage(0)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedBodyPart('all')
    setSelectedEquipment('all')
    setPage(0)
  }

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-background to-muted p-4 md:p-8 pb-20 md:pb-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Explore Exercises</h2>
          <p className="text-muted-foreground">
            Browse and search through our comprehensive exercise database
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises by name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Selects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Body Part</label>
                <Select value={selectedBodyPart} onValueChange={handleBodyPartChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All body parts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All body parts</SelectItem>
                    {BODY_PARTS.map((part) => (
                      <SelectItem key={part} value={part} className="capitalize">
                        {part}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Equipment</label>
                <Select value={selectedEquipment} onValueChange={handleEquipmentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All equipment</SelectItem>
                    {EQUIPMENT_TYPES.map((equip) => (
                      <SelectItem key={equip} value={equip} className="capitalize">
                        {equip}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="w-full cursor-pointer"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="w-full aspect-square rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-destructive mb-2">Failed to load exercises</p>
              <p className="text-sm text-muted-foreground">Please try again later</p>
            </CardContent>
          </Card>
        ) : exercises.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No exercises found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Exercise Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {exercises.map((exercise) => (
                <Link key={exercise.exerciseId} href={`/exercises/${exercise.exerciseId}`} className="cursor-pointer">
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      {/* GIF */}
                      <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={exercise.gifUrl}
                          alt={exercise.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          style={{
                            imageRendering: 'auto',
                            filter: 'contrast(1.05) saturate(1.1)',
                          }}
                        />
                      </div>

                      {/* Name */}
                      <h3 className="font-medium text-sm line-clamp-2">{exercise.name}</h3>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1">
                        {exercise.bodyParts?.slice(0, 2).map((part) => (
                          <Badge key={part} variant="secondary" className="text-xs capitalize">
                            {part}
                          </Badge>
                        ))}
                        {exercise.equipments?.slice(0, 1).map((equip) => (
                          <Badge key={equip} variant="outline" className="text-xs capitalize">
                            {equip}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {!searchQuery && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={exercises.length < limit}
                  className="cursor-pointer"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
