import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PaymentWidget from './components/PaymentWidget'
import { wagmiConfig } from './config/appkit'

// Import the appkit config to initialize it
import './config/appkit'

// Setup queryClient
const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <PaymentWidget />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App