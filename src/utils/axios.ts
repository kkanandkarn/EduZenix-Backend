import axios, { AxiosRequestConfig, AxiosError } from "axios";

interface ExternalApiCallOptions<TData = unknown> {
  method?: string;
  data?: TData;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  timeout?: number;
}

interface ApiErrorBody {
  message?: string;
}

export const externalApiCall = async <TResponse = unknown, TData = unknown>(
  url: string,
  options: ExternalApiCallOptions<TData> = {},
): Promise<TResponse> => {
  try {
    const config: AxiosRequestConfig<TData> = {
      url,
      method: options.method || "GET",
      data: options.data,
      params: options.params,
      headers: options.headers,
      timeout: options.timeout || 10000,
    };

    const response = await axios<TResponse>(config);

    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiErrorBody>;

    if (err.response) {
      console.error("API Error:", err.response.status, err.response.data);
      throw new Error(
        `API request failed with status ${err.response.status}: ${err.response.data?.message || err.message}`,
      );
    } else if (err.request) {
      console.error("No response from API:", err.message);
      throw new Error("No response received from API");
    } else {
      console.error("Error setting up request:", err.message);
      throw new Error(err.message);
    }
  }
};
