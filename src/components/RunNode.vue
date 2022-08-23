<template>
  <v-col cols="11" md="4" class="container">
    <div v-for="(item,index) in items" :key="item.networkId">
      <v-btn class="v-picker--full-width" @click="()=>run(item.networkId)" :class="{'mt-5':index!==0}">{{
          item.name
        }}
      </v-btn>
    </div>
    <v-overlay :value="this.items.length === 0" class="flex justify-center align-center" opacity="1">
      <v-progress-circular
          indeterminate
          size="64"
      ></v-progress-circular>
    </v-overlay>
  </v-col>
</template>

<script>
import FavorlabsService from "@/services/favorlabs/FavorlabsService";

import {ipc} from "@/utils/util";

let ipcRenderer = ipc();

export default {
  name: "RunNode",
  data: () => {
    return {
      items: []
    }
  },
  created() {
    FavorlabsService.getList().then(({data}) => {
      this.items = data;
    }).catch(() => {
      this.items = [
        {"name": "polygon-mainnet", "networkId": 18},
        {"name": "polygon-testnet", "networkId": 19},
        {"name": "metis-andromeda-mainnet", "networkId": 20},
        {"name": "okc", "networkId": 21}]
    })

  },
  methods: {
    run(networkId) {
      FavorlabsService.getConfig(networkId).then(({data}) => {
        this.start({...data.data, networkId});
      }).catch(() => {
        this.start();
      });
    },
    start(data) {
      ipcRenderer.send("start", data);
    },
  }
}
</script>

<style scoped>
.container {
  padding: 50px;
  border: 1px solid #ccc;
}
</style>
