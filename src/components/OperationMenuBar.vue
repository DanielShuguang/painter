<script lang="tsx">
import { ChangeColorEvent, DrawShapeType, PaintFactory } from '@/paint-factory'
import { NColorPicker } from 'naive-ui'
import { IconConfigProvider, Icon } from '@vicons/utils'
import { FactoryKey } from './Layout/composition'
import { defineComponent, h, inject, ref } from 'vue'
import classNames from 'classnames'

export default defineComponent({
  setup() {
    const colorValue = ref('#000000')
    const activeShape = ref<DrawShapeType | null>(DrawShapeType.Rect)

    const factory = inject(FactoryKey)

    function handleChangeShape(type: DrawShapeType) {
      factory?.active(type).emit(ChangeColorEvent, { color: colorValue.value })
    }

    function handleChangeColor() {
      factory?.emit(ChangeColorEvent, { color: colorValue.value })
    }

    factory?.onChangeShape(type => {
      activeShape.value = type
    })

    function currentToolbar() {
      if (activeShape.value) {
        const shape = PaintFactory.shapeMap.get(activeShape.value)
        if (shape?.toolbar) {
          return (
            <>
              <div class="title">配置</div>
              <div class="shape-toolbar">{h(shape.toolbar)}</div>
            </>
          )
        }
      }

      return null
    }

    return () => (
      <div class="operation-menu-bar">
        <IconConfigProvider size="22" color="skyblue">
          <div class="title">颜色</div>
          <NColorPicker
            v-model:value={colorValue.value}
            showAlpha={false}
            actions={['confirm']}
            onComplete={handleChangeColor}
          />
          <div class="title">操作</div>
          <div class="draw-shape-selection">
            {Array.from(PaintFactory.toolMap.entries()).map(([k, v]) => (
              <span
                class={classNames('tool-icon', { 'is-active': activeShape.value === k })}
                key={k}
                title={v.tip}
                onClick={() => activeShape.value !== k && handleChangeShape(k)}
              >
                <Icon>{h(v.icon)}</Icon>
              </span>
            ))}
          </div>
          <div class="title">形状</div>
          <div class="draw-shape-selection">
            {Array.from(PaintFactory.shapeMap.entries()).map(([k, v]) => (
              <span
                class={classNames('shape-icon', { 'is-active': activeShape.value === k })}
                key={k}
                title={v.tip}
                onClick={() => activeShape.value !== k && handleChangeShape(k)}
              >
                <Icon>{h(v.icon)}</Icon>
              </span>
            ))}
          </div>
          {currentToolbar()}
        </IconConfigProvider>
      </div>
    )
  }
})
</script>

<style scoped lang="less">
.operation-menu-bar {
  width: 200px;
  height: 100%;
  margin-right: 3px;
  padding: 4px;
  box-sizing: border-box;
}

.draw-shape-selection {
  display: flex;
  flex-wrap: wrap;
}

.title {
  width: 100%;
  padding: 5px;
  font-size: 16px;
  font-weight: bold;
}

.shape-icon,
.tool-icon {
  display: inline-flex;
  padding: 3px 5px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    box-shadow: inset 0 0 4px #000;
  }

  &.is-active {
    box-shadow: inset 0 0 4px green;
    cursor: auto;
  }
}
</style>
