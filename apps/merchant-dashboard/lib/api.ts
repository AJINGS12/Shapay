import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const user = auth.currentUser;

  if (user) {
    config.headers["x-merchant-id"] = user.uid;
  }

  return config;
});

export default api;