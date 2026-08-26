# ==============================================================================
# KINETIQ STUDIO AUDIOVISUAL MANAGEMENT SYSTEM - BACKEND MASTER (MAIN.PY)
# ==============================================================================
from fastapi import FastAPI, HTTPException, Header, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import urllib.request
import json
import logging
import datetime
import uuid

# Configuração de Logs Avançada do Sistema
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("KinetiqMasterBackend")

app = FastAPI(
    title="Kinetiq Enterprise AV Master API",
    description="Sistema completo de gestão, controle de frotas audiovisuais, escalas e inteligência gerencial unificada.",
    version="4.5.0-Production"
)

@app.get("/")
def home():
    return {"message": "Bem-vindo à API do Kinetiq Studio!"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# REPOSITÓRIO DE DADOS GLOBAL ESTABILIZADO (CORE DATABASE EM MEMÓRIA)
# ==============================================================================
SYSTEM_DATABASE: Dict[str, List[Dict[str, Any]]] = {
    "users": [
        {
            "id": 1,
            "nome": "Luiz Fellipe (Master Admin)",
            "email": "admin@kinetiq.org",
            "senha": "123",
            "funcao": "Administrador",
            "foto": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "criado_em": "2026-01-01"
        },
        {
            "id": 2,
            "nome": "Ana Souza",
            "email": "ana@kinetiq.org",
            "senha": "123",
            "funcao": "Operador de Câmera",
            "foto": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            "criado_em": "2026-02-10"
        },
        {
            "id": 3,
            "nome": "Matheus Lima",
            "email": "matheus@kinetiq.org",
            "senha": "123",
            "funcao": "Cinegrafista / Diretor de Fotografia",
            "foto": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "criado_em": "2026-03-05"
        }
    ],
    "equipamentos": [
        {"id": 1, "nome": "SONY FX30 Cinema Line", "categoria": "Câmera", "numero_serie": "FX30-9981-BR", "disponivel": True, "manutencao": False, "notas": "Excelente estado"},
        {"id": 2, "nome": "Sony A7IV Mirrorless", "categoria": "Câmera", "numero_serie": "A7IV-1102-BR", "disponivel": False, "manutencao": False, "notas": "Uso frequente em cultos"},
        {"id": 3, "nome": "Lente Sony 24-70mm f/2.8 GM II", "categoria": "Lente", "numero_serie": "L-2470-GM2", "disponivel": True, "manutencao": False, "notas": "Filtro UV instalado"},
        {"id": 4, "nome": "Lente Sony 70-200mm f/2.8 GM", "categoria": "Lente", "numero_serie": "L-70200-GM", "disponivel": True, "manutencao": False, "notas": "Ideal para longas distâncias"},
        {"id": 5, "nome": "Microfone Sennheiser EW 100 G4", "categoria": "Áudio", "numero_serie": "SENS-EW100-01", "disponivel": True, "manutencao": False, "notas": "Kit sem fio duplo"},
        {"id": 6, "nome": "Iluminador LED Aputure 300d II", "categoria": "Iluminação", "numero_serie": "APT-300D-09", "disponivel": True, "manutencao": False, "notas": "Acompanha softbox"}
    ],
    "agenda": [
        {"id": 1, "titulo": "Gravação Comercial Corporativo Vibe", "data": "2026-07-20", "local": "Estúdio Principal Kinetiq", "status": "Confirmado"},
        {"id": 2, "titulo": "Transmissão Ao Vivo Culto de Domingo", "data": "2026-07-19", "local": "Get Church Centro", "status": "Confirmado"},
        {"id": 3, "titulo": "Cobertura Festival de Música OpenAir", "data": "2026-07-25", "local": "Parque Central", "status": "Planejamento"}
    ],
    "escalas": [
        {"id": 1, "titulo": "Gravação Comercial Corporativo Vibe", "operador": "Ana Souza", "data": "2026-07-20", "turno": "Manhã", "funcao_escala": "Operadora de Câmera A"},
        {"id": 2, "titulo": "Transmissão Ao Vivo Culto de Domingo", "operador": "Matheus Lima", "data": "2026-07-19", "turno": "Noite", "funcao_escala": "Diretor de Transmissão"}
    ],
    "operadores": [
        {"id": 1, "nome": "Ana Souza", "funcao": "Operador de Câmera", "email": "ana@kinetiq.org", "telefone": "(48) 98888-1111", "status": "Ativo"},
        {"id": 2, "nome": "Matheus Lima", "funcao": "Cinegrafista", "email": "matheus@kinetiq.org", "telefone": "(48) 97777-2222", "status": "Ativo"}
    ],
    "clientes": [
        {"id": 1, "nome": "Get Church", "email": "contato@getchurch.org", "empresa": "Get Church", "telefone": "(48) 3333-4444"},
        {"id": 2, "nome": "Agência Vibe Mídia", "email": "vibe@agencia.com", "empresa": "Vibe Mídia", "telefone": "(48) 9999-8888"}
    ],
    "reservas": [
        {"id": 1, "cliente": "Get Church", "equipamento": "Sony A7IV Mirrorless", "data": "2026-07-19", "retirada": "2026-07-19 08:00", "devolucao": "2026-07-19 22:00"}
    ],
    "logs_sistema": [
        {"id": 1, "acao": "Sistema inicializado com sucesso", "usuario": "admin@kinetiq.org", "timestamp": "2026-07-15 00:00:00"}
    ]
}

# ==============================================================================
# MODELOS PYDANTIC DE VALIDAÇÃO RIGOROSA
# ==============================================================================
class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

class AdminRegisterRequest(BaseModel):
    nome: str
    empresa_equipe: str
    telefone: str
    email: EmailStr
    senha: str

class OperatorRegisterRequest(BaseModel):
    nome: str
    email: EmailStr
    senha: str

class GoogleLoginRequest(BaseModel):
    credential: str

class ProfileUpdateRequest(BaseModel):
    nome: str
    foto: Optional[str] = None

class EquipmentRequest(BaseModel):
    nome: str
    categoria: str
    numero_serie: Optional[str] = None
    disponivel: bool = True
    manutencao: bool = False
    notas: Optional[str] = None

class AgendaRequest(BaseModel):
    titulo: str
    data: str
    local: str
    status: Optional[str] = "Confirmado"

class EscalaRequest(BaseModel):
    titulo: str
    operador: str
    data: str
    turno: str
    funcao_escala: Optional[str] = "Operador Geral"

class OperatorRequest(BaseModel):
    nome: str
    funcao: str
    email: EmailStr
    telefone: Optional[str] = None
    status: Optional[str] = "Ativo"

class ClientRequest(BaseModel):
    nome: str
    email: EmailStr
    empresa: Optional[str] = None
    telefone: Optional[str] = None

class ReservationRequest(BaseModel):
    cliente: str
    equipamento: str
    data: str
    retirada: Optional[str] = None
    devolucao: Optional[str] = None

# ==============================================================================
# DEPENDÊNCIAS DE SEGURANÇA E AUTENTICAÇÃO
# ==============================================================================
def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        logger.warning("Tentativa de acesso sem token Bearer válido.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token de autenticação ausente ou mal formatado."
        )
    
    token_email = authorization.split("Bearer ")[1].strip()
    user = next((u for u in SYSTEM_DATABASE["users"] if u["email"].lower() == token_email.lower()), None)
    
    if not user:
        logger.warning(f"Sessão expirada ou usuário não encontrado para o token: {token_email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Sessão inválida ou expirada. Faça login novamente."
        )
    return user

def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if current_user.get("funcao") != "Administrador":
        logger.warning(f"Acesso negado para usuário comum: {current_user.get('email')}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Acesso restrito a Administradores do Sistema."
        )
    return current_user

# ==============================================================================
# ROTAS DE AUTENTICAÇÃO E PERFIL
# ==============================================================================
@app.post("/auth/login", summary="Autenticação padrão por E-mail e Senha")
def login(req: LoginRequest):
    user = next((u for u in SYSTEM_DATABASE["users"] if u["email"].lower() == req.email.lower()), None)
    if not user or user["senha"] != req.senha:
        raise HTTPException(status_code=400, detail="E-mail ou senha incorretos.")
    
    logger.info(f"Login efetuado com sucesso por: {user['email']}")
    return {
        "token": user["email"],
        "usuario": {
            "nome": user["nome"],
            "email": user["email"],
            "funcao": user["funcao"],
            "foto": user["foto"]
        }
    }

@app.post("/auth/google", summary="Login Integrado via Google OAuth2")
def google_login(req: GoogleLoginRequest):
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={req.credential}"
        with urllib.request.urlopen(url) as response:
            google_data = json.loads(response.read().decode())
    except Exception as e:
        logger.error(f"Erro ao validar token Google: {e}")
        raise HTTPException(status_code=400, detail="Token do Google inválido ou expirado.")

    email = google_data.get("email")
    nome = google_data.get("name", "Operador Google")
    foto = google_data.get("picture", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150")

    if not email:
        raise HTTPException(status_code=400, detail="Não foi possível recuperar o e-mail da conta Google.")

    user = next((u for u in SYSTEM_DATABASE["users"] if u["email"].lower() == email.lower()), None)
    if not user:
        new_user = {
            "id": len(SYSTEM_DATABASE["users"]) + 1,
            "nome": nome,
            "email": email,
            "senha": "",
            "funcao": "Operador de Câmera",
            "foto": foto,
            "criado_em": str(datetime.date.today())
        }
        SYSTEM_DATABASE["users"].append(new_user)
        SYSTEM_DATABASE["operadores"].append({
            "id": len(SYSTEM_DATABASE["operadores"]) + 1,
            "nome": nome,
            "funcao": "Operador de Câmera",
            "email": email,
            "telefone": "Não cadastrado",
            "status": "Ativo"
        })
        user = new_user

    return {
        "token": user["email"],
        "usuario": {
            "nome": user["nome"],
            "email": user["email"],
            "funcao": user["funcao"],
            "foto": user["foto"]
        }
    }

@app.post("/auth/register/admin", summary="Cadastro de Nova Empresa / Administrador")
def register_admin(req: AdminRegisterRequest):
    if any(u["email"].lower() == req.email.lower() for u in SYSTEM_DATABASE["users"]):
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado no sistema.")
    
    new_user = {
        "id": len(SYSTEM_DATABASE["users"]) + 1,
        "nome": req.nome,
        "email": req.email,
        "senha": req.senha,
        "funcao": "Administrador",
        "foto": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        "criado_em": str(datetime.date.today())
    }
    SYSTEM_DATABASE["users"].append(new_user)
    logger.info(f"Novo Administrador registrado: {req.email} ({req.empresa_equipe})")
    return {
        "token": req.email,
        "usuario": {
            "nome": req.nome,
            "email": req.email,
            "funcao": "Administrador",
            "foto": new_user["foto"]
        }
    }

@app.post("/auth/register/operator", summary="Cadastro Rápido de Operador")
def register_operator(req: OperatorRegisterRequest):
    if any(u["email"].lower() == req.email.lower() for u in SYSTEM_DATABASE["users"]):
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")
    
    new_user = {
        "id": len(SYSTEM_DATABASE["users"]) + 1,
        "nome": req.nome,
        "email": req.email,
        "senha": req.senha,
        "funcao": "Operador de Câmera",
        "foto": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        "criado_em": str(datetime.date.today())
    }
    SYSTEM_DATABASE["users"].append(new_user)
    SYSTEM_DATABASE["operadores"].append({
        "id": len(SYSTEM_DATABASE["operadores"]) + 1,
        "nome": req.nome,
        "funcao": "Operador de Câmera",
        "email": req.email,
        "telefone": "Não cadastrado",
        "status": "Ativo"
    })
    return {
        "token": req.email,
        "usuario": {
            "nome": req.nome,
            "email": req.email,
            "funcao": "Operador de Câmera",
            "foto": new_user["foto"]
        }
    }

@app.put("/auth/profile", summary="Atualização de Perfil de Usuário")
def update_profile(req: ProfileUpdateRequest, current_user: Dict[str, Any] = Depends(get_current_user)):
    user_email = current_user["email"]
    for u in SYSTEM_DATABASE["users"]:
        if u["email"].lower() == user_email.lower():
            u["nome"] = req.nome
            if req.foto:
                u["foto"] = req.foto
            
            for op in SYSTEM_DATABASE["operadores"]:
                if op["email"].lower() == user_email.lower():
                    op["nome"] = req.nome

            return {
                "status": "ok",
                "usuario": {
                    "nome": u["nome"],
                    "email": u["email"],
                    "funcao": u["funcao"],
                    "foto": u["foto"]
                }
            }
    raise HTTPException(status_code=404, detail="Usuário não localizado.")

# ==============================================================================
# MÓDULO DE EQUIPAMENTOS
# ==============================================================================
@app.get("/equipamentos")
def get_equipamentos(current_user: Dict[str, Any] = Depends(get_current_user)):
    return SYSTEM_DATABASE["equipamentos"]

@app.post("/equipamentos")
def add_equipamento(req: EquipmentRequest, current_user: Dict[str, Any] = Depends(require_admin)):
    new_item = {
        "id": len(SYSTEM_DATABASE["equipamentos"]) + 1,
        "nome": req.nome,
        "categoria": req.categoria,
        "numero_serie": req.numero_serie or f"SN-{uuid.uuid4().hex[:6].upper()}",
        "disponivel": req.disponivel,
        "manutencao": req.manutencao,
        "notas": req.notas or ""
    }
    SYSTEM_DATABASE["equipamentos"].append(new_item)
    return new_item

@app.delete("/equipamentos/{item_id}")
def delete_equipamento(item_id: int, current_user: Dict[str, Any] = Depends(require_admin)):
    SYSTEM_DATABASE["equipamentos"] = [eq for eq in SYSTEM_DATABASE["equipamentos"] if eq["id"] != item_id]
    return {"status": "ok", "deleted_id": item_id}

# ==============================================================================
# MÓDULO DE AGENDA
# ==============================================================================
@app.get("/agenda")
def get_agenda(current_user: Dict[str, Any] = Depends(get_current_user)):
    return SYSTEM_DATABASE["agenda"]

@app.post("/agenda")
def add_agenda(req: AgendaRequest, current_user: Dict[str, Any] = Depends(require_admin)):
    new_event = {
        "id": len(SYSTEM_DATABASE["agenda"]) + 1,
        "titulo": req.titulo,
        "data": req.data,
        "local": req.local,
        "status": req.status
    }
    SYSTEM_DATABASE["agenda"].append(new_event)
    return new_event

@app.delete("/agenda/{event_id}")
def delete_agenda(event_id: int, current_user: Dict[str, Any] = Depends(require_admin)):
    SYSTEM_DATABASE["agenda"] = [ev for ev in SYSTEM_DATABASE["agenda"] if ev["id"] != event_id]
    return {"status": "ok", "deleted_id": event_id}

# ==============================================================================
# MÓDULO DE ESCALAS
# ==============================================================================
@app.get("/escalas")
def get_escalas(current_user: Dict[str, Any] = Depends(get_current_user)):
    if current_user["funcao"] == "Administrador":
        return SYSTEM_DATABASE["escalas"]
    user_name = current_user["nome"]
    return [esc for esc in SYSTEM_DATABASE["escalas"] if esc["operador"].lower() == user_name.lower()]

@app.post("/escalas")
def add_escala(req: EscalaRequest, current_user: Dict[str, Any] = Depends(require_admin)):
    new_scale = {
        "id": len(SYSTEM_DATABASE["escalas"]) + 1,
        "titulo": req.titulo,
        "operador": req.operador,
        "data": req.data,
        "turno": req.turno,
        "funcao_escala": req.funcao_escala
    }
    SYSTEM_DATABASE["escalas"].append(new_scale)
    return new_scale

@app.delete("/escalas/{scale_id}")
def delete_escala(scale_id: int, current_user: Dict[str, Any] = Depends(require_admin)):
    SYSTEM_DATABASE["escalas"] = [sc for sc in SYSTEM_DATABASE["escalas"] if sc["id"] != scale_id]
    return {"status": "ok", "deleted_id": scale_id}

# ==============================================================================
# MÓDULO DE OPERADORES
# ==============================================================================
@app.get("/operadores")
def get_operadores(current_user: Dict[str, Any] = Depends(require_admin)):
    return SYSTEM_DATABASE["operadores"]

@app.post("/operadores")
def add_operador(req: OperatorRequest, current_user: Dict[str, Any] = Depends(require_admin)):
    new_op = {
        "id": len(SYSTEM_DATABASE["operadores"]) + 1,
        "nome": req.nome,
        "funcao": req.funcao,
        "email": req.email,
        "telefone": req.telefone or "N/A",
        "status": req.status
    }
    SYSTEM_DATABASE["operadores"].append(new_op)
    return new_op

@app.delete("/operadores/{op_id}")
def delete_operador(op_id: int, current_user: Dict[str, Any] = Depends(require_admin)):
    SYSTEM_DATABASE["operadores"] = [op for op in SYSTEM_DATABASE["operadores"] if op["id"] != op_id]
    return {"status": "ok", "deleted_id": op_id}

# ==============================================================================
# MÓDULO DE CLIENTES
# ==============================================================================
@app.get("/clientes")
def get_clientes(current_user: Dict[str, Any] = Depends(require_admin)):
    return SYSTEM_DATABASE["clientes"]

@app.post("/clientes")
def add_cliente(req: ClientRequest, current_user: Dict[str, Any] = Depends(require_admin)):
    new_cli = {
        "id": len(SYSTEM_DATABASE["clientes"]) + 1,
        "nome": req.nome,
        "email": req.email,
        "empresa": req.empresa or "Particular",
        "telefone": req.telefone or "N/A"
    }
    SYSTEM_DATABASE["clientes"].append(new_cli)
    return new_cli

@app.delete("/clientes/{cli_id}")
def delete_cliente(cli_id: int, current_user: Dict[str, Any] = Depends(require_admin)):
    SYSTEM_DATABASE["clientes"] = [c for c in SYSTEM_DATABASE["clientes"] if c["id"] != cli_id]
    return {"status": "ok", "deleted_id": cli_id}

# ==============================================================================
# MÓDULO DE RESERVAS
# ==============================================================================
@app.get("/reservas")
def get_reservas(current_user: Dict[str, Any] = Depends(require_admin)):
    return SYSTEM_DATABASE["reservas"]

@app.post("/reservas")
def add_reserva(req: ReservationRequest, current_user: Dict[str, Any] = Depends(require_admin)):
    new_res = {
        "id": len(SYSTEM_DATABASE["reservas"]) + 1,
        "cliente": req.cliente,
        "equipamento": req.equipamento,
        "data": req.data,
        "retirada": req.retirada or f"{req.data} 08:00",
        "devolucao": req.devolucao or f"{req.data} 22:00"
    }
    SYSTEM_DATABASE["reservas"].append(new_res)
    
    for eq in SYSTEM_DATABASE["equipamentos"]:
        if eq["nome"].lower() == req.equipamento.lower():
            eq["disponivel"] = False

    return new_res

@app.delete("/reservas/{res_id}")
def delete_reserva(res_id: int, current_user: Dict[str, Any] = Depends(require_admin)):
    res_to_del = next((r for r in SYSTEM_DATABASE["reservas"] if r["id"] == res_id), None)
    if res_to_del:
        for eq in SYSTEM_DATABASE["equipamentos"]:
            if eq["nome"].lower() == res_to_del["equipamento"].lower():
                eq["disponivel"] = True
                
    SYSTEM_DATABASE["reservas"] = [r for r in SYSTEM_DATABASE["reservas"] if r["id"] != res_id]
    return {"status": "ok", "deleted_id": res_id}

# ==============================================================================
# MÓDULO DE RELATÓRIOS E INTELIGÊNCIA GERENCIAL
# ==============================================================================
@app.get("/relatorios")
def get_relatorios(current_user: Dict[str, Any] = Depends(require_admin)):
    total_eq = len(SYSTEM_DATABASE["equipamentos"])
    disp_eq = len([x for x in SYSTEM_DATABASE["equipamentos"] if x["disponivel"]])
    indisp_eq = total_eq - disp_eq
    
    return {
        "total_equipamentos": total_eq,
        "equipamentos_disponiveis": disp_eq,
        "equipamentos_indisponiveis": indisp_eq,
        "total_escalas": len(SYSTEM_DATABASE["escalas"]),
        "total_clientes": len(SYSTEM_DATABASE["clientes"]),
        "total_reservas": len(SYSTEM_DATABASE["reservas"]),
        "ranking_equipamentos": [
            {"nome": "Sony A7IV Mirrorless", "usos": 24},
            {"nome": "SONY FX30 Cinema Line", "usos": 19},
            {"nome": "Lente Sony 24-70mm f/2.8 GM II", "usos": 16}
        ],
        "horas_operadas": [
            {"operador": "Ana Souza", "horas": 64},
            {"operador": "Matheus Lima", "horas": 52}
        ]
    }