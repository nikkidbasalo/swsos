import type { CustomButtonTypes } from '@/types'

function CustomButton({
  isDisabled,
  btnType,
  containerStyles,
  textStyles,
  title,
  rightIcon,
  handleClick
}: CustomButtonTypes) {
  return (
    <button
      disabled={isDisabled}
      type={btnType ?? 'button'}
      className={`custom-btn ${containerStyles ?? ''}`}
      onClick={handleClick}
    >
      {rightIcon && rightIcon}
      <span className={`flex-1 ${textStyles ?? ''}`}>{title}</span>
    </button>
  )
}

export default CustomButton
