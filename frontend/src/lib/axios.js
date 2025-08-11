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

const hostname = window.location.hostname;

// If running locally OR loaded from Firebase, always point to your local backend
const baseURL =
  hostname === "localhost" || hostname.startsWith("192.168.")
    ? `http://${hostname}:3000`
    : "http://192.168.1.45:3000"; // 🔥 Local NestJS server

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
