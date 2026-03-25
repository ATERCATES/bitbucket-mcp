# Guía de Setup: Trusted Publishing con NPM + GitHub Actions

## Qué es Trusted Publishing

Trusted Publishing permite publicar paquetes en npm **sin tokens secretos** (NPM_TOKEN). Usa OIDC (OpenID Connect) para que GitHub Actions se autentique directamente con npm, eliminando el riesgo de tokens expuestos o robados.

---

## Paso 1: Configurar Trusted Publishing en npmjs.com

1. Inicia sesión en [npmjs.com](https://www.npmjs.com)
2. Ve a tu paquete: `@atercates/bitbucket-mcp`
3. Haz clic en **Settings** (pestaña)
4. Busca la sección **Publishing access** → **Trusted Publisher**
5. Rellena los campos **exactamente** así:

| Campo | Valor |
|-------|-------|
| **Repository owner** | `atercates` |
| **Repository name** | `bitbucket-mcp` |
| **Workflow filename** | `auto-publish.yml` |
| **Environment** | *(dejar vacío)* |

6. Haz clic en **Add** o **Save**

> **IMPORTANTE**: Los valores deben coincidir exactamente con tu repositorio y nombre del archivo del workflow. Si alguno no coincide, la autenticación OIDC fallará.

---

## Paso 2: Limpiar secretos obsoletos (si los hay)

Si tenías un `NPM_TOKEN` configurado como secreto en GitHub:

1. Ve a tu repo en GitHub → **Settings** → **Secrets and variables** → **Actions**
2. **Elimina** el secreto `NPM_TOKEN` (interfiere con OIDC)

> Con Trusted Publishing ya no necesitas ningún token de npm. El workflow se autentica automáticamente vía OIDC.

---

## Paso 3: Verificar el workflow

El archivo `.github/workflows/auto-publish.yml` necesita estos elementos clave:

### Permisos requeridos

```yaml
permissions:
  contents: write    # Para crear tags y releases
  id-token: write    # Para generar tokens OIDC (CRÍTICO)
```

### setup-node con registry-url

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    registry-url: 'https://registry.npmjs.org'  # Obligatorio para OIDC
```

### npm actualizado (>= 11.5.1)

```yaml
- name: Upgrade npm for OIDC support
  run: npm install -g npm@latest
```

### Comando de publicación

```yaml
- name: Publish to npm
  run: pnpm publish --provenance --access public --no-git-checks
```

Flags importantes:
- `--provenance`: Genera atestación de procedencia (vincula el paquete al commit exacto)
- `--access public`: Necesario para paquetes con scope (`@atercates/...`)
- `--no-git-checks`: Evita que pnpm valide el estado git (ya lo controlamos nosotros)

> **NO** uses `NODE_AUTH_TOKEN` ni `NPM_TOKEN` como variable de entorno en el paso de publicación. OIDC maneja la autenticación automáticamente.

---

## Paso 4: Verificar que funciona

1. Haz un cambio en `src/` y push a `master`
2. Ve a **Actions** en tu repo de GitHub
3. El workflow "Build, Test & Auto-Publish" debería ejecutarse
4. Verifica que el paso "Publish to npm" muestre algo como:

```
npm notice Publishing to https://registry.npmjs.org/ with tag latest and provenance
```

5. En npmjs.com, tu paquete debería mostrar un badge de **Provenance** verde

---

## Flujo del Pipeline

```
Push a master (cambios en src/)
  │
  ├── Job: build-and-test
  │     ├── Install dependencies
  │     ├── Lint
  │     ├── Test
  │     └── Build
  │
  └── Job: publish (necesita build-and-test exitoso)
        ├── Checkout con historial completo
        ├── Setup Node + registry npm
        ├── Detectar si hay cambios desde último tag
        ├── Bump versión patch en package.json
        ├── Publicar con OIDC + provenance
        ├── Push commit de versión + tag
        └── Crear GitHub Release
```

---

## Errores comunes y soluciones

### `npm error code ENEEDAUTH`
- **Causa**: Falta `registry-url` en setup-node, o npm < 11.5.1
- **Solución**: Verifica que `registry-url: 'https://registry.npmjs.org'` está configurado y que ejecutas `npm install -g npm@latest`

### `Trusted publishing configuration mismatch`
- **Causa**: Los datos en npmjs.com no coinciden con el workflow
- **Solución**: Verifica que owner, repo, workflow filename y environment coincidan exactamente

### `npm error code E403 - Forbidden`
- **Causa**: Token NPM_TOKEN interfiriendo con OIDC, o el paquete no tiene Trusted Publisher configurado
- **Solución**: Elimina NPM_TOKEN de secrets y verifica la configuración en npmjs.com

### `npm warn publish Skipping provenance`
- **Causa**: El runner no es GitHub-hosted, o falta `id-token: write`
- **Solución**: Verifica los permisos del workflow y que usas `ubuntu-latest`

### El workflow se ejecuta pero no publica
- **Causa**: No hay cambios en `src/` desde el último tag
- **Solución**: El workflow solo publica cuando detecta cambios en código fuente. Es el comportamiento esperado.

---

## Publicación manual (local)

Si necesitas publicar manualmente desde tu máquina:

```bash
# Necesitas estar autenticado en npm: npm login
pnpm version patch
pnpm publish --access public
git push && git push --tags
```

> Nota: La publicación local NO genera provenance. Solo GitHub Actions con OIDC lo hace.

---

## Checklist final

- [ ] Trusted Publisher configurado en npmjs.com con los datos exactos del repo
- [ ] No hay `NPM_TOKEN` en los secrets de GitHub Actions
- [ ] El workflow tiene `id-token: write` en permissions
- [ ] `setup-node` tiene `registry-url: 'https://registry.npmjs.org'`
- [ ] El comando publish usa `--provenance --access public`
- [ ] npm se actualiza a >= 11.5.1 en el workflow
