# Casos de Uso - Latidos

**Última actualización**: 22 Octubre 2025

---

## 🎯 Filosofía de la Aplicación

Latidos es una plataforma de **conexión humana auténtica** que se diferencia de las redes sociales tradicionales al enfocarse en compartir experiencias genuinas sin los elementos competitivos y algorítmicos que dominan otras plataformas.

---

## 🔄 Similitudes con Redes Sociales (Pero con Diferencias Clave)

### Lo que SÍ tenemos:
- ✅ Usuarios que interactúan mediante texto o audio
- ✅ Sistema de respuestas anidadas (estilo chat)
- ✅ Historias que se comparten
- ✅ Usuarios que reaccionan comentando
- ✅ Capacidad de compartir contenido con otros usuarios

### Lo que NO tenemos:
- ❌ "Likes" o sistemas de validación cuantitativa
- ❌ "Amigos" → Usamos **"Compartidos"**
- ❌ Algoritmos que priorizan contenido popular
- ❌ Métricas de popularidad visibles
- ❌ Competencia por engagement

---

## 👥 Sistema de "Compartidos"

### Concepto
Los **"Compartidos"** son personas con las que eliges conectar de forma genuina. No es una lista de amigos, es una red de confianza para compartir experiencias privadas.

### Características:
- Relación bidireccional (ambos deben aceptar)
- Permite acceso a historias privadas
- No hay límites artificiales
- Enfocado en calidad, no cantidad

### Acciones:
- Enviar solicitud para ser "Compartidos"
- Aceptar/rechazar solicitudes
- Eliminar relación de "Compartidos"
- Ver lista de tus "Compartidos"

---

## 📖 Sistema de Historias

### Tipos de Historias

#### 1. **Historias Públicas**
- Visibles para todos los usuarios (incluso no autenticados)
- Aparecen en la página "Explorar"
- Cualquiera puede comentar (si está autenticado)
- Se pueden compartir con otros usuarios
- **Deben tener al menos una etiqueta** para categorización

#### 2. **Historias Privadas**
- Solo visibles para:
  - El autor
  - Sus "Compartidos"
- No aparecen en "Explorar"
- Solo "Compartidos" pueden comentar
- Se pueden compartir con "Compartidos" específicos
- Etiquetas opcionales (para organización personal)

### 🏷️ Sistema de Etiquetas

#### Propósito:
- Organizar historias públicas de forma natural
- Permitir a usuarios encontrar contenido relevante
- Filtrar por temas de interés
- **Sin trending topics** (no hay competencia)
- **Sin popularidad visible** (evita sesgo)

#### Características:
- **Etiquetas predefinidas** (curadas por la plataforma)
- Los usuarios eligen de una lista existente
- Máximo 5 etiquetas por historia
- Mínimo 1 etiqueta para historias públicas

#### Ejemplos de Etiquetas:
```
Categorías principales:
- 🎨 Arte y Creatividad
- 🌍 Viajes y Aventuras
- 📚 Aprendizajes
- 💭 Reflexiones
- 🎭 Experiencias personales
- 🍳 Gastronomía
- 🏃 Deportes y Movimiento
- 🎵 Música
- 💼 Trabajo y Profesión
- 👨‍👩‍👧‍👦 Familia
- 💕 Relaciones
- 🌱 Crecimiento personal
- 🔧 Proyectos
- 🐾 Mascotas
- 📖 Lectura
- 🎬 Cine y Series
- 🎮 Videojuegos
- 🧘 Bienestar
- 🌿 Naturaleza
- 🏠 Hogar
```

#### Búsqueda y Filtrado:
- Filtrar por una o múltiples etiquetas
- Combinar etiquetas (AND/OR)
- Búsqueda de texto + filtro de etiquetas
- Ordenar por: Recientes / Comentadas

### Atributos de una Historia:
```typescript
{
  id: string;
  user_id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url?: string;
  audio_url?: string;           // NUEVO - Para audio
  is_public: boolean;            // NUEVO - Público/Privado
  tags?: string[];               // NUEVO - Etiquetas (IDs de tags)
  shared_with?: string[];        // NUEVO - IDs de usuarios con quienes se compartió
  created_at: timestamp;
  updated_at: timestamp;
}
```

---

## 💬 Sistema de Comentarios Anidados

### Características:
- **Respuestas anidadas** (tipo Reddit/YouTube)
- Múltiples niveles de profundidad
- Sin límite de caracteres (pero con recomendaciones)
- Soporte para texto y audio (futuro)

### Estructura:
```typescript
{
  id: string;
  experience_id: string;
  user_id: string;
  parent_comment_id?: string;    // NUEVO - Para anidar respuestas
  content: string;
  audio_url?: string;            // NUEVO - Comentario en audio
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Acciones:
- Comentar una historia
- Responder a un comentario (anidar)
- Editar propio comentario
- Eliminar propio comentario
- Ver comentarios en formato de hilo

---

## 🔊 Sistema de Audio (Futuro)

### Para Historias:
- Narrar tu historia en lugar de escribirla
- Combinar texto + audio
- Reproductor integrado

### Para Comentarios:
- Responder con mensajes de voz
- Conversaciones más naturales y humanas

---

## 🤝 Sistema de Compartir

### Compartir con "Compartidos":
1. Usuario ve una historia (pública o propia)
2. Click en "Compartir"
3. Selecciona uno o varios "Compartidos"
4. Opcionalmente añade un mensaje personal
5. Los "Compartidos" reciben notificación

### Tipos de Compartir:
- **Historia pública** → Cualquier "Compartido" puede verla
- **Historia privada** → Se añade permiso temporal a "Compartidos" seleccionados
- **Historia propia** → Control total sobre quién la ve

---

## 📱 Flujos de Usuario

### 1. Usuario Nuevo (No Autenticado)
```
1. Llega a homepage
2. Ve descripción de la plataforma
3. Ve historias públicas destacadas
4. Puede explorar todas las historias públicas
5. Para comentar/compartir → Debe registrarse
```

### 2. Usuario Registrado
```
1. Inicia sesión
2. Ve feed personalizado:
   - Historias públicas recientes
   - Historias de sus "Compartidos"
   - Historias compartidas con él
3. Puede crear historias (públicas/privadas)
4. Puede comentar y responder
5. Puede conectar con nuevos "Compartidos"
6. Puede compartir historias con sus "Compartidos"
```

### 3. Crear Historia
```
1. Click en "Compartir" (navbar)
2. Formulario:
   - Título
   - Extracto
   - Contenido
   - Imagen (opcional)
   - Audio (opcional, futuro)
   - Selector: Pública / Privada
   - Si pública: Seleccionar etiquetas (1-5 requerido)
   - Si privada: Etiquetas opcionales + Seleccionar "Compartidos" específicos
3. Guardar
4. Notificar a "Compartidos" si es privada
```

### 3.1. Explorar con Etiquetas
```
1. Usuario en página "Explorar"
2. Ve barra de etiquetas en la parte superior
3. Puede:
   - Click en una etiqueta → Filtra historias con esa etiqueta
   - Click en múltiples → Combina filtros (OR)
   - Búsqueda de texto + etiquetas → Filtro combinado
4. Historias se filtran en tiempo real
5. Contadores sutiles muestran "X historias encontradas" (no por etiqueta)
```

### 4. Comentar Historia
```
1. Usuario lee historia completa
2. Sección de comentarios al final
3. Ve comentarios existentes (anidados)
4. Puede responder:
   - A la historia (comentario principal)
   - A otro comentario (respuesta anidada)
5. Escribir texto o grabar audio (futuro)
6. Publicar comentario
```

### 5. Conectar con "Compartidos"
```
1. Usuario ve perfil de otro usuario
2. Botón "Agregar a Compartidos"
3. Envía solicitud (opcional con mensaje)
4. El otro usuario recibe notificación
5. Acepta/Rechaza
6. Si acepta → Ambos son "Compartidos"
7. Ahora pueden ver historias privadas del otro (si les comparten)
```

### 6. Compartir Historia
```
1. Usuario ve historia (propia o pública)
2. Botón "Compartir"
3. Modal con lista de "Compartidos"
4. Selecciona uno o varios
5. Mensaje opcional
6. Enviar
7. "Compartidos" reciben notificación
8. Historia aparece en su feed
```

---

## 🗄️ Modelo de Datos Necesario

### Nuevas Tablas:

#### 1. **tags** (Etiquetas)
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. **experience_tags** (Relación Historias-Etiquetas)
```sql
CREATE TABLE experience_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(experience_id, tag_id)
);
```

#### 3. **shared_connections** (Compartidos)
```sql
CREATE TABLE shared_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, shared_user_id)
);
```

#### 4. **experience_shares** (Historias Compartidas)
```sql
CREATE TABLE experience_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Modificaciones a Tablas Existentes:

#### **experiences** (Agregar campos)
```sql
ALTER TABLE experiences
ADD COLUMN is_public BOOLEAN DEFAULT true,
ADD COLUMN audio_url TEXT;
```

#### **comments** (Agregar campos)
```sql
ALTER TABLE comments
ADD COLUMN parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
ADD COLUMN audio_url TEXT;
```

---

## 🎨 Cambios de UI/UX Necesarios

### Terminología a Actualizar:
- ❌ "Amigos" → ✅ "Compartidos"
- ❌ "Seguir/Followers" → ✅ "Compartidos mutuos"
- ❌ "Me gusta" → ✅ (Eliminar, solo comentarios)

### Nuevos Componentes Necesarios:
1. **TagSelector** - Selector de etiquetas (multi-select con límite 5)
2. **TagBadge** - Badge individual de etiqueta con emoji
3. **TagFilterBar** - Barra de filtros de etiquetas en Explore
4. **SharedConnectionsList** - Lista de "Compartidos"
5. **ShareModal** - Modal para compartir historia
6. **CommentThread** - Comentarios anidados
7. **PrivacySelector** - Público/Privado al crear historia
8. **SharedWithBadge** - Indicador de historia compartida
9. **ConnectionRequestCard** - Solicitudes de "Compartidos"

### Nuevas Páginas:
1. **/compartidos** - Gestionar conexiones
2. **/compartidos/solicitudes** - Ver solicitudes pendientes
3. **/compartidas** - Historias compartidas contigo
4. **/etiquetas/:slug** - (Opcional) Ver historias de una etiqueta específica

---

## 🚀 Plan de Implementación Sugerido

### Fase 0: Sistema de Etiquetas (Prioridad Muy Alta - Base para organización)
1. ⏳ Crear tabla `tags`
2. ⏳ Crear tabla `experience_tags`
3. ⏳ Seed inicial con 20 etiquetas predefinidas
4. ⏳ Crear `TagService`
5. ⏳ Crear componente `TagSelector` (multi-select)
6. ⏳ Crear componente `TagBadge`
7. ⏳ Crear componente `TagFilterBar`
8. ⏳ Integrar en `CreateExperience` y `EditExperience`
9. ⏳ Integrar filtros en `Explore`
10. ⏳ Actualizar `ExperienceCard` para mostrar etiquetas

### Fase 1: Base de Comentarios Anidados (Prioridad Alta)
1. ⏳ Modificar tabla `comments` (agregar `parent_comment_id`)
2. ⏳ Actualizar `CommentService`
3. ⏳ Crear componente `CommentThread`
4. ⏳ Integrar en `ExperienceDetail`

### Fase 2: Sistema de "Compartidos" (Prioridad Alta)
1. ⏳ Crear tabla `shared_connections`
2. ⏳ Crear `SharedConnectionService`
3. ⏳ Crear página `/compartidos`
4. ⏳ Agregar botón "Agregar a Compartidos" en perfiles
5. ⏳ Sistema de solicitudes

### Fase 3: Historias Públicas/Privadas (Prioridad Alta)
1. ⏳ Modificar tabla `experiences` (agregar `is_public`)
2. ⏳ Actualizar formularios de creación/edición
3. ⏳ Filtrar historias en `Explore` (solo públicas)
4. ⏳ Crear feed privado para "Compartidos"

### Fase 4: Compartir Historias (Prioridad Media)
1. ⏳ Crear tabla `experience_shares`
2. ⏳ Crear `ShareService`
3. ⏳ Crear `ShareModal`
4. ⏳ Integrar en `ExperienceDetail`
5. ⏳ Crear página `/compartidas`

### Fase 5: Sistema de Audio (Prioridad Baja - Futuro)
1. ⏳ Storage bucket para audio
2. ⏳ Grabadora de audio en navegador
3. ⏳ Reproductor de audio
4. ⏳ Integrar en historias y comentarios

---

## 📊 Métricas de Éxito (Sin Competencia)

### Para el Usuario (Privadas):
- Número de "Compartidos" conectados
- Historias que has compartido
- Comentarios en tus historias
- Historias compartidas contigo

### Para la Plataforma (Analíticas Internas):
- Historias creadas (públicas/privadas)
- Interacciones genuinas (comentarios con sustancia)
- Conexiones de "Compartidos" activas
- Tiempo de lectura promedio

**IMPORTANTE**: Ninguna de estas métricas se muestra públicamente para evitar competencia.

---

## 🎯 Próximo Paso Inmediato

¿Por dónde quieres empezar?

1. **Fase 1**: Comentarios anidados (base para conversaciones)
2. **Fase 2**: Sistema de "Compartidos" (base para privacidad)
3. **Fase 3**: Historias públicas/privadas (privacidad de contenido)
4. **Refactor**: Actualizar terminología actual de la UI

**Recomendación**: Empezar por Fase 1 (comentarios) ya que es más independiente y visible para usuarios.

---

**Fin del Documento de Casos de Uso**
