import type { Stream } from "../services/Api";

interface Props {
    stream: Stream;
}

export default function DriftInfo({
    stream
}: Props) {

    return (

        <div className="drift-info">

            <div className="drift-info-main">

                <div className="drift-info-avatar">

                    {stream.profileImageUrl ? (

                        <img
                            src={stream.profileImageUrl}
                            alt=""
                        />

                    ) : (

                        <span>
                            {stream.channelName
                                ?.charAt(0)
                                .toUpperCase() || "?"}
                        </span>

                    )}

                </div>


                <div className="drift-info-content">

                    <div className="drift-info-name">
                        {stream.channelName}
                    </div>


                    <div className="stream-name">
                        {stream.title}
                    </div>


                    <div className="drift-info-meta">

                        <span className="live-dot" />

                        <span>
                            LIVE
                        </span>

                        <span>•</span>

                        <span>
                            {stream.category}
                        </span>

                        <span>•</span>

                        <span>
                            {stream.viewers.toLocaleString()}
                            {" "}
                            watching
                        </span>

                    </div>

                </div>

            </div>

        </div>

    );
}