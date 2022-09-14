<template>
  <v-dialog
      v-model="dialog"
      persistent
      transition="fab-transition"
      max-width="500"
      v-if="video.userId"
  >
    <v-card tile>
      <v-card-title class="py-3">Subscribed "{{ video.userId.channelName }}" Info:</v-card-title>
      <v-card-text>
        <div>
          <span class="key">Current block height:</span>&nbsp;&nbsp;<span class="value">{{
            currentBlock
          }}</span>
        </div>
        <div>
          <span class="key">Expire block height:</span>&nbsp;&nbsp;<span class="value">{{
            expire
          }}</span>
        </div>
        <div>
          <span class="key">Remain:</span>&nbsp;&nbsp;<span class="value">{{ expireTime }} Days </span>
        </div>
      </v-card-text>
      <v-card-text class="px-3 text-right">
        <footer>
          <v-btn @click="close" style="margin-right: 20px">Confirm</v-btn>
        </footer>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "SubscribedTime",
  props: {
    video: {
      type: Object
    },
    dialog: Boolean,
    expire: Number,
  },
  data() {
    return {
      currentBlock: 0,
    }
  },
  computed: {
    ...mapGetters(["nodeWeb3"]),
    expireTime() {
      let timeObj = {
        18: 2,
        19: 5,
        20: 7,
        21: 4
      }
      const networkId = sessionStorage.getItem('network_id');
      let time = timeObj[networkId];
      let block = (this.expire - this.currentBlock) * time
      return Math.ceil(block / (60 * 60 * 24))
    }
  },
  async created() {
     this.currentBlock = await this.nodeWeb3.eth.getBlockNumber();
  },
  methods:{
    close(){
      this.$emit('closeSTModal');
    }
  }
}
</script>

<style scoped>

</style>
