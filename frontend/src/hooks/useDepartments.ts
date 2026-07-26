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

export interface CollegeWithDepartments {
  id: number
  name: string
  departments: { id: number; name: string }[]
}

// 네비 메가 드롭다운용 — 단과대학별로 학과를 묶어 한 번에 반환
export function useDepartmentsByCollege() {
  return useQuery({
    queryKey: ['departments_by_college'],
    queryFn: async (): Promise<CollegeWithDepartments[]> => {
      const [collegesRes, deptsRes] = await Promise.all([
        supabase.from('colleges').select('id, name').order('id'),
        supabase.from('departments').select('id, name, college_id').order('id'),
      ])
      if (collegesRes.error) throw collegesRes.error
      if (deptsRes.error) throw deptsRes.error

      const colleges = (collegesRes.data ?? []) as { id: number; name: string }[]
      const depts = (deptsRes.data ?? []) as { id: number; name: string; college_id: number }[]

      return colleges
        .map((c) => ({
          id: c.id,
          name: c.name,
          departments: depts
            .filter((d) => d.college_id === c.id)
            .map((d) => ({ id: d.id, name: d.name })),
        }))
        .filter((c) => c.departments.length > 0)
    },
    staleTime: 1000 * 60 * 30, // 30분 — 학과 목록은 거의 변하지 않음
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