import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../helper/Constant";
import { Options, useToasts } from "react-toast-notifications";
import { useAppDispatch, useAppSelector } from "../app/store/store";
import { resetUser, updateEcoModalOpen } from "../app/slice/auth.slice";
import { resetRoot } from "../app/slice/root.slice";
import { resetRoster } from "../app/slice/roster.slice";

export const defaultErrorMessage = "Something went wrong!";

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});
const errorToastOptions: Options = {
  appearance: "error",
};
const useApi = () => {
  const { addToast } = useToasts();
  const dispatch = useAppDispatch();
  const { accessToken, selectedCostCenterName } = useAppSelector(
    (state) => state.auth,
  );
  const get = async <T>(
    endPoint: string,
    config?: AxiosRequestConfig,
    cache?: boolean,
  ): Promise<T> => {
    try {
      let updatedConfig: any = { ...config };
      if (accessToken && !endPoint.includes("refresh-tokens")) {
        if (!updatedConfig.headers) {
          updatedConfig = {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              cc: selectedCostCenterName,
            },
          };
        } else {
          if (!updatedConfig.headers.Authorization) {
            updatedConfig.headers["Authorization"] = `Bearer ${accessToken}`;
          }
          if (!updatedConfig.headers.cc) {
            updatedConfig.headers["cc"] = selectedCostCenterName;
          }
        }
      }

      if (!endPoint.includes("/as")) {
        if (!updatedConfig.headers) {
          updatedConfig.headers = {};
        }
        updatedConfig.headers["x-api-key"] =
          process.env.REACT_APP_GRAVITEE_API_KEY;
      }
      const response: AxiosResponse<ApiResponse<T>> = await api.get(endPoint, {
        ...updatedConfig,
        params: config?.params,
      });

      return response.data as T;
    } catch (error: any) {
      handleApiError(error);
      return error;
    }
  };
  const post = async <T>(
    endPoint: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    try {
      let updatedConfig: any = { ...config };
      if (accessToken && !endPoint.includes("refresh-tokens")) {
        if (!updatedConfig.headers) {
          updatedConfig = {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              cc: selectedCostCenterName,
            },
          };
        } else {
          if (!updatedConfig.headers.Authorization) {
            updatedConfig.headers["Authorization"] = `Bearer ${accessToken}`;
          }
          if (!updatedConfig.headers.cc) {
            updatedConfig.headers["cc"] = selectedCostCenterName;
          }
        }
      }

      if (!endPoint.includes("/as")) {
        if (!updatedConfig.headers) {
          updatedConfig.headers = {};
        }
        updatedConfig.headers["x-api-key"] =
          process.env.REACT_APP_GRAVITEE_API_KEY;
      }

      const response: AxiosResponse<ApiResponse<T>> = await api.post(
        endPoint,
        config?.data || {},
        updatedConfig,
      );
      return response.data as T;
    } catch (error: any) {
      handleApiError(error);
      return error;
    }
  };
  const put = async <T>(
    endPoint: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    try {
      let updatedConfig: any = { ...config };
      if (accessToken) {
        if (!updatedConfig.headers) {
          updatedConfig = {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              cc: selectedCostCenterName,
            },
          };
        } else {
          updatedConfig.headers["Authorization"] = `Bearer ${accessToken}`;
        }
      }

      if (!endPoint.includes("/as")) {
        if (!updatedConfig.headers) {
          updatedConfig.headers = {};
        }
        updatedConfig.headers["x-api-key"] =
          process.env.REACT_APP_GRAVITEE_API_KEY;
      }
      const response: AxiosResponse<ApiResponse<T>> = await api.put(
        endPoint,
        config?.data || {},
        updatedConfig,
      );
      return response.data as T;
    } catch (error: any) {
      handleApiError(error);
      return error;
    }
  };
  const Delete = async <T>(endPoint: string): Promise<T> => {
    try {
      let updatedConfig: any = {};
      if (accessToken) {
        updatedConfig = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            cc: selectedCostCenterName,
          },
        };
      }
      if (!endPoint.includes("/as")) {
        if (!updatedConfig.headers) {
          updatedConfig.headers = {};
        }
        updatedConfig.headers["x-api-key"] =
          process.env.REACT_APP_GRAVITEE_API_KEY;
      }

      const response: AxiosResponse<ApiResponse<T>> = await api.delete(
        endPoint,
        updatedConfig,
      );
      return response.data as T;
    } catch (error: any) {
      handleApiError(error);
      return error;
    }
  };

  const handleApiError = (error: AxiosError) => {
    console.log(error);

    let message = "";
    if (error.response) {
      const response: any = error.response;
      if (response.data && typeof response.data === "string") {
        message = response.data;
      } else if (
        response?.data.error_description &&
        typeof response.data.error_description === "string"
      ) {
        message = response.data.error_description;
      }
    }
    if (error.request) {
      const request: any = error.request;
      if (request && typeof request === "string") {
        message = request;
      } else if (
        request?.error_description &&
        typeof request.error_description === "string"
      ) {
        message = request.error_description;
      }
    }
    if (error.message && typeof error.message === "string") {
      message = error.message;
    }
    if (!message) {
      message = defaultErrorMessage;
    }
    if (
      error &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      dispatch(resetUser());
      dispatch(updateEcoModalOpen(false));
      dispatch(resetRoot());
      dispatch(resetRoster());
      return;
    }

    addToast(message, errorToastOptions);
  };
  const useGet = <T>(endPoint: string, config?: AxiosRequestConfig) => {
    const [data, setData] = useState<T>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>();
    useEffect(() => {
      fetchData();
    }, [endPoint]);
    const fetchData = () => {
      setIsLoading(true);
      get<T>(endPoint, config)
        .then((response) => {
          setData(response);
        })
        .catch((error) => {
          setError(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };
    return { data, isLoading, error };
  };

  return { get, post, put, Delete, useGet };
};

export { useApi };
