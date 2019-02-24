class HardWriting {
  constructor(page, ctx) {
    this.page = page
    this.ctx = ctx

    this.setup()
    this.initElement()
    this.init()
    this.bindEvent()
  }

  static instance(page, ctx) {
    this.i = this.i || new this(page, ctx)
    return this.i
  }

  bindEvent() {
    this.page.touchstart = this.touch.bind(this)
    this.page.touchmove = this.touch.bind(this)
    this.page.handleClick = this.onClick.bind(this)
  }

  setup() {
    this.oldPoint = null
    this.currentPoint = null

    const { canvasWidth: w, canvasHeight: h } = this.page.data
    this.w = w
    this.h = h

    this.titleSpace = 40
    this.iconFontSpace = 8
    this.canvasId = 'demo'
  }

  initElement() {
    this.rewriteBtn = {
      x: 10,
      y: 10,
      w: 25,
      h: 40,
      strokeStyle: 'gray',
      lineWidth: 1,
      lineJoin: 'bevel',
    }

    let t = this.h - 50
    this.saveBtn = {
      w: 25,
      h: 40,
      x: 10,
      y: t,
      strokeStyle: 'gray',
      lineWidth: 1,
      lineJoin: 'bevel',
    }

    const text = '手 写 板'
    const width = this.ctx.measureText(text).width
    let x = this.h / 2 - width
    let y = -(this.w - this.titleSpace)
    this.title = {
      text,
      font: '20px 微软雅黑',
      color: '#000',
      x,
      y,
    }

    const that = this
    this.available = {
      x: that.rewriteBtn.x + that.rewriteBtn.w,
      y: that.rewriteBtn.y - 1,
      w: that.w - that.rewriteBtn.x - that.rewriteBtn.w - that.titleSpace,
      h: that.saveBtn.y - that.saveBtn.x + that.saveBtn.h + 1,
    }
  }

  init() {
    const c = this.ctx

    const btn1 = this.rewriteBtn
    const btn2 = this.saveBtn

    c.beginPath()
    // 手机保存图片黑屏问题
    c.setFillStyle('#fff')
    c.fillRect(0, 0, this.w, this.h)

    // draw rewrite
    c.lineJoin = btn1.lineJoin
    c.lineWidth = btn1.lineWidth
    c.strokeStyle = btn1.strokeStyle
    c.strokeRect(btn1.x, btn1.y, btn1.w, btn1.h)
    c.setFillStyle('rgba(0, 0, 0, 0.03)')
    c.fillRect(btn1.x, btn1.y, btn1.w, btn1.h)

    // draw save
    c.lineJoin = btn2.lineJoin
    c.lineWidth = btn2.lineWidth
    c.strokeStyle = btn2.strokeStyle
    c.strokeRect(btn2.x, btn2.y, btn2.w, btn2.h)
    c.setFillStyle('rgba(0, 0, 0, 0.03)')
    c.fillRect(btn2.x, btn2.y, btn2.w, btn2.h)

    c.rotate(90 * Math.PI / 180)
    // btn text
    c.setFillStyle('green')
    c.font = "12px 微软雅黑"
    c.fillText('重写', btn1.y + this.iconFontSpace, -btn1.x - this.iconFontSpace)
    c.font = "12px 微软雅黑"
    c.fillText('保存', btn2.y + this.iconFontSpace, -btn2.x - this.iconFontSpace)

    // title text
    c.setFillStyle(this.title.color)
    c.font = this.title.font
    c.fillText(this.title.text, this.title.x, this.title.y - 10)

    c.setTransform(1, 0, 0, 1, 0, 0)

    // 测试可视化区域
    // c.setFillStyle('red')
    // c.fillRect(this.available.x, this.available.y, this.available.w, this.available.h)

    c.draw()
  }

  touch(event) {
    const { type, } = event

    if (['touchstart', 'touchmove'].includes(type)) {
      const { touches: [{ x, y }] } = event
      const p = { x: x + 0.5, y: y + 0.5, }

      if (p.x <= this.available.x ||
        p.x >= this.available.w + this.available.x ||
        y <= this.available.y || y >= this.available.h) {
        return
      }

      this[type](p)
    }
  }

  touchstart(point) {
    this.currentPoint = point
    this.oldPoint = point
  }

  touchmove(point) {
    this.oldPoint = this.currentPoint
    this.currentPoint = point
    this.draw()
  }

  draw() {
    const ctx = this.ctx
    ctx.beginPath()

    ctx.lineWidth = 3
    ctx.strokeStyle = 'black'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowBlur = 1
    ctx.shadowColor = 'black'

    ctx.moveTo(this.oldPoint.x, this.oldPoint.y)
    ctx.lineTo(this.currentPoint.x, this.currentPoint.y)

    ctx.stroke()
    ctx.draw(true)
  }

  onClick(event) {
    const x = event.detail.x
    const y = event.detail.y


    const area = this.rewriteBtn
    if (x >= area.x && x <= area.x + area.w) {
      if (y >= area.y && y <= area.y + area.h) {
        this.redraw()
      }
    }

    if (x >= area.x && x <= area.x + area.w) {
      if (y >= this.saveBtn.y && y <= this.saveBtn.y + this.saveBtn.h) {
        this.save()
      }
    }
  }

  redraw() {
    this.ctx.clearRect(this.available.x, this.available.y, this.available.w, this.available.h)
    this.ctx.draw(true)
  }

  save() {
    const that = this
    wx.canvasToTempFilePath({
      x: that.available.x + 1,
      y: that.available.y,
      width: that.available.w,
      height: that.available.h,
      destWidth: that.w,
      destHeight: that.h,
      canvasId: that.canvasId,
      success: function (res) {
        const url = res.tempFilePath
        wx.saveImageToPhotosAlbum({
          filePath: url,
          success(res) {
            log(res)
          }
        })
      },
      fail: function (res) {
        log(res)
      }
    })
  }
}

module.exports = HardWriting