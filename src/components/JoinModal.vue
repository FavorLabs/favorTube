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
              <span v-if="subBlockNumber">{{ subBlockNumber }}</span>
              <span v-else class="loading size-20"></span>
            </span>
          </p>
        </div>

        <div class="pay-methods">
          <div :class="radio !== 2 ? 'left' : 'left left-uni'">
            <p class="pay-methods-title">Select a payment method:</p>
            <v-radio-group v-model="radio" class="pay-methods-option">
              <v-radio :value=0 :label="radioList[0]" v-if="accountBalance !== 0 && accountBalance >= price"></v-radio>
              <v-radio :value=1 :label="radioList[1]" v-if="balance !== 0 && balance >= price"></v-radio>
              <v-radio :value=2 :label="radioList[2]"></v-radio>
            </v-radio-group>
          </div>
          <div class="right">
            <div v-if="radio === 0">
              <p>Your assets:</p>
              <p>
                <span class="key">Total Balance:</span>
                <span class="value">
                  <span class="price" v-if="!accountBalanceLoading">{{
                      (Number(accountBalance) + Number(processingBalance)) / Math.pow(10, token.decimal)
                    }}</span>
                  <span v-else class="loading size-20"></span>
                </span>
              </p>
              <p>
                <span class="key">Available Balance:</span>
                <span class="value">
                  <span class="price" v-if="!accountBalanceLoading">{{
                      accountBalance / Math.pow(10, token.decimal)
                    }}</span>
                  <span v-else class="loading size-20"></span>
                </span>
              </p>
              <p>
                <span class="key">Unavailable Balance:</span>
                <span class="value">
                  <span class="price" v-if="!accountBalanceLoading">{{
                      (processingBalance / Math.pow(10, token.decimal))
                    }}</span>
                  <span v-else class="loading size-20"></span>
                </span>
              </p>
            </div>
            <div v-else-if="radio === 1">
              <p>Your assets:</p>
              <p>
                <template v-if="this.balance">
                  <span class="key">{{ token.symbol }}:</span>
                  <span class="value">
                  <span class="price">{{ balance / Math.pow(10, token.decimal) }}</span>
                </span>
                </template>
                <span v-else class="loading size-20"></span>
              </p>
            </div>
            <div v-else>
              <div>
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
import Uniswap from '@/components/react/Uniswap.vue';
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
      dataLoading: false,
      balance: 0,
      amountLoading: false,
      amount: 0,
      accountBalanceLoading: false,
      accountBalance: 0,
      processingBalance: 0,
      payLoading: false,
      subLoading: false,
      price: 0,
      token: {
        decimal: 3,
        name: '',
        symbol: '',
        address: config.favorTokenAddress
      },
      favorTubeCAddress: config.favorTubeAddress,
      favorTubeContract: null,
      tokenContract: null,
      chainInfo: config,
      radioList: ['balance', 'token', 'uniswap'],
      radio: 2,
      checkTimer: null,
      subBlockNumber: 0,
      uniswapData: {
        disable: true,
        approved: false,
        inputAmount: 0,
        inputAddress: '',
        outputAmount: 0,
        isNative: false,
      },
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
    uniConfig() {
      return {
        chainId: config.chainId,
        favorTubeAddress: config.favorTubeAddress,
        favorTokenAddress: this.token.address,
        decimal: this.token.decimal,
        name: this.token.name,
        symbol: this.token.symbol
      }
    },
    checkPayDisable() {
      return this.dataLoading || (this.radio === 1 ?
          this.balance < this.price : this.radio === 0 ?
              this.accountBalance < this.price : this.uniswapData.disable || !this.uniswapData.approved)
    },
  },
  async created() {
    try {
      this.dataLoading = true;
      this.checkTimer = setTimeout(() => {
        this.$store.dispatch("showTips", {
          type: "info",
          text: "Chain query failure"
        })
        this.closeModal();
      }, 1000 * 15)
      await this.getAmount();
      const favorTubeContract = new this.nodeWeb3.eth.Contract(favorTubeAbi, this.favorTubeCAddress);
      const tokenContract = new this.nodeWeb3.eth.Contract(tokenAbi, this.token.address);
      this.price = (await favorTubeContract.methods.getUserConfig(this.video.userId.address).call()).price;
      await this.getAccountBalance();
      this.token.decimal = Number(await tokenContract.methods.decimals().call());
      this.token.name = await tokenContract.methods.name().call();
      this.token.symbol = await tokenContract.methods.symbol().call();
      this.balance = await tokenContract.methods.balanceOf(this.currentUser.address).call();
      (this.balance >= this.price && this.accountBalance < this.price) ? this.selectDefaultPay(1) : '';
      this.subBlockNumber = await favorTubeContract.methods.subscribeBlock().call();
      clearTimeout(this.checkTimer);
      this.favorTubeContract = favorTubeContract;
      this.tokenContract = tokenContract;
      this.dataLoading = false;
    } catch (e) {
      clearTimeout(this.checkTimer);
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
      clearInterval(this.checkTimer)
      this.$emit('closeJoinModal');
    },
    selectDefaultPay(radio) {
      this.radio = radio;
    },
    async getAmount() {
      this.amountLoading = true;
      const amount = await this.nodeWeb3.eth.getBalance(this.currentUser.address);
      this.amount = Number(this.nodeWeb3.utils.fromWei(amount, "ether")).toFixed(5);
      this.amountLoading = false;
    },
    uniPriceUpdate(trade) {
      this.uniswapData.inputAmount = trade.inputAmount.numerator.toString();
      this.uniswapData.outputAmount = trade.outputAmount.numerator.toString();
      this.uniswapData.isNative = trade.inputAmount.currency.isNative;
      this.uniswapData.inputAddress = trade.inputAmount.currency.address || trade.inputAmount.currency.wrapped.address;
    },
    uniDisableUpdate(disable, approved) {
      this.uniswapData.disable = disable;
      this.uniswapData.approved = approved;
    },
    async getAccountBalance() {
      this.accountBalanceLoading = true;
      const {data} = await AccountService.getInfo();
      if (data.data) {
        this.accountBalance = data.data.amount - data.data.processing;
        this.processingBalance = data.data.processing;
        this.accountBalance >= this.price && this.selectDefaultPay(0);
      }
      this.accountBalanceLoading = false;
    },
    async pay() {
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

      switch (this.radio) {
        case 0:
          await this.balancePay(sharerId);
          break;
        case 1:
          await this.tokenPay(sharer, sharerId);
          break;
        case 2:
          await this.uniswapPay(sharer, sharerId);
          break;
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
        this.addSublist({sharerId, tx, price: this.price}, true);
      })
    },
    async balancePay(sharerId) {
      const message = `Subscribe to Channel : ${this.currentUser.address} (Price: ${this.price})`;
      const signature = await this.web3.eth.personal.sign(message, this.currentUser.address)
          .catch(err => {
            this.$store.dispatch("showTips", {
              type: "error", text: err.message || err
            })
            this.subLoading = false;
            this.payLoading = false;
          })
      if (!signature) return;

      await this.addSublist({
        sharerId,
        channelAddress: this.video.userId.address,
        signature,
      })
    },
    async uniswapPay(sharer, sharerId) {
      const {inputAddress, inputAmount, outputAmount, isNative} = this.uniswapData;
      const tokenIn = inputAddress;
      const fee = 500;
      const amountInMaximum = inputAmount;
      const value = isNative ? amountInMaximum : 0;
      const amountOut = outputAmount;
      const data = this.web3.eth.abi.encodeParameters(['address', 'address', 'address'], [this.video.userId.address, this.currentUser.address, sharer])
      const price = await this.web3.eth.getGasPrice();
      this.web3.eth.sendTransaction({
        from: this.currentUser.address,
        to: this.favorTubeCAddress,
        value,
        gasPrice: this.web3.utils.toHex(price),
        data: this.favorTubeContract.methods.swapToken(
            tokenIn,
            fee,
            amountInMaximum,
            amountOut,
            data
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
        this.addSublist({sharerId, tx, price: this.price}, true);
      })
    },
    async addSublist(info, next = false) {
      try {
        const {data} = await SubListService.addSublist({
          channelId: this.video.userId._id,
          ...info,
        })
        if (data.data) {
          this.$emit("changeTransactionInfo", data.data);
        }
      } catch (e) {
        if (!next) {
          return await this.$store.dispatch("showTips", {
            type: "error",
            text: e.message || e
          });
        }
        setTimeout(() => {
          this.addSublist(info);
        }, 500)
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
      background: rgb(220, 220, 220);
      border-radius: 4px;
      margin-top: 10px;
      margin-left: -5px;
      min-width: 290px;

      .left,
      .right {
        padding: 10px 10px 0 10px;
        min-height: 200px;
        border-radius: 4px;
        background: rgb(245, 245, 245);
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

          ::v-deep .uniswap {
            width: 100%;
            max-width: 400px;
            min-width: 260px;
            margin-left: -5px;
            background-color: transparent;

            .Row-sc-1nzvhrh-0.ActionButton__Overlay-sc-xgl46p-2.cHGfZQ.jHTrMM {
              justify-content: center;
              flex-direction: column-reverse;
              padding: 10px;

              >button {
                flex-grow: 1;
                margin-top: 5px;
                padding: 5px 0;
              }

              >div {
                justify-content: center;
              }
            }
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
