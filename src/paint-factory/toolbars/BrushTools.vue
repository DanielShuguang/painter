<script lang="ts" setup>
import { NForm, NFormItem, NInputNumber } from 'naive-ui'
import { useShapeOptions } from './common'
import { LineConfig } from 'konva/lib/shapes/Line'

const { options } = useShapeOptions<LineConfig>({
  brushWidth: 4,
  brushType: 'round',
  nodeConfig: {}
})
</script>

<template>
  <NForm class="brush-tools" label-placement="left">
    <NFormItem label="粗细">
      <NInputNumber v-model:value="options.brushWidth" :min="1" :max="70" size="small" />
    </NFormItem>
  </NForm>
</template>
