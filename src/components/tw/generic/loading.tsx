interface LoadingProps {
  isLoading?: boolean; 
}

export const Loading = ({ isLoading }: LoadingProps) => {
  if(!isLoading) return null

  return(
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-primary"
        />
      </div>
    </div>
  )


}