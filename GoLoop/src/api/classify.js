import axios from "axios";
import { Buffer } from "buffer";


export const config = {
    api: {
        bodyParser: false, // we forward raw binary
    },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed. Please use POST." });
    }

    const API_URL = process.env.HF_API_URL || process.env.VITE_HF_API_URL;
    const HF_API_KEY = process.env.HF_API_KEY;

    if (!API_URL || !HF_API_KEY) {
        console.error("Server configuration error: Missing API URL or Key");
        return res.status(500).json({ error: "Server configuration error." });
    }

    try {
        // collect raw bytes from the incoming request stream
        const chunks = [];
        await new Promise((resolve, reject) => {
            req.on("data", (c) => chunks.push(c));
            req.on("end", resolve);
            req.on("error", reject);
        });
        const buffer = Buffer.concat(chunks);

        const hfResponse = await axios.post(API_URL, buffer, {
            headers: {
                Authorization: `Bearer ${HF_API_KEY}`,
                "Content-Type": req.headers["content-type"] || "application/octet-stream",
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });

        return res.status(200).json(hfResponse.data);
    } catch (error) {
        console.error(
            "Error calling Hugging Face API:",
            error.response ? error.response.data : error.message
        );
        const errorMessage =
            error.response?.data?.error || "Failed to process the image on the backend.";
        const statusCode = error.response?.status || 500;
        return res.status(statusCode).json({ error: errorMessage });
    }
}
