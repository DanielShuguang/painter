import { Group } from 'konva/lib/Group'
import { DrawBase, DrawShapeType } from './base'
import { DrawCircle } from './circle'
import { DrawRect } from './rect'
import { Shape } from 'konva/lib/Shape'
import { DrawLine } from './line'
import {
  Circle12Regular,
  DrawText20Regular,
  Line24Filled,
  Oval16Regular,
  RectangleLandscape12Regular
} from '@vicons/fluent'
import { Component } from 'vue'
import { DrawEllipse } from './ellipse'
import { DrawText } from './text'

export class PaintFactory {
  static shapeMap = new Map<DrawShapeType, { shape: DrawBase; icon: Component }>()

  static registerShape(drawShape: DrawBase, icon: Component) {
    this.shapeMap.set(drawShape.type, { shape: drawShape, icon })
  }

  private static instance?: PaintFactory

  static getInstance() {
    if (!this.instance) {
      this.instance = new PaintFactory()
    }
    return this.instance
  }

  private root?: Group
  private disposeEvents: Array<() => void> = []
  private changeShapeEvents: Array<(type: DrawShapeType | null) => void> = []

  private constructor() {}

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

  emit(event: string, params?: any) {
    this.root?.getStage()?.fire(event, params)
  }

  destroy() {
    this.currentShape?.deactivate()
    this.disposeEvents.forEach(fn => fn())
    this.root?.getStage()?.off()

    return this
  }
}

PaintFactory.registerShape(new DrawRect(), RectangleLandscape12Regular)
PaintFactory.registerShape(new DrawCircle(), Circle12Regular)
PaintFactory.registerShape(new DrawLine(), Line24Filled)
PaintFactory.registerShape(new DrawEllipse(), Oval16Regular)
PaintFactory.registerShape(new DrawText(), DrawText20Regular)
