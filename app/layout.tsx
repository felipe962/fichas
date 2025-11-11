import { ReactNode } from 'react'
import Header from './components/Header'
import './global.css'

export const metadata = {
  title: 'Registros do Atendimento',
  description: 'Registros do atendimento do paciente',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik:wght@100;200;300;400;500;600;700&display=swap"></link>
      </head>
      
      <body className="rubik.className">
        <Header />
        {children}
      </body>
    </html>
  )
}
