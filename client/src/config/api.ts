const rawApiBaseUrl =
    import.meta.env.VITE_API_BASE_URL
 
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '').endsWith('/api')
    ? rawApiBaseUrl.replace(/\/+$/, '')
    : `${rawApiBaseUrl.replace(/\/+$/, '')}/api`;
