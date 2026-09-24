import { Router } from "express";
import FeaturedService from "../services/FeaturedService";

const router = Router();

router.get("/", (_req, res) => {

    const featured =
        FeaturedService.getFeatured();

    if (!featured) {
        return res.status(404).json({
            error: "No featured creator is currently set."
        });
    }

    res.json(featured);
});

export default router;