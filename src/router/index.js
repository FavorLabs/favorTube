import Vue from 'vue'
import VueRouter from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import StudioNavBar from '@/components/StudioNavBar.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        components: {
            NavBar,
            default: () => import(/* webpackChunkName: "Home" */ '../views/Home.vue')
        },
        meta: {keepAlive: true}
    },
    {
        path: '/videos',
        name: 'Videos',
        components: {
            NavBar,
            default: () => import(/* webpackChunkName: "Home" */ '../views/Videos.vue')
        },
        meta: {requiresAuth: true, keepAlive: true}
    },
    {
        path: '/share',
        name: 'Share',
        components: {
            NavBar,
            default: () =>
                import(/* webpackChunkName: "Subscription" */ '../views/ShareInfo.vue')
        },
        meta: {requiresAuth: true}
    },
    {
        path: '/subscriptions',
        name: 'Subscription',
        components: {
            NavBar,
            default: () =>
                import(/* webpackChunkName: "Subscription" */ '../views/Subscription.vue')
        },
        meta: {requiresAuth: true}
    },
    {
        path: '/liked-videos',
        name: 'LikedVideos',
        components: {
            NavBar,
            default: () =>
                import(/* webpackChunkName: "LikedVideos" */ '../views/LikedVideo.vue')
        },
        meta: {requiresAuth: true}
    },
    {
        path: '/signin',
        name: 'SignIn',
        component: () =>
            import(/* webpackChunkName: "SignIn" */ '../views/Auth/SignIn.vue'),
        meta: {requiresVisitor: true}
    },
    {
        path: '/signup',
        name: 'SignUp',
        component: () =>
            import(/* webpackChunkName: "SignUp" */ '../views/Auth/SignUp.vue'),
        meta: {requiresVisitor: true}
    },
    {
        path: '/trending',
        name: 'Trending',
        components: {
            NavBar,
            default: () =>
                import(/* webpackChunkName: "Trending" */ '../views/Trending.vue')
        },
        meta: {keepAlive: true}
    },
    {
        path: '/studio',
        components: {
            StudioNavBar,
            default: () =>
                import(/* webpackChunkName: "Studio" */ '../views/Studio/Index.vue')
        },
        children: [
            {
                path: '/',
                name: 'Dashboard',
                component: () =>
                    import(
                        /* webpackChunkName: "Studio" */ '../views/Studio/Dashboard.vue'
                        )
            },
            {
                path: 'videos',
                name: 'Video',
                component: () =>
                    import(/* webpackChunkName: "Studio" */ '../views/Studio/Video.vue')
            },
            {
                path: 'details/:id',
                name: 'Detail',
                component: () =>
                    import(/* webpackChunkName: "Studio" */ '../views/Studio/Details.vue')
            }
        ],
        meta: {requiresAuth: true}
    },
    {
        path: '/channels/:id',
        components: {
            NavBar,
            default: () =>
                import(/* webpackChunkName: "Channels" */ '../views/Channel/Index.vue')
        },
        children: [
            {
                path: '/',
                name: 'ChannelHome',
                component: () =>
                    import(
                        /* webpackChunkName: "Channels" */ '../views/Channel/Home.vue'
                        )
            }
        ]
    },
    {
        path: '/watch/:id',
        name: 'Watch',
        components: {
            NavBar,
            default: () =>
                import(/* webpackChunkName: "Watch" */ '../views/Watch.vue')
        }
    },
    {
        path: '/history',
        name: 'History',
        components: {
            NavBar,
            default: () =>
                import(/* webpackChunkName: "History" */ '../views/History.vue')
        },
        meta: {requiresAuth: true}
    },
    {
        path: '/search',
        name: 'Search',
        components: {
            NavBar,
            default: () =>
                import(/* webpackChunkName: "Search" */ '../views/Search.vue')
        }
    },
    {
        path: '/config',
        name: 'Config',
        components: {
            default: () =>
                import(/* webpackChunkName: "Config" */ '../views/ApiConfig')
        }
    },
    {
        path: '/refresh',
        name: 'Refresh',
        components: {
            default: () =>
                import(/* webpackChunkName: "Refresh" */ '../views/refresh')
        },
        meta: {keepAlive: true}
    }
]

const router = new VueRouter({
    mode: 'hash',
    routes
})

function SignInTips() {
    // router.app.$options.router.push('/signin');
    router.app.$options.store.dispatch("showTips", {
        type: "info", text: "Please sign in"
    })
}

router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('token');

    if (to.matched.some((record) => record.meta.requiresAuth) && !loggedIn) {
        if (to.path === '/studio') {
            SignInTips();
        }
        next('/')
    } else if (
        to.matched.some((record) => record.meta.requiresVisitor) &&
        loggedIn
    ) {
        next('/')
    } else {
        next()
    }
})

export default router
