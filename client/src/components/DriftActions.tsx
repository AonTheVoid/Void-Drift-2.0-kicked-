import type { DiscoveryMode, GameResult } from "../services/Api";

interface Props {
    url: string;
    mode: DiscoveryMode;
    onModeChange: (mode: DiscoveryMode) => void;
    onNext: () => void | Promise<void>;

    gameQuery: string;
    onGameQueryChange: (query: string) => void;
    gameResults: GameResult[];
    selectedGame: GameResult | null;
    onGameSelect: (game: GameResult) => void;
    onGameClear: () => void;
    searchingGames: boolean;
}

export default function DriftActions({
    url,
    mode,
    onModeChange,
    onNext,
    gameQuery,
    onGameQueryChange,
    gameResults,
    selectedGame,
    onGameSelect,
    onGameClear,
    searchingGames
}: Props) {
    return (
        <div className="drift-actions">
            <div className="drift-controls">
                <select
                    className="drift-mode"
                    value={mode}
                    onChange={(e) =>
                        onModeChange(e.target.value as DiscoveryMode)
                    }
                >
                    <option value="random">🌍 Random</option>
                    <option value="just-starting">⚡ Just Starting</option>
                    <option value="less-than-10">
                        👥 Less Than 10 Viewers
                    </option>
                    <option value="partner-push">🏆 Partner Push</option>
                    <option value="top-game">🎯 Top Games</option>
                    <option value="on-the-rise">📈 On the Rise</option>
                </select>

                <div className="game-search">
                    {selectedGame ? (
                        <div className="selected-game">
                            <img
                                src={selectedGame.boxArtUrl}
                                alt=""
                            />

                            <span>{selectedGame.name}</span>

                            <button
                                type="button"
                                className="clear-game"
                                onClick={onGameClear}
                                aria-label="Clear selected game"
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <>
                            <input
                                className="game-search-input"
                                type="text"
                                placeholder="Search a game..."
                                value={gameQuery}
                                onChange={(e) =>
                                    onGameQueryChange(e.target.value)
                                }
                            />

                            {searchingGames && (
                                <div className="game-search-status">
                                    Searching...
                                </div>
                            )}

                            {!searchingGames && gameResults.length > 0 && (
                                <div className="game-results">
                                    {gameResults.map((game) => (
                                        <button
                                            type="button"
                                            className="game-result"
                                            key={game.id}
                                            onClick={() =>
                                                onGameSelect(game)
                                            }
                                        >
                                            <img
                                                src={game.boxArtUrl}
                                                alt=""
                                            />

                                            <span>{game.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <button
type="button"
                    className="drift-button"
                    onClick={onNext}
                >
                    DRIFT
                </button>
            </div>

            <a
                className="twitch-link"
                href={url}
                target="_blank"
                rel="noreferrer"
            >
                Watch on Twitch ↗
            </a>
        </div>
    );
}