<template>
  <v-container fluid class="fill-height">
    <v-row>
      <v-col cols="12" xs="12" sm="8" md="8" lg="7" class="ma-auto">
        <v-card class="" outlined :loading="loading">
          <v-row class="justify-space-between px-4 pt-6 pb-12">
            <v-col cols="12" sm="12" md="6">
              <v-card-title class="text-center justify-space-between">
                <div>
                  FavorTube
                </div>
                <div>
                  <v-icon @click.stop="$router.push('/')">mdi-home</v-icon>
                </div>
              </v-card-title>
              <!--              <v-card-subtitle>Create your FavorTube account</v-card-subtitle>-->
              <v-card-text>
                <v-row v-if="$store.state.tips.isMobile">
                  <v-col cols="12">
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
                  <v-col cols="12">
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
                </v-row>
                <v-row v-if="connectType">
                  <v-btn @click="disconnectWalletConnect">
                    Disconnect
                  </v-btn>
                </v-row>
                <ValidationObserver ref="form" v-slot="{ handleSubmit, reset }">
                  <form
                      @submit.prevent="handleSubmit(signUp)"
                      @reset.prevent="reset"
                      class="mt-3"
                  >
                    <ValidationProvider
                        v-slot="{ errors }"
                        name="Address"
                        rules="required"
                        v-if="address"
                    >
                      <v-text-field
                          v-model="address"
                          :error-messages="errors"
                          label="Address"
                          outlined
                          dense
                          readonly
                      ></v-text-field>
                    </ValidationProvider>
                    <ValidationProvider
                        v-slot="{ errors }"
                        name="Channel Name"
                        rules="required|min:3"
                        v-if="channelName || unReg"
                    >
                      <v-text-field
                          v-model="channelName"
                          :error-messages="errors"
                          label="Channel Name"
                          outlined
                          dense
                          :readonly="!unReg"
                      ></v-text-field>
                    </ValidationProvider>
                    <ValidationProvider
                        v-slot="{ errors }"
                        name="Email"
                        rules="required|email"
                        v-if="unReg"
                    >
                      <v-text-field
                          v-model="email"
                          :error-messages="errors"
                          label="Email"
                          outlined
                          dense
                      ></v-text-field>
                    </ValidationProvider>
                    <ValidationProvider
                        v-slot="{ errors }"
                        name="Invitation Code"
                        rules="min:10|max:10"
                        v-if="unReg"
                    >
                      <v-text-field
                          v-model="invitationCode"
                          :error-messages="errors"
                          label="Invitation Code"
                          outlined
                          dense
                          :readonly="codeDisable"
                      ></v-text-field>
                    </ValidationProvider>
                    <div class="mt-6">
                      <v-btn
                          v-if="address"
                          type="submit"
                          class="primary"
                          :loading="loading"
                          depressed
                          block
                      >
                        Sign {{ unReg ? 'Up' : 'In' }}
                      </v-btn>
                    </div>
                  </form>
                </ValidationObserver>
              </v-card-text>
            </v-col>
            <v-col cols="5" class="align-self-center hidden-sm-and-down">
              <v-responsive>
                <svg
                    id="b59c9f89-c93e-413f-a14b-776784e615e2"
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    style="max-width: 100%"
                    viewBox="0 0 1075.51587 646.89913"
                >
                  <title>Create Account</title>
                  <path
                      d="M136.59282,733.55706l63.43134-91.13824L136.56059,743.4707l-.037,10.3692q-6.78516-.05706-13.43322-.44141c-.02019-2.35442,5.37117-131.89917,5.142-134.24281.3129-.0888.48846-12.252.6126-12.78462L62.57779,506.77732,128.91613,596.945l.1978,2.66552,3.93549-100.64793L76.0857,395.895,133.5,481.27779c.02132-1.3695,2.71745-208.02265,2.744-209.29776.01628.67732,1.25371,164.45521,1.26281,165.14538l54.47905-65.92288-54.53131,80.08836-.27852,90.07922,50.556-87.10756C124.63867,581.2954,138.60155,536.8418,136.99011,604.702l73.43568-121.29149L136.92724,622.17566Z"
                      transform="translate(-62.24207 -126.55043)"
                      fill="#d0cde1"
                  />
                  <path
                      d="M1106.98992,745.9302l26.4334-37.97954-26.44683,42.1108-.0154,4.3211q-2.82754-.02378-5.598-.18395c-.00841-.98114,2.2383-54.96562,2.14282-55.94228.13039-.037.20355-5.10569.25528-5.32766L1076.146,651.42551l27.64482,37.57509.08242,1.11079,1.64-41.94247-23.73818-42.95081,23.92592,35.58112c.00889-.57071,1.13243-86.68815,1.14349-87.21952.00678.28226.52245,68.53253.52625,68.82014l22.70275-27.47169L1107.349,628.303l-.11607,37.53823,21.06792-36.29986c-26.29252,52.9377-20.47384,34.4128-21.14537,62.69183l30.60245-50.54515-30.62865,57.82684Z"
                      transform="translate(-62.24207 -126.55043)"
                      fill="#d0cde1"
                  />
                  <ellipse
                      cx="536"
                      cy="625.89913"
                      rx="536"
                      ry="21"
                      fill="#d0cde1"
                  />
                  <rect
                      x="184"
                      y="248.03055"
                      width="612"
                      height="364.87"
                      fill="#3f3d56"
                  />
                  <path
                      d="M397.70209,374.581a146.35424,146.35424,0,0,1-146.32,143.97c-1.72,0-3.43-.03-5.14-.09V374.581Z"
                      transform="translate(-62.24207 -126.55043)"
                      fill="#2b81d6"
                  />
                  <path
                      d="M582.17908,739.45064H523.9723a31.00847,31.00847,0,0,1,58.20678,0Z"
                      transform="translate(-62.24207 -126.55043)"
                      fill="#2b81d6"
                  />
                  <path
                      d="M858.24207,550.72094v122.9a61.52336,61.52336,0,0,1,0-122.9Z"
                      transform="translate(-62.24207 -126.55043)"
                      fill="#2b81d6"
                  />
                  <rect
                      x="279.45927"
                      y="380.6149"
                      width="422.14211"
                      height="36.06239"
                      rx="18.03118"
                      fill="#fff"
                  />
                  <rect
                      x="279.45927"
                      y="451.67903"
                      width="422.14211"
                      height="36.06239"
                      rx="18.03118"
                      fill="#fff"
                  />
                  <rect
                      x="553.59711"
                      y="522.74315"
                      width="148.00427"
                      height="36.06239"
                      rx="18.03118"
                      fill="#fff"
                  />
                  <path
                      d="M955.29387,238.67007s16.82875,6.54451,17.76368,28.04791-4.67465,81.33893-4.67465,81.33893,20.56846,29.91777,4.67465,38.33214-17.76368-33.65749-17.76368-33.65749l-18.6986-88.81837S947.81443,237.73514,955.29387,238.67007Z"
                      transform="translate(-62.24207 -126.55043)"
                      fill="#a0616a"
                  />
                  <path
                      d="M783.26671,307.85491s-40.202,26.178-42.07187,5.60958S753.34894,212.492,753.34894,212.492s1.86986-34.59242,21.50339-26.178-5.60958,37.39721-5.60958,37.39721l2.80479,65.44511,18.69861-.93493Z"
                      transform="translate(-62.24207 -126.55043)"
                      fill="#a0616a"
                  />
                  <path
                      d="M847.77689,332.1631s-123.41079-45.81159-116.86628,7.47944,38.33214,120.606,38.33214,120.606l11.21917,17.76368h23.37325L788.87629,381.7144s53.291,29.91777,69.18484,25.24312c0,0,20.56846,137.43475,28.04791,147.719s20.56846,134.63,20.56846,134.63l12.15409,14.95888h23.37326V493.906s40.202-130.89023,9.3493-137.43475S847.77689,332.1631,847.77689,332.1631Z"
                      transform="translate(-62.24207 -126.55043)"
                      fill="#2f2e41"
                  />
                  <path
                      d="M777.65712,465.85812s-5.60958-10.28423-14.95888,0-31.78763,22.43833-31.78763,22.43833-48.61637,11.21916-9.3493,20.56847,43.94172,0,43.94172,0,6.54451,1.86986,12.15409,3.73972S819.729,507.93,819.729,502.3204s-12.37851-39.134-17.40842-34.05842S777.65712,465.85812,777.65712,465.85812Z"
                      transform="translate(-62.24207 -126.55043)"
                      fill="#2f2e41"
                  />
                  <path
                      d="M920.6231,695.01108s-13.7851-11.35244-17.02865-8.10888-20.2722,25.13753-20.2722,25.13753-45.40973,34.86818-4.05444,40.5444,38.92263-9.73066,38.92263-9.73066h12.9742c1.62178,0,23.51576-9.73066,22.70487-13.7851s-10.54155-37.11568-13.7851-34.7756S920.6231,695.01108,920.6231,695.01108Z"
                      transform="translate(-62.24207 -126.55043)"
                      fill="#2f2e41"
                  />
                  <circle
                      cx="733.17873"
                      cy="44.80466"
                      r="31.78763"
                      fill="#a0616a"
                  />
                  <path
                      d="M817.85913,167.61537s24.30818,20.56847,41.13693,20.56847S834.68787,226.516,834.68787,226.516l-36.46228-32.72256Z"
                      transform="translate(-62.24207 -126.55043)"
                      fill="#a0616a"
                  />
                  <path
                      d="M827.20843,226.516l-.728-7.36568s18.4917-32.83632,24.10129-35.64112,9.3493-2.80479,9.3493-2.80479,18.6986-19.63353,39.26707-9.3493,69.18484,75.72935,69.18484,75.72935-34.59242,2.80479-29.91777,29.91777c0,0,34.59242,88.81838,25.24312,89.75331s-37.39721-5.60959-66.38,7.47944-42.07186,4.67465-42.07186,4.67465l-14.95889-48.61637s-28.04791-15.89382-27.113-29.91777L772.515,318.60661l3.73972-34.59242,24.77565-28.51537S796.35573,251.75909,827.20843,226.516Z"
                      transform="translate(-62.24207 -126.55043)"
                      fill="#575a89"
                  />
                  <path
                      d="M766.18031,174.79171a11.73657,11.73657,0,0,1-4.616,3.14369c-1.81051.51062-4.09154-.11555-4.81307-1.85281l1.34411-1.74939-4.02944-2.5039,1.75581-2.06012-3.24556-3.5243,2.56163-2.03236-4.87719-3.48808c6.32111-10.31466,13.15729-20.75845,23.13705-27.59607s23.9246-9.26726,34.14813-2.7998c5.30792,3.35782,9.06128,8.68723,12.06785,14.20172,6.04656,11.09024,11.37634,21.9007,12.16329,34.50764-3.79816-3.69869-9.34319-5.783-13.14136-9.48173a28.463,28.463,0,0,0-5.66925-4.64065c-3.97269-2.24026-8.726-2.43845-13.17348-3.449-3.73952-.84974-6.16609-2.53534-8.99529-4.94505-3.36564-2.8666-3.50275-1.7582-6.90135,1.46926Q775.04391,166.39718,766.18031,174.79171Z"
                      transform="translate(-62.24207 -126.55043)"
                      fill="#2f2e41"
                  />
                </svg>
              </v-responsive>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from "moment"
import {connect} from "@/utils/web3Utils";
import {disconnect} from "@/utils/util";
import AuthenticationService from "@/services/AuthenticationService";

export default {
  name: 'SignUp',
  data: () => ({
    loading: false,
    connectType: "",
    address: "",
    channelName: '',
    email: '',
    invitationCode: '',
    codeDisable: false,
    unReg: false,
  }),
  computed: {
    networkId() {
      return sessionStorage.getItem("network_id");
    }
  },
  methods: {
    async signUp() {
      if (!this.address) {
        await this.$store.dispatch("showTips", {
          type: "info", text: "Please connect your wallet"
        })
        return;
      }
      if (this.loading) return
      this.loading = true;
      const timespan = moment().format('x');

      let msg = this.web3.utils.sha3(this.address + timespan)
      const signature = await this.web3.eth.personal.sign(msg, this.address).catch(err => {
        this.loading = false;
        this.$store.dispatch("showTips", {
          type: "info", text: err.message
        })
      });

      if (!signature) return;

      // const data = await this.$store
      //     .dispatch('signUp', {
      //       email: this.email,
      //       channelName: this.channelName,
      //       invitation: this.invitationCode,
      //       timespan,
      //       signature,
      //       address: this.address
      //     })
      //     .catch((err) => {
      //       this.loading = false;
      //       const errors = err.response.data.error
      //       this.$refs.form.setErrors({
      //         'Email': this.getError(errors,'email'),
      //         'Channel Name': this.getError(errors,'channelName'),
      //         'Address': this.getError(errors,'address'),
      //       })
      //     })
      //
      const data =
          this.unReg ?
              await this.$store
                  .dispatch('signUp', {
                    email: this.email,
                    channelName: this.channelName,
                    invitation: this.invitationCode,
                    timespan,
                    signature,
                    address: this.address
                  })
                  .catch((err) => {
                    this.loading = false;
                    const errors = err.response.data.error
                    this.$refs.form.setErrors({
                      'Email': this.getError(errors, 'email'),
                      'Channel Name': this.getError(errors, 'channelName'),
                      'Address': this.getError(errors, 'address'),
                    })
                  }) :
              await this.$store
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

      this.$router.go(-1)
    },
    async connectMetaMask() {
      const {err, res} = await connect("metaMask");
      if (err) {
        await this.$store.dispatch("showTips", {
          type: "info", text: err
        })
      } else {
        const {address, web3} = res;
        this.address = address;
        this.web3 = web3;
        this.connectType = 'metamask';
        this.$store.commit("SET_WEB3", web3);
        await this.getInfo(address);
      }
    },
    async connectWalletConnect() {
      const {err, res} = await connect("walletConnect", () => {
        this.address = "";
        this.connectType = "";
        disconnect(this);
      });
      if (err) {
        await this.$store.dispatch("showTips", {
          type: "info", text: err,
        })
      } else {
        const {address, web3} = res;
        this.connectType = "walletConnect";
        this.address = address;
        this.web3 = web3;
        this.$store.commit("SET_WEB3", web3);
        await this.getInfo(address);
      }
    },
    async connectOkx() {
      const {err, res} = await connect("okx");
      if (err) {
        await this.$store.dispatch("showTips", {
          type: "info", text: err
        })
      } else {
        const {address, web3} = res;
        this.address = address;
        this.web3 = web3;
        this.connectType = "okx"
        this.$store.commit("SET_WEB3", web3);
        await this.getInfo(address);
      }
    },
    disconnectWalletConnect() {
      this.init();
      this.loading = false;
      this.web3.currentProvider?.disconnect?.();
    },
    getInvitationCode() {
      const code = sessionStorage.getItem('invitation');
      if (code) {
        this.codeDisable = true;
        this.invitationCode = code;
      }
    },
    async getInfo(address) {
      this.loading = true;
      const {data: {data}} = await AuthenticationService.getInfo(address);
      if (data) {
        this.channelName = data.channelName
        this.unReg = false;
      } else {
        this.unReg = true;
      }
      this.loading = false;
    },
    getError(errors, field) {
      let error = errors.find(item => item.field === field);
      return error?.message
    },
    init() {
      this.address = '';
      this.channelName = '';
      this.connectType = '';
      this.email = '';
    }
  },
  created() {
    this.getInvitationCode();
  }
}
</script>

<style scoped>
</style>
