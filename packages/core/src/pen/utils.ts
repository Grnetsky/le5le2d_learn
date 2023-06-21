import { s8 } from '@meta2d/core';
import { Pen } from './model';

export function randomId(pen: Pen) {
  pen.id = s8();
  if (Array.isArray(pen.anchors)) {
    for (const pt of pen.anchors) {
      pen.type && (pt.id = s8());
      pt.penId = pen.id; // 锚点id指向画笔id
      if (pt.prev) {
        pen.type && (pt.prev.id = s8());
        pt.prev.penId = pen.id;
      }

      if (pt.next) {
        pen.type && (pt.next.id = s8());
        pt.next.penId = pen.id;
      }
    }
  }
}
