import { Group } from 'konva/lib/Group'
import { Shape } from 'konva/lib/Shape'
import { merge } from 'lodash-es'
import { CommandService } from './command'
import { ContextmenuOption, ContextmenuService } from './contextmenu'
import { Stage } from 'konva/lib/Stage'
import { Layer } from 'konva/lib/Layer'
import { RootGroupId } from '@/components/PaintBoard/composition'
import { Node, NodeConfig } from 'konva/lib/Node'
import { eventBus } from '@/utils/eventBus'
import { CleanCacheEvent, ShowDialogEvent, UpdateCacheEvent } from '@/components/Layout/composition'

export interface DrawOptions<Config = NodeConfig> {
  nodeConfig: Config
}

export enum DrawShapeType {
  Rect = 'rect',
  Line = 'line',
  Circle = 'circle',
  Text = 'text',
  Ellipse = 'ellipse',
  Curve = 'curve'
}

export abstract class DrawBase {
  protected _options: DrawOptions = {
    nodeConfig: { stroke: '#000' }
  }
  protected rootGroup?: Group
  protected _isActive = false
  protected eventList: Array<(shape: Shape | Group) => void> = []
  protected disposeEvents: Array<() => void> = []
  protected readonly commandService = new CommandService()
  protected readonly contextmenuService = new ContextmenuService()
  abstract readonly type: DrawShapeType

  constructor(opt?: DrawOptions) {
    this._options = merge(this._options, opt || {})
  }

  setGroup(group: Group) {
    this.rootGroup = group

    this.commandService.activeCommands(group)
    this.contextmenuService.activeMenus(group)
    this.registerMenus(menu => this.contextmenuService.registerMenu(menu))
    this.registerCommands((key, handler) => this.commandService.registerCommand(key, handler))
    registerCommonCommands(this.commandService)
    registerCommonMenus(this.contextmenuService)

    return this
  }

  isActive() {
    return this._isActive
  }

  drawListener(handler: (node: Shape | Group) => void) {
    this.eventList.push(handler)

    return () => {
      const idx = this.eventList.indexOf(handler)
      this.eventList.splice(idx, 1)
    }
  }

  options<Config = NodeConfig>(options: DrawOptions<Config>): this
  options<Config = NodeConfig>(): DrawOptions<Config>
  options<Config = NodeConfig>(options?: DrawOptions<Config>) {
    if (options) {
      this._options = merge({}, this._options, options)
      return this
    } else {
      return this._options
    }
  }

  activate() {
    this._isActive = true
    this.mount()

    return this
  }

  deactivate() {
    this._isActive = false
    this.unmount()
    this.disposeEvents.forEach(fn => fn())

    return this
  }

  protected registerMenus(_reigister: (menu: ContextmenuOption) => void) {}

  protected registerCommands(_reigister: (key: string, handler: () => void) => void) {}

  destroy() {
    this.deactivate()
    this.commandService.cleanCommands()
    this.contextmenuService.cleanMenu()
  }

  protected abstract mount(): void
  protected abstract unmount(): void
}

function commonSelector(node: Node) {
  const isMainContainer =
    node instanceof Stage ||
    node instanceof Layer ||
    (node instanceof Group && node.id() === RootGroupId)

  return !isMainContainer
}

function registerCommonMenus(service: ContextmenuService) {
  service
    .registerMenu({
      key: 'base-common:delete',
      title: '删除',
      selector: commonSelector
    })
    .registerMenu({
      key: 'base-common:clean',
      title: '重置',
      selector: () => true
    })
}

function registerCommonCommands(service: CommandService) {
  service
    .registerCommand('base-common:delete', deleteShape)
    .registerCommand('base-common:clean', cleanPainter)
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
