import { Group } from 'konva/lib/Group'
import { Shape, ShapeConfig } from 'konva/lib/Shape'
import { cloneDeep, merge } from 'lodash-es'
import { CommandService } from './command'
import { ContextmenuOption, ContextmenuService } from './contextmenu'
import { Stage } from 'konva/lib/Stage'
import { Layer } from 'konva/lib/Layer'
import { RootGroupId } from '@/components/PaintBoard/composition'
import { Node } from 'konva/lib/Node'
import { eventBus } from '@/utils/eventBus'
import { CleanCacheEvent, ShowDialogEvent, UpdateCacheEvent } from '@/components/Layout/composition'

export interface DrawOptions<Config extends ShapeConfig = ShapeConfig> {
  brushWidth?: number
  brushType?: 'round' | 'square'
  colorKey?: string | string[]
  nodeConfig: Config
}

export const ChangeColorEvent = 'custom-change-color'

export enum DrawShapeType {
  Rect = 'rect',
  Line = 'line',
  Circle = 'circle',
  Text = 'text',
  Ellipse = 'ellipse',
  Brush = 'brush',

  Move = 'move',
  Select = 'select'
}

export type MenuRegisterFn = (menu: ContextmenuOption) => void
export type CommandRegisterFn = (key: string, handler: () => void) => void

export abstract class BaseShape {
  protected _options: DrawOptions = {
    colorKey: 'stroke',
    nodeConfig: { stroke: '#000', strokeWidth: 2 }
  }
  protected rootGroup?: Group
  protected _isActive = false
  /** 绘图完成时需要触发的事件列表 */
  protected eventList: Array<(shape: Shape | Group) => void> = []
  /** 图形工具失活时需要进行的任务，可用于资源清理和事件卸载 */
  protected disposeEvents: Array<() => void> = []
  protected readonly commandService = new CommandService()
  protected readonly contextmenuService = new ContextmenuService()
  abstract readonly type: DrawShapeType

  constructor(opt?: DrawOptions) {
    this._options = merge(this._options, opt || {})
  }

  /**
   * 设置根 group，所有的图形均存放在该 group 下
   * @param group
   */
  setGroup(group: Group) {
    this.rootGroup = group

    this.commandService.activeCommands(group)
    this.contextmenuService.activeMenus(group)
    this.registerMenus(menu => this.contextmenuService.registerMenu(menu))
    this.registerCommands((...args) => this.commandService.registerCommand(...args))
    registerCommonCommands(this.commandService)
    registerCommonMenus(this.contextmenuService)

    return this
  }

  isActive() {
    return this._isActive
  }

  /**
   * 注册绘图完成后的通知事件
   * @param handler
   */
  drawListener(handler: (node: Shape | Group) => void) {
    this.eventList.push(handler)

    return () => {
      const idx = this.eventList.indexOf(handler)
      this.eventList.splice(idx, 1)
    }
  }

  get listeners() {
    return this.eventList
  }

  cleanListeners() {
    this.eventList.length = 0
    return this
  }

  /** 根据事件修改绘图工具的颜色信息 */
  protected changeColor() {
    this.rootGroup?.getStage()?.on(ChangeColorEvent, (e: any) => {
      const key = this.options().colorKey
      if (!key) {
        this._options.nodeConfig.stroke = e.color
      } else if (typeof key === 'string') {
        this._options.nodeConfig[key] = e.color
      } else {
        key.forEach(k => {
          this._options.nodeConfig[k] = e.color
        })
      }
    })
  }

  options(options: DrawOptions): this
  options(): DrawOptions
  options(options?: DrawOptions) {
    if (options) {
      this._options = merge({}, this._options, options)
      return this
    } else {
      return cloneDeep(this._options)
    }
  }

  activate() {
    this._isActive = true
    this.changeColor()
    this.mount()
    this.disposeEvents.push(() => this.rootGroup?.getStage()?.off(ChangeColorEvent))

    return this
  }

  deactivate() {
    this._isActive = false
    this.unmount()
    this.disposeEvents.forEach(fn => fn())

    return this
  }

  /**
   * 批量注册菜单
   * @param reigister 注册函数
   */
  // @ts-expect-error
  protected registerMenus(reigister: MenuRegisterFn) {}

  /**
   * 批量注册命令
   * @param reigister 注册函数
   */
  // @ts-expect-error
  protected registerCommands(reigister: CommandRegisterFn) {}

  destroy() {
    this.deactivate()
    this.eventList.length = 0
    this.commandService.cleanCommands()
    this.contextmenuService.cleanMenu()
  }

  protected abstract mount(): void
  protected abstract unmount(): void
}

export enum CommonCommands {
  Delete = 'base-common:delete',
  Clean = 'base-common:clean',
  ResetScale = 'base-common:reset-scale'
}

/** 所有情况的下公共菜单 */
function registerCommonMenus(service: ContextmenuService) {
  service
    .registerMenu({
      key: 'base-common:divider',
      type: 'divider',
      selector: commonSelector
    })
    .registerMenu({
      key: CommonCommands.Delete,
      label: '删除',
      selector: commonSelector
    })
    .registerMenu({
      key: CommonCommands.Clean,
      label: '清空',
      selector: () => true
    })
    .registerMenu({
      key: CommonCommands.ResetScale,
      label: '重置缩放',
      selector: scaleSelector
    })
}

/** 所有情况的下公共命令 */
function registerCommonCommands(service: CommandService) {
  service
    .registerCommand(CommonCommands.Delete, deleteShape)
    .registerCommand(CommonCommands.Clean, cleanPainter)
    .registerCommand(CommonCommands.ResetScale, resetScale)
}

function commonSelector(node: Node) {
  const isMainContainer =
    node instanceof Stage ||
    node instanceof Layer ||
    (node instanceof Group && node.id() === RootGroupId)

  return !isMainContainer
}

function scaleSelector(node: Node) {
  const stage = node instanceof Stage ? node : node.getStage()
  const scale = stage?.findOne(`#${RootGroupId}`).scale() || { x: 1, y: 1 }
  return scale.x !== 1 || scale.y !== 1
}

function deleteShape(node: Node) {
  node.remove()
  eventBus.emit(UpdateCacheEvent, { type: 'out', node })
}

function cleanPainter(node: Node) {
  eventBus.emit(ShowDialogEvent, 'warning', {
    title: '警告',
    content: '重置将删除所有的图形且不可恢复',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      const stage = node.getStage()
      const rootGroup = stage?.findOne<Group>(`#${RootGroupId}`)
      rootGroup?.destroyChildren()
      eventBus.emit(CleanCacheEvent)
    }
  })
}

function resetScale(node: Node) {
  const stage = node instanceof Stage ? node : node.getStage()
  stage?.findOne(`#${RootGroupId}`)?.scale({ x: 1, y: 1 })
}
