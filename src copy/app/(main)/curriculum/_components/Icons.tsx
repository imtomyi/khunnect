export function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <rect width="20" height="20" rx="4" fill="#9A001F" />
      <path d="M5 10.5L8.5 14L15 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UncheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <rect x="0.5" y="0.5" width="19" height="19" rx="3.5" stroke="#E6BDBB" fill="white" />
    </svg>
  );
}

export function SavedCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M2.25 12C2.25 6.61704 6.61704 2.25 12 2.25C17.383 2.25 21.75 6.61704 21.75 12C21.75 17.383 17.383 21.75 12 21.75C6.61704 21.75 2.25 17.383 2.25 12ZM12 3.75C7.44546 3.75 3.75 7.44546 3.75 12C3.75 16.5545 7.44546 20.25 12 20.25C16.5545 20.25 20.25 16.5545 20.25 12C20.25 7.44546 16.5545 3.75 12 3.75Z" fill="#094F7A" />
      <path fillRule="evenodd" clipRule="evenodd" d="M16.9824 7.67574C17.2996 7.94216 17.3407 8.41525 17.0743 8.73241L10.7743 16.2324C10.6347 16.3986 10.4299 16.4962 10.2128 16.4999C9.99576 16.5036 9.78776 16.4131 9.64254 16.2517L6.94254 13.2517C6.66544 12.9439 6.6904 12.4696 6.99828 12.1925C7.30617 11.9155 7.78038 11.9404 8.05748 12.2483L10.1805 14.6072L15.9257 7.76762C16.1921 7.45046 16.6652 7.40932 16.9824 7.67574Z" fill="#094F7A" />
    </svg>
  );
}

export function CalculatorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M21.3333 0H2.66667C1.2 0 0 1.2 0 2.66667V21.3333C0 22.8 1.2 24 2.66667 24H21.3333C22.8 24 24 22.8 24 21.3333V2.66667C24 1.2 22.8 0 21.3333 0ZM13.3733 5.41333L14.7867 4L16.6667 5.88L18.5467 4L19.96 5.41333L18.08 7.29333L19.96 9.17333L18.5467 10.5867L16.6667 8.72L14.7867 10.6L13.3733 9.18667L15.2533 7.30667L13.3733 5.41333ZM4.33333 6.29333H11V8.29333H4.33333V6.29333ZM11.3333 17.3333H8.66667V20H6.66667V17.3333H4V15.3333H6.66667V12.6667H8.66667V15.3333H11.3333V17.3333ZM20 19H13.3333V17H20V19ZM20 15.6667H13.3333V13.6667H20V15.6667Z" fill="white" />
    </svg>
  );
}

export function TipIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SpinnerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9A001F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
