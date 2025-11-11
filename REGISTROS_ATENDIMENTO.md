# Página de Registros do Atendimento do Paciente

## Descrição
Implementação da página "Registros do atendimento do paciente" conforme o design fornecido, seguindo a estrutura de código do projeto PAS (Painel de Acesso à Saúde).

## Estrutura de Arquivos

```
app/
├── registros-atendimento/
│   ├── page.tsx                          # Página principal
│   └── RegistrosAtendimento.module.css   # Estilos da página
├── components/
│   ├── attendanceRecord/
│   │   ├── AttendanceRecord.tsx          # Componente de detalhes do registro
│   │   └── AttendanceRecord.module.css   # Estilos do componente
│   ├── attendanceRecordList/
│   │   ├── AttendanceRecordList.tsx      # Componente de lista de registros
│   │   └── AttendanceRecordList.module.css # Estilos da lista
│   └── Header.tsx                        # Atualizado com link para registros
```

## Componentes

### AttendanceRecordList
Componente que exibe uma lista de registros de atendimento em formato de cards.

**Props:**
- `records`: Array de `AttendanceRecordData`
- `onSelectRecord`: Callback quando um registro é selecionado

### AttendanceRecord
Componente que exibe os detalhes completos de um registro de atendimento.

**Props:**
- `record`: Objeto `AttendanceRecordData`
- `onClose`: Callback para fechar o detalhe

### AttendanceRecordData (Interface)
```typescript
interface AttendanceRecordData {
  id: string;
  patientName: string;
  patientAge: number;
  healthStatus: string;
  attendanceDate: string;
  lastUpdateTime: string;
  emergencyFile: string;
  emergencyDoctor: string;
  attendanceStartTime: string;
  attendanceEndTime: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorObservations: string;
  doctorLastUpdateTime: string;
  attendanceStatus: "finalizado" | "em-andamento";
}
```

## Funcionalidades

1. **Lista de Registros**: Exibe todos os registros de atendimento em cards com informações resumidas
2. **Detalhes do Registro**: Ao clicar em um card, exibe os detalhes completos do atendimento
3. **Navegação**: Botão "Voltar" para retornar à lista
4. **Status do Atendimento**: Indicador visual do status (finalizado ou em andamento)

## Integração com o Projeto

A página está integrada ao projeto através de:

1. **Menu de Navegação**: Link "REGISTROS" adicionado ao Header
2. **Rota**: Acessível em `/registros-atendimento`
3. **Estilo**: Segue o design system do projeto (cores, tipografia, espaçamento)

## Dados Mock

Atualmente, a página usa dados mock. Para integrar com uma API:

1. Substitua `mockRecords` na página por uma chamada a uma API
2. Use um hook como `useEffect` para buscar os dados
3. Mantenha a interface `AttendanceRecordData` para tipagem

Exemplo:
```typescript
useEffect(() => {
  const fetchRecords = async () => {
    const response = await fetch('/api/attendance-records');
    const data = await response.json();
    setRecords(data);
  };
  fetchRecords();
}, []);
```

## Estilos

- **Cores principais**: #003d6b (azul escuro), #e8f4f8 (azul claro)
- **Cores de status**: #e74c3c (vermelho - finalizado), #27ae60 (verde - em andamento)
- **Tipografia**: Rubik (já configurada no projeto)
- **Responsividade**: Layout adaptável para mobile e desktop

## Próximos Passos

1. Conectar com API de dados reais
2. Adicionar filtros e busca
3. Implementar paginação se necessário
4. Adicionar funcionalidades de edição/exclusão de registros
5. Adicionar testes unitários
