import axios from 'axios';
import {group} from "@/store/modules/auth";

let pending = {};

export const removeAllPendingRequestsRecord = () => {
    Object.values(pending).forEach((func) => {
        func();
    });
    pending = {};
};

const removePending = (key, isRequest = false) => {
    if (pending[key] && isRequest) {
        pending[key]();
    }
    delete pending[key];
};


export default () => {
    const api = sessionStorage.getItem("api") + group() + "/api/v1";

    const axiosInstance = axios.create({
        baseURL: api
    })

    const token = localStorage.getItem('token')
    if (token) {
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`
    }

    axiosInstance.interceptors.request.use(
        (config) => {
            let reqData;

            if (config.method === 'get') {
                reqData = config.url + config.method + JSON.stringify(config.params);
            } else {
                reqData =
                    config.url + config.method + JSON.stringify(config.data);
            }

            removePending(reqData, true);

            if (config.url !== "subscriptions/channels") {
                config.cancelToken = new axios.CancelToken((c) => {
                    pending[reqData] = c;
                });
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        },
    );


    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (axios.isCancel(error)) {
                return new Promise(() => {
                });
            }
            if (error.response.status === 401) {
                localStorage.removeItem('token')
                sessionStorage.removeItem('user')
                location.reload()
            }
            return Promise.reject(error)
        }
    )

    return axiosInstance
}
