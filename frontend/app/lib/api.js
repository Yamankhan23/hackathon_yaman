import axios from "axios";

const API = axios.create({
    baseURL: "https://hackathon-yaman.onrender.com/", // your backend
    withCredentials: true,
});

export default API;
