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
          <span class="key">Current block height:</span>&nbsp;&nbsp;
          <span v-if="currentBlock" class="value">{{currentBlock}}</span>
          <span v-else class="loading size-20"></span>
        </div>
        <div>
          <span class="key">Expire block height:</span>&nbsp;&nbsp;<span class="value">{{
            expire
          }}</span>
        </div>
        <div>
          <span class="key">Remain:</span>&nbsp;&nbsp;
          <span v-if="currentBlock" class="value">{{ expireTime }}</span>
          <span v-else class="loading size-20"></span>
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
import moment from 'moment'
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
      if (this.currentBlock > this.expire) return '0days 0h0m0s';
      let block = (this.expire - this.currentBlock) * time
      let d = moment.duration(block, 'seconds');
      return Math.floor(d.asDays()) + 'days ' + d.hours() + 'h' + d.minutes() + 'm' + d.seconds() + 's';
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

<style scoped lang="scss">
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
</style>
