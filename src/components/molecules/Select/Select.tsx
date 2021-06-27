import { FC } from 'react'
import ReactSelect, { Props as ReactSelectProps } from 'react-select'

import styles from './Select.module.scss'
import colors from 'styles/colors.module.scss'

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
    const borderColor = isFocused ? colors.color_subtitle : '#999'
    return {
      ...base,
      color: colors.color_title,
      borderColor,
      ':hover': {
        ...base[':hover'],
        borderColor,
      },
      outlineColor: colors.color_subtitle,
      boxShadow: isFocused ? `0px 0px 3px ${colors.color_title}` : 'none',
    }
  },
  singleValue: base => ({
    ...base,
    color: colors.color_title,
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    color: isSelected ? '#fff' : colors.color_title,
    backgroundColor: isSelected
      ? colors.color_subtitle
      : isFocused
        ? colors.color_table_background
        : '#fff',
    ':active': {
      ...base[':active'],
      backgroundColor: colors.color_footer_bg,
    },
  }),
}