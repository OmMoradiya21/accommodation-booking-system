import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      originalRequest._retry = true;
      try {
        const savedUser = JSON.parse(localStorage.getItem("user") || "null");
        const userId = savedUser?.sub;
        if (!userId) {
          throw new Error("No user found");
        }
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("No token found");
        }
        const refreshResponse = await axios.get(`${BASE_URL}/auth/${userId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const newToken = refreshResponse.data?.access_token;
        console.log("get new token by axios: ");
        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export { api };
