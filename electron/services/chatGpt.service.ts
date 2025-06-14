import axios from "axios";
import FormData from "form-data";
import log from "electron-log";

export async function transcribeWithOpenAi(
  buffer: ArrayBuffer
): Promise<string> {
  log.info("[OpenAI] Received buffer for transcription", {
    type: typeof buffer,
    byteLength: buffer && (buffer as ArrayBuffer).byteLength,
  });
  console.log("[OpenAI] new buffer", buffer);
  const form = new FormData();
  form.append("file", Buffer.from(buffer), {
    filename: "audio.webm",
    contentType: "audio/webm",
  });
  form.append("model", "whisper-1");

  const res = await axios.post(
    "https://api.openai.com/v1/audio/transcriptions",
    form,
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
    }
  );

  log.info("[OpenAI] Transcription response received");
  return res.data.text;
}
