import { Button } from '@/components/ui/button'
import axios from 'axios'
import { useEffect, useState } from 'react'

function App() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post('/api/postTest')
        console.log(res.data)
        setData(res.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold  text-red-500 mb-4">
        Display the data obtained from API here
      </h1>
      <Button>Click me</Button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default App
