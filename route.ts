import { streamText } from 'ai';
import { ragService } from '@/lib/rag-service';

export const maxDuration = 30;
export const runtime = 'edge';

// Hugging Face Inference API integration
async function queryHuggingFace(prompt: string) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
    {
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false
        }
      }),
    }
  );

  const result = await response.json();
  return Array.isArray(result) ? result[0]?.generated_text : result.generated_text;
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];
  const question = lastMessage.content;

  // Search document
  const ragResult = await ragService.query(question);

  // System prompt
  const systemPrompt = `Ты - эксперт по Национальной стратегии развития искусственного интеллекта РФ.
  
ИНСТРУКЦИИ:
1. Отвечай ТОЛЬКО на русском языке
2. Используй информацию из предоставленного контекста
3. Формулируй ответы СВОИМИ СЛОВАМИ
4. Всегда указывай источники (статьи)
5. Если информации нет в контексте, скажи об этом честно

КОНТЕКСТ:
${ragResult.context || 'Информация не найдена в документе.'}`;

  const userPrompt = `${systemPrompt}

ВОПРОС: ${question}

ОТВЕТ:`;

  // Generate response with Hugging Face
  const text = await queryHuggingFace(userPrompt);

  // Format response with sources
  const sources = ragResult.sources.length > 0 
    ? `\n\n📚 *Источники: ${ragResult.sources.join(', ')}*`
    : '';

  return new Response(
    JSON.stringify({
      choices: [{
        delta: {
          content: text + sources
        }
      }]
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
