
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/";

const api = axios.create({
    baseURL: BASE_URL,
});

// Track an ongoing token refresh
let isRefreshing = false;

// Hold requests until the refresh finishes
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

const notifyRefreshSubscribers = (token) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

const rejectRefreshSubscribers = (error) => {
    refreshSubscribers.forEach((callback) => callback(null, error));
    refreshSubscribers = [];
};

// Attach the access token to API requests
api.interceptors.request.use(
    (config) => {
        const publicEndpoints = [
            "users/register/",
            "users/login/",
            "users/token/refresh/",
        ];

        const isPublicEndpoint = publicEndpoints.some((endpoint) =>
            config.url?.includes(endpoint)
        );

        if (!isPublicEndpoint) {
            const token = localStorage.getItem("access");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Refresh expired access tokens
// Refresh expired access tokens
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry
        ) {
            return Promise.reject(error);
        }

        // Don't refresh tokens for login, registration, or refresh requests
        const requestUrl = originalRequest.url || "";

        if (
            requestUrl.includes("users/login/") ||
            requestUrl.includes("users/register/") ||
            requestUrl.includes("users/token/refresh/")
        ) {
            return Promise.reject(error);
        }

        // If another request is already refreshing, wait for it
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((token, refreshError) => {
                    if (refreshError || !token) {
                        reject(refreshError || error);
                        return;
                    }

                    originalRequest._retry = true;
                    originalRequest.headers =
                        originalRequest.headers || {};

                    originalRequest.headers.Authorization =
                        `Bearer ${token}`;

                    resolve(api(originalRequest));
                });
            });
        }

        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refresh");

        if (!refreshToken) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.href = "/";

            return Promise.reject(error);
        }

        isRefreshing = true;

        try {
            // Refresh the token without triggering this API instance's interceptors
            const response = await axios.post(
                `${BASE_URL}users/token/refresh/`,
                { refresh: refreshToken }
            );

            const newAccessToken = response.data.access;
            const newRefreshToken = response.data.refresh;

            if (!newAccessToken) {
                throw new Error("No access token returned.");
            }

            // Save the new tokens
            localStorage.setItem("access", newAccessToken);

            if (newRefreshToken) {
                localStorage.setItem("refresh", newRefreshToken);
            }

            // Release requests waiting for the refresh
            notifyRefreshSubscribers(newAccessToken);

            // Retry the original request
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return await api(originalRequest);

        } catch (refreshError) {
            // Reject requests that were waiting for the refresh
            rejectRefreshSubscribers(refreshError);

            console.error("Token refresh failed:", refreshError);

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.href = "/";

            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
