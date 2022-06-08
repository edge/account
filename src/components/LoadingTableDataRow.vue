<template>
  <tr>
    <td :colspan="colspan" class="loading__row">Loading...</td>
  </tr>
</template>

<script>
export default {
  name: 'LoadingTableDataRow',
  props: ['colspan']
}
</script>

<style scoped>
.loading__row {
  @apply py-4;
}

@screen lg {
  tr {
    @apply table-row py-0;
  }

  .loading__row {
    @apply text-sm text-center py-4 table-cell align-middle w-full;
  }
}
</style>
