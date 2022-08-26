<template>
  <div>
    <div v-if="isElectron" style="height:100vh;display: flex;align-items: center">
      <RunNode @startNode="startNode"/>
    </div>
    <div class="h-auto text-center" v-else v-show="!loading">
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
    <v-overlay v-if="isElectron" absolute :value="loading" opacity="1"
               style="justify-content: start;align-items: start;">
      <div style="padding: 10px 20px 0;height: 90vh;overflow-y: scroll;" id="message-box" >
        <p v-for="item in logs" :key=item>{{ item }}</p>
        <div class="spinner" ref="log"  style="height: 10vh">
          <div class="bounce1"></div>
          <div class="bounce1"></div>
          <div class="bounce2"></div>
        </div>
      </div>
    </v-overlay>
    <v-overlay v-else :value="loading" class="flex justify-center align-center" opacity="1">
      <v-progress-circular
          indeterminate
          size="64"
      ></v-progress-circular>
      <div style="margin-top: 15px;font-size: 18px;">{{ version }}</div>
    </v-overlay>
  </div>
</template>

<script>
import {websocket} from "@/utils/util";
import FavorService from "../services/FavorService"
import FavorlabsService from "@/services/favorlabs/FavorlabsService";
import {isElectron, ipc} from "@/utils/util";

import RunNode from "@/components/RunNode";

let ipcRenderer = ipc();

export default {
  name: "ApiConfig",
  data: function () {
    return {
      api: "",
      loading: false,
      logs: [],
      isElectron: isElectron,
      app: false,
      version: '',
    }
  },
  components: {
    RunNode
  },
  created() {
    if (isElectron) {
      ipcRenderer.removeAllListeners("getLogInfo");
      ipcRenderer.removeAllListeners("start");
      ipcRenderer.on("start", (event, {api}) => {
        this.set(api).catch((reason) => {
          console.log(reason);
        });
      })
      ipcRenderer.on('getLogInfo', (event, msg) => {
        this.logs.push(msg);
        let ref = this.$refs.log;
        ref.scrollIntoView();
      })
      return;
    }
    if (process.env.VUE_APP_MOBILE) {
      this.app = true;
      // eslint-disable-next-line no-undef
      cordova.plugins.node.getVersion((version) => {
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
    } else {
      if (this.$route.params.api) {
        this.loading = false;
      } else {
        const endPoint = this.$route.params?.endPoint;
        const {origin} = window.location;
        const api = endPoint ? endPoint : origin;
        // console.log('api', origin, endPoint);
        this.set(api).catch(() => {
          this.loading = false;
        })
      }
    }
  },
  mounted() {
    this.fillInApi();
  },
  methods: {
    startNode() {
      this.loading = true;
    },
    setting() {
      if (!this.$refs.form.validate()) return;
      this.set(this.api).catch(() => {
        this.loading = false;
        this.$refs.form.setErrors({
          'Api': "Connection failed"
        })
      })
    },
    async set(api) {
      this.loading = true;
      let res = await FavorService.getPort(api);
      let wsPort = res.data.rpcWsPort;
      if (!wsPort) throw new Error("ws not enabled");
      let isHttps = /^https/.test(api);
      let host = (isHttps ? "wss" : "ws") + `://${new URL(api).hostname}:${wsPort}`;
      sessionStorage.setItem("debugApi", (isHttps ? "https" : "http") + `://${new URL(api).hostname}:${res.data.debugApiPort}`);
      sessionStorage.setItem("api", api);
      sessionStorage.setItem("ws", host);
      this.$store.commit("SET_URL", api);
      let addresses = await FavorService.getAddresses();
      sessionStorage.setItem("network_id", addresses.data.network_id);
      try {
        const {data} = await FavorlabsService.getConfig(addresses.data.network_id);
        sessionStorage.setItem("current_config", JSON.stringify(data.data));
      } catch (err) {
        console.error('err', err);
      }
      await FavorService.observe(api);
      let ws = websocket(host);
      this.$store.commit("SET_WS", ws);
      this.loading = false;
      await this.$router.replace({name: 'Home'});
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

/*.spinner {*/
/*  width: 50px;*/
/*  text-align: center;*/
/*}*/

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

.log-overlay .v-overlay__scrim {
  opacity: 1 !important;
}
</style>
