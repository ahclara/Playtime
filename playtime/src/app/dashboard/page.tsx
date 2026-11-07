import { redirect } from 'next/navigation';

// A vitrine principal fica em /produtos.
export default function DashboardPage() {
  redirect('/produtos');
}
