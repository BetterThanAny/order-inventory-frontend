<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useProductStore } from '@/stores/product'
import { yuanToCents } from '@/composables/usePrice'
import type { Product } from '@/types/product'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  product: Product | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const productStore = useProductStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isEdit = computed(() => !!props.product)
const title = computed(() => (isEdit.value ? '编辑商品' : '新增商品'))

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = ref({
  sku: '',
  name: '',
  description: '',
  priceYuan: 0,
  is_active: true,
})

const rules: FormRules = {
  sku: [{ required: true, message: '请输入SKU', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  priceYuan: [{ required: true, message: '请输入价格', trigger: 'blur' }],
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.product) {
        form.value = {
          sku: props.product.sku,
          name: props.product.name,
          description: props.product.description ?? '',
          priceYuan: props.product.price_cents / 100,
          is_active: props.product.is_active,
        }
      } else {
        form.value = { sku: '', name: '', description: '', priceYuan: 0, is_active: true }
      }
      formRef.value?.clearValidate()
    }
  },
)

async function onSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const priceCents = yuanToCents(form.value.priceYuan)
    if (isEdit.value && props.product) {
      await productStore.updateProduct(props.product.id, {
        name: form.value.name,
        description: form.value.description || undefined,
        price_cents: priceCents,
        is_active: form.value.is_active,
      })
      ElMessage.success('更新成功')
    } else {
      await productStore.createProduct({
        sku: form.value.sku,
        name: form.value.name,
        description: form.value.description || undefined,
        price_cents: priceCents,
      })
      ElMessage.success('创建成功')
    }
    emit('saved')
  } catch (err: any) {
    const msg = err?.response?.data?.detail || err?.message || '操作失败'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="500px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="SKU" prop="sku">
        <el-input v-model="form.sku" :disabled="isEdit" maxlength="64" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" maxlength="255" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="价格" prop="priceYuan">
        <el-input-number v-model="form.priceYuan" :precision="2" :min="0" :step="1" />
      </el-form-item>
      <el-form-item v-if="isEdit" label="状态">
        <el-switch
          v-model="form.is_active"
          active-text="上架"
          inactive-text="下架"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
