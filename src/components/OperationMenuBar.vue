<script lang="tsx">
import { DrawShapeType, PaintFactory } from '@/paint-factory'
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
      factory?.active(type).currentShape?.setOptions({ nodeConfig: { stroke: colorValue.value } })
    }

    function handleChangeColor() {
      factory?.currentShape?.setOptions({ nodeConfig: { stroke: colorValue.value } })
    }

    factory?.onChangeShape(type => {
      activeShape.value = type
    })

    return () => (
      <div class="operation-menu-bar">
        <NColorPicker
          v-model:value={colorValue.value}
          showAlpha={false}
          actions={['confirm']}
          onComplete={handleChangeColor}
        />
        <IconConfigProvider size="22" color="skyblue">
          <div class="draw-shape-selection">
            {Array.from(PaintFactory.shapeMap.entries()).map(([k, v]) => (
              <span
                class={classNames('shape-icon', { 'is-active': activeShape.value === k })}
                key={k}
                onClick={() => handleChangeShape(k)}
              >
                <Icon>{h(v.icon)}</Icon>
              </span>
            ))}
          </div>
        </IconConfigProvider>
      </div>
    )
  }
})
</script>

<!-- <template>
</template> -->

<style scoped lang="less">
.operation-menu-bar {
  width: 200px;
  height: 100%;
}

.draw-shape-selection {
  display: flex;
  flex-wrap: wrap;
}

.shape-icon {
  display: inline-flex;
  padding: 3px 5px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    box-shadow: inset 0 0 4px #000;
  }

  &.is-active {
    box-shadow: inset 0 0 4px green;
  }
}
</style>
