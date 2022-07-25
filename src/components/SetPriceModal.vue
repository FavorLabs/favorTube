<template>
  <v-dialog
      v-model="dialog"
      persistent
      transition="fab-transition"
      max-width="500"
  >
    <v-card tile>
      <v-card-title class="py-3">Set Channel Price</v-card-title>
      <v-card-text class="px-3">
        <v-form
            ref="form"
            v-model="valid"
            lazy-validation
        >
          <v-text-field
              label="Price"
              filled
              dense
              :rules="rules"
              hide-details="auto"
              type="number"
              v-model="price"
              min="0"
          ></v-text-field>
        </v-form>
        <footer style="margin-top: 20px">
          <v-btn @click="closeModal" style="margin-right: 20px">cancel</v-btn>
          <v-btn @click="set" :loading="loading">set</v-btn>
        </footer>
      </v-card-text>


    </v-card>
  </v-dialog>
</template>

<script>
import {mapGetters} from "vuex";

import {getContracts, favorTubeAbi} from "@/config/contract";

export default {
  name: "SetPrice",
  props: ["dialog", "n"],
  data() {
    return {
      loading: false,
      valid: true,
      price: this.n,
      rules: [
        value => !!value || 'Required',
        value => Number.isInteger(value * 100) || 'Maximum two decimal places',
        value => value !== this.n || 'No change in price',
        value => value >= 0 || 'Price cannot be less than 0'
      ],
    }
  },
  computed: {
    ...mapGetters(["web3", "currentUser"]),
  },
  methods: {
    closeModal() {
      this.$emit('closeDialog')
    },
    async set() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        console.log(this.price)
        const price = await this.web3.eth.getGasPrice();
        let {favorTubeAddress} = getContracts();
        const favorTubeContract = new this.web3.eth.Contract(favorTubeAbi, favorTubeAddress);
        this.web3.eth.sendTransaction({
          from: this.currentUser.address,
          to: favorTubeAddress,
          gasPrice: this.web3.utils.toHex(price),
          data: favorTubeContract.methods.setUserPrice(this.price * 100).encodeABI()
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
      console.log(data)
      if (data) {
        this.loading = false;
        if (data.status) {
          this.$store.dispatch('showTips', {
            type: "success",
            text: "Setup successful"
          });
          this.$emit('success');
        } else {
          this.$store.dispatch('showTips', {
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

</style>
