import Api from '@/services/Api'

export default {
    getInfo(params) {
        return Api().get('revenue/info', {
            params
        })
    }
}
