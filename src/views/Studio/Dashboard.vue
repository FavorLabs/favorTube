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
            <v-card-title class="pl-5">The current price of your channel is {{ price }}</v-card-title>

            <v-card-actions class="d-block ml-2">
              <v-btn color="blue" text @click="setPriceModal = true">
                Set Channel Price
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
        :n="price"
        @closeDialog="setPriceModal = false"
        @success="setPriceSuccess"
    />
  </div>
</template>

<script>
import UploadVideoModal from '@/components/UploadVideoModal'
import SubscribersModal from '@/components/SubscribersModal'
import SetPriceModal from '@/components/SetPriceModal'
import {mapGetters} from "vuex"
import Web3 from "web3";
import {favorTubeAbi, getContracts,} from "@/config/contract";

let contractAddress = getContracts();

export default {
  data: () => ({
    loading: true,
    dialog: false,
    subscribersDialog: false,
    setPriceModal: false,
    favorTubeCAddress: contractAddress.favorTubeAddress,
    price: 0
  }),
  components: {
    UploadVideoModal,
    SubscribersModal,
    SetPriceModal
  },
  computed: {
    ...mapGetters(["currentUser", "getApi"])
  },
  methods: {
    async getPrice() {
      const chainWeb3 = new Web3(this.getApi + "/chain");
      const favorTubeContract = new chainWeb3.eth.Contract(favorTubeAbi, this.favorTubeCAddress);
      const price = await favorTubeContract.methods.defaultPrice().call({from: this.currentUser.address});
      this.price = price / 100;
    },
    setPriceSuccess() {
      this.setPriceModal = false;
      this.getPrice();
    }
  },
  created() {
    this.getPrice();
  }
}
</script>

<style lang="scss">
.card {
  background: #f9f9f9 !important;
}
</style>
