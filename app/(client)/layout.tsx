import Navbar  from "@/components/navbar";
import { AuthProvider } from "@/components/auth-provider";
import { SharedStateProvider } from '@/app/(client)/context/SharedStateContext';


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SharedStateProvider>
        <Navbar />
        {children}
      </SharedStateProvider>
    </AuthProvider>
  )
}