import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import toast, { Toaster } from 'react-hot-toast'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale)

// Add this plugin for center text
const centerTextPlugin = {
  id: 'centerText',
  afterDraw: (chart) => {
    const { ctx, width, height } = chart
    ctx.restore()
    const fontSize = (height / 114).toFixed(2)
    ctx.font = `${fontSize}em sans-serif`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    
    const text = `${chart.data.datasets[0].data[0]}°C`
    const textX = width / 2
    const textY = height / 2

    ctx.fillStyle = '#2563eb'
    ctx.fillText(text, textX, textY)
    ctx.save()
  }
}

export default function SensorReadings() {
  const [readings, setReadings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReadings()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('sensor_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings',
      }, (payload) => {
        setReadings(payload.new)
        toast.success('New sensor readings received!')
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchReadings() {
    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      setReadings(data)
    } catch (error) {
      toast.error('Error fetching sensor readings')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const SensorCard = ({ title, value, trend }) => {
    const isUp = trend === 'up'
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary">{title}</h2>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <div className={`${isUp ? 'text-success' : 'text-error'}`}>
                {isUp ? (
                  <ArrowUpIcon className="h-6 w-6" />
                ) : (
                  <ArrowDownIcon className="h-6 w-6" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const Sensor1PieChart = ({ value }) => {
    const maxValue = 80 // Maximum temperature in Celsius
    const remainingValue = Math.max(0, maxValue - value)
    const percentage = ((value / maxValue) * 100).toFixed(1)
    
    const data = {
      labels: [`Current: ${value}°C`, `Remaining: ${remainingValue}°C`],
      datasets: [
        {
          data: [value, remainingValue],
          backgroundColor: [
            'rgba(37, 99, 235, 0.8)',
            'rgba(229, 231, 235, 0.5)',
          ],
          borderColor: [
            'rgba(37, 99, 235, 1)',
            'rgba(229, 231, 235, 0.8)',
          ],
          borderWidth: 2,
        },
      ],
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            padding: 20,
            font: {
              size: 14
            },
            generateLabels: (chart) => {
              const data = chart.data
              return data.labels.map((label, i) => ({
                text: label,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].borderColor[i],
                lineWidth: data.datasets[0].borderWidth,
                hidden: false,
                index: i
              }))
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw || 0
              return `${context.label} (${value}°C)`
            },
          },
        },
        centerText: true
      },
    }

    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary">Sensor 1</h2>
          <div className="text-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Temperature: {value}°C (Max: {maxValue}°C)
            </span>
          </div>
          <div className="h-64 w-full">
            <Pie data={data} options={options} plugins={[centerTextPlugin]} />
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Sensor Readings Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Sensor1PieChart value={readings?.sensor1 || 0} />
          <SensorCard
            title="Sensor 2"
            value={readings?.sensor2}
            trend="down"
          />
          <SensorCard
            title="Sensor 3"
            value={readings?.sensor3}
            trend="up"
          />
        </div>
        <div className="mt-8 text-center text-sm text-base-content/70">
          Last updated: {readings?.created_at ? new Date(readings.created_at).toLocaleString() : 'N/A'}
        </div>
      </div>
    </div>
  )
}