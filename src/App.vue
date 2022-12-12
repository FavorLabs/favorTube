<template>
  <v-app>
    <div class="tips">
      <transition-group name="tip">
        <template v-for="(item,index) of getList">
          <v-alert dense :type="item.type" :key="index">
            {{ item.text }}
          </v-alert>
        </template>
      </transition-group>
    </div>
    <v-overlay :value="loading" style="z-index: 999" class="text-center" opacity="1">
      <v-progress-circular
          indeterminate
          size="64"
      ></v-progress-circular>
      <div style="margin-top: 20px;font-size: 20px">Connecting to a p2p network</div>
    </v-overlay>
    <div class="fill-height" v-if="isRouterView">
      <router-view name="NavBar"></router-view>
      <router-view name="StudioNavBar"></router-view>
      <v-content class="fill-height"
                 :class="{
        'content-bg': ![
          'SignIn',
          'SignUp',
          'Dashboard',
          'Video',
          'Detail'
        ].includes(this.$route.name)
      }"
      >
        <vue-loadmore
            v-show="allowRefresh"
            :on-refresh="onRefresh"
            :show-success-text="false"
        >
          <keep-alive :include="keepList">
            <router-view v-if="allowRefresh" :key="$route.fullPath"></router-view>
          </keep-alive>
        </vue-loadmore>
        <router-view v-if="!allowRefresh" :key="$route.fullPath"></router-view>
      </v-content>
    </div>
  </v-app>
</template>

<script>
import {mapGetters} from "vuex";
import {websocket} from "@/utils/util";
import FavorService from "@/services/favorX/FavorService";
import FavorlabsService from "@/services/favorlabs/FavorlabsService";
import {config, setConfig} from '@/config/config'
import {connect} from "@/utils/web3Utils";
import {version as FavorTubeVersion} from '../package.json'
import {removeAllPendingRequestsRecord} from "@/services/Api";
import VConsole from "vconsole";
import {CONNECT_TYPE} from "@/config/constants";

if (/Mobile/i.test(navigator.userAgent) && process.env.NODE_ENV === 'development') {
  new VConsole();
}

export default {
  name: 'App',
  data() {
    return {
      loading: true,
      timer: null,
      refreshPage: ['/', '/videos', '/trending', '/subscriptions'],
      keepList: ['Home', 'Videos', 'Trending', 'Subscriptions']
    }
  },
  computed: {
    ...mapGetters(['getList', "getUrl", "ws", "web3", "isAuthenticated"]),
    allowRefresh() {
      return this.refreshPage.includes(this.$route.path);
    },
    isRouterView() {
      return this.$route.fullPath === "/config" || (this.isAuthenticated ? this.web3 : this.ws && (!this.loading || ['SignIn', 'SignUp', 'Watch'].includes(this.$route.name)))
    }
  },
  async created() {
    this.hidePercent();
    console.log('version', FavorTubeVersion);
    await this.getWs();
  },
  methods: {
    async getWs() {
      try {
        let api = sessionStorage.getItem("api");
        let wsHost = sessionStorage.getItem("ws");
        if (!api || !wsHost) throw new Error;
        let addresses = await FavorService.getAddresses();
        sessionStorage.setItem("network_id", addresses.data.network_id);
        let config;
        await FavorlabsService.getConfig(addresses.data.network_id).then(({data}) => {
          config = data.data;
        }).catch(console.error);
        setConfig(config);
        await FavorService.observe(api);
        let ws = websocket(wsHost);
        this.$store.commit("SET_WS", ws);
      } catch (e) {
        this.loading = false;
        this.gotoConfig();
      }
    },
    async getWeb3() {
      const connectType = localStorage.getItem(CONNECT_TYPE);
      if (this.isAuthenticated && connectType) {
        try {
          const {web3} = await connect(connectType, true);
          this.$store.commit("SET_WEB3", web3);
        } catch (e) {
          console.log(e);
          this.signOut();
        }
      }
    },
    wsCloseHandle() {
      this.$store.dispatch('showTips', {
        type: "error",
        text: "Failed to connect to the P2P network"
      });
      let api = sessionStorage.getItem('api');
      sessionStorage.clear();
      this.loading = false;
      this.$router.push({
        name: 'Config', params: {
          api
        }
      });
    },
    gotoConfig() {
      const shareParams = location.hash.split('#/')[1];
      let endPoint = new URLSearchParams(location.search).get("endpoint")
      if (endPoint) endPoint = new URL(endPoint).origin
      this.$router.push({
        name: 'Config',
        params: {
          endPoint,
          shareParams
        }
      });
    },
    onRefresh(done) {
      setTimeout(() => {
        done();
        this.$router.replace({
          path: '/refresh',
          query: {
            t: Date.now(),
          }
        })
      }, 1500)
    },
    setRouterParams(query) {
      let id = this.$route.params.id;
      let invitation = query.invitation;
      if (invitation) {
        sessionStorage.setItem("invitation", invitation);
        if (id) {
          sessionStorage.setItem("invitation_videoId", id);
        }
      }
    },
    signOut(external) {
      if (!this.isAuthenticated) return;
      this.$store.dispatch('signOut');
      if (this.$route.name !== "Home") {
        this.$router.push("/");
      }
      external || this.web3?.currentProvider?.disconnect?.();
    },
    hidePercent() {
      let percentMask = document.querySelector('#loading-mask');
      let percent = document.querySelector('#loading-percent-num');
      if (percentMask) {
        percent.innerHTML = 100;
        setTimeout(() => {
          percentMask.style.display = 'none';
        }, 50);
      }
    },
  },
  watch: {
    "$route": function (to, from) {
      if (from.path !== "/") {
        removeAllPendingRequestsRecord();
      }
      if (to.meta.keepAlive && from.meta.keepAlive) {
        this.keepList = [to.name];
      }
    },
    "$route.query": {
      handler: function (newVal) {
        this.setRouterParams(newVal);
      }
    },
    "ws": {
      handler: function (ws) {
        if (!ws) return;
        this.loading = true;
        ws.send({
          "id": 1,
          "jsonrpc": "2.0",
          "method": "group_subscribe",
          "params": ["peers", config.proxyGroup]
        }, (err, {result}) => {
          ws.on(result, (res) => {
            console.log(res)
            this.loading = !res.connected?.length;
          });
        })
        ws.on('close', this.wsCloseHandle);
        this.getWeb3();
      }
    },
    "loading": async function (v) {
      if (v) {
        document.documentElement.style.overflow = "hidden";
        if (config) {
          if (this.timer) clearInterval(this.timer);
          this.timer = setInterval(() => {
            let api = sessionStorage.getItem("api");
            FavorService.observe(api);
          }, 2000)
        }
      } else {
        if (this.ws && this.isAuthenticated) await this.$store.dispatch('getCurrentUser', this.getToken);
        clearInterval(this.timer);
      }
    },
    "web3": async function (v) {
      if (v?.currentProvider.isWalletConnect) {
        v.currentProvider.removeAllListeners?.("disconnect");
        v.currentProvider.once?.('disconnect', () => {
          this.signOut(true);
        });
      }
    }
  }
}
</script>

<style lang="scss">
@font-face {
  font-family: 'Impact-Regular';
  src: url('./assets/font/Impact-Regular.ttf');
}

@font-face {
  font-family: 'Roboto-Medium';
  src: url('./assets/font/Roboto-Medium.ttf');
}

@font-face {
  font-family: 'Roboto-Regular';
  src: url('./assets/font/Roboto-Regular.ttf');
}

.content-bg {
  background-color: #f9f9f9;
}

.card {
  background: #f9f9f9 !important;
}

.tips {
  position: fixed;
  z-index: 999;
  top: 20px;
  left: 0;
  right: 0;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.tip-enter-active, .tip-leave-active {
  transition: all .5s;
}

.tip-enter, .tip-leave-to {
  opacity: 0;
  transform: translateY(-50%);
}

html {
  overflow: auto !important;
}

.v-list-item__avatar {
  overflow: visible !important;
}

.vuejs-refresh-head {
  .vuejs-loading-spinner {
    width: unset;
    height: unset;

    svg {
      width: 30px;
      height: 30px;
      color: rgba(7, 193, 26, 0.97);

      circle {
        stroke-width: 5;
      }
    }
  }

  .vuejs-refresh-text,
  .vuejs-loading-text {
    color: rgba(7, 193, 26, 0.97);
  }

  .vuejs-loading-text {
    display: none;
  }
}

@media screen and (max-width: 600px) {
  .video-card-wrap:nth-child(2n + 1) {
    padding-left: 0px !important;
    padding-right: 6px !important;
  }
  .video-card-wrap:nth-child(2n) {
    padding-left: 6px !important;
    padding-right: 0px !important;
  }
  .v-tooltip__content {
    display: none !important;
  }
}
</style>
