import pkg from '../../package.json';
import { Pen } from '../pen';

export const globalStore: {   // 全局仓库管理
  version: string;
  path2dDraws: { //TODO 2d画布  作用？
    [key: string]: (pen: Pen, ctx?: CanvasRenderingContext2D) => Path2D;
  };
  canvasDraws: { //TODO canvas画布？ 作用？
    [key: string]: (ctx: CanvasRenderingContext2D, pen: Pen) => void;
  };
  anchors: { [key: string]: (pen: Pen) => void }; // TODO: 存储的是 副作用 函数，函数内修改 anchors
  htmlElements: { [key: string]: HTMLImageElement }; // 目前只存在图片资源，此处使用 HTMLImageElement
} = {
  version: pkg.version,
  path2dDraws: {},
  canvasDraws: {},
  anchors: {},
  htmlElements: {},
};

export function register(path2dFns: {   //TOD 作用？数
  [key: string]: (pen: Pen, ctx?: CanvasRenderingContext2D) => Path2D;
}) {
  Object.assign(globalStore.path2dDraws, path2dFns); // assign方法用来拷贝
}

export function registerCanvasDraw(drawFns: {  //注册画布
  [key: string]: (ctx: CanvasRenderingContext2D, pen: Pen) => void;
}) {
  Object.assign(globalStore.canvasDraws, drawFns);
}

export function registerAnchors(anchorsFns: {
  [key: string]: (pen: Pen) => void;
}) {
  Object.assign(globalStore.anchors, anchorsFns);
}
