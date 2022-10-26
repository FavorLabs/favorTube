<template>
  <div>
    <div class="ps">
      Whether to open your Screat Channel?
    </div>
    <v-switch
        inset
        v-model="currentUser.secret"
        readonly
        @click.stop="click"
    >

    </v-switch>
    <v-dialog
        v-model="dialog"
        persistent
        transition="fab-transition"
        max-width="500"
    >
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Secret Channel
        </v-card-title>

        <v-card-text style="margin-top: 15px">
          <div>After adjusting it to a secret channel, you'll not be able to change it to a public channel.</div>
          <div>Are you sure you want to open the secret channel?</div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              text
              @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
              color="primary"
              text
              @click="set"
              :loading="loading"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import {mapGetters} from "vuex";
import AuthenticationService from "@/services/AuthenticationService";

export default {
  name: 'SecretModal',
  data: function () {
    return {
      dialog: false,
      loading: false
    }
  },
  computed: {
    ...mapGetters(["currentUser"]),
  },
  methods: {
    click() {
      if (this.currentUser.secret) {
        this.$store.dispatch("showTips", {
          type: "info",
          text: "Cannot cancel secret channel"
        })
      } else {
        this.dialog = true;
      }
    },
    async set() {
      this.loading = true;
      await AuthenticationService.updateUserSecret({secret: true});
      await this.$store.dispatch('getCurrentUser', localStorage.getItem("token"));
      this.loading = false;
      this.dialog = false;
    }
  }
}
</script>
<style scoped>
.ps {
  font-size: 12px;
  color: #3B99FD;
  margin-bottom: 5px;
}
</style>
