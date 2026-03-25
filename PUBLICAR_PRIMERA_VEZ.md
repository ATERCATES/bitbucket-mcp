# PRIMERO: Crear el Package en NPM

Antes de configurar GitHub Actions, debes publicar la primera versión localmente.

## Requisitos

- ✅ npm o pnpm instalado
- ✅ Cuenta en npmjs.com (`atercates`)
- ✅ Verificar scope `@atercates` disponible

## Paso 1: Verificar Acceso a npm

```bash
npm whoami
# Debería mostrar: atercates
```

Si no estás logged in:
```bash
npm login
# Username: atercates
# Password: [tu contraseña de npm]
# Email: [tu email]
```

## Paso 2: Verificar package.json

El `package.json` debe tener:

```json
{
  "name": "@atercates/bitbucket-mcp",
  "version": "5.0.6",
  "description": "Model Context Protocol (MCP) server for Bitbucket Cloud and Server API integration",
  "private": false
}
```

**Importante:** `"private": false` si no está, npm lo hará privado por defecto (¡y pagarás por ello!).

Verifica:
```bash
grep -A 2 '"name"' package.json
grep '"private"' package.json || echo "NOT FOUND - OK, es público por defecto"
```

## Paso 3: Compilar el Proyecto

```bash
pnpm build
pnpm test
```

Ambos deben pasar sin errores.

## Paso 4: Publicar Localmente (Primera Vez)

Desde la raíz del proyecto:

```bash
pnpm publish
```

**Importante:** NPM te pedirá autenticarse. Usa:
- Username: `atercates`
- Password: Tu contraseña de npmjs.com (o un token si tienes 2FA)

**Esto hará:**
1. Ejecutar `pnpm build` automáticamente (hook `prepublishOnly`)
2. Validar los archivos a publicar (definidos en `"files"` de package.json)
3. Subir a npm.js

**Espera a que termine.** Debería verse:
```
npm notice Publishing to https://registry.npmjs.org/
npm notice 📦 @atercates/bitbucket-mcp@5.0.6
npm notice === Tarball Contents ===
npm notice 1.2kB  README.md
npm notice ... (más archivos)
npm notice === Tarball Details ===
npm notice name: @atercates/bitbucket-mcp
npm notice version: 5.0.6
npm notice [OK] published
```

## Después: Usar Trusted Publishing en GitHub

Una vez publicada la primera versión, GitHub Actions usará **Trusted Publishing** (sin tokens).

Ver **[PUBLICAR_CON_TRUSTED_PUBLISHING.md](PUBLICAR_CON_TRUSTED_PUBLISHING.md)** para:
1. Configurar Trusted Publishing en npmjs.com
2. El workflow automáticamente publicará sin tokens
3. Mucho más seguro

## Paso 5: Verificar la Publicación

1. Ve a https://npmjs.com/package/@atercates/bitbucket-mcp
2. Deberías ver:
   - ✅ Nombre: `@atercates/bitbucket-mcp`
   - ✅ Versión: `5.0.6`
   - ✅ Descripción correcta
   - ✅ Archivos incluidos (dist/, README.md, LICENSE, docs/)

3. También puedes verificar desde CLI:
```bash
npm view @atercates/bitbucket-mcp
```

Debería mostrar todas las versiones y metadatos.

## Paso 6: Instalar Localmente (Verificar que Funciona)

```bash
# En otra carpeta de prueba
mkdir test-mcp && cd test-mcp
npm init -y
npm install @atercates/bitbucket-mcp

# Verificar que se instaló
npm list @atercates/bitbucket-mcp
```

O directamente:
```bash
npx @atercates/bitbucket-mcp@latest
```

Debería iniciar el servidor MCP sin errores.

## Ahora Configurar GitHub Actions

Una vez que el package esté publicado en NPM, puedes:

1. **Crear Token NPM Granular**
   - Ve a https://npmjs.com/settings/atercates/tokens
   - New token → Granular Access Token
   - Scope: `@atercates/bitbucket-mcp`
   - Permissions: Read and write

2. **Agregar Secret en GitHub**
   - Repo → Settings → Secrets → New
   - Name: `NPM_TOKEN`
   - Value: [tu token granular]

3. **Ahora cada push a main publica automáticamente**

## Si Algo Falla

### Error: "You do not have permission to publish..."
- Verifica que estás logged in: `npm whoami`
- El scope `@atercates` está en tu cuenta
- El token tiene permisos de escritura

### Error: "Package name too similar..."
- El nombre ya existe en npm
- Prueba otro nombre de scope

### Error: "This publish attempt will make..."
- Significa que `"private": false` no está en package.json
- Agrega `"private": false` a package.json
- Publícalo de nuevo

## Estructura de Archivos a Publicar

El `package.json` tiene:
```json
{
  "files": [
    "dist",           // ✓ El código compilado
    "README.md",      // ✓ Instrucciones
    "LICENSE",        // ✓ MIT License
    "docs"            // ✓ Documentación
  ]
}
```

Esto significa que **no se publican**:
- ❌ `src/` (solo `dist/`)
- ❌ `__tests__/`
- ❌ `node_modules/`
- ❌ `.git/`
- ❌ `tsconfig.json`

Perfecto para usuarios, reducido de tamaño.

## Después de Publicar

1. El workflow GitHub Actions usará el token para hacer `pnpm publish`
2. Cada push a main incrementará la versión automáticamente
3. Se crearán releases en GitHub automáticamente

Ver [CONFIGURAR_NPM.md](CONFIGURAR_NPM.md) para todos los detalles.

## Próximos Pasos

Cuando hayas publicado exitosamente:

1. Confirma en NPM: https://npmjs.com/package/@atercates/bitbucket-mcp
2. Sigue [CONFIGURAR_NPM.md](CONFIGURAR_NPM.md) para GitHub Actions
3. Agrega `NPM_TOKEN` secret a tu repo
4. Haz un push a main para probar

¡Después estarás completamente automatizado!
