import { ComponentClass, ComponentType, ReactNode, ReactHTML, StatelessComponent } from 'react'

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

interface FocusWithinComponent extends ComponentClass<FocusWithinProps> {
    wrapComponent<P>(Component: ComponentType<P>): StatelessComponent<P>
    wrapComponent<P extends keyof ReactHTML>(NativeComponent: P): ReactHTML[P]
}

export const FocusWithin: FocusWithinComponent
export default FocusWithin
