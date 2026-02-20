import axios from 'axios';

// While in development, we point to your local machine (localhost)
const API = axios.create({
    baseURL: "http://localhost:5000/api", 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// This log helps you verify in the Browser Console that you are testing locally
console.log("🚀 API instance initialized pointing to LOCALHOST: http://localhost:5000");

export default API;