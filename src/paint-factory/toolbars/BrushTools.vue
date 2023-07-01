<script lang="ts" setup>
import { FactoryKey } from '@/components/Layout/composition'
import { inject, onMounted, ref, watch } from 'vue'
import { DrawBrush } from '../shapes/brush'
import { NForm, NFormItem, NInputNumber } from 'naive-ui'
import { LineConfig } from 'konva/lib/shapes/Line'
import { DrawOptions } from '../base'
import { merge } from 'lodash-es'

const factory = inject(FactoryKey)!
const options = ref<DrawOptions<LineConfig>>({
  brushWidth: 4,
  brushType: 'round',
  nodeConfig: {
    stroke: '#000000'
  }
})

function getShape() {
  return factory.currentShape as DrawBrush
}

watch(
  options,
  () => {
    const shape = getShape()
    shape.options(options.value)
  },
  { deep: true }
)

onMounted(() => {
  const opt = factory.currentShape?.options()
  options.value = merge({}, options.value, opt)
})
</script>

<template>
  <NForm class="brush-tools" label-placement="left">
    <NFormItem label="粗细">
      <NInputNumber v-model:value="options.brushWidth" size="small" />
    </NFormItem>
  </NForm>
</template>

<style scoped lang="less"></style>
