// const baseUrl = 'https://covidtracking.com/api/states/'

export const state = () => ({
  covidData: [],
  limit: 10,
  loading: false,
  status: '',
})

export const mutations = {
  SET_LOADING(state, loadingState) {
    state.loading = loadingState
  },
  SET_COVID_DATA(state, res) {
    state.covidData = res
  },
  SET_STATUS(state, status) {
    state.status = status
  },
  SET_LIMIT(state, limit) {
    state.limit = limit
  },
}

export const actions = {
  async loadCovidData({ commit, state }) {
    commit('SET_LOADING', true)
    commit('SET_STATUS', 'loading')
    const res = await this.$axios.$get('/api/states')
    console.log(res)
    commit('SET_COVID_DATA', res)
    commit('SET_LOADING', false)
  },
}

export const getters = {}
