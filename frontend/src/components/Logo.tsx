const khuStyle: React.CSSProperties = {
  color: "#9A001F",
  fontFamily: '"AvantGarde LT Bold"',
  fontWeight: 400,
  letterSpacing: "-1px",
}

const nnectStyle: React.CSSProperties = {
  color: "#524949",
  fontFamily: '"AvantGarde Bk BT"',
  fontWeight: 400,
  letterSpacing: "-1px",
}

export default function Logo({ size = 32 }: { size?: number }) {
  const scale = size / 32

  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", lineHeight: `${20 * scale}px` }}>
      <span style={{ ...khuStyle, fontSize: `${32 * scale}px`, lineHeight: `${20 * scale}px` }}>khu</span>
      <span style={{ ...nnectStyle, fontSize: `${32 * scale}px`, lineHeight: `${20 * scale}px` }}>nnect.</span>
    </span>
  )
}