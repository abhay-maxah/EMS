// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: "http://localhost:3000", 
//   withCredentials: true, 
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default axiosInstance;
import axios from "axios";

// Dynamically detect hostname
const hostname = window.location.hostname;

// Handle both localhost and local IP (192.168.x.x)
const baseURL = hostname === "localhost" || hostname.startsWith("192.168.")
  ? `http://${hostname}:3000` // Will be localhost or your IP like 192.168.1.45
  : "https://employee-8a0eb.web.app/";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // 🔥 For cookies/session handling
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
