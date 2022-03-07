<template>
  <div class="box">
    <h4>Public Network</h4>
    <div class="mt-4 overflow-hidden border border-gray-300 rounded-lg">
      Anybody can access the VM via these public addresses

      <pre>{{server.ipv4}}</pre>
      <dl>
        <dt>PUBLIC IPV4</dt>
        <dd>{{server.ipv4[0].ip_addr}}</dd>
        <dt>PUBLIC GATEWAY</dt>
        <dd>{{server.ipv4[0].gateway}}</dd>
        <dt>SUBNET MASK</dt>
        <dd>{{server.ipv4[0].mask}}</dd>
      </dl>
    </div>

  </div>
</template>

<script>


export default {
  name: 'ServerNetworking',
  components: {
    
  },
  props: ['activeTask', 'server'],
  data: function () {
    return {
      history: [],
      isSaving: false,
      feedback: '',
      showFeedback: false
    }
  },
  methods: {
    async save () {
      this.isSaving = true
    }
  }
}
</script>
<style scoped>
  .box {
    @apply bg-white rounded-lg w-full overflow-auto p-4 md:p-6;
  }

  /*DL, DT, DD TAGS LIST DATA*/
  dl {
      margin-bottom:50px;
  }
  
  dl dt {
      background:#5f9be3;
      color:#fff;
      float:left; 
      font-weight:bold; 
      margin-right:10px; 
      padding:5px;  
  }
  
  dl dd {
      margin:2px 0; 
      padding:5px 0;
  }
</style>
