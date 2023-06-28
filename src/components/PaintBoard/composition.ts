import { HideTextEditorEvent, SaveTextEvent, ShowTextEditorEvent } from '@/paint-factory'
import { eventBus, useLocalEventBus } from '@/utils/eventBus'
import { useElementSize } from '@vueuse/core'
import { Stage } from 'konva/lib/Stage'
import {
  InjectionKey,
  ShallowRef,
  StyleValue,
  computed,
  inject,
  onMounted,
  ref,
  shallowRef,
  watch
} from 'vue'
import Contextmenu from '../Contextmenu.vue'
import { MenuOption } from 'naive-ui'
import { FactoryKey } from '../Layout/composition'
import { KonvaEventObject, Node } from 'konva/lib/Node'
import { getStagePosition } from '@/utils/position'

export const RootGroupId = 'root-group'

export function usePaintBoardSize(stage: ShallowRef<Stage | null>, resizeFn: () => void) {
  const containerRef = shallowRef<HTMLDivElement>()

  const { height, width } = useElementSize(containerRef)

  const containerSize = computed(() => ({ height: height.value, width: width.value }))

  watch(
    containerSize,
    size => {
      if (!containerRef.value) return
      if (!stage.value) {
        stage.value = new Stage({
          container: containerRef.value
        })
        resizeFn()
      }
      stage.value.size(size)
    },
    { immediate: true }
  )

  return { containerRef, containerSize }
}

export function useTextEditor() {
  const showEditor = ref(false)
  const inputValue = ref('')
  const activeId = ref('')
  const style = shallowRef<StyleValue>({ left: '0', top: '0', height: '0', width: '0' })
  const editorRef = ref<HTMLTextAreaElement>()

  function setInputEvents() {
    editorRef.value?.addEventListener('keyup', ev => {
      if (ev.key === 'Escape') {
        showEditor.value = false
      } else if (ev.key === 'Enter' && ev.ctrlKey) {
        eventBus.emit(SaveTextEvent, activeId.value, inputValue.value)
        showEditor.value = false
      }
    })
  }

  useLocalEventBus(ShowTextEditorEvent, (text, position, size) => {
    activeId.value = text.id()
    inputValue.value = ''
    style.value = {
      left: position.x + 'px',
      top: position.y + 'px',
      height: size.height + 'px',
      width: size.width + 'px',
      fontFamily: text.fontFamily(),
      fontSize: text.fontSize(),
      fontStyle: text.fontStyle(),
      padding: text.padding(),
      color: text.fill()
    }
    showEditor.value = true
    setTimeout(() => {
      editorRef.value?.focus()
      setInputEvents()
    })
  })

  useLocalEventBus(HideTextEditorEvent, () => {
    showEditor.value = false
  })

  return { showEditor, style, editorRef, inputValue }
}

export const ContextmenuEvent: InjectionKey<[KonvaEventObject<MouseEvent>, MenuOption[]]> =
  Symbol('contextmenu-event')

/** 控制舞台的右键菜单展示 */
export function useStageContextmenu() {
  const menuRef = ref<InstanceType<typeof Contextmenu>>()
  const menuOptions = shallowRef<MenuOption[]>([])
  const selectNode = shallowRef<Node | null>(null)

  const factory = inject(FactoryKey)

  useLocalEventBus(ContextmenuEvent, (e, opts) => {
    menuRef.value?.show(getStagePosition(e.evt))
    selectNode.value = e.target
    menuOptions.value = opts
  })

  onMounted(() => {
    menuRef.value?.onSelect((_, item) => {
      selectNode.value && factory?.emit(item.key?.toString() ?? '', selectNode.value)
    })
  })

  return { menuRef, menuOptions }
}
