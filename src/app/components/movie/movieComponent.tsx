"use client";
import { useEffect, useState } from "react";
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

interface Movie {
  id: number;
  title: string;
  gender: string;
  duration: number;
  classification: string;
}

export default function MovieManager() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(movieSchema),
  });

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/cinema/get-movies"
      );
      setMovies(response.data);
    } catch (error) {
      console.error("Error cargando películas:", error);
    }
  };

  const handleCreateUpdate = async (data: any) => {
    try {
      if (editingMovie) {
        await axios.post("http://localhost:3000/cinema/update-movie", {
          ...data,
          id: editingMovie.id,
        });
        alert("Película actualizada!");
      } else {
        await axios.post("http://localhost:3000/cinema/register-movie", data);
        alert("Película registrada!");
      }
      reset();
      setEditingMovie(null);
      await loadMovies();
    } catch (error) {
      alert(editingMovie ? "Error actualizando" : "Error registrando");
    }
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setValue("title", movie.title);
    setValue("gender", movie.gender);
    setValue("duration", movie.duration);
    setValue("classification", movie.classification);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta película?")) {
      try {
        await axios.post("http://localhost:3000/cinema/delete-movie", { id });
        await loadMovies();
        alert("Película eliminada");
      } catch (error) {
        alert("Error eliminando película");
      }
    }
  };

  return (
    <div className="cine-container cine-glow">
      <h2 className="cine-title">
        {editingMovie ? "Editar Película" : "Registrar Película"}
      </h2>

      <form onSubmit={handleSubmit(handleCreateUpdate)} className="cine-form">
        <div>
          <label className="cine-text-gold">Título</label>
          <input
            {...register("title")}
            className={`cine-input ${errors.title && "border-red-500"}`}
          />
          {errors.title?.message && (
            <p className="cine-text-red text-sm">
              {errors.title.message.toString()}
            </p>
          )}
        </div>

        <div>
          <label className="cine-text-gold">Género</label>
          <select
            {...register("gender")}
            className={`cine-input ${errors.gender && "border-red-500"}`}
          >
            <option value="">Seleccione género</option>
            <option value="accion">Acción</option>
            <option value="aventura">Aventura</option>
            <option value="comedia">Comedia</option>
            <option value="drama">Drama</option>
            <option value="terror">Terror</option>
            <option value="suspenso">Suspenso</option>
          </select>
          {errors.gender?.message && (
            <p className="cine-text-red text-sm">
              {errors.gender.message.toString()}
            </p>
          )}
        </div>

        <div>
          <label className="cine-text-gold">Duración (min)</label>
          <input
            type="text"
            inputMode="numeric"
            {...register("duration", {
              setValueAs: (value) => parseInt(value) || 0,
            })}
            className={`cine-input ${errors.duration && "border-red-500"}`}
            pattern="[0-9]*"
          />
          {errors.duration?.message && (
            <p className="cine-text-red text-sm">
              {errors.duration.message.toString()}
            </p>
          )}
        </div>

        <div>
          <label className="cine-text-gold">Clasificación</label>
          <select
            {...register("classification")}
            className={`cine-input ${errors.classification && "border-red-500"}`}
          >
            <option value="">Seleccione</option>
            <option value="G">G (Todo público)</option>
            <option value="PG">PG (Con supervisión de padres)</option>
            <option value="PG-13">
              PG-13 (Con supervisión - Mayores de 13 años)
            </option>
            <option value="R">R (Restringido)</option>
            <option value="NC-17">NC-17 (Adultos)</option>
          </select>
          {errors.classification?.message && (
            <p className="cine-text-red text-sm">
              {errors.classification.message.toString()}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="cine-btn"
        >
          {isSubmitting
            ? "Procesando..."
            : editingMovie
            ? "Actualizar"
            : "Registrar"}
        </button>

        {editingMovie && (
          <button
            type="button"
            onClick={() => {
              reset();
              setEditingMovie(null);
            }}
            className="cine-btn bg-gray-600 hover:bg-gray-700 mt-2"
          >
            Cancelar Edición
          </button>
        )}
      </form>

      <div className="cine-list">
        <h2 className="cine-title">Películas Registradas</h2>
        <div className="space-y-4">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="cine-item"
            >
              <div className="flex-1">
                <h3 className="text-xl cine-text-gold font-bold">
                  {movie.title}
                </h3>
                <div className="mt-2 text-sm cine-text-gold">
                  <p>
                    <span className="font-semibold">Género:</span>{" "}
                    {movie.gender}
                  </p>
                  <p>
                    <span className="font-semibold">Duración:</span>{" "}
                    {movie.duration} minutos
                  </p>
                  <p>
                    <span className="font-semibold">Clasificación:</span>{" "}
                    {movie.classification}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(movie)}
                  className="cine-btn bg-amber-600 hover:bg-amber-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(movie.id)}
                  className="cine-btn bg-red-700 hover:bg-red-800"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}