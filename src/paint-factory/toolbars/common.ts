import { inject, onMounted, reactive, watch } from 'vue'
import { DrawOptions } from '../base'
import { NodeConfig } from 'konva/lib/Node'
import { FactoryKey } from '@/components/Layout/composition'

export function useShapeOptions<Config extends NodeConfig = NodeConfig>(
  defaultOpt: DrawOptions<Config>
) {
  const factory = inject(FactoryKey)!
  const options = reactive(defaultOpt)

  function getShape() {
    return factory.currentShape!
  }

  watch(
    () => options,
    () => {
      const shape = getShape()
      shape.options(options)
    },
    { deep: true }
  )

  onMounted(() => {
    const opt = factory.currentShape?.options() as DrawOptions<Config> | undefined
    if (opt) {
      Object.assign(options, opt)
    }
  })

  return { options }
}
