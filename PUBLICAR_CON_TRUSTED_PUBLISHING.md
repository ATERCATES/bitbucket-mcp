# Publicación Segura a NPM con Trusted Publishing

⭐ **RECOMENDADO**: Esta guía usa "Trusted Publishing" en lugar de tokens API, que es más seguro.

## ¿Qué es Trusted Publishing?

Trusted Publishing es un estándar de seguridad que permite a GitHub Actions publicar directamente en NPM sin necesidad de guardar tokens en secretos. Usa autenticación OIDC (identidad federada).

**Ventajas:**
- ✅ Sin tokens guardados en GitHub Secrets
- ✅ Mayor seguridad
- ✅ Estándar de la industria
- ✅ Recomendado por NPM y PyPI
- ✅ Soportado nativamente por pnpm

## Paso 1: Configurar Trusted Publishing en NPM

### 1.1 Ve a tu perfil en NPM

1. Abre https://npmjs.com
2. Click en tu avatar → **Account**
3. En la sidebar, ve a **Publishing**
4. Bajo **Trusted Publishing**, click **Add a new publisher**

### 1.2 Configura el Publisher

1. **Publishing provider**: Selecciona `GitHub`
2. **Repository owner**: `atercates`
3. **Repository name**: `bitbucket-mcp`
4. **Repository access level**: `Public`
5. **Workflow filename** (opcional): Déjalo vacío o especifica `.github/workflows/auto-publish.yml`
6. Click **Create**

Eso es todo. NPM ahora confía en tu GitHub Actions.

## Paso 2: Configurar el Workflow

Tu `.github/workflows/auto-publish.yml` debe tener estas permissions:

```yaml
permissions:
  contents: write      # Para crear tags
  id-token: write      # Para OIDC de Trusted Publishing
```

**✅ Aquí está configurado correctamente.**

## Paso 3: Verificar que Funciona

1. Haz un pequeño cambio en `src/`
2. Commit y push a main
3. Observa las **Actions** en GitHub
4. El workflow debe autenticarse automáticamente sin token

**Logs esperado:**
```
Run pnpm publish
npm notice Publishing to https://registry.npmjs.org/
npm notice ✓ Published @atercates/bitbucket-mcp@5.0.7
```

**Sin líneas de** "NODE_AUTH_TOKEN" ni secretos.

## Ventajas vs Tokens Tradicionales

| Aspecto | Trusted Publishing | Token API |
|--------|---|---|
| **Seguridad** | ⭐⭐⭐⭐⭐ OIDC federado | ⭐⭐ Token en secretos |
| **Secretos necesarios** | ❌ Ninguno | ✅ NPM_TOKEN |
| **Expiración** | Sin expiración (automático) | Expira, necesita renovación |
| **Riesgo de leak** | Muy bajo | Moderado |
| **Compatibilidad** | NPM, PyPI, Cargo | Universal |

## Si Prefieres Tokens Tradicionales

Si no quieres usar Trusted Publishing (aunque no es recomendado):

1. Crear token en https://npmjs.com/settings/atercates/tokens
2. Seleccionar **Granular Access Token**
3. Dar permisos a `@atercates/bitbucket-mcp`
4. Agregar como secret `NPM_TOKEN` en GitHub
5. En workflow, cambiar a:
   ```yaml
   env:
     NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
   ```

## Solucionar Problemas

### Error: "Unable to find OpenID token"
- Verifica que Trusted Publishing está configurado en NPM
- Verifica que `permissions.id-token: write` está en el workflow
- Verifica que el repositorio es público en GitHub

### Error: "No compatible certificate found"
- NPM no reconoce tu GitHub Actions
- Revisa configuración de Trusted Publishing en npmjs.com/account/publishing

### Primero necesitas publicar localmente

Para la PRIMERA publicación, usa un token local:

```bash
npm login  # O pnpm login
# Username: atercates
# Password: [tu contraseña o token]
# Email: [tu email]

pnpm publish
```

Después, GitHub Actions puede usar Trusted Publishing.

## Configuración del Workflow (Actual)

Tu workflow **ya está configurado correctamente** para Trusted Publishing:

```yaml
permissions:
  contents: write  # ✅ Para crear tags y releases
  id-token: write  # ✅ Para OIDC authentication
```

## Referencia Oficial

- NPM Trusted Publishing: https://docs.npmjs.com/about-trusted-publishing
- GitHub OIDC: https://docs.github.com/es/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect

## Resumen

1. Configura **Trusted Publishing** en npmjs.com (una sola vez)
2. El workflow ya está listo (permisos correctos)
3. Publica localmente la primera vez: `pnpm publish`
4. Después, GitHub Actions publica automáticamente sin tokens

¡Mucho más seguro y moderno! 🎉
