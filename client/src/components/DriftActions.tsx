import type { DiscoveryMode } from "../services/Api";

interface Props {

    url: string;

    mode: DiscoveryMode;

    onModeChange: (mode: DiscoveryMode) => void;

    onNext: () => void | Promise<void>;

}

export default function DriftActions({
    url,
    mode,
    onModeChange,
    onNext
}: Props) {

    return (

        <div className="drift-actions">

            <div className="drift-controls">

                <select
                    className="drift-mode"
                    value={mode}
                    onChange={(e) => onModeChange(e.target.value as DiscoveryMode)}
                >
                    <option value="random">
                        🌍 Random
                    </option>

                    <option value="just-starting">
                        ⚡ Just Starting
                    </option>

                    <option value="less-than-10">
                        👥 Less Than 10 Viewers
                    </option>

                    <option value="partner-push">
                        🏆 Partner Push
                    </option>

                    <option value="top-game">
                        🎯 Top Games
                    </option>

                    <option value="on-the-rise">
                        📈 On the Rise
                    </option>

                </select>

                <button
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