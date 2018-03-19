import { ComponentClass, ReactNode } from 'react'

export interface FocusWithinRenderProps {
    focusProps: {
        onFocus(): void
        onBlur(): void
    }
    isFocused: boolean
}

export interface FocusWithinProps {
    onFocus?(): void
    onBlur?(): void
    children?(renderProps: FocusWithinRenderProps): ReactNode
}

export const FocusWithin: ComponentClass<FocusWithinProps>
export default FocusWithin
