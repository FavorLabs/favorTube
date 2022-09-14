<template>
  <div id="dashboard" class="pa-4">
    <v-container fluid>
      <div class="d-flex justify-space-between mb-5">
        <h2>channel dashboard</h2>
        <div class="right">
          <v-tooltip bottom>
            <template v-slot:activator="{ on: tooltip }">
              <v-btn
                  @click="dialog = true"
                  class="mr-4 white"
                  icon
                  v-on="{ ...tooltip }"
              >
                <v-icon size="25" class="small">mdi-upload</v-icon>
              </v-btn
              >
            </template>
            <span>Upload video</span>
          </v-tooltip>
        </div>
      </div>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-card class="mx-auto" outlined>
            <v-card-title class="pl-5">The current price of your channel is {{ userConfig.price / 100 }}, mode is
              {{ userConfig.mode === "0" ? "normal" : "promotion" }}
            </v-card-title>

            <v-card-actions class="d-block ml-2">
              <v-btn color="blue" text @click="setPriceModal = true">
                Set Channel Config
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-card class="mx-auto fill-height" outlined
                  style="display: flex;flex-direction: column;justify-content: space-between">
            <v-card-title class="pl-5">Recent subscribers</v-card-title>

            <v-card-actions class="d-block ml-2">
              <v-btn color="blue" text @click="subscribersDialog = true">
                See all
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-card class="mx-auto fill-height" outlined
                  style="display: flex;flex-direction: column;justify-content: space-between">
            <v-card-title class="pl-5">Secret Channel</v-card-title>
            <v-card-actions class="d-block ml-2" style="height: 52px">
              <v-switch
                  style="margin-top: 0;padding: 0;display: flex;align-items: center;height: 36px"
                  color="#F44336"
                  v-model="currentUser.secret"
                  hide-details
                  @change="setSecret"
              ></v-switch>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-card class="mx-auto fill-height" outlined
                  style="display: flex;flex-direction: column;justify-content: space-between">
            <v-card-title class="pl-5">Revenue: {{ amount }}</v-card-title>

            <v-card-actions class="d-block ml-2">
              <v-btn color="blue" text @click="withdrawal" :disabled="amount==0">
                Withdrawal
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-row>

      </v-row>
    </v-container>
    <upload-video-modal
        v-if="dialog"
        :open-dialog="dialog"
        v-on:closeDialog="dialog = false"
    />
    <subscribers-modal
        v-if="subscribersDialog"
        :open-dialog="subscribersDialog"
        @closeDialog="subscribersDialog = false"
    />
    <SetPriceModal
        v-if="setPriceModal"
        :dialog="setPriceModal"
        :userConfig="userConfig"
        @closeDialog="setPriceModal = false"
        @success="setPriceSuccess"
    />
    <SecretModal
        v-if="secretModal"
        :open-dialog="secretModal"
        :secret-status="secretStatus"
        @closeDialog="canceSecret"
        @secretSetting="setSecretEffect"
    />
    <v-overlay :value="loading" style="z-index: 999" class="text-center" opacity="1">
      <v-progress-circular
          indeterminate
          size="64"
      ></v-progress-circular>
      <div style="margin-top: 20px;font-size: 20px">loading...</div>
    </v-overlay>
  </div>
</template>

<script>
import UploadVideoModal from '@/components/UploadVideoModal'
import SubscribersModal from '@/components/SubscribersModal'
import SetPriceModal from '@/components/SetPriceModal'
import SecretModal from '@/components/SecretModal'
import {mapGetters} from "vuex"
import {favorTubeAbi, getContracts,} from "@/config/contract";
import AuthenticationService from "@/services/AuthenticationService";


let contractAddress = getContracts();

export default {
  data: () => ({
    loading: false,
    dialog: false,
    subscribersDialog: false,
    setPriceModal: false,
    secretModal: false,
    secretStatus: false,
    favorTubeCAddress: contractAddress.favorTubeAddress,
    userConfig: {
      price: 0,
      mode: 0
    },
    amount: 0
  }),
  components: {
    UploadVideoModal,
    SubscribersModal,
    SetPriceModal,
    SecretModal,
  },
  computed: {
    ...mapGetters(["currentUser", "getApi", "web3","this.nodeWeb3"])
  },

  created() {
    this.getPrice();
    this.getMe();
    this.getAmount();
  },
  methods: {
    async getPrice() {
      const favorTubeContract = new this.nodeWeb3.eth.Contract(favorTubeAbi, this.favorTubeCAddress);
      this.userConfig = await favorTubeContract.methods.userConfig().call({from: this.currentUser.address});
    },
    async getAmount() {
      const favorTubeContract = new this.nodeWeb3.eth.Contract(favorTubeAbi, this.favorTubeCAddress);
      let amount = await favorTubeContract.methods.exchangeableAmount().call();
      this.amount = amount / 100;
    },
    setPriceSuccess() {
      this.setPriceModal = false;
      this.getPrice();
    },
    async setSecret(secret) {
      this.secretStatus = secret;
      this.secretModal = true;
    },
    canceSecret() {
      this.secretModal = false;
      this.getMe();
    },
    async setSecretEffect(secret) {
      await AuthenticationService.updateUserSecret({secret});
      this.secretModal = false;
      this.getMe();
    },
    getMe() {
      this.$store.dispatch('getCurrentUser', localStorage.getItem("token"));
    },
    async withdrawal() {
      this.loading = true;
      const price = await this.web3.eth.getGasPrice();
      const favorTubeContract = new this.web3.eth.Contract(favorTubeAbi, this.favorTubeAddress);
      this.web3.eth.sendTransaction({
        from: this.currentUser.address,
        to: this.favorTubeAddress,
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

<style lang="scss">
.card {
  background: #f9f9f9 !important;
}
</style>
