# Instrucciones: Implementar Comentarios Anidados

**Fecha**: 22 Octubre 2025
**Estado**: ✅ Código listo - Solo falta ejecutar SQL

---

## 🎯 ¿Qué se ha implementado?

Sistema completo de comentarios anidados (hilos de conversación) que permite:

- ✅ Comentarios principales en historias
- ✅ Respuestas a comentarios (múltiples niveles)
- ✅ Editar y eliminar comentarios propios
- ✅ Vista de árbol recursivo (tipo Reddit)
- ✅ Contador de respuestas por comentario
- ✅ Colapsar/expandir hilos
- ✅ Límite de 5 niveles de profundidad
- ✅ Eliminación en cascada (si eliminas un comentario, se eliminan todas sus respuestas)

---

## 📋 Paso 1: Ejecutar Script SQL en Supabase

**IMPORTANTE**: Este es el único paso manual que necesitas hacer.

### 1.1. Abre el SQL Editor de Supabase

Ve a: https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu/sql/new

### 1.2. Copia y pega el script

Abre el archivo `ADD_NESTED_COMMENTS.sql` (está en la raíz del proyecto) y copia TODO su contenido.

### 1.3. Ejecuta el script

Click en el botón **"Run"** (o presiona Ctrl+Enter).

### 1.4. Verifica que se ejecutó correctamente

Deberías ver un mensaje de éxito. El script hace lo siguiente:

1. ✅ Agrega columna `parent_comment_id` a tabla `comments`
2. ✅ Crea índices para mejorar performance
3. ✅ Crea funciones SQL recursivas para queries
4. ✅ Actualiza políticas RLS
5. ✅ Refresca el schema cache

### 1.5. Espera 10-15 segundos

Supabase necesita un momento para procesar los cambios y refrescar el cache.

---

## 📂 Archivos Creados/Modificados

### ✅ Nuevos Archivos

1. **ADD_NESTED_COMMENTS.sql** - Script SQL para Supabase
2. **src/components/CommentItem.tsx** - Componente para cada comentario individual
3. **src/components/CommentThread.tsx** - Componente principal con árbol de comentarios
4. **INSTRUCCIONES_COMENTARIOS_ANIDADOS.md** - Este documento

### ✅ Archivos Modificados

1. **src/types/comment.ts** - Agregados tipos:
   - `parent_comment_id` en `Comment`
   - Interface `CommentWithReplies` para árbol
   - `parent_comment_id` opcional en `CreateCommentDTO`

2. **src/services/comment.service.ts** - Agregados métodos:
   - `getCommentsTree()` - Obtiene comentarios en estructura de árbol
   - `getReplies()` - Obtiene respuestas de un comentario
   - `getReplyCount()` - Cuenta respuestas directas
   - Actualizado `createComment()` para soportar `parent_comment_id`

3. **src/pages/ExperienceDetail.tsx** - Reemplazado:
   - Eliminados componentes antiguos `CommentForm` y `CommentList`
   - Integrado nuevo `CommentThread`

---

## 🎨 Características de la UI

### Comentario Principal
```
┌─────────────────────────────────────────┐
│ [👤] Juan Pérez · hace 2 horas          │
│                                         │
│ Este es un comentario principal         │
│                                         │
│ [Responder] [2 respuestas]              │
│ [Editar] [Eliminar]  ← Solo si es tuyo │
└─────────────────────────────────────────┘
```

### Con Respuestas Anidadas
```
┌─────────────────────────────────────────┐
│ [👤] Juan Pérez · hace 2 horas          │
│ Comentario principal                    │
│ [Responder] [Ocultar 2 respuestas]      │
│                                         │
│   ├─ [👤] María · hace 1 hora           │
│   │  Primera respuesta                  │
│   │  [Responder]                        │
│   │                                     │
│   │  └─ [👤] Pedro · hace 30 min        │
│   │     Respuesta a María               │
│   │     [Responder]                     │
└─────────────────────────────────────────┘
```

### Botones Contextuales

- **Responder**: Aparece si estás autenticado y no has alcanzado el límite de profundidad
- **Ver/Ocultar X respuestas**: Solo si el comentario tiene respuestas
- **Editar**: Solo para el autor del comentario
- **Eliminar**: Solo para el autor (pide confirmación)

---

## 🧪 Cómo Probar

### Test 1: Comentario Principal

1. Abre una historia
2. Scroll hasta la sección de comentarios
3. Escribe un comentario en el campo principal
4. Click "Publicar comentario"
5. ✅ Verifica que aparece inmediatamente

### Test 2: Respuesta a Comentario

1. En un comentario existente, click "Responder"
2. Aparece un formulario debajo del comentario
3. Escribe tu respuesta
4. Click "Responder"
5. ✅ Verifica que la respuesta aparece indentada

### Test 3: Respuesta a Respuesta (Nivel 2)

1. En una respuesta, click "Responder"
2. Escribe otra respuesta
3. Click "Responder"
4. ✅ Verifica que hay 2 niveles de indentación

### Test 4: Editar Comentario

1. En TU comentario, click "Editar"
2. Cambia el texto
3. Click "Guardar"
4. ✅ Verifica que el texto se actualiza
5. ✅ Verifica que aparece "(editado)"

### Test 5: Eliminar Comentario con Respuestas

1. En TU comentario que tenga respuestas, click "Eliminar"
2. Confirma en el diálogo
3. ✅ Verifica que se elimina el comentario Y todas sus respuestas

### Test 6: Colapsar/Expandir Hilos

1. Click en "Ocultar X respuestas" en un comentario con respuestas
2. ✅ Verifica que las respuestas se ocultan
3. Click en "Ver X respuestas"
4. ✅ Verifica que las respuestas vuelven a aparecer

### Test 7: Límite de Profundidad

1. Crea comentarios anidados hasta 5 niveles
2. ✅ Verifica que en el nivel 5 NO aparece el botón "Responder"
3. ✅ Esto previene problemas de UI con demasiada indentación

---

## 🔍 Verificación en Base de Datos

### Ver la nueva columna

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'comments'
AND column_name = 'parent_comment_id';
```

Resultado esperado:
```
column_name         | data_type | is_nullable
parent_comment_id   | uuid      | YES
```

### Ver comentarios con su jerarquía

```sql
SELECT
  c.id,
  c.content,
  c.parent_comment_id,
  c.created_at,
  p.full_name as author
FROM public.comments c
LEFT JOIN public.profiles p ON c.user_id = p.id
ORDER BY c.created_at ASC;
```

### Ver árbol de comentarios de una historia

```sql
WITH RECURSIVE comment_tree AS (
  -- Comentarios principales
  SELECT
    c.*,
    0 as depth,
    ARRAY[c.created_at] as path
  FROM public.comments c
  WHERE c.experience_id = 'TU_EXPERIENCE_ID'
  AND c.parent_comment_id IS NULL

  UNION ALL

  -- Respuestas recursivas
  SELECT
    c.*,
    ct.depth + 1,
    ct.path || c.created_at
  FROM public.comments c
  INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
)
SELECT
  REPEAT('  ', depth) || content as indented_content,
  depth
FROM comment_tree
ORDER BY path;
```

---

## 📊 Estructura de Datos

### Tabla Comments (Actualizada)

```sql
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- ← NUEVO
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Ejemplo de Datos

```
id: abc-123
experience_id: exp-1
user_id: user-1
parent_comment_id: NULL           ← Comentario principal
content: "Me encantó esta historia"

id: def-456
experience_id: exp-1
user_id: user-2
parent_comment_id: abc-123        ← Respuesta al comentario principal
content: "Totalmente de acuerdo!"

id: ghi-789
experience_id: exp-1
user_id: user-1
parent_comment_id: def-456        ← Respuesta a la respuesta
content: "Gracias por tu comentario"
```

---

## 🚀 Ventajas de la Implementación

### Performance

- ✅ Índices optimizados para queries recursivas
- ✅ Una sola query para cargar todo el árbol
- ✅ Cache en cliente para evitar recargas innecesarias

### UX

- ✅ Formularios inline (no modales)
- ✅ Feedback inmediato (toast notifications)
- ✅ Estados de carga claros
- ✅ Confirmaciones para acciones destructivas

### Seguridad

- ✅ RLS policies mantienen seguridad
- ✅ Verificación de ownership antes de editar/eliminar
- ✅ Redirección a login si no autenticado

### Escalabilidad

- ✅ Soporte para miles de comentarios
- ✅ Límite de profundidad previene abuso
- ✅ Cascade delete automático
- ✅ Funciones SQL reutilizables

---

## ⚠️ Consideraciones Importantes

### 1. Eliminación en Cascada

Cuando eliminas un comentario con respuestas:
- Se elimina el comentario padre
- Se eliminan TODAS las respuestas (cualquier nivel)
- Esto es por diseño (ON DELETE CASCADE)
- Se muestra advertencia al usuario

### 2. Límite de Profundidad

- Máximo 5 niveles de anidación
- Previene problemas de UI en pantallas pequeñas
- Configurable en `CommentItem.tsx` (variable `maxDepth`)

### 3. Performance

Con muchos comentarios (>100):
- Considera implementar paginación
- O "cargar más respuestas" en demanda
- Actualmente carga todo el árbol de una vez

---

## 🐛 Troubleshooting

### Error: "column parent_comment_id does not exist"

**Causa**: No ejecutaste el script SQL

**Solución**: Ve a Supabase SQL Editor y ejecuta `ADD_NESTED_COMMENTS.sql`

### Error: "Could not find relationship"

**Causa**: Schema cache de Supabase no se refrescó

**Solución**:
1. Espera 15 segundos
2. O ejecuta manualmente: `NOTIFY pgrst, 'reload schema';`

### Los comentarios no se muestran anidados

**Causa**: Datos antiguos sin `parent_comment_id`

**Solución**: Los comentarios antiguos aparecerán como principales (es correcto). Los nuevos comentarios ya usarán el nuevo sistema.

### Botón "Responder" no aparece

**Verifica**:
1. ¿Estás autenticado? Solo usuarios autenticados pueden responder
2. ¿Estás en el nivel 5? El límite de profundidad previene más respuestas

---

## 📚 Documentación Adicional

### Archivos Relacionados

- [CONTEXTO_PROYECTO.md](CONTEXTO_PROYECTO.md) - Contexto general
- [CASOS_DE_USO.md](CASOS_DE_USO.md) - Fase 1: Comentarios Anidados
- [ADD_NESTED_COMMENTS.sql](ADD_NESTED_COMMENTS.sql) - Script SQL

### Referencias

- [Supabase Recursive Queries](https://supabase.com/docs/guides/database/recursive-queries)
- [PostgreSQL Recursive CTE](https://www.postgresql.org/docs/current/queries-with.html)

---

## ✅ Checklist Final

Antes de probar:

- [ ] Script SQL ejecutado en Supabase
- [ ] Esperado 15 segundos después de ejecutar
- [ ] Aplicación corriendo (`npm run dev`)
- [ ] Usuario autenticado
- [ ] Historia con comentarios existentes para probar

---

## 🎉 ¡Listo para Probar!

Una vez ejecutes el script SQL, el sistema de comentarios anidados estará completamente funcional.

**Próximos pasos sugeridos**:
1. Ejecutar el script SQL ahora
2. Probar todas las funcionalidades
3. Avanzar a Fase 2: Sistema de "Compartidos"

---

**Última actualización**: 22 Octubre 2025
**Estado**: ✅ Código completo - Esperando ejecución de SQL
