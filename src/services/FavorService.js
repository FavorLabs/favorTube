import axios from 'axios';
import {proxyGroup, storeGroup} from "@/store/modules/auth";

export default {
    getPort(api) {
        return axios.get(api + '/apiPort')
    },
    observe(api) {
        return axios.post(api + `/group/observe/` + proxyGroup, {
            nodes: [
                "cc30f0393cfaf2b6b2bea82ea4400fe8e9ff6d94b858beaf36d41fb9f040963e",
                "01ce40352b9635cbfab17f22d6d1e4436a21324cc1b1ef97eac2b20928b03244",
            ],
            "keep-connected-peers": 2
        })
    },
    observeStorage(api) {
        return axios.post(api + `/group/observe/` + storeGroup, {
            nodes: [
                "9ca6d63b192afd92c54b14a50ce21783092be29b67c959022bd600d5691cb497",
                "d95d0cf90e651b840ab3d888981d0653620aa042189e8d1a0f6a7cdc9bb572af",
            ],
            "keep-connected-peers": 2
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
        return axios.post(api + `/group/send/${storeGroup}/` + overlay, {
            source: data.data.overlay,
            hash,
        }, {timeout: 30 * 1000})
    },
    async sourceInfo(hash) {
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
        return  axios.get(debugApi + '/topology');
    },
    getChunkSource(hash) {
        const debugApi = sessionStorage.getItem("debugApi");
        return axios.get(debugApi + '/chunk/source/' + hash);
    },
    getPyramidSize(data) {
        const Api = sessionStorage.getItem("api");
        return axios.get(Api + '/file?' + data);
    }
}

