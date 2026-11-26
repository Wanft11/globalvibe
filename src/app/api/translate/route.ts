import { resolve } from 'node:path';
import { env, pipeline, type TranslationPipeline } from '@huggingface/transformers';

const model = 'Xenova/opus-mt-zh-en';
const revision = '39d480d52a9ea3065a1f117adfe4dbc55de10e6f';
let translator: Promise<TranslationPipeline> | undefined;

function loadTranslator() {
  env.cacheDir = resolve(process.cwd(), '.model-cache');
  translator ??= pipeline('translation', model, { revision, dtype: 'q8', device: 'cpu' }).catch(error => {
    translator = undefined;
    throw error;
  });
  return translator;
}

export async function POST(request: Request) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin') {
    return Response.json({ error: 'invalid-input' }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!Array.isArray(body) || body.length < 1 || body.length > 5 ||
      !body.every(line => typeof line === 'string' && line.length <= 240 && /\p{Script=Han}/u.test(line))) {
    return Response.json({ error: 'invalid-input' }, { status: 400 });
  }

  try {
    const translate = await loadTranslator();
    const output = await translate(body);
    const translations = output.map(result => Array.isArray(result) ? undefined : result.translation_text?.trim());
    if (translations.length !== body.length || translations.some(line => !line)) {
      throw new Error('Incomplete translation');
    }
    return Response.json({ translations });
  } catch (error) {
    console.error('Local translation failed:', error instanceof Error ? error.message : 'Unknown error');
    return Response.json({ error: 'unavailable' }, { status: 503 });
  }
}
