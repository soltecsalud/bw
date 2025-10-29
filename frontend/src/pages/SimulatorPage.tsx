import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { SimulatorForm } from '../components/SimulatorForm';
import { SimulationsTable } from '../components/SimulationsTable';
import type { Simulation } from '../types/index';
import { useAuth } from '../hooks/useAuth';

export const SimulatorPage = () => {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [editingSimulation, setEditingSimulation] = useState<Simulation | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchSimulations = async () => {
    try {
      const response = await api.get<Simulation[]>('/simulations');
      setSimulations(response.data);
    } catch (error: any) {
      toast.error('Error al cargar las simulaciones');
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Sesión cerrada exitosamente');
  };

  const handleEdit = (simulation: Simulation) => {
    setEditingSimulation(simulation);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingSimulation(null);
  };

  const handleSuccess = () => {
    fetchSimulations();
    setEditingSimulation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">Banco W</h1>
              <span className="ml-4 text-gray-600">Simulador Financiero</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Formulario */}
          <SimulatorForm
            onSuccess={handleSuccess}
            editingSimulation={editingSimulation}
            onCancelEdit={handleCancelEdit}
          />

          {/* Tabla */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Simulaciones</h2>
            <SimulationsTable
              simulations={simulations}
              onUpdate={fetchSimulations}
              onEdit={handleEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};