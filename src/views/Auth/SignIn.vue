<template>
  <v-container fluid class="fill-height">
    <v-row>
      <v-col cols="12" xs="12" sm="6" md="5" lg="4" class="ma-auto">
        <v-card outlined :loading="loading">
          <div class="px-8 pt-6 pb-12">
            <v-card-title class="text-center justify-space-between">
              <div>
                FavorTube
              </div>
              <div>
                <v-icon @click.stop="$router.push('/')">mdi-home</v-icon>
              </div>
            </v-card-title>
            <v-card-subtitle class="mb-5">Sign in</v-card-subtitle>

            <v-card-text>
              <ValidationObserver ref="form" v-slot="{ handleSubmit, reset }">
                <form
                    @submit.prevent="handleSubmit(signIn)"
                    @reset.prevent="reset"
                >
                  <v-row>
                    <v-col cols="12" v-if="$store.state.tips.isMobile">
                      <v-btn @click="connectMetaMask">
                        <img
                            height="30"
                            :src="require('@/assets/metamask.png')"
                            alt="matamask"
                            class="pr-2"
                        />
                        MetaMask
                      </v-btn>
                    </v-col>
                    <v-col cols="12" v-if="$store.state.tips.isMobile">
                      <v-btn @click="connectOkx">
                        <img
                            height="30"
                            :src="require('@/assets/okx.png')"
                            alt="okx"
                            class="pr-2"
                        />
                        OKX Wallet
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-btn @click="connectWalletConnect">
                        <img
                            height="30"
                            :src="require('@/assets/walletconnect.png')"
                            alt="walletconnect"
                            class="pr-2"
                        />
                        WalletConnect
                      </v-btn>
                    </v-col>
                    <v-col v-if="connectType === 'walletConnect'">
                      <v-btn @click="disconnectWalletConnect">
                        Disconnect
                      </v-btn>
                    </v-col>
                  </v-row>

                  <v-row v-if="address">
                    <v-col>
                      {{ address }}
                    </v-col>
                  </v-row>

                  <div class="mt-6 d-flex justify-space-between">
                    <v-btn
                        text
                        class="pl-0 text-capitalize"
                        color="primary"
                        router
                        to="signup"
                    >Create account
                    </v-btn
                    >
                    <v-btn
                        v-if="address"
                        type="submit"
                        class="primary"
                        :loading="loading"
                        depressed
                    >Sign in
                    </v-btn>
                  </div>
                </form>
              </ValidationObserver>
            </v-card-text>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from "moment";
import {connect} from "@/utils/web3Utils"
import {disconnect} from "@/utils/util";

export default {
  name: 'SignIn',
  data: () => ({
    loading: false,
    address: "",
    connectType: "",
  }),
  computed: {
    networkId() {
      return sessionStorage.getItem("network_id");
    }
  },
  methods: {
    async signIn() {
      if (!this.address) {
        await this.$store.dispatch("showTips", {
          type: "info", text: "Please connect your wallet"
        })
        return;
      }
      if (this.loading) return;

      this.loading = true;
      const timespan = moment().format('x');

      let msg = this.web3.utils.sha3(this.address + timespan);

      const signature = await this.web3.eth.personal.sign(msg, this.address).catch(err => {
        this.loading = false;
        this.$store.dispatch("showTips", {
          type: "info", text: err.message
        })
      });

      if (!signature) return;

      const data = await this.$store
          .dispatch('signIn', {timespan, signature, address: this.address})
          .catch((err) => {
            this.loading = false
            this.$store.dispatch("showTips", {
              type: "info", text: err.response.data.error
            })
          })

      if (!data) return
      const user = await this.$store
          .dispatch('getCurrentUser', data.token)
          .catch((err) => console.log(err))

      if (!user) return

      this.loading = false
      this.$router.push({name: 'Home'})
    },
    async connectMetaMask() {
      const {err, res} = await connect("metaMask");
      console.log(err)
      if (err) {
        this.$store.dispatch("showTips", {
          type: "info", text: err
        })
      } else {
        const {address, web3} = res;
        this.address = address;
        this.web3 = web3;
        this.$store.commit("SET_WEB3", web3);
      }
    },
    async connectWalletConnect() {
      const {err, res} = await connect("walletConnect", () => {
        this.address = "";
        this.connectType = "";
        disconnect(this);
      });
      if (err) {
        this.$store.dispatch("showTips", {
          type: "info", text: err,
        })
      } else {
        const {address, web3} = res;
        this.connectType = "walletConnect";
        this.address = address;
        this.web3 = web3;
        this.$store.commit("SET_WEB3", web3);
      }
    },
    async connectOkx() {
      const {err, res} = await connect("okx");
      if (err) {
        this.$store.dispatch("showTips", {
          type: "info", text: err
        })
      } else {
        const {address, web3} = res;
        this.address = address;
        this.web3 = web3;
        this.$store.commit("SET_WEB3", web3);
      }
    },
    disconnectWalletConnect() {
      this.address = "";
      this.connectType = "";
      this.loading = false;
      this.web3.currentProvider?.disconnect();
    },
  }
}
</script>

<style lang="scss" scoped>

</style>
