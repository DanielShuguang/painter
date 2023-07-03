import {
  CommandService,
  CommonCommands,
  DrawCircle,
  DrawLine,
  DrawShapeType,
  PaintFactory
} from '@/paint-factory'
import { addStage, stageMouseClick, stageMouseMove, stageWheel } from '../test-utils'
import { Node } from 'konva/lib/Node'
import { Circle } from 'konva/lib/shapes/Circle'
import { Shape } from 'konva/lib/Shape'
import { eventBus } from '@/utils/eventBus'
import { ShowDialogEvent } from '@/components/Layout/composition'

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
    expect(factory.currentShape).instanceOf(DrawLine)
    expect(factory.currentType).toBe(DrawShapeType.Line)
    expect(shapeType).toBe(DrawShapeType.Line)

    cancel()

    factory.active(DrawShapeType.Circle)
    expect(factory.currentShape).instanceOf(DrawCircle)
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
