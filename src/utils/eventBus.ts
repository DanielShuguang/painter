import { InjectionKey, onMounted, onUnmounted } from 'vue'
import { isDev } from './env'

const eventMap = new Map<InjectionKey<unknown> | string, Function>()

export const eventBus = {
  on<T = any>(event: InjectionKey<T> | string, handler: (arg: T) => void) {
    if (eventMap.has(event) && isDev) {
      console.warn(`事件 ${event.toString()} 已存在，原有事件将被覆盖`)
    }
    eventMap.set(event, handler)

    return () => {
      eventMap.delete(event)
    }
  },
  emit<T = any>(event: InjectionKey<T> | string, arg: T) {
    const fn = eventMap.get(event)
    if (fn) {
      fn(arg)
      return true
    }
    return false
  },
  once<T = any>(event: InjectionKey<T> | string, handler: (arg: T) => void) {
    eventMap.set(event, (arg: T) => {
      handler(arg)
      eventMap.delete(event)
    })
  },
  exist(event: InjectionKey<unknown> | string) {
    return eventMap.has(event)
  },
  off(event?: InjectionKey<unknown> | string) {
    if (event) {
      return eventMap.delete(event)
    }
    eventMap.clear()
    return true
  },
  size() {
    return eventMap.size
  }
}

export function useLocalEventBus<T = any>(
  event: InjectionKey<T> | string,
  handler: (arg: T) => void
) {
  onMounted(() => eventBus.on(event, handler))

  onUnmounted(() => eventBus.off(event))

  return () => {
    eventBus.off(event)
  }
}
