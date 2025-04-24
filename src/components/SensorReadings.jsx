import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

// Add this plugin for center text
const centerTextPlugin = {
  id: "centerText",
  afterDraw: (chart) => {
    const { ctx, width, height } = chart;
    ctx.restore();
    const fontSize = (height / 114).toFixed(2);
    ctx.font = `${fontSize}em sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    const text = chart.data.datasets[0].data[0]
      ? `${chart.data.datasets[0].data[0]}°C`
      : "";
    const textX = width / 2;
    const textY = height / 2;

    // Set temperature value color to black
    ctx.fillStyle = "#000000";
    ctx.fillText(text, textX, textY);
    ctx.save();
  },
};

export default function SensorReadings() {
  const [readings, setReadings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showValue, setShowValue] = useState(false);

  useEffect(() => {
    fetchReadings();

    // Set up real-time subscription
    const channel = supabase
      .channel("sensor_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensor_readings",
        },
        (payload) => {
          setReadings(payload.new);
          toast.success("New sensor readings received!");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchReadings() {
    try {
      const { data, error } = await supabase
        .from("sensor_readings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setReadings(data);
    } catch (error) {
      toast.error("Error fetching sensor readings");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const SensorCard = ({ title, value, trend, classification }) => {
    const isUp = trend === "up";
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary">{title}</h2>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <div className={`${isUp ? "text-success" : "text-error"}`}>
                {isUp ? (
                  <ArrowUpIcon className="h-6 w-6" />
                ) : (
                  <ArrowDownIcon className="h-6 w-6" />
                )}
              </div>
            )}
          </div>
          {classification && (
            <div className="mt-2">
              <span
                className={`badge ${
                  classification === "Excellent" ||
                  classification === "Optimal" ||
                  classification === "Optimal Humidity"
                    ? "badge-success"
                    : classification === "Good"
                    ? "badge-info"
                    : classification === "Moderate"
                    ? "badge-warning"
                    : classification === "Poor" ||
                      classification === "Too Dry" ||
                      classification === "Bone Dry" ||
                      classification === "Arid" ||
                      classification === "Too Wet" ||
                      classification === "Waterlogged" ||
                      classification === "Damp"
                    ? "badge-error"
                    : "badge-error"
                }`}
              >
                {classification}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getGasClassification = (value) => {
    if (value <= 100) return "Excellent";
    if (value <= 300) return "Good";
    if (value <= 500) return "Moderate";
    if (value <= 700) return "Poor";
    return "Bad";
  };

  const getMoistureClassification = (value) => {
    if (value <= 30) return "Too Dry";
    if (value <= 60) return "Optimal";
    if (value <= 70) return "Too Wet";
    return "Waterlogged";
  };

  const getHumidityClassification = (value) => {
    if (value < 20) return "Bone Dry";
    if (value <= 40) return "Arid";
    if (value <= 60) return "Optimal Humidity";
    return "Damp";
  };

  const Sensor1PieChart = ({ value }) => {
    const maxValue = 80; // Maximum temperature in Celsius
    const remainingValue = Math.max(0, maxValue - value);
    const percentage = ((value / maxValue) * 100).toFixed(1);

    const data = {
      labels: [`Current: ${value}°C`, `Remaining: ${remainingValue}°C`],
      datasets: [
        {
          data: [value, remainingValue],
          backgroundColor: [
            "#F75A5A", // Current value color
            "#FFF8F8", // Remaining section color
          ],
          borderColor: [
            "#F75A5A", // Current value border
            "#FFF8F8", // Remaining section border
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (event, elements) => {
        if (elements.length > 0) {
          setShowValue(true);
        }
      },
      onHover: (event, elements) => {
        if (elements.length > 0) {
          setShowValue(true);
        }
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            padding: 20,
            font: {
              size: 14,
              family: "'Inter', sans-serif",
            },
            color: "#9CA3AF",
            generateLabels: (chart) => {
              const data = chart.data;
              return data.labels.map((label, i) => ({
                text: label,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].borderColor[i],
                lineWidth: data.datasets[0].borderWidth,
                hidden: false,
                index: i,
              }));
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "#ffffff",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context) => {
              const value = context.raw || 0;
              return `${context.label} (${value}°C)`;
            },
          },
        },
        centerText: true,
      },
    };

    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary">Temperature Readings</h2>
          <div className="text-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              {showValue
                ? `Temperature: ${value}°C (Max: ${maxValue}°C)`
                : "Click or hover to see temperature"}
            </span>
          </div>
          <div className="h-64 w-full">
            <Pie data={data} options={options} plugins={[centerTextPlugin]} />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Sensor Readings Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Sensor1PieChart value={readings?.sensor1 || 0} />
          <SensorCard
            title="Humidity Readings"
            value={`${readings?.sensor2}%`}
            trend="down"
            classification={getHumidityClassification(readings?.sensor2 || 0)}
          />
          <SensorCard
            title="Soil Moisture Readings"
            value={`${readings?.sensor3}%`}
            trend="up"
            classification={getMoistureClassification(readings?.sensor3 || 0)}
          />
          <SensorCard
            title="Gas Sensor Readings"
            value={`${readings?.sensor4} ppm`}
            trend="up"
            classification={getGasClassification(readings?.sensor4 || 0)}
          />
        </div>
        <div className="mt-8 text-center text-sm text-base-content/70">
          Last updated:{" "}
          {readings?.created_at
            ? new Date(readings.created_at).toLocaleString()
            : "N/A"}
        </div>
      </div>
    </div>
  );
}
