import { useCallback, useEffect, useState } from "react";

type DiscoveryMode =
    | "random"
    | "just-starting"
    | "less-than-10"
    | "partner-push"
    | "top-game"
    | "on-the-rise";

interface Stream {
    channelName: string;
    channelLogin: string;
    title: string;
    category: string;
    language: string;
    viewers: number;
    thumbnail: string;
    url: string;
    startedAt: string;
    mature: boolean;
}

interface GameResult {
    id: string;
    name: string;
    boxArtUrl: string;
}

const API_URL = "https://drift.aonthevoid.com/api";

const languages: {
    value: string;
    label: string;
}[] = [
    { value: "any", label: "🌎 Any Language" },
    { value: "en", label: "🇺🇸 English" },
    { value: "es", label: "🇪🇸 Spanish" },
    { value: "fr", label: "🇫🇷 French" },
    { value: "de", label: "🇩🇪 German" },
    { value: "pt", label: "🇧🇷 Portuguese" },
    { value: "ja", label: "🇯🇵 Japanese" },
    { value: "ko", label: "🇰🇷 Korean" },
    { value: "ru", label: "🇷🇺 Russian" },
];

const modes: {
    value: DiscoveryMode;
    label: string;
}[] = [
    { value: "random", label: "🌎 Random" },
    { value: "just-starting", label: "⚡ Just Starting" },
    { value: "less-than-10", label: "👥 Less Than 10 Viewers" },
    { value: "partner-push", label: "🏆 Partner Push" },
    { value: "top-game", label: "🎯 Top Games" },
    { value: "on-the-rise", label: "📈 On the Rise" },
];

function App() {
    const [stream, setStream] = useState<Stream | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [language, setLanguage] =
        useState("any");

    const [mode, setMode] =
        useState<DiscoveryMode>("random");

    const [gameSearch, setGameSearch] =
        useState("");

    const [gameResults, setGameResults] =
        useState<GameResult[]>([]);

    const [selectedGame, setSelectedGame] =
        useState<GameResult | null>(null);

    const [searchingGames, setSearchingGames] =
        useState(false);

    const drift = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            params.set("language", language);
            params.set("mode", mode);

            if (selectedGame) {
                params.set(
                    "gameId",
                    selectedGame.id
                );
            }

            const response = await fetch(
                `${API_URL}/random?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to find a live stream."
                );
            }

            const data: Stream =
                await response.json();

            setStream(data);

        } catch (err) {

            console.error(err);

            setError(
                "Unable to find a live stream."
            );

        } finally {

            setLoading(false);

        }

    }, [
        language,
        mode,
        selectedGame
    ]);

    useEffect(() => {
        void drift();
    }, [drift]);

    useEffect(() => {

        const query =
            gameSearch.trim();

        if (query.length < 2) {

            setGameResults([]);

            return;

        }

        const controller =
            new AbortController();

        const searchGames =
            async () => {

                try {

                    setSearchingGames(true);

                    const response =
                        await fetch(
                            `${API_URL}/search-games?query=${encodeURIComponent(
                                query
                            )}`,
                            {
                                signal:
                                    controller.signal
                            }
                        );

                    if (!response.ok) {
                        throw new Error(
                            "Unable to search games."
                        );
                    }

                    const data:
                        GameResult[] =
                        await response.json();

                    setGameResults(data);

                } catch (err) {

                    if (
                        err instanceof DOMException &&
                        err.name === "AbortError"
                    ) {
                        return;
                    }

                    console.error(err);

                    setGameResults([]);

                } finally {

                    setSearchingGames(false);

                }

            };

        void searchGames();

        return () =>
            controller.abort();

    }, [gameSearch]);

    const selectGame =
        (game: GameResult) => {

            setSelectedGame(game);

            setGameSearch("");

            setGameResults([]);

        };

    const clearGame = () => {

        setSelectedGame(null);

        setGameSearch("");

        setGameResults([]);

    };

    const openStream = () => {

        if (!stream) return;

        window.open(
            stream.url,
            "_blank",
            "noopener,noreferrer"
        );

    };

    return (
        <main className="panel">

            <video
                className="background-video"
                autoPlay
                muted
                loop
                playsInline
            >
                <source
                    src="./background.mp4"
                    type="video/mp4"
                />
            </video>

            <div className="background-overlay" />

            <header className="panel-header">

                <img
                    className="app-logo"
                    src="./logo.png"
                    alt="Void Drift"
                />

                <p className="tagline">
                    Drift until you find someone worth sitting
                    in the void with.
                </p>

            </header>

            <section className="stream-card">

                <div className="stream-preview">

                    {stream && !loading ? (

                        <img
                            className="stream-thumbnail"
                            src={stream.thumbnail}
                            alt={`${stream.channelName} stream`}
                        />

                    ) : (

                        <div className="preview-placeholder">

                            {loading
                                ? "DRIFTING..."
                                : "NO STREAM"}

                        </div>

                    )}

                </div>

                <div className="stream-info">

                    {loading ? (

                        <>
                            <h1>
                                Finding someone...
                            </h1>

                            <p className="stream-title">
                                Drifting through Twitch
                            </p>
                        </>

                    ) : error ? (

                        <>
                            <h1>
                                Nothing found
                            </h1>

                            <p className="stream-title">
                                {error}
                            </p>
                        </>

                    ) : stream ? (

                        <>
                            <h1>
                                {stream.channelName}
                            </h1>

                            <p className="stream-title">
                                {stream.title}
                            </p>

                            <p className="stream-category">
                                {stream.category}
                            </p>

                            <div className="stream-meta">

                                <span>
                                    ● LIVE
                                </span>

                                <span>
                                    {stream.viewers} viewers
                                </span>

                            </div>

                            <button
                                className="watch-button"
                                onClick={openStream}
                            >
                                WATCH NOW
                            </button>

                        </>

                    ) : null}

                </div>

            </section>

            <div className="actions">

                <select
                    className="drift-mode"
                    value={language}
                    onChange={(event) =>
                        setLanguage(
                            event.target.value
                        )
                    }
                >

                    {languages.map(
                        (item) => (

                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </option>

                        )
                    )}

                </select>

                <select
                    className="drift-mode"
                    value={mode}
                    onChange={(event) =>
                        setMode(
                            event.target
                                .value as DiscoveryMode
                        )
                    }
                >

                    {modes.map(
                        (item) => (

                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </option>

                        )
                    )}

                </select>

                {selectedGame ? (

                    <div className="selected-game">

                        <span>
                            🎮 {selectedGame.name}
                        </span>

                        <button
                            className="clear-game"
                            onClick={clearGame}
                            type="button"
                            aria-label="Clear selected game"
                        >
                            ×
                        </button>

                    </div>

                ) : (

                    <div className="game-search">

                        <input
                            className="game-search-input"
                            type="text"
                            value={gameSearch}
                            onChange={(event) =>
                                setGameSearch(
                                    event.target.value
                                )
                            }
                            placeholder="🔍 Search a game..."
                            maxLength={100}
                        />

                        {gameSearch.trim().length >= 2 && (

                            <div className="game-results">

                                {searchingGames ? (

                                    <div className="game-result-status">
                                        Searching...
                                    </div>

                                ) : gameResults.length > 0 ? (

                                    gameResults.map(
                                        (game) => (

                                            <button
                                                key={game.id}
                                                className="game-result"
                                                type="button"
                                                onClick={() =>
                                                    selectGame(
                                                        game
                                                    )
                                                }
                                            >

                                                <img
                                                    src={
                                                        game.boxArtUrl
                                                    }
                                                    alt=""
                                                />

                                                <span>
                                                    {game.name}
                                                </span>

                                            </button>

                                        )
                                    )

                                ) : (

                                    <div className="game-result-status">
                                        No games found.
                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                )}

                <button
                    className="drift-button"
                    onClick={() =>
                        void drift()
                    }
                    disabled={loading}
                >
                    {loading
                        ? "DRIFTING..."
                        : "DRIFT"}
                </button>

            </div>

        </main>
    );
}

export default App;