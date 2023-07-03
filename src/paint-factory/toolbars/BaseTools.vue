<script lang="ts" setup>
import { NForm, NFormItem, NInputNumber } from 'naive-ui'
import { useShapeOptions } from './common'
import { ShapeConfig } from 'konva/lib/Shape'

const { options } = useShapeOptions<ShapeConfig>({ nodeConfig: { strokeWidth: 2 } })
</script>

<template>
  <NForm>
    <NFormItem label="粗细">
      <NInputNumber v-model:value="options.nodeConfig.strokeWidth" :min="1" :max="30" />
    </NFormItem>
  </NForm>
</template>
