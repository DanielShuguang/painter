import Konva from 'konva'
import { Group } from 'konva/lib/Group'
import { Shape } from 'konva/lib/Shape'
import { merge } from 'lodash-es'
import { CommandService } from './command'
import { ContextmenuService } from './contextmenu'

export interface DrawOptions {
  nodeConfig: Konva.NodeConfig
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
  private readonly commandService = new CommandService()
  private readonly contextmenuService = new ContextmenuService()
  abstract readonly type: DrawShapeType

  constructor(opt?: DrawOptions) {
    this._options = merge(this._options, opt || {})
  }

  setGroup(group: Group) {
    this.rootGroup = group

    this.commandService.activeCommands(group)

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

  options(options: DrawOptions): this
  options(): DrawOptions
  options(options?: DrawOptions) {
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

  destroy() {
    this.deactivate()
    this.commandService.cleanCommands()
    this.contextmenuService.cleanMenu()
  }

  protected abstract mount(): void
  protected abstract unmount(): void
}
