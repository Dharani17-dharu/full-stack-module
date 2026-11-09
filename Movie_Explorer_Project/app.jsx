import { useEffect, useState } from 'react'
import { getMovieDetails, searchMovies } from './api.js'
import Loading from './components/Loading.jsx'
import MovieCard from './components/MovieCard.jsx'
import MoviePoster from './components/MoviePoster.jsx'
import SearchBar from './components/SearchBar.jsx'
import './styles.css'

const CATEGORIES = [
	{ label: 'All titles', value: '' },
	{ label: 'Movies', value: 'movie' },
	{ label: 'Series', value: 'series' },
	{ label: 'Episodes', value: 'episode' },
]

const QUICK_SEARCHES = ['Dune', 'Interstellar', 'The Batman']
const EPISODE_SUGGESTIONS = [
	{ title: 'Ozymandias', series: 'Breaking Bad' },
	{ title: 'The Constant', series: 'Lost' },
	{ title: 'The Rains of Castamere', series: 'Game of Thrones' },
]

function formatRuntime(runtime) {
	return runtime && runtime !== 'N/A' ? runtime : 'Runtime unavailable'
}

function formatVotes(votes) {
	const parsedVotes = Number(String(votes || '').replaceAll(',', ''))
	return Number.isFinite(parsedVotes) && parsedVotes > 0
		? `${new Intl.NumberFormat('en').format(parsedVotes)} IMDb votes`
		: 'IMDb rating'
}

function clearMovieFromUrl() {
	const url = new URL(window.location.href)
	url.searchParams.delete('movie')
	window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

export default function App() {
	const [searchInput, setSearchInput] = useState('Interstellar')
	const [submittedQuery, setSubmittedQuery] = useState('Interstellar')
	const [category, setCategory] = useState('')
	const [page, setPage] = useState(1)
	const [refreshKey, setRefreshKey] = useState(0)
	const [searchState, setSearchState] = useState({
		key: '',
		movies: [],
		totalResults: 0,
		error: '',
	})
	const [selectedMovie, setSelectedMovie] = useState(() => {
		const imdbID = new URLSearchParams(window.location.search).get('movie')
		return imdbID ? { imdbID } : null
	})
	const [detailVersion, setDetailVersion] = useState(0)
	const [detailState, setDetailState] = useState({ key: '', movie: null, error: '' })

	const requestKey = `${submittedQuery}|${category}|${page}|${refreshKey}`
	const isLoading = Boolean(submittedQuery) && searchState.key !== requestKey
	const movies = searchState.key === requestKey ? searchState.movies : []
	const totalResults = searchState.key === requestKey ? searchState.totalResults : 0
	const totalPages = Math.ceil(totalResults / 10)
	const detailRequestKey = selectedMovie
		? `${selectedMovie.imdbID}|${detailVersion}`
		: ''
	const isLoadingDetails = Boolean(selectedMovie) && detailState.key !== detailRequestKey

	useEffect(() => {
		if (!submittedQuery) return undefined

		const controller = new AbortController()

		async function loadMovies() {
			try {
				const result = await searchMovies(submittedQuery, category, page, controller.signal)
				setSearchState({ key: requestKey, ...result, error: '' })
			} catch (error) {
				if (!controller.signal.aborted) {
					setSearchState({ key: requestKey, movies: [], totalResults: 0, error: error.message })
				}
			}
		}

		loadMovies()
		return () => controller.abort()
	}, [category, page, requestKey, submittedQuery])

	useEffect(() => {
		if (!selectedMovie) return undefined

		const controller = new AbortController()

		async function loadDetails() {
			try {
				const movie = await getMovieDetails(selectedMovie.imdbID, controller.signal)
				setDetailState({ key: detailRequestKey, movie, error: '' })
			} catch (error) {
				if (!controller.signal.aborted) {
					setDetailState({ key: detailRequestKey, movie: null, error: error.message })
				}
			}
		}

		loadDetails()
		return () => controller.abort()
	}, [detailRequestKey, selectedMovie])

	useEffect(() => {
		function syncMovieFromUrl() {
			const imdbID = new URLSearchParams(window.location.search).get('movie')
			if (imdbID) {
				setSelectedMovie((current) => current?.imdbID === imdbID ? current : { imdbID })
				setDetailVersion((current) => current + 1)
			} else {
				setSelectedMovie(null)
			}
		}

		window.addEventListener('popstate', syncMovieFromUrl)
		return () => window.removeEventListener('popstate', syncMovieFromUrl)
	}, [])

	useEffect(() => {
		if (!selectedMovie) return undefined

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		function closeOnEscape(event) {
			if (event.key === 'Escape') closeDetails()
		}

		window.addEventListener('keydown', closeOnEscape)
		return () => {
			document.body.style.overflow = previousOverflow
			window.removeEventListener('keydown', closeOnEscape)
		}
	}, [selectedMovie])

	function runSearch(query) {
		const trimmedQuery = query.trim()
		if (!trimmedQuery) return
		setSearchInput(trimmedQuery)
		setSubmittedQuery(trimmedQuery)
		setPage(1)
		setRefreshKey((current) => current + 1)
	}

	function handleSearch(event) {
		event.preventDefault()
		runSearch(searchInput)
	}

	function openDetails(movie) {
		const url = new URL(window.location.href)
		url.searchParams.set('movie', movie.imdbID)
		window.history.pushState({ movie: movie.imdbID }, '', `${url.pathname}${url.search}${url.hash}`)
		setSelectedMovie(movie)
		setDetailVersion((current) => current + 1)
	}

	function closeDetails() {
		clearMovieFromUrl()
		setSelectedMovie(null)
	}

	function retryDetails() {
		setDetailVersion((current) => current + 1)
	}

	const featuredMovies = movies.slice(0, 3)
	const apiKeyMissing = searchState.error.toLowerCase().includes('api key')

	return (
		<div className="app-shell">
			<header className="site-header">
				<a className="brand" href="#top" aria-label="Frame by Frame home">
					<span className="brand-icon" aria-hidden="true">F</span>
					<span>frame<span>byframe</span></span>
				</a>
				<nav className="header-nav" aria-label="Main navigation">
					<a href="#discover">Discover</a>
					<a href="#results">Browse titles</a>
				</nav>
				<span className="header-note">YOUR NEXT FAVORITE FILM</span>
			</header>

			<main id="top">
				<section className="hero discovery-hero" aria-labelledby="hero-title">
					<div className="hero-content">
						<div className="eyebrow"><span className="eyebrow-mark" /> THE MOVIE INDEX</div>
						<h1 id="hero-title">Stories worth<br />staying in <span>for.</span></h1>
						<p>Find your next watch, revisit an old favorite, and get the details behind the titles that stay with you.</p>
						<a className="feature-button" href="#discover">
							Explore the collection <span aria-hidden="true">↓</span>
						</a>
						<div className="hero-footnote">Search powered by <span>OMDb</span><i /> Updated as you explore</div>
					</div>
					<div className="hero-gallery" aria-label="Featured search results">
						{featuredMovies.length > 0 ? featuredMovies.map((movie, index) => (
							<button
								className={`hero-gallery-card hero-gallery-card-${index + 1}`}
								type="button"
								key={movie.imdbID}
								onClick={() => openDetails(movie)}
								aria-label={`View ${movie.Title} details`}
							>
								<MoviePoster src={movie.Poster} title={movie.Title} eager={index === 1} />
								<span className="hero-gallery-language">{movie.Year}</span>
							</button>
						)) : (
							<div className="gallery-empty" aria-hidden="true">
								<span>01</span><span>02</span><span>03</span>
							</div>
						)}
						<div className="gallery-note"><span>ON THE REEL</span> {featuredMovies.length ? `${featuredMovies.length} titles to explore` : 'New stories await'}</div>
					</div>
				</section>

				<section className="search-strip" id="discover" aria-labelledby="search-heading">
					<div className="search-intro">
						<h2 id="search-heading">What are you in the mood for?</h2>
						<p>Search by title and find your next watch.</p>
					</div>
					<div className="search-tools">
						<SearchBar value={searchInput} onChange={setSearchInput} onSubmit={handleSearch} />
						<div className="quick-searches" aria-label="Quick searches">
							<span>Try</span>
							{QUICK_SEARCHES.map((query) => (
								<button key={query} type="button" onClick={() => runSearch(query)}>{query}</button>
							))}
						</div>
					</div>
				</section>

				<section className="main-content" id="results" aria-labelledby="results-heading">
					<div className="section-heading">
						<div>
							<span className="section-kicker">THE COLLECTION</span>
							<h2 id="results-heading">{submittedQuery ? `Results for “${submittedQuery}”` : 'Discover titles'}</h2>
						</div>
						<div className="catalog-filters" aria-label="Filter by category">
							<div className="language-tabs" role="group" aria-label="Title category">
								{CATEGORIES.map((item) => (
									<button
										className={`language-tab${category === item.value ? ' is-active' : ''}`}
										key={item.value || 'all'}
										type="button"
										aria-pressed={category === item.value}
										onClick={() => { setCategory(item.value); setPage(1) }}
									>
										{item.label}
									</button>
								))}
							</div>
						</div>
					</div>

					{isLoading ? <Loading label={`Searching for ${submittedQuery}...`} /> : null}

					{!isLoading && searchState.key === requestKey && searchState.error ? (
						<div className="message error-message" role="alert">
							<span className="message-mark" aria-hidden="true">!</span>
							<strong>{apiKeyMissing ? 'Connect your OMDb API key' : 'We couldn’t load those titles'}</strong>
							<p>{searchState.error}</p>
							{apiKeyMissing ? (
								<p className="setup-hint">Create a free key at <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noreferrer">omdbapi.com</a>, then add it as <code>VITE_OMDB_API_KEY</code> in your local `.env` file and restart Vite.</p>
							) : (
								<button type="button" onClick={() => runSearch(submittedQuery)}>Try again</button>
							)}
						</div>
					) : null}

					{!isLoading && !searchState.error && movies.length > 0 ? (
						<>
							<p className="results-count">Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, totalResults)} of {totalResults.toLocaleString()} titles</p>
							<div className="movie-grid" aria-live="polite">
								{movies.map((movie) => (
									<MovieCard
										key={movie.imdbID}
										movie={{
											imdbID: movie.imdbID,
											title: movie.Title,
											poster: movie.Poster,
											category: movie.Type,
											year: movie.Year,
											rating: movie.imdbRating,
										}}
										onSelect={openDetails}
									/>
								))}
							</div>
							{totalPages > 1 ? (
								<nav className="pagination" aria-label="Search result pages">
									<button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
										<span aria-hidden="true">←</span> Previous
									</button>
									<span>Page {page} of {totalPages}</span>
									<button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
										Next <span aria-hidden="true">→</span>
									</button>
								</nav>
							) : null}
						</>
					) : null}

					{!isLoading && !searchState.error && searchState.key === requestKey && movies.length === 0 ? (
						<div className="message">
							<span className="message-mark" aria-hidden="true">⌕</span>
							<strong>No titles found</strong>
							<p>{category === 'episode'
								? `No episodes match “${submittedQuery}”. Try an episode title or switch back to all titles.`
								: `No ${category ? `${category}s` : 'titles'} match “${submittedQuery}”. Try a different title or category.`}</p>
							{category ? <button type="button" onClick={() => { setCategory(''); setPage(1) }}>Show all titles</button> : null}
							{category === 'episode' ? (
								<div className="episode-suggestions">
									<span className="episode-suggestions-label">TRY A POPULAR EPISODE</span>
									<div className="episode-suggestions-list">
										{EPISODE_SUGGESTIONS.map((episode) => (
											<button type="button" key={episode.title} onClick={() => runSearch(episode.title)}>
												<strong>{episode.title}</strong>
												<span>{episode.series}</span>
											</button>
										))}
									</div>
								</div>
							) : null}
						</div>
					) : null}
				</section>
			</main>

			<footer className="site-footer">
				<span>framebyframe</span> Movie information and ratings provided by OMDb.
			</footer>

			{selectedMovie ? (
				<div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetails() }}>
					<section className="details-modal" role="dialog" aria-modal="true" aria-label="Movie details">
						<button className="modal-close" type="button" aria-label="Close movie details" autoFocus onClick={closeDetails}>×</button>
						{isLoadingDetails ? (
							<div className="detail-loading"><Loading label="Gathering the details..." /></div>
						) : detailState.error ? (
							<div className="detail-error" role="alert">
								<strong>Details are unavailable</strong>
								<p>{detailState.error}</p>
								<button type="button" onClick={retryDetails}>Try again</button>
							</div>
						) : detailState.movie ? (
							<>
								<MoviePoster
									className="details-poster"
									src={detailState.movie.Poster}
									title={detailState.movie.Title}
									eager
								/>
								<div className="details-copy">
									<span className="section-kicker">{detailState.movie.Type || 'FEATURE'}</span>
									<h2 id="detail-title">{detailState.movie.Title}</h2>
									<p className="details-subtitle">
										{[detailState.movie.Year, detailState.movie.Rated, formatRuntime(detailState.movie.Runtime), detailState.movie.Genre]
											.filter((value) => value && value !== 'N/A').join(' · ')}
									</p>
									<div className="rating-panel">
										<span aria-hidden="true">★</span>
										<strong>{detailState.movie.imdbRating === 'N/A' ? 'NR' : detailState.movie.imdbRating}</strong>
										<span>{formatVotes(detailState.movie.imdbVotes)}</span>
									</div>
									{detailState.movie.Ratings?.length ? (
										<div className="external-ratings" aria-label="Additional ratings">
											{detailState.movie.Ratings.filter((rating) => rating.Source !== 'Internet Movie Database').map((rating) => (
												<span key={rating.Source}><strong>{rating.Value}</strong> {rating.Source}</span>
											))}
										</div>
									) : null}
									<h3>Synopsis</h3>
									<p className="movie-plot">{detailState.movie.Plot === 'N/A' ? 'No synopsis is available for this title.' : detailState.movie.Plot}</p>
									<p className="detail-credit"><strong>Director</strong>{detailState.movie.Director}</p>
									<p className="detail-credit"><strong>Cast</strong>{detailState.movie.Actors}</p>
									{detailState.movie.Awards !== 'N/A' ? <p className="detail-credit"><strong>Awards</strong>{detailState.movie.Awards}</p> : null}
								</div>
							</>
						) : null}
					</section>
				</div>
			) : null}
		</div>
	)
}
