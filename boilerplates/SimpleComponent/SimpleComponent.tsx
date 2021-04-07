import { FunctionComponent } from 'react'

export interface Props {
  title?: string;
}

const SimpleComponent: FunctionComponent<Props> = ({ title }) => {
  const text = title
  return (
    <div>
      <h1>{text}</h1>
    </div>
  )
}

SimpleComponent.displayName = 'SimpleComponent'

export default SimpleComponent