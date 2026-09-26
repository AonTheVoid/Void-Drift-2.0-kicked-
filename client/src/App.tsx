import { useEffect, useState } from "react";

import DriftPlayer from "./components/DriftPlayer";
import DriftInfo from "./components/DriftInfo";
import DriftActions from "./components/DriftActions";

import {
    GetRandomStream,
    SearchGames,
    GetPicks,
    GetPickStream
} from "./services/Api";

import type {
    Stream,
    Platform,
    DiscoveryMode,
    GameResult,
    PickCreator
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

    const [previousDrifted, setPreviousDrifted] =
        useState<Stream[]>([]);

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

    const [picks, setPicks] =
        useState<PickCreator[]>([]);

    const [picksLoading, setPicksLoading] =
        useState(true);

const adImages = [
    "/ads/ad-01.png",
    "/ads/ad-02.png",
    "/ads/ad-03.png",
    "/ads/ad-04.png"
];

const [currentAd, setCurrentAd] =
    useState(0);

useEffect(() => {

    if (adImages.length <= 1) {
        return;
    }

    const interval =
        window.setInterval(() => {

            setCurrentAd((current) =>
                (current + 1) % adImages.length
            );

        }, 5000);

    return () =>
        window.clearInterval(interval);

}, []);

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

    useEffect(() => {

        async function LoadPicks() {

            try {

                setPicksLoading(true);

                const creators =
                    await GetPicks();

                setPicks(creators);

            } catch (error) {

                console.error(
                    "Unable to load Drift Picks.",
                    error
                );

                setPicks([]);

            } finally {

                setPicksLoading(false);

            }
        }

        void LoadPicks();

    }, []);

    async function LoadRandom() {

        /*
         * The current stream becomes "previous"
         * only when the user requests another drift.
         *
         * Initial page load has no current stream,
         * so nothing is added to history.
         */
        if (stream) {

            setPreviousDrifted((currentHistory) => {

                const creatorKey =
                    `${stream.platform}:${stream.channelLogin}`;

                const filtered =
                    currentHistory.filter(
                        (previous) =>
                            `${previous.platform}:${previous.channelLogin}` !==
                            creatorKey
                    );

                return [
                    stream,
                    ...filtered
                ].slice(0, 3);

            });

        }

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

    async function SelectPick(
        pick: PickCreator
    ) {

        try {

            const pickedStream =
                await GetPickStream(
                    pick.slot
                );

            if (!pickedStream) {

                return;
            }

            const nextStream: Stream = {

                platform:
                    pickedStream.platform,

                channelName:
                    pickedStream.channelName,

                channelLogin:
                    pickedStream.channelLogin,

                title:
                    pickedStream.title,

                category:
                    pickedStream.category,

                categoryId:
                    pickedStream.categoryId,

                language:
                    pickedStream.language,

                viewers:
                    pickedStream.viewers,

                thumbnail:
                    pickedStream.thumbnail,

                url:
                    pickedStream.url,

                startedAt:
                    pickedStream.startedAt,

                mature:
                    pickedStream.mature,

                profileImageUrl:
                    pick.profileImageUrl
            };

            setStream(nextStream);

        } catch (error) {

            console.error(
                "Unable to load Pick.",
                error
            );

        }
    }

    function SelectPrevious(
        previous: Stream
    ) {

        /*
         * Returning to history is NOT a new drift.
         * Therefore the current stream is not added
         * to history here.
         */
        setStream(previous);

        setLoading(false);

    }

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

            {/* HEADER */}

            <header className="app-header">

                <div className="brand">

                    <img
                        src="/logo.png"
                        alt="Void Drift"
                        className="app-logo"
                    />

                    <span className="brand-name">
                        VOID DRIFT
                    </span>

                </div>

                <nav className="platform-nav">

                    <button
                        type="button"
                        className={
                            `top-platform ${
                                platform === "twitch"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            SelectPlatform("twitch")
                        }
                    >
                        TWITCH
                    </button>

                    <button
                        type="button"
                        className={
                            `top-platform ${
                                platform === "kick"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            SelectPlatform("kick")
                        }
                    >
                        KICK
                    </button>

                </nav>

                <p className="app-tagline">
                    DRIFT UNTIL YOU FIND SOMEONE WORTH SITTING IN THE VOID WITH.
                </p>

            </header>

            <main className="drift-layout">

                {/* LEFT COLUMN */}

                <aside className="left-column">

                    <section className="panel featured-panel">

                        <div className="panel-heading">
                            FEATURED STREAMER
                        </div>

                        {featuredLoading ? (

                            <div className="featured-empty">
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
                                    className="featured-button"
                                >

                                    WATCH ON{" "}
                                    {featured.platform === "twitch"
                                        ? "TWITCH"
                                        : "KICK"}

                                    <span>
                                        ↗
                                    </span>

                                </a>

                            </div>

                        ) : (

                            <div className="featured-empty">
                                NO FEATURED CREATOR
                            </div>

                        )}

                    </section>

                    <section className="panel picks-panel">

                        <div className="panel-heading">
                            VOID PICKS
                        </div>

                        {picksLoading ? (

                            <div className="placeholder-list">

                                <div className="placeholder-row">

                                    <div className="placeholder-avatar" />

                                    <div>
                                        <strong>LOADING</strong>
                                        <span>Loading Drift Picks</span>
                                    </div>

                                </div>

                            </div>

                        ) : picks.length === 0 ? (

                            <div className="featured-empty">
                                NO PICKS
                            </div>

                        ) : (

                            <div className="placeholder-list">

                                {picks.map((pick) => (

                                    <div
                                        className="placeholder-row"
                                        key={pick.slot}
                                    >

                                        <div className="placeholder-avatar">

                                            {pick.profileImageUrl && (

                                                <img
                                                    src={
                                                        pick.profileImageUrl
                                                    }
                                                    alt={
                                                        pick.channelName
                                                    }
                                                />

                                            )}

                                        </div>

                                        <div>

                                            <strong>
                                                {pick.channelName}
                                            </strong>

                                            <span>
                                                {pick.platform === "twitch"
                                                    ? "TWITCH"
                                                    : "KICK"}
                                            </span>

                                        </div>

                                        <a
                                            href={pick.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="pick-watch-button"
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        >
                                            <span>
                                                WATCH STREAM
                                            </span>

                                            <span>
                                                ↗
                                            </span>
                                        </a>

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>

                </aside>

                {/* CENTER */}

                <section className="center-column">

                    <div
    className="player-frame"
    style={
        stream
            ? {
                "--stream-background":
                    `url("${stream.thumbnail}")`
            } as React.CSSProperties
            : undefined
    }
>

                        {stream ? (

                            <DriftPlayer
                                stream={stream}
                            />

                        ) : (

                            <div className="player-empty">

                                NOTHING IS DRIFTING HERE.

                            </div>

                        )}

                        

                    </div>

                    {stream && (

                        <section className="stream-info-panel">

                            <DriftInfo
                                stream={stream}
                            />

                            <a
                                href={stream.url}
                                target="_blank"
                                rel="noreferrer"
                                className="watch-now-button"
                            >

                                WATCH NOW

                                <span>
                                    ↗
                                </span>

                            </a>

                        </section>

                    )}

                </section>

                {/* RIGHT COLUMN */}

                <aside className="right-column">

<section className="right-ad-panel">

    <span>
        ADVERTISEMENT
    </span>

  <div className="ad-slideshow">

    {adImages.map((image, index) => (
        <img
            key={image}
            src={image}
            alt="Advertisement"
            className={`ad-slide ${
                index === currentAd
                    ? "ad-slide-active"
                    : ""
            }`}
        />
    ))}

</div>

<div className="ad-free-cta">
    ADVERTISE YOUR STREAM HERE 
FOR FREE
</div>


<a
    href="https://aonthevoid.com/pages/contact"
    target="_blank"
    rel="noreferrer"
    className="ad-contact-button"
>
    CONTACT US
</a>

</section>

                    <section className="panel controls-panel">

                        <div className="panel-heading">
                            DRIFT CONTROLS
                        </div>

                        <div className="control-group">

                            <label>
                                LANGUAGE
                            </label>

                            <select
                                className="control-select"
                                value={language}
                                onChange={(event) =>
                                    setLanguage(
                                        event.target.value
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
                            url={
                                stream?.url ?? "#"
                            }
                            mode={mode}
                            onModeChange={setMode}
                            onNext={LoadRandom}
                            gameQuery={gameQuery}
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
                        />

                    </section>

                    <section className="panel previous-panel">

                        <div className="panel-heading">
                            PREVIOUS DRIFTED
                        </div>

                        {previousDrifted.length === 0 ? (

                            <div className="previous-placeholder">

                                <strong>
                                    DRIFT HISTORY
                                </strong>

                                <span>
                                    Your previous creators will appear here.
                                </span>

                            </div>

                        ) : (

                            <div className="placeholder-list">

                                {previousDrifted.map(
                                    (previous) => (

                                        <button
                                            type="button"
                                            className="placeholder-row"
                                            key={
                                                `${previous.platform}:${previous.channelLogin}`
                                            }
                                            onClick={() =>
                                                SelectPrevious(
                                                    previous
                                                )
                                            }
                                        >

                                            <div className="placeholder-avatar">

                                                {previous.profileImageUrl && (

                                                    <img
                                                        src={
                                                            previous.profileImageUrl
                                                        }
                                                        alt={
                                                            previous.channelName
                                                        }
                                                    />

                                                )}

                                            </div>

                                            <div>

                                                <strong>
                                                    {previous.channelName}
                                                </strong>

                                                <span>
                                                    {previous.category ||
                                                        "Unknown Category"}
                                                    {" · "}
                                                    {previous.viewers.toLocaleString()}
                                                    {" viewers"}
                                                </span>

                                            </div>

                                            <span>
                                                {previous.platform === "twitch"
                                                    ? "◉ TWITCH"
                                                    : "◉ KICK"}
                                            </span>

                                        </button>

                                    )
                                )}

                            </div>

                        )}

                    </section>

                </aside>

            </main>

        </div>
    );
}