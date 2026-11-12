# Gorongosa FireLink

Aplicação web que organiza detecções históricas de focos de calor **MODIS** e **VIIRS** (NASA FIRMS) num mapa, calendário e ficha de verificação de campo, para apoiar o planeamento de visitas na Gorongosa.

> **Nota**: uma detecção FIRMS é um foco de calor/anomalia térmica. **Não confirma incêndio**, não mede área ardida e a ausência de detecção não prova ausência de fogo. A aplicação organiza informação para apoiar decisões humanas — não decide sozinha onde a equipa deve ir.

---

## Estado atual (o que está feito)

### Backend (FastAPI + SQLite)

| Endpoint | Método | Estado | Descrição |
|---|---|---|---|
| `/health` | GET | ✅ | Verificação de saúde |
| `/api/v1/detections` | GET | ✅ | Detecções MODIS + VIIRS, filtros `days` (1–5) e `source` (`modis`/`viirs`/`both`) |
| `/api/v1/sectors` | GET | ✅ | 9 sectores (grelha 3×3 provisória) |
| `/api/v1/calendar` | GET | ✅ | Série completa de dias (com zeros), totais por sensor, tendência vs período anterior, distribuição por dia da semana |
| `/api/v1/highlights` | GET | ✅ | Sectores com repetição de detecção (compatibilidade) |
| `/api/v1/alerts` | GET | ✅ | Sectores ordenados por frequência, com nível (`alto`/`medio`/`baixo`) e regra explícita |
| `/api/v1/visits` | POST / GET | ✅ | Criar e listar visitas de campo |
| `/api/v1/observations` | POST | ✅ | Registar observação (presença / ausência / inconclusivo / simulada) |
| `/api/v1/observations/{visit_id}` | GET | ✅ | Listar observações de uma visita |
| `/api/v1/export/detections.csv` | GET | ✅ | Exportar detecções em CSV |
| `/api/v1/export/summary.csv` | GET | ✅ | Exportar resumo de visitas + observações |

**O que o backend faz por baixo:**
- Proxy à API FIRMS (a `MAP_KEY` nunca chega ao browser).
- Normaliza campos diferentes de MODIS (`brightness`, `confidence` numérica) e VIIRS (`bright_ti4`, `confidence` categórica `l`/`n`/`h`).
- Atribui sector a cada detecção (grelha 3×3 provisória).
- Guarda visitas e observações em SQLite (`firelink.db`, criado automaticamente).
- Marca automaticamente uma visita como `realizada` quando recebe a primeira observação.

### Frontend (React + Vite + Leaflet)

| Página | Estado | O que tem |
|---|---|---|
| Login | ✅ | Simulado no browser (`localStorage`). Sem tabela `user` no backend. Credenciais em `src/auth.js`. |
| Painel | ✅ | Contadores reais: detecções, sectores a verificar, visitas, fonte |
| Mapa | ✅ | Satélite Esri, MODIS/VIIRS em camadas separadas, filtros por sensor/confiança/sector, ordenação, tabela de detecções, cartões de alerta por frequência |
| Calendário | ✅ | Grid completo do período, cores por intensidade, indicador MODIS/VIIRS por dia, tooltip com FRP médio, tendência, distribuição por dia da semana |
| Sectores | ✅ | Tabela agregada com destaque de sectores a verificar |
| Visitas | ✅ | Criar visita, listar, expandir para ver observações, criar observação (com flag de simulada) |
| Exportar | ✅ | Dois CSVs (detecções e resumo de visitas) |

**Funcionalidades transversais:**
- Limitações dos dados visíveis em cada página relevante.
- Observações simuladas claramente marcadas (`simulated: true`).
- Design responsivo (sidebar colapsa em mobile).

### Dados

- Fonte: **NASA FIRMS** (`firms.modaps.eosdis.nasa.gov`), produto `MODIS_NRT` e `VIIRS_SNPP_NRT`.
- Área: Gorongosa (bbox aproximado `34.0,-19.2,34.9,-18.6`).
- MAP_KEY gratuita, obtida com email em https://firms.modaps.eosdis.nasa.gov/api/map_key/.
- Detecções reais validadas (comparadas com o CSV devolvido diretamente pela NASA).

---

## O que falta

### Antes da submissão (prioritário)

- [ ] **Confirmar a área piloto e os limites dos sectores com a Gorongosa.** A grelha 3×3 (`SA1`…`SC3`) é **provisória** — o documento do desafio exige limites oficiais ou validados.
- [ ] **Rever a terminologia com um técnico.** A aplicação usa "detecção", "local a verificar" e "observação de campo"; não usa "incêndio confirmado", "previsão" nem atribuição de responsabilidade. Validar que faz sentido no contexto do Parque.
- [ ] **Testar com um utilizador real** (técnico ou equipa de campo) e recolher feedback sobre os filtros, o calendário e a ficha de visita.
- [ ] **Privacidade e segurança**: coordenadas sensíveis, rotas e dados de pessoas não devem ser expostos publicamente. Rever o que vai no CSV de exportação.
- [ ] **Deploy**: escolher um sítio para a demo (local, Render, Railway, Vercel+Fly, etc.). Documentar os passos.
- [ ] **Pitch**: preparar a narrativa de 3 minutos com a mensagem comum da equipa.

### Melhorias técnicas (pós-MVP, se houver tempo)

- [ ] **Autenticação real** (se o Parque quiser). Atualmente o login é simulado — não é uma falha, é uma decisão de âmbito.
- [ ] **Substituir a grelha 3×3 por GeoJSON oficial** dos sectores. Só é preciso trocar `backend/app/services/sectors.py` — o frontend adapta-se automaticamente via `/sectors`.
- [ ] **Edição e cancelamento de visitas** (atualmente só se criam e listam).
- [ ] **Upload de fotos** nas observações.
- [ ] **Mapa de calor** (heatmap) para visualizar densidade de detecções.
- [ ] **Cache** das chamadas à FIRMS (evita esgotar a quota de 5000 transações/10 min em demos repetidas).
- [ ] **Validação do campo `result`** com `Literal["presenca","ausencia","inconclusivo"]` no `schemas.py` (atualmente aceita qualquer string).
- [ ] **Testes automatizados** para os endpoints principais.

### Fora do âmbito (deliberadamente)

- Previsão de incêndios.
- Alertas de emergência em tempo real.
- Medição automática de área ardida.
- Modelação de propagação.
- Atribuição de causa ou responsabilidade.

---

## Como correr localmente

### Pré-requisitos

- Python 3.10+
- Node.js 18+ e npm 9+
- MAP_KEY da NASA FIRMS

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1        # Windows
# source .venv/bin/activate         # Linux/macOS

python -m pip install -r requirements.txt
