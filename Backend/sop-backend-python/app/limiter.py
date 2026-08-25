from slowapi import Limiter
from slowapi.util import get_remote_address

def get_user_or_ip_key(request) -> str:
    auth = request.headers.get("authorization")
    if auth and auth.startswith("Bearer "):
        return auth
    return get_remote_address(request)

limiter = Limiter(key_func=get_user_or_ip_key)
