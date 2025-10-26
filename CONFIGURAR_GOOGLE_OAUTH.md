# Configurar Google OAuth en Supabase

Esta guía te llevará paso a paso para habilitar el inicio de sesión con Google en tu aplicación.

---

## Parte 1: Crear Proyecto en Google Cloud Console

### Paso 1: Acceder a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Inicia sesión con tu cuenta de Google

### Paso 2: Crear un Nuevo Proyecto (si no tienes uno)

1. En la parte superior, haz click en el **selector de proyectos** (al lado de "Google Cloud")
2. Click en **"NEW PROJECT"** (esquina superior derecha)
3. Rellena:
   - **Project name**: `Momentos Autenticos` (o el nombre que prefieras)
   - **Organization**: Déjalo en blanco si no tienes
4. Click en **"CREATE"**
5. Espera unos segundos hasta que se cree el proyecto
6. Selecciona el proyecto recién creado desde el selector

### Paso 3: Habilitar Google+ API

1. En el menú lateral izquierdo, ve a: **APIs & Services** → **Library**
2. O usa este link directo: https://console.cloud.google.com/apis/library
3. En el buscador, escribe: **"Google+ API"**
4. Click en **"Google+ API"**
5. Click en el botón **"ENABLE"** (Habilitar)
6. Espera a que se habilite (tarda unos segundos)

---

## Parte 2: Configurar OAuth Consent Screen

### Paso 4: Configurar Pantalla de Consentimiento

1. En el menú lateral, ve a: **APIs & Services** → **OAuth consent screen**
2. O usa este link: https://console.cloud.google.com/apis/credentials/consent

3. **Selecciona el tipo de usuario**:
   - ✅ Marca **"External"** (para que cualquier usuario con cuenta de Google pueda acceder)
   - Click en **"CREATE"**

4. **Página 1 - OAuth consent screen**:

   Rellena los siguientes campos:

   - **App name**: `Momentos Auténticos`
   - **User support email**: Tu email (selecciona de la lista)
   - **App logo**: (Opcional - puedes dejarlo en blanco por ahora)
   - **Application home page**: `http://localhost:8083` (o el puerto que estés usando)
   - **Application Privacy Policy link**: `http://localhost:8083/privacy` (opcional)
   - **Application Terms of Service link**: `http://localhost:8083/terms` (opcional)
   - **Authorized domains**: (Déjalo vacío por ahora - lo configuraremos después cuando tengas dominio)
   - **Developer contact information**: Tu email

   Click en **"SAVE AND CONTINUE"**

5. **Página 2 - Scopes**:
   - Click en **"ADD OR REMOVE SCOPES"**
   - Busca y selecciona estos scopes:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
     - ✅ `openid`
   - Click en **"UPDATE"**
   - Click en **"SAVE AND CONTINUE"**

6. **Página 3 - Test users** (solo si elegiste External en modo test):
   - Por ahora, puedes dejarlo vacío
   - O añadir tu email para hacer pruebas
   - Click en **"SAVE AND CONTINUE"**

7. **Página 4 - Summary**:
   - Revisa que todo esté correcto
   - Click en **"BACK TO DASHBOARD"**

---

## Parte 3: Crear Credenciales OAuth

### Paso 5: Crear OAuth 2.0 Client ID

1. En el menú lateral, ve a: **APIs & Services** → **Credentials**
2. O usa este link: https://console.cloud.google.com/apis/credentials

3. Click en **"+ CREATE CREDENTIALS"** (arriba)
4. Selecciona **"OAuth client ID"**

5. **Configurar el cliente OAuth**:

   - **Application type**: Selecciona **"Web application"**

   - **Name**: `Momentos Autenticos Web Client`

   - **Authorized JavaScript origins**:
     - Click en **"+ ADD URI"**
     - Añade: `http://localhost:8083` (o el puerto que uses)
     - Si vas a desplegar en producción después, también añade tu dominio

   - **Authorized redirect URIs**:
     - Click en **"+ ADD URI"**
     - Añade: `https://jljeegojtkblsdhzuisu.supabase.co/auth/v1/callback`

     ⚠️ **MUY IMPORTANTE**: Este es el callback URL de Supabase.
     El formato es: `https://[TU-PROJECT-REF].supabase.co/auth/v1/callback`

     En tu caso: `https://jljeegojtkblsdhzuisu.supabase.co/auth/v1/callback`

6. Click en **"CREATE"**

7. **¡COPIA LAS CREDENCIALES!** 📋

   Aparecerá un popup con:
   - **Your Client ID**: `algo-largo.apps.googleusercontent.com`
   - **Your Client Secret**: `GOCSPX-algo-secreto`

   **COPIA AMBOS VALORES** - los necesitarás en el siguiente paso

   Puedes descargarlos como JSON o copiarlos manualmente.

   ⚠️ **Guárdalos en un lugar seguro** - los necesitaremos ahora

---

## Parte 4: Configurar Google OAuth en Supabase

### Paso 6: Habilitar Google Provider en Supabase

1. Ve a tu proyecto de Supabase:
   https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu

2. En el menú lateral izquierdo, click en **Authentication** → **Providers**

3. Busca **"Google"** en la lista de proveedores

4. Haz click en **"Google"** para expandir la configuración

5. **Configura el provider**:

   - ✅ **Habilita el toggle** "Enable Sign in with Google" (debe quedar en VERDE)

   - **Client ID (for OAuth)**: Pega el Client ID que copiaste de Google Cloud Console
     ```
     algo-largo.apps.googleusercontent.com
     ```

   - **Client Secret (for OAuth)**: Pega el Client Secret que copiaste
     ```
     GOCSPX-algo-secreto
     ```

   - **Authorized Client IDs**: (Déjalo vacío por ahora)

   - **Skip nonce check**: Déjalo desmarcado

6. Click en **"Save"** (abajo a la derecha)

7. ✅ **¡Listo!** Deberías ver un mensaje de confirmación.

---

## Parte 5: Probar Google OAuth

### Paso 7: Probar el Login con Google

1. Asegúrate de que tu servidor está corriendo:
   ```bash
   npm run dev
   ```

2. Abre tu aplicación: http://localhost:8083

3. Ve a la página de **"Registro"** o **"Login"**

4. Haz click en el botón **"Google"**

5. **Deberías ver**:
   - Se abre un popup de Google
   - Te pide seleccionar/iniciar sesión con tu cuenta de Google
   - Te pide autorización para acceder a tu información básica
   - Te redirige de vuelta a tu aplicación

6. **Si todo funciona**:
   - Serás redirigido a la homepage
   - Verás una notificación de "¡Bienvenido!"
   - Tu sesión estará activa

7. **Verifica en Supabase**:
   - Ve a: https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu/auth/users
   - Deberías ver un nuevo usuario con:
     - Email: tu email de Google
     - Provider: Google (ícono de Google)

---

## Solución de Problemas Comunes

### Error: "redirect_uri_mismatch"

**Causa**: El redirect URI no está configurado correctamente en Google Cloud Console.

**Solución**:
1. Verifica que en Google Cloud Console → Credentials → Tu OAuth Client
2. En "Authorized redirect URIs" debe estar exactamente:
   ```
   https://jljeegojtkblsdhzuisu.supabase.co/auth/v1/callback
   ```
3. Sin espacios ni caracteres extra

---

### Error: "Access blocked: This app's request is invalid"

**Causa**: Falta configurar el OAuth Consent Screen.

**Solución**:
1. Ve a Google Cloud Console → OAuth consent screen
2. Completa todos los campos obligatorios
3. Añade los scopes necesarios (email, profile, openid)

---

### Error: "Unsupported provider: provider is not enabled"

**Causa**: El provider de Google no está habilitado en Supabase.

**Solución**:
1. Ve a Supabase → Authentication → Providers
2. Busca "Google"
3. Asegúrate de que el toggle esté en VERDE
4. Verifica que Client ID y Client Secret estén correctamente pegados
5. Click en "Save"

---

### El popup se cierra inmediatamente

**Causa**: Posible error de configuración o bloqueador de popups.

**Solución**:
1. Desactiva bloqueadores de popups para localhost
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que las credenciales en Supabase sean correctas

---

## Resumen de URLs importantes

- **Google Cloud Console**: https://console.cloud.google.com/
- **OAuth Credentials**: https://console.cloud.google.com/apis/credentials
- **Supabase Providers**: https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu/auth/providers
- **Supabase Users**: https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu/auth/users
- **Callback URL de Supabase**: `https://jljeegojtkblsdhzuisu.supabase.co/auth/v1/callback`

---

## Próximo Paso

Una vez que Google OAuth funcione, continúa con:
- **CONFIGURAR_GITHUB_OAUTH.md** - Para habilitar login con GitHub

---

¿Necesitas ayuda? Consulta los errores en la consola del navegador (F12) y compártelos conmigo.
