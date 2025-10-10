import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ matches backend
});

export default API;
