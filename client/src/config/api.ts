const rawApiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
 
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '').endsWith('/api')
    ? rawApiBaseUrl.replace(/\/+$/, '')
    : `${rawApiBaseUrl.replace(/\/+$/, '')}/api`;
