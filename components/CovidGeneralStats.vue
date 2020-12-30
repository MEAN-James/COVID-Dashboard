<template>
  <div>
    <v-card v-if="status === 'loading'" height="750">
      <v-toolbar>
        <v-spacer></v-spacer>
        <v-toolbar-title>Loading Data...</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text class="text-center full-height">
        <v-progress-circular
          color="primary"
          indeterminate
          size="325"
          width="20"
        />
      </v-card-text>
    </v-card>
    <v-card v-if="!loading && status === 'success'">
      <v-toolbar>
        <v-toolbar-title>COVID-19 General Stats</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field
          append-icon="mdi-magnify"
          label="search"
          hide-details
          outlined
          rounded
          single-line
          dense
          @input="search"
        />
        <v-btn icon>
          <v-icon>mdi-help</v-icon>
        </v-btn>
        <template v-slot:extension>
          <v-tabs v-model="tabs" fixed-tabs color="primary">
            <v-tab href="#graph-tab">Graph</v-tab>
            <v-tab href="#table-tab">Table</v-tab>
          </v-tabs>
        </template>
      </v-toolbar>
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
              :items-per-page="limit"
              :hide-default-footer="true"
              :height="400"
              fixed-header
            ></v-data-table>
          </v-tab-item>
        </v-tabs-items>
        <v-row align="center" justify="center">
          <v-col cols="12">
            <v-row justify="center">{{ paginationInfo }}</v-row>
            <v-pagination
              v-model="page"
              class="d.flex justify-end"
              :length="pages"
              total-visible="6"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="limit"
              :items="limitResultOptions"
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
import { mapActions, mapGetters } from 'vuex'

export default {
  data() {
    return {
      tabs: 'graph-tab',
      page: 1,
      chartData: {},
      chartOptions: {},
      tableHeaders: [],
      tableRows: [],
    }
  },
  computed: {
    ...mapGetters('covid', [
      'getDisplayedData',
      'status',
      'loading',
      'pages',
      'limit',
      'totalResults',
      'firstStat',
      'lastStat',
    ]),
    limitResultOptions() {
      const values = []
      let value = 0
      while (value < this.totalResults) {
        value += 5
        values.push(value)
      }
      return values
    },
    paginationInfo() {
      return `${this.firstStat + 1} - ${this.lastStat} of ${this.totalResults}`
    },
  },
  watch: {
    page(page) {
      this.loadRequestedPage(page)
      this.formatData()
    },
  },
  async mounted() {
    this.searchDebouncer = this.$_.debounce(async (val) => {
      await this.searchCovidData(val)
      this.formatData()
    }, 250)
    await this.loadCovidData()
    this.formatData()
  },
  methods: {
    ...mapActions('covid', [
      'loadCovidData',
      'setPageLimit',
      'loadRequestedPage',
      'loadNextPage',
      'loadPrevPage',
    ]),
    search(val) {
      this.searchDebouncer(val)
    },
    formatData() {
      const dataColors = this.$vuetify.theme.themes.dark.data
      const TotalCases = {
        label: 'Total Cases',
        backgroundColor: dataColors.first,
        data: [],
      }
      const ActiveCases = {
        label: 'Active Cases',
        backgroundColor: dataColors.second,
        data: [],
      }
      const TotalRecovered = {
        label: 'Total Recovered',
        backgroundColor: dataColors.third,
        data: [],
      }
      const TotalDeaths = {
        label: 'Total Deaths',
        backgroundColor: dataColors.fourth,
        data: [],
      }
      const CasesPerPop = {
        label: 'Cases Per Million Population',
        backgroundColor: dataColors.fifth,
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
      this.getDisplayedData.map((stat) => {
        this.tableRows.push(stat)
        TotalCases.data.push(stat.cases)
        ActiveCases.data.push(stat.active)
        TotalRecovered.data.push(stat.recovered)
        TotalDeaths.data.push(stat.deaths)
        CasesPerPop.data.push(stat.casesPerOneMillion)
        chartData.labels.push(stat.country)
      })
      chartData.datasets.push(
        TotalCases,
        ActiveCases,
        TotalRecovered,
        TotalDeaths,
        CasesPerPop
      )
      this.chartData = chartData
      // TODO: filter out which rows you want to actually display and better format the headers.
      Object.keys(this.tableRows[0]).forEach((key) => {
        headers.push({ text: formatHeaderText(key), value: key })
      })
      this.tableHeaders = headers
    },
  },
}
</script>

<style>
.full-height {
  padding-top: calc(20%);
  height: calc(100% - 4em);
}
</style>
