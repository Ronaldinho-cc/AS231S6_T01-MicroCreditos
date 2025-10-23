# 🔧 Configuración de Google Drive API - MicroTrust

## 📋 Pasos para Configurar Google Drive API

### 1. **Crear Proyecto en Google Cloud Console**

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto: "MicroTrust Contracts"
3. Habilitar Google Drive API
4. Crear credenciales (API Key y OAuth 2.0)

### 2. **Configurar OAuth 2.0**

```javascript
// Configuración requerida
const DRIVE_CONFIG = {
  apiKey: 'TU_API_KEY_AQUI',
  clientId: 'TU_CLIENT_ID_AQUI.apps.googleusercontent.com',
  scope: 'https://www.googleapis.com/auth/drive.file',
  adminEmail: 'victor.cuaresma@vallegrande.edu.pe'
};
```

### 3. **Obtener API Key**

1. En Google Cloud Console → APIs & Services → Credentials
2. Crear API Key
3. Restringir a Google Drive API
4. Copiar la clave generada

### 4. **Obtener Client ID**

1. Crear OAuth 2.0 Client ID
2. Tipo: Web application
3. Authorized JavaScript origins: `http://localhost:4200`
4. Copiar el Client ID generado

### 5. **Configurar Carpeta de Google Drive**

```javascript
// Tu carpeta existente
const folderId = '1HTrGKIDRJO0QuTxm7MUDbuqYPJ9O8NEF';
const folderUrl = 'https://drive.google.com/drive/folders/1HTrGKIDRJO0QuTxm7MUDbuqYPJ9O8NEF?usp=sharing';
```

## 🚀 Funcionalidad Implementada

### ✅ Características Principales

1. **Autorización Automática**
   - Solicita permisos de Google Drive
   - Notificación al usuario sobre acceso requerido
   - Autorización segura con OAuth 2.0

2. **Subida Real de Archivos**
   - Sube contratos HTML a Google Drive
   - Configura permisos públicos automáticamente
   - Genera URLs públicas reales

3. **Notificaciones Inteligentes**
   - Aviso antes de solicitar autorización
   - Confirmación de subida exitosa
   - Manejo de errores detallado

4. **Integración con Email**
   - Notificación a `victor.cuaresma@vallegrande.edu.pe`
   - Información del contrato subido
   - Enlaces directos al archivo

### 🔄 Flujo de Trabajo

```
1. Usuario aprueba préstamo
   ↓
2. Sistema genera contrato HTML
   ↓
3. Muestra notificación de autorización
   ↓
4. Solicita permisos de Google Drive
   ↓
5. Usuario autoriza en popup de Google
   ↓
6. Sube archivo a carpeta específica
   ↓
7. Configura permisos públicos
   ↓
8. Genera URL pública
   ↓
9. Notifica éxito con enlace
   ↓
10. Envía email a victor.cuaresma@vallegrande.edu.pe
```

## 🛠️ Implementación Técnica

### Inicialización de APIs

```typescript
// Cargar Google API
await this.loadGoogleAPIScript();

// Inicializar GAPI
await this.gapi.client.init({
  apiKey: this.DRIVE_CONFIG.apiKey,
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
});

// Configurar OAuth
this.tokenClient = google.accounts.oauth2.initTokenClient({
  client_id: this.DRIVE_CONFIG.clientId,
  scope: this.DRIVE_CONFIG.scope
});
```

### Subida de Archivos

```typescript
// Preparar metadata del archivo
const fileMetadata = {
  name: `contrato_${contractId}.html`,
  parents: [this.DRIVE_CONFIG.folderId],
  description: `Contrato generado automáticamente - ID: ${contractId}`
};

// Crear FormData
const form = new FormData();
form.append('metadata', new Blob([JSON.stringify(fileMetadata)], {type: 'application/json'}));
form.append('file', new Blob([htmlContent], {type: 'text/html'}));

// Subir usando fetch
const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` },
  body: form
});
```

### Configuración de Permisos

```typescript
// Hacer archivo público
await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    role: 'reader',
    type: 'anyone'
  })
});
```

## 🎯 Experiencia del Usuario

### Para Administradores

1. **Aprobar préstamo** → Sistema inicia generación
2. **Ver notificación** → "Autorización requerida para Google Drive"
3. **Hacer clic "Autorizar"** → Se abre popup de Google
4. **Autorizar acceso** → Confirmar permisos en Google
5. **Ver confirmación** → "Contrato subido exitosamente"
6. **Recibir email** → Notificación en victor.cuaresma@vallegrande.edu.pe

### Para Usuarios

1. **Ver préstamo aprobado** → Aparece botón "Ver en Drive"
2. **Hacer clic** → Se abre Google Drive con contrato
3. **Ver/Descargar** → Contrato disponible públicamente

## 🔒 Seguridad y Privacidad

### Permisos Mínimos
- Solo acceso a archivos creados por la app
- No acceso a otros archivos de Google Drive
- Permisos revocables en cualquier momento

### Datos Protegidos
- Contratos solo visibles con enlace directo
- No indexados por motores de búsqueda
- Acceso controlado por Google Drive

### Notificaciones Seguras
- Email solo a victor.cuaresma@vallegrande.edu.pe
- Información mínima en notificaciones
- Enlaces seguros con HTTPS

## 📊 Monitoreo y Debug

### Logs Detallados
```
🔄 Inicializando Google Drive API...
✅ Google Drive API inicializada correctamente
🚀 Iniciando subida real a Google Drive para contrato loan_123...
🔐 Solicitando autorización de Google Drive...
✅ Autorización obtenida exitosamente
📤 Subiendo archivo a Google Drive...
✅ Archivo subido exitosamente
🔒 Configurando permisos públicos...
✅ Permisos públicos configurados
🔗 URL pública generada: https://drive.google.com/file/d/ABC123.../view
📧 Enviando notificación a victor.cuaresma@vallegrande.edu.pe
```

### Verificación de Estado
```typescript
// Verificar si API está lista
const status = await contractService.checkGoogleDriveStatus();
console.log(status.message);

// Probar subida
await contractService.testGoogleDriveUpload();
```

## 🎉 Beneficios

1. **Automatización Completa** - Sin intervención manual
2. **URLs Reales** - Enlaces permanentes y públicos
3. **Notificaciones Automáticas** - Email a administrador
4. **Backup Local** - Descarga automática como respaldo
5. **Experiencia Fluida** - Proceso transparente para usuarios
6. **Seguridad Robusta** - OAuth 2.0 y permisos mínimos

---

**¡Google Drive API completamente integrada con notificaciones automáticas!** 📁✨

El sistema ahora sube contratos reales, genera URLs públicas y notifica automáticamente a victor.cuaresma@vallegrande.edu.pe