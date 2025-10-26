# Configurar GitHub OAuth en Supabase

Esta guía te llevará paso a paso para habilitar el inicio de sesión con GitHub en tu aplicación.

---

## Parte 1: Crear OAuth App en GitHub

### Paso 1: Acceder a GitHub Developer Settings

1. Inicia sesión en GitHub: https://github.com
2. Ve a tu perfil (click en tu avatar, esquina superior derecha)
3. Click en **"Settings"** (Configuración)
4. En el menú lateral izquierdo, baja hasta el final y busca la sección **"Developer settings"**
5. O usa este link directo: https://github.com/settings/developers

### Paso 2: Crear una Nueva OAuth App

1. En el menú lateral, click en **"OAuth Apps"**
2. Click en el botón **"New OAuth App"** (esquina superior derecha)
3. O usa este link directo: https://github.com/settings/applications/new

### Paso 3: Configurar la OAuth App

Rellena el formulario con la siguiente información:

1. **Application name**: `Momentos Auténticos`
   - Este es el nombre que verán los usuarios cuando autoricen la app

2. **Homepage URL**: `http://localhost:8083`
   - Usa el puerto donde corre tu aplicación localmente
   - Cuando despliegues en producción, cámbialo a tu dominio real

3. **Application description**: (Opcional)
   ```
   Plataforma para compartir historias y experiencias auténticas
   ```

4. **Authorization callback URL**: ⚠️ **MUY IMPORTANTE**
   ```
   https://jljeegojtkblsdhzuisu.supabase.co/auth/v1/callback
   ```

   **El formato es**: `https://[TU-PROJECT-REF].supabase.co/auth/v1/callback`

   En tu caso específico: `https://jljeegojtkblsdhzuisu.supabase.co/auth/v1/callback`

   ⚠️ **Copia esto EXACTAMENTE** - sin espacios, sin barras extras al final

5. **Enable Device Flow**: Deja esta opción **desmarcada** (no la necesitamos)

6. Click en **"Register application"**

---

## Parte 2: Obtener las Credenciales

### Paso 4: Copiar Client ID y generar Client Secret

Después de crear la app, serás redirigido a la página de configuración de tu OAuth App.

1. **Client ID**:
   - Verás el Client ID inmediatamente en la página
   - Se ve algo como: `Iv1.a1b2c3d4e5f6g7h8`
   - **📋 COPIA ESTE VALOR** - lo necesitarás en Supabase

2. **Client Secret**:
   - Click en el botón **"Generate a new client secret"**
   - ⚠️ **IMPORTANTE**: GitHub solo te mostrará este secret UNA VEZ
   - Aparecerá un valor largo como: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`
   - **📋 COPIA ESTE VALOR INMEDIATAMENTE** y guárdalo en un lugar seguro
   - Si pierdes este valor, tendrás que generar uno nuevo

3. **Confirma tu contraseña de GitHub** si te lo pide

4. **Guarda ambos valores** (Client ID y Client Secret) - los necesitarás en el siguiente paso

---

## Parte 3: Configurar GitHub OAuth en Supabase

### Paso 5: Habilitar GitHub Provider en Supabase

1. Ve a tu proyecto de Supabase:
   https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu

2. En el menú lateral izquierdo, click en **Authentication** → **Providers**

3. Busca **"GitHub"** en la lista de proveedores

4. Haz click en **"GitHub"** para expandir la configuración

5. **Configura el provider**:

   - ✅ **Habilita el toggle** "Enable Sign in with GitHub" (debe quedar en VERDE)

   - **Client ID (for OAuth)**: Pega el Client ID que copiaste de GitHub
     ```
     Iv1.a1b2c3d4e5f6g7h8
     ```

   - **Client Secret (for OAuth)**: Pega el Client Secret que copiaste de GitHub
     ```
     a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
     ```

6. Click en **"Save"** (abajo a la derecha)

7. ✅ **¡Listo!** Deberías ver un mensaje de confirmación.

---

## Parte 4: Probar GitHub OAuth

### Paso 6: Probar el Login con GitHub

1. Asegúrate de que tu servidor está corriendo:
   ```bash
   npm run dev
   ```

2. Abre tu aplicación: http://localhost:8083

3. Ve a la página de **"Registro"** o **"Login"**

4. Haz click en el botón **"GitHub"**

5. **Deberías ver**:
   - Se abre una página de GitHub (o popup)
   - Te pide autorizar la aplicación "Momentos Auténticos"
   - Muestra qué permisos solicita (email, perfil básico)
   - Click en **"Authorize [tu-usuario]"** (botón verde)
   - Te redirige de vuelta a tu aplicación

6. **Si todo funciona**:
   - Serás redirigido a la homepage de tu aplicación
   - Verás una notificación de "¡Bienvenido!"
   - Tu sesión estará activa

7. **Verifica en Supabase**:
   - Ve a: https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu/auth/users
   - Deberías ver un nuevo usuario con:
     - Email: tu email de GitHub (o el email principal si tienes varios)
     - Provider: GitHub (ícono de GitHub)
     - Provider ID: tu username de GitHub

---

## Solución de Problemas Comunes

### Error: "The redirect_uri MUST match the registered callback URL for this application"

**Causa**: El callback URL no está configurado correctamente en GitHub.

**Solución**:
1. Ve a GitHub → Settings → Developer settings → OAuth Apps
2. Click en tu aplicación "Momentos Auténticos"
3. Verifica que "Authorization callback URL" sea exactamente:
   ```
   https://jljeegojtkblsdhzuisu.supabase.co/auth/v1/callback
   ```
4. Sin espacios, sin barras extras, sin http (debe ser https)
5. Click en "Update application"

---

### Error: "Application suspended"

**Causa**: GitHub suspendió tu OAuth App (raro en desarrollo).

**Solución**:
1. Verifica tu email - GitHub podría haber enviado una notificación
2. Revisa que tu cuenta de GitHub esté en buena posición
3. Crea una nueva OAuth App si es necesario

---

### Error: "Unsupported provider: provider is not enabled"

**Causa**: El provider de GitHub no está habilitado en Supabase.

**Solución**:
1. Ve a Supabase → Authentication → Providers
2. Busca "GitHub"
3. Asegúrate de que el toggle esté en VERDE
4. Verifica que Client ID y Client Secret estén correctamente pegados
5. Click en "Save"

---

### Error: "Invalid client_id or client_secret"

**Causa**: Las credenciales en Supabase no coinciden con las de GitHub.

**Solución**:
1. Ve a GitHub → Settings → Developer settings → OAuth Apps
2. Verifica el Client ID
3. Si perdiste el Client Secret, genera uno nuevo:
   - Click en "Generate a new client secret"
   - Copia el nuevo secret
4. Actualiza ambos valores en Supabase → Authentication → Providers → GitHub
5. Click en "Save"

---

### No aparece el email del usuario

**Causa**: GitHub permite tener emails privados.

**Solución**:
- Esto es normal - GitHub respeta la privacidad del usuario
- El usuario puede elegir hacer su email público en GitHub Settings
- Tu app debería funcionar igual - Supabase creará el usuario con el email que GitHub proporcione

---

## Gestionar tu OAuth App después

### Ver usuarios que autorizaron tu app

1. Ve a: https://github.com/settings/applications
2. Click en tu aplicación "Momentos Auténticos"
3. Verás estadísticas de uso

### Editar configuración

1. Desde la misma página, puedes:
   - Cambiar el nombre
   - Actualizar la Homepage URL (cuando despliegues a producción)
   - Cambiar el logo
   - Revocar el client secret y generar uno nuevo

### Actualizar para producción

Cuando despliegues tu app a producción:

1. **Opción 1: Actualizar la app existente**:
   - Cambia Homepage URL a tu dominio real: `https://tudominio.com`
   - El callback URL de Supabase seguirá siendo el mismo

2. **Opción 2: Crear una app separada para producción** (recomendado):
   - Crea una nueva OAuth App con nombre "Momentos Auténticos (Production)"
   - Usa tu dominio de producción
   - Usa el mismo callback URL de Supabase
   - En Supabase, actualiza las credenciales para producción

---

## Resumen de URLs importantes

- **GitHub OAuth Apps**: https://github.com/settings/developers
- **Crear nueva OAuth App**: https://github.com/settings/applications/new
- **Supabase Providers**: https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu/auth/providers
- **Supabase Users**: https://supabase.com/dashboard/project/jljeegojtkblsdhzuisu/auth/users
- **Callback URL de Supabase**: `https://jljeegojtkblsdhzuisu.supabase.co/auth/v1/callback`

---

## Permisos que solicita la app

Por defecto, GitHub OAuth solicita:
- ✅ **read:user** - Leer información básica del perfil
- ✅ **user:email** - Leer dirección de email

Estos son permisos mínimos y seguros. No permiten modificar nada en la cuenta del usuario.

---

## Próximo Paso

Una vez que GitHub OAuth funcione:
1. ✅ Tendrás 3 métodos de autenticación: Email, Google, y GitHub
2. Los usuarios podrán elegir el que prefieran
3. Puedes continuar con el siguiente feature de tu aplicación

---

¿Necesitas ayuda? Consulta los errores en la consola del navegador (F12) y compártelos conmigo.
