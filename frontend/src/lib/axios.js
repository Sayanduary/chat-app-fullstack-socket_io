import axios from "axios";
import { normalizeUrl } from "./url";

const defaultApiBaseUrl =
  import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api";
const apiBaseUrl = normalizeUrl(
  import.meta.env.VITE_API_URL,
  defaultApiBaseUrl,
);

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});
