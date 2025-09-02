export const config = {
  api: {
    bodyParser: false, 
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const API_URL = process.env.VITE_HF_API_URL;
  const HF_API_KEY = process.env.HF_API_KEY;

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    const hfResponse = await axios.post(API_URL, rawBody, {
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': req.headers['content-type'],
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    res.status(200).json(hfResponse.data);
  } catch (error) {
    console.error("Error calling Hugging Face API:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || "Failed to process the image on the backend.",
    });
  }
}
