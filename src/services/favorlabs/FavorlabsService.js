import axios from 'axios'

const FavorlabsService = axios.create({
    baseURL: "https://service.favorlabs.io/api/v1",
})

export default {
    getList() {
        return FavorlabsService({
            url: "/network"
        })
    },
    getConfig(networkId) {
        return FavorlabsService({
            url: "/config",
            params: {
                networkId
            },
            timeout: 2000
        })
    }
}
