import React, { useState } from 'react';
import { useProgressStore } from '../store/progressStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Progress as ProgressType } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Progress = () => {
  const { progress, addProgress } = useProgressStore();
  const [showForm, setShowForm] = useState(false);
  const [newProgress, setNewProgress] = useState<Partial<ProgressType>>({
    weight: 0,
    bodyFat: undefined,
    date: format(new Date(), 'yyyy-MM-dd'),
    measurements: {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProgress.weight) {
      addProgress({
        ...newProgress,
        id: Date.now().toString(),
      } as ProgressType);
      setShowForm(false);
      setNewProgress({
        weight: 0,
        bodyFat: undefined,
        date: format(new Date(), 'yyyy-MM-dd'),
        measurements: {},
      });
    }
  };

  const chartData = progress.map((p) => ({
    date: format(new Date(p.date), 'P', { locale: fr }),
    poids: p.weight,
    graisse: p.bodyFat,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Suivi des progrès</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Nouvelle mesure
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Poids (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={newProgress.weight || ''}
                onChange={(e) => setNewProgress({ ...newProgress, weight: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Taux de graisse (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={newProgress.bodyFat || ''}
                onChange={(e) => setNewProgress({ ...newProgress, bodyFat: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tour de poitrine (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newProgress.measurements?.chest || ''}
                  onChange={(e) => setNewProgress({
                    ...newProgress,
                    measurements: {
                      ...newProgress.measurements,
                      chest: parseFloat(e.target.value),
                    },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tour de taille (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newProgress.measurements?.waist || ''}
                  onChange={(e) => setNewProgress({
                    ...newProgress,
                    measurements: {
                      ...newProgress.measurements,
                      waist: parseFloat(e.target.value),
                    },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-700 hover:text-gray-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Évolution du poids</h2>
        <div className="w-full overflow-x-auto">
          <LineChart width={800} height={400} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="poids" stroke="#4F46E5" name="Poids (kg)" />
            <Line type="monotone" dataKey="graisse" stroke="#EF4444" name="Graisse (%)" />
          </LineChart>
        </div>
      </div>

      <div className="space-y-4">
        {progress.map((entry) => (
          <div key={entry.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {format(new Date(entry.date), 'PPP', { locale: fr })}
                </h3>
                <p className="text-gray-500">Poids: {entry.weight} kg</p>
                {entry.bodyFat && (
                  <p className="text-gray-500">Graisse: {entry.bodyFat}%</p>
                )}
              </div>
              {entry.measurements && (
                <div className="text-sm text-gray-500">
                  {entry.measurements.chest && (
                    <p>Poitrine: {entry.measurements.chest} cm</p>
                  )}
                  {entry.measurements.waist && (
                    <p>Taille: {entry.measurements.waist} cm</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Progress;