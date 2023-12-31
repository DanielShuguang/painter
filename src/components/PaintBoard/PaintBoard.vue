<script lang="ts" setup>
import { Group } from 'konva/lib/Group'
import { Layer } from 'konva/lib/Layer'
import { Stage } from 'konva/lib/Stage'
import { inject, shallowRef } from 'vue'
import { DrawShapeType } from '../../paint-factory'
import { RootGroupId, usePaintBoardSize, useStageContextmenu, useTextEditor } from './composition'
import { FactoryKey } from '../Layout/composition'
import Contextmenu from '../Contextmenu.vue'

const stage = shallowRef<Stage | null>(null)

const factory = inject(FactoryKey)
const { showEditor, style, editorRef, inputValue } = useTextEditor()
const { containerRef } = usePaintBoardSize(stage, () => stage.value && initStage(stage.value))
const { menuRef, menuOptions } = useStageContextmenu()

function initStage(s: Stage) {
  const layer = new Layer({
    id: 'main-layer'
  })
  s.add(layer)

  const rootGroup = new Group({ id: RootGroupId })
  layer.add(rootGroup)
  factory?.setRoot(rootGroup).active(DrawShapeType.Rect)
}
</script>

<template>
  <div class="paint-board">
    <Contextmenu ref="menuRef" :options="menuOptions">
      <div class="paint-container" ref="containerRef" @contextmenu.prevent></div>
    </Contextmenu>
    <textarea
      v-if="showEditor"
      ref="editorRef"
      class="canvas-input"
      :style="style"
      v-model="inputValue"
    />
  </div>
</template>

<style scoped lang="less">
.paint-board {
  position: relative;
  flex: auto;
  height: 100%;
  overflow: hidden;
}

.paint-container {
  height: 100%;
  width: 100%;
}

.canvas-input {
  position: absolute;
  z-index: 5;
  resize: none;
  border: none;
}
</style>
