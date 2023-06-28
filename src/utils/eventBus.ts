import { InjectionKey, onMounted, onUnmounted } from 'vue'

const eventMap = new Map<InjectionKey<unknown> | string, Function>()

export const eventBus = {
  on<T extends any[]>(event: InjectionKey<T> | string, handler: (...args: T) => void) {
    if (eventMap.has(event)) {
      console.warn(`事件 ${event.toString()} 已存在，原有事件将被覆盖`)
    }
    eventMap.set(event, handler)

    return () => {
      eventMap.delete(event)
    }
  },
  emit<T extends any[]>(event: InjectionKey<T> | string, ...args: T) {
    const fn = eventMap.get(event)
    if (fn) {
      fn(...args)
      return true
    }
    return false
  },
  once<T extends any[]>(event: InjectionKey<T> | string, handler: (...args: T) => void) {
    eventMap.set(event, (...args: T) => {
      handler(...args)
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

export function useLocalEventBus<T extends any[]>(
  event: InjectionKey<T> | string,
  handler: (...args: T) => void
) {
  onMounted(() => eventBus.on(event, handler))

  onUnmounted(() => eventBus.off(event))

  return () => {
    eventBus.off(event)
  }
}
