const cardStyle = (isZeroState?: boolean): React.CSSProperties => ({
  backgroundColor: '#FCF1F1',
  height: isZeroState ? '450px' : '646.052px',
  borderRadius: '32px',
  padding: '41.281px',
  gap: '24px',
  boxShadow: '0 1.032px 2.064px 0 rgba(0,0,0,0.05)',
})

const titleTextStyle: React.CSSProperties = {
  color: '#5C3F3F',
  fontFamily: 'Roboto',
  fontSize: '22px',
  fontWeight: 700,
  lineHeight: '100%',
}

const zeroStateIconWrapStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const zeroStateBtnBaseStyle: React.CSSProperties = {
  width: '100%',
  border: '2px solid rgba(154,0,31,0.15)',
  borderRadius: '16px',
  height: '56px',
  fontSize: '14px',
  fontWeight: 700,
  color: '#9A001F',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  transition: 'background-color 150ms ease, color 150ms ease',
  fontFamily: 'Roboto, system-ui, sans-serif',
}

function handleBtnEnter(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.backgroundColor = '#9A001F'
  e.currentTarget.style.color = '#FFFFFF'
}
function handleBtnLeave(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.backgroundColor = 'transparent'
  e.currentTarget.style.color = '#9A001F'
}

export default function RecommendedSeniorCard({ isZeroState }: { isZeroState?: boolean }) {
  return (
    <div className="flex-1 flex flex-col" style={cardStyle(isZeroState)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M10.1875 19.44L16.6562 12H11.6562L12.5625 5.19L6.78125 13.2H11.125L10.1875 19.44ZM7 24L8.25 15.6H2L13.25 0H15.75L14.5 9.6H22L9.5 24H7Z" fill="#094F7A"/>
          </svg>
          <span style={titleTextStyle}>선배와의 연결</span>
        </div>
      </div>

      {/* Zero state */}
      {isZeroState && (
        <div className="flex flex-col items-center flex-1 justify-center gap-4 text-center">
          <div style={zeroStateIconWrapStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 34 22" fill="none">
              <path d="M17.9086 10.4615C18.5574 9.76488 19.0371 8.96497 19.3478 8.06181C19.6584 7.15866 19.8138 6.22752 19.8138 5.2684C19.8138 4.30928 19.6584 3.37815 19.3478 2.47499C19.0371 1.57184 18.5574 0.771927 17.9086 0.0752637C19.2471 0.227717 20.3585 0.79846 21.2427 1.78749C22.1269 2.77652 22.569 3.93683 22.569 5.2684C22.569 6.59998 22.1269 7.76028 21.2427 8.74931C20.3585 9.73835 19.2471 10.3091 17.9086 10.4615ZM25.9104 22V18.4685C25.9104 17.6479 25.7414 16.8671 25.4033 16.1263C25.0653 15.3855 24.5856 14.7497 23.9642 14.219C25.1327 14.603 26.2084 15.1212 27.1912 15.7735C28.1741 16.4258 28.6655 17.3241 28.6655 18.4685V22H25.9104ZM28.6655 12.1289V9.11838H25.6173V6.86053H28.6655V3.84998H30.9517V6.86053H34V9.11838H30.9517V12.1289H28.6655ZM11.431 10.5368C9.95967 10.5368 8.70275 10.022 7.66028 8.99247C6.61782 7.96291 6.09659 6.72156 6.09659 5.2684C6.09659 3.81525 6.61782 2.57389 7.66028 1.54434C8.70275 0.514779 9.95967 0 11.431 0C12.9024 0 14.1593 0.514779 15.2018 1.54434C16.2443 2.57389 16.7655 3.81525 16.7655 5.2684C16.7655 6.72156 16.2443 7.96291 15.2018 8.99247C14.1593 10.022 12.9024 10.5368 11.431 10.5368ZM0 22V18.6537C0 17.9165 0.20273 17.2339 0.608189 16.6057C1.01365 15.9776 1.5554 15.4946 2.23345 15.1569C3.74 14.4274 5.25974 13.8803 6.79268 13.5156C8.32561 13.1508 9.87173 12.9685 11.431 12.9685C12.9904 12.9685 14.5365 13.1508 16.0694 13.5156C17.6023 13.8803 19.1221 14.4274 20.6286 15.1569C21.3067 15.4946 21.8484 15.9776 22.2539 16.6057C22.6594 17.2339 22.8621 17.9165 22.8621 18.6537V22H0ZM11.431 8.27895C12.2693 8.27895 12.9869 7.98417 13.5839 7.3946C14.1809 6.80504 14.4793 6.0963 13.5839 5.2684C14.1809 4.4405 14.4793 3.73177 13.5839 3.1422C12.9869 2.55264 12.2693 2.25786 11.431 2.25786C10.5928 2.25786 9.87514 2.55264 9.27818 3.1422C8.68123 3.73177 8.38275 4.4405 8.38275 5.2684C8.38275 6.0963 8.68123 6.80504 9.27818 7.3946C9.87514 7.98417 10.5928 8.27895 11.431 8.27895ZM2.28616 19.7421H20.5759V18.6537C20.5759 18.3488 20.4865 18.0666 20.3077 17.807C20.1289 17.5474 19.8861 17.3356 19.5793 17.1716C18.2662 16.5328 16.9273 16.0489 15.5625 15.7199C14.1978 15.3908 12.8206 15.2263 11.431 15.2263C10.0415 15.2263 8.6643 15.3908 7.29954 15.7199C5.93478 16.0489 4.59584 16.5328 3.28274 17.1716C2.97595 17.3356 2.73316 17.5474 2.55436 17.807C2.37556 18.0666 2.28616 18.3488 2.28616 18.6537V19.7421Z" fill="#C7002B"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#1F1A1A', marginBottom: '8px' }}>선배한테 도움 요청</p>
            <p style={{ fontSize: '13px', color: '#916F6E', lineHeight: 1.6 }}>
              나와 같은 고민을 했던 선배들은<br />어떤 길을 걸었을까요?
            </p>
          </div>
        </div>
      )}

      {isZeroState && (
        <button
          style={zeroStateBtnBaseStyle}
          onMouseEnter={handleBtnEnter}
          onMouseLeave={handleBtnLeave}
        >
          선배 찾기
        </button>
      )}
    </div>
  )
}
