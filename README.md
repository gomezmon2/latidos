# Momentos Auténticos

Una plataforma para compartir experiencias y momentos auténticos. Sin algoritmos intrusivos, sin métricas de vanidad. Solo historias reales de personas reales.

## Proyecto Info

**URL Lovable**: https://lovable.dev/projects/bd229161-e8b7-4e70-a18e-770b75886d3c

## Stack Tecnológico

- **Build Tool**: Vite 5.4.19
- **Framework**: React 18.3.1
- **Lenguaje**: TypeScript 5.8.3
- **Estilos**: Tailwind CSS 3.4.17 + shadcn/ui
- **Routing**: React Router 6.30.1
- **Base de Datos**: Supabase (PostgreSQL)
- **Formularios**: React Hook Form + Zod
- **Estado**: React Query (TanStack)
- **Iconos**: Lucide React
- **Notificaciones**: Sonner

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes shadcn/ui (46 componentes)
│   ├── sections/       # Secciones de la página principal
│   │   ├── FeaturesSection.tsx
│   │   ├── ExperiencesSection.tsx
│   │   ├── CTASection.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts
│   ├── Hero.tsx        # Componente hero banner
│   └── ExperienceCard.tsx  # Tarjeta de experiencia
├── pages/              # Páginas (rutas)
│   ├── Index.tsx       # Página principal
│   └── NotFound.tsx    # Página 404
├── types/              # Definiciones TypeScript
│   └── experience.ts   # Tipos de Experience y Feature
├── constants/          # Constantes y datos mock
│   ├── experiences.ts  # Datos mock de experiencias
│   ├── features.ts     # Datos de características
│   └── index.ts        # Exports centralizados
├── services/           # Servicios de datos
│   ├── experiences.service.ts  # CRUD para experiencias
│   └── index.ts
├── routes/             # Configuración de rutas
│   └── index.tsx       # Router y constantes de rutas
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx  # Detección responsive
│   └── use-toast.ts    # Sistema de notificaciones
├── integrations/       # Integraciones externas
│   └── supabase/      # Cliente y tipos de Supabase
├── lib/                # Utilidades
│   └── utils.ts        # Función cn() y otras utils
└── assets/             # Imágenes y recursos estáticos
```

## Instalación y Desarrollo

### Requisitos Previos

- Node.js (versión recomendada: usar [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm o yarn

### Pasos de Instalación

```sh
# 1. Clonar el repositorio
git clone <YOUR_GIT_URL>

# 2. Navegar al directorio
cd latidos

# 3. Instalar dependencias
npm install

# 4. Configurar variables de entorno
# Copia el archivo .env.example a .env y configura tus credenciales de Supabase

# 5. Ejecutar el servidor de desarrollo
npm run dev
```

### Scripts Disponibles

```sh
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Ejecutar ESLint
```

## Características Principales

### ✅ Completamente Implementadas
- **Autenticación**: Email/Password, Google OAuth, GitHub OAuth
- **Sistema de Historias**: CRUD completo (crear, editar, eliminar, visualizar)
- **Subida de Imágenes**: Desde dispositivo con vista previa
- **Sistema de Etiquetas**: Categorización con filtros (1-5 etiquetas por historia)
- **Sistema de Reacciones**: 4 tipos de reacciones (❤️ 👏 🔥 ✨)
- **Búsqueda y Filtros**: Búsqueda de texto + filtros por etiquetas
- **Perfiles de Usuario**: Con información y avatar
- Landing page con hero section
- Grid de experiencias compartidas
- Diseño responsive (mobile-first)
- Sistema de temas (soporte dark mode)
- Notificaciones toast

### 🚧 En Desarrollo
- Sistema de comentarios (pendiente arreglar foreign key)
- Comentarios anidados (respuestas a comentarios)
- Sistema de "Compartidos" (conexiones entre usuarios)
- Historias públicas/privadas
- Subida de avatar de usuario

## Arquitectura y Patrones

### Organización por Características
El código está organizado por tipo de módulo:
- `components/`: Componentes reutilizables
- `pages/`: Componentes de página
- `services/`: Lógica de negocio y API
- `types/`: Definiciones de tipos TypeScript
- `constants/`: Datos estáticos

### Patrones Utilizados
- **Component Composition**: Componentes pequeños y enfocados
- **Service Pattern**: Lógica de datos centralizada en servicios
- **Custom Hooks**: Lógica reutilizable en hooks
- **Type Safety**: TypeScript estricto para seguridad de tipos

## Configuración de Supabase

El proyecto usa Supabase para:
- Autenticación de usuarios (Email, Google, GitHub)
- Base de datos PostgreSQL (6 tablas + 1 vista)
- Almacenamiento de archivos (imágenes)
- Real-time subscriptions (futuro)

### Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Copia las credenciales al archivo `.env`:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Ejecuta los scripts SQL para crear las tablas (ver `CONTEXTO_PROYECTO.md`)
4. Configura los providers OAuth (ver guías de configuración)
5. Crea el bucket `experience-images` para imágenes (ver `CONFIGURAR_STORAGE.md`)

## Despliegue

### Opción 1: Lovable (Recomendado)
1. Abre [Lovable](https://lovable.dev/projects/bd229161-e8b7-4e70-a18e-770b75886d3c)
2. Click en Share → Publish

### Opción 2: Build Manual
```sh
npm run build
# Los archivos se generarán en la carpeta dist/
```

## Editar el Código

### Usando Lovable
Visita el [Proyecto en Lovable](https://lovable.dev/projects/bd229161-e8b7-4e70-a18e-770b75886d3c) y empieza a hacer prompts. Los cambios se commitean automáticamente.

### Usando tu IDE Preferido
Clona el repo y haz push de cambios. Se reflejarán en Lovable automáticamente.

### Usando GitHub Codespaces
1. Click en "Code" → "Codespaces" → "New codespace"
2. Edita archivos directamente en el navegador
3. Commit y push cuando termines

## Dominio Personalizado

Para conectar un dominio personalizado:
1. Navega a Project > Settings > Domains
2. Click en Connect Domain
3. Sigue las instrucciones

[Más información sobre dominios personalizados](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 📚 Documentación

Para información detallada sobre el proyecto, consulta:

- **[CONTEXTO_PROYECTO.md](CONTEXTO_PROYECTO.md)** - Contexto completo del proyecto, arquitectura y estado actual
- **[CASOS_DE_USO.md](CASOS_DE_USO.md)** - Casos de uso y funcionalidades planificadas
- **[SISTEMA_ETIQUETAS_COMPLETADO.md](SISTEMA_ETIQUETAS_COMPLETADO.md)** - Documentación del sistema de etiquetas
- **[SISTEMA_REACCIONES_COMPLETADO.md](SISTEMA_REACCIONES_COMPLETADO.md)** - Documentación del sistema de reacciones
- **[CONFIGURAR_STORAGE.md](CONFIGURAR_STORAGE.md)** - Configuración de Supabase Storage
- **[CONFIGURAR_GOOGLE_OAUTH.md](CONFIGURAR_GOOGLE_OAUTH.md)** - Configuración de Google OAuth
- **[CONFIGURAR_GITHUB_OAUTH.md](CONFIGURAR_GITHUB_OAUTH.md)** - Configuración de GitHub OAuth

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

© 2025 Momentos Auténticos (Latidos). Hecho con ❤️ para personas reales.
