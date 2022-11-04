<template>
  <v-dialog v-model="openModal" width="600" persistent>
    <v-card class="subscribe-card">
      <v-card-title class="text-h5 grey lighten-2">
        Subscribe {{ video.userId.channelName }}
      </v-card-title>
      <v-card-text class="text" style="color: #000">
        <p>
          <span class="key">Account:</span>
          <span class="value">{{ currentUser.address }}</span>
        </p>
        <p>
          <span class="key">{{ chainInfo.tokenName }}:</span>
          <span class="value">
            <span class="price" v-if="!amountLoading">{{ amount }}</span><span v-else class="loading size-20"></span>
            <a v-if="!!chainInfo.faucet" :href="chainInfo.faucet" target="_blank" style="margin: 0 10px;">Faucet</a>
            <v-icon style="vertical-align: top" v-if="!amountLoading" color="#f44336" @click="getAmount()">
              mdi-refresh
            </v-icon>
          </span>
        </p>
        <p>
          <span class="key">{{ token.name }}:</span>
          <span class="value">
            <span class="price" v-if="this.balance">{{ balance / Math.pow(10, token.decimal) }}</span>
            <span v-else class="loading size-20"></span>
          </span>
        </p>
        <p>
          <span class="key">Pay:</span>
          <span class="value">
            <span class="price" v-if="this.price">{{
                price / (Math.pow(10, token.decimal))
              }}</span>
          <span v-else class="loading size-20"></span>
          {{ token.name }}
          </span>
        </p>
        <p>
          <span class="key">Channel Account:</span>
          <span class="value">{{ video.userId.address }}</span>
        </p>
        <!-- <div class="pay-methods">
          <p class="pay-methods-title">Select a payment method</p>
          <v-radio-group v-model="radios" row>
            <v-radio value="Token">
              <template v-slot:label>
                <div>Token</div>
              </template>
            </v-radio>
            <v-radio value="AccountBalance">
              <template v-slot:label>
                <div>Account balance</div>
              </template>
            </v-radio>
          </v-radio-group>
        </div> -->
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="primary"
            text
            @click="closeModal"
        >
          Cancel
        </v-btn>
        <v-btn
            :disabled="payDisabled && balance>=price"
            color="primary"
            text
            @click="pay"
            :loading="subLoading"
        >
          Pay
        </v-btn>
        <!-- :style="transactionStatus === 0 ? 'display: block' : 'display: none'" -->
      </v-card-actions>
      <!-- <div class="subscribe-card-overlay" :style="transactionStatus !== 0 ? 'display: block' : 'display: none'">
        <div class="content">
          <span class="loading size-40"></span>
          <p class="status-desc text-shadow">Transactions submitted</p>
        </div>
      </div> -->
    </v-card>
  </v-dialog>
</template>

<script>
import {mapGetters} from "vuex";
// eslint-disable-next-line no-unused-vars
import {tokenAbi, favorTubeAbi, config} from "@/config/config";
import SubscriptionService from "@/services/SubscriptionService";
import UserService from "@/services/UserService";

export default {
  name: "JoinModal",
  props: {
    openModal: {
      type: Boolean,
      required: true
    },
    video: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      balance: 0,
      amount: 0,
      amountLoading: false,
      payLoading: false,
      subLoading: false,
      payDisabled: true,
      price: 0,
      token: {
        decimal: 2,
        name: "FAVT",
        address: config.favorTokenAddress
      },
      favorTubeCAddress: config.favorTubeAddress,
      favorTubeContract: null,
      tokenContract: null,
      chainInfo: config,
      // radios: 'Token',
      // transactionStatus: 0,
    }
  },
  computed: {
    ...mapGetters([
      "currentUser",
      "web3",
      "getApi",
      "nodeWeb3"
    ])
  },
  async created() {
    let timer = null;
    try {
      timer = setTimeout(() => {
        this.$store.dispatch("showTips", {
          type: "info",
          text: "Chain query failure"
        })
        this.closeModal();
      }, 1000 * 10)
      await this.getAmount();
      const favorTubeContract = new this.nodeWeb3.eth.Contract(favorTubeAbi, this.favorTubeCAddress);
      const tokenContract = new this.nodeWeb3.eth.Contract(tokenAbi, this.token.address);
      this.token.decimal = await tokenContract.methods.decimals().call();
      this.balance = await tokenContract.methods.balanceOf(this.currentUser.address).call();
      this.price = (await favorTubeContract.methods.userConfig().call({from: this.video.userId.address})).price
      clearTimeout(timer);
      this.favorTubeContract = favorTubeContract;
      this.tokenContract = tokenContract;
      this.payDisabled = false;
    } catch (e) {
      clearTimeout(timer);
      this.$store.dispatch("showTips", {
        type: "info",
        text: e.message || e
      });
    }
  },
  methods: {
    closeModal() {
      this.$emit('closeJoinModal');
    },
    async getAmount() {
      this.amountLoading = true;
      const amount = await this.nodeWeb3.eth.getBalance(this.currentUser.address);
      this.amount = Number(this.nodeWeb3.utils.fromWei(amount, "ether")).toFixed(5);
      this.amountLoading = false;
    },
    async pay() {
      this.subLoading = true;
      let sharer = "0x" + "0".repeat(40);
      let invitation_videoId = sessionStorage.getItem("invitation_videoId");
      let invitation = sessionStorage.getItem("invitation");
      if (invitation_videoId && invitation && invitation_videoId === this.video._id) {
        await UserService.getById(invitation).then((user) => {
          sharer = user.data.data.address;
        }).catch(console.log);
      }
      console.log(sharer)
      const price = await this.web3.eth.getGasPrice();
      this.web3.eth.sendTransaction({
        from: this.currentUser.address,
        to: this.token.address,
        gasPrice: this.web3.utils.toHex(price),
        data: this.tokenContract.methods.transfer(
            this.favorTubeCAddress,
            this.price,
            this.web3.eth.abi.encodeParameters(['address', 'address', 'address'], [this.video.userId.address, this.currentUser.address, sharer])
        ).encodeABI()
      }, (err) => {
        this.payLoading = true;
        if (err) {
          this.$store.dispatch("showTips", {
            type: "error",
            text: err.message || err
          })
          this.subLoading = false;
          this.payLoading = false;
          return;
        }
        let lock = false;
        let timer = setInterval(async () => {
          if (lock) return;
          lock = true;
          try {
            const {data} = await SubscriptionService.checkSubscription({channelId: this.video.userId._id}, 2000);
            if (data?.data?.tx) {
              clearInterval(timer);
              this.payLoading = false;
              this.subLoading = false;
              await this.$store.dispatch("showTips", {
                type: "success",
                text: "Subscription Success"
              });
              this.$emit("callback", data.data);
            }
          } catch (e) {
            console.log(e)
          }
          lock = false;
        }, 1000)
      })
    },
  }
}
</script>

<style scoped lang="scss">
.subscribe-card {
  position: relative;
  .text {
    margin-top: 20px;
    font-size: 16px;
    .key {
      display: inline-block;
      width: 130px;
      text-align: right;
    }

    .value {
      margin-left: 10px;
    }

    .price {
      font-size: 20px;
      color: #f44336
    }

    .pay-methods {
      padding: 15px 15px 0 15px;
      background: rgb(245,245,245);
      border-radius: 4px;
      .pay-methods-title {
        // font-weight: 300;
      }
    }
  }
  .subscribe-card-overlay {
    position: absolute;
    top: 58px;
    left: 0;
    right: 0;
    bottom: 53px;
    background-color: #fff;
    .content {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      .status-desc {
        color: #ccc;
        font-size: 2rem;
        font-weight: bolder;
        margin-top: 15px;
      }
      .text-shadow {
        background: -webkit-gradient(
          linear,
          left top,
          right bottom,
          color-stop(0, #4d4d4d),
          color-stop(0.4, #4d4d4d),
          color-stop(0.5, #eee),
          color-stop(0.6, #4d4d4d),
          color-stop(1, #4d4d4d)
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        -webkit-animation: text-shadow 3.5s linear infinite;
        animation: text-shadow 3.5s linear infinite;
      }
    }
  }

  .loading {
    display: inline-block;
    // width: 20px;
    // height: 20px;
    vertical-align: middle;
    border: 2px solid #f44336;
    border-bottom-color: transparent;
    border-radius: 50%;
    animation: king 1s linear infinite;
  }
  .loading.size-20 {
    width: 20px;
    height: 20px;
    border-width: 2px;
  }
  .loading.size-40 {
    width: 60px;
    height: 60px;
    border-width: 6px;
    border-color: #4d4d4d #4d4d4d transparent #4d4d4d;
  }
}

@keyframes king {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes text-shadow {
  from {
    background-position: -150px;
  }
  to {
    background-position: 150px;
  }
}

@media screen and (max-width: 650px) {
  .subscribe-card {
    .text {
      margin-top: 20px;
      font-size: 16px;
      .key {
        display: unset;
        width: unset;
        text-align: unset;
      }
    }
    .subscribe-card-overlay {
      .content {
        .status-desc {
          font-size: 1.2rem;
        }
      }
    }
  }
}

</style>
