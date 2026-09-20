import type { Stream } from "../services/Api";

interface Props {
    stream: Stream;
}

export default function DriftPlayer({
    stream
}: Props) {

    const src =
        stream.platform === "twitch"
            ? `https://player.twitch.tv/?channel=${stream.channelLogin}&parent=drift.aonthevoid.com&autoplay=true&muted=false`
            : `https://player.kick.com/${stream.channelLogin}?autoplay=true`;

    return (

        <div className="drift-player">

            <iframe
                title={
                    stream.channelName
                }
                src={src}
                width="100%"
                height="100%"
                allowFullScreen
                allow="autoplay; fullscreen"
            />

        </div>

    );

}
