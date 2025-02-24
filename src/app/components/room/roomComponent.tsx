"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const roomSchema = z.object({
  name: z.string().min(1, "Nombre de la sala requerido"),
  capacity: z.number().min(1, "La capacidad debe ser mayor a 0"),
});

interface Room {
  id: number;
  name: string;
  capacity: number;
}

export default function RoomManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(roomSchema),
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await axios.post("http://localhost:3000/cinema/get-rooms");
      setRooms(response.data);
    } catch (error) {
      console.error("Error cargando salas:", error);
    }
  };

  const handleCreateUpdate = async (data: any) => {
    try {
      if (editingRoom) {
        await axios.post("http://localhost:3000/cinema/update-room", {
          ...data,
          id: editingRoom.id,
        });
        alert("Sala actualizada!");
      } else {
        await axios.post("http://localhost:3000/cinema/register-room", data);
        alert("Sala registrada!");
      }
      reset();
      setEditingRoom(null);
      await loadRooms();
    } catch (error) {
      alert(editingRoom ? "Error actualizando" : "Error registrando");
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setValue("name", room.name);
    setValue("capacity", room.capacity);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta sala?")) {
      try {
        await axios.post("http://localhost:3000/cinema/delete-room", { id });
        await loadRooms();
        alert("Sala eliminada");
      } catch (error) {
        alert("Error: No se puede eliminar una sala con una reserva vinculada.");
      }
    }
  };

  return (
    <div className="cine-container cine-glow">
      <h1 className="cine-main-title">Cinema Kata 🎥😁</h1>
      <h2 className="cine-title">
        {editingRoom ? "Editar Sala" : "Registrar Sala"}
      </h2>

      <form onSubmit={handleSubmit(handleCreateUpdate)} className="cine-form">
        <div>
          <label className="cine-text-gold">Nombre de la sala</label>
          <input
            {...register("name")}
            className={`cine-input ${errors.name && "border-red-500"}`}
          />
          {errors.name?.message && (
            <p className="cine-text-red text-sm">
              {errors.name.message.toString()}
            </p>
          )}
        </div>

        <div>
          <label className="cine-text-gold">Capacidad (personas)</label>
          <input
            type="text"
            inputMode="numeric"
            {...register("capacity", {
              setValueAs: (value) => parseInt(value) || 0,
            })}
            className={`cine-input ${errors.capacity && "border-red-500"}`}
            pattern="[0-9]*"
          />
          {errors.capacity?.message && (
            <p className="cine-text-red text-sm">
              {errors.capacity.message.toString()}
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
            : editingRoom
            ? "Actualizar"
            : "Registrar"}
        </button>

        {editingRoom && (
          <button
            type="button"
            onClick={() => {
              reset();
              setEditingRoom(null);
            }}
            className="cine-btn bg-gray-600 hover:bg-gray-700 mt-2"
          >
            Cancelar Edición
          </button>
        )}
      </form>

      <div className="cine-list">
        <h2 className="cine-title">Salas Registradas</h2>
        <div className="space-y-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="cine-item"
            >
              <div className="flex-1">
                <h3 className="text-xl cine-text-gold font-bold">
                  {room.name}
                </h3>
                <div className="mt-2 text-sm cine-text-gold">
                  <p>
                    <span className="font-semibold">Capacidad:</span>{" "}
                    {room.capacity} personas
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(room)}
                  className="cine-btn bg-amber-600 hover:bg-amber-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
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