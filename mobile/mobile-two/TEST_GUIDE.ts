/**
 * ARQUIVO DE TESTE - Para desenvolvimento rápido
 * 
 * Para pular login e acessar direto o dashboard do motorista:
 * 
 * Opção 1: Editar context/AuthContext.tsx
 * - Mude: const TEST_MODE = false; → const TEST_MODE = true;
 * - Mude: const TEST_ROLE = 'DRIVER';
 * - Salve e reload
 * 
 * Opção 2: Usar links de teste (adicione em qualquer tela)
 * 
 * import { useAuth } from '@/context/AuthContext';
 * 
 * export default function TestScreen() {
 *   const { setTestMode } = useAuth();
 * 
 *   return (
 *     <TouchableOpacity onPress={() => setTestMode('DRIVER')}>
 *       <Text>Teste como Motorista</Text>
 *     </TouchableOpacity>
 *   );
 * }
 */

// ============================================================
// TESTE RÁPIDO - INSTRUÇÕES
// ============================================================

// 1. Para acessar a tela do MOTORISTA sem backend:
//    - Abra: context/AuthContext.tsx
//    - Altere linha: const TEST_MODE = false; 
//    - Para: const TEST_MODE = true;
//    - Certifique que TEST_ROLE = 'DRIVER'
//    - Salve e o app recarregará

// 2. Para acessar como CLIENTE:
//    - Altere TEST_ROLE para 'USER'
//    - Mantenha TEST_MODE = true
//    - Salve e verá a tela do cliente

// 3. Para voltar ao normal (modo produção):
//    - Mude TEST_MODE de volta para false
//    - Agora pedirá login normal

// ============================================================
// DADOS MOCK DISPONÍVEIS
// ============================================================

// Quando em TEST_MODE:
// - useDriverProfile() retorna dados fictícios de motorista
// - usePendingContracts() retorna 2 contratos fictícios
// - Todos os componentes renderizam normalmente

// ============================================================
export const TEST_INSTRUCTIONS = `
📱 COMO TESTAR A TELA DO MOTORISTA:

OPÇÃO 1 (Mais rápido - Teste mode):
1. Abra: mobile/mobile-two/context/AuthContext.tsx
2. Linha 13: const TEST_MODE = false;
3. Altere para: const TEST_MODE = true;
4. Certifique que linha 14: const TEST_ROLE = 'DRIVER';
5. Salve o arquivo (Ctrl+S)
6. O app recarregará automaticamente
7. Você entrará direto como motorista!

OPÇÃO 2 (Normal - Com login):
1. Deixe TEST_MODE = false
2. Inicie o app
3. Tela de login aparecerá
4. Clique em "Sou motorista"
5. Use credenciais de motorista (role: DRIVER)

DADOS FICTÍCIOS:
- Perfil: João Silva, 45 viagens, rating 4.8
- Veículo: Toyota Corolla 2023, placa ABC-1234
- Contratos: 2 contratos pendentes de exemplo

LOGOUT:
- Clique no ícone de saída (canto superior direito)
- Será redirecionado para login
`;
