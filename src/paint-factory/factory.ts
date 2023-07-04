import { Group } from 'konva/lib/Group'
import { BaseShape, DrawShapeType } from './base'
import {
  ArrowMove20Filled,
  Circle12Regular,
  DrawText20Regular,
  Line24Filled,
  Oval16Regular,
  PaintBrush16Regular,
  RectangleLandscape12Regular
} from '@vicons/fluent'
import { Component } from 'vue'
import { Shape } from 'konva/lib/Shape'
import { RectShape, CircleShape, LineShape, EllipseShape, TextShape, BrushShape } from './shapes'
import { BaseTools, BrushTools, TextTools } from './toolbars'
import { MoveShape } from './tool-shapes'

export interface ShapeItem {
  shape: BaseShape
  icon: Component
  tip?: string
  toolbar?: Component
}

export class PaintFactory {
  static shapeMap = new Map<DrawShapeType, ShapeItem>()
  static toolMap = new Map<DrawShapeType, ShapeItem>()

  static registerShape(shape: BaseShape, info: Omit<ShapeItem, 'shape'>) {
    this.shapeMap.set(shape.type, { shape, ...info })
  }

  static registerTool(shape: BaseShape, info: Omit<ShapeItem, 'shape' | 'toolbar'>) {
    this.toolMap.set(shape.type, { shape, ...info })
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
    this.getAllShapes().forEach(ins => ins.shape.setGroup(root))
    this.zoomHandler(root)

    return this
  }

  getRoot() {
    return this.root
  }

  getAllShapes() {
    return [...PaintFactory.shapeMap.values(), ...PaintFactory.toolMap.values()]
  }

  private zoomHandler(root: Group) {
    const stage = root.getStage()
    stage?.on('wheel', e => {
      const originScale = root.scale() || { x: 1, y: 1 }
      const offset = e.evt.deltaY < 0 ? -0.05 : 0.05
      root.scale({
        x: +Math.max(originScale.x - offset, 0.2).toFixed(2),
        y: +Math.max(originScale.y - offset, 0.2).toFixed(2)
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
    this.getAllShapes().forEach(ins => {
      this.disposeEvents.push(ins.shape.drawListener(handler))
    })
  }

  private activeType: DrawShapeType | null = null

  get currentType() {
    return this.activeType
  }

  get currentShape() {
    if (this.activeType) {
      const target =
        PaintFactory.shapeMap.get(this.activeType) || PaintFactory.toolMap.get(this.activeType)
      return target?.shape
    }
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
    if (type !== this.activeType) {
      this.currentShape?.deactivate()
      this.activeType = type
      this.currentShape?.activate()
      this.changeShapeEvents.forEach(fn => fn(this.activeType))
    }

    return this
  }

  emit(event: string, arg: object) {
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

PaintFactory.registerTool(new MoveShape(), { icon: ArrowMove20Filled, tip: '拖动' })

PaintFactory.registerShape(new RectShape(), {
  icon: RectangleLandscape12Regular,
  tip: '矩形',
  toolbar: BaseTools
})
PaintFactory.registerShape(new CircleShape(), {
  icon: Circle12Regular,
  tip: '圆形',
  toolbar: BaseTools
})
PaintFactory.registerShape(new LineShape(), { icon: Line24Filled, tip: '直线', toolbar: BaseTools })
PaintFactory.registerShape(new EllipseShape(), {
  icon: Oval16Regular,
  tip: '椭圆',
  toolbar: BaseTools
})
PaintFactory.registerShape(new TextShape(), {
  icon: DrawText20Regular,
  tip: '文字',
  toolbar: TextTools
})
PaintFactory.registerShape(new BrushShape(), {
  icon: PaintBrush16Regular,
  tip: '笔刷',
  toolbar: BrushTools
})
