import hashlib
import threading
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import redis as redis_lib

from backend.app.core.config import REDIS_URL

# ---------- Lazy-loading state (thread-safe) ----------
_model = None
_tokenizer = None
_device = None
_lock = threading.Lock()

# ---------- Redis client ----------
_redis_client = None

def _get_redis():
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis_lib.from_url(REDIS_URL, decode_responses=True)
            _redis_client.ping()
        except Exception as e:
            print(f"Redis unavailable, caching disabled: {e}")
            _redis_client = None
    return _redis_client

# ---------- NLLB language codes ----------
LANG_CODES = {
    "mr": "mar_Deva",
    "hi": "hin_Deva",
    "en": "eng_Latn",
    "sa": "san_Deva",
}

MODEL_NAME = "facebook/nllb-200-distilled-600M"


def _get_model():
    global _model, _tokenizer, _device
    if _model is None:
        with _lock:
            if _model is None:  # double-checked locking
                _device = "cuda" if torch.cuda.is_available() else "cpu"
                print(f"Loading NLLB model on {_device}... (~20s first time)")
                _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
                _model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(_device)
                if _device == "cpu":
                    torch.set_num_threads(2)
                print("NLLB model loaded successfully.")
    return _model, _tokenizer, _device


def _translate_chunk(text: str, src_lang: str, tgt_lang: str) -> str:
    if not text or not text.strip():
        return ""

    src_code = LANG_CODES.get(src_lang)
    tgt_code = LANG_CODES.get(tgt_lang)
    if not src_code or not tgt_code:
        print(f"Unsupported language pair: {src_lang} -> {tgt_lang}")
        return text

    model, tokenizer, device = _get_model()

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=512,
        src_lang=src_code,
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}

    tgt_lang_id = tokenizer.convert_tokens_to_ids(tgt_code)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            forced_bos_token_id=tgt_lang_id,
            max_length=1024,
            num_beams=4,
        )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)


def translate_long_text(text: str, src_lang: str, tgt_lang: str, chunk_size: int = 450) -> str:
    if not text:
        return ""
    words = text.split()
    chunks = [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]
    return " ".join(_translate_chunk(chunk, src_lang, tgt_lang) for chunk in chunks)


def translate_with_cache(text: str, src_lang: str, tgt_lang: str) -> str:
    if not text:
        return ""

    cache_key = f"nllb_{src_lang}_{tgt_lang}_{hashlib.md5(text.encode()).hexdigest()}"

    r = _get_redis()
    if r:
        try:
            cached = r.get(cache_key)
            if cached is not None:
                return cached
        except Exception:
            pass

    result = translate_long_text(text, src_lang, tgt_lang)

    if r and result:
        try:
            r.setex(cache_key, 60 * 60 * 24 * 30, result)  # 30 days
        except Exception:
            pass

    return result
