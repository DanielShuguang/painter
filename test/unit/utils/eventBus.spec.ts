import { eventBus, useLocalEventBus } from '@/utils/eventBus'
import { nanoid } from 'nanoid'
import { InjectionKey } from 'vue'
import { withSetup } from '../test-utils'

describe('Event bus', () => {
  it('register a string event name', () => {
    const eventName = 'test-event'
    let result = ''
    eventBus.on(eventName, (msg: string) => {
      result = msg
    })

    expect(eventBus.exist(eventName)).toBeTruthy()

    const message = nanoid()
    expect(eventBus.emit(eventName, message)).toBeTruthy()
    expect(result).toBe(message)

    expect(eventBus.off(eventName)).toBeTruthy()
    expect(eventBus.exist(eventName)).toBeFalsy()

    result = ''
    expect(eventBus.emit(eventName, message)).toBeFalsy()
    expect(result).not.toBe(message)

    const dispose = eventBus.on(eventName, (msg: string) => {
      result = msg
    })
    expect(eventBus.exist(eventName)).toBeTruthy()
    dispose()
    expect(eventBus.exist(eventName)).toBeFalsy()
  })

  it('register a symbol event name', () => {
    const eventDesc = 'test-event'
    const eventName: InjectionKey<[string]> = Symbol(eventDesc)
    let result = ''
    eventBus.on(eventName, msg => {
      result = msg
    })

    expect(eventBus.exist(eventName)).toBeTruthy()

    const message = nanoid()
    expect(eventBus.emit(eventName, message)).toBeTruthy()
    expect(result).toBe(message)

    expect(eventBus.off(eventName)).toBeTruthy()
    expect(eventBus.exist(eventName)).toBeFalsy()

    result = ''
    expect(eventBus.emit(eventName, message)).toBeFalsy()
    expect(result).not.toBe(message)

    const dispose = eventBus.on(eventName, msg => {
      result = msg
    })
    expect(eventBus.exist(eventName)).toBeTruthy()
    dispose()
    expect(eventBus.exist(eventName)).toBeFalsy()
  })

  it('close all events', () => {
    const events = ['event1', 'event2', 'event3']
    events.forEach(e => {
      eventBus.on(e, () => {})
    })
    eventBus.on('event1', () => {})

    expect(eventBus.size()).toBe(events.length)
    expect(eventBus.off()).toBeTruthy()
    expect(eventBus.size()).toBe(0)
    events.forEach(e => {
      expect(eventBus.exist(e)).toBeFalsy()
    })
  })

  it('event hook', () => {
    const eventName = 'test-event'
    let result = ''
    const [cancel, app] = withSetup(() =>
      useLocalEventBus(eventName, (msg: string) => {
        result = msg
      })
    )

    const message = nanoid()
    expect(eventBus.emit(eventName, message)).toBeTruthy()
    expect(message).toBe(result)

    cancel()
    expect(eventBus.exist(eventName)).toBeFalsy()

    eventBus.on(eventName, () => {})
    expect(eventBus.exist(eventName)).toBeTruthy()

    app.unmount()
    expect(eventBus.exist(eventName)).toBeFalsy()
  })
})
