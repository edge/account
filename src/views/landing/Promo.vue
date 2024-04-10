<script setup>
import { effect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

effect(() => {
  const p = route.params.code
  router.replace({ name: 'Create Account', query: { p } })
})
</script>
