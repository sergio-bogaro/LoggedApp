import { useQuery } from "@tanstack/react-query";

import { anytypeTest } from "@/lib/querry/anytype";

const MediaHomePage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["anytypeTest"],
    queryFn: () => anytypeTest(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="w-full h-full flex justify-center items-center">
      {data?.map((item) => (
        <div key={item.id}>{item.title}</div>
      )) || "No data available"}
    </div>
  );
};

export default MediaHomePage;