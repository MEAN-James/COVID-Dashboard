export const state = () => ({
  covidData: [],
  displayedData: [],
  totalResults: 0,
  limit: 10,
  pages: 0,
  currPage: 0,
  firstStat: 0,
  lastStat: 0,
  sortBy: 'casesPerOneMillion',
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
  SET_SEARCH_RESULTS(state, results) {
    state.displayedData = results.slice(state.firstStat, state.lastStat)
  },
}

export const actions = {
  async loadCovidData({ commit, state }) {
    commit('SET_LOADING', true)
    commit('SET_STATUS', 'loading')
    try {
      const res = await this.$axios.$get(
        `/novelCOVID/countries?sort=${state.sortBy}`
      )
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
  // search function
  searchCovidData({ commit, state }, query) {
    // filter results by query string
    const regEx = new RegExp(query, 'g')
    let res = state.covidData.filter(({ country }) => regEx.test(country))
    // Calculate similarity of each results and then sort by that value.
    function getEditDistance(a, b) {
      if (a.length === 0) return b.length
      if (b.length === 0) return a.length
      const matrix = []
      // increment along the first column of each row
      for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i]
      }
      // increment each column in the first row
      for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j
      }
      // Fill in the rest of the matrix
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1]
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1, // substitution
              Math.min(
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j] + 1
              )
            ) // deletion
          }
        }
      }
      return matrix[b.length][a.length]
    }

    res.map((r) => {
      const editDistance = getEditDistance(query, r.country)
      r.distanceFromSearch = editDistance
    })
    res = res.sort((a, b) => {
      return a.distanceFromSearch - b.distanceFromSearch
    })
    commit('SET_TOTAL_RESULTS', res.length)
    commit('SET_PAGES')
    commit('SET_CURRENT_PAGE', 1)
    commit('SET_FIRST_STAT')
    commit('SET_LAST_STAT')
    commit('SET_SEARCH_RESULTS', res)
  },
}

export const getters = {
  loading: (state) => state.loading,
  status: (state) => state.status,
  currPage: (state) => state.currPage,
  pages: (state) => state.pages,
  limit: (state) => state.limit,
  firstStat: (state) => state.firstStat,
  lastStat: (state) => state.lastStat,
  totalResults: (state) => state.totalResults,
  getDisplayedData: (state) => state.displayedData,
}
