import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { WalletService } from '../../services/wallet.service';
import { LoanService } from '../../services/loan/loan.service';
import { ContractService } from '../../services/contract/contract.service';
import { StudentVerificationService } from '../../services/student-verification.service';
import { APP_CONSTANTS } from '../../constants/app.constants';
import { LoanRequest } from '../../interfaces/loan.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  allLoans: LoanRequest[] = [];
  pendingLoans: LoanRequest[] = [];
  approvedLoans: LoanRequest[] = [];
  rejectedLoans: LoanRequest[] = [];
  paidLoans: LoanRequest[] = [];
  paymentPendingLoans: LoanRequest[] = [];
  
  account: string | null = null;
  isAdmin: boolean = false;
  isLoading: boolean = true;
  isApproving: boolean = false;
  error: string = '';
  
  // Filtros
  filterStatus: string = 'all';
  searchTerm: string = '';
  filteredLoans: LoanRequest[] = [];
  
  // Transacciones
  showTransactions: boolean = false;
  selectedLoan: LoanRequest | null = null;
  transactionView: 'admin' | 'client' = 'admin';
  showTransactionViewer: boolean = false;
  transactionViewerLoan: LoanRequest | null = null;

  // Declarar redes como constante en el componente (no se debe sobrescribir)
  networks = [
    { key: 'holesky', label: 'Holešky', icon: '⛰️' },
    { key: 'sepolia', label: 'Sepolia', icon: '🔷' },
    { key: 'goerli', label: 'Goerli', icon: '🌐' },
    { key: 'hoodi', label: 'Hoodi', icon: '🧪' }
  ];
  selectedNetwork: string | null = null;

  constructor(
    private walletService: WalletService,
    private loanService: LoanService,
    private contractService: ContractService,
    private studentVerificationService: StudentVerificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Mantener las inicializaciones previas (si existen) y asegurarnos de no sobrescribir networks
    try {
      // Llamadas previas del lifecycle
      (this as any).checkAdminAccess?.();
      // no llamar loadAllLoans aquí sin antes conocer la red
    } catch (e) {
      console.error('Inicialización admin error:', e);
    }

    // Obtener chainId actual para marcar la red activa en la interfaz
    this.walletService.getChainId()
      .then(cid => {
        // Normalizar hex lowercase
        if (cid) this.selectedNetwork = this.mapChainIdToKey(cid);
        console.log('AdminComponent - chainId detectado:', cid, 'selectedNetwork:', this.selectedNetwork);
        // Cargar préstamos una vez conocida la red actual (aplica filtro)
        this.loadAllLoans();
      })
      .catch(err => {
        console.debug('No se pudo leer chainId en AdminComponent:', err);
        // Aun así cargar préstamos sin filtrar por red
        this.loadAllLoans();
      });

    // Debug adicional en consola para ver si la lista de redes se mantiene
    console.log('AdminComponent networks iniciales:', this.networks, 'length:', this.networks.length);
  }

  // Mapea chainId hex a key usada en networks
  private mapChainIdToKey(chainIdHex: string | null | undefined): string | null {
    if (!chainIdHex) return null;
    const cid = chainIdHex.toLowerCase();
    switch (cid) {
      case '0x4268': return 'holesky';
      case '0xaa36a7': return 'sepolia';
      case '0x5': return 'goerli';
      case '0x88c50': return 'hoodi';
      default: return null;
    }
  }

  // Método para cambiar de red desde la UI
  async changeNetwork(key: string): Promise<void> {
    try {
      // Evitar doble click rápido
      // No pre-asignar la red hasta confirmar el cambio en la wallet:
      await this.walletService.switchNetwork(key);

      // Actualizar estado local con la nueva red y recargar (filtrado)
      this.selectedNetwork = key;
      await this.loadAllLoans();

      Swal.fire({ icon: 'success', title: 'Red cambiada', text: `Se intentó cambiar a ${key}` });
    } catch (err: any) {
      console.error('Error al cambiar red:', err);
      Swal.fire({
        icon: 'error',
        title: 'No se pudo cambiar la red',
        text: err?.message || String(err)
      });
      // Recalcular selectedNetwork real si falla
      try {
        const cid = await this.walletService.getChainId();
        this.selectedNetwork = this.mapChainIdToKey(cid);
        await this.loadAllLoans();
      } catch (_e) { /* noop */ }
    }
  }

  async checkAdminAccess(): Promise<void> {
    try {
      const accounts = await this.walletService.getAccounts();
      if (accounts && accounts.length > 0) {
        this.account = accounts[0];
        this.isAdmin = APP_CONSTANTS.ADMIN_ADDRESSES.some(
          adminAddr => adminAddr.toLowerCase() === this.account!.toLowerCase()
        );
        
        if (!this.isAdmin) {
          this.router.navigate(['/client/dashboard']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      this.router.navigate(['/login']);
    }
  }

  async loadAllLoans(): Promise<void> {
    this.isLoading = true;
    try {
      // Obtener todos los préstamos del servicio
      const fetched = await this.loanService.getAllLoans();

      // Si hay una red seleccionada, filtrar por esa red
      if (this.selectedNetwork) {
        this.allLoans = fetched.filter(l => l.network === this.selectedNetwork);
      } else {
        this.allLoans = fetched;
      }

      this.categorizeLoans();
      this.applyFilter();
    } catch (error) {
      this.error = 'Error al cargar los préstamos';
      console.error('Error loading loans:', error);
    } finally {
      this.isLoading = false;
    }
  }

  categorizeLoans(): void {
    this.pendingLoans = this.allLoans.filter(loan => loan.status === 'pending');
    this.approvedLoans = this.allLoans.filter(loan => loan.status === 'approved');
    this.rejectedLoans = this.allLoans.filter(loan => loan.status === 'rejected');
    this.paidLoans = this.allLoans.filter(loan => loan.status === 'paid');
    this.paymentPendingLoans = this.allLoans.filter(loan => loan.status === 'payment_pending');
  }

  get pendingCount(): number {
    return this.pendingLoans.length;
  }

  get approvedCount(): number {
    return this.approvedLoans.length;
  }

  get rejectedCount(): number {
    return this.rejectedLoans.length;
  }

  get paidCount(): number {
    return this.paidLoans.length;
  }

  applyFilter(): void {
    let filtered = this.allLoans;
    
    // Filtrar por estado
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(loan => loan.status === this.filterStatus);
    }
    
    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(loan => 
        loan.id.toLowerCase().includes(term) ||
        loan.borrowerName.toLowerCase().includes(term) ||
        loan.borrowerAddress.toLowerCase().includes(term)
      );
    }
    
    this.filteredLoans = filtered;
  }

  async approveLoan(loan: LoanRequest): Promise<void> {
    if (!this.account) return;
    
    // Verificar MetaMask antes de aprobar
    console.log('🔍 Verificando configuración de MetaMask...');
    const metaMaskCheck = await this.loanService.checkMetaMaskSetup();
    
    if (!metaMaskCheck.isReady) {
      this.error = metaMaskCheck.message;
      await Swal.fire({
        icon: 'error',
        title: 'Error de MetaMask',
        html: `
          <div style="text-align: left;">
            <p style="margin-bottom: 15px;"><strong>${metaMaskCheck.message}</strong></p>
            <p style="color: #666; font-size: 14px;">Por favor verifica tu configuración de MetaMask e intenta nuevamente.</p>
          </div>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        customClass: {
          popup: 'swal-professional',
          confirmButton: 'swal-btn'
        }
      });
      return;
    }
    
    console.log('✅ MetaMask verificado:', metaMaskCheck.message);
    
    // Mostrar confirmación profesional
    const result = await Swal.fire({
      title: '¿Aprobar Préstamo?',
      html: `
        <div class="loan-approval-details">
          <div class="approval-header">
            <i class="fas fa-hand-holding-usd" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
          </div>
          <div class="approval-info">
            <div class="info-row">
              <span class="info-label">Solicitante:</span>
              <span class="info-value">${loan.borrowerName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Dirección:</span>
              <span class="info-value" style="font-family: monospace; font-size: 0.9em;">${loan.borrowerAddress.slice(0, 20)}...${loan.borrowerAddress.slice(-10)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Monto:</span>
              <span class="info-value" style="color: #10b981; font-size: 1.3em; font-weight: 700;">${loan.amount} ETH</span>
            </div>
            <div class="info-row">
              <span class="info-label">Red:</span>
              <span class="info-value" style="color: #00d4ff;">${this.getNetworkLabel(loan.network)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Propósito:</span>
              <span class="info-value">${this.getPurposeTypeLabel(loan.purposeType)}</span>
            </div>
          </div>
          <div class="approval-warning">
            <i class="fas fa-exclamation-triangle" style="color: #f59e0b; margin-right: 8px;"></i>
            <span>Esta acción enviará <strong>${loan.amount} ETH</strong> desde tu wallet</span>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-check-circle"></i> Sí, Aprobar',
      cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      customClass: {
        popup: 'swal-professional swal-wide',
        confirmButton: 'swal-btn swal-btn-success',
        cancelButton: 'swal-btn swal-btn-cancel'
      },
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      preConfirm: async () => {
        try {
          console.log(`🚀 Iniciando aprobación de préstamo ${loan.id}...`);
          const approvalResult = await this.loanService.approveLoan(loan.id, this.account!);
          
          if (!approvalResult.success) {
            throw new Error(approvalResult.message);
          }
          
          return approvalResult;
        } catch (error: any) {
          Swal.showValidationMessage(`Error: ${error?.message || 'Error desconocido'}`);
          return false;
        }
      }
    });
    
    if (result.isConfirmed && (result as any).value) {
      // Mostrar ventana de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Préstamo Aprobado!',
        html: `
          <div class="success-details">
            <div class="success-animation">
              <i class="fas fa-check-circle" style="font-size: 4rem; color: #10b981; animation: scaleIn 0.5s ease;"></i>
            </div>
            <p style="font-size: 1.1rem; margin: 1.5rem 0;">El préstamo de <strong style="color: #10b981;">${loan.amount} ETH</strong> ha sido aprobado exitosamente.</p>
            <p style="color: #666; font-size: 0.9rem;">Destinatario: <strong>${loan.borrowerName}</strong></p>
            ${(result as any).value.transactionHash ? `
              <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(0, 212, 255, 0.1); border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.3);">
                <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">Hash de Transacción:</p>
                <p style="font-family: monospace; font-size: 0.9rem; word-break: break-all; color: #00d4ff;">${(result as any).value.transactionHash}</p>
              </div>
            ` : ''}
          </div>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#10b981',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        customClass: {
          popup: 'swal-professional',
          confirmButton: 'swal-btn'
        }
      });
      
      await this.loadAllLoans();
    } else if ((result as any).isDismissed) {
      console.log('❌ Aprobación cancelada por el administrador');
    }
  }

  async rejectLoan(loanId: string): Promise<void> {
    if (!this.account) return;
    
    try {
      const success = await this.loanService.rejectLoan(loanId, this.account);
      if (success) {
        await this.loadAllLoans(); // Recargar la lista
      }
    } catch (error) {
      this.error = 'Error al rechazar el préstamo';
      console.error('Error rejecting loan:', error);
    }
  }

  refreshLoans(): void {
    this.loadAllLoans();
  }

  async clearCache(): Promise<void> {
    const result = await Swal.fire({
      title: '¿Limpiar Caché?',
      html: `
        <div style="text-align: center;">
          <i class="fas fa-trash-alt" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem;"></i>
          <p style="font-size: 1.05rem; margin: 1rem 0;">¿Estás seguro de que deseas limpiar toda la caché de préstamos?</p>
          <div style="padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.3); margin-top: 1rem;">
            <p style="color: #ef4444; font-weight: 600; margin: 0;">
              <i class="fas fa-exclamation-triangle"></i> Esta acción no se puede deshacer
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-check"></i> Sí, Limpiar',
      cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      customClass: {
        popup: 'swal-professional',
        confirmButton: 'swal-btn swal-btn-warning',
        cancelButton: 'swal-btn swal-btn-cancel'
      }
    });
    
    if (result.isConfirmed) {
      // Limpiar caché de préstamos
      this.loanService.clearAllLoans();
      
      // Limpiar verificación de estudiante
      this.studentVerificationService.clearVerification();
      
      await this.loadAllLoans();
      
      await Swal.fire({
        icon: 'success',
        title: '¡Caché Limpiada!',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 1.05rem; margin-bottom: 1rem;">La caché ha sido limpiada exitosamente.</p>
            <div style="text-align: left; padding: 1rem; background: rgba(0, 212, 255, 0.1); border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.3);">
              <p style="margin: 0.3rem 0; font-size: 0.9rem;">
                <i class="fas fa-check" style="color: #10b981; margin-right: 8px;"></i>
                Préstamos eliminados
              </p>
              <p style="margin: 0.3rem 0; font-size: 0.9rem;">
                <i class="fas fa-check" style="color: #10b981; margin-right: 8px;"></i>
                Verificaciones de estudiantes eliminadas
              </p>
            </div>
          </div>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#10b981',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        customClass: {
          popup: 'swal-professional',
          confirmButton: 'swal-btn'
        },
        timer: 3000,
        timerProgressBar: true
      });
    }
  }

  getStatusLabel(status: string): string {
    return APP_CONSTANTS.LOAN_STATUS_LABELS[status as keyof typeof APP_CONSTANTS.LOAN_STATUS_LABELS] || status;
  }

  getPurposeTypeLabel(purposeType: string): string {
    return APP_CONSTANTS.PURPOSE_TYPE_LABELS[purposeType as keyof typeof APP_CONSTANTS.PURPOSE_TYPE_LABELS] || purposeType;
  }

  getNetworkLabel(network: string): string {
    return APP_CONSTANTS.NETWORK_LABELS[network as keyof typeof APP_CONSTANTS.NETWORK_LABELS] || network;
  }

  // Generar e imprimir contrato
  generateAndPrintContract(loan: LoanRequest): void {
    this.contractService.generateContract(loan);
  }

  // Descargar contrato
  downloadContract(loan: LoanRequest): void {
    this.contractService.downloadContract(loan);
  }

  // Ver contrato en nueva pestaña
  viewContract(loan: LoanRequest): void {
    this.contractService.viewContract(loan);
  }

  // Imprimir contrato directamente
  printContract(loan: LoanRequest): void {
    this.contractService.printContract(loan);
  }

  async showRejectConfirmation(loan: LoanRequest): Promise<void> {
    // Mostrar ventana profesional para rechazar
    const result = await Swal.fire({
      title: '¿Rechazar Préstamo?',
      html: `
        <div class="loan-rejection-details">
          <div class="rejection-header">
            <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
          </div>
          <div class="rejection-info">
            <div class="info-row">
              <span class="info-label">Solicitante:</span>
              <span class="info-value">${loan.borrowerName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Monto:</span>
              <span class="info-value" style="color: #ef4444; font-weight: 700;">${loan.amount} ETH</span>
            </div>
            <div class="info-row">
              <span class="info-label">Propósito:</span>
              <span class="info-value">${this.getPurposeTypeLabel(loan.purposeType)}</span>
            </div>
          </div>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Motivo del Rechazo',
      inputPlaceholder: 'Ingresa el motivo por el cual se rechaza este préstamo...',
      inputAttributes: {
        'aria-label': 'Motivo del rechazo',
        'style': 'min-height: 100px; resize: vertical;'
      },
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-ban"></i> Rechazar Préstamo',
      cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      customClass: {
        popup: 'swal-professional swal-wide',
        confirmButton: 'swal-btn swal-btn-danger',
        cancelButton: 'swal-btn swal-btn-cancel',
        input: 'swal-input-textarea'
      },
      inputValidator: (value: string) => {
        if (!value) {
          return 'Debes proporcionar un motivo para rechazar el préstamo';
        }
        if (value.length < 10) {
          return 'El motivo debe tener al menos 10 caracteres';
        }
        return null;
      },
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      preConfirm: async (reason: string) => {
        try {
          const success = await this.loanService.rejectLoan(loan.id, this.account!, reason);
          if (!success) {
            throw new Error('No se pudo rechazar el préstamo');
          }
          return { success: true, reason };
        } catch (error: any) {
          Swal.showValidationMessage(`Error: ${error?.message || 'Error desconocido'}`);
          return false;
        }
      }
    });
    
    if (result.isConfirmed && (result as any).value) {
      // Mostrar ventana de confirmación de rechazo
      await Swal.fire({
        icon: 'info',
        title: 'Préstamo Rechazado',
        html: `
          <div class="rejection-success">
            <div class="rejection-animation">
              <i class="fas fa-check-circle" style="font-size: 3.5rem; color: #6b7280; animation: scaleIn 0.5s ease;"></i>
            </div>
            <p style="font-size: 1.1rem; margin: 1.5rem 0;">El préstamo de <strong>${loan.borrowerName}</strong> ha sido rechazado.</p>
            <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.3); text-align: left;">
              <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem; font-weight: 600;">Motivo del Rechazo:</p>
              <p style="font-size: 0.95rem; color: var(--text-primary);">${(result as any).value.reason}</p>
            </div>
            <p style="color: #666; font-size: 0.85rem; margin-top: 1rem;">El solicitante será notificado sobre esta decisión.</p>
          </div>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#6b7280',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        customClass: {
          popup: 'swal-professional',
          confirmButton: 'swal-btn'
        }
      });
      
      await this.loadAllLoans();
    }
  }

  toggleTransactions(): void {
    this.showTransactions = !this.showTransactions;
  }

  setTransactionView(view: 'admin' | 'client'): void {
    this.transactionView = view;
  }

  viewLoanDetails(loan: LoanRequest): void {
    this.selectedLoan = loan;
  }

  closeLoanDetails(): void {
    this.selectedLoan = null;
  }

  async switchNetwork(network: string): Promise<void> {
    try {
      await this.walletService.switchNetwork(network);
      // Actualizar la información de la red en la interfaz
      this.loadAllLoans();
    } catch (error: any) {
      this.error = `Error al cambiar a la red ${network}: ${error.message}`;
      console.error('Error switching network:', error);
    }
  }

  // Método para abrir el visor de transacciones
  openTransactionViewer(loan: LoanRequest): void {
    this.transactionViewerLoan = loan;
    this.showTransactionViewer = true;
  }

  // Método para cerrar el visor de transacciones
  closeTransactionViewer(): void {
    this.showTransactionViewer = false;
    this.transactionViewerLoan = null;
  }
}