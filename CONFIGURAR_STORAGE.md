# Configurar Supabase Storage para Imágenes

Esta guía te ayudará a configurar el almacenamiento de imágenes en Supabase.

---

## 📦 Paso 1: Crear un Bucket para Imágenes

1. **Ve a Supabase Storage**:
   https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu/storage/buckets

2. **Click en "New bucket"** (botón verde)

3. **Configuración del bucket**:
   - **Name**: `experience-images`
   - **Public bucket**: ✅ **Activar** (para que las imágenes sean públicas)
   - **File size limit**: 5 MB (o el que prefieras)
   - **Allowed MIME types**: Dejar vacío (permite todos los tipos de imagen)

4. **Click en "Create bucket"**

---

## 🔒 Paso 2: Configurar Políticas de Acceso (RLS)

### Opción A: SQL Rápido (Recomendado)

Ve al SQL Editor:
https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu/sql/new

Ejecuta este SQL:

```sql
-- Permitir que todos puedan ver las imágenes
CREATE POLICY "Las imágenes son públicas para lectura"
ON storage.objects FOR SELECT
USING (bucket_id = 'experience-images');

-- Permitir que usuarios autenticados suban imágenes
CREATE POLICY "Usuarios autenticados pueden subir imágenes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'experience-images'
  AND auth.role() = 'authenticated'
);

-- Permitir que usuarios eliminen sus propias imágenes
CREATE POLICY "Usuarios pueden eliminar sus propias imágenes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'experience-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Opción B: Interfaz Visual

1. Ve a **Storage** → **Policies**
2. Click en **"New policy"**
3. Configura 3 políticas:

**Política 1: Lectura pública**
- Operation: SELECT
- Policy name: "public_read"
- Policy definition:
  ```sql
  bucket_id = 'experience-images'
  ```

**Política 2: Subida autenticada**
- Operation: INSERT
- Policy name: "authenticated_upload"
- Policy definition:
  ```sql
  bucket_id = 'experience-images' AND auth.role() = 'authenticated'
  ```

**Política 3: Eliminación propia**
- Operation: DELETE
- Policy name: "own_delete"
- Policy definition:
  ```sql
  bucket_id = 'experience-images' AND auth.uid()::text = (storage.foldername(name))[1]
  ```

---

## ✅ Paso 3: Verificar Configuración

Ejecuta este SQL para verificar:

```sql
-- Ver buckets
SELECT * FROM storage.buckets WHERE name = 'experience-images';

-- Ver políticas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

Deberías ver:
- ✅ 1 bucket llamado `experience-images`
- ✅ 3 políticas de RLS

---

## 📋 Estructura de Carpetas

Las imágenes se organizarán así:
```
experience-images/
├── {user-id}/
│   ├── {uuid-1}.jpg
│   ├── {uuid-2}.png
│   └── {uuid-3}.webp
```

Cada usuario tiene su propia carpeta con su `user_id`.

---

## 🔗 URLs de Imágenes

Después de subir una imagen, la URL será:
```
https://jljeegojtkblsdhzuisu.supabase.co/storage/v1/object/public/experience-images/{user-id}/{filename}
```

Ejemplo:
```
https://jljeegojtkblsdhzuisu.supabase.co/storage/v1/object/public/experience-images/abc123/photo.jpg
```

---

## 🎯 Límites Recomendados

Para evitar abuso:

1. **Tamaño máximo por archivo**: 5 MB
2. **Formatos permitidos**:
   - ✅ JPG/JPEG
   - ✅ PNG
   - ✅ WebP
   - ✅ GIF
   - ❌ No videos grandes
3. **Cantidad**: Sin límite (pero puedes agregar uno después)

---

## ⚙️ Configuración Adicional (Opcional)

### Limitar Tipos de Archivo

Si quieres limitar solo a imágenes:

```sql
-- Crear política adicional para validar tipo de archivo
CREATE POLICY "Solo imágenes permitidas"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'experience-images'
  AND (storage.extension(name) = ANY(ARRAY['jpg', 'jpeg', 'png', 'webp', 'gif']))
);
```

### Limitar Tamaño de Archivo

En el código TypeScript (no en Supabase), validaremos que los archivos sean < 5MB.

---

## 🆘 Solución de Problemas

### Error: "new row violates row-level security policy"

**Causa**: Las políticas RLS no están configuradas correctamente.

**Solución**: Ejecuta el SQL del Paso 2.

### Error: "Bucket not found"

**Causa**: El bucket no existe o el nombre es incorrecto.

**Solución**: Verifica que el bucket se llame exactamente `experience-images`.

### Error: "File size too large"

**Causa**: El archivo supera el límite configurado.

**Solución**:
- Aumenta el límite en la configuración del bucket
- O comprime la imagen antes de subirla

---

## ✅ Checklist Final

Antes de continuar, verifica:

- [ ] Bucket `experience-images` creado
- [ ] Bucket configurado como **público**
- [ ] 3 políticas RLS creadas
- [ ] Políticas verificadas con SQL

---

**Una vez completado esto, avísame y continuamos con el código de subida de imágenes.**
