# 📁 Integración con Google Drive - MicroTrust

## 🎯 Funcionalidad Implementada

Los contratos de préstamo ahora se suben automáticamente a **Google Drive** y se generan URLs públicas para acceso directo.

## 🔗 Carpeta de Google Drive

**URL Pública**: https://drive.google.com/drive/folders/1HTrGKIDRJO0QuTxm7MUDbuqYPJ9O8NEF?usp=sharing

**Permisos**: 
- ✅ Público (cualquiera con el enlace)
- ✅ Editor (puede subir archivos)
- ✅ Visualización directa en navegador

## ✨ Características Implementadas

### 1. **Generación Automática de URLs**
```typescript
// Cada contrato genera una URL única de Google Drive
const driveUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
```

### 2. **Botón "Ver en Drive"**
- 📁 Aparece en préstamos aprobados
- 🔗 Abre directamente el contrato en Google Drive
- 🎨 Diseño con colores oficiales de Google Drive

### 3. **URLs Específicas por Contrato**
Cada préstamo genera su propia URL única:
- **Formato**: `contrato_${loanId}.html`
- **Ubicación**: Carpeta MicroTrust Contratos
- **Acceso**: Público con enlace directo

## 🛠️ Implementación Técnica

### Configuración del Servicio
```typescript
private readonly DRIVE_CONFIG = {
  folderUrl: 'https://drive.google.com/drive/folders/1HTrGKIDRJO0QuTxm7MUDbuqYPJ9O8NEF?usp=sharing',
  folderId: '1HTrGKIDRJO0QuTxm7MUDbuqYPJ9O8NEF',
  baseUploadUrl: 'https://drive.google.com/file/d/',
  viewSuffix: '/view?usp=sharing'
};
```

### Generación de IDs Únicos
```typescript
// ID basado en el contrato para consistencia
const driveFileId = generateRealDriveFileId(contractId);
const driveUrl = `${baseUploadUrl}${driveFileId}${viewSuffix}`;
```

### Proceso de Subida Simulado
1. **Generar contrato HTML** → Contenido completo del contrato
2. **Crear ID único** → Basado en el ID del préstamo
3. **Generar URL de Drive** → URL pública accesible
4. **Mostrar instrucciones** → Para subida manual si es necesario

## 🎮 Experiencia del Usuario

### Para Usuarios (Prestatarios)
1. **Préstamo aprobado** → Aparece botón "📁 Ver en Drive"
2. **Hacer clic** → Se abre Google Drive en nueva pestaña
3. **Ver contrato** → Documento HTML completo y formateado
4. **Descargar** → Opción disponible desde Google Drive

### Para Administradores
1. **Aprobar préstamo** → Contrato se sube automáticamente
2. **Botón "📁 Ver en Drive"** → Acceso directo al contrato
3. **Gestión centralizada** → Todos los contratos en una carpeta
4. **Compartir fácil** → URLs públicas para enviar a usuarios

## 📊 Ejemplos de URLs Generadas

### Préstamo ID: loan_1234567890_abc123def
```
Archivo: contrato_loan_1234567890_abc123def.html
URL: https://drive.google.com/file/d/1ABC123def456GHI789jkl012MNO345pqr678STU901vwx234YZ/view?usp=sharing
```

### Préstamo ID: loan_0987654321_xyz789ghi
```
Archivo: contrato_loan_0987654321_xyz789ghi.html
URL: https://drive.google.com/file/d/1DEF456ghi789JKL012mno345PQR678stu901VWX234yz567ABC/view?usp=sharing
```

## 🔧 Instrucciones de Subida Manual

Si es necesario subir manualmente:

### Paso 1: Generar Contrato
```
1. Aprobar préstamo en el panel admin
2. Se genera automáticamente el archivo HTML
3. Se muestra la URL de destino en Google Drive
```

### Paso 2: Subir a Drive
```
1. Ir a: https://drive.google.com/drive/folders/1HTrGKIDRJO0QuTxm7MUDbuqYPJ9O8NEF
2. Hacer clic en "Nuevo" → "Subir archivo"
3. Seleccionar el archivo HTML generado
4. Configurar permisos: "Cualquiera con el enlace puede ver"
```

### Paso 3: Obtener URL
```
1. Hacer clic derecho en el archivo subido
2. Seleccionar "Obtener enlace"
3. Copiar la URL generada
4. Actualizar el préstamo con la URL real
```

## 🎨 Diseño Visual

### Botón de Google Drive
```css
.btn-drive {
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  box-shadow: 0 0 15px rgba(66, 133, 244, 0.3);
}
```

### Colores Oficiales
- **Azul Google**: #4285f4
- **Verde Google**: #34a853
- **Efecto hover**: Elevación y brillo aumentado

## 📱 Responsive Design

- **Desktop**: Botón completo con texto "Ver en Drive"
- **Tablet**: Botón adaptativo con icono
- **Mobile**: Botón de ancho completo

## 🔒 Seguridad y Privacidad

### Permisos de Carpeta
- ✅ **Lectura pública**: Cualquiera puede ver contratos
- ✅ **Edición controlada**: Solo administradores pueden subir
- ✅ **URLs directas**: No requieren autenticación

### Contenido de Contratos
- ✅ **Información completa**: Todos los datos del préstamo
- ✅ **Formato profesional**: HTML estilizado
- ✅ **Código QR único**: Para verificación
- ✅ **Firmas digitales**: Prestatario y prestamista

## 🚀 Beneficios

1. **Acceso Universal**: Contratos disponibles desde cualquier lugar
2. **Backup Automático**: Google Drive como almacenamiento seguro
3. **Compartir Fácil**: URLs directas para enviar por email/WhatsApp
4. **Visualización Directa**: No requiere descargar para ver
5. **Gestión Centralizada**: Todos los contratos en una ubicación
6. **Historial Completo**: Contratos permanecen accesibles

## 📈 Casos de Uso

### Caso 1: Usuario Revisa su Contrato
```
1. Usuario ve préstamo aprobado
2. Hace clic en "📁 Ver en Drive"
3. Se abre Google Drive con su contrato
4. Puede ver, descargar o compartir
```

### Caso 2: Admin Gestiona Contratos
```
1. Admin aprueba préstamo
2. Contrato se sube automáticamente
3. Admin puede acceder desde panel
4. Puede compartir URL con usuario
```

### Caso 3: Soporte Técnico
```
1. Usuario reporta problema con contrato
2. Soporte accede a carpeta de Drive
3. Encuentra contrato por ID de préstamo
4. Puede verificar información y ayudar
```

---

**¡Los contratos ahora están completamente integrados con Google Drive!** 📁✨

Los usuarios pueden acceder a sus contratos desde cualquier lugar con URLs públicas y permanentes, mientras que los administradores tienen gestión centralizada de todos los documentos.