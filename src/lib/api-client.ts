// ============================================
// API Client Configuration
// ============================================

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// API Base URL (configure based on environment)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================
// Request Interceptor (Auth)
// ============================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request ID for tracking
    if (config.headers) {
      config.headers['X-Request-ID'] = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// ============================================
// Response Interceptor (Error Handling)
// ============================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      const status = error.response.status
      const message = (error.response.data as any)?.message || error.message

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
          break

        case 403:
          // Forbidden - insufficient permissions
          console.error('Access forbidden:', message)
          break

        case 404:
          // Not found
          console.error('Resource not found:', message)
          break

        case 500:
          // Server error
          console.error('Server error:', message)
          break

        default:
          console.error('API error:', status, message)
      }

      return Promise.reject({
        status,
        message,
        data: error.response.data,
      })
    }

    if (error.code === 'ECONNABORTED') {
      // Timeout
      return Promise.reject({
        status: 408,
        message: 'Request timeout. Please try again.',
      })
    }

    if (error.code === 'ERR_NETWORK') {
      // Network error
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
      })
    }

    return Promise.reject(error)
  }
)

// ============================================
// API Endpoints
// ============================================

// Cases API
export const casesApi = {
  list: (params?: any) =>
    apiClient.get('/cases', { params }),
  get: (id: string) =>
    apiClient.get(`/cases/${id}`),
  create: (data: any) =>
    apiClient.post('/cases', data),
  update: (id: string, data: any) =>
    apiClient.put(`/cases/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/cases/${id}`),
}

// Documents API
export const documentsApi = {
  upload: (caseId: string, formData: FormData, onProgress?: (progress: number) => void) =>
    apiClient.post(`/cases/${caseId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }),
  list: (caseId: string) =>
    apiClient.get(`/cases/${caseId}/documents`),
  get: (id: string) =>
    apiClient.get(`/documents/${id}`),
  delete: (id: string) =>
    apiClient.delete(`/documents/${id}`),
  update: (id: string, data: any) =>
    apiClient.put(`/documents/${id}`, data),
}

// Quality Check API
export const qualityCheckApi = {
  run: (documentId: string) =>
    apiClient.post(`/documents/${documentId}/quality-check`),
  getResult: (documentId: string) =>
    apiClient.get(`/documents/${documentId}/quality-check`),
  approve: (documentId: string) =>
    apiClient.post(`/documents/${documentId}/quality-check/approve`),
  requestOverride: (documentId: string, reason: string) =>
    apiClient.post(`/documents/${documentId}/quality-check/override`, { reason }),
}

// Extraction API
export const extractionApi = {
  start: (caseId: string) =>
    apiClient.post(`/cases/${caseId}/extraction`),
  getStatus: (caseId: string) =>
    apiClient.get(`/cases/${caseId}/extraction/status`),
  getResults: (caseId: string) =>
    apiClient.get(`/cases/${caseId}/extraction/results`),
  updateField: (caseId: string, fieldId: string, value: any) =>
    apiClient.put(`/cases/${caseId}/extraction/fields/${fieldId}`, { value }),
  reextractField: (caseId: string, fieldId: string) =>
    apiClient.post(`/cases/${caseId}/extraction/fields/${fieldId}/reextract`),
  getFieldHistory: (caseId: string, fieldId: string) =>
    apiClient.get(`/cases/${caseId}/extraction/fields/${fieldId}/history`),
}

// Rules API
export const rulesApi = {
  evaluate: (caseId: string) =>
    apiClient.post(`/cases/${caseId}/rules/evaluate`),
  getResults: (caseId: string) =>
    apiClient.get(`/cases/${caseId}/rules/results`),
  replay: (caseId: string) =>
    apiClient.post(`/cases/${caseId}/rules/replay`),
  requestException: (caseId: string, ruleId: string, reason: string) =>
    apiClient.post(`/cases/${caseId}/rules/${ruleId}/exception`, { reason }),
}

// Decision API
export const decisionApi = {
  generate: (caseId: string) =>
    apiClient.post(`/cases/${caseId}/decision`),
  get: (caseId: string) =>
    apiClient.get(`/cases/${caseId}/decision`),
  approve: (caseId: string, data?: any) =>
    apiClient.post(`/cases/${caseId}/decision/approve`, data),
  reject: (caseId: string, reason: string) =>
    apiClient.post(`/cases/${caseId}/decision/reject`, { reason }),
  requestInfo: (caseId: string, message: string) =>
    apiClient.post(`/cases/${caseId}/decision/request-info`, { message }),
  downloadReport: (caseId: string) =>
    apiClient.get(`/cases/${caseId}/decision/report`, { responseType: 'blob' }),
}

// Timeline API
export const timelineApi = {
  get: (caseId: string) =>
    apiClient.get(`/cases/${caseId}/timeline`),
}

// Logs API
export const logsApi = {
  get: (caseId: string, params?: any) =>
    apiClient.get(`/cases/${caseId}/logs`, { params }),
}

// ============================================
// Types
// ============================================

export interface ApiError {
  status: number
  message: string
  data?: any
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
