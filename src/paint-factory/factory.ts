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
import { Node } from 'konva/lib/Node'

export class PaintFactory {
  static shapeMap = new Map<DrawShapeType, { shape: DrawBase; icon: Component; tip?: string }>()

  static registerShape(drawShape: DrawBase, icon: Component, tip?: string) {
    this.shapeMap.set(drawShape.type, { shape: drawShape, icon, tip })
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

  emit(event: string, node: Node) {
    this.root?.getStage()?.fire(event, node)
  }

  destroy() {
    this.currentShape?.deactivate()
    this.disposeEvents.forEach(fn => fn())
    this.root?.getStage()?.off()

    return this
  }
}

PaintFactory.registerShape(new DrawRect(), RectangleLandscape12Regular, '矩形')
PaintFactory.registerShape(new DrawCircle(), Circle12Regular, '圆形')
PaintFactory.registerShape(new DrawLine(), Line24Filled, '直线')
PaintFactory.registerShape(new DrawEllipse(), Oval16Regular, '椭圆')
PaintFactory.registerShape(new DrawText(), DrawText20Regular, '文字')
PaintFactory.registerShape(new DrawBrush(), PaintBrush16Regular, '笔刷')
