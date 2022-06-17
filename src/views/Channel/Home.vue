<template>
  <div id="channel-home">
    <v-parallax
        height="230"
        :src="require('@/assets/material.jpg')"
    ></v-parallax>
    <div class="nav-bgcolor">
      <div id="channel-header">
        <v-container class="py-0">
          <v-row class="justify-space-between">
            <v-col cols="12" sm="5" md="5" lg="5" offset-md="1">
              <v-skeleton-loader
                  type="list-item-avatar-two-line"
                  :loading="loading"
                  class="mr-1"
              >
                <v-card class="transparent" flat>
                  <v-list-item three-line>
                    <v-list-item-avatar size="80">
                      <v-img
                          v-if="channel.photoUrl !== 'no-photo.jpg'"
                          :src="`${url}/uploads/avatars/${channel.photoUrl}`"
                      ></v-img>

                      <v-avatar v-else color="red" size="60">
                        <span class="white--text headline ">
                          {{
                            channel.channelName.split('')[0].toUpperCase()
                          }}</span
                        >
                      </v-avatar>
                    </v-list-item-avatar>
                    <v-list-item-content class="align-self-auto">
                      <v-list-item-title class="headline mb-1">{{
                          channel.channelName
                        }}
                      </v-list-item-title>
                      <v-list-item-subtitle
                      >{{ channel.subscribers }} subscribers
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-card>
              </v-skeleton-loader>
            </v-col>
            <!--            <v-col cols="12" sm="5" md="3" lg="3" v-if="!loading">-->
            <!--              <v-btn-->
            <!--                  v-if="currentUser && channel._id !== currentUser._id"-->
            <!--                  :class="[-->
            <!--                  { 'red white&#45;&#45;text': !subscribed },-->
            <!--                  { 'grey grey&#45;&#45;text lighten-3 text&#45;&#45;darken-3': subscribed },-->
            <!--                  'mt-6'-->
            <!--                ]"-->
            <!--                  tile-->
            <!--                  large-->
            <!--                  depressed-->
            <!--                  :loading="subscribeLoading"-->
            <!--                  @click="subscribe"-->
            <!--              >{{ !subscribed ? 'subscribe' : 'subscribed' }}-->
            <!--              </v-btn-->
            <!--              >-->
            <!--              -->
            <!--              <v-btn-->
            <!--                  v-else-if="showSubBtn"-->
            <!--                  :class="[-->
            <!--                  { 'red white&#45;&#45;text': !subscribed },-->
            <!--                  { 'grey grey&#45;&#45;text lighten-3 text&#45;&#45;darken-3': subscribed },-->
            <!--                  'mt-6'-->
            <!--                ]"-->
            <!--                  tile-->
            <!--                  large-->
            <!--                  depressed-->
            <!--                  :loading="subscribeLoading"-->
            <!--                  @click="subscribe"-->
            <!--              >{{ !subscribed ? 'subscribe' : 'subscribed' }}-->
            <!--              </v-btn-->
            <!--              >-->
            <!--              -->
            <!--            </v-col>-->
          </v-row>
        </v-container>
      </div>
      <v-card flat class="transparent">
        <v-tabs
            v-model="tab"
            background-color="transparent"
            show-arrows
            centered
            center-active
        >
          <v-tab v-for="(item, i) in items" :key="i">
            {{ item }}
          </v-tab>
        </v-tabs>

        <v-container fluid>
          <v-tabs-items v-model="tab" class="transparent">
            <!--            <v-tab-item>-->
            <!--              <v-card class="transparent" flat>-->
            <!--                <v-card-title>Uploads</v-card-title>-->
            <!--                &lt;!&ndash; <v-sheet class="mx-auto"> &ndash;&gt;-->
            <!--                <v-slide-group class="pa-4" multiple show-arrows>-->
            <!--                  <v-slide-item-->
            <!--                      v-for="(video, i) in loading ? 5 : videos"-->
            <!--                      :key="i"-->
            <!--                  >-->
            <!--                    <v-skeleton-loader-->
            <!--                        type="card-avatar"-->
            <!--                        :loading="loading"-->
            <!--                        width="250px"-->
            <!--                        class="mr-1"-->
            <!--                    >-->
            <!--                      <video-card-->
            <!--                          :card="{ maxWidth: 250, type: 'noAvatar' }"-->
            <!--                          :video="video"-->
            <!--                          :index="i"-->
            <!--                          :channel="video.userId"-->
            <!--                      ></video-card>-->
            <!--                    </v-skeleton-loader>-->
            <!--                  </v-slide-item>-->
            <!--                </v-slide-group>-->
            <!--              </v-card>-->
            <!--            </v-tab-item>-->
            <v-tab-item :key="$route.params.id">
              <v-card class="transparent" flat>
                <v-card-title>Videos</v-card-title>
                <v-row>
                  <v-col
                      cols="12"
                      sm="6"
                      md="4"
                      lg="3"
                      v-for="(video, i) in loading ? 10 : videos"
                      :key="i"
                      class="mx-xs-auto"
                  >
                    <v-skeleton-loader type="card-avatar" :loading="loading">
                      <video-card
                          :card="{ maxWidth: 350 }"
                          :video="video"
                          :index="i"
                          :channel="video.userId"
                      ></video-card>
                    </v-skeleton-loader>
                  </v-col>
                  <v-col cols="12" sm="12" md="12" lg="12">
                    <infinite-loading v-if="showInfinite" @infinite="getVideos">
                      <div slot="spinner">
                        <v-progress-circular
                            indeterminate
                            color="red"
                        ></v-progress-circular>
                      </div>
                      <div slot="no-results"></div>
                      <span slot="no-more"></span>
                      <div slot="error" slot-scope="{ trigger }">
                        <v-alert prominent type="error">
                          <v-row align="center">
                            <v-col class="grow">
                              <div class="title">Error!</div>
                              <div>
                                Something went wrong, but don’t fret — let’s give it
                                another shot.
                              </div>
                            </v-col>
                            <v-col class="shrink">
                              <v-btn @click="trigger">Take action</v-btn>
                            </v-col>
                          </v-row>
                        </v-alert>
                      </div>
                    </infinite-loading>
                  </v-col>
                </v-row>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-container>
      </v-card>
    </div>
    <signin-modal
        :openModal="signinDialog"
        :details="details"
        @closeModal="signinDialog = false"
    />
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import InfiniteLoading from 'vue-infinite-loading'
import UserService from '@/services/UserService'
import VideoService from '@/services/VideoService'
import SubscriptionService from '@/services/SubscriptionService'

import VideoCard from '@/components/VideoCard'
import SigninModal from '@/components/SigninModal'

export default {
  data: () => ({
    tab: null,
    loading: false,
    loaded: false,
    errored: false,
    subscribed: false,
    subscribeLoading: false,
    showSubBtn: true,
    showInfinite: true,
    items: [
      // 'Home',
      'Videos',
      // 'Playlists',
      // 'Community',
      // 'Channels',
      // 'about'
    ],
    videos: [],
    channel: {},
    signinDialog: false,
    details: {},
    page: 1,
  }),
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser', "getImgUrl"]),
    url() {
      return this.getImgUrl;
    }
  },
  components: {
    VideoCard,
    SigninModal,
    InfiniteLoading
  },
  methods: {
    async getChannel(id) {
      // console.log(this.$route.params.id)
      this.loading = true
      this.errored = false

      const channel = await UserService.getById(id)
          .catch((err) => {
            this.errored = true
            console.log(err)
            this.$router.push('/')
          })
          .finally(() => (this.loading = false))

      if (!channel) return
      this.channel = channel.data.data
      // console.log(channel)
      if (this.currentUser && this.currentUser._id === this.channel._id) {
        this.showSubBtn = false
      } else {
        this.showSubBtn = true
      }
      this.getVideos()

      // this.checkSubscription(this.channel._id)
      // console.log(channel)
    },
    async getVideos($state) {
      // console.log('getVideos----------', $state);
      // this.getChannel()
      if (!this.loaded) {
        this.loading = true
      }

      const videos = await VideoService.getAll('public', {
        userId: this.channel._id,
        page: this.page
      })
          .catch((err) => {
            console.log(err)
            this.errored = true
          })
          .finally(() => (this.loading = false))

      if (typeof videos === 'undefined') return

      // console.log('videos', videos.config.params.userId, 'current',this.$route.params.id);
      if (videos.config.params.userId !== this.$route.params.id) {
        if ($state) {
          $state.loaded();
        }
        return;
      }

      // this.videos = videos.data
      if (videos.data.data.length) {
        this.page += 1;
        this.videos.push(...videos.data.data);
        if ($state) {
          $state.loaded()
        }
        // console.log('this.data', this.videos);
        this.loaded = true
      } else {
        if ($state) {
          $state.complete()
        }
      }
    },
    async checkSubscription(id) {
      if (!this.isAuthenticated) return
      this.loading = true
      const sub = await SubscriptionService.checkSubscription({channelId: id})
          .catch((err) => {
            console.log(err)
          })
          .finally(() => {
            this.loading = false
          })
      // console.log(sub.data.data)
      if (!sub) return

      if (!sub.data.data._id) this.subscribed = false
      else this.subscribed = true
    },
    async subscribe() {
      if (!this.isAuthenticated) {
        this.signinDialog = true
        this.details = {
          title: 'Want to subscribe to this channel?',
          text: 'Sign in to subscribe to this channel.'
        }
        return
      }
      this.subscribeLoading = true
      const sub = await SubscriptionService.createSubscription({
        channelId: this.channel._id
      })
          .catch((err) => console.log(err))
          .finally(() => {
            this.subscribeLoading = false
          })

      if (!sub) return

      if (!sub.data.data._id) {
        this.subscribed = false
        this.channel.subscribers--
      } else {
        this.subscribed = true
        this.channel.subscribers++
      }

      // console.log(this.subscribed)
    }
  },
  mounted() {
    this.getChannel(this.$route.params.id)
  },
  watch:{
    $route:{
      handler(newV){
        this.videos = [];
        this.page = 1;
        this.getChannel(newV.params.id)
      }
    }
  },
  // beforeRouteUpdate(to, from, next) {
  //   console.log(to)
  //   // console.log('beforeRouteUpdate');
  //   this.videos = [];
  //   this.page = 1;
  //   this.getChannel(to.params.id)
  //   // console.log('channelId', to.params.id);
  //   next()
  // },
}
</script>

<style>
.nav-bgcolor {
  background: #f9f9f9;
}

.card {
  background: #f9f9f9 !important;
}

.v-tab {
  margin-right: 4em;
}

#channel-home .v-list-item--link:before {
  background-color: transparent;
}
</style>
