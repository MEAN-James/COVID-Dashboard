<template>
  <v-card>
    <v-toolbar extended>
      <v-toolbar-title>COVID-19 Choropleth Map</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <svg id="map" :height="height" :width="width"></svg>
    </v-card-text>
  </v-card>
</template>

<script>
import * as d3Base from 'd3'
import * as d3ScaleChromatic from 'd3-scale-chromatic'
import * as d3GeoProjections from 'd3-geo-projection'

const d3 = Object.assign({}, d3Base, d3ScaleChromatic, d3GeoProjections)

export default {
  data() {
    return {
      width: 800,
      height: 600,
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      // The svg
      const svg = d3.select('svg')
      const width = +svg.attr('width')
      const height = +svg.attr('height')
      const projection = d3
        .geoNaturalEarth()
        .scale(width / 1.3 / Math.PI)
        .translate([width / 2, height / 2])

      // Data and color scale
      const path = d3.geoPath()
      const data = d3.map()
      const colorScale = d3
        .scaleThreshold()
        .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
        .range([
          '#A7FFEB',
          '#64FFDA',
          '#1DE9B6',
          '#00BFA5',
          '#00796B',
          '#00695C',
          '#004D40 ',
        ])

      // Load external data and boot
      d3.queue()
        .defer(
          d3.json,
          'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
        )
        .defer(
          d3.csv,
          'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv',
          function (d) {
            data.set(d.code, +d.pop)
          }
        )
        .await(ready)

      function ready(error, topo) {
        if (error) {
          throw error
        }
        const click = function (d) {
          const name = d.properties.name
          alert(
            JSON.stringify({
              name,
              population: data.get(d.id),
            })
          )
        }

        const mouseOver = function (d) {
          d3.selectAll('.Country')
            .transition()
            .duration(200)
            .style('opacity', 0.5)
          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 1)
            .style('stroke', 'rgba(0,0,0,0.5)')
        }

        const mouseLeave = function (d) {
          d3.selectAll('.Country')
            .transition()
            .duration(200)
            .style('opacity', 0.8)
          d3.select(this)
            .transition()
            .duration(200)
            .style('stroke', 'rgba(0,0,0,0)')
        }
        // Draw the map
        svg
          .append('g')
          .selectAll('path')
          .data(topo.features)
          .enter()
          .append('path')
          // draw each country
          .attr('d', path.projection(projection))
          // set the color of each country
          .attr('fill', function (d) {
            d.total = data.get(d.id) || 0
            return colorScale(d.total)
          })
          .style('stroke', 'transparent')
          .attr('class', function (d) {
            return 'Country'
          })
          .style('opacity', 0.8)
          .on('mouseover', mouseOver)
          .on('mouseleave', mouseLeave)
          .on('click', click)
      }
    },
  },
}
</script>

<style lang="css">
.border {
  border: 1px solid red;
}
</style>
