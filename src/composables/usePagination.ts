import { ref } from 'vue'

export function usePagination(defaultPageSize = 20) {
  const page = ref(1)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)

  function onPageChange(newPage: number) {
    page.value = newPage
  }

  function onSizeChange(newSize: number) {
    pageSize.value = newSize
    page.value = 1
  }

  function reset() {
    page.value = 1
    total.value = 0
  }

  return {
    page,
    pageSize,
    total,
    onPageChange,
    onSizeChange,
    reset,
  }
}
