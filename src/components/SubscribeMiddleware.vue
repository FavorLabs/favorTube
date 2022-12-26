<template>
  <v-dialog
      v-model="dialog"
      persistent
      transition="fab-transition"
      max-width="500"
      v-if="video.userId"
  >
    <v-card tile>
      <v-card-title class="text-h5 grey lighten-2">Subscribe {{ video.userId.channelName }}</v-card-title>
      <v-card-text>
        <div class="transaction-progress">
          <div class="progress-bar"></div>
          <div :class="getCBarClass()"></div>
          <div :class="getCircleClass(index)" v-for="(item, index) in progressItems" :key="index">
            <v-icon size="30px" :class="item.state === subInfo.state ? 'state-icon current' : 'state-icon'">{{
                item.icon
              }}
            </v-icon>
            <span class="state-desc">{{ item.state }}</span>
          </div>
        </div>
        <div class="transaction-desc">
          <p class="transaction-title">Transaction Info:</p>
          <p v-if="subInfo.tx"><span class="key">tx:</span> {{ subInfo.tx }}</p>
          <p><span class="key">price:</span> {{ subInfo.price / (Math.pow(10, token.decimal)) + token.name }}</p>
          <p><span class="key">created date:</span> {{ dateFormatter(subInfo.createdAt) }}</p>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="closeModal">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {mapGetters} from 'vuex'
import moment from 'moment';
import {config, tokenAbi} from "@/config/config";

export default {
  name: "SubscribeMiddleware",
  props: {
    video: {
      type: Object
    },
    dialog: Boolean,
    subInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      token: {
        decimal: 3,
        name: '',
        symbol: '',
        address: config.favorTokenAddress
      },
      progressItems: [
        {
          state: 'Submitted',
          icon: 'mdi-arrow-up-circle'
        },
        {
          state: 'Processing',
          icon: 'mdi-arrow-right-circle'
        },
        {
          state: 'Chain',
          icon: 'mdi-check-circle'
        }
      ]
    }
  },
  async created() {
    await this.getTokenInfo();
  },
  computed: {
    ...mapGetters(['isAuthenticated', "nodeWeb3"])
  },
  methods: {
    async getTokenInfo() {
      const tokenContract = new this.nodeWeb3.eth.Contract(tokenAbi, this.token.address);
      this.token.decimal = Number(await tokenContract.methods.decimals().call());
      this.token.name = await tokenContract.methods.name().call();
      this.token.symbol = await tokenContract.methods.symbol().call();
    },
    dateFormatter(date) {
      return moment(date).format('LLL');
    },
    closeModal() {
      this.$emit('closeMiddlewareModal');
    },
    getCircleClass(index) {
      let currentIndex = 0;
      this.progressItems.forEach((item, index) => {
        if (item.state === this.subInfo.state) {
          currentIndex = index;
        } else if (this.subInfo.state === 'Confirmed') {
          currentIndex = 2;
        }
      })
      if (index <= currentIndex) {
        return 'progress-item achieved';
      } else {
        return 'progress-item';
      }
    },
    getCBarClass() {
      let className = '';
      switch (this.subInfo.state) {
        case 'Submitted':
          className = 'progress-bar-current';
          break;
        case 'Processing':
          className = 'progress-bar-current percent-50';
          break;
        case 'Chain':
          className = 'progress-bar-current percent-100';
          break;
        default:
          className = 'progress-bar-current percent-100';
          break;
      }
      return className;
    },
  }
}
</script>

<style lang="scss" scoped>
.transaction-progress {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  font-size: 12px;

  .progress-bar,
  .progress-bar-current {
    position: absolute;
    left: 0;
    right: 0;
    height: 5px;
    background-color: #999;
    z-index: 1;
  }

  .progress-bar-current {
    right: 100%;
    background-color: #90fda8;
    z-index: 2;
  }

  .progress-bar-current.percent-50 {
    right: 50%;
  }

  .progress-bar-current.percent-100 {
    right: 0%;
  }

  .progress-item {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    text-align: center;
    line-height: 45px;
    border: 7px solid #999;
    background: #fff;
    z-index: 3;

    .state-desc {
      position: absolute;
      line-height: 1rem;
      bottom: -30px;
      left: 50%;
      font-weight: bolder;
      transform: translateX(-50%);
    }
  }

  .progress-item.achieved {
    border-color: #90fda8;

    .state-icon {
      color: #90fda8;
    }

    .state-icon.current {
      animation: stateIcon 2s linear infinite;
    }

    .state-desc {
      color: #90fda8;
    }
  }
}

.transaction-desc {
  color: #4d4d4d;
  height: 100%;
  padding: 20px 10px;
  box-sizing: border-box;

  p {
    text-align: left;
    margin-bottom: 0;
  }

  .transaction-title {
    font-size: 18px;
    font-weight: bolder;
    margin-bottom: 6px;
  }

  .key {
    font-weight: bolder;
  }

  .status-desc {
    color: #ccc;
    font-size: 2rem;
    font-weight: bolder;
    margin-top: 15px;
  }
}

@keyframes stateIcon {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}
</style>