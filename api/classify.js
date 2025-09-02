import axios from "axios";

export const config = {
  api: { bodyParser: false }, 
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    const hfResponse = await axios.post(process.env.HF_API_URL, rawBody, {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": req.headers["content-type"], 
      },
    });

    return res.status(200).json(hfResponse.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res
      .status(err.response?.status || 500)
      .json({ error: "Failed to classify image" });
  }
}
