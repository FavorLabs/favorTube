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
    <div class="fill-height"
         v-if="!dataLoading && (!loading ||['SignIn','SignUp','Watch'].includes(this.$route.name))"
    >
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
import {websocket, disconnect} from "@/utils/util";
import FavorService from "@/services/FavorService";
import FavorlabsService from "@/services/favorlabs/FavorlabsService";
import {config, setConfig} from '@/config/config'
import {getWeb3} from "@/utils/web3Utils";
import {version as FavorTubeVersion} from '../package.json'

export default {
  name: 'App',
  data() {
    return {
      loading: true,
      timer: null,
      refreshPage: ['/', '/videos', '/trending', '/subscriptions'],
      dataLoading: true,
      keepList: ['Home', 'Videos','Trending','Subscriptions']
    }
  },
  // components: { VuePullRefresh },
  computed: {
    ...mapGetters(['getList', "getUrl", "ws", "web3", "isAuthenticated", "getToken"]),
    allowRefresh() {
      return this.refreshPage.includes(this.$route.path);
    }
  },
  async created() {
    console.log('version', FavorTubeVersion);
    if (process.env.VUE_APP_MOBILE) {
      document.addEventListener('deviceready', () => {
        setTimeout(function () {
          navigator.splashscreen.hide();
        }, 500);
        this.getWs();
      });
      document.addEventListener('resume', async () => {
        console.log('resume');
        if (sessionStorage.getItem("api")) {
          await FavorService.restore(sessionStorage.getItem("api"));
          if (!this.ws.connected) {
            await this.getWs();
          }
        }
      });
    } else {
      await this.getWs();
    }
  },
  methods: {
    async getWs() {
      let wsHost = sessionStorage.getItem("ws");
      let api = sessionStorage.getItem("api");
      if (wsHost && api) {
        let addresses = await FavorService.getAddresses();
        sessionStorage.setItem("network_id", addresses.data.network_id);
        let config;
        try {
          const {data} = await FavorlabsService.getConfig(addresses.data.network_id);
          config = data.data;
        } catch (err) {
          console.error('err', err);
        }
        setConfig(config);
        try {
          await FavorService.observe(api);
          let ws = websocket(wsHost);
          this.$store.commit("SET_WS", ws);
        } catch (e) {
          await this.$store.dispatch("showTips", {
            type: "error",
            text: "Failed to connect to the P2P network"
          })
        }
      } else {
        this.loading = false;
        this.analyzingUrl();
      }
      this.dataLoading = false;
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
    analyzingUrl() {
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
    setRouterParams(routerParams) {
      if (JSON.stringify(routerParams) !== '{}') {
        for (let key in routerParams) {
          if (['invitation'].includes(key)) {
            if (key === 'invitation' && (routerParams[key].length !== 10)) {
              sessionStorage.removeItem('invitation');
              continue;
            }
            sessionStorage.setItem(key, routerParams[key]);
          }
        }
      }
    },
    signOut() {
      this.$store.dispatch('signOut');
      if (this.$route.name !== "Home") {
        this.$router.push("/");
      }
      this.web3?.currentProvider?.disconnect?.();
    },
  },
  watch: {
    "ws": {
      handler: function (ws) {
        let _this = this;
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
            _this.loading = !res.connected?.length;
          });
        })
        ws.on('close', this.wsCloseHandle);
      }
    },
    "loading": async function (v) {
      if (v) {
        document.documentElement.style.overflow = "hidden";
        this.timer = setInterval(() => {
          let api = sessionStorage.getItem("api");
          FavorService.observe(api);
        }, 2000)
      } else if (this.ws && this.isAuthenticated) {
        if (this.getToken) {
          await this.$store.dispatch('getCurrentUser', this.getToken);
        }
        if (!this.web3) {
          const {err, res} = await getWeb3(() => {
            disconnect(this)
          });
          if (err) {
            this.signOut();
          } else {
            const {web3} = res;
            this.$store.commit("SET_WEB3", web3);
          }
        }
        clearInterval(this.timer);
      }
    },
    "$route.query": {
      handler: function (newVal) {
        this.setRouterParams(newVal);
      }
    },
    "$route": function (to, from) {
      console.log(to, from)
      if (to.meta.keepAlive && from.meta.keepAlive) {
        this.keepList = [to.name];
      }
    }
  }
}
</script>

<style lang="scss">
@font-face {
  font-family: 'Impact-Regular';
  src: url('./assets/font/Impact-Regular.ttf'),
}

@font-face {
  font-family: 'Roboto-Medium';
  src: url('./assets/font/Roboto-Medium.ttf'),
}

@font-face {
  font-family: 'Roboto-Regular';
  src: url('./assets/font/Roboto-Regular.ttf'),
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
      color: #f00;

      circle {
        stroke-width: 5;
      }
    }
  }

  .vuejs-refresh-text,
  .vuejs-loading-text {
    color: #f00;
  }

  .vuejs-loading-text {
    display: none;
  }
}
</style>
