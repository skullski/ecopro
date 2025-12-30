export type BoxStyle = {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  width?: number;
  height?: number;
  opacity?: number;
};

export function toCss(style?: BoxStyle): React.CSSProperties | undefined {
  if (!style) return undefined;
  const s: any = { ...style };
  for (const key of Object.keys(s)) {
    if (s[key] === '' || s[key] == null) delete s[key];
  }
  return s;
}
