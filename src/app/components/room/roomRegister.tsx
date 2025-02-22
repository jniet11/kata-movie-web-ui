"use client";
import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const roomSchema = z.object({
  name: z.string().min(1, "Nombre de la sala requerido"),
  capacity: z.number().min(1, "La capacidad debe ser mayor a 0"),
});

export default function RoomRegister() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(roomSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      await axios.post("http://localhost:3000/cinema/register-room", {
        name: data.name,
        capacity: data.capacity,
      });
      alert("Sala registrada exitosamente!");
      reset();
    } catch (error) {
      alert("Error al registrar la sala");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl mb-4">Registro de Sala</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div>
          <label>Nombre de la sala</label>
          <input
            {...register("name")}
            className={`w-full p-2 border ${errors.name && "border-red-500"}`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label>Capacidad (personas)</label>
          <input
            type="text"
            inputMode="numeric"
            {...register("capacity", {
              setValueAs: (value) => parseInt(value) || 0,
            })}
            className={`w-full p-2 border ${
              errors.capacity && "border-red-500"
            }`}
            pattern="[0-9]*"
          />
          {errors.capacity && (
            <p className="text-red-500 text-sm">{errors.capacity.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full p-2 bg-blue-600 text-white disabled:bg-gray-400"
        >
          {isSubmitting ? "Registrando..." : "Registrar Sala"}
        </button>
      </form>
    </div>
  );
}