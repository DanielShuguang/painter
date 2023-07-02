import { Group } from 'konva/lib/Group'
import { DrawBase, DrawShapeType } from './base'
import {
  Circle12Regular,
  DrawText20Regular,
  Line24Filled,
  Oval16Regular,
  PaintBrush16Regular,
  RectangleLandscape12Regular
} from '@vicons/fluent'
import { Component } from 'vue'
import { Shape } from 'konva/lib/Shape'
import { DrawRect, DrawCircle, DrawLine, DrawEllipse, DrawText, DrawBrush } from './shapes'
import { BrushTools, TextTools } from './toolbars'

export interface ShapeItem {
  shape: DrawBase
  icon: Component
  tip?: string
  toolbar?: Component
}

export class PaintFactory {
  static shapeMap = new Map<DrawShapeType, ShapeItem>()

  static registerShape(shape: DrawBase, info: Omit<ShapeItem, 'shape'>) {
    this.shapeMap.set(shape.type, { shape, ...info })
  }

  private static instance?: PaintFactory

  private root?: Group
  private disposeEvents: Array<() => void> = []
  private changeShapeEvents: Array<(type: DrawShapeType | null) => void> = []

  constructor() {
    if (!PaintFactory.instance) {
      PaintFactory.instance = this
    }
    return PaintFactory.instance
  }

  setRoot(root: Group) {
    this.root = root
    PaintFactory.shapeMap.forEach(ins => ins.shape.setGroup(root))
    this.zoomHandler(root)

    return this
  }

  getRoot() {
    return this.root
  }

  private zoomHandler(root: Group) {
    const stage = root.getStage()
    stage?.on('wheel', e => {
      const originScale = root.scale() || { x: 1, y: 1 }
      const offset = e.evt.deltaY < 0 ? -0.05 : 0.05
      root.scale({
        x: Math.max(originScale.x - offset, 0.2),
        y: Math.max(originScale.y - offset, 0.2)
      })
    })

    const handler = (ev: KeyboardEvent) => {
      if (ev.ctrlKey && ev.key === '0') {
        root.scale({ x: 1, y: 1 })
      }
    }
    document.addEventListener('keyup', handler)
    this.disposeEvents.push(() => document.removeEventListener('keyup', handler))
  }

  drawListener(handler: (node: Shape | Group) => void) {
    PaintFactory.shapeMap.forEach(ins => {
      this.disposeEvents.push(ins.shape.drawListener(handler))
    })
  }

  private activeType: DrawShapeType | null = null

  get currentType() {
    return this.activeType
  }

  get currentShape() {
    return this.activeType ? PaintFactory.shapeMap.get(this.activeType)?.shape : undefined
  }

  onChangeShape(callback: (type: DrawShapeType | null) => void) {
    this.changeShapeEvents.push(callback)

    this.disposeEvents.push(() => {
      this.changeShapeEvents.length = 0
    })

    return () => {
      const index = this.changeShapeEvents.indexOf(callback)
      this.changeShapeEvents.splice(index, 1)
    }
  }

  active(type: DrawShapeType) {
    this.currentShape?.deactivate()
    this.activeType = type
    this.currentShape?.activate()
    this.changeShapeEvents.forEach(fn => fn(this.activeType))

    return this
  }

  emit(event: string, arg: any) {
    this.root?.getStage()?.fire(event, arg)
  }

  destroy() {
    this.currentShape?.deactivate()
    this.disposeEvents.forEach(fn => fn())
    this.root?.getStage()?.off()
    this.root?.destroy()
    this.root = undefined

    return this
  }
}

PaintFactory.registerShape(new DrawRect(), { icon: RectangleLandscape12Regular, tip: '矩形' })
PaintFactory.registerShape(new DrawCircle(), { icon: Circle12Regular, tip: '圆形' })
PaintFactory.registerShape(new DrawLine(), { icon: Line24Filled, tip: '直线' })
PaintFactory.registerShape(new DrawEllipse(), { icon: Oval16Regular, tip: '椭圆' })
PaintFactory.registerShape(new DrawText(), {
  icon: DrawText20Regular,
  tip: '文字',
  toolbar: TextTools
})
PaintFactory.registerShape(new DrawBrush(), {
  icon: PaintBrush16Regular,
  tip: '笔刷',
  toolbar: BrushTools
})
