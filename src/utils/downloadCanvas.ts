/**
 * 下载 canvas 内容为图片
 * @param canvasEl 需要下载的 canvas 元素
 * @param filename 文件名，带后缀
 */
export async function downloadCanvas(canvasEl: HTMLCanvasElement, filename: string) {
  return new Promise<boolean>((resolve, reject) => {
    if (!canvasEl.toBlob) {
      reject('不支持下载')
    } else {
      canvasEl.toBlob(v => {
        if (v) {
          const alink = document.createElement('a')
          const url = URL.createObjectURL(v)
          alink.href = url
          alink.download = filename
          alink.click()
          URL.revokeObjectURL(url)
          resolve(true)
        } else {
          reject('下载文件生成失败')
        }
      })
    }
  })
}
