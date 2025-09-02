// src/pages/api/classify.js
import axios from "axios";
import { Buffer } from "buffer";


export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Baca file upload (stream) jadi Buffer
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const fileBuffer = Buffer.concat(chunks);

        // Kirim ke Hugging Face API
        const response = await axios.post(
            process.env.HF_API_URL || "https://api-inference.huggingface.co/models/your-model",
            fileBuffer,
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                    "Content-Type": "application/octet-stream",
                },
            }
        );

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Classification failed" });
    }
}
