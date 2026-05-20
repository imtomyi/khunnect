export interface RegisterFormData {
  email: string
  password: string
  role: 'student' | 'alumni' | null
  name: string
  admissionYear: number | null
  graduationYear: number | null
  departmentId: number | null
  trackId: number | null
}

export const INITIAL_FORM_DATA: RegisterFormData = {
  email: '',
  password: '',
  role: null,
  name: '',
  admissionYear: null,
  graduationYear: null,
  departmentId: null,
  trackId: null,
}