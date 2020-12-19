// const baseUrl = 'https://covidtracking.com/api/states/'
const baseUrl =
  'https://corona-virus-stats.herokuapp.com/api/v1/cases/countries-search'

export const state = () => ({
  covidData: {},
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
    const res = await this.$axios.$get(
      `${baseUrl}?limit=${state.limit}&order=total_cases`
    )
    commit('SET_STATUS', res.status)
    commit('SET_COVID_DATA', res.data)
    commit('SET_LOADING', false)
  },
  async searchCovidData({ commit, state }, query) {
    const res = await this.$axios.$get(
      `${baseUrl}?search=${query}&limit=${state.limit}`
    )
    if (res.data.rows.length !== 0) {
      commit('SET_COVID_DATA', res.data)
    }
  },
  async loadRequestedPage({ commit, state }, page) {
    commit('SET_LOADING', true)
    commit('SET_STATUS', 'loading')
    const requestedPage = page
    const res = await this.$axios.$get(
      `${baseUrl}?page=${requestedPage}&limit=${state.limit}`
    )
    commit('SET_STATUS', res.status)
    commit('SET_COVID_DATA', res.data)
    commit('SET_LOADING', false)
  },
  async changeSearchLimit({ commit, dispatch }, limit) {
    commit('SET_LIMIT', limit)
    await dispatch('loadCovidData')
  },
}

export const getters = {
  getPaginationMeta(state) {
    return state.covidData.paginationMeta
  },
  getLastUpdated(state) {
    return state.covidData.last_update
  },
  getQueryResults(state) {
    return state.covidData.rows
  },
}
