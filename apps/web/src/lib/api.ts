import axios from "axios";

axios.defaults.baseURL = "";
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const responseData = error.response?.data as
    | { error?: { message?: string } }
    | undefined;
  return responseData?.error?.message || fallback;
}
