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
                    await fetch(
                        "/api/featured"
                    );

                if (!response.ok) {
                    throw new Error(
                        "No featured creator."
                    );
                }

                const data =
                    await response.json();

                setFeatured(data);

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
                    <img
                        src="/logo.png"
                        alt="Void Drift"
                    />

                    <span>
                        ENTERING THE VOID
                    </span>
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
                    DRIFT UNTIL YOU FIND SOMEONE
                    WORTH SITTING IN THE VOID WITH.
                </p>

            </header>

            <main className="drift-layout">

                <aside className="side-rail featured-rail">

                    <div className="rail-label">
                        FEATURED THIS WEEK
                    </div>

                    <div className="rail-rule" />

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

                                <div className="featured-image-glow" />

                            </div>

                            <div className="featured-platform">
                                {featured.platform === "twitch"
                                    ? "TWITCH"
                                    : "KICK"}
                            </div>

                            <h2 className="featured-name">
                                {featured.channelName}
                            </h2>

                            <a
                                className={
                                    `featured-button ${featured.platform}`
                                }
                                href={
                                    featured.url
                                }
                                target="_blank"
                                rel="noreferrer"
                            >
                                WATCH ON{" "}
                                {featured.platform === "twitch"
                                    ? "TWITCH"
                                    : "KICK"}
                                <span>
                                    {"\u2197"}
                                </span>
                            </a>

                        </div>

                    ) : (

                        <div className="featured-empty">

                            <span>
                                {"\u2205"}
                            </span>

                            <p>
                                NO FEATURED CREATOR
                            </p>

                        </div>

                    )}

                </aside>

                <section className="player-stage">

                    {stream ? (

                        <DriftPlayer
                            stream={stream}
                        />

                    ) : (

                        <div className="player-empty">

                            <span>
                                {"\u2205"}
                            </span>

                            <p>
                                NOTHING IS DRIFTING HERE.
                            </p>

                            {selectedGame && (

                                <button
                                    type="button"
                                    onClick={ClearGame}
                                >
                                    CLEAR GAME
                                </button>

                            )}

                        </div>

                    )}

                    {loading && stream && (
                        <div className="stream-loading">
                            <span />
                            DRIFTING
                        </div>
                    )}

                </section>

                <aside className="side-rail controls-rail">

                    <DriftActions
                        platform={platform}
                        onPlatformChange={
                            SelectPlatform
                        }
                        language={language}
                        onLanguageChange={
                            setLanguage
                        }
                        mode={mode}
                        onModeChange={
                            setMode
                        }
                        onNext={
                            LoadRandom
                        }
                        gameQuery={
                            gameQuery
                        }
                        onGameQueryChange={
                            setGameQuery
                        }
                        gameResults={
                            gameResults
                        }
                        selectedGame={
                            selectedGame
                        }
                        onGameSelect={
                            SelectGame
                        }
                        onGameClear={
                            ClearGame
                        }
                        searchingGames={
                            searchingGames
                        }
                        url={
                            stream?.url ?? "#"
                        }
                    />

                </aside>

            </main>

        </div>
    );
}