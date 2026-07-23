interface Props {

    url: string;

    onNext: () => void | Promise<void>;

}

export default function DriftActions({
    url,
    onNext
}: Props) {

    return (

        <div className="drift-actions">

            <button
                className="drift-button"
                onClick={onNext}
            >
                DRIFT
            </button>

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
