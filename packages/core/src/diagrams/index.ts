export * from './rectangle';
export * from './circle';
export * from './svgPath';
export * from './diamond';
export * from './triangle';
export * from './pentagon';
export * from './pentagram';
export * from './hexagon';
export * from './arrow';
export * from './message';
export * from './cloud';
export * from './file';
export * from './cube';
export * from './people';
export * from './line';
export * from './iframe';
export * from './video';

import { rectangle, square } from './rectangle';
import { circle } from './circle';
import { svgPath } from './svgPath';
import { diamond } from './diamond';
import { triangle, triangleAnchors } from './triangle';
import { pentagon, pentagonAnchors } from './pentagon';
import { pentagram, pentagramAnchors } from './pentagram';
import { hexagon } from './hexagon';
import { leftArrow, rightArrow, twowayArrow } from './arrow';
import { message } from './message';
import { cloud } from './cloud';
import { file } from './file';
import { cube } from './cube';
import { people } from './people';
import { line } from './line';
import { iframe } from './iframe';
import { video } from './video';
import { gif } from './gif';
import { mindNode, mindNodeAnchors } from './mindNode';
import { mindLine, mindLineAnchors } from './mindLine';

export function commonPens() {  // 普通笔函数
  return {
    rectangle, // 长方形
    square, //正方形
    circle, // 圆形
    svgPath, // svg图像
    diamond, //
    triangle,
    pentagon,
    pentagram,
    hexagon,
    leftArrow,
    rightArrow,
    twowayArrow,
    message,
    cloud,
    file,
    people,
    line,
    iframe,
    video,
    gif,
    mindNode,
    mindLine,
  };
}

export function commonAnchors() {
  return {
    triangle: triangleAnchors,
    pentagon: pentagonAnchors,
    pentagram: pentagramAnchors,
    mindNode: mindNodeAnchors,
    mindLine: mindLineAnchors,
  };
}
