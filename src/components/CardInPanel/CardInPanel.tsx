import React from 'react'

const CardInPanel: React.FC<CardInPanelType.DataProp & React.HTMLAttributes<HTMLElement>> = ({ name, age, ...restProps }) => {
  return (
    <div {...restProps}>
      <div>
        <div>Name</div>
        <div>{name}</div>
      </div>
      <div>
        <div>Age</div>
        <div>{age}</div>
      </div>
    </div>
  )
}

export default CardInPanel