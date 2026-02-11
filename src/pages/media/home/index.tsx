import { useQuery } from "@tanstack/react-query";

import { anytypeTest } from "@/lib/querry/anytype";

const MediaHomePage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["anytypeTest"],
    queryFn: () => anytypeTest(),
  });

  console.log(data)

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="w-full h-full flex justify-center items-center">
    </div>
  );
};

export default MediaHomePage;