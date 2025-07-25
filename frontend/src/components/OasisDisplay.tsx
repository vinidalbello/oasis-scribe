interface OasisField {
  value: number | null
  description: string | null
}

interface OasisData {
  id: number
  fields: {
    M1800: OasisField
    M1810: OasisField
    M1820: OasisField
    M1830: OasisField
    M1840: OasisField
    M1850: OasisField
    M1860: OasisField
  }
  isComplete: boolean
  completionPercentage: number
}

interface OasisDisplayProps {
  oasisData: OasisData | null
  isLoading?: boolean
}

const fieldLabels = {
  M1800: 'Higiene Pessoal',
  M1810: 'Vestir Parte Superior',
  M1820: 'Vestir Parte Inferior',
  M1830: 'Banho',
  M1840: 'Transferência Banheiro',
  M1850: 'Transferência Geral',
  M1860: 'Deambulação'
}

const getScoreColor = (value: number | null) => {
  if (value === null) return 'bg-gray-100 text-gray-500'
  if (value === 0) return 'bg-green-100 text-green-800'
  if (value <= 2) return 'bg-gray-200 text-gray-800'
  return 'bg-red-100 text-red-800'
}

const getScoreText = (value: number | null) => {
  if (value === null) return '-'
  return value.toString()
}

export function OasisDisplay({ oasisData, isLoading = false }: OasisDisplayProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-8 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!oasisData) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 border border-dashed border-gray-300">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-700 mb-2">Dados OASIS não disponíveis</h3>
          <p className="text-gray-500">
            Os dados de avaliação funcional serão exibidos aqui após o processamento do áudio.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-8 border border-gray-200">
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">
              OASIS Seção G - Status Funcional
            </h2>
            <p className="text-gray-600">Avaliação automatizada baseada na transcrição de áudio</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-4 py-2 rounded text-sm font-bold border ${
              oasisData.isComplete ? 
                'bg-green-100 text-green-800 border-green-200' : 
                'bg-gray-100 text-gray-800 border-gray-200'
            }`}>
              {oasisData.isComplete ? 'Completo' : `${oasisData.completionPercentage}% Completo`}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {Object.entries(oasisData.fields).map(([code, field]) => (
          <div key={code} className="bg-gray-50 rounded-lg p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-lg font-bold text-black">
                    {code} - {fieldLabels[code as keyof typeof fieldLabels]}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {field.description || 'Informação não disponível na transcrição'}
                </p>
              </div>
              <div className="ml-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-12 rounded font-bold text-lg border ${getScoreColor(field.value)}`}>
                  <span>
                    {getScoreText(field.value)}
                  </span>
                </div>
              </div>
            </div>
            
            {field.value !== null && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center text-xs text-gray-500">
                  <span className="font-medium">Escala:</span>
                  <span className="ml-2">0 = Independente • 1-2 = Assistência Mínima • 3+ = Dependência Total</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h4 className="font-bold text-black mb-2">
            Processamento Automático
          </h4>
          <p className="text-gray-800 text-sm">
            Estes dados foram extraídos automaticamente da transcrição de áudio usando Inteligência Artificial. 
            Recomenda-se sempre a revisão por um profissional de saúde qualificado.
          </p>
        </div>
      </div>
    </div>
  )
} 