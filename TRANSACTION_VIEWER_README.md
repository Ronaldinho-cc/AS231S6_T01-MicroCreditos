# 🔍 Visor de Transacciones - MicroTrust

## Descripción

Se ha implementado un sistema completo de visualización de transacciones blockchain que permite a los usuarios y administradores ver las transacciones relacionadas con cada préstamo directamente desde la plataforma.

## ✨ Características Implementadas

### 🎯 Funcionalidades Principales

1. **Botón "Ojo" de Transacciones**
   - Icono intuitivo (👁️ / 🔍) en cada tarjeta de préstamo
   - Disponible tanto para usuarios como administradores
   - Tooltip informativo que indica la red blockchain

2. **Modal de Visualización Avanzado**
   - Diseño gamer profesional con efectos visuales
   - Información completa del préstamo
   - Lista de transacciones filtradas y completas
   - Enlaces directos al explorador blockchain

3. **Integración con APIs de Etherscan**
   - Soporte para múltiples redes: Holesky, Sepolia, Goerli, Mainnet
   - API Key configurada: `8HY7XBZ8IWXVXZHZFRTYKVSID2PNKU2SZ7`
   - Filtrado inteligente de transacciones relacionadas

### 🌐 Redes Soportadas

| Red | API Endpoint | Explorador |
|-----|-------------|------------|
| **Holesky** | `api-holesky.etherscan.io` | `holesky.etherscan.io` |
| **Sepolia** | `api-sepolia.etherscan.io` | `sepolia.etherscan.io` |
| **Goerli** | `api-goerli.etherscan.io` | `goerli.etherscan.io` |
| **Mainnet** | `api.etherscan.io` | `etherscan.io` |

## 🚀 Archivos Creados/Modificados

### Nuevos Archivos
- `src/app/services/blockchain-explorer.service.ts` - Servicio principal
- `src/app/shared/transaction-viewer/transaction-viewer.component.ts` - Componente modal
- `src/app/shared/transaction-viewer/transaction-viewer.component.html` - Template
- `src/app/shared/transaction-viewer/transaction-viewer.component.css` - Estilos

### Archivos Modificados
- `src/app/app.module.ts` - Agregado HttpClientModule y nuevo componente
- `src/app/pages/my-loans/my-loans.component.ts` - Funcionalidad del visor
- `src/app/pages/my-loans/my-loans.component.html` - Botón y modal
- `src/app/pages/my-loans/my-loans.component.css` - Estilos del botón
- `src/app/pages/admin/admin.component.ts` - Funcionalidad del visor
- `src/app/pages/admin/admin.component.html` - Botón y modal
- `src/app/pages/admin/admin.component.css` - Estilos del botón

## 🎨 Diseño Visual

### Botón de Transacciones
```css
.btn-transaction-viewer {
  background: linear-gradient(135deg, var(--primary-cyan), var(--primary-purple));
  color: white;
  box-shadow: var(--glow-subtle);
  /* Efecto de brillo animado */
}
```

### Modal Responsivo
- **Desktop**: Modal centrado con tabla completa
- **Tablet**: Columnas adaptativas
- **Mobile**: Vista optimizada en pantalla completa

## 🔧 Uso

### Para Usuarios (My Loans)
1. Navegar a "Mis Préstamos"
2. Hacer clic en el botón "👁️ Ver Transacciones"
3. Ver transacciones filtradas relacionadas con el préstamo
4. Hacer clic en enlaces para abrir en el explorador blockchain

### Para Administradores
1. Acceder al panel de administración
2. En cualquier préstamo, hacer clic en "🔍 Transacciones"
3. Ver todas las transacciones de la dirección del prestatario
4. Filtros automáticos por monto y dirección

## 📊 Funcionalidades del Visor

### Información Mostrada
- **Hash de transacción** (truncado con tooltip completo)
- **Direcciones** (desde/hacia con formato abreviado)
- **Monto** (convertido de Wei a ETH)
- **Fecha y hora** (formato localizado)
- **Estado** (exitosa/fallida con iconos)
- **Enlaces directos** al explorador

### Filtros Inteligentes
- Transacciones que coinciden con el monto del préstamo
- Transacciones hacia la dirección del prestatario
- Tolerancia de ±0.01 ETH para variaciones de gas

### Estados de Carga
- **Loading**: Spinner animado con mensaje
- **Error**: Mensaje de error con botón de reintento
- **Sin datos**: Mensaje informativo
- **Datos**: Tabla completa con paginación

## 🔗 Integración con Blockchain

### Métodos del Servicio
```typescript
// Obtener transacciones de una dirección
getTransactions(address: string, network: string): Observable<EtherscanResponse>

// Filtrar transacciones relacionadas con préstamo
filterLoanTransactions(transactions: Transaction[], loanAmount: number, borrowerAddress: string): Transaction[]

// Generar URLs del explorador
getTransactionUrl(txHash: string, network: string): string
getAddressUrl(address: string, network: string): string
```

### Manejo de Errores
- Validación de red soportada
- Timeout de API configurable
- Mensajes de error user-friendly
- Botón de reintento automático

## 🎯 Casos de Uso

1. **Usuario verifica su préstamo**: Puede ver si el dinero fue enviado correctamente
2. **Admin audita transacciones**: Puede verificar todas las transacciones de un usuario
3. **Soporte técnico**: Puede ayudar a usuarios con problemas de transacciones
4. **Transparencia**: Todos pueden verificar las transacciones en blockchain

## 🔮 Próximas Mejoras

- [ ] Cache de transacciones para mejor rendimiento
- [ ] Notificaciones push cuando lleguen nuevas transacciones
- [ ] Exportar historial de transacciones a CSV/PDF
- [ ] Integración con más exploradores blockchain
- [ ] Análisis de gas fees y optimizaciones

## 🛠️ Configuración Técnica

### Variables de Entorno
```typescript
const API_KEYS = {
  holesky: '8HY7XBZ8IWXVXZHZFRTYKVSID2PNKU2SZ7',
  sepolia: '8HY7XBZ8IWXVXZHZFRTYKVSID2PNKU2SZ7',
  goerli: '8HY7XBZ8IWXVXZHZFRTYKVSID2PNKU2SZ7',
  mainnet: '8HY7XBZ8IWXVXZHZFRTYKVSID2PNKU2SZ7'
};
```

### Dependencias Agregadas
- `HttpClientModule` para llamadas a APIs
- `Observable` y `RxJS` para manejo asíncrono

---

**¡La funcionalidad está completamente implementada y lista para usar!** 🎉

Los usuarios ahora pueden hacer clic en el "ojo" de cualquier préstamo y ver todas las transacciones relacionadas directamente en el explorador blockchain correspondiente (Holesky, Sepolia, etc.).