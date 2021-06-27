import { FC } from 'react'
import ReactSelect, { Props as ReactSelectProps } from 'react-select'

import styles from './Select.module.scss'

export interface SelectOption {
  label: string;
  value: string;
}

export interface Props extends Omit<ReactSelectProps, 'styles'> {}

const Select: FC<Props> = ({
  className = '',
  children,
  ...restProps
}) => (
  <ReactSelect
    {...restProps}
    className={`${styles.select} ${className}`}
    styles={selectStyles}>
    {children}
  </ReactSelect>
)

Select.displayName = 'Select'

export default Select

const selectStyles: ReactSelectProps['styles'] = {
  control: (base, { isFocused }) => {
    const borderColor = isFocused ? styles.color_subtitle : '#999'
    return {
      ...base,
      color: styles.color_title,
      borderColor,
      ':hover': {
        ...base[':hover'],
        borderColor,
      },
      outlineColor: styles.color_subtitle,
      boxShadow: isFocused ? `0px 0px 3px ${styles.color_title}` : 'none',
    }
  },
  singleValue: base => ({
    ...base,
    color: styles.color_title,
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    color: isSelected ? '#fff' : styles.color_title,
    backgroundColor: isSelected
      ? styles.color_subtitle
      : isFocused
        ? styles.color_table_background
        : '#fff',
    ':active': {
      ...base[':active'],
      backgroundColor: styles.color_footer_bg,
    },
  }),
}