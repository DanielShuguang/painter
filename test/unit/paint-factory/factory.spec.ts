import {
  CommandService,
  CommonCommands,
  CircleShape,
  LineShape,
  DrawShapeType,
  PaintFactory
} from '@/paint-factory'
import { addStage, stageMouseClick, stageMouseMove, stageWheel } from '../test-utils'
import { Node } from 'konva/lib/Node'
import { Circle } from 'konva/lib/shapes/Circle'
import { Shape } from 'konva/lib/Shape'
import { eventBus } from '@/utils/eventBus'
import { ShowDialogEvent } from '@/components/Layout/composition'
import { Rect } from 'konva/lib/shapes/Rect'
import { positionByScale } from '@/utils/position'

describe('Shape factory test', () => {
  const { rootGroup, stage } = addStage()
  const factory = new PaintFactory()
  factory.setRoot(rootGroup)

  it('active shape', () => {
    expect(factory.getRoot()).toBe(rootGroup)

    let shapeType: DrawShapeType | null = null
    const cancel = factory.onChangeShape(type => {
      shapeType = type
    })

    expect(factory.currentShape).toBeUndefined
    expect(factory.currentType).toBeNull()

    factory.active(DrawShapeType.Line)
    expect(factory.currentShape).instanceOf(LineShape)
    expect(factory.currentType).toBe(DrawShapeType.Line)
    expect(shapeType).toBe(DrawShapeType.Line)

    cancel()

    factory.active(DrawShapeType.Circle)
    expect(factory.currentShape).instanceOf(CircleShape)
    expect(factory.currentType).toBe(DrawShapeType.Circle)
    expect(shapeType).not.toBe(DrawShapeType.Circle)
  })

  it('factory draw listener', () => {
    let currentNode: Node | null = null
    const handler = (node: Node) => {
      currentNode = node
    }
    factory.drawListener(handler)

    factory.active(DrawShapeType.Ellipse)
    expect(factory.currentShape?.listeners[0]).toBe(handler)

    factory.active(DrawShapeType.Circle)
    expect(factory.currentShape?.listeners[0]).toBe(handler)

    stageMouseClick(stage, { x: 400, y: 400 })
    stageMouseMove(stage, { x: 1400, y: 1400 })
    stageMouseClick(stage, { x: 1400, y: 1400 })

    expect(currentNode).instanceOf(Circle)
    rootGroup.destroyChildren()
  })

  it('factory scale event', async () => {
    stageWheel(stage, 5, 'up')
    let scale = rootGroup.scale()!
    expect(scale?.x).toBe(1 + 5 * 0.05)
    expect(scale?.y).toBe(1 + 5 * 0.05)

    document.dispatchEvent(new KeyboardEvent('keyup', { key: '0', ctrlKey: true }))
    scale = rootGroup.scale()!
    expect(scale?.x).toBe(1)
    expect(scale?.y).toBe(1)

    stageWheel(stage, 3, 'down')
    scale = rootGroup.scale()!
    expect(scale?.x).toBe(1 - 3 * 0.05)
    expect(scale?.y).toBe(1 - 3 * 0.05)

    rootGroup.scale({ x: 1, y: 1 })
  })

  it('scale and drag', () => {
    rootGroup.position({ x: 100, y: 100 })
    factory.active(DrawShapeType.Rect)

    stageMouseClick(stage, { x: 100, y: 150 })
    stageMouseMove(stage, { x: 300, y: 450 })
    stageMouseClick(stage, { x: 300, y: 450 })
    expect(rootGroup.findOne<Rect>('Rect').position()).toEqual({ x: 100 - 100, y: 150 - 100 })
    rootGroup.destroyChildren()

    rootGroup.position({ x: 0, y: 0 })
    rootGroup.scale({ x: 1.5, y: 1.5 })
    stageMouseClick(stage, { x: 100, y: 150 })
    stageMouseMove(stage, { x: 300, y: 450 })
    stageMouseClick(stage, { x: 300, y: 450 })
    let expPos = positionByScale({ x: 100, y: 150 }, stage)
    expect(rootGroup.findOne<Rect>('Rect').position()).toEqual(expPos)
    rootGroup.destroyChildren()

    rootGroup.position({ x: 100, y: 100 })
    rootGroup.scale({ x: 1.5, y: 1.5 })
    stageMouseClick(stage, { x: 100, y: 150 })
    stageMouseMove(stage, { x: 300, y: 450 })
    stageMouseClick(stage, { x: 300, y: 450 })
    expPos = positionByScale({ x: 100 - 100, y: 150 - 100 }, stage)
    expect(rootGroup.findOne<Rect>('Rect').position()).toEqual(expPos)
  })

  it('factory command and destroy', async () => {
    rootGroup.destroyChildren()
    const service = new CommandService()
    const addCommandKey = 'test-add-command'
    service.registerCommand(addCommandKey, node => {
      rootGroup.add(node as Shape)
    })

    const nodeId = 'test-circle-1'
    const node = new Circle({ id: nodeId })
    factory.emit(addCommandKey, node)
    expect(rootGroup.findOne(`#${nodeId}`)).toBe(node)

    factory.emit(CommonCommands.Delete, node)
    expect(rootGroup.findOne(`#${nodeId}`)).not.toBe(node)

    let modalType = ''
    eventBus.on(ShowDialogEvent, (type, opt) => {
      modalType = type
      opt.onPositiveClick?.(new MouseEvent('click'))
    })
    factory.emit(CommonCommands.Clean, stage)
    expect(modalType).toBe('warning')
    expect(rootGroup.hasChildren()).toBeFalsy()

    factory.destroy()

    factory.emit(addCommandKey, node)
    expect(rootGroup.hasChildren()).toBeFalsy()

    expect(factory.currentShape?.listeners.length).toBe(0)
  })
})
