import { CommandService } from '@/paint-factory'
import { addStage } from '../test-utils'
import { Rect } from 'konva/lib/shapes/Rect'
import { Node } from 'konva/lib/Node'

it('CommandService test', () => {
  const { rootGroup, stage } = addStage()
  const service = new CommandService()
  const command1 = 'command1'

  let result: Node | null = null
  service.registerCommand(command1, node => {
    result = node
  })

  const rect = new Rect()
  stage.fire(command1, rect)
  expect(result).not.toBe(rect)

  service.activeCommands(rootGroup)

  stage.fire(command1, rect)
  expect(result).toBe(rect)

  const command2 = 'command2'
  service.registerCommand(command2, node => {
    result = node
  })
  const rect2 = new Rect()
  stage.fire(command2, rect2)
  expect(result).toBe(rect2)

  service.cleanCommands()

  result = null
  stage.fire(command1, rect)
  expect(result).not.toBe(rect)
  stage.fire(command2, rect2)
  expect(result).not.toBe(rect2)
})
