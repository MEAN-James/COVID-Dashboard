export const state = () => ({
  covidData: [],
  displayedData: [],
  totalResults: 0,
  limit: 10,
  pages: 0,
  currPage: 0,
  firstStat: 0,
  lastStat: 0,
  sortBy: '',
  yesterday: false,
  loading: false,
  status: '',
})

export const mutations = {
  SET_LOADING(state, loadingState) {
    state.loading = loadingState
  },
  SET_STATUS(state, status) {
    state.status = status
  },
  SET_COVID_DATA(state, res) {
    state.covidData = res
  },
  SET_TOTAL_RESULTS(state, total) {
    state.totalResults = total
  },
  SET_LIMIT(state, limit) {
    state.limit = limit
  },
  SET_PAGES(state) {
    state.pages = Math.ceil(state.totalResults / state.limit)
  },
  SET_CURRENT_PAGE(state, page) {
    state.currPage = page
  },
  SET_FIRST_STAT(state) {
    state.firstStat = state.limit * state.currPage - state.limit
  },
  SET_LAST_STAT(state) {
    const end = state.limit * state.currPage
    state.lastStat =
      end <= state.totalResults ? end : end - (end - state.totalResults)
  },
  SET_DISPLAYED_DATA(state) {
    state.displayedData = state.covidData.slice(state.firstStat, state.lastStat)
  },
}

export const actions = {
  async loadCovidData({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_STATUS', 'loading')
    try {
      const res = await this.$axios.$get('/novelCOVID/countries')
      commit('SET_COVID_DATA', res)
      commit('SET_TOTAL_RESULTS', res.length)
      commit('SET_PAGES')
      commit('SET_CURRENT_PAGE', 1)
      commit('SET_FIRST_STAT')
      commit('SET_LAST_STAT')
      commit('SET_DISPLAYED_DATA')
      commit('SET_STATUS', 'success')
      commit('SET_LOADING', false)
    } catch (error) {
      commit('SET_COVID_DATA', [])
      commit('SET_TOTAL_RESULTS', 0)
      commit('SET_STATUS', 'error')
      commit('SET_LOADING', false)
      throw error
    }
  },
  // Pagination functions
  loadRequestedPage({ commit }, page) {
    commit('SET_LOADING', true)
    commit('SET_CURRENT_PAGE', page)
    commit('SET_FIRST_STAT')
    commit('SET_LAST_STAT')
    commit('SET_DISPLAYED_DATA')
    commit('SET_LOADING', false)
  },
  setPageLimit({ commit, dispatch }, limit) {
    commit('SET_LOADING', true)
    commit('SET_LIMIT', limit)
    commit('SET_PAGES')
    dispatch('loadRequestedPage', 1)
  },
}

export const getters = {
  loading: (state) => state.loading,
  status: (state) => state.status,
  pages: (state) => state.pages,
  limit: (state) => state.limit,
  firstStat: (state) => state.firstStat,
  lastStat: (state) => state.lastStat,
  totalResults: (state) => state.totalResults,
  getDisplayedData: (state) => state.displayedData,
}
