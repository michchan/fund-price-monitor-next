import { FC } from 'react'

export interface Props {
  title?: string;
}

const SimpleComponent: FC<Props> = ({ title }) => {
  const text = title
  return (
    <div>
      <h1>{text}</h1>
    </div>
  )
}

SimpleComponent.displayName = 'SimpleComponent'

export default SimpleComponent