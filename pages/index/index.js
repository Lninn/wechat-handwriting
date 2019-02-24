//index.js
//获取应用实例
const app = getApp()
const HardWriting = require('handwriting.js')

Page({
  data: {
    canvasWidth: 300,
    canvasHeight: 300,
  },

  onLoad: function () {
    let x = 300, y = 300

    wx.getSystemInfo({
      success: function (res) {
        x = res.windowWidth
        y = res.windowHeight
      },
    })
    this.setData({
      canvasWidth: x,
      canvasHeight: y,
    })

    const ctx = wx.createCanvasContext('demo')
    const h = HardWriting.instance(this, ctx)
  },
})
