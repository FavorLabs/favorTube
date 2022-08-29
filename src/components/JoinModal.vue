<template>
  <v-dialog v-model="openModal" width="600" persistent>
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Subscribe {{ channelName }}
      </v-card-title>
      <v-card-text class="text" style="color: #000">
        <p>
          <span class="key">Account:</span>
          <span class="value">{{ currentUser.address }}</span>
        </p>
        <p>
          <span class="key">{{ chainInfo.tokenName }}:</span>
          <span class="value">
            <span class="price" v-if="!amountLoading">{{ amount }}</span><span v-else class="loading"></span>
            <a v-if="!!chainInfo.faucet" :href="chainInfo.faucet" target="_blank" style="margin: 0 10px;">Faucet</a>
            <v-icon style="vertical-align: top" v-if="!amountLoading" color="#f44336" @click="getAmount(chainWeb3)">
              mdi-refresh
            </v-icon>
          </span>
        </p>
        <p>
          <span class="key">{{ token.name }}:</span>
          <span class="value">
            <span class="price" v-if="this.balance">{{ balance / Math.pow(10, token.decimal) }}</span>
            <span v-else class="loading"></span>
          </span>
        </p>
        <p>
          <span class="key">Pay:</span>
          <span class="value">
            <span class="price" v-if="this.price">{{
                price / (Math.pow(10, token.decimal))
              }}</span>
          <span v-else class="loading"></span>
          {{ token.name }}
          </span>
        </p>
        <p>
          <span class="key">Channel Account:</span>
          <span class="value">{{ account }}</span>
        </p>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            :disabled="payLoading"
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
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapGetters} from "vuex";
// eslint-disable-next-line no-unused-vars
import {tokenAbi, favorTubeAbi, getContracts} from "@/config/contract";
// import {getWeb3} from "@/utils/web3Utils";
import Web3 from "web3";
import SubscriptionService from "@/services/SubscriptionService";

import {getChainInfo} from "@/utils/web3Utils";
// import {getContracts} from "@/config/contract";


export default {
  name: "JoinModal",
  props: {
    openModal: {
      type: Boolean,
      required: true
    },
    channelName: {
      type: String,
      required: true
    },
    account: {
      type: String,
      required: true
    },
    video_id: {
      type: String
    }
  },
  data() {
    let contractAddress = getContracts();
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
        address: contractAddress.tokenAddress
      },
      favorTubeCAddress: contractAddress.favorTubeAddress,
      favorTubeContract: null,
      tokenContract: null,
      chainWeb3: null,
      chainInfo: getChainInfo()
    }
  },
  computed: {
    ...mapGetters([
      "currentUser",
      "web3",
      "getApi"
    ])
  },
  async created() {
    try {
      if (!this.web3) return;
      const chainWeb3 = new Web3(this.getApi + "/chain");
      let timer = setTimeout(() => {
        this.$store.dispatch("showTips", {
          type: "info",
          text: "Chain query failure"
        })
        this.closeModal();
      }, 1000 * 10)
      await this.getAmount(chainWeb3);
      const favorTubeContract = new chainWeb3.eth.Contract(favorTubeAbi, this.favorTubeCAddress);
      const tokenContract = new chainWeb3.eth.Contract(tokenAbi, this.token.address);
      this.token.decimal = await tokenContract.methods.decimals().call();
      this.balance = await tokenContract.methods.balanceOf(this.currentUser.address).call();
      this.price = (await favorTubeContract.methods.userConfig().call({from: this.account})).price
      clearTimeout(timer);
      this.favorTubeContract = favorTubeContract;
      this.tokenContract = tokenContract;
      this.chainWeb3 = chainWeb3;
      this.payDisabled = false;
    } catch (e) {
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
    async getAmount(chainWeb3) {
      this.amountLoading = true;
      const amount = await chainWeb3.eth.getBalance(this.currentUser.address);
      this.amount = Number(chainWeb3.utils.fromWei(amount, "ether")).toFixed(5);
      this.amountLoading = false;
    },
    async pay() {
      this.subLoading = true;
      const price = await this.web3.eth.getGasPrice();
      this.web3.eth.sendTransaction({
        from: this.currentUser.address,
        to: this.token.address,
        gasPrice: this.web3.utils.toHex(price),
        data: this.tokenContract.methods.transfer(
            this.favorTubeCAddress,
            this.price,
            this.web3.eth.abi.encodeParameter('address', this.account)
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
          const {data} = await SubscriptionService.checkSubscription({channelId: this.video_id});
          if (data.data.tx) {
            clearInterval(timer);
            setTimeout(() => {
              this.payLoading = false;
              this.subLoading = false;
              this.$store.dispatch("showTips", {
                type: "success",
                text: "Subscription Success"
              });
              this.$emit("callback");
            }, 3000)
          }
          lock = false;
        }, 2000)
      })
    },
  }
}
</script>

<style scoped>
.text {
  margin-top: 20px;
  font-size: 16px;
}

.price {
  font-size: 20px;
  color: #f44336
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

.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  vertical-align: middle;
  border: 2px solid #f44336;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: king 1s linear infinite;
}

.key {
  display: inline-block;
  width: 130px;
  text-align: right;
}

.value {
  margin-left: 10px;
}

@media screen and (max-width: 650px) {
  .key {
    display: unset;
    width: unset;
    text-align: unset;
  }
}

</style>
