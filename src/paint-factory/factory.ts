import { Group } from 'konva/lib/Group'
import { DrawBase, DrawShapeType } from './base'
import { DrawCircle } from './circle'
import { DrawRect } from './rect'
import { Shape } from 'konva/lib/Shape'
import { DrawLine } from './line'

export class PaintFactory {
  private static shapeMap = new Map<DrawShapeType, DrawBase>()

  static registerShape(drawShape: DrawBase) {
    this.shapeMap.set(drawShape.type, drawShape)
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
    PaintFactory.shapeMap.forEach(ins => ins.setGroup(root))

    return this
  }

  getRoot() {
    return this.root
  }

  drawListener(handler: (node: Shape) => void) {
    PaintFactory.shapeMap.forEach(ins => {
      this.disposeEvents.push(ins.drawListener(handler))
    })
  }

  private activeType: DrawShapeType | null = null

  get currentType() {
    return this.activeType
  }

  get shape() {
    return this.activeType ? PaintFactory.shapeMap.get(this.activeType) : undefined
  }

  onChangeShape(callback: (type: DrawShapeType | null) => void) {
    this.changeShapeEvents.push(callback)

    this.disposeEvents.push(() => {
      this.changeShapeEvents.length = 0
    })
  }

  active(type: DrawShapeType) {
    this.shape?.deactivate()
    this.activeType = type
    this.shape?.activate()
    this.changeShapeEvents.forEach(fn => fn(this.activeType))

    return this
  }

  destroy() {
    this.shape?.deactivate()
    this.disposeEvents.forEach(fn => fn())

    return this
  }
}

PaintFactory.registerShape(new DrawRect())
PaintFactory.registerShape(new DrawCircle())
PaintFactory.registerShape(new DrawLine())
