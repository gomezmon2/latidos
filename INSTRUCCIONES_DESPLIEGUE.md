# 🚀 Instrucciones de Despliegue - Momentos Auténticos

## Preparación Completada ✅

- ✅ Build de producción verificado
- ✅ Archivo `vercel.json` creado (configuración de routing)
- ✅ `.gitignore` actualizado (variables de entorno protegidas)
- ✅ Repositorio Git inicializado
- ✅ Commit inicial creado

## 📋 Paso 1: Subir a GitHub

### Opción A: Desde GitHub.com (Más fácil)

1. Ve a [github.com/new](https://github.com/new)
2. Nombre del repositorio: `latidos` (o el que prefieras)
3. Visibilidad: **Public** (para deployment gratuito) o **Private** (requiere plan)
4. **NO** marques "Add a README file"
5. Haz clic en "Create repository"

Luego en tu terminal ejecuta:

```bash
cd "C:\Desarrollos\latidos"
git remote add origin https://github.com/TU_USUARIO/latidos.git
git branch -M main
git push -u origin main
```

### Opción B: Con GitHub CLI

```bash
cd "C:\Desarrollos\latidos"
gh auth login  # Si es la primera vez
gh repo create latidos --public --source=. --remote=origin --push
```

---

## 🌐 Paso 2: Desplegar en Vercel

### Método Recomendado: Desde Vercel Dashboard

1. **Ir a Vercel**
   - Visita [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub (recomendado)

2. **Importar Proyecto**
   - Clic en "Add New..." → "Project"
   - Selecciona tu repositorio `latidos`
   - Clic en "Import"

3. **Configurar Variables de Entorno** ⚠️ IMPORTANTE

   En la sección "Environment Variables" añade:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://[tu-proyecto].supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbG...` (tu clave pública) |

   **¿Dónde encontrar estos valores?**
   - Ve a [supabase.com](https://supabase.com/dashboard)
   - Selecciona tu proyecto
   - Settings → API
   - Copia "Project URL" y "anon/public key"

4. **Framework Preset**
   - Vercel detectará automáticamente "Vite"
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Deploy**
   - Clic en "Deploy"
   - Espera 1-2 minutos
   - ¡Tu app estará en vivo! 🎉

---

## 🔧 Método Alternativo: Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# En la carpeta del proyecto
cd "C:\Desarrollos\latidos"

# Login en Vercel
vercel login

# Desplegar
vercel

# Seguir el asistente:
# - Set up and deploy? Yes
# - Which scope? Tu cuenta
# - Link to existing project? No
# - Project name? latidos
# - In which directory is your code? ./
# - Want to override settings? No

# Luego añadir variables de entorno:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY

# Deploy a producción
vercel --prod
```

---

## 🔒 Configurar Supabase para Producción

Una vez desplegado, necesitas configurar Supabase para aceptar peticiones desde tu dominio de producción:

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. **Authentication** → **URL Configuration**
4. En "Site URL" añade: `https://tu-app.vercel.app`
5. En "Redirect URLs" añade:
   - `https://tu-app.vercel.app`
   - `https://tu-app.vercel.app/**`

---

## ✅ Verificación Post-Despliegue

Después del despliegue, verifica:

- [ ] La página principal carga correctamente
- [ ] Puedes registrar nuevos usuarios
- [ ] Puedes iniciar sesión
- [ ] Puedes crear una historia
- [ ] Las imágenes se suben correctamente
- [ ] El sistema de compartidos funciona
- [ ] Las páginas de documentación funcionan

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Vercel automáticamente:
- Detectará el push
- Hará un nuevo build
- Desplegará la nueva versión
- Te enviará una notificación

---

## 📱 Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio:

1. En Vercel Dashboard → tu proyecto → Settings → Domains
2. Añade tu dominio (ej: `momentosautenticos.com`)
3. Sigue las instrucciones para configurar DNS
4. Actualiza la "Site URL" en Supabase

---

## 🆘 Solución de Problemas

### Error: "Variables de entorno no definidas"
- Verifica que añadiste `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`
- Redeploy el proyecto

### Error: "Authentication error"
- Verifica la configuración de URLs en Supabase
- Asegúrate de que el dominio de Vercel esté en las Redirect URLs

### Error: "Build failed"
- Revisa los logs de build en Vercel
- Asegúrate de que `npm run build` funciona localmente

### La app carga pero las imágenes no
- Verifica la configuración de Storage en Supabase
- Asegúrate de que las políticas RLS de storage estén configuradas

---

## 📊 Monitoreo

Vercel proporciona:
- **Analytics**: Tráfico y performance
- **Logs**: Errores y requests
- **Speed Insights**: Métricas de velocidad
- **Security**: Headers y protección

Accede a todo esto desde el Dashboard de tu proyecto en Vercel.

---

## 💰 Costos

- **Vercel**: Gratis para proyectos personales (hobby plan)
- **Supabase**: Gratis hasta 500MB de base de datos y 1GB de storage
- **Dominio**: ~10-15€/año (opcional)

---

¡Listo! Tu aplicación estará disponible en una URL como:
`https://latidos.vercel.app` o `https://tu-proyecto-abc123.vercel.app`
