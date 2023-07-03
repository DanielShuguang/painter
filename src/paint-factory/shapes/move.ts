import { DrawBase, DrawShapeType } from '../base'

export class MoveShape extends DrawBase {
  readonly type = DrawShapeType.Move

  protected mount() {}

  protected unmount() {}
}
