<script>
import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props: {
    chartData: {
      type: Object,
      default: null,
      required: true,
    },
    options: {
      type: Object,
      default: null,
      required: true,
    },
  },
  watch: {
    chartData() {
      this.renderChart(this.chartData, this.options)
    },
  },
  mounted() {
    this.renderChart(this.chartData, this.options)
  },
}
</script>
