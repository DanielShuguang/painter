<script lang="ts" setup>
import { DrawShapeType } from '@/paint-factory'
import { NColorPicker } from 'naive-ui'
import { RectangleLandscape12Regular, Circle12Regular, Line20Regular } from '@vicons/fluent'
import { IconConfigProvider, Icon } from '@vicons/utils'
import { FactoryKey } from './Layout/composition'
import { inject, ref } from 'vue'

const colorValue = ref('#000000')
const activeShape = ref<DrawShapeType | null>(DrawShapeType.Rect)

const factory = inject(FactoryKey)

function handleChangeShape(type: DrawShapeType) {
  factory?.active(type).shape?.setOptions({ nodeConfig: { stroke: colorValue.value } })
}

function handleChangeColor() {
  factory?.shape?.setOptions({ nodeConfig: { stroke: colorValue.value } })
}

factory?.onChangeShape(type => {
  activeShape.value = type
})
</script>

<template>
  <div class="operation-menu-bar">
    <NColorPicker
      v-model:value="colorValue"
      :show-alpha="false"
      :actions="['confirm']"
      @complete="handleChangeColor"
    />
    <IconConfigProvider size="22" color="skyblue">
      <div class="draw-shape-selection">
        <Icon
          :class="['shape-icon', { 'is-active': activeShape === DrawShapeType.Rect }]"
          title="矩形"
          @click="handleChangeShape(DrawShapeType.Rect)"
        >
          <RectangleLandscape12Regular />
        </Icon>
        <Icon
          :class="['shape-icon', { 'is-active': activeShape === DrawShapeType.Circle }]"
          title="圆形"
          @click="handleChangeShape(DrawShapeType.Circle)"
        >
          <Circle12Regular />
        </Icon>
        <Icon
          :class="['shape-icon', { 'is-active': activeShape === DrawShapeType.Line }]"
          title="直线"
          @click="handleChangeShape(DrawShapeType.Line)"
        >
          <Line20Regular />
        </Icon>
      </div>
    </IconConfigProvider>
  </div>
</template>

<style scoped lang="less">
.operation-menu-bar {
  width: 200px;
  height: 100%;
}

.shape-icon {
  padding: 3px 5px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    box-shadow: inset 0 0 4px #000;
  }

  &.is-active {
    box-shadow: inset 0 0 4px green;
  }
}
</style>
