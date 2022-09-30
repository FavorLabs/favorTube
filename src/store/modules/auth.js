import AuthenticationService from '@/services/AuthenticationService'
import {config} from '@/config/config'
import Web3 from "web3";

export const proxyGroup = "favortube";
export const domainName = "favortube.com";
export const storeGroup = "favortube-storage";

export const group = () => {
    return `/group/http/${config.proxyGroup}/${config.domainName}`;
};

const state = {
    api: "",
    ws: null,
    web3: null,
    token: localStorage.getItem('token') || null,
    user: JSON.parse(sessionStorage.getItem('user')) || {},
    isUserLoggedIn: localStorage.getItem('token') || false,
    config: {},
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
        return getters.getApi() + group() + "/api/v1";
    },
    getImgUrl: () => {
        return getters.getApi() + group()
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
    config: state => state.config
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
    },
    SET_CONFIG(state, config) {
        state.config = config;
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
                    sessionStorage.setItem('user', JSON.stringify(data.data))
                    commit('SET_USER_DATA', data.data)
                    resolve(data)
                })
                .catch((err) => reject(err))
        })
    },
    signOut({commit}) {
        localStorage.removeItem('token')
        sessionStorage.removeItem('user')
        commit('CLEAR_AUTH')
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}
