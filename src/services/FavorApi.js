import axios from 'axios'

export default (type) => {
    const api = sessionStorage.getItem(type);

    const axiosInstance = axios.create({
        baseURL: api,
    })

    return axiosInstance
}