"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PicksService_1 = __importDefault(require("../services/PicksService"));
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 1 &&
        args[0].toLowerCase() === "clear") {
        PicksService_1.default.clear();
        console.log("All Drift Picks cleared.");
        return;
    }
    if (args.length !== 2) {
        console.log("");
        console.log("Void Drift — Drift Picks");
        console.log("");
        console.log('Set: npm run pick -- 1 "https://twitch.tv/creator"');
        console.log('Set: npm run pick -- 2 "https://kick.com/creator"');
        console.log("Clear: npm run pick -- clear");
        console.log("");
        process.exit(1);
    }
    const slot = Number(args[0]);
    const url = args[1];
    try {
        const pick = await PicksService_1.default.setPick(slot, url);
        console.log("");
        console.log(`Pick ${pick.slot} set successfully.`);
        console.log(`Platform : ${pick.platform}`);
        console.log(`Creator  : ${pick.channelName}`);
        console.log(`Channel  : ${pick.channelLogin}`);
        console.log(`Image    : ${pick.profileImageUrl}`);
        console.log(`URL      : ${pick.url}`);
        console.log("");
    }
    catch (error) {
        console.error("");
        console.error(error instanceof Error
            ? error.message
            : error);
        console.error("");
        process.exit(1);
    }
}
void main();
