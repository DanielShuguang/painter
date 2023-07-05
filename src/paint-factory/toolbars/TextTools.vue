<script lang="ts" setup>
import { NForm, NFormItem, NInputNumber, NSelect } from 'naive-ui'
import { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { TextConfig } from 'konva/lib/shapes/Text'
import { useShapeOptions } from './common'

const selectOpt: SelectMixedOption[] = ['normal', 'bold', 'italic', 'italic bold'].map(v => ({
  label: v,
  value: v
}))

const { options } = useShapeOptions<TextConfig>({
  nodeConfig: {
    fontSize: 12
  }
})
</script>

<template>
  <NForm label-placement="left">
    <NFormItem label="风格">
      <NSelect :options="selectOpt" v-model:value="options.nodeConfig.fontStyle" />
    </NFormItem>
    <NFormItem label="字号">
      <NInputNumber v-model:value="options.nodeConfig.fontSize" :min="10" :max="50" />
    </NFormItem>
  </NForm>
</template>
