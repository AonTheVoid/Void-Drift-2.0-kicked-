import type { Stream } from "../services/Api";

interface Props {
    stream: Stream;
}

export default function DriftPlayer({ stream }: Props) {

    const src =
        `https://player.twitch.tv/?channel=${stream.channelLogin}&parent=localhost&autoplay=true&muted=false`;

    return (
        <div className="drift-player">
            <iframe
                title={stream.channelName}
                src={src}
                width="100%"
                height="100%"
                allowFullScreen
                allow="autoplay; fullscreen"
            />
        </div>
    );

}
