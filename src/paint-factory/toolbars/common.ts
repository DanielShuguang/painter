import { inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { DrawOptions } from '../base'
import { FactoryKey } from '@/components/Layout/composition'
import { cloneDeep, merge } from 'lodash-es'
import { ShapeConfig } from 'konva/lib/Shape'

/**
 * 通用的 shape options 更新逻辑
 * @param defaultOpt 默认的配置项
 */
export function useShapeOptions<Config extends ShapeConfig = ShapeConfig>(
  defaultOpt: DrawOptions<Config>
) {
  const factory = inject(FactoryKey)!
  const options = ref(cloneDeep(defaultOpt))
  let cancenFn: (() => void) | undefined

  function getShape() {
    return factory.currentShape!
  }

  watch(
    options,
    newVal => {
      const shape = getShape()
      shape.options(cloneDeep(newVal))
    },
    { deep: true }
  )

  onMounted(() => {
    const opt = factory.currentShape?.options() as DrawOptions<Config> | undefined
    if (opt) {
      options.value = merge(options.value, opt)
    }

    cancenFn = factory.onChangeShape(() => {
      const opt = factory.currentShape?.options()
      options.value = defaultOpt as any
      options.value = merge(options.value, opt || {})
    })
  })

  onUnmounted(() => cancenFn?.())

  return { options }
}
