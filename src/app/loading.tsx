import { Loader2 } from 'lucide-react'
import React from 'react'

const loading = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <Loader2 className="size-16 animate-spin" />
    </div>
  )
}

export default loading