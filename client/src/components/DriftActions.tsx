import type {
    Platform,
    DiscoveryMode,
    GameResult
} from "../services/Api";

interface Props {

    platform: Platform;

    url: string;

    mode: DiscoveryMode;

    onModeChange: (
        mode: DiscoveryMode
    ) => void;

    onNext: () =>
        void | Promise<void>;

    gameQuery: string;

    onGameQueryChange: (
        query: string
    ) => void;

    gameResults: GameResult[];

    selectedGame:
        GameResult | null;

    onGameSelect: (
        game: GameResult
    ) => void;

    onGameClear: () => void;

    searchingGames: boolean;

}

export default function DriftActions({
    platform,
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

    const platformName =
        platform === "twitch"
            ? "Twitch"
            : "Kick";

    return (

        <div className="discover-controls">

            <div className="control-group">

                <label>
                    DISCOVERY MODE
                </label>

                <select
                    className="control-select"
                    value={mode}
                    onChange={(e) =>
                        onModeChange(
                            e.target.value as DiscoveryMode
                        )
                    }
                >

                    <option value="random">
                        Random
                    </option>

                    <option value="just-starting">
                        Just Starting
                    </option>

                    <option value="less-than-10">
                        Less Than 10 Viewers
                    </option>

                    <option value="partner-push">
                        Partner Push
                    </option>

                    <option value="top-game">
                        Top Games
                    </option>

                    <option value="on-the-rise">
                        On the Rise
                    </option>

                </select>

            </div>

            <div className="control-group">

                <label>
                    GAME
                </label>

                <div className="game-search">

                    {selectedGame ? (

                        <div className="selected-game">

                            <img
                                src={
                                    selectedGame.boxArtUrl
                                }
                                alt=""
                            />

                            <span>
                                {selectedGame.name}
                            </span>

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

                        <input
                            className="game-search-input"
                            type="text"
                            placeholder="Search a game..."
                            value={gameQuery}
                            onChange={(e) =>
                                onGameQueryChange(
                                    e.target.value
                                )
                            }
                        />

                    )}

                    {searchingGames && (

                        <div className="game-search-status">
                            SEARCHING...
                        </div>

                    )}

                    {!searchingGames &&
                        !selectedGame &&
                        gameResults.length > 0 && (

                            <div className="game-results">

                                {gameResults.map(
                                    (game) => (

                                        <button
                                            type="button"
                                            className="game-result"
                                            key={game.id}
                                            onClick={() =>
                                                onGameSelect(
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
                                )}

                            </div>

                        )}

                </div>

            </div>

            <button
                type="button"
                className="drift-button"
                onClick={onNext}
            >
                DRIFT
                <span>→</span>
            </button>

            {url !== "#" && (

                <a
                    className={
                        `platform-link ${platform}`
                    }
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                >
                    WATCH ON {platformName}
                    <span>↗</span>
                </a>

            )}

        </div>

    );

}