<script lang="ts" setup>
import { ChangeColorEvent, DrawShapeType, PaintFactory } from '@/paint-factory'
import { NButton, NColorPicker, useMessage } from 'naive-ui'
import { IconConfigProvider, Icon } from '@vicons/utils'
import { FactoryKey } from './Layout/composition'
import { computed, inject, ref } from 'vue'
import { downloadCanvas } from '@/utils/downloadCanvas'

const colorValue = ref('#000000')
const activeShape = ref<DrawShapeType | null>(DrawShapeType.Rect)

const factory = inject(FactoryKey)

const message = useMessage()

function handleChangeShape(type: DrawShapeType) {
  factory?.active(type).emit(ChangeColorEvent, { color: colorValue.value })
}

function handleChangeColor() {
  factory?.emit(ChangeColorEvent, { color: colorValue.value })
}

factory?.onChangeShape(type => {
  activeShape.value = type
})

const currentShapeInfo = computed(() =>
  activeShape.value ? PaintFactory.shapeMap.get(activeShape.value) : null
)

/** 保存当前画板内容 */
function handleSaveImage() {
  const canvas = document.querySelector('canvas')
  if (canvas) {
    downloadCanvas(canvas, 'paint.jpg').catch(err => {
      message.error(err)
    })
  }
}
</script>

<template>
  <div class="operation-menu-bar">
    <IconConfigProvider size="22" color="skyblue">
      <div class="title">颜色</div>
      <NColorPicker
        v-model:value="colorValue"
        :show-alpha="false"
        :actions="['confirm']"
        @complete="handleChangeColor"
      />
      <div class="title">操作</div>
      <div class="draw-shape-selection">
        <span
          v-for="[k, v] of PaintFactory.toolMap.entries()"
          :key="k"
          :class="['tool-icon', { 'is-active': activeShape === k }]"
          :title="v.tip"
          @click="activeShape !== k && handleChangeShape(k)"
        >
          <Icon>
            <component :is="v.icon" />
          </Icon>
        </span>
      </div>
      <div class="title">形状</div>
      <div class="draw-shape-selection">
        <span
          v-for="[k, v] of PaintFactory.shapeMap.entries()"
          :key="k"
          :title="v.tip"
          :class="['shape-icon', { 'is-active': activeShape === k }]"
          @click="activeShape !== k && handleChangeShape(k)"
        >
          <Icon>
            <component :is="v.icon" />
          </Icon>
        </span>
      </div>
      <template v-if="activeShape && currentShapeInfo?.toolbar">
        <div class="title">配置</div>
        <div class="shape-toolbar">
          <component :is="currentShapeInfo.toolbar" />
        </div>
      </template>
    </IconConfigProvider>
    <NButton class="download-btn" type="primary" @click="handleSaveImage">保存</NButton>
  </div>
</template>

<style scoped lang="less">
.operation-menu-bar {
  position: relative;
  width: 200px;
  height: 100%;
  margin-right: 3px;
  padding: 4px;
  box-sizing: border-box;
}

.draw-shape-selection {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.title {
  width: 100%;
  padding: 5px;
  font-size: 16px;
  font-weight: bold;
}

.shape-icon,
.tool-icon {
  display: inline-flex;
  padding: 3px 5px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    box-shadow: inset 0 0 4px #000;
  }

  &.is-active {
    box-shadow: inset 0 0 4px green;
    cursor: auto;
  }
}

.download-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
}
</style>
