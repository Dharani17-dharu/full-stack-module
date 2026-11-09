import MoviePoster from './MoviePoster.jsx'

export default function MovieCard({ movie, onSelect }) {
  return (
    <button
      className="movie-card"
      type="button"
      onClick={() => onSelect(movie)}
      aria-label={`View details for ${movie.title}, ${movie.year}`}
    >
      <div className="poster-wrap">
        <MoviePoster
          src={movie.poster}
          title={movie.title}
          category={movie.category}
          year={movie.year}
        />
        <span className="type-tag">{movie.category}</span>
        {movie.rating && movie.rating !== 'N/A' ? <span className="poster-rating">★ {movie.rating}</span> : null}
      </div>
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <div className="movie-meta">
          <span>{movie.year}</span>
        </div>
      </div>
    </button>
  )
}
