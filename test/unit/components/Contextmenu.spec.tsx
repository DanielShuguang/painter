import Contextmenu from '@/components/Contextmenu.vue'
import { mount } from '@vue/test-utils'
import { MenuOption } from 'naive-ui'
import { nextTick } from 'vue'

it('Contextmenu component test', async () => {
  const menuCount = 10
  const options = initMenuOptions(menuCount)
  const wrapper = mount(Contextmenu, {
    props: { options },
    slots: {
      default: ({ onContextmenu }) => <div class="container" onContextmenu={onContextmenu}></div>
    }
  })
  const exposed = wrapper.getCurrentComponent().exposed as InstanceType<typeof Contextmenu>
  const container = wrapper.find('.container')

  exposed.show({ x: 400, y: 400 })
  await nextTick()
  expect(document.querySelector('.contextmenu-modal')).toBeTruthy()
  document.body.click()
  await nextTick()
  expect(document.querySelector('.contextmenu-modal')).toBeFalsy()
  expect(wrapper.emitted()).empty

  await container.trigger('contextmenu')
  await nextTick()
  expect(document.querySelector('.contextmenu-modal')).toBeTruthy()
  expect(wrapper.emitted().select).toBeUndefined()
  dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  await nextTick()
  expect(document.querySelector('.contextmenu-modal')).toBeFalsy()

  await container.trigger('contextmenu')
  await nextTick()
  expect(document.querySelector('.contextmenu-modal')).toBeTruthy()
  exposed.hide()
  await nextTick()
  expect(document.querySelector('.contextmenu-modal')).toBeFalsy()

  let selected: string | number = -1
  exposed.onSelect(v => {
    selected = v
  })
  await container.trigger('contextmenu')
  await nextTick()
  const menuElements = document.querySelectorAll<HTMLDivElement>(
    '.n-menu-item .n-menu-item-content'
  )
  expect(menuElements.length).toBe(menuCount)
  const index = 3
  menuElements[index].click()
  await nextTick()
  expect(document.querySelector('.contextmenu-modal')).toBeFalsy()
  expect(selected).toBe(options[index].key)
})

function initMenuOptions(count: number) {
  const menus: MenuOption[] = []

  for (let i = 0; i < count; i++) {
    menus.push({
      key: i,
      label: `menu-${i}`
    })
  }

  return menus
}
