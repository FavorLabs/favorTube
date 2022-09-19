import axios from 'axios';
import {config} from '@/config/config'

export default {
    getPort(api) {
        return axios.get(api + '/apiPort')
    },
    observe(api) {
        return axios.post(api + `/group/observe/` + config.proxyGroup, {
            nodes: config.proxyNodes,
            "keep-connected-peers": 1
        })
    },
    observeStorage(api) {
        return axios.post(api + `/group/observe/` + config.storeGroup, {
            nodes: config.storeNodes,
            "keep-connected-peers": 1
        })
    },
    uploadFile(url, file) {
        let fileName = file.name;
        let headers = {};
        headers['Content-Type'] = file.type || 'application/x-www-form-urlencoded';
        return axios({
            url: url + '/file',
            method: 'post',
            data: file,
            params: {name: fileName},
            headers,
            timeout: 0,
        });
    },
    async sendMessage(api, overlay, hash) {
        const debugApi = sessionStorage.getItem("debugApi");
        const data = await axios.get(debugApi + "/addresses");
        return axios.post(api + `/group/send/${config.storeGroup}/` + overlay, {
            source: data.data.overlay,
            hash,
        }, {timeout: 30 * 1000})
    },
    sourceInfo(hash) {
        const debugApi = sessionStorage.getItem("debugApi");
        return axios.get(debugApi + "/chunk/server/" + hash);
    },
    connect(overlay) {
        const debugApi = sessionStorage.getItem("debugApi");
        return axios.post(debugApi + '/connect/' + overlay);
    },
    getFavorVersion() {
        const debugApi = sessionStorage.getItem("debugApi");
        return axios.get(debugApi + '/health');
    },
    getTopology() {
        const debugApi = sessionStorage.getItem("debugApi");
        return axios.get(debugApi + '/topology');
    },
    getChunkSource(hash) {
        const debugApi = sessionStorage.getItem("debugApi");
        return axios.get(debugApi + '/chunk/source/' + hash);
    },
    getPyramidSize(data) {
        const Api = sessionStorage.getItem("api");
        return axios.get(Api + '/file?' + data);
    },
    restore(api) {
        return axios.get(api + "/restore");
    },
    getAddresses() {
        const debugApi = sessionStorage.getItem("debugApi");
        return axios.get(debugApi + '/addresses');
    },
    getFileInfo(hash) {
        const api = sessionStorage.getItem("api");
        return axios.get(api + '/file', {
            params: {
                page: {"pageNum": 1, "pageSize": 1},
                sort: {"key": "rootCid", "order": "asc"},
                filter: JSON.stringify([{"key": "rootCid", "value": hash, "term": "cn"}])
            }
        })
    }
}
