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
         v-if="!loading ||['SignIn','SignUp','Watch'].includes(this.$route.name)"
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
        <router-view></router-view>
      </v-content>
    </div>
  </v-app>
</template>

<script>
import {mapGetters} from "vuex";
import {websocket, getUrlParams} from "@/utils/util";
import FavorService from "@/services/FavorService";
import {getProxyGroup} from "@/store/modules/auth";
import {getWeb3} from "@/utils/web3Utils";

export default {
  name: 'App',
  data() {
    return {
      loading: true,
    }
  },
  computed: {
    ...mapGetters(['getList', "getUrl", "ws", "web3", "isAuthenticated"]),
  },
  mounted() {
    if (process.env.VUE_APP_MOBILE) {
      document.addEventListener('deviceready', () => {
        setTimeout(function () {
          navigator.splashscreen.hide();
        }, 500);
        this.getWs();
      });
      document.addEventListener('resume', () => {
        console.log('resume');
        if (sessionStorage.getItem("api")) {
          FavorService.restore(sessionStorage.getItem("api"));
          if (!this.ws.connected) {
            this.getWs();
          }
        }
      });
    } else {
      this.getWs();
    }
  },
  methods: {
    async getWs() {
      let wsHost = sessionStorage.getItem("ws");
      let api = sessionStorage.getItem("api");
      if (wsHost && api) {
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
    signOut() {
      this.$store.dispatch('signOut');
      if (this.$route.name !== "Home") {
        this.$router.push("/");
      }
      this.web3?.currentProvider?.disconnect?.();
    },
    analyzingUrl() {
      const href = location.href.split('#/')[0];
      const shareParams = location.hash.split('#/')[1];
      const urlParams = getUrlParams(href);
      const endPoint = urlParams?.endpoint;
      this.$router.push({
        name: 'Config',
        params: {
          endPoint,
          shareParams
        }
      });
    }
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
          "params": ["peers", getProxyGroup()]
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
      } else if (this.ws) {
        if (this.isAuthenticated && !this.web3) {
          const {err, res} = await getWeb3(() => {
            this.signOut();
          });
          if (err) {
            this.signOut();
          } else {
            const {web3} = res;
            this.$store.commit("SET_WEB3", web3);
          }
        }
      }
    },
  }
}
</script>

<style lang="scss">
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

</style>
