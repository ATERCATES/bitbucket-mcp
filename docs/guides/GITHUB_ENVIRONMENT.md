# Configuración de Ambiente - GitHub Actions

El workflow **NO necesita secretos tradicionales** si usas Trusted Publishing.

## Configuración Actual (Trusted Publishing - RECOMENDADO)

### El Workflow Tiene:

```yaml
permissions:
  contents: write      # ✅ Para crear commits, tags y releases
  id-token: write      # ✅ Para OIDC (Trusted Publishing)
```

**¿Qué significa?**
- `contents: write` - El workflow puede hacer push de commits y crear tags
- `id-token: write` - GitHub automáticamente genera un token OIDC que NPM valida

**¿Qué NO tiene?**
- ❌ Sin `NODE_AUTH_TOKEN`
- ❌ Sin `NPM_TOKEN` secret
- ❌ Sin tokens almacenados

### Cómo Funciona

1. GitHub Actions ejecuta: `pnpm publish`
2. pnpm necesita autenticarse en NPM
3. GitHub automáticamente genera un token OIDC temporal
4. NPM valida el token OIDC contra Trusted Publishing que configuraste
5. Publicación exitosa sin exponer tokens

## Configuración Alternativa (Si Usas Token)

Si prefieres usar token tradicional (no recomendado):

1. Crear secret `NPM_TOKEN` en GitHub
2. En el workflow, cambiar:
```yaml
      - name: Publish to npm
        run: pnpm publish --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Pero **Trusted Publishing es más seguro**.

## Configurar .npmrc para Local

Para publicar localmente (primera vez):

```bash
npm login
# Username: atercates
# Password: [contraseña o token]
# Email: [tu email]
```

O edita `~/.npmrc`:
```
//registry.npmjs.org/:_authToken=YOUR_TOKEN
```

## Variables de Entorno en el Workflow

El workflow tiene variables de entorno para versiones:

```yaml
env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'
```

**Esto significa:**
- Usa Node 20
- Usa pnpm 9
- Modifica estos valores si necesitas diferentes versiones

## Referencia Oficial

- [Trusted Publishing - NPM Docs](https://docs.npmjs.com/about-trusted-publishing)
- [GitHub OIDC Tokens](https://docs.github.com/es/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)

## Checklist Pre-Publish

Antes de hacer push a main:

- [ ] Configuraste Trusted Publishing en npmjs.com
- [ ] Publicaste la primera versión localmente: `pnpm publish`
- [ ] Verificas en https://npmjs.com/package/@atercates/bitbucket-mcp
- [ ] El workflow tiene permisos correctos (ya están)
- [ ] Tu repositorio es **PÚBLICO** en GitHub (requerido para Trusted Publishing)

## Solucionar Problemas

### Error: "No compatible certificate found"
- Trusted Publishing no está configurado en NPM
- Ver [PUBLICAR_CON_TRUSTED_PUBLISHING.md](PUBLICAR_CON_TRUSTED_PUBLISHING.md)

### Error: "401 Unauthorized"
- Trusted Publishing no valida la identidad
- Verifica que el repo, owner y workflow filename coinciden en NPM

### El workflow no publica
- Verifica que hiciste cambios en `src/` (no solo `docs/`)
- Verifica que el último tag existe: `git describe --tags`

## Resumen

| Configuración | Valor |
|---|---|
| **Tipo de autenticación** | Trusted Publishing (OIDC) |
| **Secretos necesarios** | ❌ Ninguno |
| **Permisos requeridos** | ✅ `id-token: write`, `contents: write` |
| **Token expire** | No (automático, generado por GitHub) |
| **Seguridad** | ⭐⭐⭐⭐⭐ Máxima |

El workflow está listo. Solo necesitas configurar Trusted Publishing una vez en NPM.
