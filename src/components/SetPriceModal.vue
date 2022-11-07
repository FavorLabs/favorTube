<template>
  <div>
    <div class="price_info">Set channel pricing and profit distribution.</div>
    <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        class="d-flex align-center"
    >
      <v-row no-gutters>
        <v-col cols="4">
          <v-text-field
              label="Price"
              :rules="rules"
              v-model="price"
              type="number"
              :min="1"
          ></v-text-field>
        </v-col>
        <v-col cols="8">
          <v-select
              style="margin-left: 20px"
              v-model="mode"
              label="Mode"
              :items="items"
          ></v-select>
        </v-col>
      </v-row>
    </v-form>
    <footer style="margin-top: 5px">
      <v-btn
          @click="set"
          :loading="loading"
          depressed
          block
          color="#218CFF"
          style="color: #fff"
      >
        OK→
      </v-btn>
    </footer>
  </div>
</template>

<script>
import {mapGetters} from "vuex";

import {favorTubeAbi, config, tokenAbi} from "@/config/config";

export default {
  name: "SetPrice",
  data() {
    return {
      loading: false,
      valid: true,
      price: 1,
      mode: 0,
      rules: [
        value => !!value || 'Required',
        value => Number.isInteger(value * 100) || 'Maximum two decimal places',
        value => value >= 1 || 'Price cannot be less than 1'
      ],
      items: [],
      decimals: 2
    }
  },
  computed: {
    ...mapGetters(["web3", "currentUser", "nodeWeb3"]),
  },
  async created() {
    await this.getDecimals();
    this.getUserConfig()
    this.getMode();
  },
  methods: {
    async getDecimals() {
      let contract = new this.nodeWeb3.eth.Contract(tokenAbi, config.favorTokenAddress);
      this.decimals = await contract.methods.decimals().call();
    },
    async getUserConfig() {
      const favorTubeContract = new this.nodeWeb3.eth.Contract(favorTubeAbi, config.favorTubeAddress);
      let userConfig = await favorTubeContract.methods.userConfig().call({from: this.currentUser.address});
      this.price = userConfig.price / (10 ** this.decimals);
      this.mode = userConfig.mode;
    },
    async getMode() {
      const favorTubeContract = new this.nodeWeb3.eth.Contract(favorTubeAbi, config.favorTubeAddress);
      let modeArr = await favorTubeContract.methods.getTaxRateKey().call();
      let items = [];
      for (let i = 0; i < modeArr.length; i++) {
        let item = modeArr[i];
        const rate = await favorTubeContract.methods.getTaxRate(item).call();
        items.push({
          text: `Type: ${item} | Percentage: (${rate.slice(2).join("-")})`,
          value: item
        })
      }
      this.items = items;
    },
    async set() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        const price = await this.web3.eth.getGasPrice();
        let {favorTubeAddress} = config;
        const favorTubeContract = new this.web3.eth.Contract(favorTubeAbi, favorTubeAddress);
        this.web3.eth.sendTransaction({
          from: this.currentUser.address,
          to: favorTubeAddress,
          gasPrice: this.web3.utils.toHex(price),
          data: favorTubeContract.methods.setUserConfig(this.price * (10 ** this.decimals), this.mode).encodeABI()
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
      }
    },
    async receipt(hash) {
      const data = await this.web3.eth.getTransactionReceipt(hash);
      if (data) {
        this.loading = false;
        if (data.status) {
          await this.$store.dispatch('showTips', {
            type: "success",
            text: "Setup successful"
          });
          await this.getUserConfig();
        } else {
          await this.$store.dispatch('showTips', {
            type: "info",
            text: "Setup failed"
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

.price_info {
  font-size: 12px;
  color: #3B99FD;
  margin-bottom: 5px;
}

</style>
