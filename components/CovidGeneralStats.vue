<template>
  <div>
    <v-overlay :value="status === 'loading'" absolute>
      <v-card class="text-center">
        <v-card-text>
          <v-progress-circular
            class="mb-4"
            color="primary"
            indeterminate
            size="250"
            width="25"
          />
          <h2>Loading...</h2>
        </v-card-text>
      </v-card>
    </v-overlay>
    <v-card v-if="!loading && status === 'success'">
      <v-toolbar>
        <v-toolbar-title>COVID-19 General Stats</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon>
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-help</v-icon>
        </v-btn>
        <template v-slot:extension>
          <v-tabs v-model="tabs" fixed-tabs>
            <v-tab href="#graph-tab">Graph</v-tab>
            <v-tab href="#table-tab">Table</v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
      <v-card-title> Last Updated: {{ getLastUpdated }}</v-card-title>
      <v-card-text>
        <v-tabs-items v-model="tabs">
          <v-tab-item value="graph-tab">
            <bar-chart
              :chart-data="chartData"
              :options="chartOptions"
              :height="200"
            />
          </v-tab-item>
          <v-tab-item value="table-tab">
            <v-data-table
              :headers="tableHeaders"
              :items="tableRows"
              :items-per-page="limitResults"
              :hide-default-footer="true"
              :height="500"
              fixed-header
            ></v-data-table>
          </v-tab-item>
        </v-tabs-items>
        <v-row align="center" justify="center">
          <v-col cols="12">
            <v-row justify="center">
              {{ visibleStats - limitResults + 1 }}
              - {{ endVisibleStats }} of
              {{ totalResults }}
            </v-row>
            <v-pagination
              v-model="page"
              class="d.flex justify-end"
              :length="totalPages"
              total-visible="6"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="limitResults"
              :items="limitResultOptiions"
              label="Results Per Page"
              dense
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
export default {
  data() {
    return {
      tabs: 'graph-tab',
      page: 1,
      limitResults: 10,
      chartData: {},
      chartOptions: {},
      tableHeaders: [],
      tableRows: [],
    }
  },
  computed: {
    ...mapState('covid', ['loading', 'status']),
    ...mapGetters('covid', [
      'getPaginationMeta',
      'getQueryResults',
      'getLastUpdated',
    ]),
    currentPage() {
      return this.getPaginationMeta.currentPage
    },
    currentPageSize() {
      return this.getPaginationMeta.currentPageSize
    },
    totalPages() {
      return this.getPaginationMeta.totalPages
    },
    visibleStats() {
      return this.limitResults * this.currentPage
    },
    endVisibleStats() {
      return this.visibleStats < 200 ? this.visibleStats : this.totalResults
    },
    totalResults() {
      return this.getPaginationMeta.totalRecords
    },
    limitResultOptiions() {
      const options = []
      let option = 0
      while (option < this.totalResults) {
        option += 5
        options.push(option)
      }
      return options
    },
  },
  watch: {
    async page(val) {
      await this.loadRequestedPage(val)
      this.formatData()
    },
    async limitResults(val) {
      await this.changeSearchLimit(val)
      this.formatData()
    },
  },
  async mounted() {
    await this.loadCovidData()
    this.formatData()
  },
  methods: {
    ...mapActions('covid', [
      'loadCovidData',
      'loadRequestedPage',
      'changeSearchLimit',
    ]),
    formatData() {
      // Rewritethis to just reformat the entire result to convert all numeric strings to a Number
      const TotalCases = {
        label: 'Total Cases',
        backgroundColor: '#0f9',
        data: [],
      }
      const ActiveCases = {
        label: 'Active Cases',
        backgroundColor: '#09f',
        data: [],
      }
      const TotalRecovered = {
        label: 'Total Recovered',
        backgroundColor: '#90f',
        data: [],
      }
      const TotalDeaths = {
        label: 'Total Deaths',
        backgroundColor: '#f09',
        data: [],
      }
      const CasesPerPop = {
        label: 'Cases Per Million Population',
        backgroundColor: '#f90',
        data: [],
      }
      const chartData = {
        labels: [],
        datasets: [],
      }
      const headers = []

      function formatHeaderText(val) {
        return val
          .replace(/_/g, ' ')
          .split(' ')
          .map((word) => {
            return word[0].toUpperCase() + word.substr(1)
          })
          .join(' ')
      }

      this.tableRows = []
      this.getQueryResults.map((stat) => {
        const totalCases = parseFloat(stat.total_cases.replace(/,/g, ''))
        const activeCases = parseFloat(stat.active_cases.replace(/,/g, ''))
        const totalRecovered = parseFloat(
          stat.total_recovered.replace(/,/g, '')
        )
        const totalDeaths = parseFloat(stat.total_deaths.replace(/,/g, ''))
        const casesPerPop = parseFloat(
          stat.cases_per_mill_pop.replace(/,/g, '')
        )

        TotalCases.data.push(totalCases)
        ActiveCases.data.push(activeCases)
        TotalRecovered.data.push(totalRecovered)
        TotalDeaths.data.push(totalDeaths)
        CasesPerPop.data.push(casesPerPop)
        chartData.labels.push(stat.country)

        this.tableRows.push(stat)
      })
      chartData.datasets.push(
        TotalCases,
        ActiveCases,
        TotalRecovered,
        TotalDeaths,
        CasesPerPop
      )
      this.chartData = chartData
      Object.keys(this.tableRows[0]).forEach((key) => {
        if (key !== 'flag') {
          headers.push({ text: formatHeaderText(key), value: key })
        }
      })
      this.tableHeaders = headers
    },
  },
}
</script>
