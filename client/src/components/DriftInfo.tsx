import type { Stream } from "../services/Api";

interface Props {
    stream: Stream;
}

export default function DriftInfo({ stream }: Props) {

    return (

        <div className="drift-info">

            <h3 className="stream-name">
                {stream.channelName}
            </h3>

            <h2>{stream.title}</h2>

            <span className="stream-live">
                🔴 Live • {stream.category} • {stream.viewers.toLocaleString()} watching
            </span>

        </div>

    );

}
