const NUMBER = /(\d+(?:\.\d+)?)/

interface QuietUnitsProps {
  text: string
}

export function QuietUnits({ text }: QuietUnitsProps) {
  return (
    <>
      {text.split(NUMBER).map((part, index) => {
        const isNumber = index % 2 === 1
        if (isNumber || part === '') {
          return part
        }

        return (
          <span key={index} className="quiet-unit">
            {part}
          </span>
        )
      })}
    </>
  )
}
