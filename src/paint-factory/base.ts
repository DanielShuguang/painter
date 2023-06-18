import Konva from 'konva'
import { Group } from 'konva/lib/Group'
import { Shape } from 'konva/lib/Shape'
import { merge } from 'lodash-es'

export interface DrawOptions {
  nodeConfig: Konva.NodeConfig
}

export enum DrawShapeType {
  Rect = 'rect',
  Line = 'line',
  Circle = 'circle',
  Text = 'text',
  Curve = 'curve'
}

export abstract class DrawBase {
  protected _options: DrawOptions = {
    nodeConfig: { stroke: '#000' }
  }
  protected rootGroup?: Group
  protected _isActive = false
  protected eventList: Array<(shape: Shape) => void> = []
  protected disposeEvents: Array<() => void> = []
  abstract readonly type: DrawShapeType

  constructor(opt?: DrawOptions) {
    this._options = merge(this._options, opt || {})
  }

  setGroup(group: Group) {
    this.rootGroup = group

    return this
  }

  isActive() {
    return this._isActive
  }

  drawListener(handler: (node: Shape) => void) {
    this.eventList.push(handler)

    return () => {
      const idx = this.eventList.indexOf(handler)
      this.eventList.splice(idx, 1)
    }
  }

  setOptions(options: DrawOptions) {
    this._options = merge({}, options || {})

    return this
  }

  getOptions() {
    return this._options
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

  protected abstract mount(): void
  protected abstract unmount(): void
}
