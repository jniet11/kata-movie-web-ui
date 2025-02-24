"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Movie, Reservation } from "@/types/reserveInterface";

interface MovieRecord {
  movie: Movie;
  totalReservations: number;
  totalSeats: number;
  uniqueCustomers: number;
  seatsByClassification: Record<string, number>;
  reservations: Reservation[]; // detalle de reservas
}

export default function MovieRecords() {
  const [stats, setStats] = useState<MovieRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, reservationsRes] = await Promise.all([
          axios.post("http://localhost:3000/cinema/get-movies"),
          axios.post("http://localhost:3000/cinema/get-reservations"),
        ]);

        const reservations: Reservation[] = reservationsRes.data.map(
          (res: any) => ({
            ...res,
            seats: Array.isArray(res.seats) ? res.seats : JSON.parse(res.seats),
          })
        );

        const movies: Movie[] = moviesRes.data;
        const movieStats = movies.map((movie) => {
          const movieReservations = reservations.filter(
            (r) => r.movie_id === movie.id
          );
          const customers = new Set(movieReservations.map((r) => r.doc_number));

          return {
            movie,
            totalReservations: movieReservations.length,
            totalSeats: movieReservations.reduce(
              (acc, curr) => acc + curr.seats.length,
              0
            ),
            uniqueCustomers: customers.size,
            seatsByClassification: movieReservations.reduce((acc, curr) => {
              const classification = curr.seats[0]?.split("-")[0] || "General";
              acc[classification] =
                (acc[classification] || 0) + curr.seats.length;
              return acc;
            }, {} as Record<string, number>),
            reservations: movieReservations, // detalle de reservas
          };
        });

        setStats(movieStats);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="cine-text-gold">Cargando estadísticas...</div>;
  }

  return (
    <div className="cine-container cine-glow mt-8">
      <h2 className="cine-title">Reporte por Película</h2>

      <div className="space-y-6">
        {stats.map((stat) => (
          <div key={stat.movie.id} className="cine-item p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl cine-text-gold font-bold mb-4">
                  {stat.movie.title}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    title="Reservas totales"
                    value={stat.totalReservations}
                  />
                  <StatCard
                    title="Asientos reservados"
                    value={stat.totalSeats}
                  />
                  <StatCard
                    title="Clientes únicos"
                    value={stat.uniqueCustomers}
                  />
                  <StatCard
                    title="Clasificación"
                    value={stat.movie.classification}
                  />
                </div>

                {/* Sección para mostrar el detalle de cada reserva */}
                <div className="mt-4">
                  <h4 className="cine-text-gold font-semibold mb-2">
                    Detalle de Reservas:
                  </h4>
                  <ul className="space-y-3">
                    {stat.reservations.map((reservation) => (
                      <li
                        key={reservation.id || reservation.doc_number}
                        className="bg-gray-800 p-4 rounded-lg"
                      >
                        <p className="text-emerald-400">
                          <span className="cine-text-gold font-bold">
                            Cliente:{" "}
                          </span>
                          {reservation.customer_name || reservation.doc_number}
                        </p>
                        <p className="text-emerald-400">
                          <span className="cine-text-gold font-bold">
                            Asientos:{" "}
                          </span>
                          {reservation.seats.join(", ")}
                        </p>
                        <p className="text-emerald-400">
                          <span className="cine-text-gold font-bold">
                            Sala:{" "}
                          </span>
                          {reservation.room_name}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const StatCard = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => (
  <div className="bg-gray-800 p-4 rounded-xl">
    <h4 className="cine-text-gold text-sm mb-1">{title}</h4>
    <p className="text-2xl font-bold text-emerald-400">{value}</p>
  </div>
);
