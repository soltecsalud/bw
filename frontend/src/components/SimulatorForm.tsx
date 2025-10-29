import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import type { SimulationRequest } from '../types/index';

interface SimulatorFormProps {
  onSuccess: () => void;
  editingSimulation?: any;
  onCancelEdit?: () => void;
}

export const SimulatorForm = ({ onSuccess, editingSimulation, onCancelEdit }: SimulatorFormProps) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<SimulationRequest>({
    defaultValues: {
      amount: 0,
      term: 'Mensual',
      start_date: '',
      end_date: '',
    },
  });

  // Actualizar formulario cuando cambie editingSimulation
  useEffect(() => {
    if (editingSimulation) {
      setValue('amount', editingSimulation.amount);
      setValue('term', editingSimulation.term);
      setValue('start_date', editingSimulation.start_date);
      setValue('end_date', editingSimulation.end_date);
    } else {
      reset();
    }
  }, [editingSimulation, setValue, reset]);

  const onSubmit = async (data: SimulationRequest) => {
    try {
      if (editingSimulation) {
        await api.put(`/simulations/${editingSimulation.id}`, data);
        toast.success('Simulación actualizada exitosamente');
        if (onCancelEdit) onCancelEdit();
      } else {
        await api.post('/simulations', data);
        toast.success('Simulación creada exitosamente');
        reset();
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al guardar la simulación');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {editingSimulation ? 'Editar Simulación' : 'Nueva Simulación'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto a invertir
          </label>
          <input
            type="number"
            step="0.01"
            {...register('amount', {
              required: 'El monto es requerido',
              min: { value: 0.01, message: 'El monto debe ser mayor a 0' },
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="10000"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Término de pago
          </label>
          <select
            {...register('term', { required: 'El término es requerido' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Mensual">Mensual</option>
            <option value="Anual">Anual</option>
          </select>
          {errors.term && (
            <p className="mt-1 text-sm text-red-600">{errors.term.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de inicio
            </label>
            <input
              type="date"
              {...register('start_date', { required: 'La fecha de inicio es requerida' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de fin
            </label>
            <input
              type="date"
              {...register('end_date', { required: 'La fecha de fin es requerida' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
          >
            {editingSimulation ? 'Actualizar' : 'Crear Simulación'}
          </button>
          {editingSimulation && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition duration-200 font-medium"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};