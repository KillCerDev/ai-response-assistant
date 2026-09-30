interface StatusPillProps { listening: boolean; supported: boolean }
export default function StatusPill({ listening, supported }: StatusPillProps) {
  const label = !supported ? 'Speech API unavailable' : listening ? 'Listening' : 'Ready'
  return (
    <div className={`status ${listening ? 'live' : ''} ${!supported ? 'warn' : ''}`}>
      <span className="dot" />
      {label}
    </div>
  )
}
