<template>
  <div class="text-center">
    <div class="h-auto" v-if="!app">
      <v-card
          max-width="400"
          class="mx-auto card"
      >
        <h3>
          Please enter the api of the favor node
        </h3>
        <ValidationObserver ref="form" v-slot="{ handleSubmit }">
          <form
              @submit.prevent="handleSubmit(setting)"
          >
            <ValidationProvider
                v-slot="{ errors }"
                name="Api"
                rules="required|api"
            >
              <v-text-field
                  v-model="api"
                  :error-messages="errors"
                  label="API Endpoint"
                  class="mb-3"
              ></v-text-field>
            </ValidationProvider>
            <div class="setting">
              <v-btn
                  type="submit"
              >Setting
              </v-btn
              >
            </div>
          </form>
        </ValidationObserver>
      </v-card>
    </div>
    <v-overlay v-if="isElectron" :value="loading" style="display: block;text-align:left;" class="log-overlay">
      <div style="margin-top: -60px;height: 80vh;overflow-y: scroll" id="message-box">
        <p v-for="(item, index) in showLogs" :key="'log' + index" style="width: 50%">{{ item }}</p>
        <div class="spinner" id="message-anchor">
          <div class="bounce1"></div>
          <div class="bounce2"></div>
          <div class="bounce3"></div>
          <div class="bounce4"></div>
          <div class="bounce5"></div>
          <div class="bounce6"></div>
        </div>
      </div>
    </v-overlay>
    <v-overlay v-else :value="loading" class="flex justify-center align-center" opacity="1">
      <v-progress-circular
          indeterminate
          size="64"
      ></v-progress-circular>
      <div style="margin-top: 15px;font-size: 18px;">{{version}}</div>
    </v-overlay>
  </div>
</template>

<script>
import {websocket} from "@/utils/util";
import FavorService from "../services/FavorService"
import {isElectron, ipc, getServiceConfig} from "@/utils/util";

let ipcRenderer = ipc();
export default {
  name: "ApiConfig",
  data: function () {
    return {
      api: "",
      loading: true,
      logs: [],
      showLogs: [],
      isElectron: isElectron,
      app: false,
      version: '',
    }
  },

  created() {
    if (process.env.VUE_APP_MOBILE) {
      this.app = true;
      // eslint-disable-next-line no-undef
      cordova.plugins.node.getVersion((version)=>{
        this.version = version;
      })
      const startNode = () => {
        // eslint-disable-next-line no-undef
        cordova.plugins.node.start(
            (apiPort) => {
              let timer = setInterval(() => {
                this.set("http://localhost:" + apiPort).then(() => {
                  clearInterval(timer);
                }).catch((e) => {
                  console.log(e.message);
                });
              }, 3000)
            },
            (e) => {
              this.$store.dispatch('showTips', {
                type: "error",
                text: e.message || e
              });
            }
        );
      }
      startNode();
      return;
    }

    if (isElectron) {
      ipcRenderer.removeAllListeners("getLogInfo")
      ipcRenderer.on('getLogInfo', (event, msg) => {
        // console.log('msg', msg);
        this.logs.push(msg);
        this.showLogs = this.logs.slice(-5);
        const messageBox = document.querySelector('#message-anchor');
        if (messageBox) {
          messageBox.scrollIntoView();
        }
      })
      if (ipcRenderer._events.start) {
        console.log('ipcRenderer._events.start', ipcRenderer._events.start);
        if (ipcRenderer._events.start instanceof Array) {
          console.log('events.start is array', ipcRenderer._events.start);
          ipcRenderer._events.start.splice(1);
        }
      } else {
        console.log('no start listeners');
        ipcRenderer.on("start", (event, {api}) => {
          console.log('api', api)
          this.set(api).finally(() => {
            this.loading = false;
          })
        })
      }
    } else {
      if (this.$route.params.api) {
        this.loading = false;
      } else {
        const endPoint = this.$route.params?.endPoint;
        const {origin} = window.location;
        const api = endPoint ? endPoint : origin;
        // console.log('api', origin, endPoint);
        this.set(api).finally(() => {
          this.loading = false;
        })
      }

    }
  },
  mounted() {
    this.fillInApi();
  },
  methods: {
    async setting() {
      if (!this.$refs.form.validate()) return;
      this.set(this.api).catch(() => {
        this.$refs.form.setErrors({
          'Api': "Connection failed"
        })
      })
    },
    async set(api) {
      let res = await FavorService.getPort(api);
      let wsPort = res.data.rpcWsPort;
      if (!wsPort) throw new Error("ws not enabled");
      let isHttps = /^https/.test(api);
      let host = (isHttps ? "wss" : "ws") + `://${new URL(api).hostname}:${wsPort}`;
      // await FavorService.observe(api);
      sessionStorage.setItem("debugApi", (isHttps ? "https" : "http") + `://${new URL(api).hostname}:${res.data.debugApiPort}`);
      sessionStorage.setItem("api", api);
      sessionStorage.setItem("ws", host);
      this.$store.commit("SET_URL", api);
      let addresses = await FavorService.getAddresses();
      sessionStorage.setItem("network_id", addresses.data.network_id);
      getServiceConfig(addresses.data.network_id).finally(async () => {
        await FavorService.observe(api);
        let ws = websocket(host);
        this.$store.commit("SET_WS", ws);
        await this.$router.replace({name: 'Home'});
      })
    },
    fillInApi() {
      this.api = this.$route.params.api || "";
    }
  },
}
</script>

<style scoped>
.h-auto {
  margin-top: 50vh;
  transform: translateY(-50%);
}

.card {
  padding: 30px;
}

.setting {
  margin-top: 20px;
  text-align: right;
}

.spinner {
  width: 50px;
  text-align: center;
}

.spinner > div {
  width: 5px;
  height: 5px;
  background-color: #fff;

  border-radius: 100%;
  display: inline-block;
  -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  animation: sk-bouncedelay 1.4s infinite ease-in-out both;
}

.spinner .bounce1 {
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}

.spinner .bounce2 {
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}

.spinner .bounce3 {
  -webkit-animation-delay: 0s;
  animation-delay: 0s;
}

.spinner .bounce4 {
  -webkit-animation-delay: 0.16s;
  animation-delay: 0.16s;
}

.spinner .bounce5 {
  -webkit-animation-delay: 0.32s;
  animation-delay: 0.32s;
}

.spinner .bounce6 {
  -webkit-animation-delay: 0.48s;
  animation-delay: 0.48s;
}

@-webkit-keyframes sk-bouncedelay {
  0%, 80%, 100% {
    -webkit-transform: scale(0)
  }
  40% {
    -webkit-transform: scale(1.0)
  }
}

@keyframes sk-bouncedelay {
  0%, 80%, 100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  40% {
    -webkit-transform: scale(1.0);
    transform: scale(1.0);
  }
}

#message-box::-webkit-scrollbar {
  width: 0 !important;
}

>>> .log-overlay .v-overlay__scrim {
  opacity: 1 !important;
}
</style>
