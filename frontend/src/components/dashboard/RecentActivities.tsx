const titleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#1F1A1A',
  marginBottom: '16px',
}

const emptyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#9CA3AF',
  padding: '24px 0',
}

export default function RecentActivities() {
  return (
    <section>
      <h2 style={titleStyle}>최근 활동</h2>
      <p style={emptyStyle}>아직 최근 활동이 없습니다.</p>
    </section>
  )
}
