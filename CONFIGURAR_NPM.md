# Configurar Publicación a NPM en GitHub Actions

Guía paso a paso para publicar `bitbucket-mcp` automáticamente en NPM cuando haces push a main.

## Requisitos Previos

- ✅ Cuenta en https://npmjs.com
- ✅ Repositorio en GitHub
- ✅ Permiso de escritura en el repositorio

## Paso 1: Crear Token de Acceso Personal en GitHub

1. Ve a https://github.com/settings/tokens?type=beta
2. Click en **Generate new token** → **Generate new fine-grained personal access token**
3. Completa la información:
   - **Token name**: `npm-publish-token` (o similar)
   - **Expiration**: 90 days (o lo que prefieras)
   - **Repository access**: Select repositories → Selecciona tu repo `bitbucket-mcp`
   - **Repository permissions**:
     - Contents: Read and write
     - Actions: Read and write (para crear releases)

4. Click **Generate token**
5. **Copia el token** (solo lo verás una vez)

## Paso 2: Crear Token de NPM

1. Ve a https://npmjs.com/settings/[TU_USERNAME]/tokens
2. Click **Generate New Token**
3. Selecciona **Granular Access Token**
4. Configura:
   - **Token name**: `github-actions-publish`
   - **Expiration**: 1 year (máximo 2 años)
   - **Permissions**:
     - Packages and scopes: Select a package → `bitbucket-mcp`
     - Scope: `write`
     - Scope: `read`
     - Package visibility: Public
   - **Homepage, Repository, Documentation**: No marques

5. Click **Create token**
6. **Copia el token** (solo lo verás una vez)

## Paso 3: Añadir Secretos a GitHub

### Secreto 1: NPM_TOKEN

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
   - **Name**: `NPM_TOKEN`
   - **Value**: [Pega el token de NPM del Paso 2]
   - Click **Add secret**

### Secreto 2: GITHUB_TOKEN (Automático)

No necesitas hacer nada. GitHub proporciona `GITHUB_TOKEN` automáticamente en los workflows.

## Paso 4: Configurar .npmrc (Opcional para Desarrollo Local)

Si necesitas publicar localmente durante desarrollo:

1. Crea/edita `~/.npmrc`:
```bash
//registry.npmjs.org/:_authToken=YOUR_NPM_TOKEN
```

2. O usando CLI:
```bash
npm login --auth-type=legacy
# Username: [tu usuario de NPM]
# Password: [tu token de NPM]
# Email: [tu email]
```

## Paso 5: Verificar Configuración del Workflow

El archivo `.github/workflows/auto-publish.yml` debe tener:

```yaml
env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'

jobs:
  build-and-publish:
    runs-on: ubuntu-latest
    steps:
      # ... build steps ...
      
      - name: Publish to npm
        if: steps.check.outputs.should_publish == 'true'
        run: pnpm publish --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Importante**: El variable `NODE_AUTH_TOKEN` es lo que npm necesita para autenticarse.

## Paso 6: Verificar que Funciona

1. Haz un cambio pequeño en `src/`:
   ```bash
   # Edita cualquier archivo en src/
   git add .
   git commit -m "test: test auto-publish"
   git push origin main
   ```

2. Ve a **Actions** en tu repositorio
3. Busca **Build, Test & Auto-Publish**
4. Espera a que termine (2-5 minutos)
5. Verifica en https://npmjs.com/package/bitbucket-mcp que la versión se actualizó

## Flujo de Publicación Automática

```
┌─────────────────────────────────┐
│ Haces push a main               │
└────────────┬────────────────────┘
             ▼
┌─────────────────────────────────┐
│ GitHub Actions ejecuta workflow  │
│ 1. Lint                         │
│ 2. Test                         │
│ 3. Build                        │
└────────────┬────────────────────┘
             ▼
┌─────────────────────────────────┐
│ ¿Cambios en src/ desde último   │
│ tag?                            │
└────────────┬────────────────────┘
             │
        SÍ  │  NO
            │  │
            ▼  ▼
        Bump  Skip
        version publish
            │
            ▼
┌─────────────────────────────────┐
│ pnpm publish:patch              │
│ - Actualiza versión             │
│ - Publica a NPM                 │
│ - Crea tag v5.0.7              │
│ - Crea release en GitHub        │
└─────────────────────────────────┘
```

## Controlar el Versionado

### Patch (automático)
Cada push a main con cambios en `src/` bumps patch:
```
5.0.6 → 5.0.7 → 5.0.8
```

### Minor o Major (manual)
Edita `package.json` manualmente:

```json
{
  "version": "5.1.0"  // ← Cambio minor
}
```

O para major:
```json
{
  "version": "6.0.0"  // ← Cambio major
}
```

Luego push. El workflow detecta el cambio y publica.

## Variables de Entorno Necesarias

### Para GitHub Actions (lo que configuraste arriba)
```
NPM_TOKEN = [token de npmjs.com]
```

Eso es TODO lo que necesitas.

### Para Usuarios (cuando instalen el MCP)
Los usuarios necesitan:
```bash
export BITBUCKET_TOKEN="app_password"
export BITBUCKET_WORKSPACE="my-workspace"
```

Ver [ENVIRONMENT_VARIABLES.md](docs/guides/ENVIRONMENT_VARIABLES.md)

## Solucionar Problemas

### El workflow no se ejecuta
- ✓ ¿Hiciste push a `main` o `master`? (verifica rama por defecto)
- ✓ ¿Cambiaste archivos en `src/`, `__tests__/` o `package.json`?
- ✓ ¿El workflow está habilitado? (ir a **Actions** tab)

**Solución**: En GitHub, ve a **Actions** → **Build, Test & Auto-Publish** → **Run workflow** → Selecciona branch

### NPM publish falla
**Error: "Authentication required"**
- Verifica que `NPM_TOKEN` está en **Settings** → **Secrets**
- El token no debe estar expirado
- El token debe tener permisos de escritura en `bitbucket-mcp`

**Error: "404 Not Found"**
- Verifica que el package name es `bitbucket-mcp` en `package.json`
- Verifica en https://npmjs.com/package/bitbucket-mcp que el paquete existe

### Los tests fallan
El workflow falla y no publica. Tienes que:
1. Arreglar el error localmente
2. Hacer push nuevamente

```bash
pnpm lint  # Encontrar errores
pnpm test  # Ver qué falla
pnpm build # Verificar compilación
```

### Versionado se atascó
Si el versionado no incrementa aunque hiciste cambios:
- Verifica que hay commits nuevos desde el último tag
- Verifica que cambios están en `src/` (no `docs/` o `README.md`)

Puedes forzar un bump editando `package.json` manualmente.

## Mejores Prácticas

✅ **Hacer**:
- Commits pequeños y frecuentes
- Cambios significativos en `src/` para bumpear versión
- Editar `package.json` solo para cambios major/minor deliberados
- Revisar logs de Actions si algo falla

❌ **No hacer**:
- Forzar push (`--force`)
- Editar `server.json` manualmente (se auto-genera)
- Usar `git tag` manualmente (auto-generado por workflow)
- Comprometer el token en código

## Referencia Oficial

- [GitHub Packages NPM](https://docs.github.com/es/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [GitHub Actions - Publishing packages](https://docs.github.com/es/actions/publishing-packages)
- [NPM CLI authentication](https://docs.npmjs.com/cli/v10/using-npm/config#auth-related-configuration)

## Resumen

| Paso | Qué | Dónde | Es Necesario |
|------|-----|-------|---|
| 1 | Token GitHub Personal | github.com/settings/tokens | Sí |
| 2 | Token NPM Granular | npmjs.com/settings/tokens | Sí |
| 3 | Secret NPM_TOKEN en GH | repo/settings/secrets | Sí |
| 4 | Editar .npmrc local | ~/.npmrc | Solo si publicas local |
| 5 | Workflow auto-publish | .github/workflows/auto-publish.yml | Incluido ✓ |

Una vez hecho, cada push a main = nueva versión publicada en NPM 🎉
