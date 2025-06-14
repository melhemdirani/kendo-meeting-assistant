import axios from "axios";
import FormData from "form-data";
export async function transcribeWithWhisper(arrayBuffer) {
    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(arrayBuffer);
    // Prepare FormData
    const form = new FormData();
    form.append("file", buffer, {
        filename: "audio.webm",
        contentType: "audio/webm",
    });
    form.append("model", "whisper-1");
    // Send POST request to OpenAI Whisper API
    const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", form, {
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            ...form.getHeaders(),
        },
    });
    // Return transcription text
    return response.data.text;
}
