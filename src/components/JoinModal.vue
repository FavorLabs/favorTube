<template>
  <v-dialog v-model="openModal" width="600" persistent>
    <v-card class="subscribe-card">
      <v-card-title class="text-h5 grey lighten-2">
        Subscribe {{ video.userId.channelName }}
      </v-card-title>
      <v-card-text class="text" style="color: #000">
        <p>
          <span class="key">Channel Account:</span>
          <span class="value">{{ video.userId.address }}</span>
        </p>
        <p>
          <span class="key">Your Account:</span>
          <span class="value">{{ currentUser.address }}</span>
        </p>
        <div class="flex-box">
          <p>
            <span class="key">Your {{ chainInfo.tokenName }}:</span>
            <span class="value">
              <span class="price" v-if="!amountLoading">{{ amount }}</span><span v-else class="loading size-20"></span>
              <a v-if="!!chainInfo.faucet" :href="chainInfo.faucet" target="_blank" style="margin: 0 10px;">Faucet</a>
              <v-icon style="vertical-align: top" v-if="!amountLoading" color="#f44336" @click="getAmount()">
                mdi-refresh
              </v-icon>
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
            <span class="key">Remain:</span>
            <span class="value">
              <span v-if="expirationBlockNumber">{{ expirationDate }}</span>
              <span v-else class="loading size-20"></span>
            </span>
          </p>
        </div>

        <div class="pay-methods">
          <div :class="radios !== 'uniswap' ? 'left' : 'left left-uni'">
            <p class="pay-methods-title">Select a payment method:</p>
            <v-radio-group v-model="radios" class="pay-methods-option">
              <v-radio value="balance" label="Balance" v-if="accountBalance + processingBalance > 0"></v-radio>
              <v-radio value="token" label="Token"></v-radio>
              <v-radio value="uniswap" label="Uniswap" :disabled="tokenPayDisabled"></v-radio>
            </v-radio-group>
          </div>
          <div class="right">
            <p v-if="radios !== 'uniswap'">Your assets:</p>
            <div v-if="radios === 'token'">
              <p>
                <span class="key">{{ token.name }}:</span>
                <span class="value">
                  <span class="price" v-if="this.balance">{{ balance / Math.pow(10, token.decimal) }}</span>
                  <span v-else class="loading size-20"></span>
                </span>
              </p>
            </div>
            <div v-else-if="radios === 'balance'">
              <p>
                <span class="key">Total Balance:</span>
                <span class="value">
                  <span class="price" v-if="!accountBalanceLoading">{{ (Number(accountBalance) + Number(processingBalance)) / Math.pow(10, token.decimal) }}</span>
                  <span v-else class="loading size-20"></span>
                </span>
              </p>
              <p>
                <span class="key">Available Balance:</span>
                <span class="value">
                  <span class="price" v-if="!accountBalanceLoading">{{ accountBalance / Math.pow(10, token.decimal) }}</span>
                  <span v-else class="loading size-20"></span>
                </span>
              </p>
              <p>
                <span class="key">Unavailable Balance:</span>
                <span class="value">
                  <span class="price" v-if="!accountBalanceLoading">{{ (processingBalance / Math.pow(10, token.decimal)) }}</span>
                  <span v-else class="loading size-20"></span>
                </span>
              </p>
            </div>
            <div v-else>
              <div>
                <!-- <span>uniswap</span> -->
                <uniswap
                  class="uniswap-wrap"
                  :provider="web3.currentProvider"
                  :uniConfig="uniConfig"
                  @priceUpdate="uniPriceUpdate"
                  @disableUpdate="uniDisableUpdate"
                />
              </div>
            </div>
          </div>
        </div>
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
            :disabled="checkPayDisable"
            v-if="!subInfo.state"
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
import moment from 'moment';
import {mapGetters} from "vuex";
// eslint-disable-next-line no-unused-vars
import {tokenAbi, favorTubeAbi, config} from "@/config/config";
import Uniswap from '@/components/react/Uniswap';
import UserService from "@/services/UserService";
import AccountService from "@/services/AccountService";
import SubListService from "@/services/SubListService";

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
    },
    subInfo: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      balance: 0,
      amount: 0,
      amountLoading: false,
      accountBalance: 0,
      processingBalance: 0,
      accountBalanceLoading: false,
      payLoading: false,
      subLoading: false,
      tokenPayDisabled: true,
      balancePayDisabled: true,
      uniPayDisabled: true,
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
      radios: 'token',
      checkTimer: null,
      expirationBlockNumber: 0,
      uniConfig: {
        chainId: config.chainId,
        favorTokenAddress: config.favorTokenAddress, // '0xd9e990ceb3728c43fb28d15b44c5b8c1a136db13'
        decimal: 3,
        name: '',
        symbol: '',
        favorTubeAddress: config.favorTubeAddress
      },
      uniTrade: null,
    }
  },
  components: {
    Uniswap,
  },
  computed: {
    ...mapGetters([
      "currentUser",
      "web3",
      "getApi",
      "nodeWeb3"
    ]),
    checkPayDisable() {
      return this.radios === 'token' ? (this.tokenPayDisabled || this.balance < this.price) :
      this.radios === 'balance' ? (this.balancePayDisabled || this.tokenPayDisabled || this.accountBalance < this.price) :
      this.uniPayDisabled;
    },
    expirationDate() {
      let timeObj = {
        18: 2,
        19: 5,
        20: 7,
        21: 4
      }
      const networkId = sessionStorage.getItem('network_id');
      let time = timeObj[networkId];
      let d = moment.duration(this.expirationBlockNumber * time, 'seconds');
      return Math.floor(d.asDays()) + 'days ' + d.hours() + 'h' + d.minutes() + 'm' + d.seconds() + 's';
    }
  },
  async created() {
    this.getAccountBlance();
    let timer = null;
    try {
      timer = setTimeout(() => {
        this.$store.dispatch("showTips", {
          type: "info",
          text: "Chain query failure"
        })
        this.closeModal();
      }, 1000 * 15)
      await this.getAmount();
      const favorTubeContract = new this.nodeWeb3.eth.Contract(favorTubeAbi, this.favorTubeCAddress);
      const tokenContract = new this.nodeWeb3.eth.Contract(tokenAbi, this.token.address);
      this.token.decimal = await tokenContract.methods.decimals().call();
      this.uniConfig.decimal = Number(this.token.decimal);
      this.uniConfig.name = await tokenContract.methods.name().call();
      this.uniConfig.symbol = await tokenContract.methods.symbol().call();
      this.balance = await tokenContract.methods.balanceOf(this.currentUser.address).call();
      this.price = (await favorTubeContract.methods.userConfig().call({from: this.video.userId.address})).price;
      this.expirationBlockNumber = await favorTubeContract.methods.subscribeBlock().call();
      clearTimeout(timer);
      this.favorTubeContract = favorTubeContract;
      this.tokenContract = tokenContract;
      this.tokenPayDisabled = false;
    } catch (e) {
      clearTimeout(timer);
      this.$store.dispatch("showTips", {
        type: "info",
        text: e.message || e
      });
    }
  },
  methods: {
    dateFormatter(date) {
      return moment(date).format('LLL');
    },
    closeModal() {
      // clearInterval(this.checkTimer)
      this.$emit('closeJoinModal');
    },
    selectDefaultPay() {
      if (this.accountBalance > 0) {
        this.radios = 'balance';
      } else {
        this.radios = 'token';
      }
    },
    async getAmount() {
      this.amountLoading = true;
      const amount = await this.nodeWeb3.eth.getBalance(this.currentUser.address);
      this.amount = Number(this.nodeWeb3.utils.fromWei(amount, "ether")).toFixed(5);
      this.amountLoading = false;
    },
    uniPriceUpdate(inputAmount, outputAmount) {
      console.log('uniPriceUpdate', inputAmount, outputAmount);
      this.uniTrade = {
        inputAmount,
        outputAmount
      };
    },
    uniDisableUpdate(disable, approved) {
      if (!disable && approved) {
        this.uniPayDisabled = false;
      } else {
        this.uniPayDisabled = true;
      }
    },
    async getAccountBlance() {
      try {
        this.accountBalanceLoading = true;
        const { data } = await AccountService.getInfo();
        if (data.data) {
          this.accountBalance = data.data.amount - data.data.processing;
          this.selectDefaultPay();
          this.processingBalance = data.data.processing;
        }
        this.balancePayDisabled = false;
        this.accountBalanceLoading = false;
      } catch(e) {
        this.$store.dispatch("showTips", {
          type: "error",
          text: e.message || e
        });
      }
    },
    async pay () {
      if (!this.radios) {
        this.$store.dispatch("showTips", {
          type: "info",
          text: 'Please select a payment method'
        });
        return;
      }

      this.subLoading = true;
      let sharer = "0x" + "0".repeat(40);
      let sharerId = undefined;
      let invitation_videoId = sessionStorage.getItem("invitation_videoId");
      let invitation = sessionStorage.getItem("invitation");
      if (invitation_videoId && invitation && invitation_videoId === this.video._id) {
        await UserService.getById(invitation).then((user) => {
          sharer = user.data.data.address;
          sharerId = user.data.data._id;
        }).catch(console.log);
      }

      if (this.radios === 'token') {
        this.tokenPay(sharer, sharerId);
        return;
      }

      if (this.radios === 'balance') {
        this.balancePay(sharerId);
        return;
      }

      if (this.radios === 'uniswap') {
        this.unswapPay();
        return;
      }
    },
    async tokenPay(sharer, sharerId) {
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
      }, (err, tx) => {
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
        this.addSublist(sharerId, tx);
        // this.checkPayStatus();
        })
    },
    async addSublist(sharerId, tx) {
      try {
        const { data } = await SubListService.addSublist({
          channelId: this.video.userId._id,
          sharerId,
          tx,
          price: this.price
        })
        if (data.data) {
          this.$emit("changeTransactionInfo", data.data);
        }
      } catch (e) {
        this.addSublist(sharerId, tx)
      }
    },
    async balancePay(sharerId) {
      const message = `Subscribe to Channel : ${this.currentUser.address} (Price: ${this.price})`;
      const signature = await this.web3.eth.personal.sign(message, this.currentUser.address).catch(err => {
        this.$store.dispatch("showTips", {
          type: "error", text: err.message || err
        })
        this.subLoading = false;
        this.payLoading = false;
      })
      if (!signature) return;

      try {
        const { data } = await SubListService.addSublist({
          channelId: this.video.userId._id,
          sharerId,
          channelAddress: this.video.userId.address,
          signature,
        })
        if (data.data) {
          this.$emit("changeTransactionInfo", data.data);
          // this.checkPayStatus();
        }
      } catch (e) {
        this.$store.dispatch("showTips", {
          type: "error",
          text: e.message || e
        });
        // this.balancePay(sharerId);
      }
    },
    unswapPay() {
      console.log('unswapPay', this.uniTrade);
    }
  },
  watch: {
    "subInfo": {
      handler: function (subInfo) {
        if (!subInfo.state) return;
        this.$emit('switchModal');
      }
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
    .flex-box {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      p {
        margin-right: 30px;
      }
    }
    p {
      margin-bottom: 5px;
    }
    .key {
      display: inline-block;
      // width: 130px;
      font-weight: bold;
      color: #4d4d4d;
      // text-align: right;
    }

    .value {
      margin-left: 10px;
    }

    .price {
      font-size: 20px;
      color: #f44336
    }

    .pay-methods {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 10px;
      background: rgb(220,220,220);
      border-radius: 4px;
      margin-top: 10px;
      margin-left: -5px;
      min-width: 290px;
      .left,
      .right {
        padding: 10px 10px 0 10px;
        min-height: 200px;
        border-radius: 4px;
        background: rgb(245,245,245);
      }
      .left {
        width: 50%;
        margin-right: 10px;
        .v-messages {
          display: none;
        }
      }
      .left-uni {
        height: auto;
        align-self: stretch;
      }
      .right {
        flex-grow: 1;
        .uniswap-wrap {
          color: #f44336;
          ::v-deep .uniswap {
            width: 100%;
            max-width: 400px;
            min-width: 260px;
            margin-left: -5px;
            background-color: transparent;
          }
        }
      }
      .pay-methods-title {
        // margin-top: 25px;
      }
      p {
        margin-bottom: 8px;
      }
      .pay-methods-option {
        margin-top: 0;
        .option-item {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          flex-wrap: wrap;
          p {
            margin-right: 20px;
            word-break: break-all;
          }
        }
      }
    }
  }

  .loading {
    display: inline-block;
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
      max-height: 350px;
      overflow: hidden;
      overflow-y: scroll;
      .key {
        // display: ;
        width: unset;
        margin-right: 10px;
        text-align: unset;
      }
      .value {
        margin-left: 0;
      }
      .pay-methods {
        flex-direction: column;
        .left,
        .right {
          width: 100%;
          min-height: unset;
        }
        .left {
          margin: 0 0 10px 0;
        }
      }
    }
  }
}

</style>
