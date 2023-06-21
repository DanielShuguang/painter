<script lang="ts" setup>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { NMenu, MenuOption } from 'naive-ui'
import { Vector2d } from 'konva/lib/types'

export interface SlotBinds {
  onContextmenu(ev: MouseEvent): void
}

defineProps<{
  options: MenuOption[]
}>()
defineSlots<{
  default: (obj: SlotBinds) => void
}>()
const emit = defineEmits<{
  (event: 'select', val: string | number, item: MenuOption): void
}>()

const menuRef = ref<HTMLDivElement>()
const showMenu = ref(false)
const position = ref(['0', '0'])
const selectEvents: Array<(val: string | number, item: MenuOption) => void> = []

onClickOutside(menuRef, hide)

function onContextmenu(ev: MouseEvent) {
  show({ x: ev.clientX, y: ev.clientY })

  ev.preventDefault()
}

function handleSelect(val: string | number, item: MenuOption) {
  emit('select', val, item)
  selectEvents.forEach(fn => fn(val, item))
  hide()
}

function show(pos: Vector2d) {
  position.value = [`${pos.x}px`, `${pos.y}px`]
  showMenu.value = true
}

function hide() {
  showMenu.value = false
}

function onSelect(fn: (val: string | number, item: MenuOption) => void) {
  selectEvents.push(fn)
}

defineExpose({
  show,
  hide,
  onSelect
})
</script>

<template>
  <slot v-bind="{ onContextmenu }"></slot>

  <Teleport to="body">
    <Transition appear>
      <div
        v-if="showMenu"
        ref="menuRef"
        class="contextmenu-modal"
        :style="{ transform: `translate(${position.join()})` }"
      >
        <NMenu :options="options" @update-value="handleSelect" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="less">
.contextmenu-modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  background: #fff;
  z-index: 100;
  box-shadow: 0 0 4px 1px #000;
  transition: transform 0.05s ease;
}
</style>
