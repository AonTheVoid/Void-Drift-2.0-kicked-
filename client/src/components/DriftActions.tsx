import type {
    Platform,
    DiscoveryMode,
    GameResult
} from "../services/Api";

interface Props {
    platform: Platform;
    onPlatformChange: (
        platform: Platform
    ) => void;

    language: string;
    onLanguageChange: (
        language: string
    ) => void;

    mode: DiscoveryMode;
    onModeChange: (
        mode: DiscoveryMode
    ) => void;

    onNext: () => void | Promise<void>;

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

    url: string;
}

export default function DriftActions({
    platform,
    onPlatformChange,
    language,
    onLanguageChange,
    mode,
    onModeChange,
    onNext,
    gameQuery,
    onGameQueryChange,
    gameResults,
    selectedGame,
    onGameSelect,
    onGameClear,
    searchingGames,
    url
}: Props) {

    return (

        <div className="control-panel">

            <div className="rail-label">
                DISCOVER
            </div>

            <div className="rail-rule" />

            <div className="control-section">

                <label className="control-label">
                    LANGUAGE
                </label>

                <select
                    className="control-select"
                    value={language}
                    onChange={(e) =>
                        onLanguageChange(
                            e.target.value
                        )
                    }
                >
                    <option value="any">
                        {"\u{1F310}"} Any Language
                    </option>

                    <option value="en">
                        {"\u{1F1FA}\u{1F1F8}"} English
                    </option>

                    <option value="es">
                        {"\u{1F1EA}\u{1F1F8}"} Spanish
                    </option>

                    <option value="fr">
                        {"\u{1F1EB}\u{1F1F7}"} French
                    </option>

                    <option value="de">
                        {"\u{1F1E9}\u{1F1EA}"} German
                    </option>

                    <option value="pt">
                        {"\u{1F1F5}\u{1F1F9}"} Portuguese
                    </option>

                    <option value="ja">
                        {"\u{1F1EF}\u{1F1F5}"} Japanese
                    </option>

                    <option value="ko">
                        {"\u{1F1F0}\u{1F1F7}"} Korean
                    </option>

                    <option value="ru">
                        {"\u{1F1F7}\u{1F1FA}"} Russian
                    </option>

                </select>

            </div>

            <div className="control-section">

                <label className="control-label">
                    PLATFORM
                </label>

                <div className="platform-selector">

                    <button
                        type="button"
                        className={
                            `platform-button ${
                                platform === "twitch"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            onPlatformChange(
                                "twitch"
                            )
                        }
                    >
                        TWITCH
                    </button>

                    <button
                        type="button"
                        className={
                            `platform-button ${
                                platform === "kick"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            onPlatformChange(
                                "kick"
                            )
                        }
                    >
                        KICK
                    </button>

                </div>

            </div>

            <div className="control-section">

                <label className="control-label">
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
                        {"\u{1F30D}"} Random
                    </option>

                    <option value="just-starting">
                        {"\u26A1"} Just Starting
                    </option>

                    <option value="less-than-10">
                        {"\u{1F465}"} Less Than 10 Viewers
                    </option>

                    <option value="partner-push">
                        {"\u{1F3C6}"} Partner Push
                    </option>

                    <option value="top-game">
                        {"\u{1F3AF}"} Top Games
                    </option>

                    <option value="on-the-rise">
                        {"\u{1F4C8}"} On the Rise
                    </option>

                </select>

            </div>

            <div className="control-section">

                <label className="control-label">
                    GAME
                </label>

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
                            onClick={
                                onGameClear
                            }
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
                            placeholder="Search a game..."
                            value={gameQuery}
                            onChange={(e) =>
                                onGameQueryChange(
                                    e.target.value
                                )
                            }
                        />

                        {searchingGames && (
                            <div className="game-search-status">
                                SEARCHING...
                            </div>
                        )}

                        {!searchingGames &&
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

                )}

            </div>

            <div className="control-divider" />

            <button
                type="button"
                className="drift-button"
                onClick={onNext}
            >
                <span>
                    DRIFT
                </span>

                <span className="drift-arrow">
                    {"\u2192"}
                </span>
            </button>

            {url !== "#" && (

                <a
                    className={
                        `watch-current ${platform}`
                    }
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                >
                    WATCH ON{" "}
                    {platform === "twitch"
                        ? "TWITCH"
                        : "KICK"}

                    <span>
                        {"\u2197"}
                    </span>
                </a>

            )}

        </div>
    );
}