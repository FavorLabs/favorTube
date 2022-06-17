<template>
  <v-container fluid class="fill-height">
    <v-row>
      <v-col cols="12" xs="12" sm="6" md="5" lg="4" class="ma-auto">
        <v-card outlined :loading="loading">
          <div class="px-8 pt-6 pb-12">
            <v-card-title class="text-center">FavorTube</v-card-title>
            <v-card-subtitle class="mb-5">Sign in</v-card-subtitle>
            <v-card-text>
              <ValidationObserver ref="form" v-slot="{ handleSubmit, reset }">
                <form
                    @submit.prevent="handleSubmit(signIn)"
                    @reset.prevent="reset"
                >
                  <!--                  <ValidationProvider-->
                  <!--                      v-slot="{ errors }"-->
                  <!--                      name="Email"-->
                  <!--                      rules="required|email"-->
                  <!--                  >-->
                  <!--                    <v-text-field-->
                  <!--                        v-model="email"-->
                  <!--                        :error-messages="errors"-->
                  <!--                        label="Email"-->
                  <!--                        outlined-->
                  <!--                    ></v-text-field>-->
                  <!--                  </ValidationProvider>-->
                  <v-row>
                    <v-col cols="12" v-if="$store.state.tips.isMobile">
                      <v-btn @click="connectMetaMask">
                        MetaMask
                      </v-btn>
                    </v-col>
                    <v-col cols="12">
                      <v-row>
                        <v-col offset="-1">
                          <v-btn @click="connectWalletConnect">
                            WalletConnect
                          </v-btn>
                        </v-col>
                        <v-col v-if="connectType === 'walletConnect'">
                          <v-btn @click="disconnectWalletConnect">
                            Disconnect
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row v-if="address">
                    <v-col cols="12">
                      {{ address }}
                    </v-col>
                  </v-row>
                  <v-row class="d-flex flex-wrap bottom-btns">
                    <v-col cols="12" md="5">
                      <v-btn
                          text
                          class="pl-0 text-capitalize"
                          color="primary"
                          router
                          to="signup"
                      >Create account
                      </v-btn
                      >
                    </v-col>
                    <v-col cols="6" md="4">
                      <v-btn
                          class="primary to-home-btn"
                          depressed
                          @click.stop="$router.push('/')"
                      >Home
                      </v-btn>
                    </v-col>
                    <v-col cols="6" md="3">
                      <v-btn
                          type="submit"
                          class="primary"
                          :loading="loading"
                          depressed
                      >Sign in
                      </v-btn
                      >
                    </v-col>
                  </v-row>
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

export default {
  name: 'SignIn',
  data: () => ({
    loading: false,
    address: "",
    connectType: "",
  }),
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
      const {err, res: {address, web3}} = await connect("metaMask");
      console.log(err)
      if (err) {
        this.$store.dispatch("showTips", {
          type: "info", text: err
        })
      } else {
        this.address = address;
        this.web3 = web3;
        this.$store.commit("SET_WEB3", web3);
      }
    },
    async connectWalletConnect() {
      const {err, res: {address, web3}} = await connect("walletConnect", ()=>{
        this.disconnectWalletConnect();
      });
      if (err) {
        this.$store.dispatch("showTips", {
          type: "info", text: err,
        })
      } else {
        this.connectType = "walletConnect";
        this.address = address;
        this.web3 = web3;
        this.$store.commit("SET_WEB3", web3);
      }
    },
    disconnectWalletConnect() {
      this.web3?.currentProvider.disconnect();
      this.address = "";
      this.connectType = "";
      this.loading = false;
    },
  }
}
</script>

<style lang="scss" scoped>

</style>
