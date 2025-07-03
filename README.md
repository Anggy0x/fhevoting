# FHE Voting DAO

A decentralized autonomous organization (DAO) voting system powered by Fully Homomorphic Encryption (FHE) using Zama's FHEVM technology.

## 🔐 Features

- **Fully Homomorphic Encryption**: Individual votes remain completely private while still allowing accurate tallying
- **DAO Governance**: Complete governance system for decentralized organizations
- **Multi-option Proposals**: Support for proposals with multiple voting options
- **Admin Controls**: Comprehensive admin panel for managing voters and proposals
- **Real-time Updates**: Live voting progress and results
- **Simulation Mode**: Fallback mode when FHEVM is not available

## 🚀 Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Encryption**: Zama FHEVM + fhevmjs
- **Smart Contracts**: Solidity with FHE support

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- MetaMask wallet
- Sepolia testnet ETH

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fhe-voting-dao
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Contract Configuration
VITE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Network Configuration
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Debug Mode
VITE_DEBUG_MODE=true
```

4. Start the development server:
```bash
npm run dev
```

## 📋 Smart Contract Deployment

### Prerequisites

- Hardhat or Foundry
- Sepolia testnet ETH
- Access to Zama FHEVM infrastructure

### Deploy Steps

1. Compile the contracts:
```bash
# Using Hardhat
npx hardhat compile

# Using Foundry
forge build
```

2. Deploy to Sepolia:
```bash
# Using Hardhat
npx hardhat run scripts/deploy.js --network sepolia

# Using Foundry
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast
```

3. Update the contract address in `.env`:
```env
VITE_CONTRACT_ADDRESS=<deployed-contract-address>
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_CONTRACT_ADDRESS` | Deployed contract address | Required |
| `VITE_SEPOLIA_RPC_URL` | Sepolia RPC endpoint | Infura public endpoint |
| `VITE_DEBUG_MODE` | Enable debug logging | `false` |
| `VITE_DEVELOPMENT_MODE` | Force simulation mode | `false` |

### Zama Configuration

The application uses Zama's FHEVM infrastructure on Sepolia:

- **Oracle Address**: `0xa02Cda4Ca3a71D7C46997716F4283aa851C28812`
- **ACL Address**: `0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D`
- **Executor Address**: `0xCD3ab3bd6bcc0c0bf3E27912a92043e817B1cf69`

## 🎯 Usage

### For Voters

1. **Connect Wallet**: Connect your MetaMask wallet to Sepolia testnet
2. **Get Authorized**: Admin must authorize your address to vote
3. **Browse Proposals**: View active proposals in the dashboard
4. **Cast Encrypted Votes**: Select your choice and cast an encrypted vote
5. **View Results**: See results after the voting period ends

### For Admins

1. **Authorize Voters**: Add voter addresses to the authorized list
2. **Create Proposals**: Create new proposals with multiple options
3. **Manage Voting**: Monitor voting progress and reveal results
4. **Bulk Operations**: Authorize multiple voters at once

## 🔍 Debug Mode

Enable debug mode to see detailed logging and system information:

```env
VITE_DEBUG_MODE=true
```

Debug features include:
- Detailed FHEVM initialization logs
- Contract interaction logging
- Gateway connectivity testing
- Debug information panel

## 🚨 Simulation Mode

When FHEVM is not available (contract not deployed or gateways offline), the application automatically switches to simulation mode:

- All operations are simulated locally
- Encryption is simulated for demonstration
- Mock proposals and data are provided
- Full UI functionality is preserved

## 🔐 Security Features

- **FHE Encryption**: Individual votes are encrypted and never revealed
- **Access Control**: Only authorized voters can participate
- **Admin Controls**: Secure admin functions for governance
- **Audit Trail**: All operations are logged on-chain

## 🐛 Troubleshooting

### Common Issues

1. **Gateway Offline**: If Zama gateways are offline, the app will use simulation mode
2. **Contract Not Deployed**: Ensure the contract is deployed and address is correct
3. **Network Issues**: Verify you're connected to Sepolia testnet
4. **MetaMask Issues**: Try refreshing the page or reconnecting wallet

### Debug Tools

- Use debug mode to see detailed logs
- Test gateway connectivity with the debug panel
- Check contract connection status
- Verify FHEVM initialization

## 📚 Documentation

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [fhevmjs Library](https://docs.zama.ai/fhevm/getting_started/frontend)
- [Ethereum Development](https://ethereum.org/en/developers/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Zama](https://zama.ai/) for FHEVM technology
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Ethereum](https://ethereum.org/) for blockchain infrastructure