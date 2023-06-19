import { Group } from 'konva/lib/Group'
import { DrawBase, DrawShapeType } from './base'
import { DrawCircle } from './circle'
import { DrawRect } from './rect'
import { Shape } from 'konva/lib/Shape'
import { DrawLine } from './line'
import { Circle12Regular, Line24Filled, RectangleLandscape12Regular } from '@vicons/fluent'
import { Component } from 'vue'

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

    return this
  }

  getRoot() {
    return this.root
  }

  drawListener(handler: (node: Shape) => void) {
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
  }

  active(type: DrawShapeType) {
    this.currentShape?.deactivate()
    this.activeType = type
    this.currentShape?.activate()
    this.changeShapeEvents.forEach(fn => fn(this.activeType))

    return this
  }

  destroy() {
    this.currentShape?.deactivate()
    this.disposeEvents.forEach(fn => fn())

    return this
  }
}

PaintFactory.registerShape(new DrawRect(), RectangleLandscape12Regular)
PaintFactory.registerShape(new DrawCircle(), Circle12Regular)
PaintFactory.registerShape(new DrawLine(), Line24Filled)
