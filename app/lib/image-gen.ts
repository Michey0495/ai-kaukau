const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

export async function generateImage(
  prompt: string,
  options?: { width?: number; height?: number }
): Promise<string> {
  if (!TOGETHER_API_KEY) {
    throw new Error("TOGETHER_API_KEY is not set");
  }

  const res = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt,
      width: options?.width ?? 1024,
      height: options?.height ?? 1024,
      n: 1,
    }),
  });

  if (!res.ok) {
    throw new Error(`Image generation failed: ${res.status}`);
  }

  const data = await res.json();
  return data.data[0].url;
}
