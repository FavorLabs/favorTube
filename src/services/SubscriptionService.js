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
    checkSubscription(data) {
        return Api().post('subscriptions/check', data, {timeout: 2000})
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
