import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import JSONbig from 'json-bigint';

const localApi = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
  transformResponse: [
    (data) => {
      // Some responses (e.g. 204 No Content) return an empty body which would
      // cause JSON parsing to throw. Return null/empty data as-is in that case.
      if (data === null || data === undefined || data === '') return data;
      try {
        return JSONbig.parse(data);
      } catch (err) {
        // If parsing fails, log and return the raw data to avoid unhandled exceptions
        // downstream. The caller can handle unexpected formats as needed.
        // eslint-disable-next-line no-console
        console.warn('Failed to parse JSON response, returning raw data:', err);
        return data;
      }
    }
  ]
});

let accessToken: string | null = null;

// Check if the URL is for the refresh token endpoint to avoid infinite loops
const isRefreshTokenEndpoint = (url: string): boolean => {
  return url.includes("/api/auth/refresh");
};

const setupInterceptors = (apiInstance: typeof axios) => {
  apiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      if (!accessToken) {
        accessToken = localStorage.getItem('accessToken');
      }
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
  );

  apiInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
  );
};

setupInterceptors(localApi);


const api = {
  request: (config: AxiosRequestConfig) => {
    const apiInstance = localApi;
    return apiInstance(config);
  },
  get: (url: string, config?: AxiosRequestConfig) => {
    const apiInstance = localApi;
    return apiInstance.get(url, config);
  },
  post: (url: string, data?: unknown, config?: AxiosRequestConfig) => {
    const apiInstance = localApi;
    return apiInstance.post(url, data, config);
  },
  put: (url: string, data?: unknown, config?: AxiosRequestConfig) => {
    const apiInstance = localApi;
    return apiInstance.put(url, data, config);
  },
  delete: (url: string, config?: AxiosRequestConfig) => {
    const apiInstance = localApi;
    return apiInstance.delete(url, config);
  },
};

export default api;
