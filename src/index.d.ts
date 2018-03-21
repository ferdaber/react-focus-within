import { ComponentClass, ReactNode } from 'react'

export interface FocusWithinRenderProps {
    focusProps: {
        onFocus(event?: object): void
        onBlur(event?: object): void
    }
    isFocused: boolean
}

export interface FocusWithinProps {
    onFocus?(event?: object): void
    onBlur?(event?: object): void
    children?(renderProps: FocusWithinRenderProps): ReactNode
}

export const FocusWithin: ComponentClass<FocusWithinProps>
export default FocusWithin
