import axios from 'axios';
import {getProxyGroup, getStoreGroup} from "@/store/modules/auth";

const proxyNodes = {
    18: [
        "fafa08217c964ada4b10757176ccb708e7ab02534d54b429ab21b5021df50e0e",
        "53af829ad8bf1117b4363eab6bb3aa3cc9a376b335555c043ccd08b8206d2d93",
        "37c4bea59406fed518a1b44f0ba53f78503329ab429dc654e66afbea0a03748b",
    ],
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
    ],
    21: [
        "53715767b512fb2685b9e7997527ade81a5a045c118e06a314da57a2bf2d80c6",
        "6cf5f1c1c6b42956008dfa692f9d71cfb061927f054d6ee88dd0040a5493c969",
        "80adeb89249aa762a34799858c19ddbf0f92e1e2e9d6722de6c3c1b582b45f9e",
        "4a3096648663ad107e89b704fce756c3ed0f3ccc17f51fa00bb788367e2c5240",
    ],

}

const storeNodes = {
    18: [
        "a99bd3530278f6047e1ad8c70b9e5ae6434c44d675a8fdd53280564440610d52",
        "0a308ca674606e7384fea8ac10fb2866b7804c67ef8159d7944933f0f98652ed",
    ],
    19: [
        "9ca6d63b192afd92c54b14a50ce21783092be29b67c959022bd600d5691cb497",
        "d95d0cf90e651b840ab3d888981d0653620aa042189e8d1a0f6a7cdc9bb572af",
    ],
    20: [
        "6c570d60796f118d5df9ff68ac28fdfa6ac122a6071edfd56bf16c67a6fce438",
        "d1f2cac24d107038e23a8606505cecb632f5d7ab26156d1528b0be501520b326",
    ],
    21: [
        "c3b51d9b33749d8e10d66c692521705057a02e81d67f75073786666d0c53c98a",
        "78adc43439a4325e31332ba48c2c8f1fa08308ea9c4c535e8f42f4d71d6dad44",
    ]
}

const getProxyNodes = () => {
    const config = sessionStorage.getItem('current_config');
    const network_id = sessionStorage.getItem("network_id");
    if (config) {
        const configObj = JSON.parse(config);
        const mergeConfig = {
            proxyNodes: proxyNodes[network_id] || proxyNodes[19],
            ...configObj
        };
        return mergeConfig.proxyNodes;
    } else {
        return proxyNodes[network_id] || proxyNodes[19];
    }
}

const getStoreNodes = () => {
    const config = sessionStorage.getItem('current_config');
    const network_id = sessionStorage.getItem("network_id");
    if (config) {
        const configObj = JSON.parse(config);
        const mergeConfig = {
            storeNodes: storeNodes[network_id] || storeNodes[19],
            ...configObj
        };
        return mergeConfig.storeNodes;
    } else {
        return storeNodes[network_id] || storeNodes[19];
    }
}

export default {
    getPort(api) {
        return axios.get(api + '/apiPort')
    },
    observe(api) {
        return axios.post(api + `/group/observe/` + getProxyGroup(), {
            nodes: getProxyNodes(),
            "keep-connected-peers": 1
        })
    },
    observeStorage(api) {
        return axios.post(api + `/group/observe/` + getStoreGroup(), {
            nodes: getStoreNodes(),
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
        return axios.post(api + `/group/send/${getStoreGroup()}/` + overlay, {
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
