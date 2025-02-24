export interface Movie {
    id: number;
    title: string;
    gender: string;
    duration: number;
    classification: string;
  }

export interface Room {
  id: number;
  name: string;
  capacity: number;
}

export interface Reservation {
    id: number;
    customer_name: string;
    doc_number: string;
    email: string;
    movie_id: number;
    room_id: number;
    show_time: string;
    seats: string[];
    movie_title: string;
    room_name: string;
  }