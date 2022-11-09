<template>
  <v-container fluid class="fill-height">
    <div class="signin-header">
      <div class="back-m" @click="goBack">
        <img :src="require('@/assets/back_signin_m.png')" width="15" alt="">
        <span>BACK</span>
      </div>
    </div>
    <div class="bg-white-m">
      <div class="signin-header-text" style="position: absolute;text-align: center;width: calc(100% - 6vmin);">
        <p class="title">{{ signStatus }}</p>
        <p class="desc">You just need to {{ signStatus }} with your wallet</p>
      </div>
      <v-row no-gutters class="btns-list fill-height">
        <v-col cols="12" xs="12" sm="8" md="8" class="ma-auto" style="max-width: 1250px;">
          <v-card outlined :loading="loading">
            <img :src="require('@/assets/goback.png')" width="15" class="back" alt="" @click="goBack">
            <v-row no-gutters class="bg-pc">
              <div class="signIn-left">
                <p class="title">{{ signStatus }}</p>
                <p class="desc">You just need to {{ signStatus }} with your wallet</p>
              </div>
              <img class="human-pc" :src="require('@/assets/human_m.png')" alt="">
              <img class="ball-pc" :src="require('@/assets/ball.png')" alt="">
              <v-col cols="12" sm="12" md="8" offset="0" offset-md="4">
                <v-row no-gutters>
                  <v-col cols="12" offset-md="2" md="8">
                    <v-card-text class="fill-height">
                      <v-row no-gutters class="fill-height justify-center align-center">
                        <v-col cols="12" lg="8" class="align-center">
                          <template v-if="$store.state.tips.isMobile">
                            <div class="wallet_btn" v-if="!connectType || connectType==='metamask'"
                                 @click="connectMetaMask">
                              <div class="wallet_img">
                                <img
                                    height="30"
                                    :src="require('@/assets/metamask.png')"
                                    alt=""
                                />
                              </div>
                              <div class="wallet_text">METAMASK</div>
                            </div>
                            <div class="wallet_btn" v-if="!connectType || connectType==='okx'" @click="connectOkx">
                              <div class="wallet_img">
                                <img
                                    height="30"
                                    :src="require('@/assets/okx.png')"
                                    alt=""
                                />
                              </div>
                              <div class="wallet_text">OKX</div>
                            </div>
                          </template>
                          <div class="wallet_btn" v-if="!connectType || connectType==='walletConnect'"
                               @click="connectWalletConnect">
                            <div class="wallet_img">
                              <img
                                  height="30"
                                  :src="require('@/assets/walletconnect.png')"
                                  alt=""
                              />
                            </div>
                            <div class="wallet_text">WALLETCONNECT</div>
                          </div>
                          <div class="reset" v-if="address" @click="reset">RESET</div>
                          <ValidationObserver ref="form" v-slot="{ handleSubmit, reset }">
                            <form
                                @submit.prevent="handleSubmit(signUp)"
                                @reset.prevent="reset"
                                class="mt-5"
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
                              <div class="mt-3 d-flex justify-space-between">
                                <v-btn
                                    height="50"
                                    v-if="address"
                                    type="submit"
                                    class="primary"
                                    :loading="loading"
                                    depressed
                                    block
                                    style="position: relative;z-index: 1"
                                >
                                  Sign {{ unReg ? 'Up' : 'In' }}
                                </v-btn>
                              </div>
                            </form>
                          </ValidationObserver>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-col>
                  <v-col cols="2" class="hidden-sm-and-down">
                    <v-img
                        :src="require('@/assets/signIn-right.png')"
                    >
                    </v-img>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <img class="bg-color-m" :src="require('@/assets/bg_color_m.png')"/>
    <img class="fly-m" :src="require('@/assets/fly_m.png')" alt="">
    <img class="human-m" :src="require('@/assets/human_m.png')" alt="">
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
    },
    signStatus() {
      return this.unReg ? 'sign up' : 'sign in';
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

      this.goBack();
    },
    async connectMetaMask() {
      const {err, res} = await connect("metaMask");
      if (err) {
        await this.$store.dispatch("showTips", {
          type: "info", text: err
        })
      } else {
        const {address, web3} = res;
        this.web3 = web3;
        this.connectType = 'metamask';
        this.$store.commit("SET_WEB3", web3);
        await this.getInfo(address);
      }
    },
    async connectWalletConnect() {
      const {err, res} = await connect("walletConnect", () => {
        this.init();
        disconnect(this);
      });
      if (err) {
        await this.$store.dispatch("showTips", {
          type: "info", text: err,
        })
      } else {
        const {address, web3} = res;
        this.connectType = "walletConnect";
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
        this.web3 = web3;
        this.connectType = "okx"
        this.$store.commit("SET_WEB3", web3);
        await this.getInfo(address);
      }
    },
    reset() {
      this.init();
      this.loading = false;
      localStorage.removeItem("walletconnect");
      this.web3?.currentProvider?.disconnect?.();
    },
    getInvitationCode() {
      const code = sessionStorage.getItem('invitation');
      if (code) {
        this.codeDisable = true;
        this.invitationCode = code;
      }
    },
    async getInfo(address) {
      this.init();
      this.address = address;
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
      this.unReg = false;
      this.loading = false;
    },
    goBack() {
      if (this.isFirstLoad) { // default length is 3
        this.$router.replace('/');
      } else {
        this.$router.go(-1);
      }
    }
  },
  created() {
    this.getInvitationCode();
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (from.fullPath === '/config' || from.name === null) {
        vm.isFirstLoad = true;
      }
    });
  }
}
</script>

<style scoped lang="scss">
.back {
  position: absolute;
  left: 20px;
  top: 10px;
  cursor: pointer;
  user-select: none;
}

.signin-header {
  display: none;
  width: 100vw;
  padding: 2vmin;

  .back-m {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    img {
      width: 3vmin;
    }

    span {
      margin-left: 10px;
      font-family: Roboto-Medium;
    }
  }
}

.signin-header-text {
  display: none;
  margin: 0 auto;
  text-align: center;

  p {
    margin-bottom: 0;
  }

  .title {
    font-size: 32px !important;
    color: #262626;
    font-family: Impact-Regular !important;
  }

  .desc {
    font-size: 12px;
    color: #808080;
    font-family: Roboto-Regular;
  }
}

.bg-color-m {
  position: absolute;
  top: -45vw;
  left: -50vw;
  display: none;
  width: 180vw;
  pointer-events: none;
}

.fly-m {
  display: none;
  position: absolute;
  top: 45px;
  right: 20px;
  width: 34px;
  height: 38.5px;
}

.human-m {
  display: none;
  position: absolute;
  bottom: 18.5px;
  left: 0;
  width: 87px;
  height: 64.5px;
}

.wallet_btn {
  height: 50px;
  display: flex;
  align-items: center;
  background: #F5FAFF;
  cursor: pointer;
  user-select: none;
  margin-bottom: 15px;
}

.wallet_img {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #F5FAFF;
  background: #fff;
}

.wallet_text {
  width: 75%;
  font-size: 16px;
  font-family: Roboto-Medium, Roboto, serif;
  font-weight: 500;
  color: #262626;
  background: #F5FAFF;
  display: flex;
  align-items: center;
  /*justify-content: center;*/
  padding: 0 30px;
}

.reset {
  height: 50px;
  line-height: 50px;
  text-align: center;
  border-radius: 6px;
  font-family: Roboto-Medium, Roboto, serif;
  font-weight: 500;
  font-size: 16px;
  color: #3B99FD;
  opacity: 1;
  border: 1px solid #48A0FD;
  cursor: pointer;
  user-select: none;
}

.signIn-left {
  position: absolute;
  top: 5vw;
  left: 5vw;

  p {
    margin-bottom: 0;
  }

  .title {
    font-size: 4.5vmin !important;
    color: #262626;
    font-family: Impact-Regular !important;
  }

  .desc {
    font-size: 1.6vmin;
    color: #808080;
    font-family: Roboto-Regular;
    margin-top: 5px;
  }
}

.human-pc {
  position: absolute;
  bottom: 5vw;
  left: 6vw;
  width: 160px;
}

.ball-pc {
  position: absolute;
  bottom: 1.5vw;
  left: 2vw;
  width: 70px;
}

.bg-white-m {
  width: 100%;
}

.bg-pc {
  background: url('../../assets/bj.png') center/cover no-repeat;
}

@media screen and (max-width: 1024px) {
  .container.fill-height {
    position: relative;
    display: block;
    overflow: hidden;
    background: url('../../assets/wg_m.png') center/cover no-repeat;
  }
  .back {
    display: none;
  }
  .signin-header {
    display: block;
    position: fixed;
    left: 0;
    top: 0;
  }
  .bg-white-m {
    height: 100%;
    padding-top: 8vh;
    box-sizing: border-box;
    background: rgba(255, 255, 255, .6);
  }
  .bg-color-m {
    display: block;
  }
  .signin-header-text {
    display: block;
    //
  }
  .v-card__text {
    padding: 0;
  }
  .btns-list {
    width: 100%;
    //margin-top: 68px;
    padding: 0 3vmin;
  }
  .theme--light.v-card.v-card--outlined {
    border: none;
  }
  .wallet_btn {
    .wallet_img {
      width: 54px;
      height: 49px;
      flex-shrink: 0;
      flex: unset;
    }
  }
  .fly-m,
  .human-m {
    display: block;
  }
  .signIn-left,
  .human-pc,
  .ball-pc {
    display: none;
  }
}
</style>
