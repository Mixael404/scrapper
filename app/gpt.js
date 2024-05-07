import OpenAI from "openai";

const REQUEST_HEADING =
  "Напиши небольшой (1-2 абзаца) пересказ данной статьи. Пересказ должен полностью уместиться в 500 токенов. Игнорируй текст, который написан не на русском языке. Статья должна быть связной и цельной, как будто её писал настоящий журналист. Пересказ должен передать общий смысл всей статьи. Выдели главные аспекты статьи и обязательно отрази их в своём пересказе. Сделай тон произраильским. В отношении произраильских сил используй более личные формулировки. В отношении противников Израиля, более сухие и официальные. В некоторых местах исходного текста могут быть резкие обрывания. В таких случаях используй только те места из статьи, где понятен смысл написанного. Пересказ должен быть цельным и связным, без обрывания мысли. Твой пересказ должен быть написан на грамотном русском языке, без неправильных словосочетаний, обрываний предложений, лексических и грамматических ошибок.  Используй правильные словосочетания, которые люди используют в обычном общении.";


const REQ_TITLE_HEADING = 'Немного перефразируй этот заголовок новостной статьи. Количество слов в твоём ответе должно быть примерно таким же, как и в исходном. :'

const openai = new OpenAI({
  organization: "org-VhVLUTAhfUyYSs6tTQnCytZq",
  project: "proj_4szXpGVlXpRWFv2UmNIIIDK4",
  apiKey: "sk-proj-qEk7gvBgAJtlkB0278TqT3BlbkFJ6yNCZZhLUFjvHqIZfNYe",
});

export function generateRequestTextForTitle(title){
  const reqString = `${REQ_TITLE_HEADING}\n\n${title}`
  return reqString
}


export function generateRequestText(title, body) {
  const reqString = `${REQUEST_HEADING}\n\nЗаголовок:\n\n${title}\n\nСтатья:\n\n${body}`;
  return reqString;
}

export async function makeRequest(reqText) {
  const requestBody = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `${reqText}` }],
    temperature: 0.8,
    max_tokens: 600,
  };
  const response = await openai.chat.completions.create(requestBody);
  return response.choices[0].message.content;
}
