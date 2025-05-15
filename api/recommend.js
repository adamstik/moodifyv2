// /api/recommend.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { mood } = req.body;
  if (!mood) {
    return res.status(400).json({ error: 'Mood is required' });
  }

  const prompt = `
Give me a list of 8 songs that match the mood "${mood}".
Only return JSON in this format:
[
  { "title": "Song Name", "artist": "Artist Name" },
  ...
]
  `.trim();

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const json = await openaiRes.json();
    const message = json.choices?.[0]?.message?.content || "";

    const match = message.match(/\[.*\]/s);
    if (!match) throw new Error("No JSON detected.");

    const songs = JSON.parse(match[0]);
    return res.status(200).json(songs);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Failed to generate recommendations." });
  }
}
