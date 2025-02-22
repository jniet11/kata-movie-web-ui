"use client";

import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const movieSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  gender: z.string().min(1, "Género requerido"),
  duration: z.number().min(1, "Duración inválida"),
  classification: z.string().min(1, "Clasificación requerida"),
});

export default function MovieRegister() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(movieSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      await axios.post("http://localhost:3000/cinema/register-movie", {
        title: data.title,
        gender: data.gender,
        duration: data.duration,
        classification: data.classification,
      });
      alert("Película registrada!");
      reset();
    } catch (error) {
      alert("Error al registrar");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl mb-4">Registro de Película</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div>
          <label>Título</label>
          <input
            {...register("title")}
            className={`w-full p-2 border ${errors.title && "border-red-500"}`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label>Género</label>
          <select
            {...register("gender")}
            className={`w-full p-2 border ${errors.gender && "border-red-500"}`}
          >
            <option value="">Seleccione género</option>
            <option value="accion">Acción</option>
            <option value="aventura">Aventura</option>
            <option value="comedia">Comedia</option>
            <option value="drama">Drama</option>
            <option value="terror">Terror</option>
            <option value="suspenso">Suspenso</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-sm">{errors.gender.message}</p>
          )}
        </div>

        <div>
          <label>Duración (min)</label>
          <input
            type="text"
            inputMode="numeric"
            {...register("duration", {
              setValueAs: (value) => parseInt(value) || 0,
            })}
            className={`w-full p-2 border ${
              errors.duration && "border-red-500"
            }`}
            pattern="[0-9]*"
          />
          {errors.duration && (
            <p className="text-red-500 text-sm">{errors.duration.message}</p>
          )}
        </div>

        <div>
          <label>Clasificación</label>
          <select
            {...register("classification")}
            className={`w-full p-2 border ${
              errors.classification && "border-red-500"
            }`}
          >
            <option value="">Seleccione</option>
            <option value="G">G (Todo público)</option>
            <option value="PG">PG (Con supervisión de padres)</option>
            <option value="PG-13">
              PG-13 (Con supervisió - Mayores de 13 años)
            </option>
            <option value="R">R (Restringido)</option>
            <option value="NC-17">NC-17 (Adultos)</option>
          </select>
          {errors.classification && (
            <p className="text-red-500 text-sm">
              {errors.classification.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full p-2 bg-blue-600 text-white disabled:bg-gray-400"
        >
          {isSubmitting ? "Enviando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
}
