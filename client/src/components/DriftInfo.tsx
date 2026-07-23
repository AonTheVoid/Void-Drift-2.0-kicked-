import type { Stream } from "../services/Api";

interface Props {
    stream: Stream;
}

export default function DriftInfo({ stream }: Props) {

    return (

        <div className="drift-info">

            <h2>{stream.title}</h2>

            <p className="stream-category">
                {stream.category}
            </p>

            <span className="stream-live">
                🔴 Live • {stream.viewers.toLocaleString()} watching
            </span>

        </div>

    );

}
