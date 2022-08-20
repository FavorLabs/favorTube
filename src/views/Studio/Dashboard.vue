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
              {{ userConfig.mode === "0" ? "normal" : "activity" }}
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
  </div>
</template>

<script>
import UploadVideoModal from '@/components/UploadVideoModal'
import SubscribersModal from '@/components/SubscribersModal'
import SetPriceModal from '@/components/SetPriceModal'
import SecretModal from '@/components/SecretModal'
import {mapGetters} from "vuex"
import Web3 from "web3";
import {favorTubeAbi, getContracts,} from "@/config/contract";
import AuthenticationService from "@/services/AuthenticationService";


let contractAddress = getContracts();

export default {
  data: () => ({
    loading: true,
    dialog: false,
    subscribersDialog: false,
    setPriceModal: false,
    secretModal: false,
    secretStatus: false,
    favorTubeCAddress: contractAddress.favorTubeAddress,
    userConfig: {
      price: 0,
      mode: 0
    }
  }),
  components: {
    UploadVideoModal,
    SubscribersModal,
    SetPriceModal,
    SecretModal,
  },
  computed: {
    ...mapGetters(["currentUser", "getApi"])
  },
  methods: {
    async getPrice() {
      const chainWeb3 = new Web3(this.getApi + "/chain");
      const favorTubeContract = new chainWeb3.eth.Contract(favorTubeAbi, this.favorTubeCAddress);
      this.userConfig = await favorTubeContract.methods.userConfig().call({from: this.currentUser.address});
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
    }
  },
  created() {
    this.getPrice();
    this.getMe();
  }
}
</script>

<style lang="scss">
.card {
  background: #f9f9f9 !important;
}
</style>
