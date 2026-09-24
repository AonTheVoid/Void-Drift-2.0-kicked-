import { useEffect, useState } from "react";

import DriftPlayer from "./components/DriftPlayer";
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

interface FeaturedCreator {
    platform: Platform;
    channelLogin: string;
    channelName: string;
    profileImageUrl: string;
    url: string;
    updatedAt: string;
}

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

            if (saved) {
                return saved;
            }

            const browser =
                navigator.language.toLowerCase();

            if (browser.startsWith("en")) return "en";
            if (browser.startsWith("es")) return "es";
            if (browser.startsWith("fr")) return "fr";
            if (browser.startsWith("de")) return "de";
            if (browser.startsWith("pt")) return "pt";
            if (browser.startsWith("ja")) return "ja";
            if (browser.startsWith("ko")) return "ko";
            if (browser.startsWith("ru")) return "ru";

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

    const [featured, setFeatured] =
        useState<FeaturedCreator | null>(null);

    const [featuredLoading, setFeaturedLoading] =
        useState(true);

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

    useEffect(() => {

        async function LoadFeatured() {

            try {

                const response =
                    await fetch("/api/featured");

                if (!response.ok) {
                    setFeatured(null);
                    return;
                }

                const creator =
                    await response.json();

                setFeatured(creator);

            } catch (error) {

                console.error(
                    "Unable to load featured creator.",
                    error
                );

                setFeatured(null);

            } finally {

                setFeaturedLoading(false);

            }

        }

        void LoadFeatured();

    }, []);

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

                        setGameResults(results);

                    } catch (error) {

                        console.error(
                            "Unable to search games.",
                            error
                        );

                        setGameResults([]);

                    } finally {

                        setSearchingGames(false);

                    }

                },
                300
            );

        return () =>
            window.clearTimeout(timeout);

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

        setPlatform(nextPlatform);

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

    const languageOptions = [
        ["any", "Any Language"],
        ["en", "English"],
        ["es", "Spanish"],
        ["fr", "French"],
        ["de", "German"],
        ["pt", "Portuguese"],
        ["ja", "Japanese"],
        ["ko", "Korean"],
        ["ru", "Russian"]
    ];

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

                <div className="loading-mark">
                    DRIFT
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

            </header>

            <main className="drift-layout">

                {/* =========================
                    LEFT — FEATURED
                ========================== */}

                <aside className="side-rail featured-rail">

                    <div className="rail-label">
                        FEATURED THIS WEEK
                    </div>

                    {featuredLoading ? (

                        <div className="featured-loading">
                            LOADING
                        </div>

                    ) : featured ? (

                        <div className="featured-card">

                            <div className="featured-image-wrap">

                                <img
                                    src={
                                        featured.profileImageUrl
                                    }
                                    alt={
                                        featured.channelName
                                    }
                                    className="featured-image"
                                />

                            </div>

                            <div className="featured-platform">

                                {featured.platform === "twitch"
                                    ? "TWITCH"
                                    : "KICK"}

                            </div>

                            <div className="featured-name">

                                {featured.channelName}

                            </div>

                            <a
                                href={featured.url}
                                target="_blank"
                                rel="noreferrer"
                                className={
                                    `featured-button ${featured.platform}`
                                }
                            >

                                WATCH ON{" "}
                                {featured.platform === "twitch"
                                    ? "TWITCH"
                                    : "KICK"}

                                <span>↗</span>

                            </a>

                        </div>

                    ) : (

                        <div className="featured-empty">

                            NO FEATURED CREATOR

                        </div>

                    )}

                </aside>

                {/* =========================
                    CENTER — PLAYER
                ========================== */}

                <section className="player-stage">

                    <div className="player-frame">

                        {stream ? (

                            <DriftPlayer
                                stream={stream}
                            />

                        ) : (

                            <div className="player-empty">

                                <div>
                                    NOTHING IS DRIFTING HERE.
                                </div>

                                <span>
                                    Try another platform,
                                    language, or game.
                                </span>

                            </div>

                        )}

                        {loading && stream && (

                            <div className="player-loading">
                                DRIFTING...
                            </div>

                        )}

                    </div>

                </section>

                {/* =========================
                    RIGHT — CONTROLS
                ========================== */}

                <aside className="side-rail controls-rail">

                    <div className="rail-label">
                        DISCOVER
                    </div>

                    <div className="control-group">

                        <label>
                            LANGUAGE
                        </label>

                        <select
                            className="control-select"
                            value={language}
                            onChange={(e) =>
                                setLanguage(
                                    e.target.value
                                )
                            }
                        >

                            {languageOptions.map(
                                ([value, label]) => (

                                    <option
                                        key={value}
                                        value={value}
                                    >
                                        {label}
                                    </option>

                                )
                            )}

                        </select>

                    </div>

                    <div className="control-group">

                        <label>
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
                                    SelectPlatform(
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
                                    SelectPlatform(
                                        "kick"
                                    )
                                }
                            >
                                KICK
                            </button>

                        </div>

                    </div>

                    <DriftActions
                        platform={platform}
                        url={stream?.url ?? "#"}
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
                        searchingGames={searchingGames}
                    />

                </aside>

            </main>

        </div>

    );

}