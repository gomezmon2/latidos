# 🔒 Instrucciones: Sistema de Privacidad

## 📋 Resumen

Se ha implementado un **Sistema de Privacidad** que permite a los usuarios elegir si sus historias son:

- **Públicas** 🌍: Visibles para todos en Explorar
- **Privadas** 🔒: Visibles solo para el autor y sus "Compartidos" (conexiones aceptadas)

---

## 🚀 Instalación

### Paso 1: Ejecutar Script SQL

1. Abre **Supabase Dashboard**
2. Ve a **SQL Editor** (menú lateral izquierdo)
3. Haz clic en **"New query"**
4. Abre el archivo `ADD_PRIVACY_SYSTEM.sql` en tu editor
5. Copia **todo el contenido** del archivo
6. Pégalo en el editor SQL de Supabase
7. Haz clic en **"Run"** (o presiona Ctrl+Enter / Cmd+Enter)
8. Verifica que aparezca: **"Success. No rows returned"**

### Paso 2: Verificar la Instalación

Ejecuta esta consulta para verificar que el campo se agregó correctamente:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'experiences' AND column_name = 'is_public';
```

Deberías ver:

| column_name | data_type | column_default |
|-------------|-----------|----------------|
| is_public   | boolean   | true           |

---

## 📊 ¿Qué se Instaló?

### 1. Campo en Base de Datos

- **Campo**: `is_public` (BOOLEAN)
- **Tabla**: `experiences`
- **Default**: `TRUE` (todas las historias existentes son públicas por defecto)

### 2. Índices de Optimización

- `idx_experiences_is_public`: Para filtrar por privacidad
- `idx_experiences_public_created`: Para ordenar historias públicas por fecha

### 3. Políticas RLS (Row Level Security)

#### Política 1: Historias Públicas
```sql
"Anyone can view public experiences"
```
Todos pueden ver historias con `is_public = true`

#### Política 2: Historias Privadas Propias
```sql
"Users can view their own private experiences"
```
Usuarios pueden ver sus propias historias privadas

#### Política 3: Historias Privadas de Compartidos
```sql
"Users can view private experiences from connections"
```
Usuarios pueden ver historias privadas de usuarios con los que tienen conexión aceptada

### 4. Funciones Helper

#### `can_view_experience(experience_id, user_id)`
Verifica si un usuario puede ver una experiencia específica.

```sql
SELECT can_view_experience('uuid-historia', auth.uid());
-- Retorna TRUE o FALSE
```

#### `count_public_experiences(user_id)`
Cuenta cuántas historias públicas tiene un usuario.

```sql
SELECT count_public_experiences('uuid-usuario');
-- Retorna número entero
```

#### `count_private_experiences(user_id)`
Cuenta cuántas historias privadas tiene un usuario.

```sql
SELECT count_private_experiences('uuid-usuario');
-- Retorna número entero
```

---

## 🎨 Cambios en la UI

### CreateExperience.tsx
- ✅ Selector de privacidad con radio buttons (Pública/Privada)
- ✅ Iconos visuales (Globe/Lock)
- ✅ Descripciones claras para cada opción
- ✅ Default: Pública

### EditExperience.tsx
- ✅ Mismo selector de privacidad
- ✅ Carga el estado actual de privacidad de la historia
- ✅ Permite cambiar entre pública/privada al editar

### Types (experience.ts)
- ✅ Campo `is_public` agregado a interfaces:
  - `Experience`
  - `CreateExperienceDTO`
  - `UpdateExperienceDTO`
  - `ExperienceWithAuthor`

---

## 🧪 Cómo Probar

### 1. Crear Historia Privada

1. Ve a **"Comparte tu historia"** (`/create`)
2. Llena el formulario
3. En **"Privacidad"**, selecciona **"Privada"**
4. Publica la historia
5. Verifica que NO aparece en **"Explorar"** cuando cierras sesión

### 2. Verificar Acceso de Compartidos

1. **Usuario A**: Crea historia privada
2. **Usuario B**: Se conecta con Usuario A
3. **Usuario A**: Acepta la conexión
4. **Usuario B**: Ahora puede ver la historia privada de Usuario A en su feed/detalle
5. **Usuario C** (no conectado): NO puede ver la historia privada

### 3. Cambiar Privacidad de Historia Existente

1. Edita una historia existente (`/experience/:id/edit`)
2. Cambia de **"Pública"** a **"Privada"**
3. Guarda cambios
4. Verifica que la historia desaparece de Explorar (si no eres el autor)

---

## 🔍 Consultas Útiles

### Ver todas las historias privadas
```sql
SELECT id, title, user_id, is_public
FROM public.experiences
WHERE is_public = false;
```

### Ver políticas activas
```sql
SELECT policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'experiences';
```

### Probar acceso de un usuario a una historia
```sql
-- Reemplaza los UUIDs con valores reales
SELECT can_view_experience(
  'uuid-de-la-historia',
  'uuid-del-usuario'
);
```

---

## ⚠️ Notas Importantes

1. **Historias Existentes**: Todas las historias existentes se marcarán como **públicas** por defecto (`is_public = true`)

2. **Compatibilidad Retroactiva**: El sistema es completamente compatible con historias antiguas que no tenían este campo

3. **RLS Automático**: Las políticas de seguridad se aplican automáticamente. No necesitas cambiar código de frontend para filtrar manualmente.

4. **Performance**: Los índices aseguran que las queries de historias públicas/privadas sean rápidas incluso con miles de registros

5. **Vista `experiences_with_author`**: Se actualizó automáticamente para incluir el campo `is_public`

---

## 🐛 Rollback (Si es Necesario)

Si necesitas revertir los cambios, ejecuta esto en SQL Editor:

```sql
-- ⚠️ CUIDADO: Esto eliminará el campo y todas las políticas nuevas

DROP POLICY IF EXISTS "Anyone can view public experiences" ON public.experiences;
DROP POLICY IF EXISTS "Users can view their own private experiences" ON public.experiences;
DROP POLICY IF EXISTS "Users can view private experiences from connections" ON public.experiences;
DROP FUNCTION IF EXISTS can_view_experience(UUID, UUID);
DROP FUNCTION IF EXISTS count_public_experiences(UUID);
DROP FUNCTION IF EXISTS count_private_experiences(UUID);
DROP INDEX IF EXISTS idx_experiences_is_public;
DROP INDEX IF EXISTS idx_experiences_public_created;
ALTER TABLE public.experiences DROP COLUMN IF EXISTS is_public;

-- Recrear política antigua (todo público)
CREATE POLICY "Anyone can view experiences"
ON public.experiences FOR SELECT
USING (true);
```

---

## ✅ Checklist de Instalación

- [ ] Ejecutado `ADD_PRIVACY_SYSTEM.sql` en Supabase
- [ ] Verificado que el campo `is_public` existe en la tabla `experiences`
- [ ] Verificado que se crearon 2 índices
- [ ] Verificado que se crearon 3 políticas RLS
- [ ] Verificado que se crearon 3 funciones helper
- [ ] Probado crear historia privada
- [ ] Probado que historias privadas no aparecen en Explorar
- [ ] Probado que compartidos pueden ver historias privadas
- [ ] Probado editar privacidad de historia existente

---

## 🎯 Próximas Mejoras (Opcional)

1. **Indicador Visual**: Agregar badge de "Privada" en tarjetas/detalle
2. **Filtros**: Permitir filtrar "Mis historias públicas" vs "Mis historias privadas" en Profile
3. **Notificaciones**: Avisar cuando un compartido comparte una historia privada
4. **Estadísticas**: Mostrar en perfil cuántas historias públicas/privadas tiene el usuario

---

## 📞 Soporte

Si encuentras algún error durante la instalación:

1. Verifica que tienes permisos de administrador en Supabase
2. Revisa que la tabla `experiences` y `shared_connections` existen
3. Chequea que RLS está habilitado en la tabla `experiences`
4. Consulta los logs de error en Supabase Dashboard → Logs

---

**¡Listo!** 🎉 El sistema de privacidad está instalado y funcionando.
