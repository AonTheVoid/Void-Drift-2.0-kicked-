import { Router } from "express";

import PicksService from "../services/PicksService";

const router = Router();

router.get("/", async (_req, res) => {

    try {

        const picks =
            await PicksService.getPicksWithLiveData();

        res.json(picks);

    } catch (error) {

        console.error(
            "Unable to load Drift Picks.",
            error
        );

        res.status(500).json({
            error:
                "Unable to load Drift Picks."
        });

    }

});

router.get(
    "/:slot/stream",
    async (req, res) => {

        const slot =
            Number(req.params.slot);

        if (
            !Number.isInteger(slot) ||
            slot < 1 ||
            slot > 5
        ) {

            return res.status(400).json({
                error:
                    "Invalid Pick slot."
            });

        }

        try {

            const stream =
                await PicksService.getLiveStream(
                    slot
                );

            if (!stream) {

                return res.status(404).json({
                    error:
                        "Pick is currently offline."
                });

            }

            res.json(stream);

        } catch (error) {

            console.error(
                `Unable to load Pick ${slot}.`,
                error
            );

            res.status(500).json({
                error:
                    "Unable to load Pick stream."
            });

        }

    }
);

export default router;