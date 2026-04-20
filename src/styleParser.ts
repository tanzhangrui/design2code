// src/styleParser.ts（新增）
export function parseStyle(node: any): Record<string, string> {
  const style: Record<string, string> = {};

  // 基础样式
  if (node.backgroundColor) {
    style['background-color'] = parseColor(node.backgroundColor);
  }
  if (node.absoluteBoundingBox) {
    style['width'] = `${node.absoluteBoundingBox.width}px`;
    style['height'] = `${node.absoluteBoundingBox.height}px`;
  }

  // 边框和圆角
  if (node.cornerRadius) {
    style['border-radius'] = `${node.cornerRadius}px`;
  }
  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    style['border'] = `${node.strokeWeight}px solid ${parseColor(stroke.color)}`;
  }

  // 阴影
  if (node.effects) {
    const dropShadows = node.effects.filter((e: any) => e.type === 'DROP_SHADOW');
    if (dropShadows.length > 0) {
      const shadows = dropShadows.map((shadow: any) => {
        return `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${shadow.spread}px ${parseColor(shadow.color)}`;
      });
      style['box-shadow'] = shadows.join(', ');
    }
  }

  // 渐变
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'GRADIENT_LINEAR') {
      style['background'] = parseLinearGradient(fill.gradientStops);
    }
  }

  // 文本样式
  if (node.style) {
    if (node.style.fontSize) {
      style['font-size'] = `${node.style.fontSize}px`;
    }
    if (node.style.fontFamily) {
      style['font-family'] = node.style.fontFamily;
    }
    if (node.style.fontWeight) {
      style['font-weight'] = node.style.fontWeight;
    }
    if (node.style.textAlignHorizontal) {
      style['text-align'] = node.style.textAlignHorizontal.toLowerCase();
    }
    if (node.style.lineHeightPx) {
      style['line-height'] = `${node.style.lineHeightPx}px`;
    }
  }

  return style;
}

function parseColor(color: any): string {
  if (color.a === 1) {
    return `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
  } else {
    return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a})`;
  }
}

function parseLinearGradient(stops: any[]): string {
  const colors = stops.map((stop) => `${parseColor(stop.color)} ${stop.position * 100}%`);
  return `linear-gradient(to right, ${colors.join(', ')})`;
}