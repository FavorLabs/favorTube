<template>
  <v-card style="padding: 20px 30px;height: 100%">
    <v-card-title style="padding: 0">
      <span class="header">
        PROFIT
      </span>
    </v-card-title>
    <div style="margin-top: 40px">
      <div class="key">Total:</div>
      <div class="value">{{ total }}</div>
    </div>
    <div style="margin-top: 20px">
      <div class="key">Withdrawable amount:</div>
      <div class="value">{{ amount }}</div>
    </div>
    <div style="margin-top: 20px">
      <div class="key">Subscription Benefits:</div>
      <div class="value">{{ subscriptionBenefits }}</div>
    </div>
    <div style="margin-top: 20px">
      <div class="key">Sharer Benefits:</div>
      <div class="value">{{ sharerBenefits }}</div>
    </div>
    <div style="margin-top: 20px">
      <div class="key">Subscription Expenses:</div>
      <div class="value">{{ subscriptionExpenses }}</div>
    </div>
    <div style="margin-top: 20px">
      <div class="key">Rebate:</div>
      <div class="value">{{ rebate }}</div>
    </div>
    <v-btn
        :loading="loading"
        depressed
        block
        color="#fff"
        style="color: #3B99FD;margin-top: 30px;border: 1px solid #DDEDFD;padding: 19px"
        @click="withdrawal"
        :disabled="amount <= 0"
    >
      Withdrawal→
    </v-btn>
  </v-card>
</template>

<script>
import {config, favorTubeAbi, tokenAbi} from "@/config/config";
import {mapGetters} from "vuex";
import RevenueService from "@/services/Revenue";

export default {
  name: "Profit",
  data() {
    return {
      loading:false,
      amount: 0,
      total: 0,
      decimals: 2,
      subscriptionBenefits: 0,
      rebate: 0,
      subscriptionExpenses: 0,
      sharerBenefits: 0
    }
  },
  computed: {
    ...mapGetters(["nodeWeb3", "web3", "currentUser"]),
  },
  async created() {
    await this.getDecimals();
    this.getAmount();
    this.getSubscriptionRevenue();
  },
  methods: {
    async getDecimals() {
      let contract = new this.nodeWeb3.eth.Contract(tokenAbi, config.favorTokenAddress);
      this.decimals = await contract.methods.decimals().call();
    },
    async getAmount() {
      const favorTubeContract = new this.nodeWeb3.eth.Contract(favorTubeAbi, config.favorTubeAddress);
      let amount = await favorTubeContract.methods.exchangeableAmount().call({from: this.currentUser.address});
      this.amount = amount / (10 ** this.decimals);
      let total = await favorTubeContract.methods.lockTotal(this.currentUser.address).call();
      this.total = total / (10 ** this.decimals);
    },
    async getSubscriptionRevenue() {
      const {data} = await RevenueService.getInfo();
      let info = data.data;
      this.subscriptionBenefits = info.subscriptionBenefits / (10 ** this.decimals);
      this.subscriptionExpenses = info.subscriptionExpenses / (10 ** this.decimals);
      this.sharerBenefits = info.sharerBenefits / (10 ** this.decimals);
      this.rebate = info.rebate / (10 ** this.decimals);
    },
    async withdrawal() {
      this.loading = true;
      const price = await this.web3.eth.getGasPrice();
      const favorTubeContract = new this.web3.eth.Contract(favorTubeAbi, config.favorTubeAddress);
      this.web3.eth.sendTransaction({
        from: this.currentUser.address,
        to: config.favorTubeAddress,
        gasPrice: this.web3.utils.toHex(price),
        data: favorTubeContract.methods.exchange().encodeABI()
      }, (error, hash) => {
        if (error) {
          this.$store.dispatch('showTips', {
            type: "error",
            text: error.message
          });
          this.loading = false;
        } else {
          this.receipt(hash);
        }
      })
    },
    async receipt(hash) {
      const data = await this.web3.eth.getTransactionReceipt(hash);
      if (data) {
        this.loading = false;
        if (data.status) {
          await this.getAmount();
        } else {
          this.$store.dispatch('showTips', {
            type: "info",
            text: "Transaction failure"
          });
        }
      } else {
        setTimeout(() => {
          this.receipt(hash);
        }, 1000)
      }
    }
  }
}
</script>

<style scoped>

.header {
  font-size: 26px;
  line-height: 26px;
  font-family: Impact-Regular, Impact, serif;
  font-weight: 400;
  color: #1F1F1F;
  letter-spacing: 1px;
  border-bottom: 3px solid;
}

.key {
  font-size: 20px;
  line-height: 22px;
  font-family: Roboto-Regular, Roboto, serif;
  font-weight: 600;
  color: #3B99FD;
  border-bottom: 1px dashed #DDEDFD;
  margin-bottom: 15px;
}

.value {
  /*padding-left: 5px;*/
  font-size: 14px;
  line-height: 18px;
  font-family: Roboto-Regular, Roboto, serif;
  font-weight: 400;
  color: #1F1F1F;
  border-bottom: 1px solid #DDEDFD;
}
</style>
