import dotenv from "dotenv";
import FeaturedService from "../services/FeaturedService";

dotenv.config();

async function main(): Promise<void> {

    const input =
        process.argv[2];

    if (!input) {
        console.error("");
        console.error(
            "Usage:"
        );
        console.error(
            'npm run featured -- "https://twitch.tv/creator"'
        );
        console.error(
            'npm run featured -- "https://kick.com/creator"'
        );
        console.error("");
        process.exit(1);
    }

    if (
        input.toLowerCase() === "clear"
    ) {
        FeaturedService.clearFeatured();

        console.log("");
        console.log(
            "Featured creator cleared."
        );
        console.log("");

        return;
    }

    try {

        console.log("");
        console.log(
            "Setting Void Drift featured creator..."
        );
        console.log("");

        const featured =
            await FeaturedService.setFeatured(
                input
            );

        console.log(
            "====================================="
        );
        console.log(
            "        FEATURED CREATOR SET"
        );
        console.log(
            "====================================="
        );
        console.log(
            `Platform : ${featured.platform}`
        );
        console.log(
            `Creator  : ${featured.channelName}`
        );
        console.log(
            `Channel  : ${featured.channelLogin}`
        );
        console.log(
            `Image    : ${featured.profileImageUrl}`
        );
        console.log(
            `URL      : ${featured.url}`
        );
        console.log(
            "====================================="
        );
        console.log("");

    } catch (error) {

        const message =
            error instanceof Error
                ? error.message
                : "Unknown error.";

        console.error("");
        console.error(
            `Featured update failed: ${message}`
        );
        console.error("");

        process.exit(1);
    }
}

void main();