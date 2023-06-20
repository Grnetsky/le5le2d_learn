import {
  ctxFlip,
  ctxRotate,
  drawImage,
  Pen,
  setGlobalAlpha,
  getParent,
} from '../pen';
import { Meta2dStore } from '../store';
import { rgba } from '../utils';
import { createOffscreen } from './offscreen';

export class CanvasImage {  // 图片canvas类
  canvas = document.createElement('canvas');
  /**
   * 非图片的绘制
   * isBottom true 指背景颜色，背景网格
   * isBottom false 指 标尺
   */
  otherOffsreen = createOffscreen(); // 非图片的
  offscreen = createOffscreen();
  animateOffsScreen = createOffscreen();

  constructor(
    public parentElement: HTMLElement,
    public store: Meta2dStore,
    private isBottom?: boolean
  ) {
    // 初始化画布
    parentElement.appendChild(this.canvas);
    this.canvas.style.backgroundRepeat = 'no-repeat';
    this.canvas.style.backgroundSize = '100% 100%';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
  }
  // 重置画布
  resize(w?: number, h?: number) {
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    w = (w * this.store.dpiRatio) | 0;
    h = (h * this.store.dpiRatio) | 0;

    this.canvas.width = w;
    this.canvas.height = h;

    this.otherOffsreen.width = w;
    this.otherOffsreen.height = h;

    this.offscreen.width = w;
    this.offscreen.height = h;

    this.animateOffsScreen.width = w;
    this.animateOffsScreen.height = h;

    this.otherOffsreen
      .getContext('2d')
      .scale(this.store.dpiRatio, this.store.dpiRatio);
    this.otherOffsreen.getContext('2d').textBaseline = 'middle';

    this.offscreen
      .getContext('2d')
      .scale(this.store.dpiRatio, this.store.dpiRatio);
    this.offscreen.getContext('2d').textBaseline = 'middle';

    this.animateOffsScreen
      .getContext('2d')
      .scale(this.store.dpiRatio, this.store.dpiRatio);
    this.animateOffsScreen.getContext('2d').textBaseline = 'middle';

    this.init();
  }

  init() {
    this.offscreen
      .getContext('2d')
      .clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.animateOffsScreen
      .getContext('2d')
      .clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const pen of this.store.data.pens) {
      if (this.hasImage(pen)) {
        // 只影响本层的
        pen.calculative.imageDrawed = false;
      }
    }
    this.store.patchFlagsBackground = true;
    this.store.patchFlagsTop = true;
  }

  clear() {
    this.otherOffsreen
      .getContext('2d')
      .clearRect(0, 0, this.otherOffsreen.width, this.otherOffsreen.height);
    this.offscreen
      .getContext('2d')
      .clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.animateOffsScreen
      .getContext('2d')
      .clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas
      .getContext('2d')
      .clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  hasImage(pen: Pen) {
    pen.calculative.hasImage =
      pen.calculative &&
      pen.calculative.inView &&
      !pen.isBottom == !this.isBottom && // undefined == false 结果 false
      pen.image &&
      pen.calculative.img &&
      pen.name !== 'gif';

    return pen.calculative.hasImage;
  }

  render() {
    let patchFlags = false;
    let patchFlagsAnimate = false;
    for (const pen of this.store.data.pens) {
      if (this.hasImage(pen)) {
        if (this.store.animates.has(pen)) {
          patchFlagsAnimate = true;
        } else if (!pen.calculative.imageDrawed) {
          patchFlags = true;
        }
        if (pen.parentId && this.store.animates.has(getParent(pen, true))) {
          patchFlagsAnimate = true;
        }
      }
    }

    const patchFlagsBackground = this.store.patchFlagsBackground;
    if (patchFlagsBackground && this.isBottom) {
      const ctx = this.otherOffsreen.getContext('2d');
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.store.data.width && this.store.data.height && this.store.bkImg) {
        ctx.save();
        ctx.drawImage(
          this.store.bkImg,
          this.store.data.origin.x + this.store.data.x,
          this.store.data.origin.y + this.store.data.y,
          this.store.data.width * this.store.data.scale,
          this.store.data.height * this.store.data.scale
        );
        ctx.restore();
      }
      const background =
        this.store.data.background || this.store.options.background;
      if (background) {
        ctx.save();
        ctx.fillStyle = background;
        const width = this.store.data.width || this.store.options.width;
        const height = this.store.data.height || this.store.options.height;
        if (width && height) {
          const x = this.store.data.x || this.store.options.x;
          const y = this.store.data.y || this.store.options.y;
          ctx.fillRect(
            this.store.data.origin.x + x,
            this.store.data.origin.y + y,
            width * this.store.data.scale,
            height * this.store.data.scale
          );
        } else {
          ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        ctx.restore();
      }
      this.renderGrid(ctx);
    }

    const patchFlagsTop = this.store.patchFlagsTop;
    if (patchFlagsTop && !this.isBottom) {
      const ctx = this.otherOffsreen.getContext('2d');
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.renderRule(ctx);
    }

    if (patchFlags) {
      const ctx = this.offscreen.getContext('2d');
      ctx.save();
      ctx.translate(this.store.data.x, this.store.data.y);
      for (const pen of this.store.data.pens) {
        if (
          !pen.calculative.hasImage ||
          pen.calculative.imageDrawed ||
          this.store.animates.has(pen) ||
          this.store.animates.has(getParent(pen, true))
        ) {
          continue;
        }
        pen.calculative.imageDrawed = true;
        ctx.save();
        ctxFlip(ctx, pen);
        if (pen.calculative.rotate) {
          ctxRotate(ctx, pen);
        }

        setGlobalAlpha(ctx, pen);
        drawImage(ctx, pen);
        ctx.restore();
      }
      ctx.restore();
    }
    if (patchFlagsAnimate) {
      const ctx = this.animateOffsScreen.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.translate(this.store.data.x, this.store.data.y);
      for (const pen of this.store.animates) {
        if (!pen.calculative.hasImage) {
          continue;
        }
        pen.calculative.imageDrawed = true;
        ctx.save();
        ctxFlip(ctx, pen);
        if (pen.calculative.rotate) {
          ctxRotate(ctx, pen);
        }

        setGlobalAlpha(ctx, pen);
        drawImage(ctx, pen);
        ctx.restore();
      }
      //图片组合节点 动画
      for (const pen of this.store.data.pens) {
        if (!pen.calculative.hasImage || !pen.parentId) {
          continue;
        }
        if (this.store.animates.has(getParent(pen, true))) {
          pen.calculative.imageDrawed = true;
          ctx.save();
          ctxFlip(ctx, pen);
          if (pen.calculative.rotate) {
            ctxRotate(ctx, pen);
          }

          setGlobalAlpha(ctx, pen);
          drawImage(ctx, pen);
          ctx.restore();
        }
      }
      ctx.restore();
    }

    if (
      patchFlags ||
      patchFlagsAnimate ||
      (patchFlagsBackground && this.isBottom) ||
      (patchFlagsTop && !this.isBottom)
    ) {
      const ctxCanvas = this.canvas.getContext('2d');
      ctxCanvas.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.isBottom) {
        ctxCanvas.drawImage(
          this.otherOffsreen,
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
        this.store.patchFlagsBackground = false;
      }
      ctxCanvas.drawImage(
        this.offscreen,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      ctxCanvas.drawImage(
        this.animateOffsScreen,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      if (!this.isBottom) {
        ctxCanvas.drawImage(
          this.otherOffsreen,
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
        this.store.patchFlagsTop = false;
      }
    }
  }

  renderGrid(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ) {
    const { data, options } = this.store;
    const { grid, gridRotate, gridColor, gridSize, scale } = data;
    if (!(grid ?? options.grid)) {
      // grid false 时不绘制, undefined 时看 options.grid
      return;
    }
    ctx.save();
    const { width, height } = this.canvas;
    if (gridRotate) {
      ctx.translate(width / 2, height / 2);
      ctx.rotate((gridRotate * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = gridColor || options.gridColor;
    ctx.beginPath();
    const size = (gridSize || options.gridSize) * scale;
    const longSide = Math.max(width, height);
    const count = Math.ceil(longSide / size);
    for (let i = -size * count; i < longSide * 2; i += size) {
      ctx.moveTo(i, -longSide);
      ctx.lineTo(i, longSide * 2);
    }
    for (let i = -size * count; i < longSide * 2; i += size) {
      ctx.moveTo(-longSide, i);
      ctx.lineTo(longSide * 2, i);
    }
    ctx.stroke();
    ctx.restore();
  }

  renderRule(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ) {
    const { data, options } = this.store;
    const { rule, ruleColor, scale, origin } = data;
    if (!(rule ?? options.rule)) {
      // rule false 时不绘制, undefined 时看 options.rule
      return;
    }

    const span = scale * 10;

    ctx.save();

    const finalRuleColor = ruleColor || options.ruleColor;
    ctx.strokeStyle = rgba(finalRuleColor, 0.7);

    const x = origin.x + data.x;
    const y = origin.y + data.y;
    const { width, height } = this.canvas;

    // horizontal rule
    ctx.beginPath();
    ctx.lineWidth = 12;
    ctx.lineDashOffset = -x % span;
    ctx.setLineDash([1, span - 1]);
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.stroke();

    // vertical rule
    ctx.beginPath();
    ctx.lineDashOffset = -y % span;
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    // the big rule
    ctx.strokeStyle = finalRuleColor;
    ctx.beginPath();
    ctx.lineWidth = 24;
    ctx.lineDashOffset = -x % (span * 10);
    ctx.setLineDash([1, span * 10 - 1]);
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineDashOffset = -y % (span * 10);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = ctx.strokeStyle;
    let text: number = 0 - Math.floor(x / span / 10) * 100;
    if (x < 0) {
      text -= 100;
    }
    for (let i = x % (span * 10); i < width; i += 10 * span, text += 100) {
      if (span < 3 && text % 500) {
        continue;
      }
      ctx.fillText(text.toString(), i + 4, 16);
    }

    text = 0 - Math.floor(y / span / 10) * 100;
    if (y < 0) {
      text -= 100;
    }
    for (let i = y % (span * 10); i < height; i += 10 * span, text += 100) {
      if (span < 3 && text % 500) {
        continue;
      }
      ctx.save();
      ctx.beginPath();
      ctx.translate(16, i - 4);
      ctx.rotate((270 * Math.PI) / 180);
      ctx.fillText(text.toString(), 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }
}
