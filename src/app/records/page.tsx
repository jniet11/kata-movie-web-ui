import MovieRecords from "../components/record/recordComponent";

export default function MoviesPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8"></div>
      <MovieRecords />
    </main>
  );
}