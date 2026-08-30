"""
Groq-powered Chat Service for Aapli Wari
-----------------------------------------
Uses Groq API (llama-3.3-70b-versatile) — extremely fast inference.

Topic filter:
  - ONLY answers questions about Maharashtra Wari, Palkhi, Varkari tradition,
    Pandharpur, saints (Dnyaneshwar, Tukaram, Namdev, Eknath, Chokhamela),
    abhangs, kirtan, dindi, seva, Chandrabhaga, Vitthal etc.
  - For anything else → returns a polite static message.
"""

import os
import httpx
from groq import Groq

# ── Groq client ───────────────────────────────────────────────────────────────
_client: Groq | None = None


def get_groq_client() -> Groq:
    global _client
    if _client is None:
        key = os.getenv("GROQ_API_KEY")
        if not key:
            raise RuntimeError("GROQ_API_KEY is not set in .env")
        _client = Groq(api_key=key, http_client=httpx.Client())
    return _client


# ── System prompt — strict topic guard ───────────────────────────────────────
SYSTEM_PROMPT = """
You are Aapli Wari AI — a knowledgeable and respectful assistant dedicated
exclusively to the heritage and traditions of the Pandharpur Wari pilgrimage
of Maharashtra, India.

YOUR ALLOWED TOPICS (answer ONLY these):
- Pandharpur Wari pilgrimage and its history
- Palkhi processions (Dnyaneshwar Palkhi from Alandi, Tukaram Palkhi from Dehu)
- Varkari tradition, philosophy, and way of life
- Varkari saints: Sant Dnyaneshwar, Sant Tukaram, Sant Namdev, Sant Eknath,
  Sant Chokhamela, Sant Janabai, Sant Gora Kumbhar, Sant Sena Nhavi
- Abhangs (devotional poetry) and kirtan performances
- Dindi groups and their significance
- Vitthal / Vithoba / Pandurang deity and Pandharpur temple
- Chandrabhaga river and ghats at Pandharpur
- Wari route geography: Alandi, Dehu, Saswad, Jejuri, Lonand, Natepute, Pandharpur
- Ashadhi Ekadashi and Kartiki Ekadashi festivals
- Seva traditions during Wari (annadaan, medical seva, water distribution)
- Warkari music, instruments (mridanga, veena, jhanj, taal)
- Manuscripts and ancient texts related to Varkari sampradaya
- Maharashtra's bhakti movement history

STRICT RULE:
If the question is about ANYTHING outside the above topics (politics, cricket,
movies, general knowledge, science, other religions, other countries, coding,
cooking, etc.) you MUST respond with EXACTLY this message and nothing else:

"मला माफ करा — मी फक्त पंढरपूर वारी, पालखी, वारकरी परंपरा आणि संत साहित्याबद्दलच
माहिती देऊ शकतो. या विषयांबाहेरील प्रश्नांची उत्तरे देणे माझ्या कार्यक्षेत्रात येत नाही.

(I'm sorry — I can only provide information about Pandharpur Wari, Palkhi,
Varkari tradition, and saint literature. Questions outside these topics are
beyond my scope.)"

Be warm, respectful, and use simple language. You may answer in English,
Marathi, or Hindi depending on what language the user writes in.
Keep answers concise — ideally 3 to 6 sentences unless more detail is needed.
""".strip()


# ── Topic keyword guard (fast pre-check before calling API) ──────────────────
WARI_KEYWORDS = {
    "wari", "vari", "warkari", "varkari", "palkhi", "palki", "pandharpur",
    "vitthal", "vithoba", "pandurang", "tukaram", "dnyaneshwar", "namdev",
    "eknath", "chokhamela", "janabai", "abhang", "kirtan", "dindi",
    "chandrabhaga", "alandi", "dehu", "ashadhi", "ekadashi", "kartiki",
    "bhakti", "sant", "saint", "maharashtra", "wari heritage", "palkhi route",
    "mridanga", "veena", "jhanj", "seva", "annadaan", "natepute", "jejuri",
    "saswad", "lonand", "waari", "vaari", "विठ्ठल", "वारी", "पालखी",
    "वारकरी", "पंढरपूर", "तुकाराम", "ज्ञानेश्वर", "अभंग", "कीर्तन",
    "दिंडी", "चंद्रभागा",
}


def _is_wari_related(query: str) -> bool:
    """Quick keyword check — if any Wari keyword found, allow the API call."""
    q = query.lower()
    return any(kw in q for kw in WARI_KEYWORDS)


# ── Off-topic static response ─────────────────────────────────────────────────
OFF_TOPIC_RESPONSE = (
    "मला माफ करा — मी फक्त पंढरपूर वारी, पालखी, वारकरी परंपरा आणि संत साहित्याबद्दलच "
    "माहिती देऊ शकतो.\n\n"
    "I'm sorry — I can only answer questions about Pandharpur Wari, Palkhi processions, "
    "Varkari tradition, and the saint poets of Maharashtra. "
    "Please ask me something related to Wari heritage."
)


# ── Main chat function ────────────────────────────────────────────────────────
def groq_chat(query: str, history: list[dict] | None = None) -> dict:
    """
    Send a query to Groq and return { answer, sources }.

    history: optional list of prior messages in format
             [{ role: 'user'|'assistant', content: str }, ...]
    """
    query = query.strip()

    if not query:
        return {"answer": "Please type a question.", "sources": []}

    # Fast off-topic pre-filter — short queries that have no Wari keywords
    # are almost certainly off-topic, but we still let the LLM decide
    # for ambiguous longer questions (the system prompt handles it).
    if len(query) < 80 and not _is_wari_related(query):
        return {"answer": OFF_TOPIC_RESPONSE, "sources": []}

    try:
        client = get_groq_client()

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Include last 6 turns of conversation history for context
        if history:
            messages.extend(history[-6:])

        messages.append({"role": "user", "content": query})

        completion = client.chat.completions.create(
            model="groq/compound-mini",
            messages=messages,
            temperature=0.4,
            max_tokens=600,
            top_p=0.9,
        )

        answer = completion.choices[0].message.content.strip()
        return {"answer": answer, "sources": []}

    except Exception as e:
        print(f"[Groq] Error: {e}")
        return {
            "answer": "I'm having trouble connecting right now. Please try again in a moment.",
            "sources": [],
        }
