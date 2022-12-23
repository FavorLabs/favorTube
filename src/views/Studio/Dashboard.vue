<template>
  <div id="dashboard">
    <v-container fluid class="dashboard">
      <v-row no-gutters>
        <v-col cols="12" md="4">
          <v-card style="padding: 20px 30px;height: 100%">
            <v-card-title style="padding: 0">
              <span class="header">
                DASHBOARD
              </span>
            </v-card-title>
            <SetPriceModal
                style="margin-top: 30px"
            />
            <SecretModal
                style="margin-top: 30px"
            />
            <v-btn
                depressed
                block
                color="#fff"
                style="color: #3B99FD;margin-top: 30px;border: 1px solid #DDEDFD;padding: 19px"
                @click="subscribersDialog=true"
            >
              Subscriber list→
            </v-btn>
            <v-btn
                depressed
                block
                color="#fff"
                style="color: #3B99FD;margin-top: 30px;border: 1px solid #DDEDFD;padding: 19px"
                @click="subscriptionHistoryDialog=true"
            >
              Subscription history list→
            </v-btn>
          </v-card>
        </v-col>
        <v-col cols="12" md="4" class="profit">
          <profit></profit>
        </v-col>
      </v-row>

    </v-container>
    <subscribers-modal
        v-if="subscribersDialog"
        :open-dialog="subscribersDialog"
        @closeDialog="subscribersDialog = false"
    />
    <subscription-history-modal
        v-if="subscriptionHistoryDialog"
        :open-dialog="subscriptionHistoryDialog"
        @closeDialog="subscriptionHistoryDialog = false"
    />
  </div>
</template>

<script>
import SubscribersModal from '@/components/SubscribersModal'
import SubscriptionHistoryModal from '@/components/SubscriptionHistoryModal'
import SetPriceModal from '@/components/SetPriceModal'
import SecretModal from '@/components/SecretModal'
import Profit from "@/components/Profit";

export default {
  data: () => ({
    subscribersDialog: false,
    subscriptionHistoryDialog: false,
  }),
  components: {
    SubscribersModal,
    SubscriptionHistoryModal,
    SetPriceModal,
    SecretModal,
    Profit,
  },
}
</script>

<style scoped lang="scss">
.box {
  padding: 20px 35px;
  //background-color: #F9F9F9;
  border: 1px solid red;
}

.header {
  font-size: 26px;
  font-family: Impact-Regular, Impact, serif;
  font-weight: 400;
  color: #1F1F1F;
  letter-spacing: 1px;
  border-bottom: 3px solid;
}

.profit {
  margin-left: 50px;
}

.dashboard {
  padding: 40px;
}

@media (max-width: 960px) {
  .profit {
    margin-left: 0;
    margin-top: 50px;
  }
  .dashboard {
    padding: 0;
  }
}

</style>
