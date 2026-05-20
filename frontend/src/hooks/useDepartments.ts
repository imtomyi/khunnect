import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface College {
  id: number
  name: string
  campus: string
}

export interface Department {
  id: number
  college_id: number
  name: string
  has_tracks: boolean
}

export interface Track {
  id: number
  department_id: number
  name: string
}

export function useColleges() {
  return useQuery({
    queryKey: ['colleges'],
    queryFn: async () => {
      const { data, error } = await supabase.from('colleges').select('*')
      if (error) throw error
      return data as College[]
    },
  })
}

export function useDepartments(collegeId: number | null) {
  return useQuery({
    queryKey: ['departments', collegeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('college_id', collegeId!)
      if (error) throw error
      return data as Department[]
    },
    enabled: collegeId !== null,
  })
}

export function useTracks(departmentId: number | null) {
  return useQuery({
    queryKey: ['tracks', departmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('department_id', departmentId!)
      if (error) throw error
      return data as Track[]
    },
    enabled: departmentId !== null,
  })
}