import { useElementSize } from '@vueuse/core'
import { Stage } from 'konva/lib/Stage'
import { ShallowRef, computed, shallowRef, watch } from 'vue'

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
