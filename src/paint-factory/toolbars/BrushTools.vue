<script lang="ts" setup>
import { NForm, NFormItem, NInputNumber, NSelect } from 'naive-ui'
import { useShapeOptions } from './common'
import { LineConfig } from 'konva/lib/shapes/Line'
import { SelectMixedOption } from 'naive-ui/es/select/src/interface'

const { options } = useShapeOptions<LineConfig>({
  brushWidth: 4,
  brushType: 'round',
  nodeConfig: {}
})

const typeList: SelectMixedOption[] = [
  { label: '圆润', value: 'round' },
  { label: '方正', value: 'sqaure' }
]
</script>

<template>
  <NForm class="brush-tools" label-placement="left">
    <NFormItem label="笔头">
      <NSelect v-model:value="options.brushType" :options="typeList" />
    </NFormItem>
    <NFormItem label="粗细">
      <NInputNumber v-model:value="options.brushWidth" :min="1" :max="70" size="small" />
    </NFormItem>
  </NForm>
</template>
