import Api from '@/services/Api'

export default {
    getSubscribedChannels(subscriberId, page) {
        return Api().get('subscriptions/channels', {
            params: {
                subscriberId,
                select: 'channelId',
                page,
                limit: 99999
            }
        })
    },
    getSubscribers(limit) {
        return Api().get('subscriptions/subscribers', {
            params: {
                limit
            }
        })
    },
    checkSubscription(data,timeout = 0) {
        return Api().post('subscriptions/check', data, {timeout})
    },
    createSubscription(data) {
        return Api().post('subscriptions', data)
    },
    getSubscribedVideos(page) {
        return Api().get('subscriptions/videos', {
            params: {
                page,
                limit: 12
            }
        })
    }
}
