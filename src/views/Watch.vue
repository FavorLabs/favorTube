<template>
  <div id="watch" ref="watch">
    <v-container fluid>
      <v-row>
        <v-alert prominent class="mx-auto" type="error" v-if="errored">
          <v-row align="center">
            <v-col class="grow">
              <div class="title">Error!</div>
              <div>
                Something went wrong, but don’t fret — let’s give it another
                shot.
              </div>
            </v-col>
            <v-col class="shrink">
              <v-btn @click="actions">Take action</v-btn>
            </v-col>
          </v-row>
        </v-alert>
        <v-col v-else cols="11" class="mx-auto">
          <v-row>
            <v-col cols="12" sm="12" md="8" lg="8">
              <v-skeleton-loader
                  type="card-avatar, article, actions"
                  :loading="videoLoading"
                  tile
                  large
              >
                <div ref="hello">
                  <v-responsive max-height="450" style="position: relative">
                    <video
                        ref="videoPlayer"
                        controls
                        autoplay
                        style="height: 100%; width: 100%"
                        webkit-playsinline
                        playsinline
                        v-if="playable"
                    >
                      <source
                          :src="videoURL"
                          type="video/mp4"
                      />
                    </video>
                    <div v-else class="content-bg" style="min-height: 160px;">
                      <div style="position: absolute;z-index: 1;left: 50%;top:50%;transform: translate(-50%,-50%);"
                           id="subscribe-tips">
                        <!-- <img :src="require('@/assets/noPlay.svg')" alt="no-play" width="100px">-->
                        <v-btn color="#F44336" style="color:#fff;" @click="clickSubBtn">To watch the videos, please pay
                          to join first
                        </v-btn>
                      </div>
                      <v-img
                          v-if="video.thumbnailUrl !== 'no-photo.jpg'"
                          :src="`${getImgUrl}/uploads/thumbnails/${video.thumbnailUrl}`"
                      />
                      <div v-else
                           style="width:100%;height:450px;background-color: #000;color:#fff;text-align:center;line-height:450px">
                        No Thumbnail
                      </div>
                    </div>
                    <v-btn v-if="retryStatus" :class="`retry-btn ${video.registered ? 'red white--text' : 'grey-bgc'}`"
                           @click="retry">Please try again
                    </v-btn>
                  </v-responsive>

                  <v-card flat tile class="card">
                    <v-card-title class="pl-0 pb-0">{{
                        video.title
                      }}
                    </v-card-title>
                    <div
                        class="d-flex flex-wrap justify-space-between"
                        id="btns"
                    >
                      <v-card-subtitle
                          class="pl-0 pt-0 pb-0 subtitle-1"
                          style="line-height: 2.4em;"
                      >
                        {{ video.views }} views
                        <v-icon>mdi-circle-small
                        </v-icon
                        >
                        {{ dateFormatter(video.createdAt) }}
                      </v-card-subtitle>
                      <v-card-actions class="pt-0 pl-0 actions-btns">
                        <v-icon v-if="videoHash"
                                style="cursor: pointer;margin:4px 20px 0 0;font-size:1.6rem;"
                                :class="video.registered ? 'black-font' : ''"
                                @click="sourceInfo">mdi-information
                        </v-icon>
                        <v-btn text @click="createFeeling('like')"
                        >
                          <v-icon
                              :class="
                              `pr-2${
                                feeling !== 'like'
                                  ? ' grey--text text--darken-1'
                                  : ''
                              }`
                            "
                          >mdi-thumb-up
                          </v-icon
                          >
                          {{ video.likes }}
                        </v-btn
                        >

                        <v-btn id="dislike-btn" text @click="createFeeling('dislike')"
                        >
                          <v-icon
                              :class="
                              `pr-2${
                                feeling !== 'dislike'
                                  ? ' grey--text text--darken-1'
                                  : ''
                              }`
                            "
                          >mdi-thumb-down
                          </v-icon
                          >
                          {{ video.dislikes }}
                        </v-btn>
                        <Share :text="video.id"></Share>
                        <!--                        <a style="text-decoration: none" :href="`${getApi}/file/${video.url}`" download-->
                        <!--                           v-if="subscribed">-->
                        <!--                          <v-btn-->
                        <!--                              text-->
                        <!--                              class="grey&#45;&#45;text text&#45;&#45;darken-1"-->
                        <!--                          >-->
                        <!--                            <v-icon>mdi-download</v-icon>-->
                        <!--                            Download-->
                        <!--                          </v-btn>-->
                        <!--                        </a>-->
                        <!-- <v-btn text class="grey--text text--darken-1"
                          ><v-icon>mdi-share</v-icon> Share</v-btn
                        >
                        <v-btn text class="grey--text text--darken-1"
                          ><v-icon>mdi-playlist-plus</v-icon> Save</v-btn
                        > -->
                      </v-card-actions>
                    </div>
                  </v-card>

                  <v-row class="justify-space-between">
                    <v-col cols="12" sm="6" md="5" lg="5">
                      <v-card class="transparent" flat>
                        <v-list-item three-line>
                          <v-list-item-avatar
                              style="cursor: pointer;"
                              @click.stop="$router.push(`/channels/${video.userId._id}`)"
                              v-if="typeof video.userId !== 'undefined'"
                              size="50"
                          >
                            <img
                                v-if="video.userId.photoUrl !== 'no-photo.jpg'"
                                :src="
                                `${getImgUrl}/uploads/avatars/${video.userId.photoUrl}`
                              "
                                :alt="`${video.userId.channelName} avatar`"
                            />
                            <v-avatar v-else color="red">
                              <span class="white--text headline ">
                                {{
                                  video.userId.channelName
                                      .split('')[0]
                                      .toUpperCase()
                                }}</span
                              >
                            </v-avatar>
                          </v-list-item-avatar>
                          <v-list-item-content
                              v-if="video.userId"
                              class="align-self-auto"
                          >
                            <v-list-item-title
                                class="font-weight-medium mb-1"
                            >{{ video.userId.channelName }}
                            </v-list-item-title
                            >
                            <v-list-item-subtitle
                            >{{ video.userId.subscribers }} favorites
                            </v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                      </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="6" lg="6" class="d-flex justify-end align-center fill-height">
                      <!--                      <div style="align-self: end;margin-right: 20px;color:#F44336" v-if="! subscribed">-->
                      <!--                        To watch the videos, please pay to subscribe first-->
                      <!--                      </div>-->
                      <div
                          class="d-flex justify-end align-center"
                          v-if="typeof video.userId !== 'undefined'"
                      >
                        <v-btn
                            :disabled="isMember"
                            :loading="subscribeLoading"
                            :class="[
                            subscribed ? 'grey grey--text lighten-3 text--darken-3':'red white--text',
                            'mt-6'
                          ]"
                            tile
                            large
                            depressed
                            @click="subscribeBefore"
                        >
                          {{ !subscribed ? 'bookmark' : 'bookmarked' }}
                        </v-btn
                        >
                        <v-btn
                            :disabled="video.userId.id == currentUser.id"
                            :class="[
                            isMember ? 'grey grey--text lighten-3 text--darken-3':'red white--text' ,
                            'mt-6',
                            'ml-2'
                          ]"
                            tile
                            large
                            depressed
                            @click="clickSubBtn"
                        >
                          {{ isMember ? 'subscribed' : 'subscribe' }}
                        </v-btn
                        >
                      </div>
                    </v-col>
                    <v-col class="pl-11" offset="1" cols="11" md="11">
                      <p>
                        {{
                          truncate
                              ? truncateText(video.description, 150)
                              : video.description
                        }}
                      </p>
                      <v-btn text @click="show" class="remove-hover-bg"
                      >Show More
                      </v-btn
                      >
                    </v-col>
                  </v-row>
                </div>
              </v-skeleton-loader>

              <v-row>
                <v-col v-if="video && video.status && playable">
                  <p class="mb-0">{{ video.comments }} Comments</p>

                  <AddComment
                      @videoCommentLength="video.comments++"
                      :videoId="video._id"
                      @showSigninDialog="showSigninDialog"
                  />
                  <CommentList
                      @videoCommentLength="video.comments--"
                      :videoId="video._id"
                  />
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" sm="12" md="4" lg="4">
              <hr class="grey--text"/>
              <h4 class="mb-3 mt-3">Up next</h4>
              <div
                  v-for="(video, i) in loading ? pageSize : videos"
                  :key="i"
                  class="mb-5"
              >
                <!-- <p>{{video}}</p> -->
                <v-skeleton-loader
                    class="mx-auto"
                    type="list-item-avatar-three-line"
                    :loading="loading"
                    tile
                    large
                >
                  <v-card
                      class="card"
                      tile
                      flat
                      v-if="!loading"
                      @click="watchSideBarVideo(i, video._id)"
                  >
                    <!-- :to="`/watch/${video._id}`" -->
                    <v-row no-gutters>
                      <v-col class="mx-auto" cols="12" sm="12" md="5" lg="5">
                        <!-- <v-responsive max-height="100%"> -->
                        <v-img
                            class="align-center up-next-img"
                            height="110"
                            :src="
                            `${getImgUrl}/uploads/thumbnails/${video.thumbnailUrl}`
                          "
                        >
                        </v-img>
                        <!-- </v-responsive> -->
                      </v-col>
                      <v-col>
                        <div class="ml-2">
                          <v-card-title
                              class="pl-2 pt-0 subtitle-1 font-weight-bold video-title-format"
                              style="line-height: 1.2rem"
                          >
                            {{ video.title }}
                          </v-card-title>

                          <v-card-subtitle
                              class="pl-2 pt-2 pb-0"
                              style="line-height: 1"
                          >
                            {{ video.userId.channelName }}<br/>
                            {{ video.views }} views
                            <v-icon
                            >mdi-circle-small
                            </v-icon
                            >
                            {{ dateFormatter(video.createdAt) }}
                          </v-card-subtitle>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-skeleton-loader>
              </div>
              <!-- <v-col cols="12" sm="12" md="12" lg="12"> -->
              <infinite-loading :identifier="infiniteId" @infinite="getVideos" v-if="isShowInfinite"
                                :key="$route.params.id">
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
              <!-- </v-col> -->
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <signin-modal
        v-if="signinDialog"
        :openModal="signinDialog"
        :details="details"
        @closeModal="signinDialog = false"
    />
    <JoinModal
        v-if="joinDialog"
        :openModal="joinDialog"
        @closeJoinModal="joinDialog = false"
        :account="video.userId.address"
        :channelName="video.userId.channelName"
        @callback="joinCallback"
        :video_id="video.userId._id"
    ></JoinModal>
    <SourceInfoModal
        v-if="sourceInfoDialog"
        :openModal="sourceInfoDialog"
        @closeSourceInfoModal="sourceInfoDialog = false"
        :videoHash="videoHash"
        :oracleArrs="oracleArrs"
    ></SourceInfoModal>
    <SubscribedTime
        v-if="memberTime.dialog"
        :expire="memberTime.expire"
        :video="video"
        :dialog="memberTime.dialog"
        @closeSTModal="memberTime.dialog = false"
    ></SubscribedTime>
    <v-dialog
        v-model="subscribeDialog"
        persistent
        transition="fab-transition"
        max-width="500"
        v-if="video.userId"
    >
      <v-card tile class="pt-4">
        <v-card-title class="py-3">Unbookmark {{ video.userId.channelName }}?</v-card-title>
        <v-card-text class="px-3 text-right">
          <footer style="margin-top: 20px">
            <v-btn @click="subscribeDialog = false" style="margin-right: 20px">Cancel</v-btn>
            <v-btn @click="subscribe" :loading="loading">Confirm</v-btn>
          </footer>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import InfiniteLoading from 'vue-infinite-loading'
import _ from 'lodash'

import VideoService from '@/services/VideoService'
import SubscriptionService from '@/services/SubscriptionService'
import FeelingService from '@/services/FeelingService'
import HistoryService from '@/services/HistoryService'

import SigninModal from '@/components/SigninModal'
import JoinModal from '@/components/JoinModal'
import SourceInfoModal from '@/components/SourceInfoModal'
import AddComment from '@/components/comments/AddComment'
import CommentList from '@/components/comments/CommentList'
import Share from "@/components/Share";
import moment from "moment"
import SubscribedTime from "@/components/SubscribedTime";

export default {
  data: () => ({
    loading: false,
    loaded: false,
    errored: false,
    videoLoading: true,
    subscribed: false,
    subscribeLoading: false,
    subscribeDialog: false,
    joinDialog: false,
    isMember: false,
    memberTime: {
      dialog: false,
      expire: 0
    },
    playable: false,
    feeling: '',
    video: {},
    videoId: '',
    videos: [],
    page: 1,
    infiniteId: +new Date(),
    truncate: true,
    signinDialog: false,
    details: {},
    watchVideoStatusTimer: null,
    videoEndTimer: null,
    pageSize: 12,
    isShowInfinite: false,
    videoHash: '',
    sourceInfoDialog: false,
    channelAddress: '',
    retryStatus: false,
    videoURL: '',
    oracleArrs: [],
  }),
  computed: {
    ...mapGetters(['currentUser', 'getUrl', 'isAuthenticated', "getImgUrl", "getApi", "web3"])
  },
  methods: {
    clickSubBtn() {
      if (!this.isAuthenticated) {
        this.signinDialog = true
        this.details = {
          title: 'Want to subscribe to this channel?',
          text: 'Sign in to subscribe to this channel.'
        }
        return;
      }
      if (this.isMember) {
        this.memberTime.dialog = true;
      } else {
        this.joinDialog = true;
      }
    },
    joinCallback(data) {
      this.joinDialog = false;
      this.subscribed = true;
      this.isMember = true;
      this.playable = true;
      this.video.userId.subscribers++;
      this.memberTime.expire = data.expire;
    },
    subscribeBefore() {
      if (!this.isAuthenticated) {
        this.signinDialog = true
        this.details = {
          title: 'Want to bookmark this channel?',
          text: 'Sign in to bookmark this channel.'
        }
        return
      }
      if (this.subscribed) {
        this.subscribeDialog = true;
      } else {
        this.subscribe()
      }
    },
    async subscribe() {
      if (this.subscribed) {
        this.subscribeDialog = false;
      }
      this.subscribeLoading = true
      const sub = await SubscriptionService.createSubscription({
        channelId: this.video.userId._id
      })
          .catch((err) => console.log(err))
          .finally(() => {
            this.subscribeLoading = false
          })
      console.log(sub)
      if (!sub) return
      if (!sub.data.data?._id) {
        this.subscribed = false
        this.video.userId.subscribers--
      } else {
        this.subscribed = true
        this.video.userId.subscribers++
      }
    },
    async getVideo(id) {
      this.errored = false
      this.videoLoading = true
      this.video = {}
      try {
        const video = await VideoService.getById(id)

        if (!video) return this.$router.push('/');
        this.video = video.data.data
        this.videoHash = video.data.data.url;
        let oracleArr = _.cloneDeep(this.video.oracle);
        if (this.video.overlay && !oracleArr.includes(this.video.overlay)) oracleArr.push(this.video.overlay);
        this.oracleArrs = oracleArr;
        this.videoURL = `${this.getApi}/file/${this.video.url}?oracles=${oracleArr.join(",")}`;
        this.channelAddress = video.data.data.userId.address;
      } catch (err) {
        this.errored = true
        console.log(err)
      } finally {
        this.videoLoading = false;
        this.playable = this.video.status === 'public';
        if (this.channelAddress === this.currentUser?.address) {
          this.subscribed = true;
          this.isMember = true;
          this.playable = true;
        } else {
          await this.checkSubscription(this.video.userId._id)
        }
        await this.checkFeeling(this.video._id)
      }

      if (!this.isAuthenticated) return

      // if (
      //     this.video.userId._id.toString() !== this.currentUser._id.toString() &&
      //     this.video.status !== 'public'
      // )
      //   return this.$router.push('/')

      const data = {
        type: 'watch',
        videoId: this.video._id
      }

      await HistoryService.createHistory(data).catch((err) => console.log(err))
    },
    async getVideos($state) {
      if (JSON.stringify(this.video) === '{}') return;
      this.errored = false
      if (!this.loaded) {
        this.loading = true
      }

      const videos = await VideoService.getAll('public', {page: this.page, userId: this.video.userId._id, limit: 9})
          .catch((err) => {
            console.log(err)
            this.errored = true
          })
          .finally(() => {
            this.loading = false
          })

      if (typeof videos === 'undefined') return

      if (videos.data.data.length) {
        this.page += 1

        this.videos.push(...videos.data.data)
        if ($state) {
          $state.loaded()
        }

        this.loaded = true
      } else {
        if ($state) {
          $state.complete()
        }
      }
    },
    async checkSubscription(id) {
      if (!this.isAuthenticated) {
        this.videoLoading = false;
        return;
      }

      // this.loading = true
      const sub = await SubscriptionService.checkSubscription({channelId: id})
          .catch((err) => {
            console.log(err)
          })
          .finally(() => {
            // this.loading = false
          })

      // this.videoLoading = false;
      if (!sub) return

      if (sub.data.data._id) {
        this.subscribed = true;
      }
      if (sub.data.data.tx) {
        this.isMember = true;
        this.playable = true;
        this.memberTime.expire = sub.data.data.expire;
      }
    },
    async checkFeeling(id) {
      if (!this.isAuthenticated) return

      // this.loading = true
      const feeling = await FeelingService.checkFeeling({videoId: id})
          .catch((err) => {
            console.log(err)
          })
          .finally(() => {
            // this.loading = false
          })

      if (feeling.data && feeling.data.data && !feeling.data.data.feeling) {
        this.feeling = '';
        return
      }


      if (feeling.data.data.feeling === 'like') this.feeling = 'like'
      else if (feeling.data.data.feeling === 'dislike') this.feeling = 'dislike'
    },
    async createFeeling(type) {
      if (!this.isAuthenticated) {
        this.signinDialog = true
        this.details = {
          title:
              type === 'like' ? 'Like this video?' : "Don't like this video?",
          text: 'Sign in to make your opinion count.'
        }
        return
      }

      const feeling = await FeelingService.createFeeling({
        videoId: this.video._id,
        type
      }).then(() => {
        switch (true) {
          case type === 'like' && this.feeling === '':
            this.feeling = 'like'
            this.video.likes++
            break
          case type === 'like' && this.feeling === type:
            this.feeling = ''
            this.video.likes--
            break
          case type === 'like' && this.feeling === 'dislike':
            this.feeling = 'like'
            this.video.dislikes--
            this.video.likes++
            break
          case type === 'dislike' && this.feeling === '':
            this.feeling = 'dislike'
            this.video.dislikes++
            break
          case type === 'dislike' && this.feeling === type:
            this.feeling = ''
            this.video.dislikes--
            break
          case type === 'dislike' && this.feeling === 'like':
            this.feeling = 'dislike'
            this.video.likes--
            this.video.dislikes++
        }
      }).catch((err) => {
        console.log(err);
        this.$store.dispatch('showTips', {
          type: "error",
          text: JSON.stringify(err.response.data.error),
        });
      })

      if (!feeling) return
    },
    async updateViews(id) {
      const views = await VideoService.updateViews(id).catch((err) => {
        console.log(err)
      })
      if (!views) return

      this.video.views++
    },
    actions() {
      this.getVideo(this.$route.params.id)
    },
    show(event) {
      if (event.target.innerText === 'SHOW MORE') {
        this.truncate = false
        event.target.innerText = 'SHOW LESS'
      } else {
        this.truncate = true
        event.target.innerText = 'SHOW MORE'
      }
    },
    truncateText(string = '', num) {
      if (string.length <= num) {
        return string
      }
      return string.slice(0, num)
    },
    dateFormatter(date) {
      return moment(date).fromNow()
    },
    watchSideBarVideo(index, vid) {
      if (this.watchVideoStatusTimer) {
        clearInterval(this.watchVideoStatusTimer);
      }
      if (this.videoEndTimer) {
        clearTimeout(this.videoEndTimer)
      }
      let cpage = Math.ceil((index + 1) / this.pageSize);
      let cindex = index < this.pageSize ? index : (index % this.pageSize);
      this.$router.push({
        path: `/watch/${vid}`,
        query: {
          cpage,
          cindex
        }
      })
    },
    getNextVideo() {
      return this.videos.findIndex(item => item._id === this.video._id);
    },
    bindAutoPlay() {
      this.$nextTick(() => {
        let _this = this;
        // let id = '';
        // let cIndex = parseInt(this.$route.query.cindex);
        // let cPage = parseInt(this.$route.query.cpage);
        // let data = null;
        // let videos = [];
        let pauseTime = 0;
        let error = false;

        let videoRef = this.$refs.videoPlayer;

        const bindVideoEvent = () => {
          if (this.watchVideoStatusTimer) {
            clearInterval(this.watchVideoStatusTimer);
          }

          this.watchVideoStatusTimer = setInterval(() => {

            if (videoRef.networkState === 3) {
              clearInterval(_this.watchVideoStatusTimer);
              this.$store.dispatch("showTips", {
                type: "error", text: "Blockchain congestion or file format error"
              });
              // cIndex++;
              // playNextVideo()
              this.retryStatus = true;
            }
          }, 3000)

          videoRef.addEventListener('loadeddata', () => {
            if (this.isAuthenticated) _this.updateViews(_this.$route.params.id)
            // videoRef.play();
          })


          videoRef.addEventListener('error', () => {
            console.log("error")
            error = true;
            clearInterval(_this.watchVideoStatusTimer);
            this.$store.dispatch("showTips", {
              type: "error", text: "Blockchain congestion or file format error"
            });
            this.retryStatus = true;
          })

          videoRef.addEventListener('pause', () => {
            pauseTime = videoRef.currentTime;
          })

          videoRef.addEventListener('play', () => {
            if (videoRef.currentTime === 0 && error) {
              videoRef.currentTime = pauseTime;
              error = false;
            }
          })

          // async function playNextVideo() {
          //   await addPageNum();
          //   await equalToCurrent();
          //   id = videos[cIndex].id;
          //   await _this.$router.push({
          //     path: `/watch/${id}`,
          //     query: {
          //       cpage: cPage,
          //       cindex: cIndex,
          //     }
          //   });
          // }

          // async function addPageNum() {
          //   if ((cIndex + 1) % _this.pageSize === 0) {
          //     cPage++;
          //     cIndex = 0;
          //   }
          //   _this.isShowInfinite = false;
          //   data = await VideoService.getAll('public', {page: cPage, userId: _this.video.userId._id});
          //   videos = [...data.data.data];
          // }

          // async function equalToCurrent() {
          //   let currentId = _this.$route.params.id
          //   if (currentId === videos[cIndex].id) {
          //     cIndex++;
          //     await addPageNum();
          //   }
          // }
        }

        bindVideoEvent();
      })
    },
    sourceInfo() {
      if (!this.videoHash) return;
      this.sourceInfoDialog = true;
    },
    showSigninDialog(value) {
      this.details = {
        title: 'Want to comment on this video?',
        text: 'Sign in to comment on this video.'
      }
      this.signinDialog = value;
    },
    retry() {
      this.$router.replace({
        path: '/refresh',
        query: {
          t: Date.now(),
        }
      })
    },
    ...mapMutations(['addContinuousPlay']),
  },
  components: {
    AddComment,
    CommentList,
    SigninModal,
    JoinModal,
    SourceInfoModal,
    InfiniteLoading,
    Share,
    SubscribedTime
  },
  mounted() {
    this.getVideo(this.$route.params.id)
  },
  watch: {
    video: {
      handler: function (newVal) {
        if (newVal?.userId?._id) {
          this.isShowInfinite = true;
        }
      }
    },
    playable(newV) {
      if (newV) this.bindAutoPlay();
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.page = 1;
    (this.loading = false), (this.loaded = false), (this.videos = [])
    this.infiniteId += 1
    this.getVideo(to.params.id)
    this.isShowInfinite = false;
    this.retryStatus = false;
    next()
  }
}
</script>

<style lang="scss" scoped>
video {
  max-width: 100%;
}

.grey-color {
  color: #7f7f7f !important;
}

.grey-bgc {
  background: #7f7f7f;
}

.black-font {
  color: rgba(0, 0, 0, .87);
}

#btns {
  border-bottom: 1px solid #e0d8d8;
}

button.v-btn.remove-hover-bg {
  background-color: initial !important;

  &:hover {
    background-color: #f9f9f9;
  }
}

.video-title-format {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 20px;
  padding-bottom: 0px;
}

.retry-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.actions-btns {
  justify-content: space-between;
  flex-wrap: nowrap;

  #dislike-btn {
    margin-left: 5px;
  }
}

@media screen and (max-width: 959px) {
  .up-next-img {
    height: auto !important;
    margin-bottom: 10px;
  }
}

@media screen and (max-width: 580px) {
  #subscribe-tips {
    transform: translate(-50%, -50%) scale(.7) !important;
  }
}

@media screen and (max-width: 450px) {
  #subscribe-tips {
    transform: translate(-50%, -50%) scale(.6) !important;
  }
}

@media screen and (max-width: 360px) {
  #subscribe-tips {
    transform: translate(-50%, -50%) scale(.5) !important;
  }
}

@media screen and (max-width: 300px) {
  #subscribe-tips {
    transform: translate(-50%, -50%) scale(.4) !important;
  }
}

.key {
  display: inline-block;
  font-size: 14px;
  color: #222;
  width: 160px;
  text-align: right;
  font-weight: 500;
}

.value {
  font-size: 16px;
  color: #222;
}
</style>
