"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { buildUrl } from "@/lib/api/client";

interface TemperatureData {
  in: number;
  out: number;
  recordedAt: string;
}

interface TemperatureResponse {
  success: boolean;
  data?: TemperatureData;
  message?: string;
}

interface Apartment {
  id: number;
  name: string;
  address: string;
  residents: number;
}

const apartments: Apartment[] = [
  { id: 1, name: "Xona 101", address: "Tashkent ko'chasi, 1-uy", residents: 3 },
  { id: 2, name: "Xona 102", address: "Tashkent ko'chasi, 1-uy", residents: 2 },
  { id: 3, name: "Xona 103", address: "Tashkent ko'chasi, 1-uy", residents: 4 },
  { id: 4, name: "Xona 104", address: "Tashkent ko'chasi, 1-uy", residents: 2 },
  { id: 5, name: "Xona 105", address: "Tashkent ko'chasi, 1-uy", residents: 3 },
];

export default function Termo24Page() {
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    apartments[0],
  );
  const [temperatureData, setTemperatureData] =
    useState<TemperatureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!selectedApartment || selectedApartment.id !== 1) return;

    const fetchTemperatureData = async () => {
      try {
        if (!hasLoadedRef.current) {
          setLoading(true);
        }

        setError(null);
        const response = await fetch(buildUrl("termo24"));
        const data = (await response.json()) as TemperatureResponse;

        if (data.success === true && data.data) {
          setTemperatureData(data.data);
          hasLoadedRef.current = true;
        }
      } catch (err) {
        setError("Ma'lumotlarni olishda xato yuz berdi");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemperatureData();
    const interval = setInterval(fetchTemperatureData, 15000);

    return () => clearInterval(interval);
  }, [selectedApartment]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Temperatura Monitoring
            </h1>
            <p className="text-slate-400">
              Xonadonlarning temperatura o\'lchovlari
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700 hover:text-white"
          >
            Bosh sahifaga qaytish
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Apartments List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Xonadonlar
              </h2>
              <div className="space-y-2">
                {apartments.map((apt) => (
                  <button
                    key={apt.id}
                    onClick={() => setSelectedApartment(apt)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                      selectedApartment?.id === apt.id
                        ? "bg-blue-600 text-white shadow-lg transform scale-105"
                        : apt.id === 1
                          ? "bg-slate-700 text-slate-100 hover:bg-slate-600 cursor-pointer"
                          : "bg-slate-700 text-slate-400 cursor-not-allowed opacity-60"
                    }`}
                    disabled={apt.id !== 1}
                  >
                    <div className="font-semibold">{apt.name}</div>
                    <div className="text-sm opacity-75">{apt.address}</div>
                    <div className="text-xs mt-1">
                      {apt.id === 1 ? "✓ Aktiv" : "🔒 Mavjud emas"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Temperature Display */}
          <div className="lg:col-span-2">
            {selectedApartment ? (
              <div className="bg-slate-800 rounded-lg shadow-xl p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedApartment.name}
                  </h3>
                  <p className="text-slate-400">{selectedApartment.address}</p>
                  <p className="text-slate-500 text-sm mt-2">
                    Aholisi: {selectedApartment.residents} kishi
                  </p>
                </div>

                {selectedApartment.id === 1 ? (
                  <div>
                    {loading && !temperatureData && (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-4 text-slate-300">
                          Ma\'lumotlar yuklanmoqda...
                        </span>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-4">
                        {error}
                      </div>
                    )}

                    {temperatureData && (
                      <div className="grid grid-cols-2 gap-6 transition-opacity duration-300 ease-out opacity-100">
                        {/* Input Temperature */}
                        <div className="bg-gradient-to-br  from-orange-600 to-orange-700 rounded-lg p-6 transition-transform duration-300 ease-out">
                          <div className="text-slate-200 text-sm font-semibold mb-2">
                            Kirish Temperaturi
                          </div>
                          <div className="text-5xl font-bold text-white mb-2 tabular-nums transition-all duration-300">
                            {temperatureData.in}°C
                          </div>
                          <div className="text-blue-100 text-xs">
                            Ichki temperatura
                          </div>
                        </div>

                        {/* Output Temperature */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 transition-transform duration-300 ease-out">
                          <div className="text-slate-200 text-sm font-semibold mb-2">
                            Chiqish Temperaturi
                          </div>
                          <div className="text-5xl font-bold text-white mb-2 tabular-nums transition-all duration-300">
                            {temperatureData.out}°C
                          </div>
                          <div className="text-orange-100 text-xs">
                            Tashqi temperatura
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-700 rounded-lg p-8 text-center">
                    <p className="text-slate-300 text-lg">
                      Bu xonaning temperatura ma\'lumotlari mavjud emas
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      Faqat Xona 101 uchun ma\'lumotlar mavjud
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg shadow-xl p-8 text-center">
                <p className="text-slate-300">Xonani tanlang</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
