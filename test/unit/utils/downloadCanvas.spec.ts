import { downloadCanvas } from '@/utils/downloadCanvas'

it('downloadCanvas function test', async () => {
  global.URL.createObjectURL = vi.fn(() => 'create')
  global.URL.revokeObjectURL = vi.fn(() => 'revoke')
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)

  await downloadCanvas(canvas, 'test.jpg')
  expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1)
  expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(1)
})
