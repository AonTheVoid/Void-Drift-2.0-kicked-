import {
    useEffect,
    useState
} from "react";

import type { Stream } from "../services/Api";

interface Props {
    stream: Stream;
}

function GetPlayerSrc(
    stream: Stream
) {
    return stream.platform === "twitch"
        ? `https://player.twitch.tv/?channel=${encodeURIComponent(
            stream.channelLogin
        )}&parent=drift.aonthevoid.com&autoplay=true&muted=false`
        : `https://player.kick.com/${encodeURIComponent(
            stream.channelLogin
        )}?autoplay=true`;
}

function GetStreamKey(
    stream: Stream
) {
    return (
        `${stream.platform}:` +
        `${stream.channelLogin}`
    );
}

export default function DriftPlayer({
    stream
}: Props) {

    const [
        visibleStream,
        setVisibleStream
    ] = useState(stream);

    const [
        pendingStream,
        setPendingStream
    ] = useState<Stream | null>(null);

    const [
        pendingLoaded,
        setPendingLoaded
    ] = useState(false);

    const [
        transitioning,
        setTransitioning
    ] = useState(false);

    useEffect(() => {

        const currentKey =
            GetStreamKey(
                visibleStream
            );

        const nextKey =
            GetStreamKey(
                stream
            );

        if (
            currentKey ===
            nextKey
        ) {
            return;
        }

        setPendingStream(stream);
        setPendingLoaded(false);
        setTransitioning(true);

    }, [
        stream,
        visibleStream
    ]);

    function HandlePendingLoaded() {

        setPendingLoaded(true);

        /*
         * Give the logo transition a moment
         * to breathe before revealing the stream.
         */
        window.setTimeout(() => {

            setVisibleStream(stream);
            setPendingStream(null);

            /*
             * Keep the black/logo screen visible
             * just long enough for the new iframe
             * to take over cleanly.
             */
            window.setTimeout(() => {

                setTransitioning(false);

            }, 350);

        }, 500);

    }

    return (

        <div
            className="drift-player"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: "#000"
            }}
        >

            {/* CURRENT STREAM */}

            <iframe
                title={
                    visibleStream.channelName
                }
                src={
                    GetPlayerSrc(
                        visibleStream
                    )
                }
                width="100%"
                height="100%"
                allowFullScreen
                allow="autoplay; fullscreen"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                    zIndex: 1
                }}
            />

            {/* NEXT STREAM
                Loads underneath the transition screen.
            */}

            {pendingStream && (

                <iframe
                    title={
                        pendingStream.channelName
                    }
                    src={
                        GetPlayerSrc(
                            pendingStream
                        )
                    }
                    width="100%"
                    height="100%"
                    allowFullScreen
                    allow="autoplay; fullscreen"
                    onLoad={
                        HandlePendingLoaded
                    }
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        border: 0,
                        zIndex: 2,
                        opacity:
                            pendingLoaded
                                ? 1
                                : 0
                    }}
                />

            )}

            {/* DRIFT TRANSITION */}

            <div
                className={
                    `drift-transition ${
                        transitioning
                            ? "active"
                            : ""
                    }`
                }
            >

                <img
                    src="/logo.png"
                    alt="Void Drift"
                    className="drift-transition-logo"
                />

            </div>

        </div>

    );
}