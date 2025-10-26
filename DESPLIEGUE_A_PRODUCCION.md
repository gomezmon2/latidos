# Guía de Despliegue a Producción - Latidos

## 📋 Pre-requisitos

- [ ] Cuenta de Supabase (https://supabase.com)
- [ ] Cuenta de Vercel (https://vercel.com)
- [ ] Repositorio Git (GitHub, GitLab o Bitbucket)
- [ ] Node.js instalado localmente para pruebas

---

## 🗄️ Paso 1: Configurar Supabase (Base de Datos)

### 1.1 Crear Proyecto en Supabase

1. Ir a https://supabase.com/dashboard
2. Click en "New Project"
3. Configurar:
   - **Name**: latidos-production
   - **Database Password**: Generar contraseña segura (guardarla)
   - **Region**: Elegir más cercana a usuarios (ej: South America)
4. Esperar 2-3 minutos mientras se crea el proyecto

### 1.2 Ejecutar Scripts SQL

En el proyecto de Supabase, ir a **SQL Editor** y ejecutar los scripts en este orden:

1. **Schema inicial** (si no existe):
```sql
-- Copiar y ejecutar el contenido de tu script inicial de base de datos
-- Esto creará las tablas: profiles, stories, comments, etc.
```

2. **ADD_FAVORITES_SYSTEM.sql**:
   - Copiar todo el contenido del archivo
   - Pegar en SQL Editor
   - Click en "Run"

3. **ADD_TAGS_SYSTEM.sql**:
   - Copiar todo el contenido del archivo
   - Pegar en SQL Editor
   - Click en "Run"

4. **ADD_PRIVACY_SYSTEM.sql**:
   - Copiar todo el contenido del archivo
   - Pegar en SQL Editor
   - Click en "Run"

5. **ADD_CIRCLES_SYSTEM.sql**:
   - Copiar todo el contenido del archivo
   - Pegar en SQL Editor
   - Click en "Run"

6. **ADD_CHAT_SYSTEM.sql**:
   - Copiar todo el contenido del archivo
   - Pegar en SQL Editor
   - Click en "Run"

### 1.3 Configurar Storage para Imágenes

1. Ir a **Storage** en el panel de Supabase
2. Click en "New bucket"
3. Crear bucket:
   - **Name**: `avatars`
   - **Public**: ✅ Activado
   - Click "Create"

4. Configurar políticas de Storage:
   - Ir a **Storage** > **Policies** > `avatars`
   - Añadir política para subida:
     ```sql
     CREATE POLICY "Usuarios pueden subir su avatar"
     ON storage.objects
     FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
     ```
   - Añadir política para lectura pública:
     ```sql
     CREATE POLICY "Avatares públicos"
     ON storage.objects
     FOR SELECT
     TO public
     USING (bucket_id = 'avatars');
     ```

### 1.4 Configurar Autenticación

1. Ir a **Authentication** > **Providers**
2. Configurar **Email**:
   - ✅ Enable Email provider
   - ✅ Confirm email (activado)
   - Email templates: Personalizar si deseas

3. Configurar **URL Configuration**:
   - Ir a **Authentication** > **URL Configuration**
   - **Site URL**: `https://tu-dominio.vercel.app` (lo obtendrás después de desplegar)
   - **Redirect URLs**: Añadir:
     - `https://tu-dominio.vercel.app/**`
     - `http://localhost:8081/**` (para desarrollo)

### 1.5 Obtener Credenciales

1. Ir a **Settings** > **API**
2. Copiar y guardar:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🚀 Paso 2: Desplegar Frontend en Vercel

### 2.1 Preparar Repositorio

1. Asegurarte de que el código esté en un repositorio Git
2. Hacer commit de todos los cambios:
```bash
git add .
git commit -m "Preparar para producción"
git push origin main
```

### 2.2 Conectar Vercel con el Repositorio

1. Ir a https://vercel.com/dashboard
2. Click en "Add New..." > "Project"
3. Importar tu repositorio de Git
4. Seleccionar el repositorio `latidos`

### 2.3 Configurar Variables de Entorno

En la sección "Environment Variables", añadir:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Tu Project URL de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Tu anon public key de Supabase |

### 2.4 Configurar Build

Vercel debería detectar automáticamente:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.5 Desplegar

1. Click en "Deploy"
2. Esperar 2-3 minutos
3. Vercel te dará una URL: `https://latidos-xxxxx.vercel.app`

---

## 🔧 Paso 3: Configuraciones Post-Despliegue

### 3.1 Actualizar URLs en Supabase

1. Volver a Supabase
2. Ir a **Authentication** > **URL Configuration**
3. Actualizar **Site URL** con la URL real de Vercel: `https://latidos-xxxxx.vercel.app`
4. Verificar que las **Redirect URLs** incluyan: `https://latidos-xxxxx.vercel.app/**`

### 3.2 Probar la Aplicación

1. Abrir `https://latidos-xxxxx.vercel.app`
2. Probar flujo completo:
   - [ ] Registro de nuevo usuario
   - [ ] Confirmación de email
   - [ ] Login
   - [ ] Crear historia
   - [ ] Subir imagen de perfil
   - [ ] Añadir compartido
   - [ ] Enviar mensaje de chat
   - [ ] Crear círculo
   - [ ] Cambiar privacidad de historia

---

## 🌐 Paso 4: Dominio Personalizado (Opcional)

### 4.1 Configurar Dominio en Vercel

1. En Vercel, ir a tu proyecto > **Settings** > **Domains**
2. Click en "Add"
3. Ingresar tu dominio: `latidos.com` o `www.latidos.com`
4. Vercel te dará instrucciones DNS

### 4.2 Configurar DNS

En tu proveedor de dominios (GoDaddy, Namecheap, etc):

**Para dominio raíz** (`latidos.com`):
- Tipo: `A`
- Name: `@`
- Value: `76.76.21.21`

**Para www** (`www.latidos.com`):
- Tipo: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### 4.3 Actualizar URLs en Supabase

1. Ir a Supabase > **Authentication** > **URL Configuration**
2. Actualizar **Site URL**: `https://latidos.com`
3. Añadir a **Redirect URLs**: `https://latidos.com/**`

---

## 🔒 Paso 5: Seguridad y Optimizaciones

### 5.1 Verificar RLS (Row Level Security)

En Supabase SQL Editor:

```sql
-- Verificar que todas las tablas tienen RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

Todas las tablas deben tener `rowsecurity = true`

### 5.2 Revisar Políticas de Seguridad

```sql
-- Listar todas las políticas
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

Verificar que cada tabla tenga políticas apropiadas.

### 5.3 Configurar Rate Limiting (Opcional)

En Supabase:
1. Ir a **Settings** > **API**
2. Configurar límites de rate limiting según necesidades

---

## 📊 Paso 6: Monitoreo

### 6.1 Vercel Analytics

1. En Vercel, ir a tu proyecto > **Analytics**
2. Activar Vercel Analytics para ver métricas de uso

### 6.2 Supabase Logs

1. En Supabase, ir a **Logs**
2. Revisar periódicamente:
   - **API Logs**: Peticiones a la base de datos
   - **Auth Logs**: Intentos de login/registro
   - **Realtime Logs**: Conexiones de chat

---

## ✅ Checklist Final

Antes de considerar el despliegue completo:

- [ ] Base de datos creada y todos los scripts SQL ejecutados
- [ ] Storage configurado con políticas correctas
- [ ] Variables de entorno configuradas en Vercel
- [ ] Aplicación desplegada y accesible
- [ ] URLs de autenticación actualizadas en Supabase
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Subida de imágenes funciona
- [ ] Chat en tiempo real funciona
- [ ] Sistema de compartidos funciona
- [ ] Círculos funcionan
- [ ] Privacidad funciona
- [ ] Favoritos funcionan
- [ ] RLS verificado en todas las tablas
- [ ] Monitoreo configurado

---

## 🆘 Solución de Problemas Comunes

### Error: "Invalid API Key"
- Verificar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctas en Vercel
- Redesplegar después de cambiar variables de entorno

### Error: "Email not confirmed"
- Verificar que el usuario haya confirmado su email
- Revisar configuración SMTP en Supabase si emails no llegan

### Chat no funciona en tiempo real
- Verificar que Realtime esté habilitado en tabla `messages`
- Ir a Supabase > Database > Replication > tabla `messages` > activar

### Imágenes no se suben
- Verificar políticas de Storage en bucket `avatars`
- Confirmar que el bucket sea público

### Redirect después de login falla
- Verificar que la URL esté en **Redirect URLs** de Supabase
- Formato correcto: `https://dominio.com/**` (con `/**` al final)

---

## 💻 Comandos de Terminal para Publicar

### Opción 1: Despliegue Automático (Recomendado)

Vercel detecta automáticamente los cambios en tu rama principal. Solo necesitas:

```bash
# 1. Asegurarte de estar en la rama correcta
git checkout main

# 2. Verificar el estado de tus cambios
git status

# 3. Añadir todos los cambios
git add .

# 4. Crear commit con mensaje descriptivo
git commit -m "feat: preparar versión v3.3.0 para producción"

# 5. Subir a repositorio remoto (esto dispara el despliegue automático)
git push origin main
```

Vercel iniciará el despliegue automáticamente. Puedes ver el progreso en: https://vercel.com/dashboard

---

### Opción 2: Despliegue Manual con Vercel CLI

Si prefieres control total desde la terminal:

#### Instalación de Vercel CLI

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Verificar instalación
vercel --version
```

#### Primer Despliegue

```bash
# 1. Ir a la carpeta del proyecto
cd c:\Desarrollos\latidos

# 2. Login en Vercel (abrirá el navegador)
vercel login

# 3. Desplegar a producción
vercel --prod

# Responder a las preguntas:
# - Set up and deploy? Y
# - Which scope? [Tu cuenta]
# - Link to existing project? N
# - What's your project's name? latidos
# - In which directory is your code located? ./
# - Want to override settings? N
```

#### Despliegues Posteriores

```bash
# Desplegar última versión a producción
vercel --prod

# O simplemente
vercel
```

---

### Opción 3: Comandos Completos Paso a Paso

```bash
# ==========================================
# PREPARACIÓN DEL CÓDIGO
# ==========================================

# 1. Verificar que no haya errores de TypeScript
npm run build

# 2. Probar localmente antes de desplegar
npm run dev
# Abrir http://localhost:8081 y probar

# 3. Detener el servidor local (Ctrl+C)

# ==========================================
# CONTROL DE VERSIONES
# ==========================================

# 4. Crear tag de versión
git tag -a v3.3.0 -m "Release v3.3.0: Sistema de mensajería en tiempo real"

# 5. Ver estado de cambios
git status

# 6. Añadir todos los archivos modificados
git add .

# 7. Commit de la versión
git commit -m "release: v3.3.0 - Sistema de chat completo

- Implementado sistema de mensajería en tiempo real
- Chat entre compartidos aceptados
- Notificaciones de mensajes no leídos
- UI completa con Chats y ChatWindow
- Documentación actualizada
- Tooltips en navegación
- Todos los bugs corregidos"

# 8. Subir commits a repositorio
git push origin main

# 9. Subir tags
git push origin --tags

# ==========================================
# DESPLIEGUE A VERCEL
# ==========================================

# 10. Desplegar a producción con Vercel CLI
vercel --prod

# O dejar que Vercel despliegue automáticamente desde GitHub
# (si tienes integración configurada)
```

---

### Verificación Post-Despliegue

```bash
# Ver logs de despliegue en Vercel
vercel logs

# Ver última URL de producción
vercel ls

# Abrir proyecto en dashboard de Vercel
vercel open
```

---

### Comandos Útiles de Mantenimiento

```bash
# Ver todas las ramas
git branch -a

# Crear rama de desarrollo
git checkout -b development

# Volver a main
git checkout main

# Ver historial de commits
git log --oneline -10

# Ver diferencias antes de commit
git diff

# Ver estado del repositorio
git status

# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Limpiar archivos no trackeados
git clean -fd

# Actualizar desde remoto
git pull origin main
```

---

### Scripts npm Disponibles

```bash
# Desarrollo local
npm run dev              # Inicia servidor en localhost:8081

# Build para producción
npm run build            # Compila proyecto en carpeta /dist

# Preview del build
npm run preview          # Previsualiza el build localmente

# Linting
npm run lint             # Verifica errores de código

# Type checking
npm run type-check       # Verifica tipos TypeScript
```

---

### Workflow Recomendado para Futuras Actualizaciones

```bash
# 1. Hacer cambios en código
# 2. Probar localmente
npm run dev

# 3. Build y verificar
npm run build

# 4. Commit y push
git add .
git commit -m "feat: descripción del cambio"
git push origin main

# 5. Vercel despliega automáticamente
# 6. Verificar en https://tu-dominio.vercel.app
```

---

## 📞 Soporte

- **Documentación Supabase**: https://supabase.com/docs
- **Documentación Vercel**: https://vercel.com/docs
- **Documentación Vercel CLI**: https://vercel.com/docs/cli
- **Issues del proyecto**: [Crear en tu repositorio]

---

**¡Felicidades! Tu aplicación Latidos está en producción 🎉**
