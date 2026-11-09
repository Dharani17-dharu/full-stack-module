export default function SearchBar({ value, onChange, onSubmit, disabled = false }) {
  return (
    <form className="search-form" onSubmit={onSubmit} role="search">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="10.8" cy="10.8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m15.5 15.5 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        aria-label="Search movies by title"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by movie title, cast, or story..."
        maxLength={100}
      />
      <button type="submit" disabled={disabled || !value.trim()}>Search</button>
    </form>
  )
}
