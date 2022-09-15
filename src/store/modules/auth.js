import AuthenticationService from '@/services/AuthenticationService'
import getConfigs from '@/config/config'
import Web3 from "web3";

export const proxyGroup = "favortube";
export const domainName = "favortube.com";
export const storeGroup = "favortube-storage";

export const group = () => {
    const config = getConfigs('proxyGroup', 'domainName');
    let address = config.proxyGroup ? `/group/http/${config.proxyGroup}/${config.domainName}` : `/group/http/${proxyGroup}/${domainName}`;
    return address;
    // return `/group/http/${config.proxyGroup}/${config.domainName}`;
};

const state = {
    api: "",
    url: "",
    imgUrl: "",
    ws: null,
    web3: null,
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || {},
    isUserLoggedIn: localStorage.getItem('token') || false,
}

const getters = {
    web3: () => {
        return state.web3;
    },
    nodeWeb3: () => {
        return new Web3(getters.getApi() + '/chain');
    },
    getApi: () => {
        return state.api || sessionStorage.getItem("api");
    },
    getUrl: () => {
        return state.url || sessionStorage.getItem("api") + group() + "/api/v1";
    },
    getImgUrl: () => {
        return state.imgUrl || sessionStorage.getItem("api") + group()
    },
    isAuthenticated: (state) => {
        return state.isUserLoggedIn
    },
    getToken: (state) => {
        return state.token
    },
    currentUser: (state) => {
        return state.user
    },
    ws: state => state.ws,
}

const mutations = {
    SET_WEB3(state, web3) {
        state.web3 = web3;
    },
    SET_WS(state, ws) {
        state.ws = ws;
    },
    SET_TOKEN(state, token) {
        state.token = token
        state.isUserLoggedIn = !!token;
    },
    SET_USER_DATA(state, data) {
        state.user = data
    },
    CLEAR_AUTH(state) {
        state.token = null
        state.user = {}
        state.isUserLoggedIn = false
    },
    SET_URL(state, api) {
        state.api = api;
        state.url = api + group() + "/api/v1";
        state.imgUrl = api + group();
    }
}

const actions = {
    signUp({commit}, credentials) {
        return new Promise((resolve, reject) => {
            AuthenticationService.signUp(credentials)
                .then(({data}) => {
                    commit('SET_TOKEN', data.token)
                    localStorage.setItem('token', data.token)
                    resolve(data)
                })
                .catch((err) => reject(err))
        })
    },
    signIn({commit}, credentials) {
        return new Promise((resolve, reject) => {
            AuthenticationService.signIn(credentials)
                .then(({data}) => {
                    localStorage.setItem('token', data.token)
                    commit('SET_TOKEN', data.token)

                    resolve(data)
                })
                .catch((err) => reject(err))
        })
    },
    getCurrentUser({commit}, token) {
        return new Promise((resolve, reject) => {
            AuthenticationService.me(token)
                .then(({data}) => {
                    localStorage.setItem('user', JSON.stringify(data.data))
                    commit('SET_USER_DATA', data.data)
                    resolve(data)
                })
                .catch((err) => reject(err))
        })
    },
    signOut({commit}) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        commit('CLEAR_AUTH')
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}
