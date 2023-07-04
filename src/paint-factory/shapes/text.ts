import { Rect } from 'konva/lib/shapes/Rect'
import { ChangeColorEvent, BaseShape, DrawOptions, DrawShapeType } from '../base'
import { Text, TextConfig } from 'konva/lib/shapes/Text'
import { nanoid } from 'nanoid'
import { KonvaEventObject } from 'konva/lib/Node'
import { Group } from 'konva/lib/Group'
import { getRelativePosition } from '@/utils/position'
import { Vector2d } from 'konva/lib/types'
import { InjectionKey } from 'vue'
import { eventBus } from '@/utils/eventBus'

export const ShowTextEditorEvent: InjectionKey<
  [Text, Vector2d, { height: number; width: number }]
> = Symbol('show-text-editor')
export const HideTextEditorEvent: InjectionKey<[]> = Symbol('hide-text-editor')
export const SaveTextEvent: InjectionKey<[string, string]> = Symbol('save-text')

const activeStroke = '#ccc'
export const textGroupName = 'text-group'
export const textRectName = 'text-border-rect'
export const textName = 'text-content'

export class TextShape extends BaseShape {
  readonly type = DrawShapeType.Text

  protected _options: DrawOptions<TextConfig> = {
    colorKey: 'fill',
    nodeConfig: {
      fill: '#000',
      fontFamily: 'monospace',
      fontStyle: 'normal',
      padding: 4,
      fontSize: 12
    }
  }

  protected changeColor() {
    this.rootGroup?.getStage()?.on(ChangeColorEvent, (e: any) => {
      this._options.nodeConfig.fill = e.color
    })
  }

  protected mount() {
    const stage = this.rootGroup?.getStage()
    let startPos = { x: 0, y: 0 }
    let group: Group | null = null
    let textBox: Rect | null = null
    let text: Text | null = null

    stage?.on('click.drawText', (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return

      if (textBox && text && group) {
        openTextInput(group, textBox, text)
        this.eventList.forEach(fn => fn(group!))
        textBox.stroke('transparent')
        group = null
        textBox = null
        text = null
        return
      }

      eventBus.emit(HideTextEditorEvent)
      startPos = getRelativePosition(e.evt, stage, true)
      group = new Group({ name: textGroupName, ...startPos })
      textBox = new Rect({ name: textRectName, stroke: activeStroke, dash: [10, 5] })
      group.add(textBox)
      text = new Text({ id: nanoid(), name: textName, wrap: 'word', ...this._options.nodeConfig })
      group.add(text)
      this.rootGroup?.add(group)
    })

    stage?.on('mousemove.drawText', (e: KonvaEventObject<MouseEvent>) => {
      if (!group || !text || !textBox) return

      const endPos = getRelativePosition(e.evt, stage, true)
      const size = {
        height: endPos.y - startPos.y,
        width: endPos.x - startPos.x
      }
      textBox.size(size)
      text.size(size)
    })

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && group) {
        group.destroy()
        group = null
        textBox = null
        text = null
      }
    }
    document.addEventListener('keydown', handler)
    this.disposeEvents.push(() => document.removeEventListener('keydown', handler))
    this.textUpdateHandler()
  }

  protected unmount() {
    const stage = this.rootGroup?.getStage()

    stage?.off('click.drawText').off('mousemove.drawText')
  }

  destroy() {
    super.destroy()
    eventBus.off(SaveTextEvent)
  }

  private textUpdateHandler() {
    !eventBus.exist(SaveTextEvent) &&
      eventBus.on(SaveTextEvent, (id, val) => {
        const text = this.rootGroup?.findOne<Text>(`#${id}`)
        text?.text(val)
        const rect = text?.parent?.findOne<Rect>('Rect')
        rect?.stroke('transparent')
      })
  }
}

/**
 * 打开文字输入框
 * @param group
 * @param rect
 */
function openTextInput(group: Group, rect: Rect, text: Text) {
  const position = group.position()
  const borderWidth = rect.strokeWidth()
  const size = rect.size()
  if (size.width < 0) {
    position.x += size.width
    size.width = -size.width
  }
  if (size.height < 0) {
    position.y += size.height
    size.height = -size.height
  }

  eventBus.emit(
    ShowTextEditorEvent,
    text,
    { x: position.x + borderWidth, y: position.y },
    {
      height: size.height - borderWidth * 3,
      width: size.width - borderWidth * 3.5
    }
  )
}
