import SatisfactionForm from '@/components/SatisfactionForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Satisfação do Usuário · Lyno Ideias',
  description: 'Como está sendo sua experiência com o projeto Lyno Ideias? Avalie-nos!',
};

export default function SatisfacaoPage() {
  return (
    <div 
      className="container animate-fade-in" 
      style={{ 
        paddingTop: 'var(--space-2xl)', 
        paddingBottom: 'var(--space-2xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 180px)' // Account for header and footer heights roughly
      }}
    >
      <SatisfactionForm />
    </div>
  );
}
