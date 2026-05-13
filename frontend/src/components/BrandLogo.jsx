const BrandLogo = ({ className = "h-8 w-8", simplified = false }) => (
  <svg
    viewBox="0 0 80 80"
    aria-hidden="true"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 18V60H31C35.4 60 39 61.2 40 64C41 61.2 44.6 60 49 60H70V18H49C44.2 18 41.2 19.8 40 23C38.8 19.8 35.8 18 31 18H10Z"
      fill="currentColor"
      fillOpacity={simplified ? "0.12" : "0.18"}
    />
    <path
      d="M15 20V52H30C34 52 37.4 53.2 40 56V24C37.8 21.4 34 20 30 20H15Z"
      fill="currentColor"
    />
    <path
      d="M65 20V52H50C46 52 42.6 53.2 40 56V24C42.2 21.4 46 20 50 20H65Z"
      fill="currentColor"
    />
    {!simplified && (
      <>
        <path d="M21 29V46" stroke="white" strokeOpacity="0.78" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M59 29V46" stroke="white" strokeOpacity="0.78" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M26 27V47" stroke="white" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
        <path d="M54 27V47" stroke="white" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
      </>
    )}
    <path
      d="M9 60H31C35.4 60 39 61.2 40 64C41 61.2 44.6 60 49 60H71"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default BrandLogo;