from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt as pyjwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRE_MINUTES = int(os.environ.get('JWT_EXPIRE_MINUTES', 43200))
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

app = FastAPI(title="Atlantis Experience API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()


# ============ MODELS ============
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserPublic(BaseModel):
    id: str
    email: str
    name: str
    level: int
    xp: int
    title: str
    unlocked_sculptures: List[str]
    completed_missions: List[str]
    badges: List[str]
    created_at: str

class AuthResponse(BaseModel):
    token: str
    user: UserPublic

class Sculpture(BaseModel):
    id: str
    name: str
    artist: str
    year: int
    depth_m: int
    description: str
    fact: str
    zone: str
    image: str
    locked_by_default: bool = False

class Mission(BaseModel):
    id: str
    icon: str
    title: str
    subtitle: str
    description: str
    xp_reward: int
    target: int
    type: str  # explore, quiz, ar, vr, master

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: str

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    session_id: str

class UnlockRequest(BaseModel):
    sculpture_id: str

class MissionProgressRequest(BaseModel):
    mission_id: str
    increment: int = 1

class QuizSubmitRequest(BaseModel):
    score: int  # 0..total
    total: int


# ============ AUTH HELPERS ============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = pyjwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def to_public(user: dict) -> UserPublic:
    return UserPublic(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        level=user.get("level", 1),
        xp=user.get("xp", 0),
        title=user.get("title", "Surface Diver"),
        unlocked_sculptures=user.get("unlocked_sculptures", []),
        completed_missions=user.get("completed_missions", []),
        badges=user.get("badges", []),
        created_at=user.get("created_at", ""),
    )

def calc_level(xp: int) -> tuple[int, str]:
    # Tiered levels with title
    tiers = [
        (0, 1, "Surface Diver"),
        (200, 2, "Tide Walker"),
        (500, 3, "Reef Scout"),
        (900, 4, "Coral Hunter"),
        (1400, 5, "Current Rider"),
        (2000, 6, "Abyss Seeker"),
        (2700, 7, "Ocean Explorer"),
        (3500, 8, "Deep Guardian"),
        (4500, 9, "Atlantis Knight"),
        (6000, 10, "Atlantis Master"),
    ]
    level, title = 1, "Surface Diver"
    for threshold, lv, t in tiers:
        if xp >= threshold:
            level, title = lv, t
    return level, title


# ============ SEED DATA ============
SCULPTURES = [
    {"id": "rubicon", "name": "Crossing the Rubicon", "artist": "Jason deCaires Taylor", "year": 2017, "depth_m": 14, "description": "Un muro de 30 metros con una sola puerta que simboliza la frontera entre dos mundos.", "fact": "La puerta del muro representa el paso a un futuro sostenible.", "zone": "Zona Norte", "image": "https://images.pexels.com/photos/31973393/pexels-photo-31973393.jpeg?auto=compress&cs=tinysrgb&w=1200", "locked_by_default": False},
    {"id": "lampedusa", "name": "The Raft of Lampedusa", "artist": "Jason deCaires Taylor", "year": 2016, "depth_m": 12, "description": "Una balsa con figuras humanas que denuncia la crisis migratoria del Mediterráneo.", "fact": "Inspirada en la pintura 'La Balsa de la Medusa' de Géricault.", "zone": "Zona Norte", "image": "https://images.unsplash.com/photo-1704676836005-713d641c9983?w=1200&q=85", "locked_by_default": True},
    {"id": "human-gyre", "name": "The Human Gyre", "artist": "Jason deCaires Taylor", "year": 2017, "depth_m": 15, "description": "Un círculo de más de 200 figuras humanas formando un remolino, símbolo del ciclo de la vida.", "fact": "Es la instalación más grande del museo.", "zone": "Zona Central", "image": "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=1200&q=85", "locked_by_default": True},
    {"id": "deregulated", "name": "Deregulated", "artist": "Jason deCaires Taylor", "year": 2016, "depth_m": 13, "description": "Dos figuras en un columpio dorado que critican la desregulación corporativa.", "fact": "Ironiza sobre los excesos del capitalismo financiero.", "zone": "Zona Central", "image": "https://images.pexels.com/photos/3157890/pexels-photo-3157890.jpeg?auto=compress&cs=tinysrgb&w=1200", "locked_by_default": True},
    {"id": "photographers", "name": "The Photographers", "artist": "Jason deCaires Taylor", "year": 2016, "depth_m": 12, "description": "Figuras humanas tomando selfies, una crítica a la sociedad hiperconectada.", "fact": "Refleja la desconexión moderna con la naturaleza.", "zone": "Zona Central", "image": "https://images.pexels.com/photos/9961251/pexels-photo-9961251.jpeg?auto=compress&cs=tinysrgb&w=1200", "locked_by_default": True},
    {"id": "hybrid-garden", "name": "The Hybrid Garden", "artist": "Jason deCaires Taylor", "year": 2016, "depth_m": 12, "description": "Figuras híbridas mitad humanas mitad cactus locales, fusionando flora y humanidad.", "fact": "Usa el cactus Euphorbia, planta endémica de Lanzarote.", "zone": "Zona Sur", "image": "https://images.unsplash.com/photo-1518399681705-1c1a55e5e883?w=1200&q=85", "locked_by_default": True},
    {"id": "los-jolateros", "name": "Los Jolateros", "artist": "Jason deCaires Taylor", "year": 2016, "depth_m": 8, "description": "Niños en barcos de hojalata, en honor a una tradición canaria local.", "fact": "Rinde homenaje a la pesca artesanal de Lanzarote.", "zone": "Zona Sur", "image": "https://images.pexels.com/photos/3046582/pexels-photo-3046582.jpeg?auto=compress&cs=tinysrgb&w=1200", "locked_by_default": True},
    {"id": "immortal", "name": "Immortal", "artist": "Jason deCaires Taylor", "year": 2017, "depth_m": 14, "description": "Una figura yacente que se convierte en hábitat marino vivo.", "fact": "Demuestra cómo el arte se transforma en arrecife.", "zone": "Zona Norte", "image": "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&q=85", "locked_by_default": True},
    {"id": "disconnected", "name": "Disconnected", "artist": "Jason deCaires Taylor", "year": 2017, "depth_m": 13, "description": "Una pareja unida pero mirando móviles, retratando el aislamiento digital.", "fact": "Crítica social a la era hiperdigital.", "zone": "Zona Central", "image": "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=1200&q=85", "locked_by_default": True},
    {"id": "content", "name": "Content", "artist": "Jason deCaires Taylor", "year": 2017, "depth_m": 14, "description": "Una pareja tumbada absorta en sus pantallas, ignorando el océano.", "fact": "Invita a desconectar para reconectar con la naturaleza.", "zone": "Zona Sur", "image": "https://images.pexels.com/photos/1004665/pexels-photo-1004665.jpeg?auto=compress&cs=tinysrgb&w=1200", "locked_by_default": True},
    {"id": "self-portrait", "name": "Self Portrait", "artist": "Jason deCaires Taylor", "year": 2016, "depth_m": 12, "description": "Autoretrato del artista que se integra en el ecosistema marino.", "fact": "Es el primer autorretrato submarino del autor.", "zone": "Zona Norte", "image": "https://images.unsplash.com/photo-1564731071754-001b53a902fb?w=1200&q=85", "locked_by_default": True},
    {"id": "deserter", "name": "The Deserter", "artist": "Jason deCaires Taylor", "year": 2017, "depth_m": 14, "description": "Soldado abandonando sus armas, símbolo de la paz y el desarme.", "fact": "Mensaje de paz universal bajo el mar.", "zone": "Zona Sur", "image": "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=1200&q=85", "locked_by_default": True},
]

MISSIONS = [
    {"id": "ocean-explorer", "icon": "🌊", "title": "Ocean Explorer", "subtitle": "Visita 3 esculturas", "description": "Desbloquea 3 esculturas distintas en el museo submarino.", "xp_reward": 250, "target": 3, "type": "explore"},
    {"id": "marine-guardian", "icon": "🐠", "title": "Marine Guardian", "subtitle": "Completa el quiz de sostenibilidad", "description": "Demuestra tu compromiso marino acertando el quiz oceánico.", "xp_reward": 300, "target": 1, "type": "quiz"},
    {"id": "underwater-hunter", "icon": "📸", "title": "Underwater Hunter", "subtitle": "Escanea esculturas con AR", "description": "Usa la cámara AR para escanear 3 esculturas distintas.", "xp_reward": 400, "target": 3, "type": "ar"},
    {"id": "deep-diver", "icon": "🤿", "title": "Deep Diver", "subtitle": "Completa la experiencia VR", "description": "Sumérgete en el modo inmersivo para vivir el museo en 360°.", "xp_reward": 500, "target": 1, "type": "vr"},
    {"id": "atlantis-master", "icon": "👑", "title": "Atlantis Master", "subtitle": "Desbloquea todas las zonas", "description": "Conviértete en maestro absoluto del museo submarino.", "xp_reward": 1000, "target": 12, "type": "master"},
]

QUIZ_QUESTIONS = [
    {"q": "¿En qué año se inauguró el Museo Atlántico?", "options": ["2014", "2016", "2018", "2020"], "answer": 1},
    {"q": "¿Quién es el escultor del Museo Atlántico?", "options": ["Banksy", "Jason deCaires Taylor", "Ai Weiwei", "Anish Kapoor"], "answer": 1},
    {"q": "¿Las esculturas están hechas de un material que…?", "options": ["Contamina el océano", "Fomenta el crecimiento de arrecifes", "Es radiactivo", "Es metálico"], "answer": 1},
    {"q": "¿A qué profundidad media se encuentra el museo?", "options": ["3 m", "12-15 m", "40 m", "100 m"], "answer": 1},
    {"q": "¿Cuál es el propósito principal del museo?", "options": ["Lujo", "Concienciar y crear arrecifes", "Pesca", "Investigación militar"], "answer": 1},
]


# ============ ENDPOINTS ============
@api_router.get("/")
async def root():
    return {"app": "Atlantis Experience", "status": "online"}

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(req: UserRegister):
    existing = await db.users.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "id": user_id,
        "email": req.email.lower(),
        "name": req.name,
        "password_hash": hash_password(req.password),
        "level": 1,
        "xp": 0,
        "title": "Surface Diver",
        "unlocked_sculptures": ["rubicon"],
        "completed_missions": [],
        "badges": [],
        "mission_progress": {},
        "created_at": now,
    }
    await db.users.insert_one(user_doc)
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)
    return AuthResponse(token=create_token(user_id), user=to_public(user_doc))

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(req: UserLogin):
    user = await db.users.find_one({"email": req.email.lower()}, {"_id": 0})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return AuthResponse(token=create_token(user["id"]), user=to_public(user))

@api_router.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return to_public(user)


@api_router.get("/sculptures")
async def list_sculptures(user: dict = Depends(get_current_user)):
    unlocked = set(user.get("unlocked_sculptures", []))
    out = []
    for s in SCULPTURES:
        item = dict(s)
        item["unlocked"] = (s["id"] in unlocked) or (not s["locked_by_default"])
        out.append(item)
    return out

@api_router.get("/sculptures/{sculpture_id}")
async def get_sculpture(sculpture_id: str, user: dict = Depends(get_current_user)):
    s = next((x for x in SCULPTURES if x["id"] == sculpture_id), None)
    if not s:
        raise HTTPException(status_code=404, detail="Escultura no encontrada")
    item = dict(s)
    unlocked = set(user.get("unlocked_sculptures", []))
    item["unlocked"] = (sculpture_id in unlocked) or (not s["locked_by_default"])
    return item

@api_router.post("/sculptures/unlock", response_model=UserPublic)
async def unlock_sculpture(req: UnlockRequest, user: dict = Depends(get_current_user)):
    s = next((x for x in SCULPTURES if x["id"] == req.sculpture_id), None)
    if not s:
        raise HTTPException(status_code=404, detail="Escultura no encontrada")
    unlocked = set(user.get("unlocked_sculptures", []))
    if req.sculpture_id in unlocked:
        return to_public(user)
    unlocked.add(req.sculpture_id)
    xp = user.get("xp", 0) + 100
    # auto progress for "ocean-explorer" mission
    mp = user.get("mission_progress", {}) or {}
    mp["ocean-explorer"] = min(3, mp.get("ocean-explorer", 0) + 1)
    completed = list(user.get("completed_missions", []))
    badges = list(user.get("badges", []))
    if mp["ocean-explorer"] >= 3 and "ocean-explorer" not in completed:
        completed.append("ocean-explorer")
        badges.append("ocean-explorer")
        xp += 250
    # atlantis-master progress
    mp["atlantis-master"] = len(unlocked)
    if mp["atlantis-master"] >= 12 and "atlantis-master" not in completed:
        completed.append("atlantis-master")
        badges.append("atlantis-master")
        xp += 1000
    level, title = calc_level(xp)
    await db.users.update_one({"id": user["id"]}, {"$set": {
        "unlocked_sculptures": list(unlocked),
        "xp": xp, "level": level, "title": title,
        "mission_progress": mp,
        "completed_missions": completed,
        "badges": badges,
    }})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return to_public(updated)


@api_router.get("/missions")
async def list_missions(user: dict = Depends(get_current_user)):
    mp = user.get("mission_progress", {}) or {}
    completed = set(user.get("completed_missions", []))
    out = []
    for m in MISSIONS:
        progress = mp.get(m["id"], 0)
        if m["id"] == "atlantis-master":
            progress = len(user.get("unlocked_sculptures", []))
        out.append({
            **m,
            "progress": progress,
            "completed": m["id"] in completed,
        })
    return out

@api_router.post("/missions/ar-scan", response_model=UserPublic)
async def ar_scan(req: UnlockRequest, user: dict = Depends(get_current_user)):
    # also unlocks the sculpture and progresses ar mission
    mp = user.get("mission_progress", {}) or {}
    ar_scanned = set(mp.get("ar_sculptures", []) if isinstance(mp.get("ar_sculptures"), list) else [])
    ar_scanned.add(req.sculpture_id)
    mp["ar_sculptures"] = list(ar_scanned)
    mp["underwater-hunter"] = min(3, len(ar_scanned))
    unlocked = set(user.get("unlocked_sculptures", []))
    unlocked.add(req.sculpture_id)
    mp["ocean-explorer"] = min(3, mp.get("ocean-explorer", 0) + (0 if req.sculpture_id in user.get("unlocked_sculptures", []) else 1))
    mp["atlantis-master"] = len(unlocked)
    xp = user.get("xp", 0) + 150
    completed = list(user.get("completed_missions", []))
    badges = list(user.get("badges", []))
    if mp["underwater-hunter"] >= 3 and "underwater-hunter" not in completed:
        completed.append("underwater-hunter"); badges.append("underwater-hunter"); xp += 400
    if mp["ocean-explorer"] >= 3 and "ocean-explorer" not in completed:
        completed.append("ocean-explorer"); badges.append("ocean-explorer"); xp += 250
    if mp["atlantis-master"] >= 12 and "atlantis-master" not in completed:
        completed.append("atlantis-master"); badges.append("atlantis-master"); xp += 1000
    level, title = calc_level(xp)
    await db.users.update_one({"id": user["id"]}, {"$set": {
        "unlocked_sculptures": list(unlocked),
        "xp": xp, "level": level, "title": title,
        "mission_progress": mp,
        "completed_missions": completed,
        "badges": badges,
    }})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return to_public(updated)

@api_router.post("/missions/vr-complete", response_model=UserPublic)
async def vr_complete(user: dict = Depends(get_current_user)):
    completed = list(user.get("completed_missions", []))
    badges = list(user.get("badges", []))
    mp = user.get("mission_progress", {}) or {}
    xp = user.get("xp", 0)
    if "deep-diver" not in completed:
        completed.append("deep-diver"); badges.append("deep-diver")
        mp["deep-diver"] = 1
        xp += 500
    level, title = calc_level(xp)
    await db.users.update_one({"id": user["id"]}, {"$set": {
        "xp": xp, "level": level, "title": title,
        "mission_progress": mp,
        "completed_missions": completed,
        "badges": badges,
    }})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return to_public(updated)


@api_router.get("/quiz")
async def get_quiz(user: dict = Depends(get_current_user)):
    return [{"q": q["q"], "options": q["options"]} for q in QUIZ_QUESTIONS]

@api_router.post("/quiz/submit", response_model=UserPublic)
async def submit_quiz(req: QuizSubmitRequest, user: dict = Depends(get_current_user)):
    completed = list(user.get("completed_missions", []))
    badges = list(user.get("badges", []))
    mp = user.get("mission_progress", {}) or {}
    xp = user.get("xp", 0)
    # award 50 xp per correct
    xp += 50 * max(0, req.score)
    if req.score >= max(3, req.total - 1) and "marine-guardian" not in completed:
        completed.append("marine-guardian"); badges.append("marine-guardian")
        mp["marine-guardian"] = 1
        xp += 300
    level, title = calc_level(xp)
    await db.users.update_one({"id": user["id"]}, {"$set": {
        "xp": xp, "level": level, "title": title,
        "mission_progress": mp,
        "completed_missions": completed,
        "badges": badges,
    }})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return to_public(updated)


@api_router.post("/ai/chat", response_model=ChatResponse)
async def ai_chat(req: ChatRequest, user: dict = Depends(get_current_user)):
    session_id = f"atlantis_{user['id']}"
    system_msg = (
        "Eres ATLANTIS AI, un guía holográfico submarino del Museo Atlántico de Lanzarote, "
        "el primer museo submarino de Europa creado por el artista Jason deCaires Taylor en 2016. "
        "Hablas en español de forma elegante, futurista y cinematográfica, como una IA premium de ciencia ficción. "
        "Conoces todas las esculturas (Crossing the Rubicon, The Raft of Lampedusa, The Human Gyre, Deregulated, "
        "The Photographers, The Hybrid Garden, Los Jolateros, Immortal, Disconnected, Content, Self Portrait, The Deserter). "
        "Recomiendas rutas, explicas significado simbólico, fomentas la sostenibilidad marina, y respondes en menos de 90 palabras. "
        "Empieza ocasionalmente con frases evocadoras tipo 'Las corrientes susurran que...' o 'Los datos abisales indican...'. "
        f"El explorador se llama {user.get('name', 'explorador')} y está en nivel {user.get('level', 1)} ({user.get('title', 'Surface Diver')})."
    )
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_msg,
        ).with_model("gemini", "gemini-3.1-pro-preview")
        reply = await chat.send_message(UserMessage(text=req.message))
        # persist
        now = datetime.now(timezone.utc).isoformat()
        await db.chat_messages.insert_many([
            {"user_id": user["id"], "role": "user", "content": req.message, "timestamp": now},
            {"user_id": user["id"], "role": "assistant", "content": reply, "timestamp": now},
        ])
        return ChatResponse(reply=reply, session_id=session_id)
    except Exception as e:
        logging.exception("AI chat error")
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

@api_router.get("/ai/history")
async def chat_history(user: dict = Depends(get_current_user)):
    msgs = await db.chat_messages.find({"user_id": user["id"]}, {"_id": 0, "user_id": 0}).sort("timestamp", 1).to_list(200)
    return msgs


@api_router.get("/rewards")
async def list_rewards(user: dict = Depends(get_current_user)):
    user_badges = set(user.get("badges", []))
    rewards = [
        {"id": "ocean-explorer", "name": "Insignia Ocean Explorer", "type": "badge", "icon": "🌊", "description": "Visitaste 3 esculturas submarinas.", "unlocked": "ocean-explorer" in user_badges},
        {"id": "marine-guardian", "name": "Marine Guardian", "type": "badge", "icon": "🐠", "description": "Quiz de sostenibilidad superado.", "unlocked": "marine-guardian" in user_badges},
        {"id": "underwater-hunter", "name": "Underwater Hunter", "type": "badge", "icon": "📸", "description": "3 esculturas escaneadas con AR.", "unlocked": "underwater-hunter" in user_badges},
        {"id": "deep-diver", "name": "Deep Diver", "type": "badge", "icon": "🤿", "description": "Inmersión VR completada.", "unlocked": "deep-diver" in user_badges},
        {"id": "atlantis-master", "name": "Atlantis Master", "type": "badge", "icon": "👑", "description": "Todas las zonas desbloqueadas.", "unlocked": "atlantis-master" in user_badges},
        {"id": "discount-10", "name": "10% en entrada al museo", "type": "discount", "icon": "🎟️", "description": "Descuento exclusivo Atlantis Experience.", "unlocked": user.get("level", 1) >= 3},
        {"id": "vip-tour", "name": "Tour VIP guiado", "type": "experience", "icon": "👑", "description": "Acceso a tour privado nocturno.", "unlocked": user.get("level", 1) >= 7},
        {"id": "behind-scenes", "name": "Contenido exclusivo", "type": "content", "icon": "🎬", "description": "Documental detrás de las esculturas.", "unlocked": user.get("level", 1) >= 5},
    ]
    return rewards


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
