<template>
  <div>
    <div class="price_info">Set channel pricing and profit distribution.</div>
    <v-row no-gutters>
      <v-col cols="4">
        <v-text-field
            :error="!!error"
            :hide-details="true"
            label="Price"
            v-model="price"
            type="number"
        ></v-text-field>
      </v-col>
      <v-col cols="8">
        <v-select
            :hide-details="true"
            style="margin-left: 20px"
            v-model="modeType"
            label="Mode"
            :items="items"
        ></v-select>
      </v-col>
    </v-row>
    <div class="price_error">{{ error }}</div>
    <footer style="margin-top: 5px">
      <v-btn
          :disabled="!!error"
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
      price: 0,
      minPrice: 0,
      maxPrice: 1,
      modeType: "",
      items: [],
      decimals: 3,
    }
  },
  computed: {
    ...mapGetters(["web3", "currentUser", "nodeWeb3"]),
    error() {
      if (this.price === "") {
        return "require"
      }
      const decimals = this.decimals - 2;
      if (!Number.isInteger(this.price * (10 ** decimals))) {
        return `Maximum ${decimals} decimal places`
      }
      const minPrice = this.items[this.modeType]?.minPrice || 0;
      const maxPrice = this.items[this.modeType]?.maxPrice || 1;
      if (this.price < minPrice || this.price > maxPrice) {
        return `Current model price range is between ${minPrice} and ${maxPrice}`
      }
      return "";
    }
  },
  async created() {
    await this.getDecimals();
    await this.getMode();
    await this.getUserConfig()
  },
  methods: {
    async getDecimals() {
      let contract = new this.nodeWeb3.eth.Contract(tokenAbi, config.favorTokenAddress);
      this.decimals = await contract.methods.decimals().call();
    },
    async getUserConfig() {
      const favorTubeContract = new this.nodeWeb3.eth.Contract(favorTubeAbi, config.favorTubeAddress);
      let userConfig = await favorTubeContract.methods.getUserConfig(this.currentUser.address).call();
      this.price = userConfig.price / (10 ** this.decimals);
      this.modeType = userConfig.modeType;
    },
    async getMode() {
      const favorTubeContract = new this.nodeWeb3.eth.Contract(favorTubeAbi, config.favorTubeAddress);
      let modeArr = await favorTubeContract.methods.getModesKey().call();
      let items = [];
      for (let i = 0; i < modeArr.length; i++) {
        let item = modeArr[i];
        const mode = await favorTubeContract.methods.getMode(item).call();
        items.push({
          text: `Type: ${item} | Percentage: (${mode.taxRate.slice(2).join("-")})`,
          value: item,
          maxPrice: mode.maxPrice / (10 ** this.decimals),
          minPrice: mode.minPrice / (10 ** this.decimals),
        })
      }
      this.items = items;
    },
    async set() {
      if (!this.error) {
        this.loading = true;
        const price = await this.web3.eth.getGasPrice();
        let {favorTubeAddress} = config;
        const favorTubeContract = new this.web3.eth.Contract(favorTubeAbi, favorTubeAddress);
        this.web3.eth.sendTransaction({
          from: this.currentUser.address,
          to: favorTubeAddress,
          gasPrice: this.web3.utils.toHex(price),
          data: favorTubeContract.methods.setUserConfig({
            price: this.price * (10 ** this.decimals),
            modeType: this.modeType,
          }).encodeABI()
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
  },
  watch: {
    modeType(v) {
      this.minPrice = this.items[v].minPrice;
      this.maxPrice = this.items[v].maxPrice;
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

.price_error {
  font-size: 12px;
  color: #ff5252;
  line-height: 14px;
  margin-top: 2px;
  margin-bottom: 20px;
}

</style>
