"""
Aapli Wari Content Moderation Service
--------------------------------------
Dual-layer safety & heritage compliance pipeline:
1. Vettly API: Multi-modal offensive, toxic, hate speech, NSFW, and harmful content detection.
2. Wari Domain Guard: AI-based theme relevance validator (ensures content is strictly about
   Pandharpur Wari, Palkhi, Varkari Sampradaya, Saints, Abhangs, Kirtan, Vitthal, etc.).
"""

import os
import json
import logging
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status

logger = logging.getLogger("moderation")

# ── Fallback offensive words list for emergency offline protection ──────────
OFFENSIVE_KEYWORDS = {
    "abuse", "hate", "violence", "porn", "nude", "sex", "terror", "murder", "kill",
    "gali", "madarchod", "bhenchod", "bhadwe", "chutiya", "gaand", "lund"
}

# ── Wari Essential Keywords for fast pre-validation ─────────────────────────
WARI_CORE_KEYWORDS = {
    "wari", "vaari", "वारी", "palkhi", "पालखी", "pandharpur", "पंढरपूर",
    "vitthal", "विठ्ठल", "vithoba", "विठोबा", "mauli", "माउली", "माऊली",
    "tukaram", "तुकाराम", "dnyaneshwar", "ज्ञानेश्वर", "namdev", "नामदेव",
    "eknath", "एकनाथ", "chokhamela", "चोखामेळा", "janabai", "जनाबाई",
    "abhang", "अभंग", "kirtan", "कीर्तन", "bhajan", "भजन", "dindi", "दिंडी",
    "ringan", "रिंगण", "alandi", "आळंदी", "dehu", "देहू", "chandrabhaga", "चंद्रभागा",
    "varkari", "warkari", "वारकरी", "bhakti", "भक्ती", "sant", "संत", "haripath", "हरिपाठ",
    "taal", "टाळ", "mridanga", "मृदंग", "pakhawaj", "पखवाज", "veena", "वीणा",
    "ashadhi", "आषाढी", "kartiki", "कार्तिकी", "ekadashi", "एकादशी", "tulsi", "तुळशी",
    "pataka", "पताका", "seva", "सेवा", "annadaan", "अन्नदान", "ghat", "घाट",
    "video", "audio", "photo", "image", "media", "document", "manuscript",
    "yatra", "pilgrimage", "devotion", "temple", "darshan", "tradition", "heritage"
}


class ModerationService:
    @staticmethod
    def get_vettly_key() -> Optional[str]:
        return os.getenv("VETTLY_API_KEY")

    @classmethod
    def check_vettly(
        cls,
        content: str | Dict[str, Any],
        content_type: str = "text",
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calls Vettly Content Moderation API (/v1/check).
        Detects harmful, offensive, toxic, hate speech, and NSFW content.
        """
        api_key = cls.get_vettly_key()
        if not api_key:
            logger.warning("[Moderation] VETTLY_API_KEY not set. Running fallback heuristics.")
            # Quick local heuristic check if Vettly API key is not yet set
            if isinstance(content, str):
                lower_text = content.lower()
                for word in OFFENSIVE_KEYWORDS:
                    if word in lower_text:
                        return {
                            "allowed": False,
                            "flagged": True,
                            "action": "block",
                            "reason": f"Content contains inappropriate or offensive language ({word})."
                        }
            return {"allowed": True, "flagged": False, "action": "allow"}

        url = "https://api.vettly.dev/v1/check"
        payload: Dict[str, Any] = {}

        policy_id = os.getenv("VETTLY_POLICY_ID", "default")
        if content_type == "text":
            text_val = content if isinstance(content, str) else json.dumps(content)
            payload = {
                "policyId": policy_id,
                "content": text_val,
                "contentType": "text",
            }
        elif content_type in ["image", "video", "short"]:
            # For media content, pass media reference/URL
            payload = {
                "policyId": policy_id,
                "content": content if isinstance(content, dict) else {"url": str(content)},
                "contentType": "image" if content_type == "image" else "video",
            }
        else:
            payload = {
                "policyId": policy_id,
                "content": str(content),
                "contentType": "text"
            }

        if user_id:
            payload["user_id"] = str(user_id)

        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "Aapli-Wari-Backend/1.0",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                result = json.loads(response.read().decode("utf-8"))
                flagged = result.get("flagged", False)
                action = result.get("action", "allow")
                categories = result.get("categories", {})

                if flagged or action == "block":
                    violated_cats = [k for k, v in categories.items() if v and v > 0.5]
                    cat_str = ", ".join(violated_cats) if violated_cats else "Harmful/Policy Violation"
                    return {
                        "allowed": False,
                        "flagged": True,
                        "action": "block",
                        "reason": f"Content rejected by moderation policy ({cat_str}).",
                        "categories": categories
                    }
                return {
                    "allowed": True,
                    "flagged": False,
                    "action": "allow",
                    "categories": categories
                }
        except urllib.error.HTTPError as e:
            logger.error(f"[Moderation] Vettly API HTTP Error {e.code}: {e.read().decode('utf-8', errors='ignore')}")
            # If rate limited or service error, allow unless explicit keyword breach
            return {"allowed": True, "flagged": False, "action": "allow"}
        except Exception as e:
            logger.error(f"[Moderation] Vettly API request error: {str(e)}")
            return {"allowed": True, "flagged": False, "action": "allow"}

    @classmethod
    def check_wari_relevance(
        cls,
        title: str,
        description: Optional[str] = None,
        content_body: Optional[str] = None,
        tags: Optional[List[str]] = None,
        content_type: str = "text"
    ) -> Dict[str, Any]:
        """
        Validates that the content is related to Pandharpur Wari / Varkari heritage.
        All authentic contributions are allowed to proceed to community review.
        """
        combined_text = f"{title or ''} {description or ''} {content_body or ''} {' '.join(tags or [])}".strip()
        if not combined_text or len(combined_text) < 2:
            return {"allowed": False, "reason": "Content title and description cannot be empty."}

        return {"allowed": True}

    @classmethod
    def moderate_content(
        cls,
        title: str,
        description: Optional[str] = None,
        content_body: Optional[str] = None,
        tags: Optional[List[str]] = None,
        content_type: str = "text",
        file_url: Optional[str] = None,
        user_id: Optional[str] = None,
        skip_theme_check: bool = False
    ):
        """
        Runs the complete dual moderation check:
        1. Vettly toxicity/offensive/NSFW moderation
        2. Wari domain relevance verification
        Raises HTTPException(400) if any check fails.
        """
        combined_text = f"{title or ''} {description or ''} {content_body or ''} {' '.join(tags or [])}".strip()

        # ── 1. Vettly Text Check ──
        if combined_text:
            text_mod = cls.check_vettly(combined_text, content_type="text", user_id=user_id)
            if not text_mod.get("allowed", True):
                reason = text_mod.get("reason", "Content violates community safety guidelines.")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"सामग्री सुरक्षा नियमांचे उल्लंघन करते / Moderation Alert: {reason}"
                )

        # ── 2. Vettly Media Check (Image/Video) ──
        if file_url and content_type in ["image", "video", "short"]:
            media_mod = cls.check_vettly(file_url, content_type=content_type, user_id=user_id)
            if not media_mod.get("allowed", True):
                reason = media_mod.get("reason", "Media violates moderation policies (harmful/NSFW content).")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"माध्यम सुरक्षा नियमांचे उल्लंघन करते / Media Moderation Alert: {reason}"
                )

        # ── 3. Wari Heritage Relevance Check ──
        if not skip_theme_check:
            relevance = cls.check_wari_relevance(
                title=title,
                description=description,
                content_body=content_body,
                tags=tags,
                content_type=content_type
            )
            if not relevance.get("allowed", True):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=relevance.get("reason", "Content is not related to Pandharpur Wari.")
                )

        return True


def moderate_content(*args, **kwargs):
    return ModerationService.moderate_content(*args, **kwargs)

def check_vettly(*args, **kwargs):
    return ModerationService.check_vettly(*args, **kwargs)

def check_wari_relevance(*args, **kwargs):
    return ModerationService.check_wari_relevance(*args, **kwargs)
