<template>
  <nav id="navbar">
    <v-app-bar class="white" flat app clipped-left>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="font-weight-bold website-name"
      >
        <router-link to="/" class="black--text" style="text-decoration: none;margin-right: 24px"
        >FavorTube
        </router-link
        >
      </v-toolbar-title
      >
      <v-tooltip right>
        <template v-slot:activator="{ on: tooltip }">
          <v-btn icon class="mr-7" id="previous-page-btn" v-on="{ ...tooltip }" @click.stop="goBackHandle"
          >
            <v-icon size="25">mdi-arrow-left-bold-circle</v-icon>
          </v-btn
          >
        </template>
        <span>previous page</span>
      </v-tooltip>
      <v-spacer></v-spacer>
      <v-text-field
          flat
          hide-details
          append-icon="mdi-magnify"
          placeholder="Search"
          outlined
          dense
          v-model="searchText"
          @click:append="search"
      ></v-text-field>

      <v-spacer></v-spacer>

      <!-- <v-dialog
        v-model="KeyStoreDialog"
        width="500"
      <v-dialog
          v-model="KeyStoreDialog"
          width="500"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary"
                 small
                 outlined
                 style="margin-right: 16px"
                 v-bind="attrs"
                 @click="KeyStoreClickHandle"
          >
            KeyStore
          </v-btn>
        </template>

        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            private_key：
          </v-card-title>
          <br>
          <div class="qrCodeBox" v-if="KeyStoreDialog">
            <div id="privateKeyQr"></div>
          </div>
          <v-card-text>
            {{ privateKey }}
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <div ref="copyPrivateKey">
              <v-btn
                  color="primary"
                  text
                  @click="copyPrivateKey"
              >
                copy
              </v-btn>
            </div>
            <v-spacer></v-spacer>
            <v-btn
                color="primary"
                text
                @click="closeKeyStoreHandel"
            >
              close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog> -->
      <v-menu offsetY>
        <template v-slot:activator="{ on: menu }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on: tooltip }">
              <v-btn icon class="" v-on="{ ...tooltip, ...menu }"
              >
                <v-icon size="25">mdi-video-plus</v-icon>
              </v-btn
              >
            </template>
            <span>Create a video and more</span>
          </v-tooltip>
        </template>
        <v-list>
          <v-list-item router to="/studio">
            <v-list-item-icon class="mr-3"
            >
              <v-icon>mdi-play-box-outline</v-icon>
            </v-list-item-icon
            >
            <v-list-item-title>Upload video</v-list-item-title>
          </v-list-item>
          <!-- <v-list-item>
            <v-list-item-icon class="mr-3"
              ><v-icon>mdi-access-point</v-icon></v-list-item-icon
            >
            <v-list-item-title>Go live</v-list-item-title>
          </v-list-item> -->
        </v-list>
      </v-menu>

      <v-btn
          tile
          outlined
          color="blue"
          class="font-weight-bold"
          v-if="!$store.getters.isAuthenticated"
          router
          to="/signin"
      >
        <v-icon left size="26">mdi-account-circle</v-icon>
        Sign in
      </v-btn>

      <v-menu offset-y left v-else>
        <template v-slot:activator="{ on }">
          <v-btn small color="red" depressed fab v-on="on" class="white--text">
            <v-avatar v-if="currentUser.photoUrl !== 'no-photo.jpg'">
              <img
                  :src="`${getUrl}/uploads/avatars/${currentUser.photoUrl}`"
                  :alt="`${currentUser.channelName} avatar`"
              />
            </v-avatar>
            <template v-else>
              <span class="headline">
                {{ currentUser.channelName.split('')[0].toUpperCase() }}
              </span>
            </template>
          </v-btn>
        </template>

        <v-card>
          <v-list>
            <v-list-item>
              <v-list-item-avatar>
                <v-avatar v-if="currentUser.photoUrl !== 'no-photo.jpg'">
                  <img
                      :src="`${getUrl}/uploads/avatars/${currentUser.photoUrl}`"
                      :alt="`${currentUser.channelName} avatar`"
                  />
                </v-avatar>
                <template v-else>
                  <v-avatar color="red">
                    <span class="white--text headline ">
                      {{
                        currentUser.channelName.split('')[0].toUpperCase()
                      }}</span
                    >
                  </v-avatar>
                </template>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title class="text-capitalize">{{
                    currentUser.channelName
                  }}
                </v-list-item-title>
                <v-list-item-subtitle>{{
                    currentUser.email
                  }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-list>
            <v-list-item
                router
                :to="`/channels/${$store.getters.currentUser._id}`"
            >
              <v-list-item-icon>
                <v-icon>mdi-account-box</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Your channel</v-list-item-title>
            </v-list-item>
            <v-list-item router to="/studio">
              <v-list-item-icon>
                <v-icon>mdi-youtube-studio</v-icon>
              </v-list-item-icon>
              <v-list-item-title>FavorTube Studio</v-list-item-title>
            </v-list-item>
            <v-list-item @click="signOut">
              <v-list-item-icon>
                <v-icon>mdi-login-variant</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Sign out</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        app
        :clipped="$route.name !== 'Watch'"
        :temporary="$route.name === 'Watch'"
        id="nav"
    >
      <div class="v-navigation-drawer__content" v-bar>
        <v-list dense nav class="py-0" tag="div" style="position: relative">
          <v-list-item
              :class="{
              'hidden-lg-and-up': $route.name!=='Watch'
            }"
          >
            <v-app-bar-nav-icon
                @click="drawer = !drawer"
                class="mr-5"
            ></v-app-bar-nav-icon>
            <v-toolbar-title class="font-weight-bold">FavorTube</v-toolbar-title>
          </v-list-item>

          <v-divider class="hidden-lg-and-up"></v-divider>
          <div v-for="parentItem in items" :key="parentItem.header">
            <div
            >
              <v-list-item
                  v-for="(item) in parentItem.pages"
                  :key="item.title"
                  class="mb-0"
                  :to="item.link"
                  exact
                  active-class="active-item"
              >
                <v-list-item-icon v-if="parentItem.header !== 'Subscriptions'">
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-title class=" font-weight-medium subtitle-2">
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
            </div>

            <v-divider
                class="mt-2 mb-2"
            ></v-divider>
          </div>
          <div v-if="isAuthenticated">
            <v-subheader
                class="pl-3 py-4 subtitle-1 font-weight-bold text-uppercase"
            >
              Favorites
            </v-subheader>
            <div class="Subscriptions-box">
              <v-list-item
                  v-for="(item) in channelList"
                  :key="item.title"
                  class="mb-0"
                  :to="'/channels/' + item.channelId._id"
                  exact
                  active-class="active-item"
              >
                <v-list-item-avatar class="mr-5">
                  <v-avatar
                      v-if="
                    item.channelId.photoUrl !== 'no-photo.jpg' && item.channelId
                  "
                  >
                    <img
                        :src="
                      `${getUrl}/uploads/avatars/${item.channelId.photoUrl}`
                    "
                        :alt="`${item.channelId.channelName} avatar`"
                    />
                  </v-avatar>
                  <template v-else>
                    <v-avatar color="red">
                    <span class="white--text headline ">
                      {{
                        item.channelId.channelName.split('')[0].toUpperCase()
                      }}</span
                    >
                    </v-avatar>
                  </template>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title class=" font-weight-medium subtitle-2">
                    {{
                      item.channelId.channelName
                    }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </div>
            <v-btn
                id="showBtn"
                @click="moreChannels"
                block
                text
                class="text-none"
            >
              <v-icon>{{ isLoadingChannel ? 'mdi-loading' : 'mdi-chevron-down' }}</v-icon>
              {{ loadedAllChannel ? 'All(reload)' : `Show more` }}
            </v-btn
            >
          </div>
          <v-divider
              class="mt-2 mb-2"
          ></v-divider>
          <span v-for="link in links" :key="link.text">
            <span v-if="link.text === 'Terms'" class="mb-2 d-block"> </span>
            <v-btn
                href
                router
                :to="link.link"
                text
                class="text-capitalize px-1"
                small
            >{{ link.text }}</v-btn
            >
          </span>
          <div class="connecting">
            <span
            :class="'connecting-status ' + (peersNum >= 3 ? (peersNum >= 8 ? 'peers-many' : 'peers-normal') : '')">
            </span>
            peers: {{peersNum}}
          </div>
          <p style="margin: 10px">Version: {{ FavorTubeVersion }}</p>
        </v-list>
      </div>
    </v-navigation-drawer>
  </nav>
</template>

<script>
import {mapGetters} from 'vuex'
import SubscriptionService from '@/services/SubscriptionService'
import FavorService from '@/services/FavorService'
import HistoryService from '@/services/HistoryService'
import {removeAllPendingRequestsRecord} from "@/services/Api";
import { version as FavorTubeVersion } from '../../package.json'

export default {
  data: () => ({
    drawer: true,
    items: [
      {
        header: null,
        pages: [
          {title: 'Home', link: '/', icon: 'mdi-home'},
          {title: 'Trending', link: '/trending', icon: 'mdi-fire'},
          {
            title: 'Subscriptions',
            link: '/subscriptions',
            icon: 'mdi-youtube-subscription'
          }
        ]
      },
      {
        header: null,
        pages: [
          {
            title: 'History',
            link: '/history',
            icon: 'mdi-history'
          },
          {
            title: 'Liked videos',
            link: '/liked-videos',
            icon: 'mdi-thumb-up'
          }
        ]
      },
      // {
      //   header: 'Subscriptions',
      //   pages: [
      //     // {
      //     //   title: 'Traversy Media',
      //     //   link: '#tm',
      //     //   icon: 'mdi-badge-account'
      //     // },
      //     // {
      //     //   title: 'The New Boston',
      //     //   link: '#tn',
      //     //   icon: 'mdi-badge-account'
      //     // },
      //     // {
      //     //   title: 'Net Ninija',
      //     //   link: '#nn',
      //     //   icon: 'mdi-badge-account'
      //     // },
      //     // {
      //     //   title: 'Chris Hawks',
      //     //   link: '#ch',
      //     //   icon: 'mdi-badge-account'
      //     // }
      //   ]
      // },
      // {
      //   header: 'MORE FROM VUETUBE',
      //   pages: [
      //     {
      //       title: 'VueTube Premium',
      //       link: '#vp',
      //       icon: 'mdi-youtube'
      //     },
      //     {
      //       title: 'Gaming',
      //       link: '#g',
      //       icon: 'mdi-youtube-gaming'
      //     },
      //     {
      //       title: 'Live',
      //       link: '#li',
      //       icon: 'mdi-access-point'
      //     }
      //   ]
      // },
      // {
      //   header: null,
      //   pages: [
      //     {
      //       title: 'Setting',
      //       link: '#sg',
      //       icon: 'mdi-cog'
      //     },
      //     {
      //       title: 'Report history',
      //       link: '#rh',
      //       icon: 'mdi-flag'
      //     },
      //     {
      //       title: 'Help',
      //       link: '#hp',
      //       icon: 'mdi-help-circle'
      //     },
      //     {
      //       title: 'Send feedback',
      //       link: '#f',
      //       icon: 'mdi-message-alert'
      //     }
      //   ]
      // }
    ],
    links: [
      // { text: 'About', link: '#' },
      // { text: 'Press', link: '#' },
      // { text: 'Copyrignt', link: '#' },
      // { text: 'Contact us', link: '#' },
      // { text: 'Creators', link: '#' },
      // { text: 'Advertise', link: '#' },
      // { text: 'Developers', link: '#' },
      // { text: 'Terms', link: '#' },
      // { text: 'Privacy', link: '#' },
      // { text: 'Policy & Safety', link: '#' },
      // { text: 'Test new features', link: '#' }
    ],
    channelLength: 0,
    channelPage: 1,
    channelList: [],
    loadedAllChannel: false,
    isLoadingChannel: false,
    searchText: '',
    // user: null,
    goBackClickStatus: false,
    FavorTubeVersion: FavorTubeVersion,
    peersNum: 0,
  }),
  computed: {
    ...mapGetters(['currentUser', 'isAuthenticated', "getImgUrl", "getApi", "web3", "ws"]),
    getUrl() {
      return this.getImgUrl
    }
  },
  methods: {
    async search() {
      if (!this.searchText) return
      if (this.searchText === this.$route.query['search-query']) return
      const data = {
        type: 'search',
        searchText: this.searchText
      }

      if (this.isAuthenticated)
        await HistoryService.createHistory(data).catch((err) =>
            console.log(err)
        )

      await this.$router.push({
        name: 'Search',
        query: {'search-query': this.searchText}
      })
    },
    async getSubscribedChannels() {
      this.isLoadingChannel = true;
      const channels = await SubscriptionService.getSubscribedChannels(
          this.currentUser._id,
          this.channelPage
      ).catch((err) => console.log(err))
          .finally(() => {
            this.isLoadingChannel = false;
          })
      if (channels.data.count > 0) {
        let data = channels.data.data;
        this.channelList = this.channelList.concat(data);
        this.channelPage++;
      }
      if (channels.data.count < 12) {
        this.loadedAllChannel = true;
      }
    },
    moreChannels() {
      if (this.loadedAllChannel) {
        this.loadedAllChannel = false;
        this.channelList = [];
        this.channelPage = 1;
      }
      this.getSubscribedChannels();
    },
    signOut() {
      this.$store.dispatch('signOut');
      if (this.$route.name !== "Home") {
        this.$router.push("/");
      }
      this.web3?.currentProvider?.disconnect?.();
    },
    goBackHandle() {
      this.goBackClickStatus = true;
      this.$router.back(-1);
    },
    async getTopology() {
      const { data } = await FavorService.getTopology();
      this.peersNum = (data?.connected || 0) + (data?.bootNodes?.connected || 0);

      let _this = this;
      _this.ws?.send(
        {
          "id": 3,
          "jsonrpc": '2.0',
          "method": 'p2p_subscribe',
          "params": ['kadInfo'],
        },
        (err, res) => {
          if (err || res?.error) {
            console.error(err || res?.error);
          }
          _this.ws?.on(res?.result, (res) => {
            _this.peersNum = res?.connected?.full_nodes;
          });
        },
      );
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (!to.query['search-query'] === '') return
      vm.searchText = to.query['search-query']
    })
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'Config' && this.goBackClickStatus) {
      this.goBackClickStatus = false;
      this.$store.dispatch("showTips", {
        type: "info", text: "It is currently on the home page"
      })
      next(false);
    } else {
      next();
    }
  },
  async mounted() {
    if (this.isAuthenticated) this.getSubscribedChannels(true)

    this.drawer = !this.$vuetify.breakpoint.mdAndDown
    this.drawer = this.$route.name === 'Watch' ? false : this.drawer

    this.getTopology();

  },
  created() {

    this.drawer = this.$route.name === 'Watch' ? false : this.drawer

    if (!this.isAuthenticated) {
      this.items[0].pages.pop();
      this.items.splice(1, 1)
    }
  },
  watch: {
    isAuthenticated(newV) {
      if (!newV) {
        this.items[0].pages.pop();
        this.items.splice(1, 1);
      }
    },
    $route: {
      handler: function () {
        removeAllPendingRequestsRecord();
      },
      deep: true
    }
  }
}
</script>

<style lang="scss">
.v-list-item__avatar {
  justify-content: center !important;
}

#showBtn {
  .v-btn__content {
    justify-content: flex-start;

    i {
      margin-right: 30px;
    }
  }
}

#navbar {
  .active-item {
    .v-list-item__icon {
      color: red !important;
    }
  }

  .v-navigation-drawer__border {
    width: 0 !important;
  }

  .vuebar-element {
    height: 250px;
    width: 100%;
    max-width: 500px;
    background: #dfe9fe;
  }

  .vb > .vb-dragger {
    z-index: 5;
    width: 10px;
    right: 0;
  }

  .vb > .vb-dragger > .vb-dragger-styler {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: rotate3d(0, 0, 0, 0);
    transform: rotate3d(0, 0, 0, 0);
    -webkit-transition: background-color 100ms ease-out, margin 100ms ease-out,
    height 100ms ease-out;
    transition: background-color 100ms ease-out, margin 100ms ease-out,
    height 100ms ease-out;

    margin: 5px 5px 5px 0;
    border-radius: 20px;
    height: calc(100% - 10px);
    display: block;
  }

  .v-navigation-drawer__content:hover .vb > .vb-dragger > .vb-dragger-styler {
    width: 10px;
    background-color: #e0e0e0;
  }

  .vb.vb-scrolling-phantom > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(48, 121, 244, 0.3);
    background-color: rgba(255, 255, 255, 0.3);
  }

  .vb > .vb-dragger:hover > .vb-dragger-styler {
    margin: 0px;
    width: 10px;
  }

  .vb.vb-dragging > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(48, 121, 244, 0.5);
    margin: 0px;
    height: 100%;
  }

  .vb.vb-dragging-phantom > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(48, 121, 244, 0.5);
  }

}


.qrCodeBox {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;

  #privateKeyQr {
    width: 100px;
    height: 100px;

    img {
      width: 100%;
    }
  }
}

.Subscriptions-box {
  // max-height: 336px;
  // overflow-y: auto;
}

.Subscriptions-box::-webkit-scrollbar {
  width: 6px;
  // height: 8px;
  background-color: #ddd;
  border-radius: 3px;
}

.Subscriptions-box::-webkit-scrollbar-thumb {
  background: #aaa;
  border-radius: 3px;
}

.connecting {
  margin: 10px;
  .connecting-status {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 10px;
    border-radius: 50%;
    background: #f00;
  }
  .peers-normal {
    background: rgb(255, 255, 83);
  }
  .peers-many {
    background: rgb(69, 202, 69);
  }
}

@media screen and (max-width: 800px) {
  #previous-page-btn {
    display: none;
  }
}

@media screen and (max-width: 725px) {
  .website-name {
    display: none !important;
  }
}

@media screen and (max-width: 600px) {
  .website-name {
    display: none !important;
  }
}

</style>
