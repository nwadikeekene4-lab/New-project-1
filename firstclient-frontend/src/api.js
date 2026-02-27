import axios from 'axios';

// Detects if the app is on Render (VITE_API_URL) or on your computer (localhost)
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api` 
        : "http://localhost:5000/api", 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// --- 1. REQUEST INTERCEPTOR ---
// This runs before every request. It grabs the token and adds it to the headers.
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- 2. RESPONSE INTERCEPTOR ---
// This watches every response. If it sees a 401, it kicks the user to login.
API.interceptors.response.use(
    (response) => response, 
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized/Session Expired. Redirecting...");
            
            localStorage.removeItem('adminToken'); // Clear the bad token

            // Only alert and redirect if we aren't already on the login page
            if (!window.location.pathname.includes('/admin/login')) {
                alert("Your session has expired. Please log in again.");
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

console.log("🚀 API initialized. Connected to:", API.defaults.baseURL);

export default API;