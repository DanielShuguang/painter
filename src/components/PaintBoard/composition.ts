import { HideTextEditorEvent, SaveTextEvent, ShowTextEditorEvent } from '@/paint-factory'
import { eventBus } from '@/utils/eventBus'
import { useElementSize } from '@vueuse/core'
import { Stage } from 'konva/lib/Stage'
import {
  ShallowRef,
  StyleValue,
  computed,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch
} from 'vue'

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
      } else if (ev.key === 'Enter') {
        if (ev.ctrlKey) {
          inputValue.value += '\n'
        } else {
          eventBus.emit(SaveTextEvent, activeId.value, inputValue.value)
          showEditor.value = false
        }
      }
    })
  }

  onMounted(() => {
    eventBus.on(ShowTextEditorEvent, (text, position, size) => {
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

    eventBus.on(HideTextEditorEvent, () => {
      showEditor.value = false
    })
  })

  onUnmounted(() => {
    eventBus.off(ShowTextEditorEvent)
    eventBus.off(HideTextEditorEvent)
  })

  return { showEditor, style, editorRef, inputValue }
}
