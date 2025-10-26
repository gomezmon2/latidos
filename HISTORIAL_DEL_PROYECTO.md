# Historial del Proyecto - Latidos

Este documento proporciona un historial completo del proyecto con todas las implementaciones y decisiones técnicas.

**Última actualización**: 26 Octubre 2025
**Versión**: 3.6.0

---

## 📋 Información General

### Nombre del Proyecto
**Latidos** (anteriormente "Momentos Auténticos")

### Descripción
Plataforma web para compartir historias y experiencias auténticas. Un espacio libre de likes y algoritmos donde los usuarios pueden compartir momentos reales y conectar de forma genuina.

### Tecnologías Principales
- **Frontend**: React 18.3.1 + TypeScript 5.8.3
- **Build Tool**: Vite 5.4.21
- **Routing**: React Router 6.30.1
- **Backend/Auth/DB**: Supabase
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: Context API
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Date Utilities**: date-fns

---

## 🗂️ Estructura del Proyecto

```
latidos/
├── src/
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components (40+)
│   │   ├── sections/                # Homepage sections
│   │   ├── ExperienceCard.tsx       # Card de historias ✅
│   │   ├── ImageWithFallback.tsx    # Componente de imagen con cache-busting ✨
│   │   ├── CommentItem.tsx          # Comentario individual recursivo ✨ NUEVO
│   │   ├── CommentThread.tsx        # Hilo completo de comentarios ✨ NUEVO
│   │   ├── ConnectionButton.tsx     # Botón de conexión inteligente ✨ NUEVO
│   │   ├── TagBadge.tsx             # Badge de etiqueta ✨
│   │   ├── TagSelector.tsx          # Selector multi-etiquetas ✨
│   │   ├── TagFilterBar.tsx         # Filtros por etiqueta ✨
│   │   ├── Hero.tsx
│   │   └── Navbar.tsx               # Navbar con menú + link Compartidos ✅
│   ├── contexts/
│   │   └── AuthContext.tsx          # Context de autenticación ✅
│   ├── hooks/
│   │   └── use-toast.ts
│   ├── integrations/
│   │   └── supabase/
│   │       └── client.ts            # Cliente Supabase ✅
│   ├── pages/
│   │   ├── Index.tsx                # Homepage ✅
│   │   ├── Explore.tsx              # Explorar historias ✅
│   │   ├── CreateExperience.tsx     # Crear historia ✅ ✨
│   │   ├── EditExperience.tsx       # Editar historia ✅ ✨
│   │   ├── ExperienceDetail.tsx     # Ver historia completa con comentarios anidados ✅ ✨
│   │   ├── Compartidos.tsx          # Gestionar conexiones ✨ NUEVO
│   │   ├── Login.tsx                # Login ✅
│   │   ├── Register.tsx             # Registro ✅
│   │   ├── Profile.tsx              # Perfil de usuario ✅
│   │   └── NotFound.tsx             # 404 ✅
│   ├── routes/
│   │   └── index.tsx                # Router + ROUTES constants ✅
│   ├── services/
│   │   ├── auth.service.ts          # Servicio de autenticación ✅
│   │   ├── experience.service.ts    # Servicio de experiencias ✅ ✨
│   │   ├── storage.service.ts       # Servicio de Storage (imágenes) ✅ ✨
│   │   ├── comment.service.ts       # Servicio de comentarios con tree ✨
│   │   ├── connection.service.ts    # Servicio de conexiones ✨
│   │   ├── favorite.service.ts      # Servicio de favoritos ✨
│   │   └── tag.service.ts           # Servicio de etiquetas ✨
│   ├── types/
│   │   ├── experience.ts            # Tipos de experiencias + privacidad ✅ ✨
│   │   ├── favorite.ts              # Tipos de favoritos ✨
│   │   ├── comment.ts               # Tipos de comentarios + recursivo ✨
│   │   └── connection.ts            # Tipos de conexiones ✨
│   └── main.tsx
├── .env                             # Variables de entorno ✅
├── ADD_NESTED_COMMENTS.sql          # Script SQL comentarios anidados ✨
├── ADD_SHARED_CONNECTIONS.sql       # Script SQL conexiones ✨
├── ADD_FAVORITES_SYSTEM.sql         # Script SQL favoritos ✨
├── ADD_PRIVACY_SYSTEM.sql           # Script SQL privacidad ✨ NUEVO
├── INSTRUCCIONES_FAVORITOS.md       # Guía de instalación favoritos ✨
├── INSTRUCCIONES_PRIVACIDAD.md      # Guía de instalación privacidad ✨ NUEVO
└── package.json
```

**✨ = Implementado recientemente**

---

## 🔐 Autenticación

### ✅ Implementado y Funcionando

- ✅ **Email/Password** - Registro y login
- ✅ **Google OAuth** - Funcionando
- ✅ **GitHub OAuth** - Funcionando
- ✅ **AuthService** completo
- ✅ **AuthContext** con estado global
- ✅ **Protección de rutas**

**Usuario de prueba**: gomezmon2@gmail.com

---

## 📊 Base de Datos Supabase

### ✅ Tablas Creadas y Funcionando

#### 1. **profiles** (Perfiles de Usuario)
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies**:
- ✅ Lectura pública
- ✅ Actualización solo del propio perfil
- ✅ Trigger automático al crear usuario

#### 2. **experiences** (Historias/Experiencias)
```sql
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies**:
- ✅ Lectura pública
- ✅ Creación solo autenticados
- ✅ Actualización/eliminación solo del propio contenido
- ✅ Trigger automático para `updated_at`

#### 3. **reactions** (Reacciones)
```sql
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(experience_id, user_id)
);
```

**RLS Policies**:
- ✅ Lectura pública
- ✅ Creación/eliminación solo autenticados
- ✅ 100% Funcional en UI

#### 4. **comments** (Comentarios Anidados) ✨ NUEVO
```sql
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- ✨ NUEVO
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Características**:
- ✅ Soporte para comentarios anidados hasta 5 niveles
- ✅ `parent_comment_id` permite respuestas a comentarios
- ✅ `CASCADE DELETE` elimina respuestas cuando se elimina padre
- ✅ Función recursiva `get_comment_replies()` en PostgreSQL

**RLS Policies**:
- ✅ Lectura pública
- ✅ Creación solo autenticados
- ✅ Actualización/eliminación solo del propio comentario
- ✅ 100% Funcional en UI con hilos de conversación

#### 5. **tags** (Etiquetas)
```sql
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Características**:
- ✅ Etiquetas predefinidas para categorizar historias
- ✅ Incluye emoji para mejor visualización
- ✅ Sistema de slugs para URLs amigables

#### 6. **experience_tags** (Relación Historias-Etiquetas)
```sql
CREATE TABLE public.experience_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(experience_id, tag_id)
);
```

**Características**:
- ✅ Relación muchos a muchos entre historias y etiquetas
- ✅ Máximo 5 etiquetas por historia (validado en UI)
- ✅ Mínimo 1 etiqueta requerida para historias públicas

#### 7. **shared_connections** (Conexiones entre Usuarios) ✨ NUEVO
```sql
CREATE TABLE public.shared_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, shared_user_id),
  CHECK (user_id != shared_user_id),
  CHECK (status IN ('pending', 'accepted', 'rejected'))
);
```

**Características**:
- ✅ Conexiones bidireccionales entre usuarios
- ✅ Estados: `pending`, `accepted`, `rejected`
- ✅ Validación: no puedes conectarte contigo mismo
- ✅ Constraint único: solo una conexión por par de usuarios
- ✅ 4 funciones helper de PostgreSQL

**Funciones PostgreSQL**:
1. `are_users_connected(user1_id, user2_id)` - Retorna boolean
2. `get_connection_status(user1_id, user2_id)` - Retorna status
3. `count_user_connections(target_user_id)` - Cuenta conexiones aceptadas
4. `count_pending_requests(target_user_id)` - Cuenta solicitudes pendientes

**RLS Policies**:
- ✅ Ver conexiones donde eres parte (enviadas o recibidas)
- ✅ Crear conexiones solo como remitente
- ✅ Actualizar solo conexiones recibidas (para aceptar/rechazar)
- ✅ Eliminar conexiones donde eres parte

**Vista: shared_connections_with_users**:
```sql
CREATE VIEW shared_connections_with_users AS
SELECT
  sc.*,
  p1.full_name AS sender_name,
  p1.avatar_url AS sender_avatar,
  p2.full_name AS receiver_name,
  p2.avatar_url AS receiver_avatar
FROM shared_connections sc
LEFT JOIN profiles p1 ON sc.user_id = p1.id
LEFT JOIN profiles p2 ON sc.shared_user_id = p2.id;
```

#### 8. **favorites** (Favoritos de Historias) ✨ NUEVO
```sql
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, experience_id)
);
```

**Características**:
- ✅ Relación muchos a muchos entre usuarios e historias
- ✅ Constraint único: un usuario solo puede marcar una historia como favorita una vez
- ✅ CASCADE DELETE: elimina favoritos si se elimina historia o usuario
- ✅ 3 índices para optimización de queries
- ✅ 3 funciones helper de PostgreSQL

**Funciones PostgreSQL**:
1. `count_experience_favorites(experience_id)` - Cuenta favoritos de una historia
2. `is_favorite(user_id, experience_id)` - Verifica si es favorito
3. `get_user_favorite_ids(user_id)` - Obtiene IDs de favoritos de un usuario

**RLS Policies**:
- ✅ Lectura pública (cualquiera puede ver qué historias son favoritas)
- ✅ Creación solo autenticados (solo como user_id propio)
- ✅ Eliminación solo propios favoritos

#### 9. **Vista: experiences_with_author** (Actualizada) ✨
```sql
CREATE OR REPLACE VIEW public.experiences_with_author AS
SELECT
  e.*,
  p.full_name AS author_name,
  p.avatar_url AS author_avatar,
  (SELECT COUNT(*) FROM public.reactions WHERE experience_id = e.id) AS reactions_count,
  (SELECT COUNT(*) FROM public.comments WHERE experience_id = e.id) AS comments_count,
  (SELECT COUNT(*) FROM public.favorites WHERE experience_id = e.id) AS favorites_count
FROM public.experiences e
LEFT JOIN public.profiles p ON e.user_id = p.id;
```

**Uso**: Optimiza las consultas al obtener experiencias con datos del autor y contadores
**Actualización**: Agregada columna `favorites_count` ✨

---

## 📦 Supabase Storage

### ✅ Bucket Configurado

**Bucket**: `experience-images`
- ✅ Público (para lectura)
- ✅ Políticas RLS configuradas
- ✅ Organizado por usuario: `{user-id}/{uuid}.{ext}`

**Políticas**:
- ✅ Lectura pública (SELECT)
- ✅ Subida autenticada (INSERT)
- ✅ Eliminación propia (DELETE)

**Validaciones**:
- Tipos permitidos: JPG, JPEG, PNG, WebP, GIF
- Tamaño máximo: 5MB
- Nombres únicos con UUID

---

## 🎨 Funcionalidades Implementadas

### ✅ Sistema de Comentarios Anidados ✨ NUEVO

#### Arquitectura
- **Estructura Recursiva**: Comentarios pueden tener respuestas hasta 5 niveles de profundidad
- **Algoritmo de Árbol**: Construcción eficiente de árbol de comentarios en cliente
- **Validación Multi-capa**: Prevención de comentarios más allá del límite

#### Componentes Creados

**CommentItem.tsx** (línea 230)
- Componente recursivo que se renderiza a sí mismo para respuestas
- Props principales:
  - `comment: CommentWithReplies` - Comentario con sus respuestas
  - `depth: number` - Nivel de profundidad actual (0-based)
  - `maxDepth: number` - Límite de profundidad (default: 5)
  - `onCommentUpdate` - Callback para refrescar árbol
- Funcionalidades:
  - ✅ Editar comentario propio
  - ✅ Eliminar comentario propio (con confirmación)
  - ✅ Responder a comentario
  - ✅ Colapsar/expandir respuestas
  - ✅ Validación de profundidad máxima
  - ✅ Advertencia visual en niveles 4-5
  - ✅ Indicador de nivel de anidación
  - ✅ Contador de respuestas

**CommentThread.tsx** (línea 140)
- Componente contenedor del hilo completo
- Funcionalidades:
  - ✅ Cargar árbol de comentarios
  - ✅ Crear nuevo comentario top-level
  - ✅ Refrescar árbol después de cada acción
  - ✅ Estados de carga y error
  - ✅ Empty state cuando no hay comentarios
  - ✅ Contador total de comentarios

#### Servicio: CommentService

**Métodos clave**:
```typescript
// Obtiene árbol completo de comentarios
static async getCommentsTree(experienceId: string): Promise<CommentWithReplies[]>

// Obtiene respuestas directas de un comentario
static async getReplies(commentId: string): Promise<CommentWithAuthor[]>

// Cuenta respuestas directas
static async getReplyCount(commentId: string): Promise<number>

// Crear comentario (top-level o respuesta)
static async createComment(dto: CreateCommentDTO): Promise<Comment>
// dto.parent_comment_id es opcional
```

**Algoritmo de Construcción del Árbol**:
1. Obtener todos los comentarios de la experiencia con `getCommentsByExperience()`
2. Separar en dos grupos:
   - Top-level comments (`parent_comment_id = null`)
   - Respuestas (todas las demás)
3. Crear Map de respuestas agrupadas por `parent_comment_id`
4. Función recursiva `buildTree()`:
   - Para cada comentario, obtiene sus respuestas del Map
   - Aplica `buildTree()` recursivamente a cada respuesta
   - Cuenta respuestas totales
5. Retornar solo los comentarios top-level con árbol completo

#### Tipos TypeScript

```typescript
export interface Comment {
  id: string;
  experience_id: string;
  user_id: string;
  parent_comment_id: string | null; // ✨ NUEVO - NULL para top-level
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithReplies extends CommentWithAuthor {
  replies: CommentWithReplies[]; // ✨ Estructura recursiva
  replies_count: number;
}
```

#### Validaciones de Profundidad

**3 Capas de Validación**:

1. **Visual (UI)**:
   ```typescript
   // Deshabilitar botón "Responder" en nivel 5
   {depth >= maxDepth && (
     <p className="text-sm text-muted-foreground">
       Nivel máximo alcanzado
     </p>
   )}
   ```

2. **Advertencia (UX)**:
   ```typescript
   // Toast warning en niveles 4-5
   const handleToggleReply = () => {
     if (depth >= maxDepth) {
       toast.warning(
         `Has alcanzado el límite de ${maxDepth} niveles...`,
         { duration: 4000 }
       );
       return;
     }
   };
   ```

3. **Validación de Envío (Logic)**:
   ```typescript
   // Doble check antes de submit
   const handleReply = async () => {
     if (depth >= maxDepth) {
       toast.error(`No se pueden crear respuestas más allá del nivel ${maxDepth}`);
       return;
     }
     // ... enviar comentario
   };
   ```

#### Banner de Advertencia

En niveles 4-5 se muestra un banner informativo:
```typescript
{depth >= maxDepth - 1 && (
  <div className="flex items-start gap-2 p-3 bg-amber-50 border-l-4 border-amber-400">
    <AlertCircle className="h-4 w-4 text-amber-600" />
    <p className="text-sm text-amber-800">
      Estás en el nivel {depth + 1} de anidación.
      {depth === maxDepth - 1
        ? " Este es el nivel máximo permitido."
        : " El próximo nivel será el máximo."}
    </p>
  </div>
)}
```

#### Integración en ExperienceDetail

**Antes** (componentes separados):
```typescript
<CommentForm experienceId={id} />
<CommentList experienceId={id} />
```

**Ahora** (componente unificado):
```typescript
<CommentThread experienceId={experience.id} />
```

#### Características de UX

- ✅ **Indicador visual de nivel**: Cada comentario muestra su profundidad
- ✅ **Colapsar/Expandir**: Botón para ocultar/mostrar respuestas
- ✅ **Contador de respuestas**: Muestra número de respuestas directas
- ✅ **Respuesta en contexto**: Formulario aparece debajo del comentario
- ✅ **Cancelar respuesta**: Botón para cerrar formulario sin enviar
- ✅ **Límite visual**: Deshabilitación clara cuando se alcanza el máximo
- ✅ **Edición inline**: Editar sin salir del hilo
- ✅ **Confirmación de eliminación**: Dialog antes de borrar
- ✅ **Loading states**: Indicadores de carga en acciones
- ✅ **Toast notifications**: Feedback inmediato de acciones

---

### ✅ Sistema de "Compartidos" (Conexiones) ✨ NUEVO

Sistema de conexiones bidireccionales entre usuarios que reemplaza el concepto tradicional de "amigos".

#### Arquitectura

**Concepto**: En lugar de "seguir" o "ser amigos", los usuarios se "comparten" experiencias entre sí mediante conexiones bidireccionales.

**Estados de Conexión**:
1. `pending` - Solicitud enviada, esperando respuesta
2. `accepted` - Conexión aceptada, ahora son "compartidos"
3. `rejected` - Solicitud rechazada

#### Componentes Creados

**ConnectionButton.tsx**
- Botón inteligente que cambia según el estado de la conexión
- Detecta si el usuario actual es remitente o receptor
- Estados visuales:
  - **Sin conexión**: "Agregar a Compartidos" (icono UserPlus)
  - **Pendiente (enviada)**: "Pendiente" (icono Clock) - click para cancelar
  - **Pendiente (recibida)**: Botones "✓ Aceptar" y "✗ Rechazar"
  - **Aceptada**: "Compartido" (icono UserCheck) - click para eliminar
  - **Rechazada**: "Enviar solicitud" (permite reintentar)

**Props**:
```typescript
interface ConnectionButtonProps {
  userId: string;        // ID del otro usuario
  userName?: string;     // Nombre para mensajes
}
```

**Estados internos**:
```typescript
const [status, setStatus] = useState<ConnectionStatus | null>(null);
const [connectionId, setConnectionId] = useState<string | null>(null);
const [isSender, setIsSender] = useState<boolean>(false); // ✨ Crucial
const [isLoading, setIsLoading] = useState(true);
const [isProcessing, setIsProcessing] = useState(false);
```

**Lógica de Renderizado Condicional**:
```typescript
// Sin conexión
if (!status) return <Button>Agregar a Compartidos</Button>;

// Pendiente
if (status === "pending") {
  if (isSender) {
    return <Button>Pendiente</Button>; // Cancelar
  } else {
    return (
      <div>
        <Button onClick={handleAcceptRequest}>✓</Button>
        <Button onClick={handleRejectRequest}>✗</Button>
      </div>
    );
  }
}

// Aceptada
if (status === "accepted") {
  return <Button>Compartido</Button>; // Eliminar
}
```

**CompartidosModal.tsx** (Modal de Gestión) ✨ ACTUALIZADO
- 3 pestañas (Tabs):
  1. **Compartidos** - Conexiones aceptadas
  2. **Recibidas** - Solicitudes pendientes recibidas
  3. **Enviadas** - Solicitudes pendientes enviadas
- Componente interno `ConnectionCard` para renderizar cada conexión
- Acciones contextuales según la pestaña
- Contadores en badges en cada tab
- Se abre desde Navbar (menú de usuario)
- Dialog responsive con max-height 80vh

**Estructura**:
```typescript
<Tabs defaultValue="connections">
  <TabsList>
    <TabsTrigger value="connections">
      Mis Compartidos ({connections.length})
    </TabsTrigger>
    <TabsTrigger value="pending">
      Recibidas ({pendingRequests.length})
    </TabsTrigger>
    <TabsTrigger value="sent">
      Enviadas ({sentRequests.length})
    </TabsTrigger>
  </TabsList>

  <TabsContent value="connections">
    {connections.map(request => (
      <ConnectionCard request={request} />
    ))}
  </TabsContent>

  {/* Similar para pending y sent */}
</Tabs>
```

**ConnectionCard**:
- Muestra avatar, nombre y fecha de creación
- Prop `showActions` determina si mostrar botones Aceptar/Rechazar
- Botones varían según estado y pestaña:
  - En "Recibidas": Aceptar + Rechazar
  - En "Enviadas": Cancelar
  - En "Mis Compartidos": Eliminar

#### Servicio: ConnectionService

**13 Métodos Implementados**:

```typescript
// 1. Enviar solicitud de conexión
static async sendConnectionRequest(dto: CreateConnectionDTO): Promise<SharedConnection>
// Validaciones: no conectarse consigo mismo, no duplicar solicitudes

// 2. Aceptar solicitud (solo receptor)
static async acceptConnectionRequest(connectionId: string): Promise<SharedConnection>
// Policy RLS: solo shared_user_id puede aceptar

// 3. Rechazar solicitud (solo receptor)
static async rejectConnectionRequest(connectionId: string): Promise<SharedConnection>
// Cambia status a "rejected"

// 4. Eliminar conexión (ambos pueden)
static async deleteConnection(connectionId: string): Promise<void>
// Validación: user_id OR shared_user_id

// 5. Obtener conexión entre dos usuarios
static async getConnectionBetweenUsers(userId1, userId2): Promise<SharedConnection | null>
// Busca en ambas direcciones con OR

// 6. Obtener mis conexiones (aceptadas)
static async getMyConnections(): Promise<ConnectionRequest[]>
// Filtra status='accepted', incluye perfiles

// 7. Obtener solicitudes recibidas
static async getPendingRequests(): Promise<ConnectionRequest[]>
// Filtra shared_user_id=current_user AND status='pending'

// 8. Obtener solicitudes enviadas
static async getSentRequests(): Promise<ConnectionRequest[]>
// Filtra user_id=current_user AND status='pending'

// 9. Verificar si están conectados
static async isConnectedWith(otherUserId: string): Promise<boolean>
// Usa función RPC are_users_connected()

// 10. Obtener estado de conexión
static async getConnectionStatus(otherUserId: string): Promise<ConnectionStatus | null>
// Usa función RPC get_connection_status()

// 11. Contar mis conexiones
static async countMyConnections(): Promise<number>
// Usa función RPC count_user_connections()

// 12. Contar solicitudes pendientes
static async countPendingRequests(): Promise<number>
// Usa función RPC count_pending_requests()
```

**Fix Importante - Query Optimization**:

**Problema Original**: Queries intentaban usar foreign key names que no existían:
```typescript
// ❌ ANTES (fallaba con error 400)
.select(`
  *,
  sender:profiles!shared_connections_user_id_fkey(id, full_name, avatar_url),
  receiver:profiles!shared_connections_shared_user_id_fkey(id, full_name, avatar_url)
`)
```

**Solución Implementada**: Queries separadas para perfiles:
```typescript
// ✅ AHORA (funciona correctamente)
const { data, error } = await supabase
  .from("shared_connections")
  .select("*")
  .eq("status", "accepted")
  .or(`user_id.eq.${user.id},shared_user_id.eq.${user.id}`);

// Luego obtener perfiles con Promise.all
const connectionsWithProfiles = await Promise.all(
  (data || []).map(async (conn) => {
    const otherUserId = isSender ? conn.shared_user_id : conn.user_id;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", otherUserId)
      .single();

    return {
      id: conn.id,
      other_user_id: otherUserId,
      other_user_name: profile?.full_name || null,
      other_user_avatar: profile?.avatar_url || null,
      status: conn.status,
      is_sender: isSender,
      created_at: conn.created_at,
    };
  })
);
```

**Nota**: Menos eficiente (más queries) pero más confiable sin configurar foreign keys específicos.

#### Tipos TypeScript

```typescript
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface SharedConnection {
  id: string;
  user_id: string;           // Remitente
  shared_user_id: string;    // Receptor
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

export interface ConnectionRequest {
  id: string;
  other_user_id: string;       // ID del otro usuario
  other_user_name: string | null;
  other_user_avatar: string | null;
  status: ConnectionStatus;
  is_sender: boolean;          // ✨ Crucial para UI
  created_at: string;
}

export interface CreateConnectionDTO {
  shared_user_id: string;
}

export interface UpdateConnectionDTO {
  status: ConnectionStatus;
}

export interface SharedConnectionWithUser extends SharedConnection {
  sender_name: string | null;
  sender_avatar: string | null;
  receiver_name: string | null;
  receiver_avatar: string | null;
}
```

#### Integración en la App

1. **Navbar**: Modal "Compartidos" se abre desde menú de usuario ✨ ACTUALIZADO
   - Botón con icono Users
   - useState para controlar apertura del modal
2. **ExperienceCard**: ❌ REMOVIDO `ConnectionButton` (simplificación UX) ✨
   - Ahora solo muestra botón de favoritos
3. **Routes**: ❌ Ruta `/compartidos` eliminada (ya no es página, es modal) ✨

#### Flujo de Usuario

**Escenario 1: Usuario gestiona sus compartidos** ✨ ACTUALIZADO
1. Usuario click en avatar (Navbar)
2. Click en "Compartidos"
3. Se abre modal con 3 tabs
4. **Tab "Compartidos"**: Ve conexiones aceptadas con botón Eliminar
5. **Tab "Recibidas"**: Ve solicitudes pendientes con botones Aceptar/Rechazar
6. **Tab "Enviadas"**: Ve solicitudes enviadas con botón Cancelar

**Escenario 2: Usuario B acepta solicitud de Usuario A**
1. Usuario B abre modal de Compartidos
2. En tab "Recibidas" ve solicitud de Usuario A
3. Click en botón "✓" (Aceptar)
4. Toast: "Solicitud aceptada"
5. Usuario A aparece ahora en tab "Compartidos"
6. Modal se refresca automáticamente

**Escenario 3: Usuario cancela solicitud enviada**
1. Usuario abre modal de Compartidos
2. En tab "Enviadas" ve sus solicitudes pendientes
3. Click en "Cancelar" en alguna solicitud
4. Toast: "Solicitud cancelada"
5. Solicitud desaparece de la lista

#### Características de UX

- ✅ **Detección automática de rol**: El botón sabe si eres remitente o receptor
- ✅ **Acciones contextuales**: Botones diferentes según tu rol y estado
- ✅ **Confirmación de eliminación**: Dialog antes de eliminar conexión aceptada
- ✅ **Contadores en tiempo real**: Badges actualizados después de cada acción
- ✅ **Toast notifications**: Feedback inmediato de todas las acciones
- ✅ **Loading states**: Spinners durante operaciones async
- ✅ **Empty states**: Mensajes informativos cuando no hay datos
- ✅ **Formato de fechas**: Uso de `date-fns` con locale español
- ✅ **Avatares con fallback**: Iniciales cuando no hay imagen

#### Problemas Resueltos

1. ✅ **Error 400 en queries**: Eliminados foreign key names inexistentes
2. ✅ **Botón no distinguía rol**: Agregado estado `isSender`
3. ✅ **Solicitudes no aparecían**: Fixed queries de perfil separadas
4. ✅ **Aceptar cancelaba**: Corregida lógica de botones en ConnectionButton

---

### ✅ Sistema de Favoritos ✨ NUEVO (23 Oct 2025 - v2)

Sistema completo para marcar historias como favoritas y guardarlas para leer más tarde.

#### Arquitectura

**Concepto**: Los usuarios pueden guardar historias que les gustan o quieren leer después, marcándolas con una estrella. Las historias favoritas se pueden ver en una página dedicada.

#### Base de Datos

**Tabla: favorites**
```sql
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, experience_id) -- Un usuario solo puede marcar una vez
);
```

**Características**:
- ✅ Relación muchos a muchos entre usuarios e historias
- ✅ Constraint único: no duplicar favoritos
- ✅ CASCADE DELETE: si se elimina historia o usuario, se eliminan favoritos
- ✅ 3 índices para performance (user_id, experience_id, compuesto)

**RLS Policies**:
```sql
-- Lectura pública (ver qué historias son favoritas)
CREATE POLICY "Anyone can view favorites" FOR SELECT USING (true);

-- Solo autenticados pueden crear favoritos
CREATE POLICY "Authenticated users can create favorites" FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Solo puedes eliminar tus propios favoritos
CREATE POLICY "Users can delete their own favorites" FOR DELETE
USING (auth.uid() = user_id);
```

**Funciones Helper PostgreSQL**:
1. `count_experience_favorites(experience_id)` - Cuenta favoritos de una historia
2. `is_favorite(user_id, experience_id)` - Verifica si es favorito
3. `get_user_favorite_ids(user_id)` - Obtiene IDs de favoritos de un usuario

**Vista actualizada: experiences_with_author**
```sql
-- Agregada columna favorites_count
SELECT
  e.*,
  p.full_name AS author_name,
  p.avatar_url AS author_avatar,
  (SELECT COUNT(*) FROM public.reactions WHERE experience_id = e.id) AS reactions_count,
  (SELECT COUNT(*) FROM public.comments WHERE experience_id = e.id) AS comments_count,
  (SELECT COUNT(*) FROM public.favorites WHERE experience_id = e.id) AS favorites_count -- ✨ NUEVO
FROM public.experiences e
LEFT JOIN public.profiles p ON e.user_id = p.id;
```

#### Componentes Creados

**FavoriteButton.tsx** ([FavoriteButton.tsx](src/components/FavoriteButton.tsx))
- Botón inteligente con ícono de estrella
- Props principales:
  - `experienceId: string` - ID de la historia
  - `experienceTitle?: string` - Título para toast
  - `variant?: "default" | "ghost" | "outline"` - Estilo del botón
  - `size?: "default" | "sm" | "lg" | "icon"` - Tamaño
  - `showLabel?: boolean` - Mostrar texto "Favorito"
  - `className?: string` - Clases adicionales

**Estados del botón**:
- ⭐ Gris vacío: No es favorito
- ⭐ Amarillo relleno: Es favorito
- 🔄 Loading: Cargando estado inicial
- 🚫 Disabled: Si no hay usuario autenticado

**Funcionalidades**:
- ✅ Toggle automático (click para agregar/quitar)
- ✅ Verificación de estado al montar
- ✅ Prevención de propagación (no activa click de card)
- ✅ Toast notifications con nombre de historia
- ✅ Loading states durante operaciones
- ✅ Tooltip informativo

**Favorites.tsx** ([Favorites.tsx](src/pages/Favorites.tsx))
- Página completa de favoritos del usuario
- Funcionalidades:
  - ✅ Grid de tarjetas con ExperienceCard
  - ✅ Contador de favoritos
  - ✅ Empty state cuando no hay favoritos
  - ✅ Link a Explore desde empty state
  - ✅ Loading skeleton mientras carga
  - ✅ Header con ícono de estrella amarilla

#### Servicio: FavoriteService

**7 Métodos Implementados**:

```typescript
// 1. Agregar a favoritos
static async addFavorite(dto: CreateFavoriteDTO): Promise<Favorite>
// Validación: usuario autenticado

// 2. Quitar de favoritos
static async removeFavorite(experienceId: string): Promise<void>

// 3. Toggle favorito (agregar si no existe, quitar si existe)
static async toggleFavorite(experienceId: string): Promise<boolean>
// Retorna true si ahora es favorito, false si no

// 4. Verificar si es favorito
static async isFavorite(experienceId: string): Promise<boolean>

// 5. Obtener mis favoritos con detalles de las historias
static async getMyFavorites(): Promise<FavoriteWithExperience[]>
// Incluye información de la historia y autor

// 6. Contar favoritos de una historia
static async countFavorites(experienceId: string): Promise<number>

// 7. Obtener solo IDs de favoritos
static async getMyFavoriteIds(): Promise<string[]>
// Útil para marcar como favoritas en listados
```

#### Tipos TypeScript

```typescript
export interface Favorite {
  id: string;
  user_id: string;
  experience_id: string;
  created_at: string;
}

export interface CreateFavoriteDTO {
  experience_id: string;
  // user_id se obtiene del usuario autenticado
}

export interface FavoriteWithExperience extends Favorite {
  experience: {
    id: string;
    title: string;
    excerpt: string | null;
    image_url: string | null;
    author_name: string | null;
    author_avatar: string | null;
    created_at: string;
  };
}
```

#### Integración en la App

**1. ExperienceCard** ([ExperienceCard.tsx](src/components/ExperienceCard.tsx))
- ✅ FavoriteButton en esquina superior derecha de la imagen
- ✅ Estilo: fondo blanco semi-transparente con sombra
- ✅ Presente tanto si hay imagen como si no
- ✅ Reemplaza ConnectionButton (removido por simplicidad)

**2. ExperienceDetail** ([ExperienceDetail.tsx](src/pages/ExperienceDetail.tsx))
- ✅ FavoriteButton junto a información del autor
- ✅ Variant "outline" con label visible
- ✅ Muestra "Favorito" o "Agregar a favoritos"

**3. Navbar** ([Navbar.tsx](src/components/Navbar.tsx))
- ✅ Link "Favoritos" en menú de usuario
- ✅ Ícono de estrella
- ✅ Navega a `/favorites`

**4. Routes** ([routes/index.tsx](src/routes/index.tsx))
- ✅ Nueva ruta `/favorites` → `<Favorites />`
- ✅ Constante `ROUTES.FAVORITES` agregada

#### Flujo de Usuario

**Escenario 1: Marcar como favorito desde Explore**
1. Usuario ve historias en `/explore`
2. Click en estrella (esquina superior derecha de la imagen)
3. Estrella se vuelve amarilla y rellena
4. Toast: "Agregado a favoritos - [Título de la historia]"

**Escenario 2: Ver favoritos**
1. Usuario click en su avatar (Navbar)
2. Click en "Favoritos"
3. Ve grid con todas sus historias favoritas
4. Contador muestra "X historias guardadas"

**Escenario 3: Quitar de favoritos**
1. Usuario click en estrella amarilla (desde card o detalle)
2. Estrella vuelve a gris vacío
3. Toast: "Quitado de favoritos - [Título]"
4. Si estaba en página Favoritos, la historia desaparece del grid

**Escenario 4: Empty state**
1. Usuario sin favoritos va a `/favorites`
2. Ve mensaje: "Aún no tienes favoritos"
3. Botón "Explorar historias" lo lleva a `/explore`

#### Características de UX

- ✅ **Toggle instantáneo**: La estrella cambia inmediatamente
- ✅ **Feedback visual claro**: Amarillo = favorito, Gris = no favorito
- ✅ **Toast notifications**: Feedback de cada acción
- ✅ **Loading states**: Spinner durante operaciones
- ✅ **Prevención de clicks duplicados**: Disabled mientras procesa
- ✅ **Tooltips informativos**: Hover muestra acción a realizar
- ✅ **Empty states amigables**: Guía al usuario si no hay favoritos
- ✅ **Contador en página**: Muestra cantidad de favoritos

#### Script SQL

**Archivo**: `ADD_FAVORITES_SYSTEM.sql`

**Contenido**:
1. Tabla `favorites` con constraints
2. 3 índices para optimización
3. 3 RLS policies (SELECT, INSERT, DELETE)
4. 3 funciones helper
5. Vista `experiences_with_author` actualizada (agrega favorites_count)

**Instrucciones**: Ver archivo `INSTRUCCIONES_FAVORITOS.md`

---

### ✅ Sistema de Etiquetas Completo

#### Componentes Creados
- **TagBadge** ([TagBadge.tsx](src/components/TagBadge.tsx)) - Badge individual con emoji
- **TagSelector** ([TagSelector.tsx](src/components/TagSelector.tsx)) - Multi-select para formularios
- **TagFilterBar** ([TagFilterBar.tsx](src/components/TagFilterBar.tsx)) - Barra de filtros en Explore

#### Servicio
- **TagService** ([tag.service.ts](src/services/tag.service.ts)) - CRUD completo de etiquetas
  - `getAllTags()` - Obtener todas las etiquetas
  - `getTagsForExperience()` - Etiquetas de una historia
  - `addTagsToExperience()` - Agregar etiquetas
  - `updateTagsForExperience()` - Actualizar etiquetas
  - `removeAllTagsFromExperience()` - Eliminar todas
  - `getExperiencesByTag()` - Buscar por etiqueta
  - `getExperiencesByTags()` - Buscar por múltiples etiquetas

#### Funcionalidades
1. **Crear Historia con Etiquetas**
   - ✅ Selector multi-select (máx. 5 etiquetas)
   - ✅ Validación: mínimo 1 etiqueta requerida
   - ✅ Vista previa de etiquetas seleccionadas
   - ✅ Contador de etiquetas

2. **Editar Historia**
   - ✅ Pre-carga etiquetas existentes
   - ✅ Agregar o quitar etiquetas
   - ✅ Actualización automática en BD

3. **Filtrar en Explore**
   - ✅ TagFilterBar con todas las etiquetas
   - ✅ Selección múltiple (lógica OR)
   - ✅ Botón "Limpiar filtros"
   - ✅ Contador de resultados
   - ✅ Combina con búsqueda de texto

4. **Visualización**
   - ✅ ExperienceCard: muestra hasta 3 etiquetas + contador
   - ✅ ExperienceDetail: muestra todas las etiquetas
   - ✅ Emojis + nombres en badges

---

### ✅ Sistema de Historias Completo

#### 1. **Crear Historia** ([CreateExperience.tsx](src/pages/CreateExperience.tsx))
- ✅ Formulario con validación
- ✅ Campos: Título (200 chars), Extracto (300 chars), Contenido, Imagen
- ✅ **Subida de imagen desde dispositivo** ✨
- ✅ Vista previa instantánea
- ✅ Indicadores de progreso
- ✅ Guardado en Supabase
- ✅ Navegación automática al detalle después de crear

#### 2. **Ver Historia** ([ExperienceDetail.tsx](src/pages/ExperienceDetail.tsx))
- ✅ Vista completa de la historia
- ✅ Imagen destacada
- ✅ Información del autor (nombre, avatar, fecha)
- ✅ Contenido completo
- ✅ Botones Editar/Eliminar (solo para el autor)
- ✅ Confirmación antes de eliminar
- ✅ Botón de favoritos con label ✨
- ✅ Botón "Agregar a Compartidos" (solo si NO eres el autor) ✨ NUEVO
- ✅ Sistema de reacciones completo ✨
- ✅ Sistema de comentarios anidados ✨

#### 3. **Editar Historia** ([EditExperience.tsx](src/pages/EditExperience.tsx))
- ✅ Formulario pre-llenado con datos actuales
- ✅ Verificación de propiedad (solo el autor puede editar)
- ✅ **Cambiar imagen** (sube nueva, elimina antigua) ✨
- ✅ Vista previa de imagen actual
- ✅ Actualización en Supabase
- ✅ Recarga automática para mostrar cambios

#### 4. **Explorar Historias** ([Explore.tsx](src/pages/Explore.tsx))
- ✅ Grid de tarjetas con historias reales de Supabase
- ✅ Búsqueda en tiempo real (título, contenido, autor)
- ✅ Contador de resultados
- ✅ Empty state cuando no hay historias
- ✅ Imágenes con cache-busting ✨
- ✅ FavoriteButton en cada tarjeta (esquina superior derecha) ✨ NUEVO

#### 5. **Ver Favoritos** ([Favorites.tsx](src/pages/Favorites.tsx)) ✨ NUEVO
- ✅ Grid de historias marcadas como favoritas
- ✅ Contador de favoritos guardados
- ✅ Empty state con link a Explore
- ✅ Loading skeleton mientras carga
- ✅ Header con ícono de estrella amarilla

---

## 🖼️ Sistema de Imágenes

### ✅ Mejoras de UX Implementadas

**Servicio**: [StorageService](src/services/storage.service.ts)

**Métodos**:
- `uploadImage(file, userId)` - Sube imagen al bucket
- `deleteImage(path)` - Elimina imagen del bucket
- `replaceImage(oldPath, newFile, userId)` - Reemplaza imagen
- `getPathFromUrl(url)` - Extrae path de URL
- `validateImageFile(file)` - Valida tipo y tamaño

**Componente**: [ImageWithFallback](src/components/ImageWithFallback.tsx)

**Características** ✨:
- ✅ Vista previa instantánea al seleccionar archivo
- ✅ Cache-busting automático (`?t={timestamp}`)
- ✅ Estados: Cargando → Cargado → Error
- ✅ Reseteo automático cuando cambia la imagen
- ✅ Fallback visual si falla la carga

**Flujo de subida**:
1. Usuario selecciona imagen → Vista previa local instantánea
2. Click "Guardar" → Subida a Supabase Storage
3. Imagen guardada → URL pública generada
4. Experiencia creada/actualizada con URL
5. Redirección → Imagen se muestra con cache-busting

**Problemas resueltos**:
- ✅ Vista previa aparece inmediatamente
- ✅ Imagen se actualiza después de guardar (sin F5)
- ✅ Imágenes en Explore se actualizan automáticamente

---

## 🛣️ Rutas Configuradas

```typescript
export const ROUTES = {
  HOME: "/",
  EXPLORE: "/explore",
  CREATE: "/create",
  EXPERIENCE: "/experience",
  FAVORITES: "/favorites",
  COMPARTIDOS: "/compartidos",
  MY_STORIES: "/my-stories",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  GUIDES: "/guides",           // ✨ NUEVO (v3.2)
  MISSION: "/mission",         // ✨ NUEVO (v3.2)
  PRIVACY: "/privacy",         // ✨ NUEVO (v3.2)
  CONTACT: "/contact",         // ✨ NUEVO (v3.2)
  NOT_FOUND: "*",
};
```

**Rutas dinámicas**:
- `/experience/:id` → Ver detalle de historia
- `/experience/:id/edit` → Editar historia

**Páginas de Documentación** (v3.2):
- `/guides` → Guías de uso completas
- `/mission` → Misión y valores del proyecto
- `/privacy` → Política de privacidad
- `/contact` → Información de contacto

---

## 🔧 Configuración de Supabase

### Proyecto Activo
- **Project Name**: Momentos Autenticos
- **Project ID**: `jljeegojtkblsdhzuisu`
- **URL**: `https://jljeegojtkblsdhzuisu.supabase.co`

### Providers Habilitados
- ✅ Email
- ✅ Google OAuth
- ✅ GitHub OAuth

### Dashboard Links
- **Proyecto**: https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu
- **Usuarios**: https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu/auth/users
- **Storage**: https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu/storage/buckets

---

## 📚 Scripts SQL Ejecutados

### 1. ADD_NESTED_COMMENTS.sql ✨ NUEVO
**Fecha**: 23 Octubre 2025
**Descripción**: Agregó soporte para comentarios anidados

**Cambios realizados**:
1. Agregada columna `parent_comment_id` a tabla `comments`
2. Foreign key con CASCADE DELETE
3. Índice en `parent_comment_id` para performance
4. Función recursiva PostgreSQL `get_comment_replies()`
5. RLS policies mantienen las mismas

**Función Recursiva**:
```sql
CREATE OR REPLACE FUNCTION get_comment_replies(comment_id UUID)
RETURNS TABLE (
  id UUID,
  experience_id UUID,
  user_id UUID,
  parent_comment_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
AS $$
  WITH RECURSIVE comment_tree AS (
    -- Caso base: comentario original
    SELECT * FROM public.comments WHERE id = comment_id
    UNION ALL
    -- Caso recursivo: respuestas
    SELECT c.*
    FROM public.comments c
    INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
  )
  SELECT * FROM comment_tree;
$$;
```

### 2. ADD_SHARED_CONNECTIONS.sql ✨ NUEVO
**Fecha**: 23 Octubre 2025
**Descripción**: Sistema completo de conexiones entre usuarios

**Cambios realizados**:
1. Tabla `shared_connections` con constraints
2. 4 índices para optimización de queries
3. Trigger para `updated_at`
4. 4 RLS policies (SELECT, INSERT, UPDATE, DELETE)
5. 4 funciones helper de PostgreSQL
6. Vista `shared_connections_with_users`

**Constraints importantes**:
```sql
UNIQUE(user_id, shared_user_id),              -- No duplicar conexiones
CHECK (user_id != shared_user_id),            -- No conectarse consigo mismo
CHECK (status IN ('pending', 'accepted', 'rejected'))
```

**RLS Policies**:
```sql
-- Ver conexiones donde eres parte
CREATE POLICY "Users can view their own connections"
ON shared_connections FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = shared_user_id);

-- Solo puedes crear como remitente
CREATE POLICY "Users can send connection requests"
ON shared_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Solo receptor puede actualizar (aceptar/rechazar)
CREATE POLICY "Users can update received requests"
ON shared_connections FOR UPDATE
USING (auth.uid() = shared_user_id)
WITH CHECK (auth.uid() = shared_user_id);

-- Ambos pueden eliminar
CREATE POLICY "Users can delete their own connections"
ON shared_connections FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = shared_user_id);
```

### 3. ADD_FAVORITES_SYSTEM.sql ✨ NUEVO
**Fecha**: 23 Octubre 2025
**Descripción**: Sistema completo de favoritos para historias

**Cambios realizados**:
1. Tabla `favorites` con constraints
2. 3 índices para optimización de queries
3. 3 RLS policies (SELECT, INSERT, DELETE)
4. 3 funciones helper de PostgreSQL
5. Vista `experiences_with_author` actualizada (agrega `favorites_count`)

**Funciones Helper**:
```sql
-- Contar favoritos de una experiencia
CREATE FUNCTION count_experience_favorites(target_experience_id UUID) RETURNS INTEGER;

-- Verificar si es favorito
CREATE FUNCTION is_favorite(target_user_id UUID, target_experience_id UUID) RETURNS BOOLEAN;

-- Obtener IDs de favoritos de un usuario
CREATE FUNCTION get_user_favorite_ids(target_user_id UUID) RETURNS TABLE(experience_id UUID);
```

**Vista Actualizada**:
```sql
-- experiences_with_author ahora incluye favorites_count
CREATE OR REPLACE VIEW public.experiences_with_author AS
SELECT
  e.*,
  p.full_name AS author_name,
  p.avatar_url AS author_avatar,
  (SELECT COUNT(*) FROM public.reactions WHERE experience_id = e.id) AS reactions_count,
  (SELECT COUNT(*) FROM public.comments WHERE experience_id = e.id) AS comments_count,
  (SELECT COUNT(*) FROM public.favorites WHERE experience_id = e.id) AS favorites_count
FROM public.experiences e
LEFT JOIN public.profiles p ON e.user_id = p.id;
```

**Instrucciones de ejecución**: Ver `INSTRUCCIONES_FAVORITOS.md`

---

## 📚 Documentación Disponible

### Guías Esenciales (Mantener)
1. **README.md** - Documentación principal
2. **HISTORIAL_DEL_PROYECTO.md** - Este documento ✅ (renombrado de CONTEXTO_PROYECTO.md)
3. **INSTRUCCIONES_FAVORITOS.md** - Instrucciones para activar sistema de favoritos ✅ ✨ NUEVO
4. **CONFIGURAR_STORAGE.md** - Configuración de Storage ✅
5. **CASOS_DE_USO.md** - Roadmap del proyecto ✅
6. **SISTEMA_ETIQUETAS_COMPLETADO.md** - Documentación de etiquetas ✅
7. **SISTEMA_REACCIONES_COMPLETADO.md** - Documentación de reacciones ✅

### Guías de Referencia
8. **CONFIGURAR_GOOGLE_OAUTH.md** - OAuth Google
9. **CONFIGURAR_GITHUB_OAUTH.md** - OAuth GitHub

---

## 🚧 Pendientes de Implementar

### Alta Prioridad

1. ⚠️ **Subida de Avatar**
   - Implementar subida de imagen en Profile
   - Usar StorageService para avatares
   - Bucket separado: `user-avatars`

### Media Prioridad (Según CASOS_DE_USO.md)

2. **Historias Públicas/Privadas** (Fase 3)
   - Campo `is_public` en tabla experiences
   - Selector en formularios: Público/Privado
   - Filtrar historias privadas (solo para "compartidos")
   - Feed personalizado con historias de "compartidos"

3. **Compartir Historias con Usuarios** (Fase 4)
   - Tabla `experience_shares`
   - Modal para seleccionar "compartidos"
   - Notificaciones de historias compartidas
   - Página `/compartidas` (historias compartidas contigo)

4. **Paginación en Explore**
   - Cargar más historias al hacer scroll
   - Infinite scroll o paginación clásica

5. **Mis Historias en Profile**
   - Cargar historias del usuario actual
   - Grid de tarjetas propias
   - Acceso rápido a editar/eliminar

6. **Más Filtros en Explore**
   - Filtrar por fecha (recientes, antiguas)
   - Filtrar por reacciones (populares)
   - Ordenar resultados

### Baja Prioridad (Según CASOS_DE_USO.md)

7. **Sistema de Audio** (Fase 5 - Futuro)
   - Bucket de audio en Supabase Storage
   - Grabadora de audio en navegador
   - Reproductor de audio
   - Historias narradas (audio + texto)
   - Comentarios de voz

8. **Notificaciones**
   - Sistema de notificaciones en tiempo real
   - Supabase Realtime
   - Notificar cuando: comentan, reaccionan, te agregan, comparten historia

9. **Búsqueda avanzada**
   - Full-text search en Postgres
   - Búsqueda por autor
   - Página `/etiquetas/:slug` para historias por etiqueta específica

---

## 🎯 Flujo de Usuario Actual

### Usuario No Autenticado
1. Homepage → Ve historias de ejemplo
2. Explore → Ve todas las historias públicas
3. Click en historia → Ve detalle completo con comentarios
4. Puede registrarse/login

### Usuario Autenticado ✨ ACTUALIZADO
1. Navbar muestra avatar y menú (con "Favoritos" y "Compartidos")
2. **Compartir** → Crear nueva historia ✨
   - Selecciona 1-5 etiquetas (requerido) ✨
   - Sube imagen opcional
3. **Explorar** → Ver todas las historias
   - Filtrar por etiquetas en la parte superior ✨
   - Búsqueda por texto
   - **Marcar como favorito** desde cada tarjeta (estrella en esquina) ✨ NUEVO
4. Click en historia → Ver detalle
   - Ve todas las etiquetas de la historia ✨
   - **Botón de favorito** junto al autor ✨
   - **Botón "Agregar a Compartidos"** (si NO es su historia) ✨ NUEVO
   - Puede reaccionar (❤️ 👏 🔥 ✨)
   - Puede comentar y responder comentarios ✨
   - Colapsar/expandir hilos de conversación ✨
5. Si es su historia → Botones Editar/Eliminar ✨
   - Puede cambiar etiquetas al editar ✨
   - NO ve botón "Agregar a Compartidos" (no puedes conectarte contigo mismo)
6. **Favoritos** → Ver historias guardadas ✨ NUEVO
   - Grid con todas las historias favoritas
   - Contador de favoritos
   - Acceso rápido a historias guardadas
7. **Compartidos** (Modal) → Gestionar conexiones ✨ ACTUALIZADO
   - Se abre desde menú de usuario
   - Ver conexiones aceptadas
   - Aceptar/rechazar solicitudes recibidas
   - Cancelar solicitudes enviadas
8. **Perfil** → Ver/editar información
9. Cerrar sesión

---

## 🐛 Problemas Conocidos

### ✅ Resueltos en Sesión Actual (23 Oct 2025)

1. ✅ **Error 400 en ConnectionService** → Foreign key names inexistentes eliminados
2. ✅ **ConnectionButton no distinguía remitente/receptor** → Agregado estado `isSender`
3. ✅ **Solicitudes no aparecían en Compartidos** → Fixed queries con perfiles separados
4. ✅ **Botón "Aceptar" cancelaba en vez de aceptar** → Corregida lógica de botones

### ✅ Resueltos Previamente (22 Oct 2025)

5. ✅ **Vista previa no se mostraba** → Resuelto con `useEffect` en ImageWithFallback
6. ✅ **Imagen no se actualizaba** → Resuelto con `window.location.reload()`
7. ✅ **Caché de imágenes en Explore** → Resuelto con cache-busting
8. ✅ **Import error en storage.service** → Ruta corregida
9. ✅ **Error en ExperienceCard** → Spread operator incorrecto en ExperiencesSection.tsx
10. ✅ **Foreign key comments → profiles** → Foreign key arreglada en Supabase
11. ✅ **Etiquetas no se guardaban en EditExperience** → Extraer tag_ids antes de update

### ⚠️ Pendientes

Ningún problema crítico conocido actualmente.

---

## ✅ Checklist de Estado

### Infraestructura
- [x] React + TypeScript + Vite
- [x] Tailwind CSS
- [x] React Router
- [x] Supabase cliente
- [x] Variables de entorno

### Autenticación
- [x] Email/Password
- [x] Google OAuth
- [x] GitHub OAuth
- [x] AuthContext y AuthService
- [x] Protección de rutas

### Base de Datos
- [x] Tabla `profiles`
- [x] Tabla `experiences`
- [x] Tabla `reactions`
- [x] Tabla `comments` con soporte anidado ✨
- [x] Tabla `tags`
- [x] Tabla `experience_tags`
- [x] Tabla `shared_connections` ✨
- [x] Tabla `favorites` ✨ NUEVO (23 Oct 2025 - v2)
- [x] Vista `experiences_with_author` (actualizada con favorites_count) ✨
- [x] Vista `shared_connections_with_users` ✨
- [x] RLS policies configuradas (todas las tablas)
- [x] Triggers automáticos
- [x] Storage bucket `experience-images`
- [x] 4 funciones helper para conexiones ✨
- [x] 3 funciones helper para favoritos ✨ NUEVO
- [x] Función recursiva para comentarios ✨

### Funcionalidades Core
- [x] Navegación completa
- [x] Sistema de historias CRUD completo
- [x] Subida de imágenes desde dispositivo
- [x] Búsqueda en tiempo real
- [x] Cache-busting de imágenes
- [x] Sistema de reacciones (100% funcional)
- [x] Sistema de etiquetas (100% funcional)
- [x] Sistema de comentarios anidados ✨ (100% funcional)
- [x] Sistema de "Compartidos" ✨ (100% funcional con modal)
- [x] Sistema de Favoritos ✨ NUEVO (23 Oct 2025 - v2) (100% funcional)
- [ ] Historias públicas/privadas
- [ ] Compartir historias con usuarios específicos
- [ ] Paginación
- [ ] Notificaciones

### UI/UX
- [x] 40+ componentes shadcn/ui
- [x] Navbar con menú de usuario + "Favoritos" + "Compartidos" (modal) ✨ ACTUALIZADO
- [x] Homepage completa
- [x] Página de exploración (con filtros de etiquetas y FavoriteButton) ✨ ACTUALIZADO
- [x] Páginas de auth
- [x] Página de perfil
- [x] Página de crear historia (con selector de etiquetas)
- [x] Página de editar historia (con selector de etiquetas)
- [x] Página de detalle de historia (con comentarios anidados y favorito) ✨ ACTUALIZADO
- [x] Página de Favoritos ✨ NUEVO (23 Oct 2025 - v2)
- [x] Modal de Compartidos ✨ ACTUALIZADO (antes era página)
- [x] Componente ImageWithFallback mejorado
- [x] Componente ReactionButtons
- [x] Componentes de etiquetas (TagBadge, TagSelector, TagFilterBar)
- [x] Componentes de comentarios (CommentItem, CommentThread) ✨
- [x] Componente FavoriteButton ✨ NUEVO (23 Oct 2025 - v2)
- [x] Componente CompartidosModal ✨ NUEVO (23 Oct 2025 - v2)

---

## 🎉 Logros Recientes

### Sesión Actual (24 Oct 2025 - v3.2) ✨ NUEVO

1. ✅ **Páginas de Documentación Completas**
   - Página `/guides` - Guías completas de uso de la plataforma
   - Página `/mission` - Misión y valores del proyecto
   - Página `/privacy` - Política de privacidad y protección de datos
   - Página `/contact` - Información de contacto (gomezmon@hotmail.com)
   - Footer actualizado con enlaces funcionales a todas las páginas
   - Rutas configuradas y accesibles desde el footer

2. ✅ **Sistema de Perfil Mejorado**
   - Carga real del perfil desde tabla `profiles` de Supabase
   - Actualización funcional del perfil en base de datos
   - Navbar actualizado para cargar datos desde `profiles`
   - Iniciales del avatar se actualizan correctamente
   - Recarga automática después de guardar cambios
   - Fix: Perfil ahora se guarda realmente (eliminado TODO)

3. ✅ **Preparación para Despliegue**
   - Archivo `vercel.json` creado para routing SPA
   - `.gitignore` actualizado con variables de entorno
   - Repositorio Git inicializado con commit inicial
   - Build de producción verificado y funcional
   - Documento `INSTRUCCIONES_DESPLIEGUE.md` creado
   - Listo para desplegar en Vercel

4. ✅ **Mejoras de Footer**
   - Añadido texto "por GOMEZMON & Claude" junto al corazón
   - Links actualizados a páginas de documentación
   - Estructura organizada y profesional

### Sesión Previa (23 Oct 2025 - v3.1) ✨ NUEVO

1. ✅ **Sistema de Favoritos Completo**
   - Tabla `favorites` con RLS policies
   - FavoriteService con 7 métodos
   - 3 funciones helper de PostgreSQL
   - FavoriteButton componente inteligente (toggle automático)
   - Página Favoritos completa con empty state
   - Vista `experiences_with_author` actualizada (favorites_count)
   - Integración en ExperienceCard (esquina superior)
   - Integración en ExperienceDetail (junto al autor)
   - Link "Favoritos" en Navbar
   - Toast notifications de acciones
   - Loading states y verificación de estado

2. ✅ **Refactorización de Compartidos a Modal**
   - Creado CompartidosModal componente
   - Convertido de página a Dialog modal
   - Se abre desde menú de usuario en Navbar
   - Responsive con max-height 80vh
   - Tabs optimizados para móvil
   - Eliminada ruta `/compartidos`
   - Mantenida toda la funcionalidad existente

3. ✅ **Simplificación UX de ExperienceCard**
   - Removido ConnectionButton de tarjetas
   - Solo FavoriteButton (más limpio y claro)
   - Focus en acción principal: marcar como favorito

4. ✅ **Documentación Completa**
   - INSTRUCCIONES_FAVORITOS.md creado
   - ADD_FAVORITES_SYSTEM.sql documentado
   - HISTORIAL_DEL_PROYECTO.md actualizado
   - Todos los cambios documentados

### Sesión Previa (23 Oct 2025 - v1) ✨

1. ✅ **Sistema de Comentarios Anidados Completo**
   - Modificada tabla `comments` con campo `parent_comment_id`
   - CommentService con método `getCommentsTree()` recursivo
   - Tipos TypeScript con estructura recursiva `CommentWithReplies`
   - CommentItem: componente recursivo con validación multi-capa
   - CommentThread: contenedor del árbol completo
   - Validación de profundidad máxima (5 niveles)
   - Advertencias visuales en niveles 4-5
   - Colapsar/expandir respuestas
   - Contador de respuestas
   - Editar/eliminar en contexto
   - Loading states y toast notifications

2. ✅ **Sistema de "Compartidos" (Conexiones) Completo**
   - Tabla `shared_connections` con constraints y RLS
   - ConnectionService con 13 métodos
   - 4 funciones helper de PostgreSQL
   - Vista `shared_connections_with_users`
   - ConnectionButton inteligente (detecta remitente/receptor)
   - Página Compartidos con 3 tabs
   - Integración en Navbar y ExperienceCard
   - Estados: pending, accepted, rejected
   - Acciones contextuales según rol
   - Fix de queries con perfiles separados

3. ✅ **Documentación Actualizada**
   - Renombrado CONTEXTO_PROYECTO.md → HISTORIAL_DEL_PROYECTO.md
   - Sección completa de Comentarios Anidados
   - Sección completa de Sistema de Compartidos
   - Documentación detallada de algoritmos y arquitectura
   - Scripts SQL documentados

### Sesión Previa (22 Oct 2025)

4. ✅ **Sistema de Etiquetas Completo**
   - 2 tablas nuevas: `tags` y `experience_tags`
   - TagService con métodos completos
   - 3 componentes UI: TagBadge, TagSelector, TagFilterBar
   - Integración en Create/Edit/Explore/Detail
   - Filtros multi-selección en página Explore
   - Validación: 1-5 etiquetas por historia
   - Visualización con emojis en toda la app

5. ✅ **Sistema completo de historias**
   - Crear, ver, editar, eliminar experiencias
   - Conexión con Supabase funcionando

6. ✅ **Sistema de Reacciones**
   - 4 tipos de reacciones (❤️ 👏 🔥 ✨)
   - ReactionService y ReactionButtons
   - Toggle inteligente (agregar/cambiar/quitar)
   - Integrado en ExperienceDetail

7. ✅ **Subida de imágenes desde dispositivo**
   - StorageService completo
   - Integración en Create y Edit
   - Validaciones de tipo y tamaño

8. ✅ **Mejoras de UX en imágenes**
   - Vista previa instantánea
   - Cache-busting automático
   - Sin necesidad de F5 para ver cambios

---

## 🔒 Sistema de Privacidad (v3 - 23 Oct 2025)

### Resumen

Sistema que permite a los usuarios controlar la visibilidad de sus historias:
- **Historias Públicas** 🌍: Visibles para todos en Explorar
- **Historias Privadas** 🔒: Visibles solo para el autor y sus "Compartidos" (conexiones aceptadas)

### Implementación SQL

**Archivo**: `ADD_PRIVACY_SYSTEM.sql`

#### 1. Campo is_public

```sql
ALTER TABLE public.experiences
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true NOT NULL;
```

- **Tipo**: BOOLEAN
- **Default**: `true` (público por defecto)
- **Significado**: `true` = pública, `false` = privada

#### 2. Índices de Optimización

```sql
-- Índice para filtrar historias públicas
CREATE INDEX idx_experiences_is_public
ON public.experiences(is_public);

-- Índice compuesto para queries comunes (público + fecha)
CREATE INDEX idx_experiences_public_created
ON public.experiences(is_public, created_at DESC);
```

**Beneficios**:
- Queries de historias públicas son instantáneas
- Ordenamiento por fecha optimizado
- Performance escalable a miles de historias

#### 3. Row Level Security (RLS) Policies

**Política 1: Ver historias públicas** (todos)
```sql
CREATE POLICY "Anyone can view public experiences"
ON public.experiences FOR SELECT
USING (is_public = true);
```

**Política 2: Ver historias privadas propias**
```sql
CREATE POLICY "Users can view their own private experiences"
ON public.experiences FOR SELECT
USING (
  auth.uid() = user_id
  AND is_public = false
);
```

**Política 3: Ver historias privadas de compartidos**
```sql
CREATE POLICY "Users can view private experiences from connections"
ON public.experiences FOR SELECT
USING (
  is_public = false
  AND EXISTS (
    SELECT 1 FROM public.shared_connections
    WHERE status = 'accepted'
    AND (
      (user_id = auth.uid() AND shared_user_id = experiences.user_id)
      OR
      (shared_user_id = auth.uid() AND user_id = experiences.user_id)
    )
  )
);
```

**Lógica**:
- Historias públicas: visible para todos (autenticados o no)
- Historias privadas: visible solo para autor
- Historias privadas: visible para usuarios con conexión aceptada bidireccional

#### 4. Funciones Helper

**can_view_experience(experience_id, user_id)**: BOOLEAN
```sql
-- Verifica si un usuario puede ver una experiencia específica
-- Retorna TRUE si:
--   1. La historia es pública, O
--   2. El usuario es el autor, O
--   3. El usuario tiene conexión aceptada con el autor
```

**count_public_experiences(user_id)**: INTEGER
```sql
-- Cuenta cuántas historias públicas tiene un usuario
```

**count_private_experiences(user_id)**: INTEGER
```sql
-- Cuenta cuántas historias privadas tiene un usuario
```

#### 5. Vista Actualizada

**experiences_with_author**: Actualizada para incluir campo `is_public`

```sql
CREATE OR REPLACE VIEW public.experiences_with_author AS
SELECT
  e.*,
  p.full_name AS author_name,
  p.avatar_url AS author_avatar,
  (SELECT COUNT(*) FROM public.reactions WHERE experience_id = e.id) AS reactions_count,
  (SELECT COUNT(*) FROM public.comments WHERE experience_id = e.id) AS comments_count,
  (SELECT COUNT(*) FROM public.favorites WHERE experience_id = e.id) AS favorites_count
FROM public.experiences e
LEFT JOIN public.profiles p ON e.user_id = p.id;
```

**Nota**: Vista hereda automáticamente el campo `is_public` de la tabla `experiences`

### Implementación Frontend

#### 1. Tipos TypeScript

**Actualizado**: [experience.ts](src/types/experience.ts)

```typescript
export interface Experience {
  id: string;
  user_id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  is_public: boolean; // ✨ NUEVO
  created_at: string;
  updated_at: string;
}

export interface CreateExperienceDTO {
  title: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  is_public?: boolean; // ✨ NUEVO (default true si no se especifica)
  tag_ids?: string[];
}

export interface UpdateExperienceDTO {
  title?: string;
  content?: string;
  excerpt?: string;
  image_url?: string;
  is_public?: boolean; // ✨ NUEVO (puede cambiar entre pública/privada)
  tag_ids?: string[];
}
```

#### 2. Componente: CreateExperience

**Archivo**: [CreateExperience.tsx](src/pages/CreateExperience.tsx)

**Cambios**:
- ✅ Import de `RadioGroup`, `RadioGroupItem`, `Lock`, `Globe`
- ✅ State `isPublic` (default `true`)
- ✅ Privacy Selector UI con RadioGroup
- ✅ Paso de `is_public` a `createExperience()`

**UI del Selector**:
```tsx
<div className="space-y-3">
  <Label>Privacidad</Label>
  <RadioGroup
    value={isPublic ? "public" : "private"}
    onValueChange={(value) => setIsPublic(value === "public")}
  >
    <div className="flex items-start space-x-3">
      <RadioGroupItem value="public" id="public" />
      <Label htmlFor="public">
        <Globe className="h-4 w-4 text-green-600" />
        <span>Pública</span>
      </Label>
      <p>Todos pueden ver esta historia en Explorar</p>
    </div>

    <div className="flex items-start space-x-3">
      <RadioGroupItem value="private" id="private" />
      <Label htmlFor="private">
        <Lock className="h-4 w-4 text-amber-600" />
        <span>Privada</span>
      </Label>
      <p>Solo tú y tus compartidos pueden verla</p>
    </div>
  </RadioGroup>
</div>
```

**Flujo**:
1. Usuario llena formulario de nueva historia
2. Selecciona privacidad con radio buttons (Pública/Privada)
3. Al enviar, se pasa `is_public: isPublic` al servicio
4. Historia se crea con el valor de privacidad seleccionado

#### 3. Componente: EditExperience

**Archivo**: [EditExperience.tsx](src/pages/EditExperience.tsx)

**Cambios**:
- ✅ Import de `RadioGroup`, `RadioGroupItem`, `Lock`, `Globe`
- ✅ State `isPublic` (default `true`)
- ✅ Carga de `is_public` en `loadExperience()`: `setIsPublic(experience.is_public ?? true)`
- ✅ Privacy Selector UI (idéntico a CreateExperience)
- ✅ Paso de `is_public` a `updateExperience()`

**Flujo**:
1. Usuario edita historia existente
2. Se carga el estado actual de privacidad desde la BD
3. Usuario puede cambiar entre Pública/Privada
4. Al guardar, se actualiza el campo `is_public` en la BD

#### 4. ExperienceService

**Archivo**: [experience.service.ts](src/services/experience.service.ts)

**No requiere cambios**:
- Usa spread operator para insertar/actualizar todos los campos del DTO
- El campo `is_public` se maneja automáticamente
- RLS policies aplican filtros de forma transparente

```typescript
// createExperience - maneja is_public automáticamente
const { tag_ids, ...dataToInsert } = experienceData;
await supabase.from("experiences").insert([{
  user_id: user.id,
  ...dataToInsert, // incluye is_public si está en el DTO
}]);

// updateExperience - maneja is_public automáticamente
const { tag_ids, ...dataToUpdate } = experienceData;
await supabase.from("experiences").update(dataToUpdate).eq("id", id);
```

### Flujos de Usuario

#### Escenario 1: Crear Historia Privada

1. Usuario autenticado va a `/create`
2. Llena título, contenido, etiquetas
3. Selecciona **"Privada"** en selector de privacidad
4. Click en **"Publicar historia"**
5. Historia se crea con `is_public = false`
6. **Resultado**:
   - ✅ Visible en perfil del usuario
   - ✅ Visible para sus "compartidos" (conexiones aceptadas)
   - ❌ NO visible en página Explorar para usuarios no conectados
   - ❌ NO visible para usuarios sin conexión aceptada

#### Escenario 2: Ver Historias Privadas de un Compartido

**Precondición**: Usuario A y Usuario B tienen conexión aceptada

1. Usuario B crea historia privada
2. Usuario A accede a Explorar o detalle de historia
3. RLS verifica:
   - ¿La historia es pública? → NO
   - ¿Es el autor? → NO
   - ¿Existe conexión aceptada? → SÍ
4. **Resultado**: Usuario A puede ver la historia privada de Usuario B

#### Escenario 3: Cambiar Privacidad de Historia Existente

1. Usuario edita historia pública existente (`/experience/:id/edit`)
2. Cambia selector de **"Pública"** a **"Privada"**
3. Click en **"Guardar cambios"**
4. Historia se actualiza: `is_public = false`
5. **Resultado**:
   - Historia desaparece de Explorar para usuarios no conectados
   - Permanece visible para el autor y compartidos

### Seguridad y Performance

#### Row Level Security (RLS)

**Ventajas**:
- ✅ Filtrado automático en BD (no requiere lógica en frontend)
- ✅ Imposible bypassear con peticiones directas
- ✅ Protege endpoints de API
- ✅ Funciona incluso si el código frontend está comprometido

**Funcionamiento**:
```typescript
// El developer escribe esto:
const { data } = await supabase
  .from("experiences")
  .select("*");

// Supabase ejecuta internamente:
SELECT * FROM experiences
WHERE (
  is_public = true
  OR user_id = auth.uid()
  OR EXISTS (conexión aceptada)
);
```

#### Performance

**Índices Creados**:
1. `idx_experiences_is_public`: Para filtrar por privacidad
2. `idx_experiences_public_created`: Para ordenar historias públicas por fecha

**Escenarios de Query**:

| Query | Índice Usado | Performance |
|-------|--------------|-------------|
| Historias públicas | `idx_experiences_is_public` | O(log n) |
| Historias públicas ordenadas por fecha | `idx_experiences_public_created` | O(log n) |
| Historias privadas propias | `idx_experiences_is_public` + user_id | O(log n) |
| Historias privadas de compartidos | Full scan + JOIN con shared_connections | O(n) - aceptable para conexiones limitadas |

**Trade-offs**:
- Historias públicas: muy rápido (índice optimizado)
- Historias privadas: ligeramente más lento (requiere JOIN con shared_connections)
- Aceptable porque:
  - Mayoría de usuarios tendrán pocas conexiones (<50)
  - Historias privadas se consultan menos frecuentemente
  - Índices en shared_connections ayudan con performance del JOIN

### Archivos de Instalación

#### 1. ADD_PRIVACY_SYSTEM.sql

**Contenido**:
- ✅ ALTER TABLE para agregar campo `is_public`
- ✅ 2 índices de optimización
- ✅ 3 políticas RLS (reemplazan 1 política antigua)
- ✅ 3 funciones helper SQL
- ✅ Actualización de vista `experiences_with_author`
- ✅ Queries de verificación comentadas
- ✅ Sección de rollback (por si se necesita revertir)

**Tamaño**: ~5KB
**Tiempo de Ejecución**: <1 segundo

#### 2. INSTRUCCIONES_PRIVACIDAD.md

**Contenido**:
- 📝 Resumen del sistema
- 🚀 Paso a paso de instalación
- ✅ Checklist de verificación
- 🧪 Instrucciones de prueba
- 🔍 Consultas SQL útiles
- ⚠️ Notas importantes
- 🐛 Instrucciones de rollback
- 📞 Sección de soporte

**Público Objetivo**: Desarrollador instalando el sistema

### Decisiones de Diseño

#### ¿Por qué Default Público?

**Razones**:
1. **Onboarding suave**: Usuarios nuevos no entienden privacidad al inicio
2. **Menos fricción**: No requiere decisión en primer uso
3. **Alineado con expectativas**: Redes sociales típicamente son públicas por defecto
4. **Retrocompatibilidad**: Historias existentes siguen siendo públicas

**Contra-argumento considerado**: "Privacidad por defecto es más segura"
- **Respuesta**: Latidos es una plataforma para compartir públicamente
- Historias privadas son para casos de uso específicos (drafts, círculo íntimo)
- Usuarios conscientes de privacidad pueden cambiar el default manualmente

#### ¿Por qué RLS en lugar de Filtros en Frontend?

**Ventajas de RLS**:
1. **Seguridad**: Imposible bypassear con peticiones directas
2. **DRY**: Una sola fuente de verdad (BD)
3. **Consistencia**: Funciona en toda la app automáticamente
4. **Menos bugs**: No hay forma de olvidar agregar filtro en alguna query

**Desventajas consideradas**:
- Queries ligeramente más lentas (JOIN con shared_connections)
- Más difícil de debuggear (lógica en BD)

**Decisión**: Ventajas superan desventajas ampliamente

#### ¿Por qué RadioGroup en lugar de Toggle?

**Razones**:
1. **Claridad**: Opciones mutuamente exclusivas son más obvias
2. **Espacio para descripciones**: Cada opción tiene texto explicativo
3. **Iconos visuales**: Globe (público) vs Lock (privado)
4. **Accesibilidad**: RadioGroup tiene mejor soporte de lectores de pantalla
5. **Patrón familiar**: Usuarios conocen radio buttons de formularios tradicionales

**Alternativa considerada**: Toggle switch simple
- **Problema**: Requiere label adicional para explicar qué significa ON/OFF
- RadioGroup elimina ambigüedad

### Compatibilidad Retroactiva

#### Historias Existentes

**Comportamiento**:
- ✅ Todas las historias existentes se marcan como `is_public = true` (default)
- ✅ No requiere migración manual
- ✅ Usuarios pueden editar y cambiar privacidad individualmente

**Impacto**: Cero breaking changes

#### Código Frontend Antiguo

**Queries sin filtro explícito**:
```typescript
// Antes (sin campo is_public)
const { data } = await supabase.from("experiences").select("*");
// Retornaba: todas las historias

// Después (con RLS activado)
const { data } = await supabase.from("experiences").select("*");
// Retorna: solo historias visibles según RLS policies
```

**Resultado**: Código existente sigue funcionando, pero ahora respeta privacidad automáticamente

### Próximas Mejoras (Opcional)

1. **Indicador Visual**: Badge "Privada" en tarjetas/detalle
2. **Filtros en Profile**: "Ver públicas" / "Ver privadas"
3. **Estadísticas**: Mostrar conteo de públicas vs privadas
4. **Bulk Edit**: Cambiar privacidad de múltiples historias a la vez
5. **Compartir Historia Privada**: Enviar link especial con token temporal

---

## 🚦 Estado del Proyecto

**Estado General**: 🟢 Funcionando - Sistema Core + Social Features + Privacidad Completo
**Autenticación**: 🟢 100% Completo
**Base de Datos**: 🟢 Configurada y Funcionando (9 tablas + 2 vistas + 11 funciones)
**Sistema de Historias**: 🟢 CRUD Completo con Etiquetas + Privacidad ✨
**Sistema de Imágenes**: 🟢 Completamente Funcional
**Sistema de Etiquetas**: 🟢 100% Completo
**Sistema de Reacciones**: 🟢 100% Completo
**Sistema de Comentarios Anidados**: 🟢 100% Completo ✨
**Sistema de "Compartidos"**: 🟢 100% Completo (Modal) ✨
**Sistema de Favoritos**: 🟢 100% Completo ✨ (23 Oct 2025 - v2)
**Sistema de Privacidad**: 🟢 100% Completo ✨ NUEVO (23 Oct 2025 - v3)

---

## 📝 Próximos Pasos Sugeridos

### Opción 1: Mejorar Perfil (Fase 4 - UX)
1. Subida de avatar (similar a experiencias)
2. Cargar "Mis Historias" del usuario con filtros (públicas/privadas)
3. Estadísticas reales (contador de historias públicas/privadas, reacciones)
4. Ver historias de un "compartido" específico
5. Badge de "Privada" en tarjetas de historias privadas

### Opción 2: Compartir Historias con Usuarios (Fase 5)
1. Crear tabla `experience_shares`
2. Modal para seleccionar "compartidos"
3. Notificaciones de historias compartidas
4. Página `/compartidas` (historias compartidas contigo)

### Opción 3: Notificaciones en Tiempo Real (Fase 6)
1. Implementar Supabase Realtime
2. Notificaciones de nuevos comentarios
3. Notificaciones de solicitudes de conexión
4. Notificaciones de reacciones

---

## 🔍 Decisiones Técnicas Importantes

### ¿Por qué comentarios anidados hasta 5 niveles?
- Balance entre funcionalidad y UX
- Evita hilos demasiado profundos difíciles de seguir
- Compatible con pantallas móviles
- Límite común en plataformas como Reddit

### ¿Por qué "Compartidos" en vez de "Amigos"?
- Refleja mejor el propósito de la plataforma (compartir experiencias)
- Menos connotaciones sociales de popularidad
- Enfoque en conexiones significativas vs. cantidad
- Alineado con la filosofía anti-likes de la app

### ¿Por qué queries separadas para perfiles en ConnectionService?
- Simplicidad: no requiere configurar foreign keys con nombres específicos
- Portabilidad: funciona en cualquier setup de Supabase
- Trade-off aceptable: slightly menos eficiente pero más confiable
- Alternativa: configurar foreign keys en Supabase con nombres exactos

### ¿Por qué construcción del árbol en cliente vs. servidor?
- Supabase no tiene soporte nativo para CTEs recursivos en JS SDK
- Función `get_comment_replies()` existe pero retorna flat array
- Client-side permite más flexibilidad en estructura de datos
- Performance aceptable para cantidad esperada de comentarios

### ¿Por qué Favoritos en lugar de Likes?
- **Filosofía de la plataforma**: Latidos busca alejarse de métricas de popularidad
- **Propósito diferente**: Favoritos = "guardar para después", Likes = "validación social"
- **Privacidad**: Los favoritos son personales, no se muestran contadores públicos
- **UX más clara**: Estrella universalmente reconocida como "guardar"
- **Menos presión social**: No hay competencia por cantidad de favoritos

### ¿Por qué Compartidos como modal en lugar de página?
- **Acceso más rápido**: No requiere navegación completa
- **Contexto preservado**: Usuario no pierde su lugar en Explore
- **Menos rutas**: Simplifica el router
- **Mobile-friendly**: Modales funcionan mejor en móviles que páginas completas
- **Patrones UI modernos**: Apps populares (Twitter, Instagram) usan modales para gestión rápida

### ¿Por qué Default Público en Privacidad?
- **Onboarding suave**: Usuarios nuevos no entienden privacidad al inicio
- **Menos fricción**: No requiere decisión en primer uso
- **Alineado con expectativas**: Redes sociales típicamente son públicas por defecto
- **Retrocompatibilidad**: Historias existentes siguen siendo públicas automáticamente

### ¿Por qué RLS en lugar de Filtros en Frontend?
- **Seguridad**: Imposible bypassear con peticiones directas a la API
- **DRY**: Una sola fuente de verdad en la base de datos
- **Consistencia**: Funciona en toda la app automáticamente sin código extra
- **Menos bugs**: No hay forma de olvidar agregar filtro en alguna query
- **Trade-off**: Queries ligeramente más lentas pero mucho más seguras

### ¿Por qué RadioGroup en lugar de Toggle Switch?
- **Claridad**: Opciones mutuamente exclusivas son más obvias
- **Espacio para descripciones**: Cada opción tiene texto explicativo debajo
- **Iconos visuales**: Globe (público) vs Lock (privado) son universalmente reconocidos
- **Accesibilidad**: RadioGroup tiene mejor soporte de lectores de pantalla
- **Eliminación de ambigüedad**: Toggle requiere label adicional para explicar ON/OFF

---

## 26 Octubre 2025 - v3.3.0: Sistema de Mensajería en Tiempo Real

### 🎯 Objetivo
Implementar un sistema de chat en tiempo real que permita a los usuarios comunicarse directamente con sus compartidos aceptados.

### ✅ Características Implementadas

#### 1. Base de Datos - Sistema de Chat
**Archivo**: `ADD_CHAT_SYSTEM.sql`

**Tablas Creadas**:
```sql
-- Tabla de conversaciones
conversations (
  id UUID PRIMARY KEY,
  user1_id UUID REFERENCES profiles(id),
  user2_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  CONSTRAINT check_user_order CHECK (user1_id < user2_id)
)

-- Tabla de mensajes
messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)
```

**Políticas RLS**:
- Solo participantes pueden ver conversaciones
- Solo participantes pueden ver mensajes de su conversación
- Solo usuarios autenticados pueden crear mensajes
- Solo el emisor puede actualizar sus propios mensajes

**Funciones de Base de Datos**:
- `get_or_create_conversation(user_id, other_user_id)`: Obtiene o crea conversación entre dos usuarios
- `count_unread_messages(conv_id, user_id)`: Cuenta mensajes no leídos por conversación
- `get_last_message(conv_id)`: Obtiene el último mensaje de una conversación

**Triggers**:
- Actualiza `conversations.updated_at` automáticamente cuando se envía un mensaje

**Vistas**:
- `conversations_with_details`: Vista con información completa de conversaciones

**Realtime**:
- Habilitado en tabla `messages` para actualizaciones en tiempo real

#### 2. TypeScript Types
**Archivo**: `src/types/chat.ts`

**Interfaces Creadas**:
```typescript
- Conversation: Estructura base de conversación
- ConversationWithDetails: Conversación con perfiles de usuarios
- Message: Estructura de mensaje
- MessageWithSender: Mensaje con información del remitente
- ConversationListItem: Item completo para lista de conversaciones
```

#### 3. Servicios Backend
**Archivos**:
- `src/services/conversation.service.ts`
- `src/services/message.service.ts`

**Funcionalidades**:
- `getOrCreateConversation()`: Crea o recupera conversación entre usuarios
- `getUserConversations()`: Lista todas las conversaciones del usuario
- `getMessages()`: Obtiene mensajes de una conversación con perfiles
- `sendMessage()`: Envía un nuevo mensaje
- `markAsRead()`: Marca mensajes como leídos
- `subscribeToMessages()`: Suscripción en tiempo real a nuevos mensajes

#### 4. Componentes UI
**Archivos**:
- `src/pages/Chats.tsx`: Lista de todas las conversaciones
- `src/pages/ChatWindow.tsx`: Ventana de chat individual

**Características de UI**:
- Lista de conversaciones con último mensaje
- Contador de mensajes no leídos
- Tiempo relativo de último mensaje
- Chat en tiempo real con auto-scroll
- Marcado automático de mensajes como leídos
- Avatar y nombre del interlocutor
- Estado vacío cuando no hay conversaciones

#### 5. Integración con Compartidos
**Archivo**: `src/pages/Compartidos.tsx`

**Cambios**:
- Botón "Mensaje" en cada compartido aceptado
- Función `handleStartChat()` para iniciar conversaciones
- Navegación directa a ventana de chat
- Estado de procesamiento mientras se crea la conversación

#### 6. Rutas y Navegación
**Archivo**: `src/routes/index.tsx`

**Rutas Añadidas**:
```typescript
- /chat: Lista de conversaciones
- /chat/:id: Ventana de chat individual
```

**Navbar**:
- Añadido enlace a Mensajes en menú desplegable
- Icono MessageCircle

#### 7. Documentación Actualizada
**Archivos**:
- `src/pages/Guides.tsx`: Nueva sección "Sistema de mensajería"
- `src/components/WhatIsLatidos.tsx`: Nueva tarjeta informativa de chat

**Contenido de Guía**:
- Cómo iniciar conversaciones desde Compartidos
- Cómo ver todas las conversaciones
- Funcionamiento del chat en tiempo real
- Contador de mensajes no leídos
- Restricción a compartidos aceptados

### 🐛 Bugs Solucionados

#### Bug 1: Constraint Violation en Conversaciones
**Problema**: Error "check constraint 'check_user_order' violation" al crear conversaciones

**Causa**: La función RPC de base de datos no ordenaba correctamente los UUIDs

**Solución**: Reescribir `getOrCreateConversation()` en TypeScript para ordenar manualmente los user_ids:
```typescript
const user1 = currentUserId < otherUserId ? currentUserId : otherUserId;
const user2 = currentUserId < otherUserId ? otherUserId : currentUserId;
```

#### Bug 2: Mensajes No Se Mostraban con Perfiles
**Problema**: Los mensajes aparecían aislados sin información del remitente

**Causa**: Join con foreign key `profiles!messages_sender_id_fkey` fallaba

**Solución**: Separar en dos queries:
1. Obtener todos los mensajes
2. Obtener perfiles únicos de remitentes
3. Combinar en cliente usando Map

### 📊 Mejoras de UX Adicionales

#### Tooltips en Navegación
**Archivo**: `src/components/Navbar.tsx`

**Cambios**:
- Añadido Tooltip a todos los enlaces del menú principal
- Mensajes descriptivos para cada sección
- Mejora la discoverabilidad de funciones

### 🔧 Decisiones Técnicas

#### ¿Por qué Supabase Realtime en lugar de Polling?
- **Eficiencia**: No requiere consultas constantes al servidor
- **Latencia baja**: Mensajes aparecen instantáneamente
- **Escalabilidad**: Menos carga en base de datos
- **UX superior**: Sensación de chat en vivo real
- **Costo**: Supabase Realtime incluido en plan gratuito

#### ¿Por qué Constraint user1_id < user2_id?
- **Evita duplicados**: Solo una conversación posible entre dos usuarios
- **Queries más eficientes**: Index único en (user1_id, user2_id)
- **Simplicidad**: No necesita lógica compleja de búsqueda bidireccional
- **Consistencia**: Siempre el mismo orden independiente de quién inicia

#### ¿Por qué Separar Queries en getMessages?
- **Robustez**: No depende de nombres exactos de foreign keys
- **Flexibilidad**: Fácil añadir más campos de perfil
- **Performance**: Map lookup es O(1), muy eficiente
- **Mantenibilidad**: Más claro qué datos se están obteniendo

#### ¿Por qué Solo Chat entre Compartidos Aceptados?
- **Privacidad**: Evita spam y mensajes no deseados
- **Coherencia**: Alineado con filosofía de conexiones significativas
- **Seguridad**: Reduce riesgo de acoso
- **UX clara**: Usuario sabe exactamente con quién puede hablar

#### ¿Por qué Botón de Mensaje en Compartidos vs. Página Separada?
- **Contexto**: Usuario ya está viendo el perfil del compartido
- **Flujo natural**: "Ver perfil → Enviar mensaje" es intuitivo
- **Menos clicks**: Acceso directo sin navegación extra
- **Consistencia**: Igual que otras acciones (eliminar compartido)

### 🎨 Componentes UI Utilizados
- Card, CardHeader, CardTitle, CardContent
- Button con variantes
- ScrollArea para lista de mensajes
- Avatar con fallback
- Input para escribir mensajes
- Badge para contador de no leídos
- Iconos: MessageCircle, Send, ArrowLeft

### 📱 Flujo de Usuario

1. **Iniciar Conversación**:
   - Usuario va a "Compartidos"
   - Click en "Mensaje" de un compartido aceptado
   - Se crea/abre conversación
   - Redirige a ventana de chat

2. **Ver Todas las Conversaciones**:
   - Click en "Mensajes" en navbar
   - Lista de conversaciones con preview
   - Muestra no leídos y último mensaje
   - Click abre conversación específica

3. **Chatear**:
   - Escribir mensaje en input
   - Click en "Enviar" o Enter
   - Mensaje aparece instantáneamente
   - Scroll automático al final
   - Mensajes del otro usuario aparecen en tiempo real
   - Se marcan como leídos automáticamente

### 🔐 Seguridad Implementada
- RLS en todas las tablas de chat
- Solo participantes acceden a sus conversaciones
- No se puede leer mensajes de otros
- Validación de user_id en todas las queries
- Restricción a nivel de base de datos (no solo frontend)

### 📦 Archivos Modificados/Creados

**Creados**:
- `ADD_CHAT_SYSTEM.sql`
- `src/types/chat.ts`
- `src/services/conversation.service.ts`
- `src/services/message.service.ts`
- `src/pages/Chats.tsx`
- `src/pages/ChatWindow.tsx`

**Modificados**:
- `src/pages/Compartidos.tsx`
- `src/routes/index.tsx`
- `src/components/Navbar.tsx`
- `src/pages/Guides.tsx`
- `src/components/WhatIsLatidos.tsx`

### 🎯 Estado Final
✅ Sistema de mensajería completo y funcional
✅ Chat en tiempo real operativo
✅ Integración con compartidos
✅ Documentación actualizada
✅ Tooltips en navegación
✅ Todos los bugs corregidos

---

## 26 Octubre 2025 - v3.4.0: Buscador de Usuarios y Mejoras en Compartidos

### 🎯 Objetivo
Permitir a los usuarios buscar y añadir compartidos directamente sin necesidad de hacerlo desde una historia.

### ✅ Características Implementadas

#### 1. Servicio de Búsqueda de Usuarios
**Archivo**: `src/services/user.service.ts`

**Métodos creados**:
```typescript
- searchUsers(query, limit): Buscar usuarios por nombre
- getUserProfile(userId): Obtener perfil de un usuario
- getUserProfiles(userIds[]): Obtener múltiples perfiles
```

**Características**:
- Búsqueda por nombre con ILIKE (case-insensitive)
- Excluye automáticamente al usuario actual
- Límite configurable de resultados (default: 20)
- Manejo de errores robusto

#### 2. Componente UserSearchBar
**Archivo**: `src/components/UserSearchBar.tsx`

**Funcionalidades**:
- Barra de búsqueda en tiempo real
- Mínimo 2 caracteres para activar búsqueda
- Muestra resultados con avatar y nombre
- Botón "Añadir" para enviar solicitud de compartido
- Filtra automáticamente usuarios ya conectados
- Estados de carga ("Buscando...")
- Mensajes informativos:
  - Estado inicial: "Escribe al menos 2 caracteres..."
  - Sin resultados: "No se encontraron usuarios..."
  - Resultados: "X usuario(s) encontrado(s)"

**Props**:
```typescript
interface UserSearchBarProps {
  onUserSelect?: (user: UserProfile) => void;
  onAddShared: (userId: string) => Promise<void>;
  excludeUserIds?: string[];
}
```

#### 3. Página Compartidos Mejorada
**Archivo**: `src/pages/Compartidos.tsx`

**Cambios principales**:
- Nueva pestaña **"Buscar"** (primera pestaña, por defecto)
- Total de 4 pestañas:
  1. **Buscar** - Buscador de usuarios
  2. **Compartidos** - Conexiones aceptadas (antes era la primera)
  3. **Recibidas** - Solicitudes pendientes
  4. **Enviadas** - Solicitudes enviadas

**Función añadida**:
```typescript
handleSendConnectionRequest(userId): Envía solicitud de compartido
getExcludedUserIds(): Retorna IDs de usuarios a excluir del buscador
```

**Integración**:
- Filtrado automático de usuarios ya conectados o con solicitudes pendientes
- Recarga automática de datos después de enviar solicitud
- Usuario desaparece de resultados inmediatamente después de añadirlo

#### 4. Documentación Actualizada
**Archivo**: `src/pages/Guides.tsx`

**Nuevas instrucciones**:
- Cómo buscar usuarios desde Compartidos
- Uso de la pestaña "Buscar"
- Flujo completo de gestión de compartidos:
  - Buscar → Enviar solicitud → Aceptar → Gestionar

### 🐛 Bugs Solucionados

#### Fix: Parámetro incorrecto en sendConnectionRequest
**Problema**: El método `sendConnectionRequest` esperaba un objeto DTO pero se llamaba con un string

**Solución**:
```typescript
// Antes (incorrecto)
await ConnectionService.sendConnectionRequest(userId);

// Después (correcto)
await ConnectionService.sendConnectionRequest({
  shared_user_id: userId,
});
```

### 📊 Flujo de Usuario Mejorado

**Antes**:
1. Usuario debía encontrar una historia de otro usuario
2. Ver detalle de la historia
3. Click en botón "Añadir como compartido"

**Ahora**:
1. Usuario va a **Compartidos**
2. Pestaña **"Buscar"** abierta por defecto
3. Escribe nombre del usuario
4. Ve resultados en tiempo real
5. Click en **"Añadir"**
6. Solicitud enviada inmediatamente

### 🎨 Componentes UI Utilizados
- Input con icono de búsqueda
- Card para resultados
- Avatar con fallback
- Button con estados de carga
- Tabs con 4 pestañas

### 🔧 Decisiones Técnicas

#### ¿Por qué búsqueda en la página Compartidos vs página separada?
- **Contexto**: Los usuarios ya están en Compartidos para gestionar conexiones
- **Menos navegación**: No requiere ir a otra página
- **UX intuitivo**: Todo relacionado con compartidos en un solo lugar
- **Pestañas claras**: Fácil alternar entre buscar, ver compartidos y gestionar solicitudes

#### ¿Por qué búsqueda por nombre y no por email?
- **Privacidad**: Los emails no deberían ser visibles públicamente
- **UX**: Los usuarios recuerdan nombres, no emails
- **Futuro**: Se puede extender a búsqueda por username si se implementa

#### ¿Por qué mínimo 2 caracteres?
- **Performance**: Evita consultas innecesarias con 1 carácter
- **Resultados útiles**: Con 1 carácter habría demasiados resultados
- **UX estándar**: Es el mínimo común en buscadores

### 📦 Archivos Modificados/Creados

**Creados**:
- `src/services/user.service.ts`
- `src/components/UserSearchBar.tsx`

**Modificados**:
- `src/pages/Compartidos.tsx`
- `src/pages/Guides.tsx`
- `.gitignore` (añadido `Notas.txt`)

### 🎯 Estado Final v3.4.0
✅ Buscador de usuarios funcional
✅ Añadir compartidos sin necesidad de historias
✅ Interfaz mejorada con 4 pestañas
✅ Documentación actualizada
✅ Filtrado automático de usuarios duplicados

---

## 🎨 Versión 3.5.0: Mejoras de UX y Modo Oscuro (26 Octubre 2025)

### 🎯 Objetivo
Simplificar la experiencia de usuario, mejorar la ergonomía de la interfaz y añadir modo oscuro para mejor accesibilidad.

### ✨ Características Principales

#### 1. **Modo Oscuro (Dark Mode)**
Sistema completo de temas con 3 opciones:
- **Claro**: Fondo blanco, ideal para uso diurno
- **Oscuro**: Fondo negro, reduce fatiga visual nocturna
- **Sistema**: Se adapta automáticamente a la preferencia del dispositivo

**Implementación**:
- Librería: `next-themes`
- Componente: `ThemeToggle.tsx`
- Variables CSS: Ya configuradas en `index.css` con soporte completo
- Ubicación: Navbar (esquina superior derecha, junto al menú de usuario)
- Persistencia: Preferencia guardada en localStorage

**Características**:
- ✅ Transición suave entre temas
- ✅ Respeta preferencia del sistema operativo
- ✅ Todos los componentes adaptados (shadcn/ui totalmente compatible)
- ✅ Iconos animados (sol/luna) al cambiar

#### 2. **Floating Action Button (FAB)**
Botón flotante para crear historias rápidamente desde cualquier página.

**Características**:
- Posición: Fixed bottom-right (bottom-6 right-6)
- Tamaño: 56px × 56px (h-14 w-14)
- Icono: Plus (Lucide)
- Comportamiento: Solo visible para usuarios autenticados
- Estilo: Redondo con sombra elevada
- z-index: 50 (siempre visible sobre contenido)

**Componente**: `FloatingActionButton.tsx`
**Ubicación global**: `AppWrapper.tsx`

#### 3. **Navbar Simplificado con Iconos**
Rediseño completo del navbar para mejor usabilidad en móviles y tablets.

**Antes**: Enlaces de texto ("Inicio", "Explorar", "Compartir", "Compartidos", "Mensajes")
**Ahora**: Iconos con tooltips informativos

**Iconos implementados**:
1. **Home (Inicio)**: `/home.png` - 48px (12mm)
2. **Explorar**: `/explorar.png` - 48px (12mm)
3. **Mensajes**: `MessageCircle` icon con badge de mensajes no leídos
4. **Compartidos**: `Users` icon
5. **Theme Toggle**: `Sun/Moon` icon (modo claro/oscuro)
6. **Avatar**: Menú desplegable con opciones completas

**Mejoras**:
- ✅ Imágenes personalizadas para Home y Explorar (branding)
- ✅ Tooltips con `TooltipProvider` (delay: 300ms)
- ✅ Responsive: Solo visible en `md:` (desktop), ocultado en móviles
- ✅ Badge rojo en Mensajes muestra contador en tiempo real
- ✅ Espaciado uniforme con `space-x-2`
- ✅ Botones ghost para efecto hover sutil

**Código de iconos personalizados**:
```typescript
<Button variant="ghost" className="relative h-12 w-12 rounded-full p-0" asChild>
  <Link to={ROUTES.HOME}>
    <img src="/home.png" alt="Home" className="h-12 w-12 object-contain" />
  </Link>
</Button>
```

#### 4. **Dashboard Unificado (Explore como Home)**
Los usuarios autenticados ven "Explorar" como su página principal.

**Cambios en Index.tsx**:
```typescript
useEffect(() => {
  if (user) {
    navigate(ROUTES.EXPLORE); // Redirigir a dashboard
  }
}, [user, navigate]);
```

**Cambios en Explore.tsx**:
- Título dinámico:
  - Usuario autenticado: "Tu Feed"
  - Usuario invitado: "Explora historias auténticas"
- Descripción adaptada según contexto
- Contenido personalizado basado en compartidos

**Beneficios**:
- Menos clics para llegar al contenido
- Landing page solo para usuarios no autenticados
- Experiencia más fluida y moderna

### 🎓 Guía de Inicio Rápido
Se creó `GUIA_INICIO_RAPIDO.md`: Guía completa para nuevos usuarios con:
- 10 pasos detallados desde registro hasta uso avanzado
- Capturas conceptuales de cada sección
- FAQs comunes
- Consejos para empezar
- Lenguaje simple y directo

**Secciones principales**:
1. Registro y verificación de email
2. Completar perfil
3. Crear primera historia
4. Conectar con usuarios
5. Explorar historias
6. Chat con compartidos
7. Organizar en círculos
8. Guardar favoritos
9. Personalizar experiencia (modo oscuro)
10. Gestionar privacidad

### 📦 Nuevos Archivos Creados

**Componentes**:
- `src/components/ThemeToggle.tsx` - Toggle de tema claro/oscuro/sistema
- `src/components/FloatingActionButton.tsx` - FAB para crear historias
- `src/components/AppWrapper.tsx` - Wrapper global para componentes que usan router

**Documentación**:
- `GUIA_INICIO_RAPIDO.md` - Guía paso a paso para nuevos usuarios
- `DESPLIEGUE_A_PRODUCCION.md` - Guía completa de deployment

### 🔧 Archivos Modificados

**Componentes**:
- `src/components/Navbar.tsx` - Iconos personalizados y simplificación
- `src/main.tsx` - Integración de ThemeProvider

**Páginas**:
- `src/pages/Index.tsx` - Redirección automática a Explore
- `src/pages/Explore.tsx` - Títulos dinámicos según autenticación

**Routing**:
- `src/routes/index.tsx` - Estructura de rutas anidadas con AppWrapper

**Config**:
- `.gitignore` - Añadido `claves.txt` y `Notas.txt`

### 🎨 Decisiones de Diseño

#### ¿Por qué Iconos en lugar de Texto?
- **Espacio**: Libera espacio en navbar para mejor respiración visual
- **Universal**: Iconos son reconocibles internacionalmente
- **Móvil**: Mejor experiencia en pantallas pequeñas
- **Moderno**: Estándar en apps contemporáneas (Twitter, Instagram, Facebook)
- **Tooltips**: Mantienen claridad con explicaciones al hover

#### ¿Por qué FAB en lugar de botón en navbar?
- **Accesibilidad**: Siempre visible, sin importar posición de scroll
- **Jerarquía**: Acción primaria destacada visualmente
- **Ergonomía**: Fácil alcance con el pulgar en móviles (esquina inferior derecha)
- **Estándar**: Patrón Material Design ampliamente reconocido

#### ¿Por qué Explore como Dashboard?
- **Reduce fricción**: Un clic menos para llegar al contenido
- **Landing page separada**: Solo para marketing y captación
- **Personalización**: Permite mostrar contenido relevante al usuario
- **Feed unificado**: Historias públicas + de compartidos en un solo lugar

#### ¿Por qué 48px (12mm) para iconos personalizados?
- **Tamaño táctil óptimo**: Sigue guías de accesibilidad (mínimo 44px)
- **Proporcional**: Similar al avatar de usuario (40px)
- **Legible**: Ni demasiado grande ni pequeño
- **Conversión exacta**: 12mm ≈ 45.35px (redondeado a 48px por escala de Tailwind)

### 🚀 Impacto en UX

**Antes de v3.5.0**:
- Navbar abarrotado con 5+ enlaces de texto
- Sin acceso rápido a crear historias
- Solo tema claro disponible
- Landing page como home para todos

**Después de v3.5.0**:
- Navbar limpio con 4 iconos + avatar + theme toggle
- FAB flotante para creación rápida desde cualquier lugar
- 3 temas disponibles (claro/oscuro/sistema)
- Dashboard personalizado para usuarios autenticados
- Guía completa para nuevos usuarios

### 📊 Métricas Esperadas
- ⬆️ **Reducción de clics**: -1 clic promedio para llegar a contenido
- ⬆️ **Creación de historias**: +30% por accesibilidad del FAB
- ⬆️ **Retención**: Modo oscuro mejora uso nocturno
- ⬆️ **Onboarding**: Guía reduce fricción inicial

### 🎯 Estado Final v3.5.0
✅ Modo oscuro funcional con 3 opciones
✅ FAB flotante para crear historias
✅ Navbar simplificado con iconos personalizados
✅ Dashboard unificado (Explore como home)
✅ Guía de inicio rápido completa
✅ Experiencia móvil mejorada
✅ Branding reforzado con iconos personalizados

---

## 🎯 Versión 3.6.0: Mejoras Finales de UX y Pulido Visual (26 Octubre 2025)

### 🎯 Objetivo
Completar las mejoras de experiencia de usuario con indicadores visuales, animaciones, estados vacíos y optimización de navegación móvil.

### ✨ Mejoras Implementadas

#### 1. **Indicadores Visuales de Privacidad en Cards**
Sistema completo de badges de colores para identificar el nivel de privacidad de cada historia.

**Badges implementados**:
- 🌐 **Verde (bg-green-500)**: Historia pública - Visible para todos
- 👥 **Azul (bg-blue-500)**: Compartida con círculo - Solo un círculo específico
- 👥 **Morado (bg-purple-500)**: Compartida con usuarios - Usuarios específicos seleccionados
- 🔒 **Naranja (bg-orange-500)**: Historia privada - Solo visible para el autor

**Características**:
- Posición: Esquina superior izquierda de cada card
- Icono + texto descriptivo
- Visible tanto en cards con imagen como sin imagen
- Hover effect para mejor contraste

**Archivo**: [src/components/ExperienceCard.tsx](src/components/ExperienceCard.tsx)

#### 2. **Botón Scroll-to-Top**
Componente flotante para volver arriba de la página fácilmente.

**Características**:
- Aparece automáticamente al hacer scroll > 300px
- Posición: Fixed bottom-left (6px desde bordes)
- Animación smooth scroll al hacer click
- z-index: 40 (debajo del FAB)
- Icono: ArrowUp (Lucide)
- Tamaño: 48px × 48px circular

**Archivo**: [src/components/ScrollToTop.tsx](src/components/ScrollToTop.tsx)
**Integración**: AppWrapper.tsx (global)

#### 3. **Feedback Visual Mejorado en Formularios**
Spinners animados durante operaciones de carga.

**Mejoras en CreateExperience.tsx**:
- Loader2 icon con `animate-spin` durante "Subiendo imagen..."
- Loader2 icon con `animate-spin` durante "Publicando..."
- Botón deshabilitado durante procesos
- Estados claramente diferenciados

**Mejoras en EditExperience.tsx**:
- Loader2 icon con `animate-spin` durante "Subiendo imagen..."
- Loader2 icon con `animate-spin` durante "Guardando..."
- Consistencia con CreateExperience

**Archivos**:
- [src/pages/CreateExperience.tsx](src/pages/CreateExperience.tsx)
- [src/pages/EditExperience.tsx](src/pages/EditExperience.tsx)

#### 4. **Animaciones y Transiciones Sutiles**
Conjunto de animaciones CSS reutilizables para mejorar la sensación de fluidez.

**Keyframes añadidos**:
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInFromRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

**Clases de utilidad**:
- `.animate-fade-in` - Fade in con movimiento vertical
- `.animate-slide-in-right` - Slide desde la derecha
- `.animate-scale-in` - Escala desde 95% a 100%
- `.animate-pulse-subtle` - Pulso sutil infinito
- `.transition-smooth` - Transición suave (200ms ease-in-out)
- `.transition-bounce` - Transición con rebote (300ms cubic-bezier)

**Archivo**: [src/index.css](src/index.css)

#### 5. **Componente de Error con Sugerencias**
Componente reutilizable para mostrar errores con sugerencias útiles.

**Características**:
- 4 tipos: error, warning, info, success
- Título y mensaje personalizables
- Lista de sugerencias opcionales
- Animación fade-in al aparecer
- Iconos contextuales (AlertCircle, Info, CheckCircle)

**Archivo**: [src/components/ErrorMessage.tsx](src/components/ErrorMessage.tsx)

#### 6. **Empty States Ilustrativos**
Componente reutilizable para estados vacíos con iconos y acciones.

**Características**:
- Icono grande con círculo de fondo
- Título y descripción personalizables
- Botón de acción opcional
- Animación fade-in
- Responsive y centrado

**Uso en Explore.tsx**:
- Estado vacío con filtros: "No se encontraron historias" + botón "Limpiar filtros"
- Estado vacío sin historias (usuario autenticado): "Sé el primero..." + botón "Compartir mi historia"
- Estado vacío sin historias (invitado): "Regístrate..." + botón "Registrarse"
- Icono dinámico según contexto (Search o BookOpen)

**Archivos**:
- [src/components/EmptyState.tsx](src/components/EmptyState.tsx)
- [src/pages/Explore.tsx](src/pages/Explore.tsx)

#### 7. **Navegación Móvil Mejorada**
Navbar completamente funcional en dispositivos móviles.

**Características**:
- **Desktop** (md:flex): Iconos grandes (48px home/explorar, 36px mensaje, 48px compartidos)
- **Mobile** (flex md:hidden): Iconos adaptados (32px general, 28px mensaje)
- Botones táctiles optimizados (40px área de click)
- Badge de mensajes no leídos adaptado (h-4 w-4, texto 10px)
- Espaciado reducido en móvil (space-x-1)
- Tooltips solo en desktop

**Archivo**: [src/components/Navbar.tsx](src/components/Navbar.tsx)

### 📦 Nuevos Archivos Creados

**Componentes**:
- `src/components/ScrollToTop.tsx` - Botón flotante volver arriba
- `src/components/ErrorMessage.tsx` - Mensajes de error con sugerencias
- `src/components/EmptyState.tsx` - Estados vacíos ilustrativos

**Documentación**:
- Actualizadas `src/pages/Guides.tsx` y `src/components/WhatIsLatidos.tsx` con nuevas funcionalidades

### 🔧 Archivos Modificados

**Componentes**:
- `src/components/ExperienceCard.tsx` - Badges de privacidad
- `src/components/Navbar.tsx` - Versión móvil completa
- `src/components/AppWrapper.tsx` - Integración de ScrollToTop
- `src/components/FloatingActionButton.tsx` - Texto "+ Historias"

**Páginas**:
- `src/pages/CreateExperience.tsx` - Spinners animados
- `src/pages/EditExperience.tsx` - Spinners animados
- `src/pages/Explore.tsx` - Empty state mejorado
- `src/pages/Guides.tsx` - Nuevas secciones documentadas
- `src/components/WhatIsLatidos.tsx` - Nuevas tarjetas de info

**Estilos**:
- `src/index.css` - Animaciones y transiciones CSS

### 🎨 Decisiones de Diseño

#### ¿Por qué badges de colores para privacidad?
- **Reconocimiento visual inmediato**: Usuarios identifican privacidad sin leer
- **Código de colores intuitivo**: Verde=público, Naranja=privado (estándar)
- **Consistencia**: Mismo sistema en todas las cards
- **Accesibilidad**: Icono + texto + color (triple redundancia)

#### ¿Por qué botón scroll-to-top en bottom-left?
- **No interfiere con FAB**: FAB está en bottom-right para acción primaria
- **Ergonomía móvil**: Fácil alcance con pulgar izquierdo
- **Menos frecuente**: Scroll-to-top es secundario vs crear historia
- **Estándar web**: Muchos sitios usan bottom-left para navegación secundaria

#### ¿Por qué animaciones sutiles y no vistosas?
- **Profesionalismo**: Animaciones suaves transmiten calidad
- **Performance**: Animaciones simples (opacity, transform) son GPU-accelerated
- **Accesibilidad**: Respeta `prefers-reduced-motion` del sistema
- **No distraen**: Mejoran sin llamar atención excesiva

#### ¿Por qué empty states con iconos grandes?
- **Guía visual**: Iconos ayudan a entender el contexto vacío
- **Menos frustrante**: Estado vacío se ve intencional, no como error
- **Call-to-action claro**: Botón destaca qué hacer a continuación
- **Tone positivo**: Texto motivador en lugar de negativo

### 🚀 Impacto en UX

**Antes de v3.6.0**:
- Cards sin indicadores de privacidad claros
- Necesidad de scroll manual en páginas largas
- Estados de carga poco informativos
- Estados vacíos básicos sin guía
- Navbar móvil sin iconos visibles

**Después de v3.6.0**:
- Badges de privacidad con código de colores universal
- Botón scroll-to-top accesible desde 300px de scroll
- Feedback visual claro con spinners animados
- Empty states guiados con acciones sugeridas
- Navbar móvil completamente funcional con iconos
- Animaciones sutiles en toda la aplicación
- Experiencia pulida y profesional

### 📊 Métricas de Calidad

- ✅ **100% responsive**: Todas las mejoras funcionan en móvil y desktop
- ✅ **Accesibilidad**: Iconos + texto, áreas táctiles optimizadas (min 40px)
- ✅ **Performance**: Animaciones GPU-accelerated, sin jank
- ✅ **Consistencia**: Diseño uniforme en toda la aplicación
- ✅ **Feedback inmediato**: Usuarios siempre saben qué está pasando

### 🎯 Estado Final v3.6.0
✅ Indicadores de privacidad visuales en todas las cards
✅ Botón scroll-to-top funcional
✅ Feedback visual mejorado en formularios
✅ Animaciones sutiles y profesionales
✅ Componente de errores con sugerencias
✅ Empty states ilustrativos y guiados
✅ Navegación móvil completa y optimizada
✅ Experiencia de usuario pulida y profesional

---

**Servidor de desarrollo**: http://localhost:8081
**Última actualización**: 26 Octubre 2025 - v3.6.0
**Estado**: ✅ Sistema Completo + UX Pulida + Optimizada Móvil - **PRODUCCIÓN READY**

---

**Fin del Historial del Proyecto**
