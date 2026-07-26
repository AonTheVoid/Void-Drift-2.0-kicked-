import { useEffect, useState } from "react";

import DriftPlayer from "./components/DriftPlayer";
import DriftInfo from "./components/DriftInfo";
import DriftActions from "./components/DriftActions";

import { GetRandomStream } from "./services/Api";
import type { Stream, DiscoveryMode } from "./services/Api";

import "./styles/app.css";

export default function App() {

    const [stream, setStream] = useState<Stream | null>(null);

    const [loading, setLoading] = useState(true);

    const [mode, setMode] = useState<DiscoveryMode>("random");

    const [language, setLanguage] = useState(() => {

        const saved = localStorage.getItem("void-language");

        if (saved)
            return saved;

        const browser = navigator.language.toLowerCase();

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

    useEffect(() => {

        localStorage.setItem("void-language", language);

    }, [language]);

    async function LoadRandom() {

        try {

            const creator = await GetRandomStream(language, mode);

            setStream(creator);

        }

        catch (error) {

            console.error("Unable to load creator.", error);

        }

        finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        void LoadRandom();

    }, [language, mode]);

    if (loading) {

        return (
            <div className="loading">
                Loading...
            </div>
        );

    }

    if (!stream) {

        return (
            <div className="loading">
                Unable to load creator.
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
                    Drift until you find someone worth sitting in the void with.
                </p>

                <select
                    className="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="any">🌐 Any Language</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="fr">🇫🇷 French</option>
                    <option value="de">🇩🇪 German</option>
                    <option value="pt">🇵🇹 Portuguese</option>
                    <option value="ja">🇯🇵 Japanese</option>
                    <option value="ko">🇰🇷 Korean</option>
                    <option value="ru">🇷🇺 Russian</option>
                </select>

            </header>

            <DriftPlayer stream={stream} />

            <DriftInfo stream={stream} />

            <DriftActions
                url={stream.url}
                mode={mode}
                onModeChange={setMode}
                onNext={LoadRandom}
            />

        </div>

    );

}