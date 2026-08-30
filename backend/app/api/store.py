from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from typing import Optional, List
import requests
from backend.app.core.supabase import supabase
from backend.app.core.config import APPWRITE_BUCKET_ID
from backend.app.core.appwrite_client import upload_file_to_appwrite
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from uuid import UUID

router = APIRouter(prefix="/store", tags=["Store"])


def _normalize_product_row(r: dict):
    # convert supabase response row to API-friendly dict
    return {
        "id": r.get("id"),
        "seller_id": r.get("seller_id"),
        "name": r.get("name"),
        "description": r.get("description"),
        "category": r.get("category"),
        "price": float(r.get("price") or 0),
        "city": r.get("city"),
        "state": r.get("state"),
        "condition": r.get("condition"),
        "status": r.get("status"),
        "contact_number": r.get("contact_number"),
        "main_image": r.get("main_image"),
        "additional_images": r.get("additional_images") or [],
        "metadata": r.get("metadata") or {},
        "created_at": r.get("created_at"),
        "updated_at": r.get("updated_at"),
    }


@router.get('/images/{bucket_id}/{file_id}')
def proxy_appwrite_image(bucket_id: str, file_id: str):
    """Proxy Appwrite file view through the backend so frontend can use a simple URL.

    This endpoint requires the backend to have Appwrite API key configured.
    """
    from backend.app.core.config import APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY
    if not (APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID and APPWRITE_API_KEY):
        raise HTTPException(status_code=404, detail="Appwrite not configured")

    url = f"{APPWRITE_ENDPOINT.rstrip('/')}/storage/buckets/{bucket_id}/files/{file_id}/view"
    headers = {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY,
    }
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="Failed to fetch image from Appwrite")
    from fastapi.responses import Response
    content_type = resp.headers.get('Content-Type', 'image/jpeg')
    return Response(content=resp.content, media_type=content_type)


@router.get("")
def list_products(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    condition: Optional[str] = Query(None),
    availability: Optional[str] = Query(None),
    sort: Optional[str] = Query("newest"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    # Build filter and execute via Supabase client. Wrap in try/except
    try:
        query = supabase.table("store_products").select("*")

        if search:
            ilike_q = f"%{search}%"
            # Use PostgREST-style or filter if available; attempt or_ first but catch if not supported
            try:
                query = query.or_(f"name.ilike.{ilike_q},description.ilike.{ilike_q},category.ilike.{ilike_q},city.ilike.{ilike_q}")
            except Exception:
                # Fallback: no or_ support — attempt simple ilike on name
                query = query.ilike("name", ilike_q)

        if category:
            query = query.eq("category", category)

        if city:
            query = query.eq("city", city)

        if condition:
            query = query.eq("condition", condition)

        if availability:
            if availability.lower() == "available":
                query = query.eq("status", "available")
            elif availability.lower() == "sold":
                query = query.eq("status", "sold")

        if min_price is not None:
            query = query.gte("price", min_price)
        if max_price is not None:
            query = query.lte("price", max_price)

        if sort == "price_asc":
            query = query.order("price", desc=False)
        elif sort == "price_desc":
            query = query.order("price", desc=True)
        else:
            query = query.order("created_at", desc=True)

        result = query.range(offset, offset + limit - 1).execute()
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    if getattr(result, "error", None):
        # Surface suppabase client error details
        raise HTTPException(status_code=500, detail=str(result.error))

    rows = result.data or []
    return [ _normalize_product_row(r) for r in rows ]


@router.post("", status_code=201)
def create_product(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    category: str = Form(...),
    price: float = Form(...),
    city: str = Form(...),
    state: Optional[str] = Form(None),
    condition: Optional[str] = Form(None),
    contact_number: Optional[str] = Form(None),
    main_image: UploadFile = File(...),
    additional_images: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(get_current_user),
):
    # Only contributors, palkhi pramukhs, and admins may list products
    is_contributor_user = (
        getattr(current_user, "is_contributor", False) or 
        getattr(current_user, "role", "") in ("contributor", "palkhi_pramukh", "admin")
    )
    if not is_contributor_user:
        raise HTTPException(status_code=403, detail="Only approved contributors may list items for sale")

    # Upload main image (prefer Appwrite when configured)
    try:
        content = main_image.file.read()
        if APPWRITE_BUCKET_ID:
            file_id = upload_file_to_appwrite(APPWRITE_BUCKET_ID, content, main_image.filename, main_image.content_type)
            # store as appwrite:<bucket>:<fileId>
            main_image_url = f"appwrite:{APPWRITE_BUCKET_ID}:{file_id}"
        else:
            bucket = supabase.storage.from_('store-images')
            path = f"{current_user.id}/{name.replace(' ', '_')}/{main_image.filename}"
            upload_res = bucket.upload(path, content, {'content-type': main_image.content_type})
            if upload_res.get('error'):
                raise Exception(upload_res.get('error'))
            main_image_url = bucket.get_public_url(path).get('publicURL') or upload_res.get('data', {}).get('Key')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload main image: {e}")

    additional_urls = []
    if additional_images:
        for img in additional_images:
            try:
                content = img.file.read()
                if APPWRITE_BUCKET_ID:
                    file_id = upload_file_to_appwrite(APPWRITE_BUCKET_ID, content, img.filename, img.content_type)
                    url = f"appwrite:{APPWRITE_BUCKET_ID}:{file_id}"
                else:
                    path = f"{current_user.id}/{name.replace(' ', '_')}/{img.filename}"
                    upload_res = bucket.upload(path, content, {'content-type': img.content_type})
                    if upload_res.get('error'):
                        continue
                    url = bucket.get_public_url(path).get('publicURL') or upload_res.get('data', {}).get('Key')
                additional_urls.append(url)
            except Exception:
                continue

    record = {
        "seller_id": str(current_user.id),
        "name": name,
        "description": description,
        "category": category,
        "price": price,
        "city": city,
        "state": state,
        "condition": condition,
        "status": "available",
        "contact_number": contact_number or current_user.palkhi_affiliation or None,
        "main_image": main_image_url,
        "additional_images": additional_urls,
    }

    res = supabase.table("store_products").insert(record).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=str(res.error))

    created = res.data[0]
    return _normalize_product_row(created)


@router.put("/{product_id}")
def update_product(
    product_id: UUID,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    condition: Optional[str] = Form(None),
    contact_number: Optional[str] = Form(None),
    main_image: Optional[UploadFile] = File(None),
    additional_images: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(get_current_user),
):
    # Fetch product
    q = supabase.table("store_products").select("*").eq("id", str(product_id)).execute()
    if getattr(q, "error", None):
        raise HTTPException(status_code=500, detail=str(q.error))
    rows = q.data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Product not found")
    product = rows[0]

    if str(product.get("seller_id")) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to edit this product")

    updates = {}
    for k, v in (("name", name), ("description", description), ("category", category), ("price", price), ("city", city), ("state", state), ("condition", condition), ("contact_number", contact_number)):
        if v is not None:
            updates[k] = v

    # Uploads for update: respect Appwrite if configured, fallback to Supabase
    bucket = supabase.storage.from_('store-images')
    product_name = product.get("name") or name or "item"
    if main_image:
        try:
            content = main_image.file.read()
            if APPWRITE_BUCKET_ID:
                file_id = upload_file_to_appwrite(APPWRITE_BUCKET_ID, content, main_image.filename, main_image.content_type)
                main_image_url = f"appwrite:{APPWRITE_BUCKET_ID}:{file_id}"
            else:
                path = f"{current_user.id}/{product_name.replace(' ', '_')}/{main_image.filename}"
                upload_res = bucket.upload(path, content, {'content-type': main_image.content_type})
                if upload_res.get('error'):
                    raise Exception(upload_res.get('error'))
                main_image_url = bucket.get_public_url(path).get('publicURL') or upload_res.get('data', {}).get('Key')
            updates["main_image"] = main_image_url
        except Exception:
            pass

    if additional_images:
        additional_urls = product.get("additional_images") or []
        for img in additional_images:
            try:
                content = img.file.read()
                if APPWRITE_BUCKET_ID:
                    file_id = upload_file_to_appwrite(APPWRITE_BUCKET_ID, content, img.filename, img.content_type)
                    url = f"appwrite:{APPWRITE_BUCKET_ID}:{file_id}"
                else:
                    path = f"{current_user.id}/{product_name.replace(' ', '_')}/{img.filename}"
                    upload_res = bucket.upload(path, content, {'content-type': img.content_type})
                    if upload_res.get('error'):
                        continue
                    url = bucket.get_public_url(path).get('publicURL') or upload_res.get('data', {}).get('Key')
                additional_urls.append(url)
            except Exception:
                continue
        updates["additional_images"] = additional_urls

    if not updates:
        return _normalize_product_row(product)

    res = supabase.table("store_products").update(updates).eq("id", str(product_id)).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=str(res.error))
    return _normalize_product_row(res.data[0])


@router.delete("/{product_id}")
def delete_product(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
):
    q = supabase.table("store_products").select("seller_id").eq("id", str(product_id)).execute()
    if getattr(q, "error", None):
        raise HTTPException(status_code=500, detail=str(q.error))
    rows = q.data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Product not found")
    if str(rows[0].get("seller_id")) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")

    res = supabase.table("store_products").delete().eq("id", str(product_id)).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=str(res.error))
    return {"message": "Product deleted"}


@router.post("/{product_id}/mark_sold")
def mark_sold(product_id: UUID, current_user: User = Depends(get_current_user)):
    q = supabase.table("store_products").select("seller_id,status").eq("id", str(product_id)).execute()
    if getattr(q, "error", None):
        raise HTTPException(status_code=500, detail=str(q.error))
    rows = q.data or []
    if not rows:
        raise HTTPException(status_code=404, detail="Product not found")
    product = rows[0]
    if str(product.get("seller_id")) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to modify this product")

    new_status = "sold" if product.get("status") != "sold" else "available"
    res = supabase.table("store_products").update({"status": new_status}).eq("id", str(product_id)).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=str(res.error))
    return _normalize_product_row(res.data[0])


@router.post("/{product_id}/report", status_code=201)
def report_product(product_id: UUID, reason: str = Form(...), details: Optional[str] = Form(None), current_user: Optional[User] = Depends(get_current_user)):
    # allow anonymous reports too but attach reporter when authenticated
    reporter_id = None
    if current_user:
        reporter_id = str(current_user.id)

    record = {
        "product_id": str(product_id),
        "reporter_id": reporter_id,
        "reason": reason,
        "details": details,
    }
    res = supabase.table("store_reports").insert(record).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=str(res.error))
    return {"message": "Report submitted"}