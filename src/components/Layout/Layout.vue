<script lang="ts" setup>
import PaintBoard from '../PaintBoard/PaintBoard.vue'
import OperationMenuBar from '../OperationMenuBar.vue'
import { ShowDialogEvent, useDrawCache, useMountFactory, useSplitDrag } from './composition'
import { useDialog } from 'naive-ui'
import { useLocalEventBus } from '@/utils/eventBus'

const { factory } = useMountFactory()
useDrawCache(factory)

const { dragRef, style, x, handleReset } = useSplitDrag()

const dialog = useDialog()

useLocalEventBus(ShowDialogEvent, ({ type, opt }) => dialog[type](opt))
</script>

<template>
  <div class="layout">
    <OperationMenuBar :style="{ width: `${x}px` }" />
    <div class="split-line" ref="dragRef" :style="style" @dblclick="handleReset"></div>
    <PaintBoard />
  </div>
</template>

<style lang="less" scoped>
.layout {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
}

.split-line {
  position: absolute;
  height: 100%;
  width: 3px;
  background: #ccc;
  z-index: 10;
  cursor: e-resize;

  &:hover {
    background: green;
  }
}
</style>
