"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Reservation, Movie, Room } from "@/types/reserveInterface";

const reservationSchema = z.object({
  customer_name: z
    .string()
    .min(5, "El nombre debe tener al menos 5 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']+$/, "Nombre inválido"),
  doc_number: z
    .string()
    .regex(/^\d{6,12}$/, "Documento inválido (6-12 dígitos)"),
  email: z.string().email("Email inválido"),
  movie_id: z.coerce.number().min(1, "Seleccione una película"),
  room_id: z.coerce.number().min(1, "Seleccione una sala"),
  show_time: z
    .string()
    .min(1, "Seleccione fecha y hora")
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Formato de fecha inválido"),
});

export default function ReservationForm() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [seats, setSeats] = useState<string[]>([]);
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reservationSchema),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [moviesRes, roomsRes, reservationsRes] = await Promise.all([
          axios.post("http://localhost:3000/cinema/get-movies"),
          axios.post("http://localhost:3000/cinema/get-rooms"),
          axios.post("http://localhost:3000/cinema/get-reservations"),
        ]);

        setMovies(moviesRes.data);
        setRooms(roomsRes.data);
        const parsedReservations = reservationsRes.data.map((res: any) => ({
          ...res,
          seats: Array.isArray(res.seats) ? res.seats : JSON.parse(res.seats),
        }));
        setReservations(parsedReservations);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    loadData();
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

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setValue("customer_name", reservation.customer_name);
    setValue("doc_number", reservation.doc_number);
    setValue("email", reservation.email);
    setValue("movie_id", reservation.movie_id);
    setValue("room_id", reservation.room_id);
    setValue("show_time", reservation.show_time.split(".")[0]);

    const parsedSeats = Array.isArray(reservation.seats)
      ? reservation.seats
      : JSON.parse(reservation.seats || "[]");
    setSeats(parsedSeats);

    const room = rooms.find((r) => r.id === reservation.room_id);
    setSelectedRoom(room || null);
  };

  const handleDeleteReservation = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta reserva?")) {
      try {
        await axios.post("http://localhost:3000/cinema/delete-reservation", {
          id,
        });
        setReservations((prev) => prev.filter((r) => r.id !== id));
        alert("Reserva eliminada");
      } catch (error) {
        alert("Error eliminando reserva");
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (seats.length === 0) {
        alert("Seleccione al menos un asiento");
        return;
      }

      const reservationData = {
        ...data,
        seats: seats,
        id: editingReservation?.id,
      };

      const endpoint = editingReservation
        ? "http://localhost:3000/cinema/update-reservation"
        : "http://localhost:3000/cinema/reservation";

      const response = await axios.post(endpoint, reservationData);

      if (editingReservation) {
        setReservations((prev) =>
          prev.map((r) =>
            r.id === editingReservation.id ? { ...r, ...reservationData } : r
          )
        );
      } else {
        setReservations((prev) => [
          ...prev,
          { ...reservationData, id: response.data.reservationId },
        ]);
      }

      alert(
        `Reserva ${editingReservation ? "actualizada" : "creada"} exitosamente!`
      );
      reset();
      setSeats([]);
      setEditingReservation(null);
    } catch (error) {
      alert(`Error al ${editingReservation ? "actualizar" : "crear"} reserva`);
    }
  };

  return (
    <div className="cine-container cine-glow">
      <h1 className="cine-main-title">Cinema Kata 🎥😁</h1>
      <h2 className="cine-title">
        {editingReservation ? "Editar Reserva" : "Nueva Reserva"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="cine-form">
        {/* Nombre completo */}
        <div>
          <label className="cine-text-gold">Nombre completo</label>
          <input
            type="text"
            {...register("customer_name")}
            className={`cine-input ${errors.customer_name && "border-red-500"}`}
            placeholder="Ej: Juan Nieto"
          />
          {errors.customer_name && (
            <p className="cine-text-red text-sm mt-1">
              {errors.customer_name?.message?.toString()}
            </p>
          )}
        </div>

        {/* Número de documento */}
        <div>
          <label className="cine-text-gold">Número de documento</label>
          <input
            type="text"
            {...register("doc_number")}
            className={`cine-input ${errors.doc_number && "border-red-500"}`}
            placeholder="Ej: 1234567890"
          />
          {errors.doc_number && (
            <p className="cine-text-red text-sm mt-1">
              {errors.doc_number?.message?.toString()}
            </p>
          )}
        </div>

        {/* Campo de Email */}
        <div>
          <label className="cine-text-gold">Correo electrónico</label>
          <input
            type="email"
            {...register("email")}
            className={`cine-input ${errors.email && "border-red-500"}`}
            placeholder="ejemplo@correo.com"
          />
          {errors.email && (
            <p className="cine-text-red text-sm mt-1">
              {errors.email?.message?.toString()}
            </p>
          )}
        </div>

        {/* Selección de Película */}
        <div>
          <label className="cine-text-gold">Película</label>
          <select
            {...register("movie_id")}
            className={`cine-input ${errors.movie_id && "border-red-500"}`}
          >
            <option value="">Seleccione película</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
          {errors.movie_id && (
            <p className="cine-text-red text-sm mt-1">
              {errors.movie_id?.message?.toString()}
            </p>
          )}
        </div>

        {/* Selección de Sala */}
        <div>
          <label className="cine-text-gold">Sala</label>
          <select
            {...register("room_id")}
            onChange={(e) => {
              const room = rooms.find((r) => r.id === Number(e.target.value));
              setSelectedRoom(room || null);
            }}
            className={`cine-input ${errors.room_id && "border-red-500"}`}
          >
            <option value="">Seleccione sala</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} (Capacidad: {room.capacity})
              </option>
            ))}
          </select>
          {errors.room_id && (
            <p className="cine-text-red text-sm mt-1">
              {errors.room_id?.message?.toString()}
            </p>
          )}
        </div>

        {/* Selección de Horario */}
        <div>
          <label className="cine-text-gold">Fecha y Hora</label>
          <input
            type="datetime-local"
            {...register("show_time")}
            className={`cine-input ${errors.show_time && "border-red-500"}`}
          />
          {errors.show_time && (
            <p className="cine-text-red text-sm mt-1">
              {errors.show_time?.message?.toString()}
            </p>
          )}
        </div>

        {/* Mapa de Asientos */}
        {selectedRoom && (
          <div className="mt-6">
            <h3 className="cine-text-gold text-xl mb-4">
              Seleccione sus asientos
            </h3>
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
                          ? "bg-emerald-600 cine-glow"
                          : "bg-gray-700 hover:bg-gray-600"
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

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="cine-btn bg-emerald-700 hover:bg-emerald-800 flex-1"
          >
            {isSubmitting
              ? "Procesando..."
              : editingReservation
              ? "Actualizar Reserva"
              : "Crear Reserva"}
          </button>

          {editingReservation && (
            <button
              type="button"
              onClick={() => {
                reset();
                setEditingReservation(null);
                setSeats([]);
              }}
              className="cine-btn bg-gray-600 hover:bg-gray-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Listado de Reservas */}
      <div className="cine-list mt-8">
        <h2 className="cine-title">Reservas Existentes</h2>
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="cine-item">
              <div className="flex-1">
                <h3 className="text-xl cine-text-gold font-bold">
                  {reservation.movie_title} - {reservation.room_name}
                </h3>
                <div className="mt-2 text-sm cine-text-gold">
                  <p>
                    <span className="font-semibold">Nombre:</span>{" "}
                    {reservation.customer_name}
                  </p>
                  <p>
                    <span className="font-semibold">Documento:</span>{" "}
                    {reservation.doc_number}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {reservation.email}
                  </p>
                  <p>
                    <span className="font-semibold">Fecha:</span>{" "}
                    {new Date(reservation.show_time).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold">Asientos:</span>{" "}
                    {Array.isArray(reservation.seats)
                      ? reservation.seats.join(", ")
                      : reservation.seats}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEditReservation(reservation)}
                  className="cine-btn bg-amber-600 hover:bg-amber-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteReservation(reservation.id)}
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
