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

const baseURL =
  hostname === "localhost" || hostname.startsWith("192.168.")
    ? `http://${hostname}:3000`
    : " https://c0b9ae57cf6c.ngrok-free.app"; // ✅ ngrok HTTPS

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default axiosInstance;
