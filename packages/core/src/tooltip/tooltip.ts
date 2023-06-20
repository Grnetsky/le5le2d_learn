import { Pen } from '../pen';
import { Point } from '../point';
import { Meta2dStore } from '../store';
import type { marked as Marked } from 'marked';
import { getParent } from '../pen';

/***
 * @description tooltip类 元素上方展示工具框
 */
export class Tooltip {
  box: HTMLElement;
  text: HTMLElement;
  arrowUp: HTMLElement;
  arrowDown: HTMLElement;
  x: number;
  y: number;
  private currentPen: Pen; // 本次 tooltip 在哪个画笔上  // 如何实现让tooltip知道自己在哪个画笔上？：在canvas中新建Tooltip对象，通过构造函数传参来绑定
  constructor(public parentElement: HTMLElement, private store: Meta2dStore) {
    // 创建tooltip 盒子
    this.box = document.createElement('div');
    this.text = document.createElement('div');
    this.arrowUp = document.createElement('div');
    this.arrowDown = document.createElement('div');
    // 设置tooltip样式
    this.box.className = 'meta2d-tooltip';
    this.text.className = 'text';
    this.arrowUp.className = 'arrow';
    this.arrowDown.className = 'arrow down';
    // 为tooltip增加元素
    this.box.appendChild(this.text);
    this.box.appendChild(this.arrowUp);
    this.box.appendChild(this.arrowDown);
    // 讲tooltip加到画面中
    parentElement.appendChild(this.box);

    // 鼠标移开隐藏 默认处理事件
    this.box.onmouseleave = () => {
      this.hide();
      this.store.lastHover = undefined; // 最后
    };

    // 设置tooltip基本样式
    let sheet: any;
    // 获取le5le/tooltip样式表 在线样式
    for (let i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].title === 'le5le.com/tooltip') {
        sheet = document.styleSheets[i];
      }
    }
    // 无样式表 则创建默认样式 离线样式
    if (!sheet) {
      let style = document.createElement('style');
      style.type = 'text/css';
      style.title = 'le5le.com/tooltip';
      document.head.appendChild(style);

      style = document.createElement('style');
      style.type = 'text/css';
      document.head.appendChild(style);
      sheet = style.sheet;
      sheet.insertRule(
        '.meta2d-tooltip{position:absolute;padding:8px 0;z-index:10;left: -9999px;top: -9999px;}'
      );
      sheet.insertRule(
        '.meta2d-tooltip .text{max-width:320px;min-height:30px;max-height:400px;outline:none;padding:8px 16px;border-radius:4px;background:#777777;color:#ffffff;line-height:1.8;overflow-y:auto;}'
      );
      sheet.insertRule(
        '.meta2d-tooltip .arrow{position:absolute;border:10px solid transparent;background:transparent;top:-5px;left:50%;transform:translateX(-50%)}'
      );
      sheet.insertRule(
        '.meta2d-tooltip .arrow.down{top:initial;bottom: -1px;}'
      );
    }
  }

  /**
   * 通过 pen 的 titleFn titleFnJs title 来获取 title
   * @returns 此次应该展示的 title
   */
  private static getTitle(pen: Pen) {
    if (pen.titleFnJs && !pen.titleFn) {
      try {
        pen.titleFn = new Function('pen', pen.titleFnJs) as (
          pen: Pen
        ) => string;
      } catch (error) {
        console.log('titleFnJs', error);
      }
    }
    return pen.titleFn ? pen.titleFn(pen) : String(pen.title);
  }

  /**
   * 更改 tooltip dom 的文本
   * @returns 返回设置前的 rect
   */
  private setText(pen: Pen): DOMRect {
    console.log("设置文本");
    const oldElemRect = this.box.getBoundingClientRect();
    let marked: typeof Marked = globalThis.marked;
    const title = Tooltip.getTitle(pen);
    if (marked) {
      this.text.innerHTML = marked(title);
      const a = this.text.getElementsByTagName('A');
      for (let i = 0; i < a.length; ++i) {
        a[i].setAttribute('target', '_blank');
      }
    } else {
      this.text.innerHTML = title;
    }
    return oldElemRect;
  }

  /**
   * 更新文字
   */
  updateText(pen: Pen) {
    if (this.currentPen?.id !== pen.id) {
      return;
    }

    if (Tooltip.titleEmpty(pen)) {
      return;
    }

    const oldRect = this.setText(pen);
    const newRect = this.box.getBoundingClientRect();
    this.changePositionByText(oldRect, newRect);
  }

  /**
   * 改变文字会 影响 box 的大小，需要重新设置位置
   * @param oldRect 原
   * @param newRect 新
   */
  private changePositionByText(oldRect: DOMRect, newRect: DOMRect) {
    this.x -= (newRect.width - oldRect.width) / 2;
    this.y -= newRect.height - oldRect.height;
    this.box.style.left = this.x + 'px';
    this.box.style.top = this.y + 'px';
  }

  private static titleEmpty(pen: Pen) {
    return !pen.title && !pen.titleFn && !pen.titleFnJs;
  }

  show(pen: Pen, pos: Point) {
    this.currentPen = pen;
    if (Tooltip.titleEmpty(pen)) {
      let parent = getParent(pen, true);
      if (parent) {
        this.show(parent, pos);
      }
      return;
    }

    this.setText(pen);
    const elemRect = this.box.getBoundingClientRect();
    const rect = pen.calculative.worldRect;
    let x = pen.calculative.canvas.store.data.x + pos.x - elemRect.width / 2;
    let y = pen.calculative.canvas.store.data.y + pos.y - elemRect.height;
    if (!pen.type) {
      x =
        pen.calculative.canvas.store.data.x +
        rect.x -
        (elemRect.width - rect.width) / 2;
      y =
        pen.calculative.canvas.store.data.y +
        rect.ey -
        elemRect.height -
        rect.height;
    }

    if (y > 0) {
      this.arrowUp.style.borderBottomColor = 'transparent';
      this.arrowDown.style.borderTopColor = '#777777';
    } else {
      y += elemRect.height + rect.height + 5;
      this.arrowUp.style.borderBottomColor = '#777777';
      this.arrowDown.style.borderTopColor = 'transparent';
    }

    this.x = x;
    this.y = y;
    this.box.style.left = this.x + 'px';
    this.box.style.top = this.y + 'px';
  }
  // 隐藏tooltip 通过设置位置逃离画面来实现隐藏
  hide() {
    this.currentPen = null; // 将当前元素设置为空
    this.x = -9999;
    this.box.style.left = '-9999px';
  }

  translate(x: number, y: number) {
    if (this.x < -1000) {
      return;
    }
    this.x += x;
    this.y += y;
    this.box.style.left = this.x + 'px';
    this.box.style.top = this.y + 'px';
  }

  destroy() {
    this.box.onmouseleave = null;
  }
}
