/**
 * @description canvas放大镜
 * */

import { Meta2dStore } from '../store';
import { Canvas } from './canvas';
import { createOffscreen } from './offscreen';

// 放大镜类
export class MagnifierCanvas {
  canvas = document.createElement('canvas'); // 创建canvas放大镜
  magnifierScreen = createOffscreen(); // 创建放大镜
  offscreen = createOffscreen(); //创建放大镜缓冲区
  private magnifierSize: number = 300; // 放大镜尺寸
  magnifier: boolean; // 放大镜是否开启

  constructor(
    public parentCanvas: Canvas, // 父canvas
    public parentElement: HTMLElement, // 父ele
    public store: Meta2dStore
  ) {
    parentElement.appendChild(this.canvas); // 添加到父元素中
    this.canvas.style.backgroundRepeat = 'no-repeat';
    this.canvas.style.backgroundSize = '100% 100%';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
  }

  resize(w?: number, h?: number) {
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    w = (w * this.store.dpiRatio) | 0;
    h = (h * this.store.dpiRatio) | 0;

    this.canvas.width = w;
    this.canvas.height = h;

    this.offscreen.width = w;
    this.offscreen.height = h;

    this.offscreen
      .getContext('2d')
      .scale(this.store.dpiRatio, this.store.dpiRatio);
    this.offscreen.getContext('2d').textBaseline = 'middle';

    this.magnifierScreen.width = this.magnifierSize + 5;
    this.magnifierScreen.height = this.magnifierSize + 5;
  }

  /**
   * 绘制到 该画布的 离屏层
   */
  private renderMagnifier() {
    if (!this.magnifier) {
      return;
    }

    const r = this.magnifierSize / 2;
    const size = this.magnifierSize + 5;

    const ctx = this.magnifierScreen.getContext(
      '2d'
    ) as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, size, size);
    ctx.lineWidth = 5;

    ctx.save();
    ctx.translate(2.5, 2.5);

    ctx.save();
    ctx.arc(r, r, r, 0, Math.PI * 2, false);
    ctx.clip();
    ctx.fillStyle =
      this.store.data.background || this.store.options.background || '#f4f4f4';
    ctx.fillRect(0, 0, size, size);
    ctx.translate(-r, -r);
    ctx.scale(2, 2); // 放大效果实现
    const pt = {
      x:
        (this.parentCanvas.mousePos.x + this.store.data.x) *
        this.store.dpiRatio,
      y:
        (this.parentCanvas.mousePos.y + this.store.data.y) *
        this.store.dpiRatio,
    };
    const drawOffscreens = [
      this.parentCanvas.canvasImageBottom.offscreen,
      this.parentCanvas.canvasImageBottom.animateOffsScreen,
      this.parentCanvas.offscreen,
      this.parentCanvas.canvasImage.offscreen,
      this.parentCanvas.canvasImage.animateOffsScreen,
    ];
    // 跟随鼠标绘制  双缓冲
    drawOffscreens.forEach((offscreen) => {
      ctx.drawImage(
        offscreen,
        pt.x - r,
        pt.y - r,
        this.magnifierSize,
        this.magnifierSize,
        0,
        0,
        this.magnifierSize,
        this.magnifierSize
      );
    });

    ctx.restore();

    ctx.beginPath();
    const gradient = ctx.createRadialGradient(r, r, r - 5, r, r, r);
    gradient.addColorStop(0, 'rgba(0,0,0,0.2)');
    gradient.addColorStop(0.8, 'rgb(200,200,200)');
    gradient.addColorStop(0.9, 'rgb(200,200,200)');
    gradient.addColorStop(1.0, 'rgba(200,200,200,0.9)');
    ctx.strokeStyle = gradient;
    ctx.arc(r, r, r, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.restore();

    const offscreenCtx = this.offscreen.getContext('2d');
    offscreenCtx.drawImage(
      this.magnifierScreen,
      0,
      0,
      this.magnifierSize + 5,
      this.magnifierSize + 5,
      (pt.x - r - 2.5) / this.store.dpiRatio,
      (pt.y - r - 2.5) / this.store.dpiRatio,
      (this.magnifierSize + 5) / this.store.dpiRatio,
      (this.magnifierSize + 5) / this.store.dpiRatio
    );
  }

  render() {
    this.offscreen
      .getContext('2d')
      .clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderMagnifier();
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.offscreen, 0, 0, this.canvas.width, this.canvas.height);
  }
}
