import { createApp } from 'vue'
import { Group } from 'konva/lib/Group'
import { Layer } from 'konva/lib/Layer'
import { Stage } from 'konva/lib/Stage'
import { Vector2d } from 'konva/lib/types'

export function addStage() {
  const root = document.createElement('div')
  root.id = 'draw-root'
  root.style.width = '2000px'
  root.style.height = '2000px'
  document.body.appendChild(root)

  const stage = new Stage({ container: root, height: 2000, width: 2000 })
  const layer = new Layer({ id: 'main-layer' })
  stage.add(layer)
  const rootGroup = new Group({ id: 'main-group' })
  layer.add(rootGroup)

  return { stage, layer, rootGroup }
}

export function wait(ms: number) {
  return new Promise(res => {
    setTimeout(() => res(true), ms)
  })
}

export function stageMouseClick(stage: Stage, pos: Vector2d, type: 'click' | 'down' = 'click') {
  if (type === 'click') {
    stage.dispatchEvent(
      new MouseEvent('click', {
        clientX: pos.x,
        clientY: pos.y
      })
    )
  } else {
    stage.dispatchEvent(
      new MouseEvent('mousedown', {
        clientX: pos.x,
        clientY: pos.y
      })
    )
    return () => {
      stage.dispatchEvent(
        new MouseEvent('mouseup', {
          clientX: pos.x,
          clientY: pos.y
        })
      )
    }
  }
}

export function stageMouseMove(stage: Stage, pos: Vector2d) {
  stage.dispatchEvent(
    new MouseEvent('mousemove', {
      clientX: pos.x,
      clientY: pos.y
    })
  )
}

export function stageWheel(stage: Stage, times: number, direction: 'up' | 'down') {
  for (let i = 0; i < times; i++) {
    stage.dispatchEvent(
      new WheelEvent('wheel', direction === 'up' ? { deltaY: -1 } : { deltaY: 1 })
    )
  }
}

export function withSetup<Return>(composable: () => Return) {
  let result: Return
  const app = createApp({
    setup() {
      result = composable()
      // 忽略模板警告
      return () => {}
    }
  })
  app.mount(document.createElement('div'))
  // 返回结果与应用实例
  // 用来测试供给和组件卸载
  return [result!, app] as const
}
