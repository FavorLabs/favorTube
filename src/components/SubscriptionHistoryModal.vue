<template>
  <v-dialog
      v-model="dialog"
      persistent
      transition="fab-transition"
      max-width="800"
  >
    <v-card tile>
      <div class="d-flex justify-space-between mb-5">
        <v-card-title class="py-3">Subscribed</v-card-title>

        <v-btn icon text @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text class="px-3">
        <v-row>
          <v-col cols="12" sm="12" md="12" lg="12" class="pt-0 px-0">
            <v-data-table
                :headers="headers"
                :items="subscribers"
                :loading="loading"
                sort-by="calories"
                class="subscription-history-table"
            >
              <template v-slot:item.price="{ item }">
                <span>{{ item.price / Math.pow(10, token.decimal) }}</span>&nbsp;
                <span style="font-weight: bold;">{{ token.symbol }}</span>
              </template>
              <template v-slot:item.tx="{ item }">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <div class="tx" v-bind="attrs" v-on="on">{{ item.tx }}</div>
                    <span
                      v-clipboard:copy="item.tx"
                      v-clipboard:success="clipboardSuccess"
                      v-clipboard:error="clipboardFailed"
                    ><v-icon size="15" class="copyTx">mdi-content-copy</v-icon></span>
                  </template>
                  <span>{{ item.tx }}</span>
                </v-tooltip>
              </template>
              <template v-slot:no-data>
                <v-btn color="primary" @click="getSubscribed">Reset</v-btn>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import SubListService from '@/services/SubListService'
import {tokenAbi, config} from "@/config/config";

export default {
  name: 'SubscriptionHistoryModal',
  props: ['openDialog'],
  data: function() {
    return {
      headers: [
        {
          text: 'Channel Name',
          align: 'start',
          value: 'channelId.channelName'
        },
        { text: 'Price', value: 'price' },
        { text: 'State', value: 'state' },
        { text: 'Date Subscribed', value: 'createdAt' },
        { text: 'Tx', value: 'tx' }
      ],
      subscribers: [],
      loading: true,
      token: {
        decimal: 3,
        symbol: '',
        address: config.favorTokenAddress
      },
    }
  },
  computed: {
    ...mapGetters(['getUrl', "nodeWeb3"]),
    dialog() {
      return this.openDialog
    }
  },
  methods: {
    async getSubscribed() {
      this.loading = true
      await this.getTokenInfo();
      const subscribers = await SubListService.getSublist()
          .catch((err) => console.log(err))
          .finally(() => {
            this.loading = false
          })

      if (!subscribers) return
      this.subscribers = subscribers.data.data.list;
    },
    async getTokenInfo() {
      const tokenContract = new this.nodeWeb3.eth.Contract(tokenAbi, this.token.address);
      this.token.decimal = Number(await tokenContract.methods.decimals().call());
      this.token.symbol = await tokenContract.methods.symbol().call();
    },
    closeModal() {
      this.$emit('closeDialog')
    },
    clipboardSuccess() {
      this.$store.dispatch('showTips', {
        type: "success",
        text: 'Copyed Successfully!'
      });
    },
    clipboardFailed() {
      this.$store.dispatch('showTips', {
        type: "error",
        text: 'Copy Failed!'
      });
    }
  },
  mounted() {
    this.getSubscribed()
  }
}
</script>

<style lang="scss" scoped>
.subscription-history-table {
  .tx {
    display: inline-block;
    width: 150px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }
  .copyTx {
    margin-left: 2px;
    cursor: pointer;
  }
}
</style>
