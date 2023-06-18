import { PaintFactory } from '@/paint-factory'
import { useDraggable, useEventListener } from '@vueuse/core'
import { Group } from 'konva/lib/Group'
import { Shape } from 'konva/lib/Shape'
import { InjectionKey, ShallowRef, onMounted, onUnmounted, provide, ref, shallowRef } from 'vue'

export const FactoryKey: InjectionKey<Readonly<PaintFactory>> = Symbol('paint-factory')
export function useMountFactory() {
  const factory = PaintFactory.getInstance()

  provide(FactoryKey, factory)

  onUnmounted(() => {
    factory.destroy()
  })

  return { factory }
}

export interface CacheItem {
  type: 'in' | 'out'
  node: Shape
}

export const DrawCacheKey: InjectionKey<ShallowRef<Readonly<CacheItem[]>>> = Symbol('draw-cache')
export const DrawBackupKey: InjectionKey<ShallowRef<Readonly<CacheItem[]>>> = Symbol('draw-backup')
const cacheCount = 20
/**
 * 管理绘制缓存
 * @param factory
 * @returns
 */
export function useDrawCache(factory: PaintFactory) {
  const cache = shallowRef<CacheItem[]>([])
  const backup = shallowRef<CacheItem[]>([])

  provide(DrawCacheKey, cache)
  provide(DrawBackupKey, backup)

  useEventListener('keyup', ev => {
    if (!ev.ctrlKey) return

    const root = factory.getRoot()
    if (!root) return

    if (ev.key === 'z') {
      // 后退操作
      modifyCache(cache, backup, root)
    } else if (ev.key === 'y') {
      // 恢复操作
      modifyCache(backup, cache, root)
    }
  })

  onMounted(() => {
    factory.drawListener(node => {
      cache.value.push({ type: 'in', node })
      if (cache.value.length > cacheCount) {
        const el = cache.value.shift()
        if (!el?.node.parent) {
          el?.node.destroy()
        }
      }
    })
  })

  return { cache, backup }
}

/**
 * 操作缓存
 * @param output
 * @param input
 * @param root
 */
function modifyCache(output: ShallowRef<CacheItem[]>, input: ShallowRef<CacheItem[]>, root: Group) {
  const el = output.value.pop()
  if (el) {
    if (el.type === 'in') {
      el.node.remove()
      input.value.push({ type: 'out', node: el.node })
    } else {
      root.add(el.node)
      input.value.push({ type: 'in', node: el.node })
    }

    if (input.value.length > cacheCount) {
      input.value.shift()
    }
  }
}

/** 控制界面结构拖拽 */
export function useSplitDrag() {
  const defaultValue = 200

  const dragRef = ref<HTMLDivElement>()
  const { style, x } = useDraggable(dragRef, { axis: 'x', initialValue: { x: defaultValue, y: 0 } })

  function handleReset() {
    x.value = defaultValue
  }

  return { style, x, dragRef, handleReset }
}
