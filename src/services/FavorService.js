import axios from 'axios';
import {proxyGroup, storeGroup} from "@/store/modules/auth";

const proxyNodes = {
    19: [
        "cc30f0393cfaf2b6b2bea82ea4400fe8e9ff6d94b858beaf36d41fb9f040963e",
        "01ce40352b9635cbfab17f22d6d1e4436a21324cc1b1ef97eac2b20928b03244",
        "5476e8758bd13155d49b14902efdf6979a8ddce66c07dc5fa0a12e71880ffe49",
        "7429f9b52f35585b65508660265d8ac88455b4ae3ed7e09160b89f322b3945bf"
    ],
    20: [
        "4a82e22ac2de786d3eeb8478ac18158941379f4021350d07263a1b4b29889434",
        "091eb9c210577efbe82f717d06f5a80c5e29d9b6fb1af5e5f26cf69a868b130e",
        "7237952614dfce38f6ee07a291ea4b9be2e9d26197f2e6fa4bd88cf143c2682e",
        "04bd864e1938e2c2dcac3b2bbbf69468344e0c4419bd2032c29b7d7d33dcee25",
    ]
}

const storeNodes = {
    19: [
        "9ca6d63b192afd92c54b14a50ce21783092be29b67c959022bd600d5691cb497",
        "d95d0cf90e651b840ab3d888981d0653620aa042189e8d1a0f6a7cdc9bb572af",
    ],
    20: [
        "6c570d60796f118d5df9ff68ac28fdfa6ac122a6071edfd56bf16c67a6fce438",
        "d1f2cac24d107038e23a8606505cecb632f5d7ab26156d1528b0be501520b326",
    ]
}

export default {
    getPort(api) {
        return axios.get(api + '/apiPort')
    },
    observe(api) {
        let network_id = sessionStorage.getItem("network_id");
        return axios.post(api + `/group/observe/` + proxyGroup, {
            nodes: proxyNodes[network_id] || proxyNodes[19],
            "keep-connected-peers": 1
        })
    },
    observeStorage(api) {
        let network_id = sessionStorage.getItem("network_id");
        return axios.post(api + `/group/observe/` + storeGroup, {
            nodes: storeNodes[network_id] || storeNodes[19],
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
    }
}

