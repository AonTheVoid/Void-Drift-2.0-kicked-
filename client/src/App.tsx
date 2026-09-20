import { useEffect, useState } from "react";

import DriftPlayer from "./components/DriftPlayer";
import DriftInfo from "./components/DriftInfo";
import DriftActions from "./components/DriftActions";

import {
    GetRandomStream,
    SearchGames
} from "./services/Api";

import type {
    Stream,
    Platform,
    DiscoveryMode,
    GameResult
} from "./services/Api";

import "./styles/app.css";

export default function App() {

    const [stream, setStream] =
        useState<Stream | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [platform, setPlatform] =
        useState<Platform>(() => {

            const saved =
                localStorage.getItem(
                    "void-platform"
                );

            if (
                saved === "twitch" ||
                saved === "kick"
            ) {
                return saved;
            }

            return "twitch";

        });

    const [mode, setMode] =
        useState<DiscoveryMode>("random");

    const [language, setLanguage] =
        useState(() => {

            const saved =
                localStorage.getItem(
                    "void-language"
                );

            if (saved)
                return saved;

            const browser =
                navigator.language.toLowerCase();

            if (browser.startsWith("en"))
                return "en";

            if (browser.startsWith("es"))
                return "es";

            if (browser.startsWith("fr"))
                return "fr";

            if (browser.startsWith("de"))
                return "de";

            if (browser.startsWith("pt"))
                return "pt";

            if (browser.startsWith("ja"))
                return "ja";

            if (browser.startsWith("ko"))
                return "ko";

            if (browser.startsWith("ru"))
                return "ru";

            return "any";

        });

    const [gameQuery, setGameQuery] =
        useState("");

    const [gameResults, setGameResults] =
        useState<GameResult[]>([]);

    const [selectedGame, setSelectedGame] =
        useState<GameResult | null>(null);

    const [searchingGames, setSearchingGames] =
        useState(false);

    useEffect(() => {

        localStorage.setItem(
            "void-platform",
            platform
        );

    }, [platform]);

    useEffect(() => {

        localStorage.setItem(
            "void-language",
            language
        );

    }, [language]);

    async function LoadRandom() {

        setLoading(true);

        try {

            const creator =
                await GetRandomStream(
                    platform,
                    language,
                    mode,
                    selectedGame?.id
                );

            setStream(creator);

        } catch (error) {

            console.error(
                "Unable to load creator.",
                error
            );

            /*
             * Keep the current stream visible if
             * the new request fails.
             */
            if (!stream) {
                setStream(null);
            }

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        void LoadRandom();

    }, [
        platform,
        language,
        mode,
        selectedGame
    ]);

    useEffect(() => {

        const query =
            gameQuery.trim();

        if (!query) {

            setGameResults([]);
            setSearchingGames(false);

            return;

        }

        const timeout =
            window.setTimeout(
                async () => {

                    try {

                        setSearchingGames(true);

                        const results =
                            await SearchGames(
                                platform,
                                query
                            );

                        setGameResults(
                            results
                        );

                    } catch (error) {

                        console.error(
                            "Unable to search games.",
                            error
                        );

                        setGameResults([]);

                    } finally {

                        setSearchingGames(
                            false
                        );

                    }

                },
                300
            );

        return () =>
            window.clearTimeout(
                timeout
            );

    }, [
        platform,
        gameQuery
    ]);

    function SelectPlatform(
        nextPlatform: Platform
    ) {

        if (
            nextPlatform === platform
        ) {
            return;
        }

        setPlatform(
            nextPlatform
        );

        setSelectedGame(null);
        setGameQuery("");
        setGameResults([]);

    }

    function SelectGame(
        game: GameResult
    ) {

        setSelectedGame(game);
        setGameQuery("");
        setGameResults([]);

    }

    function ClearGame() {

        setSelectedGame(null);
        setGameQuery("");
        setGameResults([]);

    }

    /*
     * Initial load only.
     *
     * Once a stream exists, we NEVER replace it
     * with a loading screen while another stream
     * is being requested.
     */
    if (!stream && loading) {

        return (
            <div className="loading-screen">

                <video
                    className="background-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                >
                    <source
                        src="/background.mp4"
                        type="video/mp4"
                    />
                </video>

                <div className="background-overlay" />

            </div>
        );

    }

    /*
     * A request finished and there is genuinely
     * no stream available for the current filter.
     */
    if (!stream && !loading) {

        return (
            <div className="app empty-state">

                <video
                    className="background-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                >
                    <source
                        src="/background.mp4"
                        type="video/mp4"
                    />
                </video>

                <div className="background-overlay" />

                <header className="app-header">

                    <img
                        src="/logo.png"
                        alt="Void Drift"
                        className="app-logo"
                    />

                    <p className="app-tagline">
                        Drift until you find someone worth
                        sitting in the void with.
                    </p>

                    <select
                        className="language-select"
                        value={language}
                        onChange={(e) =>
                            setLanguage(
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
                                SelectPlatform(
                                    "twitch"
                                )
                            }
                        >
                            Twitch
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
                                SelectPlatform(
                                    "kick"
                                )
                            }
                        >
                            Kick
                        </button>

                    </div>

                </header>

                <div className="no-streams">

                    <div className="no-streams-icon">
                        {"\u2205"}
                    </div>

                    <h2>
                        Nothing is drifting here.
                    </h2>

                    <p>
                        No live creators were found for
                        {selectedGame
                            ? ` ${selectedGame.name}`
                            : " this filter"}.
                    </p>

                    {selectedGame && (

                        <button
                            type="button"
                            className="drift-button"
                            onClick={ClearGame}
                        >
                            CLEAR GAME
                        </button>

                    )}

                </div>

            </div>
        );

    }

    return (

        <div className="app">

            <video
                className="background-video"
                autoPlay
                muted
                loop
                playsInline
            >
                <source
                    src="/background.mp4"
                    type="video/mp4"
                />
            </video>

            <div className="background-overlay" />

            <header className="app-header">

                <img
                    src="/logo.png"
                    alt="Void Drift"
                    className="app-logo"
                />

                <p className="app-tagline">
                    Drift until you find someone worth
                    sitting in the void with.
                </p>

                <select
                    className="language-select"
                    value={language}
                    onChange={(e) =>
                        setLanguage(
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
                            SelectPlatform(
                                "twitch"
                            )
                        }
                    >
                        Twitch
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
                            SelectPlatform(
                                "kick"
                            )
                        }
                    >
                        Kick
                    </button>

                </div>

            </header>

            <DriftPlayer
                stream={stream}
            />

            <DriftInfo
                stream={stream}
            />

            <DriftActions
                platform={platform}
                url={stream.url}
                mode={mode}
                onModeChange={setMode}
                onNext={LoadRandom}
                gameQuery={gameQuery}
                onGameQueryChange={
                    setGameQuery
                }
                gameResults={gameResults}
                selectedGame={selectedGame}
                onGameSelect={SelectGame}
                onGameClear={ClearGame}
                searchingGames={
                    searchingGames
                }
            />

        </div>

    );

}