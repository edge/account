<template>
  <div class="flex flex-col items-start space-y-5">

    <div class="buttonGroup">
      <button class="buttonGroup__button active">Today</button>
      <button class="buttonGroup__button">This week</button>
      <button class="buttonGroup__button">This month</button>
      <button class="border-none buttonGroup__button">This year</button>
    </div>

    <div class="grid w-full grid-cols-1 gap-5">

      <div class="box">
        <h4 class="mb-8">CPU load</h4>
        <Line :datapoints='this.datapoints.cpu_load[0].datapoints' />
      </div>

      <div class="box">
        <h4 class="mb-8">Memory usage</h4>
        <Line :datapoints='this.datapoints.mem_usage[0].datapoints' />
      </div>

      <div class="box">
        <h4 class="mb-8">Disk usage</h4>
        <Line :datapoints='this.datapoints["df.root.used"][0].datapoints' />
      </div>

      <div class="box">
        <h4 class="mb-8">Disk I/O</h4>
        <Line :datapoints='this.datapoints.iops[0].datapoints' />
      </div>

      <div class="box">
        <h4 class="mb-8">Net RX</h4>
        <Line :datapoints='this.datapoints.net_rx[0].datapoints' />
      </div>

      <div class="box">
        <h4 class="mb-8">Net TX</h4>
        <Line :datapoints='this.datapoints.net_tx[0].datapoints' />
      </div>
    </div>
    
  </div>
</template>

<script>
import Line from "@/components/charts/Line"

export default {
  name: 'ServerOverview',
  data: function () {
    return {
      datapoints: {
        cpu_load:[
          {
            datapoints:[
                [
                  10,
                  1642993740
                ],
                [
                  10,
                  1642993800
                ],
                [
                  10,
                  1642993860
                ],
                [
                  10,
                  1642993920
                ],
                [
                  10,
                  1642993980
                ],
                [
                  10,
                  1642994040
                ],
                [
                  10,
                  1642994100
                ],
                [
                  10,
                  1642994160
                ],
                [
                  10,
                  1642994220
                ],
                [
                  null,
                  1642994280
                ]
            ],
            tags:{
                "name":"1.host.100_test2.cpu.time"
            },
            target:"summarize(round(scale(1.host.100_test2.cpu.time,100),-1),'0min','avg')"
          }
        ],
        mem_usage:[
          {
            datapoints:[
                [
                  209585493.33333337,
                  1642993740
                ],
                [
                  211518805.33333337,
                  1642993800
                ],
                [
                  212429482.66666663,
                  1642993860
                ],
                [
                  210232661.33333337,
                  1642993920
                ],
                [
                  209668778.66666663,
                  1642993980
                ],
                [
                  210301610.66666663,
                  1642994040
                ],
                [
                  209231189.33333337,
                  1642994100
                ],
                [
                  209377962.66666663,
                  1642994160
                ],
                [
                  211016362.66666663,
                  1642994220
                ],
                [
                  null,
                  1642994280
                ]
            ],
            tags:{
                "name":"1.host.100_test2.mem.available"
            },
            target:"summarize(diffSeries(1.host.100_test2.mem.available, 1.host.100_test2.mem.usable),'0min','avg')"
          }
        ],
        "df.root.used":[
          {
            datapoints:[
                [
                  2585493504,
                  1642993740
                ],
                [
                  2585559040,
                  1642993800
                ],
                [
                  2585559040,
                  1642993860
                ],
                [
                  2585559040,
                  1642993920
                ],
                [
                  2585559040,
                  1642993980
                ],
                [
                  2585559040,
                  1642994040
                ],
                [
                  2585559040,
                  1642994100
                ],
                [
                  2585559040,
                  1642994160
                ],
                [
                  2585591808,
                  1642994220
                ],
                [
                  null,
                  1642994280
                ]
            ],
            tags:{
                "name":"1.host.100_test2.hdd.allocation"
            },
            target:"summarize(1.host.100_test2.hdd.allocation,'0min','avg')"
          }
        ],
        iops:[
          {
            datapoints:[
                [
                  0.18333333333333335,
                  1642993740
                ],
                [
                  2.216666666666667,
                  1642993800
                ],
                [
                  0.06666666666666667,
                  1642993860
                ],
                [
                  0.05000000000000001,
                  1642993920
                ],
                [
                  2.6833333333333336,
                  1642993980
                ],
                [
                  2.4666666666666663,
                  1642994040
                ],
                [
                  3.266666666666666,
                  1642994100
                ],
                [
                  0.08333333333333333,
                  1642994160
                ],
                [
                  1.8499999999999999,
                  1642994220
                ],
                [
                  null,
                  1642994280
                ]
            ],
            tags:{
                "name":"1.host.100_test2.hdd.read_req"
            },
            target:"summarize(sumSeries(1.host.100_test2.hdd.{read_req,write_req}),'0min','avg')"
          }
        ],
        net_rx:[
          {
            datapoints:[
                [
                  1100.8166666666668,
                  1642993740
                ],
                [
                  1020.4500000000002,
                  1642993800
                ],
                [
                  968,
                  1642993860
                ],
                [
                  1019.5,
                  1642993920
                ],
                [
                  1146.1,
                  1642993980
                ],
                [
                  1246.1500000000003,
                  1642994040
                ],
                [
                  1040.2666666666667,
                  1642994100
                ],
                [
                  1145,
                  1642994160
                ],
                [
                  1102.05,
                  1642994220
                ],
                [
                  null,
                  1642994280
                ]
            ],
            tags:{
                "name":"1.host.100_test2.net.net0.rx.bytes.avg"
            },
            target:"summarize(sumSeries(1.host.100_test2.net..rx.bytes.avg),'0min','avg')"
          }
        ],
        net_tx:[
          {
            datapoints:[
                [
                  116.64999999999998,
                  1642993740
                ],
                [
                  14.65,
                  1642993800
                ],
                [
                  11.333333333333334,
                  1642993860
                ],
                [
                  35.5,
                  1642993920
                ],
                [
                  224.9333333333333,
                  1642993980
                ],
                [
                  370.84999999999997,
                  1642994040
                ],
                [
                  70.3,
                  1642994100
                ],
                [
                  9.7,
                  1642994160
                ],
                [
                  168,
                  1642994220
                ],
                [
                  null,
                  1642994280
                ]
            ],
            tags:{
                "name":"1.host.100_test2.net.net0.tx.bytes.avg"
            },
            target:"summarize(sumSeries(1.host.100_test2.net..tx.bytes.avg),'0min','avg')"
          }
        ]
      }
    }
  },
  components: {
    Line
  },
  setup() {
  },
  watch: {
    $route(to, from) {
      // clearInterval(this.polling)
      // this.polling = null
    }
  },
  methods: {

  }
}
</script>
<style scoped>
  .box {
    @apply p-6 bg-white rounded-lg w-full;
  }
  .buttonGroup {
    @apply flex border border-gray-300 rounded-md overflow-hidden bg-white;
  }
  .buttonGroup__button {
    @apply px-4 py-3 border-r border-gray-300 bg-white focus:outline-none text-sm text-gray-500;
    @apply hover:bg-gray-100;
  }
  .buttonGroup__button.active {
    @apply bg-green bg-opacity-10 text-green;
  }
</style>
