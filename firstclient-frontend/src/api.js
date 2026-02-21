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

console.log("🚀 API initialized. Connected to:", API.defaults.baseURL);

export default API;
