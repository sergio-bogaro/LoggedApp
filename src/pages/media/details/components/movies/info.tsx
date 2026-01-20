export const MovieInfo = ({ data }: { data: any }) => {
  return (
    <div className="flex flex-col w-4/5">
      <div className="flex gap-4 items-end">
        <h1 className="text-3xl  font-bold">{data.title}</h1>

        <span className="text-gray-500">{data.release_date?.slice(0, 4)}</span>
      </div>

      <div className="flex gap-2">
        {data.genres?.map((genre: { id: number; name: string }) => (
          <span key={genre.id} className="text-sm bg-accent  rounded-full px-3 py-1">{genre.name}</span>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-light">{data.tagline} </p>

        <p>{data.overview}</p>




        {/* 
                {trailer ? (
                  <div className="aspect-video w-full max-w-3xl">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${trailer.key}`}
                      title={trailer.name}
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <p>No trailer available</p>
                )} */}

      </div>

    </div>
  )
}