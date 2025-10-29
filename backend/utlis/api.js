// src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://finance-53gy.onrender.com/api", // ✅ backend base URL
});

export default API;

