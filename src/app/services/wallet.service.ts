import { Injectable } from '@angular/core';

declare global {
  interface Window { ethereum?: any; }
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask no está instalado');
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) throw new Error('No se obtuvieron cuentas');
    return accounts[0];
  }

  async getAccounts(): Promise<string[]> {
    if (!window.ethereum) return [];
    return await window.ethereum.request({ method: 'eth_accounts' });
  }

  async getChainId(): Promise<string> {
    if (!window.ethereum) return '';
    return await window.ethereum.request({ method: 'eth_chainId' });
  }

  async signMessage(message: string): Promise<string> {
    if (!window.ethereum) throw new Error('MetaMask no está disponible');
    const accounts = await this.getAccounts();
    const from = accounts[0];
    if (!from) throw new Error('Cuenta no conectada');
    return await window.ethereum.request({
      method: 'personal_sign',
      params: [message, from]
    });
  }

  async switchNetwork(network: string): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask no está instalado');
    }

   // ...existing code...
    const networkParams: { [key: string]: any } = {
      'holesky': {
        chainId: '0x4268', // 17000 in hex
        chainName: 'Holešky',
        nativeCurrency: {
          name: 'Holešky ETH',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://holesky.drpc.org'],
        blockExplorerUrls: ['https://eth-holesky.blockscout.com'] // <-- protocolo agregado
      },
      'sepolia': {
        chainId: '0xaa36a7', // 11155111 in hex
        chainName: 'Sepolia',
        nativeCurrency: {
          name: 'Sepolia ETH',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://sepolia.drpc.org'],
        blockExplorerUrls: ['https://eth-sepolia.blockscout.com']
      },
      'goerli': {
        chainId: '0x5', // 5 in hex
        chainName: 'Goerli',
        nativeCurrency: {
          name: 'Goerli ETH',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://rpc.ankr.com/eth_goerli'],
        blockExplorerUrls: ['https://goerli.etherscan.io/']
      },
      'hoodi': {
        chainId: '0x88bb0', // 560048 in hex
        chainName: 'Hoodi Test Network',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://hoodi.drpc.org'],
        blockExplorerUrls: ['https://hoodi.etherscan.io']
      },
    };
 // ...existing code...
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkParams[network].chainId }],
      });
    } catch (switchError: any) {
      // Este error indica que la cadena no ha sido agregada a MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkParams[network]]
          });
        } catch (addError) {
          throw new Error('Error al agregar la red a MetaMask');
        }
      } else {
        throw new Error('Error al cambiar de red');
      }
    }
  }
}