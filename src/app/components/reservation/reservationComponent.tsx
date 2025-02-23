"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

interface Movie {
  id: number;
  title: string;
}

interface Room {
  id: number;
  name: string;
  capacity: number;
}

export default function ReservationForm() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [seats, setSeats] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    axios
      .post("http://localhost:3000/cinema/get-movies")
      .then((res) => setMovies(res.data))
      .catch(console.error);

    axios
      .post("http://localhost:3000/cinema/get-rooms")
      .then((res) => setRooms(res.data))
      .catch(console.error);
  }, []);

  const generateSeatMap = (capacity: number) => {
    const rows = Math.ceil(capacity / 10);
    return Array.from({ length: rows }, (_, rowIndex) =>
      Array.from({ length: 10 }, (_, seatIndex) => {
        const seatNumber = rowIndex * 10 + (seatIndex + 1);
        return seatNumber <= capacity
          ? `${rowIndex + 1}-${seatIndex + 1}`
          : null;
      }).filter((seat) => seat !== null)
    );
  };

  const toggleSeat = (seat: string) => {
    setSeats((prev) => {
      if (prev.includes(seat)) {
        return prev.filter((s) => s !== seat);
      }
      return [...prev, seat];
    });
  };

  const onSubmit = async (data: any) => {
    try {
      if (seats.length === 0) {
        alert("Seleccione al menos un asiento");
        return;
      }

      await axios.post("http://localhost:3000/cinema/reservation", {
        ...data,
        seats: seats,
      });

      alert("Reserva exitosa!");
      setSeats([]);
    } catch (error) {
      alert("Error al reservar");
    }
  };

  return (
    <div className="cine-container cine-glow">
      <h2 className="cine-title">Reservar Película</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="cine-form">
        {/* Campo de Email */}
        <div>
          <label className="cine-text-gold">Correo electrónico</label>
          <input
            type="email"
            {...register("email", { required: true })}
            className={`cine-input ${errors.email && "border-red-500"}`}
            placeholder="ejemplo@correo.com"
          />
          {errors.email && (
            <p className="cine-text-red text-sm mt-1">El email es requerido</p>
          )}
        </div>

        {/* Selección de Película */}
        <div>
          <label className="cine-text-gold">Película</label>
          <select
            {...register("movie_id", { required: true })}
            className="cine-input"
          >
            <option value="">Seleccione película</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de Sala */}
        <div>
          <label className="cine-text-gold">Sala</label>
          <select
            {...register("room_id", { required: true })}
            onChange={(e) => {
              const room = rooms.find((r) => r.id === Number(e.target.value));
              setSelectedRoom(room || null);
            }}
            className="cine-input"
          >
            <option value="">Seleccione sala</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} (Capacidad: {room.capacity})
              </option>
            ))}
          </select>
        </div>

        {/* Selección de Horario */}
        <div>
          <label className="cine-text-gold">Fecha y Hora</label>
          <input
            type="datetime-local"
            {...register("show_time", { required: true })}
            className="cine-input"
          />
        </div>

        {/* Mapa de Asientos */}
        {selectedRoom && (
          <div className="mt-6">
            <h3 className="cine-text-gold text-xl mb-4">Seleccione sus asientos</h3>
            <div className="flex flex-col gap-2">
              {generateSeatMap(selectedRoom.capacity).map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-2">
                  {row.map((seat) => (
                    <button
                      key={`seat-${seat}`}
                      type="button"
                      onClick={() => toggleSeat(seat!)}
                      className={`seat-button ${
                        seats.includes(seat!)
                          ? 'bg-emerald-600 cine-glow'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {seat!}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm cine-text-gold">
              Asientos seleccionados: {seats.join(", ")}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="cine-btn bg-emerald-700 hover:bg-emerald-800"
        >
          Reservar
        </button>
      </form>
    </div>
  );
}
